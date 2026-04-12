import { NextRequest, NextResponse } from "next/server";
import { checkAuth } from "@/lib/admin-auth";
import { getPostBySlug } from "@/lib/mdx";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const authError = checkAuth(request);
  if (authError) return authError;

  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  return NextResponse.json({
    frontmatter: {
      title: post.title,
      date: post.date,
      category: post.category,
      tags: post.tags,
      excerpt: post.excerpt,
    },
    content: post.content,
    filePath: post.filename,
  });
}

export async function PUT(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  // Editing files is not supported on Vercel's read-only filesystem
  return NextResponse.json(
    { error: `Cannot edit posts on production. Edit ${slug}.md locally and redeploy.` },
    { status: 405 }
  );
}
