# User Context — OKX.AI Genesis Hackathon

_Captured 2026-07-08 from batched pipeline interview. Source of truth for theme + ideation. Do not re-ask the user these._

## Builder profile
- **Format:** Solo builder.
- **Background / edge:** **DeFi / trading / on-chain finance.** Understands markets, DEX mechanics, yield, wallets, MEV, portfolio ops. Sharpest ideas should exploit this edge.
- **Stack assumption:** full-stack + web3 capable.

## Strategic decisions
- **On-chain depth: FULL ON-CHAIN NATIVE.** The ASP must use OKX Agentic Wallet + USDT/USDG settlement (A2A escrow or A2MCP pay-per-call) as a *core mechanic*, not decoration. Targets **Revenue Rocket** + **Finance Copilot** primarily; Best Product secondarily.
- **Distribution / audience: Crypto Twitter (CT).** Framing should be on-chain-native, "agents that earn / agents that pay each other" — the kind of thing CT amplifies. This matters for the **Social Buzz $10k** track (10× $1k for traction).

## Constraints (shape what ideation KILLS)
- **Solo-shippable in ~9 days** (minus OKX go-live review lead time). Must be demo-realistic for one person.
- **Ambitious concept is welcome** — a differentiated, memorable bet beats a safe clone — *but* it must still be shippable solo in the window. Ambition goes into the *idea*, not the *surface area*.
- **Avoid heavy custom smart-contract work.** Prefer off-chain agent logic + thin/standard settlement over writing & auditing bespoke Solidity. Lean on OKX's provided Onchain OS / Agentic Wallet primitives rather than deploying complex custom contracts.
- **Avoid saturated / LLM-obvious ideas.** Explicitly kill: generic "AI trading bot", "portfolio chatbot", "AI influencer", "sentiment scanner". Anything an LLM suggests in its first three bullets is out.

## Fixed product shape (from HACKATHON_BRIEF)
The deliverable is **one Agentic Service Provider (ASP)** that goes **live on the OKX.AI marketplace**:
- MCP-native (callable from Claude Code, Codex, Hermes, OpenClaw).
- Uses OKX Agentic Wallet + Agent Identity.
- Payment mode: A2A escrow **or** A2MCP pay-per-call, settling USDT/USDG.
- Multi-chain (EVM + Solana).
- **Hard eligibility gate:** must pass OKX internal review and actually go live. Reject = invalid.

Theme + ideation must respect this shape — the "theme" is *which kind of on-chain-finance agentic service*, angled to be fresh, revenue-generating, and CT-amplifiable.
