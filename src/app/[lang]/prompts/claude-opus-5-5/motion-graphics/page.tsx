import type { Metadata } from "next";
import Link from "@/components/Link";
import type { Locale } from "@/lib/dictionaries";
import { getOpusLibrary } from "@/lib/opus-prompts";
import { formatCount, type ClaudeModel, type OpusCaseSlim } from "@/lib/opus-prompts-shared";
import { computeInsights } from "@/lib/opus-insights";
import PromptLibraryClient from "../PromptLibraryClient";
import InsightsSection from "../InsightsSection";

/**
 * 动效设计落地页：只放「动效设计」分类，标题 / H1 / FAQ 针对「Claude motion graphics prompts」这类搜索词。
 * 数据和主库同源（cases.json），每天随收录更新；统计在构建时现算。
 */
const SITE_URL = "https://jasonzhu.ai";
const LIB = "prompts/claude-opus-5-5";
const PATH = `${LIB}/motion-graphics`;
const FIRST_PAGE = 24;

function motionCases(): OpusCaseSlim[] {
  return getOpusLibrary().cases.filter((c) => c.category === "motion");
}

const copy = (isZh: boolean, n: number, withPrompt: number) => ({
  title: isZh ? `Claude 动效提示词：${n} 个 Opus 5.5 动效作品与原文提示词` : `Claude Motion Graphics Prompts: ${n} Opus 5.5 Examples, Ranked`,
  desc: isZh
    ? `${n} 个用 Claude Opus 5.5 / Sonnet 5.5 做的动效设计作品（Motion Graphics），原帖播放量均过 5,000，可在页面里直接播放；其中 ${withPrompt} 个附作者公开的原文提示词，可一键复制或直接在 Claude 里试。`
    : `${n} motion graphics made with Claude Opus 5.5 and Sonnet 5.5, ranked by views (5,000+ each) and playable here. ${withPrompt} include the creator's own prompt, verbatim: copy it or open it straight in Claude.`,
});

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang: rawLang } = await params;
  const lang = (rawLang === "en" ? "en" : "zh") as Locale;
  const cases = motionCases();
  const c = copy(lang === "zh", cases.length, cases.filter((x) => x.prompt).length);
  return {
    title: c.title,
    description: c.desc,
    referrer: "no-referrer", // X 视频 CDN 拒绝带外站 Referer，和主库同样处理
    alternates: {
      canonical: `${SITE_URL}/${lang}/${PATH}`,
      languages: { zh: `${SITE_URL}/zh/${PATH}`, en: `${SITE_URL}/en/${PATH}`, "x-default": `${SITE_URL}/zh/${PATH}` },
    },
    openGraph: { type: "website", title: c.title, description: c.desc, url: `${SITE_URL}/${lang}/${PATH}` },
  };
}

