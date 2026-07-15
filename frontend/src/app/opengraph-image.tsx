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
          backgroundColor: "#fdfcfb",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 96,
            fontWeight: 800,
            letterSpacing: "0.02em",
            color: "#161513",
          }}
        >
          BIRCHSCENTS
        </div>
        <div
          style={{
            marginTop: 28,
            fontSize: 34,
            fontWeight: 500,
            color: "#1f7a52",
          }}
        >
          Inhale and Feel the Difference
        </div>
      </div>
    ),
    { ...size },
  );
}
