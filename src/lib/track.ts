// GA4 / Clarity 的 ID 是公开值（会出现在页面源码里），直接写这里；没填就不加载任何第三方脚本。
// Vercel 环境变量 NEXT_PUBLIC_GA_ID / NEXT_PUBLIC_CLARITY_ID 可覆盖。
export const GA_ID = process.env.NEXT_PUBLIC_GA_ID || "G-CTZ8CEW9QZ";
export const CLARITY_ID = process.env.NEXT_PUBLIC_CLARITY_ID || "ys0uj89osn";

// 转化事件名和 ops/analytics/digest.py 的 CONVERSIONS 对应，改名两边一起改
export type TrackEvent = "newsletter_subscribe" | "club_apply_submit" | "checkout_order_created" | "prompt_copy" | "prompt_try_claude"
  // 2026-11-21 加：GA4 增强型衡量的出站点击都叫 click，要在后台标成关键事件，得有自己的事件名
  | "github_click" // 去 github.com/zhuyansen 的链接，参数 repo（个人主页记 "(profile)"）
  | "referral_click" // 推荐或合作链接（AIsa、Dodo 邀请链接），参数 partner
  | "payment_picker_result" // 收款选择器：用户换了选项、出了新结果，参数 who、sell（打开页面时的默认结果不算）
  | "ai_readiness_scan" // AI 网站急诊室查完一个站，参数只有 domain（主机名，不带路径和其他输入）
  | "wechat_copy" // 复制微信号
  | "contact_click" // 联系页、服务页上点邮箱或 X 私信，参数 method
  // 提示词宇宙（不是转化，看点击用）：点星打开作品、点「全屏看」
  | "universe_star" | "universe_fullscreen";

export type TrackParams = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    clarity?: (...args: unknown[]) => void;
  }
}

export function track(event: TrackEvent, params: TrackParams = {}) {
  try {
    // beacon：订阅成功后马上跳页，普通请求会被页面卸载掐掉
    window.gtag?.("event", event, { ...params, transport_type: "beacon" });
    window.clarity?.("event", event);
  } catch {
    /* 统计失败不能影响业务 */
  }
}

/** 本站作者的 GitHub 链接 → 仓库名（个人主页返回 "(profile)"）；别的网址返回 undefined。github_click 的 repo 参数用它算。 */
export function githubRepo(href: string): string | undefined {
  const m = /^https?:\/\/(?:www\.)?github\.com\/zhuyansen(?=$|[/?#])(?:\/([^/?#]+))?/i.exec(href);
  if (!m) return undefined;
  return m[1] ?? "(profile)";
}
