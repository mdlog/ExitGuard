// Service layer — tokens. UI imports from here, never from ../mock-data directly.
// Each function is async so its signature already matches the real backend; swap the
// body for an OKX DEX token API call / on-chain read / Supabase query later — no caller changes.

import type { Caip2ChainId, LiquidityTier, Token } from '../types'
import { tokens } from '../mock-data'

const MOCK_LATENCY_MS = 60
const delay = () => new Promise((r) => setTimeout(r, MOCK_LATENCY_MS))

/** All indexed tokens across the liquidity spectrum. */
export async function getTokens(): Promise<Token[]> {
  await delay()
  // Real version:
  // const { data } = await supabase.from('tokens').select('*').order('market_cap_usd', { ascending: false })
  // return data ?? []
  return tokens
}

/** Hero tokens flagged for the landing page / demo (e.g. $TPEPE). */
export async function getHeroTokens(): Promise<Token[]> {
  await delay()
  // Real version: .from('tokens').select('*').eq('is_hero', true)
  return tokens.filter((t) => t.isHero)
}

/** Tokens grouped by liquidity tier — drives the "thin / mid / deep" columns. */
export async function getTokensByTier(tier: LiquidityTier): Promise<Token[]> {
  await delay()
  // Real version: .from('tokens').select('*').eq('liquidity_tier', tier)
  return tokens.filter((t) => t.liquidityTier === tier)
}

/**
 * Look up one token by address (+ optional chain). Returns null for unknown tokens
 * so the UI can render its empty / "token not indexed" state.
 */
export async function getTokenByAddress(
  address: string,
  chain?: Caip2ChainId,
): Promise<Token | null> {
  await delay()
  // Real version: .from('tokens').select('*').eq('address', address).maybeSingle()
  const addr = address.toLowerCase()
  return (
    tokens.find(
      (t) => t.address.toLowerCase() === addr && (chain ? t.chain === chain : true),
    ) ?? null
  )
}

/** Free-text search over symbol + name. Returns [] for no matches (empty-state driver). */
export async function searchTokens(query: string): Promise<Token[]> {
  await delay()
  // Real version: .from('tokens').select('*').or(`symbol.ilike.%${q}%,name.ilike.%${q}%`)
  const q = query.trim().toLowerCase()
  if (!q) return tokens
  return tokens.filter(
    (t) => t.symbol.toLowerCase().includes(q) || t.name.toLowerCase().includes(q),
  )
}
