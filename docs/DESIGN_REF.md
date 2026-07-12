---
source_url: https://github.com/VoltAgent/awesome-design-md/tree/main/design-md/linear.app
raw_url: https://raw.githubusercontent.com/VoltAgent/awesome-design-md/main/design-md/linear.app/DESIGN.md
brand: linear.app
brand_slug: linear.app
fetch_date: 2026-07-08
fetch_status: SUCCESS (verbatim spec retrieved; note Linear's DESIGN.md is a marketing-site spec — it omits motion, table, and agent-prompt sections, distilled below from known Linear practice)
selected_by: AUTO mode — rank 1 in DESIGN_BRIEF §9 reference list
role: technique reference ONLY. docs/DESIGN_BRIEF.md remains the source of truth for tone, palette, and typography.
---

# DESIGN_REF — Linear (technique anchor for ExitGuard)

> This is a **reference for technique**, not a spec to copy literally. Linear's chrome — hairline
> grids, surface-ladder elevation without shadows, negative-tracked display type, interaction-only
> accent, disciplined 4px spacing — is the closest production example of the "confident stillness +
> restraint" backbone ExitGuard's Instrument-Grade Risk Terminal tone is built on (DESIGN_BRIEF §2).
> Take Linear's **structural logic**. Keep ExitGuard's own palette, fonts, and semantics.
> See "Conflict reconciliation" at the bottom before applying anything literally.

---

## 0. Why Linear, for ExitGuard specifically

ExitGuard is an instrument-grade risk terminal: a two-pane readout with a latching BLOCK/WARN/OK
verdict plate, an exit-liquidity gauge, and an oscilloscope depth curve. Linear is the reference
because it proves you can make a **dense, dark, technical** surface feel *quietly luxurious and
trustworthy* using almost no decoration — depth comes from stacked near-black surfaces and 1px
hairlines, never from glow or blur. That is exactly the anti-"AI-slop dark SaaS" discipline the
brief demands (§4, §7). Where Linear stops (it has no data-table, no numeric, no motion spec — it's
a marketing site), ExitGuard extends the same logic into instrument territory, distilled below.

---

## 1. Visual theme & atmosphere (verbatim)

- Aesthetic goal: **"dense, technical, and quietly luxurious"** through minimal decoration; the
  product UI screenshot is the visual anchor, not decorative imagery.
- Foundational canvas: **`#010102`** — near-pure black with a faint blue tint. **True black
  `#000000` is explicitly forbidden** as canvas.
- Depth is built from a surface ladder + hairline borders, **not** drop shadows or gradients.

**ExitGuard application:** the deep-black instrument base (`#0A0D12`) plays the same role as Linear's
canvas — let the data glow against it; treat the captured verdict readout as ExitGuard's equivalent
of Linear's "hero product screenshot" (brief §5 hero treatment: the hero *is* the readout).

---

## 2. Color roles (verbatim)

**Accent (interaction only):** lavender-blue `#5e6ad2` — appears **exclusively** on the wordmark,
focus rings, and primary CTAs, **never decoratively**.
- primary-hover: `#828fff`
- primary-focus / pressed: `#5e69d1`

**Surface ladder (4 steps, near-black, no shadows):**
- surface-1: `#0f1011`
- surface-2: `#141516`
- surface-3: `#18191a`
- surface-4: `#191a1b`

**Hairline borders (separate planes instead of shadows):**
- hairline: `#23252a`
- hairline-strong: `#34343a`
- hairline-tertiary: `#3e3e44`

**Text hierarchy:**
- primary: `#f7f8f8`
- secondary/tertiary muted: `#d0d6e0`, `#8a8f98`, `#62666d`

**The load-bearing lesson for ExitGuard:** the accent is *rationed* — one color, used only where the
user acts or where the system draws focus, never as fill. ExitGuard inherits this discipline exactly:
the cyan signal `#22D3EE` and the semantic trio (BLOCK/WARN/OK) are the *only* colors that ever
appear, and only on real signal (curve trace, live tick, verdict/zones) — never as chrome decoration
(brief §4). Everything else is monochrome near-black + hairlines.

---

## 3. Typography (verbatim)

- Display: Linear's custom sans, weights **500–700**, with **aggressive negative tracking**
  (**−3.0px at 80px**), scaling letter-spacing from −3.0px on the largest display down to **0 at body
  sizes**.
- Body: weight **400** in a related cut. "One continuous voice" despite the family shift.

**ExitGuard application (technique, not fonts):** keep the brief's stack — **Space Grotesk** display /
**Söhne** body / **IBM Plex Mono** data (brief §3). Borrow two techniques: (1) **tighten display
tracking** on the big verdict word and section labels so they read as engineered, not typed; (2)
maintain "one continuous voice" — micro-cap UPPERCASE labels with letter-spacing for the
instrument-panel feel, per brief §3/§5. Do NOT adopt Linear's font family.

---

## 4. Component stylings (verbatim)

**Buttons:**
- Primary: `#5e6ad2`, padding **8px 14px**, radius **8px** (rounded, NOT pill).
- Secondary/tertiary: shift background to surface-1 with ink text; same compact padding + radius.

**Cards:**
- Feature/pricing/testimonial: **surface-1**, **24px padding**, **12px corners**.
- Product-screenshot panels elevate to **16px corners**.

**Inputs:**
- surface-1 background, padding **8px 12px**, **2px focus ring** in primary-focus at **50% opacity**.

**ExitGuard application:** these compact specs map directly onto the input console (brief §5 left
pane). Use tight `8px 12px` field padding, surface-1 fills with hairline borders, and a **2px focus
ring** — but recolor the ring to the cyan signal `#22D3EE` (see reconciliation). Panels/cards for the
readout modules (verdict plate, gauge, receipt) sit on the elevated surface with hairline borders and
`12–16px` radii. Keep corners **rounded, never pill** — pill CTAs are on Linear's Don't list and read
as consumer/marketing, wrong for an instrument.

---

## 5. Layout & spacing (verbatim)

- Base unit **4px**. Spacing scale: **xxs 4 · xs 8 · sm 12 · md 16 · lg 24 · xl 32 · xxl 48 ·
  section 96**.
- Radius scale: **xs 4 · sm 6 · md 8 · lg 12 · xl 16 · xxl 24 · pill 9999**.
- Max content width **~1280px**. Grids collapse **3-up → 2-up → 1-up**.

**ExitGuard application:** adopt the 4px base and this exact spacing scale as the alignment grid for
the two-pane instrument (brief §5). Every number, unit chip, and hairline divider snaps to it — this
is what makes density read as "disciplined" rather than "cramped." Use `section: 96px` between the
console and the landing narrative blocks; use `md/lg (16/24px)` panel padding for readout modules.

---

## 6. Depth & elevation (verbatim)

- Depth derives from **surface-ladder lifts + 1px hairlines**, not drop shadows.
- Focus states: **2px outline** in primary-focus at **50% opacity**.

**ExitGuard application:** this is the single most important technique to steal. **No shadow-as-
decoration** (brief §4 already mandates this). Layer the readout by stepping the surface value up one
rung and drawing a 1px hairline — e.g. base `#0A0D12` → elevated panel `#12171F` → hairline
`#212A35` (brief's palette). Where ExitGuard needs more than two planes (verdict plate sitting above
a panel above the base), extend to a 3–4 step ladder using intermediate near-black values, exactly
like Linear's surface-1..4 — small luminance steps (~2–4 points), never a big jump.

---

## 7. Do's & Don'ts (verbatim, with ExitGuard read)

**Do**
- Reserve the darkest value as the system's anchor surface. → ExitGuard: `#0A0D12` is the anchor.
- Use the accent only for brand mark, primary CTA, focus ring, link emphasis. → ExitGuard: ration
  cyan + semantic trio to signal only.
- Leverage the four-step surface ladder for hierarchy. → extend ExitGuard's 2 surfaces toward a
  ladder for the stacked verdict/panel/base planes.
- Apply aggressive negative letter-spacing on display type. → tighten the verdict word + labels.
- Lead sections with product UI (screenshots). → ExitGuard's hero **is** the captured readout.

**Don't**
- Ship light-mode. (ExitGuard is dark-only — aligned.)
- Use the accent as section background or card fill. (Never flood cyan/green as chrome.)
- Introduce secondary chromatic accents. → ExitGuard's exception is *earned*: the semantic trio is
  signal, not decoration; treat it as Linear treats its one accent — rationed and meaningful.
- Add atmospheric gradients or spotlight cards. → matches brief's hard "NO glassmorphism / NO violet
  hero glow" rule (§4).
- Use true black `#000000` as canvas. → ExitGuard uses `#0A0D12`, not `#000`. Aligned.
- Pill-round CTAs. → keep 8–12px radii on buttons.

---

## 8. Motion — NOT DOCUMENTED in Linear's DESIGN.md (distilled from known Linear practice)

Linear's marketing spec carries **no** transition durations or easing. Distilled from Linear's actual
product behaviour, and reconciled with brief §6:
- **Motion only encodes a real state change.** No parallax, no ambient shimmer, no floating orbs.
  Stillness = trustworthiness. This is Linear's core motion philosophy and ExitGuard's §6 verbatim.
- Transitions are **short and physical** (snappy springs, ~120–180ms), not slow cross-fades — a relay
  closing, not a dissolve. Use this for the verdict hard-latch.
- Reserve the one animated "reveal" for the moment that matters (Linear animates its hero UI on
  scroll-in): ExitGuard's equivalents are the measuring scanline + cyan trace draw, the ALLOW→BLOCK
  scrubber, and the USDT0 settlement stamp (brief §6). Everything else holds still.

---

## 9. Tables / data / dense readouts — NOT DOCUMENTED (distilled for ExitGuard)

Linear's DESIGN.md has no table, numeric, or dense-readout section (it's a marketing site). ExitGuard
extends the same restraint into instrument territory:
- **Numbers live in mono with `tabular-nums`** so columns align on a shared baseline (brief §3) — the
  depth ladder (size / slippage_bps / realizable_usd rungs), gauge %, recommended max, USDT0 amount.
  This is the ExitGuard analogue of Linear's "one continuous voice": one numeric voice, always
  column-aligned.
