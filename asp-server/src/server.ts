// Exit-Liquidity Guard — the REAL, registerable A2MCP ASP.
// Serves the same `exit_liquidity_check` engine, x402-paid:
//   • POST /exit_liquidity_check  — plain HTTP JSON (easy to curl / integrate)
//   • POST /mcp                   — MCP Streamable HTTP (A2MCP-native, what OKX.AI registers)
// Plus operator surfaces for the demo site (NOT public agent endpoints):
//   • POST /internal/exit_liquidity_check — FREE, shared-secret gated (the web app's live-data proxy)
//   • GET  /stats · /feed · /agents · /block — read the settlement ledger + chain head (live tiles)
// Backed by LIVE OKX DEX aggregator quotes. Deploy on public HTTPS, then register via Onchain OS.

import express from "express";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { runCheck, CheckError, CHAINS } from "./engine.js";
import { ConfigError } from "./okx-dex.js";
import { getBlockNumber } from "./chain-rpc.js";
import { buildMcpServer } from "./mcp.js";
import { makePaymentMiddleware, type Middleware } from "./payment.js";
import { recordCall, getStats, getFeed, getAgents, type LedgerEvent } from "./ledger.js";
import type { ExitLiquidityCheck } from "./verdict.js";

const PORT = Number(process.env.PORT || 4000);
const NETWORK = process.env.NETWORK || "eip155:196"; // testnet: eip155:1952
const PAY_TO = process.env.PAY_TO_ADDRESS || "";
const PRICE = process.env.PRICE || "$0.02";
const FEE_USD = Number(PRICE.replace(/[^0-9.]/g, "")) || 0.02;
const INTERNAL_TOKEN = process.env.INTERNAL_TOKEN || "";
const STRICT = process.env.PAY_STRICT === "1" || process.env.NODE_ENV === "production";

const app = express();
// Behind a proxy/tunnel (Cloudflare Tunnel, Railway, Fly, …) the real caller IP arrives in
// X-Forwarded-For. Trust it so the rate limiter buckets per real client instead of lumping every
// request under the proxy's 127.0.0.1. Safe because the server binds to localhost behind the tunnel.
app.set("trust proxy", true);
app.use(express.json());

function mapErr(e: unknown, res: express.Response) {
  const status = e instanceof CheckError ? e.status : e instanceof ConfigError ? 500 : 502;
  res.status(status).json({ error: (e as Error).message });
}

// ── tiny per-IP rate limiter (protects the free internal proxy + read routes from abuse) ──
function rateLimiter(maxPerMin: number): express.RequestHandler {
  const hits = new Map<string, number[]>();
  return (req, res, next) => {
    const now = Date.now();
    const key = req.ip || "x";
    const recent = (hits.get(key) ?? []).filter((t) => t > now - 60_000);
    if (recent.length >= maxPerMin) {
      res.status(429).json({ error: "rate limited" });
      return;
    }
    recent.push(now);
    hits.set(key, recent);
    next();
  };
}

// ── extraction of the x402 payer + settlement tx for the ledger ──
// The x402 `payment-response` header is base64(JSON) shaped {network,payer,status,success,transaction}
// (confirmed live on eip155:196). Older/plain variants may send raw JSON — try both. Aggregate
// counts/verdicts are correct regardless; payer/tx fall back to blanks only if the header is absent.
function paymentInfo(req: express.Request, res: express.Response): { payer: string; tx: string } {
  let payer = "";
  let tx = "";
  const raw = res.getHeader("payment-response") ?? res.getHeader("x-payment-response");
  if (raw) {
    const s = String(raw);
    let json = s;
    if (/^[A-Za-z0-9+/_-]+=*$/.test(s)) {
      try {
        json = Buffer.from(s, "base64").toString("utf8");
      } catch {
        json = s;
      }
    }
    try {
      const p = JSON.parse(json) as Record<string, string>;
      tx = p.transaction || p.txHash || p.tx_hash || "";
      payer = p.payer || p.from || "";
    } catch {
      /* header not JSON — leave blanks */
    }
  }
  if (!payer) payer = (req.header("x-payment-from") || req.header("x-payer") || "").toString();
  return { payer: payer || "anonymous", tx };
}

function recordSettledCall(check: ExitLiquidityCheck, req: express.Request, res: express.Response) {
  const { payer, tx } = paymentInfo(req, res);
  const e: LedgerEvent = {
    id: check.id,
    payer,
    token_symbol: check.token_symbol,
    token_address: check.token_address,
    chain: check.chain,
    size_usd: check.size_usd,
    side: check.side,
    verdict: check.verdict,
    realizable_usd: check.realizable_exit_value_usd,
    usdt0_amount: FEE_USD,
    tx_hash: tx,
    quote_block: check.quote_block,
    latency_ms: check.latency_ms,
    paid_at: new Date().toISOString(),
  };
  recordCall(e);
}

