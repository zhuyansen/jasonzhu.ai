// payment-guard 导出的数据（src/data/payment-guard.json）的类型和纯函数。
// 数据由开源工具 payment-guard 生成：`payment-guard export > src/data/payment-guard.json`，页面不自己排序、不自己判断，
// 所以网页和命令行的结论永远一致。客户端组件只引这个文件（不含 JSON），数据由服务端页面通过 props 传入。

export type Lang = "zh" | "en";
export type Bi<T = string> = { en: T; zh: T };
export type OpenStatus = "yes" | "likely" | "unverified" | "no";
export type Fit = "allowed" | "unknown" | "review" | "restricted" | "prohibited";

export interface OpeningSide {
  steps: string[];
  needs: string[];
}

export interface Opening {
  individual?: Bi<OpeningSide>;
  company?: Bi<OpeningSide>;
  signup?: string;
  source?: string;
  /** 只适用于这些开户主体（PayPal 的步骤是 PayPal.cn 的，只对中国大陆账户成立）；没有就是都适用 */
  entities?: string[] | null;
}

export interface PlatformFacts {
  name: string;
  mor: boolean;
  aup: string;
  review_doc: string;
  fee: Bi;
  payout: Bi;
  review_time: Bi;
  chargebacks: Bi;
  notes: Bi<string[]>;
  /** 平台级的提醒（例如 Lemon Squeezy 在把用户迁到 Stripe Managed Payments），附官方来源；没有就是 null */
  warning: (Bi & { source: string }) | null;
  entities: Record<string, { status: OpenStatus; source: string; note: Bi }>;
  opening: Opening;
}

export interface PickRow {
  platform: string;
  open: OpenStatus;
  fit: Fit;
  keep: number;
  share: number | null;
  extra: Bi<string[]>;
}

export interface PickTable {
  rows: PickRow[];
  excluded: { platform: string; source: string; why: Bi }[];
  category_note: Bi;
}

export interface GuardData {
  version: string;
  checked: string;
  opening_checked: string;
  sale: number;
  entities: Record<string, Bi>;
  products: Record<string, Bi & { kind: string | null }>;
  words: Record<Lang, { open: Record<OpenStatus, string>; fit: Record<Fit, string> }>;
  advice: { en: string; zh: string; source: string }[];
  registration: { key: string; name: Bi; facts: { en: string; zh: string; source: string }[] }[];
  platforms: Record<string, PlatformFacts>;
  picks: Record<string, PickTable>;
  usage: { since: string; as_of: string; caveat: Bi; sellers: Record<string, number> };
}

export const GUARD_REPO = "https://github.com/zhuyansen/payment-guard";

/** 个人（大陆个人）用个人开户步骤，其余主体用公司步骤 —— 和 payment-guard 的 holder() 一致 */
export function holder(entity: string): "individual" | "company" {
  return entity === "cn-individual" ? "individual" : "company";
}

/** 这家整理的开户步骤对这个主体成不成立 */
export function stepsApply(opening: Opening, entity: string): boolean {
  return !opening.entities || opening.entities.includes(entity);
}

export function pickTable(data: GuardData, entity: string, product: string): PickTable | undefined {
  return data.picks[`${entity}|${product}`];
}