export default async function MotionGraphicsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: rawLang } = await params;
  const lang = (rawLang === "en" ? "en" : "zh") as Locale;
  const isZh = lang === "zh";
  const lib = getOpusLibrary();
  const cases = motionCases();
  const withPrompt = cases.filter((x) => x.prompt).length;
  const c = copy(isZh, cases.length, withPrompt);

  const byViews = [...cases].sort((a, b) => b.stats.views - a.stats.views);
  const initial = byViews.slice(0, FIRST_PAGE);
  const modelCounts = (["opus-5.5", "sonnet-5.5", "fable-5.5"] as ClaudeModel[]).reduce(
    (o, m) => ({ ...o, [m]: cases.filter((x) => (x.models || ["opus-5.5"]).includes(m)).length }),
    {} as Record<ClaudeModel, number>
  );

  // 新作品 / 本周最火：口径和主库一致（按收录日期，相对库的更新日期）
  const refDay = new Date(lib.updatedAt.slice(0, 10) + "T00:00:00Z");
  const dayOffset = (n: number) => new Date(refDay.getTime() - n * 864e5).toISOString().slice(0, 10);
  const fresh = { weekStart: dayOffset(6), recentStart: dayOffset(2), weekCount: cases.filter((x) => (x.addedAt || "") >= dayOffset(6)).length };
  const weekHot = byViews.filter((x) => (x.addedAt || "") >= fresh.weekStart).slice(0, 3);
  const featured =
    weekHot.length === 3
      ? { title: { zh: "本周最火的动效", en: "Hottest motion graphics this week" }, cases: weekHot }
      : { title: { zh: "播放最高的动效", en: "Most-viewed motion graphics" }, cases: byViews.slice(0, 3) };

  // 「出圈」按全库前 10% 的口径
  const all = lib.cases.map((x) => x.stats.views).sort((a, b) => b - a);
  const insights = computeInsights(cases, all[Math.max(0, Math.floor(all.length * 0.1) - 1)]);
  const topTools = insights.tools.slice(0, 5).map((t) => t.name);

  const faqs: [string, string][] = isZh
    ? [
        ["Claude 能做动效（Motion Graphics）吗？", `能，但不是直接生成视频文件。这里的 ${cases.length} 个动效都是 Claude 写代码做出来的：用 HTML/CSS/Canvas、SVG、Three.js、Remotion 等渲染，或者通过 MCP 驱动 After Effects、Blender 这类软件，再录屏或导出。`],
        ["做这些动效一般用什么工具？", `作者标注最多的配套工具是：${topTools.join("、")}。很多作品只用浏览器渲染 + 录屏就能完成。`],
        ["动效视频多长合适？", `这里动效作品的时长中位数是 ${insights.durationMedian} 秒。时长和播放的关系见页面上的「高播放作品的规律」。`],
        ["怎么复用这些提示词？", "先看视频确认是你想要的效果，再复制提示词：保留画布尺寸、帧率、时长、分镜和验收要求这些骨架，只替换主题、品牌和文案。也可以点「在 Claude 里试试」直接带着提示词打开 Claude。"],
        ["收录标准是什么？", `原帖播放量至少 ${lib.threshold.toLocaleString("en-US")}、帖子里附原生视频、作者明确说是用 Claude Opus 5.5 / Sonnet 5.5 / Fable 5.5 做的。提示词一律原文照录、注明出处，作品版权归原作者。`],
      ]
    : [
        ["Can Claude make motion graphics?", `Yes, though not as a video file. All ${cases.length} works here were made by Claude writing code: rendering with HTML/CSS/Canvas, SVG, Three.js or Remotion, or driving After Effects and Blender through MCP, then recording or exporting.`],
        ["Which tools do creators pair with Claude for motion graphics?", `The most common are ${topTools.join(", ")}. Many pieces need nothing more than a browser render and a screen recording.`],
        ["How long should a motion graphics video be?", `The median length here is ${insights.durationMedian} seconds. See "What the most-viewed works have in common" on this page for how length relates to views.`],
        ["How do I reuse these prompts?", "Watch the video first, then copy the prompt. Keep the skeleton (canvas size, frame rate, duration, shot list, acceptance checks) and swap the subject, brand and copy. Or press “Try in Claude” to open the prompt in Claude directly."],
        ["How were these chosen?", `At least ${lib.threshold.toLocaleString("en-US")} views on the original post, a native video attached, and the creator stating it was made with Claude Opus 5.5, Sonnet 5.5 or Fable 5.5. Prompts are quoted verbatim with their source; every work belongs to its creator.`],
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
          url: `${SITE_URL}/${lang}/${LIB}/${x.id}`,
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
        { "@type": "ListItem", position: 2, name: isZh ? "Claude 5.5 提示词库" : "Claude 5.5 Prompt Library", item: `${SITE_URL}/${lang}/${LIB}` },
        { "@type": "ListItem", position: 3, name: c.title, item: `${SITE_URL}/${lang}/${PATH}` },
      ],
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <header className="mb-8">
        <nav className="text-xs text-gray-400 mb-2">
          <Link href={`/${lang}/${LIB}`} className="hover:text-[var(--primary)]">{isZh ? "提示词库" : "Prompt library"}</Link>
          <span className="mx-1.5">/</span>
          <span className="text-[var(--primary)] font-semibold">{isZh ? "动效设计" : "Motion graphics"}</span>
        </nav>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 text-balance">
          {isZh ? "Claude 动效提示词" : "Claude motion graphics prompts"}
        </h1>
        <p className="text-gray-600 max-w-3xl leading-relaxed">
          {isZh
            ? `${cases.length} 个用 Claude 做的动效设计作品，按原帖播放量排序，视频可以直接播放。其中 ${withPrompt} 个附作者公开的原文提示词。Claude 不直接生成视频，这些都是它写代码渲染出来的。`
            : `${cases.length} motion graphics made with Claude, ranked by views on the original post and playable here. ${withPrompt} include the creator's own prompt, verbatim. Claude doesn't generate video files; every piece was rendered from code it wrote.`}
        </p>
        <dl className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm">
          {[
            [isZh ? "动效作品" : "Works", cases.length.toLocaleString("en-US")],
            [isZh ? "带提示词" : "With prompt", withPrompt.toLocaleString("en-US")],
            [isZh ? "时长中位数" : "Median length", `${insights.durationMedian}s`],
            [isZh ? "最高播放" : "Top views", formatCount(insights.maxViews, lang)],
            [isZh ? "数据更新" : "Updated", lib.statsCheckedAt.slice(0, 10)],
          ].map(([k, v]) => (
            <div key={k} className="flex items-baseline gap-1.5">
              <dt className="text-gray-400">{k}</dt>
              <dd className="font-semibold text-gray-900 tabular-nums">{v}</dd>
            </div>
          ))}
        </dl>
      </header>

      <PromptLibraryClient
        initial={initial}
        total={cases.length}
        counts={{ motion: cases.length }}
        modelCounts={modelCounts}
        lang={lang}
        fresh={fresh}
        featured={featured}
        lockCategory="motion"
      />

      <InsightsSection ins={insights} lang={lang} scopeZh="动效类" scopeEn="motion graphics works" showCategory={false} />

      <section className="mt-14">
        <h2 className="text-xl font-bold text-gray-900 mb-5">{isZh ? "常见问题" : "FAQ"}</h2>
        <div className="space-y-4">
          {faqs.map(([q, a]) => (
            <details key={q} className="group rounded-xl border border-gray-100 bg-white p-4">
              <summary className="cursor-pointer font-medium text-gray-900">{q}</summary>
              <p className="mt-2 text-sm text-gray-600 leading-relaxed">{a}</p>
            </details>
          ))}
        </div>
      </section>

      <p className="mt-10 text-sm">
        <Link href={`/${lang}/${LIB}`} className="text-[var(--primary)] hover:underline">
          {isZh ? `← 看全部 ${lib.cases.length.toLocaleString("en-US")} 个作品（游戏、3D、讲解、产品广告…）` : `← All ${lib.cases.length.toLocaleString("en-US")} works (games, 3D, explainers, ads…)`}
        </Link>
      </p>
    </div>
  );
}
