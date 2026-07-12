'use client'

import { usd } from '@/lib/format'

export type FaderMark = { value: number; color: string; label: string }

/**
 * Machined position-size fader. Native range underneath (keyboard + drag a11y),
 * fully custom instrument skin on top. Dragging it is what flips the verdict live.
 */
export function SizeFader({
  value,
  min,
  max,
  step,
  color,
  marks = [],
  onChange,
}: {
  value: number
  min: number
  max: number
  step: number
  color: string
  marks?: FaderMark[]
  onChange: (v: number) => void
}) {
  const span = Math.max(1, max - min)
  const posOf = (v: number) => ((Math.max(min, Math.min(max, v)) - min) / span) * 100
  const pos = posOf(value)

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between">
        <span className="xg-label">Position size (exit notional)</span>
        <span className="tnum font-mono text-2xl leading-none text-xg-ink">{usd(value)}</span>
      </div>

      <div className="relative h-7 select-none">
        {/* native input (invisible, drives interaction) — FIRST so it is the `peer` for the thumb's
            keyboard focus ring (WCAG 2.4.7). Its own default ring is invisible (opacity-0). */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          aria-label="Position size in USD"
          aria-valuetext={usd(value)}
          className="peer absolute inset-0 z-20 h-full w-full cursor-pointer opacity-0"
        />
        {/* track */}
        <div className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-xg-raised" />
        {/* fill */}
        <div
          className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full transition-[width] duration-75"
          style={{ left: 0, width: `${pos}%`, background: color }}
        />
        {/* marks */}
        {marks.map((mk) => (
          <div
            key={mk.label}
            className="absolute top-1/2 h-3.5 w-px -translate-y-1/2"
            style={{ left: `${posOf(mk.value)}%`, background: mk.color }}
            title={`${mk.label}: ${usd(mk.value)}`}
          />
        ))}
        {/* thumb — shows the focus ring when the peer input is keyboard-focused */}
        <div
          className="pointer-events-none absolute top-1/2 z-10 -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${pos}%` }}
        >
          <div
            className="h-5 w-3 rounded-[2px] border peer-focus-visible:[outline:2px_solid_var(--xg-signal)] peer-focus-visible:outline-offset-2"
            style={{ background: 'var(--xg-raised)', borderColor: color, boxShadow: `inset 0 0 0 1px color-mix(in oklab, ${color} 40%, transparent)` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between font-mono text-[10px] tracking-[0.1em] text-xg-faint">
        <span>{usd(min)}</span>
        {marks.map((mk) => (
          <span key={mk.label} style={{ color: mk.color }}>
            {mk.label}
          </span>
        ))}
        <span>{usd(max)}</span>
      </div>
    </div>
  )
}
