import Link from 'next/link'
import { LiveStatus } from './LiveStatus'

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="rounded-[3px] px-2.5 py-1.5 font-mono text-[11px] tracking-[0.06em] text-xg-dim transition-colors hover:bg-xg-raised hover:text-xg-ink"
    >
      {children}
    </Link>
  )
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-xg-line bg-xg-bg/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1240px] items-center justify-between px-5 py-3">
        <Link href="/" className="flex items-center gap-2.5">
          <span
            className="xg-lamp h-2 w-2 rounded-full"
            style={{ color: 'var(--xg-ok)', background: 'var(--xg-ok)' }}
          />
          <span className="xg-display text-sm text-xg-ink">EXITGUARD</span>
          <span className="hidden font-mono text-[10px] tracking-[0.16em] text-xg-faint sm:inline">
            {"// EXIT-LIQUIDITY ASP"}
          </span>
        </Link>
        <nav className="flex items-center gap-1">
          <NavLink href="/guard">Terminal</NavLink>
          <NavLink href="/agents">For Agents</NavLink>
          <LiveStatus />
        </nav>
      </div>
    </header>
  )
}
