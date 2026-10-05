import { NextRequest, NextResponse } from "next/server";
import { checkAuth } from "@/lib/admin-auth";
import { getSupabase, usingServiceKey } from "@/lib/supabase";

export const dynamic = "force-dynamic";

const headers = { "Cache-Control": "private, no-store" };

/**
 * 管理后台读订阅者（替代以前浏览器里直接用 anon key 查 subscribers）。
 * GET ?q=邮箱片段&source=来源&page=0&size=50        → { count, rows, sources }
 * GET ?export=1&q=&source=                         → { rows }（最多 50000 行，导出 CSV 用）
 */
export async function GET(request: NextRequest) {
  const authError = checkAuth(request);
  if (authError) return authError;

  const sp = request.nextUrl.searchParams;
  const q = (sp.get("q") || "").trim();
  const source = (sp.get("source") || "").trim();
  const supabase = getSupabase();

  // 搜索 / 来源筛选（count、分页、导出共用）
  const list = (columns: string, opts?: { count: "exact"; head: true }) => {
    let query = supabase.from("subscribers").select(columns, opts);
    if (q) query = query.ilike("email", `%${q}%`);
    if (source) query = query.eq("source", source);
    return query;
  };

  if (sp.get("export") === "1") {
    const { data, error } = await list("email, source, created_at")
      .order("created_at", { ascending: false })
      .limit(50000);
    if (error) return NextResponse.json({ error: error.message }, { status: 500, headers });
    return NextResponse.json({ rows: data ?? [] }, { headers });
  }

  const page = Math.max(0, Number(sp.get("page") || 0));
  const size = Math.min(200, Math.max(1, Number(sp.get("size") || 50)));

  const [{ count, error: countError }, { data: rows, error: rowsError }, { data: srcRows }] = await Promise.all([
    list("*", { count: "exact", head: true }),
    list("id, email, source, created_at")
      .order("created_at", { ascending: false })
      .range(page * size, page * size + size - 1),
    supabase.from("subscribers").select("source").limit(10000),
  ]);
  if (countError || rowsError) {
    return NextResponse.json({ error: (countError || rowsError)?.message }, { status: 500, headers });
  }
  const sources = Array.from(
    new Set(((srcRows ?? []) as Array<{ source: string | null }>).map((r) => r.source || "").filter(Boolean))
  ).sort();

  return NextResponse.json({ count: count ?? 0, rows: rows ?? [], sources, serviceKey: usingServiceKey() }, { headers });
}
