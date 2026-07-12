const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM = "GoSail Club <gosail_club@jasonzhu.ai>";
const SITE_URL = "https://jasonzhu.ai";

/** 发送激活确认邮件（兑换码 + Hub Key + GitHub 邀请链接），失败静默忽略——邮件是备份，不是激活的必要条件 */
export async function sendActivationEmail(params: {
  to: string;
  code: string;
  github: string;
  hubKey: string;
  org: string;
  expiresAt: string;
}): Promise<void> {
  if (!RESEND_API_KEY) return;
  const { to, code, github, hubKey, org, expiresAt } = params;

  const html = `
    <div style="font-family:-apple-system,sans-serif;max-width:520px;margin:0 auto;color:#111">
      <p>🎉 恭喜，<b>@${github}</b> 已加入 <b>${org}</b> GitHub 组织，GoSail Club 会员开通成功，有效期至 <b>${expiresAt}</b>。</p>

      <h3 style="margin:24px 0 8px;font-size:14px">① 你的兑换码（已使用，仅作凭证留存）</h3>
      <code style="display:inline-block;padding:6px 10px;background:#f3f4f6;color:#374151;border-radius:6px;font-size:13px">${code}</code>
      <p style="color:#888;font-size:12px;margin-top:4px">遇到问题联系 Jason 时报这个码，方便核对你的开通记录。</p>

      <h3 style="margin:24px 0 8px;font-size:14px">② 你的 SkillsHub Pro Key</h3>
      <code style="display:inline-block;padding:8px 12px;background:#111;color:#4ade80;border-radius:6px;font-size:13px">${hubKey}</code>
      <p style="color:#888;font-size:12px;margin-top:4px;line-height:1.7">
        <b>网页端：</b>打开 <a href="https://agentskillshub.top/pro/">agentskillshub.top/pro/</a>，粘贴这串 key 即可解锁全库深度搜索、社区精选榜、Top3 解读——不用注册、不用登录。<br/><br/>
        <b>CLI：</b>设置环境变量 <code style="background:#f3f4f6;padding:1px 4px;border-radius:3px">ASH_PRO_KEY=${hubKey}</code> 后，<code style="background:#f3f4f6;padding:1px 4px;border-radius:3px">npx @agentskillshub/cli search</code> 自动走 README 深度搜索（200 条结果）；也可以用 <code style="background:#f3f4f6;padding:1px 4px;border-radius:3px">--pro</code> / <code style="background:#f3f4f6;padding:1px 4px;border-radius:3px">--free</code> 手动切换模式。<br/><br/>
        <b>MCP：</b>在 Claude Code / Cursor 等客户端配置好 agentskillshub MCP server 后，agent 可以直接调用新的 <code style="background:#f3f4f6;padding:1px 4px;border-radius:3px">pro_search</code> 工具做 README 深度检索（同样靠 <code style="background:#f3f4f6;padding:1px 4px;border-radius:3px">ASH_PRO_KEY</code> 环境变量认证）。<br/><br/>
        <b>怎么再次查看：</b>这封邮件是唯一明文备份，请自行保存；以后 <a href="https://jasonzhu.ai/zh/dashboard">jasonzhu.ai 会员中心</a>登录后也能查看。
      </p>

      <h3 style="margin:24px 0 8px;font-size:14px">③ 接下来</h3>
      <ol style="line-height:1.8;padding-left:20px;margin:0">
        <li>接受 GitHub 组织邀请：<a href="https://github.com/orgs/${org}/invitation">github.com/orgs/${org}/invitation</a>，自动获得 AIP 出海手册 + 两个 skill 仓库权限。</li>
        <li>加 Jason 微信进会员群，参加半月度讨论会：</li>
      </ol>
      <img src="${SITE_URL}/wechat-qr.jpg" alt="Jason Zhu 微信二维码" width="180" style="display:block;margin:12px 0;border-radius:8px" />
    </div>`;

  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: FROM,
        to: [to],
        subject: "🎉 GoSail Club 会员开通成功 — 兑换码 + Hub Key 在这里",
        html,
      }),
      signal: AbortSignal.timeout(10000),
    });
  } catch {
    /* 邮件是备份，失败不阻塞激活流程 */
  }
}
