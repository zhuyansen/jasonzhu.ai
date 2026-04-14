"use client";

import { useState } from "react";
import BlogCard from "@/components/BlogCard";
import type { BlogPostMeta } from "@/lib/mdx";
import type { Dictionary } from "@/lib/dictionaries";

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

  const categoryMap = dict.categoryMap as Record<string, string> | undefined;

  const getDisplayName = (cat: string) => {
    if (categoryMap && categoryMap[cat]) return categoryMap[cat];
    return cat;
  };

  const filtered =
    activeCategory === "__all__"
      ? posts
      : posts.filter((p) => p.category === activeCategory);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{dict.title}</h1>
      <p className="text-gray-500 mb-8">{dict.desc}</p>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2 mb-8">
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

      {/* Posts grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((post) => (
            <BlogCard key={post.slug} post={post} lang={lang} categoryMap={categoryMap} />
          ))}
        </div>
      ) : (
        <p className="text-gray-400 text-center py-12">{dict.noPosts}</p>
      )}
    </div>
  );
}
