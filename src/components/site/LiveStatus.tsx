'use client'

import { useEffect, useState } from 'react'
import { useReducedMotion } from '@/lib/use-reduced-motion'

/** A ticking X Layer block height + LIVE lamp — the terminal feels connected. Uses the real chain
 *  head (polled via /api/live/block) when the asp-server is wired; else a local simulation. */
export function LiveStatus() {
  const [block, setBlock] = useState(21_940_412)
  const [live, setLive] = useState(false)
  const reduced = useReducedMotion()

  // Simulate the counter only until a real head arrives (and only if motion is allowed).
  useEffect(() => {
    if (reduced || live) return // respect prefers-reduced-motion; stop simulating once real
    const id = setInterval(() => setBlock((b) => b + 1), 2100) // ~X Layer block time
    return () => clearInterval(id)
  }, [reduced, live])

  // Poll the real X Layer head. Silent no-op (keeps simulating) when the ASP isn't wired.
  useEffect(() => {
    let stop = false
    const poll = async () => {
      try {
        const res = await fetch('/api/live/block', { cache: 'no-store' })
        const j = (await res.json()) as { block: number | null }
        if (!stop && typeof j.block === 'number' && j.block > 0) {
          setBlock(j.block)
          setLive(true)
        }
      } catch {
        /* keep the local simulation */
      }
    }
    poll()
    const id = setInterval(poll, 5_000)
    return () => {
      stop = true
      clearInterval(id)
    }
  }, [])

  return (
    <div
      className="ml-2 hidden items-center gap-2 rounded-[3px] border border-xg-line px-2.5 py-1.5 md:flex"
      title={live ? 'Live X Layer head' : 'Simulated (wire EXITGUARD_ASP_URL for the real head)'}
    >
      <span
        className={`xg-lamp h-1.5 w-1.5 rounded-full ${live ? 'xg-anim-breathe' : ''}`}
        style={{
          color: live ? 'var(--xg-ok)' : 'var(--xg-warn)',
          background: live ? 'var(--xg-ok)' : 'var(--xg-warn)',
        }}
      />
      <span className="font-mono text-[10px] tracking-[0.12em] text-xg-dim">X LAYER</span>
      <span className="tnum font-mono text-[10px] text-xg-ink">
        #{block.toLocaleString('en-US')}
        {!live && <span className="text-xg-faint"> · sim</span>}
      </span>
    </div>
  )
}
