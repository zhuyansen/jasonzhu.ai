import type { Metadata } from "next";
import Link from "next/link";
import { getDictionary, type Locale } from "@/lib/dictionaries";
import { getAllDigests, type NewsDigest, type NewsItem } from "@/lib/news";

const SITE_URL = "https://jasonzhu.ai";

const categoryConfig: Record<string, { color: string; icon: string }> = {
  "Skills 生态": { color: "bg-purple-50 text-purple-700", icon: "🔥" },
  "出海实战": { color: "bg-orange-50 text-orange-700", icon: "🚀" },
  "AI 工具动态": { color: "bg-blue-50 text-blue-700", icon: "🛠️" },
  "Jason 说": { color: "bg-green-50 text-green-700", icon: "💡" },
  // fallback
  "产品": { color: "bg-blue-50 text-blue-700", icon: "📦" },
  "研究": { color: "bg-purple-50 text-purple-700", icon: "🔬" },
  "动态": { color: "bg-green-50 text-green-700", icon: "📢" },
  "文章": { color: "bg-orange-50 text-orange-700", icon: "📝" },
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
    description: (dict.news as any).desc,
    alternates: {
      canonical: `${SITE_URL}/${lang}/news`,
      languages: { zh: `${SITE_URL}/zh/news`, en: `${SITE_URL}/en/news` },
    },
  };
}

export default async function NewsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang: rawLang } = await params;
  const lang = (rawLang === "en" ? "en" : "zh") as Locale;
  const dict = await getDictionary(lang);
  const digests = getAllDigests();

  const isZh = lang === "zh";

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {isZh ? "AI 快讯" : "AI News"}
        </h1>
        <p className="text-gray-500">
          {isZh
            ? "每日精选 AI 行业动态：Skills 生态、出海实战、工具更新"
            : "Daily curated AI updates: Skills ecosystem, going global, tool releases"}
        </p>

        {/* Section legend */}
        <div className="flex flex-wrap gap-3 mt-4">
          {["Skills 生态", "出海实战", "AI 工具动态"].map((cat) => {
            const cfg = categoryConfig[cat] || { color: "bg-gray-50 text-gray-700", icon: "📌" };
            return (
              <span key={cat} className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.color}`}>
                <span>{cfg.icon}</span> {cat}
              </span>
            );
          })}
        </div>
      </div>

      {/* Digests timeline */}
      {digests.length === 0 ? (
        <p className="text-gray-400 text-center py-20">
          {isZh ? "暂无快讯" : "No news yet"}
        </p>
      ) : (
        <div className="space-y-12">
          {digests.map((digest) => (
            <section key={digest.slug}>
              {/* Date header */}
              <div className="flex items-center gap-3 mb-5">
                <h2 className="text-lg font-bold text-gray-900">{digest.title}</h2>
                <span className="text-sm text-gray-400">{digest.date}</span>
              </div>

              {/* News items */}
              <div className="space-y-3">
                {digest.items.map((item, idx) => {
                  const cfg = categoryConfig[item.category] || { color: "bg-gray-50 text-gray-700", icon: "📌" };
                  return (
                    <div
                      key={idx}
                      className="group border border-gray-100 rounded-xl p-4 hover:border-gray-200 hover:shadow-sm transition-all"
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-lg mt-0.5 shrink-0">{cfg.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cfg.color}`}>
                              {item.category}
                            </span>
                            <span className="text-xs text-gray-400">{item.source}</span>
                          </div>
                          <h3 className="text-base font-semibold text-gray-900 mb-1">
                            {item.url ? (
                              <a
                                href={item.url}
                                target={item.url.startsWith("https://jasonzhu.ai") ? undefined : "_blank"}
                                rel={item.url.startsWith("https://jasonzhu.ai") ? undefined : "noopener noreferrer"}
                                className="hover:text-blue-600 transition-colors"
                              >
                                {item.title}
                                {!item.url.startsWith("https://jasonzhu.ai") && (
                                  <span className="text-gray-300 ml-1 text-sm">↗</span>
                                )}
                              </a>
                            ) : (
                              item.title
                            )}
                          </h3>
                          <p className="text-sm text-gray-500 leading-relaxed">
                            {item.summary}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Jason Says */}
              {digest.jasonSays && (
                <div className="mt-4 bg-gradient-to-r from-blue-50 to-blue-50/50 rounded-xl p-4 border border-blue-100">
                  <div className="flex items-start gap-3">
                    <span className="text-lg">💡</span>
                    <div>
                      <p className="text-xs font-semibold text-blue-700 mb-1">Jason 说</p>
                      <p className="text-sm text-gray-700 leading-relaxed">{digest.jasonSays}</p>
                    </div>
                  </div>
                </div>
              )}
            </section>
          ))}
        </div>
      )}

      {/* Subscribe CTA */}
      <div className="mt-16 text-center border-t border-gray-100 pt-10">
        <p className="text-sm text-gray-500 mb-3">
          {isZh
            ? "订阅获取每日 AI 快讯推送 + 免费出海手册"
            : "Subscribe for daily AI updates + free playbook"}
        </p>
        <Link
          href={`/${lang}/handbook`}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          {isZh ? "📘 免费订阅" : "📘 Subscribe Free"}
        </Link>
      </div>
    </div>
  );
}
