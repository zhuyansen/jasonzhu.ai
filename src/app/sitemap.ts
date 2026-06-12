import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/mdx";
import { getAllDigests } from "@/lib/news";

const SITE_URL = "https://jasonzhu.ai";
const LANGS = ["zh", "en"] as const;

// 静态页面清单（新增页面记得加这里 —— scripts/check-sitemap.mjs 会做数量断言兜底）
const STATIC_PATHS = [
  "", // /zh, /en 首页
  "/blog",
  "/news",
  "/tools",
  "/services",
  "/about",
  "/handbook",
  "/ai-learning-guide",
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

  // 博客文章：lastmod 用 frontmatter date（真实日期，不造假）。
  // en URL 只收录真正有英文翻译的——未翻译的 en 页是中文内容的逐字节复制，
  // 提交进 sitemap 会触发 GSC「Google 选择的规范网页与用户指定的不同」。
  for (const post of getAllPosts()) {
    const langs = post.hasEnglish ? LANGS : (["zh"] as const);
    for (const lang of langs) {
      entries.push({
        url: `${SITE_URL}/${lang}/blog/${post.slug}`,
        lastModified: new Date(post.date + "T08:00:00+08:00"),
        changeFrequency: "weekly",
        priority: 0.8,
      });
    }
  }

  // 快讯：slug 即日期。en 同理，只收录含英文字段的期数。
  for (const digest of getAllDigests()) {
    const hasEn = digest.items.some((i) => i.summaryEn);
    const langs = hasEn ? LANGS : (["zh"] as const);
    for (const lang of langs) {
      entries.push({
        url: `${SITE_URL}/${lang}/news/${digest.slug}`,
        lastModified: new Date(digest.date + "T08:00:00+08:00"),
        changeFrequency: "monthly",
        priority: 0.6,
      });
    }
  }

  return entries;
}
