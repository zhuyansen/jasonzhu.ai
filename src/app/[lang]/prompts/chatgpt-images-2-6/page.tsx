import type { Metadata } from "next";
import Link from "@/components/Link";
import SubscribeForm from "@/components/SubscribeForm";
import { getDictionary, type Locale } from "@/lib/dictionaries";
import { getImageLibrary, IMAGE_LIBRARY_PATH, coverOf, formatCount } from "@/lib/image-prompts";
import { withSocialCards } from "@/lib/social";
import ImageLibraryClient from "./ImageLibraryClient";

const SITE_URL = "https://jasonzhu.ai";
const PATH = IMAGE_LIBRARY_PATH.slice(1);
const FIRST_PAGE = 24;
const REPO = "https://github.com/zhuyansen/awesome-chatgpt-images-2.6";

const copy = (isZh: boolean, n: number, withPrompt: number, threshold: number) => ({
  title: isZh ? "ChatGPT Images 2.6 提示词合集：GIF、人像、海报、表情包作品与原始提示词" : "ChatGPT Images 2.6 Prompts: GIFs, Portraits, Posters & Stickers with Original Prompts",
  desc: isZh
    ? `收录 ${n} 个 X 创作者用 ChatGPT Images 2.6（GPT-Image-2.6）做的作品，原帖浏览均过 ${threshold.toLocaleString("en-US")}，GIF 可直接播放。${withPrompt ? `其中 ${withPrompt} 个附作者公开的提示词` : "作者公开的提示词"}，原文照录、注明出处，可直接复制。每天自动更新。`
    : `${n} works made with ChatGPT Images 2.6 (GPT-Image-2.6) by creators on X, each with ${threshold.toLocaleString("en-US")}+ views on the original post, GIFs playable here. ${withPrompt ? `${withPrompt} include the prompt the creator shared, kept verbatim with its source.` : "Prompts the creators share are kept verbatim with their source."} Updated daily.`,
});

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang: rawLang } = await params;
  const lang = (rawLang === "en" ? "en" : "zh") as Locale;
  const lib = getImageLibrary();
  const c = copy(lang === "zh", lib.cases.length, lib.withPrompt, lib.threshold);
  const cover = lib.cases[0] && coverOf(lib.cases[0].media[0]);
  return withSocialCards({
    title: c.title,
    description: c.desc,
    // X 的视频 CDN 拒绝带外站 Referer 的请求（GIF 也是 mp4），这组页面不发 Referer
    referrer: "no-referrer",
    alternates: {
      canonical: `${SITE_URL}/${lang}/${PATH}`,
      languages: { zh: `${SITE_URL}/zh/${PATH}`, en: `${SITE_URL}/en/${PATH}`, "x-default": `${SITE_URL}/zh/${PATH}` },
    },
    openGraph: { type: "website", title: c.title, description: c.desc, url: `${SITE_URL}/${lang}/${PATH}`, ...(cover ? { images: [{ url: cover }] } : {}) },
  }, rawLang);
}

