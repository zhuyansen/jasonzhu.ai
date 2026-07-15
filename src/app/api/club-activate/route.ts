import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { rateLimit } from "@/lib/rate-limit";
import { inviteToTeam, GITHUB_ORG } from "@/lib/github-invite";
import { issueProKey } from "@/lib/agentskillshub";
import { sendActivationEmail } from "@/lib/resend";

export const dynamic = "force-dynamic";

/**
 * GoSail Club 会员自动开通：
 *   兑换码验证 → GitHub Org Team 邀请（自动获得手册/skills 仓库权限）
 *   → 跨站调 agentskillshub.top 的 issue_pro_key RPC 拿真实 Hub Pro Key
 *
 * 需要的环境变量：
 *   GITHUB_PAT                  - fine-grained PAT，对 GoSail Club org 有 Members 写权限
 *   GITHUB_ORG                  - org 名（默认 gosail-club）
 *   GITHUB_TEAM                 - team slug（默认 members）
 *   AGENTSKILLSHUB_SUPABASE_URL / _ANON_KEY / _ISSUE_SECRET
 *                                - 见 ~/content/agent-skills-hub/supabase/migrations/019_issue_pro_key_rpc.sql
 *
 * 兑换码存储：Supabase member_codes 表（主）+ KV 兜底记录激活流水。
 * 码的生成用 scripts/generate-club-codes.mjs。
 *
 * 顺序很重要：GitHub 邀请是幂等的（重复 PUT 无副作用），所以先做；只有 Hub Key
 * 也发放成功才把兑换码标记为已用——避免"码被吃掉但没拿到 Key"的半失败态。
 */
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
    // GitHub 用户名可选：没有 GitHub 的人不该被挡在激活外面，之后能在会员中心补填
    if (ghUser && !/^[a-zA-Z0-9-]{1,39}$/.test(ghUser)) {
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

    // 2) GitHub Team 邀请（可选：没填 GitHub 用户名就跳过，不卡激活流程）
    if (ghUser) {
      const invite = await inviteToTeam(ghUser);
      if (!invite.ok) {
        return NextResponse.json({ error: invite.error }, { status: 400 });
      }
    }

    // 3) 跨站发放真实 Hub Pro Key（失败则不标记码已用，允许安全重试）
    // order_id 传兑换码本身：同一个码重复调用不会重复发码（RPC 侧幂等）
    const issued = await issueProKey(emailStr, "早鸟199", codeStr);
    if (!issued.ok) {
      return NextResponse.json({ error: `GitHub 已开通，但 Hub Key 发放失败：${issued.error}，请重试或联系 Jason` }, { status: 502 });
    }
    const hubKey = issued.key;

    const activation = {
      github: ghUser || null,
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

    // Supabase 尽力同步（解封前静默失败无妨）。
    // 必须 upsert 不能 update：手动生成的码（generate-club-codes.mjs）只写 KV，
    // member_codes 里没有行，update 匹配 0 行会静默丢失激活记录，
    // 导致用户注册后 dashboard 按邮箱认领会员身份失败（7/14 事故：32 人绑不上）。
    try {
      const supabase = getSupabase();
      await supabase.from("member_codes").upsert({
        code: codeStr,
        github_username: ghUser || null,
        email: emailStr,
        hub_key: hubKey,
        activated_at: activation.activated_at,
        expires_at: activation.expires_at,
        status: "activated",
      }, { onConflict: "code" });
    } catch { /* Supabase 锁定期忽略 */ }

    await sendActivationEmail({ to: emailStr, code: codeStr, github: ghUser, hubKey, org: GITHUB_ORG, expiresAt: activation.expires_at.slice(0, 10) });

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
