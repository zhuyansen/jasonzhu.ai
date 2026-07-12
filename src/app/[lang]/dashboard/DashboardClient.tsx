"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase-browser";

interface SimpleUser {
  id: string;
  email: string | null;
}

interface Profile {
  role: string;
  github_username: string | null;
  hub_key: string | null;
  activated_at: string | null;
  expires_at: string | null;
}

interface Props {
  lang: "zh" | "en";
  initialUser: SimpleUser | null;
  initialProfile: Profile | null;
  suggestedGithub: string;
}

const ROLE_LABEL: Record<string, string> = {
  free: "未激活",
  member: "启航版会员",
  pro: "进阶版会员",
  partner: "合伙人",
};

export default function DashboardClient({ lang, initialUser, initialProfile, suggestedGithub }: Props) {
  const isZh = lang === "zh";
  const user = initialUser;
  const [profile, setProfile] = useState<Profile | null>(initialProfile);
  const [copied, setCopied] = useState(false);

  // 兑换码绑定表单
  const [code, setCode] = useState("");
  const [github, setGithub] = useState(suggestedGithub);
  const [redeeming, setRedeeming] = useState(false);
  const [redeemError, setRedeemError] = useState("");

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = `/${lang}`;
  }

  async function handleRedeem(e: React.FormEvent) {
    e.preventDefault();
    setRedeeming(true);
    setRedeemError("");
    try {
      const res = await fetch("/api/dashboard/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, github }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setProfile((p) => ({
          ...(p as Profile),
          role: "member",
          github_username: data.github,
          hub_key: data.hubKey,
          expires_at: data.expiresAt,
        }));
      } else {
        setRedeemError(data.error || (isZh ? "绑定失败" : "Failed"));
      }
    } catch {
      setRedeemError(isZh ? "网络错误，请稍后重试" : "Network error");
    } finally {
      setRedeeming(false);
    }
  }

  const copyKey = async () => {
    if (!profile?.hub_key) return;
    await navigator.clipboard.writeText(profile.hub_key);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!user) {
    return (
      <div className="max-w-sm mx-auto px-4 sm:px-6 py-20 text-center">
        <span className="text-4xl">🔒</span>
        <h1 className="text-xl font-bold text-gray-900 mt-4 mb-2">{isZh ? "请先登录" : "Please sign in"}</h1>
        <p className="text-sm text-gray-400 mb-8">{isZh ? "登录后查看你的会员状态和 Hub Key" : "Sign in to view your membership"}</p>
        <a href={`/${lang}/login`} className="inline-block px-8 py-3 bg-[var(--primary)] text-white font-semibold rounded-xl hover:opacity-90 transition-opacity">
          {isZh ? "去登录 →" : "Sign in →"}
        </a>
      </div>
    );
  }

  const isMember = profile && profile.role !== "free" && profile.hub_key;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-14">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{isZh ? "会员中心" : "Dashboard"}</h1>
          <p className="text-sm text-gray-400 mt-1">{user.email}</p>
        </div>
        <button onClick={handleSignOut} className="text-xs text-gray-400 hover:text-gray-600">
          {isZh ? "退出登录" : "Sign out"}
        </button>
      </div>

      {isMember ? (
        <div className="bg-white border border-green-200 rounded-2xl p-7 space-y-5">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 bg-green-50 text-green-700 text-xs font-semibold rounded-full">
              ✓ {ROLE_LABEL[profile!.role] || profile!.role}
            </span>
            {profile?.expires_at && (
              <span className="text-xs text-gray-400">
                {isZh ? `有效期至 ${profile.expires_at.slice(0, 10)}` : `Valid until ${profile.expires_at.slice(0, 10)}`}
              </span>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Agent Skills Hub Pro Key</label>
            <div className="flex items-center gap-2 flex-wrap">
              <code className="px-3 py-2 bg-gray-900 text-green-400 rounded-lg text-xs break-all flex-1 min-w-0">{profile?.hub_key}</code>
              <button onClick={copyKey} className="text-xs text-[var(--primary)] hover:underline shrink-0 px-2">
                {copied ? (isZh ? "已复制 ✓" : "Copied ✓") : (isZh ? "复制" : "Copy")}
              </button>
            </div>
          </div>

          <div className="text-sm text-gray-600">
            <span className="text-gray-400">GitHub: </span>@{profile?.github_username}
          </div>

          <div className="border-t border-gray-100 pt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <a
              href={`/${lang}/club/course`}
              className="text-center text-sm px-4 py-2.5 bg-[var(--primary)] text-white rounded-lg hover:opacity-90 transition-opacity font-medium"
            >
              {isZh ? "🎬 增长视频课" : "🎬 Growth course"}
            </a>
            <a
              href={`https://github.com/orgs/gosail-club/invitation`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-center text-sm px-4 py-2.5 border border-gray-200 rounded-lg hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors"
            >
              {isZh ? "GitHub 邀请入口" : "GitHub invite"}
            </a>
            <a
              href="https://agentskillshub.top"
              target="_blank"
              rel="noopener noreferrer"
              className="text-center text-sm px-4 py-2.5 border border-gray-200 rounded-lg hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors"
            >
              {isZh ? "AgentSkillsHub Pro 搜索" : "SkillsHub Pro search"}
            </a>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          {/* 非会员的主引导——第一眼看到的应该是"怎么加入"，不是一个假设你已经买过的表单 */}
          <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-100 rounded-2xl p-7 text-center">
            <span className="text-3xl">⛵</span>
            <h2 className="text-lg font-bold text-gray-900 mt-3 mb-1.5">
              {isZh ? "你还不是 GoSail Club 会员" : "You're not a member yet"}
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              {isZh
                ? "加入后解锁 Agent Skills Hub Pro Key、增长视频课、社群等全部权益"
                : "Join to unlock the Pro Key, growth video course, and community"}
            </p>
            <a
              href={`/${lang}/club`}
              className="inline-block px-8 py-3 bg-[var(--primary)] text-white font-semibold rounded-xl hover:opacity-90 transition-opacity"
            >
              {isZh ? "了解 GoSail Club →" : "Learn about GoSail Club →"}
            </a>
          </div>

          {/* 已付款、手上有码的人走这里，视觉上明显弱于上面的主 CTA */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-1">
              {isZh ? "已经付款，有兑换码？" : "Already paid and have a code?"}
            </h3>
            <p className="text-xs text-gray-400 mb-4">
              {isZh ? "在这里绑定到当前账号" : "Bind it to this account below"}
            </p>
            <form onSubmit={handleRedeem} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">{isZh ? "兑换码" : "Code"}</label>
                <input
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                  placeholder="GSC-XXXXXXXX"
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm font-mono uppercase focus:border-[var(--primary)] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">{isZh ? "GitHub 用户名" : "GitHub username"}</label>
                <input
                  value={github}
                  onChange={(e) => setGithub(e.target.value)}
                  required
                  placeholder={isZh ? "如 zhuyansen（不带 @）" : "e.g. octocat"}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:border-[var(--primary)] focus:outline-none"
                />
              </div>
              {redeemError && <p className="text-sm text-red-500">{redeemError}</p>}
              <button
                type="submit"
                disabled={redeeming}
                className="w-full py-2.5 border border-gray-200 text-gray-700 font-medium rounded-lg hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors disabled:opacity-50 text-sm"
              >
                {redeeming ? (isZh ? "绑定中…" : "Binding…") : (isZh ? "绑定并开通" : "Bind & activate")}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
