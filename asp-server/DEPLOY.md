# Deploying the ExitGuard ASP server (the endpoint you register on OKX.AI)

You register the **public HTTPS `/mcp` URL** of this server as your A2MCP endpoint. That URL is written
**immutably on-chain** at registration — so deploy the FINAL production URL and smoke-test it BEFORE you
run the OKX.AI `register` prompt. A `Dockerfile` (+ `.dockerignore`) is included; it runs on any Docker host.

## Environment variables to set on the host

| Var | Value | When |
|-----|-------|------|
| `OKX_API_KEY` / `OKX_SECRET_KEY` / `OKX_PASSPHRASE` | from OKX Dev Portal | required for live quotes + x402 |
| `OKX_PROJECT_ID` | Dev-Portal Project ID | only if your project needs the `OK-ACCESS-PROJECT` header |
| `PAY_TO_ADDRESS` | your Agentic Wallet EVM address | required to enable payment |
| `NETWORK` | `eip155:1952` (testnet) → `eip155:196` (mainnet) | testnet first, flip at go-live |
| `PAY_STRICT` | `1` | at go-live (refuse to boot unpaid) |
| `PRICE` | `$0.02` | matches your registered fee |
| `INTERNAL_TOKEN` | a random secret | only if the web app should proxy live data |
| `PORT` | provided by the platform automatically | the server reads `process.env.PORT` |

Never commit real secrets — set them in the platform's env/secrets UI.

## Option A — Railway (fastest to HTTPS)

```bash
cd asp-server
npm i -g @railway/cli
railway login
railway init                      # create a project
railway up                        # builds the Dockerfile, deploys
# then in the Railway dashboard: add the env vars above, and "Generate Domain" for a public https URL
```
Your endpoint: `https://<name>.up.railway.app/mcp`

## Option B — Fly.io

```bash
cd asp-server
fly launch --no-deploy            # detects the Dockerfile; set internal_port = 4000
fly secrets set OKX_API_KEY=... OKX_SECRET_KEY=... OKX_PASSPHRASE=... PAY_TO_ADDRESS=... NETWORK=eip155:1952 PRICE='$0.02'
fly deploy
```
Endpoint: `https://<app>.fly.dev/mcp`

## Option C — Render

New → Web Service → connect the repo → Root Directory `asp-server` → Runtime **Docker** → add env vars → Create.
Endpoint: `https://<service>.onrender.com/mcp`

## Smoke test BEFORE registering (do all three)

```bash
BASE=https://<your-domain>

# 1. health — expect paid:true, strict:true, hasCreds:true once env is set
curl -s $BASE/health

# 2. MCP handshake (free) — expect serverInfo + the exit_liquidity_check tool
curl -s -X POST $BASE/mcp -H 'content-type: application/json' \
  -H 'accept: application/json, text/event-stream' \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18","capabilities":{},"clientInfo":{"name":"c","version":"1"}}}'

# 3. MCP Inspector (visual) — connect it to $BASE/mcp
npx @modelcontextprotocol/inspector
```
On testnet (`NETWORK=eip155:1952`), also drive one real **402 → sign → settle** via a paying agent to confirm
the x402 loop and the `PAYMENT-RESPONSE` receipt before flipping to `eip155:196`.

## Only after the smoke test passes → register

Use `docs/ASP_REGISTRATION.md`, setting **Endpoint = `https://<your-domain>/mcp`** (final URL), then run the
OKX.AI `register` + `list` prompts.
