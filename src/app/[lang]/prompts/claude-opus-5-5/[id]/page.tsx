import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Locale } from "@/lib/dictionaries";
import { MODEL_LABEL, categoryLabel, formatCount, formatDuration, getOpusCase, getOpusLibrary } from "@/lib/opus-prompts";
import fullData from "@/generated/opus-prompts-full.json";
import CaseVideo from "../CaseVideo";
import CopyPrompt, { TryInClaude } from "../CopyPrompt";

const SITE_URL = "https://jasonzhu.ai";
const PATH = "prompts/claude-opus-5-5";
const full = fullData as Record<string, { prompt: string | null; summary: { zh: string; en: string } | null }>;

interface Props {
  params: Promise<{ lang: string; id: string }>;
}

// 所有 id 都在 generateStaticParams 里；未知 id 按未匹配路由 404（走 global-not-found，完整 SSR）
export const dynamicParams = false;

export function generateStaticParams() {
  return getOpusLibrary().cases.flatMap((c) => [
    { lang: "zh", id: c.id },
    { lang: "en", id: c.id },
  ]);
}

const describe = (isZh: boolean, title: string, handle: string, views: number, kind: string | undefined, model: string) =>
  isZh
    ? `${title}：@${handle} 用 Claude ${model} 做的作品，原帖播放 ${formatCount(views, "zh")}。${kind === "full" ? "附完整提示词原文，可复制改写。" : kind ? "附作者公开的指令与出处。" : "可直接播放，附原帖出处。"}`
    : `${title} — made with Claude ${model} by @${handle}, ${formatCount(views, "en")} views on the original post. ${kind === "full" ? "Full original prompt included." : kind ? "Includes the creator's brief and source." : "Watch it here, with a link to the original post."}`;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang: rawLang, id } = await params;
  const lang = (rawLang === "en" ? "en" : "zh") as Locale;
  const c = getOpusCase(id);
  if (!c) return {};
  const isZh = lang === "zh";
  const modelName = (c.models || ["opus-5.5"]).map((m) => MODEL_LABEL[m]).join(" / ");
  const title = `${isZh ? c.title.zh : c.title.en}${c.prompt ? (isZh ? `｜${modelName} 提示词` : ` | ${modelName} Prompt`) : (isZh ? `｜${modelName} 作品` : ` | ${modelName} Work`)}`;
  const description = describe(isZh, isZh ? c.title.zh : c.title.en, c.author.handle, c.stats.views, c.prompt?.kind, modelName);
  return {
    title,
    description,
    referrer: "no-referrer",
    // 没有提示词的作品页只有视频和出处，内容太薄，不进搜索索引（列表页和 GitHub 合集照常展示）
    ...(c.prompt ? {} : { robots: { index: false, follow: true } }),
    alternates: {
      canonical: `${SITE_URL}/${lang}/${PATH}/${id}`,
      languages: { zh: `${SITE_URL}/zh/${PATH}/${id}`, en: `${SITE_URL}/en/${PATH}/${id}`, "x-default": `${SITE_URL}/zh/${PATH}/${id}` },
    },
    openGraph: { type: "article", title, description, url: `${SITE_URL}/${lang}/${PATH}/${id}`, images: [{ url: c.video.poster }] },
    twitter: { card: "summary_large_image", title, description, images: [c.video.poster] },
  };
}

