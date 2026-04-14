import newsData from "@/generated/news.json";

export interface NewsItem {
  title: string;
  source: string;
  category: string;
  url: string;
  summary: string;
}

export interface NewsDigest {
  slug: string;
  date: string;
  title: string;
  items: NewsItem[];
  jasonSays: string;
  filename: string;
}

const allDigests: NewsDigest[] = newsData as NewsDigest[];

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
