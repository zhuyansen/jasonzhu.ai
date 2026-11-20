import type { Metadata } from "next";
import Link from "@/components/Link";
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
  const isZh = lang === "zh";
  const total = getOpusLibrary().cases.length;
  const n = total.toLocaleString(isZh ? "zh-CN" : "en-US");
  // 星图是 iframe 里的 three.js 画布，页面自己原来没有标题和文字（OpenSEO 2026-11-20：无 H1、内容过少）。
  // H1 给读屏软件和搜索引擎；说明放在星图下面，写的都是星图里现有的功能（public/universe/index.html）
  return (
    <>
      <h1 className="sr-only">
        {isZh ? "Claude 5.5 提示词宇宙：每个作品一颗星的 3D 星图" : "Claude 5.5 Prompt Universe: a 3D star map of every work"}
      </h1>
      <UniverseFrame lang={lang} total={total} mode="full" />
      <section className="mx-auto max-w-3xl px-4 py-10">
        <h2 className="text-lg font-semibold text-gray-900">{isZh ? "关于这张星图" : "About this star map"}</h2>
        <p className="mt-3 text-sm leading-7 text-gray-600">
          {isZh
            ? `提示词宇宙把 Claude 5.5 提示词库里的 ${n} 个作品画成一片星空：一个作品一颗星，按分类排成 8 个星座。星的亮度可以按播放量、点赞或收藏，也可以改成按最新发布或最近收录。`
            : `The Prompt Universe draws all ${n} works in the Claude 5.5 prompt library as a night sky: one star per work, grouped into 8 constellations by category. Brightness follows views, likes or bookmarks, and you can switch it to the newest posts or the latest additions.`}
        </p>
        <p className="mt-3 text-sm leading-7 text-gray-600">
          {isZh
            ? "拖动旋转，滚轮缩放，点一颗星就能看到这个作品、X 上的原帖链接，以及作者公开的提示词（如果有）。还可以搜标题、作者和工具，只看有提示词的作品，或者点播放，看这片星空从第一天长到今天。"
            : "Drag to rotate, scroll to zoom, and click a star to see the work, a link to the creator's original post on X and, where the creator shared one, the prompt. You can also search by title, creator or tool, show only works with a public prompt, or press play to watch the sky grow from the first day."}
        </p>
        <p className="mt-4 text-sm">
          <Link href={`/${lang}/prompts/claude-opus-5-5`} className="font-medium text-gray-900 underline underline-offset-4 hover:text-gray-600">
            {isZh ? "按列表看 Claude 5.5 提示词库 →" : "Browse the Claude 5.5 prompt library as a list →"}
          </Link>
        </p>
      </section>
    </>
  );
}
