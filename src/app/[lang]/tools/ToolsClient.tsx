"use client";

import { useState } from "react";

interface Tool {
  name: string;
  description: string;
  category: string;
  url: string;
  tags: string[];
  xUrl?: string;
}

interface ToolsClientProps {
  tools: Tool[];
  categories: string[];
  lang: string;
}

export default function ToolsClient({ tools, categories }: ToolsClientProps) {
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
          <div
            key={tool.name}
            className="group block bg-white rounded-xl border border-gray-100 p-6 hover:border-gray-200 hover:shadow-sm transition-all"
          >
            <div className="flex items-start justify-between mb-3">
              <a
                href={tool.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-lg font-semibold text-gray-900 group-hover:text-[var(--primary)] transition-colors hover:underline"
              >
                {tool.name}
              </a>
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500 shrink-0 ml-2">
                {tool.category}
              </span>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed mb-3">
              {tool.description.replace(/\s*X:\s*@\w+\s*$/, "")}
            </p>
            <div className="flex items-center justify-between">
              <div className="flex flex-wrap gap-1">
                {tool.tags.map((tag) => (
                  <span key={tag} className="text-xs text-gray-400">
                    #{tag}
                  </span>
                ))}
              </div>
              {tool.xUrl && (
                <a
                  href={tool.xUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-gray-900 transition-colors shrink-0 ml-2"
                  title="X / Twitter"
                  onClick={(e) => e.stopPropagation()}
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