async function main() {
  const { OKX_API_KEY, OKX_SECRET_KEY, OKX_PASSPHRASE } = process.env;
  const creds = OKX_API_KEY && OKX_SECRET_KEY && OKX_PASSPHRASE && PAY_TO;
  let httpPay: Middleware | null = null;
  let mcpPay: Middleware | null = null;

  if (creds) {
    const base = {
      network: NETWORK,
      payTo: PAY_TO,
      price: PRICE,
      apiKey: OKX_API_KEY!,
      secretKey: OKX_SECRET_KEY!,
      passphrase: OKX_PASSPHRASE!,
      strict: STRICT,
    };
    httpPay = await makePaymentMiddleware({ ...base, routeKey: "POST /exit_liquidity_check", description: "Exit-Liquidity Guard — exitable at size?" });
    mcpPay = await makePaymentMiddleware({ ...base, routeKey: "POST /mcp", description: "Exit-Liquidity Guard — exitable at size?" });
    if (httpPay || mcpPay) console.log(`[x402] PAID ${PRICE} → settle ${NETWORK} → ${PAY_TO}${STRICT ? " (strict)" : ""}`);
  } else {
    console.warn("[x402] OKX creds / PAY_TO missing — endpoints run UNPAID (dev). Set env before go-live.");
  }
  const paidActive = Boolean(httpPay || mcpPay);

  // Health reports the ACTUAL middleware-loaded state (not merely whether PAY_TO is set), so a paid
  // deploy that silently failed to load the SDK is visible instead of falsely reporting paid:true.
  app.get("/health", (_req, res) => {
    res.json({
      ok: true,
      service: "exit-liquidity-guard",
      network: NETWORK,
      paid: paidActive,
      strict: STRICT,
      hasCreds: Boolean(creds),
      chains: Object.keys(CHAINS),
    });
  });

  // ── plain HTTP endpoint (payment scoped to just this route) ──
  const httpHandler: express.RequestHandler = async (req, res) => {
    try {
      const check = await runCheck(req.body ?? {});
      if ((req as express.Request & { _paid?: boolean })._paid) {
        res.on("finish", () => {
          try {
            recordSettledCall(check, req, res);
          } catch {
            /* best-effort */
          }
        });
      }
      res.json(check);
    } catch (e) {
      mapErr(e, res);
    }
  };
  const markPaid: express.RequestHandler = (req, _res, next) => {
    (req as express.Request & { _paid?: boolean })._paid = true;
    next();
  };
  if (httpPay) app.post("/exit_liquidity_check", markPaid, httpPay, httpHandler);
  else app.post("/exit_liquidity_check", httpHandler);

  // ── FREE operator route for the demo site's live-data proxy (shared-secret; NOT a public agent API) ──
  // Disabled entirely unless INTERNAL_TOKEN is set. Rate-limited so it can't be turned into an open,
  // quota-burning proxy. Never records to the ledger (it isn't a paid settlement).
  if (INTERNAL_TOKEN) {
    app.post("/internal/exit_liquidity_check", rateLimiter(60), async (req, res) => {
      if (req.header("x-internal-token") !== INTERNAL_TOKEN) {
        res.status(403).json({ error: "forbidden" });
        return;
      }
      try {
        res.json(await runCheck(req.body ?? {}));
      } catch (e) {
        mapErr(e, res);
      }
    });
  }

  // ── A2MCP endpoint (stateless Streamable HTTP) ──
  const runMcp = async (req: express.Request, res: express.Response) => {
    const paid = (req as express.Request & { _paid?: boolean })._paid;
    // Capture the settled check, but record it on `finish` — by then the x402 middleware has set the
    // `payment-response` header (payer + tx), which isn't populated yet while the tool callback runs.
    let settledCheck: ExitLiquidityCheck | null = null;
    const server = buildMcpServer((check) => {
      settledCheck = check;
    });
    if (paid) {
      res.on("finish", () => {
        if (settledCheck)
          try {
            recordSettledCall(settledCheck, req, res);
          } catch {
            /* best-effort */
          }
      });
    }
    const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
    res.on("close", () => {
      void transport.close();
      void server.close();
    });
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  };
  app.post("/mcp", (req, res) => {
    const safe = () => void runMcp(req, res).catch(() => { if (!res.headersSent) res.status(500).end(); });
    // Only a paid tool CALL is charged; initialize / tools/list stay free. Guard against JSON-RPC BATCH
    // (array) bodies: any element that is a paid tools/call makes the whole batch payable — otherwise a
    // batch wrapping exit_liquidity_check would slip through free.
    const isPaidBody = (b: unknown): boolean =>
      !!b &&
      typeof b === "object" &&
      (b as { method?: string; params?: { name?: string } }).method === "tools/call" &&
      (b as { params?: { name?: string } }).params?.name === "exit_liquidity_check";
    const body = req.body as unknown;
    const isPaidCall = Array.isArray(body) ? body.some(isPaidBody) : isPaidBody(body);
    (req as express.Request & { _paid?: boolean })._paid = isPaidCall && !!mcpPay;
    if (isPaidCall && mcpPay) mcpPay(req, res, safe);
    else safe();
  });
  app.get("/mcp", (_req, res) =>
    res.status(405).json({ jsonrpc: "2.0", error: { code: -32000, message: "Method not allowed; use POST." }, id: null }),
  );

  // ── public read surfaces for the web app's live tiles (settlement ledger + chain head) ──
  const reads = rateLimiter(120);
  app.get("/stats", reads, (_req, res) => res.json(getStats()));
  app.get("/feed", reads, (req, res) => res.json(getFeed(req.query.limit ? Number(req.query.limit) : undefined)));
  app.get("/agents", reads, (req, res) => res.json(getAgents(req.query.limit ? Number(req.query.limit) : undefined)));
  app.get("/block", reads, async (req, res) => {
    const ci = String(req.query.chainIndex || "196");
    res.json({ chainIndex: ci, block: await getBlockNumber(ci) });
  });

  app.listen(PORT, () =>
    console.log(`[ExitGuard ASP] http://localhost:${PORT}  ·  POST /exit_liquidity_check  ·  POST /mcp  ·  GET /health`),
  );
}

main();
