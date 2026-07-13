import crypto from "crypto";

/**
 * GoSail Club 兑换码：跟 scripts/generate-club-codes.mjs 用同一套字母表和格式，
 * 保证虎皮椒自动开通生成的码跟人工批量生成的码长得一样、能被同一套工具（--list）读到。
 */
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // 去掉易混淆的 I/O/0/1

export function genClubCode(): string {
  return "GSC-" + Array.from(crypto.randomBytes(8)).map((b) => ALPHABET[b % ALPHABET.length]).join("");
}

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

/** 把新生成的码直接记成"已激活"状态，格式跟 club-activate 手动兑换后写入的一致。 */
export async function recordActivatedClubCode(
  code: string,
  activation: { github: string | null; email: string; wechat?: string; hub_key: string; activated_at: string; expires_at: string }
): Promise<boolean> {
  const res = await kvCmd(`set/${encodeURIComponent("club_code:" + code)}/${encodeURIComponent(JSON.stringify(activation))}`);
  await kvCmd(
    `rpush/club_activations/${encodeURIComponent(JSON.stringify({ code, ...activation, source: "xunhupay" }))}`
  );
  return Boolean(res && res.ok);
}
