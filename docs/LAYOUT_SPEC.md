# Layout Specification — Exit-Liquidity Guard

> Derived from: `docs/PRD.md` (§4 scope, §5 tool contract, §8 architecture, §10 demo, §13 success)
> Cross-read: `docs/IDEATION.md` (idea #7), `docs/HACKATHON_BRIEF.md` (deliverable = ≤90s video + live ASP), `docs/OKXAI_STACK.md` (x402 / X Layer / USDT0 ground truth)
> Sister docs (not yet authored — produce alongside): `DESIGN_BRIEF.md` (tone), `DESIGN.md`/`DESIGN_REF.md` (brand technique), `src/lib/data/*` (mock data — contract defined in this doc §Data contract)
> Generated: 2026-07-08

---

## 0. Framing (read before the sitemap)

This is **not an app**. It is a **demo-grade marketing microsite with one interactive money screen**. There is **no auth, no dashboard, no account, no CRUD**. The real product is a headless MCP/HTTP endpoint (`exit_liquidity_check`); this web surface exists to do three jobs and nothing else:

1. **Win the "proven value" moment** — a screen where a real illiquid token returns a **BLOCK** verdict with an auditable depth curve, and a **USDT0 pay-per-call settles on the same frame** (PRD §10 must-lands: real curve + ALLOW→BLOCK flip + on-chain settlement).
2. **Serve the CT / Social-Buzz narrative** — a landing page carrying the line *"You can buy it. Can you sell it?"* that is screenshot-able and shareable.
3. **Convert agent-builders** — a "for agents" page with the tool contract + call snippet + price, targeting Software Utility + Best Product judges.

**Scope discipline:** 3 core routes + 1 stretch route. Never exceed this for the 8-day window. Every route below traces to a specific PRD section. No route requires auth. The design target is **desktop-first for the money screen** (the legible screenshot in PRD §13 must be crisp and wide), **mobile-responsive for the landing** (the X share link opens on phones).

**Honesty guardrails baked into layout (from PRD §4 "NOT in scope" + §9 critique):**
- The **raw `depth_curve` is always on screen** wherever a verdict is shown — the 63% is *derived and verifiable*, never an asserted badge.
- `data_caveats` are **always rendered next to the verdict**, never hidden.
- **No giant vanity call-counter.** The optional activity feed shows *modest, honest, real* numbers or is cut entirely. Each single call is a complete value story.

---

## 1. Sitemap

```
/                       Landing — the CT pitch + how-it-works + live verdict teaser        🟢 Demo-critical
/guard                  The money screen — interactive verdict + depth curve + USDT0 settle 🟢 Demo-critical
  /guard?token=&size=   (query-param permalink to a specific verdict — shareable BLOCK link) 🟡 light stretch
/agents                 For agents — MCP tool contract, call snippet, pricing               🟡 Demo-supporting
/activity               Live calls feed — recent checks + verdicts + settlements            🔴 Stretch (cut-first)

not-found (404)         Friendly 404 → back to /guard
```

Route count: **3 core + 1 stretch = 4.** Well under the 10-route ceiling. No dynamic `[id]` segments. No route groups required (all public).

**Naming decision:** use `/guard` (not `/demo` or `/playground`). It reads as the product's own verb ("run the guard"), stays on-brand for the seatbelt metaphor, and doubles as both the live playground and the demo surface.

---

## 2. Route specifications

### `/` — Landing / CT pitch

**Category**: 🟢 Demo-critical (owns the 0–15s hook and the 75–90s close of the demo video)
**Auth**: Public
**Layout type**: Marketing (long vertical scroll, mobile-responsive)

**Purpose**: In one screen a CT reader or a judge understands *what the trap is, that the Guard is live on OKX.AI, and that it produces a quantitative BLOCK* — then clicks through to `/guard`.

**Above-the-fold sections** (priority order):
1. **Hero** — the tagline *"The seatbelt your trading agent calls before it becomes the exit liquidity."* Sub-line: *"You can buy it. Can you sell it? One call tells your agent if it can actually get OUT before it gets IN."* Primary CTA **Run the Guard →** (`/guard`), secondary **Read the tool contract** (`/agents`). Top-right: **`OKXListingBadge`** ("Live on OKX.AI · A2MCP · $0.02/call").
2. **Live verdict teaser** — a compact, animated **`VerdictBadge` + `ExitLiquidityGauge` + mini `DepthCurveChart`** that cycles a canned hero-token BLOCK (`getSampleVerdict('XYZ', 50000)`). This is the "proof in the hero" — the number is on screen before any click. Auto-animates the size scaling ALLOW→BLOCK once on view.

**Below-the-fold sections**:
3. **The trap (problem)** — 2–3 line explainer + a before/after: *"buy fills fine → exit realizes −63%."* Uses static copy, no live data.
4. **How it works** — 4-step horizontal flow diagram (`HowItWorksStep` ×4): **agent → `exit_liquidity_check` → BLOCK/WARN/OK verdict → USDT0 settle on X Layer.** Ties the pay-per-call rail into the narrative.
5. **Why it's auditable (differentiator)** — one panel showing the size-ladder methodology in plain language (probe 0.25×/0.5×/1×/2× → slippage → AEL → verdict), reinforcing "derived, not asserted" (PRD §6). Static.
6. **Social proof strip** — `OKXListingBadge` (larger) + optional honest mini-stat ("N real paid calls settled on X Layer" pulled from `getRecentCalls().length`, **only if `/activity` ships**; otherwise omit — no fake counter).
7. **Final CTA** — repeat *"Can you actually sell it?"* + **Run the Guard →**.
8. **Footer** (global).

**Key data sources**:
- `getSampleVerdict('XYZ', 50000)` from `src/lib/data/verdict.ts` — feeds the hero live-verdict teaser (§2) and the problem before/after (§3).
- `getHeroTokens()` from `src/lib/data/hero-tokens.ts` — feeds the token name/symbol shown in copy.
- `getRecentCalls()` from `src/lib/data/activity.ts` — feeds the honest social-proof count (§6), **only if activity ships**.

**Key interactions**:
- Click **Run the Guard** → navigate to `/guard` (pre-selected to the hero token that guarantees BLOCK).
- Click **tool contract** → `/agents`.
- Hover **How it works** steps → subtle reveal of the per-step detail.
- Hero teaser auto-plays the ALLOW→BLOCK size sweep once when scrolled into view (respect `prefers-reduced-motion`).

**Empty state strategy**: None — landing is fully static + canned mock; always renders.

**Mobile collapse strategy**: Single column. How-it-works flow goes horizontal → vertical stack. Hero teaser chart shrinks to a simplified `VerdictBadge` + gauge (drop the axis labels on the mini chart below `sm`). CTAs full-width.

**Loading state**: None — mock renders instantly. No `loading.tsx`.

---

### `/guard` — The money screen (interactive verdict + settlement)

**Category**: 🟢 Demo-critical (owns 15–75s of the demo — the entire "proven value" moment)
**Auth**: Public
**Layout type**: App-shell / console (two-pane on desktop: control rail + verdict canvas)

**Purpose**: The judge/agent enters (or picks) a token + size and sees a **quantitative, auditable BLOCK verdict**, watches it **flip ALLOW→BLOCK as size scales**, and sees the **USDT0 micro-payment settle on the same screen**. This is the screen that must produce PRD §13's "legible screenshot."

**Layout — desktop two-pane:**

**LEFT control rail (`~320–380px`):**
1. **`HeroTokenPicker`** — 2–3 pre-loaded real illiquid "hero" tokens as selectable chips (guarantees a BLOCK lands on demo day, PRD §4 hero-token scope). Selecting one loads its default size.
2. **`TokenSizeInput`** — token address field (prefilled from picker), chain selector (CAIP-2, e.g. `eip155:8453`), quote-asset selector (USDC default), **size control: a large slider + synced numeric field** (this slider is the star of the demo — dragging it re-renders the verdict live), and a collapsed "Advanced" row for `impact_band_bps` (default 3000). Maps to input schema `{token_address, chain, quote_asset, side:"long", size.notional_usd, impact_band_bps}`.
3. **Primary CTA** — **Run paid check** → fires ONE real x402 call, populates `SettlementReceipt`. (Distinct from the slider, which recomputes the verdict locally/instantly — see data strategy.)

**RIGHT verdict canvas (main, priority order top→bottom):**
1. **`VerdictBadge` + reason line** — huge BLOCK/WARN/OK pill (color-coded), with the one-line `reason` beneath. Consumes `verdict`, `reason`. Directly under it a thin **`ThresholdBar`** showing where the current size sits across OK / WARN / BLOCK zones (updates live with the slider → makes the flip legible).
2. **`VerdictSummaryCard`** — the three numbers that matter, as big stats: **Realizable exit** (`realizable_exit_value_usd`), **Slippage to exit** (`slippage_to_exit_bps` → shown as %), **Recommended max size** (`recommended_max_size_usd`, framed as "downsize to clear back to WARN"). The actionable downsize, not just a "no."
3. **`ExitLiquidityGauge`** — arc/needle gauge of `pct_of_available_liquidity` (0→100%+), with `available_exit_liquidity_usd` labeled, and a bold **"YOU ARE THE EXIT LIQUIDITY"** state that lights up when `you_are_the_exit_liquidity === true` (≥50%). The share-moment visual.
4. **`DepthCurveChart`** — the auditable centerpiece. Plots `depth_curve[]`: x = `size_usd`, dual series `realizable_usd` and `slippage_bps`. Marks the **intended-size rung**, shades the **AEL band** (up to `impact_band_bps`), color-bands the OK/WARN/BLOCK zones. Labels `venues_probed` and `quote_block` on/near the chart. This is what makes the 63% *verifiable, not asserted*.
5. **`SettlementReceipt`** — the x402 pay-per-call proof: a 3-state strip **`402 challenge → sign (X-PAYMENT) → PAYMENT-RESPONSE 200`**, then the settled row: `settlement.amount` `settlement.asset` (USDT0) on `settlement.chain` (X Layer `eip155:196`), tx hash → **link to X Layer explorer**, and finality latency (~200ms). Empty/idle until **Run paid check** is pressed.
6. **`DataCaveats`** — `data_caveats[]` rendered as an explicit, always-visible list ("routed on-chain DEX venues only; snapshot at block N"). Honesty, on-frame.

**Key data sources** (all keyed to the PRD §5 output schema):
- `computeVerdict({token, chain, quoteAsset, sizeUsd, impactBandBps})` from `src/lib/data/verdict.ts` — the **client-side deterministic model** that feeds sections 1–4 and re-renders **instantly on every slider tick** (this is what makes the ALLOW→BLOCK flip smooth and demo-safe). Returns the full output schema.
- `getHeroTokens()` from `src/lib/data/hero-tokens.ts` — feeds `HeroTokenPicker` and prefills `TokenSizeInput`.
- `runPaidCheck(input)` from `src/lib/data/settlement.ts` — the adapter for **Run paid check**. In demo it may hit the **real ASP endpoint** (real 402 → sign → settle) for a genuine on-chain receipt, with `getSettlementReceipt()` mock as the guaranteed fallback. Feeds `SettlementReceipt` (section 5).
- (data adapter note) `getVerdict(input)` — thin wrapper that returns the real endpoint's verdict when available, else `computeVerdict()`. Frontend renders identically from either.

**Key interactions**:
- **Drag size slider** → `computeVerdict()` recomputes → sections 1–4 re-render live (the continuity proof; PRD §10 must-land #2). At ~$6k it flips to WARN/OK; at $50k it is BLOCK.
- **Pick a hero token chip** → loads token + default size → auto-runs `computeVerdict()`.
- **Click Run paid check** → `runPaidCheck()` → animate the 402→sign→200 states → render settled USDT0 row + explorer link (PRD §10 must-land #3).
- **Click tx hash** → open X Layer explorer in new tab.
- **Copy verdict link** → writes `/guard?token=…&size=…` to clipboard (the shareable BLOCK permalink — feeds Social Buzz).

**Empty state strategy**: Never truly empty — on first load, `/guard` **auto-selects the primary hero token at its BLOCK-guaranteeing default size and renders the full BLOCK verdict immediately** (mock/`computeVerdict`). `SettlementReceipt` is the only idle region (prompts "Run paid check to settle in USDT0"). If a user types a random address with no depth model, show a graceful "no aggregator depth for this token — try a hero token" message, not a crash.

**Mobile collapse strategy** (secondary — this screen is desktop-first for the money shot):
- Two-pane → single column: control rail on top (token picker as a horizontal scroll of chips, slider full-width), verdict canvas below.
- `DepthCurveChart` becomes horizontally scrollable / simplified (keep the realizable-vs-size line, drop the secondary slippage axis below `md`).
- Keep `VerdictBadge`, `ThresholdBar`, gauge, and `SettlementReceipt` full-width and legible — these are the share-worthy pieces.

**Loading state**: The **slider/verdict recompute is synchronous** (local model) → no spinner, instant. Only **Run paid check** has an async phase → show the 402→sign→200 progression *as* the loading UI inside `SettlementReceipt` (the wait is the wow, so make it visible, not a generic spinner). No `loading.tsx` for the route.

---

### `/agents` — For agents (MCP integration story)

**Category**: 🟡 Demo-supporting (targets Software Utility + Best Product; referenced, not deep-demoed)
**Auth**: Public
**Layout type**: Marketing / Docs (single column, anchored sections)

**Purpose**: An agent-builder (or a judge evaluating "is this a real callable product?") sees the **tool contract, how to call it, the price, and a copy-paste snippet** — proving this is a live A2MCP service, not a mock.

**Above-the-fold sections**:
1. **Header** — "Integrate the Guard in one call" + `OKXListingBadge` + **price chip: $0.02 USDT0 / call** + the OKX.AI listing link + Agent ID.
2. **Tool contract** — `ToolContractTable`: the `exit_liquidity_check` **input schema** (`token_address`, `chain` CAIP-2, `quote_asset`, `side`, `size.notional_usd`, `impact_band_bps`) and **output schema** (`verdict`, `reason`, `realizable_exit_value_usd`, `slippage_to_exit_bps`, `pct_of_available_liquidity`, `you_are_the_exit_liquidity`, `available_exit_liquidity_usd`, `recommended_max_size_usd`, `depth_curve[]`, `venues_probed`, `quote_block`, `data_caveats[]`, `settlement{}`). Field + type + one-line description each.

**Below-the-fold sections**:
3. **How to call it** — `CodeSnippet` (tabbed: MCP client / raw HTTP + x402), showing the 402 → pay (USDT0/X Layer) → retry → 200 flow, with a **copy button**. This mirrors the PRD §8 architecture.
4. **What you get back (annotated response)** — a real BLOCK JSON response with callouts pointing at the verdict-driving fields. Reuses `getSampleVerdict()`.
5. **Pricing + settlement** — flat $0.02 USDT0 per call, gasless via OKX paymaster, settled on X Layer `eip155:196`. Note the premium-vs-heuristic justification (deeper depth math).
6. **Roadmap teaser** — *"Next: Liquidation Pre-Check on the same data layer."* Marked clearly as **coming next**, not built. (🔴 endpoint #2 is out of MVP scope.)
7. **Footer** (global).

**Key data sources**:
- `getToolContract()` from `src/lib/data/tool-contract.ts` — feeds `ToolContractTable` (§2), the code snippets (§3), pricing (§5). Single source for the schema so it never drifts from `/guard`'s render.
- `getSampleVerdict('XYZ', 50000)` from `src/lib/data/verdict.ts` — feeds the annotated response (§4).

**Key interactions**:
- Click **copy** on any `CodeSnippet` → toast "Copied".
- Click **OKX.AI listing** / **Agent ID** → open the marketplace listing in a new tab.
- Click **Try it live** (inline CTA) → `/guard`.

**Empty state strategy**: None — static content from `getToolContract()`.

**Mobile collapse strategy**: Single column already. `ToolContractTable` → stacked field cards below `md`. `CodeSnippet` horizontally scrollable with a copy button pinned.

**Loading state**: None.

---

### `/activity` — Live calls feed  🔴 STRETCH (cut first if the timeline slips)

**Category**: 🔴 Stretch / Demo-supporting. **Cut-first** — the PRD explicitly warns against a vanity counter (§4, §9). Only ship this if there's genuine slack and it can show **modest, honest, real** settled calls.
**Auth**: Public
**Layout type**: App-shell / simple table page

**Purpose**: Give the Revenue-Rocket story a credible, honest surface — recent real checks + their verdicts + their USDT0 settlements — **without** implying organic volume that doesn't exist in the judging window.

**Sections**:
1. **Header** — "Recent Guard calls" + honest framing sub-line ("self-driven during the hackathon window — each call a complete value story"). A small honest total (`getRecentCalls().length` calls · sum of fees settled). **No animated giant counter.**
2. **Calls table** — `CallFeedRow` list: timestamp · token/symbol · size (`notional_usd`) · `VerdictBadge` (compact) · fee (`settlement.amount` USDT0) · tx hash (→ X Layer explorer). Sortable by time. Empty state: `EmptyState` "No calls yet — run one in the Guard →" linking `/guard`.

**Key data sources**:
- `getRecentCalls()` from `src/lib/data/activity.ts` — feeds the table and the honest total. Shape per row: `{ timestamp, tokenSymbol, tokenAddress, chain, sizeUsd, verdict, feeUsdt, txHash, explorerUrl }`.

**Key interactions**:
- Click a row's tx hash → X Layer explorer.
- Click a row → deep-link to `/guard?token=…&size=…` replaying that verdict.

**Empty state strategy**: `EmptyState` component with CTA to `/guard`. Because volume is builder-driven, an empty or 3-row feed is *fine and honest* — the layout must look intentional at low counts (cards, not a sparse enterprise table).

**Mobile collapse strategy**: Table → stacked `CallFeedRow` cards below `md`.

**Loading state**: None (mock renders instantly).

---

## 3. Data contract (what `src/lib/data/*` must produce)

`src/lib/data/*` does not exist yet — the **mock-data step must author it to this contract**, keyed 1:1 to the PRD §5 tool schema so the same objects feed `/guard`, `/`, `/agents`, and `/activity` without divergence.

| Module | Function | Returns | Feeds |
|--------|----------|---------|-------|
| `hero-tokens.ts` | `getHeroTokens()` | `HeroToken[]` `{ address, symbol, name, chain (CAIP-2), chainLabel, quoteAsset, defaultSizeUsd, illiquid:true }` | `HeroTokenPicker`, landing copy |
| `verdict.ts` | `computeVerdict(input)` | full output schema (deterministic per token+size — powers the live slider) | `/guard` sections 1–4, landing teaser |
| `verdict.ts` | `getSampleVerdict(symbol, sizeUsd)` | one canned BLOCK response | landing teaser, `/agents` annotated response |
| `verdict.ts` | `getVerdict(input)` | real endpoint verdict if live, else `computeVerdict()` | `/guard` data adapter |
| `settlement.ts` | `runPaidCheck(input)` | real 402→settle receipt (with mock fallback) | `SettlementReceipt` |
| `settlement.ts` | `getSettlementReceipt()` | canned receipt `{ steps, amount, asset:"USDT0", chain:"eip155:196", txHash, explorerUrl, latencyMs }` | `SettlementReceipt` fallback |
| `activity.ts` | `getRecentCalls()` | `CallRow[]` (modest, honest count) | `/activity`, landing honest stat |
| `tool-contract.ts` | `getToolContract()` | `{ inputSchema, outputSchema, price, snippets[] }` | `/agents` `ToolContractTable` + `CodeSnippet` |

**Verdict model requirement (for `computeVerdict`):** must implement PRD §6 thresholds so the slider produces a *continuous* OK→WARN→BLOCK transition on the hero tokens:
- `OK` — `slippage_to_exit_bps < 200` AND `pct_of_available_liquidity < 25`
- `WARN` — slippage 200–1000 OR pct 25–50
- `BLOCK` — slippage > 1000 OR pct ≥ 50
- `recommended_max_size_usd` = the size that clears back to WARN.
- Hero token(s) must hit **BLOCK at their `defaultSizeUsd` (~$50k)** and flip to **WARN/OK near ~$6k** so the demo lands deterministically.

---

## 4. Reusable components

### Core (the 6 that carry the product — build these first)

| Component | Used in | Consumes (schema fields) | Notes |
|-----------|---------|--------------------------|-------|
| `VerdictBadge` | `/guard`, `/`, `/activity` | `verdict`, `reason` | BLOCK/WARN/OK color-coded pill. Big variant (guard/landing) + compact (feed). The screenshot's headline. |
| `DepthCurveChart` | `/guard`, `/` (mini) | `depth_curve[]`, `impact_band_bps`, `venues_probed`, `quote_block` | The auditable centerpiece. Size→realizable + slippage series, intended-size marker, AEL band, OK/WARN/BLOCK zones. |
| `ExitLiquidityGauge` | `/guard`, `/` | `pct_of_available_liquidity`, `available_exit_liquidity_usd`, `you_are_the_exit_liquidity` | Arc/needle; lights "YOU ARE THE EXIT LIQUIDITY" at ≥50%. The viral visual. |
| `SettlementReceipt` | `/guard` | `settlement{asset,chain,amount}`, tx hash, explorer URL, latency | 402→sign→200 state strip + settled USDT0 row + X Layer link. The revenue proof. |
| `TokenSizeInput` | `/guard` | input schema `{token_address, chain, quote_asset, size, impact_band_bps}` | Slider + numeric size (drives live re-render) + chain/quote selectors + advanced impact band. |
| `HeroTokenPicker` | `/guard`, `/` | `getHeroTokens()` | Pre-loaded illiquid tokens as chips — guarantees a BLOCK lands on demo day. |

### Supporting

| Component | Used in | Notes |
|-----------|---------|-------|
| `VerdictSummaryCard` | `/guard` | The 3 headline stats: realizable / slippage / recommended max size. |
| `ThresholdBar` | `/guard` | Thin OK/WARN/BLOCK zone bar with a live marker for current size — makes the flip legible. |
| `DataCaveats` | `/guard` | Always-visible `data_caveats[]` list — honesty on-frame. |
| `HowItWorksStep` | `/` | agent → check → verdict → settle flow tile (×4). |
| `OKXListingBadge` | `/`, `/agents` | "Live on OKX.AI · A2MCP · $0.02/call" + listing link + Agent ID. |
| `CodeSnippet` | `/agents` | Tabbed (MCP / HTTP+x402) with copy button. |
| `ToolContractTable` | `/agents` | Input/output schema table (field · type · description). |
| `CallFeedRow` | `/activity`, `/` | One settled-call row/card. |
| `EmptyState` | `/activity`, `/guard` (bad token) | Illustration + CTA to `/guard`. |
| `Header` / `Footer` | global | See §5 Navigation. |
| `Toast` | global | from `sonner` — copy confirmations. |

**Count discipline:** 6 core + 11 supporting for a 4-route microsite. No generic `DataTable`, no `Modal`, no `Form` library scaffolding — the only form is `TokenSizeInput`, which is bespoke (a slider is the interaction, not a submit-form).

---

## 5. Navigation

### Header (global, all routes)
- **Logo / wordmark** "Exit-Liquidity Guard" (→ `/`)
- **Nav items**: **Guard** (`/guard`) · **For Agents** (`/agents`) · **Activity** (`/activity`, only if it ships)
- **Right side**: `OKXListingBadge` (compact) + primary CTA **Run the Guard →** (`/guard`)
- **Mobile**: collapse nav to a hamburger; keep the **Run the Guard** CTA visible.

### Sidebar
- **None.** A 4-route public microsite does not warrant a sidebar or app shell chrome. Header nav is sufficient.

### Breadcrumbs
- **None.** Flat routing, no nesting.

### Footer (global, minimal — hackathon)
- Project name + one-line tagline ("Can you actually sell it?")
- Links: **OKX.AI listing** · **For Agents** (`/agents`) · **GitHub** (if public) · **#OKXAI** post
- Chain/settlement note: "Settlement: USDT0 on X Layer (`eip155:196`)."
- Honest disclaimer: "Inspect-only. Routed on-chain DEX venues; not financial advice."

---

## 6. Routing patterns (Next.js App Router)

### Route groups
- **None required.** All routes are public. Optional cosmetic grouping `(marketing)` for `/` + `/agents` if it helps colocate a shared marketing layout — not necessary. Default: flat `app/page.tsx`, `app/guard/page.tsx`, `app/agents/page.tsx`, `app/activity/page.tsx`.

### Dynamic routes
- **None.** No `[id]` segments needed.

### Query params (not dynamic segments)
- `/guard?token=<addr|symbol>&size=<usd>&chain=<caip2>` — a **shareable verdict permalink** (the Social-Buzz "share a BLOCK" moment; also how `/activity` rows deep-link back). Parsed on `/guard` mount to prefill `TokenSizeInput`. 🟡 light stretch — the base `/guard` works without it.

### Parallel / intercepting routes
- **None.** No modal-over-list UX. Simple full-page routes for hackathon clarity (per guardrail).

### loading / error / not-found
- `loading.tsx` — **skip.** Mock/local-model renders are synchronous. The only async is **Run paid check**, whose wait is rendered *inside* `SettlementReceipt` (the 402→200 animation), not a route-level spinner.
- `error.tsx` — **one root-level** error boundary is sufficient.
- `not-found.tsx` — friendly 404 → "That page slipped past the guard" + CTA back to `/guard`.

---

## 7. Responsive strategy

**Breakpoints** (Tailwind defaults): `sm` 640 · `md` 768 · `lg` 1024 (**primary design target for `/guard`**) · `xl` 1280.

**Mobile-first?** **Split by route, deliberately:**
- `/` and `/agents` → **mobile-first** (the X share link and the CT audience open on phones; these must look great small).
- `/guard` → **desktop-first** (the PRD §13 "legible screenshot" and the 90s screen-recorded demo are captured on a wide viewport; mobile is a graceful degrade, not the design driver).

**Touch targets**: min 44×44px — matters most for the `/guard` size slider handle and hero-token chips on mobile.

**Mobile-specific patterns**:
- Header nav → hamburger; keep the **Run the Guard** CTA persistent.
- `/guard` two-pane → single column: controls on top, verdict canvas below.
- `DepthCurveChart` → simplified single-series (realizable vs size) + horizontal scroll below `md`; keep `VerdictBadge`, `ExitLiquidityGauge`, `ThresholdBar`, and `SettlementReceipt` full-width and legible (these are the share-worthy frames).
- `ToolContractTable` and the activity table → stacked cards below `md`.

**Do not over-invest in mobile for `/guard`.** The deliverable is a laptop-captured video + a legible desktop screenshot. Mobile must not break, but pixel-perfecting the mobile chart is not worth spec ink here.

---

## 8. Demo path verification (PRD §10 timeline → routes)

| Time | Demo moment (PRD §10) | Route / surface used | Component(s) on screen | Must-land | Built? |
|------|------------------------|----------------------|------------------------|-----------|--------|
| 0–15s | Hook + problem: "agents size blind to exit" | `/` (or `/guard` hero if opening cold) | Hero, `VerdictBadge` teaser, `HowItWorksStep` | framing | ✅ |
| 15–45s | Call `exit_liquidity_check` for **$50k long of $XYZ**; render **live depth curve**; verdict **BLOCK** ("realize $18.5k, −63%, 82% of exit liquidity") | `/guard` | `HeroTokenPicker`, `TokenSizeInput`, `VerdictBadge`, `VerdictSummaryCard`, `ExitLiquidityGauge`, **`DepthCurveChart`** | #1 real curve | ✅ |
| 45–60s | **Scale size down live** → flips **WARN→OK at ~$6k** (continuity, not a lookup) | `/guard` (drag slider) | `TokenSizeInput` slider, `ThresholdBar`, `VerdictBadge` re-render | #2 ALLOW→BLOCK flip | ✅ |
| 60–75s | **USDT0 pay-per-call settling on the same screen** (402 → sign → PAYMENT-RESPONSE, X Layer ~200ms) | `/guard` (Run paid check) | **`SettlementReceipt`** + X Layer explorer link | #3 on-chain settle | ✅ |
| 75–90s | Impact / next: "one call stopped a 63% loss; next: Liquidation Pre-Check" | `/` close (or `/guard` summary) | Final CTA, roadmap line | close | ✅ |

**All 5 rows ✅ — demo path is unbroken.** The three PRD §10 must-lands (real curve · ALLOW→BLOCK flip · USDT0 settlement) all resolve to `/guard`, which is why `/guard` is the single highest-priority build. `/agents` and `/activity` are **not on the critical demo path** and can be stubbed or cut without breaking the video.

> ⚠️ **Build-order implication for the frontend-design skill:** build `/guard` first and to full fidelity; `/` second (owns the hook + close); `/agents` third (judge credibility, not video-critical); `/activity` last / cut-first.

---

## 9. Handoff

Invoke `frontend-design` with these context files:
1. `docs/DESIGN_BRIEF.md` — tone direction *(author before invoking; not yet present)*
2. `docs/DESIGN.md` / `DESIGN_REF.md` — brand technique reference *(author before invoking; not yet present)*
3. `docs/LAYOUT_SPEC.md` — **THIS file** — what to build, section-by-section, tied to the tool schema
4. `src/lib/data/*` — **author to the §3 data contract first**, then render from it

The skill now knows: **WHAT pages** (`/`, `/guard`, `/agents`, +stretch `/activity`), **WHAT sections per page** (with priority order), **WHICH schema field feeds each section**, **HOW they connect** (all CTAs funnel to `/guard`; the demo path resolves entirely on `/guard`), and **HOW they respond** (landing mobile-first, guard desktop-first). It styles per DESIGN_BRIEF + DESIGN.md.

**Non-negotiables to preserve while styling** (from PRD honesty guardrails): the raw `DepthCurveChart` and `DataCaveats` stay on-frame with every verdict; no vanity call-counter; the BLOCK verdict must read as *derived and auditable*, not an asserted badge.
