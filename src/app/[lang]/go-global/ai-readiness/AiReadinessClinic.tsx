"use client";

import React, { useEffect, useState } from "react";
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
  created_at: string;
}

interface SandboxUpgradeItem {
  id: string;
  level: number;
  pts: number;
  title: { zh: string; en: string };
  symptom: { zh: string; en: string };
  fixCode: string;
}

const SANDBOX_UPGRADES: SandboxUpgradeItem[] = [
  {
    id: "robots_signal",
    level: 1,
    pts: 10,
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

function gradeBadgeClass(grade: string): string {
  switch (grade) {
    case "A":
      return "bg-emerald-100 text-emerald-800 border-emerald-300";
    case "B":
      return "bg-blue-100 text-blue-800 border-blue-300";
    case "C":
      return "bg-amber-100 text-amber-800 border-amber-300";
    case "D":
      return "bg-orange-100 text-orange-800 border-orange-300";
    default:
      return "bg-red-100 text-red-800 border-red-300";
  }
}

export default function AiReadinessClinic({ lang }: { lang: "zh" | "en" }) {
  const isZh = lang === "zh";
  const [mode, setMode] = useState<"clinic" | "sandbox">("clinic");
  const [domainInput, setDomainInput] = useState("jasonzhu.ai");
  const [loading, setLoading] = useState(false);
  const [scanStepText, setScanStepText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<ScanReport | null>(null);
  const [activeLevel, setActiveLevel] = useState<number | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [recentScans, setRecentScans] = useState<RecentScanRow[]>([]);
  const [totalScans, setTotalScans] = useState<number>(BENCHMARK_HALL_OF_FAME.length);

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

  useEffect(() => {
    fetch("/api/ai-readiness")
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d?.recentScans)) setRecentScans(d.recentScans);
        if (typeof d?.totalScans === "number") setTotalScans(d.totalScans);
      })
      .catch(() => {});
  }, []);

  async function handleScan(targetDomain?: string) {
    const target = (targetDomain ?? domainInput).trim();
    if (!target) return;
    setDomainInput(target);
    setMode("clinic");
    setLoading(true);
    setError(null);

    const steps = isZh
      ? [
          "第 1 关：正在检查 /robots.txt、AI 爬虫权限与 Content-Signal...",
          "第 2 关：正在关闭 JS 抽取原始 HTML 正文与计算 Token 预算...",
          "第 3 关：正在探测 /sitemap.xml、lastmod 与随机 404 状态码...",
          "第 4 关：正在解析 JSON-LD @graph、Organization 与 sameAs 实体...",
          "第 5 关：正在核验合规三件套、机器可读邮箱与免登录价格...",
          "第 6 关：正在请求 /llms.txt、Accept: text/markdown 与 HTTP Link 头...",
          "第 7 关：正在扫描 WebMCP 工具与 /.well-known/mcp/server-card.json...",
        ]
      : [
          "Level 1: Checking /robots.txt, AI bot rules & Content-Signal...",
          "Level 2: Extracting zero-JS HTML text & token budget...",
          "Level 3: Probing /sitemap.xml, lastmod & real 404 status...",
          "Level 4: Parsing JSON-LD @graph, Organization & sameAs...",
          "Level 5: Verifying trust links, contactPoint & public pricing...",
          "Level 6: Fetching /llms.txt, Accept: text/markdown & Link headers...",
          "Level 7: Scanning WebMCP tools & /.well-known/mcp/server-card.json...",
        ];

    let stepIdx = 0;
    setScanStepText(steps[0]);
    const timer = setInterval(() => {
      stepIdx = (stepIdx + 1) % steps.length;
      setScanStepText(steps[stepIdx]);
    }, 550);

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
        setTotalScans((n) => n + 1);
        setRecentScans((prev) => [
          {
            domain: data.report.domain,
            score: data.report.score,
            grade: data.report.grade,
            created_at: data.report.scannedAt,
          },
          ...prev.filter((r) => r.domain !== data.report.domain).slice(0, 11),
        ]);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : isZh ? "网络请求异常" : "Network error");
    } finally {
      clearInterval(timer);
      setLoading(false);
      setScanStepText("");
    }
  }

  function copyText(key: string, text: string) {
    navigator.clipboard?.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2200);
  }

  return (
    <div className="space-y-8">
      {/* 顶部模式切换：实时网站急诊室 vs 第 1 课互动闯关沙盒 */}
      <div className="rounded-3xl border border-blue-200 bg-gradient-to-br from-blue-50/80 via-white to-emerald-50/50 p-5 md:p-7 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white">
              {isZh ? "第 1 课互动实训 · 100 分制" : "Course 1 Interactive Lab · 100 Pts"}
            </span>
            <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-800">
              {isZh ? `已累计接诊 ${totalScans}+ 次站点体检` : `${totalScans}+ sites diagnosed`}
            </span>
          </div>
          <div className="inline-flex rounded-xl border border-gray-200 bg-white p-1 text-xs font-medium">
            <button
              type="button"
              onClick={() => setMode("clinic")}
              className={`rounded-lg px-3 py-1.5 transition-colors ${
                mode === "clinic" ? "bg-blue-600 text-white" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {isZh ? "🏥 实时网站急诊室（测你的真实域名）" : "🏥 Live Site Clinic (Scan Your Domain)"}
            </button>
            <button
              type="button"
              onClick={() => setMode("sandbox")}
              className={`rounded-lg px-3 py-1.5 transition-colors ${
                mode === "sandbox" ? "bg-blue-600 text-white" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {isZh ? "🎮 7 关闯关模拟器（动手开药方从 25 分升到 100 分）" : "🎮 7-Level Game Simulator (25 → 100 pts)"}
            </button>
          </div>
        </div>

        {mode === "clinic" ? (
          <>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
              {isZh
                ? "输入你的网站域名，3 秒跑完 7 大关卡 / 26 项 AI 就绪度体检"
                : "Enter your domain to run the 7-Level / 26-Check AI Readiness Diagnosis"}
            </h2>
            <p className="text-sm text-gray-600 mb-4 leading-relaxed">
              {isZh
                ? "不仅告诉你得多少分（A~F 等级），还会针对每一项扣分直接开出「Cursor / Claude Code 一键修复药方 Prompt」。所有体检结果都会记入出海站点AI健康档案库。"
                : "Get your 0–100 score, letter grade (A–F), and copy-paste Cursor / Claude Code prompts for every failed check."}
            </p>

            {/* WebMCP 声明式搜索表单 */}
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
              <input
                type="text"
                name="domain"
                value={domainInput}
                onChange={(e) => setDomainInput(e.target.value)}
                placeholder={isZh ? "输入域名，例如 jasonzhu.ai 或你的独立站域名" : "Enter domain, e.g. jasonzhu.ai"}
                className="flex-1 rounded-2xl border border-gray-300 bg-white px-4 py-3 text-base text-gray-900 focus:border-blue-500 focus:outline-none"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading}
                className="rounded-2xl bg-blue-600 px-6 py-3 text-base font-semibold text-white hover:bg-blue-700 disabled:opacity-60 transition-colors cursor-pointer whitespace-nowrap"
              >
                {loading
                  ? isZh
                    ? "正在急诊会诊中..."
                    : "Diagnosing..."
                  : isZh
                  ? "🏥 免费挂号体检（开始闯关）"
                  : "🏥 Run Free Diagnosis"}
              </button>
            </form>

            {/* 一键点选标杆站点对比体验 */}
            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
              <span className="text-gray-500 font-medium">
                {isZh ? "一键体验真实站点病例：" : "Try a live benchmark case:"}
              </span>
              {BENCHMARK_HALL_OF_FAME.map((b) => (
                <button
                  key={b.domain}
                  type="button"
                  onClick={() => handleScan(b.domain)}
                  disabled={loading}
                  className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1 text-gray-700 hover:border-blue-400 hover:text-blue-600 transition-colors cursor-pointer"
                >
                  <span className="font-medium">{b.domain}</span>
                  <span
                    className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold border ${gradeBadgeClass(
                      b.grade
                    )}`}
                  >
                    {b.score} · {b.grade}
                  </span>
                </button>
              ))}
            </div>

            {loading && (
              <div className="mt-5 rounded-2xl border border-blue-200 bg-blue-50/70 p-4 text-sm text-blue-900 flex items-center gap-3">
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                <span className="font-mono">{scanStepText}</span>
              </div>
            )}

            {error && (
              <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {error}
              </div>
            )}
          </>
        ) : (
          /* ═══════════════════════════════════════════════════════════════════
             模式 B：第 1 课 7 关互动模拟器（从 25 分重症网站一路开药升到 100 分 Grade A）
             ═══════════════════════════════════════════════════════════════════ */
          <div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 mb-5 border-b border-gray-200">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">
                  {isZh
                    ? "🎮 第 1 课闯关模拟器：拯救一个「对 AI 隐形」的 25 分独立站"
                    : "🎮 Course 1 Simulator: Rescue a 25-pt AI-Invisible Indie Site"}
                </h2>
                <p className="text-sm text-gray-600">
                  {isZh
                    ? "假设你刚用 React/Vite 写了一个出海工具站，没配 SSR、没写 JSON-LD、也没加 llms.txt 和 WebMCP。请依次勾选下方 7 张处方，亲眼看它如何从 25 分（Grade F）进化到 100 分（Grade A）！"
                    : "Toggle each of the 7 level prescriptions below to see how a typical 25-pt SPA evolves into a 100-pt Agent-Ready site."}
                </p>
              </div>
              <div className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white px-5 py-3 shadow-xs flex-none">
                <div>
                  <p className="text-xs text-gray-500">{isZh ? "当前模拟总分" : "Simulated Score"}</p>
                  <p className="text-3xl font-extrabold text-gray-900">
                    {sandboxEarned}
                    <span className="text-sm font-normal text-gray-400"> / 100</span>
                  </p>
                </div>
                <div
                  className={`rounded-2xl border px-3.5 py-2 text-center ${gradeBadgeClass(
                    sandboxGradeInfo.grade
                  )}`}
                >
                  <p className="text-xs font-semibold">Grade</p>
                  <p className="text-2xl font-black">{sandboxGradeInfo.grade}</p>
                </div>
              </div>
            </div>

            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs font-medium text-gray-600">
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
                  className="rounded-lg bg-emerald-600 px-3 py-1 text-xs font-semibold text-white hover:bg-emerald-700 cursor-pointer"
                >
                  {isZh ? "✨ 一键全开 7 关药方（直接满级 100 分）" : "✨ Apply All 7 Fixes (100/100)"}
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
                  className="rounded-lg border border-gray-300 bg-white px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
                >
                  {isZh ? "重置回 25 分病患状态" : "Reset to 25 pts"}
                </button>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
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
                        ? "border-emerald-400 bg-emerald-50/60 shadow-xs"
                        : "border-gray-200 bg-white hover:border-blue-300"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <label className="flex items-center gap-2 font-semibold text-sm text-gray-900 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={active}
                          onChange={() => {}}
                          className="h-4 w-4 rounded border-gray-300 text-emerald-600"
                        />
                        <span>{item.title[lang]}</span>
                      </label>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-bold whitespace-nowrap ${
                          active ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        +{item.pts} pts
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">{item.symptom[lang]}</p>
                    <pre className="rounded-xl bg-gray-900 text-gray-100 p-2.5 text-[11px] overflow-x-auto font-mono leading-relaxed">
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
          实时体检报告展示区（当用户点击体检后展示）
          ═══════════════════════════════════════════════════════════════════════ */}
      {report && (
        <section className="rounded-3xl border border-gray-200 bg-white p-5 md:p-7 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 mb-6 border-b border-gray-200">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                  {isZh ? "AI 网站急诊诊断报告" : "AI Readiness Clinical Report"}
                </span>
                <span className="text-xs text-gray-400">· {report.finalUrl}</span>
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900">
                {report.domain}
              </h3>
              <p className="text-sm text-gray-600 mt-1">{report.label[lang]}</p>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-xs text-gray-500">{isZh ? "综合健康分" : "Total Score"}</p>
                <p className="text-4xl font-black text-gray-900">
                  {report.score}
                  <span className="text-base font-normal text-gray-400">/100</span>
                </p>
              </div>
              <div
                className={`rounded-2xl border px-4 py-2.5 text-center ${gradeBadgeClass(
                  report.grade
                )}`}
              >
                <p className="text-xs font-semibold uppercase">Grade</p>
                <p className="text-3xl font-black">{report.grade}</p>
              </div>
            </div>
          </div>

          {/* 7 关通关进度条总览 */}
          <div className="mb-6">
            <p className="text-sm font-semibold text-gray-900 mb-3">
              {isZh
                ? "🎮 7 大关卡得分详情（点击任意关卡可定位到对应病因与处方）"
                : "🎮 7-Level Breakdown (Click any level to inspect checks)"}
            </p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-7">
              {report.categories.map((cat) => {
                const pct = Math.round((cat.earned / cat.max) * 100);
                const full = cat.earned === cat.max;
                return (
                  <button
                    key={cat.key}
                    type="button"
                    onClick={() =>
                      setActiveLevel(activeLevel === cat.level ? null : cat.level)
                    }
                    className={`rounded-2xl border p-3 text-left transition-all cursor-pointer ${
                      activeLevel === cat.level
                        ? "border-blue-500 bg-blue-50/50 ring-2 ring-blue-200"
                        : full
                        ? "border-emerald-200 bg-emerald-50/30 hover:border-emerald-400"
                        : "border-amber-200 bg-amber-50/30 hover:border-amber-400"
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-semibold text-gray-500 mb-1">
                      <span>{isZh ? `第 ${cat.level} 关` : `Lv.${cat.level}`}</span>
                      <span className={full ? "text-emerald-700 font-bold" : "text-amber-700 font-bold"}>
                        {cat.earned}/{cat.max}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-gray-900 line-clamp-1 mb-2">
                      {cat.name[lang].replace(/^第 \d 关：|^Level \d: /, "")}
                    </p>
                    <div className="h-1.5 w-full rounded-full bg-gray-200 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
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

          {/* 总处方笺：一键复制全套 Cursor / Claude Code 修复 Prompt */}
          {report.failedKeys.length > 0 ? (
            <div className="mb-8 rounded-2xl border border-blue-200 bg-blue-50/60 p-4 md:p-5">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                <div>
                  <h4 className="text-base font-bold text-gray-900">
                    {isZh
                      ? `💊 主治医生总处方：共发现 ${report.failedKeys.length} 项待修复病因（修完即可冲刺 100 分 Grade A）`
                      : `💊 Master Prescription: ${report.failedKeys.length} checks to fix for 100/100 Grade A`}
                  </h4>
                  <p className="text-xs text-gray-600">
                    {isZh
                      ? "复制下方完整 Prompt 粘贴到 Cursor、Claude Code 或 Windsurf，AI 编程助手会直接帮你改好代码。"
                      : "Copy this master prompt into Cursor or Claude Code to fix all issues automatically."}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => copyText("master-prompt", report.combinedPrompt[lang])}
                    className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 cursor-pointer"
                  >
                    {copiedKey === "master-prompt"
                      ? isZh
                        ? "✅ 已复制全套修复药方！"
                        : "✅ Copied Master Prompt!"
                      : isZh
                      ? "📋 一键复制全套修复 Prompt"
                      : "📋 Copy Full Fix Prompt"}
                  </button>
                  <a
                    href={`https://cursor.com/link/prompt?text=${encodeURIComponent(
                      report.combinedPrompt[lang].slice(0, 1800)
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-xl border border-gray-300 bg-white px-3.5 py-2 text-xs font-semibold text-gray-800 hover:bg-gray-50"
                  >
                    {isZh ? "⚡ 在 Cursor 中打开" : "⚡ Open in Cursor"}
                  </a>
                </div>
              </div>
              <pre className="mt-3 max-h-48 overflow-y-auto rounded-xl bg-gray-900 p-3.5 text-xs text-gray-100 font-mono whitespace-pre-wrap leading-relaxed">
                {report.combinedPrompt[lang]}
              </pre>
            </div>
          ) : (
            <div className="mb-8 rounded-2xl border border-emerald-300 bg-emerald-50 p-4 text-sm text-emerald-900 font-medium">
              {isZh
                ? "🎉 太强了！该站点 26 项指标全部满分通过，已达到全球前 1% 的 AI Agent-Ready 标杆水准！"
                : "🎉 All 26 checks passed with full marks! This site is in the top 1% of Agent-Ready websites."}
            </div>
          )}

          {/* 通关认证徽章生成器（Grade A / B 站点可贴在自己网站或 GitHub README，形成外链飞轮） */}
          {report.score >= 70 && (
            <div className="mb-8 rounded-2xl border border-emerald-200 bg-emerald-50/40 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div>
                  <p className="text-sm font-bold text-gray-900">
                    {isZh
                      ? `🏅 恭喜拿到 Grade ${report.grade}！领取你的「AI Agent-Ready 认证徽章」`
                      : `🏅 Claim your Grade ${report.grade} AI Agent-Ready Badge`}
                  </p>
                  <p className="text-xs text-gray-600">
                    {isZh
                      ? "把这段代码贴在你的 GitHub README 或网站 Footer，向用户和爬虫展示你的 AI 就绪度评分："
                      : "Embed this badge in your GitHub README or website footer:"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    copyText(
                      "badge-md",
                      `[![AI Readiness: ${report.score}/100 (Grade ${report.grade})](https://img.shields.io/badge/AI_Readiness-${report.score}%2F100_Grade_${report.grade}-10b981?style=flat-square)](https://jasonzhu.ai/${lang}/go-global/ai-readiness)`
                    )
                  }
                  className="rounded-xl border border-emerald-400 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-50 cursor-pointer"
                >
                  {copiedKey === "badge-md"
                    ? isZh
                      ? "✅ 已复制 Markdown 徽章"
                      : "✅ Copied Badge Markdown"
                    : isZh
                    ? "复制 Markdown 徽章代码"
                    : "Copy Markdown Badge"}
                </button>
              </div>
              <code className="block rounded-xl bg-white border border-gray-200 p-2.5 text-xs text-gray-700 font-mono overflow-x-auto">
                {`[![AI Readiness: ${report.score}/100 (Grade ${report.grade})](https://img.shields.io/badge/AI_Readiness-${report.score}%2F100_Grade_${report.grade}-10b981?style=flat-square)](https://jasonzhu.ai/${lang}/go-global/ai-readiness)`}
              </code>
            </div>
          )}

          {/* 7 大关卡 26 项逐条体检明细 */}
          <div className="space-y-6">
            {report.categories
              .filter((c) => activeLevel === null || c.level === activeLevel)
              .map((cat) => (
                <div
                  key={cat.key}
                  className="rounded-2xl border border-gray-200 bg-gray-50/60 p-4 md:p-5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-gray-200">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-bold text-gray-900">
                          {cat.name[lang]}
                        </h4>
                        <span className="rounded-full bg-white border border-gray-200 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                          {cat.courseTieIn[lang]}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">{cat.symptom[lang]}</p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`inline-flex items-center rounded-xl px-3 py-1 text-sm font-bold ${
                          cat.earned === cat.max
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {cat.earned} / {cat.max} {isZh ? "分" : "pts"}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {cat.checks.map((chk) => {
                      const passed = chk.status === "passed";
                      const partial = chk.status === "partial";
                      return (
                        <div
                          key={chk.key}
                          className={`rounded-xl border p-3.5 bg-white ${
                            passed
                              ? "border-gray-200"
                              : partial
                              ? "border-amber-300"
                              : "border-red-300"
                          }`}
                        >
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <div className="flex items-start gap-2.5">
                              <span className="mt-0.5 text-base leading-none">
                                {passed ? "✅" : partial ? "⚠️" : "❌"}
                              </span>
                              <div>
                                <p className="text-sm font-semibold text-gray-900">
                                  {chk.title[lang]}
                                </p>
                                <p className="text-xs text-gray-500 mt-0.5">
                                  {chk.whyItMatters[lang]}
                                </p>
                                <p className="text-xs font-mono text-gray-700 mt-1 bg-gray-100 inline-block px-2 py-0.5 rounded">
                                  {isZh ? "实测证据：" : "Evidence: "}
                                  {chk.detail}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <span
                                className={`rounded-lg px-2.5 py-1 text-xs font-bold ${
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
                                  className="rounded-lg border border-blue-300 bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100 cursor-pointer"
                                >
                                  {copiedKey === chk.key
                                    ? isZh
                                      ? "已复制药方"
                                      : "Copied"
                                    : isZh
                                    ? "💊 复制药方 Prompt"
                                    : "💊 Copy Fix Prompt"}
                                </button>
                              )}
                            </div>
                          </div>

                          {chk.prompt && (
                            <pre className="mt-2.5 rounded-lg bg-gray-900 p-2.5 text-[11px] text-gray-100 font-mono whitespace-pre-wrap overflow-x-auto leading-relaxed">
                              {chk.prompt[lang]}
                            </pre>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          第 1 课 7 关通关教学大纲（就算还没输入域名，也能一眼看懂 100 分是怎么算的）
          ═══════════════════════════════════════════════════════════════════════ */}
      <section className="rounded-3xl border border-gray-200 bg-gray-100/60 p-5 md:p-6">
        <div className="mb-4">
          <h2 className="text-xl font-bold text-gray-900 mb-1">
            {isZh
              ? "🗺️ 第 1 课通关地图：AI 可见度 100 分是怎么算出来的？（7 关 26 项）"
              : "🗺️ Course 1 Level Map: How the 100-Point AI Readiness Score Works (7 Levels, 26 Checks)"}
          </h2>
          <p className="text-sm text-gray-600">
            {isZh
              ? "我们在研究全球六大 SEO/GEO 流派时发现，90% 独立开发者的网站之所以在 ChatGPT 和 Google AI Overview 里隐形，是因为连「第 1 课：技术底座与抓取渲染」都没过关。把这 7 关逐一打通，就是你的第一课毕业作品："
              : "90% of indie sites are invisible in ChatGPT and Google AI Overviews because they fail Course 1: Technical Crawlability & Agent Protocols."}
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {CATEGORIES.map((cat) => (
            <div key={cat.key} className="rounded-2xl border border-gray-200 bg-white p-4">
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="font-bold text-gray-900 text-sm">{cat.name[lang]}</span>
                <span className="rounded-full bg-blue-50 text-blue-700 px-2.5 py-0.5 text-xs font-semibold">
                  {cat.badge[lang]}
                </span>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed mb-2">{cat.symptom[lang]}</p>
              <p className="text-[11px] font-medium text-blue-600">{cat.courseTieIn[lang]}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          门诊大盘：满分名人堂（Grade A 标杆）vs 反面教材 + 最新接诊记录
          ═══════════════════════════════════════════════════════════════════════ */}
      <section className="rounded-3xl border border-gray-200 bg-white p-5 md:p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-1">
          {isZh
            ? "🏆 AI 就绪度名人堂 & 典型反面教材对比（实测数据）"
            : "🏆 AI Readiness Hall of Fame & Real-World Benchmarks"}
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          {isZh
            ? "看看谁拿到了 Grade A（85~100 分），谁虽然名气大但在裸奔（点击任意一行可现场重跑实时体检）："
            : "Compare Grade A Agent-Ready sites against popular sites missing JSON-LD, llms.txt, or WebMCP:"}
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-xs text-gray-500">
                <th className="py-2.5 pr-3">{isZh ? "域名" : "Domain"}</th>
                <th className="py-2.5 px-2">{isZh ? "总分 / 等级" : "Score / Grade"}</th>
                <th className="py-2.5 px-2">{isZh ? "门卫(20)" : "Crawl(20)"}</th>
                <th className="py-2.5 px-2">{isZh ? "可读(18)" : "Read(18)"}</th>
                <th className="py-2.5 px-2">{isZh ? "指路(16)" : "Find(16)"}</th>
                <th className="py-2.5 px-2">{isZh ? "身份(14)" : "Schema(14)"}</th>
                <th className="py-2.5 px-2">{isZh ? "信任(12)" : "Trust(12)"}</th>
                <th className="py-2.5 px-2">{isZh ? "llms(10)" : "llms(10)"}</th>
                <th className="py-2.5 px-2">{isZh ? "MCP(10)" : "MCP(10)"}</th>
                <th className="py-2.5 pl-2">{isZh ? "操作" : "Action"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {BENCHMARK_HALL_OF_FAME.map((b: BenchmarkEntry) => (
                <tr key={b.domain} className="hover:bg-gray-50/80">
                  <td className="py-3 pr-3">
                    <p className="font-bold text-gray-900">{b.domain}</p>
                    <p className="text-xs text-gray-500">{b.tag[lang]}</p>
                  </td>
                  <td className="py-3 px-2 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center rounded-lg border px-2.5 py-0.5 text-xs font-bold ${gradeBadgeClass(
                        b.grade
                      )}`}
                    >
                      {b.score}/100 · {b.grade}
                    </span>
                  </td>
                  <td className="py-3 px-2 font-mono text-xs">{b.categoryBreakdown.crawl_permission}/20</td>
                  <td className="py-3 px-2 font-mono text-xs">{b.categoryBreakdown.readability}/18</td>
                  <td className="py-3 px-2 font-mono text-xs">{b.categoryBreakdown.findability}/16</td>
                  <td className="py-3 px-2 font-mono text-xs">{b.categoryBreakdown.structured_meaning}/14</td>
                  <td className="py-3 px-2 font-mono text-xs">{b.categoryBreakdown.commercial_legibility}/12</td>
                  <td className="py-3 px-2 font-mono text-xs">{b.categoryBreakdown.agent_native}/10</td>
                  <td className="py-3 px-2 font-mono text-xs">{b.categoryBreakdown.agent_interaction}/10</td>
                  <td className="py-3 pl-2">
                    <button
                      type="button"
                      onClick={() => handleScan(b.domain)}
                      disabled={loading}
                      className="rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100 cursor-pointer whitespace-nowrap"
                    >
                      {isZh ? "实时重测" : "Live Scan"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {recentScans.length > 0 && (
          <div className="mt-6 pt-5 border-t border-gray-100">
            <p className="text-xs font-semibold text-gray-500 mb-2.5">
              {isZh ? "🕒 急诊室最新接诊记录（实时入库）：" : "🕒 Recent Clinic Scans:"}
            </p>
            <div className="flex flex-wrap gap-2">
              {recentScans.map((r, i) => (
                <button
                  key={`${r.domain}-${i}`}
                  type="button"
                  onClick={() => handleScan(r.domain)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs text-gray-700 hover:border-blue-300 cursor-pointer"
                >
                  <span className="font-medium">{r.domain}</span>
                  <span
                    className={`rounded px-1.5 py-0.2 text-[10px] font-bold border ${gradeBadgeClass(
                      r.grade
                    )}`}
                  >
                    {r.score} · {r.grade}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
