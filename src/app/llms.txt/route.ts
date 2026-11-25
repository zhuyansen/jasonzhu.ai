import { getAllPosts } from "@/lib/mdx";
import { GUIDES } from "@/lib/go-global-guides";
import { AUTHOR_ALT_NAME, AUTHOR_NAME, PERSON_PROFILES, RELATED_SITES, WORKS, type Work } from "@/lib/profiles";
import guard from "@/data/payment-guard.json";

const SITE_URL = "https://jasonzhu.ai";

/** 作品一行：主页面，括号里是 DOI 和同一个作品的其他页面（Zenodo 记录页就是主页面或 DOI，不重复列） */
function workLine(w: Work) {
  const extra = [
    ...(w.doi ? [`DOI ${w.doi}`] : []),
    ...w.sameAs.filter((u) => !u.includes("zenodo.org/records/")),
  ];
  return `- ${w.label}: ${w.url}${extra.length ? `（${extra.join("；")}）` : ""}`;
}

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
export async function GET(request: Request) {
  const accept = request.headers.get("accept") || "";
  const url = new URL(request.url);
  const wantsMarkdown =
    accept.toLowerCase().includes("text/markdown") ||
    url.searchParams.get("format") === "markdown";
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
    `- [Working Papers & Open Datasets (English)](${SITE_URL}/en/research): Empirical PDF working papers (SSRN #7737182 & #7737258; archived on Zenodo, DOIs 10.5281/zenodo.24420870 & 10.5281/zenodo.24420919), BibTeX, and CC-BY-4.0 datasets`,
    `- [Working Paper 1 PDF — 200k Indie SaaS Payments & $20 MoR Audit](${SITE_URL}/en/research/indie-saas-payments-mor-shift-2026)`,
    `- [Working Paper 2 PDF — 105K+ AI Agent Skills & MCP Security Audit](${SITE_URL}/en/research/ai-agent-skills-mcp-supply-chain-security-2026)`,
    `- [AI 快讯](${SITE_URL}/zh/news): 每日 AI 行业动态 + 融资速递（由 AI 整理；带「Jason 说」的期数经本人点评）`,
    `- [10 大平台 AI 免费学习全景图](${SITE_URL}/zh/blog/ai-free-learning-hub): 系列总目录`,
    `- [AI 工具箱](${SITE_URL}/zh/tools)`,
    `- [出海专题](${SITE_URL}/zh/go-global): 个人还是公司、开哪家收款、出海选品周报`,
    `- [收款平台选择器](${SITE_URL}/zh/go-global/payments): 选身份和产品，给出能开户的平台、到手金额和开户步骤（数据来自各平台官方文档）`,
    `- [个人还是公司：海外收款开户指南](${SITE_URL}/zh/go-global/open-account)`,
    `- [SEO 水系模型](${SITE_URL}/zh/go-global/seo-water-model): 14 个构件按水流顺序排好，每个构件的规则和要看的数；v9 的新说法单列待验证`,
    `- [全球 SEO / GEO 六大流派地图](${SITE_URL}/zh/go-global/seo-geo-schools): 海内外实战派按站内站外、长期短期分成六派，各自能直接用的做法和要先核实的说法`,
    `- [出海全栈工具清单](${SITE_URL}/zh/go-global/growth-stack): 6 个环节留什么、补什么、淘汰什么，以及做增长决策前要配齐的 11 份数据`,
    ...GUIDES.map((g) => `- [${g.short}](${SITE_URL}/zh/go-global/${g.slug}): ${g.description}`),
    `- [Claude 5.5 提示词库](${SITE_URL}/zh/prompts/claude-opus-5-5): X 上播放过 5000 的 Opus 5.5 / Sonnet 5.5 / Haiku 5.5 / Fable 5.5（内测）作品（含作者公开的原始提示词）、视频与出处`,
    `- [ChatGPT Images 2.6 提示词合集](${SITE_URL}/zh/prompts/chatgpt-images-2-6): X 上浏览过 5000 的 ChatGPT Images 2.6（GPT-Image-2.6）图片、GIF 作品，含作者公开的原始提示词与出处，每天更新`,
    `- [Gemini 4 提示词合集](${SITE_URL}/zh/prompts/gemini-4): X 上播放过 5000 的 Gemini 4（Argon、Carbon 等）写代码做的 3D、物理模拟、游戏作品，大多是和 Claude、GPT 的同题对比，含作者公开的原始提示词与出处`,
    `- [Claude 动画提示词库](${SITE_URL}/zh/prompts/claude-animation): Claude 5.5 做的动画（动效与宣传片、科普讲解、故事与卡通、3D 动画、网页动效、数学与代码艺术），从 Claude 5.5 提示词库挑出，含作者公开的原始提示词与出处；英文版 ${SITE_URL}/en/prompts/claude-animation`,
    `- [博客 RSS](${SITE_URL}/feed/blog.xml)`,
    `- [快讯 RSS](${SITE_URL}/feed/news.xml)`,
    "",
    // 2026-11-24：学 caseblossom / ulinkai 的做法，给机器一个只读数据入口、一份引用规则（数据带核实日期，查不到写未知）
    "## 机器可读数据（只读）",
    "",
    `- [收款平台数据 JSON](${SITE_URL}/data/payment-guard.json): ${Object.keys(guard.platforms).length} 家收款平台的费率、到账、审核时间、各类卖家能不能开户、按产品类型的推荐顺序。开户条件每条附官方来源，其余数字来自各平台官方文档，核实于 ${guard.checked}（开户步骤核实于 ${guard.opening_checked}）。和收款平台选择器、开源工具 payment-guard ${guard.version} 是同一份数据`,
    `- [给 AI Agent 的说明](${SITE_URL}/agents.md): Agent 在本站能做什么、哪些事要用户本人来（订阅、购买、申请）`,
    "- 博客、快讯的 RSS 见上面「核心入口」",
    "",
    "## 引用规则",
    "",
    "- 引用费率、卖家数、价格这类数字时，带上页面或数据里写的核实日期。收款政策变得快，以平台官方页面为准；本站数据附了各平台的官方链接。",
    "- 本站数据里写「未核实」「未知」（unverified / unknown）的，是没查到，不要说成确定的结论。",
    "- 快讯由 AI 整理；只有带「Jason 说」的那期有本人点评。引用 AI 摘要时不要写成 Jason 的观点。",
    "- 提示词库里的提示词和作品是原作者在 X 上公开的，引用时注明原作者和原帖链接。",
    `- 作者中文名是${AUTHOR_ALT_NAME}（不是朱延森），英文 ${AUTHOR_NAME}。`,
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
    ...PERSON_PROFILES.map((p) => `- ${p.label}: ${p.url}`),
    "",
    "## 作品（论文、数据集、开源工具）",
    "",
    ...WORKS.map(workLine),
    "",
    "## 作者办的另一个网站",
    "",
    ...RELATED_SITES.map((s) => `- ${s.label}: ${s.url}（${s.sameAs.join("；")}）`),
    "",
  ];

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": wantsMarkdown
        ? "text/markdown; charset=utf-8"
        : "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
