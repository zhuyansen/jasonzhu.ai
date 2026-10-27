import type { Metadata } from "next";
import Link from "@/components/Link";
import type { Locale } from "@/lib/dictionaries";
import { getOpusLibrary } from "@/lib/opus-prompts";
import { formatCount, MODEL_PREVIEW, OPUS_CATEGORIES, type ClaudeModel, type OpusCaseSlim, type OpusCategory } from "@/lib/opus-prompts-shared";
import { computeInsights } from "@/lib/opus-insights";
import PromptLibraryClient from "../PromptLibraryClient";
import InsightsSection from "../InsightsSection";
import { withSocialCards } from "@/lib/social";

/**
 * Fable 5.5 落地页（2026-10-27）：「fable 5.5」在 GSC 28 天 228 次曝光、排名 5.6，但落在主库页、点击率 1.75%——
 * 搜的人要看 Fable，主库标题主打 Opus。这页只放 Fable 5.5 的作品，标题 / H1 / FAQ 对准「fable 5.5」「claude fable 5.5」
 * 「fable 5.5 release date」。发布状态那段跟着 MODEL_PREVIEW 走：官宣后去掉 MODEL_PREVIEW 里的 fable，状态说明自动消失，
 * 再把 STATUS_CHECKED 和文案改成正式发布的版本。
 */
const SITE_URL = "https://jasonzhu.ai";
const LIB = "prompts/claude-opus-5-5";
const PATH = `${LIB}/fable-5-5`;
const FIRST_PAGE = 24;
const MODEL: ClaudeModel = "fable-5.5";
/** 上一次人工核实 Anthropic 官方状态的日期（不跟库的每日更新走，免得看起来像每天都核实过） */
const STATUS_CHECKED = "2026-10-27";

function fableCases(): OpusCaseSlim[] {
  return getOpusLibrary().cases.filter((c) => (c.models || ["opus-5.5"]).includes(MODEL));
}

const copy = (isZh: boolean, n: number, withPrompt: number, preview: boolean) => ({
  title: isZh ? `Claude Fable 5.5 作品与提示词：${n} 个创作者实测案例${preview ? "（内测）" : ""}` : `Claude Fable 5.5: ${n} Real Examples and Prompts${preview ? " (Preview)" : ""}`,
  desc: isZh
    ? `${n} 个创作者说用 Claude Fable 5.5 做的视频、动效、3D 和游戏，原帖播放均过 5,000，可直接播放；其中 ${withPrompt} 个附作者公开的原文提示词。${preview ? `截至 ${STATUS_CHECKED}，Anthropic 尚未官宣 Fable 5.5，也没有公布发布日期。` : ""}`
    : `${n} videos, motion graphics, 3D scenes and games creators say they made with Claude Fable 5.5, each with 5,000+ views and playable here; ${withPrompt} include the creator's prompt, verbatim.${preview ? ` As of ${STATUS_CHECKED}, Anthropic has not announced Fable 5.5 or a release date.` : ""}`,
});

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang: rawLang } = await params;
  const lang = (rawLang === "en" ? "en" : "zh") as Locale;
  const cases = fableCases();
  const c = copy(lang === "zh", cases.length, cases.filter((x) => x.prompt).length, Boolean(MODEL_PREVIEW[MODEL]));
  return withSocialCards({
    title: c.title,
    description: c.desc,
    referrer: "no-referrer", // X 视频 CDN 拒绝带外站 Referer，和主库同样处理
    alternates: {
      canonical: `${SITE_URL}/${lang}/${PATH}`,
      languages: { zh: `${SITE_URL}/zh/${PATH}`, en: `${SITE_URL}/en/${PATH}`, "x-default": `${SITE_URL}/zh/${PATH}` },
    },
    openGraph: { type: "website", title: c.title, description: c.desc, url: `${SITE_URL}/${lang}/${PATH}` },
  }, rawLang);
}

