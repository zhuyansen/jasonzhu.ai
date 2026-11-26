// GA4 / Clarity 的 ID 是公开值（会出现在页面源码里），直接写这里；没填就不加载任何第三方脚本。
// Vercel 环境变量 NEXT_PUBLIC_GA_ID / NEXT_PUBLIC_CLARITY_ID 可覆盖。
export const GA_ID = process.env.NEXT_PUBLIC_GA_ID || "G-CTZ8CEW9QZ";
export const CLARITY_ID = process.env.NEXT_PUBLIC_CLARITY_ID || "ys0uj89osn";
// PostHog 免费档（经 Cloudflare Worker 第一方反代防拦截，不占 Vercel Edge 额度）；填入 phc_... 即生效
export const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY || "phc_pG5xDYAZeiY8KtYBStVp8tLZv7aS8i2WYckw44ayypnb";
export const POSTHOG_HOST =
  process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://jasonzhu-posthog-proxy.m17551076169.workers.dev";

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

interface PostHogBrowser {
  capture?: (event: string, properties?: Record<string, unknown>, options?: Record<string, unknown>) => void;
  identify?: (distinctId: string, properties?: Record<string, unknown>) => void;
  createPersonProfile?: () => void;
  setPersonProperties?: (properties: Record<string, unknown>) => void;
  reset?: () => void;
  get_distinct_id?: () => string;
  opt_in_capturing?: () => void;
  opt_out_capturing?: () => void;
  set_config?: (config: Record<string, unknown>) => void;
}

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    clarity?: (...args: unknown[]) => void;
    posthog?: PostHogBrowser;
    __phPendingIdentify?: { id: string; props?: TrackParams };
  }
}

let lastIdentifiedKey = "";

/**
 * 登录/会员中心识别用户：只传 Supabase 匿名 UUID 和非隐私角色标签（绝不传邮箱/微信号等 PII）。
 * Header 桌面端和移动端各挂了一个 AccountMenu，这里按 id+props 幂等去重，且兜底脚本尚未加载完的时序。
 */
export function identifyUser(userId: string, props?: TrackParams) {
  if (!userId || typeof window === "undefined") return;
  try {
    const dedupKey = `${userId}:${props ? JSON.stringify(props) : ""}`;
    if (lastIdentifiedKey === dedupKey && window.posthog?.identify) return;
    lastIdentifiedKey = dedupKey;
    window.__phPendingIdentify = { id: userId, props };
    window.posthog?.identify?.(userId, props);
  } catch {
    /* 统计失败不能影响业务 */
  }
}

/**
 * 未登录直接扫码下单的访客：保持当前匿名 distinct_id 不变，升级为有画像访客（保留付款前读过的所有文章轨迹）；
 * 若用户随后点「去会员中心」注册登录 Supabase，identifyUser(user.id) 会自动把该匿名画像合并进 user.id。
 */
export function promoteGuestProfile(props?: TrackParams) {
  if (typeof window === "undefined") return;
  try {
    window.posthog?.createPersonProfile?.();
    if (props) window.posthog?.setPersonProperties?.(props);
  } catch {
    /* 统计失败不能影响业务 */
  }
}

/** 退出登录时重置 PostHog distinct_id，防止同一浏览器换号把两个人合并错。 */
export function resetUser() {
  if (typeof window === "undefined") return;
  try {
    lastIdentifiedKey = "";
    delete window.__phPendingIdentify;
    window.posthog?.reset?.();
  } catch {
    /* 统计失败不能影响业务 */
  }
}

export function track(event: TrackEvent, params: TrackParams = {}) {
  try {
    // beacon：订阅成功后马上跳页，普通请求会被页面卸载掐掉
    window.gtag?.("event", event, { ...params, transport_type: "beacon" });
    window.clarity?.("event", event);
    window.posthog?.capture?.(event, params, { transport: "sendBeacon" });
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
