// Pure verdict logic for the REAL Exit-Liquidity Guard ASP.
// Self-contained (no mock-data import) so this standalone server stays lean and deployable.
// Mirrors the thresholds in the Next demo app's src/lib/data/checks.ts — keep them in sync.

export type Verdict = "BLOCK" | "WARN" | "OK";
export type Side = "long" | "short";

export type DepthCurvePoint = {
  size_usd: number;
  slippage_bps: number;
  realizable_usd: number;
  avg_price: number;
};

export type Settlement = {
  scheme: "exact";
  asset: "USDT0";
  chain: string; // caip-2, e.g. eip155:196
  amount_usd: number;
  tx_hash: string; // "" when simulated / not yet settled
  paid_at: string;
  /** True for demo/preview receipts (no real x402 broadcast). Real x402 settlements omit it / set false. */
  simulated?: boolean;
};

// NOTE: field-for-field aligned with the web app's ExitLiquidityCheck (src/lib/types.ts) so the
// demo proxy can pass the response straight through with zero mapping. `id` + `quote_block` are
// emitted here; `settlement` is null on the plain result and filled by the x402 layer once paid.
export type ExitLiquidityCheck = {
  id: string;
  token_address: string;
  token_symbol: string;
  chain: string;
  quote_asset: string;
  side: Side;
  size_usd: number;
  verdict: Verdict;
  reason: string;
  realizable_exit_value_usd: number;
  slippage_to_exit_bps: number;
  pct_of_available_liquidity: number;
  you_are_the_exit_liquidity: boolean;
  available_exit_liquidity_usd: number;
  recommended_max_size_usd: number;
  depth_curve: DepthCurvePoint[];
  venues_probed: string[];
  quote_block: number;
  impact_band_bps: number;
  data_caveats: string[];
  settlement: Settlement | null;
  computed_at: string;
  latency_ms: number;
};

/** BLOCK if slippage ≥ 1000 bps (10%) OR ≥ 50% of the routed sell-side book; WARN at 200 bps / 25%. */
export function verdictFor(slippageBps: number, pctOfLiquidity: number): Verdict {
  if (slippageBps >= 1000 || pctOfLiquidity >= 50) return "BLOCK";
  if (slippageBps >= 200 || pctOfLiquidity >= 25) return "WARN";
  return "OK";
}

/** Largest size on the ladder that stays fully OK (slippage < 200 bps AND < 25% of the book). */
export function recommendedOkSize(ladder: DepthCurvePoint[], aelUsd: number): number {
  let best = 0;
  for (const p of ladder) {
    const pct = aelUsd > 0 ? (p.size_usd / aelUsd) * 100 : 100;
    if (p.slippage_bps < 200 && pct < 25) best = Math.max(best, p.size_usd);
  }
  return best > 0 ? Math.floor(best / 500) * 500 : 0;
}

const CAVEATS_BASE = [
  "Routed on-chain DEX venues only (OKX DEX aggregator) — CEX orderbook depth is not included.",
  "Snapshot at quote time; pool state can move before you actually exit.",
  "Simultaneous exiters and MEV are not modeled.",
];

/**
 * Assemble the tool result from a REAL depth ladder built out of OKX DEX aggregator quotes.
 * `ladder` must be monotonic and sorted by size; `aelUsd` is the routed sell-side liquidity
 * (largest size the aggregator can route within the impact band), `midPriceUsd` the unimpacted price.
 */
export function assembleExitCheck(args: {
  token_address: string;
  token_symbol: string;
  chain: string;
  quote_asset: string;
  side: Side;
  size_usd: number;
  ladder: DepthCurvePoint[];
  aelUsd: number;
  midPriceUsd: number;
  venues: string[];
  impact_band_bps: number;
  latency_ms: number;
  /** On-chain block the quotes were read at (0 when the RPC read is unavailable). */
  quote_block?: number;
  /** x402 receipt — null on the plain result; filled once payment settles. */
  settlement?: Settlement | null;
  extra_caveats?: string[];
}): ExitLiquidityCheck {
  const { size_usd, ladder, aelUsd, midPriceUsd } = args;
  // The rung at (or just below) the intended size drives the headline numbers.
  const atSize =
    ladder.find((p) => p.size_usd >= size_usd) ?? ladder[ladder.length - 1] ?? {
      size_usd,
      slippage_bps: 9800,
      realizable_usd: 0,
      avg_price: 0,
    };
  const slippage_to_exit_bps = atSize.slippage_bps;
  const realizable_exit_value_usd = atSize.realizable_usd;
  const pctRaw = aelUsd > 0 ? (size_usd / aelUsd) * 100 : 100;
  const pct = Number(pctRaw.toFixed(1));
  const you_are_the_exit_liquidity = pctRaw >= 50;
  const verdict = verdictFor(slippage_to_exit_bps, pctRaw);
  const recommended_max_size_usd = recommendedOkSize(ladder, aelUsd);
  const okTxt = recommended_max_size_usd > 0 ? `≤ $${recommended_max_size_usd.toLocaleString("en-US")}` : "a much smaller size";
  const slipPct = (slippage_to_exit_bps / 100).toFixed(1);

  const reason =
    verdict === "OK"
      ? `Exiting $${size_usd.toLocaleString("en-US")} of $${args.token_symbol} realizes $${realizable_exit_value_usd.toLocaleString("en-US")} (${slipPct}% slippage) at ${pct}% of the $${aelUsd.toLocaleString("en-US")} routed sell-side book. Clears cleanly.`
      : verdict === "WARN"
        ? `Exiting $${size_usd.toLocaleString("en-US")} of $${args.token_symbol} realizes $${realizable_exit_value_usd.toLocaleString("en-US")} (${slipPct}% slippage), ${pct}% of the $${aelUsd.toLocaleString("en-US")} book. In the grey band — size ${okTxt} for a clean (OK) exit.`
        : `Exiting $${size_usd.toLocaleString("en-US")} of $${args.token_symbol} realizes only $${realizable_exit_value_usd.toLocaleString("en-US")} (${slipPct}% slippage). You are ${pct}% of the $${aelUsd.toLocaleString("en-US")} sell-side book${you_are_the_exit_liquidity ? " — your own unwind is the market (you are the exit liquidity)" : ""}. Downsize to ${okTxt} for a clean (OK) exit.`;

  void midPriceUsd;
  const computed_at = new Date().toISOString();
  return {
    id: `chk_${args.token_symbol.toLowerCase().replace(/[^a-z0-9]/g, "")}_${size_usd}_${Date.now().toString(36)}`,
    token_address: args.token_address,
    token_symbol: args.token_symbol,
    chain: args.chain,
    quote_asset: args.quote_asset,
    side: args.side,
    size_usd,
    verdict,
    reason,
    realizable_exit_value_usd,
    slippage_to_exit_bps,
    pct_of_available_liquidity: pct,
    you_are_the_exit_liquidity,
    available_exit_liquidity_usd: aelUsd,
    recommended_max_size_usd,
    depth_curve: ladder,
    venues_probed: args.venues,
    quote_block: args.quote_block ?? 0,
    impact_band_bps: args.impact_band_bps,
    data_caveats: [...CAVEATS_BASE, ...(args.extra_caveats ?? [])],
    settlement: args.settlement ?? null,
    computed_at,
    latency_ms: args.latency_ms,
  };
}
