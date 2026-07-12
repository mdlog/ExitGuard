export default function Loading() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-[1240px] items-center justify-center px-5 py-20">
      <div className="flex items-center gap-3">
        <span
          className="xg-lamp xg-anim-breathe h-2 w-2 rounded-full"
          style={{ color: "var(--xg-signal)", background: "var(--xg-signal)" }}
        />
        <span className="xg-label">Probing the sell-side book…</span>
      </div>
    </main>
  );
}
