/**
 * 订阅后把 lead magnet 的限时下载链接发到邮箱（Resend），链接签名见 download-link.ts。
 * 防有人拿别人的邮箱刷我们发信：同一 IP 每小时最多 10 封、同一邮箱 24 小时最多 3 封，计数放 KV（Upstash REST）；
 * KV 没配或出错时放行，前面还有 honeypot / time-trap / Origin 三道挡着。
 */
import { LEAD_MAGNETS, LINK_TTL_DAYS, signDownloadUrl, type LeadMagnet, type LinkLang } from "@/lib/download-link";

const KV_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const FROM = "JasonZhu.AI <news@jasonzhu.ai>";

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
    body: JSON.stringify({ from: FROM, to: [email], subject, html, text, tags: [{ name: "category", value: "lead_magnet" }] }),
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) throw new Error(`Resend ${res.status}: ${(await res.text()).slice(0, 200)}`);
}
