import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Locale } from "@/lib/dictionaries";
import { getAllDigests, getDigestBySlug } from "@/lib/news";

const SITE_URL = "https://jasonzhu.ai";

const categoryConfig: Record<string, { color: string; icon: string }> = {
  "Skills 生态": { color: "bg-purple-50 text-purple-700", icon: "🔥" },
  "出海实战": { color: "bg-orange-50 text-orange-700", icon: "🚀" },
  "AI 工具动态": { color: "bg-blue-50 text-blue-700", icon: "🛠️" },
};

export async function generateStaticParams() {
  const digests = getAllDigests();
  const params: { lang: string; slug: string }[] = [];
  for (const d of digests) {
    params.push({ lang: "zh", slug: d.slug });
    params.push({ lang: "en", slug: d.slug });
  }
  return params;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}): Promise<Metadata> {
  const { lang: rawLang, slug } = await params;
  const lang = (rawLang === "en" ? "en" : "zh") as Locale;
  const digest = getDigestBySlug(slug);
  if (!digest) return { title: "Not Found" };

  return {
    title: digest.title,
    description: digest.jasonSays || `AI 快讯 ${digest.date}`,
    alternates: {
      canonical: `${SITE_URL}/${lang}/news/${slug}`,
      languages: {
        zh: `${SITE_URL}/zh/news/${slug}`,
        en: `${SITE_URL}/en/news/${slug}`,
      },
    },
  };
}

export default async function NewsDetailPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang: rawLang, slug } = await params;
  const lang = (rawLang === "en" ? "en" : "zh") as Locale;
  const isZh = lang === "zh";

  const digest = getDigestBySlug(slug);
  if (!digest) notFound();

  // Find prev/next digests for navigation
  const allDigests = getAllDigests();
  const currentIndex = allDigests.findIndex((d) => d.slug === slug);
  const prevDigest = currentIndex < allDigests.length - 1 ? allDigests[currentIndex + 1] : null;
  const nextDigest = currentIndex > 0 ? allDigests[currentIndex - 1] : null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-400 mb-8">
        <Link href={`/${lang}/news`} className="hover:text-blue-600 transition-colors">
          {isZh ? "AI 快讯" : "AI News"}
        </Link>
        <span>/</span>
        <span className="text-gray-600">{digest.title}</span>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          {digest.title}
        </h1>
        <time className="text-sm text-gray-400">{digest.date}</time>
      </div>

      {/* Jason Says — top highlight */}
      {digest.jasonSays && (
        <div className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100">
          <div className="flex items-start gap-3">
            <span className="text-xl">💡</span>
            <div>
              <p className="text-xs font-semibold text-blue-700 mb-1.5">Jason {isZh ? "说" : "Says"}</p>
              <p className="text-sm text-gray-700 leading-relaxed">{digest.jasonSays}</p>
            </div>
          </div>
        </div>
      )}

      {/* News items */}
      <div className="space-y-4">
        {digest.items.map((item, idx) => {
          const cfg = categoryConfig[item.category] || {
            color: "bg-gray-50 text-gray-700",
            icon: "📌",
          };
          return (
            <article
              key={idx}
              className="group border border-gray-100 rounded-xl p-5 hover:border-gray-200 hover:shadow-sm transition-all"
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
                  <h2 className="text-base font-semibold text-gray-900 mb-1.5">
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
                  </h2>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {item.summary}
                  </p>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* Prev / Next navigation */}
      <div className="mt-12 flex items-center justify-between border-t border-gray-100 pt-6">
        {prevDigest ? (
          <Link
            href={`/${lang}/news/${prevDigest.slug}`}
            className="group flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 transition-colors"
          >
            <span className="text-lg group-hover:-translate-x-0.5 transition-transform">&larr;</span>
            <div>
              <p className="text-xs text-gray-400">{isZh ? "上一期" : "Previous"}</p>
              <p className="font-medium">{prevDigest.title}</p>
            </div>
          </Link>
        ) : (
          <div />
        )}
        {nextDigest ? (
          <Link
            href={`/${lang}/news/${nextDigest.slug}`}
            className="group flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 transition-colors text-right"
          >
            <div>
              <p className="text-xs text-gray-400">{isZh ? "下一期" : "Next"}</p>
              <p className="font-medium">{nextDigest.title}</p>
            </div>
            <span className="text-lg group-hover:translate-x-0.5 transition-transform">&rarr;</span>
          </Link>
        ) : (
          <div />
        )}
      </div>

      {/* Subscribe CTA */}
      <div className="mt-12 text-center border-t border-gray-100 pt-10">
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
