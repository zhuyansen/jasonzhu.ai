// 出海专题「增长」一步里篇幅最大的四块（2026-11-21 从首页拆出去，各自一页）：
// 六大流派地图 → /go-global/seo-geo-schools，水系模型 → /go-global/seo-water-model，
// 全栈工具清单和二虎的 11 份数据 → /go-global/growth-stack。首页只留入口卡片（卡片保留旧锚点 id）。
import {
  ERHU_GROWTH_DATA_11,
  GO_GLOBAL_ARSENAL_2026,
  MY_POSTS,
  OFFICIAL_TOOLS_2026,
  SEO_SCHOOLS_MAP,
  SEO_WATER_SYSTEM_V8,
} from "@/lib/go-global";
import { BOX, FromMyPost, OUT, hl } from "./ui";

// 全球 SEO / GEO 六大实战流派地图与去伪存真指南（含 2D 坐标图 + 6 层检索链路 + 35 位实战派代表与官方红线校准）
export function SeoSchoolsMap({ l, isZh }: { l: "zh" | "en"; isZh: boolean }) {
  const m = SEO_SCHOOLS_MAP;
  const totalPeople = m.schools.reduce((acc, s) => acc + s.people.length, 0);
  const dotColors: Record<string, string> = {
    blue: "bg-blue-600 text-white border-blue-700",
    indigo: "bg-indigo-600 text-white border-indigo-700",
    emerald: "bg-emerald-600 text-white border-emerald-700",
    amber: "bg-amber-600 text-white border-amber-700",
    purple: "bg-purple-600 text-white border-purple-700",
    rose: "bg-rose-600 text-white border-rose-700",
  };
  const badgeColors: Record<string, string> = {
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    indigo: "bg-indigo-50 text-indigo-700 border-indigo-200",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
    amber: "bg-amber-50 text-amber-800 border-amber-200",
    purple: "bg-purple-50 text-purple-700 border-purple-200",
    rose: "bg-rose-50 text-rose-700 border-rose-200",
  };

  return (
    <div id="seo-schools-map" className={`${BOX} mb-3 scroll-mt-24`}>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <h2 className="text-base font-semibold text-gray-900">
          {isZh ? "全球 SEO / GEO 六大实战流派地图与去伪存真指南" : "The 6 SEO & GEO Practitioner Schools: Map & Fact-Check Guide"}
        </h2>
        <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-medium">
          {isZh ? `6 大流派 · ${totalPeople} 位海内外实战派代表` : `6 schools · ${totalPeople} hands-on practitioners`}
        </span>
      </div>
      <p className="text-sm text-gray-600 leading-relaxed mb-4">{m.intro[l]}</p>

      {/* 2D 视觉坐标图（横轴：站内产品/技术 ↔ 站外评测/外链共识；纵轴：长期白帽复利 ↔ 算法实验/灰帽红队） */}
      <div className="rounded-2xl border border-gray-200 bg-gradient-to-b from-slate-50 to-white p-3.5 sm:p-4 mb-4">
        <div className="text-center text-xs font-semibold text-emerald-700 mb-2">{m.axes.yTop[l]}</div>
        <div className="relative w-full h-80 sm:h-96 rounded-xl border border-gray-200 bg-white overflow-hidden">
          {/* 象限底色与十字中轴线 */}
          <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 pointer-events-none">
            <div className="border-r border-b border-dashed border-gray-200 bg-blue-50/25 p-2">
              <span className="text-[11px] font-medium text-blue-700/80">
                {isZh ? "左上：站内产品资产 × 长期复利" : "Top-Left: On-site product moat"}
              </span>
            </div>
            <div className="border-b border-dashed border-gray-200 bg-amber-50/25 p-2 text-right">
              <span className="text-[11px] font-medium text-amber-800/80">
                {isZh ? "右上：站外评测共识 × 长期品牌权威" : "Top-Right: Off-site consensus & brand proof"}
              </span>
            </div>
            <div className="border-r border-dashed border-gray-200 bg-emerald-50/20 p-2 flex items-end">
              <span className="text-[11px] font-medium text-emerald-800/80">
                {isZh ? "左下：页面数学位置 × RAG 切片控制变量" : "Bottom-Left: On-page math & RAG chunking"}
              </span>
            </div>
            <div className="bg-rose-50/25 p-2 flex items-end justify-end">
              <span className="text-[11px] font-medium text-rose-700/80">
                {isZh ? "右下：算法漏洞红队 × 老域名/站群压力测试" : "Bottom-Right: Red-team stress tests & grey-hat"}
              </span>
            </div>
          </div>

          {/* 坐标节点 */}
          {m.schools.map((s) => {
            const topNames = s.people.slice(0, 4).map((p) => (l === "en" && p.nameEn ? p.nameEn : p.name).split("（")[0]).join(" / ");
            const moreCount = s.people.length - 4;
            return (
              <a
                key={s.id}
                href={`#school-${s.id}`}
                style={{ left: `${s.x}%`, top: `${s.y}%` }}
                className="group absolute -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center text-center focus:outline-none"
              >
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold shadow-sm border transition-transform group-hover:scale-105 ${dotColors[s.color]}`}
                >
                  <span>{s.num}</span>
                  <span className="whitespace-nowrap">{s.badge[l]}</span>
                </span>
                <span className="mt-1 px-2 py-0.5 rounded bg-white/95 border border-gray-200 text-[11px] text-gray-700 shadow-2xs whitespace-nowrap max-w-[165px] sm:max-w-[320px] truncate">
                  {topNames}
                  {moreCount > 0 ? (isZh ? ` 等 ${s.people.length} 人` : ` +${moreCount}`) : ""}
                </span>
              </a>
            );
          })}
        </div>
        <div className="flex items-center justify-between text-xs font-medium text-gray-600 mt-2 px-1">
          <span>{m.axes.xLeft[l]}</span>
          <span>{m.axes.xRight[l]}</span>
        </div>
        <div className="text-center text-xs font-semibold text-rose-700 mt-1">{m.axes.yBottom[l]}</div>
      </div>

      {/* 6 大流派在搜索与 AI 检索全链路上的分工条 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mb-4">
        {m.schools.map((s) => (
          <a
            key={s.id}
            href={`#school-${s.id}`}
            className={`rounded-xl border px-2.5 py-2 text-xs transition-colors hover:opacity-90 ${badgeColors[s.color]}`}
          >
            <p className="font-semibold truncate">
              {s.num} {s.badge[l]}
            </p>
            <p className="text-[11px] opacity-85 mt-0.5 line-clamp-2">{s.layer[l]}</p>
          </a>
        ))}
      </div>

      {/* 六大流派逐一拆解卡片 */}
      <div className="space-y-3">
        {m.schools.map((s) => (
          <div key={s.id} id={`school-${s.id}`} className="rounded-xl border border-gray-200 bg-gray-50/70 p-3.5 sm:p-4 scroll-mt-24">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <h3 className="text-sm font-semibold text-gray-900">
                <span className="mr-1.5">{s.num}</span>
                {s.name[l]}
              </h3>
              <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${badgeColors[s.color]}`}>{s.layer[l]}</span>
            </div>

            {/* 代表人物链接 */}
            <div className="flex flex-wrap gap-1.5 mb-2.5">
              {s.people.map((p) => {
                const chip = "inline-flex items-center gap-1 rounded-lg bg-white border border-gray-200 px-2.5 py-1 text-xs text-gray-800";
                const inner = (
                  <>
                    <span className={`font-semibold ${p.url ? "text-blue-600" : "text-gray-900"}`}>{l === "en" && p.nameEn ? p.nameEn : p.name}</span>
                    {p.handle && <span className="text-gray-400 font-mono text-[11px]">{p.handle}</span>}
                    <span className="text-gray-400">·</span>
                    <span className="text-gray-600">{p.role[l]}</span>
                  </>
                );
                return p.url ? (
                  <a key={p.name} href={p.url} {...OUT} className={`${chip} hover:border-blue-300 hover:text-blue-600 transition-colors`}>
                    {inner}
                  </a>
                ) : (
                  <span key={p.name} className={chip}>
                    {inner}
                  </span>
                );
              })}
            </div>

            <div className="space-y-2 text-sm leading-relaxed">
              <p className="text-gray-700">
                <span className="font-semibold text-gray-900">{isZh ? "核心主张：" : "Core thesis: "}</span>
                {s.core[l]}
              </p>
              <p className="text-gray-700">
                <span className="font-semibold text-emerald-700">{isZh ? "可直接拿来用：" : "What to borrow: "}</span>
                {s.borrow[l]}
              </p>
              <p className="rounded-lg border border-amber-200 bg-amber-50/70 px-3 py-2 text-xs text-gray-700 leading-relaxed">
                {s.caveat[l]}
                {s.caveat.link && (
                  <>
                    {" "}
                    <a href={hl(s.caveat.link.url, l)} {...OUT} className="font-medium text-blue-600 hover:underline">
                      {s.caveat.link.label[l]} →
                    </a>
                  </>
                )}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// 页面优化：GSC 气泡图四象限（Jesse Lau 的帖子 + Google 官方教程），加同一栏目的两篇官方文档
// 增长这一步的总框架：Jason 的「通用 SEO 水系模型 v8」（14 个构件按水流顺序 1–14 + 六层水表 + 六道放水闸门 + Jason 6 条排名理论；v9 的条目待验证）
export function SeoSystem({ l, isZh }: { l: "zh" | "en"; isZh: boolean }) {
  const w = SEO_WATER_SYSTEM_V8;
  const byId = new Map(w.components.map((c) => [c.id, c]));
  const badgeBase = "inline-flex items-center justify-center min-w-[1.5rem] px-1 py-0.5 rounded text-white font-mono text-[11px]";
  const badge = `${badgeBase} bg-blue-600`;
  return (
    <div id="seo-water-model-v8" className={`${BOX} mb-3 scroll-mt-24`}>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
        <h2 className="text-base font-semibold text-gray-900">
          {isZh
            ? "SEO 系统：通用 SEO 水系模型 v8（14 个构件 · 6 层水表 · 6 道放水闸门）"
            : "The SEO System: Water System Model v8 (14 Components · 6-Layer Meters · 6 Release Gates)"}
        </h2>
        <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-medium">
          {isZh ? "v8 已验证 · v9 待验证" : "v8 tested · v9 pending"}
        </span>
      </div>
      <p className="text-sm text-gray-600 leading-relaxed mb-3">{w.lead[l]}</p>

      {/* 流向图：按水流分 5 段，点编号跳到下面的构件卡片 */}
      <div className="mb-3 rounded-xl border border-sky-200 bg-sky-50/60 p-3">
        <ol className="grid gap-4 md:grid-cols-5 md:gap-3">
          {w.flow.map((f, i) => (
            <li key={f.stage.en} className="relative rounded-lg border border-sky-100 bg-white p-2.5">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-sky-700 mb-1.5">{f.stage[l]}</p>
              <ul className="space-y-1">
                {f.ids.map((id) => (
                  <li key={id}>
                    <a href={`#water-${id}`} className="flex items-start gap-1.5 text-xs text-gray-800 hover:text-blue-600">
                      <span className={badge}>{id}</span>
                      <span className="leading-snug">{byId.get(id)?.name[l]}</span>
                    </a>
                  </li>
                ))}
              </ul>
              {i < w.flow.length - 1 && (
                <span aria-hidden className="absolute text-sky-400 font-bold left-1/2 -translate-x-1/2 -bottom-4 md:left-auto md:translate-x-0 md:-right-3 md:bottom-auto md:top-1/2 md:-translate-y-1/2">
                  <span className="md:hidden">↓</span>
                  <span className="hidden md:inline">→</span>
                </span>
              )}
            </li>
          ))}
        </ol>
        <p className="mt-2.5 text-xs text-sky-900 leading-relaxed">↺ {w.flowLoop[l]}</p>
      </div>

      {/* 14 个构件，按水流顺序 1–14 */}
      <div className="grid gap-2 sm:grid-cols-2 mb-3">
        {w.components.map((c) => (
          <div key={c.id} id={`water-${c.id}`} className="scroll-mt-24 rounded-xl border border-gray-200 bg-gray-50/80 p-3 text-xs leading-relaxed">
            <div className="flex flex-wrap items-center justify-between gap-1.5 mb-1">
              <p className="font-semibold text-gray-900">
                <span className={`${badge} mr-1.5`}>{c.id}</span>
                {c.name[l]}
              </p>
              <span className="text-[11px] px-1.5 py-0.5 rounded bg-white border border-gray-200 text-gray-500 font-mono">
                {c.tag} · {c.who[l]}
              </span>
            </div>
            <p className="text-gray-700">{c.rule[l]}</p>
            <p className="mt-1.5 text-[11px] text-emerald-800 font-medium">
              {isZh ? "📊 水位表指标：" : "📊 Water meter: "}
              <span className="font-normal text-gray-600">{c.meter[l]}</span>
            </p>
          </div>
        ))}
      </div>

      {/* v8 的六道放水闸门 + Jason 的 6 条排名理论 */}
      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-3 text-xs leading-relaxed">
          <p className="font-semibold text-gray-900 mb-1.5">
            {isZh
              ? "🚧 v8 六道放水闸门（看到信号再做下一步）"
              : "🚧 v8's 6 Release Gates (Wait for the signal before the next step)"}
          </p>
          <ul className="space-y-1 text-gray-700 list-disc pl-4">
            {w.gatesV8[l].map((g) => (
              <li key={g}>{g}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-blue-200 bg-blue-50/40 p-3 text-xs leading-relaxed">
          <p className="font-semibold text-gray-900 mb-1.5">
            {isZh
              ? `🧭 Jason 的 6 条排名与声量定律（${w.rankingTheory.date}）`
              : `🧭 Jason's 6 Ranking & Social-Vote Laws (${w.rankingTheory.date})`}
          </p>
          <ol className="space-y-1 text-gray-700 list-decimal pl-4">
            {w.rankingTheory[l].map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ol>
        </div>
      </div>

      {/* 待验证：v9 候选，转正标准写在 rule 里 */}
      <div className="mt-3 rounded-xl border border-dashed border-gray-300 bg-white p-3 text-xs leading-relaxed">
        <p className="font-semibold text-gray-900 mb-1">
          {isZh ? `🧪 待验证（v9 候选，${w.pending.date} 降级）` : `🧪 Pending (v9 candidates, moved here on ${w.pending.date})`}
        </p>
        <p className="text-gray-600 mb-2">{w.pending.rule[l]}</p>
        <ul className="space-y-1.5">
          {w.pending.items.map((item) => (
            <li key={item.en} className="flex items-start gap-1.5 text-gray-700">
              <span className={`${badgeBase} bg-gray-400 shrink-0`}>{item.id}</span>
              <span className="flex-1">{item[l]}</span>
              <span className="shrink-0 text-[11px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">{item.status[l]}</span>
            </li>
          ))}
        </ul>
        <p className="mt-2 text-gray-500">{w.pending.removed[l]}</p>
      </div>

      <p className="mt-3 text-[11px] text-gray-500 leading-relaxed">
        {isZh ? "旧编号对照（2026-11-21 起按水流顺序编号）：" : "Old numbers (renumbered in flow order on Nov 21, 2026): "}
        {w.renumber.map(([n, o]) => `${n} = ${o}`).join(isZh ? "，" : ", ")}
      </p>
      <p className="mt-1 text-[11px] text-gray-500 leading-relaxed">{w.corrections[l]}</p>

      <FromMyPost post={MY_POSTS.seoSystem} lang={l} />
    </div>
  );
}

// 二虎分享的「想让 AI 帮你做增长决策，先把这 11 份数据配齐」（模型不缺智商，缺的是数据）
export function ErhuGrowthData11({ l, isZh }: { l: "zh" | "en"; isZh: boolean }) {
  const d = ERHU_GROWTH_DATA_11;
  const badgeColors: Record<string, string> = {
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
    amber: "bg-amber-50 text-amber-800 border-amber-200",
    purple: "bg-purple-50 text-purple-700 border-purple-200",
  };
  return (
    <div id="ai-growth-data-11" className={`mt-3 ${BOX} scroll-mt-24`}>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
        <h2 className="text-base font-semibold text-gray-900">
          {isZh
            ? "让 AI 帮你做增长决策：先把这 11 份全链路数据配齐（二虎）"
            : "For AI Growth Decisions: Assemble These 11 Full-Funnel Data Feeds First (Erhu)"}
        </h2>
        <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 font-medium">
          {isZh ? "模型不缺智商，缺的是数据" : "Models don't lack IQ; they lack data"}
        </span>
      </div>
      <p className="text-sm text-gray-600 leading-relaxed mb-3">{d.lead[l]}</p>
      <div className="space-y-3">
        {d.groups.map((g) => (
          <div key={g.badge.en} className="rounded-xl border border-gray-200 bg-gray-50/70 p-3">
            <span className={`inline-block text-xs px-2.5 py-0.5 rounded-full border font-medium mb-2 ${badgeColors[g.color]}`}>
              {g.badge[l]}
            </span>
            <div className="grid gap-2 sm:grid-cols-2">
              {g.items.map((item) => (
                <div
                  key={item.num}
                  className={`rounded-lg border border-gray-200 bg-white p-2.5 text-xs leading-relaxed ${
                    g.items.length === 1 ? "sm:col-span-2" : ""
                  }`}
                >
                  <p className="font-semibold text-gray-900">
                    <span className="mr-1">{item.num}</span>
                    {item.name[l]}
                    <span className="ml-1.5 font-mono text-[11px] font-normal text-blue-600">{l === "en" && "toolsEn" in item && item.toolsEn ? item.toolsEn : item.tools}</span>
                  </p>
                  <p className="text-gray-600 mt-0.5">{item.desc[l]}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// 2026 出海全栈军火库总表：按 6 大环节（选品、建站、收款、技术 SEO、外链与 GEO、监控）列出「主力保留 / 新晋补位 / 降级淘汰」
export function ArsenalMatrix({ l, isZh }: { l: "zh" | "en"; isZh: boolean }) {
  const a = GO_GLOBAL_ARSENAL_2026;
  return (
    <div id="go-global-arsenal-2026" className={`mt-3 ${BOX} scroll-mt-24`}>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
        <h2 className="text-base font-semibold text-gray-900">
          {isZh
            ? "⚔️ 2026 出海全栈军火库总盘点：主力保留 · 新晋补位 · 优胜劣汰"
            : "⚔️ 2026 Go-Global Full-Stack Arsenal: Keep · Fill Gaps · Retire"}
        </h2>
        <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-medium">
          {isZh ? "6 大环节精简矩阵（2026-11 最新盘点）" : "6-Stage Consolidated Matrix (Nov 2026)"}
        </span>
      </div>
      <p className="text-sm text-gray-600 leading-relaxed mb-3">{a.lead[l]}</p>
      <div className="grid gap-3 md:grid-cols-2">
        {a.stages.map((s) => (
          <div key={s.stage.en} className="rounded-xl border border-gray-200 bg-gray-50/70 p-3 text-xs leading-relaxed flex flex-col justify-between">
            <div>
              <p className="font-semibold text-gray-900 text-sm mb-2">{s.stage[l]}</p>
              <div className="space-y-2">
                <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-2">
                  <p className="font-semibold text-emerald-900 mb-0.5">
                    {isZh ? "🏆 主力保留（核心底座）" : "🏆 Core Keep"}
                  </p>
                  <p className="text-gray-700">{s.keep[l]}</p>
                </div>
                <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-2">
                  <p className="font-semibold text-blue-900 mb-0.5">
                    {isZh ? "⚡ 新晋补位（填补空白）" : "⚡ New Gap-Fillers"}
                  </p>
                  <p className="text-gray-700">{s.add[l]}</p>
                </div>
                <div className="rounded-lg border border-rose-200 bg-rose-50/40 p-2">
                  <p className="font-semibold text-rose-900 mb-0.5">
                    {isZh ? "✂️ 优胜劣汰（降级 / 砍掉）" : "✂️ Retired / Demoted"}
                  </p>
                  <p className="text-gray-600">{s.drop[l]}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* 2026 年新出的免费官方工具：每样一行，链官方来源；编号对应上面的环节 */}
      <div className="mt-3 rounded-xl border border-sky-200 bg-sky-50/50 p-3 text-xs leading-relaxed">
        <p className="font-semibold text-gray-900 mb-1.5">
          {isZh ? "2026 年新出的免费官方工具（2026-11-21 补）" : "Free official tools that arrived in 2026 (added 2026-11-21)"}
        </p>
        <ul className="space-y-1 text-gray-700">
          {OFFICIAL_TOOLS_2026.map((t) => (
            <li key={t.url}>
              <span className="font-medium text-gray-900">
                {t.stage} {t.name[l]}
              </span>
              {isZh ? "：" : ": "}
              {t.what[l]}{" "}
              <a href={t.url} {...OUT} className="text-blue-600 hover:underline">
                {isZh ? "官方来源" : "Source"}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

