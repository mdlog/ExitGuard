# Hackathon Brief: OKX.AI Genesis Hackathon

> **Primary source (official):** https://www.hackquest.io/hackathons/OKXAI-Genesis-Hackathon — fetched 2026-07-08
> **Secondary sources (platform tech, clearly marked [SECONDARY] below):**
> - OKX.AI marketplace launch coverage — TechCrunch (2026-06-30): https://techcrunch.com/2026/06/30/crypto-exchange-okx-wants-ai-agents-to-hire-and-pay-each-other/
> - thirdweb developer breakdown: https://blog.thirdweb.com/ai-agent-marketplace-okx-lets-agents-hire-and-pay-each-other/
> - TradersUnion / Bitcoinworld / Bankless coverage of OKX AI marketplace
> - OKX Learn article (URL, not fetchable — cert expired): https://www.okx.com/en-us/learn/okx-ai
>
> **Source-of-truth status:** ⚠️ PARTIAL. Event facts (dates, prizes, categories, submission steps) are from the official HackQuest page. **Required-tech and platform-mechanics detail is inferred from SECONDARY press coverage** because okx.ai / okx.com returned HTTP 403 / expired-cert and could not be fetched directly. Confirm tech requirements against the live OKX.AI builder docs before committing architecture.

---

## Summary
- **Event:** OKX.AI Genesis Hackathon
- **Host platform:** HackQuest (platform provider only — see red flags)
- **Sponsor / organizer / judge:** OKX (via its OKX.AI product)
- **Format:** Online — global
- **Ecosystem:** "All" — explicitly open beyond crypto ("Both crypto and non-crypto services are welcome")
- **Core mission:** *"A Hackathon for Builders to Launch Agentic Service Providers (ASPs) on OKX.AI."*
- **Timezone:** UTC (all times below are UTC)
- **Location:** Fully remote / online

### Dates (UTC)
- **Registration opens:** July 2, 2026, 11:00 UTC
- **Hackathon / submission window:** through July 17, 2026
- **Submission deadline:** July 17, 2026 — ⚠️ **conflicting times on page:** the dates block shows **22:59 UTC**; the submission-step text and Google-form instruction say **"before Jul 17th, 23:59 UTC."** Treat 22:59 UTC as the hard cutoff to be safe.
- **Winners announced:** July 23, 2026, 23:00 UTC
- **Time budget (hands-on):** ~2 weeks calendar. **As of today (2026-07-08) roughly 9 days remain** to the July 17 deadline. Not a fixed 24/48/72h sprint — but note the ASP must additionally **pass OKX internal review and go live** before the deadline, so effective build time is shorter than 9 days.

---

## What is an ASP (the thing you must build)
> "OKX.AI is an agent-native platform where users can discover and use AI-powered services provided by Agent Service Providers (ASPs)." — HackQuest page

An **ASP = an AI-powered service** you build, list, and monetize on the OKX.AI marketplace. It must "solve a clear, real-world use case." Scope is broad: *"If your ASP can help people get work done, make decisions, save time, or turn a workflow into a monetizable service"* it qualifies. Crypto and non-crypto both welcome.

[SECONDARY] The OKX.AI marketplace launched to developers on 2026-06-30 after a closed beta with 50 early ASPs. It has a **two-sided structure**:
- **Agent Marketplace** — developers list agents, define services + pricing, earn automatically on completion.
- **Task Marketplace** — agents post work, find another agent, pay only on delivery.

---

## Tracks / Categories (THE most important section)

There are no separately-themed "tracks" in the traditional sense — the **prize categories ARE the tracks**. You build one ASP; it competes for the general awards and (if it fits a domain) a specialized award. Verbatim category descriptions from the HackQuest page:

