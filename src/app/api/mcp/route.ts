import { NextRequest, NextResponse } from "next/server";
import { getGuardData } from "@/lib/payment-guard";
import { pickTable, type Lang } from "@/lib/payment-guard-types";
import { getAllPosts } from "@/lib/mdx";
import { runAiReadinessScan } from "@/lib/ai-readiness-scanner";
import { rateLimit } from "@/lib/rate-limit";
import rawLeaderboard from "@/generated/ai-visibility-leaderboard.json";
import type { LeaderboardData } from "@/app/[lang]/research/ai-visibility/LeaderboardClient";

export const dynamic = "force-dynamic";

const SITE_URL = "https://jasonzhu.ai";
const PROTOCOL_VERSION = "2025-06-18";
const SERVER_INFO = {
  name: "jasonzhu-ai",
  title: "JasonZhu.AI MCP Server",
  version: "1.0.0",
};

const ALL_BOARDS = (rawLeaderboard.boards || []) as LeaderboardData[];

const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Accept, Mcp-Session-Id, MCP-Protocol-Version",
  "Access-Control-Expose-Headers": "Mcp-Session-Id",
};

interface JsonRpcRequest {
  jsonrpc?: string;
  id?: string | number | null;
  method?: string;
  params?: Record<string, unknown>;
}

const TOOLS = [
  {
    name: "recommend_payment_mor",
    title: "Recommend SaaS Payment / MoR Platforms & Net Payouts",
    description:
      "Compare cross-border payment and Merchant of Record (MoR) platforms (Stripe, Paddle, Creem, Dodo Payments, Polar, Waffo, PayPal, Gumroad, Lemon Squeezy) for a founder's entity and product type, returning deterministic $20 net take-home figures, eligibility, exclusions, and official sources.",
    inputSchema: {
      type: "object",
      properties: {
        who: {
          type: "string",
          enum: ["cn-individual", "cn-company", "hk-company", "us-company", "uk-company"],
          description: "Founder entity holding the payout account.",
        },
        sell: {
          type: "string",
          enum: [
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
          ],
          description: "Type of product being sold.",
        },
        lang: {
          type: "string",
          enum: ["zh", "en"],
          description: "Language for notes and interactive URLs (default: en).",
        },
      },
      required: ["who", "sell"],
    },
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
  },
  {
    name: "get_ai_visibility_index",
    title: "Get Monthly AI Visibility Index (Payments/MoR or China AI Tools)",
    description:
      "Return the latest monthly empirical AI Visibility Index from jasonzhu.ai ('payments-mor' or 'china-ai-global'), including mention rates, Wilson 95% confidence intervals, official domain citation rates, first-mention rates, methodology, and open CC-BY-4.0 CSV URL.",
    inputSchema: {
      type: "object",
      properties: {
        board: {
          type: "string",
          enum: ["payments-mor", "china-ai-global"],
          description: "Which standalone monthly leaderboard to inspect.",
        },
        origin: {
          type: "string",
          enum: ["all", "cn_global", "challenger", "global_incumbent"],
          description: "Optional filter by brand origin cohort.",
        },
        limit: {
          type: "integer",
          minimum: 1,
          maximum: 50,
          description: "Maximum number of ranked brands to return (default: 20).",
        },
      },
      required: ["board"],
    },
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
  },
  {
    name: "scan_ai_readiness",
    title: "Run Live 26-Check AI Readiness & GEO Audit",
    description:
      "Probe 26 live HTTP, crawl-access, structured-data, Markdown, and WebMCP signals on any public domain and return a 100-point AI Readiness score, grade, passed/failed check keys, and report link.",
    inputSchema: {
      type: "object",
      properties: {
        domain: {
          type: "string",
          description: "Public website domain or URL to audit (e.g. 'stripe.com' or 'jasonzhu.ai').",
        },
        lang: {
          type: "string",
          enum: ["zh", "en"],
          description: "Language preference for the returned report link (default: en).",
        },
      },
      required: ["domain"],
    },
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: false,
      openWorldHint: true,
    },
  },
  {
    name: "search_jasonzhu_articles",
    title: "Search JasonZhu.AI Research, Guides & Playbooks",
    description:
      "Search Jason Zhu's published research reports, AI coding tutorials, going-global payment/company guides, and SEO/GEO playbooks by keyword or tag.",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Keyword or topic (e.g. 'MoR', 'UK company', 'GEO', 'Claude Code').",
        },
        lang: {
          type: "string",
          enum: ["zh", "en"],
          description: "Preferred output language ('zh' or 'en', default: zh).",
        },
        limit: {
          type: "integer",
          minimum: 1,
          maximum: 20,
          description: "Maximum articles to return (default: 10).",
        },
      },
      required: ["query"],
    },
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
  },
];

