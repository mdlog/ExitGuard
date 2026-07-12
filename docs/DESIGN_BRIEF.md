# Design Brief — Exit-Liquidity Guard

> Design Thinking Phase input for the `frontend-design` skill. Source of truth for tone + differentiation.
> Product: an OKX.AI ASP (backend MCP service) + a public surface doing two jobs — a **live demo dashboard**
> (the "proven value" verdict screen) and a **crypto-Twitter landing page** (Social Buzz narrative).

## 1. Purpose & Audience
- **Product purpose:** The seatbelt that tells a trading agent whether it can actually get OUT of a position before it gets IN. Given `token + size`, it returns a `BLOCK / WARN / OK` verdict, an auditable depth/slippage curve, a "you are X% of available exit liquidity" gauge, a recommended max size, and a USDT0 pay-per-call settlement receipt.
- **Primary user:** Crypto-Twitter + DeFi-native agents/builders (and the fund operator behind the bot who ate a 60% unwind once). Secondary: hackathon judges reading the 90s demo and the one screenshot.
- **Emotional reaction wanted in 5 seconds:** *"This is a real measuring instrument, not a marketing widget — I would trust this number with real size."* Rigor you can audit on the glass. The opposite of "trust me bro."

## 2. Tone direction

**Primary: Instrument-Grade Risk Terminal** — a dark oscilloscope + aircraft-annunciator readout.
Adjectives: **precise, auditable, dense-but-legible, high-contrast, quantitative, confident, un-fakeable.**

**Why this fits:** The whole product exists to defeat the "it's just a sell-quote wrapper" objection, so the surface must *show its work* like a lab instrument — raw aggregator curve on screen, units annotated, the 63% traceable by eye — while the BLOCK/WARN/OK verdict lands like a hard-latching relay, not a soft toast. This reads as high-signal instrumentation to a DeFi-native audience and as quant-grade rigor to a judge.

**Reference vibes:** Bloomberg Terminal / Kraken Pro data density, disciplined with **Linear's hairline restraint and typographic precision**; the verdict module treated like an **aircraft warning annunciator** (a red panel that *latches*), and the depth curve rendered like an **oscilloscope trace** on a dark measurement grid. "The Bloomberg terminal a degen actually trusts."

**Alternates considered (with rejection reason):**
- **luxury-monochrome (Stripe/Superhuman elegance):** rejected — too soft and marketing-elegant; whitespace-forward luxury undercuts the density and on-glass rawness that makes the number feel auditable. We want an instrument, not a beautiful pitch.
- **playful-maximalist / memecoin:** rejected — even though illiquid memecoins are the beachhead *data*, a childish rainbow/blob look destroys the trust needed to bet real size on the verdict. Judges must read it as quant-grade, not casino.
- **generic dark AI-SaaS (purple gradient, glass cards, floating 3-up):** explicitly rejected — this is the exact anti-pattern and the exact "just a wrapper / AI slop" objection the product must defeat. Routed around deliberately (see §4, §7).

## 3. Typography
- **Headline / Display:** **Space Grotesk** — geometric grotesque with a mechanical edge; sets the narrative pull-quotes and section labels. Confident, techy, unmistakably *not* Inter/Arial. (Premium upgrade path: Söhne / Neue Haas Grotesk Display.)
- **Body / UI:** **Söhne** (fallback **Space Grotesk** text weight / system-ui) — neutral, precise, quiet. UI labels set in **UPPERCASE micro-caps with letter-spacing** for the instrument-panel feel.
- **Data / Mono (load-bearing):** **IBM Plex Mono** with `tabular-nums` — every number on the product lives here: verdict string, `slippage_bps`, `pct_of_available_liquidity`, depth-curve axes, `recommended_max_size_usd`, USDT0 amount, `quote_block`. Institutional, terminal, aligns in columns. (Premium upgrade: Berkeley Mono / TX-02 for extra scope character.)
- Do NOT use Inter, Arial, or any generic system default as a *headline*.

