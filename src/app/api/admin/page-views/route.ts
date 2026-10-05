import { NextRequest, NextResponse } from "next/server";
import { checkAuth } from "@/lib/admin-auth";
import { getSupabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

/** 管理后台读文章阅读数（替代浏览器里直接用 anon key 查 page_views）。POST { slugs: string[] } → { counts } */
export async function POST(request: NextRequest) {
  const authError = checkAuth(request);
  if (authError) return authError;

  let slugs: string[] = [];
  try {
    const body = await request.json();
    slugs = Array.isArray(body?.slugs) ? body.slugs.filter((s: unknown) => typeof s === "string").slice(0, 2000) : [];
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  if (!slugs.length) return NextResponse.json({ counts: {} });

  const { data, error } = await getSupabase().from("page_views").select("slug, count").in("slug", slugs);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const counts: Record<string, number> = {};
  for (const v of data ?? []) counts[v.slug] = v.count;
  return NextResponse.json({ counts }, { headers: { "Cache-Control": "private, no-store" } });
}
