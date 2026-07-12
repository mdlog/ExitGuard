// REAL OKX DEX aggregator client — the data engine behind the live ASP.
// Docs: https://web3.okx.com/onchainos/dev-docs/trade/dex-get-quote
//   GET /api/v6/dex/aggregator/quote  (chainIndex, fromTokenAddress, toTokenAddress, amount, swapMode)
// Auth: standard OKX API-key HMAC (OK-ACCESS-KEY/SIGN/TIMESTAMP/PASSPHRASE) +, if your Dev-Portal
//   project requires it, OK-ACCESS-PROJECT (set OKX_PROJECT_ID). Missing that header when the API
//   demands it makes EVERY quote fail auth — so it is sent whenever OKX_PROJECT_ID is present.
//
// Strategy: to measure EXIT liquidity we sell the token INTO a stablecoin at a ladder of sizes and
// read how much we actually get back. Slippage vs the unimpacted mid = the cost of getting out.

import crypto from "crypto";
import type { DepthCurvePoint } from "./verdict.js";

const BASE = process.env.OKX_DEX_BASE || "https://web3.okx.com";
const QUOTE_PATH = "/api/v6/dex/aggregator/quote";
const HTTP_TIMEOUT_MS = Number(process.env.OKX_HTTP_TIMEOUT_MS || 8000);
const MAX_RETRIES = Number(process.env.OKX_MAX_RETRIES || 3);
const PROBE_USD = Number(process.env.OKX_PROBE_USD || 100); // stable notional used to resolve token metadata

/** Config/setup problem (missing creds). Must surface to the caller — NOT be masked as a no-route BLOCK. */
export class ConfigError extends Error {}
/** Transient upstream failure (429 / 5xx / network / timeout) after retries. Must propagate, never silently → 0. */
export class TransientError extends Error {}

type Creds = { apiKey: string; secretKey: string; passphrase: string; projectId?: string };

export function assertCreds(): void {
  const { OKX_API_KEY, OKX_SECRET_KEY, OKX_PASSPHRASE } = process.env;
  if (!OKX_API_KEY || !OKX_SECRET_KEY || !OKX_PASSPHRASE) {
    throw new ConfigError(
      "OKX_API_KEY / OKX_SECRET_KEY / OKX_PASSPHRASE are required for real DEX quotes. Set them in .env (Dev Portal).",
    );
  }
}

function creds(): Creds {
  assertCreds();
  return {
    apiKey: process.env.OKX_API_KEY!,
    secretKey: process.env.OKX_SECRET_KEY!,
    passphrase: process.env.OKX_PASSPHRASE!,
    projectId: process.env.OKX_PROJECT_ID || undefined,
  };
}

function sign(ts: string, method: string, path: string, body: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(ts + method + path + body).digest("base64");
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Signed GET against the OKX onchain API with a timeout and bounded retry/backoff on transient
 * failures (429 / 5xx / network / abort). A genuine "no route" is NOT an error here — the API
 * returns code "0" with an empty `data` array, so callers see `[]` and treat it as no liquidity.
 * Auth / project-header problems surface as ConfigError; exhausted transients as TransientError.
 */
async function okxGet<T>(path: string, params: Record<string, string>): Promise<T[]> {
  const c = creds();
  const qs = new URLSearchParams(params).toString();
  const requestPath = `${path}?${qs}`;

  let lastErr: Error | undefined;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const ts = new Date().toISOString();
    const headers: Record<string, string> = {
      "OK-ACCESS-KEY": c.apiKey,
      "OK-ACCESS-SIGN": sign(ts, "GET", requestPath, "", c.secretKey),
      "OK-ACCESS-TIMESTAMP": ts,
      "OK-ACCESS-PASSPHRASE": c.passphrase,
      "Content-Type": "application/json",
    };
    if (c.projectId) headers["OK-ACCESS-PROJECT"] = c.projectId;

    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), HTTP_TIMEOUT_MS);
    try {
      const res = await fetch(`${BASE}${requestPath}`, { headers, signal: ctrl.signal });
      if (res.status === 429 || res.status >= 500) {
        lastErr = new TransientError(`OKX DEX HTTP ${res.status}`);
      } else if (res.status === 401 || res.status === 403) {
        throw new ConfigError(`OKX DEX auth failed (HTTP ${res.status}) — check API key/secret/passphrase + OK-ACCESS-PROJECT.`);
      } else if (!res.ok) {
        throw new Error(`OKX DEX HTTP ${res.status}`);
      } else {
        const json = (await res.json()) as { code: string; msg: string; data: T[] };
        // 50011/50013-style rate-limit codes come back as HTTP 200 — treat as transient.
        if (json.code === "50011" || json.code === "50013") {
          lastErr = new TransientError(`OKX DEX rate-limited (code ${json.code})`);
        } else if (json.code !== "0") {
          // Any other business error is a hard, non-retryable condition (bad params / no route).
          throw new Error(`OKX DEX error ${json.code}: ${json.msg}`);
        } else {
          return json.data ?? [];
        }
      }
    } catch (e) {
      if (e instanceof ConfigError) throw e;
      if ((e as Error).name === "AbortError") lastErr = new TransientError(`OKX DEX timeout after ${HTTP_TIMEOUT_MS}ms`);
      else if (e instanceof TransientError) lastErr = e;
      else if (e instanceof TypeError) lastErr = new TransientError(`OKX DEX network error: ${(e as Error).message}`); // fetch network failure
      else throw e; // genuine non-retryable error (bad-params / no-route business code)
    } finally {
      clearTimeout(timer);
    }
    if (attempt < MAX_RETRIES) await sleep(250 * 2 ** attempt); // 250 / 500 / 1000ms backoff
  }
  throw lastErr ?? new TransientError("OKX DEX request failed");
}

