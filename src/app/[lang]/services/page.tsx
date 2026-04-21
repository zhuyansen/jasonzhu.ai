import type { Metadata } from "next";
import Link from "next/link";
import { getDictionary, type Locale } from "@/lib/dictionaries";
import CopyWechatButton from "@/components/CopyWechatButton";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang: rawLang } = await params;
  const lang = (rawLang === "en" ? "en" : "zh") as Locale;
  const dict = await getDictionary(lang);
  return {
    title: dict.services.title,
    description: dict.services.desc,
    alternates: {
      canonical: `https://jasonzhu.ai/${lang}/services`,
      languages: { zh: "https://jasonzhu.ai/zh/services", en: "https://jasonzhu.ai/en/services" },
    },
  };
}

export default async function ServicesPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang: rawLang } = await params;
  const lang = (rawLang === "en" ? "en" : "zh") as Locale;
  const dict = await getDictionary(lang);

  const services = dict.services.items;

  const isZh = lang === "zh";
  const wechatId = "GoSail_AI";

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{dict.services.title}</h1>
      <p className="text-gray-500 mb-6">
        {dict.services.desc}
      </p>

      {/* Top contact bar — 显眼联系入口 */}
      <div className="mb-12 rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">💬</span>
              <h2 className="text-base font-semibold text-gray-900">
                {isZh ? "直接联系我，聊聊你的需求" : "Reach out directly to discuss your needs"}
              </h2>
            </div>
            <p className="text-xs text-gray-500">
              {isZh
                ? "企业培训 / KOL 合作 / 技术咨询，工作日通常当天回复"
                : "Training, partnerships, consulting — usually respond within 1 business day"}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <a
              href="https://x.com/GoSailGlobal"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-gray-900 text-white rounded-lg text-xs font-medium hover:bg-gray-800 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              X / Twitter
            </a>
            <CopyWechatButton wechatId={wechatId} isZh={isZh} />
            <Link
              href={`/${lang}/about`}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-50 transition-colors"
            >
              {isZh ? "更多方式" : "More"}
            </Link>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {services.map((service) => (
          <div
            key={service.title}
            className="bg-white rounded-2xl border border-gray-100 p-8 md:p-10"
          >
            <div className="flex items-start gap-4 mb-6">
              <div className="text-4xl">{service.icon}</div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {service.title}
                </h2>
                <p className="mt-2 text-gray-600 leading-relaxed">
                  {service.description}
                </p>
              </div>
            </div>

            <div className="ml-0 md:ml-16">
              <ul className="space-y-2 mb-6">
                {service.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-2 text-sm text-gray-600"
                  >
                    <svg
                      className="w-4 h-4 text-[var(--primary)] mt-0.5 shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
              <p className="text-sm text-[var(--primary)] font-medium">
                {service.highlight.includes("gosaillab.com") ? (
                  <>
                    {service.highlight.split("gosaillab.com")[0]}
                    <a href="https://gosaillab.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-[var(--primary-dark)]">gosaillab.com</a>
                    {service.highlight.split("gosaillab.com")[1]}
                  </>
                ) : (
                  service.highlight
                )}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="mt-12 text-center">
        <h3 className="text-xl font-bold text-gray-900 mb-3">
          {dict.services.ctaTitle}
        </h3>
        <p className="text-gray-500 mb-6">
          {dict.services.ctaDesc}
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <a
            href="https://x.com/GoSailGlobal"
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 bg-[var(--primary)] text-white rounded-lg text-sm font-medium hover:bg-[var(--primary-dark)] transition-colors"
          >
            {dict.services.ctaDM}
          </a>
          <CopyWechatButton wechatId={wechatId} isZh={isZh} />
          <Link
            href={`/${lang}/about`}
            className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            {dict.services.ctaMore}
          </Link>
        </div>
      </div>
    </div>
  );
}
