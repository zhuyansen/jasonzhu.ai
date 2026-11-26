// AI 爬虫与 AI 引用公开数据（/research/ai-crawlers）的数据和格式化。
// 数据由 ops/geo/crawler_stats.py 每月生成到 src/generated/ai-crawler-stats.json（页面不能用 fs 读 public/，只能 import 这份）。
// 下载文件在 public/data/ai-crawlers/，同一次运行写出，数字和这里一致。
import raw from "@/generated/ai-crawler-stats.json";

export type Lang = "zh" | "en";
export type BotType = "ai_search" | "training" | "user_triggered" | "search_engine" | "other";
export type StatusCol = "status_2xx" | "status_3xx" | "status_4xx" | "status_5xx" | "status_other";
export type VerifyCol =
  | "verified_in_published_ranges"
  | "outside_published_ranges"
  | "unverified_stale_range_list"
  | "unverified_no_published_ranges"
  | "unverified_unmapped_bot"
  | "unverified_other";
export type Caliber = "site_cited" | "page_cited" | "named";

export interface Agg {
  requests: number;
  ai_requests: number;
  by_type: Record<BotType, number>;
  status: Record<StatusCol, number>;
  ai_status: Record<StatusCol, number>;
  verification: Record<VerifyCol, number>;
  ai_verification: Record<VerifyCol, number>;
}

export interface Month extends Agg {
  month: string;
  partial: boolean;
  first_day: string;
  last_day: string;
  days: number;
}

export interface Bot {
  vendor: string;
  bot: string;
  bot_type: BotType;
  requests: number;
  verification: Record<VerifyCol, number>;
  status: Record<StatusCol, number>;
  by_month: Record<string, number>;
  first_seen: string;
  last_seen: string;
  days_seen: number;
}

export type DayRow = { date: string; coverage: "full" | "partial" } & Record<BotType, number>;

export interface Section {
  section: string;
  requests: number;
  ai_requests: number;
  by_type: Record<BotType, number>;
  status: Record<StatusCol, number>;
  ai_status: Record<StatusCol, number>;
}

export interface MachineFile {
  file: string;
  requests: number;
  ai_requests: number;
  status_2xx: number;
  status_4xx: number;
  by_bot: [string, number][];
}

export interface Cell {
  hits: number;
  answers: number;
  pct: number;
  ci_pct: [number, number];
}

export interface EngineRun {
  engine: string;
  label: string;
  surface: string;
  model: string;
  samples: number;
  sets: Record<string, Partial<Record<Caliber, Cell>>>;
  branded?: Cell;
  unbranded?: Cell;
}

export interface Referrals {
  window_first_day: string;
  window_last_day: string;
  sessions: number;
  by_assistant: [string, number][];
  user_triggered_fetches?: Record<string, number> | null;
}

export interface PanelRun {
  date: string;
  baseline: boolean;
  questions: Record<string, number>;
  brand_questions: number;
  unbranded_questions: number;
  engines: EngineRun[];
  ai_referrals: Referrals | null;
}

export interface Download {
  file: string;
  url: string;
  format: string;
  month: string;
  partial: boolean;
  rows: number;
  bytes: number;
}

export interface CrawlerStats {
  name: string;
  version: string;
  landing_page: string;
  license: string;
  license_url: string;
  coverage: {
    timezone: string;
    first_day: string;
    last_day: string;
    days: number;
    first_request_utc: string;
    partial_days: string[];
  };
  totals: Agg;
  months: Month[];
  bots: Bot[];
  daily_by_type: DayRow[];
  sections: Section[];
  machine_files: MachineFile[];
  last_7_days: { first_day: string; last_day: string; bots: { vendor: string; bot: string; bot_type: BotType; requests: number }[] };
  citations: {
    runs: PanelRun[];
    engines: string[];
    set_labels: Record<string, string>;
    /** 面板运行那几天替用户现场读页的爬虫（ChatGPT-User、Claude-User）各读了多少次，和其余完整日子的中位数 */
    panel_days: {
      bots: string[];
      days: ({ date: string } & Record<string, number | string>)[];
      median_other_days: Record<string, number>;
    } | null;
  };
  downloads: Download[];
  changelog: { date: string; en: string; zh: string }[];
}

