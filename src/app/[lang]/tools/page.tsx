"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";

interface Tool {
  name: string;
  description: string;
  category: string;
  url: string;
  tags: string[];
}

const tools: Tool[] = [
  {
    name: "Claude Code",
    description: "Anthropic出品的AI编程助手CLI工具，支持代码生成、调试、重构等全流程开发任务。",
    category: "编程",
    url: "https://claude.ai/code",
    tags: ["编程", "CLI", "Anthropic"],
  },
  {
    name: "Cursor",
    description: "AI原生代码编辑器，内置AI助手，支持多模型切换，智能代码补全和重构。",
    category: "编程",
    url: "https://cursor.com",
    tags: ["编程", "IDE", "代码补全"],
  },
  {
    name: "Midjourney",
    description: "最流行的AI图像生成工具之一，擅长艺术风格图片生成，V7支持视频。",
    category: "图像",
    url: "https://midjourney.com",
    tags: ["图像生成", "设计", "创意"],
  },
  {
    name: "Runway",
    description: "专业级AI视频生成和编辑工具，支持文本生成视频、图片动画化等功能。",
    category: "视频",
    url: "https://runway.ml",
    tags: ["视频", "创意", "编辑"],
  },
  {
    name: "Perplexity",
    description: "AI驱动的搜索引擎，提供带引用的实时回答，适合快速研究和信息获取。",
    category: "效率",
    url: "https://perplexity.ai",
    tags: ["搜索", "研究", "知识"],
  },
  {
    name: "NotebookLM",
    description: "Google推出的AI笔记工具，上传文档后可以与内容对话，支持生成播客。",
    category: "效率",
    url: "https://notebooklm.google.com",
    tags: ["笔记", "文档", "Google"],
  },
  {
    name: "Suno",
    description: "AI音乐生成平台，输入文字描述即可生成完整歌曲，支持多种音乐风格。",
    category: "音频",
    url: "https://suno.com",
    tags: ["音乐", "音频", "创意"],
  },
  {
    name: "v0.dev",
    description: "Vercel推出的AI UI生成工具，通过自然语言描述生成React组件代码。",
    category: "编程",
    url: "https://v0.dev",
    tags: ["UI", "前端", "React"],
  },
];

const categories = ["全部", "编程", "图像", "视频", "音频", "效率"];

export default function ToolsPage() {
  const pathname = usePathname();
  const lang = pathname.split("/")[1] || "zh";
  const isEn = lang === "en";

  const title = isEn ? "AI Tools" : "AI 工具";
  const desc = isEn ? "Curated useful AI tool recommendations" : "精选实用AI工具推荐";
  const allLabel = isEn ? "All" : "全部";

  const [activeCategory, setActiveCategory] = useState(allLabel);

  const filtered =
    activeCategory === allLabel
      ? tools
      : tools.filter((t) => t.category === activeCategory);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
      <p className="text-gray-500 mb-8">{desc}</p>

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
    </div>
  );
}
