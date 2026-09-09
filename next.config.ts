import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 根布局是动态段 [lang]，Next 无法在 layout 里 SSR 出 404（body 只剩脚本，见 vercel/next.js#62228）。
  // global-not-found 在路由层直接返回完整 HTML 文档，未匹配 URL 走它。
  experimental: { globalNotFound: true },
  async redirects() {
    return [
      // www → apex 308，统一权重避免双域名收录
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.jasonzhu.ai" }],
        destination: "https://jasonzhu.ai/:path*",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
