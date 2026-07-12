// Server-side helper to read the asp-server's public "live" surfaces (GET /stats · /feed · /agents).
// These make the marketplace tiles genuinely live once the ASP has settled traffic. When
// EXITGUARD_ASP_URL is unset (the default demo), every call returns null and callers use mock data.
//
// Runs only on the server (service layer is imported by server components / the API route). Bounded
// timeout + graceful null on any failure — a slow or down ASP never breaks a page render.

const ASP_URL = process.env.EXITGUARD_ASP_URL || ''

export async function aspGet<T>(path: string): Promise<T | null> {
  if (!ASP_URL) return null
  try {
    const res = await fetch(`${ASP_URL.replace(/\/$/, '')}${path}`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(5_000),
    })
    if (!res.ok) return null
    return (await res.json()) as T
  } catch {
    return null
  }
}
