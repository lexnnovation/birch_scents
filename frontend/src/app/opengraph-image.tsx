import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  const logo = await readFile(join(process.cwd(), "src/app/icon.png"));
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;

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
        <img src={logoSrc} width={220} height={220} alt="" />
        <div
          style={{
            marginTop: 24,
            fontSize: 80,
            fontWeight: 800,
            letterSpacing: "0.02em",
            color: "#161513",
          }}
        >
          BIRCHSCENTS
        </div>
        <div
          style={{
            marginTop: 20,
            fontSize: 30,
            fontWeight: 500,
            color: "#e4a628",
          }}
        >
          Inhale and Feel the Difference
        </div>
      </div>
    ),
    { ...size },
  );
}
