import { createHash } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import {
  BENCHMARK_HALL_OF_FAME,
  CHECK_CATALOG,
  normalizeAndValidateDomain,
  runAiReadinessScan,
  type ScanReport,
} from "@/lib/ai-readiness-scanner";
import { backupLead, kvCommand } from "@/lib/lead-backup";
import { rateLimit } from "@/lib/rate-limit";
import { getSupabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

function hashIp(ip: string): string {
  return createHash("sha256").update(`jasonzhu-ai-clinic:${ip}`).digest("hex").slice(0, 16);
}

/**
 * 查询该域名上一次的体检分数（用于计算「复诊进步幅度 +X 分」）
 */
async function getPreviousDomainScore(domain: string): Promise<number | null> {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("ai_readiness_scans")
      .select("score")
      .eq("domain", domain)
      .order("created_at", { ascending: false })
      .limit(1);
    if (!error && Array.isArray(data) && data.length > 0 && typeof data[0].score === "number") {
      return data[0].score;
    }
  } catch {
    // ignore
  }
  return null;
}

/**
 * 把用户的每一次域名体检结果持久化到：
 * 1) Supabase 主表 `ai_readiness_scans`（结构化分析：查哪些独立站来测过、得了多少分、复诊涨了多少分、卡在哪一关）
 * 2) Vercel KV / Upstash 兜底队列 `ai_readiness_scans_log`（保留最新 1000 条）
 */
