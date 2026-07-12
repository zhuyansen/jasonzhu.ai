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
  github: string;
  channel: "wechat" | "alipay";
  amount: number;
  status: CheckoutOrderStatus;
  hubKey?: string;
  code?: string; // 支付成功后生成的 GSC- 兑换码，写进 member_codes 做会员中心自动认领的桥
  error?: string;
  emailError?: string; // 确认邮件发送失败的具体原因（不阻塞开通，只做诊断）
  resendId?: string; // 发信成功时 Resend 返回的邮件 id，方便按 id 直接核对投递状态
  createdAt: string;
  paidAt?: string;
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

export async function saveOrder(order: CheckoutOrder): Promise<boolean> {
  const res = await kvCmd(
    // 24 小时过期：没扫码支付的订单没必要留着
    `set/${encodeURIComponent(orderKey(order.tradeOrderId))}/${encodeURIComponent(JSON.stringify(order))}?EX=86400`
  );
  return Boolean(res && res.ok);
}

export async function getOrder(tradeOrderId: string): Promise<CheckoutOrder | null> {
  const res = await kvCmd(`get/${encodeURIComponent(orderKey(tradeOrderId))}`);
  if (!res || !res.ok) return null;
  const j = await res.json();
  if (!j.result) return null;
  try {
    return JSON.parse(j.result) as CheckoutOrder;
  } catch {
    return null;
  }
}