export default async function FablePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: rawLang } = await params;
  const lang = (rawLang === "en" ? "en" : "zh") as Locale;
  const isZh = lang === "zh";
  const lib = getOpusLibrary();
  const cases = fableCases();
  const preview = Boolean(MODEL_PREVIEW[MODEL]);
  const withPrompt = cases.filter((x) => x.prompt).length;
  const c = copy(isZh, cases.length, withPrompt, preview);

  const byViews = [...cases].sort((a, b) => b.stats.views - a.stats.views);
  const initial = byViews.slice(0, FIRST_PAGE);
  const counts = cases.reduce((o, x) => ({ ...o, [x.category]: (o[x.category] || 0) + 1 }), {} as Partial<Record<OpusCategory, number>>);
  const modelCounts = { "opus-5.5": 0, "sonnet-5.5": 0, "haiku-5.5": 0, "fable-5.5": cases.length } as Record<ClaudeModel, number>;

  const refDay = new Date(lib.updatedAt.slice(0, 10) + "T00:00:00Z");
  const dayOffset = (n: number) => new Date(refDay.getTime() - n * 864e5).toISOString().slice(0, 10);
  const fresh = { weekStart: dayOffset(6), recentStart: dayOffset(2), weekCount: cases.filter((x) => (x.addedAt || "") >= dayOffset(6)).length };
  const featured = { title: { zh: "播放最高的 Fable 5.5 作品", en: "Most-viewed Fable 5.5 works" }, cases: byViews.slice(0, 3) };

  // 「出圈」按全库前 10% 的口径
  const all = lib.cases.map((x) => x.stats.views).sort((a, b) => b - a);
  const insights = computeInsights(cases, all[Math.max(0, Math.floor(all.length * 0.1) - 1)]);
  const topCats = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([k, n]) => {
    const cat = OPUS_CATEGORIES.find((x) => x.key === k);
    return isZh ? `${cat?.zh ?? k}（${n}）` : `${(cat?.en ?? k).toLowerCase()} (${n})`;
  });

  const faqs: [string, string][] = isZh
    ? [
        ["Fable 5.5 发布了吗？什么时候发布？", preview
          ? `截至 ${STATUS_CHECKED}，Anthropic 还没有官宣 Fable 5.5，也没有公布发布日期或模型 ID。网上流传的「发布日期」和「已上线」截图都没有得到官方确认。这里收的作品来自说自己拿到了内测资格的创作者，模型归属以作者自述为准，本站没有逐条复现。`
          : "Fable 5.5 已经正式发布，详见 Anthropic 官方公告。"],
        ["Fable 5.5 能做什么样的作品？", `这里 ${cases.length} 个作品里最多的是：${topCats.join("、")}。和 Opus / Sonnet 一样，它不直接生成视频文件，作品都是模型写代码渲染出来，或者驱动 Blender、After Effects 等软件做出来的。`],
        ["Fable 5.5 和 Opus 5.5 有什么区别？", "官方还没有公布 Fable 5.5 的能力说明，所以这里不做比较。想看同一个任务在不同模型上的效果，可以在提示词库里看「模型对比」分类，那些是创作者自己并排跑的结果。"],
        ["这些提示词能在 Opus 5.5 或 Sonnet 5.5 上用吗？", "可以试。提示词本身是普通的文字指令，复制后在任何 Claude 模型上都能跑，效果会有差别。页面上的「在 Claude 里试试」会带着提示词打开 Claude。"],
        ["收录标准是什么？", `原帖播放量至少 ${lib.threshold.toLocaleString("en-US")}、帖子里附原生视频、作者明确说是用 Fable 5.5 做的；作者自己写「可能是」「好像是」Fable 的不收。提示词一律原文照录、注明出处，作品版权归原作者。`],
      ]
    : [
        ["Has Fable 5.5 been released? When is the release date?", preview
          ? `As of ${STATUS_CHECKED}, Anthropic has not announced Fable 5.5 and has published no release date or model ID. Circulating "release dates" and "it's live" screenshots have not been confirmed by Anthropic. The works here come from creators who say they have preview access; model attribution is as stated by each creator and was not reproduced by us.`
          : "Fable 5.5 has been released; see Anthropic's announcement for details."],
        ["What can Fable 5.5 make?", `The most common kinds among the ${cases.length} works here: ${topCats.join(", ")}. Like Opus and Sonnet, it doesn't output video files; every piece was rendered from code it wrote, or made by driving tools such as Blender or After Effects.`],
        ["How is Fable 5.5 different from Opus 5.5?", "Anthropic hasn't published what Fable 5.5 can do, so we don't compare them here. For the same task run on several models, see the Comparisons category in the library: creators ran those side by side themselves."],
        ["Do these prompts work on Opus 5.5 or Sonnet 5.5?", "Yes, you can try them. A prompt is plain text instructions and runs on any Claude model, with different results. “Try in Claude” opens the prompt in Claude directly."],
        ["How were these chosen?", `At least ${lib.threshold.toLocaleString("en-US")} views on the original post, a native video attached, and the creator stating it was made with Fable 5.5; posts where the creator is unsure ("maybe Fable") are left out. Prompts are quoted verbatim with their source; every work belongs to its creator.`],
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
        itemListElement: initial.map((x, i) => ({ "@type": "ListItem", position: i + 1, url: `${SITE_URL}/${lang}/${LIB}/${x.id}`, name: isZh ? x.title.zh : x.title.en })),
      },
    },
    { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) },
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
          <span className="text-[var(--primary)] font-semibold">Fable 5.5</span>
        </nav>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 text-balance">
          {isZh ? "Claude Fable 5.5 作品与提示词" : "Claude Fable 5.5 examples and prompts"}
        </h1>
        <p className="text-gray-600 max-w-3xl leading-relaxed">
          {isZh
            ? `${cases.length} 个创作者说用 Claude Fable 5.5 做的作品，按原帖播放量排序，视频可以直接播放。其中 ${withPrompt} 个附作者公开的原文提示词。`
            : `${cases.length} works creators say they made with Claude Fable 5.5, ranked by views on the original post and playable here. ${withPrompt} include the creator's own prompt, verbatim.`}
        </p>
        {preview && (
          <p className="mt-4 max-w-3xl rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 leading-relaxed">
            {isZh
              ? `发布状态：截至 ${STATUS_CHECKED}，Anthropic 还没有官宣 Fable 5.5，也没有公布发布日期。这些作品来自说自己拿到内测资格的创作者，模型归属以作者自述为准。`
              : `Release status: as of ${STATUS_CHECKED}, Anthropic has not announced Fable 5.5 or a release date. These works come from creators who say they have preview access; attribution is as each creator states it.`}
          </p>
        )}
        <dl className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm">
          {[
            [isZh ? "Fable 5.5 作品" : "Works", cases.length.toLocaleString("en-US")],
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
        counts={counts}
        modelCounts={modelCounts}
        lang={lang}
        fresh={fresh}
        featured={featured}
        lockModel={MODEL}
      />

      <InsightsSection ins={insights} lang={lang} scopeZh="Fable 5.5" scopeEn="Fable 5.5 works" />

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
          {isZh ? `← 看全部 ${lib.cases.length.toLocaleString("en-US")} 个作品（Opus、Sonnet、Haiku、Fable）` : `← All ${lib.cases.length.toLocaleString("en-US")} works (Opus, Sonnet, Haiku, Fable)`}
        </Link>
      </p>
    </div>
  );
}
