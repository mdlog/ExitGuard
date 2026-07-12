// Route: `/guard` — the money screen (interactive verdict + settlement).
// Spec: docs/LAYOUT_SPEC.md §2 + §8 (demo path). Server component loads the
// curated token set + the hero BLOCK, then hands off to the client console.

import type { Token } from "@/lib/data";
import { getTokens, getHeroCheck } from "@/lib/data";
import { GuardConsole } from "@/components/xg/GuardConsole";

// Curated demo spread — spans all three verdicts (BLOCK / WARN / OK), incl.
// PEPE (deep memecoin → OK, "not all memecoins block") and WIF (tips WARN at size).
const PICKER = ["TPEPE", "GIGA", "SDOGE", "DEGEN", "BRETT", "WETH", "PEPE", "WIF"];

export default async function GuardPage() {
  const [all, heroCheck] = await Promise.all([getTokens(), getHeroCheck()]);
  const bySymbol = new Map(all.map((t) => [t.symbol, t]));
  const picked = PICKER.map((s) => bySymbol.get(s)).filter(Boolean) as Token[];
  const tokens = picked.length >= 3 ? picked : all;

  return (
    <main className="mx-auto max-w-[1240px] px-5 py-8">
      <div className="mb-6 flex flex-col gap-3 border-b border-xg-line pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="xg-label mb-2">Exit-liquidity terminal · pre-trade check</div>
          <h1 className="xg-display text-3xl leading-none text-xg-ink md:text-4xl">
            CAN YOUR AGENT GET <span style={{ color: "var(--xg-signal)" }}>OUT</span>?
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-xg-dim">
            One call before your agent sizes a position. It probes the routed sell-side book,
            proves the realizable exit, and{" "}
            <span className="text-xg-ink">BLOCKs the trades where your own unwind becomes the market.</span>
          </p>
        </div>
        <div className="flex shrink-0 gap-6 font-mono text-[11px] text-xg-dim">
          <div className="flex flex-col gap-1">
            <span className="xg-label">Priced</span>
            <span className="tnum text-xg-ink">$0.02 / call</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="xg-label">Settled</span>
            <span className="text-xg-ink">USDT0 · X Layer</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="xg-label">Rail</span>
            <span className="text-xg-ink">x402 · A2MCP</span>
          </div>
        </div>
      </div>

      <GuardConsole tokens={tokens} initialCheck={heroCheck} />
    </main>
  );
}
