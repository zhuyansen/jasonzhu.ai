import type { Metadata } from "next";
import Link from "@/components/Link";
import SubscribeForm from "@/components/SubscribeForm";
import { getDictionary, type Locale } from "@/lib/dictionaries";
import { getAnimationLibrary, ANIMATION_LIBRARY_PATH, coverOf, formatCount, animationCategoryLabel } from "@/lib/animation-prompts";
import { withSocialCards } from "@/lib/social";
import PromptsSubscribe from "../claude-opus-5-5/PromptsSubscribe";
import AnimationLibraryClient from "./AnimationLibraryClient";

/**
 * Claude 动画提示词库（2026-11-21 建）：作品全部从 Claude 5.5 库挑出来（scripts/animation-prompts/assemble.mjs），
 * 标题 / H1 / FAQ 针对「claude animation」「Claude 动画」这类搜索词。和 Claude 库的动效落地页（motion-graphics）不同：
 * 那页只放 Claude 库「动效设计」一个分类，这里按动画本身是什么分六类，还收科普动画、卡通故事、3D 动画等。
 */
const SITE_URL = "https://jasonzhu.ai";
const PATH = ANIMATION_LIBRARY_PATH.slice(1);
const FIRST_PAGE = 24;

const copy = (isZh: boolean, n: number, withPrompt: number) => ({
  title: isZh ? "Claude 动画提示词：Claude 做的动效、科普动画、卡通和 3D 动画与原始提示词" : "Claude Animation Prompts: Motion Graphics, Explainers & 3D",
  desc: isZh
    ? `${formatCount(n, "zh")} 个用 Claude（Opus、Sonnet、Fable 5.5）做的动画：动效与宣传片、科普讲解、卡通故事、3D 动画、网页动效。${withPrompt} 个附作者公开的提示词，原文照录，可直接复制。`
    : `${n.toLocaleString("en-US")} animations made with Claude: motion graphics, explainers, cartoons and 3D. ${withPrompt} with the creator's prompt; tags name the Claude animation skill or tool.`,
});

/** 作者在帖子里点名的工具，按出现次数排（大小写不同的算一个） */
function topTools(cases: { tools: string[] }[], n: number) {
  const count = new Map<string, { name: string; n: number }>();
  for (const c of cases) for (const t of new Set(c.tools.map((x) => x.trim()))) {
    const k = t.toLowerCase();
    if (/^(claude|opus|sonnet|haiku|fable|claude code|mcp|python|chatgpt|codex)\b/.test(k) || /gpt|gemini|seedance|higgsfield|midjourney/.test(k)) continue; // 模型和通用工具不算动画工具
    const cur = count.get(k) || { name: t, n: 0 };
    cur.n++;
    count.set(k, cur);
  }
  return [...count.values()].sort((a, b) => b.n - a.n).slice(0, n);
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang: rawLang } = await params;
  const lang = (rawLang === "en" ? "en" : "zh") as Locale;
  const lib = getAnimationLibrary();
  const c = copy(lang === "zh", lib.cases.length, lib.withPrompt);
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