export const stats = raw as unknown as CrawlerStats;

export const SITE_URL = "https://jasonzhu.ai";
export const PAGE_PATH = "/research/ai-crawlers";
export const AI_TYPES = ["ai_search", "training", "user_triggered"] as const;
export type AiType = (typeof AI_TYPES)[number];

/** 三类 AI 爬虫的颜色：dataviz 参考调色板前三位（蓝、橙、青），按这个顺序固定分配，2026-11-26 用 validate_palette.js 在白底上核过 */
export const TYPE_COLOR: Record<AiType, string> = {
  ai_search: "#2a78d6",
  training: "#eb6834",
  user_triggered: "#1baf7a",
};

export const TYPE_LABEL: Record<BotType, Record<Lang, string>> = {
  ai_search: { en: "AI search", zh: "AI 搜索" },
  training: { en: "Training", zh: "训练" },
  user_triggered: { en: "User-triggered", zh: "用户触发" },
  search_engine: { en: "Search engines", zh: "传统搜索引擎" },
  other: { en: "Other", zh: "其他" },
};

export function isAi(t: BotType): t is AiType {
  return (AI_TYPES as readonly string[]).includes(t);
}

export function fmt(n: number): string {
  return n.toLocaleString("en-US");
}

/** 百分比：10% 以下保留一位小数，以上取整 */
export function share(part: number, whole: number): string {
  if (!whole) return "–";
  const p = (part / whole) * 100;
  if (p > 0 && p < 10) return `${p.toFixed(1)}%`;
  return `${Math.round(p)}%`;
}

const MONTHS_EN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONTHS_EN_LONG = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/** YYYY-MM-DD → 「Oct 26, 2026」/「2026 年 10 月 26 日」；year=false 不带年份 */
export function fmtDay(iso: string, lang: Lang, year = true): string {
  const [y, m, d] = iso.split("-").map(Number);
  if (lang === "en") return year ? `${MONTHS_EN[m - 1]} ${d}, ${y}` : `${MONTHS_EN[m - 1]} ${d}`;
  return year ? `${y} 年 ${m} 月 ${d} 日` : `${m} 月 ${d} 日`;
}

/** YYYY-MM → 「November 2026」/「2026 年 11 月」 */
export function fmtMonth(ym: string, lang: Lang): string {
  const [y, m] = ym.split("-").map(Number);
  return lang === "en" ? `${MONTHS_EN_LONG[m - 1]} ${y}` : `${y} 年 ${m} 月`;
}

/** 下一次更新的月份：数据最后一天的第二天所在月的下一个月（11-25 → 2026-12；11-30 → 2027-01） */
export function nextUpdateMonth(lastDay: string): string {
  const [y, m, d] = lastDay.split("-").map(Number);
  const next = new Date(Date.UTC(y, m - 1, d + 1));
  const ny = next.getUTCFullYear();
  const nm = next.getUTCMonth() + 2;
  return nm > 12 ? `${ny + 1}-01` : `${ny}-${String(nm).padStart(2, "0")}`;
}

export function fmtBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${Math.round(n / 1024)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

/** 最近一次面板（页面用它出「不提本站的题」那一格） */
export function latestRun(): PanelRun {
  return stats.citations.runs[stats.citations.runs.length - 1];
}

/** 某次面板里某家 AI 的一格；没问这家就是 undefined */
export function engineIn(run: PanelRun, label: string): EngineRun | undefined {
  return run.engines.find((e) => e.label === label);
}

/** 爬虫名的显示名：GEOInflow 认不出身份的那一项 */
export function botName(bot: string, lang: Lang): string {
  if (bot === "Unmapped") return lang === "en" ? "Unmapped agents" : "未识别的自动访问";
  return bot;
}
