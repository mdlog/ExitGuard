# PRD — Exit-Liquidity Guard

> Locked idea (idea #7). ASP for the OKX.AI Genesis Hackathon, Theme A "The Seatbelt."
> Solo build, ~9 days. Grounded in `OKXAI_STACK.md` (technical ground truth — no invented APIs).
> Positioning per `IDEATION_CRITIQUE.md`: **legibility-per-single-call > frequency**; detection is
> *not* a commodity API (unlike PreSign/Permit/Poison, which GoPlus/Blockaid/MetaMask already ship).

## 1. One-liner
The seatbelt that tells a trading agent if it can actually get OUT before it gets IN.

---

## 2. Problem + why now

**The trap.** A position-taking agent can enter a size it mathematically cannot exit. On an illiquid
token you can *buy* it fine, then discover the only way out is to eat catastrophic slippage or wait days
— you *become your own exit liquidity*, and your own unwind moves the market against you. This is the
single mistake that turns a "win" into a trapped bag.

**Why it's blind today.** Agents size off price, TVL, or a static safety score. None of those answer the
only question that matters at exit: *"if I try to sell THIS size, what do I actually get back, and am I
the market?"* That is a microstructure question — it lives in a good trader's head and in dashboards,
**never as a machine-callable gate**. Incumbents (CertiK = static security scoring, GoPlus/Blockaid =
drainer/permit detection, OKX's own native wallet firewall) do not compute realizable exit depth. This
niche is un-occupied.

**Why now (2026).** OKX.AI opened the agent economy on 2026-06-30: agents now hold wallets, take
positions, and pay each other per call. Autonomous position-sizing at scale makes exit-blindness
**systemic** instead of one careless trader's problem — and for the first time there is a paid, machine-
consumed channel (A2MCP) to deliver the verdict an agent has no eyeball to read.

---

## 3. Target user + jobs-to-be-done

**Primary buyer — the calling agent** (structurally forced to check before sizing):
- Autonomous trading / allocator / position-sizing agents on OKX.AI.
- DeFi copilots that are themselves agents (they size on a human's behalf).

**JTBD (agent):** *"Before I commit size X to token T, tell me whether I can realistically unwind it,
what slippage that costs, and block me if I'd be the exit liquidity."*

**Secondary — the human behind it:** the trader/fund operator who ate a 60% unwind once and never wants
their bot to do it again. **JTBD (human):** *"Make my agent physically unable to enter a bag it can't
sell."*

---

## 4. Scope — MVP vs. stretch (ruthless)

**MVP (must ship in 9 days) — the single Exit-Liquidity endpoint:**
- [ ] ONE MCP/HTTP tool: `exit_liquidity_check` (contract in §5).
- [ ] Realizable-exit computation from **OKX DEX aggregator quotes probed at a size ladder** (§6).
- [ ] Legible verdict: `BLOCK / WARN / OK` + `you_are_the_exit_liquidity` + an **auditable `depth_curve`**.
- [ ] `exact` x402 pay-per-call, **USDT0 on X Layer (`eip155:196`)**, gasless via OKX paymaster.
- [ ] Live + approved on OKX.AI, and ONE killer demo (§10).

**MVP token/chain scope:** 1–2 hero illiquid tokens on the chain(s) with real aggregator depth. The
*analyzed* token can live on any chain the aggregator covers; **settlement is always X Layer/USDT0** (the
two are independent). Keep analysis to 1–2 chains for the window.

**Stretch (only after go-live is secured):**
- Endpoint #2 **Liquidation Pre-Check** — liq price + health buffer + cascade proximity before leverage
  (one protocol the builder knows cold). Shares the depth/oracle data layer; deepens Finance Copilot fit.
- More chains; `upto` metered pricing (charge by ladder depth / venues probed).
- On-chain verdict attestation (ERC-8004 / EAS-style) for A2A composability.

**Explicitly NOT in scope (pre-empt judge questions):** no order routing/execution (inspect-only, Theme A
not B); no CEX orderbook depth in MVP (routed on-chain venues only — stated as a caveat, not hidden); no
custom audited Solidity; no live-counter vanity metric (the critique kills that — one legible call is the
pitch).

---

## 5. The MCP tool contract

**Tool name:** `exit_liquidity_check`
**Shape:** priced HTTPS endpoint wrapped with the `okx/payments` TS x402 middleware (lowest-friction path
to "live"); optionally also exposed via the `x402/mcp` paid-tool wrapper for the MCP-native showcase. The
marketplace listing stores the HTTPS Endpoint URL.

**Input schema:**
```json
{
  "token_address": "0xEXAMPLEilliquidTOKEN000000000000000000000",
  "chain": "eip155:8453",          // CAIP-2 of where the TOKEN trades (analysis chain)
  "quote_asset": "USDC",           // what you'd exit into
  "side": "long",                  // long => must SELL to exit (MVP); short => stretch
  "size": { "notional_usd": 50000 },
  "impact_band_bps": 3000          // optional; slippage bound defining "available liquidity" (default 3000)
}
```

**Output schema (sample response — BLOCK case):**
```json
{
  "verdict": "BLOCK",
  "reason": "Exiting $50k of $XYZ would realize only $18.5k (-63% slippage). You are 82% of available exit liquidity — your own unwind is the market.",
  "realizable_exit_value_usd": 18500,
  "slippage_to_exit_bps": 6300,
  "pct_of_available_liquidity": 82,
  "you_are_the_exit_liquidity": true,
  "available_exit_liquidity_usd": 61000,
  "recommended_max_size_usd": 6000,
  "depth_curve": [
    { "size_usd": 12500,  "slippage_bps": 180,  "realizable_usd": 12275 },
    { "size_usd": 25000,  "slippage_bps": 950,  "realizable_usd": 22625 },
    { "size_usd": 50000,  "slippage_bps": 6300, "realizable_usd": 18500 },
    { "size_usd": 100000, "slippage_bps": 8200, "realizable_usd": 18000 }
  ],
  "venues_probed": ["okx-dex-aggregator"],
  "quote_block": 12345678,
  "data_caveats": [
    "Routed on-chain DEX venues only; CEX orderbook depth not included",
    "Snapshot at block 12345678 — pool state can change before you exit"
  ],
  "settlement": { "asset": "USDT0", "chain": "eip155:196", "amount": "0.02" }
}
```
`verdict` is `OK` when slippage and liquidity share are both comfortable, `WARN` in the grey band, `BLOCK`
when the position dominates the exit book (thresholds in §6). `recommended_max_size_usd` is the size that
clears back to `WARN`, so the agent gets an actionable downsize, not just a "no."

---

## 6. Methodology (how the number is computed — must survive a quant judge)

1. **Reference mid.** Probe a tiny sell quote (~$100 notional) through the **OKX DEX aggregator** to get
   an (approximately) unimpacted mid price for `token → quote_asset`.
2. **Size ladder.** Probe sell quotes at **0.25× / 0.5× / 1× / 2×** the intended notional. For each rung:
   `slippage_bps = (mid_out − quote_out) / mid_out × 10000`; `realizable_usd = quote_out`. This yields the
   `depth_curve`.
3. **`slippage_to_exit_bps`** = the slippage at the 1× (intended-size) rung.
4. **Available Exit Liquidity (AEL).** Walk the ladder outward until cumulative slippage crosses
   `impact_band_bps` (default 3000 = 30%); the notional exitable within that band = AEL. This is
   auditable — it is the aggregator's own quotes, not a guessed multiplier.
5. **`pct_of_available_liquidity`** = `intended_notional / AEL`. If ≥ 50%, the agent *is* a dominant share
   of the exit book → `you_are_the_exit_liquidity = true`.
6. **On-chain supplement (`eth_call`).** Read the top routed pools' reserves / concentrated-liquidity
   state directly on the analysis chain to (a) sanity-check the aggregator curve, (b) detect single-pool
   concentration (fragile depth), (c) drive the "you'd be X% of the pool" framing.
7. **Verdict thresholds (tunable, calibrated on real tokens):**
   - `OK`   — `slippage_to_exit < 200 bps` AND `pct_of_available_liquidity < 25%`
   - `WARN` — slippage 200–1000 bps OR pct 25–50%
   - `BLOCK`— slippage > 1000 bps OR pct ≥ 50%

**Honest limits (shipped as `data_caveats`, not buried):** aggregator covers routed on-chain venues only
(no CEX depth); quotes are point-in-time snapshots (state can move before the real exit); other
simultaneous exiters / MEV are not modeled; concentrated-liquidity pools can have discontinuous depth.
The mitigation is transparency — the raw curve is on screen, so the 63% is verifiable, not asserted.

---

## 7. Payment + go-live integration (per `OKXAI_STACK.md`)

**Payment wiring (seller SDK, TS/Node):** wrap the endpoint route with the `okx/payments` TS x402
middleware, scheme **`exact`** (fixed price per HTTP request, gasless EIP-3009 `transferWithAuthorization`).
Settlement pinned to **X Layer `eip155:196`**, token **USDT0** (`0x779Ded0c9e1022225f8E0630b35a9b54bE713736`,
6 decimals). Flow: caller hits endpoint → server returns **HTTP 402** challenge → caller's wallet signs →
retries with `X-PAYMENT` → server verifies → runs handler → **settles** → `200` + `PAYMENT-RESPONSE`.
Broker/paymaster handles RPC, gas, and tx submission (the ASP wallet needs no native token). `PAY_TO` =
the Agentic Wallet EVM address. Needs `OKX_API_KEY / OKX_SECRET_KEY / OKX_PASSPHRASE` (Dev Portal) for the
Facilitator client. MVP fee: **flat $0.02 USDT0** per call (the deeper depth-math justifies premium pricing
vs. a heuristic check). Stretch: `upto` metered via `setSettlementOverrides`.

**Go-live checklist (`onchainos` CLI):**
1. `npx skills add okx/onchainos-skills`
2. `onchainos wallet login <email>` → `onchainos wallet verify <code>` (TEE wallet; or API-key login)
3. **Deploy + smoke-test the real HTTPS endpoint FIRST** — the Endpoint URL is written **immutably
   on-chain**; a wrong/temporary URL is costly to change.
4. `onchainos agent pre-check --role asp` (consent gate + one-ASP-per-address uniqueness)
5. `onchainos agent validate-listing --role asp --name … --service '[…]'` → must return `{pass:true}`
6. `onchainos agent create --role asp --name "Exit-Liquidity Guard" --picture <avatar> --service '[…]'`
   → `newAgentId` (Name 3–25 chars; Service name 5–30-char noun phrase; 2-part description = ① core
   capability + who it's for, ② what the caller must provide; Type `A2MCP`; Fee `"0.02"` USDT; Endpoint)
7. `onchainos agent activate --agent-id <N> --preferred-language en` → **`submitApproval`** → "Submitted
   for review" → `approvalStatus:2` (under review) → `success:true` (live)

**Eligibility implication:** the hackathon's hard gate == passing this `submitApproval` review and reaching
live before **Jul 17 22:59 UTC**. **The review SLA is DATA NOT FOUND** (`OKXAI_STACK.md` open Q1) — treat
it as a scheduling risk: submit for review by **Day 5**, never leave `activate` to the final day.

---

## 8. Architecture (solo-shippable, no Solidity)

```
Caller agent (Claude Code / Codex / any MCP client)
        │  HTTP 402 → pay (USDT0/X Layer) → retry
        ▼
[ TS/Node service on public HTTPS ]  ← immutable Endpoint URL on-chain
  ├─ x402 seller middleware (okx/payments, `exact`, eip155:196/USDT0)  → OKX Broker/Facilitator
  ├─ Verdict engine (pure fn: ladder → slippage → AEL → BLOCK/WARN/OK)
  ├─ OKX DEX aggregator client (sell quotes at the size ladder)
  ├─ X Layer / analysis-chain JSON-RPC client (`eth_call` pool reads)
  └─ Thin cache (in-mem/Redis; quote ladders keyed by token+size-bucket, ~1 block TTL)
```
Stack: Node + TS, Express/Hono. Deploy to a stable public-HTTPS host (Railway / Fly / Render / small VPS).
No bespoke audited contracts — settlement rails and identity come from OKX primitives. The verdict engine
is a pure, unit-testable function so thresholds can be calibrated against real tokens fast.

---

## 9. Tracks + win-conditions

- **Revenue Rocket ($20k):** clean A2MCP USDT0 metering; demo *real settled paid calls* on X Layer. Pitch
  monetization **design + one proven paid transaction** (per critique — the 8-day-old marketplace has no
  organic volume, so **never** pitch a self-generated counter; each single call is a complete value story).
- **Finance Copilot ($7.5k):** bullseye — position-sizing / exit-liquidity is core DeFi finance. The
  Liquidation Pre-Check stretch endpoint compounds this fit.
- **Best Product ($20k):** single-purpose (matches blessed CertiK/CoinAnk/GenLayer shape), lowest go-live
  risk, verdict legible in one screenshot, number auditable live.
- **Creative Genius ($20k) upside:** "weaponize the exit-liquidity metric as an agent veto" is the most
  Creative-Genius-flavored angle of the shortlist — no crowded category to relegate it to.
- **Social Buzz ($10k) hook:** *"You can buy it. Can you sell it? The mistake that turns a win into a
  bag."* CT-native. The share moment is the **ALLOW→BLOCK flip as you scale size** + "you'd BE the exit
  liquidity."

---

## 10. Demo / "proven value" moment (90s — no live attacker, no organic traffic needed)

Illiquidity is a **standing condition**, not a scheduled event — so the demo is fully in the builder's
control. Use a genuinely illiquid real token; drive the calls yourself.

- **0–15s (hook + problem):** "Agents size positions blind to exit. Watch one try to enter a bag it can't
  sell."
- **15–60s (solution in action):** From Claude Code, call `exit_liquidity_check` for a **$50k long of
  $XYZ**. Render the **live `depth_curve` from real aggregator quotes** on screen. Verdict **BLOCK**:
  *"realize only $18.5k, −63% slippage, you are 82% of exit liquidity."* Then **scale the size down live**
  → flips **WARN → OK at ~$6k** (proves a continuous model, not a lookup).
- **60–75s (wow):** the **USDT0 pay-per-call settling on the same screen** — 402 → sign → `PAYMENT-RESPONSE`,
  X Layer ~200ms finality. Agent paid agent, on OKX's own rails.
- **75–90s (impact / next):** "One call stopped a 63% loss. Next: Liquidation Pre-Check on the same data
  layer."

**Demo must-lands (from critique):** (1) real depth curve rendered live; (2) a size that flips ALLOW→BLOCK
as it scales; (3) the USDT0 micro-payment settling on-screen. 3/3 = top tier.

---

## 11. 9-day build plan (Jul 8 → hard cutoff Jul 17 22:59 UTC)

- **Day 1 (Jul 8) — DE-RISK THE DATA LAYER FIRST.** Confirm the OKX DEX aggregator quote API is callable
  **server-side** with an API key (see risk R2) and returns quotes at arbitrary sizes; pick 1–2 hero
  illiquid tokens; confirm `eth_call` pool reads on the analysis chain. Get Dev Portal keys; fund a small
  USDT0/OKB float on X Layer (faucet `web3.okx.com/xlayer/faucet`).
- **Day 2 (Jul 9):** Build the size-ladder probe + pure verdict engine; calibrate thresholds on real
  tokens; render the depth curve.
- **Day 3 (Jul 10):** Wrap as HTTPS endpoint; integrate `okx/payments` x402 `exact` (X Layer/USDT0);
  sandbox-test the 402 → pay → settle cycle end to end.
- **Day 4 (Jul 11):** Deploy to the **final** public HTTPS URL; smoke-test a real paid call; add cache;
  finalize input/output schema + the 402 challenge `outputSchema.input`.
- **Day 5 (Jul 12) — GO LIVE EARLY.** `pre-check → validate-listing → create → activate → submitApproval`.
  Submit for review now to absorb the unknown SLA. (Endpoint is immutable post-`create`.)
- **Day 6 (Jul 13):** Build the demo driver (Claude Code MCP) + live depth-curve console; script the
  ALLOW→BLOCK flip.
- **Day 7 (Jul 14):** Stretch — Liquidation Pre-Check endpoint #2 **only if review is clearing**; else
  harden the core (edge tokens, error paths, caveats copy).
- **Day 8 (Jul 15):** Record the 90s demo; run N real paid calls; capture the legible screenshot; draft the
  #OKXAI X post.
- **Day 9 (Jul 16) — BUFFER.** Absorb any review re-submission / fixes. Post to X (#OKXAI) + submit the
  Google form. Treat **Jul 17 as pure slack** against the 22:59 UTC cutoff.

---

## 12. Risks + open questions

**Carried-forward unknowns (from `OKXAI_STACK.md` — do not paper over):**
- **R1 — Review SLA unknown (open Q1).** `activate → submitApproval` turnaround and rubric are DATA NOT
  FOUND. *Mitigation:* submit by Day 5; keep the endpoint stable; treat as the top scheduling risk.
- **R2 — Server-side data access unknown (open Q2, adapted).** OKX documents `security tx-scan` and the
  DEX aggregator as **agent-side/CLI**; whether an *external* ASP endpoint may call the DEX aggregator
  quote API server-side with its own key is unconfirmed. *Mitigation / fallback:* if not callable
  server-side, fall back to direct `eth_call` pool-depth reads plus a public DEX aggregator quote API
  (OKX DEX public API or 1inch/0x) for the ladder. **De-risk on Day 1 — this is the single blocking
  unknown.**
- **R3 — X Layer trace/RPC support unknown (open Q4).** `debug_traceCall`/`trace_*` on public X Layer RPC
  is DATA NOT FOUND. *Low impact:* the Guard needs only `eth_call` (reads), not tracing — noted for
  completeness.

**Product risks:**
- **R4 — Aggregator data quality.** Routed on-chain venues only, no CEX depth, snapshot staleness,
  concentrated-liquidity discontinuities. *Mitigation:* ship these as explicit `data_caveats`; render the
  raw curve so numbers are auditable.
- **R5 — Threshold calibration.** BLOCK/WARN/OK cutoffs must survive a quant judge. *Mitigation:*
  calibrate on real tokens; put the raw curve on screen so the verdict is derived, not asserted.
- **R6 — Clone-ability.** The x402 meter is table stakes; the moat is the microstructure model +
  calibration + the "you become the exit liquidity" framing (no incumbent ships this as a gate). Ship the
  auditable-curve version so it never reads as a vibes multiplier.
- **R7 — Endpoint immutability.** Wrong URL on-chain is costly. *Mitigation:* finalize deploy before
  `create` (Day 4 before Day 5).
- **R8 — Thin analysis-chain depth.** If X Layer's own DEX depth is thin, analyze the token on a chain
  with real depth (settlement stays X Layer/USDT0 regardless). Choose the hero token accordingly on Day 1.

---

## 13. Success metrics (what "it worked" looks like)

- **Gate cleared:** ASP **live + approved on OKX.AI before Jul 17 22:59 UTC** (pass/fail eligibility).
- **Proven revenue:** ≥ **10 real paid calls** settled in USDT0 on X Layer during the demo (self-driven;
  each call a complete value story — not a vanity counter).
- **The legible screenshot:** real illiquid token, live `depth_curve`, `BLOCK` verdict with "82% of exit
  liquidity / 63% unwind slippage," USDT0 settlement visible on the same frame.
- **Continuity proof:** the demo shows a size flipping ALLOW→BLOCK as it scales.
- **Latency:** verdict returned in < ~2s per call (cache-warm).
- **Social:** one #OKXAI X post with the ≤90s demo, framed on "can you actually sell it?"
