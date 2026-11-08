import type { Metadata } from "next";
import type { Locale } from "@/lib/dictionaries";
import { getOpusLibrary } from "@/lib/opus-prompts";
import { withSocialCards } from "@/lib/social";
import UniverseFrame from "../UniverseFrame";

/** 提示词宇宙全屏页：星图本体在 public/universe/index.html，这里只包一层站点头部和统计（iframe 里点星会回传给 UniverseFrame 记事件） */
const SITE_URL = "https://jasonzhu.ai";
const PATH = "prompts/claude-opus-5-5/universe";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang: rawLang } = await params;
  const isZh = rawLang !== "en";
  const n = getOpusLibrary().cases.length;
  const title = isZh ? "Claude 5.5 提示词宇宙：每个作品一颗星的 3D 星图" : "Claude 5.5 Prompt Universe: a 3D star map of every work";
  const description = isZh
    ? `把 ${n} 个 Claude Opus 5.5、Sonnet 5.5 作品画成一片星空：8 个分类是 8 个星座，星的亮度按播放、点赞或收藏，点一颗星打开作品和提示词。`
    : `${n} Claude Opus 5.5 and Sonnet 5.5 works drawn as a sky: 8 categories form 8 constellations, brightness follows views, likes or bookmarks, and each star opens its work and prompt.`;
  return withSocialCards({
    title,
    description,
    alternates: {
      canonical: `${SITE_URL}/${isZh ? "zh" : "en"}/${PATH}`,
      languages: { zh: `${SITE_URL}/zh/${PATH}`, en: `${SITE_URL}/en/${PATH}`, "x-default": `${SITE_URL}/zh/${PATH}` },
    },
    openGraph: { type: "website", title, description, url: `${SITE_URL}/${isZh ? "zh" : "en"}/${PATH}` },
  }, rawLang);
}

export default async function UniversePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: rawLang } = await params;
  const lang = (rawLang === "en" ? "en" : "zh") as Locale;
  return <UniverseFrame lang={lang} total={getOpusLibrary().cases.length} mode="full" />;
}