## 4. Color
Monochrome dark instrument base + an *earned* semantic trio. Color is a signal, not decoration.
- **Dominant / surface:** `#0A0D12` (deep instrument black) — OKX-native darkness; lets data glow and reads as a professional trading desk, not a landing page.
- **Elevated panels / cards:** `#12171F` with hairline borders `#212A35` (1px, no shadows-as-decoration).
- **Primary text:** `#EAF0F4`. **Muted labels / units:** `#6E7C8A`.
- **Semantic verdict trio (used ONLY for verdict/zones, never chrome):**
  - **BLOCK — `#FF3B47`** (calibrated instrument red, not clown-alarm; used for the latched BLOCK plate, the >50% gauge flood, the danger band on the curve).
  - **WARN — `#FFB020`** (caution amber; the grey-band verdict and the amber zone).
  - **OK — `#2ED47A`** (confident instrument green; clear verdict + safe zone).
- **Signal / live accent — `#22D3EE`** (cold cyan): reserved for the depth-curve trace, the "measuring/live" tick, and the USDT0 settlement pulse. Distinct from OK-green so verdict and live-data never collide.
- **NO purple gradient. NO indigo-to-pink. NO glassmorphism blur.** If an auto-instinct reaches for a violet hero glow, use the cyan signal accent or the semantic trio instead.

## 5. Layout principles
- **Two-pane instrument, not a marketing stack.** Left = fixed **input console** (token address, size / notional, quote asset, impact-band bps) styled as a control panel with mono labels + unit chips. Right = the **readout**: verdict plate → gauge → depth curve → recommended-max → settlement receipt → data-caveats footnote.
- **Swiss grid, hairline dividers, uppercase micro-cap labels with explicit units** (BPS · USD · %). Density is a feature; align every number to a tabular baseline grid.
- **Verdict plate is unmissable** — a wide status module spanning the top of the readout, annunciator-style: big mono verdict word, the reason string beneath, the semantic color owning the plate.
- **The gauge** ("you are X% of available exit liquidity") is a horizontal segmented meter that floods toward red as the position dominates the exit book; a 50% tick marks the "you ARE the market" threshold.
- **Depth curve = hero data-viz:** dark scope grid, bright cyan trace, verdict zones shaded green→amber→red by size, a draggable **size marker** riding the curve.
- **Hero treatment (landing):** NOT a centered headline + CTA + 3 cards. The hero **IS the captured readout** — a real (or replayed) BLOCK verdict card front-and-left, treated like an instrument reading, with the narrative headline set as an annotated mono callout/log-line overlaid on it. The product is its own proof.

## 6. Motion
- **High-impact moments:**
  1. **Verdict reveal (on submit):** brief "measuring" state — venue-probe scanline + the size-ladder rungs tick in one-by-one (mono numbers roll/count up), the cyan depth trace draws left-to-right (`stroke-dashoffset`), then the verdict plate **hard-latches** to BLOCK/WARN/OK. Decisive state change like a relay closing (snappy spring ~120–180ms), never a soft cross-fade. The seatbelt "click" is literal.
  2. **The ALLOW→BLOCK scrubber (the money moment):** the presenter drags the size marker up the curve; the marker carries out of the green band into the red, the gauge floods, and the verdict plate latches green→amber→red **in real time**. Proves a continuous model, not a lookup. Must feel physical and immediate.
  3. **USDT0 settlement:** the `402 → sign → PAYMENT-RESPONSE` shown as a compact ledger receipt line that stamps in with a monospace typewriter reveal + a cyan "settled" pulse and a fast block-finality tick (~200ms feel).
- **Restraint:** everything else is *still*. No parallax, no decorative shimmer, no floating gradient orbs. Motion only ever encodes a real state transition (measuring / latching / settling). The stillness is the trustworthiness — an instrument does not wiggle.

## 7. Differentiation
**What makes this UNFORGETTABLE in 5 seconds?**
The UI behaves like a **calibrated measuring instrument**, and the verdict **physically latches like a relay** the instant you cross the danger threshold. Drag the size up and watch the depth curve carry you out of the green band into red — the annunciator plate hard-snaps **BLOCK** and the gauge floods the moment you "become the exit liquidity." The number is never asserted: the **raw aggregator curve is on the glass**, so you trace the 63% yourself. It reads as *an oscilloscope for exit liquidity*, not a SaaS card — which is exactly what kills the "it's just a wrapper" objection on sight.

