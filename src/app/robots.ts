import type { MetadataRoute } from "next";
import { getOpusLibrary } from "@/lib/opus-prompts";

const BASE_DISALLOW = ["/api/", "/admin", "/dashboard"];

/**
 * AI 训练 / 索引爬虫：不让它们抓提示词库里「没有提示词」的作品详情页（页面本身 noindex、不进 sitemap，
 * 对 AI 引用也没价值）。这些页 1000+ 个 × 中英两份，是 Vercel Edge Requests 的大头（2026-10-07 额度事故）。
 * 用户在 ChatGPT / Claude / Perplexity 里主动打开链接用的 *-User 代理不在名单里，照常放行；Google / Bing 也不受影响。
 * 注意：某个爬虫一旦命中这里的分组，就不再读 `*` 分组，所以 BASE_DISALLOW 要重复写一遍。
 */
const AI_CRAWLERS = [
  "GPTBot", "OAI-SearchBot", "ClaudeBot", "anthropic-ai", "Claude-SearchBot", "PerplexityBot", "CCBot", "Bytespider",
  "Amazonbot", "meta-externalagent", "FacebookBot", "cohere-ai", "Diffbot", "YouBot", "Timpibot", "ImagesiftBot",
];

export default function robots(): MetadataRoute.Robots {
  const noPrompt = getOpusLibrary()
    .cases.filter((c) => !c.prompt)
    .flatMap((c) => [`/zh/prompts/claude-opus-5-5/${c.id}`, `/en/prompts/claude-opus-5-5/${c.id}`]);
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: BASE_DISALLOW },
      { userAgent: AI_CRAWLERS, allow: "/", disallow: [...BASE_DISALLOW, ...noPrompt] },
    ],
    sitemap: "https://jasonzhu.ai/sitemap.xml",
  };
}
