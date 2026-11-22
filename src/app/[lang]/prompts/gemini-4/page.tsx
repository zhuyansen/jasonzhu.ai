import type { Metadata } from "next";
import Link from "@/components/Link";
import SubscribeForm from "@/components/SubscribeForm";
import { getDictionary, type Locale } from "@/lib/dictionaries";
import { getGeminiLibrary, GEMINI_LIBRARY_PATH, coverOf, formatCount } from "@/lib/gemini-prompts";
import { withSocialCards } from "@/lib/social";
import PromptsSubscribe from "../claude-opus-5-5/PromptsSubscribe";
import GeminiLibraryClient from "./GeminiLibraryClient";

const SITE_URL = "https://jasonzhu.ai";
const PATH = GEMINI_LIBRARY_PATH.slice(1);
const FIRST_PAGE = 24;
const REPO = "https://github.com/zhuyansen/awesome-gemini-4-prompts";

const copy = (isZh: boolean, n: number, withPrompt: number, threshold: number) => ({
  title: isZh ? "Gemini 4 提示词合集：Argon、Carbon 写代码做的 3D、物理模拟、游戏作品与原始提示词" : "Gemini 4 Prompts: 3D Scenes, Physics Sims & Games Built by Argon and Carbon, with Original Prompts",
  desc: isZh
    ? `收录 ${n} 个 X 创作者用 Gemini 4（Argon、Carbon 等）写代码做出来的作品，大多是和 Claude、GPT 的同题对比，原帖播放均过 ${threshold.toLocaleString("en-US")}，点封面去 X 看原视频。${withPrompt ? `其中 ${withPrompt} 个附作者公开的提示词` : "作者公开的提示词"}，原文照录、注明出处，可直接复制。`
    : `${n} works built in code with Gemini 4 (Argon, Carbon and more) by creators on X, most of them same-prompt comparisons against Claude and GPT, each with ${threshold.toLocaleString("en-US")}+ views; click a cover to watch it on X. ${withPrompt ? `${withPrompt} include the prompt the creator shared, kept verbatim with its source.` : "Prompts the creators share are kept verbatim with their source."}`,
});

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang: rawLang } = await params;
  const lang = (rawLang === "en" ? "en" : "zh") as Locale;
  const lib = getGeminiLibrary();
  const c = copy(lang === "zh", lib.cases.length, lib.withPrompt, lib.threshold);
  const cover = lib.cases[0] && coverOf(lib.cases[0].media[0]);
  return withSocialCards({
    title: c.title,
    description: c.desc,
    alternates: {
      canonical: `${SITE_URL}/${lang}/${PATH}`,
      languages: { zh: `${SITE_URL}/zh/${PATH}`, en: `${SITE_URL}/en/${PATH}`, "x-default": `${SITE_URL}/zh/${PATH}` },
    },
    openGraph: { type: "website", title: c.title, description: c.desc, url: `${SITE_URL}/${lang}/${PATH}`, ...(cover ? { images: [{ url: cover }] } : {}) },
  }, rawLang);
}

