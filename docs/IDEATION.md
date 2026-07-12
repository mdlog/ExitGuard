# Ideation — OKX.AI Genesis Hackathon · Theme A "The Seatbelt"

> Ideator: hackathon-ideator agent · Generated 2026-07-08
> Inputs read fully: `docs/HACKATHON_BRIEF.md`, `docs/USER_CONTEXT.md`, `docs/THEME_OPTIONS.md`
> **Locked lens:** *"The pick-and-shovel safety-and-execution layer every autonomous on-chain agent must call before it signs a transaction — a high-frequency A2MCP pay-per-call service, priced in USDT, whose value (a rug blocked, a sandwich dodged, dollars saved) is provable on every single call."*

All 15 ideas are instantiations of the Seatbelt. None *decides* a trade — each only *inspects/verifies/optimizes* what a doer-agent already intends. Deliberately varied across four axes: **wedge** (what it protects against), **buyer** (who is structurally forced to call), **revenue model** (pay-per-call / tiered / insurance / subscription / rev-share), and **mechanic depth** (read-only sim / heuristic+ML / on-chain attestation / "why" payload).

---

## Context (from the three docs)

- **Fixed shape:** ONE ASP, MCP-native, live+approved on OKX.AI, monetized via OKX Agentic Wallet in USDT/USDG. A2MCP pay-per-call is the target mode (high-frequency, screenshot-able revenue count).
- **Primary tracks:** Revenue Rocket $20k + Finance Copilot $7.5k. Secondary: Best Product $20k. Amplifier: Social Buzz $10k (CT distribution).
- **Hard gate:** must pass OKX internal review and go LIVE before Jul 17, 22:59 UTC. Reject = invalid. Solo. ~9 days minus review lead time.
- **Builder edge:** DeFi/trading/MEV/microstructure. Full-stack + web3. Sharpest ideas exploit "what a trading agent gets hurt by before it fires a tx."
- **Kill list (auto-reject):** generic AI trading bot, portfolio chatbot, AI influencer, sentiment scanner, anything an LLM offers in its first 3 bullets. Also: heavy bespoke audited Solidity.

---

## Market signal (Phase 1 research)

