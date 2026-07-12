# Theme Options — OKX.AI Genesis Hackathon

> Derived by: theme-strategist agent
> Sources: docs/HACKATHON_BRIEF.md + docs/USER_CONTEXT.md + market signals (WebSearch, mid-2026 CT scan)
> Generated: 2026-07-08

## Synthesis context

**Fixed product shape** (BRIEF §"What is an ASP"): ONE Agentic Service Provider, MCP-native, live on the OKX.AI marketplace, monetized via OKX Agentic Wallet in USDT/USDG — either **A2MCP pay-per-call** (high-frequency atomic micropayments) or **A2A escrow** (few large jobs). The "theme" is therefore *which on-chain-finance agentic service*, not a product from scratch.

**Prize targeting** (BRIEF §Prize structure + USER_CONTEXT): primary = **Revenue Rocket $20k** + **Finance Copilot $7.5k**; secondary = **Best Product $20k**; distribution amplifier = **Social Buzz $10k** via Crypto Twitter.

**Highest-leverage judging insight:** OKX's three $20k general awards reveal its values — product quality, creativity, and **demonstrable revenue**. The market punishes zero-usage vaporware and rewards *measurable on-chain revenue* (CT scan). Therefore the sharpest ASPs are **high-frequency A2MCP pay-per-call services with a visible, screenshot-able transaction/revenue count** — not A2A escrow one-offs.

**The load-bearing strategic bet:** This is an *agent-to-agent economy* launched days ago. Everyone entering will build a *doer* (a trading / DeFi / portfolio agent). The highest-demand, lowest-competition play is to **sell shovels to the gold rush** — the safety, execution-quality, and trust services that *every one of those doer-agents must call before it can safely act on-chain*. This exploits the builder's DeFi/MEV/microstructure edge directly (they know what a trading agent needs before it fires a transaction, and how it gets hurt).

**Hard gate to respect** (BRIEF §Red flags): ASP must pass OKX review and **actually go live** before Jul 17, 22:59 UTC. Reject = invalid. So shippability + read-only / thin-settlement architecture (no heavy custom Solidity) is a top constraint, per USER_CONTEXT.

**Kill-list** (USER_CONTEXT): generic AI trading bot, portfolio chatbot, AI influencer, sentiment scanner, anything an LLM suggests in its first 3 bullets. Every theme below is checked against this.

---

## Theme A — "The Seatbelt" (SAFEST — highest floor, CertiK-shaped)

**Statement:** A pre-flight transaction firewall that every autonomous agent calls *before it signs* — it simulates the pending on-chain action and returns a block/allow verdict + reason (rug/honeypot, malicious approval, drainer contract, catastrophic slippage, sandwich exposure).

**Why it fits brief + user edge:** Maps to a launch-partner shape OKX already blessed — CertiK ships "wallet/token security risk scoring" (BRIEF §Sponsor tech, launch partners). This is the *dynamic, per-transaction* version of that, which requires exactly the builder's DeFi/MEV lived experience to get right (knowing the failure modes: infinite approvals, honeypot sells, JIT-liquidity traps, sandwich windows). Read-only simulation (eth_call / trace / sim RPC) + off-chain heuristics = no bespoke Solidity → clears the go-live gate cleanly.

**Tracks targeted:** Finance Copilot (bullseye) + Best Product + Revenue Rocket (every tx = one paid call).

**A2A demand loop:** Every other trading/DeFi/allocator agent in the marketplace (and human wallets driving agents via Claude Code/Codex) → pays *your* ASP a few cents USDT **per transaction checked** (A2MCP pay-per-call) → in exchange for a go/no-go it can trust before signing. Buyer motivation: fear of being rugged. Demand is universal because *literally every doer-agent* needs it.

