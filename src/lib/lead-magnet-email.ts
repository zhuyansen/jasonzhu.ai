/**
 * 订阅后把 lead magnet 的限时下载链接发到邮箱（Resend），链接签名见 download-link.ts。
 * 防有人拿别人的邮箱刷我们发信：同一 IP 每小时最多 10 封、同一邮箱 24 小时最多 3 封，计数放 KV（Upstash REST）；
 * KV 没配或出错时放行，前面还有 honeypot / time-trap / Origin 三道挡着。
 */
import { LEAD_MAGNETS, LINK_TTL_DAYS, signDownloadUrl, type LeadMagnet, type LinkLang } from "@/lib/download-link";
import { isSubscriberId, unsubscribeUrls } from "@/lib/unsubscribe-token";

const KV_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const FROM = "JasonZhu.AI <news@jasonzhu.ai>";
const REPLY_TO = "m17551076169@gmail.com";

/** 计一次数，窗口内超过 max 次返回 true */
export async function overLimit(key: string, max: number, windowSec: number): Promise<boolean> {
  if (!KV_URL || !KV_TOKEN) return false;
  try {
    const res = await fetch(`${KV_URL}/pipeline`, {
      method: "POST",
      headers: { Authorization: `Bearer ${KV_TOKEN}`, "Content-Type": "application/json" },
      // 第一次计数时才设过期时间（NX），窗口从第一封算起
      body: JSON.stringify([["SET", key, "0", "EX", String(windowSec), "NX"], ["INCR", key]]),
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) return false;
    const out = (await res.json()) as { result?: unknown }[];
    return Number(out?.[1]?.result) > max;
  } catch {
    return false;
  }
}

function renderEmail(magnet: LeadMagnet, lang: LinkLang, url: string) {
  const m = LEAD_MAGNETS[magnet];
  const landing = `https://jasonzhu.ai/${lang}${m.landing}`;
  const landingText = landing.replace("https://", "");
  const href = url.replace(/&/g, "&amp;");
  const s =
    lang === "zh"
      ? {
          subject: `你的《${m.title.zh}》下载链接`,
          hi: "你好，",
          intro: `这是你领取的《${m.title.zh}》，点下面的按钮下载（PDF，${m.size.zh}）。`,
          button: "下载 PDF",
          expiry: (l: string) => `链接 ${LINK_TTL_DAYS} 天内有效。过期了也没关系，回到 ${l} 重新输入邮箱，就会收到新链接。`,
          fallback: "按钮打不开的话，把下面的地址复制到浏览器：",
        }
      : {
          subject: `Your download link: ${m.title.en}`,
          hi: "Hi,",
          intro: `Here's your copy of "${m.title.en}". Click the button below to download it (PDF, ${m.size.en}).`,
          button: "Download PDF",
          expiry: (l: string) => `The link works for ${LINK_TTL_DAYS} days. If it expires, just enter your email again at ${l} and we'll send a new one.`,
          fallback: "If the button doesn't work, copy this address into your browser:",
        };
  const html = `<!doctype html><html><body style="margin:0;background:#f5f7fb;padding:24px 12px;font-family:-apple-system,BlinkMacSystemFont,'PingFang SC','Helvetica Neue',Arial,sans-serif;color:#1f2937">
<div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:16px;padding:32px 28px">
<p style="margin:0 0 16px;font-size:15px">${s.hi}</p>
<p style="margin:0 0 24px;font-size:15px;line-height:1.7">${s.intro}</p>
<p style="margin:0 0 24px;text-align:center"><a href="${href}" style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;font-weight:600;font-size:15px;padding:12px 28px;border-radius:10px">${s.button}</a></p>
<p style="margin:0 0 12px;font-size:13px;line-height:1.7;color:#6b7280">${s.expiry(`<a href="${landing}" style="color:#2563eb">${landingText}</a>`)}</p>
<p style="margin:0 0 24px;font-size:12px;line-height:1.6;color:#9ca3af;word-break:break-all">${s.fallback}<br><a href="${href}" style="color:#6b7280">${href}</a></p>
<p style="margin:0;font-size:13px;color:#6b7280">Jason Zhu · <a href="https://jasonzhu.ai/${lang}" style="color:#2563eb;text-decoration:none">JasonZhu.AI</a></p>
</div></body></html>`;
  const text = [s.hi, s.intro, url, s.expiry(landing), "Jason Zhu · JasonZhu.AI"].join("\n\n");
  return { subject: s.subject, html, text };
}

/** 发一封带 7 天下载链接的邮件；失败抛错（由调用方提示用户重试） */
export async function sendLeadMagnetEmail(email: string, magnet: LeadMagnet, lang: LinkLang): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY not set");
  const { subject, html, text } = renderEmail(magnet, lang, await signDownloadUrl(magnet, lang));
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: FROM,
      reply_to: REPLY_TO,
      to: [email],
      subject,
      html,
      text,
      tags: [{ name: "category", value: "lead_magnet" }],
    }),
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) throw new Error(`Resend ${res.status}: ${(await res.text()).slice(0, 200)}`);
}

/**
 * 英文提示词库订阅欢迎信（prompts-en*）：
 * 1) 给出 Top 50 永久书签链接，避免关闭页面后找不到；
 * 2) 轻量引流到英文高价值生态（Agent Skills Hub 安全索引 + 200K 支付/MoR 实证报告 + GitHub 开源库）；
 * 3) 带 reply_to + 轻量咨询/合作回复钩子，提升发信信誉并承接高意向英文线索。
 */
