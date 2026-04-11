"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import type { Dictionary } from "@/lib/dictionaries";

function HandbookContent({ lang, dict }: { lang: string; dict: Dictionary }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const isUnlocked = searchParams.get("unlocked") === "true";
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const t = dict.handbook;

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "handbook-gate" }),
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
            {[
              "第一章：出海AIP基础准备工作",
              "第二章：出海AIP的定位",
              "第三章：X平台的基础认知",
              "第四章：如何运营图文短内容",
              "第五章：出海AIP实战",
              "第六章：多元化变现模式",
              "第七章：内容运营方法论",
              "第八章：常见问题答疑",
            ].map((ch) => (
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
          download="AIP出海自媒体实战手册.pdf"
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

      {/* PDF Viewer */}
      <div className="rounded-2xl border border-gray-200 overflow-hidden bg-gray-100">
        <iframe
          src="/handbook.pdf"
          className="w-full"
          style={{ height: "85vh", minHeight: "600px" }}
          title={t.title}
        />
      </div>

      {/* Bottom actions */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <a
          href="/handbook.pdf"
          download="AIP出海自媒体实战手册.pdf"
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
