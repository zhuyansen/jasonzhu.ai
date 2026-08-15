import crypto from "crypto";

/**
 * GoSail Club 分销（推荐返佣）。
 *
 * 模式：现金返佣 30%，人工月结微信转账；系统只负责归因 + 记账 + 展示。
 * 存储：KV 为主（跟 club_code / xhpay_order 同款，不受 Supabase 额度事故影响），
 *       Supabase referrals 表尽力镜像（可选，见 scripts/settle-referrals.mjs 头部 SQL）。
 *
 * key 布局：
 *   ref_owner:<CODE>         → 推荐人邮箱（反查）
 *   referrals:<CODE>         → list<JSON ReferralRecord>（该推荐人名下的所有成交）
 *   referrals_all            → list<JSON ReferralRecord>（全局流水，结算脚本用）
 *   referral_settled:<orderId> → "1"（已结算标记；记录本身不可变，用标记覆盖状态）
 *
 * 推荐码 = 邮箱 sha256 前 6 位（base32 去混淆字符），确定性生成，无需存储正向映射；
 * 反向映射在会员第一次打开会员中心时写入（那也是他拿到链接的时刻）。
 */

export const REFERRAL_RATE = 0.3;
export const REFERRAL_COOKIE = "gsc_ref";
export const REFERRAL_COOKIE_DAYS = 30;

const KV_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

export interface ReferralRecord {
  orderId: string;
  refCode: string;
  referrerEmail: string;
  buyerEmail: string;
  amount: number; // 实付金额（元）
  commission: number; // 应付返佣（元，四舍五入到整数）
  createdAt: string;
}

export interface ReferralView extends ReferralRecord {
  status: "pending" | "settled";
  buyerMasked: string;
}

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

async function kvGet(key: string): Promise<string | null> {
  const res = await kvCmd(`get/${encodeURIComponent(key)}`);
  if (!res || !res.ok) return null;
  const j = await res.json();
  return j.result ?? null;
}

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // 去掉 I/O/0/1

/** 邮箱 → 推荐码（确定性，6 位）。 */
export function refCodeForEmail(email: string): string {
  const h = crypto.createHash("sha256").update(email.trim().toLowerCase()).digest();
  let out = "";
  for (let i = 0; i < 6; i++) out += ALPHABET[h[i] % ALPHABET.length];
  return out;
}

export function normalizeRefCode(raw: unknown): string {
  return String(raw || "").trim().toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 12);
}

/** 会员打开会员中心时调用：确保反查映射存在，返回他的推荐码。 */
export async function ensureRefCode(email: string): Promise<string> {
  const code = refCodeForEmail(email);
  await kvCmd(`set/${encodeURIComponent(`ref_owner:${code}`)}/${encodeURIComponent(email.trim().toLowerCase())}/nx`);
  return code;
}

/** 推荐码 → 推荐人邮箱；不存在返回 null。 */
export async function resolveRefCode(code: string): Promise<string | null> {
  const c = normalizeRefCode(code);
  if (!c) return null;
  return kvGet(`ref_owner:${c}`);
}

/**
 * 校验推荐码是否可用于某个买家：码存在 + 不是自己推荐自己。
 * 返回推荐人邮箱或 null。
 */
export async function validateRefForBuyer(code: string, buyerEmail: string): Promise<string | null> {
  const owner = await resolveRefCode(code);
  if (!owner) return null;
  if (owner === buyerEmail.trim().toLowerCase()) return null;
  return owner;
}

/** 付款成功后记一笔返佣。幂等：同一 orderId 只记一次。 */
export async function recordReferral(input: {
  orderId: string;
  refCode: string;
  referrerEmail: string;
  buyerEmail: string;
  amount: number;
}): Promise<ReferralRecord | null> {
  const code = normalizeRefCode(input.refCode);
  // 幂等锁：xhpay 回调可能重放
  const lock = await kvCmd(`set/${encodeURIComponent(`referral_order:${input.orderId}`)}/1/nx`);
  if (!lock || !lock.ok) return null;
  const lockJson = await lock.json();
  if (lockJson.result !== "OK") return null; // 已记过

  const rec: ReferralRecord = {
    orderId: input.orderId,
    refCode: code,
    referrerEmail: input.referrerEmail.toLowerCase(),
    buyerEmail: input.buyerEmail.toLowerCase(),
    amount: input.amount,
    commission: Math.round(input.amount * REFERRAL_RATE),
    createdAt: new Date().toISOString(),
  };
  const payload = encodeURIComponent(JSON.stringify(rec));
  await kvCmd(`rpush/${encodeURIComponent(`referrals:${code}`)}/${payload}`);
  await kvCmd(`rpush/referrals_all/${payload}`);
  return rec;
}

function maskEmail(email: string): string {
  const [u, d] = email.split("@");
  if (!d) return email;
  const head = u.slice(0, 2);
  return `${head}${"*".repeat(Math.max(1, Math.min(4, u.length - 2)))}@${d}`;
}

/** 某推荐人名下的全部记录（含结算状态），新到旧。 */
export async function listReferrals(code: string): Promise<ReferralView[]> {
  const res = await kvCmd(`lrange/${encodeURIComponent(`referrals:${normalizeRefCode(code)}`)}/0/-1`);
  if (!res || !res.ok) return [];
  const j = await res.json();
  const items: ReferralRecord[] = (j.result || [])
    .map((s: string) => {
      try {
        return JSON.parse(s) as ReferralRecord;
      } catch {
        return null;
      }
    })
    .filter(Boolean);
  const views: ReferralView[] = [];
  for (const r of items) {
    const settled = await kvGet(`referral_settled:${r.orderId}`);
    views.push({ ...r, status: settled ? "settled" : "pending", buyerMasked: maskEmail(r.buyerEmail) });
  }
  return views.reverse();
}

export function summarize(list: ReferralView[]) {
  let pending = 0;
  let settled = 0;
  for (const r of list) {
    if (r.status === "settled") settled += r.commission;
    else pending += r.commission;
  }
  return { count: list.length, pending, settled };
}
