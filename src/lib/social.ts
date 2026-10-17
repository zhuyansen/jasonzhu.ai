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
  const description = typeof meta.description === "string" ? meta.description : undefined;
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
  return { ...meta, openGraph, twitter };
}
