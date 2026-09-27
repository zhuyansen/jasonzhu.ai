import type { Metadata } from "next";
import Link from "next/link";
import type { Locale } from "@/lib/dictionaries";
import { OPUS_CATEGORIES, getOpusLibrary } from "@/lib/opus-prompts";
import PromptLibraryClient from "./PromptLibraryClient";

const SITE_URL = "https://jasonzhu.ai";
const PATH = "prompts/claude-opus-5-5";
const FIRST_PAGE = 24;

const copy = (isZh: boolean, n: number, full: number, threshold: number) => ({
  title: isZh ? "Claude Opus 5.5 提示词库：视频、动效、3D 与游戏" : "Claude Opus 5.5 Prompt Library: Video, Motion, 3D & Games",
  desc: isZh
    ? `收录 ${n} 个来自 X 创作者的 Claude Opus 5.5 作品，原帖播放量均过 ${threshold.toLocaleString("en-US")}。保留原始提示词、作品视频与出处，其中 ${full} 条是完整提示词，可直接复制改写。`
    : `${n} Claude Opus 5.5 works from creators on X, each with ${threshold.toLocaleString("en-US")}+ views on the original post. Original prompts, demo videos and sources preserved — ${full} are full prompts you can copy and adapt.`,
});

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang: rawLang } = await params;
  const lang = (rawLang === "en" ? "en" : "zh") as Locale;
  const lib = getOpusLibrary();
  const c = copy(lang === "zh", lib.cases.length, lib.cases.filter((x) => x.prompt?.kind === "full").length, lib.threshold);
  return {
    title: c.title,
    description: c.desc,
    // X 的视频 CDN 拒绝带外站 Referer 的请求，这组页面不发 Referer 才能站内播放
    referrer: "no-referrer",
    alternates: {
      canonical: `${SITE_URL}/${lang}/${PATH}`,
      languages: { zh: `${SITE_URL}/zh/${PATH}`, en: `${SITE_URL}/en/${PATH}`, "x-default": `${SITE_URL}/zh/${PATH}` },
    },
    openGraph: { type: "website", title: c.title, description: c.desc, url: `${SITE_URL}/${lang}/${PATH}` },
  };
}