async function executeTool(
  name: string,
  args: Record<string, unknown>
): Promise<{ ok: true; data: Record<string, unknown> } | { ok: false; error: string }> {
  switch (name) {
    case "recommend_payment_mor": {
      const who = typeof args.who === "string" ? args.who.trim() : "";
      const sell = typeof args.sell === "string" ? args.sell.trim() : "";
      const lang: Lang = args.lang === "zh" ? "zh" : "en";
      const guard = getGuardData();
      const table = pickTable(guard, who, sell);
      if (!table) {
        return {
          ok: false,
          error: `Unsupported who='${who}' or sell='${sell}'. Valid entities: ${Object.keys(guard.entities).join(", ")}; valid products: ${Object.keys(guard.products).join(", ")}.`,
        };
      }
      const eligiblePlatforms = table.rows.map((row) => {
        const pf = guard.platforms[row.platform];
        return {
          id: row.platform,
          name: pf?.name || row.platform,
          isMoR: Boolean(pf?.mor),
          canOpen: row.open,
          productFit: row.fit,
          netKeptFromSaleUsd: row.keep,
          saleBasisUsd: guard.sale,
          feeSummary: pf?.fee?.[lang] || "",
          payoutSummary: pf?.payout?.[lang] || "",
          warning: pf?.warning ? pf.warning[lang] : null,
          signupUrl: pf?.opening?.signup || pf?.review_doc || "",
        };
      });
      return {
        ok: true,
        data: {
          checkedAt: guard.checked,
          saleBasisUsd: guard.sale,
          who,
          sell,
          topPick: eligiblePlatforms[0] || null,
          eligiblePlatforms,
          leftOut: table.excluded.map((ex) => ({
            id: ex.platform,
            name: guard.platforms[ex.platform]?.name || ex.platform,
            reason: ex.why[lang],
            source: ex.source,
          })),
          categoryNote: table.category_note[lang],
          interactiveUrl: `${SITE_URL}/${lang}/go-global/payments?who=${encodeURIComponent(who)}&sell=${encodeURIComponent(sell)}`,
          monthlyAiVisibilityUrl: `${SITE_URL}/${lang}/research/ai-visibility/payments-mor`,
        },
      };
    }

    case "get_ai_visibility_index": {
      const boardId = typeof args.board === "string" ? args.board.trim() : "";
      const origin = typeof args.origin === "string" ? args.origin.trim() : "all";
      const rawLimit = typeof args.limit === "number" ? Math.trunc(args.limit) : 20;
      const limit = Math.min(Math.max(rawLimit, 1), 50);

      const board = ALL_BOARDS.find((b) => b.id === boardId);
      if (!board) {
        return {
          ok: false,
          error: `Unknown board '${boardId}'. Available boards: ${ALL_BOARDS.map((b) => b.id).join(", ")}.`,
        };
      }
      const filtered =
        origin && origin !== "all"
          ? board.rankings.filter((r) => r.origin === origin)
          : board.rankings;

      return {
        ok: true,
        data: {
          id: board.id,
          status: board.status,
          period: board.period,
          title: board.title_en,
          titleZh: board.title_zh,
          methodology: board.methodology,
          totalRankedBrands: filtered.length,
          rankings: filtered.slice(0, limit).map((r) => ({
            rank: r.rank,
            name: r.name,
            origin: r.origin,
            category: r.category,
            mentionRatePct: r.mention_rate_pct,
            ci95: [r.ci95_low, r.ci95_high],
            roundRangePct: [r.round_min_pct, r.round_max_pct],
            officialDomainCitedPct: r.cited_rate_pct,
            firstMentionPct: r.first_mention_rate_pct,
            byEngine: r.by_engine,
          })),
          pageUrlEn: `${SITE_URL}/en/research/ai-visibility/${board.id}`,
          pageUrlZh: `${SITE_URL}/zh/research/ai-visibility/${board.id}`,
          csvUrl: `${SITE_URL}${board.csv_path}`,
        },
      };
    }

    case "scan_ai_readiness": {
      const domain = typeof args.domain === "string" ? args.domain.trim() : "";
      const lang: Lang = args.lang === "zh" ? "zh" : "en";
      if (!domain) {
        return { ok: false, error: "Parameter 'domain' is required." };
      }
      try {
        const report = await runAiReadinessScan(domain);
        return {
          ok: true,
          data: {
            domain: report.domain,
            finalUrl: report.finalUrl,
            score: report.score,
            coreScore: report.coreScore,
            grade: report.grade,
            label: report.label[lang],
            passedCount: report.passedKeys.length,
            failedCount: report.failedKeys.length,
            failedKeys: report.failedKeys,
            scannedAt: report.scannedAt,
            reportUrl: `${SITE_URL}/${lang}/go-global/ai-readiness`,
          },
        };
      } catch (err) {
        return {
          ok: false,
          error: err instanceof Error ? err.message : "Failed to scan domain.",
        };
      }
    }

    case "search_jasonzhu_articles": {
      const query = typeof args.query === "string" ? args.query.trim().toLowerCase() : "";
      const lang: Lang = args.lang === "en" ? "en" : "zh";
      const rawLimit = typeof args.limit === "number" ? Math.trunc(args.limit) : 10;
      const limit = Math.min(Math.max(rawLimit, 1), 20);
      const tokens = query.split(/\s+/).filter(Boolean);

      const posts = getAllPosts();
      const scored = posts
        .map((post) => {
          const hay = [
            post.title,
            post.titleEn || "",
            post.excerpt,
            post.excerptEn || "",
            post.category,
            ...(post.tags || []),
            ...(post.keywords || []),
          ]
            .join(" ")
            .toLowerCase();
          let score = 0;
          if (tokens.length === 0) {
            score = 1;
          } else {
            for (const t of tokens) {
              if (hay.includes(t)) score += 1;
            }
          }
          return { post, score };
        })
        .filter((x) => x.score > 0)
        .sort((a, b) => b.score - a.score || b.post.date.localeCompare(a.post.date))
        .slice(0, limit);

      return {
        ok: true,
        data: {
          query,
          totalMatches: scored.length,
          results: scored.map(({ post }) => ({
            slug: post.slug,
            title: lang === "en" && post.titleEn ? post.titleEn : post.title,
            excerpt: lang === "en" && post.excerptEn ? post.excerptEn : post.excerpt,
            date: post.date,
            updated: post.updated || null,
            category: post.category,
            tags: post.tags,
            doi: post.doi || null,
            url: `${SITE_URL}/${lang === "en" && post.hasEnglish ? "en" : "zh"}/blog/${post.slug}`,
          })),
        },
      };
    }

    default:
      return { ok: false, error: `Unknown tool: ${name}` };
  }
}