export default async function GeminiPromptsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: rawLang } = await params;
  const lang = (rawLang === "en" ? "en" : "zh") as Locale;
  const isZh = lang === "zh";
  const dict = await getDictionary(lang);
  const lib = getGeminiLibrary();
  const cases = lib.cases;
  const c = copy(isZh, cases.length, lib.withPrompt, lib.threshold);
  const initial = cases.slice(0, FIRST_PAGE);
  const refDay = (lib.updatedAt || new Date(0).toISOString()).slice(0, 10);
  const recentStart = new Date(Date.parse(refDay + "T00:00:00Z") - 2 * 864e5).toISOString().slice(0, 10);
  const totalViews = cases.reduce((s, x) => s + x.stats.views, 0);
  const creators = new Set(cases.map((x) => x.author.handle)).size;
  const versus = cases.filter((x) => x.rivals.length).length;

  const faqs = isZh
    ? [
        ["这里收的是什么作品？", "创作者让 Gemini 4 写代码（Three.js、WebGL、Blender 脚本、SVG、网页）做出来的视觉作品：3D 场景、果冻和软体这类物理与材质模拟、机械剖面动画、游戏、模拟系统。视频大多是代码运行时的录屏，不是视频生成模型直接出的片。"],
        ["Argon、Carbon、Pro 是什么？", `都是创作者帖子里写的 Gemini 4 版本名，本库按作者自己的写法标注。Argon 最多（${lib.modelCounts.argon} 个作品），Carbon 次之（${lib.modelCounts.carbon} 个）；Pro 多是正式发布前在 Arena 里匿名测试时的叫法。版本归属以作者自述为准，本站没有逐条复现。`],
        ["为什么大多是对比？", `Gemini 4 发布后，创作者最常做的是同一条提示词交给 Gemini 4 和 Claude、GPT 等模型各跑一遍，并排比效果、耗时和花费。${cases.length} 个作品里有 ${versus} 个是这类对比，可以按「对比」筛选看和哪个模型比的。`],
        ["每个作品都有提示词吗？", `没有。${lib.withPrompt ? `${cases.length} 个作品里有 ${lib.withPrompt} 个附提示词，` : ""}提示词只收作者本人公开的：原帖正文、作者自己的回复、回复里的截图或作者给的链接，原文照录。没公开提示词的作品也收录，方便看效果，卡片直接链到原帖。`],
        ["收录标准是什么？", `原帖播放不低于 ${lib.threshold.toLocaleString("en-US")}；视频是原帖自带的；作者自己写的帖子正文里说用了 Gemini 4（只在引用别人帖子里提到的不算）。转发、官方演示不收。`],
        ["我是作者，想修改署名或下架怎么办？", "在 X 上私信 @GoSailGlobal 即可，会尽快处理。所有作品版权归原作者，收录不代表获得任何授权。"],
        ["数据可以拿去用吗？", `可以。全部作品的结构化数据（原帖链接、创作者、分类、版本、对比对象、播放量、提示词出处）开源在 GitHub：${REPO}，每天自动同步。`],
      ]
    : [
        ["What is collected here?", "Visual works that creators had Gemini 4 build in code (Three.js, WebGL, Blender scripts, SVG, web pages): 3D scenes, jelly and soft-body physics, machine cutaways, games and simulations. The videos are mostly screen recordings of the running code rather than clips from a video model."],
        ["What are Argon, Carbon and Pro?", `They are the Gemini 4 version names creators write in their posts, and each work is labeled the way its creator wrote it. Argon is the most common (${lib.modelCounts.argon} works), then Carbon (${lib.modelCounts.carbon}); Pro mostly refers to anonymous Arena testing before release. Version attribution is as stated by the creator, not independently reproduced.`],
        ["Why are most of these comparisons?", `Since Gemini 4 came out, the most common post is one prompt run on Gemini 4 and on Claude, GPT and others, side by side with time and cost. ${versus} of the ${cases.length} works are comparisons like this; use the Versus filter to pick the rival model.`],
        ["Does every work come with a prompt?", `No. ${lib.withPrompt ? `${lib.withPrompt} of the ${cases.length} works include a prompt. ` : ""}Prompts come only from the creator: the post itself, their own reply, a screenshot in a reply, or a link they shared, kept verbatim. Works without a published prompt are listed too and link straight to the original post.`],
        ["What gets included?", `The original post has ${lib.threshold.toLocaleString("en-US")}+ views, the video is attached to that post, and the creator's own text says it was made with Gemini 4 (a mention only inside a quoted post doesn't count). Reposts and official demos are left out.`],
        ["I'm a creator and want my credit fixed or a work removed.", "Send a DM to @GoSailGlobal on X and it will be handled quickly. All works belong to their creators; listing them here does not imply any license."],
        ["Can I use the data?", `Yes. Structured data for every work (post link, creator, category, version, rival models, views, prompt source) is open on GitHub at ${REPO} and synced daily.`],
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
        <span className="text-gray-600">Gemini 4</span>
      </nav>

      <header className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">{isZh ? "Gemini 4 提示词合集" : "Gemini 4 Prompt Library"}</h1>
        <p className="text-gray-500 max-w-3xl leading-relaxed">{c.desc}</p>
        <div className="flex flex-wrap gap-6 mt-5 text-sm">
          {[
            [formatCount(cases.length, lang), isZh ? "个作品" : "works"],
            ...(lib.withPrompt ? [[formatCount(lib.withPrompt, lang), isZh ? "个带提示词" : "with prompts"]] : []),
            [formatCount(versus, lang), isZh ? "个同题对比" : "comparisons"],
            [formatCount(creators, lang), isZh ? "位创作者" : "creators"],
            [formatCount(totalViews, lang), isZh ? "总播放" : "total views"],
          ].map(([n, label]) => (
            <div key={label}><span className="text-xl font-bold text-gray-900">{n}</span> <span className="text-gray-500">{label}</span></div>
          ))}
        </div>
        {lib.updatedAt && (
          <p className="text-xs text-gray-400 mt-3">
            {isZh ? `更新于 ${lib.updatedAt.slice(0, 10)} · 播放量快照 ${(lib.statsCheckedAt || lib.updatedAt).slice(0, 10)}` : `Last update ${lib.updatedAt.slice(0, 10)} · view counts as of ${(lib.statsCheckedAt || lib.updatedAt).slice(0, 10)}`}
          </p>
        )}
      </header>

      {!isZh && (
        <div className="mb-6">
          <PromptsSubscribe lang={lang} compact where="library" library="gemini" />
        </div>
      )}

      {cases.length ? (
        <GeminiLibraryClient
          lang={lang} initial={initial} total={cases.length} withPrompt={lib.withPrompt}
          categoryCounts={lib.categoryCounts} modelCounts={lib.modelCounts} rivalCounts={lib.rivalCounts} recentStart={recentStart}
        />
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
          <Link href={`/${lang}/prompts/claude-opus-5-5`} className="text-[var(--primary)] hover:underline">{isZh ? "Claude 5.5 提示词库" : "Claude 5.5 Prompt Library"}</Link>
          {" · "}
          <Link href={`/${lang}/prompts/chatgpt-images-2-6`} className="text-[var(--primary)] hover:underline">{isZh ? "ChatGPT Images 2.6 提示词合集" : "ChatGPT Images 2.6 Prompts"}</Link>
          {" · "}
          <a href={REPO} target="_blank" rel="noopener noreferrer" className="text-[var(--primary)] hover:underline">GitHub</a>
        </p>
      </section>

      <section className="mt-12 max-w-2xl">
        {isZh ? <SubscribeForm source="gemini-4" lang={lang} dict={dict} /> : <PromptsSubscribe lang={lang} where="bottom" library="gemini" />}
      </section>
    </div>
  );
}
