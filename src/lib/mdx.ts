import fs from "fs";
import path from "path";
import postsData from "@/generated/posts.json";

export interface BlogPostMeta {
  slug: string;
  title: string;
  date: string;
  updated?: string;
  category: string;
  tags: string[];
  excerpt: string;
  coverImage?: string;
  tweetUrl?: string;
  /** 系列名（frontmatter series），如出海选品周报的 "chuhai-weekly" */
  series?: string;
  /** 系列里的期数（frontmatter issue） */
  issue?: number;
  hasEnglish?: boolean;
  /** 英文版标题 / 摘要（有 .en.md 时），博客搜索用 */
  titleEn?: string;
  excerptEn?: string;
  /** 正文小标题（最多 20 个），博客搜索用 */
  headings?: string[];
  /** 正文里的英文词 / 产品名（最多 40 个），博客搜索用 */
  keywords?: string[];
  filename?: string;
}

export interface BlogPost extends BlogPostMeta {
  content: string;
}

const allPostsMeta: BlogPostMeta[] = postsData as BlogPostMeta[];

/** Return metadata for all posts (no content). Suitable for list pages. */
export function getAllPosts(): BlogPostMeta[] {
  return allPostsMeta;
}

/** Return a single post with full content loaded from disk.
 *  lang="en" 且存在 <slug>.en.md 时返回英文版（title/excerpt/coverImage 同步覆盖），否则回退中文。 */
export function getPostBySlug(slug: string, lang?: "zh" | "en"): BlogPost | undefined {
  const meta = allPostsMeta.find((p) => p.slug === slug);
  if (!meta) return undefined;

  const contentDir = path.join(process.cwd(), "src/generated/post-content");

  if (lang === "en" && meta.hasEnglish) {
    const en = JSON.parse(
      fs.readFileSync(path.join(contentDir, `${slug}.en.json`), "utf-8")
    );
    return {
      ...meta,
      title: en.title || meta.title,
      excerpt: en.excerpt || meta.excerpt,
      coverImage: en.coverImage || meta.coverImage,
      content: en.content,
    };
  }

  const { content } = JSON.parse(
    fs.readFileSync(path.join(contentDir, `${slug}.json`), "utf-8")
  );
  return { ...meta, content };
}

/** 出海选品周报：series 为此值的文章自成 /[lang]/weekly 板块，文章本身仍在 /[lang]/blog/<slug> */
export const WEEKLY_SERIES = "chuhai-weekly";

/** 出海选品周报的全部期数，最新一期在前 */
export function getWeeklyIssues(): BlogPostMeta[] {
  return allPostsMeta
    .filter((p) => p.series === WEEKLY_SERIES)
    .sort((a, b) => (b.issue ?? 0) - (a.issue ?? 0));
}

export function getCategories(): string[] {
  const categories = new Set(allPostsMeta.map((p) => p.category));
  return Array.from(categories);
}
