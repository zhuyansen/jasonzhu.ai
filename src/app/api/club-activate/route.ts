import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

/**
 * GoSail Club 会员自动开通：
 *   兑换码验证 → GitHub Org Team 邀请（自动获得手册/skills 仓库权限）→ 生成 Hub Pro Key
 *
 * 需要的环境变量：
 *   GITHUB_PAT      - fine-grained PAT，对 GoSail Club org 有 Members 写权限
 *   GITHUB_ORG      - org 名（默认 gosail-club）
 *   GITHUB_TEAM     - team slug（默认 members）
 *
 * 兑换码存储：Supabase member_codes 表（主）+ KV 兜底记录激活流水。
 * 码的生成用 scripts/generate-club-codes.mjs。
 */
const KV_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const GITHUB_PAT = process.env.GITHUB_PAT;
const GITHUB_ORG = process.env.GITHUB_ORG || "gosail-club";
const GITHUB_TEAM = process.env.GITHUB_TEAM || "members";

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

/** KV 里的兑换码：key = club_code:<CODE>，值为 "unused" 或激活信息 JSON */
async function kvGetCode(code: string): Promise<string | null> {
  const res = await kvCmd(`get/${encodeURIComponent("club_code:" + code)}`);
  if (!res || !res.ok) return null;
  const j = await res.json();
  return j.result ?? null;
}

async function kvSetCode(code: string, value: string): Promise<boolean> {
  const res = await kvCmd(
    `set/${encodeURIComponent("club_code:" + code)}/${encodeURIComponent(value)}`
  );
  return Boolean(res && res.ok);
}

/** 邀请 GitHub 用户进 org team（自动拿到 team 下所有仓库权限） */
async function inviteToTeam(username: string): Promise<{ ok: boolean; error?: string }> {
  if (!GITHUB_PAT) return { ok: false, error: "GITHUB_PAT 未配置" };
  // 先确认用户名存在
  const userRes = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}`, {
    headers: { Authorization: `Bearer ${GITHUB_PAT}`, "User-Agent": "gosail-club" },
    signal: AbortSignal.timeout(10000),
  });
  if (userRes.status === 404) return { ok: false, error: "GitHub 用户名不存在，请检查拼写" };
  if (!userRes.ok) return { ok: false, error: `GitHub 校验失败 (${userRes.status})` };

  const res = await fetch(
    `https://api.github.com/orgs/${GITHUB_ORG}/teams/${GITHUB_TEAM}/memberships/${encodeURIComponent(username)}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${GITHUB_PAT}`,
        "User-Agent": "gosail-club",
        Accept: "application/vnd.github+json",
      },
      body: JSON.stringify({ role: "member" }),
      signal: AbortSignal.timeout(10000),
    }
  );
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    console.error("[club-activate] team invite failed:", res.status, t.slice(0, 200));
    return { ok: false, error: `邀请失败 (${res.status})，请联系 Jason` };
  }
  return { ok: true };
}

function genHubKey(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "gsc_";
  for (let i = 0; i < 24; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

export async function POST(request: NextRequest) {
  const rateLimited = rateLimit(request, { limit: 5, prefix: "club-activate" });
  if (rateLimited) return rateLimited;

  try {
    const { code, github, email, website, ts } = await request.json();

    // 反 bot（与 club-apply 同款，bot 静默失败）
    if (website && String(website).trim() !== "") {
      return NextResponse.json({ error: "激活失败" }, { status: 400 });
    }
    if (typeof ts !== "number" || Date.now() - ts < 2000) {
      return NextResponse.json({ error: "激活失败，请刷新重试" }, { status: 400 });
    }

    const codeStr = String(code || "").trim().toUpperCase();
    const ghUser = String(github || "").trim().replace(/^@/, "");
    const emailStr = String(email || "").trim().toLowerCase();

    if (!/^GSC-[A-Z0-9]{8}$/.test(codeStr)) {
      return NextResponse.json({ error: "兑换码格式不正确（GSC-XXXXXXXX）" }, { status: 400 });
    }
    if (!/^[a-zA-Z0-9-]{1,39}$/.test(ghUser)) {
      return NextResponse.json({ error: "GitHub 用户名格式不正确" }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailStr)) {
      return NextResponse.json({ error: "请输入有效邮箱" }, { status: 400 });
    }

    // 1) 验码（KV 为主：解封期照常工作；Supabase 可用时同步）
    const codeState = await kvGetCode(codeStr);
    if (codeState === null) {
      return NextResponse.json({ error: "兑换码不存在，请核对或联系 Jason" }, { status: 400 });
    }
    if (codeState !== "unused") {
      return NextResponse.json({ error: "该兑换码已被使用" }, { status: 400 });
    }

    // 2) GitHub Team 邀请
    const invite = await inviteToTeam(ghUser);
    if (!invite.ok) {
      return NextResponse.json({ error: invite.error }, { status: 400 });
    }

    // 3) 生成 Hub Key + 落库
    const hubKey = genHubKey();
    const activation = {
      github: ghUser,
      email: emailStr,
      hub_key: hubKey,
      activated_at: new Date().toISOString(),
      // 年付：到期日 = 激活日 + 365 天
      expires_at: new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString(),
    };

    // KV 标记已用（原子性靠先读后写 + 码空间大，冲突概率可忽略）
    await kvSetCode(codeStr, JSON.stringify(activation));
    // 流水追加，便于导出/回灌
    await kvCmd(
      `rpush/club_activations/${encodeURIComponent(JSON.stringify({ code: codeStr, ...activation }))}`
    );

    // Supabase 尽力同步（解封前静默失败无妨）
    try {
      const supabase = getSupabase();
      await supabase.from("member_codes").update({
        github_username: ghUser,
        email: emailStr,
        hub_key: hubKey,
        activated_at: activation.activated_at,
        expires_at: activation.expires_at,
        status: "activated",
      }).eq("code", codeStr);
    } catch { /* Supabase 锁定期忽略 */ }

    return NextResponse.json({
      success: true,
      github: ghUser,
      hubKey,
      expiresAt: activation.expires_at.slice(0, 10),
      org: GITHUB_ORG,
    });
  } catch {
    return NextResponse.json({ error: "服务器错误，请稍后重试" }, { status: 500 });
  }
}
