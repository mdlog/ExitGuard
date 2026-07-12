import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-[1240px] flex-col items-center justify-center px-5 py-20 text-center">
      <div className="xg-label mb-3">404 · no route</div>
      <h1 className="xg-display text-4xl text-xg-ink sm:text-5xl">NO EXIT PATH FOUND</h1>
      <p className="mt-4 max-w-md text-sm leading-relaxed text-xg-dim">
        This page isn&rsquo;t on the book. Head back to the terminal.
      </p>
      <Link
        href="/"
        className="mt-7 rounded-[4px] bg-xg-ink px-5 py-3 font-mono text-[13px] tracking-[0.04em] text-xg-bg transition-opacity hover:opacity-90"
      >
        ← BACK TO EXITGUARD
      </Link>
    </main>
  );
}