export default async function OpusPromptsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: rawLang } = await params;
  const lang = (rawLang === "en" ? "en" : "zh") as Locale;
  const isZh = lang === "zh";
  const lib = getOpusLibrary();
  const cases = lib.cases;
  const fullCount = cases.filter((x) => x.prompt?.kind === "full").length;
  const c = copy(isZh, cases.length, fullCount, lib.threshold);
  const counts: Record<string, number> = {};
  for (const x of cases) counts[x.category] = (counts[x.category] || 0) + 1;
  const initial = [...cases].sort((a, b) => b.stats.views - a.stats.views).slice(0, FIRST_PAGE);
  const totalViews = cases.reduce((s, x) => s + x.stats.views, 0);
  const creators = new Set(cases.map((x) => x.author.handle)).size;

  const faqs = isZh
    ? [
        ["Claude Opus 5.5 能直接生成视频吗？", "不能直接出视频文件。这里的作品都是它写代码做出来的：用 HTML/Canvas、Three.js、Remotion、HyperFrames 渲染画面，或者通过 MCP 操作 Blender、After Effects 这类软件，最后录屏或导出成视频。它不是 Sora、Seedance 那种视频生成模型。"],
        ["每个案例都有可以直接用的提示词吗？", `本页只收有提示词出处的案例：要么作者在原帖或自己的回复里贴了原文，要么给了指向提示词的链接。${fullCount} 条是完整提示词，其余是作者公开的一句话指令。只有视频、没有任何指令来源的作品不在这里。`],
        ["收录标准是什么？", `原帖播放量不低于 ${lib.threshold.toLocaleString("en-US")}；视频是原帖自带的；帖子明确说作品是用 Opus 5.5 做的。播放量快照取自 ${lib.statsCheckedAt.slice(0, 10)}。模型归属以作者自述为准，本站没有逐条复现。`],
        ["标了「需自备参考素材」是什么意思？", "原作者除了文字提示词，还给了模型图片、视频、音频、文档或代码库作为输入。只复制提示词得不到同样结果，需要准备自己的素材。"],
        ["我是作者，想修改署名或下架怎么办？", "在 X 上私信 @GoSailGlobal 即可，会尽快处理。所有作品版权归原作者，收录不代表获得任何授权。"],
      ]
    : [
        ["Can Claude Opus 5.5 generate video directly?", "Not as a video file. Every work here was produced by code it wrote: rendering with HTML/Canvas, Three.js, Remotion or HyperFrames, or driving tools such as Blender and After Effects through MCP, then recording or exporting. It is not a video generation model like Sora or Seedance."],
        ["Does every case include a reusable prompt?", `This page only lists cases with a traceable instruction: the creator posted it in the original post or their own replies, or linked to it. ${fullCount} are full prompts; the rest are one-line briefs the creator disclosed. Works with a video but no instruction source are not listed.`],
        ["What is the inclusion rule?", `At least ${lib.threshold.toLocaleString("en-US")} views on the original post, a native video attached to that post, and an explicit statement that it was made with Opus 5.5. View counts were snapshotted on ${lib.statsCheckedAt.slice(0, 10)}. Model attribution is as stated by each creator and was not independently reproduced.`],
        ["What does “needs reference assets” mean?", "Besides the text prompt, the creator gave the model images, video, audio, documents or a codebase. Copying the prompt alone will not reproduce the result; bring your own assets."],
        ["I am the creator. How do I correct attribution or remove my work?", "Send a DM to @GoSailGlobal on X and it will be handled promptly. All works remain the property of their creators; inclusion grants no license."],
      ];

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: c.title,
      description: c.desc,
      url: `${SITE_URL}/${lang}/${PATH}`,
      inLanguage: isZh ? "zh-CN" : "en",
      dateModified: lib.updatedAt,
      mainEntity: {
        "@type": "ItemList",
        numberOfItems: cases.length,
        itemListElement: initial.map((x, i) => ({
          "@type": "ListItem",
          position: i + 1,
          url: `${SITE_URL}/${lang}/${PATH}/${x.id}`,
          name: isZh ? x.title.zh : x.title.en,
        })),
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "JasonZhu.AI", item: `${SITE_URL}/${lang}` },
        { "@type": "ListItem", position: 2, name: c.title, item: `${SITE_URL}/${lang}/${PATH}` },
      ],
    },
  ];

  const steps = isZh
    ? [
        ["先看视频，再看提示词", "挑一个效果接近你目标的案例。提示词的长短和结构差异很大，先确认成品是你想要的方向。"],
        ["保留结构，替换主题", "完整提示词通常包含画面规格、分镜、验收标准。这些骨架留着，只换题材、品牌和文案。"],
        ["让它自己检查成品", "效果好的提示词几乎都要求模型渲染后逐帧检查、对齐节拍、验证首尾帧。这一步别删。"],
      ]
    : [
        ["Watch first, then read", "Pick a case whose result is close to your goal. Prompts vary a lot in length and structure, so confirm the output is the direction you want."],
        ["Keep the structure, swap the subject", "Full prompts usually carry canvas specs, a shot list and acceptance checks. Keep that skeleton; change the topic, brand and copy."],
        ["Make it verify its own output", "Most prompts that work ask the model to render, inspect frames, align to beats and check the loop. Do not delete that part."],
      ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <header className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--primary)] mb-2">
          {isZh ? "提示词库" : "Prompt library"}
        </p>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          {isZh ? "Claude Opus 5.5 提示词库" : "Claude Opus 5.5 Prompt Library"}
        </h1>
        <p className="text-gray-500 max-w-3xl leading-relaxed">{c.desc}</p>
        <dl className="flex flex-wrap gap-x-8 gap-y-2 mt-5 text-sm">
          {[
            [isZh ? "作品" : "Works", cases.length.toLocaleString("en-US")],
            [isZh ? "不同提示词" : "Distinct prompts", lib.distinctPrompts.toLocaleString("en-US")],
            [isZh ? "完整提示词" : "Full prompts", fullCount.toLocaleString("en-US")],
            [isZh ? "创作者" : "Creators", creators.toLocaleString("en-US")],
            [isZh ? "累计播放" : "Total views", isZh ? `${(totalViews / 1e8).toFixed(2)} 亿` : `${(totalViews / 1e6).toFixed(1)}M`],
            [isZh ? "数据更新" : "Updated", lib.statsCheckedAt.slice(0, 10)],
          ].map(([k, v]) => (
            <div key={k} className="flex items-baseline gap-1.5">
              <dt className="text-gray-400">{k}</dt>
              <dd className="font-semibold text-gray-900 tabular-nums">{v}</dd>
            </div>
          ))}
        </dl>
      </header>

      <PromptLibraryClient initial={initial} total={cases.length} counts={counts} lang={lang} />

      {/* 用法 */}
      <section className="mt-16">
        <h2 className="text-xl font-bold text-gray-900 mb-5">{isZh ? "怎么用这些提示词" : "How to use these prompts"}</h2>
        <ol className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {steps.map(([t, d], i) => (
            <li key={t} className="border border-gray-100 rounded-xl p-5">
              <span className="text-xs font-semibold text-gray-300 tabular-nums">0{i + 1}</span>
              <h3 className="text-base font-semibold text-gray-900 mt-1 mb-1.5">{t}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{d}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* FAQ */}
      <section className="mt-14">
        <h2 className="text-xl font-bold text-gray-900 mb-5">{isZh ? "常见问题" : "FAQ"}</h2>
        <div className="divide-y divide-gray-100 border-y border-gray-100">
          {faqs.map(([q, a]) => (
            <details key={q} className="group py-4">
              <summary className="flex items-center justify-between cursor-pointer select-none text-base font-medium text-gray-900">
                <h3 className="text-base font-medium">{q}</h3>
                <span className="text-gray-300 group-open:rotate-45 transition-transform text-xl leading-none ml-4">+</span>
              </summary>
              <p className="mt-2 text-sm text-gray-600 leading-relaxed max-w-3xl">{a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* 全部案例的真实链接：按钮翻页对爬虫不可见，这里给每个详情页一个入口 */}
      <section className="mt-14">
        <details className="border-t border-gray-100 pt-5">
          <summary className="text-sm text-gray-500 cursor-pointer select-none hover:text-gray-700">
            {isZh ? `按分类浏览全部 ${cases.length} 个案例` : `Browse all ${cases.length} cases by category`}
          </summary>
          <nav aria-label={isZh ? "全部案例" : "All cases"} className="mt-5 space-y-6">
            {OPUS_CATEGORIES.filter((k) => counts[k.key]).map((k) => (
              <div key={k.key}>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">
                  {k.icon} {isZh ? k.zh : k.en}
                </h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-1.5">
                  {cases
                    .filter((x) => x.category === k.key)
                    .map((x) => (
                      <li key={x.id} className="text-sm truncate">
                        <Link href={`/${lang}/${PATH}/${x.id}`} className="text-gray-500 hover:text-[var(--primary)]">
                          {isZh ? x.title.zh : x.title.en}
                        </Link>
                      </li>
                    ))}
                </ul>
              </div>
            ))}
          </nav>
        </details>
      </section>

      {/* 订阅 */}
      <div className="mt-16 text-center border-t border-gray-100 pt-10">
        <p className="text-sm text-gray-500 mb-3">
          {isZh ? "每天一期 AI 快讯 + 免费出海手册，新提示词上架也会在这里说" : "Daily AI digest + free playbook. New prompts are announced here too."}
        </p>
        <Link
          href={`/${lang}/handbook`}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          {isZh ? "📘 免费订阅" : "📘 Subscribe Free"}
        </Link>
      </div>
    </div>
  );
}
