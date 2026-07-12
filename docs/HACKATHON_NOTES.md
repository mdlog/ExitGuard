# Hackathon Pipeline Retrospective — ExitGuard

_Run date: 2026-07-08 · OKX.AI Genesis Hackathon · solo builder · deadline Jul 17 22:59 UTC (~9 days)._

## What we're building
**ExitGuard** — an OKX.AI Agentic Service Provider (ASP). Before a trading agent sizes a position, it calls
`exit_liquidity_check` and learns whether it can actually EXIT at that size — returning **BLOCK / WARN / OK**
with an auditable depth curve, "you are X% of the available exit liquidity," and a recommended max size.
Pay-per-call in **USDT0 on X Layer (`eip155:196`)** via **x402**. One-liner: *"the seatbelt that tells a
trading agent if it can actually get OUT before it gets IN."*

## Decision trail (why ExitGuard, not the obvious pick)
- **Theme locked: A "The Seatbelt"** — the pick-and-shovel safety/execution layer every on-chain agent must call.
- **Ideator's #1 was PreSign Firewall** (a broad pre-sign tx-safety check). **The critic overturned it**, and the
  stack research confirmed the critic was right:
  - OKX's **Agentic Wallet already ships a native pre-sign firewall** (`security tx-scan` / `sig-scan`), and
    **CertiK is already a live security ASP** → PreSign Firewall is redundant, not differentiated.
  - Its "Permit2 blind-spot" differentiation was **false** — GoPlus productized Permit/Permit2 signature decoding
    in Oct 2024 and literally sells a "Transaction Security Firewall."
  - Its "live revenue counter" can't tick organically on an **8-day-old marketplace** with ~50 mostly-seller ASPs.
- **Winning insight:** on a cold-start marketplace, **legibility-per-single-call beats calls-per-second.** The
  safety-firewall niche is occupied; the **microstructure / exit-liquidity niche is wide open** and matches the
  builder's DeFi edge. Exit-Liquidity Guard's value lands in **one legible screenshot on a standing condition
  (illiquidity)** — no attacker to schedule, no marketplace volume required.

## Key technical facts (from docs/OKXAI_STACK.md — hard-won; okx.ai was 403-blocked, reached via GitHub repos + reader proxy)
- **Payments = x402 / MPP over HTTP 402**, real seller SDKs in TS/Go/Rust/Python (`@okxweb3/x402-*`, `@okxweb3/mpp`).
  Schemes: `exact` (flat per-call), `upto` (metered), `deferred`, `session`, plus escrow for A2A.
- **Settlement = USDT0 on X Layer (`eip155:196`)**, gas-free via OKX paymaster. ⚠️ This **corrects the original
  brief**, which said X Layer was not involved — X Layer *is* the settlement chain.
- **Go-live gate (pass/fail eligibility):** `skills add okx/onchainos-skills` → Agentic Wallet → `agent pre-check`
  → listing (A2MCP endpoint becomes **immutable on-chain**) → `validate-listing` → `create` → `activate` →
  `submitApproval` → **OKX review** → live. One ASP per address.

