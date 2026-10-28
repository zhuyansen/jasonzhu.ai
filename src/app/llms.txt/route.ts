import { getAllPosts } from "@/lib/mdx";
import { GUIDES } from "@/lib/go-global-guides";
import { AUTHOR_ALT_NAME, AUTHOR_NAME, PROFILES } from "@/lib/profiles";

const SITE_URL = "https://jasonzhu.ai";

/** English excerpts are cut at a word boundary, not mid-word. */
function clip(text: string, max: number) {
  if (text.length <= max) return text;
  const cut = text.lastIndexOf(" ", max);
  return `${text.slice(0, cut > 0 ? cut : max)}…`;
}

/**
 * llms.txt — 给 LLM 爬虫的站点导览（https://llmstxt.org 约定）。
 * 动态生成：站点定位 + 核心入口 + 最新文章清单，让 AI 引用时拿到准确上下文。
 */
export async function GET() {
  const posts = getAllPosts().slice(0, 30);
  // Every English article, not only the latest: on 10-28 the English posts were the ones
  // no crawler had fetched in two days, and this file used to list Chinese posts only.
  const english = getAllPosts().filter((p) => p.hasEnglish && p.titleEn);

  const lines = [
    "# JasonZhu.AI",
    "",
    "> 前 AI 算法工程师 Jason Zhu 的中文 AI 博客：AI 工具实测教程、每日 AI 快讯、",
    "> 独立开发者出海实战（英国公司、跨境合规）、自媒体变现方法论。",
    "> 所有教程基于第一手实操，附真实成本与数据。",
    "> English: most articles are also published in English; all of them are listed under \"English articles\" below.",
    "",
    "## 核心入口",
    "",
    `- [博客全集](${SITE_URL}/zh/blog): AI 教程、出海实战、变现案例`,
    `- [Blog (English)](${SITE_URL}/en/blog): the same articles in English`,
    `- [AI 快讯](${SITE_URL}/zh/news): 每日 AI 行业动态 + 融资速递（由 AI 整理；带「Jason 说」的期数经本人点评）`,
    `- [10 大平台 AI 免费学习全景图](${SITE_URL}/zh/blog/ai-free-learning-hub): 系列总目录`,
    `- [AI 工具箱](${SITE_URL}/zh/tools)`,
    `- [出海专题](${SITE_URL}/zh/go-global): 个人还是公司、开哪家收款、出海选品周报`,
    `- [收款平台选择器](${SITE_URL}/zh/go-global/payments): 选身份和产品，给出能开户的平台、到手金额和开户步骤（数据来自各平台官方文档）`,
    `- [个人还是公司：海外收款开户指南](${SITE_URL}/zh/go-global/open-account)`,
    ...GUIDES.map((g) => `- [${g.short}](${SITE_URL}/zh/go-global/${g.slug}): ${g.description}`),
    `- [Claude 5.5 提示词库](${SITE_URL}/zh/prompts/claude-opus-5-5): X 上播放过 5000 的 Opus 5.5 / Sonnet 5.5 / Haiku 5.5 / Fable 5.5（内测）作品（含作者公开的原始提示词）、视频与出处`,
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
    "## English articles",
    "",
    ...english.map(
      (p) =>
        `- [${p.titleEn}](${SITE_URL}/en/blog/${p.slug}): ${clip(p.excerptEn || "", 160)}`
    ),
    "",
    "## 作者",
    "",
    `- ${AUTHOR_NAME}（${AUTHOR_ALT_NAME}）：前 AI 算法工程师，现全职 AI 博主 / 出海教练`,
    ...PROFILES.map((p) => `- ${p.label}: ${p.url}`),
    "",
  ];

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
