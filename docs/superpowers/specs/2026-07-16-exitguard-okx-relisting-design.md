# ExitGuard OKX Relisting Fix — Design

Date: 2026-07-16 · Scope: `asp-server/src/server.ts` (single-file patch) + redeploy + live verification + listing resubmission.

## Problem

OKX listing review rejected agent #5210 (ExitGuard) with two reasons:

1. **"Unable to reach service endpoint"** — proven live: a plain `POST /mcp` without the MCP `Accept: application/json, text/event-stream` header gets **406 Not Acceptable** from `StreamableHTTPServerTransport`; `GET /mcp` gets 405. OKX's availability prober reads this as unreachable/broken. The server itself is up (`/health` → `paid:true, strict:true`).
2. **"Failed x402 standard validation"** — proven live: an unpaid `tools/call` returns **402 with empty body `{}`** (SDK `@okxweb3/x402-express@0.1.1` does `res.status(402).json({})`; challenge only in base64 `payment-required` header). OKX's own reference endpoint (`/api/v1/pay/mock-merchant/resource`) returns the challenge JSON **in the body**: `{"x402Version":2,"accepts":[...],"error":"Payment Required"}`. Additionally, a non-MCP probe body (`{}`) never reaches the payment middleware at all (it 406s first), so a plain x402 probe never sees a 402.

## Fix (4 changes in `server.ts`)

1. **Accept-shim** (`POST /mcp`): if the `Accept` header lacks `application/json` or `text/event-stream`, rewrite it to `application/json, text/event-stream` before the transport → plain probers never 406.
2. **402 challenge body injection**: middleware wrapping `res.json` — when a response is 402 with empty object body, decode the `payment-required` header (base64 or raw JSON) and send that JSON as the body (header preserved). Applied to both `/mcp` and `/exit_liquidity_check`.
3. **Probe-friendly payment gating** (`POST /mcp`): route through the payment middleware when the body (or any batch element) is (a) the paid `tools/call exit_liquidity_check` — as today — **or (b) not a JSON-RPC message at all** (no `method` string, e.g. `{}` probe) → probers get a standard 402+challenge. Proper MCP methods (`initialize`, `tools/list`, `ping`, notifications, even unknown methods) keep today's free path and JSON-RPC error semantics.
4. **`GET /mcp` content negotiation**: real MCP/SSE clients (`Accept` includes `text/event-stream`) keep the spec-compliant 405; anything else (browser, prober) gets **200 JSON service info** (service, tool, price, network, usage hint).

Non-goals: no SDK fork/patch-package, no engine/verdict changes, no endpoint URL change (it is on-chain), no new routes.

## Deploy & verify

- Typecheck (`npm run typecheck`), local smoke test with `.env` (dev), then `railway up` from `asp-server/` (needs fresh `railway login` — CLI token expired ~Jul 13).
- Live test battery against `https://exitguard.mdloglabs.org`:
  `/health`; POST initialize **with and without** Accept (both 200); `tools/list` 200; plain `POST {}` → **402 + body challenge**; unpaid `tools/call` → **402 + body challenge + header**; `GET /mcp` (no SSE accept) → 200 info; `GET /mcp` (SSE accept) → 405.
- Then resubmit listing #5210 via the OKX identity-update flow (card + explicit user confirm) and monitor review.

## Error handling & risks

- Challenge-body injection fails soft: if header absent/undecodable, original `{}` body stands (no crash).
- Accept-shim only widens acceptance; conforming MCP clients unaffected.
- Gating rule (b) only captures non-JSON-RPC bodies, so no legitimate MCP traffic is charged.
- Risk: OKX validator semantics are undocumented (KMCP guide 404s). Mitigation: mirror their reference implementation's observable wire format exactly.
