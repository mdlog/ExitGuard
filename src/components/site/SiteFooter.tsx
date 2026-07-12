import Link from 'next/link'

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-xg-line">
      <div className="mx-auto flex max-w-[1240px] flex-col gap-5 px-5 py-9 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full" style={{ background: 'var(--xg-ok)' }} />
            <span className="xg-display text-xs text-xg-ink">EXITGUARD</span>
          </div>
          <p className="max-w-sm font-mono text-[10.5px] leading-relaxed text-xg-faint">
            The seatbelt your trading agent calls before it becomes the exit liquidity.
            Built for the OKX.AI Genesis Hackathon.
          </p>
        </div>
        <div className="flex flex-col gap-2 font-mono text-[10px] tracking-[0.1em] text-xg-dim sm:items-end">
          <div className="flex gap-4">
            <Link href="/guard" className="hover:text-xg-ink">TERMINAL</Link>
            <Link href="/agents" className="hover:text-xg-ink">FOR AGENTS</Link>
          </div>
          <span>x402 · USDT0 · X LAYER (eip155:196)</span>
          <span className="text-xg-faint">MCP-NATIVE ASP · DEMO DATA · NOT FINANCIAL ADVICE</span>
        </div>
      </div>
    </footer>
  )
}