| Category | Type | What it rewards (verbatim / paraphrase) | Prize | Winners |
|----------|------|------------------------------------------|-------|---------|
| **Best Product** | General | Overall best product — "Judged on internal review" | $20,000 | 3 (1st $10k / 2nd $6k / 3rd $4k) |
| **Creative Genius** | General | Most creative build — "Judged on internal review" | $20,000 | 3 (1st $10k / 2nd $6k / 3rd $4k) |
| **Revenue Rocket** | General | Revenue/monetization performance — "Judged on internal review" | $20,000 | 3 (1st $10k / 2nd $6k / 3rd $4k) |
| **Finance Copilot** | Specialized | "Top-performing ASP under **Finance** category" | $7,500 | 3 @ $2,500 USDT |
| **Software Utility** | Specialized | "Top-performing ASP under **Software Services** category" | $7,500 | 3 @ $2,500 USDT |
| **Lifestyle Companion** | Specialized | "Top-performing ASP under **Lifestyle** category" | $7,500 | 3 @ $2,500 USDT |
| **Artistic Excellence** | Specialized | "Top-performing ASP under **Art Creation** category" | $7,500 | 3 @ $2,500 USDT |
| **Social Buzz** | Special | "ASP with the strongest **social traction and community reach**" | $10,000 | 10 @ $1,000 USDT |

**Implied domain taxonomy** (from the specialized categories): Finance, Software Services, Lifestyle, Art Creation. Pick a domain that maps to one of these to be eligible for a specialized award on top of the general pool.

**DATA NOT FOUND:** No expanded prose description per general category beyond the labels ("Best Product", "Creative Genius", "Revenue Rocket") and the prize split. Interpret them at face value: build quality, creativity, and demonstrable revenue respectively.

---

## Sponsor tech / required stack

**Hard eligibility gate (from official page):**
> Step 2 — "Your ASP must pass OKX AI's internal review and go live to remain eligible." / "If the ASP listing is not approved or cannot go live, your hackathon submission will be deemed invalid."

So the mandatory "stack" is: **it must be listable and live on the OKX.AI marketplace.** The page itself does **not** enumerate specific SDKs/APIs. The following stack detail is **[SECONDARY]** (press coverage of the 2026-06-30 launch) — verify against live OKX.AI builder docs:

- **[SECONDARY] Onchain OS** — OKX's open toolkit for connecting AI agents to on-chain services. This is the primary developer entry point. "No OKX account is required."
- **[SECONDARY] OKX Agentic Wallet + Agent Identity** — every agent gets a dedicated on-chain wallet = its economic identity (holds funds, receives payment, signs txns). Reputation is logged on-chain and is portable.
- **[SECONDARY] Agent Payments Protocol** — underlying EIPs, reportedly supported by the Ethereum Foundation.
- **[SECONDARY] Two service modes — choose one when registering the ASP:**
  - **A2A (escrow-based)** — funds held in smart-contract escrow until buyer confirms delivery; for complex/multi-step work (audits, data pipelines).
  - **A2MCP (pay-per-call)** — instant atomic micropayments per API call; for standardized high-frequency services.
- **[SECONDARY] Settlement stablecoins:** **USDT** and **USDG** (Paxos Global Dollar). Prize payouts are also quoted in USDT.
- **[SECONDARY] Supported chains:** EVM chains + Solana (via Onchain OS).
- **[SECONDARY] MCP-compatible AI clients supported:** **Claude Code, OpenAI Codex, Hermes, OpenClaw** (the platform is MCP-native).
- **[SECONDARY] Dispute resolution:** GenLayer (on-chain, staked evaluator network — not a central platform).
- **[SECONDARY] Launch-partner ASPs (examples of what "good" looks like):** CertiK (wallet/token security risk scoring), CoinAnk (live market data, pay-per-query), GenLayer (dispute resolution).

**X Layer (OKX zkEVM L2):** ⚠️ **DATA NOT FOUND** — X Layer is NOT mentioned as required (or at all) in any fetched source for this hackathon. Onchain OS is described as multi-chain (EVM + Solana). Do not assume X Layer is mandatory; confirm which chain the Agentic Wallet settles on.

**Mandatory vs recommended summary:**
- **Mandatory:** ASP listed + approved + live on OKX.AI (this transitively requires Onchain OS / Agentic Wallet / a payment mode). Missing this = invalid submission.
- **Recommended / implied:** MCP-native design (works with Claude Code/Codex/etc.); priced service (pay-per-call or escrow); USDT/USDG monetization.

