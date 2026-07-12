'use client'

import {
  Area,
  ComposedChart,
  CartesianGrid,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { DepthCurvePoint, Verdict } from '@/lib/types'
import type { CurveSample } from '@/lib/data'
import { bpsToPct, usdCompact, verdictMeta } from '@/lib/format'

function CurveTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: CurveSample }> }) {
  if (!active || !payload?.length) return null
  const p = payload[0].payload
  const m = verdictMeta(p.verdict)
  return (
    <div className="xg-plate px-3 py-2 font-mono text-[11px]">
      <div className="tnum text-xg-ink">{usdCompact(p.size_usd)} exit</div>
      <div className="tnum mt-1 text-xg-dim">
        slip <span className="text-xg-ink">{bpsToPct(p.slippage_bps)}</span> · book{' '}
        <span className="text-xg-ink">{p.pct_of_liquidity.toFixed(0)}%</span>
      </div>
      <div className="mt-1 tracking-[0.12em]" style={{ color: m.colorVar }}>{m.word}</div>
    </div>
  )
}

/**
 * The auditable trace. Continuous cyan model line (sampled from the same slippage
 * engine) + the discrete probed quotes as dots — so the verdict reads as derived
 * microstructure math, not a repriced quote. Intended-size marker latches to the
 * verdict color; BLOCK/WARN thresholds drawn as reference lines.
 */
export function DepthCurveChart({
  samples,
  probes,
  intendedSize,
  intendedSlippageBps,
  verdict,
}: {
  samples: CurveSample[]
  probes: DepthCurvePoint[]
  intendedSize: number
  intendedSlippageBps: number
  verdict: Verdict
}) {
  const m = verdictMeta(verdict)
  const maxSize = samples.length ? samples[samples.length - 1].size_usd : intendedSize * 2

  const summary = `Exit-liquidity depth curve: at the intended exit size of ${usdCompact(intendedSize)}, slippage to exit is ${bpsToPct(intendedSlippageBps)} and the verdict is ${m.word}. Reference thresholds: WARN at 2% (200 bps), BLOCK at 10% (1000 bps).`
  return (
    <figure className="m-0">
      <div className="h-[240px] w-full" role="img" aria-label={summary}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={samples} margin={{ top: 12, right: 14, bottom: 4, left: 4 }}>
          <defs>
            <linearGradient id="xg-trace-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--xg-signal)" stopOpacity={0.22} />
              <stop offset="100%" stopColor="var(--xg-signal)" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid stroke="var(--xg-line)" strokeOpacity={0.5} vertical={false} />

          <XAxis
            dataKey="size_usd"
            type="number"
            domain={[0, maxSize]}
            tickFormatter={(v) => usdCompact(Number(v))}
            tick={{ fill: 'var(--xg-faint)', fontSize: 10, fontFamily: 'var(--font-mono)' }}
            stroke="var(--xg-line)"
            tickLine={false}
            minTickGap={44}
          />
          <YAxis
            dataKey="slippage_bps"
            domain={[0, (dataMax: number) => Math.ceil((dataMax * 1.12) / 500) * 500]}
            tickFormatter={(v) => bpsToPct(Number(v), 0)}
            tick={{ fill: 'var(--xg-faint)', fontSize: 10, fontFamily: 'var(--font-mono)' }}
            stroke="var(--xg-line)"
            tickLine={false}
            width={40}
          />

          <Tooltip content={<CurveTooltip />} cursor={{ stroke: 'var(--xg-line-bright)' }} />

          {/* threshold reference lines (verdict bands) */}
          <ReferenceLine y={200} stroke="var(--xg-warn)" strokeDasharray="2 4" strokeOpacity={0.55}
            label={{ value: 'WARN 2%', position: 'insideTopRight', fill: 'var(--xg-warn)', fontSize: 9, fontFamily: 'var(--font-mono)' }} />
          <ReferenceLine y={1000} stroke="var(--xg-block)" strokeDasharray="2 4" strokeOpacity={0.6}
            label={{ value: 'BLOCK 10%', position: 'insideTopRight', fill: 'var(--xg-block)', fontSize: 9, fontFamily: 'var(--font-mono)' }} />

          {/* the model trace */}
          <Area
            type="monotone"
            dataKey="slippage_bps"
            stroke="var(--xg-signal)"
            strokeWidth={1.75}
            fill="url(#xg-trace-fill)"
            isAnimationActive={false}
            dot={false}
            activeDot={{ r: 3, fill: 'var(--xg-signal)', stroke: 'var(--xg-bg)' }}
          />

          {/* intended-size marker — latches to verdict color */}
          <ReferenceLine
            x={intendedSize}
            stroke={m.colorVar}
            strokeWidth={1.25}
            label={{ value: '◀ YOUR SIZE', position: 'top', fill: m.colorVar, fontSize: 9, fontFamily: 'var(--font-mono)' }}
          />
          <ReferenceDot
            x={intendedSize}
            y={Math.min(intendedSlippageBps, 100_000)}
            r={4}
            fill={m.colorVar}
            stroke="var(--xg-bg)"
            strokeWidth={1.5}
          />

          {/* audited probe anchors (the real quotes) */}
          {probes.map((p) => (
            <ReferenceDot
              key={p.size_usd}
              x={p.size_usd}
              y={p.slippage_bps}
              r={2.5}
              fill="var(--xg-signal)"
              stroke="var(--xg-bg)"
              strokeWidth={1}
            />
          ))}
        </ComposedChart>
      </ResponsiveContainer>
      </div>
      <figcaption className="sr-only">
        <table>
          <caption>{summary}</caption>
          <thead>
            <tr><th>Exit size (USD)</th><th>Slippage (bps)</th></tr>
          </thead>
          <tbody>
            {probes.map((p) => (
              <tr key={p.size_usd}>
                <td>{p.size_usd}</td>
                <td>{p.slippage_bps}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </figcaption>
    </figure>
  )
}
