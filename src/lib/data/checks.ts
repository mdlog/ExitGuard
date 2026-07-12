// Service layer — exit_liquidity_check. This is the product.
//
// runExitLiquidityCheck() is the mock of the real ASP handler. For any (token, size) it:
//   1. returns a precomputed check if one matches (the demo's hand-authored hero cases), else
//   2. derives a plausible result from the token's liquidity profile + a monotonic depth curve.
// The output schema matches docs/PRD.md §4 exactly, so swapping the body for real OKX DEX
// aggregator quote-ladder probing + eth_call pool reads + x402 settlement is mechanical.

import type {
  DepthCurvePoint,
  ExitLiquidityCheck,
  ExitLiquidityCheckInput,
  Token,
  Verdict,
} from '../types'
import { exitChecks, HERO_CHECK_ID, tokens } from '../mock-data'

const MOCK_LATENCY_MS = 90
const delay = () => new Promise((r) => setTimeout(r, MOCK_LATENCY_MS))

// ---------------------------------------------------------------------------
// Reads over the precomputed set.
// ---------------------------------------------------------------------------

/** All precomputed checks (recent → old by computed_at). */
export async function getExitLiquidityChecks(): Promise<ExitLiquidityCheck[]> {
  await delay()
  // Real version: .from('exit_liquidity_checks').select('*').order('computed_at', { ascending: false })
  return [...exitChecks]
    .sort((a, b) => b.computed_at.localeCompare(a.computed_at))
    .map((c) => ({ ...c, settlement: { ...c.settlement, simulated: true } }))
}

export async function getCheckById(id: string): Promise<ExitLiquidityCheck | null> {
  await delay()
  // Real version: .from('exit_liquidity_checks').select('*').eq('id', id).maybeSingle()
  return exitChecks.find((c) => c.id === id) ?? null
}

/** Every precomputed check for one token — powers a token detail page's history. */
export async function getChecksForToken(address: string): Promise<ExitLiquidityCheck[]> {
  const addr = address.toLowerCase()
  // Real version: .from('exit_liquidity_checks').select('*').eq('token_address', address)
  return exitChecks.filter((c) => c.token_address.toLowerCase() === addr)
}

/** The single most dramatic, fully-auditable check — the demo screenshot ($50k $TPEPE → BLOCK). */
export async function getHeroCheck(): Promise<ExitLiquidityCheck> {
  await delay()
  const hero = exitChecks.find((c) => c.id === HERO_CHECK_ID)!
  // Apply the same clean-exit-ceiling correction computeCheck uses, so the GET smoke test and the
  // /agents sample response never disagree with the interactive /guard screen.
  const token = tokens.find((t) => t.address.toLowerCase() === hero.token_address.toLowerCase())
  const withSim = { ...hero, settlement: { ...hero.settlement, simulated: true } }
  return token ? { ...withSim, recommended_max_size_usd: recommendedMaxSize(token) } : withSim
}

// ---------------------------------------------------------------------------
// The engine — pure, unit-testable verdict math (PRD §6). Mirrors the real handler.
// ---------------------------------------------------------------------------

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n))

/** Verdict thresholds — PRD §6.7, tunable. Exported so the client meter/zones stay in lockstep. */
export function verdictFor(slippageBps: number, pctOfLiquidity: number): Verdict {
  if (slippageBps >= 1000 || pctOfLiquidity >= 50) return 'BLOCK'
  if (slippageBps >= 200 || pctOfLiquidity >= 25) return 'WARN'
  return 'OK'
}

/** Merge every known (size, slippage) rung for a token from its precomputed curves. */
function knownCurvePoints(address: string): Array<{ size: number; slip: number }> {
  const addr = address.toLowerCase()
  const seen = new Map<number, number>()
  for (const c of exitChecks) {
    if (c.token_address.toLowerCase() !== addr) continue
    for (const p of c.depth_curve) if (!seen.has(p.size_usd)) seen.set(p.size_usd, p.slippage_bps)
  }
  return [...seen.entries()].map(([size, slip]) => ({ size, slip })).sort((a, b) => a.size - b.size)
}

