import fs from "fs";
import path from "path";
import postsData from "@/generated/posts.json";

export interface BlogPostMeta {
  slug: string;
  title: string;
  date: string;
  category: string;
  tags: string[];
  excerpt: string;
  coverImage?: string;
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

/** Return a single post with full content loaded from disk. */
export function getPostBySlug(slug: string): BlogPost | undefined {
  const meta = allPostsMeta.find((p) => p.slug === slug);
  if (!meta) return undefined;

  const contentPath = path.join(
    process.cwd(),
    "src/generated/post-content",
    `${slug}.json`
  );
  const { content } = JSON.parse(fs.readFileSync(contentPath, "utf-8"));

  return { ...meta, content };
}

export function getCategories(): string[] {
  const categories = new Set(allPostsMeta.map((p) => p.category));
  return Array.from(categories);
}
