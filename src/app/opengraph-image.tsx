import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a0a0a",
          color: "#fafafa",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 120, lineHeight: 1, marginBottom: 24 }}>💸</div>
        <div style={{ fontSize: 64, fontWeight: 600, letterSpacing: -1 }}>odlicz.com</div>
        <div style={{ fontSize: 28, color: "#a3a3a3", marginTop: 16 }}>
          Dividend tax tracking for Polish investors
        </div>
      </div>
    ),
    { ...size },
  );
}