**Saturated / already-owned angles (avoid framing as these):**
- Static token safety scores + honeypot scanners: **GoPlus** dominates (detected 67,241 honeypots in Q4'24; powers DEXScreener, Sushi), plus TokenSniffer, ChainAware, AiCryptoScan, dozens of Telegram rug bots.
- Human-wallet pre-sign warnings: **Blockaid** (MetaMask, 17k+ wallets), **Blowfish**, Pocket Universe, Wallet Guard.
- Approval revocation for humans: **Revoke.cash**.
- Static contract risk scoring: **CertiK** — and CertiK is *already an OKX.AI launch partner* ("wallet/token security risk scoring"). Cloning CertiK statically = instant "we've seen this" from judges.

**Unsolved / whitespace (attack these):**
- **No agent-native, per-call, USDT-metered firewall exists.** Every incumbent is a wallet SDK or a browser popup for *humans*. An autonomous agent has no eyeball to read a warning modal — so the check must be a *callable, paid, machine-consumed verdict*. This is the core freshness of the whole theme.
- **Off-chain signatures are the blind spot.** Simulation engines simulate *transactions*; Permit2 `SignatureTransfer` / EIP-712 blind-signs aren't transactions, so they slip past pure sim. This is the #1 drainer vector of 2024–2026 (SlowMist, MetaMask, DEXTools all flag it). Agents blind-sign constantly.
- **Simulation is evadable** (Blockaid's own research: TOCTOU on Solana, sim-bypass tricks). An adversarially-hardened verdict is a real differentiator, not a checkbox.
- **Quant pre-checks (exit-liquidity, liquidation proximity, oracle thinness) are done by no one as a machine API** — they live in traders' heads and dashboards, never as an agent-callable gate.

**Winning shape (not idea — shape):** single-purpose, priced-per-call, one screenshot-able "value proven" moment, buyer that is *forced* to call, revenue that counts up live. Matches OKX's own blessed launch-partner shape (CertiK / CoinAnk / GenLayer = single-purpose priced services).

---

## The 15 ideas

> Legend — Shippability: **LOW** = read-only sim/heuristics + thin A2MCP wrapper (no custom Solidity). **MED** = some novel data plumbing or light on-chain attestation. **HIGH** = needs custom contracts or depends on other ASPs existing.

---

### 1. PreSign Firewall — *the agent's eyeball* ⭐ (flagship)
- **One-liner:** An agent POSTs its pending calldata (or off-chain signature request) and gets back a signed `ALLOW / WARN / BLOCK` verdict + machine-readable reason before it signs.
- **Wedge:** Catch-all pre-flight — drainer contracts, malicious approvals, catastrophic slippage, **and off-chain Permit2/EIP-712 blind-signs** (the gap pure sim misses). Adversarially hardened against known sim-bypass tricks.
- **Buyer + why forced:** *Every* doer-agent on OKX.AI, on *every* state-changing action. Structural force: an autonomous agent has no human to read a MetaMask warning — the firewall is its only line of defense. Fear of being drained = universal, every-tx demand.
- **USDT mechanic:** A2MCP pay-per-call. Tiered: `~$0.003` per fast heuristic verdict; `~$0.01` per full trace-simulation; `+$0.005` to emit an on-chain verdict attestation. High-frequency = biggest possible revenue count.
- **Proven-value screenshot:** Live counter — "🛡️ 4,812 txns checked · 137 drains BLOCKED · $61,400 saved this week" — plus a single blocked-drain trace card. Peak Revenue Rocket + CT bait.
- **Shippability:** **LOW risk.** eth_call/trace sim + heuristic library + thin pay-per-call wrapper. Hardest part: off-chain-signature decoding (Permit2 SignatureTransfer) and keeping a credible drainer-signature blacklist fresh. Lowest go-live risk of all 15.
- **Freshness:** Differentiator vs GoPlus/Blockaid/CertiK = agent-native + per-call USDT-metered + covers off-chain signatures + per-call attestation. Not their model; they're wallet SDKs for humans. **The buyer and the meter are the novelty.**
- **Biggest kill-risk:** Adjacency to CertiK (launch partner) — if demoed as "another token scanner" it reads as a clone. Must be shown as *dynamic, per-tx, agent-called, revenue-metered*, and must nail the off-chain-signature catch that incumbents don't.
- **Anti-slop verdict:** *Obvious-first-idea in category, but correctly sharpened it's the highest-floor winner.* Kept #1 on merit, not novelty.

---

### 2. Approval Sentinel — *hygiene + auto-fix*
- **One-liner:** Inspects any `approve` / `Permit2` grant and, if it's infinite or to a risky spender, returns the exact-amount **replacement calldata** the agent should sign instead.
- **Wedge:** Approval hygiene + infinite-allowance risk. Doesn't just warn — hands back a safer transaction.
- **Buyer + why forced:** Any agent interacting with a new router/protocol (first action is almost always an approval). Forced because a bad approval is the single most common drain root-cause; the agent can't safely proceed without clearing it.
- **USDT mechanic:** A2MCP `~$0.004` per approval inspected; `+$0.004` when it returns fix-calldata (pay-for-remediation, not just diagnosis).
- **Proven-value screenshot:** "Infinite approval to 0xBAD… downgraded to exact 250 USDC — replacement calldata returned" side-by-side.
- **Shippability:** **LOW risk.** Approval decoding + spender reputation lookup + calldata builder. Well-scoped.
- **Freshness:** Revoke.cash is human-facing and *post-hoc* (revoke after the fact); this is *pre-sign* and *machine-returns-the-fix*. Genuinely distinct because it outputs a corrected tx, not a warning.
- **Biggest kill-risk:** Narrow — an agent may only approve occasionally, so call frequency is lower than the flagship; risks looking like a feature of #1 rather than a product.

---

### 3. Permit Guard (BlindSign Decoder) — *the blind spot* 🔥
- **One-liner:** Specializes in off-chain signature requests — decodes EIP-712 / Permit2 `SignatureTransfer` / seaport-style blind-signs and returns "this signature can move X of your tokens to Y" before the agent signs.
- **Wedge:** Signature/permit phishing + blind signing — the #1 drainer vector of 2024–2026 that *transaction simulators structurally cannot catch* (it's not a tx).
- **Buyer + why forced:** Any agent that signs typed-data (nearly all — gasless swaps, orderbook DEXs, intents). Forced: this is the exact class of attack incumbents miss, and agents blind-sign constantly with no human to eyeball the spender/amount/deadline.
- **USDT mechanic:** A2MCP `~$0.004` per signature decoded + risk-scored.
- **Proven-value screenshot:** "You were about to sign a Permit2 transfer of your FULL USDC balance to 0xF00D… with a 10-year deadline. BLOCKED." Extremely legible, extremely viral on CT.
- **Shippability:** **LOW risk.** EIP-712 domain/type parsing + Permit2 ABI + spender reputation. Pure off-chain. Clean solo build.
- **Freshness:** Highest-differentiation *narrow* wedge on the board. Directly attacks the documented gap in GoPlus/Blockaid/Blowfish sim engines. Not LLM-obvious.
- **Biggest kill-risk:** Narrowness could read as "a check" not "a product" — mitigated by the fact that it's the *most dangerous* check. Best used either standalone (sharp) or as the flagship's headline differentiator (see #1). Strong candidate to *merge into #1's MVP*.

---

### 4. Sandwich Shield — *pre-trade MEV exposure*
- **One-liner:** Given a pending swap, returns sandwich/MEV exposure ($ at risk), a safe max-slippage, and a "route-private" recommendation — inspect-only, never executes.
- **Wedge:** Slippage / sandwich / MEV. Leans hardest on the builder's microstructure edge.
- **Buyer + why forced:** Any agent moving non-trivial size through a public mempool. Forced by greed/ROI — getting sandwiched is a direct measurable loss on every unprotected fill.
- **USDT mechanic:** A2MCP `~$0.01` per swap analyzed (deeper pool-math than a heuristic check justifies higher price).
- **Proven-value screenshot:** "$10,000 swap · sandwich exposure $86 · recommended slippage 0.4% · route private → exposure ~$0."
- **Shippability:** **MED risk.** Pool-depth + mempool exposure modeling is real work; must stay *inspect-only* (recommend, don't route) to avoid Theme-B build cost. Credible model in 9 days is tight.
- **Freshness:** Execution-quality-as-inspection for agents is fresh (CT chases traders, not seatbelts). Borrows Theme B's "dollars saved" virality without B's routing-integration burden.
- **Biggest kill-risk:** If the exposure model is shallow it reads as a hand-wavy number; needs a defensible calc to survive a grumpy judge. Also tempts scope-creep into full MEV routing (out of solo scope).

---

### 5. Honeypot Prover — *active sell simulation*
- **One-liner:** Actively *simulates the sell* through the real router to prove a token is sellable and returns the true effective sell tax — not a static score, a live proof.
- **Wedge:** Honeypot / hidden-tax / non-sellable token detection.
- **Buyer + why forced:** Any agent about to *buy* a low-cap/new token. Forced: buying an unsellable honeypot is a 100% loss; the agent cannot know without simulating a round-trip.
- **USDT mechanic:** A2MCP `~$0.008` per token round-trip simulated.
- **Proven-value screenshot:** "Buy simulated ✓ · Sell simulated ✗ (revert) → HONEYPOT · saved $2,000." Or "hidden 40% sell tax exposed."
- **Shippability:** **LOW–MED risk.** Fork-sim of buy+sell is standard (Tenderly/anvil). Reliability across chains/routers is the work.
- **Freshness:** GoPlus does static honeypot flags; the *active round-trip-simulation-as-a-paid-agent-call* framing is fresher, but the wedge itself is the most crowded on the board.
- **Biggest kill-risk:** Closest to GoPlus's core competency of any idea here → clone risk is real. Differentiation is thinner than #3/#7.

---

### 6. RugRadar — *pre-trade rug-pattern gate*
- **One-liner:** At the moment of trade, checks LP-lock status, mint authority, owner privileges, and holder concentration, returning a rug-pattern verdict.
- **Wedge:** Rug detection (owner-drainable contract patterns).
- **Buyer + why forced:** Agent about to buy/LP into a young token. Forced by fear of a mint-and-dump.
- **USDT mechanic:** A2MCP `~$0.005` per token scanned.
- **Proven-value screenshot:** "Mint authority still live · 78% held by deployer → RUG RISK HIGH · BLOCKED."
- **Shippability:** **LOW risk.** Standard on-chain reads.
- **Freshness:** **Weak.** This is essentially GoPlus's headline product with a per-call price on it. Included for completeness.
- **Biggest kill-risk:** **The purest clone on the list.** Judges have literally seen this exact 7-factor scorecard from GoPlus/TokenSniffer. Ranked low honestly. *Obvious-first-idea.*

---

### 7. Exit-Liquidity Guard — *position-sizing sanity* 🔥
- **One-liner:** Given token + intended size, returns realistic unwind slippage + time-to-exit across venues, and BLOCKs if the agent would *become the exit liquidity*.
- **Wedge:** Position sizing / exit-liquidity trap (you can buy it, but can you get out?).
- **Buyer + why forced:** Any allocator/position-taking agent before committing size. Forced: an agent can enter a position it mathematically cannot exit without catastrophic slippage — the one mistake that turns a "win" into a bag.
- **USDT mechanic:** A2MCP `~$0.02` per sizing query (deeper AMM/orderbook-depth math justifies higher price).
- **Proven-value screenshot:** "Buy $50k of $XYZ → unwind slippage 63% · time-to-exit ~9 days · you'd BE the exit liquidity → BLOCK."
- **Shippability:** **LOW–MED risk.** Read-only depth math across DEX pools + venues. Scope to 1–2 venues for MVP. Edge-heavy but bounded.
- **Freshness:** Very fresh as a *pre-trade gate* (Theme C's exit-liquidity metric, weaponized as a Seatbelt block). Nobody ships this as an agent-callable veto. Exploits the builder's edge maximally.
- **Biggest kill-risk:** Lower call-frequency than the flagship (agents size less often than they sign) → smaller Revenue Rocket count. Best as a premium high-value companion, not a volume play.

---

### 8. Liquidation Pre-Check — *don't open a position you'll get liquidated out of*
- **One-liner:** Before an agent opens/increases leverage or borrows, returns liquidation price, health-factor buffer, and cascade proximity for that market.
- **Wedge:** Liquidation-risk pre-check.
- **Buyer + why forced:** Any leverage/lending/perp agent before adjusting a position. Forced: getting liquidated is a direct, avoidable capital loss; the agent needs the number *before* it acts.
- **USDT mechanic:** A2MCP `~$0.02` per position pre-check.
- **Proven-value screenshot:** "Open 5x here → liq price 3% away · market is 1 cascade from -18% → BLOCK / downsize to 2x."
- **Shippability:** **MED risk.** Per-protocol liquidation math (Aave/Morpho/perp DEXs differ); scope to 1–2 protocols for MVP. Finance Copilot bullseye.
- **Freshness:** Fresh as an agent API — liquidation math lives in dashboards, not machine-callable gates. Strong Finance Copilot depth.
- **Biggest kill-risk:** Protocol-specific math is fiddly; narrow chain/protocol coverage in 9 days may look thin. Frequency moderate.

---

### 9. BridgeSafe — *pre-bridge integrity check*
- **One-liner:** Before a cross-chain bridge tx, verifies bridge-contract health, route legitimacy, destination-address sanity, and expected-receive vs quoted amount.
- **Wedge:** Bridge safety (fake bridges, drained/paused bridges, wrong-chain sends).
- **Buyer + why forced:** Any multi-chain agent bridging funds. Forced: bridge exploits/mis-sends are catastrophic and irreversible; agents bridge routinely across EVM+Solana.
- **USDT mechanic:** A2MCP `~$0.01` per bridge intent checked.
- **Proven-value screenshot:** "Bridge to 'Arbitrum' actually routes to unverified 0x… · expected receive 0 → BLOCK."
- **Shippability:** **MED risk.** Needs a curated map of legit bridge contracts/routes per chain + quote verification. Data-plumbing heavy.
- **Freshness:** Fresh wedge — bridge-safety-as-agent-call is uncrowded. Ties to OKX's multi-chain (EVM+Solana) story.
- **Biggest kill-risk:** Coverage-dependent (must know every legit bridge); a thin allowlist reads as incomplete. Frequency lower than swaps.

---

### 10. Address Poison Guard — *the cheapest, highest-frequency check* 🔥
- **One-liner:** Checks a transfer's destination against address-poisoning patterns (lookalike addresses in the agent's own history, zero-value dust traps, recently-seen decoys) and blocks copy-paste-to-attacker sends.
- **Wedge:** Address poisoning / wrong-recipient sends.
- **Buyer + why forced:** *Every* agent that sends funds to any address (universal). Forced: poisoning specifically targets automated/copy flows — exactly how agents pick addresses from history — and a poisoned send is unrecoverable.
- **USDT mechanic:** A2MCP `~$0.002` per destination checked. Cheapest unit → **highest possible call volume** → strong Revenue Rocket count.
- **Proven-value screenshot:** "Recipient 0xA1b2…9f is a poisoning lookalike of your real counterparty 0xA1b3…9f (differs 1 char, dusted you 2h ago) → BLOCK."
- **Shippability:** **LOW risk.** Address-history diff + dust-pattern heuristics. One of the simplest, cleanest solo builds. Very low go-live risk.
- **Freshness:** Distinct, under-served wedge; nobody sells it as a per-send agent call. Vivid, instantly-understood demo (the "one character different" moment is CT gold).
- **Biggest kill-risk:** Low price-per-call means revenue-per-call is tiny — needs volume narrative to land Revenue Rocket. Best paired with the flagship or pitched on volume.

---

### 11. Oracle Exposure Meter — *is this price manipulable?*
- **One-liner:** Before interacting with a protocol that prices off an oracle or a thin pool, flags oracle-manipulation exposure (TWAP thinness, single-source dependence, manipulable pool as price feed).
- **Wedge:** Oracle-manipulation exposure.
- **Buyer + why forced:** Agents lending into / LPing / borrowing against oracle-priced protocols. Forced: oracle manipulation is how many DeFi exploits drain a position the agent is inside.
- **USDT mechanic:** A2MCP `~$0.02` per protocol/pool exposure query.
- **Proven-value screenshot:** "This vault prices off a $40k TWAP pool · $12k flash-swap moves price 22% → manipulation exposure HIGH."
- **Shippability:** **MED–HIGH risk.** Genuinely hard: requires oracle-config discovery + manipulation-cost modeling per protocol. Edge-heavy but the deepest build here.
- **Freshness:** Very fresh, near-zero competition, maximal edge-flex.
- **Biggest kill-risk:** Hardest to ship credibly in 9 days solo; low call-frequency; hard to explain in a 90s demo. High-ceiling, high-risk.

---

### 12. Proposal Payload Auditor — *governance safety*
- **One-liner:** Before an agent votes on or executes a governance proposal, decodes the on-chain payload and flags malicious calls (treasury drain, upgrade-to-malicious-impl, hidden param change).
- **Wedge:** Governance / proposal-payload safety.
- **Buyer + why forced:** Any DAO-participating or treasury-managing agent. Forced: agents that auto-vote can be tricked into ratifying a treasury drain.
- **USDT mechanic:** A2MCP `~$0.03` per proposal decoded+audited (rare but high-value).
- **Proven-value screenshot:** "Proposal #42 'update rewards' actually transfers 100% of treasury to 0x… → MALICIOUS."
- **Shippability:** **MED risk.** Calldata decoding + intent-vs-payload diff. Doable but niche.
- **Freshness:** Distinct and clever (Creative Genius flavor), but very low frequency.
- **Biggest kill-risk:** Tiny buyer pool + low call volume on a days-old marketplace → weak Revenue Rocket story. Interesting, not winning.

---

### 13. NoLoss Seatbelt — *insurance-style pricing* (revenue-model variant)
- **One-liner:** The firewall, but free to check — you only pay a premium *when it blocks a real loss*, with an on-chain attestation of the averted amount.
- **Wedge:** Any (drainer/rug/sandwich) — the novelty is the *pricing*, not the check.
- **Buyer + why forced:** Cost-sensitive agents that won't pay per-call for mostly-clean traffic but happily pay when saved. Forced: "free unless it saves you" is irresistible to a rational agent.
- **USDT mechanic:** A2A escrow / conditional: `0` on ALLOW; `~0.5–1%` of averted loss (capped) on a proven BLOCK, released against the attestation.
- **Proven-value screenshot:** "Saved this agent $4,000 · fee $28 · net +$3,972" — the single most legible Revenue Rocket line possible.
- **Shippability:** **HIGH risk.** ⚠️ Needs conditional-settlement logic (proving the averted loss + releasing a contingent fee) — flirts with custom contract work the user must avoid. Attributing "loss averted" is disputable.
- **Freshness:** The pricing model is genuinely novel and CT-loves it. But mechanically fragile.
- **Biggest kill-risk:** Go-live gate risk (custom settlement) + provability of "averted loss" is contestable → judge skepticism. High reward, high risk.

---

### 14. SafeSign Oracle — *on-chain verdict attestation* (mechanic-depth variant) 🔥
- **One-liner:** Instead of a private answer, it signs an **on-chain attestation** (agent identity + verdict + reason-hash) that escrows and *other ASPs* can require as machine-verifiable proof-of-safety-check.
- **Wedge:** Any check, elevated to a *composable trust primitive* — the verdict becomes portable, stakeable reputation.
- **Buyer + why forced:** A2A — other ASPs and A2A-escrows that want to *require* callers to have passed a safety check before they'll transact. Forced by composability: "no SafeSign attestation, no deal."
- **USDT mechanic:** A2MCP `~$0.01` verdict + `$0.005` attestation write; upsell: other ASPs subscribe to *require* your attestation (recurring).
- **Proven-value screenshot:** "This tx carries a SafeSign ✓ attestation (on-chain, tx 0x…) — escrow released." Demonstrates OKX's own agent-to-agent thesis on-screen.
- **Shippability:** **MED risk.** Signed attestations via a standard (e.g., EAS-style) rather than bespoke Solidity keeps it thin, but it's more than pure read-only. Creative Genius flavor.
- **Freshness:** Most novel *infrastructure* angle — turns the seatbelt into a network primitive other ASPs plug into. Deeply on-brand for the marketplace.
- **Biggest kill-risk:** Requires *other* ASPs to adopt it to shine → cold-start; one abstraction removed from "I made money," harder 90s pitch. Best folded into #1 as a `+attestation` upsell rather than a standalone product.

---

### 15. SafetyMesh — *one call, all checks* (aggregator / rev-share variant)
- **One-liner:** A meta-Seatbelt: the agent makes ONE call; SafetyMesh fans out to the best specialist safety ASPs per wedge, merges verdicts, and returns a unified go/no-go — taking a rev-share.
- **Wedge:** All of them, orchestrated. Convenience + coverage.
- **Buyer + why forced:** Doer-agents that want a single dependable pre-sign gate instead of wiring 8 checks. Forced by simplicity + liability ("one seatbelt to call").
- **USDT mechanic:** A2MCP `~$0.015` per unified check; SafetyMesh pays the sub-ASPs and keeps a spread → it's simultaneously a *seller* and a marketplace *buyer* (demoes the whole A2A economy).
- **Proven-value screenshot:** "1 call → 6 safety ASPs queried in USDT → merged BLOCK · here are the receipts." Shows agents hiring-and-paying agents live.
- **Shippability:** **HIGH risk.** ⚠️ Depends on other quality safety ASPs existing on a days-old marketplace (they mostly don't yet). Orchestration is easy; the supply side isn't there.
- **Freshness:** Conceptually great, on-thesis (agents paying agents), Creative-Genius-shaped.
- **Biggest kill-risk:** **Cold-start dependency on other ASPs** = you can't reliably demo real sub-calls in 9 days. Would have to stub sub-providers, which undercuts the whole point.

---

## Anti-slop pass (hard critique of my own list)

| # | Idea | Differentiation | Freq | Ship risk | Verdict |
|---|------|-----------------|------|-----------|---------|
| 1 | PreSign Firewall | Med→**High** when sharpened w/ off-chain sig + attestation | **Very high** | LOW | **Obvious-first but correctly sharpened = highest floor. Winner.** |
| 3 | Permit Guard (BlindSign) | **High** — attacks the documented sim blind spot | High | LOW | Differentiated. Best merged into #1's MVP or run standalone. |
| 7 | Exit-Liquidity Guard | **High** — pure edge-flex, novel as a gate | Med | LOW–MED | Differentiated, premium companion. |
| 10 | Address Poison Guard | **High** — under-served, vivid demo | **Very high** (cheap) | LOW | Differentiated, best volume-pair. |
| 8 | Liquidation Pre-Check | High — Finance Copilot depth | Med | MED | Differentiated, protocol-scoped. |
| 4 | Sandwich Shield | Med–High — MEV edge, "dollars saved" | Med–High | MED | Good but model-credibility risk. |
| 2 | Approval Sentinel | Med — returns the fix, not just a warning | Med | LOW | Solid; risks being a feature of #1. |
| 5 | Honeypot Prover | Med — active sim vs static | High | LOW–MED | **Clone-adjacent to GoPlus.** |
| 9 | BridgeSafe | Med–High — uncrowded wedge | Low–Med | MED | Coverage-dependent. |
| 14 | SafeSign Oracle | **High** infra novelty | Med | MED | Great as #1 upsell; cold-start alone. |
| 12 | Proposal Auditor | High but niche | **Low** | MED | Clever, low-volume. |
| 11 | Oracle Exposure Meter | **Highest** edge, lowest competition | Low | MED–HIGH | High-ceiling, hardest to ship/demo. |
| 13 | NoLoss Seatbelt | High (pricing novelty) | — | **HIGH** (custom settlement) | Best CT line, most fragile mechanic. |
| 15 | SafetyMesh | High concept | High | **HIGH** (needs other ASPs) | Cold-start kills the demo. |
| 6 | RugRadar | **Low — purest clone** | High | LOW | Included for completeness; **ranked lowest.** |

**Obvious-first-ideas (honestly flagged):** #6 RugRadar (GoPlus clone), #5 Honeypot Prover (GoPlus-adjacent), and #1 *in its unsharpened form*. **The-least-LLM-obvious, most-edge-native:** #3, #7, #10, #11, #14.

---

## Ranked shortlist (top 5)

1. **PreSign Firewall** — the agent's eyeball: one call before signing returns ALLOW/WARN/BLOCK + reason, covering drainers, malicious approvals, catastrophic slippage, *and* off-chain Permit2/blind-signs. Every tx = one paid USDT call.
2. **Permit Guard (BlindSign Decoder)** — decodes the off-chain Permit2/EIP-712 signatures that transaction simulators structurally can't catch — the #1 drainer vector of 2024–26 — and blocks the "sign away your whole balance" trap.
3. **Exit-Liquidity Guard** — given token + size, proves whether the agent can actually get *out*, and blocks positions where it would *become the exit liquidity*. Pure microstructure edge, no incumbent sells it as a gate.
4. **Address Poison Guard** — the cheapest, highest-frequency seatbelt: checks every destination for poisoning lookalikes/dust traps and blocks the unrecoverable copy-paste-to-attacker send. Vivid one-character-different demo.
5. **Liquidation Pre-Check** — before opening/increasing leverage or borrowing, returns liquidation price, buffer, and cascade proximity so the agent never opens a position it'll be liquidated out of. Finance Copilot depth.

---

## 🏆 Top recommendation: #1 PreSign Firewall — *the agent's eyeball* (MVP = drainer + Permit2 blind-sign + slippage, with a per-call on-chain attestation)

**Pick this, and fold #3 (BlindSign) in as its headline differentiator and #14 (attestation) in as a paid upsell.** It is the only idea that maxes all four target tracks simultaneously under the one non-negotiable gate (live + solo + ~9 days + no custom Solidity). **Revenue Rocket:** it's the highest-frequency call possible — *every* state-changing action by *every* doer-agent is one metered USDT micro-payment — so the revenue counter ticks fastest and screenshots best ("4,812 checked · 137 drains BLOCKED · $61k saved"). **Finance Copilot:** it's a bullseye dynamic per-tx safety service, exactly the CertiK-shaped-but-live thing OKX already blessed. **Best Product:** it's the lowest go-live-risk build on the board — read-only sim + heuristic library + thin A2MCP wrapper, no bespoke audited contracts — which matters more than anything given the pass/fail eligibility gate. **Social Buzz:** "the seatbelt every OKX.AI agent must click before it signs, and here's its live drains-blocked counter" is native CT catnip and demoes OKX's own "agents that pay each other" thesis on screen. The clone-with-CertiK/GoPlus risk is real, and I'm not hiding it — but it's neutralized by three things incumbents structurally are *not* on this marketplace: (a) it's **agent-called and per-call USDT-metered** (a revenue meter, not a wallet SDK), (b) it **covers off-chain Permit2/blind-signs** that pure simulators miss (idea #3, the sharpest wedge on the list), and (c) it emits a **per-call on-chain attestation** (idea #14) so value is provable on *every* call — precisely what the brief rewards. Scope the MVP narrow-and-deep (drainer signatures + Permit2 SignatureTransfer decode + catastrophic-slippage check) so it's demoable and go-live-safe in the window, while the "firewall" framing keeps the every-tx revenue story. If time remains after go-live, the natural upsell to the same captive buyer is Theme B's "better fill" — but the seatbelt is the floor that wins.

**Next step:** run `/critique` for an independent adversarial review of #1 (probe the CertiK-clone framing and the off-chain-signature coverage claim), then `/prd`.
