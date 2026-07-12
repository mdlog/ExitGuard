// Route: `/agents` — For agents (MCP integration story). LAYOUT_SPEC §2.
// Server component: tool contract + code + a live sample response + callers.

import Link from "next/link";
import { getHeroCheck, getStats, getTopAgents } from "@/lib/data";
import { usd, usdCompact } from "@/lib/format";

const MCP_SNIPPET = `// Any MCP client (Claude Code, Codex, Hermes, OpenClaw)
const check = await mcp.call("exit_liquidity_check", {
  token_address: "0x6982…B1933",  // the token you'd hold
  chain:         "eip155:8453",    // analysis chain (Base)
  size_usd:      50000,            // intended position size
  side:          "long",           // long = you must SELL to exit
});

// x402 handshake happens under the hood:
//   402 Payment Required  →  Agentic Wallet signs $0.02 USDT0 on X Layer  →  200
if (check.verdict === "BLOCK") {
  abort(check.reason);             // don't become the exit liquidity
}`;

const HTTP_SNIPPET = `POST /v1/exit_liquidity_check           HTTP/1.1
Host: exitguard.asp.okx.ai
Content-Type: application/json

→ 402 Payment Required
  x402: scheme=exact; amount=0.02; asset=USDT0; chain=eip155:196
→ [Agentic Wallet signs the payment payload]
← 200 OK   (X-PAYMENT-RESPONSE: settled 0x…)   { verdict: "BLOCK", … }`;

const INPUT_SCHEMA = [
  { f: "token_address", t: "string", d: "Token the agent intends to hold.", req: true },
  { f: "chain", t: "CAIP-2", d: "Analysis chain (EVM or Solana). Decoupled from settlement.", req: true },
  { f: "size_usd", t: "number", d: "Intended position / exit notional in USD.", req: true },
  { f: "side", t: '"long" | "short"', d: "long ⇒ must sell to exit (MVP). Default long.", req: false },
  { f: "quote_asset", t: "string", d: "Asset to exit into. Default USDC.", req: false },
  { f: "impact_band_bps", t: "number", d: "How far to walk the book for available liquidity. Default 3000.", req: false },
];

const OUTPUT_SCHEMA = [
  { f: "verdict", t: '"BLOCK" | "WARN" | "OK"', d: "The gate. BLOCK ⇒ do not enter." },
  { f: "realizable_exit_value_usd", t: "number", d: "What the agent actually gets back exiting at size." },
  { f: "slippage_to_exit_bps", t: "number", d: "Cost of exiting, in basis points." },
  { f: "pct_of_available_liquidity", t: "number", d: "Your size as a share of the routed sell-side book." },
  { f: "you_are_the_exit_liquidity", t: "boolean", d: "true when your own unwind is the market (≥50%)." },
  { f: "available_exit_liquidity_usd", t: "number", d: "Routed sell-side depth (on-chain pool reserves)." },
  { f: "recommended_max_size_usd", t: "number", d: "Largest size that clears back to OK." },
  { f: "depth_curve", t: "DepthCurvePoint[]", d: "Auditable slippage ladder — the probed quotes." },
  { f: "settlement", t: "Settlement", d: "x402 receipt: USDT0 / X Layer / tx hash." },
];

function CodeBlock({ label, code }: { label: string; code: string }) {
  return (
    <div className="xg-panel overflow-hidden">
      <div className="flex items-center justify-between border-b border-xg-line px-4 py-2.5">
        <span className="xg-label">{label}</span>
        <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--xg-signal)" }} />
      </div>
      <pre className="overflow-x-auto p-4 font-mono text-[12px] leading-relaxed text-xg-ink">
        <code>{code}</code>
      </pre>
    </div>
  );
}

