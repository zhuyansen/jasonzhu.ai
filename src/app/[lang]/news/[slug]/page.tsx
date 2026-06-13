import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Locale } from "@/lib/dictionaries";
import { getAllDigests, getDigestBySlug, digestTitle, digestJasonSays } from "@/lib/news";
import { findCrossLinks } from "@/lib/cross-links";
import ShareButtons from "@/components/ShareButtons";

const SITE_URL = "https://jasonzhu.ai";

const categoryConfig: Record<string, { color: string; icon: string; en: string }> = {
  "Skills 生态": { color: "bg-purple-50 text-purple-700", icon: "🔥", en: "Skills" },
  "出海实战": { color: "bg-orange-50 text-orange-700", icon: "🚀", en: "Going Global" },
  "AI 工具动态": { color: "bg-blue-50 text-blue-700", icon: "🛠️", en: "AI Tools" },
  "变现案例": { color: "bg-green-50 text-green-700", icon: "💰", en: "Monetization" },
  "AI 论文": { color: "bg-indigo-50 text-indigo-700", icon: "📚", en: "AI Papers" },
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

  const mTitle = digestTitle(digest, lang);
  const ogImages = digest.coverImage
    ? [{ url: `${SITE_URL}${digest.coverImage}`, width: 1024, height: 1536, alt: mTitle }]
    : undefined;

  // 无英文字段的期数：en 页是中文复制，canonical 指回 zh，
  // 避免 GSC「重复网页，Google 选择的规范网页与用户指定的不同」
  const hasEn = digest.items.some((i) => i.summaryEn);

  return {
    title: mTitle,
    description:
      digestJasonSays(digest, lang) ||
      (lang === "en" ? `AI News ${digest.date}` : `AI 快讯 ${digest.date}`),
    alternates: {
      canonical:
        lang === "en" && !hasEn
          ? `${SITE_URL}/zh/news/${slug}`
          : `${SITE_URL}/${lang}/news/${slug}`,
      languages: hasEn
        ? {
            zh: `${SITE_URL}/zh/news/${slug}`,
            en: `${SITE_URL}/en/news/${slug}`,
            "x-default": `${SITE_URL}/zh/news/${slug}`,
          }
        : {
            zh: `${SITE_URL}/zh/news/${slug}`,
            "x-default": `${SITE_URL}/zh/news/${slug}`,
          },
    },
    openGraph: ogImages ? { images: ogImages, type: "article" } : undefined,
    twitter: ogImages ? { card: "summary_large_image", images: ogImages } : undefined,
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

  const dTitle = digestTitle(digest, lang);
  const dJasonSays = digestJasonSays(digest, lang);

  // Find prev/next digests for navigation
  const allDigests = getAllDigests();
  const currentIndex = allDigests.findIndex((d) => d.slug === slug);
  const prevDigest = currentIndex < allDigests.length - 1 ? allDigests[currentIndex + 1] : null;
  const nextDigest = currentIndex > 0 ? allDigests[currentIndex - 1] : null;

  const newsArticleJsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: dTitle,
    datePublished: digest.date,
    dateModified: digest.date,
    author: { "@type": "Person", name: "Jason Zhu", url: SITE_URL },
    publisher: { "@type": "Person", name: "Jason Zhu", url: SITE_URL },
    mainEntityOfPage: `${SITE_URL}/${lang}/news/${slug}`,
    description: dJasonSays || (isZh ? `AI 快讯 ${digest.date}` : `AI News ${digest.date}`),
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(newsArticleJsonLd) }}
      />
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-400 mb-8">
        <Link href={`/${lang}/news`} className="hover:text-blue-600 transition-colors">
          {isZh ? "AI 快讯" : "AI News"}
        </Link>
        <span>/</span>
        <span className="text-gray-600">{dTitle}</span>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              {dTitle}
            </h1>
            <time className="text-sm text-gray-400">{digest.date}</time>
          </div>
          <ShareButtons
            url={`${SITE_URL}/${lang}/news/${slug}`}
            title={dTitle}
            summary={dJasonSays}
            lang={lang}
          />
        </div>
      </div>

      {/* Cover image */}
      {digest.coverImage && (
        <div className="mb-8 rounded-2xl overflow-hidden border border-gray-100 bg-gray-50">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={digest.coverImage}
            alt={dTitle}
            className="w-full h-auto block"
            loading="lazy"
          />
        </div>
      )}

      {/* Tweet link */}
      {digest.tweetUrl && (
        <div className="mb-8">
          <a
            href={digest.tweetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            {isZh ? "在 X 上查看本期推文" : "View on X"}
            <span className="text-gray-300 text-xs">↗</span>
          </a>
        </div>
      )}

      {/* Jason Says — top highlight */}
      {dJasonSays && (
        <div className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100">
          <div className="flex items-start gap-3">
            <span className="text-xl">💡</span>
            <div>
              <p className="text-xs font-semibold text-blue-700 mb-1.5">Jason {isZh ? "说" : "Says"}</p>
              <p className="text-sm text-gray-700 leading-relaxed">
                {dJasonSays}
              </p>
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
            en: item.category,
          };
          const displayTitle =
            lang === "en" && item.titleEn ? item.titleEn : item.title;
          const displaySummary =
            lang === "en" && item.summaryEn ? item.summaryEn : item.summary;
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
                      {isZh ? item.category : cfg.en || item.category}
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
                        {displayTitle}
                        <span className="text-gray-300 ml-1 text-sm">↗</span>
                      </a>
                    ) : (
                      displayTitle
                    )}
                  </h2>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {displaySummary}
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
            </article>
          );
        })}
      </div>

      {/* 💰 AI 融资速递 */}
      {digest.funding && digest.funding.length > 0 && (
        <div className="mt-8">
          <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span>💰</span>
            {isZh ? "AI 融资速递" : "AI Funding Roundup"}
          </h2>
          <div className="space-y-3">
            {digest.funding.map((f, i) => (
              <div
                key={i}
                className="border border-gray-100 rounded-xl p-4 bg-gradient-to-br from-amber-50/40 to-white"
              >
                <div className="flex items-baseline justify-between gap-3 flex-wrap mb-1.5">
                  <h3 className="text-sm font-semibold text-gray-900">
                    {f.url ? (
                      <a
                        href={f.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-blue-600 transition-colors"
                      >
                        {f.company}
                        <span className="text-gray-300 ml-1 text-xs">↗</span>
                      </a>
                    ) : (
                      f.company
                    )}
                  </h3>
                  <div className="flex items-center gap-1.5 flex-wrap text-xs">
                    {f.round && (
                      <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-medium">
                        {f.round}
                      </span>
                    )}
                    {f.amount && (
                      <span className="px-2 py-0.5 rounded-full bg-green-50 text-green-700 font-semibold">
                        {f.amount}
                      </span>
                    )}
                    {f.valuation && (
                      <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                        {isZh ? "估值 " : "Val. "}
                        {f.valuation}
                      </span>
                    )}
                  </div>
                </div>
                {f.investors && (
                  <p className="text-xs text-gray-400 mb-1">
                    {isZh ? "投资方：" : "Investors: "}
                    {f.investors}
                  </p>
                )}
                {f.pitch && (
                  <p className="text-sm text-gray-600 leading-relaxed">{f.pitch}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

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
              <p className="font-medium">{digestTitle(prevDigest, lang)}</p>
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
              <p className="font-medium">{digestTitle(nextDigest, lang)}</p>
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
