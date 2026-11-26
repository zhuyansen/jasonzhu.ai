/**
 * 「从哪知道这里」（2026-11-26 起）：订阅框和虎皮椒结账框上一个选填的下拉框。
 * 从 AI 助手来的人 GA4 大多认不出来（ChatGPT 打开外链常不带 Referer、不带 utm），只能直接问。
 *
 * - 存的是下面固定的英文值，显示文字随便改，不影响统计。要加选项就加新值，别改旧值的含义。
 * - 只有选了「其他」才收补充说明（最多 200 字）。
 * - 选填：没选、选了不认识的值都当没填，绝不挡提交。
 * - /api/subscribe 和 /api/checkout/xunhupay/create 用 parseHeardFrom() 过白名单；日报 ops/analytics/digest.py 的 HEARD_FROM_LABELS 跟着改。
 * - 冻结页（src/lib/frozen-pages.ts）上不显示。
 *
 * 浏览器端也引这个文件（选项和文案），别在这里引服务端的东西。
 */
export const HEARD_FROM_OPTIONS = [
  { value: "chatgpt", zh: "ChatGPT", en: "ChatGPT" },
  { value: "perplexity", zh: "Perplexity", en: "Perplexity" },
  { value: "gemini", zh: "Gemini 或 Google AI 模式", en: "Gemini or Google AI Mode" },
  { value: "claude", zh: "Claude", en: "Claude" },
  { value: "other_ai", zh: "其他 AI 助手", en: "Another AI assistant" },
  { value: "google", zh: "Google 搜索", en: "Google Search" },
  { value: "bing", zh: "Bing 搜索", en: "Bing Search" },
  { value: "x", zh: "X (Twitter)", en: "X (Twitter)" },
  { value: "youtube", zh: "YouTube", en: "YouTube" },
  { value: "xiaohongshu", zh: "小红书", en: "RedNote (Xiaohongshu)" },
  { value: "wechat", zh: "微信公众号或朋友圈", en: "WeChat" },
  { value: "friend", zh: "朋友推荐", en: "A friend told me" },
  { value: "other", zh: "其他", en: "Other" },
] as const;

export type HeardFrom = (typeof HEARD_FROM_OPTIONS)[number]["value"];

/** 选了「其他」时的补充说明，最多这么多个字 */
export const HEARD_FROM_NOTE_MAX = 200;

export const HEARD_FROM_COPY = {
  zh: { question: "从哪知道这里？（选填）", pick: "选一个（可不填）", notePlaceholder: "在哪看到的？（选填）" },
  en: { question: "How did you hear about us? (optional)", pick: "Pick one (optional)", notePlaceholder: "Where did you hear about us? (optional)" },
} as const;

const VALUES: ReadonlySet<string> = new Set(HEARD_FROM_OPTIONS.map((o) => o.value));

/**
 * 请求里的 heard_from / heard_from_note → 能存的值。不在白名单里的当没填（null）。
 * 补充说明只在选了「其他」时收：去掉控制字符、压掉多余空白、首尾 trim，按字符（不是 UTF-16 码元）截到 200 个，空了就是 null。
 */
export function parseHeardFrom(rawValue: unknown, rawNote: unknown): { heardFrom: HeardFrom | null; heardFromNote: string | null } {
  const heardFrom = typeof rawValue === "string" && VALUES.has(rawValue) ? (rawValue as HeardFrom) : null;
  let heardFromNote: string | null = null;
  if (heardFrom === "other" && typeof rawNote === "string") {
    // 控制字符换成空格（Postgres 的 text 存不了 \u0000）
    const cleaned = rawNote.replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim();
    heardFromNote = Array.from(cleaned).slice(0, HEARD_FROM_NOTE_MAX).join("").trim() || null;
  }
  return { heardFrom, heardFromNote };
}

/** 表单 POST 体里要加的字段：没选就什么都不加 */
export function heardFromBody(heardFrom: string, heardFromNote: string): { heard_from?: string; heard_from_note?: string } {
  if (!heardFrom) return {};
  return heardFrom === "other" && heardFromNote.trim() ? { heard_from: heardFrom, heard_from_note: heardFromNote } : { heard_from: heardFrom };
}

/** GA4 事件参数（newsletter_subscribe / checkout_order_created 上多带一个 heard_from）：没选就不带 */
export function heardFromTrackParam(heardFrom: string): { heard_from?: string } {
  return heardFrom ? { heard_from: heardFrom } : {};
}
