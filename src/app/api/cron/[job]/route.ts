import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { kvCommand } from "@/lib/lead-backup";

/**
 * 定时触发（2026-11-09 起）：Vercel Cron（vercel.json）按点调这里，这里再用 GitHub API 手动触发对应的工作流（workflow_dispatch）。
 *
 * 起因：GitHub 自己的定时（schedule）常被推迟几个小时。2026-10/11 实测：快讯 5:30 → 8:19–11:00 才跑，
 * 日报 8:20 → 12:39–14:59，提示词库 9:17 → 14:51–15:54。手动触发不排那个队，几秒内开跑。
 * 各工作流的 schedule 留着当备用：Vercel 这边没触发成，晚几个小时还有它补上；今天已经跑过就跳过，不会一天跑两次。
 *
 * 需要（Vercel 生产环境变量）：
 * - CRON_SECRET：Vercel 调定时任务时带 `Authorization: Bearer <CRON_SECRET>`。没配就谁都不放行。
 * - GITHUB_CONTENTS_TOKEN：本仓库的 fine-grained token，要有 Actions 读写权限（原本只开了 Contents，给快讯点评用）。
 *   想分开管可以另配 GITHUB_DISPATCH_TOKEN，优先用它。
 * 每次触发的结果记进 KV `cron:dispatch:<job>`（时间、HTTP 状态、报错、token 到期日），数据日报据此告警。
 */
export const dynamic = "force-dynamic";

const REPO = "zhuyansen/jasonzhu.ai";

// 快讯三档带 cron_tier：工作流按定时档处理（今天已发布就跳过，第 3 档检查并告警），不当成手动重跑
const JOBS: Record<string, { workflow: string; inputs?: Record<string, string> }> = {
  "news-1": { workflow: "daily-news.yml", inputs: { cron_tier: "1" } },
  "news-2": { workflow: "daily-news.yml", inputs: { cron_tier: "2" } },
  "news-3": { workflow: "daily-news.yml", inputs: { cron_tier: "3" } },
  report: { workflow: "analytics-daily.yml" },
  prompts: { workflow: "opus-prompts-daily.yml" },
};

function authorized(req: Request, secret: string) {
  const got = Buffer.from(req.headers.get("authorization") ?? "");
  const want = Buffer.from(`Bearer ${secret}`);
  return got.length === want.length && timingSafeEqual(got, want);
}

type Result = { status: number; error?: string; expires?: string };

async function dispatch(workflow: string, inputs: Record<string, string> | undefined, token: string): Promise<Result> {
  const res = await fetch(`https://api.github.com/repos/${REPO}/actions/workflows/${workflow}/dispatches`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json",
      "User-Agent": "jasonzhu.ai-cron",
    },
    body: JSON.stringify({ ref: "main", ...(inputs ? { inputs } : {}) }),
    signal: AbortSignal.timeout(15_000),
  });
  // fine-grained token 有到期日时，GitHub 每个响应都带这个头（如 "2027-01-01 00:00:00 UTC"）
  const expires = res.headers.get("github-authentication-token-expiration") ?? undefined;
  return res.status === 204 ? { status: 204, expires } : { status: res.status, error: (await res.text()).slice(0, 300), expires };
}

export async function GET(req: Request, { params }: { params: Promise<{ job: string }> }) {
  const { job } = await params;
  const spec = JOBS[job];
  if (!spec) return NextResponse.json({ error: "unknown job" }, { status: 404 });
  const secret = process.env.CRON_SECRET;
  if (!secret) return NextResponse.json({ error: "CRON_SECRET not set" }, { status: 500 });
  if (!authorized(req, secret)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const token = process.env.GITHUB_DISPATCH_TOKEN || process.env.GITHUB_CONTENTS_TOKEN;
  let result: Result = { status: 0, error: "没配 GITHUB_CONTENTS_TOKEN" };
  if (token) {
    // 5xx / 429 / 连不上：重试两次。4xx（没权限、token 过期）不重试。
    // 超时也不重试：请求可能已经被 GitHub 收下，重试会多触发一次（日报多发一封、提示词库多一次部署）
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        result = await dispatch(spec.workflow, spec.inputs, token);
      } catch (e) {
        const timeout = e instanceof Error && e.name === "TimeoutError";
        result = { status: 0, error: `${timeout ? "超时" : "连不上 GitHub"}：${String(e).slice(0, 200)}` };
        if (timeout) break;
      }
      if (result.status === 204 || (result.status >= 400 && result.status < 500 && result.status !== 429)) break;
      if (attempt < 3) await new Promise((r) => setTimeout(r, 2000 * attempt));
    }
  }

  const ok = result.status === 204;
  await kvCommand([
    "SET",
    `cron:dispatch:${job}`,
    JSON.stringify({
      at: new Date().toISOString(),
      ok,
      status: result.status,
      workflow: spec.workflow,
      ...(result.error ? { error: result.error } : {}),
      ...(result.expires ? { tokenExpires: result.expires } : {}),
    }),
  ]);
  if (!ok) {
    console.error(`[cron] ${job} → ${spec.workflow} 触发失败：HTTP ${result.status} ${result.error ?? ""}`);
    return NextResponse.json({ ok, job, workflow: spec.workflow, status: result.status, error: result.error }, { status: 502 });
  }
  return NextResponse.json({ ok, job, workflow: spec.workflow });
}
