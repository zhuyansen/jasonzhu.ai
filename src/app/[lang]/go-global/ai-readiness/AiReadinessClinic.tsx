"use client";

import React, { useEffect, useState } from "react";
import Link from "@/components/Link";
import { track } from "@/lib/track";
import {
  BENCHMARK_HALL_OF_FAME,
  CATEGORIES,
  scoreToGrade,
  type BenchmarkEntry,
  type ScanReport,
} from "@/lib/ai-readiness-scanner";

interface RecentScanRow {
  domain: string;
  score: number;
  grade: string;
  score_delta?: number | null;
  failed_count?: number;
  created_at: string;
}

interface TopFailedCheck {
  key: string;
  level: number;
  maxScore: number;
  title: { zh: string; en: string };
  failCount: number;
  failRatePct: number;
}

interface ClinicInsights {
  analyzedDomainsCount: number;
  avgScore: number;
  gradeARate: number;
  topFailedChecks: TopFailedCheck[];
}

interface SandboxUpgradeItem {
  id: string;
  level: number;
  pts: number;
  stage: string;
  title: { zh: string; en: string };
  symptom: { zh: string; en: string };
  fixCode: string;
}

const SANDBOX_UPGRADES: SandboxUpgradeItem[] = [
  {
    id: "robots_signal",
    level: 1,
    pts: 10,
    stage: "1. Reach",
    title: {
      zh: "第 1 关药方：放行 GPTBot/ClaudeBot + 声明 Content-Signal",
      en: "Level 1 Fix: Allow AI bots + declare Content-Signal in robots.txt",
    },
    symptom: {
      zh: "原站 robots.txt 封禁了 AI 爬虫且缺少 Content-Signal（丢 10 分）",
      en: "robots.txt blocked AI bots and lacked Content-Signal (-10 pts)",
    },
    fixCode: `User-agent: *\nAllow: /\nContent-Signal: search=yes, ai-input=yes, ai-train=yes\nSitemap: https://example.com/sitemap.xml`,
  },
  {
    id: "ssr_no_js",
    level: 2,
    pts: 12,
    stage: "1. Reach → 3. Cite",
    title: {
      zh: "第 2 关药方：从空白 CSR 客户端渲染改为 SSR 直出 HTML + Canonical",
      en: "Level 2 Fix: Switch from blank CSR to SSR HTML + Canonical tag",
    },
    symptom: {
      zh: "原站关掉 JS 后只有 <div id=\"root\"></div>，AI 爬虫看到白纸（丢 12 分）",
      en: "Page rendered empty <div id=\"root\"> without JS (-12 pts)",
    },
    fixCode: `<head>\n  <title>Brand — Clear Value Prop</title>\n  <meta name="description" content="Direct BLUF summary..." />\n  <link rel="canonical" href="https://example.com/" />\n</head>`,
  },
  {
    id: "sitemap_404",
    level: 3,
    pts: 11,
    stage: "2. Search",
    title: {
      zh: "第 3 关药方：生成带近期 lastmod 的 Sitemap + 修复软 404",
      en: "Level 3 Fix: Publish sitemap.xml with fresh lastmod + real HTTP 404",
    },
    symptom: {
      zh: "原站无 sitemap.xml 且不存在的 URL 返回 200 软 404（丢 11 分）",
      en: "Missing sitemap.xml and soft-404 on unknown routes (-11 pts)",
    },
    fixCode: `<url>\n  <loc>https://example.com/</loc>\n  <lastmod>${new Date().toISOString().slice(0, 10)}</lastmod>\n</url>`,
  },
  {
    id: "jsonld_graph",
    level: 4,
    pts: 14,
    stage: "4. Describe",
    title: {
      zh: "第 4 关药方：注入 @graph JSON-LD（Organization + sameAs + WebSite）",
      en: "Level 4 Fix: Inject @graph JSON-LD (Organization + sameAs + WebSite)",
    },
    symptom: {
      zh: "原站没有任何 Schema.org 结构化身份声明（丢 14 分）",
      en: "Zero JSON-LD structured data on homepage (-14 pts)",
    },
    fixCode: `{\n  "@context": "https://schema.org",\n  "@graph": [\n    { "@type": "Organization", "name": "Brand", "url": "https://example.com", "sameAs": ["https://github.com/brand", "https://x.com/brand"] },\n    { "@type": "WebSite", "name": "Brand", "url": "https://example.com" }\n  ]\n}`,
  },
  {
    id: "commercial_trust",
    level: 5,
    pts: 8,
    stage: "4. Describe",
    title: {
      zh: "第 5 关药方：页脚补齐 /about /contact /privacy + 静态透明价格",
      en: "Level 5 Fix: Footer trust links + machine-readable email & pricing",
    },
    symptom: {
      zh: "原站缺少联系邮箱与公开价格说明，收款审核与 AI 比价双双被拒（丢 8 分）",
      en: "Missing contactPoint email and static pricing tiers (-8 pts)",
    },
    fixCode: `<a href="mailto:founder@example.com">founder@example.com</a>\n<!-- JSON-LD Offer: price: "0", priceCurrency: "USD" -->`,
  },
  {
    id: "llms_markdown",
    level: 6,
    pts: 10,
    stage: "3. Cite",
    title: {
      zh: "第 6 关药方：上线标准 /llms.txt + Accept: text/markdown 协商 + Link 头",
      en: "Level 6 Fix: Serve /llms.txt + Markdown content negotiation + HTTP Link header",
    },
    symptom: {
      zh: "原站未提供 AI 专属上下文菜单，大模型只能硬啃嘈杂 HTML（丢 10 分）",
      en: "No /llms.txt or Markdown content negotiation (-10 pts)",
    },
    fixCode: `# Brand\n> One-line BLUF summary for LLMs\n\n## Core Pages\n- [Home](https://example.com/): Main product overview`,
  },
  {
    id: "webmcp_card",
    level: 7,
    pts: 10,
    stage: "4. Describe",
    title: {
      zh: "第 7 关终极药方：暴露 WebMCP 工具 + 发布 /.well-known/mcp/server-card.json",
      en: "Level 7 Boss Fix: Expose WebMCP tools + publish MCP Server Card",
    },
    symptom: {
      zh: "99% 网站卡在这一关：没有把网页变成 Agent 可调用的工具节点（丢 10 分）",
      en: "99% of sites fail here: no WebMCP tools or MCP Server Card (-10 pts)",
    },
    fixCode: `<form toolname="search_docs" tooldescription="Search documentation" toolautosubmit="true">\n  <input name="q" />\n</form>\n// + /.well-known/mcp/server-card.json`,
  },
];

function gradeTheme(grade: string) {
  switch (grade) {
    case "A":
      return {
        badge: "bg-emerald-100 text-emerald-800 border-emerald-300",
        ring: "#10b981",
        bg: "from-emerald-500/10 to-teal-500/5 border-emerald-200",
        text: "text-emerald-700",
      };
    case "B":
      return {
        badge: "bg-blue-100 text-blue-800 border-blue-300",
        ring: "#2563eb",
        bg: "from-blue-500/10 to-indigo-500/5 border-blue-200",
        text: "text-blue-700",
      };
    case "C":
      return {
        badge: "bg-amber-100 text-amber-800 border-amber-300",
        ring: "#f59e0b",
        bg: "from-amber-500/10 to-yellow-500/5 border-amber-200",
        text: "text-amber-700",
      };
    case "D":
      return {
        badge: "bg-orange-100 text-orange-800 border-orange-300",
        ring: "#f97316",
        bg: "from-orange-500/10 to-red-500/5 border-orange-200",
        text: "text-orange-700",
      };
    default:
      return {
        badge: "bg-red-100 text-red-800 border-red-300",
        ring: "#ef4444",
        bg: "from-red-500/10 to-rose-500/5 border-red-200",
        text: "text-red-700",
      };
  }
}

/** SVG 圆环分数仪表盘 */
function ScoreRing({ score, grade }: { score: number; grade: string }) {
  const theme = gradeTheme(grade);
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, score));
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center w-28 h-28 flex-none">
      <svg className="w-28 h-28 -rotate-90" viewBox="0 0 108 108">
        <circle
          cx="54"
          cy="54"
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="9"
        />
        <circle
          cx="54"
          cy="54"
          r={radius}
          fill="none"
          stroke={theme.ring}
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-black text-gray-900 leading-none">{score}</span>
        <span className="text-[11px] font-semibold text-gray-400 mt-0.5">/ 100</span>
      </div>
    </div>
  );
}