export default async function AgentsPage() {
  const [hero, agents, stats] = await Promise.all([getHeroCheck(), getTopAgents(), getStats()]);

  return (
    <main className="mx-auto max-w-[1240px] px-5 py-12">
      {/* header */}
      <div className="flex flex-col gap-4 border-b border-xg-line pb-8 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="xg-label mb-2">For agents · MCP integration</div>
          <h1 className="xg-display text-3xl leading-none text-xg-ink md:text-4xl">
            ONE GATE BEFORE YOUR AGENT SIGNS
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-xg-dim">
            <code className="text-[color:var(--xg-signal)]">exit_liquidity_check</code> is an MCP-native
            tool on the OKX.AI marketplace. Call it, pay per call, get a verdict. No SDK lock-in — any
            MCP client works.
          </p>
        </div>
        <div className="flex shrink-0 gap-6 font-mono text-[11px]">
          {[
            ["Price", "$0.02 / call"],
            ["Scheme", "x402 · exact"],
            ["Settles", "USDT0 · X Layer"],
          ].map(([k, v]) => (
            <div key={k} className="flex flex-col gap-1">
              <span className="xg-label">{k}</span>
              <span className="tnum text-xg-ink">{v}</span>
            </div>
          ))}
        </div>
      </div>

      {/* code */}
      <section className="mt-10 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <CodeBlock label="MCP call" code={MCP_SNIPPET} />
        <CodeBlock label="Wire · HTTP + x402" code={HTTP_SNIPPET} />
      </section>

      {/* schemas */}
      <section className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="xg-panel">
          <div className="border-b border-xg-line px-4 py-2.5"><span className="xg-label">Input</span></div>
          <div className="divide-y divide-xg-line/70">
            {INPUT_SCHEMA.map((r) => (
              <div key={r.f} className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[12.5px] text-xg-ink">{r.f}</span>
                  <span className="font-mono text-[10px] text-xg-faint">{r.t}</span>
                  {r.req && <span className="ml-auto font-mono text-[9px] tracking-[0.1em] text-[color:var(--xg-warn)]">REQUIRED</span>}
                </div>
                <p className="mt-1 text-[11.5px] leading-snug text-xg-dim">{r.d}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="xg-panel">
          <div className="border-b border-xg-line px-4 py-2.5"><span className="xg-label">Output</span></div>
          <div className="divide-y divide-xg-line/70">
            {OUTPUT_SCHEMA.map((r) => (
              <div key={r.f} className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[12.5px] text-xg-ink">{r.f}</span>
                  <span className="font-mono text-[10px] text-xg-faint">{r.t}</span>
                </div>
                <p className="mt-1 text-[11.5px] leading-snug text-xg-dim">{r.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* live sample response */}
      <section className="mt-4">
        <div className="xg-panel overflow-hidden">
          <div className="flex items-center justify-between border-b border-xg-line px-4 py-2.5">
            <span className="xg-label">Sample 200 response · $50k $TPEPE</span>
            <span className="font-mono text-[10px]" style={{ color: "var(--xg-block)" }}>BLOCK</span>
          </div>
          <pre className="max-h-[360px] overflow-auto p-4 font-mono text-[11.5px] leading-relaxed text-xg-dim">
            <code>{JSON.stringify(hero, null, 2)}</code>
          </pre>
        </div>
      </section>

      {/* callers */}
      <section className="mt-10">
        <div className="flex items-end justify-between">
          <span className="xg-label">Agents calling the gate</span>
          <span className="font-mono text-[10px] text-xg-faint">
            {stats.uniqueAgents} agents · {usdCompact(stats.totalUsdt0Settled)} settled
          </span>
        </div>
        <div className="mt-4 overflow-hidden rounded-[4px] border border-xg-line">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-xg-line bg-xg-raised/40">
                {["Agent", "Type", "Calls", "Blocks", "USDT0 spent"].map((h) => (
                  <th key={h} className="px-4 py-2.5 xg-label font-normal">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-xg-line/60">
              {agents.map((a) => (
                <tr key={a.id} className="font-mono text-[12px]">
                  <td className="px-4 py-3 text-xg-ink">{a.handle}</td>
                  <td className="px-4 py-3 text-xg-dim">{a.type}</td>
                  <td className="tnum px-4 py-3 text-xg-ink">{a.callsMade.toLocaleString('en-US')}</td>
                  <td className="tnum px-4 py-3" style={{ color: "var(--xg-block)" }}>{a.blocksReceived.toLocaleString('en-US')}</td>
                  <td className="tnum px-4 py-3 text-xg-ink">{usd(a.totalUsdt0Spent, 2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* roadmap + cta */}
      <section className="mt-10 flex flex-col items-start justify-between gap-6 border-t border-xg-line pt-8 md:flex-row md:items-center">
        <div>
          <span className="xg-label">Next endpoints</span>
          <p className="mt-2 max-w-xl font-mono text-[12px] text-xg-dim">
            exit_liquidity_check → liquidation_precheck → funding_carry → unwind_cost.
            One microstructure risk oracle for autonomous agents.
          </p>
        </div>
        <Link
          href="/guard"
          className="group inline-flex shrink-0 items-center gap-2 rounded-[4px] bg-xg-ink px-5 py-3 font-mono text-[13px] tracking-[0.04em] text-xg-bg transition-opacity hover:opacity-90"
        >
          TRY IT IN THE TERMINAL
          <span className="transition-transform group-hover:translate-x-0.5">→</span>
        </Link>
      </section>
    </main>
  );
}