async function persistScanRecord(
  report: ScanReport,
  meta: {
    lang: string;
    source: string;
    ipHash: string;
    userAgent: string;
    previousScore: number | null;
    scoreDelta: number | null;
  }
): Promise<{ savedToSupabase: boolean; savedToKv: boolean }> {
  const categoryScores = Object.fromEntries(
    report.categories.map((c) => [c.key, { earned: c.earned, max: c.max }])
  );

  // 1. 写 KV 兜底列表（best-effort）
  const kvPayload = JSON.stringify({
    domain: report.domain,
    score: report.score,
    grade: report.grade,
    previousScore: meta.previousScore,
    scoreDelta: meta.scoreDelta,
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
      previous_score: meta.previousScore,
      score_delta: meta.scoreDelta,
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
  const limited = rateLimit(request, { limit: 20, windowMs: 60_000, prefix: "ai-readiness" });
  if (limited) return limited;

  try {
    const body = await request.json();
    const action = String(body?.action || "scan");
    const lang = body?.lang === "en" ? "en" : "zh";

    // ─────────────────────────────────────────────────────────────────────
    // 分支 A：用户提交邮箱开启「掉分守护 & 复诊提醒 + 病历留档」
    // ─────────────────────────────────────────────────────────────────────
    if (action === "monitor") {
      const rawEmail = String(body?.email || "").trim().toLowerCase();
      const rawDomain = String(body?.domain || "").trim();
      const score = Number(body?.score ?? 0);
      const grade = String(body?.grade || "F");

      if (!rawEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rawEmail)) {
        return NextResponse.json(
          { error: lang === "en" ? "Please enter a valid email address." : "请输入有效的邮箱地址" },
          { status: 400 }
        );
      }

      const domain = normalizeAndValidateDomain(rawDomain);
      const leadSource = `ai-clinic:${domain}:${score}`;

      // 1) KV 备份线索 + 监控哈希
      await backupLead(rawEmail, leadSource);
      await kvCommand([
        "HSET",
        "ai_clinic_monitors",
        `${domain}:${rawEmail}`,
        JSON.stringify({ domain, email: rawEmail, score, grade, lang, ts: new Date().toISOString() }),
      ]);

      // 2) Supabase 写入 ai_readiness_monitors + subscribers + 更新最近一条体检记录
      try {
        const supabase = getSupabase();
        await supabase.from("ai_readiness_monitors").upsert(
          {
            domain,
            email: rawEmail,
            baseline_score: score,
            baseline_grade: grade,
            lang,
            active: true,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "domain,email" }
        );

        await supabase
          .from("ai_readiness_scans")
          .update({ notify_email: rawEmail, monitor_enabled: true })
          .eq("domain", domain)
          .is("notify_email", null);

        // 同步沉淀进主订阅表 subscribers（若尚未订阅）
        const { data: existingSub } = await supabase
          .from("subscribers")
          .select("id")
          .eq("email", rawEmail)
          .single();

        if (!existingSub) {
          await supabase.from("subscribers").insert({
            email: rawEmail,
            source: leadSource,
            subscribed_at: new Date().toISOString(),
          });
        }
      } catch (e) {
        console.warn("[ai-readiness] monitor supabase warning:", e);
      }

      return NextResponse.json({
        success: true,
        message:
          lang === "en"
            ? `Monitoring enabled for ${domain}! We'll alert ${rawEmail} if your AI Readiness score drops.`
            : `已为 ${domain} 开启 AI 可见度掉分守护与复诊档案（绑定邮箱：${rawEmail}）！`,
      });
    }

    // ─────────────────────────────────────────────────────────────────────
    // 分支 B：实时 7 关 26 项域名体检
    // ─────────────────────────────────────────────────────────────────────
    const rawDomain = String(body?.domain || "").trim();
    const source = String(body?.source || "ai-clinic-game").slice(0, 64);

    if (!rawDomain) {
      return NextResponse.json(
        { error: lang === "en" ? "Please enter a domain name." : "请输入要诊断的域名（如 jasonzhu.ai）" },
        { status: 400 }
      );
    }

    const normalizedDomain = normalizeAndValidateDomain(rawDomain);
    const [previousScore, report] = await Promise.all([
      getPreviousDomainScore(normalizedDomain),
      runAiReadinessScan(normalizedDomain),
    ]);

    const scoreDelta = previousScore !== null ? report.score - previousScore : null;

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
      previousScore,
      scoreDelta,
    });

    return NextResponse.json({
      success: true,
      report,
      previousScore,
      scoreDelta,
      persistence,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "诊断失败，请稍后重试";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

export async function GET(request: NextRequest) {
  const q = (request.nextUrl.searchParams.get("q") || "").trim().toLowerCase();

  let recentScans: Array<{
    domain: string;
    score: number;
    grade: string;
    score_delta: number | null;
    failed_count: number;
    created_at: string;
  }> = [];
  let totalScans = BENCHMARK_HALL_OF_FAME.length;
  let avgScore = 78;
  let gradeARate = 50;

  const failCounter: Record<string, number> = {};
  let analyzedDomainsCount = 0;

  try {
    const supabase = getSupabase();
    let query = supabase
      .from("ai_readiness_scans")
      .select("domain, score, grade, score_delta, failed_checks, is_hidden, created_at", { count: "exact" })
      .or("is_hidden.is.null,is_hidden.eq.false")
      .order("created_at", { ascending: false })
      .limit(120);

    if (q) {
      query = query.ilike("domain", `%${q}%`);
    }

    const { data, count, error } = await query;

    if (!error && Array.isArray(data) && data.length > 0) {
      if (typeof count === "number") {
        totalScans = Math.max(count, data.length);
      }

      // 按域名去重取最新一条公开记录
      const latestByDomain = new Map<string, (typeof data)[number]>();
      for (const row of data) {
        if (row.is_hidden) continue;
        if (!latestByDomain.has(row.domain)) {
          latestByDomain.set(row.domain, row);
        }
      }

      const uniqueRows = Array.from(latestByDomain.values());
      recentScans = uniqueRows.slice(0, 24).map((r) => ({
        domain: r.domain,
        score: r.score,
        grade: r.grade,
        score_delta: r.score_delta ?? null,
        failed_count: Array.isArray(r.failed_checks) ? r.failed_checks.length : 0,
        created_at: r.created_at,
      }));

      analyzedDomainsCount = uniqueRows.length;
      const sumScore = uniqueRows.reduce((s, r) => s + (Number(r.score) || 0), 0);
      avgScore = Math.round(sumScore / analyzedDomainsCount);
      const gradeACount = uniqueRows.filter((r) => Number(r.score) >= 85).length;
      gradeARate = Math.round((gradeACount / analyzedDomainsCount) * 100);

      for (const r of uniqueRows) {
        if (Array.isArray(r.failed_checks)) {
          for (const fk of r.failed_checks) {
            failCounter[fk] = (failCounter[fk] || 0) + 1;
          }
        }
      }
    }
  } catch {
    // fallback if needed
  }

  const topFailedChecks = Object.entries(failCounter)
    .map(([key, failCount]) => {
      const meta = CHECK_CATALOG[key];
      if (!meta) return null;
      const failRatePct =
        analyzedDomainsCount > 0 ? Math.round((failCount / analyzedDomainsCount) * 100) : 0;
      return {
        key,
        level: meta.level,
        maxScore: meta.maxScore,
        title: meta.title,
        failCount,
        failRatePct,
      };
    })
    .filter((x): x is NonNullable<typeof x> => Boolean(x))
    .sort((a, b) => b.failCount - a.failCount || b.maxScore - a.maxScore)
    .slice(0, 6);

  return NextResponse.json({
    benchmarks: BENCHMARK_HALL_OF_FAME,
    recentScans,
    totalScans,
    insights: {
      analyzedDomainsCount,
      avgScore,
      gradeARate,
      topFailedChecks,
    },
  });
}
