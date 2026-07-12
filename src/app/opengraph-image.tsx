import { ImageResponse } from "next/og";

export const alt = "ExitGuard — the seatbelt before your agent becomes the exit liquidity";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#090c11",
          padding: "72px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ width: 14, height: 14, borderRadius: 99, background: "#2ed47a" }} />
          <div style={{ color: "#8593a3", fontSize: 24, letterSpacing: 4, fontFamily: "monospace" }}>
            OKX.AI AGENTIC SERVICE PROVIDER
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", color: "#e9eff5", fontSize: 92, fontWeight: 800, lineHeight: 1 }}>
            <span>CAN YOUR AGENT GET</span>
            <span style={{ color: "#22d3ee", margin: "0 16px" }}>OUT</span>
            <span>?</span>
          </div>
          <div style={{ display: "flex", color: "#8593a3", fontSize: 30, marginTop: 28, maxWidth: 960 }}>
            The seatbelt your trading agent calls before it becomes the exit liquidity.
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div style={{ width: 12, height: 12, borderRadius: 99, background: "#22d3ee" }} />
            <div style={{ display: "flex", color: "#e9eff5", fontSize: 30, fontWeight: 700 }}>ExitGuard</div>
          </div>
          <div
            style={{
              display: "flex",
              color: "#ff3b47",
              fontSize: 24,
              fontFamily: "monospace",
              letterSpacing: 2,
              border: "1px solid #ff3b47",
              borderRadius: 6,
              padding: "10px 18px",
            }}
          >
            $0.02 / CALL · USDT0 · X LAYER
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