export async function sendPromptsEnWelcomeEmail(
  email: string,
  subscriberId: string | null,
  source: string
): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY not set");

  const top50Url = "https://jasonzhu.ai/en/prompts/claude-opus-5-5/top-50";
  const skillsHubUrl = "https://agentskillshub.top/?utm_source=jasonzhu_welcome&utm_medium=email";
  const paymentsPaperUrl = "https://jasonzhu.ai/en/research/indie-saas-payments-mor-shift-2026?utm_source=welcome&utm_medium=email";
  const githubUrl = "https://github.com/zhuyansen/awesome-opus-5.5-video";

  let unsub: { oneClick: string; page: string } | null = null;
  if (subscriberId && isSubscriberId(subscriberId) && process.env.UNSUBSCRIBE_SECRET) {
    try {
      unsub = await unsubscribeUrls(subscriberId, email, { lang: "en" });
    } catch {
      unsub = null;
    }
  }

  const subject = "Your Top 50 Claude 5.5 Prompts (+ 2 open AI benchmarks)";
  const unsubHtml = unsub
    ? ` · <a href="${unsub.page.replace(/&/g, "&amp;")}" style="color:#9ca3af;text-decoration:underline">Unsubscribe</a>`
    : "";
  const html = `<!doctype html><html><body style="margin:0;background:#f5f7fb;padding:24px 12px;font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',Arial,sans-serif;color:#1f2937">
<div style="max-width:540px;margin:0 auto;background:#ffffff;border-radius:16px;padding:32px 28px">
<p style="margin:0 0 14px;font-size:15px">Hi there,</p>
<p style="margin:0 0 20px;font-size:15px;line-height:1.7">Thanks for subscribing to the Claude 5.5 / Gemini 4 / ChatGPT Images prompt library. Here's a permanent bookmark to the 50 most-viewed full prompts on one page:</p>
<p style="margin:0 0 24px;text-align:center"><a href="${top50Url}" style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;font-weight:600;font-size:15px;padding:12px 28px;border-radius:10px">Open the Top 50 Prompts →</a></p>
<p style="margin:0 0 10px;font-size:13px;font-weight:600;color:#111827;text-transform:uppercase;letter-spacing:0.04em">If you're building with AI agents or shipping an AI SaaS</p>
<ul style="margin:0 0 22px;padding-left:18px;font-size:14px;line-height:1.75;color:#374151">
  <li style="margin-bottom:8px"><a href="${skillsHubUrl}" style="color:#2563eb;font-weight:600;text-decoration:none">Agent Skills Hub</a> — 130,000+ open-source Claude Code skills &amp; MCP servers graded with an open 44-rule security rubric (so you don't install unsafe skills).</li>
  <li style="margin-bottom:8px"><a href="${paymentsPaperUrl}" style="color:#2563eb;font-weight:600;text-decoration:none">200,000 Indie Checkout Links &amp; $20 MoR Fee Audit (PDF + CSV)</a> — real net take-home comparison across Stripe, Polar, Dodo Payments, Creem, Paddle, and Waffo.</li>
  <li><a href="${githubUrl}" style="color:#2563eb;font-weight:600;text-decoration:none">GitHub: awesome-opus-5.5-video</a> — open dataset of 2,900+ prompt works updated daily.</li>
</ul>
<p style="margin:0 0 20px;font-size:14px;line-height:1.7;color:#4b5563">I'll only email you when there's a standout new prompt or benchmark worth trying. Building something with Claude or launching an AI product globally? Hit reply — I read every message.</p>
<p style="margin:0;font-size:12px;color:#9ca3af">Jason Zhu · <a href="https://jasonzhu.ai/en/research" style="color:#6b7280;text-decoration:none">JasonZhu.AI</a>${unsubHtml}</p>
</div></body></html>`;

  const text = [
    "Hi there,",
    "Thanks for subscribing. Here is your permanent bookmark to the 50 most-viewed Claude 5.5 prompts:",
    top50Url,
    "Two other open resources I maintain if you're building with AI:",
    `- Agent Skills Hub (130,000+ audited Claude Code skills & MCP servers): ${skillsHubUrl}`,
    `- 200,000 Indie Checkout Links & $20 MoR Fee Audit (Working Paper PDF + CC-BY CSV): ${paymentsPaperUrl}`,
    `- GitHub open prompt dataset: ${githubUrl}`,
    "I'll only email when there's a standout new prompt or benchmark worth trying. Hit reply anytime — I read every email.",
    unsub ? `Jason Zhu · JasonZhu.AI\nUnsubscribe: ${unsub.page}` : "Jason Zhu · JasonZhu.AI",
  ].join("\n\n");

  const payload: Record<string, unknown> = {
    from: FROM,
    reply_to: REPLY_TO,
    to: [email],
    subject,
    html,
    text,
    tags: [
      { name: "category", value: "prompts_en_welcome" },
      { name: "source", value: source.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 64) },
    ],
  };
  if (unsub) {
    payload.headers = {
      "List-Unsubscribe": `<${unsub.oneClick}>`,
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) throw new Error(`Resend ${res.status}: ${(await res.text()).slice(0, 200)}`);
}
