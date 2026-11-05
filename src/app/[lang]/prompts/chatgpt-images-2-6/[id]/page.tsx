import type { Metadata } from "next";
import Link from "@/components/Link";
import { notFound } from "next/navigation";
import type { Locale } from "@/lib/dictionaries";
import { getImageCase, getImageLibrary, IMAGE_LIBRARY_PATH, imageCategoryLabel, imageCaseHref, coverOf, pbsSized, formatCount } from "@/lib/image-prompts";
import fullData from "@/generated/image-prompts-full.json";
import { withSocialCards } from "@/lib/social";
import CopyPrompt from "../../claude-opus-5-5/CopyPrompt";
import CaseMedia from "../CaseMedia";

const SITE_URL = "https://jasonzhu.ai";
const PATH = IMAGE_LIBRARY_PATH.slice(1);
const full = fullData as Record<string, { prompt: string; summary: { zh: string; en: string } | null }>;

// 只有带提示词的作品有详情页（没有提示词的卡片直接链到原帖，不产生 noindex 页面）；未知 id 404
export const dynamicParams = false;

export function generateStaticParams() {
  return getImageLibrary().cases.filter((c) => c.prompt).flatMap((c) => [
    { lang: "zh", id: c.id },
    { lang: "en", id: c.id },
  ]);
}

const SOURCE_LABEL = {
  post: { zh: "原帖正文", en: "the original post" },
  author_reply: { zh: "作者本人的回复", en: "the creator's own reply" },
  image: { zh: "作者回复里的截图（人工转写）", en: "a screenshot in the creator's reply (transcribed)" },
  link: { zh: "作者给的链接", en: "a link the creator shared" },
} as const;

export async function generateMetadata({ params }: { params: Promise<{ lang: string; id: string }> }): Promise<Metadata> {
  const { lang: rawLang, id } = await params;
  const lang = (rawLang === "en" ? "en" : "zh") as Locale;
  const c = getImageCase(id);
  if (!c || !c.prompt) return {};
  const isZh = lang === "zh";
  const title = isZh ? `${c.title.zh} · ChatGPT Images 2.6 提示词` : `${c.title.en} · ChatGPT Images 2.6 Prompt`;
  const summary = full[id]?.summary;
  const description = (isZh ? summary?.zh : summary?.en) || c.prompt.excerpt.slice(0, 150);
  const image = c.media[0].type === "photo" ? pbsSized(c.media[0].url, "large") : coverOf(c.media[0]);
  return withSocialCards({
    title,
    description,
    referrer: "no-referrer",
    alternates: {
      canonical: `${SITE_URL}/${lang}/${PATH}/${id}`,
      languages: { zh: `${SITE_URL}/zh/${PATH}/${id}`, en: `${SITE_URL}/en/${PATH}/${id}`, "x-default": `${SITE_URL}/zh/${PATH}/${id}` },
    },
    openGraph: { type: "article", title, description, url: `${SITE_URL}/${lang}/${PATH}/${id}`, images: image ? [{ url: image }] : undefined },
  }, rawLang);
}

