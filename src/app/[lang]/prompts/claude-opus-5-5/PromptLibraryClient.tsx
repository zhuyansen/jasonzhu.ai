"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import Link from "@/components/Link";
import {
  OPUS_CATEGORIES,
  categoryLabel,
  formatCount,
  formatDuration,
  MODEL_LABEL,
  MODEL_PREVIEW,
  type ClaudeModel,
  type OpusCaseSlim,
  type OpusCategory,
} from "@/lib/opus-prompts-shared";
import CaseVideo from "./CaseVideo";
import CopyPrompt, { loadPrompt, TryInClaude } from "./CopyPrompt";

const noopSubscribe = () => () => {};
function readUrlModel(): ClaudeModel | null {
  const v = new URLSearchParams(window.location.search).get("model")?.toLowerCase();
  return (Object.keys(MODEL_LABEL) as ClaudeModel[]).find((k) => v && (k === v || k.startsWith(v + "-"))) ?? null;
}

const PAGE_SIZE = 24;
const BASE = "prompts/claude-opus-5-5";

type Sort = "views" | "latest" | "added" | "likes" | "bookmarks";

interface Props {
  /** 服务端只渲染首屏这一批，其余在挂载后从静态 JSON 补齐（控制 HTML / RSC 体积） */
  initial: OpusCaseSlim[];
  total: number;
  counts: Record<string, number>;
  modelCounts: Record<ClaudeModel, number>;
  lang: string;
  /** 新作品口径（按收录日期 addedAt，和库的更新日期比，不用访客时钟——静态页和浏览器结果一致） */
  fresh: { weekStart: string; recentStart: string; weekCount: number };
  /** 首屏精选（本周最火 Top 3），服务端挑好传进来 */
  featured?: { title: { zh: string; en: string }; cases: OpusCaseSlim[] };
  /** 落地页用：固定在某个分类，并隐藏分类筛选（如 motion-graphics 页） */
  lockCategory?: OpusCategory;
}

