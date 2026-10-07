// GA4 / Clarity 的 ID 是公开值（会出现在页面源码里），直接写这里；没填就不加载任何第三方脚本。
// Vercel 环境变量 NEXT_PUBLIC_GA_ID / NEXT_PUBLIC_CLARITY_ID 可覆盖。
export const GA_ID = process.env.NEXT_PUBLIC_GA_ID || "G-CTZ8CEW9QZ";
export const CLARITY_ID = process.env.NEXT_PUBLIC_CLARITY_ID || "ys0uj89osn";

// 转化事件名和 ops/analytics/digest.py 的 CONVERSIONS 对应，改名两边一起改
export type TrackEvent = "newsletter_subscribe" | "club_apply_submit" | "checkout_order_created" | "prompt_copy" | "prompt_try_claude";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    clarity?: (...args: unknown[]) => void;
  }
}

export function track(event: TrackEvent, params: Record<string, string | number | boolean | undefined> = {}) {
  try {
    // beacon：订阅成功后马上跳页，普通请求会被页面卸载掐掉
    window.gtag?.("event", event, { ...params, transport_type: "beacon" });
    window.clarity?.("event", event);
  } catch {
    /* 统计失败不能影响业务 */
  }
}
