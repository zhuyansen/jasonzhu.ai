import { categoryLabel, formatCount, MODEL_LABEL, type ClaudeModel } from "@/lib/opus-prompts-shared";
import type { OpusInsights } from "@/lib/opus-insights";

const pct = (x: number) => `${Math.round(x * 100)}%`;

/** 「高播放作品的规律」：数字全部来自 computeInsights（构建时现算），文案只陈述数据支持的结论 */
export default function InsightsSection({ ins, lang, scopeZh, scopeEn, showCategory = true }: { ins: OpusInsights; lang: string; scopeZh: string; scopeEn: string; showCategory?: boolean }) {
  const isZh = lang === "zh";
  const promptLiftViews = ins.prompt.viewsWithout ? ins.prompt.viewsWith / ins.prompt.viewsWithout - 1 : 0;
  const promptLiftSaves = ins.prompt.savesWithout ? ins.prompt.savesWith / ins.prompt.savesWithout - 1 : 0;
  const maxBar = Math.max(...ins.byDuration.map((b) => b.topRate), 0.0001);

  const allCards: { kind?: string; big: string; title: string; body: string }[] = [
    {
      big: pct(ins.bestDuration.topRate),
      title: isZh ? `${ins.bestDuration.zh}的作品最容易出圈` : `${ins.bestDuration.en} videos break out most often`,
      body: isZh
        ? `${ins.bestDuration.zh}的作品里，${pct(ins.bestDuration.topRate)} 播放量进了前 10%；${ins.shortest.zh}的是 ${pct(ins.shortest.topRate)}。全部作品时长中位数 ${ins.durationMedian} 秒。`
        : `${pct(ins.bestDuration.topRate)} of ${ins.bestDuration.en} videos reached the top 10% by views, vs ${pct(ins.shortest.topRate)} for ${ins.shortest.en}. Median length: ${ins.durationMedian}s.`,
    },
    {
      big: promptLiftViews > 0 ? `+${pct(promptLiftViews)}` : pct(promptLiftViews),
      title: isZh ? "公开提示词的作品播放更高" : "Works that share the prompt get more views",
      body: isZh
        ? `${ins.prompt.withN} 个带提示词的作品，中位播放 ${formatCount(ins.prompt.viewsWith, lang)}，不带的是 ${formatCount(ins.prompt.viewsWithout, lang)}；中位收藏高 ${pct(promptLiftSaves)}。这是相关，不代表公开提示词导致了高播放。`
        : `Median views ${formatCount(ins.prompt.viewsWith, lang)} for the ${ins.prompt.withN} works with a prompt vs ${formatCount(ins.prompt.viewsWithout, lang)} without, and ${pct(promptLiftSaves)} more saves. Correlation, not causation.`,
    },
    {
      kind: "category",
      big: pct(ins.bestCategoryByRate.topRate),
      title: isZh ? `${categoryLabel(ins.bestCategoryByRate.key, lang)}最容易爆` : `${categoryLabel(ins.bestCategoryByRate.key, lang)} break out most`,
      body: isZh
        ? `${categoryLabel(ins.bestCategoryByRate.key, lang)}类作品 ${pct(ins.bestCategoryByRate.topRate)} 进了播放前 10%，比例最高；中位播放最高的是${categoryLabel(ins.bestCategoryByMedian.key, lang)}（${formatCount(ins.bestCategoryByMedian.medianViews, lang)}）。`
        : `${pct(ins.bestCategoryByRate.topRate)} of ${categoryLabel(ins.bestCategoryByRate.key, lang).toLowerCase()} reached the top 10%, the highest rate. ${categoryLabel(ins.bestCategoryByMedian.key, lang)} have the highest median views (${formatCount(ins.bestCategoryByMedian.medianViews, lang)}).`,
    },
    {
      big: ins.tools[0] ? String(ins.tools[0].n) : "—",
      title: isZh ? `最常一起用的工具是 ${ins.tools[0]?.name ?? "—"}` : `${ins.tools[0]?.name ?? "—"} is the most-paired tool`,
      body: isZh
        ? `创作者标注的配套工具里排前几位的是 ${ins.tools.slice(0, 5).map((t) => `${t.name}（${t.n}）`).join("、")}。`
        : `Top tools creators paired with Claude: ${ins.tools.slice(0, 5).map((t) => `${t.name} (${t.n})`).join(", ")}.`,
    },
  ];

  // 单一分类的落地页（如动效）没有「哪类最容易爆」可比，去掉这张
  const cards = allCards.filter((c) => showCategory || c.kind !== "category");

  return (
    <section id="insights" className="mt-16 scroll-mt-20">
      <h2 className="text-xl font-bold text-gray-900 mb-1">{isZh ? "高播放作品的规律" : "What the most-viewed works have in common"}</h2>
      <p className="text-sm text-gray-500 mb-6">
        {isZh
          ? `基于${scopeZh} ${ins.n.toLocaleString("en-US")} 个作品的原帖数据；「出圈」指播放量进全库前 10%（≥ ${formatCount(ins.top10Views, lang)}）。`
          : `Based on post data from ${ins.n.toLocaleString("en-US")} ${scopeEn}. "Breaking out" means reaching the library's top 10% by views (≥ ${formatCount(ins.top10Views, lang)}).`}
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        {cards.map((c) => (
          <div key={c.title} className="rounded-xl border border-gray-100 bg-white p-5">
            <div className="text-3xl font-bold text-[var(--primary)] tabular-nums">{c.big}</div>
            <h3 className="mt-1 font-semibold text-gray-900">{c.title}</h3>
            <p className="mt-1.5 text-sm text-gray-600 leading-relaxed">{c.body}</p>
          </div>
        ))}
      </div>

      {/* 时长分段：进前 10% 的比例 */}
      <div className="mt-6 rounded-xl border border-gray-100 bg-white p-5">
        <h3 className="font-semibold text-gray-900 mb-3 text-sm">{isZh ? "不同时长进入播放前 10% 的比例" : "Share reaching the top 10%, by length"}</h3>
        <div className="space-y-2">
          {ins.byDuration.map((b) => (
            <div key={b.label.en} className="grid grid-cols-[5.5rem_1fr_3rem] sm:grid-cols-[7rem_1fr_7rem] items-center gap-3 text-xs">
              <span className="text-gray-600">{isZh ? b.label.zh : b.label.en}</span>
              <span className="h-2.5 rounded-full bg-gray-100 overflow-hidden">
                <span className="block h-full rounded-full bg-[var(--primary)]" style={{ width: `${(b.topRate / maxBar) * 100}%` }} />
              </span>
              <span className="text-gray-500 tabular-nums text-right">
                {pct(b.topRate)}
                <span className="hidden sm:inline text-gray-400"> · {b.n}{isZh ? " 个" : ""}</span>
              </span>
            </div>
          ))}
        </div>
      </div>

      {ins.models.length > 1 && (
        <p className="mt-4 text-sm text-gray-600">
          {isZh ? "模型分工：" : "By model: "}
          {ins.models
            .map((m) =>
              isZh
                ? `${MODEL_LABEL[m.key as ClaudeModel]} ${m.n} 个，最多的是${categoryLabel(m.topCategory, lang)}（${m.topCategoryN}）`
                : `${MODEL_LABEL[m.key as ClaudeModel]} ${m.n} works, mostly ${categoryLabel(m.topCategory, lang).toLowerCase()} (${m.topCategoryN})`
            )
            .join(isZh ? "；" : "; ")}
          {isZh ? "。" : "."}
        </p>
      )}
    </section>
  );
}
