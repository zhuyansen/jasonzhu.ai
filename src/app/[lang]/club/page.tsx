import type { Metadata } from "next";
import ClubClient from "./ClubClient";
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
    title: isZh
      ? "GoSail Club 启航会 — AI 出海实战社群"
      : "GoSail Club — AI Going-Global Community",
    description: isZh
      ? "Jason Zhu 发起的 AI 出海实战社群：出海资源库、闭门案例拆解、结构化资源对接、1v1 出海陪跑。从内容读者到出海合伙人，三层会员体系。"
      : "Jason Zhu's hands-on community for AI builders going global: resource library, closed-door case studies, structured matchmaking, and 1-on-1 advisory.",
    alternates: {
      canonical: `${SITE_URL}/${lang}/club`,
      languages: {
        zh: `${SITE_URL}/zh/club`,
        en: `${SITE_URL}/en/club`,
        "x-default": `${SITE_URL}/zh/club`,
      },
    },
  };
}

export default async function ClubPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ ref?: string }>;
}) {
  const { lang } = await params;
  const { ref } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isMember = false;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    isMember = Boolean(profile && profile.role !== "free");
  }

  return (
    <ClubClient
      lang={lang === "en" ? "en" : "zh"}
      initialEmail={user?.email ?? ""}
      suggestedGithub={typeof user?.user_metadata?.user_name === "string" ? user.user_metadata.user_name : ""}
      isLoggedIn={Boolean(user)}
      isMember={isMember}
      initialRef={typeof ref === "string" ? ref : ""}
    />
  );
}
