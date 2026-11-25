"use client";

import { useEffect } from "react";

interface ModelContextTool {
  name: string;
  title?: string;
  description: string;
  inputSchema: Record<string, unknown>;
  annotations?: { readOnlyHint?: boolean };
  execute: (input: Record<string, unknown>) => Promise<unknown> | unknown;
}

interface ModelContextLike {
  registerTool?: (tool: ModelContextTool) => unknown;
}

// 浏览器端 WebMCP 工具，只在支持 navigator.modelContext 的浏览器里、打开本站页面时存在；本站没有远程 MCP 服务。
// 改名字或功能时同步改 public/.well-known/mcp/server-card.json（2026-11-25 照实重写过：以前写成了以 llms.txt 为端点的 MCP 服务）。
const TOOLS: ModelContextTool[] = [
  {
    name: "search_jasonzhu_articles",
    title: "Search JasonZhu.AI Articles & Guides",
    description:
      "Search Jason Zhu's hands-on AI tutorials, Claude Code / Cursor guides, going-global playbooks, and daily AI news.",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Keyword or topic to search (e.g. 'Claude Code', 'UK company', 'SEO', 'GEO').",
        },
        lang: {
          type: "string",
          enum: ["zh", "en"],
          description: "Language preference ('zh' or 'en').",
        },
      },
      required: ["query"],
    },
    annotations: { readOnlyHint: true },
    execute: async (input) => {
      const q = typeof input.query === "string" ? input.query.trim() : "";
      const lang = input.lang === "en" ? "en" : "zh";
      const res = await fetch("/llms.txt");
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
    name: "get_going_global_guides",
    title: "Get Going-Global Playbooks & Payment Selector",
    description:
      "Return key entry points for JasonZhu.AI's Going-Global Hub (company registration, cross-border payment selector, SEO/GEO schools map, and GoSail Club).",
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
    annotations: { readOnlyHint: true },
    execute: async (input) => {
      const lang = input.lang === "en" ? "en" : "zh";
      return {
        hub: `https://jasonzhu.ai/${lang}/go-global`,
        paymentSelector: `https://jasonzhu.ai/${lang}/go-global/payments`,
        openAccountGuide: `https://jasonzhu.ai/${lang}/go-global/open-account`,
        club: `https://jasonzhu.ai/${lang}/club`,
        services: `https://jasonzhu.ai/${lang}/services`,
      };
    },
  },
];

let registered = false;

export default function WebMcpRegister() {
  useEffect(() => {
    if (registered || typeof window === "undefined") return;
    const navCtx = (navigator as Navigator & { modelContext?: ModelContextLike }).modelContext;
    const docCtx = (document as Document & { modelContext?: ModelContextLike }).modelContext;
    const contexts = [navCtx, docCtx].filter(
      (ctx): ctx is ModelContextLike => Boolean(ctx && typeof ctx.registerTool === "function")
    );
    if (contexts.length === 0) return;
    registered = true;
    for (const ctx of contexts) {
      for (const tool of TOOLS) {
        try {
          Promise.resolve(ctx.registerTool?.(tool)).catch(() => {});
        } catch {
          // Ignore unsupported browser errors
        }
      }
    }
  }, []);

  return null;
}
