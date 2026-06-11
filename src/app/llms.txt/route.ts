import { getAllPosts } from "@/lib/mdx";

const SITE_URL = "https://jasonzhu.ai";

/**
 * llms.txt — 给 LLM 爬虫的站点导览（https://llmstxt.org 约定）。
 * 动态生成：站点定位 + 核心入口 + 最新文章清单，让 AI 引用时拿到准确上下文。
 */
export async function GET() {
  const posts = getAllPosts().slice(0, 30);

  const lines = [
    "# JasonZhu.AI",
    "",
    "> 前 AI 算法工程师 Jason Zhu 的中文 AI 博客：AI 工具实测教程、每日 AI 快讯、",
    "> 独立开发者出海实战（英国公司、跨境合规）、自媒体变现方法论。",
    "> 所有教程基于第一手实操，附真实成本与数据。",
    "",
    "## 核心入口",
    "",
    `- [博客全集](${SITE_URL}/zh/blog): AI 教程、出海实战、变现案例`,
    `- [AI 快讯](${SITE_URL}/zh/news): 每日精选 AI 行业动态 + 融资速递`,
    `- [10 大平台 AI 免费学习全景图](${SITE_URL}/zh/blog/ai-free-learning-hub): 系列总目录`,
    `- [AI 工具箱](${SITE_URL}/zh/tools)`,
    `- [博客 RSS](${SITE_URL}/feed/blog.xml)`,
    `- [快讯 RSS](${SITE_URL}/feed/news.xml)`,
    "",
    "## 最新文章",
    "",
    ...posts.map(
      (p) =>
        `- [${p.title}](${SITE_URL}/zh/blog/${p.slug}): ${(p.excerpt || "").slice(0, 80)}`
    ),
    "",
    "## 作者",
    "",
    `- Jason Zhu（祝彦森）：前 AI 算法工程师，现全职 AI 博主 / 出海教练`,
    `- X: https://x.com/GoSailGlobal`,
    `- GitHub: https://github.com/zhuyansen`,
    "",
  ];

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
