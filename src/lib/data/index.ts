// Barrel for the Exit-Liquidity Guard data layer.
// UI imports ONLY from here (or the sibling modules) — never from ../mock-data directly.
// This is the swap-point: replace each function body with a real OKX DEX aggregator quote,
// on-chain eth_call read, or x402 settlement lookup and the UI does not change.

export * from './tokens'
export * from './checks'
export * from './agents'
export * from './feed'
export * from './stats'

// Re-export the shared types so components can import them from the data layer cleanly.
export type {
  Agent,
  AgentType,
  Caip2ChainId,
  CallFeedEvent,
  DepthCurvePoint,
  ExitLiquidityCheck,
  ExitLiquidityCheckInput,
  LiquidityTier,
  MarketplaceStats,
  Settlement,
  Side,
  Token,
  TokenLiquidityProfile,
  Verdict,
} from '../types'