export default async function ImagePromptsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: rawLang } = await params;
  const lang = (rawLang === "en" ? "en" : "zh") as Locale;
  const isZh = lang === "zh";
  const dict = await getDictionary(lang);
  const lib = getImageLibrary();
  const cases = lib.cases;
  const c = copy(isZh, cases.length, lib.withPrompt, lib.threshold);
  const initial = cases.slice(0, FIRST_PAGE);
  const refDay = (lib.updatedAt || new Date(0).toISOString()).slice(0, 10);
  const recentStart = new Date(Date.parse(refDay + "T00:00:00Z") - 2 * 864e5).toISOString().slice(0, 10);
  const totalViews = cases.reduce((s, x) => s + x.stats.views, 0);
  const creators = new Set(cases.map((x) => x.author.handle)).size;
  const gifs = lib.categoryCounts.gif || 0;

  const faqs = isZh
    ? [
        ["ChatGPT Images 2.6 是什么？", "OpenAI 在 2026 年 11 月 4 日发布的图像模型，在 ChatGPT 和 Codex 里所有用户都能用。这一版新增了 GIF 动图生成（2 到 16 帧）和可以反复使用的参考图（人物、宠物、角色），API 里叫 GPT-Image-2.6，分 Flare（更快）和 Sunburst（画质更好）两档。"],
        ["每个作品都有提示词吗？", `没有。${lib.withPrompt ? `${cases.length} 个作品里有 ${lib.withPrompt} 个附提示词，` : ""}提示词只收作者本人公开的：原帖正文、作者自己的回复、回复里的截图或作者给的链接，原文照录。作者没公开提示词的作品也收录，方便看效果，卡片直接链到原帖${lib.withPrompt ? "；勾选「只看有提示词的」可以过滤" : ""}。`],
        ["收录标准是什么？", `原帖浏览不低于 ${lib.threshold.toLocaleString("en-US")}；图片、GIF 或视频是原帖自带的；帖子明确说是用 ChatGPT Images 2.6（GPT-Image-2.6）做的。别人转发、官方演示、平台推广不收。模型归属以作者自述为准，本站没有逐条复现。每天自动收录新作品。`],
        ["标了「需自备参考图」是什么意思？", "原作者除了文字提示词，还给了模型自己的照片、草图或参考图。复制提示词后，要换成你自己的图片才能得到类似效果。"],
        ["我是作者，想修改署名或下架怎么办？", "在 X 上私信 @GoSailGlobal 即可，会尽快处理。所有作品版权归原作者，收录不代表获得任何授权。"],
        ["数据可以拿去用吗？", `可以。全部作品的结构化数据（原帖链接、创作者、分类、浏览量、提示词出处）开源在 GitHub：${REPO}，每天自动同步。`],
      ]
    : [
        ["What is ChatGPT Images 2.6?", "OpenAI's image model released on November 4, 2026, available to every ChatGPT and Codex user. It adds animated GIFs (2 to 16 frames) and saved reference images for people, pets and characters. In the API it is GPT-Image-2.6, in two tiers: Flare (faster) and Sunburst (higher quality)."],
        ["Does every work come with a prompt?", `No. ${lib.withPrompt ? `${lib.withPrompt} of the ${cases.length} works include a prompt. ` : ""}Prompts come only from the creator: the post itself, their own reply, a screenshot in a reply, or a link they shared, kept verbatim. Works without a published prompt are listed too and link straight to the original post${lib.withPrompt ? '; tick "Only with prompts" to filter' : ""}.`],
        ["What gets included?", `The original post has ${lib.threshold.toLocaleString("en-US")}+ views, the images, GIF or video are attached to that post, and the creator says it was made with ChatGPT Images 2.6 (GPT-Image-2.6). Reposts, official demos and platform promotions are left out. Model attribution is as stated by the creator, not independently reproduced. New works are added daily.`],
        ["What does \"Needs your own image\" mean?", "Besides the text prompt, the creator gave the model their own photo, sketch or a reference image. Swap in your own image to get a similar result."],
        ["I'm a creator and want my credit fixed or a work removed.", "Send a DM to @GoSailGlobal on X and it will be handled quickly. All works belong to their creators; listing them here does not imply any license."],
        ["Can I use the data?", `Yes. Structured data for every work (post link, creator, category, views, prompt source) is open on GitHub at ${REPO} and synced daily.`],
      ];

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: c.title,
      description: c.desc,
      url: `${SITE_URL}/${lang}/${PATH}`,
      inLanguage: isZh ? "zh-CN" : "en",
      mainEntity: {
        "@type": "ItemList",
        numberOfItems: cases.length,
        itemListElement: cases.filter((x) => x.prompt).slice(0, 20).map((x, i) => ({
          "@type": "ListItem", position: i + 1, url: `${SITE_URL}/${lang}/${PATH}/${x.id}`, name: isZh ? x.title.zh : x.title.en,
        })),
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <nav className="text-xs text-gray-400 mb-6">
        <Link href={`/${lang}/prompts`} className="hover:text-gray-700">{isZh ? "提示词库" : "Prompt libraries"}</Link>
        <span className="mx-1.5">/</span>
        <span className="text-gray-600">ChatGPT Images 2.6</span>
      </nav>

      <header className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">{isZh ? "ChatGPT Images 2.6 提示词合集" : "ChatGPT Images 2.6 Prompt Library"}</h1>
        <p className="text-gray-500 max-w-3xl leading-relaxed">{c.desc}</p>
        <div className="flex flex-wrap gap-6 mt-5 text-sm">
          {[
            [formatCount(cases.length, lang), isZh ? "个作品" : "works"],
            ...(lib.withPrompt ? [[formatCount(lib.withPrompt, lang), isZh ? "个带提示词" : "with prompts"]] : []),
            [formatCount(gifs, lang), isZh ? "个 GIF" : "GIFs"],
            [formatCount(creators, lang), isZh ? "位创作者" : "creators"],
            [formatCount(totalViews, lang), isZh ? "总浏览" : "total views"],
          ].map(([n, label]) => (
            <div key={label}><span className="text-xl font-bold text-gray-900">{n}</span> <span className="text-gray-500">{label}</span></div>
          ))}
        </div>
        {lib.updatedAt && (
          <p className="text-xs text-gray-400 mt-3">
            {isZh ? `每天自动收录 · 更新于 ${lib.updatedAt.slice(0, 10)} · 浏览量快照 ${(lib.statsCheckedAt || lib.updatedAt).slice(0, 10)}` : `Updated daily · last update ${lib.updatedAt.slice(0, 10)} · view counts as of ${(lib.statsCheckedAt || lib.updatedAt).slice(0, 10)}`}
          </p>
        )}
      </header>

      {cases.length ? (
        <ImageLibraryClient lang={lang} initial={initial} total={cases.length} withPrompt={lib.withPrompt} categoryCounts={lib.categoryCounts} recentStart={recentStart} />
      ) : (
        <p className="text-center text-gray-400 py-20">{isZh ? "首批作品整理中，很快上线。" : "The first works are being curated."}</p>
      )}

      <section className="mt-16 max-w-3xl">
        <h2 className="text-xl font-bold text-gray-900 mb-4">{isZh ? "常见问题" : "FAQ"}</h2>
        <div className="space-y-4">
          {faqs.map(([q, a]) => (
            <details key={q} className="rounded-xl border border-gray-100 p-4 group">
              <summary className="font-medium text-gray-900 cursor-pointer">{q}</summary>
              <p className="text-sm text-gray-600 leading-relaxed mt-2">{a}</p>
            </details>
          ))}
        </div>
        <p className="text-sm text-gray-500 mt-6">
          {isZh ? "也看看：" : "See also: "}
          <Link href={`/${lang}/prompts/claude-opus-5-5`} className="text-[var(--primary)] hover:underline">{isZh ? "Claude 5.5 提示词库（视频、动效、3D、游戏）" : "Claude 5.5 Prompt Library (video, motion, 3D, games)"}</Link>
          {" · "}
          <a href={REPO} target="_blank" rel="noopener noreferrer" className="text-[var(--primary)] hover:underline">GitHub</a>
        </p>
      </section>

      {isZh && (
        <section className="mt-12 max-w-2xl">
          <SubscribeForm source="images-2-6" lang={lang} dict={dict} />
        </section>
      )}
    </div>
  );
}
