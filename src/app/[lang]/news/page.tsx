import type { Metadata } from "next";
import { getDictionary, type Locale } from "@/lib/dictionaries";

interface NewsItem {
  id: string;
  title: string;
  source: string;
  category: string;
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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang: rawLang } = await params;
  const lang = (rawLang === "en" ? "en" : "zh") as Locale;
  const dict = await getDictionary(lang);
  return {
    title: dict.news.title,
    description: dict.news.desc,
    alternates: {
      canonical: `https://jasonzhu.ai/${lang}/news`,
      languages: { zh: "https://jasonzhu.ai/zh/news", en: "https://jasonzhu.ai/en/news" },
    },
  };
}

// Group news by date
function groupByDate(items: NewsItem[]): Record<string, NewsItem[]> {
  const groups: Record<string, NewsItem[]> = {};
  for (const item of items) {
    if (!groups[item.date]) groups[item.date] = [];
    groups[item.date].push(item);
  }
  return groups;
}

export default async function NewsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang: rawLang } = await params;
  const lang = (rawLang === "en" ? "en" : "zh") as Locale;
  const dict = await getDictionary(lang);

  const newsItems = dict.news.items as unknown as NewsItem[];
  const categories = dict.news.categories as unknown as Record<string, string>;
  const grouped = groupByDate(newsItems);
  const dates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{dict.news.title}</h1>
      <p className="text-gray-500 mb-10">{dict.news.desc}</p>

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
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${categoryColors[item.category] || "bg-gray-50 text-gray-700"}`}>
                      {categories[item.category] || item.category}
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
