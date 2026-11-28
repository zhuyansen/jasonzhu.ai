"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { pickTable, type GuardData, type Lang } from "@/lib/payment-guard-types";

interface WebMcpAnnotations {
  readOnlyHint?: boolean;
  consequentialHint?: boolean;
  untrustedContentHint?: boolean;
  debugging?: boolean;
}

interface WebMcpExecuteContext {
  signal?: AbortSignal;
}

interface ModelContextTool {
  name: string;
  title?: string;
  description: string;
  inputSchema: Record<string, unknown>;
  annotations?: WebMcpAnnotations;
  execute: (input: Record<string, unknown>, context?: WebMcpExecuteContext) => Promise<unknown> | unknown;
}

interface ModelContextLike {
  registerTool?: (tool: ModelContextTool, options?: { signal?: AbortSignal }) => unknown;
}

const VALID_ENTITIES = [
  "cn-individual",
  "cn-company",
  "hk-company",
  "us-company",
  "uk-company",
] as const;

const VALID_PRODUCTS = [
  "saas",
  "software",
  "ai-app",
  "ai-media",
  "template",
  "course",
  "ebook",
  "service",
  "physical",
  "donation",
] as const;

let cachedGuardData: GuardData | null = null;

async function loadPaymentGuardData(signal?: AbortSignal): Promise<GuardData> {
  if (cachedGuardData) return cachedGuardData;
  const res = await fetch("/data/payment-guard.json", { signal });
  if (!res.ok) {
    throw new Error(`Failed to fetch /data/payment-guard.json (${res.status})`);
  }
  const data = (await res.json()) as GuardData;
  cachedGuardData = data;
  return data;
}

