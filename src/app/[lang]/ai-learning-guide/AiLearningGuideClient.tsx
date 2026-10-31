"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import Link from "@/components/Link";
import { useSearchParams } from "next/navigation";
import type { Locale } from "@/lib/dictionaries";
import { track } from "@/lib/track";

const PLATFORMS = [
  "Anthropic", "OpenAI", "Google", "NVIDIA", "Microsoft",
  "AWS", "Meta", "IBM", "DeepLearning.AI", "Hugging Face",
];

function GuideContent({ lang }: { lang: Locale }) {
  const isZh = lang === "zh";
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
        unlockDesc: "输入邮箱，PDF 下载链接会发到你的邮箱（7 天内有效），并获取每周新出的免费 AI 课程更新。",
        unlockBtn: "免费领取",
        unlocking: "发送中...",
        privacy: "我们尊重你的隐私，不会发送垃圾邮件，可随时退订。",
        sentTitle: "PDF 下载链接已发到你的邮箱",
        sentDesc: "发到了 {email}，7 天内有效。没收到的话看看垃圾箱。",
        resend: "重新发送",
        resent: "已重新发送",
        expired: "下载链接已过期或无效，重新输入邮箱就会收到新链接（7 天内有效）",
        networkError: "网络错误，请重试",
        moreTitle: "想看完整深度攻略？",
        moreDesc: "10 大平台 + 总目录共 11 篇深度文章，每篇含完整课程清单与避坑细节。",
        moreBtn: "阅读完整系列",
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
        unlockDesc: "Enter your email and we'll send you the PDF download link (valid for 7 days), plus weekly free-AI-course updates.",
        unlockBtn: "Get it free",
        unlocking: "Sending...",
        privacy: "We respect your privacy. No spam, unsubscribe anytime.",
        sentTitle: "Check your inbox",
        sentDesc: "We sent the download link to {email}. It works for 7 days. Check your spam folder if you don't see it.",
        resend: "Resend",
        resent: "Sent again",
        expired: "That download link has expired or is invalid. Enter your email to get a new one (valid for 7 days).",
        networkError: "Network error",
        moreTitle: "Want the full deep-dive series?",
        moreDesc: "11 in-depth articles covering all 10 platforms.",
        moreBtn: "Read the full series",
      };

  // 订阅后把 7 天下载链接发到邮箱（2026-10-31 起 PDF 不再有公开直链）
  const send = (addr: string) =>
    fetch("/api/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: addr,
        source: "ai-learning-guide",
        magnet: "ai-learning-guide",
        lang,
        website,
        ts: mountedAt.current,
      }),
    });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    try {
      const res = await send(email);
      const data = await res.json();
      if (res.ok) {
        track("newsletter_subscribe", { source: "ai-learning-guide", already: Boolean(data.alreadySubscribed) });
        setSentTo(email);
        setStatus("sent");
      } else {
        setStatus("error");
        setErrorMsg(data.error || t.networkError);
      }
    } catch {
      setStatus("error");
      setErrorMsg(t.networkError);
    }
  };

  const handleResend = async () => {
    setResend("loading");
    try {
      const res = await send(sentTo);
      const data = await res.json();
      setResend(res.ok ? "done" : "error");
      if (!res.ok) setErrorMsg(data.error || t.networkError);
    } catch {
      setResend("error");
      setErrorMsg(t.networkError);
    }
  };

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

          {/* CTA to full series */}
          <div className="mt-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-center text-white">
            <h2 className="text-2xl font-bold mb-3">{t.moreTitle}</h2>
            <p className="text-blue-100 mb-6">{t.moreDesc}</p>
            <Link
              href={`/${lang}/blog/ai-free-learning-hub`}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors"
            >
              {t.moreBtn}
            </Link>
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
          <h3 className="text-lg font-bold text-gray-900 mb-2 text-center">{t.unlockTitle}</h3>
          <p className="text-sm text-gray-500 text-center mb-6">{t.unlockDesc}</p>
          <form onSubmit={handleSubmit}>
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
      )}
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
