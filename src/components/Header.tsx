"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import type { Dictionary, Locale } from "@/lib/dictionaries";
import { createClient } from "@/lib/supabase-browser";

interface HeaderProps {
  lang: Locale;
  dict: Dictionary;
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

export default function Header({ lang, dict }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<"google" | "github" | null>(null);
  const pathname = usePathname();
  const accountMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => setLoggedIn(Boolean(session)));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => setLoggedIn(Boolean(session)));
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (accountMenuRef.current && !accountMenuRef.current.contains(e.target as Node)) {
        setAccountMenuOpen(false);
      }
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

  const loginLabel = loggedIn ? (lang === "zh" ? "会员中心" : "Dashboard") : (lang === "zh" ? "会员登录" : "Sign in");
  const loginLabelShort = loggedIn ? (lang === "zh" ? "会员中心" : "Dashboard") : (lang === "zh" ? "登录" : "Sign in");

  const navItems = [
    { href: `/${lang}/blog`, label: dict.nav.blog },
    { href: `/${lang}/news`, label: dict.nav.news, badge: "Beta" },
    { href: `/${lang}/tools`, label: dict.nav.tools },
    { href: `/${lang}/services`, label: dict.nav.services },
    { href: `/${lang}/about`, label: dict.nav.about },
  ];

  // Build the alternate language URL
  const otherLang = lang === "zh" ? "en" : "zh";
  const switchPath = pathname.replace(`/${lang}`, `/${otherLang}`);

  return (
    <header className="border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <Link href={`/${lang}`} className="flex items-center gap-2.5">
            <Image
              src="/avatar.jpg"
              alt="Jason Zhu"
              width={32}
              height={32}
              className="rounded-full"
            />
            <span className="text-lg font-bold text-gray-900">
              Jason<span className="text-[var(--primary)]">Zhu</span>.AI
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors relative ${
                  pathname.startsWith(item.href)
                    ? "text-[var(--primary)] bg-blue-50"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                {item.label}
                {item.badge && (
                  <span className="ml-1 px-1.5 py-0.5 text-[10px] font-semibold leading-none bg-orange-100 text-orange-600 rounded-full align-top">
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}
            {/* 语言切换（放前面、样式弱化，跟登录按钮拉开视觉层级，防误点） */}
            <Link
              href={switchPath}
              className="ml-3 px-2.5 py-1.5 rounded-lg text-xs font-medium text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors"
            >
              {lang === "zh" ? "EN" : "中"}
            </Link>
            {/* 会员登录入口：主色实心按钮，全站视觉最突出的一个 CTA；点击直接下拉展开选项，不用先跳转页面 */}
            <div className="relative ml-1" ref={accountMenuRef}>
              <button
                onClick={() => setAccountMenuOpen((v) => !v)}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition-all ${
                  loggedIn
                    ? "bg-green-50 text-green-700 border border-green-200 hover:bg-green-100"
                    : "bg-[var(--primary)] text-white hover:opacity-90 hover:shadow"
                }`}
              >
                {loggedIn ? `✓ ${loginLabel}` : loginLabel}
              </button>

              {accountMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-gray-100 rounded-xl shadow-lg p-2 z-50">
                  {loggedIn ? (
                    <>
                      <Link
                        href={`/${lang}/dashboard`}
                        onClick={() => setAccountMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        📊 {lang === "zh" ? "会员中心" : "Dashboard"}
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors text-left"
                      >
                        {lang === "zh" ? "退出登录" : "Sign out"}
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => signIn("google")}
                        disabled={oauthLoading !== null}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                      >
                        <GoogleIcon />
                        {oauthLoading === "google" ? (lang === "zh" ? "跳转中…" : "Redirecting…") : (lang === "zh" ? "使用 Google 登录" : "Continue with Google")}
                      </button>
                      <button
                        onClick={() => signIn("github")}
                        disabled={oauthLoading !== null}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                      >
                        <GitHubIcon />
                        {oauthLoading === "github" ? (lang === "zh" ? "跳转中…" : "Redirecting…") : (lang === "zh" ? "使用 GitHub 登录" : "Continue with GitHub")}
                      </button>
                      <div className="border-t border-gray-100 my-1" />
                      <Link
                        href={`/${lang}/login`}
                        onClick={() => setAccountMenuOpen(false)}
                        className="block px-3 py-2 rounded-lg text-xs text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
                      >
                        {lang === "zh" ? "其他方式登录 →" : "Other sign-in options →"}
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>
          </nav>

          {/* Mobile: lang switch + login + menu button */}
          <div className="md:hidden flex items-center gap-2">
            <Link
              href={switchPath}
              className="px-2 py-1 rounded text-xs font-medium text-gray-400"
            >
              {lang === "zh" ? "EN" : "中"}
            </Link>
            <div className="relative">
              <button
                onClick={() => setAccountMenuOpen((v) => !v)}
                className={`px-2.5 py-1 rounded text-xs font-semibold shadow-sm ${
                  loggedIn ? "bg-green-50 text-green-700 border border-green-200" : "bg-[var(--primary)] text-white"
                }`}
              >
                {loggedIn ? `✓ ${loginLabelShort}` : loginLabelShort}
              </button>
              {accountMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-60 bg-white border border-gray-100 rounded-xl shadow-lg p-2 z-50">
                  {loggedIn ? (
                    <>
                      <Link
                        href={`/${lang}/dashboard`}
                        onClick={() => setAccountMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        📊 {lang === "zh" ? "会员中心" : "Dashboard"}
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors text-left"
                      >
                        {lang === "zh" ? "退出登录" : "Sign out"}
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => signIn("google")}
                        disabled={oauthLoading !== null}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                      >
                        <GoogleIcon />
                        {lang === "zh" ? "使用 Google 登录" : "Continue with Google"}
                      </button>
                      <button
                        onClick={() => signIn("github")}
                        disabled={oauthLoading !== null}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                      >
                        <GitHubIcon />
                        {lang === "zh" ? "使用 GitHub 登录" : "Continue with GitHub"}
                      </button>
                      <div className="border-t border-gray-100 my-1" />
                      <Link
                        href={`/${lang}/login`}
                        onClick={() => setAccountMenuOpen(false)}
                        className="block px-3 py-2 rounded-lg text-xs text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
                      >
                        {lang === "zh" ? "其他方式登录 →" : "Other sign-in options →"}
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 rounded-lg text-gray-600 hover:bg-gray-50"
              aria-label="Toggle menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {menuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        {menuOpen && (
          <nav className="md:hidden pb-4 border-t border-gray-100 pt-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className={`block px-3 py-2 rounded-lg text-sm font-medium ${
                  pathname.startsWith(item.href)
                    ? "text-[var(--primary)] bg-blue-50"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                {item.label}
                {item.badge && (
                  <span className="ml-1 px-1.5 py-0.5 text-[10px] font-semibold leading-none bg-orange-100 text-orange-600 rounded-full">
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}
