# ExitGuard ASP server — the real, x402-paid A2MCP endpoint

This is the **registerable OKX.AI A2MCP service** (separate from the Next.js demo site in the parent
folder). It exposes `exit_liquidity_check` over HTTP, backed by **live OKX DEX aggregator quotes**, and
charges **$0.02/call in USDT0 on X Layer via x402** — the Broker handles all on-chain settlement.

```
asp-server/
  src/verdict.ts   pure verdict math + result assembly (mirrors the demo's thresholds)
  src/okx-dex.ts   REAL OKX DEX client (signed): resolveTokenMeta + sell-quote depth ladder
  src/engine.ts    runCheck() — auto-resolves decimals+price, builds the ladder (shared by both endpoints)
  src/mcp.ts       MCP server: exposes `exit_liquidity_check` as a native tool
  src/payment.ts   x402 payment middleware (OKX Onchain OS Payment SDK), dynamically loaded
  src/server.ts    Express: POST /exit_liquidity_check (HTTP) + POST /mcp (A2MCP) + GET /health
```

## What's wired vs. what you finish

**Done (this scaffold, all typechecked + boot-verified):**
- signed OKX DEX `/api/v6/dex/aggregator/quote` client + a sell-quote ladder → real slippage + available exit liquidity;
- **auto-resolved token metadata** — decimals + mid-price read from the quote's `fromToken`, so callers pass only
  `token_address` + `chain` + `size_usd`;
- the verdict engine;
- **A2MCP-native** — `exit_liquidity_check` exposed as an MCP tool over Streamable HTTP (`POST /mcp`), plus a plain
  HTTP endpoint;
- the exact x402 seller middleware from OKX's docs, with a **method-aware gate** on `/mcp` (MCP `initialize` /
  `tools/list` stay free; only a `tools/call` is charged).

**You finish (needs your accounts — I can't do these):**
1. **Add the payment SDK:** `npm install @okxweb3/x402-express @okxweb3/x402-core @okxweb3/x402-evm`
2. **Fill `.env`** (copy `.env.example`): OKX API key/secret/passphrase + `PAY_TO_ADDRESS` (your Agentic Wallet).
   Keep `NETWORK=eip155:1952` (testnet) to start.
3. **Deploy** on a public HTTPS domain, then **register + list** on OKX.AI via the Onchain OS agent (below).

## Run locally (dev, unpaid)

```bash
npm install
cp .env.example .env      # leave OKX creds blank to run UNPAID for local structure testing
npm run dev
curl -s localhost:4000/health

# plain HTTP (with OKX keys set, callers pass ONLY token + size):
curl -s -X POST localhost:4000/exit_liquidity_check \
  -H 'content-type: application/json' \
  -d '{"token_address":"0x6982…","chain":"eip155:8453","size_usd":50000}'

# A2MCP handshake (what OKX.AI registers) — returns serverInfo + the exit_liquidity_check tool:
curl -s -X POST localhost:4000/mcp \
  -H 'content-type: application/json' -H 'accept: application/json, text/event-stream' \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18","capabilities":{},"clientInfo":{"name":"c","version":"1"}}}'
```

With OKX creds + `PAY_TO` set, the x402 middleware returns **402 → sign → settle → 200** and the verdict
only reaches paying callers (on `/mcp`, only a `tools/call` is charged — the handshake is free).

## Go-live on OKX.AI (per web3.okx.com/onchainos/dev-docs)

1. Test on **X Layer testnet** (`eip155:1952`) — faucet gives test OKB (gas) + test USDT0.
2. Flip `NETWORK=eip155:196`, deploy on a **public HTTPS domain**.
3. In your agent host (Claude Code / Codex / Hermes / OpenClaw):
   - `npx skills add okx/onchainos-skills --yes -g`
   - `Log in to Agentic Wallet on Onchain OS with my email`
   - `Help me register an A2MCP ASP on OKX.AI using Onchain OS` → provide **name · description · price
     ($0.02) · endpoint** (your deployed MCP URL; it must support x402)
   - `Help me list my ASP on OKX.AI using Onchain OS`
4. **Review ≤ 2 business days** → live. Submit early (~Jul 13–14) before the Jul 17 deadline.

Sources: `../docs/OKXAI_STACK.md` (CONFIRMED-LIVE section) + the OKX Onchain OS Payment/Trade docs.
