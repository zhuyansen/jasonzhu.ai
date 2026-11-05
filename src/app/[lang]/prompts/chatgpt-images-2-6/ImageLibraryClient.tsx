"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "@/components/Link";
import CopyPrompt from "../claude-opus-5-5/CopyPrompt";
import CaseMedia from "./CaseMedia";
import { IMAGE_CATEGORIES, imageCategoryLabel, imageCaseHref, formatCount, type ImageCaseSlim } from "@/lib/image-prompts-shared";

const PAGE = 24;
type Sort = "views" | "recent" | "added";

interface Props {
  lang: string;
  initial: ImageCaseSlim[];
  total: number;
  /** 带提示词的作品数；0 时不显示「只看有提示词的」 */
  withPrompt: number;
  categoryCounts: Record<string, number>;
  /** 收录日期 ≥ 这天的标 NEW（相对库的更新日期算，不看访客时钟） */
  recentStart: string;
}

export default function ImageLibraryClient({ lang, initial, total, withPrompt, categoryCounts, recentStart }: Props) {
  const isZh = lang === "zh";
  const [all, setAll] = useState<ImageCaseSlim[]>(initial);
  const [category, setCategory] = useState<string>("all");
  const [onlyPrompt, setOnlyPrompt] = useState(false);
  const [sort, setSort] = useState<Sort>("views");
  const [shown, setShown] = useState(PAGE);

  // 首屏 HTML 只带 24 条；挂载后再拉全量精简索引，筛选和排序都在本地做
  useEffect(() => {
    if (initial.length >= total) return;
    fetch("/data/image-prompts/index.json").then((r) => (r.ok ? r.json() : null)).then((d) => d && setAll(d)).catch(() => {});
  }, [initial.length, total]);

  const list = useMemo(() => {
    const out = all.filter((c) => (category === "all" || c.category === category) && (!onlyPrompt || c.prompt));
    const key = sort === "views" ? (c: ImageCaseSlim) => c.stats.views : sort === "recent" ? (c: ImageCaseSlim) => Date.parse(c.postedAt) : (c: ImageCaseSlim) => Date.parse(c.addedAt || c.postedAt);
    return out.sort((a, b) => key(b) - key(a));
  }, [all, category, onlyPrompt, sort]);

  const chip = (active: boolean) =>
    `px-3 py-1.5 rounded-full text-sm border transition-colors ${active ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"}`;

  return (
    <div>
      {/* 筛选 */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button className={chip(category === "all")} onClick={() => { setCategory("all"); setShown(PAGE); }}>
          {isZh ? "全部" : "All"} <span className="opacity-60">{total}</span>
        </button>
        {IMAGE_CATEGORIES.filter((c) => categoryCounts[c.key]).map((c) => (
          <button key={c.key} className={chip(category === c.key)} onClick={() => { setCategory(c.key); setShown(PAGE); }}>
            {c.icon} {isZh ? c.zh : c.en} <span className="opacity-60">{categoryCounts[c.key]}</span>
          </button>
        ))}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        {withPrompt > 0 ? (
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
            <input type="checkbox" checked={onlyPrompt} onChange={(e) => { setOnlyPrompt(e.target.checked); setShown(PAGE); }} className="rounded" />
            {isZh ? "只看有提示词的" : "Only with prompts"}
          </label>
        ) : <span />}
        <div className="flex gap-1 text-sm">
          {([["views", isZh ? "浏览最多" : "Most viewed"], ["recent", isZh ? "最新发布" : "Newest"], ["added", isZh ? "最近收录" : "Recently added"]] as [Sort, string][]).map(([k, label]) => (
            <button key={k} onClick={() => setSort(k)} className={`px-3 py-1 rounded-lg ${sort === k ? "bg-gray-100 text-gray-900 font-medium" : "text-gray-500 hover:text-gray-900"}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {list.length === 0 ? (
        <p className="text-center text-gray-400 py-16">{isZh ? "这个分类暂时还没有作品" : "Nothing here yet"}</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {list.slice(0, shown).map((c) => {
            const title = isZh ? c.title.zh : c.title.en;
            const href = imageCaseHref(c, lang);
            const isNew = (c.addedAt || "") >= recentStart;
            return (
              <article key={c.id} className="rounded-2xl border border-gray-100 bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
                <div className="relative">
                  <CaseMedia id={c.id} media={c.media} postUrl={c.url} label={title} isZh={isZh} variant="card" />
                  {isNew && <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-red-500 text-white text-[10px] font-bold pointer-events-none">NEW</span>}
                </div>
                <div className="p-4 flex flex-col gap-2 flex-1">
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <span className="px-2 py-0.5 rounded-full bg-gray-50 text-gray-600">{imageCategoryLabel(c.category, lang)}</span>
                    <span>{formatCount(c.stats.views, lang)} {isZh ? "浏览" : "views"}</span>
                    <span>♥ {formatCount(c.stats.likes, lang)}</span>
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
                        {c.referenceAssets && <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">{isZh ? "需自备参考图" : "Needs your own image"}</span>}
                      </div>
                      <div className="mt-auto pt-2 flex items-center gap-2">
                        <CopyPrompt id={c.id} isZh={isZh} dataPath="/data/image-prompts" />
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
