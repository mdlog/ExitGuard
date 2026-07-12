'use client'

import { useEffect, useState } from 'react'
import type { ExitLiquidityCheck } from '@/lib/types'
import { bpsToPct, shortHash, usd, usdCompact, verdictMeta } from '@/lib/format'
import { cn } from '@/lib/utils'
import { useReducedMotion } from '@/lib/use-reduced-motion'

/** Tiny inline depth sparkline (no chart lib) — hints at the auditable curve. */
function Sparkline({ check }: { check: ExitLiquidityCheck }) {
  const pts = check.depth_curve
  if (pts.length < 2) return <div className="h-10" />
  const W = 100
  const H = 34
  const maxSlip = Math.max(...pts.map((p) => p.slippage_bps), 1)
  const d = pts
    .map((p, i) => {
      const x = (i / (pts.length - 1)) * W
      const y = H - (p.slippage_bps / maxSlip) * (H - 3) - 1.5
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="h-10 w-full">
      <path d={`${d} L${W},${H} L0,${H} Z`} fill="color-mix(in oklab, var(--xg-signal) 12%, transparent)" />
      <path d={d} fill="none" stroke="var(--xg-signal)" strokeWidth={1.2} vectorEffect="non-scaling-stroke" />
      {pts.map((p, i) => {
        const x = (i / (pts.length - 1)) * W
        const y = H - (p.slippage_bps / maxSlip) * (H - 3) - 1.5
        return <circle key={i} cx={x} cy={y} r={1.4} fill="var(--xg-signal)" vectorEffect="non-scaling-stroke" />
      })}
    </svg>
  )
}

/**
 * The above-the-fold proof. Auto-cycles BLOCK → WARN → CLEAR precomputed checks
 * with the relay latch, so the landing demonstrates the product before a click.
 */
export function HeroVerdictCycler({ checks }: { checks: ExitLiquidityCheck[] }) {
  const [i, setI] = useState(0)
  const [paused, setPaused] = useState(false)
  const reduced = useReducedMotion()
  // Auto-cycle only when not paused (hover/focus) and the user hasn't asked to reduce motion
  // (WCAG 2.2.2 pause/stop + 2.3.3 reduced-motion respect).
  useEffect(() => {
    if (checks.length < 2 || paused || reduced) return
    const id = setInterval(() => setI((n) => (n + 1) % checks.length), 3400)
    return () => clearInterval(id)
  }, [checks.length, paused, reduced])

  const check = checks[i] ?? checks[0]
  const m = verdictMeta(check.verdict)
  const still = paused || reduced

  return (
    <div
      className="xg-plate xg-ticks relative overflow-hidden p-5"
      role="group"
      aria-label="Live exit-liquidity verdict demo, auto-cycling; hover or focus to pause"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div className="flex items-center justify-between">
        <span className="xg-label">Live verdict · exit_liquidity_check</span>
        <div className="flex items-center gap-2">
          <span className={cn('xg-lamp h-1.5 w-1.5 rounded-full', !still && 'xg-anim-breathe')} style={{ color: 'var(--xg-ok)', background: 'var(--xg-ok)' }} />
          <span className="font-mono text-[10px] tracking-[0.14em] text-xg-dim">{still ? 'PAUSED' : 'LIVE'}</span>
        </div>
      </div>

      <div key={i} className="xg-anim-latch mt-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="xg-display leading-[0.85]" style={{ color: m.colorVar, fontSize: 'clamp(2.4rem,6vw,3.4rem)' }}>
              {m.word}
            </div>
            <div className="mt-1.5 font-mono text-[10.5px] tracking-[0.12em]" style={{ color: m.colorVar }}>
              {m.status}
            </div>
          </div>
          <div className="text-right">
            <div className="font-mono text-sm text-xg-ink">${check.token_symbol}</div>
            <div className="tnum font-mono text-xs text-xg-dim">exit {usd(check.size_usd)}</div>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3 border-y border-xg-line py-3">
        <Cell k="Realizable" v={usdCompact(check.realizable_exit_value_usd)} />
        <Cell k="Slippage" v={bpsToPct(check.slippage_to_exit_bps)} color={m.colorVar} />
        <Cell k="% of book" v={`${check.pct_of_available_liquidity.toFixed(0)}%`} color={m.colorVar} />
      </div>

      <div className="mt-3">
        <div className="mb-1 flex items-center justify-between">
          <span className="xg-label">Depth curve</span>
          <span className="font-mono text-[9px] text-xg-faint">of {usdCompact(check.available_exit_liquidity_usd)} book</span>
        </div>
        <Sparkline check={check} />
      </div>

      <div className="mt-3 flex items-center justify-between font-mono text-[10px] text-xg-faint">
        <span className="flex items-center gap-1.5">
          {check.settlement.simulated ? 'simulated $0.02 USDT0 · X Layer' : 'settled $0.02 USDT0 · X Layer'}
          {check.settlement.simulated ? (
            <span
              className="rounded-[2px] border px-1 py-px text-[8px] tracking-[0.14em]"
              style={{ borderColor: 'var(--xg-warn)', color: 'var(--xg-warn)' }}
            >
              DEMO
            </span>
          ) : null}
        </span>
        <span className="tnum text-xg-faint">{shortHash(check.settlement.tx_hash)}</span>
      </div>

      {/* progress ticks */}
      <div className="mt-4 flex gap-1.5">
        {checks.map((_, idx) => (
          <span
            key={idx}
            className={cn('h-0.5 flex-1 rounded-full transition-colors', idx === i ? 'bg-[color:var(--xg-signal)]' : 'bg-xg-line')}
          />
        ))}
      </div>
    </div>
  )
}

function Cell({ k, v, color }: { k: string; v: string; color?: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="xg-label">{k}</span>
      <span className="tnum font-mono text-base" style={{ color: color ?? 'var(--xg-ink)' }}>{v}</span>
    </div>
  )
}