**This theme FORBIDS (anti-generic):**
- ❌ "AI that decides what to trade" (that's the kill-listed bot — this decides nothing, only *inspects*)
- ❌ Static one-time token-safety score (must be *per-transaction, real-time, pre-signing* to differentiate from CertiK)

**Sample ideas it would spawn** (preview only — full ideation in /ideate):
1. `eth_call` + trace-based "will this transaction drain my wallet?" verdict endpoint, priced per call.
2. Approval-hygiene guardian: flags infinite/malicious `approve` and suggests exact-amount replacement before signing.

**Biggest risk:** Adjacency to CertiK — must be sharply *dynamic per-tx*, not another static scanner, or judges see a clone.

**Solo-shippable in 9 days?** ✅ **Yes — strongest of the five.** Read-only sim + heuristic library + thin pay-per-call wrapper. Lowest go-live risk.

**Freshness check:** ✅ Fresh. CT is saturated with *traders*, not *seatbelts*. Not LLM-obvious (an LLM's first 3 bullets are trading bots, not per-tx firewalls). Off the kill-list entirely.

---

## Theme B — "The Better Fill" (JUDGING-MAX — Revenue Rocket engineered)

**Statement:** A best-execution + MEV-protection router that agents send their swaps/bridges through to get optimal split-routing and sandwich protection — priced per execution, with value expressed as *provable dollars saved on every fill*.

**Why it fits brief + user edge:** This is the single most *revenue-legible* ASP possible — its value is a dollar figure ("saved this agent $47 on a $10k swap"), which is the cleanest possible Revenue Rocket + Best Product narrative and the most viral CT screenshot ("agents earned $X this week using me"). It leans directly on the builder's MEV/microstructure edge — routing, private orderflow, timing — which most solo entrants cannot replicate.

**Tracks targeted:** Revenue Rocket (bullseye — highest, most legible revenue) + Best Product + Finance Copilot.

**A2A demand loop:** Any agent that needs to move size on-chain → routes the swap through *your* ASP → pays a small % or flat USDT fee **per execution** → gets a better fill + sandwich protection. Buyer motivation: greed/ROI (measurable). Highest willingness-to-pay because the fee is trivially justified by the savings.

**This theme FORBIDS (anti-generic):**
- ❌ Deciding *what* or *when* to trade (kill-listed bot — this only *executes better* what the caller already decided)
- ❌ "Trade signals" or alpha (that's a predictor, not an executor)

**Sample ideas it would spawn:**
1. "Protected swap" endpoint: agent submits intent, ASP returns/executes a split route with sandwich shielding, charges on realized savings.
2. Bridge-cost optimizer: cross-chain move routed for lowest total cost (gas+slippage+bridge fee), pay-per-route.

**Biggest risk:** Heavier build than A — needs real aggregator/routing integration and credible MEV protection, which is tight in 9 days solo; and a weak protection story reads as a thin wrapper.

**Solo-shippable in 9 days?** ⚠️ **Yes-but-tight.** Leverage existing aggregator APIs for routing; keep MEV protection to a demonstrable-but-scoped mechanism. Go-live risk is moderate.

**Freshness check:** ✅ Fresh as an *agent service*. Execution-quality-as-a-service for agents is not what CT is chasing (CT chases the traders themselves). Off kill-list.

---

## Theme C — "The Desk Analyst" (USER-EDGE — quant microstructure oracle)

**Statement:** A machine-callable market-structure oracle that answers the precise, non-obvious quantitative questions a position-taking agent needs before committing size — exit liquidity for a given size, liquidation-cascade proximity on a pool/perp, true borrow cost / funding carry of a leveraged position, real unwind slippage — returned as structured numbers, not prose.

**Why it fits brief + user edge:** This is the theme only a real trader could design. It's a "Finance Copilot for agents" that is emphatically *not a chatbot* — it returns structured, actionable quantitative facts an agent acts on programmatically. Every answer encodes microstructure expertise (order-book/AMM depth math, funding/basis, liquidation mechanics) that LLM-generic entrants can't fake.

**Tracks targeted:** Finance Copilot (deepest bullseye) + Best Product.

**A2A demand loop:** An allocator / position-taking / risk agent → pays *your* ASP per structured query in USDT (A2MCP) → before it sizes or exits a position. Buyer motivation: avoid taking a position it can't exit. Recurring because agents re-query as conditions move.

**This theme FORBIDS (anti-generic):**
- ❌ Sentiment / social scanning (kill-listed — this is pure on-chain microstructure math)
- ❌ Natural-language "portfolio advice" chat (kill-listed — output is structured numbers for machine consumption)
- ❌ Price prediction / alpha calls (this measures *structure*, never forecasts direction)

**Sample ideas it would spawn:**
1. "Exit-liquidity" endpoint: given token + position size, returns realistic slippage + time-to-unwind across venues.
2. "Liquidation-cascade proximity" score for a lending market or perp, updated per query.

**Biggest risk:** Two failure modes — (a) drifting toward the kill-listed "portfolio chatbot/sentiment" if outputs get chatty; (b) demand is real but *lower frequency* than A/B, so the Revenue Rocket count is smaller. Must be kept structured and per-query cheap to keep volume up.

**Solo-shippable in 9 days?** ✅ **Yes** for a focused 1–2 metric MVP (e.g., exit-liquidity + cascade proximity). Read-only data + math. Low go-live risk; scope creep is the enemy.

**Freshness check:** ⚠️ Borders saturated DeFAI-analytics turf — sharpened above by being *structured microstructure truth for agents*, not dashboards/sentiment for humans. Sharpened = fresh; un-sharpened = generic. Not LLM-first-3-bullets in this form.

---

## Theme D — "The Referee" (QUIET — the A2A trust/settlement layer)

**Statement:** A settlement-and-delivery verification oracle for the agent economy itself — it verifies whether a promised on-chain outcome actually happened so an A2A escrow can safely release, and it runs counterparty due-diligence before agent A hires or trades against agent B / a pool / a token.

**Why it fits brief + user edge:** The whole marketplace is building *doers*; almost nobody is building the *referees* that let doers transact with each other safely. Yet OKX itself flagged this need — GenLayer (dispute resolution) and CertiK (risk scoring) are launch partners (BRIEF §Sponsor tech). A2A escrow *structurally requires* a trusted "did-it-happen?" verifier; that's a wide-open, strategically central niche. The builder's on-chain edge (reading state, proving conditions) fits perfectly.

**Tracks targeted:** Creative Genius (novel infra angle) + Best Product + Software Utility (it's utility for the marketplace) + Finance Copilot (settlement is finance).

**A2A demand loop:** Two agents in an A2A escrow deal → the *paying* agent (or the escrow itself) calls *your* ASP to confirm delivery/condition → pays a verification fee in USDT → escrow releases or dispute is pre-empted. Also: any agent about to hire/trade-with another → pays for a counterparty risk read first. Buyer motivation: don't get stiffed / don't hire a bad actor.

**This theme FORBIDS (anti-generic):**
- ❌ Being a *doer* (this is deliberately a neutral third party — never trades, never provides the work being verified)
- ❌ Duplicating GenLayer's dispute *arbitration* (this does pre-settlement *verification*, upstream of disputes)

**Sample ideas it would spawn:**
1. "Proof-of-delivery" oracle: verifies the on-chain condition an escrow was contingent on, signs a release attestation.
2. Counterparty reputation+risk read for A2A hiring (on-chain history, rug-pattern flags) before a deal is struck.

**Biggest risk:** Educating the buyer — value is one abstraction removed from "I made money," so the CT/Revenue narrative is harder to convey in 90s; and the buyer pool (agents doing A2A escrow deals) is smaller/newer than the trading-agent pool on a days-old marketplace.

**Solo-shippable in 9 days?** ✅ **Yes** for a scoped verifier (pick one class of verifiable on-chain condition + one attestation format). Read-only + signed attestation, no heavy Solidity.

**Freshness check:** ✅ **Genuinely quiet.** CT is chasing traders, not referees. Highest whitespace of the five; lowest competition. Off kill-list entirely.

---

## Theme E — "The Public Fund" (WILDCARD — the agent economy as a spectacle)

**Statement:** A radically transparent, on-chain, agent-run capital pool that executes ONE legible rules-based strategy fully in public — every position and P&L streamed live to CT — and which is itself a flagship *customer* of the other ASPs (it pays the Seatbelt to check its txns, the Better Fill to execute, the Desk Analyst for sizing), demoing the entire A2A economy as a live spectacle.

**Why it fits brief + user edge:** This is the memorable, Social-Buzz-detonating swing. Its genius isn't a secret alpha model (that would be the kill-listed black-box bot) — it's **radical public verifiability** ("watch an agent trade in the open, every tx on-chain") *plus* being the marketplace's showcase buyer that visibly *hires and pays other agents in USDT*. It turns OKX's own thesis ("agents that hire and pay each other," BRIEF §Summary) into a watchable show. The builder's trading edge makes the public strategy credible.

**Tracks targeted:** Social Buzz (bullseye — built for virality) + Creative Genius + Revenue Rocket (visible flows).

**A2A demand loop (inverted — this one is the *buyer*):** Depositors/agents → fund the pool in USDT/USDG. The pool → *pays other ASPs* (Seatbelt, Better Fill, Desk Analyst, Referee) per action → and streams results publicly. It monetizes via a transparent performance/management mechanic. It demonstrates the demand loop by *being* the demand.

**This theme FORBIDS (anti-generic):**
- ❌ Black-box "AI predicts the market" (kill-listed — strategy must be rules-based and legible, novelty is transparency + A2A orchestration, not secret alpha)
- ❌ Hidden P&L / trust-me returns (the entire point is every position is public and on-chain-verifiable)

**Sample ideas it would spawn:**
1. A public delta-neutral / funding-carry vault where every leg + fee + P&L is posted on-chain and to X in real time.
2. "Agent-of-agents": an orchestrator fund whose whole pitch is the live receipt of USDT it pays to other ASPs each hour.

**Biggest risk:** Highest of the five. (a) Kill-list adjacency — must stay rules-based/transparent, not a predictor; (b) real capital + performance mechanics flirt with custom-contract work the user wants to avoid; (c) a losing week on public P&L is a public bad look; (d) go-live gate risk if it's too complex.

**Solo-shippable in 9 days?** ⚠️ **Riskiest.** Feasible only if the strategy is dead-simple and rules-based and it leans entirely on OKX primitives + other ASPs for the hard parts (no bespoke vault Solidity). High reward, high go-live risk.

**Freshness check:** ⚠️ "Agent that trades" is saturated CT (kill-list territory) — de-risked *only* by the radical-transparency + hires-other-agents framing, which is genuinely novel. Sharpened = viral; un-sharpened = a kill-listed bot. Handle with care.

---

## ✅ RECOMMENDATION: Theme A — "The Seatbelt" (with B's execution-quality ideas allowed under the same lens)

**Why this over the alternatives:** Theme A wins on the *product* of every constraint that matters here — demand density × revenue legibility × shippability × freshness × edge-fit — under the one non-negotiable gate (must go live, solo, in ~9 days, no heavy Solidity). Its buyer is *every other agent in the marketplace*, so demand doesn't depend on the young marketplace having many A2A-escrow deals yet (Theme D's weakness) or on a single strategy performing (Theme E's weakness). It's the highest-frequency pay-per-call service possible — every transaction is a paid call — which is exactly the visible, screenshot-able revenue Revenue Rocket rewards and CT amplifies. It's read-only + off-chain heuristics + thin settlement, so it clears the go-live gate with the most margin. And it exploits the builder's DeFi/MEV edge in a way generic entrants can't fake, while sitting completely off the kill-list.

**Closest second — Theme B ("The Better Fill").** B has a *higher revenue ceiling* and the more viral "dollars saved" demo, and it targets the same buyer, so its ideas belong under the same lens. It loses the top spot only on build risk: credible MEV protection and routing in 9 days solo is tight, and a weak version reads as a wrapper. **Therefore the recommended lens is A as the floor with B's execution-quality ideas explicitly in scope** — build the seatbelt, and if time allows, upsell the better fill to the same captive buyer.

**What I'd reconsider if priorities change:** If the user weights *Social Buzz / memorability* above revenue-floor and is willing to absorb go-live risk → pivot to **Theme E**. If the user wants the deepest *Finance Copilot* domain moat over raw call volume → **Theme C**. If the user wants the quietest whitespace and is patient with a harder-to-convey pitch → **Theme D**.

**North-star statement for /ideate:**
> *"The pick-and-shovel safety-and-execution layer every autonomous on-chain agent must call before it signs a transaction — a high-frequency A2MCP pay-per-call service, priced in USDT, whose value (a rug blocked, a sandwich dodged, dollars saved) is provable on every single call."*

Brainstorm 15 ideas through that lens: services a doer-agent pays for *per transaction* to act on-chain more safely and more cheaply — spanning pre-flight simulation, approval hygiene, drainer/honeypot detection, sandwich protection, best-execution routing, and slippage/exit-liquidity guarding — never *deciding* the trade, only making it safe and optimal.

**Next:**
- Accept → run `/ideate` (ideator reads THEME_OPTIONS.md, uses Theme A + north star).
- Pick different → run `/ideate "Theme B"` (or C/D/E, or paste a statement).
- Re-derive → run `/theme --redo` with what you'd want different.
