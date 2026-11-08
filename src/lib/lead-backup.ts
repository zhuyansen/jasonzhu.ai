/**
 * 订阅线索备份到 Vercel KV（Upstash REST）—— 独立于 Supabase，
 * Supabase 整库被限制时仍能兜住线索。未配置 KV 时自动降级（no-op）。
 *
 * Vercel 里加这两个环境变量即可启用（Vercel KV / Upstash 集成自带）：
 *   KV_REST_API_URL
 *   KV_REST_API_TOKEN
 *
 * 兜底的线索存在 Redis list `pending_subscribers`，每条是 JSON：
 *   {"email","source","ts"}
 * 之后可用 admin 或脚本把它们回灌进 Supabase 主表。
 */
// 兼容两种命名：Vercel KV 经典命名 / Upstash 原生命名
const KV_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

export const kvEnabled = () => Boolean(KV_URL && KV_TOKEN);

/** 把一条线索 RPUSH 进备份 list。成功返回 true，失败/未配置返回 false。 */
export async function backupLead(
  email: string,
  source: string
): Promise<boolean> {
  if (!KV_URL || !KV_TOKEN) return false;
  try {
    const value = JSON.stringify({
      email: email.toLowerCase(),
      source: source || "website",
      ts: new Date().toISOString(),
    });
    // Upstash REST：/rpush/<key>/<value>
    const res = await fetch(
      `${KV_URL}/rpush/pending_subscribers/${encodeURIComponent(value)}`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${KV_TOKEN}` },
        // 5s 超时，别让备份拖慢订阅响应
        signal: AbortSignal.timeout(5000),
      }
    );
    return res.ok;
  } catch {
    return false;
  }
}

// ─── 退订兜底（2026-11-06）────────────────────────────────────────────
// Supabase 写不进去时（比如 6 月那次超额被锁成只读），退订先记在 KV hash `pending_unsubscribes`（订阅者 id → 退订时间），
// 页面照常显示「已退订」；Supabase 恢复后跑 scripts/reconcile-leads.mjs 写回主表，日报里有积压告警。
const PENDING_UNSUBSCRIBES = "pending_unsubscribes";

/** 执行一条 Upstash Redis 命令（如 ["SET", key, value]）。成功返回 true；没配 KV、出错、5 秒超时返回 false，不抛错。 */
export async function kvCommand(command: string[]): Promise<boolean> {
  if (!KV_URL || !KV_TOKEN) return false;
  try {
    const res = await fetch(`${KV_URL}/pipeline`, {
      method: "POST",
      headers: { Authorization: `Bearer ${KV_TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify([command]),
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return false;
    const out = (await res.json()) as { result?: unknown; error?: string }[];
    return Array.isArray(out) && !out[0]?.error;
  } catch {
    return false;
  }
}

/** 记一条待写回的退订。成功返回 true，失败/未配置返回 false。 */
export function backupUnsubscribe(id: string): Promise<boolean> {
  return kvCommand(["HSET", PENDING_UNSUBSCRIBES, id, new Date().toISOString()]);
}

/** 重新订阅时撤掉还没写回主表的退订，免得回灌时又把人退订了（best-effort） */
export function clearPendingUnsubscribe(id: string): Promise<boolean> {
  return kvCommand(["HDEL", PENDING_UNSUBSCRIBES, id]);
}
