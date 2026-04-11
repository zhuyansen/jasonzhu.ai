import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI 快讯",
  description: "每日精选AI行业动态、产品发布、研究突破",
};

interface NewsItem {
  id: string;
  title: string;
  source: string;
  category: "产品" | "研究" | "动态" | "文章";
  date: string;
  url?: string;
  summary: string;
}

const categoryColors: Record<string, string> = {
  "产品": "bg-blue-50 text-blue-700",
  "研究": "bg-purple-50 text-purple-700",
  "动态": "bg-green-50 text-green-700",
  "文章": "bg-orange-50 text-orange-700",
};

// Sample news data
const newsItems: NewsItem[] = [
  {
    id: "1",
    title: "Claude 4.5 发布：更强的编程能力与多模态理解",
    source: "Anthropic",
    category: "产品",
    date: "2026-04-10",
    summary: "Anthropic发布Claude 4.5，在编程、数学推理和多模态理解方面取得显著提升，Claude Code也同步更新。",
  },
  {
    id: "2",
    title: "GPT-5 即将发布：OpenAI 透露最新进展",
    source: "OpenAI",
    category: "动态",
    date: "2026-04-09",
    summary: "OpenAI CEO Sam Altman在最新访谈中透露GPT-5的研发进展，预计将在推理能力上实现重大突破。",
  },
  {
    id: "3",
    title: "Midjourney V7 上线：支持实时视频生成",
    source: "Midjourney",
    category: "产品",
    date: "2026-04-08",
    summary: "Midjourney推出V7版本，首次支持从文本直接生成短视频，画面质量和一致性大幅提升。",
  },
  {
    id: "4",
    title: "Google DeepMind 发布新论文：Agent可以自我进化",
    source: "DeepMind",
    category: "研究",
    date: "2026-04-07",
    summary: "DeepMind最新研究展示了一种让AI Agent在执行任务过程中自我改进的方法，无需人类反馈即可持续优化。",
  },
  {
    id: "5",
    title: "Cursor 3.0 发布：多文件编辑能力大幅增强",
    source: "Cursor",
    category: "产品",
    date: "2026-04-06",
    summary: "Cursor IDE发布3.0版本，新增跨文件上下文理解和自动重构功能，编程效率再次提升。",
  },
  {
    id: "6",
    title: "为什么每个AI公司都在做CLI工具？",
    source: "JasonZhu.AI",
    category: "文章",
    date: "2026-04-05",
    summary: "从Claude Code到Codex CLI，AI公司纷纷推出命令行工具。这背后反映了什么趋势？",
  },
];

// Group news by date
function groupByDate(items: NewsItem[]): Record<string, NewsItem[]> {
  const groups: Record<string, NewsItem[]> = {};
  for (const item of items) {
    if (!groups[item.date]) groups[item.date] = [];
    groups[item.date].push(item);
  }
  return groups;
}

export default function NewsPage() {
  const grouped = groupByDate(newsItems);
  const dates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">AI 快讯</h1>
      <p className="text-gray-500 mb-10">每日精选AI行业动态</p>

      <div className="space-y-10">
        {dates.map((date) => (
          <div key={date}>
            <h2 className="text-sm font-medium text-gray-400 mb-4 sticky top-16 bg-white py-2 z-10">
              {date}
            </h2>
            <div className="space-y-4">
              {grouped[date].map((item) => (
                <div
                  key={item.id}
                  className="border border-gray-100 rounded-xl p-5 hover:border-gray-200 hover:shadow-sm transition-all"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${categoryColors[item.category]}`}>
                      {item.category}
                    </span>
                    <span className="text-xs text-gray-400">{item.source}</span>
                  </div>
                  <h3 className="text-base font-semibold text-gray-900 mb-1">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {item.summary}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
