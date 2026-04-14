import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
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
          background: "linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "16px",
          }}
        >
          <div
            style={{
              fontSize: 72,
              fontWeight: 700,
              color: "white",
              letterSpacing: "-0.02em",
            }}
          >
            JasonZhu.AI
          </div>
          <div
            style={{
              fontSize: 32,
              color: "rgba(255, 255, 255, 0.9)",
              fontWeight: 400,
            }}
          >
            AI Applications &amp; Practice
          </div>
          <div
            style={{
              fontSize: 24,
              color: "rgba(255, 255, 255, 0.75)",
              fontWeight: 400,
              marginTop: "8px",
            }}
          >
            AI工具评测 | 实战教程 | 出海增长
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
