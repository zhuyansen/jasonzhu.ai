"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase-browser";

interface Props {
  lang: "zh" | "en";
}

interface Profile {
  role: string;
  github_username: string | null;
  hub_key: string | null;
  activated_at: string | null;
  expires_at: string | null;
}

const ROLE_LABEL: Record<string, string> = {
  free: "未激活",
  member: "启航版会员",
  pro: "进阶版会员",
  partner: "合伙人",
};

export default function DashboardClient({ lang }: Props) {
  const isZh = lang === "zh";
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [copied, setCopied] = useState(false);

  // 兑换码绑定表单
  const [code, setCode] = useState("");
  const [github, setGithub] = useState("");
  const [redeeming, setRedeeming] = useState(false);
  const [redeemError, setRedeemError] = useState("");

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      setUser(user);
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("role, github_username, hub_key, activated_at, expires_at")
          .eq("id", user.id)
          .single();
        setProfile(data);
        if (user.user_metadata?.user_name) setGithub(user.user_metadata.user_name);
      }
      setLoading(false);
    });
  }, []);

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

  if (loading) {
    return <div className="max-w-2xl mx-auto px-4 py-24 text-center text-sm text-gray-400">{isZh ? "加载中…" : "Loading…"}</div>;
  }

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
            <label className="block text-xs font-medium text-gray-500 mb-1.5">SkillsHub Pro Key</label>
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

          <div className="border-t border-gray-100 pt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
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
        <div className="bg-white border border-gray-100 rounded-2xl p-7">
          <h2 className="text-sm font-semibold text-gray-900 mb-1">{isZh ? "绑定兑换码" : "Redeem your code"}</h2>
          <p className="text-xs text-gray-400 mb-5">
            {isZh ? "输入付款后收到的兑换码，绑定到当前账号" : "Enter the code you received after payment"}
          </p>
          <form onSubmit={handleRedeem} className="space-y-4">
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
              className="w-full py-3 bg-[var(--primary)] text-white font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {redeeming ? (isZh ? "绑定中…" : "Binding…") : (isZh ? "绑定并开通" : "Bind & activate")}
            </button>
          </form>
          <p className="text-xs text-gray-400 text-center mt-5">
            {isZh ? "还没有兑换码？" : "No code yet? "}
            <a href={`/${lang}/club`} className="text-[var(--primary)] hover:underline">
              {isZh ? "了解 GoSail Club →" : "Learn about GoSail Club →"}
            </a>
          </p>
        </div>
      )}
    </div>
  );
}
