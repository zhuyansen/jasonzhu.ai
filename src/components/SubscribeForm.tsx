"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import type { Dictionary } from "@/lib/dictionaries";

interface SubscribeFormProps {
  source?: string;
  compact?: boolean;
  lang?: string;
  dict?: Dictionary;
}

export default function SubscribeForm({
  source = "website",
  compact = false,
  lang = "zh",
  dict,
}: SubscribeFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const mountedAt = useRef<number>(Date.now());

  // Fallback strings if dict not provided
  const t = dict?.subscribe ?? {
    title: "订阅 Newsletter，免费获取完整手册",
    desc: "Subscribe即送《AIP出海自媒体实战手册》完整版，还有每周AI精选内容推送",
    placeholder: "your@email.com",
    placeholderCompact: "输入邮箱，获取完整手册",
    submit: "免费订阅",
    submitting: "提交中...",
    privacy: "我们尊重你的隐私，不会发送垃圾邮件。可随时退订。",
    successBtn: "立即查看完整手册 →",
    networkError: "网络错误，请稍后重试",
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source, website, ts: mountedAt.current }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus("success");
        setMessage(data.message);
        setEmail("");
        router.push(`/${lang}/handbook?unlocked=true`);
      } else {
        setStatus("error");
        setMessage(data.error);
      }
    } catch {
      setStatus("error");
      setMessage(t.networkError);
    }
  };

  if (status === "success") {
    return (
      <div className={`rounded-xl border border-green-200 bg-green-50 p-6 ${compact ? "p-4" : "p-6"}`}>
        <div className="flex items-start gap-3">
          <span className="text-2xl">🎉</span>
          <div>
            <p className="font-semibold text-green-800">{message}</p>
            <a
              href={`/${lang}/handbook?unlocked=true`}
              className="mt-2 inline-block px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
            >
              {t.successBtn}
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (compact) {
    return (
      <form onSubmit={handleSubmit} className="flex gap-2">
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
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t.placeholderCompact}
          required
          className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="px-5 py-2.5 bg-[var(--primary)] text-white rounded-lg text-sm font-medium hover:bg-[var(--primary-dark)] transition-colors disabled:opacity-50 whitespace-nowrap"
        >
          {status === "loading" ? "..." : t.submit}
        </button>
        {status === "error" && (
          <p className="text-xs text-red-500 mt-1">{message}</p>
        )}
      </form>
    );
  }

  return (
    <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-8">
      <div className="flex items-start gap-3 mb-4">
        <span className="text-3xl">📬</span>
        <div>
          <h3 className="text-lg font-bold text-gray-900">{t.title}</h3>
          <p className="text-sm text-gray-500 mt-1">{t.desc}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-4">
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
            placeholder={t.placeholder}
            required
            className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-blue-100"
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="px-6 py-3 bg-[var(--primary)] text-white rounded-xl text-sm font-medium hover:bg-[var(--primary-dark)] transition-colors disabled:opacity-50 whitespace-nowrap"
          >
            {status === "loading" ? t.submitting : t.submit}
          </button>
        </div>
        {status === "error" && (
          <p className="text-sm text-red-500 mt-2">{message}</p>
        )}
        <p className="text-xs text-gray-400 mt-3">{t.privacy}</p>
      </form>
    </div>
  );
}
