"use client";

import { useState, useRef, useEffect } from "react";

interface Props {
  lang: "zh" | "en";
}

interface ActivationResult {
  github: string;
  hubKey: string;
  expiresAt: string;
  org: string;
}

export default function ActivateClient({ lang }: Props) {
  const isZh = lang === "zh";
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [result, setResult] = useState<ActivationResult | null>(null);
  const [copied, setCopied] = useState(false);
  // time-trap 反 bot：渲染期不可调 Date.now()，挂载后再记时
  const mountedAt = useRef<number>(0);
  useEffect(() => {
    mountedAt.current = Date.now();
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    const fd = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/club-activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: fd.get("code"),
          github: fd.get("github"),
          email: fd.get("email"),
          website: fd.get("website"),
          ts: mountedAt.current,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setResult(data);
        setStatus("success");
      } else {
        setStatus("error");
        setErrorMsg(data.error || (isZh ? "激活失败，请稍后重试" : "Activation failed"));
      }
    } catch {
      setStatus("error");
      setErrorMsg(isZh ? "网络错误，请稍后重试" : "Network error");
    }
  }

  const copyKey = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.hubKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* ignore */ }
  };

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-16">
      <div className="text-center mb-10">
        <span className="text-4xl">⛵</span>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mt-4 mb-2">
          {isZh ? "GoSail Club 会员开通" : "Activate Membership"}
        </h1>
        <p className="text-sm text-gray-400">
          {isZh
            ? "输入付款后收到的兑换码，30 秒自动开通全部权益"
            : "Enter the code you received after payment"}
        </p>
      </div>

      {status === "success" && result ? (
        <div className="bg-white border border-green-200 rounded-2xl p-8">
          <div className="text-center mb-6">
            <div className="text-4xl mb-3">🎉</div>
            <h2 className="text-lg font-bold text-gray-900">
              {isZh ? "开通成功！三步完成设置" : "Activated!"}
            </h2>
          </div>
          <ol className="space-y-5 text-sm text-gray-600">
            <li className="flex gap-3">
              <span className="shrink-0 w-6 h-6 rounded-full bg-blue-50 text-[var(--primary)] font-bold text-xs flex items-center justify-center">1</span>
              <div>
                <p className="font-semibold text-gray-900 mb-1">
                  {isZh ? "接受 GitHub 邀请（7 天内）" : "Accept the GitHub invite"}
                </p>
                <p>
                  {isZh ? "GitHub 已向 " : "We invited "}
                  <code className="px-1.5 py-0.5 bg-gray-100 rounded text-xs">@{result.github}</code>
                  {isZh ? " 发出组织邀请，查收 GitHub 通知/邮件，或直接打开：" : ". Accept at:"}
                </p>
                <a
                  href={`https://github.com/orgs/${result.org}/invitation`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--primary)] hover:underline break-all"
                >
                  github.com/orgs/{result.org}/invitation
                </a>
                <p className="text-xs text-gray-400 mt-1">
                  {isZh ? "接受后自动获得：手册仓库 + 一键分发 Skill + 热点雷达 Skill" : "Grants: handbook + both skills repos"}
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="shrink-0 w-6 h-6 rounded-full bg-blue-50 text-[var(--primary)] font-bold text-xs flex items-center justify-center">2</span>
              <div className="min-w-0">
                <p className="font-semibold text-gray-900 mb-1">
                  {isZh ? "保存你的 SkillsHub Pro Key" : "Save your SkillsHub Pro key"}
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  <code className="px-2 py-1 bg-gray-900 text-green-400 rounded text-xs break-all">{result.hubKey}</code>
                  <button onClick={copyKey} className="text-xs text-[var(--primary)] hover:underline shrink-0">
                    {copied ? (isZh ? "已复制 ✓" : "Copied ✓") : (isZh ? "复制" : "Copy")}
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {isZh ? "用于 agentskillshub.top/pro/ 激活，已同步发到你的邮箱作为备份" : "For agentskillshub.top/pro/ — also emailed as backup"}
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="shrink-0 w-6 h-6 rounded-full bg-blue-50 text-[var(--primary)] font-bold text-xs flex items-center justify-center">3</span>
              <div>
                <p className="font-semibold text-gray-900 mb-1">
                  {isZh ? "添加 Jason 微信进会员群" : "Join the member group"}
                </p>
                <p>{isZh ? "凭付款记录和 GitHub 用户名入群，参加半月度讨论会。" : "DM Jason with your payment record."}</p>
              </div>
            </li>
          </ol>
          <p className="text-xs text-gray-400 text-center mt-6 pt-4 border-t border-gray-100">
            {isZh ? `会员有效期至 ${result.expiresAt}` : `Valid until ${result.expiresAt}`}
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white border border-gray-100 rounded-2xl p-7 space-y-5">
          <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              {isZh ? "兑换码" : "Code"} <span className="text-red-500">*</span>
            </label>
            <input
              name="code"
              required
              placeholder="GSC-XXXXXXXX"
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm font-mono uppercase focus:border-[var(--primary)] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              {isZh ? "GitHub 用户名" : "GitHub username"} <span className="text-red-500">*</span>
            </label>
            <input
              name="github"
              required
              placeholder={isZh ? "如 zhuyansen（不带 @）" : "e.g. octocat"}
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:border-[var(--primary)] focus:outline-none"
            />
            <p className="text-xs text-gray-400 mt-1">
              {isZh ? "没有 GitHub 账号？先去 github.com 免费注册一个（1 分钟）" : "Create one free at github.com"}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              {isZh ? "邮箱" : "Email"} <span className="text-red-500">*</span>
            </label>
            <input
              name="email"
              type="email"
              required
              placeholder="you@example.com"
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:border-[var(--primary)] focus:outline-none"
            />
          </div>
          {status === "error" && <p className="text-sm text-red-500 text-center">{errorMsg}</p>}
          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full py-3.5 bg-[var(--primary)] text-white font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {status === "loading" ? (isZh ? "开通中…" : "Activating…") : (isZh ? "立即开通" : "Activate")}
          </button>
          <p className="text-xs text-gray-400 text-center">
            {isZh ? "还没有兑换码？" : "No code yet? "}
            <a href={`/${lang}/club`} className="text-[var(--primary)] hover:underline">
              {isZh ? "了解 GoSail Club →" : "Learn about GoSail Club →"}
            </a>
          </p>
        </form>
      )}
    </div>
  );
}
