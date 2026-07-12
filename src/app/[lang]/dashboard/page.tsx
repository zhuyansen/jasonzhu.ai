import type { Metadata } from "next";
import DashboardClient from "./DashboardClient";

const SITE_URL = "https://jasonzhu.ai";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const isZh = lang !== "en";
  return {
    title: isZh ? "会员中心 — GoSail Club" : "Dashboard — GoSail Club",
    description: isZh
      ? "GoSail Club 会员中心：会员状态、Hub Key、权益入口。"
      : "GoSail Club member dashboard.",
    robots: { index: false, follow: false },
    alternates: {
      canonical: `${SITE_URL}/${lang}/dashboard`,
      languages: {
        zh: `${SITE_URL}/zh/dashboard`,
        "x-default": `${SITE_URL}/zh/dashboard`,
      },
    },
  };
}

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return <DashboardClient lang={lang === "en" ? "en" : "zh"} />;
}
