import type { Metadata } from "next";
import SessionsClient from "./SessionsClient";
import { createClient } from "@/lib/supabase-server";
import sessionsData from "@/generated/sessions.json";

const SITE_URL = "https://jasonzhu.ai";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const isZh = lang !== "en";
  return {
    title: `${sessionsData.title} — GoSail Club`,
    description: isZh
      ? "GoSail Club 会员专属：半月度闭门讨论会回放，配中文逐字稿。"
      : "GoSail Club members-only closed-door session recordings.",
    robots: { index: false, follow: false },
    alternates: {
      canonical: `${SITE_URL}/${lang}/club/sessions`,
      languages: {
        zh: `${SITE_URL}/zh/club/sessions`,
        "x-default": `${SITE_URL}/zh/club/sessions`,
      },
    },
  };
}

export default async function SessionsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let role: string | null = null;
  if (user) {
    const { data } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    role = data?.role ?? null;
  }

  const isMember = Boolean(user) && Boolean(role) && role !== "free";

  return (
    <SessionsClient
      lang={lang === "en" ? "en" : "zh"}
      isLoggedIn={Boolean(user)}
      isMember={isMember}
      data={sessionsData}
    />
  );
}
