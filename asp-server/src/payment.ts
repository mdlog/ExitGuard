// x402 payment middleware wiring — OKX Onchain OS Payment SDK.
// Docs: https://web3.okx.com/onchainos/dev-docs/payments/service-seller-sdk
//
// The @okxweb3/x402-* packages are loaded via DYNAMIC import (non-literal specifier) so this server
// + its verdict engine still typecheck and run in local dev even before those packages are installed.
// Once you `npm install @okxweb3/x402-express @okxweb3/x402-core @okxweb3/x402-evm`, this lights up
// the real 402 → sign → settle flow with zero code changes.

export type PaymentConfig = {
  network: string; // "eip155:196" mainnet | "eip155:1952" testnet
  payTo: string;
  price: string; // USD string, e.g. "$0.02" (auto-converted to the network stablecoin)
  routeKey: string; // e.g. "POST /exit_liquidity_check"
  description: string;
  apiKey: string;
  secretKey: string;
  passphrase: string;
  /**
   * Fail-closed. When true, an SDK-load/init failure THROWS instead of returning null — so a paid
   * deployment can never boot silently UNPAID (giving the tool away for free). Dev leaves it false
   * to run unpaid locally. Set PAY_STRICT=1 (or NODE_ENV=production) at go-live.
   */
  strict?: boolean;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Middleware = (req: any, res: any, next: any) => void;

export async function makePaymentMiddleware(cfg: PaymentConfig): Promise<Middleware | null> {
  try {
    const expressSpec = "@okxweb3/x402-express";
    const coreSpec = "@okxweb3/x402-core";
    const evmSpec = "@okxweb3/x402-evm/exact/server";
    /* eslint-disable @typescript-eslint/no-explicit-any */
    const { paymentMiddleware, x402ResourceServer } = (await import(expressSpec)) as any;
    const { OKXFacilitatorClient } = (await import(coreSpec)) as any;
    const { ExactEvmScheme } = (await import(evmSpec)) as any;
    /* eslint-enable @typescript-eslint/no-explicit-any */

    const facilitatorClient = new OKXFacilitatorClient({
      apiKey: cfg.apiKey,
      secretKey: cfg.secretKey,
      passphrase: cfg.passphrase,
    });
    const resourceServer = new x402ResourceServer(facilitatorClient);
    resourceServer.register(cfg.network, new ExactEvmScheme());

    return paymentMiddleware(
      {
        [cfg.routeKey]: {
          accepts: [{ scheme: "exact", network: cfg.network, payTo: cfg.payTo, price: cfg.price }],
          description: cfg.description,
          mimeType: "application/json",
        },
      },
      resourceServer,
    ) as Middleware;
  } catch (e) {
    const msg = (e as Error).message;
    if (cfg.strict) {
      // Fail-closed: refuse to serve a paid route unpaid. Crash loudly so the deploy is fixed.
      throw new Error(
        `[x402] FATAL: payment middleware failed to load for "${cfg.routeKey}" (${msg}). ` +
          `Refusing to boot UNPAID in strict mode. Run \`npm install @okxweb3/x402-express @okxweb3/x402-core @okxweb3/x402-evm\` and check OKX creds.`,
      );
    }
    console.warn(`[x402] payment middleware unavailable (${msg}). Running UNPAID (dev only).`);
    return null;
  }
}