// 浏览器端 WebMCP 工具（遵循 Chrome 149+ document.modelContext 规范，无远程 MCP 服务端）。
// 改名字或功能时同步更新 public/.well-known/mcp/server-card.json。
const BASE_TOOLS: ModelContextTool[] = [
  {
    name: "search_jasonzhu_articles",
    title: "Search JasonZhu.AI Articles & Guides",
    description:
      "Search Jason Zhu's hands-on AI tutorials, Claude Code / Cursor guides, going-global playbooks, and monthly AI visibility research via /llms.txt.",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Keyword or topic to search (e.g. 'Claude Code', 'UK company', 'MoR', 'GEO').",
        },
        lang: {
          type: "string",
          enum: ["zh", "en"],
          description: "Language preference ('zh' or 'en').",
        },
      },
      required: ["query"],
    },
    annotations: {
      readOnlyHint: true,
      consequentialHint: false,
      untrustedContentHint: false,
    },
    execute: async (input, ctx) => {
      const q = typeof input.query === "string" ? input.query.trim() : "";
      const lang: Lang = input.lang === "en" ? "en" : "zh";
      const res = await fetch("/llms.txt", { signal: ctx?.signal });
      const text = await res.text();
      const lines = text
        .split("\n")
        .filter((l) => l.startsWith("- [") && (!q || l.toLowerCase().includes(q.toLowerCase())));
      return {
        query: q,
        blogUrl: `https://jasonzhu.ai/${lang}/blog`,
        matches: lines.slice(0, 20),
      };
    },
  },
  {
    name: "recommend_payment_mor",
    title: "Recommend SaaS Payment / MoR Platforms & Net Payouts",
    description:
      "Compare cross-border payment and Merchant of Record (MoR) platforms (Stripe, Paddle, Creem, Dodo Payments, Polar, Waffo, PayPal, Gumroad, Lemon Squeezy) for a founder's entity and product type, returning deterministic $20 net take-home figures and eligibility from /data/payment-guard.json.",
    inputSchema: {
      type: "object",
      properties: {
        who: {
          type: "string",
          enum: [...VALID_ENTITIES],
          description:
            "Founder entity holding the payout account: cn-individual (mainland China solo founder), cn-company, hk-company, us-company (US LLC), or uk-company (UK Ltd).",
        },
        sell: {
          type: "string",
          enum: [...VALID_PRODUCTS],
          description:
            "Product category being sold (e.g. 'saas', 'ai-app', 'ai-media', 'software', 'template', 'course', 'ebook', 'service', 'physical', 'donation').",
        },
        lang: {
          type: "string",
          enum: ["zh", "en"],
          description: "Output language for notes and interactive URL ('zh' or 'en').",
        },
      },
      required: ["who", "sell"],
    },
    annotations: {
      readOnlyHint: true,
      consequentialHint: false,
      untrustedContentHint: false,
    },
    execute: async (input, ctx) => {
      const who = typeof input.who === "string" ? input.who.trim() : "";
      const sell = typeof input.sell === "string" ? input.sell.trim() : "";
      const lang: Lang = input.lang === "zh" ? "zh" : "en";

      const data = await loadPaymentGuardData(ctx?.signal);
      const table = pickTable(data, who, sell);
      if (!table) {
        return {
          error: "Unsupported entity or product combination.",
          validEntities: Object.keys(data.entities),
          validProducts: Object.keys(data.products),
        };
      }

      const eligiblePlatforms = table.rows.map((row) => {
        const pf = data.platforms[row.platform];
        return {
          id: row.platform,
          name: pf?.name || row.platform,
          isMoR: Boolean(pf?.mor),
          canOpen: row.open,
          productFit: row.fit,
          netKeptFromSaleUsd: row.keep,
          saleBasisUsd: data.sale,
          feeSummary: pf?.fee?.[lang] || "",
          payoutSummary: pf?.payout?.[lang] || "",
          warning: pf?.warning ? pf.warning[lang] : null,
          signupUrl: pf?.opening?.signup || pf?.review_doc || "",
        };
      });

      const leftOut = table.excluded.map((ex) => ({
        id: ex.platform,
        name: data.platforms[ex.platform]?.name || ex.platform,
        reason: ex.why[lang],
        source: ex.source,
      }));

      return {
        checkedAt: data.checked,
        saleBasisUsd: data.sale,
        who,
        sell,
        topPick: eligiblePlatforms[0] || null,
        eligiblePlatforms,
        leftOut,
        categoryNote: table.category_note[lang],
        interactiveUrl: `https://jasonzhu.ai/${lang}/go-global/payments?who=${encodeURIComponent(who)}&sell=${encodeURIComponent(sell)}`,
        monthlyAiVisibilityUrl: `https://jasonzhu.ai/${lang}/research/ai-visibility/payments-mor`,
      };
    },
  },
  {
    name: "get_going_global_guides",
    title: "Get Going-Global Playbooks & Monthly AI Visibility Indices",
    description:
      "Return key entry points for JasonZhu.AI's Going-Global Hub (company registration, cross-border payment selector, 26-check AI Readiness Clinic, monthly AI Visibility Indices, and GoSail Club).",
    inputSchema: {
      type: "object",
      properties: {
        lang: {
          type: "string",
          enum: ["zh", "en"],
          description: "Language preference ('zh' or 'en').",
        },
      },
    },
    annotations: {
      readOnlyHint: true,
      consequentialHint: false,
      untrustedContentHint: false,
    },
    execute: async (input) => {
      const lang: Lang = input.lang === "en" ? "en" : "zh";
      return {
        hub: `https://jasonzhu.ai/${lang}/go-global`,
        paymentSelector: `https://jasonzhu.ai/${lang}/go-global/payments`,
        aiReadinessClinic: `https://jasonzhu.ai/${lang}/go-global/ai-readiness`,
        paymentsAiVisibilityIndex: `https://jasonzhu.ai/${lang}/research/ai-visibility/payments-mor`,
        chinaAiToolsVisibilityIndex: `https://jasonzhu.ai/${lang}/research/ai-visibility/china-ai-global`,
        openAccountGuide: `https://jasonzhu.ai/${lang}/go-global/open-account`,
        club: `https://jasonzhu.ai/${lang}/club`,
        services: `https://jasonzhu.ai/${lang}/services`,
      };
    },
  },
];

