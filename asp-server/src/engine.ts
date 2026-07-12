// Shared check engine — used by BOTH the HTTP endpoint and the MCP tool so they never diverge.
// Auto-resolves token decimals + mid price from the OKX quote itself, then builds a real depth ladder.

import { assertCreds, buildExitLadder, ConfigError, resolveTokenMeta } from "./okx-dex.js";
import { getBlockNumber } from "./chain-rpc.js";
import { assembleExitCheck, type ExitLiquidityCheck, type Side } from "./verdict.js";

export const IMPACT_BAND_BPS = Number(process.env.IMPACT_BAND_BPS || 3000);

// CAIP-2 → OKX chainIndex + the stablecoin we exit into (USDC/USDT0, 6 decimals).
export const CHAINS: Record<
  string,
  { chainIndex: string; stable: string; stableDecimals: number; stableSymbol: string }
> = {
  "eip155:1": { chainIndex: "1", stable: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", stableDecimals: 6, stableSymbol: "USDC" },
  "eip155:8453": { chainIndex: "8453", stable: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", stableDecimals: 6, stableSymbol: "USDC" },
  "eip155:196": { chainIndex: "196", stable: process.env.XLAYER_STABLE || "0x779Ded0c9e1022225f8E0630b35a9b54bE713736", stableDecimals: 6, stableSymbol: "USDT0" },
};

export type CheckInput = {
  token_address: string;
  chain: string;
  size_usd: number;
  side?: Side;
  // Optional overrides — auto-resolved from OKX if omitted.
  decimals?: number;
  mid_price_usd?: number;
  token_symbol?: string;
};

export class CheckError extends Error {
  constructor(public status: number, msg: string) {
    super(msg);
  }
}

export async function runCheck(input: CheckInput): Promise<ExitLiquidityCheck> {
  const t0 = Date.now();
  const { token_address, chain, size_usd, side = "long" } = input;
  if (!token_address || !chain || !size_usd || Number(size_usd) <= 0) {
    throw new CheckError(400, "token_address, chain (CAIP-2) and a positive size_usd are required.");
  }
  const cfg = CHAINS[chain];
  if (!cfg) {
    // Non-EVM (e.g. Solana) is showcased in the demo UI but not yet wired in the live engine —
    // fail honestly rather than crash, so the demo and real surfaces agree on what's supported.
    throw new CheckError(400, `unsupported chain ${chain} — the live engine currently supports ${Object.keys(CHAINS).join(", ")} (EVM only).`);
  }

  // Config errors (missing OKX creds) must surface distinctly — never as a silent no-route BLOCK.
  try {
    assertCreds();
  } catch (e) {
    if (e instanceof ConfigError) throw new CheckError(500, e.message);
    throw e;
  }

  // Kick off the block read in parallel — it only enriches the receipt and must not add latency.
  const blockP = getBlockNumber(cfg.chainIndex);

  // Resolve decimals + mid price (from the quote itself) unless the caller supplied them.
  let decimals = input.decimals;
  let midPriceUsd = input.mid_price_usd;
  let symbol = input.token_symbol;
  if (decimals == null || midPriceUsd == null) {
    const meta = await resolveTokenMeta({
      chainIndex: cfg.chainIndex,
      tokenAddress: token_address,
      stableAddress: cfg.stable,
      stableDecimals: cfg.stableDecimals,
    });
    if (!meta) {
      // No routable quote → hard no-route BLOCK (unexitable until liquidity appears).
      return assembleExitCheck({
        token_address,
        token_symbol: symbol || "UNKNOWN",
        chain,
        quote_asset: cfg.stableSymbol,
        side: side as Side,
        size_usd: Number(size_usd),
        ladder: [],
        aelUsd: 0,
        midPriceUsd: 0,
        venues: ["okx-dex-aggregator"],
        impact_band_bps: IMPACT_BAND_BPS,
        latency_ms: Date.now() - t0,
        quote_block: await blockP,
        extra_caveats: ["Token not routable on the OKX DEX aggregator for this chain — hard no-route, not a thin-liquidity warning."],
      });
    }
    decimals = decimals ?? meta.decimals;
    midPriceUsd = midPriceUsd ?? meta.midPriceUsd;
    symbol = symbol ?? meta.symbol;
  }

  const sizes = [0.25, 0.5, 1, 2, 4].map((f) => Math.round(Number(size_usd) * f));
  const { ladder, aelUsd, venues } = await buildExitLadder({
    chainIndex: cfg.chainIndex,
    tokenAddress: token_address,
    decimals,
    stableAddress: cfg.stable,
    stableDecimals: cfg.stableDecimals,
    midPriceUsd,
    sizesUsd: sizes,
    impactBandBps: IMPACT_BAND_BPS,
  });

  return assembleExitCheck({
    token_address,
    token_symbol: symbol || "TOKEN",
    chain,
    quote_asset: cfg.stableSymbol,
    side: side as Side,
    size_usd: Number(size_usd),
    ladder,
    aelUsd,
    midPriceUsd,
    venues,
    impact_band_bps: IMPACT_BAND_BPS,
    latency_ms: Date.now() - t0,
    quote_block: await blockP,
  });
}
