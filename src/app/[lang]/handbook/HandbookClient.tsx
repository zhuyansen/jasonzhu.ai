"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import Link from "@/components/Link";
import { useSearchParams } from "next/navigation";
import type { Dictionary } from "@/lib/dictionaries";
import { track } from "@/lib/track";

function HandbookContent({ lang, dict }: { lang: string; dict: Dictionary }) {
  const searchParams = useSearchParams();
  // 邮件里的下载链接过期或无效时，middleware 带 ?expired=1 跳回这里
  const expired = searchParams.get("expired") === "1";
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [sentTo, setSentTo] = useState("");
  const [resend, setResend] = useState<"idle" | "loading" | "done" | "error">("idle");
  // time-trap 反 bot：渲染期不可调 Date.now()（react-hooks/purity），挂载后再记时
  const mountedAt = useRef<number>(0);
  useEffect(() => {
    mountedAt.current = Date.now();
  }, []);

  const t = dict.handbook;

  // 订阅后把 7 天下载链接发到邮箱（2026-10-31 起 PDF 不再有公开直链）
  const send = (addr: string) =>
    fetch("/api/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: addr, source: "handbook-gate", magnet: "handbook", lang, website, ts: mountedAt.current }),
    });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");

    try {
      const res = await send(email);
      const data = await res.json();
      if (res.ok) {
        track("newsletter_subscribe", { source: "handbook-gate", already: Boolean(data.alreadySubscribed) });
        setSentTo(email);
        setStatus("sent");
      } else {
        setStatus("error");
        setErrorMsg(data.error || dict.subscribe.networkError);
      }
    } catch {
      setStatus("error");
      setErrorMsg(dict.subscribe.networkError);
    }
  };

  const handleResend = async () => {
    setResend("loading");
    try {
      const res = await send(sentTo);
      const data = await res.json();
      setResend(res.ok ? "done" : "error");
      if (!res.ok) setErrorMsg(data.error || dict.subscribe.networkError);
    } catch {
      setResend("error");
      setErrorMsg(dict.subscribe.networkError);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-20">
      <div className="text-center mb-10">
        <span className="text-5xl mb-4 block">📘</span>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          {t.title}
        </h1>
        <p className="text-gray-500">
          {t.subtitle}
        </p>
      </div>

      {/* Preview of what's inside */}
      <div className="bg-gray-50 rounded-2xl p-6 mb-8">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">
          {t.chapters}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {t.chapterList.map((ch) => (
            <div
              key={ch}
              className="flex items-center gap-2 text-sm text-gray-600"
            >
              <svg
                className="w-4 h-4 text-green-500 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              {ch}
            </div>
          ))}
        </div>
      </div>

      {status === "sent" ? (
        <>
          {/* Sent: the download link is in the inbox */}
          <div className="bg-green-50 rounded-2xl border border-green-200 p-8 text-center">
            <span className="text-4xl mb-3 block">📬</span>
            <h3 className="text-lg font-bold text-green-800 mb-2">{t.sentTitle}</h3>
            <p className="text-sm text-green-700">{t.sentDesc.replace("{email}", sentTo)}</p>
            <button
              type="button"
              onClick={handleResend}
              disabled={resend === "loading" || resend === "done"}
              className="mt-4 text-sm font-medium text-green-700 underline underline-offset-2 hover:text-green-900 disabled:no-underline disabled:opacity-60"
            >
              {resend === "done" ? t.resent : resend === "loading" ? "..." : t.resend}
            </button>
            {resend === "error" && <p className="text-sm text-red-500 mt-2">{errorMsg}</p>}
          </div>

          {/* CTA */}
          <div className="mt-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-center text-white">
            <h2 className="text-2xl font-bold mb-3">{t.ctaTitle}</h2>
            <p className="text-blue-100 mb-6">
              {t.ctaDesc}
            </p>
            <div className="flex justify-center gap-3 flex-wrap">
              <a
                href="https://x.com/GoSailGlobal"
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 bg-white text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors"
              >
                {t.followX}
              </a>
              <Link
                href={`/${lang}/services`}
                className="px-5 py-2.5 border border-white/30 text-white rounded-lg text-sm font-medium hover:bg-white/10 transition-colors"
              >
                {t.trainingService}
              </Link>
              <Link
                href={`/${lang}/blog`}
                className="px-5 py-2.5 border border-white/30 text-white rounded-lg text-sm font-medium hover:bg-white/10 transition-colors"
              >
                {t.moreArticles}
              </Link>
            </div>
          </div>
        </>
      ) : (
        /* Subscribe: the download link is emailed */
        <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl border border-blue-100 p-8">
          {expired && (
            <p className="mb-6 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800 text-center">
              {t.expired}
            </p>
          )}
          <h3 className="text-lg font-bold text-gray-900 mb-2 text-center">
            {t.unlockTitle}
          </h3>
          <p className="text-sm text-gray-500 text-center mb-6">
            {t.unlockDesc}
          </p>
          <form onSubmit={handleSubmit}>
            {/* Honeypot — hidden from real users */}
            <input
              type="text"
              name="website"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }}
            />
            <div className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-blue-100"
              />
              <button
                type="submit"
                disabled={status === "loading"}
                className="px-6 py-3 bg-[var(--primary)] text-white rounded-xl text-sm font-medium hover:bg-[var(--primary-dark)] transition-colors disabled:opacity-50 whitespace-nowrap"
              >
                {status === "loading" ? t.unlocking : t.unlockBtn}
              </button>
            </div>
            {status === "error" && (
              <p className="text-sm text-red-500 mt-2 text-center">
                {errorMsg}
              </p>
            )}
            <p className="text-xs text-gray-400 mt-3 text-center">
              {t.privacy}
            </p>
          </form>
        </div>
      )}
    </div>
  );
}

export default function HandbookClient({ lang, dict }: { lang: string; dict: Dictionary }) {
  return (
    <Suspense
      fallback={
        <div className="max-w-2xl mx-auto px-4 py-20 text-center text-gray-400">
          ...
        </div>
      }
    >
      <HandbookContent lang={lang} dict={dict} />
    </Suspense>
  );
}
