import type { MetadataRoute } from "next";

const BASE_DISALLOW = ["/api/", "/admin", "/dashboard"];

/**
 * AI 爬虫分两组，单独列出并明确 Allow: /（检索类放前面，方便以后独立收紧训练类而不连带检索类）。
 * 三个提示词库已统一为「没有提示词的作品不建详情页、卡片直链 X 原帖」，不再产生上千条 noindex 详情页，
 * 因此 robots.txt 保持在 1 KB 以内，不再随作品增长而逼近 RFC 9309 的 500 KiB 截断上限。
 * 用户在 ChatGPT / Claude / Perplexity 里主动打开链接用的 *-User 代理不在名单里，走 `*` 分组照常放行；Google / Bing 也不受影响。
 * 注意：某个爬虫一旦命中这里的分组，就不再读 `*` 分组，所以 BASE_DISALLOW 要重复写一遍。
 */
const AI_SEARCH_CRAWLERS = ["OAI-SearchBot", "Claude-SearchBot", "PerplexityBot"];
const AI_TRAINING_CRAWLERS = [
  "GPTBot", "ClaudeBot", "anthropic-ai", "CCBot", "Bytespider", "Amazonbot",
  "meta-externalagent", "FacebookBot", "cohere-ai", "Diffbot", "YouBot", "Timpibot", "ImagesiftBot",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: BASE_DISALLOW },
      { userAgent: AI_SEARCH_CRAWLERS, allow: "/", disallow: BASE_DISALLOW },
      { userAgent: AI_TRAINING_CRAWLERS, allow: "/", disallow: BASE_DISALLOW },
    ],
    sitemap: "https://jasonzhu.ai/sitemap.xml",
  };
}