export type QuoteToken = {
  tokenContractAddress?: string;
  tokenSymbol?: string;
  tokenUnitPrice?: string; // unimpacted USD price
  decimal?: string;
};

export type QuoteRow = {
  fromToken?: QuoteToken;
  toToken?: QuoteToken;
  fromTokenAmount: string;
  toTokenAmount: string;
  priceImpactPercentage?: string;
  dexRouterList?: Array<{ router?: string; subRouterList?: unknown[] }>;
  tradeFee?: string;
};

/**
 * Auto-resolve a token's decimals + unimpacted USD price by BUYING it with a fixed stable notional
 * (`PROBE_USD`, default $100) and reading the `toToken` block + realized amount. Buying with a known
 * stable amount avoids the old dust-probe bug (a sub-minimum token `amount` that the aggregator
 * rejects for otherwise-liquid tokens). Returns null when the token is genuinely unquotable.
 * Throws ConfigError / TransientError (caller decides) rather than masking those as "no route".
 */
export async function resolveTokenMeta(p: {
  chainIndex: string;
  tokenAddress: string;
  stableAddress: string;
  stableDecimals: number;
}): Promise<{ decimals: number; midPriceUsd: number; symbol: string } | null> {
  const stableAmount = toMinUnits(PROBE_USD, p.stableDecimals);
  let q: QuoteRow | null;
  try {
    q = await getQuote({
      chainIndex: p.chainIndex,
      fromTokenAddress: p.stableAddress, // spend stable…
      toTokenAddress: p.tokenAddress, //   …to buy the token
      amount: stableAmount,
    });
  } catch (e) {
    if (e instanceof ConfigError || e instanceof TransientError) throw e;
    return null; // hard business error → treat as no routable market
  }
  const tt = q?.toToken;
  if (!tt || tt.decimal == null) return null;
  const decimals = Number(tt.decimal);
  if (!Number.isFinite(decimals)) return null;

  // Prefer the echoed unit price; else derive mid from the realized amount (we spent ~PROBE_USD of stable).
  let midPriceUsd = tt.tokenUnitPrice != null ? Number(tt.tokenUnitPrice) : NaN;
  if (!Number.isFinite(midPriceUsd) || midPriceUsd <= 0) {
    const tokensOut = q ? fromMinUnits(q.toTokenAmount, decimals) : 0;
    midPriceUsd = tokensOut > 0 ? PROBE_USD / tokensOut : NaN;
  }
  if (!Number.isFinite(midPriceUsd) || midPriceUsd <= 0) return null;
  return { decimals, midPriceUsd, symbol: tt.tokenSymbol || "TOKEN" };
}

