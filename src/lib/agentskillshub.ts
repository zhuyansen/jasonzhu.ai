const AGENTSKILLSHUB_SUPABASE_URL = process.env.AGENTSKILLSHUB_SUPABASE_URL;
const AGENTSKILLSHUB_ANON_KEY = process.env.AGENTSKILLSHUB_ANON_KEY;
const AGENTSKILLSHUB_ISSUE_SECRET = process.env.AGENTSKILLSHUB_ISSUE_SECRET;

/**
 * 调用 agentskillshub.top 那个独立 Supabase 项目里的 issue_pro_key RPC，
 * 拿一个真实可用的 SkillsHub Pro Key（ash_pro_ 开头，能在 agentskillshub.top/pro/ 激活）。
 * 见 ~/content/agent-skills-hub/supabase/migrations/019_issue_pro_key_rpc.sql
 */
export async function issueProKey(
  email: string,
  note: string
): Promise<{ ok: true; key: string } | { ok: false; error: string }> {
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
      body: JSON.stringify({ p_secret: AGENTSKILLSHUB_ISSUE_SECRET, p_email: email, p_note: note }),
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      const t = await res.text().catch(() => "");
      console.error("[agentskillshub] issue_pro_key failed:", res.status, t.slice(0, 300));
      return { ok: false, error: `发码失败 (${res.status})` };
    }

    const key = (await res.json()) as string;
    if (!key || !key.startsWith("ash_pro_")) {
      return { ok: false, error: "发码返回格式异常" };
    }
    return { ok: true, key };
  } catch {
    return { ok: false, error: "发码请求超时或网络错误" };
  }
}
