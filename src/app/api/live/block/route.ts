// Client-pollable X Layer head, proxied from the asp-server's public GET /block. Returns
// { block: null } when the ASP isn't wired (EXITGUARD_ASP_URL unset) or is unreachable, so the
// LiveStatus indicator falls back to its local simulation instead of erroring.

import { NextResponse } from "next/server";

const ASP_URL = process.env.EXITGUARD_ASP_URL || "";

export async function GET() {
  if (!ASP_URL) return NextResponse.json({ block: null });
  try {
    const res = await fetch(`${ASP_URL.replace(/\/$/, "")}/block?chainIndex=196`, {
      cache: "no-store",
      signal: AbortSignal.timeout(4_000),
    });
    if (!res.ok) return NextResponse.json({ block: null });
    const j = (await res.json()) as { block?: number };
    return NextResponse.json({ block: typeof j.block === "number" && j.block > 0 ? j.block : null });
  } catch {
    return NextResponse.json({ block: null });
  }
}
