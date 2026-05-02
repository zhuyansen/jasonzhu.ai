"use client";

import { useState, useRef, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import type { Dictionary } from "@/lib/dictionaries";

function HandbookContent({ lang, dict }: { lang: string; dict: Dictionary }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const isUnlocked = searchParams.get("unlocked") === "true";
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const mountedAt = useRef<number>(Date.now());

  const t = dict.handbook;
  const isZh = lang === "zh";

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "handbook-gate", website, ts: mountedAt.current }),
      });
      const data = await res.json();
      if (res.ok) {
        router.push(`/${lang}/handbook?unlocked=true`);
      } else {
        setStatus("error");
        setErrorMsg(data.error || dict.subscribe.networkError);
      }
    } catch {
      setStatus("error");
      setErrorMsg(dict.subscribe.networkError);
    }
  };

  // Gate: show subscribe form if not unlocked
  if (!isUnlocked) {
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

        {/* Subscribe to unlock */}
        <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl border border-blue-100 p-8">
          <h3 className="text-lg font-bold text-gray-900 mb-2 text-center">
            {t.unlockTitle}
          </h3>
          <p className="text-sm text-gray-500 text-center mb-6">
            {t.unlockDesc}
          </p>
          <form onSubmit={handleUnlock}>
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
      </div>
    );
  }

  // Unlocked: show PDF viewer + download
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      {/* Success banner */}
      <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <span className="text-xl">🎉</span>
          <div>
            <p className="text-sm font-medium text-green-800">
              {t.successTitle}
            </p>
            <p className="text-xs text-green-600">
              {t.successDesc}
            </p>
          </div>
        </div>
        <a
          href="/handbook.pdf"
          download={t.pdfFilename}
          className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          {t.downloadPdf}
        </a>
      </div>

      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {t.title}
        </h1>
        <p className="text-gray-500">
          {t.subtitle}
        </p>
        <p className="text-xs text-gray-400 mt-2">
          {t.coach}：
          <Link
            href={`/${lang}/about`}
            className="text-[var(--primary)] hover:underline"
          >
            Jason Zhu
          </Link>{" "}
          | {t.producer}
        </p>
      </div>

      {/* Page previews — hero gallery */}
      <div className="rounded-2xl border border-gray-200 overflow-hidden bg-gradient-to-b from-gray-50 to-white p-6 sm:p-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {[1, 2, 3, 4, 5].map((n) => (
            <div
              key={n}
              className="group relative rounded-xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-xl transition-all bg-white"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/handbook-preview/page-${String(n).padStart(2, "0")}.png`}
                alt={`${t.title} — page ${n}`}
                className="w-full h-auto block group-hover:scale-[1.02] transition-transform duration-300"
                loading={n <= 2 ? "eager" : "lazy"}
              />
              <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded">
                P.{n}
              </div>
            </div>
          ))}
          {/* "More" tile */}
          <div className="rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center text-center p-8 min-h-[200px]">
            <div className="text-3xl mb-2">📚</div>
            <p className="text-sm font-medium text-gray-700 mb-1">
              {isZh ? "完整 8 章 / 全部页面" : "8 chapters · full pages"}
            </p>
            <p className="text-xs text-gray-400">
              {isZh ? "下载 PDF 查看完整内容" : "Download PDF for full content"}
            </p>
          </div>
        </div>

        {/* Primary CTA inside hero */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href="/handbook.pdf"
            download={t.pdfFilename}
            className="w-full sm:w-auto px-8 py-3.5 bg-[var(--primary)] text-white rounded-xl text-base font-semibold hover:bg-[var(--primary-dark)] transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            {isZh ? "下载完整 PDF（约 32MB）" : "Download Full PDF (~32MB)"}
          </a>
          <a
            href="/handbook.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-6 py-3.5 border border-gray-200 text-gray-700 rounded-xl text-base font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            {isZh ? "新窗口打开" : "Open in new tab"}
          </a>
        </div>
      </div>

      {/* Bottom actions */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <a
          href="/handbook.pdf"
          download={t.pdfFilename}
          className="px-5 py-2.5 bg-[var(--primary)] text-white rounded-lg text-sm font-medium hover:bg-[var(--primary-dark)] transition-colors flex items-center gap-2"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
          {t.downloadFull}
        </a>
        <p className="text-xs text-gray-400">
          {t.bookmarkTip} ·{" "}
          <Link href={`/${lang}/blog`} className="text-[var(--primary)] hover:underline">
            {t.readMore}
          </Link>
        </p>
      </div>

      {/* CTA */}
      <div className="mt-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 md:p-12 text-center text-white">
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
