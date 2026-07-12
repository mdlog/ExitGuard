// On-chain reads (JSON-RPC over HTTP) for the parts of the methodology the OKX aggregator can't give:
//   • getBlockNumber() → the block the quotes were read at (the receipt's `quote_block`).
//   • readReserves()   → a Uniswap-v2-style pool's getReserves(), for "you are X% of the pool" once a
//                        pool address is known (pool discovery from the aggregator route is left as a
//                        best-effort hook — see engine.ts — because the route schema is version-specific).
//
// Per-chain RPC URL comes from env `RPC_URL_<chainIndex>` (e.g. RPC_URL_196), else a public default.
// Every read is bounded by a timeout and degrades gracefully (returns null / 0) — an RPC hiccup must
// never fail an exit check, since these only ENRICH the aggregator-derived verdict.

const RPC_TIMEOUT_MS = Number(process.env.RPC_TIMEOUT_MS || 4000);

const DEFAULT_RPC: Record<string, string> = {
  "1": "https://eth.llamarpc.com",
  "8453": "https://mainnet.base.org",
  "196": "https://rpc.xlayer.tech",
  "1952": "https://testrpc.xlayer.tech",
};

export function rpcUrlFor(chainIndex: string): string | null {
  return process.env[`RPC_URL_${chainIndex}`] || DEFAULT_RPC[chainIndex] || null;
}

async function rpc<T>(chainIndex: string, method: string, params: unknown[]): Promise<T | null> {
  const url = rpcUrlFor(chainIndex);
  if (!url) return null;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), RPC_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
      signal: ctrl.signal,
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { result?: T; error?: { message: string } };
    if (json.error || json.result == null) return null;
    return json.result;
  } catch {
    return null; // timeout / network / bad-json — enrichment only, never fatal
  } finally {
    clearTimeout(timer);
  }
}

/** Latest block height for a chain (0 when the RPC is unavailable). Feeds the receipt's quote_block. */
export async function getBlockNumber(chainIndex: string): Promise<number> {
  const hex = await rpc<string>(chainIndex, "eth_blockNumber", []);
  if (!hex) return 0;
  const n = Number.parseInt(hex, 16);
  return Number.isFinite(n) ? n : 0;
}

const GET_RESERVES_SELECTOR = "0x0902f1ac"; // keccak256("getReserves()")[:4]

/**
 * Read a Uniswap-v2-style pair's getReserves() → { reserve0, reserve1 } as decimal strings.
 * Returns null if the pool isn't v2-shaped or the RPC fails. (v3/other AMMs need a different ABI —
 * this is the common case and a safe best-effort; callers must tolerate null.)
 */
export async function readReserves(
  chainIndex: string,
  pairAddress: string,
): Promise<{ reserve0: string; reserve1: string } | null> {
  const data = await rpc<string>(chainIndex, "eth_call", [
    { to: pairAddress, data: GET_RESERVES_SELECTOR },
    "latest",
  ]);
  if (!data || data.length < 2 + 64 * 2) return null;
  const body = data.slice(2);
  const reserve0 = BigInt("0x" + body.slice(0, 64)).toString();
  const reserve1 = BigInt("0x" + body.slice(64, 128)).toString();
  return { reserve0, reserve1 };
}
