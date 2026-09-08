import { ImageResponse } from "next/og";
import { FARM_NAME, FARM_TAGLINE } from "@/lib/site";

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
          justifyContent: "center",
          padding: "80px",
          background: "#f7f1e4",
          color: "#2a2118",
        }}
      >
        <div style={{ fontSize: 64, marginBottom: 24 }}>🐑🐐🐄🐓🦆🐇🥚</div>
        <div style={{ fontSize: 66, fontWeight: 700, lineHeight: 1.1 }}>{FARM_NAME}</div>
        <div style={{ fontSize: 30, marginTop: 24, color: "#5b5147", maxWidth: 900 }}>
          {FARM_TAGLINE}
        </div>
        <div style={{ fontSize: 24, marginTop: 40, color: "#9a3412", fontWeight: 600 }}>
          845 Kennedy St, Oakland, CA
        </div>
      </div>
    ),
    { ...size },
  );
}
