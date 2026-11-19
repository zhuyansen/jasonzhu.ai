import { createHash } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import {
  BENCHMARK_HALL_OF_FAME,
  runAiReadinessScan,
  type ScanReport,
} from "@/lib/ai-readiness-scanner";
import { kvCommand } from "@/lib/lead-backup";
import { rateLimit } from "@/lib/rate-limit";
import { getSupabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

function hashIp(ip: string): string {
  return createHash("sha256").update(`jasonzhu-ai-clinic:${ip}`).digest("hex").slice(0, 16);
}

/**
 * 把用户的每一次域名体检结果持久化到：
 * 1) Supabase 主表 `ai_readiness_scans`（结构化分析：查哪些独立站来测过、得了多少分、卡在哪一关）
 * 2) Vercel KV / Upstash 兜底队列 `ai_readiness_scans_log`（保留最新 1000 条，防止 Supabase 未建表或限流时丢数据）
 */
async function persistScanRecord(
  report: ScanReport,
  meta: { lang: string; source: string; ipHash: string; userAgent: string }
): Promise<{ savedToSupabase: boolean; savedToKv: boolean }> {
  const categoryScores = Object.fromEntries(
    report.categories.map((c) => [c.key, { earned: c.earned, max: c.max }])
  );

  // 1. 写 KV 兜底列表（best-effort）
  const kvPayload = JSON.stringify({
    domain: report.domain,
    score: report.score,
    grade: report.grade,
    categoryScores,
    failedKeys: report.failedKeys,
    lang: meta.lang,
    source: meta.source,
    ts: report.scannedAt,
  });
  const savedToKv = await kvCommand(["LPUSH", "ai_readiness_scans_log", kvPayload]);
  if (savedToKv) {
    await kvCommand(["LTRIM", "ai_readiness_scans_log", "0", "999"]);
  }

  // 2. 写 Supabase `ai_readiness_scans` 表
  let savedToSupabase = false;
  try {
    const supabase = getSupabase();
    const { error } = await supabase.from("ai_readiness_scans").insert({
      domain: report.domain,
      final_url: report.finalUrl,
      score: report.score,
      grade: report.grade,
      label: report.label.zh,
      category_scores: categoryScores,
      failed_checks: report.failedKeys,
      passed_checks: report.passedKeys,
      results: report,
      source: meta.source,
      lang: meta.lang,
      ip_hash: meta.ipHash,
      user_agent: meta.userAgent.slice(0, 250),
    });
    if (error) {
      console.warn("[ai-readiness] Supabase insert warning:", error.message);
    } else {
      savedToSupabase = true;
    }
  } catch (e) {
    console.warn("[ai-readiness] Supabase unavailable:", e instanceof Error ? e.message : String(e));
  }

  return { savedToSupabase, savedToKv };
}

export async function POST(request: NextRequest) {
  const limited = rateLimit(request, { limit: 15, windowMs: 60_000, prefix: "ai-readiness" });
  if (limited) return limited;

  try {
    const body = await request.json();
    const rawDomain = String(body?.domain || "").trim();
    const lang = body?.lang === "en" ? "en" : "zh";
    const source = String(body?.source || "ai-clinic-game").slice(0, 64);

    if (!rawDomain) {
      return NextResponse.json(
        { error: lang === "en" ? "Please enter a domain name." : "请输入要诊断的域名（如 jasonzhu.ai）" },
        { status: 400 }
      );
    }

    const report = await runAiReadinessScan(rawDomain);

    const ip =
      (request.headers.get("x-forwarded-for") || "").split(",")[0].trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";
    const userAgent = request.headers.get("user-agent") || "";

    const persistence = await persistScanRecord(report, {
      lang,
      source,
      ipHash: hashIp(ip),
      userAgent,
    });

    return NextResponse.json({
      success: true,
      report,
      persistence,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "诊断失败，请稍后重试";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

export async function GET() {
  // 返回名人堂基准 + 数据库里最新接诊的真实站点匿名/公开统计
  let recentScans: Array<{
    domain: string;
    score: number;
    grade: string;
    created_at: string;
  }> = [];
  let totalScans = BENCHMARK_HALL_OF_FAME.length;

  try {
    const supabase = getSupabase();
    const { data, count, error } = await supabase
      .from("ai_readiness_scans")
      .select("domain, score, grade, created_at", { count: "exact" })
      .order("created_at", { ascending: false })
      .limit(12);

    if (!error && Array.isArray(data)) {
      recentScans = data;
      if (typeof count === "number") {
        totalScans = Math.max(count, BENCHMARK_HALL_OF_FAME.length);
      }
    }
  } catch {
    // fallback to benchmarks if table not migrated yet
  }

  return NextResponse.json({
    benchmarks: BENCHMARK_HALL_OF_FAME,
    recentScans,
    totalScans,
  });
}
