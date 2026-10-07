import type { OpusCaseSlim, OpusCategory } from "@/lib/opus-prompts-shared";

/**
 * 「高播放作品的规律」：每次构建时从作品数据现算，库每天更新，数字跟着变。
 * 只写数据算得出来的东西（时长、分类、提示词、模型、工具）；画面节奏这类要看视频才知道的，不写。
 * 「出圈」= 播放量进全库前 10%。
 */
export interface OpusInsights {
  n: number;
  top10Views: number; // 进前 10% 的播放门槛
  durationMedian: number; // 秒
  /** 按时长分段：作品数、中位播放、进前 10% 的比例 */
  byDuration: { label: { zh: string; en: string }; n: number; medianViews: number; topRate: number }[];
  /** 进前 10% 比例最高的时长段 */
  bestDuration: { zh: string; en: string; topRate: number };
  shortest: { zh: string; en: string; topRate: number };
  prompt: { withN: number; withoutN: number; viewsWith: number; viewsWithout: number; savesWith: number; savesWithout: number };
  byCategory: { key: OpusCategory; n: number; medianViews: number; topRate: number }[];
  bestCategoryByRate: { key: OpusCategory; topRate: number };
  bestCategoryByMedian: { key: OpusCategory; medianViews: number };
  models: { key: string; n: number; medianViews: number; topCategory: OpusCategory; topCategoryN: number }[];
  tools: { name: string; n: number }[];
  maxViews: number;
}

const median = (a: number[]) => {
  if (!a.length) return 0;
  const s = [...a].sort((x, y) => x - y);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : Math.round((s[m - 1] + s[m]) / 2);
};

const BUCKETS: { lo: number; hi: number; zh: string; en: string }[] = [
  { lo: 0, hi: 15, zh: "15 秒以内", en: "≤15s" },
  { lo: 15, hi: 30, zh: "15–30 秒", en: "15–30s" },
  { lo: 30, hi: 60, zh: "30–60 秒", en: "30–60s" },
  { lo: 60, hi: 120, zh: "1–2 分钟", en: "1–2 min" },
  { lo: 120, hi: Infinity, zh: "2 分钟以上", en: ">2 min" },
];

/** threshold 传全库的前 10% 门槛，子集（如动效）也按全库口径算「出圈」 */
export function computeInsights(cases: OpusCaseSlim[], threshold?: number): OpusInsights {
  const views = cases.map((c) => c.stats.views).sort((a, b) => b - a);
  const top10Views = threshold ?? views[Math.max(0, Math.floor(cases.length * 0.1) - 1)] ?? 0;
  const isTop = (c: OpusCaseSlim) => c.stats.views >= top10Views;
  const rate = (g: OpusCaseSlim[]) => (g.length ? g.filter(isTop).length / g.length : 0);
  const dur = (c: OpusCaseSlim) => c.video?.durationSec || 0;

  const byDuration = BUCKETS.map((b) => {
    const g = cases.filter((c) => dur(c) > b.lo && dur(c) <= b.hi);
    return { label: { zh: b.zh, en: b.en }, n: g.length, medianViews: median(g.map((c) => c.stats.views)), topRate: rate(g) };
  }).filter((b) => b.n >= 10); // 样本太少的段不下结论
  const bestD = [...byDuration].sort((a, b) => b.topRate - a.topRate)[0];

  const withP = cases.filter((c) => c.prompt);
  const withoutP = cases.filter((c) => !c.prompt);

  const catKeys = [...new Set(cases.map((c) => c.category))];
  const byCategory = catKeys
    .map((key) => {
      const g = cases.filter((c) => c.category === key);
      return { key, n: g.length, medianViews: median(g.map((c) => c.stats.views)), topRate: rate(g) };
    })
    .filter((c) => c.n >= 20)
    .sort((a, b) => b.n - a.n);
  const byRate = [...byCategory].sort((a, b) => b.topRate - a.topRate)[0];
  const byMed = [...byCategory].sort((a, b) => b.medianViews - a.medianViews)[0];

  const models = ["opus-5.5", "sonnet-5.5", "fable-5.5"]
    .map((key) => {
      const g = cases.filter((c) => (c.models || ["opus-5.5"]).includes(key as never));
      const cc = new Map<OpusCategory, number>();
      for (const c of g) cc.set(c.category, (cc.get(c.category) || 0) + 1);
      const [topCategory, topCategoryN] = [...cc.entries()].sort((a, b) => b[1] - a[1])[0] || ["motion", 0];
      return { key, n: g.length, medianViews: median(g.map((c) => c.stats.views)), topCategory, topCategoryN };
    })
    .filter((m) => m.n >= 10);

  const tc = new Map<string, number>();
  for (const c of cases) for (const t of c.tools || []) tc.set(t, (tc.get(t) || 0) + 1);

  return {
    n: cases.length,
    top10Views,
    durationMedian: median(cases.map(dur)),
    byDuration,
    bestDuration: bestD ? { ...bestD.label, topRate: bestD.topRate } : { zh: "", en: "", topRate: 0 },
    shortest: byDuration[0] ? { ...byDuration[0].label, topRate: byDuration[0].topRate } : { zh: "", en: "", topRate: 0 },
    prompt: {
      withN: withP.length,
      withoutN: withoutP.length,
      viewsWith: median(withP.map((c) => c.stats.views)),
      viewsWithout: median(withoutP.map((c) => c.stats.views)),
      savesWith: median(withP.map((c) => c.stats.bookmarks)),
      savesWithout: median(withoutP.map((c) => c.stats.bookmarks)),
    },
    byCategory,
    bestCategoryByRate: byRate ? { key: byRate.key, topRate: byRate.topRate } : { key: "motion", topRate: 0 },
    bestCategoryByMedian: byMed ? { key: byMed.key, medianViews: byMed.medianViews } : { key: "motion", medianViews: 0 },
    models,
    tools: [...tc.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6).map(([name, n]) => ({ name, n })),
    maxViews: views[0] || 0,
  };
}
