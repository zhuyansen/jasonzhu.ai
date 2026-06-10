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

  // 博客文章：lastmod 用 frontmatter date（真实日期，不造假）
  for (const post of getAllPosts()) {
    for (const lang of LANGS) {
      entries.push({
        url: `${SITE_URL}/${lang}/blog/${post.slug}`,
        lastModified: new Date(post.date + "T08:00:00+08:00"),
        changeFrequency: "weekly",
        priority: 0.8,
      });
    }
  }

  // 快讯：slug 即日期
  for (const digest of getAllDigests()) {
    for (const lang of LANGS) {
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
