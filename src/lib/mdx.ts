import postsData from "@/generated/posts.json";

export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  category: string;
  tags: string[];
  excerpt: string;
  coverImage?: string;
  content: string;
  filename?: string;
}

const allPosts: BlogPost[] = postsData as BlogPost[];

export function getAllPosts(): BlogPost[] {
  return allPosts;
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return allPosts.find((p) => p.slug === slug);
}

export function getCategories(): string[] {
  const categories = new Set(allPosts.map((p) => p.category));
  return ["全部", ...Array.from(categories)];
}
