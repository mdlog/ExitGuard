// Service layer — caller agents (the ASP's paying consumers).

import type { Agent } from '../types'
import { agents } from '../mock-data'
import { aspGet } from './asp'

const delay = () => new Promise((r) => setTimeout(r, 60))

/** All caller agents seen so far. */
export async function getAgents(): Promise<Agent[]> {
  const live = await aspGet<Agent[]>('/agents')
  if (live) return live
  await delay()
  return [...agents].sort((a, b) => b.callsMade - a.callsMade)
}

export async function getAgentById(id: string): Promise<Agent | null> {
  await delay()
  // Real version: .from('agents').select('*').eq('id', id).maybeSingle()
  return agents.find((a) => a.id === id) ?? null
}

/** Top callers by volume — for a "who's using the Guard" leaderboard tile. */
export async function getTopAgents(limit = 5): Promise<Agent[]> {
  // Live: aggregated from the asp-server ledger (GET /agents?limit=).
  const live = await aspGet<Agent[]>(`/agents?limit=${limit}`)
  if (live) return live
  await delay()
  return [...agents].sort((a, b) => b.callsMade - a.callsMade).slice(0, limit)
}
