import type { Metadata } from "next";
import Link from "@/components/Link";
import type { Locale } from "@/lib/dictionaries";
import { getOpusLibrary, formatCount } from "@/lib/opus-prompts";
import { getImageLibrary, IMAGE_LIBRARY_PATH, coverOf } from "@/lib/image-prompts";
import { withSocialCards } from "@/lib/social";

const SITE_URL = "https://jasonzhu.ai";

// 提示词库总览（2026-11-05 有了第二个库之后建；以前 /prompts 直接跳 Claude 库）
export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang: rawLang } = await params;
  const lang = (rawLang === "en" ? "en" : "zh") as Locale;
  const isZh = lang === "zh";
  const title = isZh ? "AI 提示词库：Claude 5.5 作品与 ChatGPT Images 2.6 图片提示词" : "AI Prompt Libraries: Claude 5.5 Works and ChatGPT Images 2.6 Prompts";
  const description = isZh
    ? "X 上创作者公开的 AI 作品和原始提示词，原文照录、注明出处，每天自动更新：Claude 5.5 做的视频、动效、3D 和游戏，ChatGPT Images 2.6 做的 GIF、人像、海报和表情包。"
    : "AI works and the original prompts creators shared on X, verbatim with sources and updated daily: video, motion, 3D and games made with Claude 5.5, and GIFs, portraits, posters and stickers made with ChatGPT Images 2.6.";
  return withSocialCards({
    title,
    description,
    referrer: "no-referrer",
    alternates: {
      canonical: `${SITE_URL}/${lang}/prompts`,
      languages: { zh: `${SITE_URL}/zh/prompts`, en: `${SITE_URL}/en/prompts`, "x-default": `${SITE_URL}/zh/prompts` },
    },
  }, rawLang);
}

export default async function PromptsIndexPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: rawLang } = await params;
  const lang = (rawLang === "en" ? "en" : "zh") as Locale;
  const isZh = lang === "zh";
  const opus = getOpusLibrary();
  const images = getImageLibrary();
  const libraries = [
    {
      href: `/${lang}${IMAGE_LIBRARY_PATH}`,
      name: "ChatGPT Images 2.6",
      badge: "New",
      desc: isZh ? "GIF、人像、海报、产品图、表情包。OpenAI 11 月 4 日发布的图像模型，发布当天起每天收录。" : "GIFs, portraits, posters, product shots and stickers from OpenAI's image model released on November 4, collected daily since launch.",
      works: images.cases.length,
      prompts: images.withPrompt,
      cover: images.cases[0] ? coverOf(images.cases[0].media[0]) : null,
    },
    {
      href: `/${lang}/prompts/claude-opus-5-5`,
      name: "Claude 5.5",
      badge: null,
      desc: isZh ? "Opus 5.5、Sonnet 5.5、Haiku 5.5、Fable 5.5 写代码做出来的视频、动效、3D 场景和游戏，视频可直接播放。" : "Video, motion graphics, 3D scenes and games built with code by Opus 5.5, Sonnet 5.5, Haiku 5.5 and Fable 5.5, playable here.",
      works: opus.cases.length,
      prompts: opus.withPrompt,
      cover: opus.cases[0]?.video.poster || null,
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">{isZh ? "AI 提示词库" : "AI Prompt Libraries"}</h1>
      <p className="text-gray-500 max-w-2xl mb-10 leading-relaxed">
        {isZh
          ? "收录 X 上播放或浏览过 5000 的作品和创作者本人公开的提示词，原文照录、注明出处，每天自动更新。"
          : "Works with 5,000+ views on X and the prompts their creators shared, verbatim with sources, updated daily."}
      </p>
      <div className="grid sm:grid-cols-2 gap-6">
        {libraries.map((l) => (
          <Link key={l.href} href={l.href} className="group rounded-2xl border border-gray-100 overflow-hidden bg-white shadow-sm hover:shadow-lg transition-shadow">
            <div className="relative aspect-[16/10] bg-gray-100">
              {/* eslint-disable-next-line @next/next/no-img-element -- X 的图片 CDN 外链 */}
              {l.cover && <img src={l.cover} alt={l.name} loading="eager" decoding="async" className="absolute inset-0 w-full h-full object-cover" />}
              {l.badge && <span className="absolute top-3 left-3 px-2 py-0.5 rounded bg-red-500 text-white text-xs font-bold">{l.badge}</span>}
            </div>
            <div className="p-5">
              <h2 className="text-xl font-bold text-gray-900 group-hover:text-[var(--primary)]">{l.name}</h2>
              <p className="text-sm text-gray-500 mt-2 leading-relaxed">{l.desc}</p>
              <p className="text-sm text-gray-700 mt-4">
                <span className="font-semibold">{formatCount(l.works, lang)}</span> {isZh ? "个作品" : "works"}
                {l.prompts > 0 && (
                  <>
                    {" · "}
                    <span className="font-semibold">{formatCount(l.prompts, lang)}</span> {isZh ? "个带提示词" : "with prompts"}
                  </>
                )}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
