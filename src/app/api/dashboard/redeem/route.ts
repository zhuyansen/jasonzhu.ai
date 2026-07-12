import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { getSupabase } from "@/lib/supabase";
import { rateLimit } from "@/lib/rate-limit";
import { inviteToTeam, GITHUB_ORG } from "@/lib/github-invite";
import { issueProKey } from "@/lib/agentskillshub";
import { sendActivationEmail } from "@/lib/resend";

export const dynamic = "force-dynamic";

const KV_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

async function kvCmd(path: string): Promise<Response | null> {
  if (!KV_URL || !KV_TOKEN) return null;
  try {
    return await fetch(`${KV_URL}/${path}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${KV_TOKEN}` },
      signal: AbortSignal.timeout(5000),
    });
  } catch {
    return null;
  }
}

async function kvGetCode(code: string): Promise<string | null> {
  const res = await kvCmd(`get/${encodeURIComponent("club_code:" + code)}`);
  if (!res || !res.ok) return null;
  const j = await res.json();
  return j.result ?? null;
}

async function kvSetCode(code: string, value: string): Promise<boolean> {
  const res = await kvCmd(`set/${encodeURIComponent("club_code:" + code)}/${encodeURIComponent(value)}`);
  return Boolean(res && res.ok);
}

/**
 * 登录用户在 Dashboard 里绑定兑换码：
 *   验码（KV）→ GitHub Team 邀请 → 生成 Hub Key → 写入 profiles（升级 role，绑定当前登录账号）
 */
export async function POST(request: NextRequest) {
  const rateLimited = rateLimit(request, { limit: 5, prefix: "dashboard-redeem" });
  if (rateLimited) return rateLimited;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }
  if (!user.email) {
    return NextResponse.json({ error: "你的账号没有公开邮箱，无法发放 Hub Key，请用 Google 登录或在 GitHub 设置里公开邮箱后重试" }, { status: 400 });
  }

  try {
    const { code, github } = await request.json();
    const codeStr = String(code || "").trim().toUpperCase();
    const ghUser = String(github || "").trim().replace(/^@/, "");

    if (!/^GSC-[A-Z0-9]{8}$/.test(codeStr)) {
      return NextResponse.json({ error: "兑换码格式不正确（GSC-XXXXXXXX）" }, { status: 400 });
    }
    if (!/^[a-zA-Z0-9-]{1,39}$/.test(ghUser)) {
      return NextResponse.json({ error: "GitHub 用户名格式不正确" }, { status: 400 });
    }

    const codeState = await kvGetCode(codeStr);
    if (codeState === null) {
      return NextResponse.json({ error: "兑换码不存在，请核对或联系 Jason" }, { status: 400 });
    }
    if (codeState !== "unused") {
      return NextResponse.json({ error: "该兑换码已被使用" }, { status: 400 });
    }

    const invite = await inviteToTeam(ghUser);
    if (!invite.ok) {
      return NextResponse.json({ error: invite.error }, { status: 400 });
    }

    // 跨站发放真实 Hub Pro Key（失败则不标记码已用，允许安全重试）
    const issued = await issueProKey(user.email, "标准365");
    if (!issued.ok) {
      return NextResponse.json({ error: `GitHub 已开通，但 Hub Key 发放失败：${issued.error}，请重试或联系 Jason` }, { status: 502 });
    }
    const hubKey = issued.key;
    const activatedAt = new Date().toISOString();
    const expiresAt = new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString();

    await kvSetCode(
      codeStr,
      JSON.stringify({ github: ghUser, email: user.email, hub_key: hubKey, activated_at: activatedAt, expires_at: expiresAt })
    );
    await kvCmd(
      `rpush/club_activations/${encodeURIComponent(
        JSON.stringify({ code: codeStr, github: ghUser, email: user.email, hub_key: hubKey, activated_at: activatedAt, expires_at: expiresAt, user_id: user.id })
      )}`
    );

    // profiles 绑定当前登录账号（用户自己的 session，RLS 只允许改自己那行）
    await supabase
      .from("profiles")
      .update({
        role: "member",
        github_username: ghUser,
        hub_key: hubKey,
        activated_at: activatedAt,
        expires_at: expiresAt,
      })
      .eq("id", user.id);

    // member_codes 归档（尽力，用 anon key，不阻塞主流程）
    try {
      const admin = getSupabase();
      await admin
        .from("member_codes")
        .update({
          github_username: ghUser,
          email: user.email,
          hub_key: hubKey,
          activated_at: activatedAt,
          expires_at: expiresAt,
          status: "activated",
        })
        .eq("code", codeStr);
    } catch {
      /* 忽略 */
    }

    await sendActivationEmail({ to: user.email, github: ghUser, hubKey, org: GITHUB_ORG, expiresAt: expiresAt.slice(0, 10) });

    return NextResponse.json({ success: true, github: ghUser, hubKey, expiresAt: expiresAt.slice(0, 10), org: GITHUB_ORG });
  } catch {
    return NextResponse.json({ error: "服务器错误，请稍后重试" }, { status: 500 });
  }
}
