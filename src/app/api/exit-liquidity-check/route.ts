// FREE demo/preview endpoint: POST /api/exit-liquidity-check  (GET returns the hero check for smoke-testing)
//
// ARCHITECTURE: this route is the web app's DEMO surface and NEVER charges. The sole PAID, registerable
// x402 endpoint is the standalone `asp-server` (POST /mcp + /exit_liquidity_check). This route serves
// one of two ways:
//   • mock (default) — the in-repo verdict engine (src/lib/data/checks.ts), zero backend needed.
//   • live — if EXITGUARD_ASP_URL (+ EXITGUARD_INTERNAL_TOKEN) is set, it proxies to the asp-server's
//     FREE shared-secret /internal route for REAL OKX-derived verdicts. The payment is NOT made here,
//     so the returned receipt is marked `simulated` — real settlements only come from paid asp-server
//     calls by real agents. OKX credentials live ONLY on the asp-server, never in this Next app.
//
// Solana tokens are demo-only (the live engine is EVM-only) — those always resolve on the mock engine.

import { NextResponse } from "next/server";
import { z } from "zod";
import { getHeroCheck, runExitLiquidityCheck } from "@/lib/data";
import type { Caip2ChainId, ExitLiquidityCheck, Settlement } from "@/lib/types";

const CHAINS = [
  "eip155:1",
  "eip155:8453",
  "eip155:196",
  "solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp",
] as const satisfies readonly Caip2ChainId[];

const InputSchema = z.object({
  token_address: z.string().min(1),
  chain: z.enum(CHAINS),
  size_usd: z.number().positive(),
  side: z.enum(["long", "short"]).optional(),
  quote_asset: z.string().optional(),
  impact_band_bps: z.number().positive().optional(),
});
type Input = z.infer<typeof InputSchema>;

const ASP_URL = process.env.EXITGUARD_ASP_URL || "";
const ASP_TOKEN = process.env.EXITGUARD_INTERNAL_TOKEN || "";
const ASP_ENABLED = Boolean(ASP_URL && ASP_TOKEN);

// ── tiny per-IP rate limiter (this route proxies live OKX quota when configured) ──
const hits = new Map<string, number[]>();
function rateLimited(req: Request): boolean {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anon";
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => t > now - 60_000);
  if (recent.length >= 60) return true;
  recent.push(now);
  hits.set(ip, recent);
  return false;
}

/** A demo/preview receipt: the web app doesn't actually settle x402, so the payment is simulated. */
function simulatedSettlement(): Settlement {
  return {
    scheme: "exact",
    asset: "USDT0",
    chain: "eip155:196",
    amount_usd: 0.02,
    tx_hash: "",
    paid_at: new Date().toISOString(),
    simulated: true,
  };
}

/** Proxy to the asp-server's FREE internal route for REAL OKX-derived verdicts. Returns null on any failure. */
async function proxyLive(input: Input): Promise<ExitLiquidityCheck | null> {
  try {
    const res = await fetch(`${ASP_URL.replace(/\/$/, "")}/internal/exit_liquidity_check`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-internal-token": ASP_TOKEN },
      body: JSON.stringify(input),
      signal: AbortSignal.timeout(15_000),
      cache: "no-store",
    });
    if (!res.ok) return null;
    const real = (await res.json()) as ExitLiquidityCheck;
    // Real DATA, but the demo didn't pay → attach a clearly-simulated receipt.
    return { ...real, settlement: simulatedSettlement() };
  } catch {
    return null;
  }
}

const isEvm = (chain: string) => chain.startsWith("eip155:");

// GET — quick browser/curl smoke test: returns the precomputed hero BLOCK (demo/mock).
export async function GET() {
  const check = await getHeroCheck();
  return NextResponse.json(check);
}

// POST — the tool call shape. FREE. Proxies to the paid asp-server's internal route when configured.
export async function POST(request: Request) {
  if (rateLimited(request)) {
    return NextResponse.json({ error: "rate limited" }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = InputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  // Live path for EVM chains when the asp-server is wired; otherwise the mock engine (also the fallback).
  if (ASP_ENABLED && isEvm(parsed.data.chain)) {
    const live = await proxyLive(parsed.data);
    if (live) return NextResponse.json(live);
    // fall through to mock if the asp-server is unreachable
  }

  const check = await runExitLiquidityCheck(parsed.data);
  return NextResponse.json(check);
}
