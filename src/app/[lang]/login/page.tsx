import type { Metadata } from "next";
import { Suspense } from "react";
import LoginClient from "./LoginClient";
import { withSocialCards } from "@/lib/social";

const SITE_URL = "https://jasonzhu.ai";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const isZh = lang !== "en";
  return withSocialCards({
    title: isZh ? "登录 — GoSail Club" : "Sign in — GoSail Club",
    description: isZh ? "登录查看你的 GoSail Club 会员中心。" : "Sign in to your GoSail Club dashboard.",
    robots: { index: false, follow: false },
    alternates: {
      canonical: `${SITE_URL}/${lang}/login`,
      languages: {
        zh: `${SITE_URL}/zh/login`,
        en: `${SITE_URL}/en/login`,
        "x-default": `${SITE_URL}/en/login`,
      },
    },
  }, lang);
}

export default async function LoginPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const resolvedLang = lang === "en" ? "en" : "zh";
  const isZh = resolvedLang === "zh";
  return (
    <Suspense
      fallback={
        <div className="max-w-sm mx-auto px-4 sm:px-6 py-20">
          <div className="text-center mb-10">
            <span className="text-4xl">⛵</span>
            <h1 className="text-2xl font-bold text-gray-900 mt-4 mb-2">
              {isZh ? "登录 GoSail Club" : "Sign in to GoSail Club"}
            </h1>
            <p className="text-sm text-gray-400">
              {isZh ? "查看会员状态、Hub Key 和权益入口" : "View your membership, Hub Key, and benefits"}
            </p>
          </div>
        </div>
      }
    >
      <LoginClient lang={resolvedLang} />
    </Suspense>
  );
}
