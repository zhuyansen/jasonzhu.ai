import type { Metadata } from "next";
import ResetPasswordClient from "./ResetPasswordClient";
import { withSocialCards } from "@/lib/social";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const isZh = lang !== "en";
  return withSocialCards({
    title: isZh ? "重置密码 — GoSail Club" : "Reset password — GoSail Club",
    robots: { index: false, follow: false },
  }, lang);
}

export default async function ResetPasswordPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return <ResetPasswordClient lang={lang === "en" ? "en" : "zh"} />;
}