---

## Judging criteria

> **All categories are decided by "OKXAI Internal Review."** — HackQuest page

- **DATA NOT FOUND:** No numeric weights, no scorecard, no per-criterion rubric are published on the page. HackQuest is explicitly NOT the judge.
- **Inferable signal (from the category design, not stated as weights):** the three $20k general awards reveal what OKX values — **(1) product quality ("Best Product"), (2) creativity ("Creative Genius"), (3) monetization/traction ("Revenue Rocket")**. Social reach is separately incentivized ("Social Buzz"). Optimize the ASP to score on all three axes: a genuinely useful, novel service that visibly earns revenue and is buildable/live on OKX.AI.

---

## Deliverables (mandatory — the 4 submission steps, verbatim intent)

- [ ] **Step 1 — Build the ASP:** "Build an ASP that solves a clear, real-world use case. Both crypto and non-crypto services are welcome."
- [ ] **Step 2 — List it live:** Submit the ASP through OKX.AI; it "must pass OKX AI's internal review and go live to remain eligible." (Hard gate — see red flags.)
- [ ] **Step 3 — Social post:** "Post your ASP on X using **#OKXAI**." Introduce the ASP and explain its use case. **Demo content must be no longer than 90 seconds.**
- [ ] **Step 4 — Form:** Complete the official Google form **before Jul 17, 23:59 UTC** (dates block says 22:59 — use the earlier), including ASP details + the link to your X participation post.