/** Slippage (bps) at an arbitrary size: interpolate real anchors when present, else synth from profile. */
export function slippageAtSize(token: Token, size: number): number {
  const pts = knownCurvePoints(token.address)
  if (pts.length >= 2) {
    if (size <= pts[0].size) return clamp(Math.round((pts[0].slip * size) / pts[0].size), 1, 9800)
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i]
      const b = pts[i + 1]
      if (size >= a.size && size <= b.size) {
        const t = (size - a.size) / (b.size - a.size)
        return clamp(Math.round(a.slip + t * (b.slip - a.slip)), 1, 9800)
      }
    }
    // Beyond the deepest anchor: extend the last segment's slope.
    const a = pts[pts.length - 2]
    const b = pts[pts.length - 1]
    const slope = (b.slip - a.slip) / (b.size - a.size)
    return clamp(Math.round(b.slip + slope * (size - b.size)), 1, 9800)
  }
  // Synthetic hyperbolic curve for tokens without precomputed anchors (blows up as size → depth).
  const frac = size / token.liquidity.sellSideDepthUsd
  const raw = token.liquidity.curveSteepness * 10_000 * (frac / (1 - Math.min(frac, 0.985)))
  return clamp(Math.round(raw), 1, 9800)
}

/**
 * Largest size that stays fully OK (slippage < 200 bps AND < 25% of the book) — the clean-exit
 * ceiling that the green "MAX·OK" tick + "Recommended max" surface. Slippage and pct both rise
 * monotonically with size, so scan upward and stop the moment the OK band is left. Rounded DOWN so
 * the recommended size is never itself over the limit. Independent of the intended size (it's a
 * property of the token's book), which fixes the old bug of recommending a LARGER, still-WARN size.
 */
function recommendedMaxSize(token: Token): number {
  const ael = Math.max(1, token.liquidity.sellSideDepthUsd)
  const top = Math.max(1_000, Math.round(ael))
  const step = Math.max(100, Math.round(top * 0.005))
  let best = 0
  for (let s = step; s <= top; s += step) {
    const slip = slippageAtSize(token, s)
    const pct = (s / ael) * 100
    if (slip < 200 && pct < 25) best = s
    else break
  }
  return best > 0 ? Math.floor(best / 500) * 500 : 0
}

/**
 * Deterministic fake X Layer tx hash, stable across renders. Uses Math.imul so the
 * 32-bit LCG multiply doesn't overflow 2^53 and zero out its low bits (which would
 * render an all-zeros "0x000…000" hash — reads as fake in the settlement receipt).
 */
function mockTxHash(seed: string): string {
  const hex = '0123456789abcdef'
  let x = 0x811c9dc5 // FNV-ish seed so it's never 0
  for (let i = 0; i < seed.length; i++) x = (Math.imul(x ^ seed.charCodeAt(i), 16777619) + i + 1) >>> 0
  let out = ''
  for (let i = 0; i < 64; i++) {
    x = (Math.imul(x, 1103515245) + 12345) >>> 0
    out += hex[(x >>> 24) & 15]
  }
  return `0x${out}`
}

const CAVEATS_BASE = [
  'Routed on-chain DEX venues only — CEX orderbook depth is not included.',
  'Snapshot at the quoted block; pool state can move before you actually exit.',
  'Simultaneous exiters and MEV are not modeled.',
]

/**
 * THE tool. Given a token + intended size, returns whether the agent can EXIT.
 *
 * Real version (per PRD §6):
 *   1. probe a ~$100 sell quote through the OKX DEX aggregator for the unimpacted mid,
 *   2. probe sell quotes at 0.25× / 0.5× / 1× / 2× the notional → depth_curve,
 *   3. walk outward to the impact band for available_exit_liquidity,
 *   4. eth_call the top routed pools for reserves → pct_of_available_liquidity / "you'd be X% of the pool",
 *   5. apply thresholds → verdict, and settle the $0.02 USDT0 x402 payment on X Layer.
 */
/** Async ASP handler — thin wrapper over the pure engine (adds mock latency; real x402 settle wires here later). */
export async function runExitLiquidityCheck(
  input: ExitLiquidityCheckInput,
): Promise<ExitLiquidityCheck> {
  await delay()
  return computeCheck(input)
}

/**
 * Pure, synchronous verdict engine — safe to call on the client for instant
 * slider recompute (no await). This is the SAME math the async handler and the
 * `/api/exit-liquidity-check` route use, so the live preview and the "Run paid
 * check" result can never disagree.
 */
