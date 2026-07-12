# OKX.AI — Builder / ASP Integration Stack (verified reference)

> **Purpose:** the concrete, source-cited developer stack for shipping an **Agentic Service Provider (ASP)** live on the OKX.AI marketplace, for a solo builder integrating against real APIs.
> **Compiled:** 2026-07-08. **Deadline context:** OKX.AI Genesis Hackathon submission Jul 17 2026 (~9 days out); an ASP must additionally **pass OKX internal review + go live** to be eligible.

## Source-access note (read first)
This pass **did** reach primary/official sources (not just press), by routing around a network block:
- `www.okx.com/*` (OKX Learn) — **UNREACHABLE from this environment**: TLS is intercepted (cert altnames point to `internetsehatku.com`, an Indonesian ISP content filter). Cited below only where a secondary mirror confirms the same fact.
- `okx.ai/*` — returns **HTTP 403** to a direct machine fetch (Cloudflare bot-block), **but is readable via the `r.jina.ai` reader proxy** (used below for the live agent list + tutorial).
- `web3.okx.com/*` — **directly fetchable** (OnchainOS dev-docs + whitepaper PDF read successfully).
- **GitHub** — directly fetchable. The two OKX repos below are the load-bearing primary sources:
  - **`github.com/okx/onchainos-skills`** — the `onchainos` CLI + the agent-facing skill docs (wallet, payments, ERC-8004 identity, task marketplace). https://github.com/okx/onchainos-skills
  - **`github.com/okx/payments`** — the multi-language **seller** SDK (Go/Rust/TypeScript/Python/Java) for x402/MPP pay-per-call. https://github.com/okx/payments
- **Agent Payments Protocol Whitepaper v1.0 (Apr 2026)** — https://web3.okx.com/whitepaper/okx-app-whitepaper.pdf (fetched + text-extracted; primary).

Every technical claim below is labelled **FACT (url)**, **INFERENCE**, or **DATA NOT FOUND**. Command/package/address literals are quoted from the cited repo/doc.

---

## ✅ CONFIRMED LIVE — okx.ai/tutorial + Onchain OS dev-docs (real browser, 2026-07-08)

Read directly in the user's Chrome (routes around the 403/TLS blocks). These are the **current, authoritative**
builder instructions and **supersede any second-hand claim below where they conflict.**

**Sources (browser-verified):**
- Role hub — https://www.okx.ai/tutorial (three roles: Users · ASP · Evaluator)
- ASP build tutorial — https://www.okx.ai/tutorial/asp
- A2MCP dev guide — https://web3.okx.com/onchainos/dev-docs/okxai/howtomcp
- ASP registration — https://web3.okx.com/onchainos/dev-docs/okxai/registerasp
- Payment SDK (NOT yet read) — https://web3.okx.com/onchainos/dev-docs/payments/overview
- Also in the docs tree: `/okxai/what-is-okxai`, `/okxai/roles-and-responsibilities`, `/okxai/user`, `/okxai/asp`, `/okxai/how-to-become-a2a`, `/okxai/okxai-evaluator`

**Marketplace model (FACT):** 3 roles. **Users** publish tasks (auto-match / direct / public Task Hall) → fund an
escrow contract. **ASP** provides skills for fees, registered as **A2A** or **A2MCP**. **Evaluators** arbitrate
disputes — stake **≥100 OKB**, ≥5 per case, majority decides, wrong/timeout = slashed, winners split 5% of bounty.

**ExitGuard = A2MCP** (Agent-to-MCP). The dev-doc "good fit" test literally describes ExitGuard: *"Verifiable,
low-risk results → deterministic return values → read-only lookups are the easiest to start with"* and *"Recurring
value, billable → charge per call → Data APIs / vertical search."* A2MCP = **fixed price per call, settled instantly
via the OKX Payment SDK, fully automatic** (vs. A2A = negotiated, escrow on X Layer, released on approval).

**A2MCP go-live flow (FACT — conversational, driven through the Onchain OS agent skill):**
1. Install an agent host: **OpenClaw / Hermes / Claude Code / Codex**.
2. Install Onchain OS: `npx skills add okx/onchainos-skills --yes -g` → then **open a new session**.
3. Log in Agentic Wallet (email): prompt `Log in to Agentic Wallet on Onchain OS with my email`.
4. Build the MCP service (dev-doc 6 steps): (a) have a callable **API** — ExitGuard already has `/api/exit-liquidity-check`;
   (b) **wrap the API as an MCP** with **FastMCP** (each capability → a tool); (c) get a **public HTTPS server + domain**;
   (d) deploy with an HTTPS cert → public address; (e) **test with MCP Inspector**; (f) register.
5. Register A2MCP: prompt `Help me register an A2MCP ASP on OKX.AI using Onchain OS` (uses **OKX Agent Identity from
   Onchain OS**). Provide exactly: **name · description · price-per-call · endpoint (public MCP address)**.
   **⚠ The endpoint MUST support the x402 payment standard** — implemented via the OKX Payment SDK.
6. List: prompt `Help me list my ASP on OKX.AI using Onchain OS`. Usable via its **Agent ID even before approval**.
7. Operate: **fully automatic** — every agent call → billing settled instantly via OKX Payment SDK on X Layer. No manual step.

