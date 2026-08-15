import type { Metadata } from "next";
import ActivateClient from "./ActivateClient";
import { createClient } from "@/lib/supabase-server";

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
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ code?: string }>;
}) {
  const { lang } = await params;
  const { code } = await searchParams;

  // 读登录态：已登录就把邮箱锁定到账号邮箱，激活记录直接绑定当前账号；
  // 未登录则页面主 CTA 引导先注册/登录（用户反馈：先激活后注册容易绑不上）
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <ActivateClient
      lang={lang === "en" ? "en" : "zh"}
      isLoggedIn={Boolean(user)}
      userEmail={user?.email ?? ""}
      initialCode={typeof code === "string" ? code : ""}
    />
  );
}
