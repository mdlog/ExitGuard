// Route: `/` — landing. CT / Social-Buzz surface (LAYOUT_SPEC §2).
// Server component: loads stats + a BLOCK/WARN/OK trio for the auto-cycling hero.

import Link from "next/link";
import type { ExitLiquidityCheck } from "@/lib/data";
import { getExitLiquidityChecks, getHeroCheck, getStats } from "@/lib/data";
import { usdCompact } from "@/lib/format";
import { HeroVerdictCycler } from "@/components/xg/HeroVerdictCycler";

export default async function LandingPage() {
  const [checks, hero, stats] = await Promise.all([
    getExitLiquidityChecks(),
    getHeroCheck(),
    getStats(),
  ]);

  const warn = checks.find((c) => c.verdict === "WARN");
  const ok = checks.find((c) => c.verdict === "OK");
  const cycle = [hero, warn, ok].filter(Boolean) as ExitLiquidityCheck[];

  return (
    <main className="mx-auto max-w-[1240px] px-5">
      {/* ─────────── hero ─────────── */}
      <section className="grid grid-cols-1 items-center gap-10 py-14 lg:grid-cols-[1.05fr_0.95fr] lg:py-20">
        <div className="xg-rise">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-xg-line px-3 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--xg-ok)" }} />
            <span className="font-mono text-[10px] tracking-[0.14em] text-xg-dim">
              OKX.AI AGENTIC SERVICE PROVIDER · LIVE
            </span>
          </div>
          <h1 className="xg-display text-[2.5rem] leading-[0.95] text-xg-ink sm:text-6xl">
            YOUR AGENT IS ABOUT TO BECOME THE{" "}
            <span style={{ color: "var(--xg-block)" }}>EXIT LIQUIDITY</span>.
          </h1>
          <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-xg-dim">
            ExitGuard is the seatbelt your trading agent calls{" "}
            <span className="text-xg-ink">before it signs</span>. One call proves whether it can
            actually get <span className="text-xg-ink">OUT</span> at size — and{" "}
            <span className="text-xg-ink">BLOCKs</span> the trades where its own unwind is the market.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/guard"
              className="group inline-flex items-center gap-2 rounded-[4px] bg-xg-ink px-5 py-3 font-mono text-[13px] tracking-[0.04em] text-xg-bg transition-opacity hover:opacity-90"
            >
              OPEN THE TERMINAL
              <span className="transition-transform group-hover:translate-x-0.5">→</span>
            </Link>
            <Link
              href="/agents"
              className="inline-flex items-center gap-2 rounded-[4px] border border-xg-line-bright px-5 py-3 font-mono text-[13px] tracking-[0.04em] text-xg-ink transition-colors hover:border-[color:var(--xg-signal)] hover:text-[color:var(--xg-signal)]"
            >
              READ THE TOOL CONTRACT
            </Link>
          </div>
          <p className="mt-5 font-mono text-[11px] text-xg-faint">
            pay-per-call · $0.02 USDT0 on X Layer via x402 · MCP-native
          </p>
        </div>

        <div className="xg-rise" style={{ animationDelay: "120ms" }}>
          <HeroVerdictCycler checks={cycle} />
        </div>
      </section>

      {/* ─────────── the trap ─────────── */}
      <section className="border-t border-xg-line py-16">
        <span className="xg-label">The trap</span>
        <h2 className="xg-display mt-3 max-w-3xl text-2xl leading-tight text-xg-ink sm:text-3xl">
          Every entry quote fills. That&rsquo;s exactly why your agent walks into positions it
          cannot exit.
        </h2>
        <div className="mt-10 grid grid-cols-1 gap-px overflow-hidden rounded-[4px] border border-xg-line bg-xg-line md:grid-cols-3">
          {[
            {
              n: "01",
              t: "Buy-side always fills",
              b: "The aggregator quote looks clean, so the agent sizes in. Entering is never the problem.",
              c: "var(--xg-ok)",
            },
            {
              n: "02",
              t: "It doesn't own the exit",
              b: "Sell-side depth is thin — often one pool. Nobody told the agent the way out is a keyhole.",
              c: "var(--xg-warn)",
            },
            {
              n: "03",
              t: "So it IS the exit liquidity",
              b: "Its own unwind moves the market against it. A nominal win becomes a trapped, illiquid bag.",
              c: "var(--xg-block)",
            },
          ].map((s) => (
            <div key={s.n} className="bg-xg-panel p-6">
              <div className="flex items-center gap-2.5">
                <span className="h-2 w-2 rounded-full" style={{ background: s.c }} />
                <span className="tnum font-mono text-xs" style={{ color: s.c }}>{s.n}</span>
              </div>
              <div className="mt-4 xg-display text-lg text-xg-ink">{s.t}</div>
              <p className="mt-2 text-[13px] leading-relaxed text-xg-dim">{s.b}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─────────── how it works ─────────── */}
      <section className="border-t border-xg-line py-16">
        <span className="xg-label">How one call works</span>
        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            { n: "01", t: "Called before it signs", b: "Any autonomous agent hits exit_liquidity_check(token, size) as a pre-trade gate — MCP-native." },
            { n: "02", t: "Probe the real book", b: "Sell quotes laddered at 0.25×–2× your size + on-chain pool reserves. Not a repriced buy quote." },
            { n: "03", t: "Verdict + audit trail", b: "BLOCK / WARN / OK with realizable exit, slippage, % of book, and the raw depth curve on screen." },
            { n: "04", t: "Settle pay-per-call", b: "$0.02 in USDT0 on X Layer via x402. Gas-free. The verdict releases on 200." },
          ].map((s) => (
            <div key={s.n} className="xg-panel p-5">
              <span className="tnum font-mono text-[11px] text-[color:var(--xg-signal)]">{s.n}</span>
              <div className="mt-3 xg-display text-base text-xg-ink">{s.t}</div>
              <p className="mt-2 text-[12.5px] leading-relaxed text-xg-dim">{s.b}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─────────── whitespace ─────────── */}
      <section className="border-t border-xg-line py-16">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
          <div>
            <span className="xg-label">Why nothing else catches this</span>
            <h2 className="xg-display mt-3 text-2xl leading-tight text-xg-ink sm:text-3xl">
              Everyone answers <span className="text-xg-dim">&ldquo;is this transaction safe?&rdquo;</span>
              <br />
              Nobody answers{" "}
              <span style={{ color: "var(--xg-signal)" }}>&ldquo;is this position exitable at my size?&rdquo;</span>
            </h2>
            <p className="mt-5 max-w-lg text-[13.5px] leading-relaxed text-xg-dim">
              Security scanners flag a malicious counterparty. Exit-liquidity is a different failure:
              an honest market that is simply too thin for <span className="text-xg-ink">you specifically</span>.
              A DEX aggregator returns a price — not a verdict. Slippage tolerance is a per-fill cap,
              not a pre-trade gate. The moat is the microstructure model, not the quote.
            </p>
          </div>
          <div className="flex flex-col gap-px overflow-hidden rounded-[4px] border border-xg-line bg-xg-line">
            {[
              { k: "OKX wallet firewall · CertiK", v: "tx safety", on: false },
              { k: "GoPlus · Blockaid · Blowfish", v: "tx safety", on: false },
              { k: "DEX aggregator quote", v: "a price", on: false },
              { k: "Slippage tolerance", v: "per-fill cap", on: false },
              { k: "ExitGuard", v: "exitable at size?", on: true },
            ].map((r) => (
              <div
                key={r.k}
                className="flex items-center justify-between bg-xg-panel px-4 py-3.5"
                style={r.on ? { background: "color-mix(in oklab, var(--xg-signal) 9%, var(--xg-panel))" } : undefined}
              >
                <span className={r.on ? "font-mono text-[13px] text-xg-ink" : "font-mono text-[13px] text-xg-dim"}>{r.k}</span>
                <span
                  className="font-mono text-[11px] tracking-[0.06em]"
                  style={{ color: r.on ? "var(--xg-signal)" : "var(--xg-faint)" }}
                >
                  {r.v}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────── stats ─────────── */}
      <section className="border-t border-xg-line py-16">
        <div className="flex items-end justify-between">
          <span className="xg-label">Since going live on OKX.AI</span>
          <span className="font-mono text-[10px] text-xg-faint">days-old marketplace · modest by design</span>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-[4px] border border-xg-line bg-xg-line lg:grid-cols-4">
          {[
            { k: "Checks served", v: stats.totalChecks.toLocaleString('en-US') },
            { k: "Exits blocked", v: stats.totalBlocked.toLocaleString('en-US'), c: "var(--xg-block)" },
            { k: "USDT0 settled", v: usdCompact(stats.totalUsdt0Settled) },
            { k: "Agents served", v: stats.uniqueAgents.toLocaleString('en-US') },
          ].map((s) => (
            <div key={s.k} className="bg-xg-panel p-6">
              <div className="tnum font-mono text-3xl" style={{ color: s.c ?? "var(--xg-ink)" }}>{s.v}</div>
              <div className="xg-label mt-2">{s.k}</div>
            </div>
          ))}
        </div>
        <p className="mt-4 max-w-2xl text-[11.5px] leading-relaxed text-xg-faint">
          Est. averted unwind loss on blocked trades: {usdCompact(stats.estUsdSaved)} — illustrative,
          derived from realized-vs-naive slippage on BLOCK verdicts. No vanity counter: value is complete
          in a single legible call.
        </p>
      </section>

      {/* ─────────── CTA ─────────── */}
      <section className="border-t border-xg-line py-20 text-center">
        <h2 className="xg-display mx-auto max-w-2xl text-3xl leading-tight text-xg-ink sm:text-4xl">
          Stop your agent from becoming the exit liquidity.
        </h2>
        <div className="mt-8 flex justify-center">
          <Link
            href="/guard"
            className="group inline-flex items-center gap-2 rounded-[4px] bg-xg-ink px-6 py-3.5 font-mono text-[13px] tracking-[0.04em] text-xg-bg transition-opacity hover:opacity-90"
          >
            RUN THE $50K $TPEPE CHECK
            <span className="transition-transform group-hover:translate-x-0.5">→</span>
          </Link>
        </div>
      </section>
    </main>
  );
}
