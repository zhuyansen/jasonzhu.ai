"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase-browser";

interface Props {
  lang: "zh" | "en";
  /** 移动端触发按钮用更紧凑的尺寸 */
  compact?: boolean;
}

interface Identity {
  avatarUrl: string | null;
  name: string;
  email: string;
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 18 18">
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18z" />
      <path fill="#FBBC05" d="M3.97 10.72A5.4 5.4 0 0 1 3.68 9c0-.6.1-1.18.29-1.72V4.95H.96A9 9 0 0 0 0 9c0 1.45.35 2.83.96 4.05l3.01-2.33z" />
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.59-2.59C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z" />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
    </svg>
  );
}

function Avatar({ identity, size = 32 }: { identity: Identity; size?: number }) {
  if (identity.avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- 外部 OAuth 头像，不走 next/image 域名白名单
      <img
        src={identity.avatarUrl}
        alt={identity.name}
        width={size}
        height={size}
        className="rounded-full shrink-0 object-cover"
        style={{ width: size, height: size }}
      />
    );
  }
  const initial = (identity.name || identity.email || "?").trim().charAt(0).toUpperCase();
  return (
    <div
      className="rounded-full shrink-0 bg-[var(--primary)] text-white flex items-center justify-center font-semibold"
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {initial}
    </div>
  );
}

export default function AccountMenu({ lang, compact = false }: Props) {
  const isZh = lang === "zh";
  const [open, setOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [identity, setIdentity] = useState<Identity>({ avatarUrl: null, name: "", email: "" });
  const [oauthLoading, setOauthLoading] = useState<"google" | "github" | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createClient();
    const applySession = (session: { user: { email?: string | null; user_metadata?: Record<string, unknown> } } | null) => {
      setLoggedIn(Boolean(session));
      if (session) {
        const meta = session.user.user_metadata || {};
        setIdentity({
          avatarUrl: (meta.avatar_url as string) || (meta.picture as string) || null,
          name: (meta.full_name as string) || (meta.name as string) || (meta.user_name as string) || "",
          email: session.user.email || "",
        });
      }
    };
    supabase.auth.getSession().then(({ data: { session } }) => applySession(session));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => applySession(session));
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function signIn(provider: "google" | "github") {
    setOauthLoading(provider);
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback?next=/${lang}/dashboard` },
    });
  }

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = `/${lang}`;
  }

  return (
    <div className="relative" ref={ref}>
      {loggedIn ? (
        <button
          onClick={() => setOpen((v) => !v)}
          className="block rounded-full ring-2 ring-transparent hover:ring-blue-100 transition-all"
          aria-label={isZh ? "会员菜单" : "Account menu"}
        >
          <Avatar identity={identity} size={compact ? 28 : 32} />
        </button>
      ) : (
        <button
          onClick={() => setOpen((v) => !v)}
          className={`rounded-lg font-semibold shadow-sm transition-all bg-[var(--primary)] text-white hover:opacity-90 hover:shadow ${
            compact ? "px-2.5 py-1 text-xs" : "px-4 py-1.5 text-xs"
          }`}
        >
          {isZh ? (compact ? "登录" : "会员登录") : "Sign in"}
        </button>
      )}

      {open && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden z-50">
          {loggedIn ? (
            <>
              <div className="flex items-center gap-2.5 px-3.5 py-3 border-b border-gray-100">
                <Avatar identity={identity} size={36} />
                <div className="min-w-0">
                  {identity.name && (
                    <div className="text-sm font-medium text-gray-900 truncate">{identity.name}</div>
                  )}
                  <div className="text-xs text-gray-400 truncate">{identity.email}</div>
                </div>
              </div>
              <div className="p-2">
                <Link
                  href={`/${lang}/dashboard`}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  📊 {isZh ? "会员中心" : "Dashboard"}
                </Link>
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors text-left"
                >
                  {isZh ? "退出登录" : "Sign out"}
                </button>
              </div>
            </>
          ) : (
            <div className="p-2">
              <button
                onClick={() => signIn("google")}
                disabled={oauthLoading !== null}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <GoogleIcon />
                {oauthLoading === "google" ? (isZh ? "跳转中…" : "Redirecting…") : (isZh ? "使用 Google 登录" : "Continue with Google")}
              </button>
              <button
                onClick={() => signIn("github")}
                disabled={oauthLoading !== null}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <GitHubIcon />
                {oauthLoading === "github" ? (isZh ? "跳转中…" : "Redirecting…") : (isZh ? "使用 GitHub 登录" : "Continue with GitHub")}
              </button>
              <div className="border-t border-gray-100 my-1" />
              <Link
                href={`/${lang}/login`}
                onClick={() => setOpen(false)}
                className="block px-3 py-2 rounded-lg text-xs text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
              >
                {isZh ? "其他方式登录 →" : "Other sign-in options →"}
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
