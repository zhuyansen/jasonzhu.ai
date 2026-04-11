"use client";

import { useState } from "react";

interface Tool {
  name: string;
  description: string;
  category: string;
  url: string;
  tags: string[];
}

interface ToolsClientProps {
  tools: Tool[];
  categories: string[];
  lang: string;
}

export default function ToolsClient({ tools, categories, lang }: ToolsClientProps) {
  const allLabel = categories[0]; // "All" or "全部" is always first
  const [activeCategory, setActiveCategory] = useState(allLabel);

  const filtered =
    activeCategory === allLabel
      ? tools
      : tools.filter((t) => t.category === activeCategory);

  return (
    <>
      {/* Category filter */}
      <div className="flex flex-wrap gap-2 mb-8">
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
            {cat}
          </button>
        ))}
      </div>

      {/* Tools grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((tool) => (
          <a
            key={tool.name}
            href={tool.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group block bg-white rounded-xl border border-gray-100 p-6 hover:border-gray-200 hover:shadow-sm transition-all"
          >
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-[var(--primary)] transition-colors">
                {tool.name}
              </h3>
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                {tool.category}
              </span>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed mb-3">
              {tool.description}
            </p>
            <div className="flex flex-wrap gap-1">
              {tool.tags.map((tag) => (
                <span key={tag} className="text-xs text-gray-400">
                  #{tag}
                </span>
              ))}
            </div>
          </a>
        ))}
      </div>
    </>
  );
}
