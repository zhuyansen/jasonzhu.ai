import type { Metadata } from "next";
import Link from "next/link";
import { getDictionary, type Locale } from "@/lib/dictionaries";

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

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{dict.services.title}</h1>
      <p className="text-gray-500 mb-12">
        {dict.services.desc}
      </p>

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
        <div className="flex justify-center gap-3">
          <a
            href="https://x.com/GoSailGlobal"
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 bg-[var(--primary)] text-white rounded-lg text-sm font-medium hover:bg-[var(--primary-dark)] transition-colors"
          >
            {dict.services.ctaDM}
          </a>
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