**DATA NOT FOUND:** No explicit requirement for a public GitHub repo, pitch deck, or written long-form writeup was stated. The load-bearing deliverables are: a **live approved ASP on OKX.AI** + an **X post (#OKXAI, ≤90s demo)** + the **Google form**.

---

## Prize structure

- **Total pool: $100,000 USD**
- **General ($60,000):** Best Product $20k · Creative Genius $20k · Revenue Rocket $20k — each split 1st $10k / 2nd $6k / 3rd $4k.
- **Specialized ($30,000):** Finance Copilot / Software Utility / Lifestyle Companion / Artistic Excellence — each $7,500 = 3 winners @ $2,500 USDT.
- **Social ($10,000):** Social Buzz — 10 winners @ $1,000 USDT.
- **Non-cash:** [SECONDARY, from search snippet] winners reportedly also get **official OKX PR and partnership opportunities** + OKX.AI marketplace placement/exposure. Confirm on official page.
- Math check: 3×$20k + 4×$7.5k + $10k = $100k. ✓

---

## Eligibility

- **Open to all builders globally** ("open beyond crypto").
- **Crypto AND non-crypto services welcome.**
- **Team size:** **DATA NOT FOUND** — not stated. (Assume solo is allowed; team cap unknown.)
- **KYC:** **DATA NOT FOUND** — not stated on the hackathon page. NOTE: receiving USDT/USDG prize payouts and operating an on-chain Agentic Wallet may in practice trigger OKX identity/compliance steps; not confirmed by source.
- **Region restrictions:** **DATA NOT FOUND** — none stated on the page. Standard OKX jurisdictional exclusions may apply but are not documented here.

---

## Past-winner patterns

**DATA NOT FOUND.** This is the **"Genesis"** (inaugural) OKX.AI hackathon; the marketplace itself only launched 2026-06-30. No prior OKX.AI hackathon winners exist. The closest reference points are the **50 closed-beta ASPs** and named launch partners (CertiK = security scoring, CoinAnk = market data pay-per-query, GenLayer = dispute resolution) — all are **crypto-adjacent, single-purpose, priced services** with a clear buyer. Useful shape signal even though not "winners."

---

## Red flags / gotchas

- **Approval gate = pass/fail eligibility.** If OKX's internal review rejects your ASP or it can't go live, the submission is **invalid** — not just unscored. Budget time for review + go-live before Jul 17, not just for building.
- **HackQuest is not the judge.** *"HackQuest, as a hackathon platform provider, is not involved in the final judging and reward distribution."* All scoring is OKX-internal and criteria are undisclosed.
- **Prizes may shrink.** Page states prizes may change if submissions lack quality.
- **90-second demo cap.** X post demo content must be ≤90s.
- **Deadline ambiguity:** 22:59 vs 23:59 UTC on Jul 17. Aim for 22:59 UTC.
- **#OKXAI on X is mandatory** — the social post is a required deliverable, not optional marketing.
- **Tight window:** ~9 days left as of 2026-07-08, minus review/go-live lead time.
- **Tech detail is second-hand.** The exact required SDK/API surface is not on the hackathon page; it was reconstructed from launch press. Verify on OKX.AI builder docs before architecting.

---

## Gaps requiring user input / verification

1. **Team size limit** — not stated. (Proceeding on the solo-builder assumption.)
2. **Judging weights** — undisclosed; strategy inferred from category design.
3. **Whether a purely non-crypto ASP still must integrate the on-chain Agentic Wallet / payment protocol to list** — the page says non-crypto is welcome, but listing lives on an on-chain-payments platform. Likely yes (monetization runs through USDT/USDG rails), but not confirmed by an official fetch.
4. **Exact required Onchain OS / Agentic Wallet SDK surface** — verify on live OKX.AI docs (okx.ai/tutorial was 403 to this fetch).
5. **Whether one ASP can win multiple categories** or must be assigned to a single track at submission — not stated.

---

## Raw fetched excerpts (for ideator reference)

**[OFFICIAL — HackQuest]**
- "OKX.AI is an agent-native platform where users can discover and use AI-powered services provided by Agent Service Providers (ASPs)."
- "A Hackathon for Builders to Launch Agentic Service Providers (ASPs) on OKX.AI."
- Step 1: "Build an ASP that solves a clear, real-world use case. Both crypto and non-crypto services are welcome."
- Step 2: "Your ASP must pass OKX AI's internal review and go live to remain eligible." / "If the ASP listing is not approved or cannot go live, your hackathon submission will be deemed invalid."
- Step 3: "Post your ASP on X using #OKXAI." / "demo content should be no longer than 90 seconds."
- Step 4: "Submit the Google form before Jul 17th, 23:59 UTC" with "ASP details and link to X participation post."
- Categories: Best Product $20k / Creative Genius $20k / Revenue Rocket $20k (each 1st $10k, 2nd $6k, 3rd $4k); Finance Copilot / Software Utility / Lifestyle Companion / Artistic Excellence each $7,500 (3 × $2,500 USDT); Social Buzz $10,000 (10 × $1,000 USDT).
- "Top-performing ASP under Finance category" / "...under Software Services category" / "...under Lifestyle category" / "...under Art Creation category" / "ASP with the strongest social traction and community reach."
- "HackQuest, as a hackathon platform provider, is not involved in the final judging and reward distribution."
- Dates: Registration Open Jul 2 2026 11:00 UTC; Submission Deadline Jul 17 2026 22:59 UTC; Winners Announced Jul 23 2026 23:00 UTC.

**[SECONDARY — TechCrunch / thirdweb / TradersUnion, OKX.AI launch 2026-06-30]**
- "The marketplace launches through Onchain OS, OKX's toolkit for connecting AI agents to blockchain services." / "No OKX account is required, and the platform is compatible with AI coding tools including Claude Code, OpenAI Codex, Hermes, and OpenClaw."
- Two modes: A2A escrow ("Funds are held in smart contract escrow until the buyer confirms delivery") for complex work; A2MCP pay-per-call (instant atomic micropayments per API call) for standardized services.
- "Builders are paid in USDT or USDG stablecoins, and disputes are resolved by a staked network of evaluators, not a central platform." (GenLayer.)
- "Every agent on OKX AI operates under a single onchain identity, managed through the OKX Agentic Wallet." Reputation persists across A2A and A2MCP.
- Infra: Agentic Wallet, Agent Identity, Agent Payments Protocol (EIPs supported by the Ethereum Foundation); Onchain OS spans EVM chains + Solana.
- Launch-partner ASPs: CertiK (security risk scoring), CoinAnk (live market data pay-per-query), GenLayer (dispute resolution). Went live to developers after a closed beta with 50 early ASPs.