// 命令式 AI 就绪度体检工具：仅在非 /go-global/ai-readiness 路由注册，避免与急诊室页内声明式 <form toolname="scan_ai_readiness"> 同名冲突。
const IMPERATIVE_SCAN_TOOL: ModelContextTool = {
  name: "scan_ai_readiness",
  title: "Run 26-Check AI Readiness & GEO Audit",
  description:
    "Run a live 26-check, 100-point AI Readiness and GEO visibility diagnosis on any public website domain via POST /api/ai-readiness (records the scanned domain in the public clinic directory).",
  inputSchema: {
    type: "object",
    properties: {
      domain: {
        type: "string",
        description: "Public domain or URL to inspect (e.g. 'stripe.com' or 'jasonzhu.ai').",
      },
      lang: {
        type: "string",
        enum: ["zh", "en"],
        description: "Language preference for the returned report link ('zh' or 'en').",
      },
    },
    required: ["domain"],
  },
  annotations: {
    readOnlyHint: false,
    consequentialHint: false,
    untrustedContentHint: true,
  },
  execute: async (input, ctx) => {
    const domain = typeof input.domain === "string" ? input.domain.trim() : "";
    const lang: Lang = input.lang === "zh" ? "zh" : "en";
    if (!domain) {
      return { error: "Parameter 'domain' is required." };
    }
    const res = await fetch("/api/ai-readiness", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ domain, lang, source: "webmcp-imperative" }),
      signal: ctx?.signal,
    });
    const data = await res.json();
    if (!res.ok || data?.error || !data?.report) {
      return { error: data?.error || `Scan failed (${res.status})` };
    }
    const report = data.report as {
      domain: string;
      finalUrl: string;
      score: number;
      coreScore?: number;
      grade: string;
      passedKeys: string[];
      failedKeys: string[];
      scannedAt: string;
    };
    return {
      domain: report.domain,
      finalUrl: report.finalUrl,
      score: report.score,
      coreScore: report.coreScore,
      grade: report.grade,
      passedCount: report.passedKeys.length,
      failedCount: report.failedKeys.length,
      failedKeys: report.failedKeys.slice(0, 8),
      scannedAt: report.scannedAt,
      reportUrl: `https://jasonzhu.ai/${lang}/go-global/ai-readiness`,
    };
  },
};

function getPrimaryModelContext(): ModelContextLike | null {
  if (typeof window === "undefined") return null;
  // 遵循 Chrome 149+ 正式规范：优先 document.modelContext，仅在缺失时回退早期草案 navigator.modelContext，避免双注册冲突
  const docCtx = (document as Document & { modelContext?: ModelContextLike }).modelContext;
  if (docCtx && typeof docCtx.registerTool === "function") return docCtx;
  const navCtx = (navigator as Navigator & { modelContext?: ModelContextLike }).modelContext;
  if (navCtx && typeof navCtx.registerTool === "function") return navCtx;
  return null;
}

export default function WebMcpRegister() {
  const pathname = usePathname();
  const isClinicPage = Boolean(pathname && pathname.endsWith("/go-global/ai-readiness"));

  useEffect(() => {
    const ctx = getPrimaryModelContext();
    if (!ctx) return;

    const controller = new AbortController();
    const toolsToRegister = isClinicPage ? BASE_TOOLS : [...BASE_TOOLS, IMPERATIVE_SCAN_TOOL];

    for (const tool of toolsToRegister) {
      try {
        Promise.resolve(ctx.registerTool?.(tool, { signal: controller.signal })).catch(() => {});
      } catch {
        // Ignore unsupported browser or duplicate registration errors
      }
    }

    return () => {
      controller.abort();
    };
  }, [isClinicPage]);

  return null;
}
