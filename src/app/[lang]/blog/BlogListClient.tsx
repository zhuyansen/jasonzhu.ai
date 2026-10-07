"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import BlogCard from "@/components/BlogCard";
import type { BlogPostMeta } from "@/lib/mdx";
import type { Dictionary } from "@/lib/dictionaries";

// 搜索词放在 URL 的 ?q= 里，搜索结果可以直接分享。用 useSyncExternalStore 读 URL：
// 服务端渲染时为空串，不用 useSearchParams，免得整页退出静态渲染。
const noopSubscribe = () => () => {};
const readUrlQuery = () => new URLSearchParams(window.location.search).get("q") || "";

/** 把一篇文章能被搜到的文字拼在一起：标题、摘要、标签、分类、小标题、正文英文关键词（含英文版标题 / 摘要） */
function haystack(p: BlogPostMeta, categoryName: string): string {
  return [p.title, p.excerpt, p.titleEn, p.excerptEn, p.category, categoryName, ...(p.tags || []), ...(p.headings || []), ...(p.keywords || [])]
    .filter(Boolean)
    .join("\n")
    .toLowerCase();
}

export default function BlogListClient({
  posts,
  categories,
  lang,
  dict,
}: {
  posts: BlogPostMeta[];
  categories: string[];
  lang: string;
  dict: Dictionary["blog"];
}) {
  const [activeCategory, setActiveCategory] = useState("__all__");
  // undefined = 用户还没输入，跟随 URL 的 ?q=
  const [typed, setTyped] = useState<string | undefined>(undefined);
  const urlQuery = useSyncExternalStore(noopSubscribe, readUrlQuery, () => "");
  const query = typed === undefined ? urlQuery : typed;
  const inputRef = useRef<HTMLInputElement>(null);

  const categoryMap = dict.categoryMap as Record<string, string> | undefined;

  const getDisplayName = (cat: string) => {
    if (categoryMap && categoryMap[cat]) return categoryMap[cat];
    return cat;
  };

  // 按 / 聚焦搜索框（输入框里打字时不拦截）
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      if (e.key === "/" && !["INPUT", "TEXTAREA"].includes(el.tagName) && !el.isContentEditable) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const onSearch = (value: string) => {
    setTyped(value);
    // 同步到 URL（replaceState，不产生历史记录），方便分享搜索结果
    const url = new URL(window.location.href);
    if (value.trim()) url.searchParams.set("q", value.trim());
    else url.searchParams.delete("q");
    window.history.replaceState(null, "", url.toString());
  };

  const index = useMemo(
    () => posts.map((p) => ({ post: p, text: haystack(p, categoryMap?.[p.category] || "") })),
    [posts, categoryMap]
  );

  // 多个词用空格分开，必须全部命中（AND）
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  const filtered = index
    .filter(({ post }) => activeCategory === "__all__" || post.category === activeCategory)
    .filter(({ text }) => terms.every((t) => text.includes(t)))
    .map(({ post }) => post);

  const isZh = lang !== "en";
  const searching = terms.length > 0;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{dict.title}</h1>
      <p className="text-gray-500 mb-6">{dict.desc}</p>

      {/* Search */}
      <div className="relative mb-4 max-w-xl">
        <svg
          aria-hidden="true"
          className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.45 4.39l3.08 3.08a.75.75 0 11-1.06 1.06l-3.08-3.08A7 7 0 012 9z"
            clipRule="evenodd"
          />
        </svg>
        <label htmlFor="blog-search" className="sr-only">
          {isZh ? "搜索文章" : "Search posts"}
        </label>
        <input
          id="blog-search"
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => onSearch(e.target.value)}
          placeholder={isZh ? "搜索文章标题、标签、内容关键词…（按 / 快速搜索）" : "Search titles, tags, topics… (press / to search)"}
          className="w-full rounded-xl border border-gray-200 bg-white pl-10 pr-10 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
        />
        {query && (
          <button
            type="button"
            onClick={() => onSearch("")}
            aria-label={isZh ? "清空搜索" : "Clear search"}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm"
          >
            ✕
          </button>
        )}
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setActiveCategory("__all__")}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            activeCategory === "__all__"
              ? "bg-[var(--primary)] text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          {dict.all}
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              activeCategory === cat
                ? "bg-[var(--primary)] text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {getDisplayName(cat)}
          </button>
        ))}
      </div>

      {searching && (
        <p className="text-sm text-gray-500 mb-6" aria-live="polite">
          {isZh
            ? `找到 ${filtered.length} 篇与「${query.trim()}」相关的文章`
            : `${filtered.length} post${filtered.length === 1 ? "" : "s"} matching “${query.trim()}”`}
        </p>
      )}

      {/* Posts grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((post) => (
            <BlogCard key={post.slug} post={post} lang={lang} categoryMap={categoryMap} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-400">
            {searching
              ? isZh
                ? "没有找到相关文章，换个关键词试试，或者切到「全部」分类。"
                : "No matching posts. Try another keyword or switch to “All”."
              : dict.noPosts}
          </p>
          {searching && (
            <button type="button" onClick={() => onSearch("")} className="mt-3 text-sm text-[var(--primary)] hover:underline">
              {isZh ? "清空搜索" : "Clear search"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