- **Row separation by hairline, not by zebra fill or shadow** — carry Linear's plane-separation logic
  into the depth-ladder table: 1px `#212A35` dividers, no alternating background.
- **Badges / verdict plate:** the annunciator plate is the one place a semantic color owns a surface
  (BLOCK red floods the plate). Treat it like Linear treats its focus ring — a deliberate, singular,
  high-meaning use of color. Small inline status badges (venue chips, "settled" tick) get a hairline
  outline + mono micro-cap label, colored only by semantic/signal role.
- **Gauge / depth curve:** the surface-ladder + hairline grid becomes the oscilloscope's dark
  measurement grid; the cyan trace is the *only* bright stroke on it — Linear's "one rationed accent"
  applied to data-viz. Verdict zones (green→amber→red) shade the band; nothing else glows.

---

## Conflict reconciliation with DESIGN_BRIEF

The Linear reference has decisions that DIFFER from the ExitGuard brief. In every case the **brief
wins on palette/font/semantics**; Linear contributes **technique** only.

- **Accent color — CONFLICT.** Linear's accent is lavender-blue `#5e6ad2` (a purple-indigo). The
  brief **explicitly forbids purple/indigo** ("NO purple gradient. NO indigo-to-pink", §4).
  → **Use ExitGuard's cyan signal `#22D3EE`** (and the semantic trio) wherever Linear would use
  lavender — focus rings, live tick, primary action. **Take Linear's *logic*** (accent rationed to
  interaction + focus only, never decorative fill), **not its hue.**

