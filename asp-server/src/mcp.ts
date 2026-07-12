// MCP wrapper — makes the ASP A2MCP-native. Exposes `exit_liquidity_check` as an MCP tool over the
// Streamable HTTP transport, calling the same runCheck() engine the paid HTTP endpoint uses.

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { runCheck, CheckError } from "./engine.js";
import type { ExitLiquidityCheck } from "./verdict.js";

/** `onCheck` fires with the result of a successful tool call (used to record settled calls to the ledger). */
export function buildMcpServer(onCheck?: (check: ExitLiquidityCheck) => void): McpServer {
  const server = new McpServer({ name: "exitguard", version: "0.1.0" });

  server.registerTool(
    "exit_liquidity_check",
    {
      title: "Exit-Liquidity Guard",
      description:
        "Before an agent sizes a position, prove whether it can EXIT at that size. Returns BLOCK / WARN / OK, " +
        "the realizable exit value, slippage-to-exit, and what share of the routed sell-side book the order is — " +
        "and BLOCKs trades where the agent's own unwind becomes the market. Priced per call in USDT0 on X Layer.",
      inputSchema: {
        token_address: z.string().describe("The token the agent intends to hold."),
        chain: z.string().describe("CAIP-2 chain id, e.g. eip155:8453 (Base), eip155:1 (Ethereum), eip155:196 (X Layer)."),
        size_usd: z.number().positive().describe("Intended position / exit notional in USD."),
        side: z.enum(["long", "short"]).optional().describe("long = must sell to exit (default)."),
      },
    },
    async (args) => {
      try {
        const check = await runCheck(args);
        try {
          onCheck?.(check);
        } catch {
          /* ledger recording is best-effort — never fail a settled call over it */
        }
        return {
          content: [{ type: "text", text: JSON.stringify(check, null, 2) }],
          structuredContent: check as unknown as Record<string, unknown>,
        };
      } catch (e) {
        const msg = e instanceof CheckError ? e.message : `quote failed: ${(e as Error).message}`;
        return { content: [{ type: "text", text: msg }], isError: true };
      }
    },
  );

  return server;
}