export default function PromptLibraryClient({ initial, total, counts, modelCounts, lang, fresh, featured, lockCategory }: Props) {
  const isZh = lang === "zh";
  const [all, setAll] = useState<OpusCaseSlim[]>(initial);
  const [loaded, setLoaded] = useState(initial.length >= total);
  const [category, setCategory] = useState<OpusCategory | null>(lockCategory ?? null);
  const [sort, setSort] = useState<Sort>("views");
  const [fullOnly, setFullOnly] = useState(false);
  const [promptOnly, setPromptOnly] = useState(false);
  const [noAssets, setNoAssets] = useState(false);
  const [q, setQ] = useState("");
  const [group, setGroup] = useState<string | null>(null);
  // undefined = 用户还没点过模型筛选，此时跟随 URL 的 ?model=（fable-5.5 或简写 fable/sonnet/opus），方便宣传时贴直达链接。
  // 用 useSyncExternalStore 读 URL：服务端渲染时为 null，不用 useSearchParams，免得整页退出静态渲染
  const [picked, setModel] = useState<ClaudeModel | null | undefined>(undefined);
  const urlModel = useSyncExternalStore(noopSubscribe, readUrlModel, () => null);
  // 链接里的模型还没有作品（如刚发布的 Haiku 5.5）就显示全部，不给一个空列表
  const model = picked === undefined ? (urlModel && modelCounts[urlModel] ? urlModel : null) : picked;
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [onlyNew, setOnlyNew] = useState(false); // 只看本周新增

  useEffect(() => {
    if (loaded) return;
    let alive = true;
    fetch("/data/opus-prompts/index.json")
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((d: OpusCaseSlim[]) => {
        if (alive) {
          setAll(d);
          setLoaded(true);
        }
      })
      .catch(() => {
        /* 拉不到就只用首屏数据，页面仍可用 */
      });
    return () => {
      alive = false;
    };
  }, [loaded]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const list = all.filter((c) => {
      if (onlyNew && !((c.addedAt || "") >= fresh.weekStart)) return false;
      if (group && c.group?.key !== group) return false;
      if (model && !c.models?.includes(model)) return false;
      if (category && c.category !== category) return false;
      if (promptOnly && !c.prompt) return false;
      if (fullOnly && c.prompt?.kind !== "full") return false;
      if (noAssets && c.referenceAssets) return false;
      if (!needle) return true;
      return (
        c.title.zh.toLowerCase().includes(needle) ||
        c.title.en.toLowerCase().includes(needle) ||
        c.author.handle.toLowerCase().includes(needle) ||
        c.tools.some((t) => t.toLowerCase().includes(needle)) ||
        (c.prompt?.excerpt || "").toLowerCase().includes(needle)
      );
    });
    const by: Record<Sort, (a: OpusCaseSlim, b: OpusCaseSlim) => number> = {
      views: (a, b) => b.stats.views - a.stats.views,
      likes: (a, b) => b.stats.likes - a.stats.likes,
      bookmarks: (a, b) => b.stats.bookmarks - a.stats.bookmarks,
      latest: (a, b) => (a.postedAt < b.postedAt ? 1 : -1),
      // 最近收录：同一天收录的按播放量
      added: (a, b) => ((a.addedAt || "") === (b.addedAt || "") ? b.stats.views - a.stats.views : (a.addedAt || "") < (b.addedAt || "") ? 1 : -1),
    };
    return [...list].sort(by[sort]);
  }, [all, category, fullOnly, promptOnly, noAssets, q, sort, group, model, onlyNew, fresh.weekStart]);

  const reset = () => setVisible(PAGE_SIZE);
  const shown = filtered.slice(0, visible);
  const isFiltering = Boolean((category && category !== lockCategory) || fullOnly || promptOnly || noAssets || q.trim() || group || model || onlyNew);
  const pill = (active: boolean) =>
    `px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
      active ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
    }`;

  return (
    <>
      {/* 本周最火 Top 3：第一眼先看到最好的作品 */}
      {featured && featured.cases.length > 0 && (
        <section className="mb-8">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">🔥 {isZh ? featured.title.zh : featured.title.en}</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featured.cases.map((c, i) => (
              <div key={c.id} className="relative">
                <span className="absolute -top-2 -left-2 z-10 w-7 h-7 rounded-full bg-gray-900 text-white text-xs font-bold flex items-center justify-center tabular-nums shadow">{i + 1}</span>
                <CaseCard c={c} lang={lang} isNew={(c.addedAt || "") >= fresh.recentStart} onGroup={(k) => { setGroup(k); setCategory(lockCategory ?? null); reset(); }} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 本周新增：默认仍按播放量排，这条让访客一眼看出库每天在更新 */}
      {fresh.weekCount > 0 && (
        <button
          type="button"
          onClick={() => {
            const next = !onlyNew;
            setOnlyNew(next);
            setSort(next ? "added" : "views");
            reset();
          }}
          aria-pressed={onlyNew}
          className={`w-full mb-4 flex items-center justify-between gap-3 px-4 py-3 rounded-xl border text-sm text-left transition-colors ${
            onlyNew ? "border-rose-300 bg-rose-50 text-rose-800" : "border-rose-100 bg-rose-50/60 text-rose-700 hover:bg-rose-50"
          }`}
        >
          <span>
            <span className="inline-block mr-2 px-1.5 py-0.5 rounded bg-rose-500 text-white text-[10px] font-bold tracking-wide align-middle">NEW</span>
            {isZh ? (
              <>本周新增 <b className="tabular-nums">{fresh.weekCount}</b> 个作品 · 每天自动收录</>
            ) : (
              <><b className="tabular-nums">{fresh.weekCount}</b> new works this week · added daily</>
            )}
          </span>
          <span className="shrink-0 font-medium">{onlyNew ? (isZh ? "看全部 ✕" : "Show all ✕") : isZh ? "只看新增 →" : "Show new →"}</span>
        </button>
      )}

      {/* 筛选 */}
      <div className="space-y-3 mb-8">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="search"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              reset();
            }}
            placeholder={isZh ? "搜标题、作者、工具、提示词…" : "Search title, author, tool, prompt…"}
            className="flex-1 px-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50/50 focus:bg-white focus:border-blue-300 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
          />
          <label className="flex items-center gap-2 text-sm text-gray-500 shrink-0">
            {isZh ? "排序" : "Sort"}
            <select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value as Sort);
                reset();
              }}
              className="px-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-white text-gray-700 outline-none focus:border-blue-300"
            >
              <option value="views">{isZh ? "播放量" : "Views"}</option>
              <option value="latest">{isZh ? "最新发布" : "Newest"}</option>
              <option value="added">{isZh ? "最近收录" : "Recently added"}</option>
              <option value="likes">{isZh ? "点赞" : "Likes"}</option>
              <option value="bookmarks">{isZh ? "收藏" : "Bookmarks"}</option>
            </select>
          </label>
        </div>

        <div className="flex flex-wrap gap-2">
          {([null, "opus-5.5", "sonnet-5.5", "haiku-5.5", "fable-5.5"] as (ClaudeModel | null)[]).filter((m) => !m || modelCounts[m]).map((m) => (
            <button
              key={m ?? "all"}
              onClick={() => { setModel(m); reset(); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                model === m ? "bg-[var(--primary)] text-white" : "bg-blue-50 text-[var(--primary)] hover:bg-blue-100"
              }`}
            >
              {m ? MODEL_LABEL[m] : isZh ? "全部模型" : "All models"}
              {m && MODEL_PREVIEW[m] && <span className="ml-1 font-normal opacity-80">（{isZh ? MODEL_PREVIEW[m]!.zh : MODEL_PREVIEW[m]!.en}）</span>}{" "}
              <span className="opacity-60">{m ? modelCounts[m] : total}</span>
            </button>
          ))}
        </div>

        {!lockCategory && <div className="flex flex-wrap gap-2">
          <button onClick={() => { setCategory(null); reset(); }} className={pill(!category)}>
            {isZh ? "全部" : "All"} <span className="opacity-60">{total}</span>
          </button>
          {OPUS_CATEGORIES.filter((c) => counts[c.key]).map((c) => (
            <button
              key={c.key}
              onClick={() => { setCategory(category === c.key ? null : c.key); reset(); }}
              className={pill(category === c.key)}
            >
              {c.icon} {isZh ? c.zh : c.en} <span className="opacity-60">{counts[c.key]}</span>
            </button>
          ))}
        </div>}

        <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-gray-500">
          <label className="inline-flex items-center gap-1.5 cursor-pointer">
            <input type="checkbox" checked={promptOnly} onChange={(e) => { setPromptOnly(e.target.checked); reset(); }} />
            {isZh ? "只看有提示词" : "With prompt only"}
          </label>
          <label className="inline-flex items-center gap-1.5 cursor-pointer">
            <input type="checkbox" checked={fullOnly} onChange={(e) => { setFullOnly(e.target.checked); reset(); }} />
            {isZh ? "只看完整提示词" : "Full prompts only"}
          </label>
          <label className="inline-flex items-center gap-1.5 cursor-pointer">
            <input type="checkbox" checked={noAssets} onChange={(e) => { setNoAssets(e.target.checked); reset(); }} />
            {isZh ? "只看纯文字可复现" : "Text-only (no reference assets)"}
          </label>
          {group && (
            <button onClick={() => { setGroup(null); reset(); }} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-[var(--primary)] font-medium">
              {isZh ? "同款提示词" : "Same prompt"} ✕
            </button>
          )}
          {isFiltering && (
            <span className="text-gray-400">
              {!loaded
                ? isZh ? "正在加载全部案例…" : "Loading all cases…"
                : isZh ? `匹配 ${filtered.length} 条` : `${filtered.length} matches`}
            </span>
          )}
        </div>
      </div>

      {/* 卡片 */}
      {shown.length === 0 ? (
        <p className="text-gray-400 text-center py-16 text-sm">
          {isZh ? "没有匹配的案例" : "No matching cases"}
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {shown.map((c) => (
            <CaseCard key={c.id} c={c} lang={lang} isNew={(c.addedAt || "") >= fresh.recentStart} onGroup={(k) => { setGroup(k); setCategory(null); reset(); window.scrollTo({ top: 0, behavior: "smooth" }); }} />
          ))}
        </div>
      )}

      {visible < filtered.length && (
        <div className="mt-8 text-center">
          <button
            onClick={() => setVisible((v) => v + PAGE_SIZE)}
            className="px-6 py-2.5 text-sm font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
          >
            {isZh
              ? `加载更多（还有 ${filtered.length - visible} 条）`
              : `Load more (${filtered.length - visible} remaining)`}
          </button>
        </div>
      )}
    </>
  );
}

function CaseCard({ c, lang, isNew, onGroup }: { c: OpusCaseSlim; lang: string; isNew: boolean; onGroup: (key: string) => void }) {
  const isZh = lang === "zh";
  const [full, setFull] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const title = isZh ? c.title.zh : c.title.en;
  const p = c.prompt;
  const canExpand = Boolean(p && p.length > p.excerpt.length);

  async function toggle() {
    if (open) return setOpen(false);
    if (!full && p) {
      setLoading(true);
      try {
        setFull(await loadPrompt(c.id));
      } catch {
        // 拉不到全文就跳详情页
        window.location.href = `/${lang}/${BASE}/${c.id}`;
        return;
      } finally {
        setLoading(false);
      }
    }
    setOpen(true);
  }

  const stats: [string, number][] = [
    [isZh ? "播放" : "Views", c.stats.views],
    [isZh ? "点赞" : "Likes", c.stats.likes],
    [isZh ? "评论" : "Replies", c.stats.replies],
    [isZh ? "收藏" : "Saves", c.stats.bookmarks],
  ];

  return (
    <article className="flex flex-col bg-white rounded-xl border border-gray-100 overflow-hidden hover:border-gray-200 hover:shadow-sm transition-all">
      <div className="relative aspect-video bg-black">
        <CaseVideo
          id={c.id}
          poster={c.video.poster}
          mp4={c.video.mp4}
          postUrl={c.url}
          label={`${title} · @${c.author.handle}`}
          isZh={isZh}
        />
        {isNew && (
          <span
            className="pointer-events-none absolute top-2 left-2 px-1.5 py-0.5 rounded bg-rose-500 text-white text-[10px] font-bold tracking-wide shadow"
            title={isZh ? `${c.addedAt} 收录` : `Added ${c.addedAt}`}
          >
            NEW
          </span>
        )}
        <span className="pointer-events-none absolute top-2 right-2 px-1.5 py-0.5 rounded bg-black/70 text-white text-[11px] tabular-nums">
          {formatDuration(c.video.durationSec)}
        </span>
      </div>

      <div className="flex flex-col flex-1 p-4">
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-1.5">
          {(c.models || ["opus-5.5"]).map((m) => (
            <span key={m} className={`px-1.5 py-0.5 rounded font-semibold ${m === "sonnet-5.5" ? "bg-amber-50 text-amber-700" : m === "fable-5.5" ? "bg-emerald-50 text-emerald-700" : m === "haiku-5.5" ? "bg-sky-50 text-sky-700" : "bg-violet-50 text-violet-700"}`}
              title={MODEL_PREVIEW[m] ? (isZh ? "Fable 5.5 已在内测，Anthropic 尚未官宣；模型归属以作者自述为准" : "Fable 5.5 is in limited preview and not yet announced by Anthropic; attribution is as stated by the creator") : undefined}>
              {MODEL_LABEL[m]}{MODEL_PREVIEW[m] && <span className="font-normal">{isZh ? " · 内测" : " · preview"}</span>}
            </span>
          ))}
          <span className="px-2 py-0.5 rounded-full bg-blue-50 text-[var(--primary)] font-medium">
            {categoryLabel(c.category, lang)}
          </span>
          <a href={c.url} target="_blank" rel="noopener noreferrer" className="hover:text-gray-700 truncate">
            @{c.author.handle}
          </a>
          <span className="shrink-0">{c.postedAt.slice(5, 10)}</span>
        </div>

        <h3 className="text-base font-semibold text-gray-900 leading-snug mb-3">
          <Link href={`/${lang}/${BASE}/${c.id}`} className="hover:text-[var(--primary)] transition-colors">
            {title}
          </Link>
        </h3>

        {p && (
          <>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                {p.kind === "full" ? (isZh ? "完整提示词" : "Full prompt") : isZh ? "一句话指令" : "Brief"}
                {p.kind === "full" && (
                  <span className="ml-1.5 normal-case font-normal tabular-nums">
                    {p.length.toLocaleString("en-US")} {isZh ? "字符" : "chars"}
                  </span>
                )}
              </span>
              {c.group && (
                <button
                  onClick={() => onGroup(c.group!.key)}
                  className="text-[11px] text-[var(--primary)] hover:underline shrink-0"
                  title={isZh ? "看用同一条提示词做出的其他作品" : "See other works made with this prompt"}
                >
                  {isZh ? `同款提示词 · ${c.group.size} 个作品` : `Same prompt · ${c.group.size} works`}
                </button>
              )}
            </div>
            <div className="relative">
              <div
                className={`text-sm text-gray-700 leading-relaxed whitespace-pre-wrap break-words bg-gray-50 border border-gray-100 rounded-lg p-3 ${
                  open ? "max-h-[420px] overflow-y-auto" : "max-h-32 overflow-hidden"
                }`}
              >
                {open && full ? full : p.excerpt}
              </div>
              {/* 折叠态底部渐隐，提示下面还有内容 */}
              {!open && canExpand && (
                <div className="pointer-events-none absolute inset-x-px bottom-px h-10 rounded-b-lg bg-gradient-to-t from-gray-50 to-transparent" />
              )}
            </div>
            <div className="flex items-center gap-2 mt-2.5">
              <CopyPrompt id={c.id} text={full ?? (canExpand ? undefined : p.excerpt)} isZh={isZh} />
              <TryInClaude id={c.id} text={full ?? (canExpand ? undefined : p.excerpt)} isZh={isZh} />
              {canExpand && (
                <button
                  onClick={toggle}
                  disabled={loading}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors disabled:opacity-60"
                >
                  {loading ? "…" : open ? (isZh ? "收起" : "Collapse") : isZh ? "展开全文" : "Show all"}
                </button>
              )}
            </div>
          </>
        )}

        {c.referenceAssets && (
          <p className="mt-3 text-xs text-amber-700 bg-amber-50 border-l-2 border-amber-300 px-2.5 py-1.5 rounded-r">
            {isZh
              ? "需自备参考素材：原作用了图片、视频、音频或文档输入，本站未收录"
              : "Needs your own reference assets — inputs used by the creator are not hosted here"}
          </p>
        )}

        {c.tools.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {c.tools.slice(0, 5).map((t) => (
              <span key={t} className="px-2 py-0.5 rounded-full bg-gray-50 text-gray-500 text-[11px]">
                {t}
              </span>
            ))}
          </div>
        )}

        <dl className="grid grid-cols-4 mt-auto pt-4 text-center">
          {stats.map(([k, v]) => (
            <div key={k} className="border-l first:border-l-0 border-gray-100">
              <dt className="text-[11px] text-gray-400">{k}</dt>
              <dd className="text-sm font-semibold text-gray-800 tabular-nums">{formatCount(v, lang)}</dd>
            </div>
          ))}
        </dl>
      </div>
    </article>
  );
}
