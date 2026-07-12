# Exit-Liquidity Guard (ExitGuard)

**The seatbelt your trading agent calls before it becomes the exit liquidity.**
An OKX.AI Agentic Service Provider: an agent calls `exit_liquidity_check` before
sizing a position to learn whether it can actually **EXIT** at that size. Returns
**BLOCK / WARN / OK** + an auditable depth curve, and settles pay-per-call in
**USDT0 on X Layer** (`eip155:196`) via **x402**.

> _You can buy it. Can you sell it?_

There are **two deployables** in this repo:

| Path | What it is | State |
|------|-----------|-------|
| `/` (root, Next.js 15) | The **demo + landing** web app — the money screen, landing pitch, and the agent tool contract. **Free**, no payment. | UI fully built; renders through `src/lib/data/*`. Runs on mock data out of the box, or on **live OKX data** when `EXITGUARD_ASP_URL` is set. |
| `asp-server/` | The **real, registerable A2MCP endpoint** — `exit_liquidity_check` over HTTP + MCP, backed by live OKX DEX quotes, x402-paid $0.02/call. This is the product OKX.AI registers. | Code complete + typechecked. Needs your OKX keys + wallet + a public HTTPS deploy to go live (see **Going live**). |

The Next.js `/api/exit-liquidity-check` route is a **free demo/preview** surface. The
**sole paid endpoint** is `asp-server`'s `/mcp` (+ `/exit_liquidity_check`). The web app
never charges anyone.

## Stack

- **Next.js 15** (App Router) + **TypeScript** + **Tailwind v4**, bespoke "Instrument-Grade
  Risk Terminal" design system (`src/app/globals.css` + `DESIGN.md`).
- **shadcn/ui** primitives, **recharts** (depth-curve chart), **sonner** (toasts),
  **lucide-react**, **zod**.
- `asp-server`: **Express** + **@modelcontextprotocol/sdk** (Streamable HTTP MCP) +
  signed **OKX DEX aggregator** client + **@okxweb3/x402-*** seller middleware.
- No Supabase / user DB / auth in the MVP. The backend is the OKX DEX aggregator + on-chain
  reads + x402, not a CRUD app.

## Run the web app (demo-live, zero config)

```bash
npm install
npm run dev              # http://localhost:3000  (falls back to 3002 etc. if 3000 is taken)
```

Three routes render immediately on mock data — no env vars, no backend needed:

- **`/`** — landing / pitch, with an auto-cycling BLOCK/WARN/OK hero.
- **`/guard`** — the money screen: verdict plate + gauge + auditable depth curve + x402
  settlement animation. The slider recomputes instantly client-side; **RUN PAID CHECK**
  calls `/api/exit-liquidity-check` (with an offline fallback so it works with no backend).
- **`/agents`** — the MCP tool contract, price, and a live sample response.

Settlement receipts on the demo are **badged `SIMULATED`/`DEMO`** — no fake tx is ever
linked to the explorer. Real receipts (with live tx hashes) appear only from the paid
`asp-server`.

### Point the web app at live OKX data (optional)

Once `asp-server` is running (below), set these in `.env.local` and the web app proxies
real verdicts instead of mock:

```bash
EXITGUARD_ASP_URL=http://localhost:4000        # or your deployed https URL
EXITGUARD_INTERNAL_TOKEN=<same value as asp-server INTERNAL_TOKEN>
```

The proxy uses the asp-server's **free internal route** (shared-secret gated) so the demo
gets real data without paying — the public paid path stays x402-gated. If these are unset,
the route serves mock data.

## Run the real ASP server

```bash
cd asp-server
npm install
cp .env.example .env      # leave OKX creds blank to run UNPAID for local structure testing
npm run dev               # http://localhost:4000
curl -s localhost:4000/health

# plain HTTP (with OKX keys set, callers pass ONLY token + size):
curl -s -X POST localhost:4000/exit_liquidity_check \
  -H 'content-type: application/json' \
  -d '{"token_address":"0x6982…","chain":"eip155:8453","size_usd":50000}'
```

See `asp-server/README.md` for the full x402 / MCP / go-live details.

## Layout of the code

```
src/
  app/
    page.tsx                          # / landing (built)
    guard/page.tsx                    # /guard money screen (built)
    agents/page.tsx                   # /agents tool contract (built)
    api/exit-liquidity-check/route.ts # FREE demo endpoint: mock, or proxy to asp-server
  components/xg/*                      # the terminal UI (verdict plate, gauge, depth chart, receipt…)
  lib/
    types.ts                          # shared schema (mirrors PRD §4/§6)
    data/*                            # SERVICE LAYER — UI imports ONLY from here (mock ↔ real swap-point)
    mock-data.ts                      # the demo's reality (tokens, checks, agents, feed, stats)
asp-server/                           # the real, x402-paid A2MCP endpoint (live OKX DEX)
docs/                                 # spec files (PRD, LAYOUT_SPEC, DESIGN_BRIEF, OKXAI_STACK, …)
DESIGN.md                             # brand technique reference
```

## Going live (Phase 4 — needs your accounts)

The code is done. What remains needs **your** OKX accounts and a deploy:

1. **OKX Dev Portal** — get `OKX_API_KEY` / `OKX_SECRET_KEY` / `OKX_PASSPHRASE` (+ the
   `OKX_PROJECT_ID` if your project requires the `OK-ACCESS-PROJECT` header) and verify the
   live `/api/v6/dex/aggregator/quote` response against a real call.
2. **OKX Agentic Wallet** — create it, set its X Layer address as `PAY_TO_ADDRESS`, and fund
   it on X Layer **testnet** (`eip155:1952`) via the faucet.
3. **Install x402** — `cd asp-server && npm install` (the `@okxweb3/x402-*` packages are now
   declared as dependencies). Fill `asp-server/.env`, run a testnet 402→sign→settle test.
4. **Deploy** `asp-server` on a public HTTPS domain (this URL is written **immutably on-chain**
   at registration — deploy the final URL first), flip `NETWORK=eip155:196`.
5. **Register + list** the ASP on OKX.AI via Onchain OS, clear the ~2-business-day review, then
   post on X with `#OKXAI` and submit the form.

Full step-by-step: `asp-server/README.md` → "Go-live on OKX.AI".

## Tests

```bash
npm test                 # vitest — verdict engine invariants (src/lib/data/checks.test.ts)
cd asp-server && npm run typecheck
```
