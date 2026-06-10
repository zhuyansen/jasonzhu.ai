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
  hasEnglish?: boolean;
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
 *  lang="en" 且存在 <slug>.en.md 时返回英文版（title/excerpt 同步覆盖），否则回退中文。 */
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
      content: en.content,
    };
  }

  const { content } = JSON.parse(
    fs.readFileSync(path.join(contentDir, `${slug}.json`), "utf-8")
  );
  return { ...meta, content };
}

export function getCategories(): string[] {
  const categories = new Set(allPostsMeta.map((p) => p.category));
  return Array.from(categories);
}