export default function AiReadinessClinic({ lang }: { lang: "zh" | "en" }) {
  const isZh = lang === "zh";
  const [mode, setMode] = useState<"clinic" | "sandbox">("clinic");
  const [domainInput, setDomainInput] = useState("jasonzhu.ai");
  const [loading, setLoading] = useState(false);
  const [scanStepIdx, setScanStepIdx] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<ScanReport | null>(null);
  const [previousScore, setPreviousScore] = useState<number | null>(null);
  const [scoreDelta, setScoreDelta] = useState<number | null>(null);
  const [activeLevel, setActiveLevel] = useState<number | null>(null);
  const [onlyFailedFilter, setOnlyFailedFilter] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // 公开病历库检索 & 付费隐藏弹窗状态
  const [publicSearchQuery, setPublicSearchQuery] = useState("");
  const [hideModalDomain, setHideModalDomain] = useState<string | null>(null);

  // 大盘与实时记录
  const [recentScans, setRecentScans] = useState<RecentScanRow[]>([]);
  const [totalScans, setTotalScans] = useState<number>(BENCHMARK_HALL_OF_FAME.length);
  const [insights, setInsights] = useState<ClinicInsights>({
    analyzedDomainsCount: 6,
    avgScore: 80,
    gradeARate: 50,
    topFailedChecks: [],
  });

  // 掉分监控 & 复诊提醒邮箱订阅
  const [monitorEmail, setMonitorEmail] = useState("");
  const [monitorSubmitting, setMonitorSubmitting] = useState(false);
  const [monitorMsg, setMonitorMsg] = useState<string | null>(null);
  const [monitorErr, setMonitorErr] = useState<string | null>(null);

  // 沙盒闯关状态：初始 25 分（典型纯 CSR 病患网站），勾选 7 个药方一路升到 100 分
  const [sandboxChecked, setSandboxChecked] = useState<Record<string, boolean>>({
    robots_signal: false,
    ssr_no_js: false,
    sitemap_404: false,
    jsonld_graph: false,
    commercial_trust: false,
    llms_markdown: false,
    webmcp_card: false,
  });

  const sandboxBaseScore = 25;
  const sandboxEarned = SANDBOX_UPGRADES.reduce(
    (sum, item) => sum + (sandboxChecked[item.id] ? item.pts : 0),
    sandboxBaseScore
  );
  const sandboxGradeInfo = scoreToGrade(sandboxEarned);
  const sandboxClearedCount = Object.values(sandboxChecked).filter(Boolean).length;

  function refreshDashboard(q = "") {
    const url = q ? `/api/ai-readiness?q=${encodeURIComponent(q)}` : "/api/ai-readiness";
    fetch(url)
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d?.recentScans)) setRecentScans(d.recentScans);
        if (typeof d?.totalScans === "number") setTotalScans(d.totalScans);
        if (d?.insights) setInsights(d.insights);
      })
      .catch(() => {});
  }

  useEffect(() => {
    refreshDashboard();
  }, []);

  const scanSteps = isZh
    ? [
        "Stage 1 (Reach) · 检查 /robots.txt、AI 爬虫放行权限与 Content-Signal...",
        "Stage 1 (Reach) · 关闭 JS 抽取原始 HTML 正文并测算 Token 预算...",
        "Stage 2 (Search) · 探测 /sitemap.xml、lastmod 与真实 404 状态码...",
        "Stage 3 (Cite) · 请求 /llms.txt、Accept: text/markdown 协商与首段切片...",
        "Stage 4 (Describe) · 解析 JSON-LD @graph、Organization 与跨源实体对齐...",
        "Stage 4 (Describe) · 核验合规三件套、机器可读邮箱与免登录透明价格...",
        "Stage 4 & 5 · 扫描 WebMCP 工具、Server Card 并写入公开病历档案库...",
      ]
    : [
        "Stage 1 (Reach): Checking /robots.txt, AI bot rules & Content-Signal...",
        "Stage 1 (Reach): Extracting zero-JS HTML text & token budget...",
        "Stage 2 (Search): Probing /sitemap.xml, lastmod & real 404 status...",
        "Stage 3 (Cite): Fetching /llms.txt, Markdown negotiation & lead chunk...",
        "Stage 4 (Describe): Parsing JSON-LD @graph, Organization & entity resolution...",
        "Stage 4 (Describe): Verifying trust links, contactPoint & public pricing...",
        "Stage 4 & 5: Scanning WebMCP tools, Server Card & logging public record...",
      ];

  async function handleScan(targetDomain?: string) {
    const target = (targetDomain ?? domainInput).trim();
    if (!target) return;
    setDomainInput(target);
    setMode("clinic");
    setLoading(true);
    setError(null);
    setMonitorMsg(null);
    setMonitorErr(null);
    setScanStepIdx(0);

    const timer = setInterval(() => {
      setScanStepIdx((prev) => (prev + 1) % 7);
    }, 520);

    try {
      const res = await fetch("/api/ai-readiness", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: target, lang, source: "ai-clinic-page" }),
      });
      const data = await res.json();
      if (!res.ok || data?.error) {
        setError(data?.error || (isZh ? "诊断失败，请检查域名是否可访问" : "Scan failed"));
      } else if (data?.report) {
        setReport(data.report as ScanReport);
        // 只发域名：report.domain 是服务端规范过的主机名（不带协议、路径、参数、端口）；finalUrl 是完整网址，不发
        track("ai_readiness_scan", { domain: (data.report as ScanReport).domain });
        setPreviousScore(typeof data.previousScore === "number" ? data.previousScore : null);
        setScoreDelta(typeof data.scoreDelta === "number" ? data.scoreDelta : null);
        setActiveLevel(null);
        refreshDashboard(publicSearchQuery);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : isZh ? "网络请求异常" : "Network error");
    } finally {
      clearInterval(timer);
      setLoading(false);
    }
  }

  async function handleMonitorSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!report || !monitorEmail.trim()) return;
    setMonitorSubmitting(true);
    setMonitorErr(null);
    setMonitorMsg(null);
    try {
      const res = await fetch("/api/ai-readiness", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "monitor",
          domain: report.domain,
          email: monitorEmail.trim(),
          score: report.score,
          grade: report.grade,
          lang,
        }),
      });
      const data = await res.json();
      if (!res.ok || data?.error) {
        setMonitorErr(data?.error || (isZh ? "提交失败，请重试" : "Failed to enable monitoring"));
      } else {
        setMonitorMsg(data?.message || (isZh ? "已开启掉分守护！" : "Monitoring enabled!"));
        setMonitorEmail("");
      }
    } catch {
      setMonitorErr(isZh ? "网络错误，请稍后重试" : "Network error");
    } finally {
      setMonitorSubmitting(false);
    }
  }

  function copyText(key: string, text: string) {
    navigator.clipboard?.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2200);
  }

  const passedCount = report ? report.passedKeys.length : 0;
  const failedCount = report ? report.failedKeys.length : 0;

  return (
    <div className="space-y-10">
      {/* ═══════════════════════════════════════════════════════════════════════
          付费隐藏域名 / 解锁 L1~L4 内部核心经验 弹窗 (Modal)
          ═══════════════════════════════════════════════════════════════════════ */}
      {hideModalDomain && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-lg rounded-3xl border border-slate-700 bg-slate-900 p-6 md:p-7 text-white shadow-2xl">
            <button
              type="button"
              onClick={() => setHideModalDomain(null)}
              className="absolute top-5 right-5 rounded-full bg-white/10 px-2.5 py-1 text-xs text-slate-300 hover:bg-white/20 cursor-pointer"
            >
              ✕
            </button>
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/20 border border-amber-400/30 px-3 py-1 text-xs font-bold text-amber-300 mb-3">
              {isZh ? "🔒 隐私保护 & 内部高阶特权" : "🔒 Stealth Privacy & VIP Playbook"}
            </div>
            <h3 className="text-xl font-extrabold text-white mb-2">
              {isZh
                ? `隐藏「${hideModalDomain}」的公开体检记录 & 解锁内部配方`
                : `Hide "${hideModalDomain}" from Public Directory & Unlock VIP Playbook`}
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed mb-4">
              {isZh
                ? "免费急诊室采取「公开透明病历库」机制：所有免费查询的网站默认都会展示在公开档案库中，供全网开发者检索对比。如果你希望保护商业机密："
                : "Free clinic scans are indexed in our public directory by default. Upgrade to protect your competitive edge:"}
            </p>
            <ul className="space-y-2.5 text-xs text-slate-200 mb-6 bg-slate-950/80 border border-white/10 rounded-2xl p-4">
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>
                  {isZh
                    ? "【榜单隐身特权】：将你的域名从公开病历库与选品雷达中永久隐藏（is_hidden = true），防止同行窥探你的新站域名与技术短板。"
                    : "Stealth Delisting: Permanently hide your domain from the public clinic directory."}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>
                  {isZh
                    ? "【解锁 L1~L4 内部核心经验】：获取对外保密的搜广推/图谱内部参数（新站抓取配额安全线、防折叠阈值、跨语种扇出词槽矩阵与黄金首段切片公式）。"
                    : "Internal L1–L4 Parameters: Access confidential IR/KG/RAG thresholds and recipes."}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>
                  {isZh
                    ? "【每周闭环实验带练】：加入 GoSail Club 内部会员或预约 1v1 深度诊断。"
                    : "Weekly Closed-Loop Lab & 1-on-1 Private Audit."}
                </span>
              </li>
            </ul>
            <div className="flex flex-wrap items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setHideModalDomain(null)}
                className="rounded-xl border border-white/15 px-4 py-2.5 text-xs font-semibold text-slate-300 hover:bg-white/10 cursor-pointer"
              >
                {isZh ? "保持公开展示" : "Keep Public"}
              </button>
              <Link
                href={`/${lang}/services`}
                className="rounded-xl border border-amber-400/50 bg-amber-500/20 px-4 py-2.5 text-xs font-bold text-amber-200 hover:bg-amber-500/30"
              >
                {isZh ? "预约 1v1 私密会诊 →" : "1-on-1 Private Audit →"}
              </Link>
              <Link
                href={`/${lang}/club`}
                className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg hover:from-blue-500 hover:to-indigo-500"
              >
                {isZh ? "加入 GoSail Club 解锁隐身与内部课 →" : "Join GoSail Club to Hide & Unlock →"}
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          1. 顶部主控舱（双模式切换：实时网站急诊室 vs 7 关闯关模拟器）
          ═══════════════════════════════════════════════════════════════════════ */}
      <div className="relative overflow-hidden rounded-3xl border border-blue-200/80 bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950 text-white p-6 md:p-8 shadow-xl">
        <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-emerald-500/15 blur-3xl" />

        {/* 顶部标签栏与模式切换 */}
        <div className="relative flex flex-wrap items-center justify-between gap-3 pb-6 mb-6 border-b border-white/10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 px-3 py-1 text-xs font-semibold text-blue-200">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              {isZh
                ? "GEO 五阶段 (Reach → Search → Cite → Describe → Measure) · 100 分制"
                : "GEO 5-Stage Funnel (Reach → Search → Cite → Describe → Measure)"}
            </span>
            <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-slate-300">
              {isZh
                ? `公开病历库已收录 ${totalScans} 次检测 · 平均 ${insights.avgScore} 分`
                : `${totalScans} public scans · Avg ${insights.avgScore}/100`}
            </span>
          </div>

          <div className="inline-flex rounded-2xl bg-slate-800/90 border border-white/10 p-1 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setMode("clinic")}
              className={`rounded-xl px-3.5 py-2 transition-all cursor-pointer ${
                mode === "clinic"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              {isZh ? "🏥 实时网站急诊室" : "🏥 Live Site Clinic"}
            </button>
            <button
              type="button"
              onClick={() => setMode("sandbox")}
              className={`rounded-xl px-3.5 py-2 transition-all cursor-pointer ${
                mode === "sandbox"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              {isZh ? "🎮 7 关闯关模拟器 (25→100分)" : "🎮 7-Level Simulator (25→100)"}
            </button>
          </div>
        </div>

        {mode === "clinic" ? (
          <div className="relative">
            <div className="max-w-3xl mb-6">
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white mb-2">
                {isZh
                  ? "输入任意网站域名，3 秒透视 AI 五阶段漏斗与 7 关健康分"
                  : "Enter Any Domain: 3-Second GEO 5-Stage Funnel & 7-Level Diagnosis"}
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                {isZh
                  ? "服务端实时并发探测 26 项指标（Reach 访问准入 → Search 检索召回 → Cite 切片引用 → Describe 实体描述与 WebMCP → Measure 持续衡量），既可免费测自己，也可公开查询竞品健康度。"
                  : "Probes 26 live HTTP signals across the 5 GEO stages (Reach → Search → Cite → Describe → Measure). Free scans are listed in our public clinic directory."}
              </p>
            </div>

            {/* WebMCP 声明式搜索框 */}
            <form
              {...({
                toolname: "scan_ai_readiness",
                tooldescription:
                  "Run a live 26-check, 100-point AI Readiness and GEO visibility diagnosis on a domain name.",
                toolautosubmit: "true",
              } as React.FormHTMLAttributes<HTMLFormElement>)}
              onSubmit={(e) => {
                e.preventDefault();
                handleScan();
              }}
              className="flex flex-col sm:flex-row gap-3"
            >
              <div className="relative flex-1 flex items-center rounded-2xl bg-white/95 text-gray-900 shadow-inner focus-within:ring-2 focus-within:ring-blue-400">
                <span className="pl-4 pr-2 text-sm font-mono text-gray-400 select-none">
                  https://
                </span>
                <input
                  type="text"
                  name="domain"
                  value={domainInput}
                  onChange={(e) => setDomainInput(e.target.value)}
                  placeholder={
                    isZh
                      ? "jasonzhu.ai 或任意你想查询的网站域名"
                      : "jasonzhu.ai or any domain to inspect"
                  }
                  className="w-full bg-transparent py-3.5 pr-4 text-base font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none"
                  disabled={loading}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-7 py-3.5 text-base font-bold text-white shadow-lg shadow-blue-600/25 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-60 transition-all cursor-pointer whitespace-nowrap"
              >
                {loading
                  ? isZh
                    ? "⚡ 正在会诊闯关..."
                    : "⚡ Diagnosing..."
                  : isZh
                  ? "🏥 免费公开体检（开始闯关）"
                  : "🏥 Run Free Public Scan"}
              </button>
            </form>

            {/* 公开查询声明 + 付费隐藏入口 */}
            <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-slate-950/50 border border-white/10 px-3.5 py-2 text-xs">
              <span className="text-slate-300">
                {isZh
                  ? "🌐 免费版为「公开病历模式」：检测结果将自动记入下方公开病历库，所有人均可查阅。"
                  : "🌐 Free scans are recorded in the public directory below for everyone to search."}
              </span>
              <button
                type="button"
                onClick={() => setHideModalDomain(domainInput || "你的域名")}
                className="inline-flex items-center gap-1 font-bold text-amber-300 hover:text-amber-200 underline underline-offset-4 cursor-pointer"
              >
                {isZh
                  ? "🔒 不想让同行看见？开启私密体检 / 付费隐藏此域名 →"
                  : "🔒 Hide my domain / Private VIP Scan (Paid) →"}
              </button>
            </div>

            {/* 一键点选标杆与反面教材胶囊 */}
            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
              <span className="text-slate-400 font-medium">
                {isZh ? "👉 一键调阅典型公开病例：" : "👉 Try a public benchmark case:"}
              </span>
              {BENCHMARK_HALL_OF_FAME.map((b) => (
                <button
                  key={b.domain}
                  type="button"
                  onClick={() => handleScan(b.domain)}
                  disabled={loading}
                  className="group inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 text-slate-200 hover:border-blue-400 hover:bg-white/10 transition-all cursor-pointer"
                >
                  <span className="font-semibold group-hover:text-white">{b.domain}</span>
                  <span
                    className={`rounded-md px-1.5 py-0.5 text-[10px] font-extrabold ${
                      b.grade === "A"
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/30"
                        : b.grade === "B"
                        ? "bg-blue-500/20 text-blue-300 border border-blue-400/30"
                        : "bg-orange-500/20 text-orange-300 border border-orange-400/30"
                    }`}
                  >
                    {b.score} · {b.grade}
                  </span>
                </button>
              ))}
            </div>

            {/* 7 关实时扫描动画进度条 */}
            {loading && (
              <div className="mt-6 rounded-2xl border border-blue-400/30 bg-slate-950/70 p-4">
                <div className="flex items-center justify-between text-xs text-blue-200 mb-2">
                  <span className="font-mono flex items-center gap-2">
                    <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-blue-400 border-t-transparent" />
                    {scanSteps[scanStepIdx]}
                  </span>
                  <span className="font-bold">
                    {isZh ? `进度 ${scanStepIdx + 1} / 7` : `Step ${scanStepIdx + 1} / 7`}
                  </span>
                </div>
                <div className="grid grid-cols-7 gap-1.5">
                  {CATEGORIES.map((c, idx) => (
                    <div
                      key={c.key}
                      className={`h-1.5 rounded-full transition-colors ${
                        idx <= scanStepIdx ? "bg-blue-400" : "bg-slate-800"
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}

            {error && (
              <div className="mt-5 rounded-2xl border border-red-400/40 bg-red-950/60 p-4 text-sm text-red-200">
                ⚠️ {error}
              </div>
            )}
          </div>
        ) : (
          /* ═══════════════════════════════════════════════════════════════════
             模式 B：第 1 课 7 关互动模拟器
             ═══════════════════════════════════════════════════════════════════ */
          <div className="relative">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 mb-6 border-b border-white/10">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/20 border border-emerald-400/30 px-3 py-1 text-xs font-semibold text-emerald-300 mb-2">
                  {isZh
                    ? `已通关 ${sandboxClearedCount} / 7 关 · 互动教学沙盒`
                    : `Cleared ${sandboxClearedCount} / 7 Levels · Interactive Sandbox`}
                </div>
                <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-2">
                  {isZh
                    ? "🎮 动手开药方：把一个 25 分的「AI 隐形站」抢救到 100 分"
                    : "🎮 Rescue a 25-pt AI-Invisible Site to 100/100 Grade A"}
                </h2>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {isZh
                    ? "依次点击下方 7 张关卡药方，亲眼看看每打通一个环节（Reach → Search → Cite → Describe），你的网站总分如何从 25 分（Grade F）跃升到 100 分（Grade A）："
                    : "Toggle each of the 7 level prescriptions below to watch a 25-pt React SPA evolve into a 100-pt Agent-Ready site:"}
                </p>
              </div>

              <div className="flex items-center gap-5 rounded-2xl bg-white/95 text-gray-900 p-4 shadow-lg flex-none">
                <ScoreRing score={sandboxEarned} grade={sandboxGradeInfo.grade} />
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-gray-500">
                      {isZh ? "当前评级" : "Current Grade"}
                    </span>
                    <span
                      className={`rounded-lg border px-2.5 py-0.5 text-sm font-black ${
                        gradeTheme(sandboxGradeInfo.grade).badge
                      }`}
                    >
                      Grade {sandboxGradeInfo.grade}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 max-w-[200px] leading-snug mb-3">
                    {sandboxGradeInfo.label[lang]}
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setSandboxChecked({
                          robots_signal: true,
                          ssr_no_js: true,
                          sitemap_404: true,
                          jsonld_graph: true,
                          commercial_trust: true,
                          llms_markdown: true,
                          webmcp_card: true,
                        })
                      }
                      className="rounded-lg bg-emerald-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-emerald-700 cursor-pointer"
                    >
                      {isZh ? "✨ 一键满级 (100分)" : "✨ Max Out (100)"}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setSandboxChecked({
                          robots_signal: false,
                          ssr_no_js: false,
                          sitemap_404: false,
                          jsonld_graph: false,
                          commercial_trust: false,
                          llms_markdown: false,
                          webmcp_card: false,
                        })
                      }
                      className="rounded-lg border border-gray-300 bg-white px-2.5 py-1 text-[11px] font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
                    >
                      {isZh ? "重置 (25分)" : "Reset (25)"}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-3.5 md:grid-cols-2">
              {SANDBOX_UPGRADES.map((item) => {
                const active = Boolean(sandboxChecked[item.id]);
                return (
                  <div
                    key={item.id}
                    onClick={() =>
                      setSandboxChecked((prev) => ({ ...prev, [item.id]: !prev[item.id] }))
                    }
                    className={`rounded-2xl border p-4 transition-all cursor-pointer ${
                      active
                        ? "border-emerald-400 bg-emerald-950/50 shadow-md shadow-emerald-950/30"
                        : "border-white/15 bg-white/5 hover:border-blue-400/60 hover:bg-white/10"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold flex-none ${
                            active
                              ? "bg-emerald-500 text-white"
                              : "bg-white/15 text-slate-300"
                          }`}
                        >
                          {active ? "✓" : item.level}
                        </span>
                        <div>
                          <span className="font-bold text-sm text-white block">
                            {item.title[lang]}
                          </span>
                          <span className="text-[10px] font-semibold text-blue-300">
                            {item.stage}
                          </span>
                        </div>
                      </div>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-extrabold whitespace-nowrap ${
                          active
                            ? "bg-emerald-400 text-slate-950"
                            : "bg-white/10 text-slate-300"
                        }`}
                      >
                        +{item.pts} pts
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mb-2.5 pl-8">{item.symptom[lang]}</p>
                    <pre className="rounded-xl bg-slate-950/90 border border-white/10 text-emerald-300 p-2.5 text-[11px] overflow-x-auto font-mono leading-relaxed">
                      {item.fixCode}
                    </pre>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          2. 实时体检临床报告（含：GEO 五阶段漏斗条 + L1~L4 高阶病灶透视 + 7 关明细）
          ═══════════════════════════════════════════════════════════════════════ */}
      {report && (
        <section className="rounded-3xl border border-gray-200 bg-white p-6 md:p-8 shadow-sm space-y-8">
          {/* 顶部仪表盘头卡 */}
          <div
            className={`rounded-2xl border bg-gradient-to-br p-5 md:p-6 ${
              gradeTheme(report.grade).bg
            }`}
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <ScoreRing score={report.score} grade={report.grade} />
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span
                      className={`rounded-lg border px-2.5 py-0.5 text-xs font-black ${
                        gradeTheme(report.grade).badge
                      }`}
                    >
                      Grade {report.grade}
                    </span>
                    {scoreDelta !== null && scoreDelta !== 0 && (
                      <span
                        className={`rounded-lg px-2.5 py-0.5 text-xs font-bold ${
                          scoreDelta > 0
                            ? "bg-emerald-600 text-white"
                            : "bg-amber-600 text-white"
                        }`}
                      >
                        {scoreDelta > 0
                          ? isZh
                            ? `📈 复诊涨分 +${scoreDelta} 分（上次 ${previousScore} 分）`
                            : `📈 +${scoreDelta} pts since last scan (${previousScore})`
                          : isZh
                          ? `📉 较上次变动 ${scoreDelta} 分`
                          : `📉 ${scoreDelta} pts vs last scan`}
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => setHideModalDomain(report.domain)}
                      className="rounded-lg border border-amber-300 bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold text-amber-800 hover:bg-amber-100 cursor-pointer"
                    >
                      {isZh ? "🔒 隐藏此站公开记录" : "🔒 Hide Public Record"}
                    </button>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-extrabold text-gray-900">
                    {report.domain}
                  </h3>
                  <p className="text-sm font-medium text-gray-700 mt-1">
                    {report.label[lang]}
                  </p>
                </div>
              </div>

              {/* 右侧三格核心指标 */}
              <div className="grid grid-cols-3 gap-3 sm:min-w-[300px]">
                <div className="rounded-xl bg-white/90 border border-gray-200/80 p-3 text-center">
                  <p className="text-[11px] font-semibold text-gray-500">
                    {isZh ? "✅ 已满分项" : "✅ Passed"}
                  </p>
                  <p className="text-2xl font-black text-emerald-600 mt-0.5">
                    {passedCount}
                    <span className="text-xs font-normal text-gray-400">/26</span>
                  </p>
                </div>
                <div className="rounded-xl bg-white/90 border border-gray-200/80 p-3 text-center">
                  <p className="text-[11px] font-semibold text-gray-500">
                    {isZh ? "💊 待开方项" : "💊 To Fix"}
                  </p>
                  <p className="text-2xl font-black text-amber-600 mt-0.5">
                    {failedCount}
                    <span className="text-xs font-normal text-gray-400">/26</span>
                  </p>
                </div>
                <div className="rounded-xl bg-white/90 border border-gray-200/80 p-3 text-center">
                  <p className="text-[11px] font-semibold text-gray-500">
                    {isZh ? "🎯 距 Grade A" : "🎯 To Grade A"}
                  </p>
                  <p className="text-2xl font-black text-blue-600 mt-0.5">
                    {report.score >= 85
                      ? isZh
                        ? "已达标"
                        : "Cleared"
                      : `+${85 - report.score}`}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ─────────────────────────────────────────────────────────────────
              升级 1：GEO 五阶段漏斗雷达条（Reach → Search → Cite → Describe → Measure）
              ───────────────────────────────────────────────────────────────── */}
          {report.stages && (
            <div className="rounded-2xl border border-blue-200/80 bg-gradient-to-r from-blue-50/50 via-white to-indigo-50/40 p-5">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3.5">
                <div>
                  <span className="text-xs font-extrabold uppercase tracking-wider text-blue-600">
                    {isZh ? "GEO 五阶段漏斗诊断" : "GEO 5-Stage Funnel Diagnosis"}
                  </span>
                  <h4 className="text-base font-bold text-gray-900">
                    {isZh
                      ? "Reach（能访问）→ Search（能搜到）→ Cite（会引用）→ Describe（会说对）→ Measure（持续衡量）"
                      : "Reach → Search → Cite → Describe → Measure"}
                  </h4>
                </div>
                <span className="text-xs text-gray-500">
                  {isZh ? "哪一阶段掉链子，漏斗就在哪一层断流" : "Identify where your AI visibility funnel breaks"}
                </span>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                {report.stages.map((st) => {
                  const full = st.earned === st.max;
                  return (
                    <div
                      key={st.id}
                      className="rounded-xl border border-gray-200 bg-white p-3.5 shadow-2xs"
                    >
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-extrabold text-gray-900">{st.name[lang]}</span>
                        <span
                          className={`rounded px-1.5 py-0.5 text-[11px] font-bold ${
                            full
                              ? "bg-emerald-100 text-emerald-800"
                              : st.pct >= 60
                              ? "bg-blue-100 text-blue-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {st.earned}/{st.max} ({st.pct}%)
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mb-2">{st.question[lang]}</p>
                      <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            full ? "bg-emerald-500" : st.pct >= 60 ? "bg-blue-500" : "bg-amber-500"
                          }`}
                          style={{ width: `${st.pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}

                {/* Stage 5: Measure */}
                <div className="rounded-xl border border-indigo-200 bg-indigo-50/50 p-3.5 shadow-2xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-extrabold text-indigo-950">5. Measure</span>
                      <span className="rounded bg-indigo-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
                        {previousScore !== null
                          ? isZh
                            ? "已建闭环"
                            : "Tracked"
                          : isZh
                          ? "初诊建档"
                          : "Baseline"}
                      </span>
                    </div>
                    <p className="text-xs text-indigo-900/80 mb-1">
                      {isZh ? "能持续衡量吗？" : "Continuous measurement?"}
                    </p>
                  </div>
                  <p className="text-[11px] font-semibold text-indigo-700">
                    {previousScore !== null
                      ? isZh
                        ? `上次基准 ${previousScore} 分 → 本次 ${report.score} 分`
                        : `Last ${previousScore} → Now ${report.score}`
                      : isZh
                      ? "已存入实验库，复诊自动算涨分"
                      : "Baseline saved for next re-scan"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────────
              升级 2：搜广推 L1~L4 深度病灶透视 + 首段切片预览（内部核心参数保密锁定）
              ───────────────────────────────────────────────────────────────── */}
          {report.l1ToL4Signals && (
            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5 md:p-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="rounded-full bg-slate-900 px-2.5 py-0.5 text-[11px] font-bold text-white">
                      {isZh ? "IR + KG + RAG 搜广推四层透视" : "IR + KG + RAG Deep Diagnostics"}
                    </span>
                    <span className="text-xs font-semibold text-amber-700">
                      {isZh ? "🔒 内部核心参数与深层修复配方仅对会员开放" : "🔒 Core internal parameters locked for members"}
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-gray-900">
                    {isZh
                      ? "🔬 L1（抓取入库）→ L2（实体本体）→ L3（召回扇出）→ L4（切片重排与品牌归因）"
                      : "🔬 L1 (Crawl) → L2 (Entity) → L3 (Fan-out) → L4 (Chunking & Attribution)"}
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => setHideModalDomain(report.domain)}
                  className="rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-bold text-amber-300 hover:bg-slate-800 cursor-pointer"
                >
                  {isZh ? "🔒 解锁 L1~L4 内部调优配方 →" : "🔒 Unlock L1–L4 Internal Playbook →"}
                </button>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                {report.l1ToL4Signals.map((sig) => {
                  const ok = sig.status === "passed";
                  return (
                    <div
                      key={sig.layer}
                      className={`rounded-xl border bg-white p-4 ${
                        ok ? "border-gray-200" : "border-amber-300"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="text-sm font-bold text-gray-900">
                          {sig.title[lang]}
                        </span>
                        <span
                          className={`rounded-md px-2 py-0.5 text-[11px] font-bold whitespace-nowrap ${
                            ok
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {ok ? (isZh ? "✓ 达标" : "✓ Healthy") : isZh ? "⚠️ 发现隐患" : "⚠️ Warning"}
                        </span>
                      </div>
                      <p className="text-xs text-gray-700 leading-relaxed mb-2">
                        {sig.publicFinding[lang]}
                      </p>
                      <div
                        onClick={() => setHideModalDomain(report.domain)}
                        className="rounded-lg bg-slate-100 border border-slate-200 px-2.5 py-1.5 text-[11px] font-medium text-slate-600 hover:border-amber-400 hover:text-slate-900 cursor-pointer transition-colors"
                      >
                        {sig.lockedHint[lang]}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* L4 首段切片实时预览窗口 */}
              {report.leadChunkPreview && (
                <div className="rounded-xl border border-gray-200 bg-white p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-bold text-gray-900">
                      {isZh
                        ? "✂️ AI 检索器实际从你首页切走的首段文本切片预览（L4 Passage Chunk）："
                        : "✂️ Actual Lead Passage Chunk Extracted by AI Without JS:"}
                    </span>
                    <div className="flex flex-wrap gap-2 text-[11px] font-bold">
                      <span
                        className={`rounded-md px-2 py-0.5 ${
                          report.leadChunkPreview.brandNamedInLead
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {report.leadChunkPreview.brandNamedInLead
                          ? isZh
                            ? "✓ 首段已绑定品牌名（防白嫖语料）"
                            : "✓ Brand Named in Lead Chunk"
                          : isZh
                          ? "⚠️ 首段未含品牌名（PAGE CITED ≠ BRAND NAMED 风险）"
                          : "⚠️ Missing Brand Name in Lead Chunk"}
                      </span>
                      <span
                        className={`rounded-md px-2 py-0.5 ${
                          report.leadChunkPreview.hasStructuredTable
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {report.leadChunkPreview.hasStructuredTable
                          ? isZh
                            ? "✓ 含高重排结构化表格/FAQ"
                            : "✓ Structured Table/FAQ Present"
                          : isZh
                          ? "⚠️ 缺结构化对比表/FAQ"
                          : "⚠️ No Structured Comparison Table"}
                      </span>
                    </div>
                  </div>
                  <p className="rounded-lg bg-gray-50 border border-gray-200 p-3 text-xs font-mono text-gray-700 leading-relaxed mb-3">
                    &ldquo;{report.leadChunkPreview.excerpt}...&rdquo;
                  </p>
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-100">
                    <span className="text-[11px] font-semibold text-gray-600">
                      {isZh
                        ? "🧪 50M AI 回答实证 Prompt 工具箱（已自动填入当前扫描页面数据）："
                        : "🧪 50M Empirical AI Audit Prompts (Pre-filled with scanned page):"}
                    </span>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          copyText(
                            "prompt-page-audit",
                            `Audit the page below for how likely AI answer engines (ChatGPT, Perplexity, Google AI Overviews and AI Mode, Gemini) are to cite it as a source.\n\nThe checks come from Surfer AI Tracker data: about 50 million AI answers scraped daily from the real interfaces of five engines. They describe what cited pages have in common; treat them as strong signals, not guarantees.\n\nINPUTS\n- Target query: [fill in the exact question your users ask]\n- Page URL: ${report.finalUrl}\n- Extracted First Chunk: ${report.leadChunkPreview?.excerpt || ""}\n- Our brand: ${report.domain}\n- Google position for the query, if known: [e.g. Top 10, or "not ranking"]\n\nCHECKS (each with the data behind it)\n1. Intent: does the page type match what the query asks? A "which" query needs a comparison, a "how" query needs steps. [data: 42% vs 13% how often an on-intent page vs an off-intent blog post is cited]\n2. First 50 words: is there a direct, complete answer before any intro? [data: ≈1/3 of all citations come from a page's first 50 words]\n3. Passages: does each paragraph name its subject and make sense if quoted alone? [data: Passages AI quotes passages, not whole pages]\n4. Fact coverage: list what a complete answer needs and mark which facts are missing. [data: 39% -> 26% facts covered by top-3 vs rank-50 sources]\n5. Concrete detail: are there specific numbers, settings, examples or first-hand results, or only generic claims? [data: 0.12 correlation of a unique, concrete angle with citations]\n6. Google: does the page rank in the top 10 for the query or close variants? If not, flag it as the first fix. [data: 95% of cited domains rank in Google's top 10]\n7. Structured data: is JSON-LD present and current (Article, Person as author, dateModified)? [data: +3.7 pp citation rate with vs without JSON-LD; Product markup +0.1 pp]\n8. Wasted effort: flag llms.txt, "trust" links to Wikipedia, and stats, quotes, FAQs or a TOC added only for a checklist. Mark them low priority, not as fixes.\n\nOUTPUT\n1. A table: check | what you found (quote the page where useful) | pass / partly / fail | the fix.\n2. The missing facts from check 4 as a list.\n3. A rewritten first 50 words that answer the query directly and explicitly name our brand (${report.domain}).\n4. The 5 fixes that matter most, in order of impact.\n5. What to stop spending time on (from check 8), if anything.`
                          )
                        }
                        className="rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1.5 text-[11px] font-bold text-blue-700 hover:bg-blue-100 cursor-pointer"
                      >
                        {copiedKey === "prompt-page-audit"
                          ? isZh
                            ? "✓ 已复制单页引用审计 Prompt"
                            : "✓ Copied Page Audit Prompt"
                          : isZh
                          ? "📋 复制 Prompt 1：单页引用率审计 + 首段前 50 词重写"
                          : "📋 Copy Prompt 1: Page Citation & First-50-Words Audit"}
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          copyText(
                            "prompt-tracker-audit",
                            `Review my AI visibility tracking setup against measurement rules from Surfer AI Tracker data (about 50 million AI answers from five engines, scraped from the real interfaces).\n\nINPUTS\n- Brand / Domain: ${report.domain}\n- Tool or method: [how answers are collected — real interface scraper vs API]\n- Engines tracked: [e.g. ChatGPT, Perplexity, Google AI Overviews, AI Mode, Gemini]\n- Prompts: [count and examples]\n- Runs per prompt: [e.g. 1 or 5]\n- How often you run them: [e.g. daily, weekly]\n- How you read the data: [e.g. single snapshot vs 4-week rolling window]\n\nRULES TO CHECK AGAINST\n1. Run every prompt many times. Two runs of the same prompt share only 40.4% of brands and 25.8% of sources. A single run is random.\n2. Track every day, read over weeks. Daily brand mention share swings 10–15 pp on its own.\n3. Expect sources to churn faster than brands. Cited URLs survive 31.3% week to week vs 65.5% for brands.\n4. Track different intents, not rewordings. Five phrasings of one question still return ~37% the same brands.\n5. Collect answers from the real chat interface, not the API. An API call skips the search and RAG pipeline the user sees.\n6. Report each engine separately. AI Overviews averages 8.21 sources and 4.30 brands per answer; ChatGPT averages 2.38 and 2.37.\n7. Don't use domain authority as a stand-in. DR/AS correlates with citations at -0.05 to -0.06.\n8. Benchmark against your niche's sources. 72% of cited domains sit outside the top 1,000 websites.\n\nOUTPUT\n1. For each of the 8 rules: pass / partly / fail, why, and the cheapest fix.\n2. Which conclusions I've drawn so far that I shouldn't trust yet, and why.\n3. If I can only change one thing in my setup, what it should be.`
                          )
                        }
                        className="rounded-lg border border-indigo-200 bg-indigo-50 px-2.5 py-1.5 text-[11px] font-bold text-indigo-700 hover:bg-indigo-100 cursor-pointer"
                      >
                        {copiedKey === "prompt-tracker-audit"
                          ? isZh
                            ? "✓ 已复制监测方案审计 Prompt"
                            : "✓ Copied Tracking Audit Prompt"
                          : isZh
                          ? "📋 复制 Prompt 2：GEO 监测方案防自嗨 8 铁律审计"
                          : "📋 Copy Prompt 2: GEO Tracking Setup 8-Rule Audit"}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 7 关通关进度地图（可点击筛选任意一关） */}
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <p className="text-sm font-bold text-gray-900">
                {isZh
                  ? "🗺️ 7 大关卡闯关地图（点击任意关卡可单独查看该关处方）"
                  : "🗺️ 7-Level Progression Map (Click any level to filter)"}
              </p>
              <div className="flex items-center gap-2 text-xs">
                {activeLevel !== null && (
                  <button
                    type="button"
                    onClick={() => setActiveLevel(null)}
                    className="rounded-lg bg-gray-100 px-2.5 py-1 font-medium text-gray-700 hover:bg-gray-200 cursor-pointer"
                  >
                    {isZh ? "显示全部 7 关" : "Show All 7 Levels"}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setOnlyFailedFilter((v) => !v)}
                  className={`rounded-lg border px-2.5 py-1 font-medium cursor-pointer ${
                    onlyFailedFilter
                      ? "border-amber-400 bg-amber-50 text-amber-800"
                      : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {onlyFailedFilter
                    ? isZh
                      ? "✓ 仅看未满分项"
                      : "✓ Showing Failed Only"
                    : isZh
                    ? "仅看扣分项"
                    : "Filter Failed Only"}
                </button>
              </div>
            </div>

            <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-7">
              {report.categories.map((cat) => {
                const pct = Math.round((cat.earned / cat.max) * 100);
                const full = cat.earned === cat.max;
                const isSelected = activeLevel === cat.level;
                return (
                  <button
                    key={cat.key}
                    type="button"
                    onClick={() =>
                      setActiveLevel(isSelected ? null : cat.level)
                    }
                    className={`group rounded-2xl border p-3.5 text-left transition-all cursor-pointer ${
                      isSelected
                        ? "border-blue-600 bg-blue-50/70 ring-2 ring-blue-200 shadow-xs"
                        : full
                        ? "border-emerald-200 bg-emerald-50/30 hover:border-emerald-400"
                        : "border-amber-200 bg-amber-50/30 hover:border-amber-400"
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-bold text-gray-500">
                        {isZh ? `第 ${cat.level} 关` : `Lv.${cat.level}`}
                      </span>
                      <span
                        className={`rounded-md px-1.5 py-0.5 text-[11px] font-extrabold ${
                          full
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {cat.earned}/{cat.max}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-gray-900 line-clamp-1 mb-2.5">
                      {cat.name[lang].replace(/^第 \d 关：|^Level \d: /, "")}
                    </p>
                    <div className="h-2 w-full rounded-full bg-gray-200 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          full ? "bg-emerald-500" : pct >= 50 ? "bg-amber-500" : "bg-red-500"
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 主治医生总处方 + Cursor / Claude Code 一键唤醒台 */}
          {report.failedKeys.length > 0 ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-900 text-white p-5 md:p-6 shadow-md">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 mb-4 border-b border-white/10">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/20 border border-blue-400/30 px-2.5 py-0.5 text-xs font-semibold text-blue-300 mb-1.5">
                    {isZh ? "公开基础协议处方笺" : "Public Protocol Prescription"}
                  </div>
                  <h4 className="text-lg font-bold text-white">
                    {isZh
                      ? `💊 基础协议处方：修复这 ${report.failedKeys.length} 项公开指标即可冲刺 Grade A`
                      : `💊 Base Protocol Prescription: Fix ${report.failedKeys.length} checks for Grade A`}
                  </h4>
                  <p className="text-xs text-slate-300 mt-0.5">
                    {isZh
                      ? "复制下方基础协议 Prompt 扔给 Cursor 或 Claude Code 自动修改代码（L1~L4 内部核心配方仅在会员课提供）："
                      : "Send this prompt to Cursor or Claude Code to patch your public protocol checks:"}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 flex-none">
                  <button
                    type="button"
                    onClick={() => copyText("master-prompt", report.combinedPrompt[lang])}
                    className="rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-blue-500 transition-colors cursor-pointer"
                  >
                    {copiedKey === "master-prompt"
                      ? isZh
                        ? "✅ 已复制全套处方！"
                        : "✅ Copied Master Prompt!"
                      : isZh
                      ? "📋 一键复制全套 Prompt"
                      : "📋 Copy Full Prompt"}
                  </button>
                  <a
                    href={`https://cursor.com/link/prompt?text=${encodeURIComponent(
                      report.combinedPrompt[lang].slice(0, 1800)
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-xl bg-white/10 border border-white/20 px-3.5 py-2.5 text-xs font-bold text-white hover:bg-white/20 transition-colors"
                  >
                    {isZh ? "⚡ 在 Cursor 中打开" : "⚡ Open in Cursor"}
                  </a>
                  <button
                    type="button"
                    onClick={() =>
                      copyText(
                        "claude-cli",
                        `claude ${JSON.stringify(report.combinedPrompt[lang])}`
                      )
                    }
                    className="rounded-xl bg-white/10 border border-white/20 px-3.5 py-2.5 text-xs font-bold text-emerald-300 hover:bg-white/20 transition-colors cursor-pointer"
                  >
                    {copiedKey === "claude-cli"
                      ? isZh
                        ? "✅ 已复制 claude 命令"
                        : "✅ Copied CLI cmd"
                      : isZh
                      ? "🤖 复制 Claude Code 命令"
                      : "🤖 Copy Claude CLI"}
                  </button>
                </div>
              </div>

              <pre className="max-h-52 overflow-y-auto rounded-xl bg-slate-950/90 border border-white/10 p-4 text-xs text-slate-200 font-mono whitespace-pre-wrap leading-relaxed">
                {report.combinedPrompt[lang]}
              </pre>
            </div>
          ) : (
            <div className="rounded-2xl border border-emerald-300 bg-emerald-50 p-5 text-sm text-emerald-900 font-semibold flex items-center justify-between">
              <span>
                {isZh
                  ? "🎉 满分毕业！该站点 26 项指标全部通过，已达到全球前 1% 的 AI Agent-Ready 标杆水准！"
                  : "🎉 Perfect 100/100! All 26 checks passed — this site is in the top 1% of Agent-Ready websites."}
              </span>
            </div>
          )}

          {/* 并排双卡：左卡「🔔 Stage 5 Measure 掉分守护」 + 右卡「🏅 认证徽章外链飞轮」 */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50/70 via-white to-blue-50/40 p-5">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="rounded-full bg-indigo-600 px-2.5 py-0.5 text-[11px] font-bold text-white">
                  {isZh ? "Stage 5: Measure 持续衡量" : "Stage 5: Measure Guard"}
                </span>
                <span className="text-xs font-semibold text-indigo-700">
                  {report.domain}
                </span>
              </div>
              <h4 className="text-base font-bold text-gray-900 mb-1">
                {report.score >= 85
                  ? isZh
                    ? "🔔 开启 Grade A 掉分告警（防止发版误伤 SEO / MCP）"
                    : "🔔 Enable Grade A Drop Alert"
                  : isZh
                  ? "🔔 锁定初诊基准 & 开启每周实验复诊提醒"
                  : "🔔 Save Baseline & Get Re-Scan Reminders"}
              </h4>
              <p className="text-xs text-gray-600 leading-relaxed mb-3.5">
                {isZh
                  ? `绑定邮箱以建立 ${report.domain} 的 Stage 5 (Measure) 持续衡量基线（当前 ${report.score} 分），掉分或巡检异常时第一时间通知你：`
                  : `Bind your email to track ${report.domain}'s Stage 5 (Measure) baseline (${report.score}/100):`}
              </p>

              <form onSubmit={handleMonitorSubmit} className="flex gap-2">
                <input
                  type="email"
                  required
                  value={monitorEmail}
                  onChange={(e) => setMonitorEmail(e.target.value)}
                  placeholder={isZh ? "输入你的常用邮箱..." : "you@example.com"}
                  className="flex-1 rounded-xl border border-gray-300 bg-white px-3.5 py-2 text-xs text-gray-900 focus:border-indigo-500 focus:outline-none"
                  disabled={monitorSubmitting}
                />
                <button
                  type="submit"
                  disabled={monitorSubmitting}
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-700 disabled:opacity-60 cursor-pointer whitespace-nowrap"
                >
                  {monitorSubmitting
                    ? isZh
                      ? "绑定中..."
                      : "Saving..."
                    : isZh
                    ? "开启守护"
                    : "Enable Alert"}
                </button>
              </form>
              {monitorMsg && (
                <p className="mt-2 text-xs font-medium text-emerald-700">✅ {monitorMsg}</p>
              )}
              {monitorErr && (
                <p className="mt-2 text-xs font-medium text-red-600">⚠️ {monitorErr}</p>
              )}
            </div>

            <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50/70 via-white to-teal-50/40 p-5">
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="rounded-full bg-emerald-600 px-2.5 py-0.5 text-[11px] font-bold text-white">
                  {isZh ? "通关认证徽章" : "Verified Badge"}
                </span>
                <span className="inline-flex items-center overflow-hidden rounded-md border border-emerald-300 text-[11px] font-mono shadow-2xs">
                  <span className="bg-slate-800 px-2 py-0.5 text-white">AI Readiness</span>
                  <span className="bg-emerald-600 px-2 py-0.5 font-bold text-white">
                    {report.score}/100 · Grade {report.grade}
                  </span>
                </span>
              </div>
              <h4 className="text-base font-bold text-gray-900 mb-1">
                {isZh
                  ? "🏅 贴上「AI Agent-Ready 认证徽章」秀出你的技术底座"
                  : "🏅 Embed Your AI Readiness Badge (GitHub / Footer)"}
              </h4>
              <p className="text-xs text-gray-600 leading-relaxed mb-3.5">
                {isZh
                  ? "把认证徽章贴在你的 GitHub README 或独立站 Footer 页脚，访客点击即可在急诊室实时核验你的 AI 就绪度得分："
                  : "Add this live badge to your GitHub README or website footer so users and crawlers can verify your score:"}
              </p>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() =>
                    copyText(
                      "badge-md",
                      `[![AI Readiness: ${report.score}/100 (Grade ${report.grade})](https://img.shields.io/badge/AI_Readiness-${report.score}%2F100_Grade_${report.grade}-10b981?style=flat-square)](https://jasonzhu.ai/${lang}/go-global/ai-readiness)`
                    )
                  }
                  className="rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-700 cursor-pointer"
                >
                  {copiedKey === "badge-md"
                    ? isZh
                      ? "✅ 已复制 Markdown"
                      : "✅ Copied Markdown"
                    : isZh
                    ? "📋 复制 GitHub Markdown 徽章"
                    : "📋 Copy Markdown Badge"}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    copyText(
                      "badge-html",
                      `<a href="https://jasonzhu.ai/${lang}/go-global/ai-readiness" target="_blank" rel="noopener noreferrer" title="Verified by JasonZhu.AI Website Clinic">AI Readiness: ${report.score}/100 (Grade ${report.grade})</a>`
                    )
                  }
                  className="rounded-xl border border-emerald-400 bg-white px-3.5 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-50 cursor-pointer"
                >
                  {copiedKey === "badge-html"
                    ? isZh
                      ? "✅ 已复制 HTML 代码"
                      : "✅ Copied HTML"
                    : isZh
                    ? "🌐 复制网站 Footer HTML"
                    : "🌐 Copy Footer HTML"}
                </button>
              </div>
            </div>
          </div>

          {/* 7 大关卡 26 项逐条体检明细 */}
          <div className="space-y-6">
            {report.categories
              .filter((c) => activeLevel === null || c.level === activeLevel)
              .map((cat) => {
                const visibleChecks = onlyFailedFilter
                  ? cat.checks.filter((chk) => chk.status !== "passed")
                  : cat.checks;
                if (visibleChecks.length === 0) return null;

                return (
                  <div
                    key={cat.key}
                    className="rounded-2xl border border-gray-200 bg-gray-50/70 p-5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-3.5 mb-4 border-b border-gray-200">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-2.5 py-0.5 text-xs font-bold text-white">
                            {isZh ? `第 ${cat.level} 关` : `Level ${cat.level}`}
                          </span>
                          <h4 className="text-base font-bold text-gray-900">
                            {cat.name[lang].replace(/^第 \d 关：|^Level \d: /, "")}
                          </h4>
                          <span className="rounded-full bg-white border border-gray-200 px-2.5 py-0.5 text-[11px] font-medium text-blue-700">
                            {cat.courseTieIn[lang]}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 mt-1.5">{cat.symptom[lang]}</p>
                      </div>
                      <span
                        className={`inline-flex items-center rounded-xl px-3.5 py-1.5 text-sm font-black ${
                          cat.earned === cat.max
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {cat.earned} / {cat.max} {isZh ? "分" : "pts"}
                      </span>
                    </div>

                    <div className="grid gap-3">
                      {visibleChecks.map((chk) => {
                        const passed = chk.status === "passed";
                        const partial = chk.status === "partial";
                        return (
                          <div
                            key={chk.key}
                            className={`rounded-xl border p-4 bg-white transition-shadow hover:shadow-2xs ${
                              passed
                                ? "border-gray-200"
                                : partial
                                ? "border-amber-300"
                                : "border-red-300"
                            }`}
                          >
                            <div className="flex flex-wrap items-start justify-between gap-3">
                              <div className="flex items-start gap-3 max-w-2xl">
                                <span
                                  className={`mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold flex-none ${
                                    passed
                                      ? "bg-emerald-100 text-emerald-700"
                                      : partial
                                      ? "bg-amber-100 text-amber-800"
                                      : "bg-red-100 text-red-700"
                                  }`}
                                >
                                  {passed ? "✓" : partial ? "!" : "✕"}
                                </span>
                                <div>
                                  <p className="text-sm font-bold text-gray-900">
                                    {chk.title[lang]}
                                  </p>
                                  <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">
                                    {chk.whyItMatters[lang]}
                                  </p>
                                  <p className="text-xs font-mono text-gray-700 mt-1.5 bg-gray-100 inline-block px-2.5 py-0.5 rounded-md border border-gray-200">
                                    {isZh ? "实测证据：" : "Evidence: "}
                                    {chk.detail}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <span
                                  className={`rounded-lg px-2.5 py-1 text-xs font-extrabold ${
                                    passed
                                      ? "bg-emerald-50 text-emerald-700"
                                      : partial
                                      ? "bg-amber-50 text-amber-700"
                                      : "bg-red-50 text-red-700"
                                  }`}
                                >
                                  {chk.score} / {chk.maxScore} {isZh ? "分" : "pts"}
                                </span>
                                {chk.prompt && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      copyText(chk.key, chk.prompt?.[lang] || "")
                                    }
                                    className="rounded-lg border border-blue-300 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-100 cursor-pointer"
                                  >
                                    {copiedKey === chk.key
                                      ? isZh
                                        ? "✅ 已复制"
                                        : "✅ Copied"
                                      : isZh
                                      ? "💊 复制药方"
                                      : "💊 Copy Fix"}
                                  </button>
                                )}
                              </div>
                            </div>

                            {chk.prompt && (
                              <pre className="mt-3 rounded-xl bg-slate-900 p-3 text-[11px] text-slate-100 font-mono whitespace-pre-wrap overflow-x-auto leading-relaxed">
                                {chk.prompt[lang]}
                              </pre>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          3. 全网公开病历档案库（所有人可检索查询任意站点情况 + 站长付费可隐藏记录）
          ═══════════════════════════════════════════════════════════════════════ */}
      <section className="rounded-3xl border border-gray-200 bg-white p-6 md:p-8 shadow-xs space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-5 border-b border-gray-200">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="inline-block rounded-full bg-purple-100 text-purple-800 px-3 py-0.5 text-xs font-bold">
                {isZh ? "🌐 全网公开病历档案库（Supabase 实时同步）" : "🌐 Public Website AI Health Directory"}
              </span>
              <button
                type="button"
                onClick={() => setHideModalDomain(domainInput || "你的域名")}
                className="inline-flex items-center rounded-full border border-amber-300 bg-amber-50 px-3 py-0.5 text-xs font-bold text-amber-800 hover:bg-amber-100 cursor-pointer"
              >
                {isZh ? "🔒 申请隐藏我的网站记录（付费）" : "🔒 Hide My Domain (Paid)"}
              </button>
            </div>
            <h2 className="text-xl md:text-2xl font-extrabold text-gray-900">
              {isZh
                ? "📊 公开查询任意网站的 AI 就绪度得分 & 常见失分病因"
                : "📊 Publicly Search Any Website's AI Readiness & Failure Points"}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {isZh
                ? "所有通过免费急诊室检测的网站均在此公开建档，任何人都可以搜索查看各站点的得分与短板；如需隐藏自家域名或获取内部 L1~L4 调优参数，可升级会员开启隐身。"
                : "All free scans are publicly searchable below. Site owners can upgrade to delist/hide their domain from competitors."}
            </p>
          </div>

          <div className="flex gap-3 flex-none">
            <div className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-center">
              <p className="text-[11px] text-gray-500">{isZh ? "公开档案数" : "Public Scans"}</p>
              <p className="text-xl font-black text-gray-900">{totalScans}</p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-center">
              <p className="text-[11px] text-gray-500">{isZh ? "平均得分" : "Avg Score"}</p>
              <p className="text-xl font-black text-blue-600">{insights.avgScore}/100</p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-center">
              <p className="text-[11px] text-gray-500">{isZh ? "Grade A 率" : "Grade A Rate"}</p>
              <p className="text-xl font-black text-emerald-600">{insights.gradeARate}%</p>
            </div>
          </div>
        </div>

        {/* 公开病历库实时搜索栏 */}
        <div className="rounded-2xl border border-gray-200 bg-gray-50/70 p-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="text-sm font-bold text-gray-900">
                {isZh
                  ? "🔍 检索公开病历档案库（点击任意站点可调阅完整 26 项体检报告）"
                  : "🔍 Search Public Clinic Records (Click any domain to inspect full report)"}
              </h3>
              <p className="text-xs text-gray-500">
                {isZh
                  ? "支持按域名关键词过滤已接诊站点；若库中尚未收录，可直接点「挂号检测」现场抓出它的底牌。"
                  : "Filter existing public records or run a live scan on any domain."}
              </p>
            </div>
            <div className="flex gap-2 sm:w-80">
              <input
                type="text"
                value={publicSearchQuery}
                onChange={(e) => {
                  const val = e.target.value;
                  setPublicSearchQuery(val);
                  refreshDashboard(val);
                }}
                placeholder={isZh ? "搜索已收录域名（如 glama、skills...）" : "Filter public domains..."}
                className="flex-1 rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs text-gray-900 focus:border-blue-500 focus:outline-none"
              />
              {publicSearchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setPublicSearchQuery("");
                    refreshDashboard("");
                  }}
                  className="rounded-xl border border-gray-200 bg-white px-2.5 py-2 text-xs text-gray-500 hover:text-gray-800 cursor-pointer"
                >
                  {isZh ? "清空" : "Clear"}
                </button>
              )}
            </div>
          </div>

          {recentScans.length > 0 ? (
            <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
              {recentScans.map((r, i) => (
                <div
                  key={`${r.domain}-${i}`}
                  className="flex items-center justify-between gap-2 rounded-xl border border-gray-200 bg-white p-3 hover:border-blue-300 transition-all"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleScan(r.domain)}
                        className="font-bold text-sm text-gray-900 hover:text-blue-600 truncate cursor-pointer"
                      >
                        {r.domain}
                      </button>
                      {typeof r.score_delta === "number" && r.score_delta > 0 && (
                        <span className="rounded bg-emerald-50 px-1.5 py-0.2 text-[10px] font-bold text-emerald-700">
                          +{r.score_delta}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      {typeof r.failed_count === "number"
                        ? isZh
                          ? `检出 ${r.failed_count} 项失分病灶`
                          : `${r.failed_count} failed checks`
                        : isZh
                        ? "公开档案"
                        : "Public record"}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 flex-none">
                    <span
                      className={`rounded-lg px-2 py-0.5 text-xs font-extrabold border ${
                        gradeTheme(r.grade).badge
                      }`}
                    >
                      {r.score} · {r.grade}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleScan(r.domain)}
                      className="rounded-lg border border-blue-200 bg-blue-50 px-2 py-1 text-[11px] font-semibold text-blue-700 hover:bg-blue-100 cursor-pointer"
                      title={isZh ? "查看完整体检报告" : "Inspect full report"}
                    >
                      {isZh ? "查病历" : "Inspect"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setHideModalDomain(r.domain)}
                      className="rounded-lg border border-gray-200 bg-gray-50 px-2 py-1 text-[11px] font-medium text-gray-500 hover:border-amber-300 hover:bg-amber-50 hover:text-amber-800 cursor-pointer"
                      title={isZh ? "付费隐藏此站记录" : "Pay to hide this domain"}
                    >
                      🔒
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-gray-300 bg-white p-6 text-center text-xs text-gray-500">
              {isZh
                ? `公开库中暂未搜到「${publicSearchQuery}」，点击下方按钮即可现场对它发起实时体检：`
                : `No public record for "${publicSearchQuery}" yet. Run a live scan now:`}
              {publicSearchQuery && (
                <div className="mt-3">
                  <button
                    type="button"
                    onClick={() => handleScan(publicSearchQuery)}
                    className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 cursor-pointer"
                  >
                    {isZh ? `🏥 立即免费检测 ${publicSearchQuery}` : `🏥 Scan ${publicSearchQuery} Now`}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Top 6 高频失分病因横向条形图 */}
        {insights.topFailedChecks.length > 0 && (
          <div>
            <h3 className="text-sm font-bold text-gray-900 mb-3">
              {isZh
                ? "🚨 独立站最容易丢分的 Top 6 高频病因（来自真实公开接诊统计）"
                : "🚨 Top 6 Most Frequently Failed Checks Across Scanned Sites"}
            </h3>
            <div className="grid gap-3 md:grid-cols-2">
              {insights.topFailedChecks.map((item, idx) => (
                <div
                  key={item.key}
                  className="rounded-2xl border border-gray-200 bg-gray-50/70 p-3.5"
                >
                  <div className="flex items-center justify-between gap-2 text-xs mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-red-100 text-red-700 font-bold">
                        {idx + 1}
                      </span>
                      <span className="font-bold text-gray-900">{item.title[lang]}</span>
                    </div>
                    <span className="font-mono text-xs font-bold text-red-600 whitespace-nowrap">
                      {isZh
                        ? `${item.failRatePct}% 站点未通过 (-${item.maxScore}分)`
                        : `${item.failRatePct}% fail (-${item.maxScore} pts)`}
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-200 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-500 to-red-500"
                      style={{ width: `${Math.max(15, item.failRatePct)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 名人堂 vs 反面教材对比表 */}
        <div>
          <h3 className="text-sm font-bold text-gray-900 mb-3">
            {isZh
              ? "🏆 Grade A 满分名人堂 vs 知名站点反面教材（点击任意站点可现场重测）"
              : "🏆 Grade A Hall of Fame vs Popular Sites Missing Agent Protocols"}
          </h3>
          <div className="overflow-x-auto rounded-2xl border border-gray-200">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-xs font-semibold text-gray-500">
                  <th className="py-3 pl-4 pr-3">{isZh ? "站点域名" : "Domain"}</th>
                  <th className="py-3 px-2">{isZh ? "总分 / 等级" : "Score / Grade"}</th>
                  <th className="py-3 px-2">{isZh ? "1.门卫(20)" : "1.Crawl(20)"}</th>
                  <th className="py-3 px-2">{isZh ? "2.可读(18)" : "2.Read(18)"}</th>
                  <th className="py-3 px-2">{isZh ? "3.指路(16)" : "3.Find(16)"}</th>
                  <th className="py-3 px-2">{isZh ? "4.身份(14)" : "4.Schema(14)"}</th>
                  <th className="py-3 px-2">{isZh ? "5.信任(12)" : "5.Trust(12)"}</th>
                  <th className="py-3 px-2">{isZh ? "6.llms(10)" : "6.llms(10)"}</th>
                  <th className="py-3 px-2">{isZh ? "7.MCP(10)" : "7.MCP(10)"}</th>
                  <th className="py-3 pl-2 pr-4">{isZh ? "实测" : "Action"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {BENCHMARK_HALL_OF_FAME.map((b: BenchmarkEntry) => (
                  <tr key={b.domain} className="hover:bg-blue-50/30 transition-colors">
                    <td className="py-3.5 pl-4 pr-3">
                      <p className="font-bold text-gray-900">{b.domain}</p>
                      <p className="text-xs text-gray-500">{b.tag[lang]}</p>
                    </td>
                    <td className="py-3.5 px-2 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center rounded-lg border px-2.5 py-0.5 text-xs font-extrabold ${
                          gradeTheme(b.grade).badge
                        }`}
                      >
                        {b.score}/100 · {b.grade}
                      </span>
                    </td>
                    <td className="py-3.5 px-2 font-mono text-xs">{b.categoryBreakdown.crawl_permission}/20</td>
                    <td className="py-3.5 px-2 font-mono text-xs">{b.categoryBreakdown.readability}/18</td>
                    <td className="py-3.5 px-2 font-mono text-xs">{b.categoryBreakdown.findability}/16</td>
                    <td className="py-3.5 px-2 font-mono text-xs">{b.categoryBreakdown.structured_meaning}/14</td>
                    <td className="py-3.5 px-2 font-mono text-xs">{b.categoryBreakdown.commercial_legibility}/12</td>
                    <td className="py-3.5 px-2 font-mono text-xs">{b.categoryBreakdown.agent_native}/10</td>
                    <td className="py-3.5 px-2 font-mono text-xs">{b.categoryBreakdown.agent_interaction}/10</td>
                    <td className="py-3.5 pl-2 pr-4">
                      <button
                        type="button"
                        onClick={() => handleScan(b.domain)}
                        disabled={loading}
                        className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-100 cursor-pointer whitespace-nowrap"
                      >
                        {isZh ? "挂号重测" : "Live Scan"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          4. 第 1 课 7 关通关教学大纲卡片墙
          ═══════════════════════════════════════════════════════════════════════ */}
      <section className="rounded-3xl border border-gray-200 bg-gray-100/70 p-6 md:p-8">
        <div className="max-w-3xl mb-6">
          <span className="inline-block rounded-full bg-blue-100 text-blue-800 px-3 py-0.5 text-xs font-bold mb-2">
            {isZh ? "7 关 100 分制标准拆解" : "7-Level 100-Point Rubric"}
          </span>
          <h2 className="text-xl md:text-2xl font-extrabold text-gray-900 mb-1.5">
            {isZh
              ? "🗺️ 为什么这 7 关决定了 AI 能不能看见你的网站？"
              : "🗺️ Why These 7 Levels Determine Whether AI Can See Your Site"}
          </h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            {isZh
              ? "越靠前的关卡分值越重（第 1 关门卫 20 分 + 第 2 关无 JS 可读 18 分 + 第 3 关地图指路 16 分 = 基础生命线 54 分），越靠后的关卡决定了你能否从 75 分普通站晋级为 95+ 分的 AI Agent 原生标杆站。7 类 26 项和分值对齐 Hostinger 的免费 AI Visibility Checker，检测代码和文字是我们自己写的，和 Hostinger 无关；命令行版开源在 GitHub（zhuyansen/ai-visibility-checker）："
              : "Early levels carry the highest weight (Crawl 20 + Readability 18 + Findability 16 = 54 baseline pts), while Levels 6 & 7 elevate you from a 75-pt site to a 95+ Agent-Ready benchmark. The 7 categories, 26 checks and their points follow Hostinger's free AI Visibility Checker; the code and wording are our own, and we are not affiliated with Hostinger. The CLI version is open source on GitHub (zhuyansen/ai-visibility-checker):"}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((cat) => (
            <div
              key={cat.key}
              className="flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-5 shadow-2xs hover:border-blue-300 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <span className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-2.5 py-1 text-xs font-extrabold text-white">
                    {isZh ? `第 ${cat.level} 关` : `Level ${cat.level}`}
                  </span>
                  <span className="rounded-full bg-blue-50 border border-blue-200 text-blue-700 px-2.5 py-0.5 text-xs font-bold">
                    {cat.badge[lang]}
                  </span>
                </div>
                <h3 className="font-bold text-gray-900 text-base mb-1.5">
                  {cat.name[lang].replace(/^第 \d 关：|^Level \d: /, "")}
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed mb-3">
                  {cat.symptom[lang]}
                </p>
              </div>
              <div className="pt-3 border-t border-gray-100 text-[11px] font-semibold text-blue-600">
                📖 {cat.courseTieIn[lang]}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