export default async function ImageCasePage({ params }: { params: Promise<{ lang: string; id: string }> }) {
  const { lang: rawLang, id } = await params;
  const lang = (rawLang === "en" ? "en" : "zh") as Locale;
  const isZh = lang === "zh";
  const c = getImageCase(id);
  if (!c || !c.prompt) notFound();
  const prompt = full[id]?.prompt || c.prompt.excerpt;
  const summary = full[id]?.summary;
  const title = isZh ? c.title.zh : c.title.en;
  const lib = getImageLibrary();
  const related = lib.cases.filter((x) => x.id !== id && x.prompt && x.category === c.category).slice(0, 6);
  const src = SOURCE_LABEL[c.prompt.source];

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "CreativeWork",
      name: title,
      url: `${SITE_URL}/${lang}/${PATH}/${id}`,
      inLanguage: isZh ? "zh-CN" : "en",
      dateCreated: c.postedAt,
      author: { "@type": "Person", name: c.author.name, url: `https://x.com/${c.author.handle}` },
      isBasedOn: c.url,
      ...(c.media[0].type === "photo" ? { image: pbsSized(c.media[0].url, "large") } : {}),
      text: prompt,
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: isZh ? "提示词库" : "Prompt libraries", item: `${SITE_URL}/${lang}/prompts` },
        { "@type": "ListItem", position: 2, name: "ChatGPT Images 2.6", item: `${SITE_URL}/${lang}/${PATH}` },
        { "@type": "ListItem", position: 3, name: title, item: `${SITE_URL}/${lang}/${PATH}/${id}` },
      ],
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <nav className="text-xs text-gray-400 mb-6">
        <Link href={`/${lang}/prompts`} className="hover:text-gray-700">{isZh ? "提示词库" : "Prompt libraries"}</Link>
        <span className="mx-1.5">/</span>
        <Link href={`/${lang}/${PATH}`} className="hover:text-gray-700">ChatGPT Images 2.6</Link>
        <span className="mx-1.5">/</span>
        <span className="text-gray-600">{imageCategoryLabel(c.category, lang)}</span>
      </nav>

      <div className="grid lg:grid-cols-2 gap-8">
        <CaseMedia id={c.id} media={c.media} postUrl={c.url} label={title} isZh={isZh} variant="detail" />

        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-snug mb-3">{title}</h1>
          <p className="text-sm text-gray-500 mb-4">
            <a href={`https://x.com/${c.author.handle}`} target="_blank" rel="noopener noreferrer" className="hover:text-gray-900">{c.author.name} @{c.author.handle}</a>
            {" · "}{c.postedAt.slice(0, 10)}
            {" · "}{formatCount(c.stats.views, lang)} {isZh ? "浏览" : "views"}
            {" · ♥ "}{formatCount(c.stats.likes, lang)}
          </p>
          {summary && <p className="text-gray-700 leading-relaxed mb-5">{isZh ? summary.zh : summary.en}</p>}

          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
            <div className="flex items-center justify-between gap-3 mb-3">
              <h2 className="text-sm font-semibold text-gray-900">
                {isZh ? (c.prompt.kind === "full" ? "完整提示词" : "一句话提示词") : c.prompt.kind === "full" ? "Full prompt" : "One-line prompt"}
              </h2>
              <CopyPrompt text={prompt} id={c.id} isZh={isZh} />
            </div>
            <pre className="text-sm text-gray-800 whitespace-pre-wrap break-words font-sans leading-relaxed max-h-[32rem] overflow-y-auto">{prompt}</pre>
            <p className="text-xs text-gray-400 mt-3">
              {isZh ? "出处：" : "Source: "}
              <a href={c.prompt.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-700">{isZh ? src.zh : src.en}</a>
              {isZh ? "，原文照录。" : ", copied verbatim."}
            </p>
          </div>

          <div className="flex flex-wrap gap-2 mt-4 text-xs">
            {c.referenceAssets && <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700">{isZh ? "需自备参考图：作者还给了模型自己的图片" : "Needs your own image: the creator also gave the model an image"}</span>}
            {c.group && <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-700">{isZh ? `同款提示词 · ${c.group.size} 个作品` : `Same prompt · ${c.group.size} works`}</span>}
            {c.tools.map((t) => <span key={t} className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">{t}</span>)}
          </div>

          <a href={c.url} target="_blank" rel="noopener noreferrer" className="inline-block mt-6 text-sm text-[var(--primary)] hover:underline">
            {isZh ? "去 X 看原帖 ↗" : "View the original post on X ↗"}
          </a>
          <p className="text-xs text-gray-400 mt-2">
            {isZh ? "模型归属以作者自述为准。作品版权归原作者，要更正署名或下架请私信 @GoSailGlobal。" : "Model attribution is as stated by the creator. The work belongs to its creator; DM @GoSailGlobal to fix credit or remove it."}
          </p>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-14">
          <h2 className="text-lg font-bold text-gray-900 mb-4">{isZh ? `更多「${imageCategoryLabel(c.category, lang)}」提示词` : `More ${imageCategoryLabel(c.category, lang).toLowerCase()} prompts`}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {related.map((x) => (
              <Link key={x.id} href={imageCaseHref(x, lang)} className="group block rounded-xl overflow-hidden border border-gray-100 hover:shadow-md transition-shadow">
                <div className="relative aspect-square bg-gray-100">
                  {/* eslint-disable-next-line @next/next/no-img-element -- X 的图片 CDN 外链 */}
                  <img src={coverOf(x.media[0])} alt={isZh ? x.title.zh : x.title.en} loading="lazy" decoding="async" className="absolute inset-0 w-full h-full object-cover" />
                </div>
                <p className="p-2.5 text-sm text-gray-800 line-clamp-2 group-hover:text-[var(--primary)]">{isZh ? x.title.zh : x.title.en}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      <p className="mt-10 text-sm">
        <Link href={`/${lang}/${PATH}`} className="text-[var(--primary)] hover:underline">← {isZh ? "回到 ChatGPT Images 2.6 提示词合集" : "Back to the ChatGPT Images 2.6 library"}</Link>
      </p>
    </div>
  );
}
