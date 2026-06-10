import type { Metadata } from "next";
import type { Locale } from "@/lib/dictionaries";
import AiLearningGuideClient from "./AiLearningGuideClient";

const SITE_URL = "https://jasonzhu.ai";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang: rawLang } = await params;
  const lang = (rawLang === "en" ? "en" : "zh") as Locale;
  const isZh = lang === "zh";
  const title = isZh
    ? "10 大平台 AI 免费学习全景图（免费 PDF）"
    : "The Complete Map of Free AI Learning (Free PDF)";
  const description = isZh
    ? "Anthropic、OpenAI、Google、NVIDIA、微软、AWS、Meta、IBM、DeepLearning.AI、Hugging Face——10 大平台官方免费 AI 课程完整路径，订阅免费领取 PDF。"
    : "10 major platforms' official free AI courses, complete learning paths in one PDF. Subscribe to download free.";

  return {
    title,
    description,
    alternates: {
      canonical: `${SITE_URL}/${lang}/ai-learning-guide`,
      languages: {
        zh: `${SITE_URL}/zh/ai-learning-guide`,
        en: `${SITE_URL}/en/ai-learning-guide`,
        "x-default": `${SITE_URL}/zh/ai-learning-guide`,
      },
    },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/${lang}/ai-learning-guide`,
      images: [{ url: `${SITE_URL}/ai-learning-guide-preview/page-1.png`, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${SITE_URL}/ai-learning-guide-preview/page-1.png`],
    },
  };
}

export default async function AiLearningGuidePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang: rawLang } = await params;
  const lang = (rawLang === "en" ? "en" : "zh") as Locale;
  return <AiLearningGuideClient lang={lang} />;
}
