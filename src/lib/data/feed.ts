// Service layer — recent settled pay-per-call events (the live activity feed).
// This is the x402 settlement receipt stream, NOT a vanity counter.

import type { CallFeedEvent } from '../types'
import { callFeed } from '../mock-data'
import { aspGet } from './asp'

const delay = () => new Promise((r) => setTimeout(r, 60))

/** Recent settled calls, most recent first. `limit` for the dashboard's activity panel. */
export async function getCallFeed(limit?: number): Promise<CallFeedEvent[]> {
  // Live: real settlement events from the asp-server ledger (GET /feed).
  const live = await aspGet<CallFeedEvent[]>(`/feed${typeof limit === 'number' ? `?limit=${limit}` : ''}`)
  if (live) return live
  await delay()
  const sorted = [...callFeed].sort((a, b) => b.paid_at.localeCompare(a.paid_at))
  return typeof limit === 'number' ? sorted.slice(0, limit) : sorted
}

/** One agent's call history. Returns [] for an agent with no calls (empty-state driver). */
export async function getFeedForAgent(agentId: string): Promise<CallFeedEvent[]> {
  await delay()
  // Real version: .from('call_feed').select('*').eq('agent_id', agentId).order('paid_at', ...)
  return callFeed
    .filter((e) => e.agentId === agentId)
    .sort((a, b) => b.paid_at.localeCompare(a.paid_at))
}

/** Every call made against one token. */
export async function getFeedForToken(address: string): Promise<CallFeedEvent[]> {
  const addr = address.toLowerCase()
  // Real version: .from('call_feed').select('*').eq('token_address', address)
  return callFeed
    .filter((e) => e.token_address.toLowerCase() === addr)
    .sort((a, b) => b.paid_at.localeCompare(a.paid_at))
}
