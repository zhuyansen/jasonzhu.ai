import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { getSupabase } from "@/lib/supabase";
import { rateLimit } from "@/lib/rate-limit";
import { inviteToTeam, GITHUB_ORG } from "@/lib/github-invite";

export const dynamic = "force-dynamic";

/**
 * 登录会员事后补填 GitHub 用户名（比如虎皮椒结账时跳过了）：
 * 邀请进 org team + 把 github_username 写回 profiles（RLS 只允许改自己那行）。
 */
export async function POST(request: NextRequest) {
  const rateLimited = rateLimit(request, { limit: 5, prefix: "dashboard-link-github" });
  if (rateLimited) return rateLimited;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  try {
    const { github } = await request.json();
    const ghUser = String(github || "").trim().replace(/^@/, "");
    if (!/^[a-zA-Z0-9-]{1,39}$/.test(ghUser)) {
      return NextResponse.json({ error: "GitHub 用户名格式不正确" }, { status: 400 });
    }

    const invite = await inviteToTeam(ghUser);
    if (!invite.ok) {
      return NextResponse.json({ error: invite.error }, { status: 400 });
    }

    await supabase.from("profiles").update({ github_username: ghUser }).eq("id", user.id);

    // member_codes 尽力同步，按邮箱找最近一条已激活记录
    if (user.email) {
      try {
        const admin = getSupabase();
        await admin
          .from("member_codes")
          .update({ github_username: ghUser })
          .eq("email", user.email)
          .eq("status", "activated");
      } catch {
        /* 忽略 */
      }
    }

    return NextResponse.json({ success: true, github: ghUser, org: GITHUB_ORG });
  } catch {
    return NextResponse.json({ error: "服务器错误，请稍后重试" }, { status: 500 });
  }
}
