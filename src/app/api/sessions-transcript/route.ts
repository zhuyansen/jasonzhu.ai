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
  // 会员内容：所有分支（含 401/403）都禁止浏览器和 CDN 缓存
  const headers = { "Cache-Control": "private, no-store" };
  const slug = request.nextUrl.searchParams.get("slug");
  if (!slug || !/^[\w一-龥-]+$/.test(slug)) {
    return NextResponse.json({ error: "invalid slug" }, { status: 400, headers });
  }

  // Auth check
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401, headers });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (!isPaidRole(profile?.role)) {
    return NextResponse.json({ error: "members only" }, { status: 403, headers });
  }

  // Read transcript file
  const filePath = path.join(
    process.cwd(),
    "src/generated/sessions-transcripts",
    `${slug}.json`
  );

  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ transcript: [], summary: "" }, { headers });
  }

  const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  return NextResponse.json(data, { headers });
}
