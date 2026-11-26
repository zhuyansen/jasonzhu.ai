// /research/ai-crawlers 的图：服务端组件，纯 HTML/CSS，不加图表库、不发客户端 JS。
// 规格照 dataviz：柱子不超过 24px、相邻柱子和堆叠段之间 2px 白缝、柱顶 4px 圆角（底部方角）、细灰网格线；
// 两个以上系列一定有图例；每张图下面都有表格视图（悬停只用原生 title，数字不靠悬停才能看到）。
import {
  AI_TYPES,
  TYPE_COLOR,
  TYPE_LABEL,
  fmt,
  fmtDay,
  type Cell,
  type DayRow,
  type Lang,
} from "@/lib/ai-crawler-stats";

const PLOT_H = 200; // 柱区高度（px），桌面和手机一样，x 轴标签在柱区外面
const GAP = 2;

function niceStep(raw: number): number {
  const pow = 10 ** Math.floor(Math.log10(Math.max(raw, 1)));
  for (const m of [1, 2, 2.5, 5, 10]) if (m * pow >= raw) return m * pow;
  return 10 * pow;
}

export function TypeLegend({ lang, totals }: { lang: Lang; totals?: Record<string, number> }) {
  return (
    <ul className="flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-gray-700 mb-3">
      {AI_TYPES.map((t) => (
        <li key={t} className="inline-flex items-center gap-1.5">
          <span aria-hidden className="inline-block w-2.5 h-2.5 rounded-sm" style={{ background: TYPE_COLOR[t] }} />
          {TYPE_LABEL[t][lang]}
          {totals && <span className="text-gray-500 tabular-nums">{fmt(totals[t])}</span>}
        </li>
      ))}
    </ul>
  );
}

/** 每天三类 AI 爬虫的请求数，堆叠柱（下 → 上：AI 搜索、训练、用户触发）。不完整的天半透明，注在图下。 */
export function DailyChart({ days, lang }: { days: DayRow[]; lang: Lang }) {
  const isEn = lang === "en";
  const totals = days.map((d) => AI_TYPES.reduce((s, t) => s + d[t], 0));
  const max = Math.max(...totals, 1);
  const step = niceStep(max / 3);
  const top = Math.ceil(max / step) * step;
  const ticks = Array.from({ length: Math.round(top / step) + 1 }, (_, i) => i * step);
  const peak = totals.indexOf(max);
  const px = (v: number) => (v / top) * PLOT_H;
  const label = isEn
    ? `Daily AI crawler requests, ${fmtDay(days[0].date, "en")} to ${fmtDay(days[days.length - 1].date, "en")}. Peak ${fmt(max)} on ${fmtDay(days[peak].date, "en")}.`
    : `每天 AI 爬虫请求数，${fmtDay(days[0].date, "zh")}至${fmtDay(days[days.length - 1].date, "zh", false)}，最多一天 ${fmt(max)} 次（${fmtDay(days[peak].date, "zh", false)}）。`;

  return (
    <figure role="img" aria-label={label} className="m-0">
      <div className="flex">
        {/* y 轴刻度 */}
        <div className="relative w-11 shrink-0 text-[11px] text-gray-500 tabular-nums" style={{ height: PLOT_H }}>
          {ticks.map((t) => (
            <span key={t} className="absolute right-1.5 leading-none" style={{ bottom: px(t), transform: "translateY(50%)" }}>
              {fmt(t)}
            </span>
          ))}
        </div>
        {/* 柱区 */}
        <div className="relative flex-1 min-w-0" style={{ height: PLOT_H }}>
          {ticks.map((t) => (
            <div
              key={t}
              aria-hidden
              className={`absolute inset-x-0 ${t === 0 ? "border-t border-gray-300" : "border-t border-gray-100"}`}
              style={{ bottom: px(t) }}
            />
          ))}
          <div className="absolute inset-0 flex items-end" style={{ gap: GAP }}>
            {days.map((d, i) => {
              const partial = d.coverage !== "full";
              const segs: { t: (typeof AI_TYPES)[number]; v: number }[] = AI_TYPES.map((t) => ({ t, v: d[t] })).filter((s) => s.v > 0);
              let bottom = 0;
              const tip = `${fmtDay(d.date, lang)}${partial ? (isEn ? " (partial day)" : "（不完整的一天）") : ""}: ${fmt(totals[i])} ${
                isEn ? "AI crawler requests" : "次 AI 爬虫请求"
              } · ${AI_TYPES.map((t) => `${TYPE_LABEL[t][lang]} ${fmt(d[t])}`).join(" · ")}`;
              return (
                <div key={d.date} title={tip} className="relative flex-1 h-full min-w-0">
                  <div className="relative h-full mx-auto w-full max-w-[24px]">
                    {segs.map((s, j) => {
                      const h = px(s.v);
                      const isTop = j === segs.length - 1;
                      const el = (
                        <div
                          key={s.t}
                          className="absolute inset-x-0"
                          style={{
                            bottom,
                            height: Math.max(isTop || h <= GAP * 2 ? h : h - GAP, 0.5),
                            background: TYPE_COLOR[s.t],
                            opacity: partial ? 0.45 : 1,
                            borderTopLeftRadius: isTop ? 4 : 0,
                            borderTopRightRadius: isTop ? 4 : 0,
                          }}
                        />
                      );
                      bottom += h;
                      return el;
                    })}
                    {i === peak && (
                      <span
                        className="absolute left-1/2 -translate-x-1/2 text-[11px] text-gray-700 tabular-nums whitespace-nowrap"
                        style={{ bottom: px(totals[i]) + 4 }}
                      >
                        {fmt(max)}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      {/* x 轴：每 7 天标一次 */}
      <div className="flex mt-1.5">
        <div className="w-11 shrink-0" />
        <div className="flex flex-1 min-w-0" style={{ gap: GAP }}>
          {days.map((d, i) => (
            <div key={d.date} className="relative flex-1 min-w-0 h-4">
              {i % 7 === 0 && (
                <span className="absolute left-1/2 -translate-x-1/2 text-[11px] text-gray-500 whitespace-nowrap">
                  {fmtDay(d.date, lang, false)}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </figure>
  );
}

/** 表格里的横条：长度按本列最大值，颜色是这一行的类型色（类型另有文字列，不只靠颜色）。数据端 4px 圆角。 */
export function InlineBar({ value, max, color }: { value: number; max: number; color: string }) {
  const w = max ? (value / max) * 100 : 0;
  return (
    <div aria-hidden className="h-2 w-full min-w-[64px]">
      {value > 0 && (
        <div className="h-2 rounded-r-[4px]" style={{ width: `max(${w}%, 2px)`, background: color }} />
      )}
    </div>
  );
}

/** 引用率和 95% 区间：0–100% 的灰轨，浅蓝是区间，深蓝点是命中率（带 2px 白圈） */
export function CiBar({ cell }: { cell: Cell }) {
  const [lo, hi] = cell.ci_pct;
  const p = (cell.hits / cell.answers) * 100;
  return (
    <div aria-hidden className="relative h-3 w-full min-w-[96px]">
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-1 rounded-full bg-gray-100" />
      <div
        className="absolute top-1/2 -translate-y-1/2 h-1.5 rounded-full"
        style={{ left: `${lo}%`, width: `max(${hi - lo}%, 2px)`, background: "#9ec5f4" }}
      />
      <div
        className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full ring-2 ring-white"
        style={{ left: `${p}%`, background: "#2a78d6" }}
      />
    </div>
  );
}