## 8. Data the UI displays
**Source:** `src/lib/data/*` (service layer over `src/lib/mock-data.ts`).

The UI MUST consume from the service layer, not directly from mock data. The demo renders fully populated from day 0 because the mock is anchored to the PRD §5 sample response (the `$50k $XYZ` BLOCK case: realize $18.5k, −63%, 82% of exit liquidity, recommended max ~$6k, the 4-rung depth ladder, USDT0 `0.02` settlement). Real swap = replace the function bodies in `src/lib/data/*.ts` with the live `exit_liquidity_check` MCP/HTTPS response — no UI changes.

**Key entities to render:** `verdict` (BLOCK/WARN/OK + reason string), `depth_curve[]` (size_usd / slippage_bps / realizable_usd rungs), `pct_of_available_liquidity` + `available_exit_liquidity_usd` (the gauge), `you_are_the_exit_liquidity` (boolean flag), `slippage_to_exit_bps`, `recommended_max_size_usd`, `settlement` (asset / chain / amount), `venues_probed`, `quote_block`, `data_caveats[]`.

**Key views in demo:** (1) the live demo dashboard (input console + full readout), (2) the CT landing page (hero = captured readout + narrative), (3) the draggable size scrubber flipping ALLOW→BLOCK, (4) the USDT0 settlement receipt module, (5) the honest `data_caveats` footnote (transparency = the moat).

## 9. Recommended brand references from VoltAgent collection

Based on the Instrument-Grade Risk Terminal tone (§2), these brands in the [VoltAgent awesome-design-md](https://github.com/VoltAgent/awesome-design-md) collection have proven DESIGN.md files that match the dark, precise, data-dense instrument feel. Fetch one via `/design-ref <brand>` to anchor `frontend-design` with a production-quality technique reference.

| Rank | Brand | Why it fits |
|------|-------|-------------|
| 1 | **linear.app** | The disciplined-dark instrument chrome: hairline grid, near-black elevation, world-class typographic and spacing precision, motion used only for real state changes. This is the "confident stillness + restraint" backbone of the whole aesthetic. |
| 2 | **vercel** | Monochrome-technical, black-on-black elevation, `Geist` sans/mono discipline, data-forward hairline dividers. Anchors the terminal readout chrome and the tabular-mono numeric treatment. |
| 3 | **kraken** | Crypto-native pro-trading fintech: serious dark charts, trading-desk credibility, on-chain-finance nativeness adjacent to OKX. Anchors the "a degen actually trusts it" data-viz and the depth-curve/gauge feel. |

Pick **rank 1 (linear.app)** as default (run `/design-ref auto` after this), or pull **kraken** if you want the data-viz/charting reference to lead, or **sentry** as an alternate whose severity-color system (dark UI + red/amber/green severity + dense readouts) maps almost 1:1 onto the BLOCK/WARN/OK annunciator — and **posthog** for dense dashboard/chart patterns if the depth-curve panel needs more reference.

**Tone-to-brand mapping used:** fintech-confident (`stripe, coinbase, revolut, wise, kraken, binance`) × dev-tool aesthetic (`vercel, sentry, posthog, supabase`) × luxury-monochrome (`linear.app, vercel`). Terminal/instrument = the intersection → **linear.app + vercel + kraken**.

## 10. Handoff
This brief is the Design Thinking Phase input for the `frontend-design` skill.

Invoke that skill next with THREE context files:
1. `docs/DESIGN_BRIEF.md` (this file — tone direction + differentiation, **source of truth**)
2. `docs/DESIGN_REF.md` (brand reference from `/design-ref` — proven technique anchor)
3. `src/lib/mock-data.ts` + `src/lib/data/*` (shape + realistic content, anchored to PRD §5 sample response)

The skill will build the surface: production-quality (from brand ref) + project-specific (from this brief) + fully populated (from mock data anchored to the `$50k $XYZ` BLOCK case).

---
Brief saved to docs/DESIGN_BRIEF.md. Next: invoke frontend-design skill with this as input.
