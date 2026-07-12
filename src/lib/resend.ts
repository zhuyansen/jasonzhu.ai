const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM = "GoSail Club <gosail_club@jasonzhu.ai>";

/** 发送激活确认邮件（Hub Key + GitHub 邀请链接），失败静默忽略——邮件是备份，不是激活的必要条件 */
export async function sendActivationEmail(params: {
  to: string;
  github: string;
  hubKey: string;
  org: string;
  expiresAt: string;
}): Promise<void> {
  if (!RESEND_API_KEY) return;
  const { to, github, hubKey, org, expiresAt } = params;

  const html = `
    <div style="font-family:-apple-system,sans-serif;max-width:520px;margin:0 auto;color:#111">
      <p>你好，</p>
      <p>GoSail Club 会员已开通，有效期至 <b>${expiresAt}</b>。</p>
      <ol style="line-height:1.8">
        <li>接受 GitHub 组织邀请：<a href="https://github.com/orgs/${org}/invitation">github.com/orgs/${org}/invitation</a>（账号 @${github}），自动获得手册 + 两个 skill 仓库权限。</li>
        <li>你的 SkillsHub Pro Key（用于 <a href="https://agentskillshub.top/pro/">agentskillshub.top/pro/</a>，粘贴即用）：<br/>
          <code style="display:inline-block;margin-top:6px;padding:8px 12px;background:#111;color:#4ade80;border-radius:6px;font-size:13px">${hubKey}</code>
        </li>
        <li>加 Jason 微信进会员群，参加半月度讨论会。</li>
      </ol>
      <p style="color:#888;font-size:13px">这封邮件是激活凭证的备份，请妥善保存。</p>
    </div>`;

  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: FROM,
        to: [to],
        subject: "GoSail Club 会员开通成功 — 你的 Hub Key 在这里",
        html,
      }),
      signal: AbortSignal.timeout(10000),
    });
  } catch {
    /* 邮件是备份，失败不阻塞激活流程 */
  }
}
