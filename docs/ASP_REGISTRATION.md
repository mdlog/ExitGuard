# ExitGuard — A2MCP ASP registration draft (paste-ready)

Fields match the OKX.AI ASP registration schema (identity-register.md): an **ASP identity**
(Name 3–25 chars · one-sentence Description ≤500 chars · Avatar required) holding a **Service**
(Service name 5–30-char noun phrase · 2-part Description · Type=A2MCP · Fee number string, currency
USDT at registration · public https Endpoint that must support x402). The endpoint is written
**permanently on-chain** — deploy the FINAL asp-server URL and smoke-test it BEFORE registering.

---

## Fields (copy each into the register flow)

**ASP identity**

- **Name:** `ExitGuard`
- **Description (one sentence):**
  `ExitGuard is a pre-trade exit-liquidity oracle for autonomous trading agents: before an agent sizes a position it calls one tool to learn whether it can actually EXIT at that size, returning a BLOCK / WARN / OK verdict with an auditable, on-chain-derived depth curve — so the agent never unknowingly becomes the exit liquidity in an illiquid token.`
- **Avatar:** required — a square PNG (~512×512). (Repo has `src/app/icon.svg`; export it to PNG, or reuse `opengraph-image`.)
- **Preferred language:** `en`

**Service**

- **Service name:** `Exit-Liquidity Check`
- **Type:** `A2MCP`
- **Fee:** `0.02`  _(currency is USDT at registration; settles as USDT0 on X Layer)_
- **Endpoint:** `https://<your-domain>/mcp`  _(placeholder — your deployed asp-server MCP URL; must support x402; immutable on-chain once registered)_
- **Description — part ① (core capability + who it's for):**
  `Before a trading or DeFi agent sizes a position, exit_liquidity_check proves whether it can get OUT at that size. It probes the OKX DEX aggregator's sell-side quote ladder to return a BLOCK / WARN / OK verdict plus the realizable exit value, slippage-to-exit, available exit liquidity, a recommended clean-exit max size, and the audited depth curve — and flags when the agent's own unwind would be the market. Built for memecoin-rotation bots, DeFAI copilots, and treasury/allocator agents that must avoid illiquid, unexitable positions.`
- **Description — part ② (what the caller must provide):**
  `Provide token_address (the token contract), chain (CAIP-2 id; EVM only — eip155:1 Ethereum, eip155:8453 Base, eip155:196 X Layer), and size_usd (intended exit notional in USD); optional side (long = must sell to exit, the default). Returns JSON: verdict, realizable_exit_value_usd, slippage_to_exit_bps, pct_of_available_liquidity, available_exit_liquidity_usd, recommended_max_size_usd, and depth_curve.`

---

## One-shot prompt to paste into the Onchain OS agent

```
Help me register an A2MCP ASP on OKX.AI using OKX Agent Identity from Onchain OS.

ASP identity:
- Name: ExitGuard
- Description: ExitGuard is a pre-trade exit-liquidity oracle for autonomous trading agents: before an agent sizes a position it calls one tool to learn whether it can actually EXIT at that size, returning a BLOCK / WARN / OK verdict with an auditable, on-chain-derived depth curve — so the agent never unknowingly becomes the exit liquidity in an illiquid token.
- Avatar: <path or URL to a 512x512 PNG>
- Preferred language: en

Service:
- Service name: Exit-Liquidity Check
- Type: A2MCP
- Fee: 0.02
- Endpoint: https://<your-domain>/mcp
- Description part 1 (capability + who it's for): Before a trading or DeFi agent sizes a position, exit_liquidity_check proves whether it can get OUT at that size. It probes the OKX DEX aggregator's sell-side quote ladder to return a BLOCK / WARN / OK verdict plus the realizable exit value, slippage-to-exit, available exit liquidity, a recommended clean-exit max size, and the audited depth curve — and flags when the agent's own unwind would be the market. Built for memecoin-rotation bots, DeFAI copilots, and treasury/allocator agents that must avoid illiquid, unexitable positions.
- Description part 2 (what the caller provides): Provide token_address (the token contract), chain (CAIP-2 id; EVM only — eip155:1 Ethereum, eip155:8453 Base, eip155:196 X Layer), and size_usd (intended exit notional in USD); optional side (long = must sell to exit, the default). Returns JSON: verdict, realizable_exit_value_usd, slippage_to_exit_bps, pct_of_available_liquidity, available_exit_liquidity_usd, recommended_max_size_usd, and depth_curve.
```

Then list it: `Help me list my ASP on OKX.AI using Onchain OS`

---

## Before you run it — checklist

- [ ] asp-server deployed on the FINAL public **https** domain, `/mcp` reachable and x402-enabled (`PAY_STRICT=1`, `NETWORK=eip155:196`).
- [ ] `.env` filled: OKX keys (+ `OKX_PROJECT_ID` if needed), `PAY_TO_ADDRESS` = your Agentic Wallet, `INTERNAL_TOKEN`.
- [ ] Smoke-tested a real testnet 402→sign→settle first (`NETWORK=eip155:1952`).
- [ ] Avatar PNG ready.
- [ ] Endpoint URL is final — it is written immutably on-chain at registration.
- [ ] Submit early (~Jul 13–14): review is "24h" per the tutorial / "2 business days" per dev-docs — plan for the longer.

**Character counts:** Name "ExitGuard" = 9 (3–25 ✓) · Service name "Exit-Liquidity Check" = 20 (5–30 ✓) · identity Description ≈ 340 (≤500 ✓).
