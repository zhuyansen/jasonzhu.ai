// 出海专题的指南页（/[lang]/go-global/<slug>）：上线以后的出金、风控、香港公司年审，SEO 以外的获客，插件和应用商店。
// 每条事实都附官方来源（政府、平台自己的帮助和法律页面），核实日期写在 checked；Jason 自己的做法放在 mine，和官方事实分开。
// 指南只有中文：en 页 canonical 指回 zh、不进 sitemap，和选品周报同一规则。

import { CASH_OUT } from "./guides/cash-out";
import { CHANNELS } from "./guides/channels";
import { EXTENSIONS } from "./guides/extensions";
import { HK_COMPANY } from "./guides/hk-company";
import { PAYMENT_RISK } from "./guides/payment-risk";

export interface GuideSource {
  label: string;
  url: string;
}

export interface GuideItem {
  text: string;
  sources?: GuideSource[];
}

export interface GuideSection {
  id: string;
  title: string;
  lead?: string;
  items: GuideItem[];
}

/** Jason 自己的做法：出自他的文章或项目，和官方事实分开放 */
export interface GuideMine {
  title: string;
  lead?: string;
  points: string[];
  links: GuideSource[];
}

export interface Guide {
  slug: string;
  /** 面包屑和专题首页卡片上的短名 */
  short: string;
  title: string;
  description: string;
  intro: string;
  checked: string;
  mine?: GuideMine;
  /** 必须看到的风险提示（例如走加密货币通道出金） */
  warning?: GuideItem;
  sections: GuideSection[];
  pitfalls: GuideItem[];
  unknowns: string[];
  /** 站内相关文章的 slug */
  posts?: string[];
}

export const GUIDES: Guide[] = [CASH_OUT, PAYMENT_RISK, HK_COMPANY, CHANNELS, EXTENSIONS];

export function guideBySlug(slug: string): Guide | undefined {
  return GUIDES.find((g) => g.slug === slug);
}
