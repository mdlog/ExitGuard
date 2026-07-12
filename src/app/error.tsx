"use client";

import Link from "next/link";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-[1240px] flex-col items-center justify-center px-5 py-20 text-center">
      <div className="xg-label mb-3" style={{ color: "var(--xg-block)" }}>
        error · unexpected state
      </div>
      <h1 className="xg-display text-4xl sm:text-5xl" style={{ color: "var(--xg-block)" }}>
        SIGNAL LOST
      </h1>
      <p className="mt-4 max-w-md text-sm leading-relaxed text-xg-dim">
        Something failed while computing the verdict. Retry the check, or head back to the terminal.
      </p>
      <div className="mt-7 flex gap-3">
        <button
          onClick={reset}
          className="rounded-[4px] bg-xg-ink px-5 py-3 font-mono text-[13px] tracking-[0.04em] text-xg-bg transition-opacity hover:opacity-90"
        >
          RETRY
        </button>
        <Link
          href="/"
          className="rounded-[4px] border border-xg-line-bright px-5 py-3 font-mono text-[13px] tracking-[0.04em] text-xg-ink transition-colors hover:text-[color:var(--xg-signal)]"
        >
          HOME
        </Link>
      </div>
    </main>
  );
}
