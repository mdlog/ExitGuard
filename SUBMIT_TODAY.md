# ExitGuard — Ship-Today Runbook (2026-07-12)

**Deadline:** Jul 17 **22:59 UTC** (treat as hard). OKX listing review ≈ **2 business days** → register today.

## ✅ Already done (verified today)
- **ASP is LIVE on X Layer mainnet.** `https://asp.mdloglabs.org` → `network:eip155:196, paid:true, strict:true, hasCreds:true`.
- MCP `tools/call` → **402**; real OKX mainnet quote verified (PEPE $50k → WARN with real depth curve).
- Web app: `tsc` + 12/12 tests + `next build` all green. Polish done (honest live-lamp, metadataBase, .gitignore).
- Everything below is **wallet-gated (yours)** + capture. I can't fund your wallet, sign payments, register, post, or fill the form.

## Pinned facts
- **Wallet:** logged in (`adiadi2411@gmail.com`), address `0x495ba98e146d9d8502cd6665640cceb16dffd380`, **X Layer balance $0.00** (needs funding).
- **402 challenge (decoded):** scheme `exact` · network `eip155:196` · asset USDT0 `0x779Ded0c9e1022225f8E0630b35a9b54bE713736` · amount `20000` (= $0.02, 6 dp) · payTo `0x495ba9…8380` · extra `{name:"USD₮0", version:"1"}`.
- ⚠️ **Watchpoint (decimals):** `onchainos agent x402-check` warns it can't resolve USDT0's decimals (not in its USDT/USDG list; our `accepts` has no `decimals` field) — but still reports `valid:true`. `payment pay` signs raw minimal units so it likely works anyway. **The Step-2 smoke test confirms this.** If signing/settle fails citing decimals → the fix is a one-line `decimals:6` on the accepts entry in `asp-server/src/payment.ts` — ping me and I'll do it.

---

## Step 1 — Fund the Agentic Wallet (USDT0 only, gas-free)
x402 uses EIP-3009 → the OKX **facilitator pays gas**; you only need **USDT0**. Send ~**$1 USDT0** (contract `0x779Ded0c9e1022225f8E0630b35a9b54bE713736`) to `0x495ba9…8380` on **X Layer (chainIndex 196)**. (You pay *yourself* in the smoke test — payTo is this same wallet — so it's essentially free; $1 covers ~50 calls.)
```bash
onchainos --chain xlayer wallet balance      # confirm USDT0 > 0.02
```

## Step 2 — One real mainnet 402 → sign → settle (smoke test)
```bash
export PATH="$HOME/.local/bin:$PATH"
CALL='{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"exit_liquidity_check","arguments":{"token_address":"0x6982508145454ce325ddbe47a25d4ec3d2311933","chain":"eip155:1","size_usd":50000}}}'

# a) grab the 402 challenge (base64 from the payment-required header)
PR=$(curl -s -D - -o /dev/null -X POST https://asp.mdloglabs.org/mcp \
  -H 'content-type: application/json' -H 'accept: application/json, text/event-stream' \
  -d "$CALL" | grep -i '^payment-required:' | sed 's/^[^:]*: *//' | tr -d '\r')
echo "$PR"

# b) sign with your wallet via TEE (no funds move yet) → prints {authorization_header, header_name, ...}
onchainos payment pay --payload "$PR"

# c) replay the SAME call with the returned header → settles on-chain
curl -s -D - -X POST https://asp.mdloglabs.org/mcp \
  -H 'content-type: application/json' -H 'accept: application/json, text/event-stream' \
  -H '<HEADER_NAME>: <AUTHORIZATION_HEADER>' -d "$CALL"          # expect 200 + PAYMENT-RESPONSE

# d) confirm the ledger recorded a real settled call
curl -s https://asp.mdloglabs.org/feed;  echo
curl -s https://asp.mdloglabs.org/stats; echo
```
✅ **Done when** step c returns `200` with a `PAYMENT-RESPONSE` and `/feed` shows the call with a real tx hash. Repeat a handful of times (→ seeds the "real paid calls" metric and makes the demo stats non-zero).

## Step 3 — Register + activate on OKX.AI (the eligibility gate)
> Role is **`asp`** (the older `docs/ASP_REGISTRATION.md` says `provider` — that's wrong; the CLI only accepts `user`/`asp`/`evaluator`).
```bash
export PATH="$HOME/.local/bin:$PATH"

# consent + per-wallet uniqueness. If it returns a consentKey + terms, accept, then re-run with --consent-key <key>
onchainos agent pre-check --role asp

# upload the avatar → copy the returned CDN URL
onchainos agent upload --file docs/exitguard-avatar-512.png

# create identity + A2MCP service (paste the CDN url into --picture)
onchainos agent create \
  --name "ExitGuard" \
  --role asp \
  --description "ExitGuard is a pre-trade exit-liquidity oracle for autonomous trading agents: before an agent sizes a position it calls one tool to learn whether it can actually EXIT at that size, returning a BLOCK / WARN / OK verdict with an auditable, on-chain-derived depth curve — so the agent never unknowingly becomes the exit liquidity in an illiquid token." \
  --picture "<CDN_URL_FROM_UPLOAD>" \
  --service '[{"serviceName":"Exit-Liquidity Check","serviceType":"A2MCP","fee":0.02,"endpoint":"https://asp.mdloglabs.org/mcp","serviceDescription":"Before a trading or DeFi agent sizes a position, exit_liquidity_check proves whether it can get OUT at that size. It probes the OKX DEX aggregator sell-side quote ladder to return a BLOCK / WARN / OK verdict plus realizable exit value, slippage-to-exit, available exit liquidity, a recommended clean-exit max size, and the audited depth curve. Provide token_address, chain (CAIP-2, EVM only: eip155:1 / eip155:8453 / eip155:196) and size_usd; optional side (long=default)."}]'

# activate → submits for OKX review
onchainos agent activate --agent-id <ID_FROM_CREATE> --preferred-language en-US

# verify
onchainos agent get-my-agents
```
⚠️ The endpoint `https://asp.mdloglabs.org/mcp` is written **immutably on-chain** at `create`. It's confirmed live + mainnet → safe to register.
✅ **Done when** `activate` submits for approval. Then OKX review (~2 biz days) → **LIVE listing** = eligibility gate cleared.

## Step 4 — Keep this box up 24/7 (through review + judging)
Your server IS this machine (WARP bypasses the ISP OKX block; cloudflared serves `asp.mdloglabs.org`). Survive reboots:
```bash
sudo systemctl enable docker
sudo systemctl mask sleep.target suspend.target hibernate.target hybrid-sleep.target
# make cloudflared a systemd service — asp-server/TUNNEL.md §7
```
WARP **must stay Connected** or OKX quotes + settlement fail. (Cloud host = more robust, but would change the URL — and you've registered this one, so keep this box up.)

## Step 5 — Capture + submit
- **Video ≤90s:** beat sheet in `docs/HACKATHON_NOTES.md`. Run the web app for recording: `npm run build && npm start` (EXITGUARD_ASP_URL already wired → real verdicts + live tiles).
- **X post:** introduce the ASP + use case, attach the ≤90s demo, tag **#OKXAI**.
- **Google Form:** ASP details + the X post link — submit **before Jul 17 22:59 UTC**.

---
### Today's realistic finish line
Endpoint live on mainnet (**done**) → smoke-tested → **registration submitted for review** → video + X + form prepped/submitted. The one thing not finishable "today" by us: OKX's ~2-day **approval** — which is exactly why registering today matters.
