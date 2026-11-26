import type { MetadataRoute } from "next";
import { getAllPosts, getWeeklyIssues } from "@/lib/mdx";
import { getAllDigests, isDigestIndexable } from "@/lib/news";
import { getOpusLibrary } from "@/lib/opus-prompts";
import { getImageLibrary } from "@/lib/image-prompts";
import { getGeminiLibrary } from "@/lib/gemini-prompts";
import { GUIDES } from "@/lib/go-global-guides";
import { isPromptNoindexed } from "./[lang]/prompts/noindex";

const SITE_URL = "https://jasonzhu.ai";
const LANGS = ["zh", "en"] as const;

// 英文版批量上线日期：en 内容是这天才新建的，给个新鲜 lastmod 催 Google 重抓，
// 加速 GSC 里原「重复/未索引」的 en 页转为已索引（不动 zh 的真实发布日期）
const EN_ADDED = new Date("2026-06-22T08:00:00+08:00");
const enLastMod = (d: Date) => (d > EN_ADDED ? d : EN_ADDED);

// 静态页面清单（新增页面记得加这里 —— scripts/check-sitemap.mjs 会做数量断言兜底）
const STATIC_PATHS = [
  "", // /zh, /en 首页
  "/blog",
  // "/news" 列表页 noindex（聚合 AI 每日快讯），不进 sitemap
  "/tools",
  "/go-global", // 出海专题：开户、收款平台选择器、周报
  "/go-global/payments",
  "/go-global/open-account",
  "/go-global/ai-readiness", // AI 网站急诊室 & 第 1 课 7 关通关小游戏
  "/go-global/seo-water-model", // SEO 水系模型（2026-11-21 从出海专题首页拆出）
  "/go-global/seo-geo-schools", // SEO / GEO 六大流派地图（同上）
  "/go-global/growth-stack", // 出海全栈工具清单 + 11 份数据（同上）
  "/services",
  "/about",
  "/handbook",
  "/ai-learning-guide",
  "/club",
  "/prompts", // 提示词库总览
  "/prompts/claude-opus-5-5",
  "/prompts/claude-opus-5-5/motion-graphics", // 动效落地页（打「Claude motion graphics prompts」）
  "/prompts/claude-opus-5-5/fable-5-5", // Fable 5.5 落地页（打「fable 5.5」「claude fable 5.5」）
  "/prompts/claude-opus-5-5/universe", // 提示词宇宙全屏页（可收录、有 canonical，2026-11-20 审计发现没进 sitemap）
  "/prompts/chatgpt-images-2-6", // ChatGPT Images 2.6 合集（2026-11-05）
  "/prompts/gemini-4", // Gemini 4 合集（2026-11-16，种子来自 Claude 库里的同题对比）
  "/prompts/claude-animation", // Claude 动画提示词库（2026-11-21，从 Claude 库挑出来的动画作品）
  "/backlink-spam-list", // 垃圾外链来源库（名单在 GitHub zhuyansen/backlink-spam-list，页面每天重读）
  "/research", // 学术工作论文与开源数据集索引（PDF + SSRN + CERN Zenodo DOI + BibTeX）
  "/research/indie-saas-payments-mor-shift-2026",
  "/research/ai-agent-skills-mcp-supply-chain-security-2026",
  "/research/ai-crawlers", // AI 爬虫与 AI 引用公开数据（2026-11-26 起，每月更新；中英文都是完整内容）
  "/contact",
  "/sitemap-html",
  "/privacy",
  "/terms",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  // 静态页
  for (const p of STATIC_PATHS) {
    for (const lang of LANGS) {
      entries.push({
        url: `${SITE_URL}/${lang}${p}`,
        changeFrequency: p === "" || p === "/blog" || p === "/news" ? "daily" : "weekly",
        priority: p === "" ? 1.0 : p === "/blog" || p === "/news" ? 0.9 : 0.7,
      });
    }
  }

  // 出海选品周报目录页（出海专题下）：每期都有英文版（2026-10-31 起），中英文都收
  const latestIssue = getWeeklyIssues()[0];
  for (const lang of LANGS) {
    entries.push({
      url: `${SITE_URL}/${lang}/go-global/weekly`,
      ...(latestIssue ? { lastModified: new Date(latestIssue.date + "T08:00:00+08:00") } : {}),
      changeFrequency: "weekly",
      priority: lang === "zh" ? 0.8 : 0.6,
    });
  }

  // 出海专题的指南页（出金、风控、香港公司、获客、插件）：中英文都有（英文版 2026-10-31 补）
  for (const guide of GUIDES) {
    for (const l of LANGS) {
      entries.push({
        url: `${SITE_URL}/${l}/go-global/${guide.slug}`,
        lastModified: new Date(guide.checked + "T08:00:00+08:00"),
        changeFrequency: "monthly",
        priority: l === "zh" ? 0.7 : 0.6,
      });
    }
  }

  // 博客文章：lastmod 用 frontmatter date（真实日期，不造假）。
  // en URL 只收录真正有英文翻译的——未翻译的 en 页是中文内容的逐字节复制，
  // 提交进 sitemap 会触发 GSC「Google 选择的规范网页与用户指定的不同」。
  for (const post of getAllPosts()) {
    const langs = post.hasEnglish ? LANGS : (["zh"] as const);
    const zhDate = new Date(post.date + "T08:00:00+08:00");
    for (const lang of langs) {
      entries.push({
        url: `${SITE_URL}/${lang}/blog/${post.slug}`,
        lastModified: lang === "en" ? enLastMod(zhDate) : zhDate,
        changeFrequency: "weekly",
        priority: 0.8,
      });
    }
  }

  // 快讯：只收 Jason 点评过的期数（其余 noindex，2026-10-06 起）。slug 即日期；en 只收录含英文字段的期数。
  for (const digest of getAllDigests().filter(isDigestIndexable)) {
    const hasEn = digest.items.some((i) => i.summaryEn);
    const langs = hasEn ? LANGS : (["zh"] as const);
    const zhDate = new Date(digest.date + "T08:00:00+08:00");
    for (const lang of langs) {
      entries.push({
        url: `${SITE_URL}/${lang}/news/${digest.slug}`,
        lastModified: lang === "en" ? enLastMod(zhDate) : zhDate,
        changeFrequency: "monthly",
        priority: 0.6,
      });
    }
  }

  // 提示词库详情页：只有带提示词的作品有详情页。提示词不到 100 字符、3 个月零点击的那批 noindex，不进 sitemap
  // （名单和规则见 src/content/opus-prompts/noindex.json，2026-11-21）

  // Opus 5.5 提示词库详情页：标题/简介中英都是人工写的，zh/en 都收
  const opus = getOpusLibrary();
  for (const c of opus.cases.filter((x) => x.prompt && !isPromptNoindexed("claude-opus-5-5", x.id))) {
    for (const lang of LANGS) {
      entries.push({
        url: `${SITE_URL}/${lang}/prompts/claude-opus-5-5/${c.id}`,
        lastModified: new Date(opus.updatedAt),
        changeFrequency: "monthly",
        priority: 0.6,
      });
    }
  }

  // ChatGPT Images 2.6 合集详情页：只有带提示词的作品有详情页，zh/en 都收
  const images = getImageLibrary();
  for (const c of images.cases.filter((x) => x.prompt && !isPromptNoindexed("chatgpt-images-2-6", x.id))) {
    for (const lang of LANGS) {
      entries.push({
        url: `${SITE_URL}/${lang}/prompts/chatgpt-images-2-6/${c.id}`,
        lastModified: new Date(c.addedAt || images.updatedAt || Date.now()),
        changeFrequency: "monthly",
        priority: 0.6,
      });
    }
  }

  // Gemini 4 合集详情页：同图片库，只有带提示词的作品有详情页
  const gemini = getGeminiLibrary();
  for (const c of gemini.cases.filter((x) => x.prompt && !isPromptNoindexed("gemini-4", x.id))) {
    for (const lang of LANGS) {
      entries.push({
        url: `${SITE_URL}/${lang}/prompts/gemini-4/${c.id}`,
        lastModified: new Date(c.addedAt || gemini.updatedAt || Date.now()),
        changeFrequency: "monthly",
        priority: 0.6,
      });
    }
  }

  // Claude 动画提示词库的详情页不进 sitemap：canonical 指向 Claude 5.5 库的同一作品页（2026-11-21），
  // 只有列表页（上面 STATIC_PATHS 里的 /prompts/claude-animation）参与收录。

  return entries;
}
