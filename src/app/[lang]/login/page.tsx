import type { Metadata } from "next";
import { Suspense } from "react";
import LoginClient from "./LoginClient";

const SITE_URL = "https://jasonzhu.ai";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const isZh = lang !== "en";
  return {
    title: isZh ? "登录 — GoSail Club" : "Sign in — GoSail Club",
    description: isZh ? "登录查看你的 GoSail Club 会员中心。" : "Sign in to your GoSail Club dashboard.",
    robots: { index: false, follow: false },
    alternates: {
      canonical: `${SITE_URL}/${lang}/login`,
      languages: { zh: `${SITE_URL}/zh/login`, "x-default": `${SITE_URL}/zh/login` },
    },
  };
}

export default async function LoginPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return (
    <Suspense>
      <LoginClient lang={lang === "en" ? "en" : "zh"} />
    </Suspense>
  );
}
