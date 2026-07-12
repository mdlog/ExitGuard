'use client'

import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import type { Caip2ChainId, ExitLiquidityCheck, ExitLiquidityCheckInput, Settlement, Token } from '@/lib/types'
import { computeCheck, sampleDepthCurve } from '@/lib/data'
import { bpsToPct, usd, usdCompact, verdictMeta } from '@/lib/format'
import { cn } from '@/lib/utils'
import { Panel, MicroLabel, Readout } from './primitives'
import { VerdictAnnunciator } from './VerdictAnnunciator'
import { ExitLiquidityGauge } from './ExitLiquidityGauge'
import { DepthCurveChart } from './DepthCurveChart'
import { SettlementReceipt } from './SettlementReceipt'
import { SizeFader } from './SizeFader'

const TIER_COLOR = { thin: 'var(--xg-block)', mid: 'var(--xg-warn)', deep: 'var(--xg-ok)' } as const

function niceRound(n: number): number {
  if (n >= 100_000) return Math.round(n / 5_000) * 5_000
  if (n >= 20_000) return Math.round(n / 1_000) * 1_000
  if (n >= 2_000) return Math.round(n / 500) * 500
  return Math.max(500, Math.round(n / 100) * 100)
}

function defaultSizeFor(t: Token): number {
  const f = t.liquidityTier === 'thin' ? 0.85 : t.liquidityTier === 'mid' ? 0.38 : 0.04
  return niceRound(t.liquidity.sellSideDepthUsd * f)
}

