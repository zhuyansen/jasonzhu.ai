"use client";

import { useEffect, useRef, useState } from "react";
import Link from "@/components/Link";
import { track } from "@/lib/track";

/**
 * 英文提示词库的订阅入口（2026-10-27）。这批访客是英语和韩国用户（韩国 YouTube 引流），中文手册对他们没用，
 * 所以订阅奖励换成「Top 50 提示词」合集页，订阅后立刻解锁。来源记成 prompts-en，以后做英文邮件能单独挑出来。
 * 现在还没有英文邮件，文案只承诺「有值得一试的新提示词才发」，不承诺每周。
 */
export const TOP50_PATH = "prompts/claude-opus-5-5/top-50";

export default function PromptsSubscribe({ lang, compact = false, where }: { lang: string; compact?: boolean; where: string }) {
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [error, setError] = useState("");
  const mountedAt = useRef(0);
  useEffect(() => {
    mountedAt.current = Date.now();
  }, []);

  const href = `/${lang}/${TOP50_PATH}`;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "prompts-en", website, ts: mountedAt.current }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatus("error");
        setError(res.status === 400 ? "Please enter a valid email." : "Something went wrong. Please try again.");
        return;
      }
      track("newsletter_subscribe", { source: `prompts-en-${where}`, already: Boolean(data.alreadySubscribed) });
      setStatus("done");
    } catch {
      setStatus("error");
      setError("Network error. Please try again.");
    }
  };

  if (status === "done") {
    return (
      <div className={`rounded-xl border border-green-200 bg-green-50 ${compact ? "px-4 py-3" : "p-5"}`}>
        <p className="text-sm font-semibold text-green-800">You&apos;re in. Here are the 50 prompts:</p>
        <Link href={href} className="mt-2 inline-block rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white hover:opacity-90">
          Open the Top 50 prompts →
        </Link>
      </div>
    );
  }

  const form = (
    <form onSubmit={submit} className={`flex gap-2 ${compact ? "flex-col sm:flex-row sm:items-center" : "flex-col sm:flex-row mt-4"}`}>
      {/* honeypot：真人看不见 */}
      <input type="text" name="website" value={website} onChange={(e) => setWebsite(e.target.value)} tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        aria-label="Email"
        className="flex-1 min-w-0 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-[var(--primary)] focus:outline-none"
      />
      <button
        type="submit"
        disabled={status === "loading"}
        className="shrink-0 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
      >
        {status === "loading" ? "Sending…" : "Get the 50 prompts"}
      </button>
    </form>
  );

  if (compact) {
    return (
      <div className="rounded-xl border border-blue-100 bg-blue-50/60 px-4 py-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <p className="text-sm text-gray-700">
            <span className="font-semibold text-gray-900">The 50 most-viewed prompts, full text, one page.</span> Free with your email.
          </p>
          <div className="lg:w-[26rem]">{form}</div>
        </div>
        {status === "error" && <p className="mt-2 text-xs text-red-500">{error}</p>}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-5">
      <h2 className="text-base font-bold text-gray-900">Want more prompts like this one?</h2>
      <p className="mt-1 text-sm text-gray-600 leading-relaxed">
        Get the 50 most-viewed Claude 5.5 video prompts on one page: the full original text, the creator and the post it came from. We&apos;ll only
        email you when there&apos;s a new prompt worth trying. Unsubscribe anytime.
      </p>
      {form}
      {status === "error" && <p className="mt-2 text-xs text-red-500">{error}</p>}
    </div>
  );
}
