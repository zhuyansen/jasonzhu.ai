import type { Metadata } from "next";
import ActivateClient from "./ActivateClient";

const SITE_URL = "https://jasonzhu.ai";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const isZh = lang !== "en";
  return {
    title: isZh ? "会员开通 — GoSail Club" : "Activate — GoSail Club",
    description: isZh
      ? "输入兑换码，30 秒自动开通 GoSail Club 全部会员权益。"
      : "Enter your code to activate GoSail Club membership.",
    robots: { index: false, follow: false },
    alternates: {
      canonical: `${SITE_URL}/${lang}/club/activate`,
      languages: {
        zh: `${SITE_URL}/zh/club/activate`,
        "x-default": `${SITE_URL}/zh/club/activate`,
      },
    },
  };
}

export default async function ActivatePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return <ActivateClient lang={lang === "en" ? "en" : "zh"} />;
}
