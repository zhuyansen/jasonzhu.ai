import type { MetadataRoute } from "next";
import { getOpusLibrary } from "@/lib/opus-prompts";

const BASE_DISALLOW = ["/api/", "/admin", "/dashboard"];

/**
 * AI 爬虫分两组，规则相同：都不让抓提示词库里「没有提示词」的作品详情页（页面本身 noindex、不进 sitemap，
 * 对 AI 引用也没价值）。这些页 1000+ 个 × 中英两份，是 Vercel Edge Requests 的大头（2026-10-07 额度事故）。
 * - 检索类：给 ChatGPT 搜索、Claude、Perplexity 的实时回答抓页面。单独一组、明确 Allow: /，以后收紧训练类不会连带它们。
 * - 训练类：抓数据训练模型。
 * 两组各列一遍上千条 Disallow，文件约 425KB，还在随作品增长。RFC 9309 只保证读到 500 KiB，超出就截掉后面，
 * 所以检索类放在训练类前面。
 * 用户在 ChatGPT / Claude / Perplexity 里主动打开链接用的 *-User 代理不在名单里，走 `*` 分组照常放行；Google / Bing 也不受影响。
 * 注意：某个爬虫一旦命中这里的分组，就不再读 `*` 分组，所以 BASE_DISALLOW 要重复写一遍。
 */
const AI_SEARCH_CRAWLERS = ["OAI-SearchBot", "Claude-SearchBot", "PerplexityBot"];
const AI_TRAINING_CRAWLERS = [
  "GPTBot", "ClaudeBot", "anthropic-ai", "CCBot", "Bytespider", "Amazonbot",
  "meta-externalagent", "FacebookBot", "cohere-ai", "Diffbot", "YouBot", "Timpibot", "ImagesiftBot",
];

export default function robots(): MetadataRoute.Robots {
  const noPrompt = getOpusLibrary()
    .cases.filter((c) => !c.prompt)
    .flatMap((c) => [`/zh/prompts/claude-opus-5-5/${c.id}`, `/en/prompts/claude-opus-5-5/${c.id}`]);
  const aiDisallow = [...BASE_DISALLOW, ...noPrompt];
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: BASE_DISALLOW },
      { userAgent: AI_SEARCH_CRAWLERS, allow: "/", disallow: aiDisallow },
      { userAgent: AI_TRAINING_CRAWLERS, allow: "/", disallow: aiDisallow },
    ],
    sitemap: "https://jasonzhu.ai/sitemap.xml",
  };
}
