"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-browser";

interface Props {
  lang: "zh" | "en";
}

/**
 * 密码重置落地页：用户点邮件里的 recovery 链接 → /auth/callback 换取 session →
 * 跳到这里。此时已带登录态，直接 updateUser 设新密码。
 * 没有 session（直接访问/链接过期）就引导回登录页重新发。
 */
export default function ResetPasswordClient({ lang }: Props) {
  const isZh = lang === "zh";
  const [hasSession, setHasSession] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => setHasSession(Boolean(data.session)));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 6) {
      setError(isZh ? "密码至少 6 位" : "Password must be at least 6 characters");
      return;
    }
    if (password !== password2) {
      setError(isZh ? "两次输入的密码不一致" : "Passwords don't match");
      return;
    }
    setSubmitting(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        setError(error.message);
        return;
      }
      setDone(true);
    } catch {
      setError(isZh ? "网络错误，请稍后重试" : "Network error, please retry");
    } finally {
      setSubmitting(false);
    }
  }

  if (hasSession === null) {
    return <div className="max-w-sm mx-auto px-4 py-20 text-center text-sm text-gray-400">{isZh ? "加载中…" : "Loading…"}</div>;
  }

  if (!hasSession) {
    return (
      <div className="max-w-sm mx-auto px-4 sm:px-6 py-20 text-center">
        <span className="text-4xl">⏱️</span>
        <h1 className="text-xl font-bold text-gray-900 mt-4 mb-2">
          {isZh ? "链接已失效" : "Link expired"}
        </h1>
        <p className="text-sm text-gray-400 mb-8">
          {isZh ? "重置链接过期或已使用，回登录页重新发一封。" : "This reset link is expired or used — request a new one."}
        </p>
        <a href={`/${lang}/login`} className="inline-block px-8 py-3 bg-[var(--primary)] text-white font-semibold rounded-xl hover:opacity-90 transition-opacity">
          {isZh ? "回登录页 →" : "Back to sign in →"}
        </a>
      </div>
    );
  }

  if (done) {
    return (
      <div className="max-w-sm mx-auto px-4 sm:px-6 py-20 text-center">
        <span className="text-4xl">✅</span>
        <h1 className="text-xl font-bold text-gray-900 mt-4 mb-2">
          {isZh ? "密码已更新" : "Password updated"}
        </h1>
        <p className="text-sm text-gray-400 mb-8">
          {isZh ? "现在可以用新密码登录了。" : "You can sign in with your new password now."}
        </p>
        <a href={`/${lang}/dashboard`} className="inline-block px-8 py-3 bg-[var(--primary)] text-white font-semibold rounded-xl hover:opacity-90 transition-opacity">
          {isZh ? "去会员中心 →" : "Go to Dashboard →"}
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-sm mx-auto px-4 sm:px-6 py-20">
      <div className="text-center mb-10">
        <span className="text-4xl">🔑</span>
        <h1 className="text-2xl font-bold text-gray-900 mt-4 mb-2">
          {isZh ? "设置新密码" : "Set a new password"}
        </h1>
      </div>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={isZh ? "新密码（至少 6 位）" : "New password (6+ characters)"}
          className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:border-[var(--primary)] focus:outline-none"
        />
        <input
          type="password"
          required
          minLength={6}
          value={password2}
          onChange={(e) => setPassword2(e.target.value)}
          placeholder={isZh ? "再输一遍" : "Confirm password"}
          className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:border-[var(--primary)] focus:outline-none"
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 bg-[var(--primary)] text-white font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {submitting ? (isZh ? "保存中…" : "Saving…") : (isZh ? "保存新密码" : "Save password")}
        </button>
      </form>
    </div>
  );
}
