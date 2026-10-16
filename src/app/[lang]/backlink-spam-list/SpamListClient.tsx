"use client";

import { useMemo, useState } from "react";
import type { SpamEntry } from "@/lib/spam-list";

const PAGE = 100; // 一次先列 100 条，其余点「显示全部」

const CATEGORY_LABEL: Record<string, { zh: string; en: string }> = {
  "link-network": { zh: "站群", en: "link network" },
  "link-seller": { zh: "卖链接", en: "link seller" },
  hacked: { zh: "被黑", en: "hacked" },
  shortener: { zh: "短链", en: "shortener" },
};

export default function SpamListClient({ entries, lang }: { entries: SpamEntry[]; lang: "zh" | "en" }) {
  const isZh = lang === "zh";
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [all, setAll] = useState(false);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return entries.filter(
      (e) =>
        (!category || e.category === category) &&
        (!q || e.domain.includes(q) || e.family.toLowerCase().includes(q) || e.evidence.toLowerCase().includes(q)),
    );
  }, [entries, query, category]);
  const rows = all ? shown : shown.slice(0, PAGE);

  return (
    <section>
      <h2 className="text-lg font-semibold text-gray-900 mb-3">{isZh ? "查一个域名" : "Look a domain up"}</h2>
      <div className="flex flex-col sm:flex-row gap-2 mb-3">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={isZh ? "输入域名、站群或证据里的词" : "A domain, a family, or a word from the evidence"}
          className="flex-1 rounded-xl border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:border-blue-400"
          aria-label={isZh ? "搜索名单" : "Search the list"}
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-700"
          aria-label={isZh ? "按类别筛选" : "Filter by category"}
        >
          <option value="">{isZh ? "全部类别" : "All categories"}</option>
          {Object.entries(CATEGORY_LABEL).map(([key, label]) => (
            <option key={key} value={key}>
              {isZh ? label.zh : label.en}
            </option>
          ))}
        </select>
      </div>
      <p className="text-sm text-gray-500 mb-3">
        {query && shown.length === 0
          ? isZh
            ? `名单里没有「${query}」。没收录不代表没问题：可以用 backlink-guard 查一下，发现站群欢迎举报。`
            : `"${query}" is not on the list. Not listed is not the same as clean: check it with backlink-guard, and report a network you find.`
          : isZh
            ? `${shown.length.toLocaleString()} 条`
            : `${shown.length.toLocaleString()} entries`}
      </p>
      <div className="overflow-x-auto rounded-2xl border border-gray-100">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-left whitespace-nowrap">
            <tr>
              <th className="px-4 py-2 font-medium">{isZh ? "域名" : "Domain"}</th>
              <th className="px-4 py-2 font-medium">{isZh ? "类别" : "Category"}</th>
              <th className="px-4 py-2 font-medium">{isZh ? "证据" : "Evidence"}</th>
              <th className="px-4 py-2 font-medium whitespace-nowrap">{isZh ? "核实" : "Checked"}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((e) => (
              <tr key={e.domain} className="border-t border-gray-100 align-top">
                <td className="px-4 py-2 font-medium text-gray-900 min-w-[11rem] break-words">{e.domain}</td>
                <td className="px-4 py-2 whitespace-nowrap">
                  <span className="inline-block px-2 py-0.5 rounded-full text-xs bg-red-50 text-red-700">
                    {isZh ? (CATEGORY_LABEL[e.category]?.zh ?? e.category) : (CATEGORY_LABEL[e.category]?.en ?? e.category)}
                  </span>
                  {e.family && <div className="text-xs text-gray-400 mt-1">{e.family}</div>}
                </td>
                <td className="px-4 py-2 text-gray-600">
                  {e.evidence}{" "}
                  {e.evidenceUrl && (
                    <a href={e.evidenceUrl} target="_blank" rel="nofollow noopener noreferrer" className="text-blue-600 hover:underline whitespace-nowrap">
                      {isZh ? "去看" : "see it"}
                    </a>
                  )}
                </td>
                <td className="px-4 py-2 text-gray-400 whitespace-nowrap tabular-nums">{e.lastChecked}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!all && shown.length > PAGE && (
        <button
          type="button"
          onClick={() => setAll(true)}
          className="mt-4 px-4 py-2 rounded-full border border-gray-200 text-sm text-gray-700 hover:border-blue-300"
        >
          {isZh ? `显示全部 ${shown.length.toLocaleString()} 条` : `Show all ${shown.length.toLocaleString()}`}
        </button>
      )}
    </section>
  );
}