export function computeCheck(input: ExitLiquidityCheckInput): ExitLiquidityCheck {
  const side = input.side ?? 'long'
  const quote_asset = input.quote_asset ?? 'USDC'
  const impact_band_bps = input.impact_band_bps ?? 3_000
  const size_usd = input.size_usd

  const token =
    tokens.find(
      (t) =>
        t.address.toLowerCase() === input.token_address.toLowerCase() &&
        t.chain === input.chain,
    ) ??
    tokens.find((t) => t.address.toLowerCase() === input.token_address.toLowerCase())

  // Empty / no-route edge: unknown token → BLOCK with a legible "no routable exit path" result.
  if (!token) {
    const now = new Date().toISOString()
    return {
      id: `chk_noroute_${Date.now()}`,
      token_address: input.token_address,
      token_symbol: 'UNKNOWN',
      chain: input.chain,
      quote_asset,
      side,
      size_usd,
      verdict: 'BLOCK',
      reason:
        'No routable exit path found for this token on the requested chain. The aggregator returned no sell quote — treat any position here as unexitable until liquidity appears.',
      realizable_exit_value_usd: 0,
      slippage_to_exit_bps: 9800,
      pct_of_available_liquidity: 100,
      you_are_the_exit_liquidity: true,
      available_exit_liquidity_usd: 0,
      recommended_max_size_usd: 0,
      depth_curve: [],
      venues_probed: ['okx-dex-aggregator'],
      quote_block: 0,
      impact_band_bps,
      data_caveats: [...CAVEATS_BASE, 'Token not indexed / no routed venue — this is a hard no-route result, not a thin-liquidity warning.'],
      settlement: {
        scheme: 'exact',
        asset: 'USDT0',
        chain: 'eip155:196',
        amount_usd: 0.02,
        tx_hash: mockTxHash(`noroute:${input.token_address}:${size_usd}`),
        paid_at: now,
        simulated: true, // demo/preview surface — no real x402 broadcast (see Settlement type)
      },
      computed_at: now,
      latency_ms: 420,
    }
  }

  // Prefer a hand-authored precomputed check when the size matches closely (±5%).
  const precomputed = exitChecks.find(
    (c) =>
      c.token_address.toLowerCase() === token.address.toLowerCase() &&
      Math.abs(c.size_usd - size_usd) / size_usd <= 0.05,
  )
  // Recompute the clean-exit ceiling even for hand-authored precomputed checks, so the green
  // "MAX·OK" tick is always the true OK max and can't contradict the reason on the hero screen.
  // Mark the receipt simulated — these are demo fixtures, not real x402 settlements.
  if (precomputed)
    return {
      ...precomputed,
      recommended_max_size_usd: recommendedMaxSize(token),
      settlement: { ...precomputed.settlement, simulated: true },
    }

  // Otherwise derive a fresh, internally-consistent result.
  const mid = token.liquidity.midPriceUsd
  const ael = token.liquidity.sellSideDepthUsd
  const slippage_to_exit_bps = slippageAtSize(token, size_usd)
  const realizable_exit_value_usd = Math.round(size_usd * (1 - slippage_to_exit_bps / 10_000))
  const pctRaw = (size_usd / Math.max(1, ael)) * 100
  const pct = Number(pctRaw.toFixed(1))
  // Verdict + dominance flag from the UNROUNDED ratio, so a 49.96% book share can't round up to a
  // spurious BLOCK / "you are the exit liquidity" at the 25% / 50% band edges.
  const you_are_the_exit_liquidity = pctRaw >= 50
  const verdict = verdictFor(slippage_to_exit_bps, pctRaw)
  const recommended_max_size_usd = recommendedMaxSize(token)

  // Build a monotonic 0.25× / 0.5× / 1× / 2× ladder (PRD §6.2).
  const ladderSizes = [size_usd * 0.25, size_usd * 0.5, size_usd, size_usd * 2].map((s) =>
    Math.round(s),
  )
  let prevRealizable = 0
  const depth_curve: DepthCurvePoint[] = ladderSizes.map((s) => {
    const slip = slippageAtSize(token, s)
    let realizable = Math.round(s * (1 - slip / 10_000))
    // Guarantee non-decreasing realizable (physically, selling more can't yield less).
    if (realizable < prevRealizable) realizable = prevRealizable
    prevRealizable = realizable
    return {
      size_usd: s,
      slippage_bps: slip,
      realizable_usd: realizable,
      avg_price: Number((mid * (1 - slip / 10_000)).toPrecision(6)),
    }
  })

  const pctTxt = `${pct}%`
  const slipPct = (slippage_to_exit_bps / 100).toFixed(1)
  const okTxt = recommended_max_size_usd > 0 ? `≤ $${recommended_max_size_usd.toLocaleString()}` : 'a much smaller size'
  const reason =
    verdict === 'OK'
      ? `Exiting $${size_usd.toLocaleString()} of $${token.symbol} realizes $${realizable_exit_value_usd.toLocaleString()} (${slipPct}% slippage) at ${pctTxt} of the $${ael.toLocaleString()} sell-side book. Clears cleanly.`
      : verdict === 'WARN'
        ? `Exiting $${size_usd.toLocaleString()} of $${token.symbol} realizes $${realizable_exit_value_usd.toLocaleString()} (${slipPct}% slippage), ${pctTxt} of the $${ael.toLocaleString()} book. In the grey band — size ${okTxt} for a clean (OK) exit.`
        : `Exiting $${size_usd.toLocaleString()} of $${token.symbol} realizes only $${realizable_exit_value_usd.toLocaleString()} (${slipPct}% slippage). You are ${pctTxt} of the $${ael.toLocaleString()} sell-side book${you_are_the_exit_liquidity ? ' — your own unwind is the market (you are the exit liquidity)' : ''}. Downsize to ${okTxt} for a clean (OK) exit.`

  const caveats = [...CAVEATS_BASE]
  if (token.liquidity.topPoolConcentrationPct >= 90) {
    caveats.push(
      `Depth is ${token.liquidity.topPoolConcentrationPct}% concentrated in a single ${token.liquidity.primaryVenue} pool — fragile / discontinuous above this size.`,
    )
  }

  const now = new Date().toISOString()
  return {
    id: `chk_${token.id}_${size_usd}`,
    token_address: token.address,
    token_symbol: token.symbol,
    chain: token.chain,
    quote_asset,
    side,
    size_usd,
    verdict,
    reason,
    realizable_exit_value_usd,
    slippage_to_exit_bps,
    pct_of_available_liquidity: pct,
    you_are_the_exit_liquidity,
    available_exit_liquidity_usd: ael,
    recommended_max_size_usd,
    depth_curve,
    venues_probed: ['okx-dex-aggregator', token.liquidity.primaryVenue.toLowerCase().split(' ')[0]],
    quote_block: 21_940_000 + (size_usd % 1000),
    impact_band_bps,
    data_caveats: caveats,
    settlement: {
      scheme: 'exact',
      asset: 'USDT0',
      chain: 'eip155:196',
      amount_usd: 0.02,
      tx_hash: mockTxHash(`${token.address}:${size_usd}:${side}`),
      paid_at: now,
      simulated: true, // demo/preview surface — no real x402 broadcast (see Settlement type)
    },
    computed_at: now,
    latency_ms: 700 + (size_usd % 400),
  }
}