export function GuardConsole({
  tokens,
  initialCheck,
}: {
  tokens: Token[]
  initialCheck: ExitLiquidityCheck
}) {
  const heroToken =
    tokens.find((t) => t.address.toLowerCase() === initialCheck.token_address.toLowerCase()) ?? tokens[0]

  const [token, setToken] = useState<Token>(heroToken)
  const [size, setSize] = useState<number>(initialCheck.size_usd)
  const [paid, setPaid] = useState<Settlement | null>(null)
  const [paidMeta, setPaidMeta] = useState<{ block: number; latency: number } | null>(null)
  const [nonce, setNonce] = useState(0)
  const [running, setRunning] = useState(false)
  // The last authoritative (fetched) result. When set, the verdict pane shows it instead of the
  // instant client estimate — reconciling the offline preview against the endpoint's real answer.
  const [authoritative, setAuthoritative] = useState<ExitLiquidityCheck | null>(null)
  // Arbitrary token/chain/size the user typed (self-serve surface beyond the curated picker).
  const [customAddr, setCustomAddr] = useState('')
  const [customChain, setCustomChain] = useState<Caip2ChainId>('eip155:8453')
  const [customSize, setCustomSize] = useState(5_000)

  const check = useMemo<ExitLiquidityCheck>(
    () => computeCheck({ token_address: token.address, chain: token.chain, size_usd: size, side: 'long' }),
    [token, size],
  )

  // What the right-hand verdict pane renders: the authoritative fetched result if we have one, else
  // the instant client estimate. Moving any input clears `authoritative` (below) → back to the estimate.
  const view = authoritative ?? check
  const vm = verdictMeta(view.verdict)
  const sameToken = authoritative?.token_address.toLowerCase() === token.address.toLowerCase()

  const chartMax = useMemo(() => {
    const maxProbe = Math.max(size * 2, ...check.depth_curve.map((p) => p.size_usd))
    return niceRound(maxProbe * 1.15)
  }, [size, check])

  const samples = useMemo(() => sampleDepthCurve(token.address, chartMax), [token, chartMax])

  const m = verdictMeta(check.verdict)
  const ael = token.liquidity.sellSideDepthUsd
  const sliderMax = Math.max(niceRound(Math.max(ael * 1.05, size * 1.4, 20_000)), size)
  const dominanceSize = Math.round(ael * 0.5)

  function resetResult() {
    setPaid(null)
    setPaidMeta(null)
    setAuthoritative(null)
  }

  function selectToken(t: Token) {
    setToken(t)
    setSize(t.address === heroToken.address ? initialCheck.size_usd : defaultSizeFor(t))
    resetResult()
  }

  function onSize(v: number) {
    setSize(v)
    resetResult()
  }

  // Shared fetch → reconcile path. Hits the FREE demo endpoint (which proxies real OKX data when the
  // asp-server is wired), falling back to the offline engine so the money screen always answers.
  async function runCheckWith(input: ExitLiquidityCheckInput) {
    setRunning(true)
    try {
      const res = await fetch('/api/exit-liquidity-check', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(input),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const result = (await res.json()) as ExitLiquidityCheck
      setAuthoritative(result)
      setPaid(result.settlement)
      setPaidMeta({ block: result.quote_block, latency: result.latency_ms })
      setNonce((n) => n + 1)
      toast.success(`Verdict · ${result.verdict}`, {
        description: result.settlement?.simulated
          ? 'Simulated settlement — demo preview (no on-chain broadcast)'
          : `Settled · $${result.settlement?.amount_usd?.toFixed(2) ?? '0.02'} USDT0 · X Layer`,
      })
    } catch {
      const fallback = computeCheck(input)
      setAuthoritative(fallback)
      setPaid(fallback.settlement)
      setPaidMeta({ block: fallback.quote_block, latency: fallback.latency_ms })
      setNonce((n) => n + 1)
      toast.error('Live endpoint unavailable', { description: 'Showing the offline estimate.' })
    } finally {
      setRunning(false)
    }
  }

  const runPaidCheck = () =>
    runCheckWith({ token_address: token.address, chain: token.chain, size_usd: size, side: 'long' })

  function runCustomCheck() {
    const addr = customAddr.trim()
    if (!addr) {
      toast.error('Enter a token address')
      return
    }
    setPaid(null)
    setPaidMeta(null)
    void runCheckWith({ token_address: addr, chain: customChain, size_usd: Math.max(1, customSize), side: 'long' })
  }

  const presets = [0.08, 0.3, 0.6, 0.95].map((f) => niceRound(ael * f))

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(340px,380px)_1fr]">
      {/* ─────────────── LEFT: control rail ─────────────── */}
      <div className="flex min-w-0 flex-col gap-4">
        <Panel label="Target · agentic wallet caller" ticks>
          <div className="flex flex-wrap gap-1.5">
            {tokens.map((t) => {
              const on = t.address === token.address
              return (
                <button
                  key={t.id}
                  onClick={() => selectToken(t)}
                  aria-pressed={on}
                  className={cn(
                    'group flex items-center gap-2 rounded-[3px] border px-2.5 py-1.5 font-mono text-[11px] transition-colors',
                    on ? 'border-xg-line-bright bg-xg-raised text-xg-ink' : 'border-xg-line text-xg-dim hover:border-xg-line-bright hover:text-xg-ink',
                  )}
                >
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: TIER_COLOR[t.liquidityTier] }} />
                  {t.symbol}
                </button>
              )
            })}
          </div>

          <div className="mt-4 flex items-baseline justify-between">
            <div>
              <div className="font-mono text-lg text-xg-ink">{token.symbol}</div>
              <div className="text-[11px] text-xg-dim">{token.name}</div>
            </div>
            <div className="text-right">
              <div className="tnum font-mono text-sm text-xg-ink">
                ${token.priceUsd < 0.01 ? token.priceUsd.toPrecision(2) : token.priceUsd.toLocaleString('en-US')}
              </div>
              <div className="text-[10px] uppercase tracking-[0.14em]" style={{ color: TIER_COLOR[token.liquidityTier] }}>
                {token.liquidityTier} liquidity
              </div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-xg-line pt-3.5">
            <MiniStat k="Sell-side book" v={usdCompact(ael)} />
            <MiniStat k="Buy / sell depth" v={`${token.liquidity.depthAsymmetryRatio.toFixed(1)}×`} accent={token.liquidity.depthAsymmetryRatio >= 3} />
            <MiniStat k="Top pool" v={`${token.liquidity.topPoolConcentrationPct}%`} accent={token.liquidity.topPoolConcentrationPct >= 90} />
            <MiniStat k="Venues" v={`${token.liquidity.poolCount} · ${token.liquidity.primaryVenue}`} />
          </div>
        </Panel>

        <Panel label="Size probe" ticks>
          <SizeFader
            value={size}
            min={500}
            max={sliderMax}
            step={sliderMax > 100_000 ? 1_000 : 500}
            color={m.colorVar}
            onChange={onSize}
            marks={[
              ...(check.recommended_max_size_usd > 0 && check.recommended_max_size_usd < sliderMax
                ? [{ value: check.recommended_max_size_usd, color: 'var(--xg-ok)', label: 'MAX·OK' }]
                : []),
              ...(dominanceSize > 500 && dominanceSize < sliderMax
                ? [{ value: dominanceSize, color: 'var(--xg-block)', label: '50%·BOOK' }]
                : []),
            ]}
          />

          <div className="mt-4 flex flex-wrap gap-1.5">
            {presets.map((p) => (
              <button
                key={p}
                onClick={() => onSize(Math.min(p, sliderMax))}
                aria-pressed={Math.abs(p - size) < 1}
                className={cn(
                  'rounded-[3px] border px-2 py-1 font-mono text-[10.5px] transition-colors',
                  Math.abs(p - size) < 1 ? 'border-xg-line-bright bg-xg-raised text-xg-ink' : 'border-xg-line text-xg-dim hover:text-xg-ink',
                )}
              >
                {usdCompact(p)}
              </button>
            ))}
          </div>

          <button
            onClick={runPaidCheck}
            disabled={running}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-[3px] border border-xg-line-bright bg-xg-raised py-2.5 font-mono text-[12px] tracking-[0.08em] text-xg-ink transition-colors hover:border-[color:var(--xg-signal)] hover:text-[color:var(--xg-signal)] disabled:opacity-50"
          >
            <span className={cn('h-1.5 w-1.5 rounded-full', running && 'xg-anim-blink')} style={{ background: 'var(--xg-signal)', color: 'var(--xg-signal)' }} />
            {running ? 'SETTLING…' : 'RUN PAID CHECK · $0.02 USDT0'}
          </button>
        </Panel>

        <Panel label="Custom token · self-serve" ticks>
          <p className="mb-3 text-[10.5px] leading-snug text-xg-faint">
            Check any EVM token by address — the same call an agent makes. Live OKX data when the ASP is wired, else the offline estimate.
          </p>
          <div className="flex flex-col gap-2">
            <input
              value={customAddr}
              onChange={(e) => setCustomAddr(e.target.value)}
              placeholder="0x token address"
              spellCheck={false}
              aria-label="Custom token address"
              className="w-full rounded-[3px] border border-xg-line bg-xg-raised px-2.5 py-1.5 font-mono text-[11px] text-xg-ink placeholder:text-xg-faint focus:border-[color:var(--xg-signal)] focus:outline-none"
            />
            <div className="flex gap-2">
              <select
                value={customChain}
                onChange={(e) => setCustomChain(e.target.value as Caip2ChainId)}
                aria-label="Custom token chain"
                className="min-w-0 flex-1 rounded-[3px] border border-xg-line bg-xg-raised px-2 py-1.5 font-mono text-[11px] text-xg-ink focus:border-[color:var(--xg-signal)] focus:outline-none"
              >
                <option value="eip155:1">eip155:1 · Ethereum</option>
                <option value="eip155:8453">eip155:8453 · Base</option>
                <option value="eip155:196">eip155:196 · X Layer</option>
              </select>
              <input
                type="number"
                min={1}
                value={customSize}
                onChange={(e) => setCustomSize(Number(e.target.value))}
                aria-label="Custom exit size in USD"
                className="tnum w-28 rounded-[3px] border border-xg-line bg-xg-raised px-2 py-1.5 font-mono text-[11px] text-xg-ink focus:border-[color:var(--xg-signal)] focus:outline-none"
              />
            </div>
            <button
              onClick={runCustomCheck}
              disabled={running}
              className="flex w-full items-center justify-center gap-2 rounded-[3px] border border-xg-line py-2 font-mono text-[11px] tracking-[0.08em] text-xg-dim transition-colors hover:border-[color:var(--xg-signal)] hover:text-[color:var(--xg-signal)] disabled:opacity-50"
            >
              {running ? 'CHECKING…' : 'CHECK CUSTOM TOKEN →'}
            </button>
          </div>
        </Panel>
      </div>

      {/* ─────────────── RIGHT: verdict canvas ─────────────── */}
      <div className="flex min-w-0 flex-col gap-4">
        <Panel
          label="Exit verdict"
          plate
          ticks
          aside={
            <span className="flex items-center gap-2">
              {authoritative ? (
                <span
                  className="rounded-[2px] border px-1 py-px font-mono text-[8.5px] tracking-[0.14em]"
                  style={{ borderColor: 'var(--xg-signal)', color: 'var(--xg-signal)' }}
                  title="Authoritative endpoint result (reconciled against the client estimate)"
                >
                  LIVE RESULT
                </span>
              ) : (
                <span className="font-mono text-[8.5px] tracking-[0.14em] text-xg-faint">EST · LIVE PREVIEW</span>
              )}
              <span className="tnum font-mono text-[10px] text-xg-faint">
                blk {view.quote_block.toLocaleString('en-US')} · {view.latency_ms}ms
              </span>
            </span>
          }
        >
          <VerdictAnnunciator verdict={view.verdict} reason={view.reason} />

          <div className="mt-5 grid grid-cols-3 gap-4 border-t border-xg-line pt-4">
            <Readout label="Realizable exit" value={usd(view.realizable_exit_value_usd)} emphatic />
            <Readout label="Slippage to exit" value={bpsToPct(view.slippage_to_exit_bps)} color={vm.colorVar} emphatic />
            <Readout
              label="Recommended max"
              value={view.recommended_max_size_usd > 0 ? usd(view.recommended_max_size_usd) : '—'}
              color={view.recommended_max_size_usd > 0 ? 'var(--xg-ok)' : 'var(--xg-faint)'}
              emphatic
            />
          </div>
        </Panel>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2 [&>*]:min-w-0">
          <Panel label="Exit-liquidity dominance">
            <ExitLiquidityGauge pct={view.pct_of_available_liquidity} aelUsd={view.available_exit_liquidity_usd} youAreExit={view.you_are_the_exit_liquidity} />
          </Panel>

          <Panel label="x402 settlement · agent → asp">
            <SettlementReceipt receipt={paid} nonce={nonce} quoteBlock={paidMeta?.block} latencyMs={paidMeta?.latency} />
          </Panel>
        </div>

        <Panel
          label="Auditable depth curve"
          aside={<span className="font-mono text-[10px] text-xg-faint">● probed quotes · — model</span>}
        >
          <DepthCurveChart
            samples={authoritative && !sameToken ? [] : samples}
            probes={view.depth_curve}
            intendedSize={authoritative ? view.size_usd : size}
            intendedSlippageBps={view.slippage_to_exit_bps}
            verdict={view.verdict}
          />
          <ul className="mt-3 space-y-1 border-t border-xg-line pt-3">
            {view.data_caveats.map((c) => (
              <li key={c} className="flex gap-2 text-[10.5px] leading-snug text-xg-faint">
                <span className="text-xg-line-bright">└</span>
                {c}
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </div>
  )
}

function MiniStat({ k, v, accent }: { k: string; v: string; accent?: boolean }) {
  return (
    <div className="flex flex-col gap-1">
      <MicroLabel>{k}</MicroLabel>
      <span className="tnum font-mono text-[13px]" style={{ color: accent ? 'var(--xg-warn)' : 'var(--xg-ink)' }}>
        {v}
      </span>
    </div>
  )
}
