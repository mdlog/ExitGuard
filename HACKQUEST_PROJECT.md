# HackQuest — Project Submission Content (ExitGuard)

Copy-paste per field. Fields marked **⛔ NEED** require an action/your input (noted inline).

---

## SCREEN 1 — Header + Overview

### Name (≤80)
```
ExitGuard
```

### Intro (≤200)
```
The pre-trade seatbelt for AI trading agents: one MCP call proves whether an agent can actually EXIT at size (BLOCK/WARN/OK + an auditable on-chain depth curve). Pay-per-call in USDT0 on X Layer via x402.
```

### Sector (pick ≤4) — select these:
- **DeFi**
- **Infra**
- **AI**

### Tech Tag (pick ≤8) — select the built-ins, then use **+ Add New** for the rest:
Built-in: **Next** · **Node** · **Web3**
Add New: `TypeScript` · `MCP` · `x402` · `OKX DEX API`

### MVP Link  ✅ LIVE
```
https://exitguard-web-production.up.railway.app
```
> Live web demo (landing + `/guard` terminal), deployed on Railway (always-on), serving REAL OKX-derived verdicts + live X Layer block via the ASP proxy. Optional: add a branded custom domain `app.mdloglabs.org` (same Cloudflare CNAME trick as the ASP).

### Project Link (GitHub)  ⛔ optional
```
<https://github.com/<you>/okx-exit-liquidity-guard — repo not pushed yet>
```
> Optional. Repo is local-only right now (secrets are gitignored, so safe to push). Push if you want judges to see the code.

### X (Twitter) Link  ⛔ NEED
```
x.com/<your handle>
```

---

## SCREEN 2 — Description / Progress / Fundraising / Deployment

### Description
```
ExitGuard — can your agent actually get OUT?

Autonomous trading agents check whether a token is safe to BUY — never whether they can SELL it back. Entry quotes always fill; the exit is where thin, one-sided liquidity turns a nominal win into a trapped bag. When an agent's own unwind is a large share of the sell-side book, the agent BECOMES the exit liquidity.

ExitGuard is a pre-trade exit-liquidity oracle exposed as an A2MCP service on OKX.AI. Before an agent sizes a position it calls one tool — exit_liquidity_check(token_address, chain, size_usd) — and gets back a BLOCK / WARN / OK verdict plus the realizable exit value, slippage-to-exit, % of the available sell-side book, a recommended clean-exit max size, and an auditable on-chain depth curve. It probes the OKX DEX aggregator's sell-side quote ladder (not a repriced buy quote) and reads pool reserves, so the verdict reflects the real book the agent would hit on the way out.

Priced per call at $0.02 in USDT0 on X Layer, settled via x402 — gasless for the caller (EIP-3009 + the OKX facilitator). Any MCP-native agent (memecoin-rotation bots, DeFAI copilots, treasury/allocator agents) can gate every trade on a real exit check.
```

### Progress During Hackathon
```
- Built the exit-liquidity engine: OKX DEX aggregator sell-side ladder (0.25x–2x size) + on-chain pool reserves -> BLOCK/WARN/OK verdict, depth curve, recommended clean-exit max size.
- Wrapped it as a real A2MCP /mcp server (exit_liquidity_check tool) with x402 pay-per-call: $0.02 USDT0 on X Layer mainnet (eip155:196).
- Deployed to Railway (always-on) behind https://exitguard.mdloglabs.org/mcp.
- Registered on OKX.AI as ASP Agent #5210 (Listing under review; AI quality pre-review: "suggested pass").
- Verified the full 402 -> sign -> settle loop end-to-end with real on-chain USDT0 settlements (gasless via facilitator); ledger records the real payer + tx hash.
- Built a Next.js demo terminal (/guard): live token check, size slider that flips OK->WARN->BLOCK, settlement receipt, and the depth-curve chart. Honest DEMO badging; live data proxied from the real ASP.
```

### Fundraising Status
```
Not fundraising — bootstrapped hackathon project. Built-in revenue model: pay-per-call at $0.02 USDT0 via x402 on X Layer, with real on-chain settlements demonstrated on mainnet.
```

### Active Hackathon
> Click **Explore Hackathon** and select the **OKX AI (Genesis) hackathon** you're entering on HackQuest.

### Deployment Details (confidential — judges only)
- **Ecosystem Deployed:** `X Layer`
- **Testnet / Mainnet:** **Mainnet**
- **Contract address & deployed link:**
```
A2MCP endpoint (live):        https://exitguard.mdloglabs.org/mcp
Health:                       https://exitguard.mdloglabs.org/health
OKX.AI ASP Agent ID:          5210  (ExitGuard, role ASP, X Layer eip155:196)
Network:                      X Layer mainnet (eip155:196)
Settlement asset (USDT0):     0x779Ded0c9e1022225f8E0630b35a9b54bE713736
Fee:                          $0.02 per call (x402, EIP-3009, gasless for caller)
PayTo / Agentic Wallet:       0x495ba98e146d9d8502cd6665640cceb16dffd380
On-chain proofs:
  - ASP registration tx:      0xb023397677801e3dc137a73e68d48f2ff5ab0da2590ab9674051737e0b8e3bfc
  - Example paid-call settle:  0xd7da590b7de2a515aeedc9d6719c47693ccee6c8548a359a496e2f1d5ed4edc8
Web demo (MVP):               https://exitguard-web-production.up.railway.app
```

---

## Action items to finish the Project
1. ✅ **Web app deployed** → MVP Link = `https://exitguard-web-production.up.railway.app` (live, real data).
2. **⛔ Your X handle** → X (Twitter) Link + the main form's "X Account Handle".
3. **⛔ Your Telegram handle** → main form's "Telegram Handle".
4. **⛔ #OKXAI X post** (≤90s video) → main form's "X Participation Post (Link)". This is the last blocker for the final Submit.
5. (optional) Push repo to GitHub → Project Link.
6. (optional) Branded web domain `app.mdloglabs.org` + set `NEXT_PUBLIC_SITE_URL` for social share previews.

## Then the main Submit form
- Select Project: **ExitGuard**
- Prize Tracks: **Finance Copilot + Software Utility + Revenue Rocket + Best Product** (Social Buzz optional)
- ASP Name: `ExitGuard` · Agent ID: `5210`
- ASP Description: (the ≤300 version — see chat)
- X handle / X post link / Telegram: from action items above
