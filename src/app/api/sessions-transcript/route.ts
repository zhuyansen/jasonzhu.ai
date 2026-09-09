import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
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
  const role = profile?.role ?? null;
  if (!role || role === "free") {
    return NextResponse.json({ error: "members only" }, { status: 403 });
  }

  // Read transcript file
  const filePath = path.join(
    process.cwd(),
    "src/generated/sessions-transcripts",
    `${slug}.json`
  );

  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ transcript: [], summary: "" });
  }

  const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  return NextResponse.json(data);
}
