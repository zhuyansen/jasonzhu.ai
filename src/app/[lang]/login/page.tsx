import type { Metadata } from "next";
import { Suspense } from "react";
import LoginClient from "./LoginClient";
import { withSocialCards } from "@/lib/social";

// 登录页 noindex, nofollow，不写 canonical：?mode=signup&next=… 这些变体原来 canonical 指回 /login，
// 而 /login 本身 noindex，2026-11-22 站点审计记成 canonical 指向 noindex 页。不收录的页不需要 canonical 和 hreflang。
// alternates 要显式写成空的：不写会继承 [lang]/layout 的 canonical（指向首页）。
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
    alternates: {},
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