export default async function OpusCasePage({ params }: Props) {
  const { lang: rawLang, id } = await params;
  const lang = (rawLang === "en" ? "en" : "zh") as Locale;
  const isZh = lang === "zh";
  const c = getOpusCase(id);
  if (!c) notFound();
  const modelName = (c.models || ["opus-5.5"]).map((m) => MODEL_LABEL[m]).join(" / ");
  const lib = getOpusLibrary();
  const prompt = full[id]?.prompt ?? null;
  const summary = full[id]?.summary ?? null;
  const title = isZh ? c.title.zh : c.title.en;

  const related = lib.cases
    .filter((x) => x.id !== id && x.category === c.category)
    .sort((a, b) => b.stats.views - a.stats.views)
    .slice(0, 6);

  const sourceLabel: Record<string, string> = isZh
    ? { post: "原帖正文", author_reply: "作者在原帖下的回复", image: "作者回复里的截图（人工转写）", link: "作者给出的链接" }
    : { post: "the original post", author_reply: "the creator's reply under the post", image: "a screenshot in the creator's reply (transcribed)", link: "a link shared by the creator" };

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "CreativeWork",
      name: title,
      description: describe(isZh, title, c.author.handle, c.stats.views, c.prompt?.kind, modelName),
      url: `${SITE_URL}/${lang}/${PATH}/${id}`,
      inLanguage: isZh ? "zh-CN" : "en",
      datePublished: c.postedAt,
      isBasedOn: c.url,
      creator: { "@type": "Person", name: c.author.name, url: `https://x.com/${c.author.handle}` },
      thumbnailUrl: c.video.poster,
      interactionStatistic: [
        { "@type": "InteractionCounter", interactionType: "https://schema.org/WatchAction", userInteractionCount: c.stats.views },
        { "@type": "InteractionCounter", interactionType: "https://schema.org/LikeAction", userInteractionCount: c.stats.likes },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "JasonZhu.AI", item: `${SITE_URL}/${lang}` },
        { "@type": "ListItem", position: 2, name: isZh ? "Claude 5.5 提示词库" : "Claude 5.5 Prompt Library", item: `${SITE_URL}/${lang}/${PATH}` },
        { "@type": "ListItem", position: 3, name: title, item: `${SITE_URL}/${lang}/${PATH}/${id}` },
      ],
    },
  ];

  const stats: [string, number][] = [
    [isZh ? "播放" : "Views", c.stats.views],
    [isZh ? "点赞" : "Likes", c.stats.likes],
    [isZh ? "评论" : "Replies", c.stats.replies],
    [isZh ? "收藏" : "Saves", c.stats.bookmarks],
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <nav className="text-sm text-gray-400 mb-5">
        <Link href={`/${lang}/${PATH}`} className="hover:text-[var(--primary)]">
          ← {isZh ? "Claude 5.5 提示词库" : "Claude 5.5 Prompt Library"}
        </Link>
      </nav>

      <div className="flex items-center gap-2 text-xs text-gray-400 mb-2 flex-wrap">
        <span className="px-2 py-0.5 rounded-full bg-blue-50 text-[var(--primary)] font-medium">{categoryLabel(c.category, lang)}</span>
        <a href={c.url} target="_blank" rel="noopener noreferrer" className="hover:text-gray-700">
          {c.author.name} @{c.author.handle}
        </a>
        <span>{c.postedAt.slice(0, 10)}</span>
        <span className="tabular-nums">{formatDuration(c.video.durationSec)}</span>
      </div>
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-5">{title}</h1>

      <div className="relative aspect-video bg-black rounded-xl overflow-hidden">
        <CaseVideo id={c.id} poster={c.video.poster} mp4={c.video.mp4} postUrl={c.url} label={`${title} · @${c.author.handle}`} isZh={isZh} />
      </div>

      <dl className="grid grid-cols-4 mt-4 text-center border border-gray-100 rounded-xl py-3">
        {stats.map(([k, v]) => (
          <div key={k} className="border-l first:border-l-0 border-gray-100">
            <dt className="text-xs text-gray-400">{k}</dt>
            <dd className="text-base font-semibold text-gray-800 tabular-nums">{formatCount(v, lang)}</dd>
          </div>
        ))}
      </dl>

      {summary && <p className="mt-6 text-gray-600 leading-relaxed">{isZh ? summary.zh : summary.en}</p>}

      {prompt && c.prompt && (
        <section className="mt-8">
          <div className="flex items-center justify-between gap-3 mb-3">
            <h2 className="text-lg font-bold text-gray-900">
              {c.prompt.kind === "full" ? (isZh ? "完整提示词" : "Full prompt") : isZh ? "作者公开的指令" : "Creator's brief"}
              <span className="ml-2 text-xs font-normal text-gray-400 tabular-nums">
                {prompt.length.toLocaleString("en-US")} {isZh ? "字符" : "chars"}
              </span>
            </h2>
            <CopyPrompt text={prompt} isZh={isZh} />
            <TryInClaude text={prompt} isZh={isZh} />
          </div>
          <pre className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap break-words font-sans bg-gray-50 border border-gray-100 rounded-xl p-5 max-h-[70vh] overflow-y-auto">
            {prompt}
          </pre>
          <p className="mt-2 text-xs text-gray-400">
            {isZh ? "出处：" : "Source: "}
            <a href={c.prompt.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-gray-600">
              {sourceLabel[c.prompt.source]}
            </a>
            {isZh ? "。提示词保留原文语言，未做改写。" : ". Kept in its original language, unedited."}
          </p>
        </section>
      )}

      {c.referenceAssets && (
        <p className="mt-6 text-sm text-amber-800 bg-amber-50 border-l-2 border-amber-300 px-4 py-3 rounded-r">
          {isZh
            ? "需自备参考素材：原作除了文字提示词，还用了图片、视频、音频、文档或代码库作为输入，本站未收录这些素材。只复制提示词得不到同样的结果。"
            : "Needs your own reference assets: besides the text prompt, the creator supplied images, video, audio, documents or a codebase, which are not hosted here. The prompt alone will not reproduce the result."}
        </p>
      )}

      {c.tools.length > 0 && (
        <section className="mt-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-2">{isZh ? "作者提到的工具" : "Tools the creator mentioned"}</h2>
          <div className="flex flex-wrap gap-2">
            {c.tools.map((t) => (
              <span key={t} className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 text-xs">{t}</span>
            ))}
          </div>
        </section>
      )}

      <section className="mt-8 text-sm text-gray-500 border border-gray-100 rounded-xl p-5 leading-relaxed">
        <p>
          {isZh ? "原帖：" : "Original post: "}
          <a href={c.url} target="_blank" rel="noopener noreferrer" className="text-[var(--primary)] hover:underline break-all">{c.url}</a>
        </p>
        <p className="mt-1.5">
          {isZh ? "全部作品数据开源在 " : "All works are open data at "}
          <a href="https://github.com/zhuyansen/awesome-opus-5.5-video" target="_blank" rel="noopener noreferrer" className="text-[var(--primary)] hover:underline">
            GitHub · awesome-opus-5.5-video
          </a>
          {isZh ? "。" : "."}
        </p>
        <p className="mt-1.5">
          {isZh
            ? `模型归属以作者自述为准，本站未独立复现。播放量为 ${lib.statsCheckedAt.slice(0, 10)} 的快照。作品版权归原作者，修改署名或下架请在 X 私信 @GoSailGlobal。`
            : `Model attribution is as stated by the creator and was not independently reproduced. View counts are a snapshot from ${lib.statsCheckedAt.slice(0, 10)}. The work belongs to its creator; DM @GoSailGlobal on X for corrections or removal.`}
        </p>
      </section>

      {related.length > 0 && (
        <section className="mt-12">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            {isZh ? `更多${categoryLabel(c.category, lang)}案例` : `More ${categoryLabel(c.category, lang).toLowerCase()}`}
          </h2>
          <ul className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {related.map((r) => (
              <li key={r.id}>
                <Link href={`/${lang}/${PATH}/${r.id}`} className="group block">
                  <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element -- X 封面外链，不走 next/image 域名白名单 */}
                    <img src={r.video.poster} alt={isZh ? r.title.zh : r.title.en} loading="lazy" referrerPolicy="no-referrer" className="w-full h-full object-cover group-hover:opacity-90 transition-opacity" />
                    <span className="absolute bottom-1 right-1 px-1 rounded bg-black/70 text-white text-[10px] tabular-nums">{formatDuration(r.video.durationSec)}</span>
                  </div>
                  <p className="mt-1.5 text-sm text-gray-700 group-hover:text-[var(--primary)] leading-snug line-clamp-2">{isZh ? r.title.zh : r.title.en}</p>
                  <p className="text-xs text-gray-400 tabular-nums">{formatCount(r.stats.views, lang)} {isZh ? "播放" : "views"}</p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
