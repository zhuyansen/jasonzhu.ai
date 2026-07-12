import type { Metadata } from "next";
import CourseClient from "./CourseClient";
import { createClient } from "@/lib/supabase-server";
import courseData from "@/generated/course.json";

const SITE_URL = "https://jasonzhu.ai";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const isZh = lang !== "en";
  return {
    title: `${courseData.title} — GoSail Club`,
    description: isZh
      ? "GoSail Club 会员专属：X/Twitter 增长实战视频课，配中文逐字稿。"
      : "GoSail Club members-only growth video course.",
    robots: { index: false, follow: false },
    alternates: {
      canonical: `${SITE_URL}/${lang}/club/course`,
      languages: {
        zh: `${SITE_URL}/zh/club/course`,
        "x-default": `${SITE_URL}/zh/club/course`,
      },
    },
  };
}

export default async function CoursePage({
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
    <CourseClient
      lang={lang === "en" ? "en" : "zh"}
      isLoggedIn={Boolean(user)}
      isMember={isMember}
      course={courseData}
    />
  );
}
