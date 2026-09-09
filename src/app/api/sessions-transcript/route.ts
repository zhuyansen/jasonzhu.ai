import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { isPaidRole } from "@/lib/membership";
import fs from "fs";
import path from "path";

/**
 * GET /api/sessions-transcript?slug=xxx
 * 会员专属：返回指定场次的逐字稿 + 会议纪要
 */
export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get("slug");
  if (!slug || !/^[\w一-龥-]+$/.test(slug)) {
    return NextResponse.json({ error: "invalid slug" }, { status: 400 });
  }

  // Auth check
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (!isPaidRole(profile?.role)) {
    return NextResponse.json({ error: "members only" }, { status: 403 });
  }

  // Read transcript file
  const filePath = path.join(
    process.cwd(),
    "src/generated/sessions-transcripts",
    `${slug}.json`
  );

  // 会员内容：明确禁止浏览器和 CDN 缓存，避免同一 URL 被后续匿名请求命中
  const headers = { "Cache-Control": "private, no-store" };

  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ transcript: [], summary: "" }, { headers });
  }

  const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  return NextResponse.json(data, { headers });
}
