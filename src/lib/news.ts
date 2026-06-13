import newsData from "@/generated/news.json";

export interface NewsItem {
  title: string;
  titleEn?: string;
  source: string;
  category: string;
  url: string;
  summary: string;
  summaryEn?: string;
}

export interface FundingItem {
  company: string;
  url?: string;
  round?: string;
  amount?: string;
  valuation?: string;
  investors?: string;
  pitch?: string;
}

export interface NewsDigest {
  slug: string;
  date: string;
  title: string;
  items: NewsItem[];
  funding?: FundingItem[];
  jasonSays: string;
  jasonSaysEn?: string;
  filename: string;
  tweetUrl?: string;
  coverImage?: string;
}

const allDigests: NewsDigest[] = newsData as NewsDigest[];

/** 快讯标题本地化：zh 用原标题（AI 快讯 · 6月13日），en 用日期版 */
export function digestTitle(
  d: { title: string; date: string },
  lang: string
): string {
  return lang === "en" ? `AI News · ${d.date}` : d.title;
}

/** jasonSays 本地化：en 优先英文版，回退中文 */
export function digestJasonSays(d: NewsDigest, lang: string): string {
  return lang === "en" && d.jasonSaysEn ? d.jasonSaysEn : d.jasonSays;
}

export function getAllDigests(): NewsDigest[] {
  return allDigests;
}

export function getDigestBySlug(slug: string): NewsDigest | undefined {
  return allDigests.find((d) => d.slug === slug);
}

/** Get all unique categories across all digests */
export function getNewsCategories(): string[] {
  const cats = new Set<string>();
  for (const d of allDigests) {
    for (const item of d.items) {
      if (item.category) cats.add(item.category);
    }
  }
  return Array.from(cats);
}

/** Get items from recent N digests, flattened and sorted by date */
export function getRecentItems(limit: number = 30): (NewsItem & { date: string })[] {
  const items: (NewsItem & { date: string })[] = [];
  for (const d of allDigests) {
    for (const item of d.items) {
      items.push({ ...item, date: d.date });
    }
  }
  return items.slice(0, limit);
}
