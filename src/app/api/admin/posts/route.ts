import { NextRequest, NextResponse } from "next/server";
import { getAllPosts } from "@/lib/mdx";
import { checkAuth } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const authError = checkAuth(request);
  if (authError) return authError;

  const posts = getAllPosts();
  return NextResponse.json({ posts });
}
