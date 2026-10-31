"use client";

import { useState, useRef, useEffect } from "react";
import type { Dictionary } from "@/lib/dictionaries";
import { track } from "@/lib/track";

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
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");
  const [sentTo, setSentTo] = useState("");
  const [resend, setResend] = useState<"idle" | "loading" | "done" | "error">("idle");
  // time-trap 反 bot：渲染期不可调 Date.now()（react-hooks/purity），挂载后再记时
  const mountedAt = useRef<number>(0);
  useEffect(() => {
    mountedAt.current = Date.now();
  }, []);

  // Fallback strings if dict not provided
  const t = dict?.subscribe ?? {
    title: "订阅 Newsletter，免费获取完整手册",
    desc: "订阅即送《AIP出海自媒体实战手册》完整版（下载链接发到邮箱），还有每周AI精选内容推送",
    placeholder: "your@email.com",
    placeholderCompact: "输入邮箱，获取完整手册",
    submit: "免费订阅",
    submitting: "提交中...",
    privacy: "我们尊重你的隐私，不会发送垃圾邮件。可随时退订。",
    sentTitle: "手册下载链接已发到你的邮箱",
    sentDesc: "发到了 {email}，7 天内有效。没收到的话看看垃圾箱。",
    resend: "重新发送",
    resent: "已重新发送",
    networkError: "网络错误，请稍后重试",
  };

  // 订阅框送手册：订阅后把 7 天下载链接发到邮箱（2026-10-31 起不再跳 /handbook?unlocked=true）
  const send = (addr: string) =>
    fetch("/api/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: addr, source, magnet: "handbook", lang, website, ts: mountedAt.current }),
    });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");
    try {
      const res = await send(email);
      const data = await res.json();

      if (res.ok) {
        track("newsletter_subscribe", { source, already: Boolean(data.alreadySubscribed) });
        setSentTo(email);
        setStatus("sent");
      } else {
        setStatus("error");
        setMessage(data.error);
      }
    } catch {
      setStatus("error");
      setMessage(t.networkError);
    }
  };

  const handleResend = async () => {
    setResend("loading");
    try {
      const res = await send(sentTo);
      const data = await res.json();
      setResend(res.ok ? "done" : "error");
      if (!res.ok) setMessage(data.error);
    } catch {
      setResend("error");
      setMessage(t.networkError);
    }
  };

  if (status === "sent") {
    return (
      <div className={`rounded-xl border border-green-200 bg-green-50 ${compact ? "p-4" : "p-6"}`}>
        <div className="flex items-start gap-3">
          <span className="text-2xl">📬</span>
          <div>
            <p className="font-semibold text-green-800">{t.sentTitle}</p>
            <p className="text-sm text-green-700 mt-1">{t.sentDesc.replace("{email}", sentTo)}</p>
            <button
              type="button"
              onClick={handleResend}
              disabled={resend === "loading" || resend === "done"}
              className="mt-3 text-sm font-medium text-green-700 underline underline-offset-2 hover:text-green-900 disabled:no-underline disabled:opacity-60"
            >
              {resend === "done" ? t.resent : resend === "loading" ? "..." : t.resend}
            </button>
            {resend === "error" && <p className="text-xs text-red-500 mt-1">{message}</p>}
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