## Target tracks
Revenue Rocket · Best Product · Finance Copilot (primary) · Social Buzz (the CT "your agent is about to become the
exit liquidity" screenshot) · Software Utility (the MCP tool contract for agent integrators).

## ⚠️ Incident: concurrent-session file collision (resolved)
A **second Claude session was running a Circle/Arc "ArcCast" grant in the same root folder**
(`/home/mdlog/Project-MDlabs/Hackquest/okx`). Both pipelines wrote the same filenames (`PRD.md`, `PMF.md`) and
clobbered each other — my PMF was overwritten with ArcCast content; my PRD had overwritten their ArcCast PRD.
**Resolution:** isolated all ExitGuard work into `okx-exit-liquidity-guard/` (docs + app), regenerated the
destroyed PMF, and left the other session's files at root untouched. Root `docs/` later self-cleared.
**Lesson for next run:** when a cwd may host a concurrent session, verify file *contents* (not just "agent said it
wrote it") after parallel writes, and isolate into a project subfolder early.

## Open questions to resolve BEFORE coding the real backend (from OKXAI_STACK.md)
1. ✅ **RESOLVED (2026-07-08, live okx.ai/tutorial + dev-docs):** ASP go-live is a **conversational** flow via the
   Onchain OS agent, not a CLI form. A2MCP registration fields = **name · description · price-per-call · endpoint**;
   the endpoint **must support x402** (OKX Payment SDK, settled per call). **Review SLA conflicts between the two live
   sources — 24h (tutorial) vs 2 business days (dev-doc) → plan for 2 business days, submit ~Jul 13–14.** Full flow +
   the A2MCP "good fit" confirmation now in `OKXAI_STACK.md` → "CONFIRMED LIVE" section.
2. **Can an external ASP endpoint call the OKX DEX aggregator quote API server-side** with its own key? This is the
   single blocking build dependency for the exit-liquidity math — **de-risk on Day 1** with an `eth_call` +
   public-aggregator fallback.
3. **X Layer public RPC trace support** (`debug_traceCall` / `trace_*`) for a self-built simulator, or is a
   fork/archive provider needed?

## Product risks (carry into the build)
- **Clone-perception** ("it's just an aggregator-quote wrapper") — the entire defense is rendering the **raw,
  auditable depth curve + the ALLOW→BLOCK continuity flip** on screen so the verdict reads as derived microstructure
  math, not a repriced quote. **Non-negotiable UI honesty guardrails:** raw curve + data caveats always on-frame; NO
  fake vanity counter.
- **Depth-model credibility** — a quant judge can probe the BLOCK/WARN/OK thresholds; keep every number auditable.
- **Pivot trigger:** if Day-1 de-risking can't produce a defensible depth curve for real illiquid tokens, pivot the
  hero to **Liquidation Pre-Check** (shared data layer, more deterministic math).

## Build status (what's done vs. what's left)
- ✅ **Done:** full doc set (brief, theme, ideation+critique, stack, PRD, PMF, design brief+ref, layout spec); Next.js
  15 + TS + Tailwind v4 + shadcn scaffold; mock-data service layer wired (`src/lib/data`, `tsc` clean).
- ✅ **Frontend BUILT + verified** (frontend-design pass, "Instrument-Grade Risk Terminal"): all 3 routes are real UI,
  not stubs — `/guard` (interactive two-pane terminal: annunciator + zoned exit-liquidity gauge + recharts depth-curve
  oscilloscope + live size fader + x402 settlement receipt), `/` (CT landing: auto-cycling BLOCK/WARN/OK hero + trap +
  how-it-works + whitespace + stats), `/agents` (MCP tool contract + code + live sample response + callers). Verified
  live in-browser (BLOCK hero, live token/size flip, paid-check settlement animation); `next build` passes 8/8 routes.
  Components in `src/lib/*` + `src/components/xg/*` + `src/components/site/*`. Engine refactored to a sync `computeCheck`
  for instant client recompute. Bugs fixed en route: all-zeros tx_hash (JS 2^53 overflow → `Math.imul`), horizontal
  overflow (`min-w-0` on grid tracks), a build-blocking lint error.
- ✅ **Real integration SCAFFOLDED** (2026-07-08) in `asp-server/` — a standalone, typechecked, booting service that
  is the real registerable A2MCP endpoint (separate from the Next demo): `src/okx-dex.ts` (signed OKX DEX
  `/api/v6/dex/aggregator/quote` client + real sell-quote depth ladder), `src/verdict.ts` (pure engine), `src/payment.ts`
  (exact x402 seller middleware, dynamically imported), `src/server.ts` (Express `POST /exit_liquidity_check`). De-risk
  = GREEN: both the DEX quote API and the x402 Facilitator are server-side callable with one OKX API key. See
  `asp-server/README.md`.
- ✅ **Auto-metadata + MCP wrapper DONE** (2026-07-08): `resolveTokenMeta` reads decimals+mid-price from the quote's
  `fromToken` (callers pass only token+size); `src/mcp.ts` exposes `exit_liquidity_check` as a native MCP tool over
  Streamable HTTP (`POST /mcp`), with a method-aware x402 gate (initialize/tools-list free, tools/call paid). MCP
  handshake + both endpoints boot-verified; `tsc=0`.
- ⬜ **Left (needs the user's accounts + a domain, only):** `npm i @okxweb3/x402-express @okxweb3/x402-core
  @okxweb3/x402-evm`; fill `.env` (OKX API key/secret/passphrase + `PAY_TO` Agentic-Wallet address); testnet on
  `eip155:1952`; deploy public HTTPS; register + list via the Onchain OS agent and **submit for review by ~Jul 13–14**;
  record the ≤90s demo off `/guard`; post the #OKXAI X thread off `/`.

## Demo path (verified, LAYOUT_SPEC §8)
`/` hook (0–15s) → `/guard` pick $TPEPE @ $50k → **BLOCK** + live depth curve "$18.5k, −63%, 82% of exit liquidity"
(15–45s) → drag size slider, verdict flips OK→WARN→BLOCK (45–60s) → "Run paid check" → x402 402→sign→200, USDT0 on
X Layer tx (60–75s) → `/` close "one call stopped a 63% loss; next: Liquidation Pre-Check" (75–90s).
