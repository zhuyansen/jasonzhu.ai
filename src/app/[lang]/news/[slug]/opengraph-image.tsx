import { ImageResponse } from "next/og";
import { getDigestBySlug } from "@/lib/news";

export const alt = "News digest cover";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const digest = getDigestBySlug(slug);

  const title = digest?.title ?? "AI News Digest";
  const date = digest?.date ?? "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "60px 80px",
          background: "linear-gradient(135deg, #0f172a 0%, #042f2e 50%, #134e4a 100%)",
          fontFamily: "sans-serif",
        }}
      >
        {/* Category pill */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "6px 20px",
              borderRadius: "9999px",
              backgroundColor: "rgba(20, 184, 166, 0.3)",
              border: "1px solid rgba(20, 184, 166, 0.5)",
              color: "#5eead4",
              fontSize: "20px",
            }}
          >
            AI News
          </div>
          {date && (
            <div
              style={{
                fontSize: "20px",
                color: "#94a3b8",
              }}
            >
              {date}
            </div>
          )}
        </div>

        {/* Title */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            justifyContent: "center",
          }}
        >
          <div
            style={{
              fontSize: title.length > 40 ? "48px" : "56px",
              fontWeight: 700,
              color: "#ffffff",
              lineHeight: 1.3,
              letterSpacing: "-0.02em",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {title}
          </div>
        </div>

        {/* Branding */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #14b8a6, #0d9488)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ffffff",
                fontSize: "22px",
                fontWeight: 700,
              }}
            >
              J
            </div>
            <div
              style={{
                fontSize: "28px",
                fontWeight: 700,
                color: "#e2e8f0",
                letterSpacing: "-0.01em",
              }}
            >
              JasonZhu.AI
            </div>
          </div>
          <div
            style={{
              fontSize: "18px",
              color: "#94a3b8",
            }}
          >
            jasonzhu.ai
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
