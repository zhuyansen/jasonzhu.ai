import type { MetadataRoute } from "next";
import { getAllPosts, getWeeklyIssues } from "@/lib/mdx";
import { getAllDigests, isDigestIndexable } from "@/lib/news";
import { getOpusLibrary } from "@/lib/opus-prompts";
import { GUIDES } from "@/lib/go-global-guides";

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
  "/services",
  "/about",
  "/handbook",
  "/ai-learning-guide",
  "/club",
  "/prompts/claude-opus-5-5",
  "/prompts/claude-opus-5-5/motion-graphics", // 动效落地页（打「Claude motion graphics prompts」）
  "/prompts/claude-opus-5-5/fable-5-5", // Fable 5.5 落地页（打「fable 5.5」「claude fable 5.5」）
  "/backlink-spam-list", // 垃圾外链来源库（名单在 GitHub zhuyansen/backlink-spam-list，页面每天重读）
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

  // 出海选品周报目录页（出海专题下）：周报只有中文，en 页 canonical 指回 zh，所以只收 zh
  const latestIssue = getWeeklyIssues()[0];
  entries.push({
    url: `${SITE_URL}/zh/go-global/weekly`,
    ...(latestIssue ? { lastModified: new Date(latestIssue.date + "T08:00:00+08:00") } : {}),
    changeFrequency: "weekly",
    priority: 0.8,
  });

  // 出海专题的指南页（出金、风控、香港公司、获客、插件）：只有中文，en 页 canonical 指回 zh，所以只收 zh
  for (const guide of GUIDES) {
    entries.push({
      url: `${SITE_URL}/zh/go-global/${guide.slug}`,
      lastModified: new Date(guide.checked + "T08:00:00+08:00"),
      changeFrequency: "monthly",
      priority: 0.7,
    });
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

  // Opus 5.5 提示词库详情页：标题/简介中英都是人工写的，zh/en 都收
  const opus = getOpusLibrary();
  for (const c of opus.cases.filter((x) => x.prompt)) { // 无提示词的作品页 noindex，不进 sitemap
    for (const lang of LANGS) {
      entries.push({
        url: `${SITE_URL}/${lang}/prompts/claude-opus-5-5/${c.id}`,
        lastModified: new Date(opus.updatedAt),
        changeFrequency: "monthly",
        priority: 0.6,
      });
    }
  }

  return entries;
}
