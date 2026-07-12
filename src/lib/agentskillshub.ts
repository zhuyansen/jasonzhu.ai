const AGENTSKILLSHUB_SUPABASE_URL = process.env.AGENTSKILLSHUB_SUPABASE_URL;
const AGENTSKILLSHUB_ANON_KEY = process.env.AGENTSKILLSHUB_ANON_KEY;
const AGENTSKILLSHUB_ISSUE_SECRET = process.env.AGENTSKILLSHUB_ISSUE_SECRET;

interface IssueProKeyResponse {
  status: "issued" | "already_issued";
  key?: string;
  note?: string;
  downgraded_to_standard?: boolean;
  expires_at?: string;
}

/**
 * 调用 agentskillshub.top 那个独立 Supabase 项目里的 issue_pro_key RPC，
 * 拿一个真实可用的 SkillsHub Pro Key（ash_pro_ 开头，能在 agentskillshub.top/pro/ 激活）。
 * 见 ~/content/agent-skills-hub/supabase/migrations/019_issue_pro_key_rpc.sql
 *
 * orderId 传兑换码本身（幂等键）：同一个 order_id 重复调用不会重复发码，
 * RPC 会返回 status="already_issued"（此时明文 key 已经在第一次调用时发出过，拿不回来了，
 * 极端情况下需要人工查 member_keys 表按 order_id/email 处理）。
 */
export async function issueProKey(
  email: string,
  note: string,
  orderId: string
): Promise<{ ok: true; key: string; downgradedToStandard: boolean } | { ok: false; error: string }> {
  if (!AGENTSKILLSHUB_SUPABASE_URL || !AGENTSKILLSHUB_ANON_KEY || !AGENTSKILLSHUB_ISSUE_SECRET) {
    return { ok: false, error: "AgentSkillsHub 发码配置缺失" };
  }

  try {
    const res = await fetch(`${AGENTSKILLSHUB_SUPABASE_URL}/rest/v1/rpc/issue_pro_key`, {
      method: "POST",
      headers: {
        apikey: AGENTSKILLSHUB_ANON_KEY,
        Authorization: `Bearer ${AGENTSKILLSHUB_ANON_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        p_secret: AGENTSKILLSHUB_ISSUE_SECRET,
        p_email: email,
        p_note: note,
        p_order_id: orderId,
      }),
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      const t = await res.text().catch(() => "");
      console.error("[agentskillshub] issue_pro_key failed:", res.status, t.slice(0, 300));
      return { ok: false, error: `发码失败 (${res.status})` };
    }

    const data = (await res.json()) as IssueProKeyResponse;

    if (data.status === "already_issued") {
      console.error("[agentskillshub] order already issued, raw key unrecoverable:", orderId);
      return { ok: false, error: "该订单已发过码（重复请求），明文 key 无法再次获取，请联系 Jason 人工核实" };
    }

    if (!data.key || !data.key.startsWith("ash_pro_")) {
      return { ok: false, error: "发码返回格式异常" };
    }

    return { ok: true, key: data.key, downgradedToStandard: Boolean(data.downgraded_to_standard) };
  } catch {
    return { ok: false, error: "发码请求超时或网络错误" };
  }
}
