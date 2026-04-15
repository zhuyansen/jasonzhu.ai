import type { Metadata } from "next";
import { getDictionary, type Locale } from "@/lib/dictionaries";
import HandbookClient from "./HandbookClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang: rawLang } = await params;
  const lang = (rawLang === "en" ? "en" : "zh") as Locale;
  const dict = await getDictionary(lang);
  return {
    title: dict.handbook?.title || "Handbook",
    description: dict.handbook?.subtitle || "Download the AIP Overseas Social Media Playbook",
    alternates: {
      canonical: `https://jasonzhu.ai/${lang}/handbook`,
      languages: { zh: "https://jasonzhu.ai/zh/handbook", en: "https://jasonzhu.ai/en/handbook" },
    },
  };
}

export default async function HandbookPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang: rawLang } = await params;
  const lang = (rawLang === "en" ? "en" : "zh") as Locale;
  const dict = await getDictionary(lang);

  return <HandbookClient lang={lang} dict={dict} />;
}
