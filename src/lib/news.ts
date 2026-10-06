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
  /** AI 生成的一句话摘要（历史字段名保留；页面上标成「AI 摘要」，不署 Jason 的名） */
  jasonSays: string;
  jasonSaysEn?: string;
  /** Jason 本人写的点评（管理后台写入）。有点评的那期才允许收录 */
  humanComment?: string;
  humanCommentEn?: string;
  reviewedAt?: string;
  filename: string;
  tweetUrl?: string;
  coverImage?: string;
}

/** 归档列表用精简版：不传 items 全文，只传分类和条数 */
export interface NewsDigestSlim {
  slug: string;
  date: string;
  title: string;
  jasonSays: string;
  jasonSaysEn?: string;
  humanComment?: string;
  humanCommentEn?: string;
  itemCount: number;
  categories: string[];
  filename: string;
}

const allDigests: NewsDigest[] = newsData as NewsDigest[];

/** 快讯标题本地化：zh 用原标题（AI 快讯 · 6月13日），en 用日期版 */
export function digestTitle(
  d: { title: string; date: string },
  lang: string
): string {
  return lang === "en" ? `AI News · ${d.date}` : d.title;
}

/** AI 摘要本地化（字段名沿用 jasonSays）：en 优先英文版，回退中文 */
export function digestJasonSays(d: NewsDigest | NewsDigestSlim, lang: string): string {
  return lang === "en" && d.jasonSaysEn ? d.jasonSaysEn : d.jasonSays;
}

/** Jason 本人的点评：en 优先英文版，没有就回退中文原话 */
export function digestHumanComment(d: NewsDigest | NewsDigestSlim, lang: string): string {
  return (lang === "en" && d.humanCommentEn ? d.humanCommentEn : d.humanComment || "").trim();
}

/**
 * 是否允许搜索引擎收录：只有 Jason 写过点评的那期。
 * 2026-10-06 起：快讯由 AI 每日生成，未经人工点评的页 noindex、不进 sitemap，避免「无人监督批量 AI 内容」。
 */
export function isDigestIndexable(d: NewsDigest | NewsDigestSlim): boolean {
  return Boolean(d.humanComment && d.humanComment.trim());
}

export function getAllDigests(): NewsDigest[] {
  return allDigests;
}

/** 最近 N 期完整数据 + 其余精简版（节省 ~80% RSC payload） */
export function getDigestsForList(fullCount: number = 1): {
  fullDigests: NewsDigest[];
  archiveDigests: NewsDigestSlim[];
} {
  const fullDigests = allDigests.slice(0, fullCount);
  const archiveDigests: NewsDigestSlim[] = allDigests.slice(fullCount).map((d) => ({
    slug: d.slug,
    date: d.date,
    title: d.title,
    jasonSays: d.jasonSays,
    jasonSaysEn: d.jasonSaysEn,
    humanComment: d.humanComment,
    humanCommentEn: d.humanCommentEn,
    itemCount: d.items.length,
    categories: [...new Set(d.items.map((i) => i.category))],
    filename: d.filename,
  }));
  return { fullDigests, archiveDigests };
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
