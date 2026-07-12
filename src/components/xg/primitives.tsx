import { cn } from '@/lib/utils'

/** A machined instrument panel: surface plate + hairline + optional micro-label header + corner ticks. */
export function Panel({
  label,
  aside,
  ticks = false,
  plate = false,
  className,
  bodyClassName,
  children,
}: {
  label?: string
  aside?: React.ReactNode
  ticks?: boolean
  plate?: boolean
  className?: string
  bodyClassName?: string
  children: React.ReactNode
}) {
  return (
    <section
      className={cn(
        'relative',
        plate ? 'xg-plate' : 'xg-panel',
        ticks && 'xg-ticks',
        className,
      )}
    >
      {(label || aside) && (
        <header className="flex items-center justify-between gap-3 border-b border-xg-line px-3.5 py-2.5">
          {label && <span className="xg-label">{label}</span>}
          {aside && <div className="flex items-center gap-2">{aside}</div>}
        </header>
      )}
      <div className={cn('p-3.5', bodyClassName)}>{children}</div>
    </section>
  )
}

/** An annunciator lamp — a lit indicator dot. Bloom appears only when active. */
export function Lamp({
  color,
  active = true,
  breathe = false,
  size = 8,
  className,
}: {
  color: string
  active?: boolean
  breathe?: boolean
  size?: number
  className?: string
}) {
  return (
    <span
      className={cn('inline-block shrink-0 rounded-full', active && 'xg-lamp', breathe && active && 'xg-anim-breathe', className)}
      style={{
        width: size,
        height: size,
        color: active ? color : 'transparent',
        background: active ? color : 'transparent',
        border: active ? undefined : `1px solid var(--xg-faint)`,
      }}
      aria-hidden
    />
  )
}

export function MicroLabel({ children, className }: { children: React.ReactNode; className?: string }) {
  return <span className={cn('xg-label', className)}>{children}</span>
}

/** Labeled mono readout — the instrument's atomic stat cell. */
export function Readout({
  label,
  value,
  unit,
  sub,
  color,
  emphatic = false,
  className,
}: {
  label: string
  value: React.ReactNode
  unit?: string
  sub?: React.ReactNode
  color?: string
  emphatic?: boolean
  className?: string
}) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <MicroLabel>{label}</MicroLabel>
      <div
        className={cn('tnum font-mono leading-none', emphatic ? 'text-[1.7rem]' : 'text-xl')}
        style={{ color: color ?? 'var(--xg-ink)' }}
      >
        {value}
        {unit && <span className="ml-1 text-xs text-xg-dim">{unit}</span>}
      </div>
      {sub && <div className="text-[11px] leading-tight text-xg-dim">{sub}</div>}
    </div>
  )
}

/** Thin divider matched to the hairline system. */
export function Rule({ className }: { className?: string }) {
  return <div className={cn('h-px w-full bg-xg-line', className)} />
}
