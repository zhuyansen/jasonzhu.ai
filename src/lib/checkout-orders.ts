/**
 * 虎皮椒收款订单的临时存储（Vercel KV / Upstash REST），与 club-activate 的
 * 兑换码存储同款套路：KV 是主存储（简单、不受 Supabase 额度事故影响）。
 *
 * key = xhpay_order:<trade_order_id>，值为 JSON。
 */
const KV_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

export type CheckoutOrderStatus = "pending" | "paid" | "completed" | "failed";

export interface CheckoutOrder {
  tradeOrderId: string;
  email: string;
  wechat: string;
  github: string;
  channel: "wechat" | "alipay";
  amount: number;
  status: CheckoutOrderStatus;
  hubKey?: string;
  code?: string; // 支付成功后生成的 GSC- 兑换码，写进 member_codes 做会员中心自动认领的桥
  error?: string;
  emailError?: string; // 确认邮件发送失败的具体原因（不阻塞开通，只做诊断）
  resendId?: string; // 发信成功时 Resend 返回的邮件 id，方便按 id 直接核对投递状态
  ref?: string; // 推荐码（分销归因），付款成功后按 REFERRAL_RATE 记返佣
  refEmail?: string; // 推荐人邮箱（创建订单时已校验：码存在且非自荐）
  createdAt: string;
  paidAt?: string;
  alertedAt?: string; // 发货失败后第一次给 Jason 发告警的时间（只告警一次）
  stuckAlertedAt?: string; // 「已发过码、重试也拿不到 Key」的告警时间
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

const orderKey = (tradeOrderId: string) => `xhpay_order:${tradeOrderId}`;

const PENDING_TTL = 24 * 3600; // 没扫码支付的订单没必要留着
const PAID_TTL = 30 * 24 * 3600; // 收过钱的留 30 天：以前也是 24 小时，卡在「已付款没发货」的订单一天后自己消失，查无可查

export async function saveOrder(order: CheckoutOrder): Promise<boolean> {
  const ttl = order.status === "pending" ? PENDING_TTL : PAID_TTL;
  const res = await kvCmd(
    `set/${encodeURIComponent(orderKey(order.tradeOrderId))}/${encodeURIComponent(JSON.stringify(order))}?EX=${ttl}`
  );
  return Boolean(res && res.ok);
}

/**
 * 读订单，区分「没有这个订单」（ok + order null）和「KV 读不到」（ok false）。
 * 付款回调必须用这个：读不到时要让虎皮椒重试，不能当成订单不存在确认掉。
 */
export async function readOrder(
  tradeOrderId: string
): Promise<{ ok: true; order: CheckoutOrder | null } | { ok: false }> {
  const res = await kvCmd(`get/${encodeURIComponent(orderKey(tradeOrderId))}`);
  if (!res || !res.ok) return { ok: false };
  try {
    const j = await res.json();
    if (!j.result) return { ok: true, order: null };
    return { ok: true, order: JSON.parse(j.result) as CheckoutOrder };
  } catch {
    return { ok: false };
  }
}

/** 读订单；没有或读不到都返回 null（前端轮询用，读不到下一轮再问就行） */
export async function getOrder(tradeOrderId: string): Promise<CheckoutOrder | null> {
  const r = await readOrder(tradeOrderId);
  return r.ok ? r.order : null;
}

const lockKey = (tradeOrderId: string) => `xhpay_lock:${tradeOrderId}`;

async function kvExec(command: string[]): Promise<{ ok: true; result: unknown } | { ok: false }> {
  if (!KV_URL || !KV_TOKEN) return { ok: false };
  try {
    const res = await fetch(KV_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${KV_TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify(command),
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return { ok: false };
    const j = await res.json();
    return { ok: true, result: j.result };
  } catch {
    return { ok: false };
  }
}

/**
 * 同一个订单同一时刻只让一个回调处理（虎皮椒的重试可能和上一次还没跑完的回调撞上：
 * 两边都读到 pending，后写的那个会把 completed 盖回 paid）。锁 2 分钟自己过期。
 * 拿不到（别人在处理，或 KV 不通）返回 false，调用方让虎皮椒稍后重试。
 */
export async function lockOrder(tradeOrderId: string, owner: string): Promise<boolean> {
  const r = await kvExec(["SET", lockKey(tradeOrderId), owner, "NX", "EX", "120"]);
  return r.ok && r.result === "OK";
}

export async function unlockOrder(tradeOrderId: string, owner: string): Promise<void> {
  const r = await kvExec(["GET", lockKey(tradeOrderId)]);
  if (r.ok && r.result === owner) await kvExec(["DEL", lockKey(tradeOrderId)]);
}