/** One aggregator quote: sell `amount` (min units) of `fromToken` into `toToken`. Returns null for no route. */
export async function getQuote(p: {
  chainIndex: string;
  fromTokenAddress: string;
  toTokenAddress: string;
  amount: string;
  swapMode?: "exactIn" | "exactOut";
}): Promise<QuoteRow | null> {
  const rows = await okxGet<QuoteRow>(QUOTE_PATH, {
    chainIndex: p.chainIndex,
    fromTokenAddress: p.fromTokenAddress,
    toTokenAddress: p.toTokenAddress,
    amount: p.amount,
    swapMode: p.swapMode ?? "exactIn",
  });
  return rows[0] ?? null;
}

// ---- unit helpers (BigInt-safe for 18-decimal tokens) ----
export function toMinUnits(amount: number, decimals: number): string {
  if (!isFinite(amount) || amount <= 0) return "0";
  const SCALE = 6;
  const scaled = BigInt(Math.round(amount * 10 ** SCALE));
  const pow = decimals - SCALE;
  const units = pow >= 0 ? scaled * 10n ** BigInt(pow) : scaled / 10n ** BigInt(-pow);
  return units.toString();
}
export function fromMinUnits(units: string, decimals: number): number {
  return Number(units) / 10 ** decimals;
}

export type ExitLadderResult = {
  ladder: DepthCurvePoint[];
  aelUsd: number; // routed sell-side liquidity within the impact band
  midPriceUsd: number;
  venues: string[];
};

/**
 * Build the exit-liquidity depth curve from real sell quotes. Requires the token's `decimals` and
 * a stablecoin (`stableAddress`,`stableDecimals`) on the same chain; `midPriceUsd` is the unimpacted
 * reference.
 *
 * Error discipline (fixes the "throttling silently flattens the curve" bug): a rung with genuinely
 * no route resolves to realizable 0 (getQuote → null, or a hard business error). But ConfigError and
 * TransientError PROPAGATE — a rate-limited or timed-out rung must fail the whole check loudly rather
 * than masquerade as thin liquidity via the monotonic floor.
 */
export async function buildExitLadder(p: {
  chainIndex: string;
  tokenAddress: string;
  decimals: number;
  stableAddress: string;
  stableDecimals: number;
  midPriceUsd: number;
  sizesUsd: number[];
  impactBandBps: number;
}): Promise<ExitLadderResult> {
  const sizes = [...new Set(p.sizesUsd)].filter((s) => s > 0).sort((a, b) => a - b);
  const venues = new Set<string>(["okx-dex-aggregator"]);
  const ladder: DepthCurvePoint[] = [];
  let prevRealizable = 0;
  let aelUsd = 0;

  for (const sizeUsd of sizes) {
    const tokens = sizeUsd / p.midPriceUsd;
    const amount = toMinUnits(tokens, p.decimals);
    let realizedUsd = 0;
    try {
      const q = await getQuote({
        chainIndex: p.chainIndex,
        fromTokenAddress: p.tokenAddress,
        toTokenAddress: p.stableAddress,
        amount,
      });
      if (q) {
        realizedUsd = fromMinUnits(q.toTokenAmount, p.stableDecimals);
        if (q.dexRouterList?.[0]?.router) venues.add(String(q.dexRouterList[0].router));
      }
      // q === null → genuinely no route at this size → realizedUsd stays 0 (correct).
    } catch (e) {
      if (e instanceof ConfigError || e instanceof TransientError) throw e; // never mask these as thin liquidity
      realizedUsd = 0; // hard business no-route at this size
    }
    // Physically, selling more can't realize less absolute value than a smaller size did.
    if (realizedUsd < prevRealizable) realizedUsd = prevRealizable;
    prevRealizable = realizedUsd;

    const slippage_bps = Math.max(0, Math.min(9800, Math.round(((sizeUsd - realizedUsd) / sizeUsd) * 10_000)));
    ladder.push({
      size_usd: Math.round(sizeUsd),
      slippage_bps,
      realizable_usd: Math.round(realizedUsd),
      avg_price: Number((realizedUsd / (tokens || 1)).toPrecision(6)),
    });
    // The largest size still routable within the impact band ≈ available exit liquidity.
    if (slippage_bps <= p.impactBandBps) aelUsd = Math.round(sizeUsd);
  }

  // If even the largest probed size stayed inside the band, AEL is at least that (a floor, not a ceiling).
  if (aelUsd === 0 && ladder.length) aelUsd = ladder[0].realizable_usd;

  return { ladder, aelUsd, midPriceUsd: p.midPriceUsd, venues: [...venues] };
}
