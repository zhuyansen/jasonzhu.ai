"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "@/components/Link";
import CopyPrompt from "../claude-opus-5-5/CopyPrompt";
import CaseMedia from "../chatgpt-images-2-6/CaseMedia";
import CaseVideo from "../claude-opus-5-5/CaseVideo";
import {
  GEMINI_CATEGORIES, GEMINI_MODELS, GEMINI_RIVALS, geminiCategoryLabel, geminiCaseHref, geminiModelLabel, formatCount, type GeminiCaseSlim,
} from "@/lib/gemini-prompts-shared";

const PAGE = 24;
type Sort = "views" | "recent" | "added";

interface Props {
  lang: string;
  initial: GeminiCaseSlim[];
  total: number;
  withPrompt: number;
  categoryCounts: Record<string, number>;
  modelCounts: Record<string, number>;
  rivalCounts: Record<string, number>;
  /** 收录日期 ≥ 这天的标 NEW（相对库的更新日期算，不看访客时钟） */
  recentStart: string;
}

const RIVAL_LABEL = Object.fromEntries(GEMINI_RIVALS.map((r) => [r.key, r.label]));

export default function GeminiLibraryClient({ lang, initial, total, withPrompt, categoryCounts, modelCounts, rivalCounts, recentStart }: Props) {
  const isZh = lang === "zh";
  const [all, setAll] = useState<GeminiCaseSlim[]>(initial);
  const [category, setCategory] = useState<string>("all");
  const [model, setModel] = useState<string>("all");
  const [rival, setRival] = useState<string>("all");
  const [onlyPrompt, setOnlyPrompt] = useState(false);
  const [sort, setSort] = useState<Sort>("views");
  const [shown, setShown] = useState(PAGE);

  // 首屏 HTML 只带 24 条；挂载后再拉全量精简索引，筛选和排序都在本地做
  useEffect(() => {
    if (initial.length >= total) return;
    fetch("/data/gemini-prompts/index.json").then((r) => (r.ok ? r.json() : null)).then((d) => d && setAll(d)).catch(() => {});
  }, [initial.length, total]);

  const list = useMemo(() => {
    const out = all.filter((c) =>
      (category === "all" || c.category === category)
      && (model === "all" || c.models.includes(model as GeminiCaseSlim["models"][number]))
      && (rival === "all" || c.rivals.includes(rival as GeminiCaseSlim["rivals"][number]))
      && (!onlyPrompt || c.prompt));
    const key = sort === "views" ? (c: GeminiCaseSlim) => c.stats.views : sort === "recent" ? (c: GeminiCaseSlim) => Date.parse(c.postedAt) : (c: GeminiCaseSlim) => Date.parse(c.addedAt || c.postedAt);
    return out.sort((a, b) => key(b) - key(a));
  }, [all, category, model, rival, onlyPrompt, sort]);

  const chip = (active: boolean) =>
    `px-3 py-1.5 rounded-full text-sm border transition-colors ${active ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"}`;
  const pill = (active: boolean) =>
    `px-2.5 py-1 rounded-lg text-xs border transition-colors ${active ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"}`;
  const reset = () => setShown(PAGE);

  return (
    <div>
      {/* 题材 */}
      <div className="flex flex-wrap gap-2 mb-3">
        <button className={chip(category === "all")} onClick={() => { setCategory("all"); reset(); }}>
          {isZh ? "全部" : "All"} <span className="opacity-60">{total}</span>
        </button>
        {GEMINI_CATEGORIES.filter((c) => categoryCounts[c.key]).map((c) => (
          <button key={c.key} className={chip(category === c.key)} onClick={() => { setCategory(c.key); reset(); }}>
            {c.icon} {isZh ? c.zh : c.en} <span className="opacity-60">{categoryCounts[c.key]}</span>
          </button>
        ))}
      </div>

      {/* 子模型 · 对比对象 */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mb-4 text-xs text-gray-500">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1">{isZh ? "版本" : "Version"}</span>
          <button className={pill(model === "all")} onClick={() => { setModel("all"); reset(); }}>{isZh ? "全部" : "All"}</button>
          {GEMINI_MODELS.filter((m) => modelCounts[m.key]).map((m) => (
            <button key={m.key} className={pill(model === m.key)} onClick={() => { setModel(m.key); reset(); }}>
              {m.label} <span className="opacity-70">{modelCounts[m.key]}</span>
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1">{isZh ? "对比" : "Versus"}</span>
          <button className={pill(rival === "all")} onClick={() => { setRival("all"); reset(); }}>{isZh ? "全部" : "All"}</button>
          {GEMINI_RIVALS.filter((r) => rivalCounts[r.key]).map((r) => (
            <button key={r.key} className={pill(rival === r.key)} onClick={() => { setRival(r.key); reset(); }}>
              {r.label} <span className="opacity-70">{rivalCounts[r.key]}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        {withPrompt > 0 ? (
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
            <input type="checkbox" checked={onlyPrompt} onChange={(e) => { setOnlyPrompt(e.target.checked); reset(); }} className="rounded" />
            {isZh ? "只看有提示词的" : "Only with prompts"}
          </label>
        ) : <span />}
        <div className="flex gap-1 text-sm">
          {([["views", isZh ? "播放最多" : "Most viewed"], ["recent", isZh ? "最新发布" : "Newest"], ["added", isZh ? "最近收录" : "Recently added"]] as [Sort, string][]).map(([k, label]) => (
            <button key={k} onClick={() => setSort(k)} className={`px-3 py-1 rounded-lg ${sort === k ? "bg-gray-100 text-gray-900 font-medium" : "text-gray-500 hover:text-gray-900"}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {list.length === 0 ? (
        <p className="text-center text-gray-400 py-16">{isZh ? "这个组合暂时还没有作品" : "Nothing here yet"}</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {list.slice(0, shown).map((c) => {
            const title = isZh ? c.title.zh : c.title.en;
            const href = geminiCaseHref(c, lang);
            const isNew = (c.addedAt || "") >= recentStart;
            return (
              <article key={c.id} className="rounded-2xl border border-gray-100 bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
                <div className="relative">
                  {/* 作品基本是横屏录屏，和 Claude 库一样用 16:9；万一是图片帖再用图片库的方格 */}
                  {c.media[0].type === "video" ? (
                    <div className="relative aspect-video bg-black">
                      <CaseVideo id={c.id} poster={c.media[0].poster || ""} mp4={c.media[0].url} postUrl={c.url} label={title} isZh={isZh} />
                    </div>
                  ) : (
                    <CaseMedia id={c.id} media={c.media} postUrl={c.url} label={title} isZh={isZh} variant="card" />
                  )}
                  {isNew && <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-red-500 text-white text-[10px] font-bold pointer-events-none">NEW</span>}
                </div>
                <div className="p-4 flex flex-col gap-2 flex-1">
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <span className="px-2 py-0.5 rounded-full bg-gray-50 text-gray-600">{geminiCategoryLabel(c.category, lang)}</span>
                    <span>{formatCount(c.stats.views, lang)} {isZh ? "播放" : "views"}</span>
                    <span>♥ {formatCount(c.stats.likes, lang)}</span>
                    <span className="ml-auto shrink-0" title={isZh ? `发帖 ${c.postedAt.slice(0, 10)} · ${c.addedAt || ""} 收录` : `Posted ${c.postedAt.slice(0, 10)} · added ${c.addedAt || ""}`}>
                      {sort === "added" && c.addedAt ? (isZh ? `${c.addedAt.slice(5)} 收录` : `Added ${c.addedAt.slice(5)}`) : c.postedAt.slice(5, 10)}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                    {c.models.map((m) => <span key={m} className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-medium">{geminiModelLabel(m)}</span>)}
                    {c.rivals.length > 0 && <span className="text-gray-400">vs {c.rivals.map((r) => RIVAL_LABEL[r]).join(" · ")}</span>}
                  </div>
                  {c.prompt ? (
                    <Link href={href} className="font-semibold text-gray-900 leading-snug hover:text-[var(--primary)]">{title}</Link>
                  ) : (
                    <a href={href} target="_blank" rel="noopener noreferrer" className="font-semibold text-gray-900 leading-snug hover:text-[var(--primary)]">{title}</a>
                  )}
                  <a href={`https://x.com/${c.author.handle}`} target="_blank" rel="noopener noreferrer" className="text-xs text-gray-500 hover:text-gray-900">
                    @{c.author.handle}
                  </a>
                  {c.prompt ? (
                    <>
                      <p className="text-sm text-gray-600 line-clamp-3 whitespace-pre-line break-words">{c.prompt.excerpt}</p>
                      <div className="flex flex-wrap gap-1.5 text-[11px]">
                        {c.group && <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">{isZh ? `同款提示词 · ${c.group.size} 个作品` : `Same prompt · ${c.group.size} works`}</span>}
                        {c.referenceAssets && <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">{isZh ? "需自备素材" : "Needs your own assets"}</span>}
                      </div>
                      <div className="mt-auto pt-2 flex items-center gap-2">
                        <CopyPrompt id={c.id} isZh={isZh} dataPath="/data/gemini-prompts" />
                        <Link href={href} className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50">
                          {isZh ? "看完整提示词" : "Full prompt"}
                        </Link>
                      </div>
                    </>
                  ) : (
                    <a href={c.url} target="_blank" rel="noopener noreferrer" className="mt-auto pt-2 text-xs text-gray-400 hover:text-gray-700">
                      {isZh ? "作者没公开提示词 · 去 X 看原帖 ↗" : "No prompt shared · view on X ↗"}
                    </a>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      {shown < list.length && (
        <div className="text-center mt-8">
          <button onClick={() => setShown((n) => n + PAGE)} className="px-6 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700 hover:bg-gray-50">
            {isZh ? `加载更多（还有 ${list.length - shown} 个）` : `Load more (${list.length - shown} left)`}
          </button>
        </div>
      )}
    </div>
  );
}
