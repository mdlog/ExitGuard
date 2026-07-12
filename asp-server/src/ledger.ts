// Settlement ledger — the real backing for the "live" marketplace surfaces (stats tiles, activity
// feed, agent leaderboard) that are mock in the web app today. Every genuinely-settled paid call is
// appended to a JSONL file and aggregated in memory into the exact shapes src/lib/types.ts expects,
// so the web app can fetch real numbers (GET /stats · /feed · /agents) once the ASP has traffic.
//
// Only REAL settled calls are recorded — unpaid dev / simulated preview calls never pollute the
// live totals. Zero external deps (append-only fs); fine for the pay-per-call volume of an ASP.

import fs from "node:fs";
import path from "node:path";

const LEDGER_FILE = process.env.LEDGER_FILE || path.join(process.cwd(), "data", "ledger.jsonl");
const SETTLEMENT_CHAIN = "eip155:196";
const FEE_PER_CALL_USD = Number(process.env.PRICE_USD || 0.02);

export type LedgerEvent = {
  id: string;
  payer: string; // agentic wallet address of the caller (or "anonymous")
  token_symbol: string;
  token_address: string;
  chain: string;
  size_usd: number;
  side: string;
  verdict: "BLOCK" | "WARN" | "OK";
  realizable_usd: number;
  usdt0_amount: number;
  tx_hash: string;
  quote_block: number;
  latency_ms: number;
  paid_at: string;
};

let events: LedgerEvent[] = [];
let loaded = false;

function load(): void {
  if (loaded) return;
  loaded = true;
  try {
    const raw = fs.readFileSync(LEDGER_FILE, "utf8");
    events = raw
      .split("\n")
      .filter(Boolean)
      .map((l) => JSON.parse(l) as LedgerEvent);
  } catch {
    events = []; // no ledger yet — first settled call creates it
  }
}

/** Append one real settled call. Best-effort persistence — a write failure never breaks the response. */
export function recordCall(e: LedgerEvent): void {
  load();
  events.push(e);
  try {
    fs.mkdirSync(path.dirname(LEDGER_FILE), { recursive: true });
    fs.appendFileSync(LEDGER_FILE, JSON.stringify(e) + "\n");
  } catch (err) {
    console.warn(`[ledger] persist failed: ${(err as Error).message}`);
  }
}

const shortAddr = (a: string) => (a && a.length > 10 ? `${a.slice(0, 6)}…${a.slice(-4)}` : a || "anon");

export function getStats() {
  load();
  const totalChecks = events.length;
  const totalBlocked = events.filter((e) => e.verdict === "BLOCK").length;
  const totalWarned = events.filter((e) => e.verdict === "WARN").length;
  const totalOk = events.filter((e) => e.verdict === "OK").length;
  const uniqueAgents = new Set(events.map((e) => e.payer)).size;
  const totalUsdt0Settled = events.reduce((s, e) => s + e.usdt0_amount, 0);
  // Averted loss = the slippage a BLOCK saved the agent from eating had it exited at size.
  const estUsdSaved = events
    .filter((e) => e.verdict === "BLOCK")
    .reduce((s, e) => s + Math.max(0, e.size_usd - e.realizable_usd), 0);
  const avgLatencyMs = totalChecks ? Math.round(events.reduce((s, e) => s + e.latency_ms, 0) / totalChecks) : 0;
  const liveSince = events.length ? events[0].paid_at : new Date().toISOString();
  return {
    totalChecks,
    totalBlocked,
    totalWarned,
    totalOk,
    uniqueAgents,
    totalUsdt0Settled: Number(totalUsdt0Settled.toFixed(2)),
    estUsdSaved: Math.round(estUsdSaved),
    avgLatencyMs,
    liveSince,
    settlementChain: SETTLEMENT_CHAIN,
    feePerCallUsd: FEE_PER_CALL_USD,
  };
}

export function getFeed(limit?: number) {
  load();
  const feed = [...events]
    .sort((a, b) => b.paid_at.localeCompare(a.paid_at))
    .map((e) => ({
      id: e.id,
      agentId: e.payer,
      agentHandle: shortAddr(e.payer),
      token_symbol: e.token_symbol,
      token_address: e.token_address,
      chain: e.chain,
      size_usd: e.size_usd,
      side: e.side,
      verdict: e.verdict,
      usdt0_amount: e.usdt0_amount,
      tx_hash: e.tx_hash,
      quote_block: e.quote_block,
      latency_ms: e.latency_ms,
      paid_at: e.paid_at,
    }));
  return typeof limit === "number" ? feed.slice(0, limit) : feed;
}

export function getAgents(limit?: number) {
  load();
  const byPayer = new Map<string, ReturnType<typeof blankAgent>>();
  for (const e of events) {
    const a = byPayer.get(e.payer) ?? blankAgent(e.payer);
    a.callsMade += 1;
    a.totalUsdt0Spent += e.usdt0_amount;
    if (e.verdict === "BLOCK") a.blocksReceived += 1;
    if (e.verdict === "WARN") a.warnsReceived += 1;
    if (!a.firstSeenAt || e.paid_at < a.firstSeenAt) a.firstSeenAt = e.paid_at;
    byPayer.set(e.payer, a);
  }
  const agents = [...byPayer.values()]
    .map((a) => ({ ...a, totalUsdt0Spent: Number(a.totalUsdt0Spent.toFixed(2)) }))
    .sort((a, b) => b.callsMade - a.callsMade);
  return typeof limit === "number" ? agents.slice(0, limit) : agents;
}

function blankAgent(payer: string) {
  return {
    id: payer,
    name: shortAddr(payer),
    handle: shortAddr(payer),
    type: "defai-copilot" as const,
    walletAddress: payer,
    callsMade: 0,
    totalUsdt0Spent: 0,
    blocksReceived: 0,
    warnsReceived: 0,
    firstSeenAt: "",
    avatarUrl: "",
  };
}