async function handleJsonRpc(msg: JsonRpcRequest): Promise<Record<string, unknown> | null> {
  const id = msg.id ?? null;
  const method = typeof msg.method === "string" ? msg.method : "";
  const params = (msg.params && typeof msg.params === "object" ? msg.params : {}) as Record<string, unknown>;

  // JSON-RPC notifications have no id and require no response payload
  if (method.startsWith("notifications/")) {
    return null;
  }

  switch (method) {
    case "initialize": {
      const requested = typeof params.protocolVersion === "string" ? params.protocolVersion : PROTOCOL_VERSION;
      return {
        jsonrpc: "2.0",
        id,
        result: {
          protocolVersion: requested || PROTOCOL_VERSION,
          capabilities: {
            tools: { listChanged: false },
          },
          serverInfo: SERVER_INFO,
          instructions:
            "JasonZhu.AI stateless remote MCP server. Use recommend_payment_mor for deterministic SaaS payment/MoR comparisons, get_ai_visibility_index for monthly AI visibility benchmarks, scan_ai_readiness for live 26-check GEO audits, and search_jasonzhu_articles to locate guides.",
        },
      };
    }

    case "ping":
      return { jsonrpc: "2.0", id, result: {} };

    case "tools/list":
      return { jsonrpc: "2.0", id, result: { tools: TOOLS } };

    case "tools/call": {
      const toolName = typeof params.name === "string" ? params.name : "";
      const toolArgs =
        params.arguments && typeof params.arguments === "object"
          ? (params.arguments as Record<string, unknown>)
          : {};
      if (!toolName) {
        return {
          jsonrpc: "2.0",
          id,
          error: { code: -32602, message: "Missing tool name in params.name" },
        };
      }
      const outcome = await executeTool(toolName, toolArgs);
      if (!outcome.ok) {
        return {
          jsonrpc: "2.0",
          id,
          result: {
            isError: true,
            content: [{ type: "text", text: outcome.error }],
          },
        };
      }
      return {
        jsonrpc: "2.0",
        id,
        result: {
          content: [{ type: "text", text: JSON.stringify(outcome.data, null, 2) }],
          structuredContent: outcome.data,
        },
      };
    }

    default:
      return {
        jsonrpc: "2.0",
        id,
        error: { code: -32601, message: `Method not found: ${method}` },
      };
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET() {
  return NextResponse.json(
    {
      ...SERVER_INFO,
      protocolVersion: PROTOCOL_VERSION,
      transport: "streamable-http",
      endpoint: `${SITE_URL}/api/mcp`,
      serverCard: `${SITE_URL}/.well-known/mcp/server-card.json`,
      usage: "Send MCP JSON-RPC 2.0 POST requests (initialize, tools/list, tools/call) to this endpoint.",
      tools: TOOLS.map((t) => ({ name: t.name, title: t.title })),
    },
    { status: 200, headers: CORS_HEADERS }
  );
}

export async function POST(request: NextRequest) {
  const limited = rateLimit(request, { limit: 30, windowMs: 60_000, prefix: "mcp" });
  if (limited) return limited;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { jsonrpc: "2.0", id: null, error: { code: -32700, message: "Parse error: invalid JSON" } },
      { status: 400, headers: CORS_HEADERS }
    );
  }

  if (Array.isArray(body)) {
    const responses = (
      await Promise.all(body.map((item) => handleJsonRpc(item as JsonRpcRequest)))
    ).filter((r): r is Record<string, unknown> => r !== null);
    if (responses.length === 0) {
      return new NextResponse(null, { status: 202, headers: CORS_HEADERS });
    }
    return NextResponse.json(responses, { status: 200, headers: CORS_HEADERS });
  }

  const response = await handleJsonRpc(body as JsonRpcRequest);
  if (response === null) {
    return new NextResponse(null, { status: 202, headers: CORS_HEADERS });
  }
  return NextResponse.json(response, { status: 200, headers: CORS_HEADERS });
}
