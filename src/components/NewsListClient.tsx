"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { findCrossLinks } from "@/lib/cross-links";
import type { NewsDigest } from "@/lib/news";

const categoryConfig: Record<string, { color: string; icon: string }> = {
  "Skills 生态": { color: "bg-purple-50 text-purple-700", icon: "🔥" },
  "出海实战": { color: "bg-orange-50 text-orange-700", icon: "🚀" },
  "AI 工具动态": { color: "bg-blue-50 text-blue-700", icon: "🛠️" },
  "变现案例": { color: "bg-green-50 text-green-700", icon: "💰" },
  "AI 论文": { color: "bg-indigo-50 text-indigo-700", icon: "📚" },
};

const ALL_CATEGORIES = ["Skills 生态", "出海实战", "AI 工具动态", "变现案例", "AI 论文"];

interface Props {
  digests: NewsDigest[];
  lang: string;
}

export default function NewsListClient({ digests, lang }: Props) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const isZh = lang === "zh";
  const latest = digests[0] || null;
  const archive = digests.slice(1);

  // Filter latest digest items by search + category
  const filteredLatestItems = useMemo(() => {
    if (!latest) return [];
    return latest.items.filter((item) => {
      const matchesCategory = !activeCategory || item.category === activeCategory;
      const matchesSearch =
        !search ||
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.summary.toLowerCase().includes(search.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [latest, search, activeCategory]);

  // Filter archive digests — show digest if any item matches
  const filteredArchive = useMemo(() => {
    if (!search && !activeCategory) return archive;
    return archive.filter((digest) =>
      digest.items.some((item) => {
        const matchesCategory = !activeCategory || item.category === activeCategory;
        const matchesSearch =
          !search ||
          item.title.toLowerCase().includes(search.toLowerCase()) ||
          item.summary.toLowerCase().includes(search.toLowerCase());
        return matchesCategory && matchesSearch;
      })
    );
  }, [archive, search, activeCategory]);

  return (
    <>
      {/* Search + Filter */}
      <div className="mb-6 space-y-3">
        {/* Search input */}
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={isZh ? "搜索快讯..." : "Search news..."}
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50/50 focus:bg-white focus:border-blue-300 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Category filter pills */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveCategory(null)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              !activeCategory
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {isZh ? "全部" : "All"}
          </button>
          {ALL_CATEGORIES.map((cat) => {
            const cfg = categoryConfig[cat];
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(isActive ? null : cat)}
                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  isActive
                    ? "bg-gray-900 text-white"
                    : `${cfg.color} hover:opacity-80`
                }`}
              >
                <span>{cfg.icon}</span> {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Empty state */}
      {!latest ? (
        <p className="text-gray-400 text-center py-20">
          {isZh ? "暂无快讯" : "No news yet"}
        </p>
      ) : (
        <>
          {/* Latest digest */}
          <section>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-6 bg-blue-600 rounded-full" />
                <h2 className="text-lg font-bold text-gray-900">{latest.title}</h2>
                <span className="text-sm text-gray-400">{latest.date}</span>
              </div>
              <Link
                href={`/${lang}/news/${latest.slug}`}
                className="text-xs text-blue-600 hover:text-blue-700 transition-colors"
              >
                {isZh ? "查看详情 →" : "Details →"}
              </Link>
            </div>

            {/* Filtered items */}
            {filteredLatestItems.length === 0 ? (
              <p className="text-gray-400 text-center py-10 text-sm">
                {isZh ? "没有匹配的快讯" : "No matching news"}
              </p>
            ) : (
              <div className="space-y-3">
                {filteredLatestItems.map((item, idx) => {
                  const cfg = categoryConfig[item.category] || {
                    color: "bg-gray-50 text-gray-700",
                    icon: "📌",
                  };
                  return (
                    <div
                      key={idx}
                      className="group border border-gray-100 rounded-xl p-4 hover:border-gray-200 hover:shadow-sm transition-all"
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-lg mt-0.5 shrink-0">{cfg.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs font-medium ${cfg.color}`}
                            >
                              {item.category}
                            </span>
                            <span className="text-xs text-gray-400">{item.source}</span>
                          </div>
                          <h3 className="text-base font-semibold text-gray-900 mb-1">
                            {item.url ? (
                              <a
                                href={item.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-blue-600 transition-colors"
                              >
                                {item.title}
                                <span className="text-gray-300 ml-1 text-sm">↗</span>
                              </a>
                            ) : (
                              item.title
                            )}
                          </h3>
                          <p className="text-sm text-gray-500 leading-relaxed">{item.summary}</p>
                          <CrossLinks title={item.title} summary={item.summary} lang={lang} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Jason Says */}
            {latest.jasonSays && (
              <div className="mt-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                <div className="flex items-start gap-3">
                  <span className="text-lg">💡</span>
                  <div>
                    <p className="text-xs font-semibold text-blue-700 mb-1">
                      Jason {isZh ? "说" : "Says"}
                    </p>
                    <p className="text-sm text-gray-700 leading-relaxed">{latest.jasonSays}</p>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* Archive */}
          {filteredArchive.length > 0 && (
            <section className="mt-14">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1.5 h-6 bg-gray-300 rounded-full" />
                <h2 className="text-lg font-bold text-gray-900">
                  {isZh ? "往期快讯" : "Archive"}
                </h2>
                <span className="text-sm text-gray-400">
                  {isZh ? `共 ${filteredArchive.length} 期` : `${filteredArchive.length} issues`}
                </span>
              </div>

              <div className="space-y-3">
                {filteredArchive.map((digest) => (
                  <Link
                    key={digest.slug}
                    href={`/${lang}/news/${digest.slug}`}
                    className="group flex items-center gap-4 p-4 border border-gray-100 rounded-xl hover:border-blue-200 hover:bg-blue-50/30 transition-all"
                  >
                    <div className="w-14 h-14 bg-gray-50 group-hover:bg-blue-50 rounded-lg flex flex-col items-center justify-center transition-colors shrink-0">
                      <span className="text-[10px] uppercase tracking-wide text-gray-400 leading-none">
                        {digest.date.split("-")[1]}
                        {isZh ? "月" : ""}
                      </span>
                      <span className="text-xl font-bold text-gray-700 leading-none mt-1">
                        {parseInt(digest.date.split("-")[2])}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                        {digest.title}
                      </h3>
                      <p className="text-xs text-gray-400 mt-1 line-clamp-1">
                        {digest.jasonSays ||
                          `${digest.items.length} ${isZh ? "条快讯" : "items"}`}
                      </p>
                    </div>
                    <div className="hidden sm:flex items-center gap-1 shrink-0">
                      {[...new Set(digest.items.map((i) => i.category))]
                        .slice(0, 4)
                        .map((cat) => {
                          const cfg = categoryConfig[cat];
                          return cfg ? (
                            <span key={cat} className="text-sm" title={cat}>
                              {cfg.icon}
                            </span>
                          ) : null;
                        })}
                    </div>
                    <span className="text-gray-300 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all shrink-0">
                      →
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </>
  );
}

function CrossLinks({ title, summary, lang }: { title: string; summary: string; lang: string }) {
  const crossLinks = findCrossLinks(`${title} ${summary}`, lang);
  if (crossLinks.length === 0) return null;
  return (
    <div className="flex items-center gap-2 mt-2">
      {crossLinks.map((cl) => (
        <Link
          key={cl.href}
          href={cl.href}
          className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full bg-gray-50 text-blue-600 hover:bg-blue-50 transition-colors"
        >
          <span>📎</span> {cl.label}
        </Link>
      ))}
    </div>
  );
}