- **Canvas / surfaces — reconcilable.** Linear canvas `#010102`; ExitGuard `#0A0D12`. Both reject
  true black. → **Keep the brief's palette** (`#0A0D12` base, `#12171F` elevated, `#212A35`
  hairline); **borrow Linear's 4-step surface-ladder concept** to add intermediate planes when the
  verdict-plate/panel/base stack needs more than two levels.

- **Typography — CONFLICT (family).** Linear uses its custom sans throughout. The brief specifies
  **Space Grotesk / Söhne / IBM Plex Mono** (§3). → **Use the brief's fonts.** Borrow only Linear's
  *techniques*: aggressive negative display tracking + "one continuous voice." ExitGuard adds a mono
  data voice Linear doesn't have — that's the instrument requirement, keep it.

- **Card radii / padding — adopt as-is.** Linear's compact `8px 12–14px` padding, `8px` buttons,
  `12–16px` cards, `2px` focus ring, no-pill rule all transfer cleanly and reinforce the instrument
  feel. Only recolor the focus ring cyan.

- **Content model — CONFLICT of purpose (informative, not blocking).** Linear is a marketing site
  optimized around a hero screenshot and 3-up feature grids. ExitGuard is a **two-pane instrument**
  (input console + readout), not a marketing stack (brief §5). → Keep ExitGuard's layout; take
  Linear's **spacing grid, elevation model, and restraint**, not its page rhythm.

**Bottom line:** Linear is the reference for *how to build disciplined dark chrome without decoration*
(surface ladder, hairlines-not-shadows, rationed accent, tight 4px grid, negative-tracked display,
no-pill compact components). It is **not** a source for color, type family, or layout — those come
from DESIGN_BRIEF.md, which stays the source of truth.