export default async function ClaudeAnimationPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: rawLang } = await params;
  const lang = (rawLang === "en" ? "en" : "zh") as Locale;
  const isZh = lang === "zh";
  const dict = await getDictionary(lang);
  const lib = getAnimationLibrary();
  const cases = lib.cases;
  const c = copy(isZh, cases.length, lib.withPrompt);
  const initial = cases.slice(0, FIRST_PAGE);
  const refDay = (lib.updatedAt || new Date(0).toISOString()).slice(0, 10);
  const recentStart = new Date(Date.parse(refDay + "T00:00:00Z") - 2 * 864e5).toISOString().slice(0, 10);
  const totalViews = cases.reduce((s, x) => s + x.stats.views, 0);
  const creators = new Set(cases.map((x) => x.author.handle)).size;
  const tools = topTools(cases, 6);
  const toolList = tools.map((t) => `${t.name}（${t.n}）`).join("、");
  const toolListEn = tools.map((t) => `${t.name} (${t.n})`).join(", ");
  const sameGroups = cases.filter((x) => x.group).length;
  const biggest = Object.entries(lib.categoryCounts).sort((a, b) => b[1] - a[1])[0];

  const faqs = isZh
    ? [
        ["这里收的是什么作品？", `创作者用 Claude 5.5（Opus、Sonnet、Haiku、Fable）做出来的动画，按动画本身分成六类：动效与宣传片、科普讲解、故事与卡通、3D 动画、网页与界面动效、数学与代码艺术，最多的是「${biggest ? animationCategoryLabel(biggest[0], "zh") : ""}」。大多数是 Claude 写代码（HTML / Canvas / SVG、Three.js、Remotion、Manim、Blender 的 Python 脚本）再渲染成视频；也有 Claude 当导演、个别镜头交给视频模型的，都以作者自述为准。`],
        ["怎么用 Claude 做动画？", `先按分类找一个和你想做的最像的作品，点进去复制作者的原始提示词，在 Claude（或 Claude Code）里改成你的主题再跑。作者帖子里点名最多的工具是：${toolList}。卡片和详情页上的灰色标签是每个作品用到的工具。`],
        ["有现成的 Claude 动画 skill 吗？", "有些创作者把整套做法打包成了 Claude Code 的 skill 或模板（Remotion、HyperFrames 这类），卡片和详情页的标签会写出作者用了什么。本库只收作者本人公开的提示词和工具名，skill 本身请到作者给的链接下载。"],
        ["为什么我做的动画和别人的差这么多、还都长得一样？", `同一条提示词交给 Claude，每次跑出来都不一样，作者的素材、时长、风格要求也会拉开差距。库里有 ${sameGroups} 个作品标了「同款提示词」：几个人跑的是同一条提示词，可以放在一起看结果差在哪；按播放量排序，看同一类里播放高的作品提示词写得有多具体。`],
        ["每个作品都有提示词吗？", `没有。${cases.length} 个作品里有 ${lib.withPrompt} 个附提示词，只收作者本人公开的：原帖正文、作者自己的回复、回复里的截图或作者给的链接，原文照录。没公开提示词的作品也收录，方便看效果，卡片直接链到原帖。`],
        ["收录标准是什么？", `作品全部来自本站的 Claude 5.5 提示词库：原帖播放不低于 ${lib.threshold.toLocaleString("en-US")}、视频是原帖自带的、作者说用 Claude 5.5 做的。再从里面挑出产出是动画的；可以玩的游戏、互动网页和 App、静态图、视频模型直出的写实短片不收。挑选规则写在代码里，人工抽查后的增删另有记录。`],
        ["我是作者，想修改署名或下架怎么办？", "在 X 上私信 @GoSailGlobal 即可，会尽快处理。所有作品版权归原作者，收录不代表获得任何授权。"],
      ]
    : [
        ["What is collected here?", `Animations that creators made with Claude 5.5 (Opus, Sonnet, Haiku, Fable), sorted by what the animation is: motion graphics and promos, explainers, stories and cartoons, 3D animation, web and UI motion, and math and code art. The largest group is ${biggest ? animationCategoryLabel(biggest[0], "en").toLowerCase() : ""}. Most were made by Claude writing code (HTML, Canvas, SVG, Three.js, Remotion, Manim, Blender Python) and rendering it to video; in some, Claude directed and a video model made individual shots. Everything is as stated by the creator.`],
        ["How do I make an animation with Claude?", `Find the work closest to what you want, open it, copy the creator's original prompt and adapt it to your topic in Claude or Claude Code. The tools creators name most often are ${toolListEn}. The grey tags on each card and detail page show the tools used for that work.`],
        ["Is there a Claude animation skill?", "Some creators package their workflow as a Claude Code skill or template (Remotion, HyperFrames and similar), and the tags on each card show what the creator used. This library only keeps the prompts and tool names creators published themselves; get a skill from the link the creator shared."],
        ["Why do my animations look worse than others', or all the same?", `The same prompt gives a different result each run, and creators' assets, length and style instructions make a big difference. ${sameGroups} works here are tagged "Same prompt": several people ran one prompt, so you can compare the results side by side. Sort by views to see how specific the prompts behind the most-watched works in a category are.`],
        ["Does every work come with a prompt?", `No. ${lib.withPrompt} of the ${cases.length.toLocaleString("en-US")} works include a prompt. Prompts come only from the creator: the post itself, their own reply, a screenshot in a reply, or a link they shared, kept verbatim. Works without a published prompt are listed too and link straight to the original post.`],
        ["What gets included?", `Every work comes from this site's Claude 5.5 prompt library: the original post has ${lib.threshold.toLocaleString("en-US")}+ views, the video is attached, and the creator says a Claude 5.5 model made it. From those, works whose output is an animation are selected; playable games, interactive sites and apps, static images and live-action clips straight from video models are left out. The selection rule is in code and manual additions and removals are logged.`],
        ["I'm a creator and want my credit fixed or a work removed.", "Send a DM to @GoSailGlobal on X and it will be handled quickly. All works belong to their creators; listing them here does not imply any license."],
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
        <span className="text-gray-600">{isZh ? "Claude 动画" : "Claude animation"}</span>
      </nav>

      <header className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">{isZh ? "Claude 动画提示词库" : "Claude Animation Prompts"}</h1>
        <p className="text-gray-500 max-w-3xl leading-relaxed">{c.desc}</p>
        <div className="flex flex-wrap gap-6 mt-5 text-sm">
          {[
            [formatCount(cases.length, lang), isZh ? "个作品" : "works"],
            ...(lib.withPrompt ? [[formatCount(lib.withPrompt, lang), isZh ? "个带提示词" : "with prompts"]] : []),
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
          <PromptsSubscribe lang={lang} compact where="library" library="claude" />
        </div>
      )}

      {cases.length ? (
        <AnimationLibraryClient
          lang={lang} initial={initial} total={cases.length} withPrompt={lib.withPrompt}
          categoryCounts={lib.categoryCounts} modelCounts={lib.modelCounts} recentStart={recentStart}
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
          <Link href={`/${lang}/prompts/claude-opus-5-5/motion-graphics`} className="text-[var(--primary)] hover:underline">{isZh ? "Claude 动效提示词" : "Claude Motion Graphics Prompts"}</Link>
          {" · "}
          <Link href={`/${lang}/prompts/gemini-4`} className="text-[var(--primary)] hover:underline">{isZh ? "Gemini 4 提示词合集" : "Gemini 4 Prompts"}</Link>
        </p>
      </section>

      <section className="mt-12 max-w-2xl">
        {isZh ? <SubscribeForm source="claude-animation" lang={lang} dict={dict} /> : <PromptsSubscribe lang={lang} where="bottom" library="claude" />}
      </section>
    </div>
  );
}
