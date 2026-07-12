# PMF Analysis — Exit-Liquidity Guard

> Regenerated 2026-07-08 (prior copy destroyed by a concurrent process).
> Product locked in `PRD.md` (idea #7). Grounded in `OKXAI_STACK.md` — no invented APIs.
> Figures marked *(illustrative)* are not yet calibrated on live tokens; the demo renders the real curve.

---

## 1. The problem, sharply

**Buy-side depth always fills. Sell-side depth is what kills you.** A position-taking agent
can *buy* almost any size of an illiquid token — the router happily fills the entry. The trap is
the exit: the agent sizes into a token whose *sell-side* depth it does not own, then discovers at
unwind that its own sell order IS the market. Realizing the position eats catastrophic slippage or
takes days, and the loss is **irreversible** — you can't un-become the exit liquidity.

**It is a different risk class than everything the seatbelt theme has attacked.** Drainers,
malicious approvals, and phishing are *frequent* failures. Exit-liquidity failure is
**low-frequency but catastrophic**: an agent may size correctly 200 times and get trapped once, and
that once is a 60%+ realized loss on a full position. Low base rate is exactly why a machine skips
the check — until it's already the bag.

**Nothing computes it as a gate.** Agents size off price, TVL, or a static safety score. None
answer the only exit question: *"if I sell THIS size, what do I get back, and am I the market?"*
That is a microstructure question — it lives in a good trader's head, never as a machine-callable
verdict.

## 2. Segments + beachhead

- **Beachhead — memecoin / rotation agents.** They live in thin pools by definition, so
  *every* token they touch is a live exit-liquidity question. This is the strategic point:
  thin pools are an **endless supply of real, currently-illiquid tokens**, which means the demo
  BLOCK screenshot is a **standing on-chain condition, not a staged event** — pick any genuinely
  illiquid token and the "-63% unwind / you ARE the exit liquidity" verdict is true right now, at
  the block the judge watches. No attacker to schedule, nothing to fake.
- **Expansion #1 — DeFAI copilots** (agents sizing on a human's behalf). Same JTBD, higher notional,
  same data layer.
- **Expansion #2 — treasury / rebalancing agents.** Unwinding a large position or rotating a
  treasury is *the* exit-cost problem at size; the same microstructure engine prices it.

## 3. Why the agent economy makes this acute NOW

A human trader has a liquidity gut-check — they eyeball the order book and *feel* a bag before
sizing in. **Delegation deletes that instinct.** An autonomous agent has no eyeball and no gut; it
sizes off numbers. So the exit thinness has to be **told to the machine as a hard input**, or it is
structurally invisible to it. The agent economy didn't create exit-liquidity risk — it removed the
last human who used to catch it, and multiplied the number of unattended sizers. OKX.AI opened that
economy on **2026-06-30** (`OKXAI_STACK.md` §6): agents now hold wallets, take positions, and pay
per call — the first machine-consumed channel through which the verdict can even be delivered.

## 4. Whitespace vs. incumbents

**Everyone answers "is this transaction SAFE?" Nobody answers "is this position EXITABLE at my
size?"** These are orthogonal questions.

| Incumbent | Question it answers | What it does NOT compute |
|---|---|---|
| OKX native wallet firewall — `security tx-scan` / `sig-scan` (`OKXAI_STACK.md` §7) | is this tx/signature malicious? (blacklist, 7702, approvals, phishing) | realizable exit depth |
| CertiK (OKX launch partner, §6) | is this token/wallet reputationally risky? | your position's exit slippage |
| GoPlus / Blockaid / Blowfish | drainers, permits, honeypots, approvals, phishing | can you sell your size? |
| OKX DEX aggregator (500+ DEXs, §5) | what's the best *price/route* right now? | "you are X% of exit liquidity → BLOCK" |

Two distinctions a knowledgeable judge will test, and the answers:
- **A DEX aggregator gives a price, not a verdict.** The aggregator returns "best route for this
  fill." It does not walk a size ladder, integrate marginal impact into an Available-Exit-Liquidity
  number, or return `you_are_the_exit_liquidity: true`. The quote is a commodity input; **the
  microstructure model on top is the product.**
- **Slippage tolerance is not this.** A per-fill slippage cap aborts a *single* transaction after
  the fact; it is not a pre-trade gate on whether the *whole position* is unwindable at size. The
  Guard is the gate that runs before the position is ever opened.

**The moat is the model, not the quote.** Anyone can wrap an aggregator; the defensibility is the
size-ladder probe → AEL computation → calibrated BLOCK/WARN/OK thresholds → the "you become the
exit liquidity" framing, with the raw `depth_curve` on screen so it reads as derived math, not a
vibes multiplier.

## 5. Wedge → platform

Single exit-liquidity check is the wedge into a **microstructure risk oracle for agents**, each new
endpoint reusing the same depth/oracle data layer:

`exit_liquidity_check` → **liquidation pre-check** (liq price, health buffer, cascade proximity
before leverage) → **funding-carry** (is the perp carry real net of exit cost?) → **unwind-cost**
(what does closing this position actually cost across venues?).

Each is a question a delegated agent must answer and cannot eyeball. The category — *"the
pre-trade microstructure gate agents call before they size"* — is uncontested.

## 6. Revenue model + unit economics

- **Rail:** x402 `exact` scheme, one signature per call, **USDT0 on X Layer (`eip155:196`,
  `0x779Ded0c9e1022225f8E0630b35a9b54bE713736`)** — the only A2MCP settlement path the seller SDK
  supports (`OKXAI_STACK.md` §3), ~200ms finality, gasless via the OKX Broker/paymaster.
- **Price:** flat **~$0.02 USDT0 / call** *(illustrative)* — a premium vs. a heuristic check,
  justified by the deeper ladder/AEL math. In range with live ASPs (sub-$2 pay-per-call, §6).
  Stretch: `upto` metered by ladder depth / venues probed.
- **Honest caveat — do NOT pitch a live counter.** The marketplace is ~8 days old at submission
  with ~50 mostly-*seller* beta ASPs; there is no organic doer-agent volume in the judging window,
  so any call count is builder-driven and a tired judge discounts it to zero. The revenue story
  therefore leans on three things that ARE real: **(1) the monetization *design*** (clean `exact`
  USDT0 metering on X Layer), **(2) one real paid verdict settling on screen** (402 → sign →
  `PAYMENT-RESPONSE`), and **(3) the inevitability of demand** — every delegated sizer structurally
  needs this input. Value is complete in a *single* legible call, so volume is not load-bearing.

## 7. Why-now / land-grab

The marketplace is days old and the exit-liquidity niche is **empty** — CertiK owns security
scoring, the native firewall owns tx-safety, no one owns "exitable at my size." Being an **early
ASP in an open niche on a cold marketplace** means the category label, the reputation stars, and the
"exit-liquidity gate" association are all still unclaimed. First credible mover defines the category.

## 8. GTM for the hackathon (Social Buzz)

- **CT narrative:** *"Your trading agent doesn't know it's about to become the exit liquidity.
  You can buy it — can you sell it? This is the seatbelt."* On-chain-native, CT-legible, fresh
  (no crowded category to relegate it to).
- **The share asset:** a real illiquid token, live `depth_curve` from real aggregator quotes,
  verdict **"at this size you ARE ~80% of the exit liquidity → BLOCK"** *(illustrative %; the demo
  renders the real number)*, with a **USDT0 micropayment settling on the same frame** — agent
  paying agent on OKX's own rails. Then scale size down live → flips **WARN → OK**, proving a
  continuous model, not a lookup.

## 9. Risks to PMF

- **R1 — Clone-perception ("it's just an aggregator-quote wrapper").** *Mitigation:* ship the
  auditable `depth_curve` + AEL integral + the ALLOW→BLOCK continuity flip on screen so it reads as
  a microstructure model, never a repriced quote. The framing "you become the exit liquidity" is
  the product, not the quote.
- **R2 — Data quality (aggregator venue coverage).** Routed on-chain venues only; no CEX
  orderbook depth; point-in-time snapshots; concentrated-liquidity discontinuities. *Mitigation:*
  ship these as explicit `data_caveats`, render the raw curve so the number is verifiable not
  asserted, and pick a hero token on a chain with real aggregator depth (settlement stays X
  Layer/USDT0 regardless — analysis chain and settlement chain are independent).
- **R3 — Demand-timing (cold marketplace).** No organic volume in the window. *Mitigation:* the
  value is complete in one self-driven call; pitch design + one settled verdict + inevitability,
  never a counter (see §6).
- **R4 — Go-live eligibility gate.** The `submitApproval` review SLA/rubric is **DATA NOT FOUND**
  (`OKXAI_STACK.md` open Q1); a rejected/not-live ASP is an *invalid* submission. *Mitigation:*
  deploy the immutable endpoint before `create`, submit for review by Day 5, treat as the top
  scheduling risk.
- **R5 — Server-side data access (open Q2).** Whether an external ASP endpoint may call the OKX DEX
  aggregator server-side with its own key is unconfirmed. *Mitigation / fallback:* direct
  `eth_call` pool reads + a public quote API for the ladder. De-risk Day 1.

## 10. One-sentence PMF thesis

**Delegation removed the human who used to feel a bag before sizing into it, so every autonomous
position-taker now needs a machine-callable pre-trade gate that answers the one question no
incumbent computes — "can I exit this size, or do I become the exit liquidity?" — and Exit-Liquidity
Guard is the first credible ASP to sell that verdict, priced per call in USDT0 on X Layer.**

---

## Honest assessment

- **Strongest signal:** the value is a **standing on-chain condition** — pick any real illiquid
  token and the BLOCK is true right now, auditable live from the aggregator's own quotes. It needs
  no attacker, no marketplace volume, and no staging to be real.
- **Weakest assumption:** that the microstructure model reads as *math*, not a wrapper — if the AEL
  computation looks like a hand-wavy multiplier, a quant judge collapses it to "aggregator + a
  markup." The auditable curve on screen is the entire defense.
- **Pivot trigger:** if Day-1 de-risking shows the aggregator (and `eth_call` fallback) cannot
  produce a defensible size-ladder depth curve for real illiquid tokens, the microstructure claim
  is unbacked — pivot to Liquidation Pre-Check (shares the data layer, per-protocol math is more
  deterministic) as the hero endpoint.
