import { ImageResponse } from "next/og"

/**
 * Dynamically generated Open Graph / social share image (1200×630).
 * Next.js auto-wires this as og:image (and Twitter falls back to it), so every
 * shared RelayOS link gets a branded preview card.
 */

export const runtime = "edge"
export const alt = "RelayOS — Give Your AI a Memory"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #0a0a0f 0%, #1a1030 60%, #2a1550 100%)",
          padding: "80px",
          fontFamily: "sans-serif",
        }}
      >
        {/* brand */}
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <div
            style={{
              width: "72px",
              height: "72px",
              borderRadius: "18px",
              background: "linear-gradient(135deg, #8b5cf6, #6d28d9)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: "42px",
              fontWeight: 700,
            }}
          >
            R
          </div>
          <div style={{ color: "white", fontSize: "36px", fontWeight: 700 }}>RelayOS</div>
        </div>

        {/* headline */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div
            style={{
              color: "white",
              fontSize: "76px",
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
            }}
          >
            Your AI has amnesia.
          </div>
          <div
            style={{
              fontSize: "76px",
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
              background: "linear-gradient(90deg, #a78bfa, #c4b5fd)",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            RelayOS gives it memory.
          </div>
        </div>

        {/* subline */}
        <div style={{ color: "#a1a1aa", fontSize: "30px", lineHeight: 1.3, maxWidth: "900px" }}>
          Capture AI conversations → auto-extract decisions, action items &amp; questions →
          search them by meaning, forever.
        </div>
      </div>
    ),
    { ...size }
  )
}
