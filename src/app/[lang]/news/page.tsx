import type { Metadata } from "next";
import Link from "next/link";
import { getDictionary, type Locale } from "@/lib/dictionaries";
import { getAllDigests } from "@/lib/news";
import NewsListClient from "@/components/NewsListClient";

const SITE_URL = "https://jasonzhu.ai";

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

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      {/* Header */}
      <div className="mb-6">
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
      </div>

      {/* Client-side interactive list with search + filter */}
      <NewsListClient digests={digests} lang={lang} />

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
