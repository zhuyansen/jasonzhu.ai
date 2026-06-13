"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { Locale } from "@/lib/dictionaries";

const PDF_PATH = "/ai-free-learning-guide.pdf";

const PLATFORMS = [
  "Anthropic", "OpenAI", "Google", "NVIDIA", "Microsoft",
  "AWS", "Meta", "IBM", "DeepLearning.AI", "Hugging Face",
];

function GuideContent({ lang }: { lang: Locale }) {
  const isZh = lang === "zh";
  const searchParams = useSearchParams();
  const isUnlocked = searchParams.get("unlocked") === "true";

  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  // time-trap 反 bot：渲染期不可调 Date.now()（react-hooks/purity），挂载后再记时
  const mountedAt = useRef<number>(0);
  useEffect(() => {
    mountedAt.current = Date.now();
  }, []);

  const t = isZh
    ? {
        title: "10 大平台 AI 免费学习全景图",
        subtitle: "学 AI 这一两年想花的钱，一分都不用花。",
        chaptersTitle: "PDF 里有什么",
        chapters: [
          "10 大平台横向对比表（定位 / 免费课量 / 发证 / 适合谁）",
          "10 大平台逐个拆解：核心课程 + 官方直达链接 + 避坑笔记",
          "按身份选路径：非技术岗 / 开发者 / 转行者 / 研究者",
          "三条通用学习建议",
        ],
        unlockTitle: "订阅免费领取 PDF",
        unlockDesc: "输入邮箱即可下载完整 PDF，并获取每周新出的免费 AI 课程更新。",
        unlockBtn: "免费领取",
        unlocking: "提交中...",
        privacy: "我们尊重你的隐私，不会发送垃圾邮件，可随时退订。",
        successTitle: "领取成功！",
        successDesc: "你现在可以下载完整 PDF 了。",
        download: "下载 PDF（857KB · 6 页）",
        openTab: "新窗口打开",
        moreTitle: "想看完整深度攻略？",
        moreDesc: "10 大平台 + 总目录共 11 篇深度文章，每篇含完整课程清单与避坑细节。",
        moreBtn: "阅读完整系列",
        previewTip: "PDF 内容预览",
        pdfFilename: "AI-免费学习全景图-JasonZhu.pdf",
      }
    : {
        title: "The Complete Map of Free AI Learning",
        subtitle: "Learning AI costs nothing — here's the proof.",
        chaptersTitle: "What's inside",
        chapters: [
          "Comparison table of all 10 platforms",
          "Platform-by-platform breakdown with official links",
          "Pick-your-path by role",
          "Three universal learning tips",
        ],
        unlockTitle: "Subscribe to get the free PDF",
        unlockDesc: "Enter your email to download the full PDF and get weekly free-AI-course updates.",
        unlockBtn: "Get it free",
        unlocking: "Submitting...",
        privacy: "We respect your privacy. No spam, unsubscribe anytime.",
        successTitle: "Done!",
        successDesc: "You can now download the full PDF.",
        download: "Download PDF (857KB · 6 pages)",
        openTab: "Open in new tab",
        moreTitle: "Want the full deep-dive series?",
        moreDesc: "11 in-depth articles covering all 10 platforms.",
        moreBtn: "Read the full series",
        previewTip: "PDF preview",
        pdfFilename: "Free-AI-Learning-Map-JasonZhu.pdf",
      };

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          source: "ai-learning-guide",
          website,
          ts: mountedAt.current,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        window.location.href = `/${lang}/ai-learning-guide?unlocked=true`;
      } else {
        setStatus("error");
        setErrorMsg(data.error || (isZh ? "网络错误，请重试" : "Network error"));
      }
    } catch {
      setStatus("error");
      setErrorMsg(isZh ? "网络错误，请重试" : "Network error");
    }
  };

  // Gate
  if (!isUnlocked) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16">
        <div className="text-center mb-10">
          <span className="text-5xl mb-4 block">🗺️</span>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">{t.title}</h1>
          <p className="text-gray-500">{t.subtitle}</p>
        </div>

        {/* Platform pills */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {PLATFORMS.map((p) => (
            <span
              key={p}
              className="px-3 py-1 bg-gray-50 border border-gray-100 rounded-full text-xs text-gray-600"
            >
              {p}
            </span>
          ))}
        </div>

        {/* What's inside */}
        <div className="bg-gray-50 rounded-2xl p-6 mb-8">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">{t.chaptersTitle}</h3>
          <div className="space-y-2">
            {t.chapters.map((ch) => (
              <div key={ch} className="flex items-start gap-2 text-sm text-gray-600">
                <svg className="w-4 h-4 text-green-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {ch}
              </div>
            ))}
          </div>
        </div>

        {/* Subscribe */}
        <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl border border-blue-100 p-8">
          <h3 className="text-lg font-bold text-gray-900 mb-2 text-center">{t.unlockTitle}</h3>
          <p className="text-sm text-gray-500 text-center mb-6">{t.unlockDesc}</p>
          <form onSubmit={handleUnlock}>
            {/* Honeypot */}
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
              <p className="text-sm text-red-500 mt-2 text-center">{errorMsg}</p>
            )}
            <p className="text-xs text-gray-400 mt-3 text-center">{t.privacy}</p>
          </form>
        </div>
      </div>
    );
  }

  // Unlocked
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <span className="text-xl">🎉</span>
          <div>
            <p className="text-sm font-medium text-green-800">{t.successTitle}</p>
            <p className="text-xs text-green-600">{t.successDesc}</p>
          </div>
        </div>
        <a
          href={PDF_PATH}
          download={t.pdfFilename}
          className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
        >
          {t.download}
        </a>
      </div>

      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t.title}</h1>
        <p className="text-gray-500">{t.subtitle}</p>
      </div>

      {/* PDF page previews */}
      <div className="rounded-2xl border border-gray-200 overflow-hidden bg-gradient-to-b from-gray-50 to-white p-6 sm:p-10">
        <p className="text-xs text-gray-400 text-center mb-5">{t.previewTip}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div
              key={n}
              className="rounded-xl overflow-hidden border border-gray-200 shadow-sm bg-white"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/ai-learning-guide-preview/page-${n}.png`}
                alt={`${t.title} — page ${n}`}
                className="w-full h-auto block"
                loading={n <= 2 ? "eager" : "lazy"}
              />
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href={PDF_PATH}
            download={t.pdfFilename}
            className="w-full sm:w-auto px-8 py-3.5 bg-[var(--primary)] text-white rounded-xl text-base font-semibold hover:bg-[var(--primary-dark)] transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            {t.download}
          </a>
          <a
            href={PDF_PATH}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-6 py-3.5 border border-gray-200 text-gray-700 rounded-xl text-base font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
          >
            {t.openTab}
          </a>
        </div>
      </div>

      {/* CTA to full series */}
      <div className="mt-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 md:p-12 text-center text-white">
        <h2 className="text-2xl font-bold mb-3">{t.moreTitle}</h2>
        <p className="text-blue-100 mb-6">{t.moreDesc}</p>
        <Link
          href={`/${lang}/blog/ai-free-learning-hub`}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors"
        >
          {t.moreBtn}
        </Link>
      </div>
    </div>
  );
}

export default function AiLearningGuideClient({ lang }: { lang: Locale }) {
  return (
    <Suspense fallback={<div className="max-w-2xl mx-auto px-4 py-20 text-center text-gray-400">...</div>}>
      <GuideContent lang={lang} />
    </Suspense>
  );
}
