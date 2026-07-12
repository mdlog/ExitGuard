// Presentation helpers for the ExitGuard terminal. Pure — no "use client" needed.
import type { Verdict } from './types'

/** Full USD with thousands separators: 18500 -> "$18,500". */
export function usd(n: number, frac = 0): string {
  return `$${n.toLocaleString('en-US', { minimumFractionDigits: frac, maximumFractionDigits: frac })}`
}

/** Compact USD for tight readouts: 1_240_000 -> "$1.24M", 61000 -> "$61.0k". */
export function usdCompact(n: number): string {
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(2)}B`
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(n >= 100_000 ? 0 : 1)}k`
  return `$${Math.round(n)}`
}

/** bps -> percent string: 6300 -> "63.0%". */
export function bpsToPct(bps: number, frac = 1): string {
  return `${(bps / 100).toFixed(frac)}%`
}

export function pct(n: number, frac = 0): string {
  return `${n.toFixed(frac)}%`
}

/** 0x1a2b3c…9f8e7d */
export function shortHash(h: string, lead = 6, tail = 4): string {
  if (!h || h.length <= lead + tail + 2) return h
  return `${h.slice(0, lead)}…${h.slice(-tail)}`
}

/** X Layer (eip155:196) block explorer link for a settlement tx. */
export function xlayerTx(hash: string): string {
  return `https://www.oklink.com/xlayer/tx/${hash}`
}

export type VerdictMeta = {
  verdict: Verdict
  /** CSS custom-property color for inline styling. */
  colorVar: string
  /** tailwind text-color utility. */
  text: string
  /** the annunciator word. */
  word: string
  /** the imperative status line. */
  status: string
}

const VERDICT_META: Record<Verdict, VerdictMeta> = {
  BLOCK: {
    verdict: 'BLOCK',
    colorVar: 'var(--xg-block)',
    text: 'text-block',
    word: 'BLOCK',
    status: 'DO NOT ENTER — POSITION IS NOT EXITABLE AT SIZE',
  },
  WARN: {
    verdict: 'WARN',
    colorVar: 'var(--xg-warn)',
    text: 'text-warn',
    word: 'WARN',
    status: 'MARGINAL — EXIT WILL COST YOU. DOWNSIZE ADVISED',
  },
  OK: {
    verdict: 'OK',
    colorVar: 'var(--xg-ok)',
    text: 'text-ok',
    word: 'CLEAR',
    status: 'CLEAR TO ENTER — EXIT PATH IS LIQUID AT SIZE',
  },
}

export function verdictMeta(v: Verdict): VerdictMeta {
  return VERDICT_META[v]
}
