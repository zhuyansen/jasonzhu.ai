import type { Metadata } from "next";
import DashboardClient from "./DashboardClient";
import { createClient } from "@/lib/supabase-server";
import { getSupabase } from "@/lib/supabase";
import { ensureRefCode, listReferrals, summarize, type ReferralView } from "@/lib/referrals";

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

interface Profile {
  role: string;
  github_username: string | null;
  hub_key: string | null;
  activated_at: string | null;
  expires_at: string | null;
}

/**
 * 老会员（走 /club/activate 非登录流程激活过）第一次用 Google/GitHub 登录时，
 * profiles 是新建的空白行（role='free'）。按邮箱去 member_codes 找一条已激活记录，
 * 找到就直接把会员状态“认领”过来，不用让他们重新输码（重输也会因为码已用过而失败）。
 */
async function claimLegacyActivation(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  email: string
): Promise<Profile | null> {
  try {
    const admin = getSupabase();
    const { data: legacy } = await admin
      .from("member_codes")
      .select("github_username, hub_key, activated_at, expires_at")
      .eq("email", email)
      .eq("status", "activated")
      .order("activated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!legacy) return null;

    const { data: updated } = await supabase
      .from("profiles")
      .update({
        role: "member",
        github_username: legacy.github_username,
        hub_key: legacy.hub_key,
        activated_at: legacy.activated_at,
        expires_at: legacy.expires_at,
      })
      .eq("id", userId)
      .select("role, github_username, hub_key, activated_at, expires_at")
      .single();

    return updated;
  } catch {
    return null;
  }
}

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile: Profile | null = null;
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("role, github_username, hub_key, activated_at, expires_at")
      .eq("id", user.id)
      .single();
    profile = data;

    if (profile && profile.role === "free" && user.email) {
      const claimed = await claimLegacyActivation(supabase, user.id, user.email);
      if (claimed) profile = claimed;
    }
  }

  // 分销：只有已激活会员才有推荐码；顺手把反查映射写进 KV（用户拿到链接的时刻）
  let referral: { code: string; list: ReferralView[]; count: number; pending: number; settled: number } | null = null;
  const isMember = Boolean(profile && profile.role !== "free" && profile.hub_key);
  if (user?.email && isMember) {
    try {
      const code = await ensureRefCode(user.email);
      const list = await listReferrals(code);
      referral = { code, list, ...summarize(list) };
    } catch {
      referral = null;
    }
  }

  return (
    <DashboardClient
      lang={lang === "en" ? "en" : "zh"}
      initialUser={user ? { id: user.id, email: user.email ?? null } : null}
      initialProfile={profile}
      suggestedGithub={typeof user?.user_metadata?.user_name === "string" ? user.user_metadata.user_name : ""}
      referral={referral}
    />
  );
}
