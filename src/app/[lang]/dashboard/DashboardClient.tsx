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

  // 会员事后补填 GitHub 用户名（虎皮椒结账时可能跳过了）
  const [linkGithub, setLinkGithub] = useState(suggestedGithub);
  const [linking, setLinking] = useState(false);
  const [linkError, setLinkError] = useState("");

  async function handleLinkGithub(e: React.FormEvent) {
    e.preventDefault();
    setLinking(true);
    setLinkError("");
    try {
      const res = await fetch("/api/dashboard/link-github", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ github: linkGithub }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setProfile((p) => ({ ...(p as Profile), github_username: data.github }));
      } else {
        setLinkError(data.error || (isZh ? "绑定失败" : "Failed"));
      }
    } catch {
      setLinkError(isZh ? "网络错误，请稍后重试" : "Network error");
    } finally {
      setLinking(false);
    }
  }

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

          {profile?.github_username && (
            <div className="text-sm text-gray-600">
              <span className="text-gray-400">GitHub: </span>@{profile.github_username}
            </div>
          )}

          <div className="border-t border-gray-100 pt-5 space-y-4">
            {/* 增长视频课 */}
            <div className="border border-gray-100 rounded-xl p-4">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-gray-900">🎬 {isZh ? "增长视频课" : "Growth video course"}</div>
                  <p className="text-xs text-gray-500 mt-1">
                    {isZh
                      ? "7 集实操视频 + 完整逐字稿：从 0 搭建你的 X 增长引擎，网页内直接看"
                      : "7 hands-on episodes with full transcripts — build your X growth engine, watch right in the browser"}
                  </p>
                </div>
                <a
                  href={`/${lang}/club/course`}
                  className="shrink-0 text-xs px-4 py-2 bg-[var(--primary)] text-white rounded-lg hover:opacity-90 transition-opacity font-medium"
                >
                  {isZh ? "去看课程 →" : "Watch →"}
                </a>
              </div>
            </div>

            {/* 闭门讨论会 */}
            <div className="border border-gray-100 rounded-xl p-4">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-gray-900">🎙 {isZh ? "闭门讨论会" : "Closed-door sessions"}</div>
                  <p className="text-xs text-gray-500 mt-1">
                    {isZh
                      ? "半月度讨论会回放 + 完整逐字稿，按时间和主题归档"
                      : "Bi-weekly session recordings with full transcripts, archived by date and topic"}
                  </p>
                </div>
                <a
                  href={`/${lang}/club/sessions`}
                  className="shrink-0 text-xs px-4 py-2 bg-[var(--primary)] text-white rounded-lg hover:opacity-90 transition-opacity font-medium"
                >
                  {isZh ? "去看回放 →" : "Watch →"}
                </a>
              </div>
            </div>

            {/* GitHub 会员仓库 */}
            <div className="border border-gray-100 rounded-xl p-4">
              <div className="flex items-center justify-between gap-3 flex-wrap mb-2">
                <div className="text-sm font-semibold text-gray-900">📦 {isZh ? "GitHub 会员仓库" : "GitHub member repos"}</div>
                {profile?.github_username && (
                  <a
                    href="https://github.com/orgs/gosail-club/invitation"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 text-xs px-4 py-2 border border-gray-200 rounded-lg hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors"
                  >
                    {isZh ? "接受邀请 →" : "Accept invite →"}
                  </a>
                )}
              </div>
              <ul className="text-xs text-gray-500 space-y-1.5 mb-3">
                <li><code className="bg-gray-100 px-1.5 py-0.5 rounded text-[11px] font-mono text-gray-700">jasonzhu-x-hot-radar</code> — {isZh ? "X 热点雷达，端到端推文发布管道（热点发现 → Typefully 草稿）" : "End-to-end X trend-to-draft pipeline"}</li>
                <li><code className="bg-gray-100 px-1.5 py-0.5 rounded text-[11px] font-mono text-gray-700">jasonzhu-content-flow</code> — {isZh ? "公众号 / 小红书 / 推特一键分发" : "One-click distribution: WeChat / RedNote / X"}</li>
                <li><code className="bg-gray-100 px-1.5 py-0.5 rounded text-[11px] font-mono text-gray-700">aip-handbook</code> — {isZh ? "AIP 出海自媒体实战手册（会员版）" : "AIP handbook, member edition"}</li>
              </ul>
              {!profile?.github_username && (
                <form onSubmit={handleLinkGithub} className="flex items-center gap-2 flex-wrap pt-2 border-t border-gray-100">
                  <input
                    value={linkGithub}
                    onChange={(e) => setLinkGithub(e.target.value)}
                    required
                    placeholder={isZh ? "填 GitHub 用户名解锁这三个仓库" : "GitHub username to unlock these repos"}
                    className="flex-1 min-w-0 px-3 py-2 border border-gray-200 rounded-lg text-xs focus:border-[var(--primary)] focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={linking}
                    className="shrink-0 text-xs px-4 py-2 bg-[var(--primary)] text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {linking ? (isZh ? "绑定中…" : "Linking…") : (isZh ? "绑定并邀请" : "Link & invite")}
                  </button>
                  {linkError && <p className="text-xs text-red-500 w-full">{linkError}</p>}
                </form>
              )}
            </div>

            {/* AgentSkillsHub Pro */}
            <div className="border border-gray-100 rounded-xl p-4">
              <div className="flex items-center justify-between gap-3 flex-wrap mb-2">
                <div className="text-sm font-semibold text-gray-900">🔍 AgentSkillsHub Pro</div>
                <a
                  href="https://agentskillshub.top/pro"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 text-xs px-4 py-2 border border-gray-200 rounded-lg hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors"
                >
                  {isZh ? "打开搜索 →" : "Open search →"}
                </a>
              </div>
              <ol className="text-xs text-gray-500 space-y-2 leading-relaxed">
                <li>
                  {isZh ? "网页端：打开 " : "Web: open "}
                  <a href="https://agentskillshub.top/pro" target="_blank" rel="noopener noreferrer" className="text-[var(--primary)] hover:underline">agentskillshub.top/pro</a>
                  {isZh ? "，粘贴上面这串 key 即可解锁全库深度搜索、社区精选榜、Top3 解读——不用注册、不用登录。" : ", paste your key above — full-library deep search, curated ranking, weekly Top3. No signup needed."}
                </li>
                <li>
                  CLI：<code className="bg-gray-100 px-1.5 py-0.5 rounded text-[11px] font-mono text-gray-700 break-all">ASH_PRO_KEY={profile?.hub_key} npx @agentskillshub/cli search &quot;关键词&quot;</code>
                </li>
                <li>
                  MCP（Claude Code）：<code className="bg-gray-100 px-1.5 py-0.5 rounded text-[11px] font-mono text-gray-700 break-all">claude mcp add agentskillshub -e ASH_PRO_KEY={profile?.hub_key} -- npx -y @agentskillshub/mcp</code>
                  {isZh ? "，配好后 agent 会自动用 pro_search 工具做深度检索。" : " — the agent will auto-use pro_search for deep lookups."}
                </li>
              </ol>
            </div>
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
              {isZh ? "已经付款，有兑换码？（可以查看邮箱邮件）" : "Already paid and have a code? (check your email)"}
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
                <label className="block text-xs font-medium text-gray-500 mb-1.5">{isZh ? "GitHub 用户名（可选）" : "GitHub username (optional)"}</label>
                <input
                  value={github}
                  onChange={(e) => setGithub(e.target.value)}
                  placeholder={isZh ? "没有就先跳过，之后可以补填" : "Skip if you don't have one"}
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
