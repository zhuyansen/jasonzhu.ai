/**
 * 退订链接签名（2026-11-06 起）。快讯、周报的每封邮件都带收件人自己的退订链接：
 *   邮件头 List-Unsubscribe → /api/unsubscribe?id=…&t=…&l=zh（Gmail / Yahoo 的一键退订直接 POST 这里，RFC 8058）
 *   页脚「退订」            → /zh/unsubscribe?id=…&t=…（确认页，点按钮才退订）
 * URL 里只有订阅者 id（subscribers.id，UUID）和签名 t，不放邮箱。
 * t = HMAC-SHA256(UNSUBSCRIBE_SECRET, "unsubscribe:<小写邮箱>")，base64url；验签时按 id 从库里取邮箱再算一遍。
 * 链接不过期：旧邮件里的退订链接必须一直能用。所以 UNSUBSCRIBE_SECRET（Vercel 和 GitHub Actions 各存一份、值相同）
 * 不能换，换了历史邮件里的退订链接全部失效。
 * 这个文件不引任何模块：网站（API、退订页）和发信脚本（scripts/lib/newsletter.mjs，Node 22.18+ 能直接 import .ts）共用。
 */

const SITE_URL = "https://jasonzhu.ai";
const ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type UnsubscribeLang = "zh" | "en";

/** subscribers.id 是 UUID；格式不对的直接当无效链接，不去查库 */
export function isSubscriberId(value: unknown): value is string {
  return typeof value === "string" && ID_PATTERN.test(value);
}

async function hmac(payload: string, secret: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const bytes = new Uint8Array(await crypto.subtle.sign("HMAC", key, enc.encode(payload)));
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

const payload = (email: string) => `unsubscribe:${email.trim().toLowerCase()}`;

export async function unsubscribeToken(email: string, secret = process.env.UNSUBSCRIBE_SECRET): Promise<string> {
  if (!secret) throw new Error("UNSUBSCRIBE_SECRET not set");
  return hmac(payload(email), secret);
}

export async function verifyUnsubscribeToken(
  email: string | null | undefined,
  token: string | null | undefined,
  secret = process.env.UNSUBSCRIBE_SECRET
): Promise<boolean> {
  if (!secret || !email || !token) return false;
  const expected = await hmac(payload(email), secret);
  // 长度相同才逐位比，比较时间和第几位不同无关
  if (expected.length !== token.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ token.charCodeAt(i);
  return diff === 0;
}

/** 一个收件人的两条退订链接：oneClick 放邮件头 List-Unsubscribe，page 放页脚。l 只决定打开哪个语言的确认页，不参与签名 */
export async function unsubscribeUrls(
  id: string,
  email: string,
  { lang = "zh", secret = process.env.UNSUBSCRIBE_SECRET }: { lang?: UnsubscribeLang; secret?: string } = {}
): Promise<{ oneClick: string; page: string }> {
  if (!isSubscriberId(id)) throw new Error(`not a subscriber id: ${id}`);
  const t = await unsubscribeToken(email, secret);
  return {
    oneClick: `${SITE_URL}/api/unsubscribe?id=${id}&t=${t}&l=${lang}`,
    page: `${SITE_URL}/${lang}/unsubscribe?id=${id}&t=${t}`,
  };
}