/** One rung of the dense oscilloscope trace the DepthCurveChart draws. */
export type CurveSample = {
  size_usd: number
  slippage_bps: number
  pct_of_liquidity: number
  realizable_usd: number
  verdict: Verdict
}

/**
 * Dense, smooth exit-liquidity curve for the chart (the "model" line), sampled
 * from the same slippage engine that produces the probed rungs (the dots). Lets
 * the UI render a continuous oscilloscope trace while keeping the audited anchors.
 */
export function sampleDepthCurve(
  tokenAddress: string,
  maxSizeUsd: number,
  points = 56,
): CurveSample[] {
  const addr = tokenAddress.toLowerCase()
  const token = tokens.find((t) => t.address.toLowerCase() === addr)
  if (!token) return []
  const ael = token.liquidity.sellSideDepthUsd
  const minSize = Math.max(250, Math.round(maxSizeUsd / points))
  const out: CurveSample[] = []
  for (let i = 0; i < points; i++) {
    const size = Math.round(minSize + ((maxSizeUsd - minSize) * i) / (points - 1))
    const slip = slippageAtSize(token, size)
    const pct = Number(((size / ael) * 100).toFixed(1))
    out.push({
      size_usd: size,
      slippage_bps: slip,
      pct_of_liquidity: pct,
      realizable_usd: Math.round(size * (1 - slip / 10_000)),
      verdict: verdictFor(slip, pct),
    })
  }
  return out
}