**⚠️ Review SLA — the two live sources CONFLICT (resolves open Q1, but flag it):**
- `okx.ai/tutorial/asp`: "We review each submission **within 24 hours**."
- dev-doc `registerasp`: "review is completed **within 2 business days**."
- → **Plan for 2 business days.** Result is sent to the Agentic-Wallet email + the agent conversation window.
  **Submit for review EARLY (~Jul 13–14)** so a rejection + re-review still fits before the Jul 17 deadline.

**Corrections / confirmations vs. the reconstructed stack below:**
- ✅ x402 confirmed as the required A2MCP endpoint standard; per-call settlement via **OKX Payment SDK**.
- ✅ X Layer confirmed as the settlement/escrow chain.
- ➕ Registration is **conversational** through the Onchain OS agent, **not** a raw CLI form.
- ➕ Evaluator/arbitration layer stakes **OKB**; arbitration is **A2A-only** — A2MCP per-call has no delivery dispute (good for ExitGuard).
- ⬜ Still to read: `payments/overview` — the actual OKX Payment SDK / x402 package + wrapper to bolt onto `/api/exit-liquidity-check`.

**Implication for ExitGuard:** near-perfect A2MCP fit. Real go-live = wrap the existing `/api/exit-liquidity-check`
as an MCP tool (`exit_liquidity_check`) → add the OKX Payment SDK x402 wrapper → deploy on a public HTTPS domain →
test via MCP Inspector → register (name/description/price `$0.02`/endpoint) + list via the Onchain OS agent prompts.

---

## 1. How an ASP is built + listed + goes live

### The go-live path is a CLI + AI-agent flow, gated by an on-chain listing + an OKX approval step
There is **no traditional web form/dashboard** for building the service; the primary builder surface is the **`onchainos` CLI driven through an MCP-capable AI agent** (Claude Code, Cursor, Codex, etc.). A web presence exists at `okx.ai` (marketing/discovery) and a **Dev Portal** at `web3.okx.com/onchainos/dev-portal` (API-key issuance only, described as "read-only").

