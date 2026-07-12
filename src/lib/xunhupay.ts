import crypto from "crypto";

/**
 * 虎皮椒个人支付网关（微信/支付宝）。文档：https://www.xunhupay.com/doc/api/pay.html
 * 微信、支付宝是两个独立渠道，各有一套 appid/appsecret（后台"我的支付渠道"里拿）。
 *
 * 需要的环境变量：
 *   XUNHUPAY_WECHAT_APPID / XUNHUPAY_WECHAT_APPSECRET
 *   XUNHUPAY_ALIPAY_APPID / XUNHUPAY_ALIPAY_APPSECRET
 *
 * 微信"唤醒跳转支付"自 2025-11-06 起临时关闭，只剩 PC 扫码 + 截图扫码；
 * 支付宝 H5 手机端跳转不受影响。见 https://www.xunhupay.com/blog.html 相关通知。
 */
const GATEWAY_URL = "https://api.xunhupay.com/payment/do.html";

export type XunhupayChannel = "wechat" | "alipay";

function channelCreds(channel: XunhupayChannel): { appid: string; appsecret: string } | null {
  const appid =
    channel === "wechat" ? process.env.XUNHUPAY_WECHAT_APPID : process.env.XUNHUPAY_ALIPAY_APPID;
  const appsecret =
    channel === "wechat" ? process.env.XUNHUPAY_WECHAT_APPSECRET : process.env.XUNHUPAY_ALIPAY_APPSECRET;
  if (!appid || !appsecret) return null;
  return { appid, appsecret };
}

/** 虎皮椒签名算法：非空参数按参数名字典序拼接 key=value&…，末尾直接接 appsecret，取 MD5（32位小写）。 */
function sign(params: Record<string, string | number>, appsecret: string): string {
  const keys = Object.keys(params)
    .filter((k) => k !== "hash" && params[k] !== undefined && params[k] !== null && params[k] !== "")
    .sort();
  const stringA = keys.map((k) => `${k}=${params[k]}`).join("&");
  return crypto.createHash("md5").update(stringA + appsecret).digest("hex");
}

interface CreateOrderParams {
  channel: XunhupayChannel;
  tradeOrderId: string;
  totalFee: number;
  title: string;
  notifyUrl: string;
  returnUrl: string;
}

interface CreateOrderResult {
  ok: true;
  qrUrl: string; // PC 端二维码（微信/支付宝通用，扫码即可支付）
  payUrl: string; // 手机端跳转链接（支付宝有效；微信唤醒跳转已关闭，仅作为兜底）
}

/** 发起一笔虎皮椒订单，成功返回二维码地址 + 手机端跳转链接。 */
export async function createXunhupayOrder(
  params: CreateOrderParams
): Promise<CreateOrderResult | { ok: false; error: string }> {
  const creds = channelCreds(params.channel);
  if (!creds) return { ok: false, error: `${params.channel} 渠道未配置 appid/appsecret` };

  const body: Record<string, string | number> = {
    version: "1.1",
    appid: creds.appid,
    trade_order_id: params.tradeOrderId,
    total_fee: params.totalFee,
    title: params.title,
    time: Math.floor(Date.now() / 1000),
    notify_url: params.notifyUrl,
    return_url: params.returnUrl,
    nonce_str: crypto.randomBytes(8).toString("hex"),
  };
  body.hash = sign(body, creds.appsecret);

  try {
    const res = await fetch(GATEWAY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(10000),
    });
    const data = await res.json();
    if (data.errcode !== 0) {
      return { ok: false, error: data.errmsg || `下单失败 (errcode ${data.errcode})` };
    }
    return { ok: true, qrUrl: data.url_qrcode, payUrl: data.url };
  } catch {
    return { ok: false, error: "虎皮椒下单请求超时或网络错误" };
  }
}

export interface XunhupayNotifyPayload {
  trade_order_id: string;
  total_fee: string;
  transaction_id: string;
  open_order_id: string;
  order_title: string;
  status: string; // OD=已支付 CD=已退款 RD=退款中 UD=退款失败
  appid: string;
  time: string;
  nonce_str: string;
  hash: string;
  plugins?: string;
  attach?: string;
}

/** 校验回调签名：用 payload 里的 appid 找对应渠道的 appsecret 重新计算 hash 比对。 */
export function verifyXunhupayNotify(payload: XunhupayNotifyPayload): boolean {
  const wechat = channelCreds("wechat");
  const alipay = channelCreds("alipay");
  const appsecret =
    (wechat && payload.appid === wechat.appid && wechat.appsecret) ||
    (alipay && payload.appid === alipay.appid && alipay.appsecret) ||
    null;
  if (!appsecret) return false;

  const { hash, ...rest } = payload;
  const expected = sign(rest as unknown as Record<string, string>, appsecret);
  return expected === hash;
}
