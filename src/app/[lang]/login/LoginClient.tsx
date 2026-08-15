"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";

interface Props {
  lang: "zh" | "en";
}

type Mode = "signin" | "signup";

export default function LoginClient({ lang }: Props) {
  const isZh = lang === "zh";
  const searchParams = useSearchParams();
  const [oauthLoading, setOauthLoading] = useState<"google" | "github" | null>(null);

  // 虎皮椒/兑换码这类访客结账从没设过密码，第一次登录必须走"注册"（同一个邮箱设个新密码），
  // 不是"登录"——默认停在登录页会让人对着"邮箱或密码不对"卡住。带 ?mode=signup&email= 直接跳过这一步。
  const [mode, setMode] = useState<Mode>(searchParams.get("mode") === "signup" ? "signup" : "signin");
  const [email, setEmail] = useState(searchParams.get("email") || "");
  // 登录后回跳地址（只允许站内相对路径，防开放重定向）；默认会员中心
  const rawNext = searchParams.get("next") || "";
  const nextPath = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : `/${lang}/dashboard`;
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [signupSent, setSignupSent] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [notConfirmed, setNotConfirmed] = useState(false);
  const [resendDone, setResendDone] = useState(false);

  async function signIn(provider: "google" | "github") {
    setOauthLoading(provider);
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`,
      },
    });
  }

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    const supabase = createClient();

    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          if (error.message.includes("Email not confirmed")) {
            // 注册了但没点确认邮件里的链接——不是密码错，别误导
            setNotConfirmed(true);
            setError(isZh ? "这个账号还没验证邮箱，去邮箱点一下确认链接再登录" : "Email not confirmed — click the link in your inbox first");
            return;
          }
          setError(
            error.message.includes("Invalid login credentials")
              ? (isZh ? "邮箱或密码不对（忘了密码可以点下面「忘记密码」重置）" : "Invalid email or password — you can reset it below")
              : error.message
          );
          return;
        }
        window.location.href = nextPath;
      } else {
        if (password.length < 6) {
          setError(isZh ? "密码至少 6 位" : "Password must be at least 6 characters");
          return;
        }
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}` },
        });
        if (error) {
          setError(
            error.message.includes("already registered")
              ? (isZh ? "这个邮箱已经注册过了，直接登录" : "This email is already registered — sign in instead")
              : error.message
          );
          return;
        }
        // Supabase 防枚举：邮箱已存在时 signUp 也"假装成功"（identities 为空、不发邮件、
        // 新密码不生效）。不识别这个会让用户对着"查看邮箱"干等，然后用新密码登录报密码错。
        if (data.user && (data.user.identities?.length ?? 0) === 0) {
          setMode("signin");
          setError(isZh
            ? "这个邮箱已经注册过了，请直接登录；忘了密码就点下面「忘记密码」重置"
            : "This email is already registered — sign in, or reset your password below");
          return;
        }
        // mailer_autoconfirm=false：注册成功但还没验证邮箱，data.session 为空
        if (data.session) {
          window.location.href = nextPath;
        } else {
          setSignupSent(true);
        }
      }
    } catch {
      setError(isZh ? "网络错误，请稍后重试" : "Network error, please retry");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleForgotPassword() {
    if (!email) {
      setError(isZh ? "先在上面填邮箱，再点忘记密码" : "Enter your email above first");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const supabase = createClient();
      await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/${lang}/reset-password`,
      });
      // 不管邮箱存不存在都显示已发送（Supabase 本身也防枚举）
      setResetSent(true);
    } catch {
      setError(isZh ? "网络错误，请稍后重试" : "Network error, please retry");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResendConfirmation() {
    setSubmitting(true);
    try {
      const supabase = createClient();
      await supabase.auth.resend({
        type: "signup",
        email,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}` },
      });
      setResendDone(true);
    } catch { /* 静默：下面的提示文案不变 */ }
    finally { setSubmitting(false); }
  }

  if (resetSent) {
    return (
      <div className="max-w-sm mx-auto px-4 sm:px-6 py-20 text-center">
        <span className="text-4xl">🔑</span>
        <h1 className="text-xl font-bold text-gray-900 mt-4 mb-2">
          {isZh ? "重置邮件已发送" : "Reset email sent"}
        </h1>
        <p className="text-sm text-gray-400">
          {isZh
            ? `如果 ${email} 注册过，会收到一封重置密码的邮件，点开链接设置新密码即可。没收到就检查一下垃圾箱。`
            : `If ${email} has an account, a password reset link is on its way. Check spam if you don't see it.`}
        </p>
      </div>
    );
  }

  if (signupSent) {
    return (
      <div className="max-w-sm mx-auto px-4 sm:px-6 py-20 text-center">
        <span className="text-4xl">📬</span>
        <h1 className="text-xl font-bold text-gray-900 mt-4 mb-2">
          {isZh ? "去邮箱确认一下" : "Check your email"}
        </h1>
        <p className="text-sm text-gray-400">
          {isZh
            ? `我们给 ${email} 发了一封确认邮件，点开里面的链接就能登录了。`
            : `We sent a confirmation link to ${email}. Click it to finish signing up.`}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-sm mx-auto px-4 sm:px-6 py-20">
      <div className="text-center mb-10">
        <span className="text-4xl">⛵</span>
        <h1 className="text-2xl font-bold text-gray-900 mt-4 mb-2">
          {isZh ? "登录 GoSail Club" : "Sign in to GoSail Club"}
        </h1>
        <p className="text-sm text-gray-400">
          {isZh ? "查看会员状态、Hub Key 和权益入口" : "View your membership, Hub Key, and benefits"}
        </p>
      </div>

      {searchParams.get("mode") === "signup" && (
        <div className="mb-6 px-4 py-3 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-700">
          {isZh
            ? "刚付款完？用这个邮箱设个新密码注册一下（不用跟别的密码一样），会员中心会自动关联你的开通记录。"
            : "Just paid? Set a new password for this email to sign up — your membership will link automatically."}
        </div>
      )}

      <div className="space-y-3">
        <button
          onClick={() => signIn("google")}
          disabled={oauthLoading !== null}
          className="w-full flex items-center justify-center gap-3 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z" />
            <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18z" />
            <path fill="#FBBC05" d="M3.97 10.72A5.4 5.4 0 0 1 3.68 9c0-.6.1-1.18.29-1.72V4.95H.96A9 9 0 0 0 0 9c0 1.45.35 2.83.96 4.05l3.01-2.33z" />
            <path fill="#EA4335" d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.59-2.59C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z" />
          </svg>
          {oauthLoading === "google" ? (isZh ? "跳转中…" : "Redirecting…") : (isZh ? "使用 Google 登录" : "Continue with Google")}
        </button>

        <button
          onClick={() => signIn("github")}
          disabled={oauthLoading !== null}
          className="w-full flex items-center justify-center gap-3 py-3 bg-gray-900 rounded-xl text-sm font-medium text-white hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
          </svg>
          {oauthLoading === "github" ? (isZh ? "跳转中…" : "Redirecting…") : (isZh ? "使用 GitHub 登录" : "Continue with GitHub")}
        </button>
      </div>

      <div className="flex items-center gap-3 my-6">
        <div className="flex-1 h-px bg-gray-100" />
        <span className="text-xs text-gray-400">{isZh ? "或" : "or"}</span>
        <div className="flex-1 h-px bg-gray-100" />
      </div>

      <div className="flex rounded-lg bg-gray-50 p-1 mb-4">
        <button
          onClick={() => { setMode("signin"); setError(""); }}
          className={`flex-1 py-1.5 rounded-md text-xs font-semibold transition-colors ${
            mode === "signin" ? "bg-white text-gray-900 shadow-sm" : "text-gray-400"
          }`}
        >
          {isZh ? "邮箱登录" : "Sign in"}
        </button>
        <button
          onClick={() => { setMode("signup"); setError(""); }}
          className={`flex-1 py-1.5 rounded-md text-xs font-semibold transition-colors ${
            mode === "signup" ? "bg-white text-gray-900 shadow-sm" : "text-gray-400"
          }`}
        >
          {isZh ? "注册新账号" : "Sign up"}
        </button>
      </div>

      <form onSubmit={handleEmailSubmit} className="space-y-3">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={isZh ? "邮箱" : "Email"}
          className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:border-[var(--primary)] focus:outline-none"
        />
        <input
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={isZh ? "密码（至少 6 位）" : "Password (6+ characters)"}
          className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:border-[var(--primary)] focus:outline-none"
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
        {notConfirmed && (
          <p className="text-xs text-gray-400">
            {resendDone
              ? (isZh ? "确认邮件已重发，注意查收（含垃圾箱）" : "Confirmation email resent — check your inbox")
              : (
                <>
                  {isZh ? "没收到邮件？" : "Didn't get it? "}
                  <button type="button" onClick={handleResendConfirmation} disabled={submitting} className="text-[var(--primary)] hover:underline">
                    {isZh ? "重发确认邮件" : "Resend confirmation"}
                  </button>
                </>
              )}
          </p>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          {submitting
            ? (isZh ? "处理中…" : "Working…")
            : mode === "signin"
              ? (isZh ? "登录" : "Sign in")
              : (isZh ? "创建账号" : "Create account")}
        </button>
        {mode === "signin" && (
          <p className="text-xs text-center">
            <button type="button" onClick={handleForgotPassword} disabled={submitting} className="text-gray-400 hover:text-[var(--primary)] hover:underline">
              {isZh ? "忘记密码？发送重置邮件" : "Forgot password? Send reset email"}
            </button>
          </p>
        )}
      </form>

      <p className="text-xs text-gray-400 text-center mt-8">
        {isZh ? "还没有会员？" : "Not a member yet? "}
        <a href={`/${lang}/club`} className="text-[var(--primary)] hover:underline">
          {isZh ? "了解 GoSail Club →" : "Learn about GoSail Club →"}
        </a>
      </p>
    </div>
  );
}
