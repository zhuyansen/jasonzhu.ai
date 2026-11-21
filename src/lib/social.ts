import type { Metadata } from "next";

// 分享卡片（Open Graph 和 Twitter）。layout 里设的是首页那一套：页面自己不设，就会把首页的标题、描述和网址一起继承下来，
// 分享到 X、微信、Facebook 时显示成首页（2026-10-17 用 SEOmator 体检时发现）。没有专属卡片的页面都套这个函数：
// 按页面自己的标题、描述和 canonical 补齐卡片，页面已经写了的字段原样保留。

const SITE_URL = "https://jasonzhu.ai";
const DEFAULT_IMAGE = `${SITE_URL}/og-image.png`;

type OpenGraph = NonNullable<Metadata["openGraph"]>;
type Twitter = NonNullable<Metadata["twitter"]>;

function plainTitle(title: Metadata["title"]): string | undefined {
  if (typeof title === "string") return title;
  if (title && "absolute" in title && title.absolute) return title.absolute;
  if (title && "default" in title && title.default) return title.default;
  return undefined;
}

function canonicalUrl(alternates: Metadata["alternates"]): string | undefined {
  const canonical = alternates?.canonical;
  if (typeof canonical === "string") return canonical;
  if (canonical instanceof URL) return canonical.toString();
  if (canonical && "url" in canonical) return String(canonical.url);
  return undefined;
}

/** 给页面元数据补齐分享卡片；lang 是路由里的语言（不是 "en" 就按中文） */
export function withSocialCards(meta: Metadata, lang: string): Metadata {
  const isZh = lang !== "en";
  const title = plainTitle(meta.title);
  const rawDescription = typeof meta.description === "string" ? meta.description : undefined;
  const description = rawDescription ? fitDescription(rawDescription) : undefined;
  const url = canonicalUrl(meta.alternates);
  const text = { ...(title ? { title } : {}), ...(description ? { description } : {}) };
  const openGraph = {
    type: "website" as const,
    locale: isZh ? "zh_CN" : "en_US",
    alternateLocale: isZh ? "en_US" : "zh_CN",
    siteName: "JasonZhu.AI",
    ...(url ? { url } : {}),
    ...text,
    images: [{ url: DEFAULT_IMAGE, width: 1200, height: 630, alt: title ?? "JasonZhu.AI" }],
    ...meta.openGraph,
  } as OpenGraph;
  const twitter = {
    card: "summary_large_image" as const,
    site: "@GoSailGlobal",
    creator: "@GoSailGlobal",
    ...text,
    images: [DEFAULT_IMAGE],
    ...meta.twitter,
  } as Twitter;
  // 标题带站名超过 60 个字符的不带站名（fitTitle）；页面自己写成对象（absolute 等）的不动
  const fitted = typeof meta.title === "string" ? fitTitle(meta.title) : meta.title;
  return { ...meta, title: fitted, ...(description ? { description } : {}), openGraph, twitter };
}

const BRAND_SUFFIX = " | JasonZhu.AI";
const TITLE_MAX = 60;
const DESCRIPTION_MAX = 160;

/**
 * 页面标题：加上站名超过 60 个字符时不带站名；标题本身仍超 60 字符时按子句或词边界截短到 60 字符内，
 * 避免 SERP 截断与审计报 Title too long（H1 和 OG/Twitter 卡片仍保留完整标题）。
 */
export function fitTitle(title: string, max = TITLE_MAX): NonNullable<Metadata["title"]> {
  const clean = title.replace(/\s+/g, " ").trim();
  if (clean.length + BRAND_SUFFIX.length <= max) return clean;
  if (clean.length <= max) return { absolute: clean };
  const head = clean.slice(0, max);
  const sep = Math.max(...[" — ", " – ", " | ", ": ", " - ", "：", "｜"].map((s) => head.lastIndexOf(s)));
  if (sep >= max * 0.55) {
    return { absolute: head.slice(0, sep).replace(/[\s,;:，；：、\-—–|]+$/, "").trim() };
  }
  const space = head.lastIndexOf(" ", max - 2);
  const cut = space >= max * 0.6 ? head.slice(0, space) : head.slice(0, max - 1);
  return { absolute: `${cut.replace(/[\s,;:，；：、\-—–|]+$/, "")}…` };
}

/** meta description 超过 160 个字符时，截到最后一个完整句子；句子太靠前就按词截断加省略号（同一次审计：478 页描述过长） */
export function fitDescription(text: string, max = DESCRIPTION_MAX): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const head = clean.slice(0, max);
  const end = Math.max(...[". ", "! ", "? ", "。", "！", "？"].map((mark) => head.lastIndexOf(mark)));
  if (end >= max * 0.6) return head.slice(0, end + 1).trim();
  const space = head.lastIndexOf(" ", max - 2);
  return `${(space >= max * 0.6 ? head.slice(0, space) : head.slice(0, max - 1)).replace(/[\s,;:，；：、]+$/, "")}…`;
}
