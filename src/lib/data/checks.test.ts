import { describe, expect, it } from "vitest";
import { computeCheck, sampleDepthCurve, slippageAtSize, verdictFor } from "./checks";
import { tokens } from "../mock-data";
import type { Token } from "../types";

const bySym = (s: string): Token => {
  const t = tokens.find((t) => t.symbol === s);
  if (!t) throw new Error(`missing test token ${s}`);
  return t;
};
const TPEPE = bySym("TPEPE"); // thin -> BLOCK at size
const WETH = bySym("WETH"); // deep -> OK
const pctOf = (t: Token, size: number) => (size / t.liquidity.sellSideDepthUsd) * 100;

describe("verdictFor thresholds (PRD §6.7)", () => {
  it("classifies the OK / WARN / BLOCK bands and their exact boundaries", () => {
    expect(verdictFor(199, 24)).toBe("OK");
    expect(verdictFor(200, 0)).toBe("WARN"); // slippage boundary is inclusive
    expect(verdictFor(0, 25)).toBe("WARN"); // pct boundary is inclusive
    expect(verdictFor(999, 49)).toBe("WARN");
    expect(verdictFor(1000, 0)).toBe("BLOCK"); // aligned with the chart's "BLOCK 10%" line
    expect(verdictFor(0, 50)).toBe("BLOCK");
  });
});

describe("computeCheck — hero BLOCK", () => {
  const c = computeCheck({ token_address: TPEPE.address, chain: TPEPE.chain, size_usd: 50_000 });
  it("returns a dominant BLOCK", () => {
    expect(c.verdict).toBe("BLOCK");
    expect(c.you_are_the_exit_liquidity).toBe(true);
    expect(c.pct_of_available_liquidity).toBeGreaterThanOrEqual(50);
  });
  it("recommends a clean-exit ceiling that is SMALLER than the blocked size (never larger)", () => {
    expect(c.recommended_max_size_usd).toBeGreaterThan(0);
    expect(c.recommended_max_size_usd).toBeLessThan(50_000);
  });
  it("the recommended max is actually an OK size", () => {
    const rec = c.recommended_max_size_usd;
    expect(verdictFor(slippageAtSize(TPEPE, rec), pctOf(TPEPE, rec))).toBe("OK");
  });
});

describe("recommendedMaxSize never recommends a WARN/BLOCK size labelled OK (regression)", () => {
  for (const [sym, size] of [["DEGEN", 60_000], ["MOG", 50_000], ["TPEPE", 25_000]] as const) {
    it(`${sym} @ $${size}`, () => {
      const t = bySym(sym);
      const c = computeCheck({ token_address: t.address, chain: t.chain, size_usd: size });
      const rec = c.recommended_max_size_usd;
      if (c.verdict !== "OK" && rec > 0) {
        expect(rec).toBeLessThanOrEqual(size); // must be a DOWNSIZE, not an upsize
        expect(verdictFor(slippageAtSize(t, rec), pctOf(t, rec))).toBe("OK");
      }
    });
  }
});

describe("computeCheck — deep token is OK, curve is physically valid", () => {
  const c = computeCheck({ token_address: WETH.address, chain: WETH.chain, size_usd: 1_000 });
  it("clears", () => expect(c.verdict).toBe("OK"));
  it("depth_curve has non-decreasing slippage AND non-decreasing realizable value", () => {
    for (let i = 1; i < c.depth_curve.length; i++) {
      expect(c.depth_curve[i].slippage_bps).toBeGreaterThanOrEqual(c.depth_curve[i - 1].slippage_bps);
      expect(c.depth_curve[i].realizable_usd).toBeGreaterThanOrEqual(c.depth_curve[i - 1].realizable_usd);
    }
  });
});

describe("edge cases", () => {
  it("unknown token → hard no-route BLOCK", () => {
    const c = computeCheck({ token_address: "0xdeadbeef", chain: "eip155:196", size_usd: 50_000 });
    expect(c.verdict).toBe("BLOCK");
    expect(c.available_exit_liquidity_usd).toBe(0);
  });
  it("settlement tx_hash is a real 64-hex hash, never all zeros", () => {
    const c = computeCheck({ token_address: WETH.address, chain: WETH.chain, size_usd: 9_000 });
    expect(c.settlement.tx_hash).toMatch(/^0x[0-9a-f]{64}$/);
    expect(c.settlement.tx_hash).not.toBe("0x" + "0".repeat(64));
  });
});

describe("sampleDepthCurve", () => {
  it("returns a monotonic-in-slippage dense trace", () => {
    const s = sampleDepthCurve(TPEPE.address, 80_000, 40);
    expect(s.length).toBe(40);
    for (let i = 1; i < s.length; i++) {
      expect(s[i].slippage_bps).toBeGreaterThanOrEqual(s[i - 1].slippage_bps);
    }
  });
});
