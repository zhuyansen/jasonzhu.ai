import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 根布局是动态段 [lang]，Next 无法在 layout 里 SSR 出 404（body 只剩脚本，见 vercel/next.js#62228）。
  // global-not-found 在路由层直接返回完整 HTML 文档，未匹配 URL 走它。
  experimental: { globalNotFound: true },
  async redirects() {
    return [
      // 目前只有一个模型的提示词库，/prompts 先跳过去；以后有第二个再做索引页
      { source: "/:lang(zh|en)/prompts", destination: "/:lang/prompts/claude-opus-5-5", permanent: false },
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
      {
        // X 的视频 CDN（video.twimg.com）对带外站 Referer 的请求返回 403；
        // 提示词库要站内播放原视频，这组页面不发 Referer。规则靠后，覆盖上面的全站策略。
        source: "/:lang(zh|en)/prompts/:path*",
        headers: [{ key: "Referrer-Policy", value: "no-referrer" }],
      },
    ];
  },
};

export default nextConfig;
