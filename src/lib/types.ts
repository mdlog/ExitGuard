// Shared types for the Exit-Liquidity Guard demo.
// These mirror the real backend row shapes so the UI imports types cleanly and
// the service layer (./data/*) can be swapped to real OKX DEX aggregator +
// on-chain reads + x402 settlement lookups with zero UI changes.
//
// Contract source of truth: docs/PRD.md §4 (tool contract) + §6 (methodology).

/** CAIP-2 chain identifiers used across the demo. Settlement is ALWAYS eip155:196 (X Layer). */
export type Caip2ChainId =
  | 'eip155:1' // Ethereum mainnet
  | 'eip155:8453' // Base
  | 'eip155:196' // X Layer (settlement chain — USDT0)
  | 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp' // Solana mainnet-beta

/** The whole product in one field: can the agent get OUT at this size? */
export type Verdict = 'BLOCK' | 'WARN' | 'OK'

/** MVP is long (must SELL to exit). short is a stretch endpoint. */
export type Side = 'long' | 'short'

/** Where a token sits on the liquidity spectrum — drives the expected verdict. */
export type LiquidityTier = 'thin' | 'mid' | 'deep'

/** Kind of caller agent consuming the ASP. */
export type AgentType =
  | 'memecoin-rotation'
  | 'defai-copilot'
  | 'treasury'
  | 'allocator'
  | 'arb'

/**
 * Venue/pool liquidity profile. The WHOLE point of the product lives here:
 * sell-side depth is thin (and often single-pool) while buy-side looks fine —
 * so you can buy it and not sell it. `sellSideDepthUsd` is the on-chain
 * `available_exit_liquidity_usd` (read via eth_call pool reserves, PRD §6.6).
 */
export type TokenLiquidityProfile = {
  midPriceUsd: number
  /** Routed sell-side liquidity in USD == available_exit_liquidity_usd. */
  sellSideDepthUsd: number
  /** Routed buy-side liquidity in USD (what makes it look safe to enter). */
  buySideDepthUsd: number
  /** buySide / sellSide. > 1 == easy to buy, hard to sell (the trap). */
  depthAsymmetryRatio: number
  /** Share of routed depth sitting in the single largest pool (fragility). */
  topPoolConcentrationPct: number
  poolCount: number
  primaryVenue: string
  /** Mock-only tuning knob for synthetic curves on tokens without a precomputed check. */
  curveSteepness: number
}

export type Token = {
  id: string
  address: string
  symbol: string
  name: string
  chain: Caip2ChainId
  chainName: string
  decimals: number
  priceUsd: number
  marketCapUsd: number
  volume24hUsd: number
  liquidityTier: LiquidityTier
  /** What a hero-sized check returns — used for landing-page grouping. */
  expectedVerdictAtHeroSize: Verdict
  isHero: boolean
  logoUrl: string
  liquidity: TokenLiquidityProfile
  /** When the Guard first indexed the token. */
  createdAt: string
}

/** One rung of the auditable depth curve (PRD §4). Monotonic: slippage rises, realizable is non-decreasing. */
export type DepthCurvePoint = {
  size_usd: number
  /** Effective average execution price at this size (mid * (1 - slippage)). */
  avg_price: number
  slippage_bps: number
  realizable_usd: number
}

/** x402 `exact` settlement receipt, pinned to X Layer / USDT0 (PRD §7). */
export type Settlement = {
  scheme: 'exact'
  asset: 'USDT0'
  chain: 'eip155:196'
  amount_usd: number
  /** On-chain settlement tx hash. Empty string when `simulated` (no real broadcast). */
  tx_hash: string
  paid_at: string
  /**
   * True when this receipt was produced by the demo/preview surface (the free Next.js
   * app or the offline fallback) rather than a real x402 settlement on X Layer. The UI
   * badges these "SIMULATED" and never links a fake tx to the explorer. Real receipts
   * from the paid asp-server carry `simulated: false` (or omit it) with a live tx_hash.
   */
  simulated?: boolean
}

/**
 * The core `exit_liquidity_check` result — matches PRD §4 output schema exactly.
 * This is what runExitLiquidityCheck() returns and what the DepthCurveChart renders.
 */
export type ExitLiquidityCheck = {
  id: string
  token_address: string
  token_symbol: string
  chain: Caip2ChainId
  quote_asset: string
  side: Side
  size_usd: number
  verdict: Verdict
  reason: string
  realizable_exit_value_usd: number
  slippage_to_exit_bps: number
  pct_of_available_liquidity: number
  you_are_the_exit_liquidity: boolean
  available_exit_liquidity_usd: number
  recommended_max_size_usd: number
  depth_curve: DepthCurvePoint[]
  venues_probed: string[]
  quote_block: number
  impact_band_bps: number
  data_caveats: string[]
  settlement: Settlement
  computed_at: string
  latency_ms: number
}

/** Input to runExitLiquidityCheck — mirrors the tool's HTTP input schema (PRD §4). */
export type ExitLiquidityCheckInput = {
  token_address: string
  chain: Caip2ChainId
  size_usd: number
  side?: Side
  quote_asset?: string
  impact_band_bps?: number
}

export type Agent = {
  id: string
  name: string
  handle: string
  type: AgentType
  /** Agentic Wallet EVM address on X Layer (the payer). */
  walletAddress: string
  callsMade: number
  totalUsdt0Spent: number
  blocksReceived: number
  warnsReceived: number
  firstSeenAt: string
  avatarUrl: string
}

/** One settled pay-per-call event in the recent activity feed. */
export type CallFeedEvent = {
  id: string
  agentId: string
  agentHandle: string
  token_symbol: string
  token_address: string
  chain: Caip2ChainId
  size_usd: number
  side: Side
  verdict: Verdict
  usdt0_amount: number
  tx_hash: string
  quote_block: number
  latency_ms: number
  paid_at: string
}

/** Landing/dashboard tiles. Kept believably modest — the marketplace is days old. */
export type MarketplaceStats = {
  totalChecks: number
  totalBlocked: number
  totalWarned: number
  totalOk: number
  uniqueAgents: number
  totalUsdt0Settled: number
  /** Illustrative sum of averted unwind losses on BLOCK verdicts. Not a vanity counter. */
  estUsdSaved: number
  avgLatencyMs: number
  liveSince: string
  settlementChain: Caip2ChainId
  feePerCallUsd: number
}
