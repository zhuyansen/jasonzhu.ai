import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { rateLimit } from "@/lib/rate-limit";
import { getAllPosts } from "@/lib/mdx";
import newsData from "@/generated/news.json";

export const dynamic = "force-dynamic";

// 已知合法 slug 集合（博客 + news），防止 bot 扫接口污染表
function isKnownSlug(slug: string): boolean {
  // 基本格式校验：a-z 0-9 - _，长度 ≤ 100
  if (!/^[a-zA-Z0-9_-]{1,100}$/.test(slug)) return false;
  const blogSlugs = new Set(getAllPosts().map((p) => p.slug));
  const newsSlugs = new Set((newsData as Array<{ slug: string }>).map((n) => n.slug));
  return blogSlugs.has(slug) || newsSlugs.has(slug);
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  if (!isKnownSlug(slug)) return NextResponse.json({ count: 0 });
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("page_views")
    .select("count")
    .eq("slug", slug)
    .single();

  if (error && error.code !== "PGRST116") {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ count: data?.count ?? 0 });
}

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const rateLimited = rateLimit(_request, { limit: 30, prefix: "views" });
  if (rateLimited) return rateLimited;

  const { slug } = await params;

  // 拒绝未知 slug，防止 bot 扫接口污染 page_views 表
  if (!isKnownSlug(slug)) {
    return NextResponse.json({ count: 0 });
  }

  const supabase = getSupabase();

  const { data, error } = await supabase.rpc("increment_page_views", {
    page_slug: slug,
  });

  if (error) {
    // Fallback: upsert manually if RPC doesn't exist
    const { data: existing } = await supabase
      .from("page_views")
      .select("count")
      .eq("slug", slug)
      .single();

    const newCount = (existing?.count ?? 0) + 1;

    const { error: upsertError } = await supabase
      .from("page_views")
      .upsert(
        { slug, count: newCount, updated_at: new Date().toISOString() },
        { onConflict: "slug" }
      );

    if (upsertError) {
      return NextResponse.json({ error: upsertError.message }, { status: 500 });
    }

    return NextResponse.json({ count: newCount });
  }

  return NextResponse.json({ count: data });
}
