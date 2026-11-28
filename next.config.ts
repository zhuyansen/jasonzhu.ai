import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { NextConfig } from "next";

// Claude 提示词库的旧详情页 301 到同语言列表页（2026-11-25 起）。
// 11-17 起没有提示词的作品不建详情页，更早还有作品移出合集。这些旧地址每天有一千多次爬虫来访，全是 404，
// 其中有 Claude、ChatGPT 替用户现场读页，还有 AI 自己编出来的编号（GEOInflow 爬虫日志：近 30 天 9,700 多次）。
// 规则：凡是数字编号、又没有详情页的地址，一律跳走。有详情页的编号从 src/generated/opus-prompts.json 现算，
// 和详情页 generateStaticParams 用同一份数据、同一个条件（带提示词），所以每次构建自动更新：作品有了提示词就不再被跳走。
// 规则在 Vercel 路由层执行，不经过 middleware，也不调函数。Next 要求每条规则编译后的正则不超过 4096 个字符，
// 所以按编号前缀分组：每组一条规则，排除这组里有详情页的编号；不属于任何一组的编号，由最后一条兜底。
const PROMPT_LIB = "prompts/claude-opus-5-5";
const MAX_GROUP_CHARS = 1500;

function promptDetailRedirects() {
  const lib = JSON.parse(readFileSync(join(process.cwd(), "src/generated/opus-prompts.json"), "utf8")) as {
    cases: { id: string; prompt: unknown }[];
  };
  const live = lib.cases.filter((c) => c.prompt).map((c) => c.id);
  if (live.length === 0 || live.some((id) => !/^\d+$/.test(id))) {
    throw new Error("提示词库没有带提示词的作品，或出现了非数字编号：先核对数据，再改 next.config.ts 的跳转规则");
  }
  const groups: [string, string[]][] = [];
  const byPrefix = (ids: string[], len: number) => {
    const m = new Map<string, string[]>();
    for (const id of ids) m.set(id.slice(0, len), [...(m.get(id.slice(0, len)) ?? []), id]);
    return [...m].sort(([a], [b]) => a.localeCompare(b));
  };
  const add = (prefix: string, ids: string[]) => {
    const chars = ids.reduce((n, id) => n + id.length - prefix.length + 1, 0);
    if (chars <= MAX_GROUP_CHARS || ids.every((id) => id.length <= prefix.length + 1)) groups.push([prefix, ids]);
    else for (const [p, sub] of byPrefix(ids, prefix.length + 1)) add(p, sub);
  };
  for (const [p, ids] of byPrefix(live, 4)) add(p, ids);
  const rule = (idPattern: string) => ({
    source: `/:lang(zh|en)/${PROMPT_LIB}/:id(${idPattern})`,
    destination: `/:lang/${PROMPT_LIB}`,
    statusCode: 301,
  });
  return [
    // 以 p 开头、但后面不是这组任何一个有详情页的编号
    ...groups.map(([p, ids]) => rule(`${p}(?!(?:${ids.map((id) => id.slice(p.length)).join("|")})(?!\\d))\\d+`)),
    // 不以任何一组的前缀开头
    rule(`(?!(?:${groups.map(([p]) => p).join("|")}))\\d+`),
  ];
}

const nextConfig: NextConfig = {
  // 根布局是动态段 [lang]，Next 无法在 layout 里 SSR 出 404（body 只剩脚本，见 vercel/next.js#62228）。
  // global-not-found 在路由层直接返回完整 HTML 文档，未匹配 URL 走它。
  experimental: { globalNotFound: true },
  async redirects() {
    return [
      // 选品周报 10-17 挪进出海专题：旧地址永久跳到 /go-global/weekly（周报各期仍在 /blog/<slug>）
      { source: "/:lang(zh|en)/weekly", destination: "/:lang/go-global/weekly", permanent: true },
      // lead magnet PDF 2026-10-31 起改成订阅后邮件发 7 天限时链接（文件在 /downloads/，middleware 校验签名），旧直链跳回订阅页
      { source: "/handbook.pdf", destination: "/zh/handbook", permanent: false },
      { source: "/ai-free-learning-guide.pdf", destination: "/zh/ai-learning-guide", permanent: false },
      // www → apex 308，统一权重避免双域名收录
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.jasonzhu.ai" }],
        destination: "https://jasonzhu.ai/:path*",
        permanent: true,
      },
      // .vercel.app 默认域名 → apex 308，防止 ChatGPT/Claude/搜索引擎收录并引用 vercel.app 替代主域名
      {
        source: "/:path*",
        has: [{ type: "host", value: "jasonzhuai.vercel.app" }],
        destination: "https://jasonzhu.ai/:path*",
        permanent: true,
      },
      // 提示词库没有详情页的旧编号 → 列表页（说明见文件开头）
      ...promptDetailRedirects(),
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
          {
            // Chrome WebMCP Origin Trial (Chrome 149–162, origin https://jasonzhu.ai, expires 2027-03-29, registration 2623610665733980161)
            key: "Origin-Trial",
            value:
              "AkXVskd0NyBZIc5EHmIQwmGBijmoV//aMxMft3l/PaYSmUFwOP/uIGilupEBFeBhZ7c237QIO6x2o9JI//u0BQQAAABLeyJvcmlnaW4iOiJodHRwczovL2phc29uemh1LmFpOjQ0MyIsImZlYXR1cmUiOiJXZWJNQ1AiLCJleHBpcnkiOjE4MDYzNjQ4MDB9",
          },
        ],
      },
      // 提示词库原来在这里单独发 Referrer-Policy: no-referrer，好让 video.twimg.com 不认出外站引用、站内播放 X 原视频。
      // X 条款不允许绕开技术限制，2026-11-21 起视频改成封面加去原帖的链接，这组页面和全站一样用上面的策略。
      {
        // Vercel git preview URL（jasonzhuai-*.vercel.app）加 noindex 兜底，避免预览环境被索引
        source: "/(.*)",
        has: [{ type: "host", value: ".*\\.vercel\\.app" }],
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
      {
        // RFC 8288 Link header for AI agent discovery (llms.txt + MCP Server Card)
        source: "/:path(|zh|en)",
        headers: [
          {
            key: "Link",
            value:
              '</llms.txt>; rel="describedby"; type="text/plain", </.well-known/mcp/server-card.json>; rel="service-desc"; type="application/json"',
          },
        ],
      },
      {
        source: "/.well-known/mcp/server-card.json",
        headers: [
          { key: "Content-Type", value: "application/json; charset=utf-8" },
          { key: "Access-Control-Allow-Origin", value: "*" },
        ],
      },
    ];
  },
};

export default nextConfig;
