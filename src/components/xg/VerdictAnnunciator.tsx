'use client'

import type { Verdict } from '@/lib/types'
import { verdictMeta } from '@/lib/format'
import { cn } from '@/lib/utils'

const ORDER: Verdict[] = ['OK', 'WARN', 'BLOCK']
const LAMP_COLOR: Record<Verdict, string> = {
  OK: 'var(--xg-ok)',
  WARN: 'var(--xg-warn)',
  BLOCK: 'var(--xg-block)',
}

/**
 * The annunciator. A 3-lamp indicator rail (only the live verdict lit) beside
 * the engraved verdict word. Re-keyed on `verdict` so the relay-latch flash
 * replays on every band crossing — the signature "it just snapped" moment.
 */
export function VerdictAnnunciator({
  verdict,
  reason,
}: {
  verdict: Verdict
  reason?: string
}) {
  const m = verdictMeta(verdict)

  return (
    <div className="flex items-stretch gap-5">
      {/* annunciator lamp rail */}
      <div className="flex flex-col justify-center gap-2 border-r border-xg-line pr-5">
        {ORDER.map((v) => {
          const on = v === verdict
          return (
            <div key={v} className="flex items-center gap-2.5">
              <span
                className={cn('h-2.5 w-2.5 rounded-full transition-all duration-200', on && 'xg-lamp', on && v === 'BLOCK' && 'xg-anim-breathe')}
                style={{
                  color: on ? LAMP_COLOR[v] : 'transparent',
                  background: on ? LAMP_COLOR[v] : 'transparent',
                  border: on ? undefined : '1px solid var(--xg-faint)',
                }}
              />
              <span
                className="font-mono text-[10px] tracking-[0.18em]"
                style={{ color: on ? LAMP_COLOR[v] : 'var(--xg-faint)' }}
              >
                {v}
              </span>
            </div>
          )
        })}
      </div>

      {/* engraved word + status */}
      <div className="min-w-0 flex-1">
        <div key={verdict} className="xg-anim-latch">
          <div
            className="xg-display leading-[0.85]"
            style={{ color: m.colorVar, fontSize: 'clamp(3rem, 7vw, 5.25rem)' }}
          >
            {m.word}
          </div>
        </div>
        <div className="mt-2 font-mono text-[11px] tracking-[0.14em]" style={{ color: m.colorVar }}>
          {m.status}
        </div>
        {reason && (
          <p className="mt-2.5 max-w-prose text-[12.5px] leading-relaxed text-xg-dim">{reason}</p>
        )}
      </div>
    </div>
  )
}
