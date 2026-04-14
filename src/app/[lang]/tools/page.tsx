import type { Metadata } from "next";
import { getDictionary, type Locale } from "@/lib/dictionaries";
import ToolsClient from "./ToolsClient";

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
    title: dict.tools.title,
    description: dict.tools.desc,
    alternates: {
      canonical: `${SITE_URL}/${lang}/tools`,
      languages: {
        zh: `${SITE_URL}/zh/tools`,
        en: `${SITE_URL}/en/tools`,
      },
    },
  };
}

export default async function ToolsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang: rawLang } = await params;
  const lang = (rawLang === "en" ? "en" : "zh") as Locale;
  const dict = await getDictionary(lang);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{dict.tools.title}</h1>
      <p className="text-gray-500 mb-8">{dict.tools.desc}</p>

      <ToolsClient
        tools={dict.tools.items}
        categories={dict.tools.categories}
        lang={lang}
      />
    </div>
  );
}
