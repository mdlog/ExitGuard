// Service layer — aggregate marketplace stats for the landing / dashboard tiles.

import type { MarketplaceStats } from '../types'
import { marketplaceStats } from '../mock-data'
import { aspGet } from './asp'

const delay = () => new Promise((r) => setTimeout(r, 60))

/** Headline tiles: total checks, blocked, USDT0 settled, est. USD saved, unique agents. */
export async function getStats(): Promise<MarketplaceStats> {
  // Live: the asp-server aggregates real settled calls from its ledger (GET /stats).
  const live = await aspGet<MarketplaceStats>('/stats')
  if (live) return live
  await delay()
  return marketplaceStats
}
