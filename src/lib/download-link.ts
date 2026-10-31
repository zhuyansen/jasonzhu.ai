/**
 * Lead magnet 限时下载链接（2026-10-31 起）：订阅后把签名链接发到邮箱，PDF 不再有公开直链。
 * PDF 放在 public/downloads/，middleware 只放行签名有效、没过期的请求，其余跳回订阅页（?expired=1）。
 * 签名 = HMAC-SHA256(DOWNLOAD_LINK_SECRET, "<文件名>:<过期时间戳>")，用 Web Crypto：middleware（Edge）和 API（Node）都能跑。
 * 这个文件不引任何模块，scripts 里的 node 也能直接 import。
 */

const SITE_URL = "https://jasonzhu.ai";
export const LINK_TTL_DAYS = 7;

export const LEAD_MAGNETS = {
  handbook: {
    file: "handbook.pdf",
    landing: "/handbook",
    title: { zh: "AIP 出海自媒体实战手册", en: "AIP Overseas Social Media Playbook" },
    size: { zh: "约 13MB", en: "~13MB" },
  },
  "ai-learning-guide": {
    file: "ai-free-learning-guide.pdf",
    landing: "/ai-learning-guide",
    title: { zh: "10 大平台 AI 免费学习全景图", en: "The Complete Map of Free AI Learning" },
    size: { zh: "约 350KB", en: "~350KB" },
  },
} as const;

export type LeadMagnet = keyof typeof LEAD_MAGNETS;
export type LinkLang = "zh" | "en";

export function isLeadMagnet(value: unknown): value is LeadMagnet {
  return typeof value === "string" && Object.hasOwn(LEAD_MAGNETS, value);
}

export function magnetByFile(file: string): LeadMagnet | undefined {
  return (Object.keys(LEAD_MAGNETS) as LeadMagnet[]).find((k) => LEAD_MAGNETS[k].file === file);
}

async function sign(payload: string, secret: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const bytes = new Uint8Array(await crypto.subtle.sign("HMAC", key, enc.encode(payload)));
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** 生成 7 天有效的下载链接；l 只决定链接失效时跳回哪个语言的订阅页，不参与签名 */
export async function signDownloadUrl(magnet: LeadMagnet, lang: LinkLang, now = Date.now()): Promise<string> {
  const secret = process.env.DOWNLOAD_LINK_SECRET;
  if (!secret) throw new Error("DOWNLOAD_LINK_SECRET not set");
  const { file } = LEAD_MAGNETS[magnet];
  const exp = Math.floor(now / 1000) + LINK_TTL_DAYS * 86400;
  return `${SITE_URL}/downloads/${file}?exp=${exp}&sig=${await sign(`${file}:${exp}`, secret)}&l=${lang}`;
}

export async function verifyDownload(file: string, exp: string | null, sig: string | null, now = Date.now()): Promise<boolean> {
  const secret = process.env.DOWNLOAD_LINK_SECRET;
  if (!secret || !exp || !sig || !magnetByFile(file) || !/^\d{1,12}$/.test(exp)) return false;
  if (Number(exp) * 1000 < now) return false;
  const expected = await sign(`${file}:${exp}`, secret);
  // 长度相同才逐位比，比较时间和第几位不同无关
  if (expected.length !== sig.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ sig.charCodeAt(i);
  return diff === 0;
}
