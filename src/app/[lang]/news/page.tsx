import type { Metadata } from "next";
import Link from "next/link";
import { getDictionary, type Locale } from "@/lib/dictionaries";
import { getAllDigests } from "@/lib/news";
import { findCrossLinks } from "@/lib/cross-links";

const SITE_URL = "https://jasonzhu.ai";

const categoryConfig: Record<string, { color: string; icon: string }> = {
  "Skills 生态": { color: "bg-purple-50 text-purple-700", icon: "🔥" },
  "出海实战": { color: "bg-orange-50 text-orange-700", icon: "🚀" },
  "AI 工具动态": { color: "bg-blue-50 text-blue-700", icon: "🛠️" },
  "变现案例": { color: "bg-green-50 text-green-700", icon: "💰" },
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
  const digests = getAllDigests();

  const isZh = lang === "zh";
  const latest = digests[0] || null;
  const archive = digests.slice(1);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {isZh ? "AI 快讯" : "AI News"}
        </h1>
        <div className="flex items-center justify-between">
          <p className="text-gray-500">
            {isZh
              ? "每日精选 AI 行业动态：Skills 生态、出海实战、工具更新"
              : "Daily curated AI updates: Skills ecosystem, going global, tool releases"}
          </p>
          <a
            href="/feed/news.xml"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-orange-600 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors shrink-0"
            title="RSS Feed"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6.503 20.752c0 1.794-1.456 3.248-3.251 3.248-1.796 0-3.252-1.454-3.252-3.248 0-1.794 1.456-3.248 3.252-3.248 1.795.001 3.251 1.454 3.251 3.248zm-6.503-12.572v4.811c6.05.062 10.96 4.966 11.022 11.009h4.817c-.062-8.742-7.115-15.793-15.839-15.82zm0-8.18v4.819c12.951.115 23.408 10.676 23.408 23.752h4.592c0-15.69-12.691-28.49-28-28.571z" />
            </svg>
            RSS
          </a>
        </div>

        {/* Section legend */}
        <div className="flex flex-wrap gap-3 mt-4">
          {["Skills 生态", "出海实战", "AI 工具动态", "变现案例"].map((cat) => {
            const cfg = categoryConfig[cat] || { color: "bg-gray-50 text-gray-700", icon: "📌" };
            return (
              <span key={cat} className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.color}`}>
                <span>{cfg.icon}</span> {cat}
              </span>
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
          {/* ─── Latest digest (full view) ─── */}
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

            {/* News items */}
            <div className="space-y-3">
              {latest.items.map((item, idx) => {
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
                        <p className="text-sm text-gray-500 leading-relaxed">
                          {item.summary}
                        </p>
                        {(() => {
                          const crossLinks = findCrossLinks(
                            `${item.title} ${item.summary}`,
                            lang
                          );
                          return crossLinks.length > 0 ? (
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
                          ) : null;
                        })()}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Jason Says */}
            {latest.jasonSays && (
              <div className="mt-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                <div className="flex items-start gap-3">
                  <span className="text-lg">💡</span>
                  <div>
                    <p className="text-xs font-semibold text-blue-700 mb-1">Jason {isZh ? "说" : "Says"}</p>
                    <p className="text-sm text-gray-700 leading-relaxed">{latest.jasonSays}</p>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* ─── Archive / History ─── */}
          {archive.length > 0 && (
            <section className="mt-14">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1.5 h-6 bg-gray-300 rounded-full" />
                <h2 className="text-lg font-bold text-gray-900">
                  {isZh ? "往期快讯" : "Archive"}
                </h2>
                <span className="text-sm text-gray-400">
                  {isZh ? `共 ${archive.length} 期` : `${archive.length} issues`}
                </span>
              </div>

              <div className="space-y-3">
                {archive.map((digest) => (
                  <Link
                    key={digest.slug}
                    href={`/${lang}/news/${digest.slug}`}
                    className="group flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:border-blue-200 hover:bg-blue-50/30 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      {/* Date badge */}
                      <div className="w-12 h-12 bg-gray-50 group-hover:bg-blue-50 rounded-lg flex flex-col items-center justify-center transition-colors">
                        <span className="text-xs text-gray-400 leading-none">
                          {digest.date.split("-")[1]}{isZh ? "月" : "/"}
                        </span>
                        <span className="text-lg font-bold text-gray-700 leading-none">
                          {parseInt(digest.date.split("-")[2])}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {digest.title}
                        </h3>
                        <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">
                          {digest.jasonSays || `${digest.items.length} ${isZh ? "条快讯" : "items"}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {/* Category pills */}
                      <div className="hidden sm:flex items-center gap-1.5">
                        {[...new Set(digest.items.map((i) => i.category))].slice(0, 3).map((cat) => {
                          const cfg = categoryConfig[cat];
                          return cfg ? (
                            <span key={cat} className="text-xs">{cfg.icon}</span>
                          ) : null;
                        })}
                      </div>
                      <span className="text-xs text-gray-300 group-hover:text-blue-400 transition-colors">→</span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </>
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
