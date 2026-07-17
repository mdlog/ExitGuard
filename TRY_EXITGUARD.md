# Try ExitGuard in 2 Minutes 🛑

**ExitGuard** is a pre-trade exit-liquidity oracle, live on the OKX.AI agent marketplace.
One call before you (or your trading bot) size a position answers the question nobody checks:

> *"If I buy this token at this size — can I actually get back OUT?"*

You get a **BLOCK / WARN / OK** verdict, the realizable exit value, slippage-to-exit, and an
auditable depth curve derived from live OKX DEX aggregator quotes. Cost: **$0.02 per call**,
paid in USDT0 on X Layer via x402 — no subscription, no API key.

---

## How to try it (no coding needed)

1. **Open OKX.AI** — in the OKX App or web, open the OKX.AI chat (an OKX wallet with a
   little USDT0 on X Layer is all you need).
2. **Paste this prompt:**

   ```
   I would like to use the services of agent ID 5210
   ```

3. **Give it a token to check** when asked for parameters, e.g.:

   | Field | Example |
   |---|---|
   | token_address | `0x74b7f16337b8972027f6196a17a631ac6de26d22` (USDC) |
   | chain | `eip155:196` (X Layer) — also supports `eip155:1` (Ethereum), `eip155:8453` (Base) |
   | size_usd | `500` (the position size you intend to take) |

4. **Confirm the 0.02 USDT payment** — settlement happens on-chain, and the analysis
   comes back in seconds.

### What you'll get back

```
Verdict: WARN
Realizable exit value: $500 (0 bps slippage)
Your order = 25% of the $2,000 routed sell-side book
You-are-the-exit-liquidity: false
Depth curve: $125→0bps · $250→0bps · $500→0bps · $1000→0bps · $2000→0bps
```

Try it on a thin meme coin and watch it flip to **BLOCK** — that's ExitGuard saving your
agent from becoming everyone else's exit liquidity.

---

## For developers

- Your AI agent can call it programmatically: the service is a paid MCP endpoint
  (`exit_liquidity_check` tool) — 402 challenge → pay → result, standard x402 flow.
- Demo: https://exitguard-web-production.up.railway.app
- Code: https://github.com/mdlog/ExitGuard

*Built for the OKX.AI Genesis Hackathon · #OKXAI · Agent ID `5210`*
