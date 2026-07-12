"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase-browser";

interface Props {
  lang: "zh" | "en";
}

export default function LoginClient({ lang }: Props) {
  const isZh = lang === "zh";
  const [loading, setLoading] = useState<"google" | "github" | null>(null);

  async function signIn(provider: "google" | "github") {
    setLoading(provider);
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/${lang}/dashboard`,
      },
    });
  }

  return (
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

      <div className="space-y-3">
        <button
          onClick={() => signIn("google")}
          disabled={loading !== null}
          className="w-full flex items-center justify-center gap-3 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z" />
            <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18z" />
            <path fill="#FBBC05" d="M3.97 10.72A5.4 5.4 0 0 1 3.68 9c0-.6.1-1.18.29-1.72V4.95H.96A9 9 0 0 0 0 9c0 1.45.35 2.83.96 4.05l3.01-2.33z" />
            <path fill="#EA4335" d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.59-2.59C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z" />
          </svg>
          {loading === "google" ? (isZh ? "跳转中…" : "Redirecting…") : (isZh ? "使用 Google 登录" : "Continue with Google")}
        </button>

        <button
          onClick={() => signIn("github")}
          disabled={loading !== null}
          className="w-full flex items-center justify-center gap-3 py-3 bg-gray-900 rounded-xl text-sm font-medium text-white hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
          </svg>
          {loading === "github" ? (isZh ? "跳转中…" : "Redirecting…") : (isZh ? "使用 GitHub 登录" : "Continue with GitHub")}
        </button>
      </div>

      <p className="text-xs text-gray-400 text-center mt-8">
        {isZh ? "还没有会员？" : "Not a member yet? "}
        <a href={`/${lang}/club`} className="text-[var(--primary)] hover:underline">
          {isZh ? "了解 GoSail Club →" : "Learn about GoSail Club →"}
        </a>
      </p>
    </div>
  );
}
