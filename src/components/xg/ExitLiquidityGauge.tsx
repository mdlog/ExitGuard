'use client'

import { usdCompact } from '@/lib/format'
import { cn } from '@/lib/utils'

const SEGMENTS = 44

/** pct thresholds mirror verdictFor(): >=50 BLOCK, >=25 WARN, else OK. */
function zoneColor(p: number): string {
  if (p >= 50) return 'var(--xg-block)'
  if (p >= 25) return 'var(--xg-warn)'
  return 'var(--xg-ok)'
}

/**
 * "You are X% of the available exit liquidity." A zoned segmented meter (VU-style)
 * that fills toward the red dominance band. When you cross 50% you ARE the exit
 * liquidity — a dedicated annunciator lights. This is the number that sells it.
 */
export function ExitLiquidityGauge({
  pct,
  aelUsd,
  youAreExit,
}: {
  pct: number
  aelUsd: number
  youAreExit: boolean
}) {
  const clamped = Math.max(0, Math.min(100, pct))
  const color = zoneColor(clamped)

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-end justify-between">
        <span className="xg-label">Exit-liquidity dominance</span>
        <div className="flex items-baseline gap-1.5">
          <span className="tnum font-mono text-2xl leading-none" style={{ color }}>
            {clamped.toFixed(clamped < 10 ? 1 : 0)}
          </span>
          <span className="font-mono text-sm" style={{ color }}>%</span>
        </div>
      </div>

      {/* segmented meter */}
      <div className="relative">
        <div className="flex gap-[2px]">
          {Array.from({ length: SEGMENTS }).map((_, i) => {
            const segPct = (i / SEGMENTS) * 100
            const lit = segPct < clamped
            return (
              <div
                key={i}
                className="h-7 flex-1 rounded-[1px] transition-colors duration-150"
                style={{
                  background: lit ? zoneColor(segPct) : 'var(--xg-raised)',
                  opacity: lit ? (segPct >= 50 ? 1 : 0.85) : 1,
                  boxShadow: lit && segPct >= 50 ? '0 0 6px 0 color-mix(in oklab, var(--xg-block) 45%, transparent)' : undefined,
                }}
              />
            )
          })}
        </div>
        {/* live marker */}
        <div
          className="pointer-events-none absolute -top-1 bottom-[-4px] w-px"
          style={{ left: `${clamped}%`, background: color }}
        >
          <div className="absolute -top-1 -translate-x-1/2 h-1.5 w-1.5 rotate-45" style={{ background: color }} />
        </div>
        {/* zone boundary ticks at 25 / 50 */}
        {[25, 50].map((b) => (
          <div key={b} className="absolute -bottom-1 top-0 w-px bg-xg-void/70" style={{ left: `${b}%` }} />
        ))}
      </div>

      {/* scale */}
      <div className="relative h-3 font-mono text-[9px] tracking-[0.12em] text-xg-faint">
        <span className="absolute left-0">0</span>
        <span className="absolute -translate-x-1/2" style={{ left: '25%', color: 'var(--xg-warn)' }}>25 · WARN</span>
        <span className="absolute -translate-x-1/2" style={{ left: '50%', color: 'var(--xg-block)' }}>50 · BLOCK</span>
        <span className="absolute right-0">100</span>
      </div>

      <div className="flex items-center justify-between text-[11px]">
        <span className="text-xg-dim">
          of <span className="tnum font-mono text-xg-ink">{usdCompact(aelUsd)}</span> routed sell-side book
        </span>
      </div>

      {/* dominance annunciator */}
      <div
        className={cn(
          'flex items-center gap-2.5 rounded-[3px] border px-3 py-2 transition-all duration-200',
          youAreExit ? 'xg-anim-breathe' : '',
        )}
        style={{
          borderColor: youAreExit ? 'color-mix(in oklab, var(--xg-block) 55%, transparent)' : 'var(--xg-line)',
          background: youAreExit ? 'color-mix(in oklab, var(--xg-block) 11%, transparent)' : 'transparent',
        }}
      >
        <span
          className={cn('h-2 w-2 rounded-full', youAreExit && 'xg-lamp')}
          style={{
            color: youAreExit ? 'var(--xg-block)' : 'transparent',
            background: youAreExit ? 'var(--xg-block)' : 'transparent',
            border: youAreExit ? undefined : '1px solid var(--xg-faint)',
          }}
        />
        <span
          className="font-mono text-[10.5px] tracking-[0.14em]"
          style={{ color: youAreExit ? 'var(--xg-block)' : 'var(--xg-faint)' }}
        >
          {youAreExit ? 'YOU ARE THE EXIT LIQUIDITY — YOUR OWN UNWIND IS THE MARKET' : 'BELOW DOMINANCE THRESHOLD'}
        </span>
      </div>
    </div>
  )
}