**FACT — the concrete registration → go-live flow** (from the `okx-ai` skill's register playbook, https://github.com/okx/onchainos-skills/blob/main/skills/okx-ai/references/identity-register.md and manage flow https://github.com/okx/onchainos-skills/blob/main/skills/okx-ai/references/identity-manage.md):

1. **Install skills**: `npx skills add okx/onchainos-skills` (README: https://github.com/okx/onchainos-skills#installation).
2. **Create/authenticate an Agentic Wallet** (see §4): `onchainos wallet login <email>` → `onchainos wallet verify <code>` (email OTP → TEE wallet), *or* API-key login with `OKX_API_KEY/OKX_SECRET_KEY/OKX_PASSPHRASE`.
3. **Register an ASP identity (ERC-8004)** — role gate first: `onchainos agent pre-check --role asp` (runs a one-time consent gate + a **one-ASP-per-address uniqueness** check). Then collect:
   - **Identity**: Name (brand, EN 3–25 chars), one-sentence Description (≤500 chars), **Avatar image (required for ASP)**.
   - **One or more Services**, each: Service name (5–30-char noun phrase), a **2-part Description** (① core capability + who it's for; ② what the caller must provide), **Type** = `A2MCP` ("API service", pay-per-call) **or** `A2A` ("agent to agent", negotiated/escrow), **Fee** (a plain number string, e.g. `"10"`; **currency is always USDT** at registration), and — **for A2MCP only** — a public **Endpoint** URL.
   - **Endpoint constraints (FACT)**: must be `https://`, publicly reachable, really deployed, ≤512 chars; `http://`/`localhost`/private-IP/mock URLs are rejected; **the endpoint is written permanently on-chain** (changing it later requires an update tx). Source: identity-register.md §6.
4. **QA gate**: `onchainos agent validate-listing --role asp --name … --service '[…]'` returns `{pass, findings[]}` (blocks on bad names/descriptions).
5. **Create on-chain**: `onchainos agent create --role asp --name … --picture … --service '[…]'` → returns `newAgentId`. All services ship in this one call.
6. **Publish / submit for review + go live**: `onchainos agent activate --agent-id <N> --preferred-language <BCP-47>`. Response cases (identity-manage.md):
   - `activate + submitApproval` → **"Submitted for review"** (the OKX internal-review gate),
   - `activate.approvalStatus: 2` → **"Already under review"**,
   - `activate.success: true` → **published/live**.
   Deactivate with `onchainos agent deactivate --agent-id <N>` ("hidden from client lists").

**This directly maps the hackathon's hard gate.** The HackQuest rule "your ASP must pass OKX AI's internal review and go live" == the `activate → submitApproval / approvalStatus:2 (under review) → live` transition. There **is** a submission + internal-review flow; "go live" concretely requires: a funded/authenticated Agentic Wallet, a registered ERC-8004 ASP identity **with at least one service**, a **deployed public https endpoint** (for A2MCP), passing `validate-listing`, and passing OKX's post-`activate` approval.

**FACT — an ASP can hold multiple services; discovery is on-chain** via `onchainos agent search --query "…"`, `onchainos agent service-list --agent-id <N>`, and (buyer side) `onchainos agent asp-match`. Source: https://github.com/okx/onchainos-skills/blob/main/skills/okx-ai/references/identity-discover.md and the CLI reference https://github.com/okx/onchainos-skills/blob/main/skills/okx-ai/references/task-cli-reference.md.

**FACT — tutorial framing** (okx.ai/tutorial, read via `r.jina.ai`): "REGISTER AS AGENT-TO-MCP OR AGENT-TO-AGENT"; A2MCP = "standardized MCP/API services … pay-per-call with no negotiation … **Requires OKX Payment SDK integration before going live**"; A2A = "agents negotiate price, scope, delivery terms … payment runs through escrow; the provider is paid only after the user signs off." Source: https://www.okx.ai/tutorial (proxy).

**DATA NOT FOUND**: the exact human-review SLA/turnaround time, the review rubric/criteria, and whether review is automated vs. manual. Budget lead time — do not leave `activate` to the final day.

**INFERENCE**: because listing is on-chain and the endpoint is immutable-on-chain, you should deploy and smoke-test the real endpoint **before** `create`, and register only when the endpoint is final.

---

## 2. MCP integration (the marketplace is "MCP-native")

### Two distinct MCP surfaces — don't conflate them
**(a) The `onchainos` CLI is itself an MCP server (client-side consumption).**
**FACT**: "The `onchainos` CLI doubles as a native MCP server exposing tools to any MCP-compatible client." Install into a client with `claude mcp add --scope user onchainos-cli onchainos mcp`; or plugin-style `/plugin marketplace add okx/onchainos-skills` + `/plugin install onchainos-skills`. `npx skills add okx/onchainos-skills` "works with Claude Code, Cursor, Codex CLI, and OpenCode"; per-client `INSTALL.md` files exist for OpenClaw/Codex/OpenCode. MCP server impl = Rust `rmcp v1.1.1` at `cli/src/mcp/mod.rs`. Sources: README "MCP Server" section https://github.com/okx/onchainos-skills#mcp-server, AGENTS.md https://github.com/okx/onchainos-skills/blob/main/AGENTS.md.

**(b) A paid MCP *tool* is how an A2MCP ASP exposes itself (server-side / the thing you build).**
**FACT — there is a first-class "paid MCP tool" wrapper** in the seller SDK: `github.com/okx/payments/go/x402/mcp`. You wrap a normal MCP tool handler so calling it triggers an x402 402/pay/settle cycle:
```go
resourceServer := x402.Newx402ResourceServer(...)
resourceServer.Register("eip155:196", evmServerScheme)
accepts, _ := resourceServer.BuildPaymentRequirementsFromConfig(ctx, config)
wrapper := mcp.NewPaymentWrapper(resourceServer, mcp.PaymentWrapperConfig{
    Accepts:  accepts,
    Resource: &mcp.ResourceInfo{URL: "mcp://tool/get_weather", Description: "Get weather"},
})
mcpServer.AddTool(&mcpsdk.Tool{Name: "get_weather", ...}, wrapper.Wrap(handler))
```
It uses the official `github.com/modelcontextprotocol/go-sdk`. Payment metadata rides in MCP `_meta`: **`MCP_PAYMENT_META_KEY = "x402/payment"`**, **`MCP_PAYMENT_RESPONSE_META_KEY = "x402/payment-response"`**, and **`MCP_PAYMENT_REQUIRED_CODE`** = JSON-RPC 402. Server hooks: `OnBeforeExecution / OnAfterExecution / OnAfterSettlement`. Source: https://github.com/okx/payments/blob/master/go/x402/mcp/README.md.

**Registration schema / manifest / tool-definition format**:
- The **marketplace listing schema** (what a caller's agent sees) = the ERC-8004 **service record**: `{Name, Type (A2MCP|A2A), Fee (USDT), Endpoint, Description}` per service, rendered by `agent service-list` (columns `# | Name | Type | Fee | Endpoint | Description`). Source: identity-discover.md `service-list`.
- The **payment/tool advertisement** = the HTTP **402 challenge** your endpoint returns (see §3), whose body can carry a Bazaar-style `outputSchema.input` (a JSON-Schema describing the tool's params: `input.type "http"|"mcp"`, `input.method`, `input.queryParams/body/pathParams/headers`). Source: https://github.com/okx/onchainos-skills/blob/main/skills/okx-agent-payments-protocol/SKILL.md (Step A3-Params, "Bazaar `outputSchema.input`").

**FACT — MCP-compatible clients** named by OKX: Claude Code, OpenAI Codex, Hermes, OpenClaw (also Cursor, OpenCode). Sources: OnchainOS docs https://web3.okx.com/onchainos ("Connect via MCP … zero coding required"), README install matrix, TechCrunch launch coverage https://techcrunch.com/2026/06/30/crypto-exchange-okx-wants-ai-agents-to-hire-and-pay-each-other/.

**INFERENCE**: for an A2MCP ASP you have two viable shapes — (i) a **plain priced HTTP endpoint** (register that URL as the service Endpoint; buyers hit it and the x402 middleware settles), or (ii) a **paid MCP server** using the `x402/mcp` wrapper. The marketplace listing only stores an **HTTP** endpoint URL, so shape (i) is the lowest-friction path to "live"; shape (ii) is the "MCP-native" showcase.

---

## 3. Payment rails — A2A escrow vs A2MCP pay-per-call

### The protocol: "Agent Payments Protocol" = MPP-EVM wire format + 4 intents + a Broker
**FACT (whitepaper v1.0)**: `Agent Payments Protocol = MPP EVM + four intent envelopes + Broker orchestration + cross-IM/HTTP transport`. Wire unit = a **challenge** (seller's payment request via Broker: amount/token/recipient/intent) + a **credential** (buyer's signed authorization; `payload.authorization.from` recovered by ECDSA is the source of truth). The **Broker** is an off-chain orchestration role that mints `paymentId`, verifies the credential, and broadcasts settlement (can sponsor gas). Source: https://web3.okx.com/whitepaper/okx-app-whitepaper.pdf.

**FACT — the four intents** (whitepaper §6):
| Intent | Shape | Settlement timing | Custody |
|---|---|---|---|
| `charge` | one-shot transfer, known price | instant | none (direct EIP-3009 to token) |
| `escrow` | task custody w/ dispute window | on accept / dispute / timeout | audited on-chain custody contract (buyer funds at order creation) |
| `session` | streaming payment channel, deposit + cumulative off-chain vouchers | single settle at channel close | escrow contract holds deposit |
| `upto` | pre-authorised metered cap; buyer signs cap, seller signs usage; settle `min(cap, usage)` | after usage report | none (payment-bound cap) |
Plus **`subscription`/`period`** (recurring) and **`splits`** (bps-native multi-recipient revenue share) as first-class settlement features.

### A2MCP = pay-per-call (this is what a "priced API/MCP service" uses)
**FACT — mechanics** (whitepaper §5.2 + payments SKILL): buyer hits the priced endpoint → server returns **HTTP `402`** with an x402-style challenge (`PAYMENT-REQUIRED` header v2 / `x402Version` body v1, or `WWW-Authenticate: Payment` for charge/session) → buyer's wallet signs → retries with `PAYMENT-SIGNATURE` / `X-PAYMENT` header → server verifies → runs handler → **settles** → `HTTP 200` + `PAYMENT-RESPONSE` header. Sources: SKILL.md (Path A) https://github.com/okx/onchainos-skills/blob/main/skills/okx-agent-payments-protocol/SKILL.md; seller flow https://github.com/okx/payments/blob/master/go/x402/SELLER.md.

**FACT — what triggers payment + granularity, per scheme** (seller SDK: https://github.com/okx/payments/blob/master/typescript/SELLER.md):
- **`exact`** — fixed price **per HTTP request**, gasless EIP-3009 (`transferWithAuthorization`). One signature per call.
- **`upto`** (metered) — buyer signs an **upper cap** (Permit2); your handler sets the actual charge per request via `setSettlementOverrides(res, { amount })` where `0 ≤ actual ≤ cap` (formats: raw units / `"50%"` / `"$0.034"` / `"0"` = no on-chain tx). This is the real "per-token / per-byte / per-row" billing primitive.
- **`deferred` / `aggr_deferred`** — many high-frequency low-value calls **batched** into fewer on-chain settles; async (`status="pending"`). Uses a session-key delegation.
- **`session`** (MPP channel) — open deposit → **one off-chain voucher per call** (signature-only, cumulative amount) → settle highest voucher on close. Metering is arbitrarily fine-grained at ~zero cost during the stream. Anti-griefing `minVoucherDelta`.
- **`charge`** (MPP) + **`splits`** — one-shot with optional multi-recipient revenue split (`splits.length ≤ 10`, `sum(splits) < amount`).
Settlement mode is `syncSettle: true` (wait for on-chain confirm before delivering — for high-value) or `false` (return immediately, settle in background — for high-throughput).

### A2A = escrow (negotiated jobs, provider paid after sign-off)
**FACT — the escrow task lifecycle** (CLI reference + state machine): buyer publishes a task (`agent create-task --payment-mode escrow`), ASP is designated → ASP `apply` (system-event-triggered) → buyer `confirm-accept` (**funds escrowed**) → ASP `deliver` → buyer `complete` (**funds released**) or `reject` → optional `dispute`. Task statuses (11): `-1 init / 0 created / 1 accepted / 2 submitted / 3 rejected / 4 disputed / 5 admin_stopped / 6 completed / 7 close / 8 expired / 9 failed(refunded)`. All ASP on-chain actions are **gas-free via the platform paymaster** (the ASP's wallet needs no native token). Sources: https://github.com/okx/onchainos-skills/blob/main/skills/okx-ai/references/task-cli-reference.md, task-state-machine.md, task-asp.md.

**A2A x402 variant**: a designated A2MCP service inside the task flow uses `agent set-payment-mode <jobId> --payment-mode x402` → `agent task-402-pay …` → `agent direct-accept` (buyer pays per-call against the endpoint). Source: task-cli-reference.md.

### Dispute resolution = staked evaluator network (GenLayer-style, staked in OKB)
**FACT**: disputes go to an **Evaluator** role that must **stake OKB** (`agent stake --amount <OKB>`), with commit/reveal voting (`vote-commit` / `vote-reveal`), minority/timeout slashing, and an arbitration fee. Config fields: `minCumulativeStakeOkb`, `slashMinorityBps`, `slashTimeoutBps`, `arbitrationFeeBps`, `commitPhaseHours`, `revealPhaseHours`, `unstakeCooldownDays`. Source: task-cli-reference.md "Evaluator Agent" + https://github.com/okx/onchainos-skills/blob/main/skills/okx-ai/references/task-evaluator-staking.md. (Press attributes dispute infra to launch partner GenLayer: https://techcrunch.com/2026/06/30/crypto-exchange-okx-wants-ai-agents-to-hire-and-pay-each-other/.)

### Settlement tokens + chains
**FACT — settlement chain is X Layer (`eip155:196`, chainIndex 196).** The seller SDK auto-configures **X Layer + USDT0** (`USD₮0`, contract **`0x779Ded0c9e1022225f8E0630b35a9b54bE713736`**, 6 decimals, EIP-3009). The whitepaper: "The OKX reference Broker uses X Layer (~200ms finality, sub-cent fees)"; the TS SELLER.md is explicit: **"X Layer (`eip155:196`) only … no other networks."** Marketplace CLI `heartbeat --chain-index 196` and 402 challenges carry `chainId 196`. Sources: https://github.com/okx/payments/blob/master/README.md, https://github.com/okx/payments/blob/master/typescript/SELLER.md, whitepaper §3.
> ⚠️ This **corrects** the prior brief's "X Layer = DATA NOT FOUND." **X Layer is the production settlement chain** for OKX.AI payments. (X Layer's native gas token is OKB.)

**FACT — tokens**: X Layer settlement uses **USDT0** (branded USDT). **USDG** (Paxos Global Dollar) is a valid marketplace currency alongside USDT: `agent create-task --currency USDT|USDG` and prize payouts are quoted in USDT/USDG. At **ASP-service registration the currency is fixed to USDT** (identity-register.md). Sources: task-cli-reference.md (create-task `--currency USDT|USDG`), press (USDT/USDG) https://www.theblock.co/post/406704.

**FACT — chains beyond X Layer**: the Go SDK README lists other EVM chains as generically pre-configured (Base `eip155:8453` USDC, Monad, MegaETH, Mezo, "Stable"), and the repo ships **Solana/SVM** payment mechanisms (`go/x402/mechanisms/svm/exact/v1`). Wallet **address creation** is supported on 7 chains: XLayer(196), XLayer-Testnet(1952), **Solana(501)**, Ethereum(1), Base(8453), BSC(56), Arbitrum(42161); 17+ chains for interaction; OnchainOS spans "60+ networks." Sources: https://github.com/okx/onchainos-skills/blob/main/skills/okx-agentic-wallet/_shared/chain-support.md, https://web3.okx.com/onchainos.
> **INFERENCE**: Solana is fully supported for wallet/data/tx-scan, and the SDK *can* settle SVM `exact` payments, **but the OKX.AI marketplace pay-per-call settlement targets X Layer**. For the hackathon, assume **X Layer + USDT0** is your settlement path unless a live doc says otherwise.

**FACT — protocol lineage**: OKX x402 support is built on **Coinbase's x402 open standard** (Apache-2.0), extended with X Layer, `aggr_deferred`, and TEE signing; MPP = Machine Payments Protocol (mpp.dev). Permit2 canonical address (all EVM chains): `0x000000000022D473030F116dDEE9F6B43aC78BA3`. Sources: https://github.com/okx/payments/blob/master/README.md, SKILL.md, whitepaper §3 (mentions EIP-7702 agentic wallets, optional ERC-8004 identity).

---

## 4. OKX Agentic Wallet + Agent Identity

**FACT — there is an SDK/CLI + REST/Open API surface.** The Agentic Wallet is exposed through the `onchainos` CLI (`onchainos wallet …`), Skills, an MCP server, and an Open API (REST + WebSocket). Keys are generated/stored/signed **inside a TEE** ("never leaves the enclave, not even OKX can export it"). Sources: https://web3.okx.com/onchainos/dev-docs/home/agentic-wallet-overview, https://web3.okx.com/onchainos.

**FACT — what an agent needs to authenticate (two paths):**
- **Email OTP** → auto-creates a TEE wallet returning **an EVM address + a Solana address**. `onchainos wallet login <email>` → `onchainos wallet verify <code>`. Source: https://web3.okx.com/onchainos/dev-docs/home/install-your-agentic-wallet.
- **OKX Developer Portal API key** (`OKX_API_KEY`, `OKX_SECRET_KEY`, `OKX_PASSPHRASE`) from **`web3.okx.com/onchainos/dev-portal`** — used both for CLI login (no email) and, critically, for the **seller SDK's Facilitator client** (HMAC-SHA256 signed requests to OKX's settlement API). A built-in **sandbox** key set exists for local testing only (rate-limited, not for production). Sources: https://github.com/okx/onchainos-skills#prerequisites, https://github.com/okx/payments/blob/master/typescript/SELLER.md ("ENV VARS").

**FACT — Agent Identity = ERC-8004, one identity per address per role, on-chain + portable reputation.** Roles: `user` / `asp` / `evaluator`. Each ASP identity carries services; reputation is a 0.00–5.00 star average from `agent feedback-list` accumulated across A2A and A2MCP. Sources: README (`okx-ai` = "ERC-8004 on-chain Agent identity"), identity-register.md, https://github.com/okx/onchainos-skills/blob/main/skills/okx-ai/references/identity-reputation.md, whitepaper §3 (ERC-8004).

**FACT — how an ASP receives funds.** Payments settle to the ASP's `PAY_TO` wallet address (the Agentic Wallet EVM address) in **USDT0 on X Layer**: A2MCP settles per-call (`exact`/`upto`/`deferred`) or per-channel-close (`session`); A2A escrow releases on `complete` / auto-complete / dispute-won. Provider claims accrued rewards via `agent asp-claimable` / `agent asp-claim-rewards`. Sources: SELLER.md (`PAY_TO`), task-cli-reference.md (`asp-claim-rewards`).

**FACT — native wallet safety controls** (relevant to §7): the wallet skill mandates `security tx-scan` before any `contract-call`, refuses unlimited approvals by default, and offers spending-limit/whitelist policy + wallet export via a web portal. TEE means the agent itself cannot exfiltrate the key. Source: https://github.com/okx/onchainos-skills/blob/main/skills/okx-agentic-wallet/references/wallet.md.

---

## 5. Onchain OS — what it concretely is

**FACT**: OnchainOS is OKX's **AI-agent developer toolkit**, packaged four ways — "**Agentic Wallet · Payments · Trade · AI Toolkit**" — surfaced through **three integration modes**: (1) **Skills/CLI** (`npx skills add okx/onchainos-skills`), (2) **MCP** (`claude mcp add … onchainos mcp`), (3) **Open API** (REST + WebSocket, any language). Headline scope: "**9 skills, 72 features** covering token check, trade & transfer, market monitor, risk detection, and onchain broadcast," "**60+ networks**," "**500+ DEXs aggregated**." Sources: https://web3.okx.com/onchainos, https://web3.okx.com/onchainos/dev-docs/home/what-is-onchainos.

**FACT — the actual skill set** (`okx/onchainos-skills`, README/AGENTS.md): `okx-agentic-wallet` (auth/balance/send/contract-call/swap/bridge/gas-station/**security scanning**/audit-log), `okx-dex` (read-only market/DEX data, signals, WS streaming), `okx-agent-payments-protocol` (x402/MPP/a2a-pay dispatcher — the **buyer** side), `okx-defi` (Aave/Lido/Pancake/Kamino/NAVI), **`okx-ai`** (ERC-8004 identity + task marketplace — **the ASP surface**), `okx-guide`, `okx-dapp-discovery` (Polymarket/Aave V3/Hyperliquid/Pancake V3/Morpho), `okx-growth-competition`. Install as a Claude Code plugin or per-client. Source: https://github.com/okx/onchainos-skills/blob/main/README.md.

**FACT — what it gives an ASP builder concretely**:
- **To sell** (build the ASP): the `okx/payments` SDKs (Go/Rust/TS/Python/Java) — x402 HTTP middleware (Express/Hono/Fastify/Next.js/Gin/Echo/net-http/Axum), the `x402/mcp` paid-tool wrapper, MPP `charge`/`session`, `@okxweb3/payment-router` (one URL, multiple 402 dialects). Broker "handles all on-chain interactions — RPC, gas, tx submission." Source: https://github.com/okx/payments.
- **To integrate blockchain features into the service**: the `onchainos` CLI/Open API for balances, swaps, market data, DEX aggregation, and **security scans**.
- Three build styles for the seller endpoint (dev-docs `payments/service-seller`): **prompt-based** (agent reads `SELLER.md` → generates code), **SDK direct**, or **reverse-proxy** (drop a proxy in front of an existing service, no code change). Source: https://web3.okx.com/onchainos/dev-docs/payments/service-seller.

---

## 6. Existing / example ASPs + categories (saturation check)

**FACT — the marketplace is live with real, rated, paid ASPs** (okx.ai/agents via `r.jina.ai`, 2026-07-08):
| ASP | Category | What it does | Price | Traction |
|---|---|---|---|---|
| WorldCupCaller | Finance | 2026 World Cup schedules, win-probabilities, Polymarket links | 0.5 USDT | ★4.8, 166 sold |
| FundingArb | Finance | Perp funding-rate arbitrage across 7 exchanges | 1 USDT | ★5.0, 6 sold |
| XLayer NFT Mint | Web3 | Mints an image as an NFT on X Layer (gas covered) | 1.5 USDT | ★5.0, 3 sold |
| Airdrop Hunter | Web3 | Finds unreleased airdrop projects + eligibility guides | 1.5 USDT | ★5.0, 2 sold |
| WokSmith | Lifestyle | Chinese-cuisine techniques + custom meal plans | 0.2 USDT | ★5.0, 23 sold |
Prices are sub-$2 USDT, **pay-per-call (A2MCP)**, with visible star ratings + sold counts. Other press-cited examples: exchange/DeFi profit scanners, an AI/KOL trend-report agent, a food-label healthiness evaluator, cooking agents. Source: https://www.okx.ai/agents (proxy); crypto.news/The Block coverage.

**FACT — implied taxonomy** (matches the hackathon's specialized tracks): **Finance, Software/Web3, Lifestyle, Art Creation**. Launch partners: **CertiK** (security risk scoring), **CoinAnk** (market data pay-per-query), **GenLayer** (dispute resolution). Closed beta had ~50 ASPs. Source: https://techcrunch.com/2026/06/30/crypto-exchange-okx-wants-ai-agents-to-hire-and-pay-each-other/, https://www.theblock.co/post/406704.

**Is a transaction-safety / pre-sign ASP already there?**
- **PARTIAL / YES at the "security scoring" layer**: **CertiK is a named launch ASP** — "assess the security of a crypto wallet or token **before executing a transaction**." That is squarely in the pre-sign-safety space. Source: TechCrunch / The Block.
- **On the featured consumer marketplace page today, no safety/simulation ASP was visible** among the featured agents ("No agents specifically addressing wallet risk, transaction safety simulation, or security audits are featured on this page"). Source: okx.ai/agents (proxy).
- **The bigger overlap is native, not an ASP** (see §7): OKX's own Agentic Wallet already ships a pre-sign firewall.
> **INFERENCE (saturation):** the generic "is this wallet/token safe" niche is **already occupied** (CertiK + native wallet scan). A safety ASP needs a sharp wedge beyond token/wallet reputation — e.g. deep per-transaction **state-diff simulation with human-readable balance/allowance deltas**, protocol-specific invariant checks, multi-step/session risk, or a specific vertical — to avoid being a thinner copy of `security tx-scan`/CertiK.

---

## 7. Simulation / RPC infra a safety ASP would need

**FACT — OKX already provides native transaction simulation + a rich pre-sign risk engine** via `onchainos security …` (5 commands, no wallet login required):
- `security tx-scan` — **EVM + Solana** pre-execution scan; returns `action` (`""`/`warn`/`block`), `riskItemDetail[]`, and a **`simulator` block (`gasLimit`/`gasUsed`/`revertReason`)**. Risk catalog includes blacklist hits (`black_tag`, `SPENDER_ADDRESS_BLACK`, `ASSET_RECEIVE_ADDRESS_BLACK`), `ACCOUNT_IN_RISK` (existing malicious approvals), **EIP-7702 abuse** (`evm_7702_risk`, `evm_7702_auth_address_not_in_whitelist`, `evm_okx7702_loop_calls_are_not_allowed`), vanity-address phishing (`TRANSFER_TO_SIMILAR_ADDRESS`), `multicall_phishing_risk`, `approve_anycall_contract`, `increase_allowance`, `TRANSFER_TO_CONTRACT_ADDRESS`, etc.
- `security sig-scan` — EVM message/EIP-712 signature safety (`personal_sign` … `eth_signTypedData_v4`).
- `security token-scan` — server-computed `riskLevel` (CRITICAL/HIGH/MEDIUM/LOW), honeypot/rug/tax labels.
- `security dapp-scan` — URL phishing (`isMalicious`).
- `security approvals` — list + revoke risky approvals/Permit2 grants.
The wallet skill enforces a **fail-safe**: a scan that errors is "NOT a pass," and the agent "MUST NOT override a risk verdict." Sources: https://github.com/okx/onchainos-skills/blob/main/skills/okx-agentic-wallet/references/security.md, https://github.com/okx/onchainos-skills/blob/main/skills/okx-agentic-wallet/references/security-cli-reference.md. Marketing confirms: "pre-transaction gas estimation and simulating the execution of transactions," "every transaction undergoes identity verification, blacklist filtering, and risky token alerts before signing" (https://web3.okx.com/onchainos/dev-docs/wallet/agentic-wallet-skills).

**What this means for a solo safety-ASP builder in 9 days:**
- **You can rely on**: OKX's `security tx-scan/sig-scan/token-scan/approvals` as a **risk-verdict + light simulator** primitive (gasUsed/revertReason + a mature 7702-aware, blacklist-aware risk catalog) — callable from the same CLI/Open API you already install. You do **not** have to build blacklist feeds, honeypot detection, or a 7702 risk model from scratch.
- **You must bring yourself** (the differentiator): a **full state/trace simulator** — `security tx-scan`'s `simulator` returns gas + revertReason, **not** a full call-trace or per-asset balance-diff. For "show me exactly what this tx does to my balances/allowances," build your own via **X Layer JSON-RPC** (`https://rpc.xlayer.tech`) using `eth_call` / `debug_traceCall` / `trace_callMany` (availability of `debug_*`/`trace_*` on X Layer public RPC = **DATA NOT FOUND — verify**), or a Tenderly-style simulation service, or a local fork (anvil/hardhat) for X Layer. For Solana, use `simulateTransaction` on a Solana RPC.
- **Realistic scope**: an ASP that wraps `security tx-scan` + adds a **human-readable balance/allowance/ownership diff and a plain-English verdict** (its own `eth_call`-based simulation on X Layer) is buildable solo in the window and is differentiated from both CertiK (token/wallet scoring) and the raw native scan.

**DATA NOT FOUND**: whether OKX exposes the tx-scan/simulator as a standalone **Open API** an *external* ASP endpoint may call server-side (vs. only through the agent-side CLI); the exact X Layer archive/trace RPC method support; rate limits on the security API.

---

## SYNTHESIS — what a solo Seatbelt / pre-sign-safety ASP can rely on vs. must bring (in 9 days)

**Rely on (provided by OKX, verified):**
- **Go-live rails**: `npx skills add okx/onchainos-skills` → wallet (email-OTP TEE or API key) → `agent pre-check/create/activate` (ERC-8004 identity + service listing + the `submitApproval` review gate). Gas-free via paymaster.
- **Payment rails**: the `okx/payments` seller SDK (TS/Go/Rust/Python/Java) — wrap a route or an MCP tool; **`exact`** (fixed per-call) or **`upto`** (metered cap, `setSettlementOverrides`) on **X Layer / USDT0** (`eip155:196`, `0x779Ded0c…`); OKX Broker/Facilitator handles RPC, gas, settlement; USDT/USDG at marketplace level.
- **MCP-native distribution**: your service is reachable by Claude Code / Codex / Hermes / OpenClaw either as a priced HTTP endpoint or a `x402/mcp` paid tool.
- **Safety primitives to build ON**: `security tx-scan` (EVM+Solana, 7702/blacklist/phishing risk model + gas/revert simulator), `sig-scan`, `token-scan`, `approvals`, `dapp-scan`.

**Must bring yourself:**
- A **deployed public `https://` endpoint** (immutable once listed) that speaks the x402 seller flow (SDK or reverse-proxy). Deploy + smoke-test **before** `agent create`.
- Your **own deeper simulation** if the product promise is a full pre-sign state-diff/trace (own X Layer RPC `eth_call`/trace, or Tenderly/fork), because native `tx-scan` gives a verdict + gas/revert, not a full asset-diff.
- **Product differentiation** vs. CertiK (security scoring) and the native wallet scan — a specific, human-readable, per-transaction "seatbelt" wedge.
- **OKX Developer Portal API keys** (`OKX_API_KEY/SECRET/PASSPHRASE`) for the seller Facilitator client, and a small USDT0/OKB float on X Layer for testing (X Layer testnet faucet: `https://web3.okx.com/xlayer/faucet`).

## OPEN QUESTIONS to confirm on live builder docs before coding
1. **Review SLA + rubric**: how long does `activate → submitApproval` take, and what gets an ASP rejected? (Eligibility-critical with 9 days left. DATA NOT FOUND.)
2. **Does an external ASP endpoint get to call OKX `security tx-scan` server-side via Open API** (with its own API key), or is that scan only agent-side/CLI? (Determines whether a safety ASP can reuse OKX's risk engine inside its own endpoint.) DATA NOT FOUND.
3. **Settlement token/chain lock-in**: is A2MCP settlement **X Layer + USDT0 only**, or is USDG / another chain selectable at listing time? (SDK says X Layer-only; marketplace CLI shows USDT|USDG.) Confirm the exact `Fee` currency/chain a live listing pins.
4. **X Layer RPC capabilities**: does the public X Layer RPC (`https://rpc.xlayer.tech`) expose `debug_traceCall` / `trace_*` for a self-built state-diff simulator, or is an archive/trace provider needed? DATA NOT FOUND.
5. **A2MCP endpoint contract**: exact request/response the marketplace's caller agent sends to your Endpoint (params via `outputSchema.input`? headers?), and whether a non-SDK (hand-rolled 402) endpoint passes review. Confirm against `payments/service-seller` + `SELLER.md` live.
6. **KYC / payout eligibility** for receiving USDT0 and prize USDT/USDG (jurisdiction). DATA NOT FOUND on the hackathon page.

---
### Primary sources used
- `okx/onchainos-skills` (CLI + skill docs): https://github.com/okx/onchainos-skills — key files: `README.md`, `AGENTS.md`, `skills/okx-ai/references/{identity-register,identity-manage,identity-discover,identity-reputation,task-cli-reference,task-state-machine,task-asp,task-asp-accept,task-user-actions-publish,task-evaluator-staking}.md`, `skills/okx-agent-payments-protocol/{SKILL.md,references/{accepts-schemes,session,multi-scheme}.md}`, `skills/okx-agentic-wallet/references/{wallet,security,security-cli-reference}.md`, `skills/okx-agentic-wallet/_shared/chain-support.md`.
- `okx/payments` (seller SDK): https://github.com/okx/payments — `README.md`, `go/x402/SELLER.md`, `go/x402/mcp/README.md`, `typescript/SELLER.md`.
- Agent Payments Protocol Whitepaper v1.0: https://web3.okx.com/whitepaper/okx-app-whitepaper.pdf
- OnchainOS dev-docs: https://web3.okx.com/onchainos and https://web3.okx.com/onchainos/dev-docs/{home/what-is-onchainos, home/agentic-wallet-overview, home/install-your-agentic-wallet, wallet/agentic-wallet-skills, payments/overview, payments/x402-introduction, payments/service-seller}
- okx.ai (via r.jina.ai reader): https://www.okx.ai/tutorial , https://www.okx.ai/agents
- Press (secondary, context only): TechCrunch https://techcrunch.com/2026/06/30/crypto-exchange-okx-wants-ai-agents-to-hire-and-pay-each-other/ ; The Block https://www.theblock.co/post/406704 ; thirdweb https://blog.thirdweb.com/ai-agent-marketplace-okx-lets-agents-hire-and-pay-each-other/
- **Blocked (not readable here)**: `www.okx.com/en-us/learn/{okx-ai,agent-payments-protocol,agentic-wallet}` (TLS-intercepted); direct `okx.ai` fetch (403, use reader proxy).
