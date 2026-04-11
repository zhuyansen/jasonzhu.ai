import { NextRequest, NextResponse } from "next/server";
import { getAllPosts } from "@/lib/mdx";
import { checkAuth } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const authError = checkAuth(request);
  if (authError) return authError;

  const posts = getAllPosts();
  const tagMap: Record<string, { count: number; posts: string[] }> = {};

  for (const post of posts) {
    for (const tag of post.tags) {
      if (!tagMap[tag]) tagMap[tag] = { count: 0, posts: [] };
      tagMap[tag].count++;
      tagMap[tag].posts.push(post.slug);
    }
  }

  const tags = Object.entries(tagMap)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.count - a.count);

  return NextResponse.json({ tags });
}
