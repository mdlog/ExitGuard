'use client'

import { useEffect, useRef, useState } from 'react'
import type { Settlement } from '@/lib/types'
import { shortHash, usd, xlayerTx } from '@/lib/format'
import { cn } from '@/lib/utils'

const STEPS = [
  { label: 'POST exit_liquidity_check', detail: 'agent → ASP endpoint' },
  { label: '402 PAYMENT REQUIRED', detail: 'x402 · scheme=exact · $0.02 USDT0' },
  { label: 'SIGN PAYMENT', detail: 'OKX Agentic Wallet' },
  { label: 'SETTLE ON X LAYER', detail: 'broadcast · eip155:196' },
  { label: '200 · PAYMENT-RESPONSE', detail: 'verdict released to caller' },
]

/**
 * The x402 handshake, made visible. On each "Run paid check" (nonce bump) it
 * steps 402 → sign → settle → 200, then prints the USDT0-on-X-Layer receipt.
 * This is the on-chain-settlement must-land of the demo (PRD §10).
 */
export function SettlementReceipt({
  receipt,
  nonce,
  quoteBlock,
  latencyMs,
}: {
  receipt: Settlement | null
  nonce: number
  quoteBlock?: number
  latencyMs?: number
}) {
  const [step, setStep] = useState(-1)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])

  useEffect(() => {
    timers.current.forEach(clearTimeout)
    timers.current = []
    if (nonce <= 0 || !receipt) return
    setStep(0)
    for (let i = 1; i <= STEPS.length; i++) {
      timers.current.push(setTimeout(() => setStep(i), i * 300))
    }
    return () => timers.current.forEach(clearTimeout)
  }, [nonce, receipt])

  const settled = step >= STEPS.length
  const idle = nonce <= 0 || !receipt
  const sim = receipt?.simulated ?? false

  return (
    <div className="flex flex-col gap-3">
      {/* step ledger */}
      <div className="flex flex-col">
        {STEPS.map((s, i) => {
          const state = idle ? 'idle' : i < step ? 'done' : i === step ? 'active' : 'pending'
          const color =
            state === 'done'
              ? 'var(--xg-ok)'
              : state === 'active'
                ? 'var(--xg-signal)'
                : 'var(--xg-faint)'
          return (
            <div key={s.label} className="flex items-center gap-3 border-b border-xg-line/60 py-1.5 last:border-b-0">
              <span
                className={cn('w-3 text-center font-mono text-[11px]', state === 'active' && 'xg-anim-blink')}
                style={{ color }}
              >
                {state === 'done' ? '✓' : state === 'active' ? '▸' : '·'}
              </span>
              <span
                className="font-mono text-[11px] tracking-[0.06em]"
                style={{ color: state === 'idle' || state === 'pending' ? 'var(--xg-faint)' : 'var(--xg-ink)' }}
              >
                {s.label}
              </span>
              <span className="ml-auto truncate font-mono text-[10px] text-xg-faint">{s.detail}</span>
            </div>
          )
        })}
      </div>

      {/* receipt plate */}
      {settled && receipt ? (
        <div className="xg-anim-settle rounded-[3px] border border-xg-line bg-xg-raised/60 p-3">
          <div className="flex items-center justify-between">
            <span className="xg-label flex items-center gap-2" style={{ color: sim ? 'var(--xg-warn)' : 'var(--xg-ok)' }}>
              {sim ? 'Simulated · USDT0 · X Layer' : 'Settled · USDT0 · X Layer'}
              {sim ? (
                <span
                  className="rounded-[2px] border px-1 py-px font-mono text-[8.5px] not-italic tracking-[0.14em]"
                  style={{ borderColor: 'var(--xg-warn)', color: 'var(--xg-warn)' }}
                  title="Demo/preview — no real x402 broadcast. Real receipts appear here once the paid asp-server is live."
                >
                  DEMO
                </span>
              ) : null}
            </span>
            <span className="tnum font-mono text-lg" style={{ color: sim ? 'var(--xg-warn)' : 'var(--xg-ok)' }}>
              {usd(receipt.amount_usd, 2)}
            </span>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1.5 font-mono text-[11px]">
            <Row k="tx" v={
              sim || !receipt.tx_hash ? (
                <span className="text-xg-faint" title="Simulated hash — not broadcast on-chain">
                  {receipt.tx_hash ? shortHash(receipt.tx_hash) : '—'} · sim
                </span>
              ) : (
                <a href={xlayerTx(receipt.tx_hash)} target="_blank" rel="noreferrer"
                   className="text-[color:var(--xg-signal)] underline-offset-2 hover:underline">
                  {shortHash(receipt.tx_hash)} ↗
                </a>
              )
            } />
            <Row k="chain" v="eip155:196" />
            {quoteBlock ? <Row k="block" v={quoteBlock.toLocaleString('en-US')} /> : null}
            {latencyMs ? <Row k="latency" v={`${latencyMs} ms`} /> : null}
          </div>
        </div>
      ) : (
        <div className="rounded-[3px] border border-dashed border-xg-line px-3 py-2.5 font-mono text-[10.5px] tracking-[0.12em] text-xg-faint">
          {idle ? 'AWAITING PAID CHECK · x402 · $0.02 USDT0 · X LAYER' : 'SETTLING…'}
        </div>
      )}
    </div>
  )
}

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-xg-faint">{k}</span>
      <span className="tnum truncate text-xg-ink">{v}</span>
    </div>
  )
}
