import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { rateLimit } from "@/lib/rate-limit";
import { sendClubApplicationNotification } from "@/lib/resend";

export const dynamic = "force-dynamic";

// GoSail Club 入会申请。容灾与 /api/subscribe 同款：
// Supabase 主写（club_applications 表）+ Vercel KV 兜底（list: pending_club_applications）。
const KV_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

async function backupApplication(payload: Record<string, unknown>): Promise<boolean> {
  if (!KV_URL || !KV_TOKEN) return false;
  try {
    const value = JSON.stringify({ ...payload, ts: new Date().toISOString() });
    const res = await fetch(
      `${KV_URL}/rpush/pending_club_applications/${encodeURIComponent(value)}`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${KV_TOKEN}` },
        signal: AbortSignal.timeout(5000),
      }
    );
    return res.ok;
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  const rateLimited = rateLimit(request, { limit: 5, prefix: "club-apply" });
  if (rateLimited) return rateLimited;

  try {
    const body = await request.json();
    const { name, wechat, email, role, project, tier, needs, referral, website, ts } = body;

    // 反 bot 三件套（与 subscribe 一致，bot 一律静默成功）
    if (website && String(website).trim() !== "") {
      console.warn("[club-apply] honeypot", { email });
      return NextResponse.json({ success: true });
    }
    const origin = request.headers.get("origin") || "";
    const referer = request.headers.get("referer") || "";
    const ALLOWED = ["https://jasonzhu.ai", "https://www.jasonzhu.ai"];
    const isLocalhost =
      /^http:\/\/localhost(:\d+)?$/.test(origin) ||
      /^http:\/\/localhost(:\d+)?\//.test(referer);
    const isOriginOk =
      isLocalhost || ALLOWED.some((o) => origin === o || referer.startsWith(o + "/"));
    if (!isOriginOk) {
      console.warn("[club-apply] origin blocked", { origin, email });
      return NextResponse.json({ success: true });
    }
    if (typeof ts !== "number" || Date.now() - ts < 3000) {
      console.warn("[club-apply] timetrap", { email });
      return NextResponse.json({ success: true });
    }

    // 校验必填
    if (!name || !wechat || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !tier) {
      return NextResponse.json({ error: "请完整填写必填项" }, { status: 400 });
    }

    const record = {
      name: String(name).slice(0, 100),
      wechat: String(wechat).slice(0, 100),
      email: String(email).toLowerCase().slice(0, 200),
      role: String(role || "").slice(0, 50),
      project: String(project || "").slice(0, 2000),
      tier: String(tier).slice(0, 20),
      needs: String(needs || "").slice(0, 2000),
      referral: String(referral || "").slice(0, 100),
    };

    // 主写 Supabase
    let sbOk = false;
    try {
      const supabase = getSupabase();
      const { error } = await supabase.from("club_applications").insert({
        ...record,
        created_at: new Date().toISOString(),
      });
      sbOk = !error;
      if (error) console.error("[club-apply] supabase error:", error.message);
    } catch (e) {
      console.error("[club-apply] supabase unavailable:", e);
    }

    // KV 兜底（best-effort，双保险）
    const kvOk = await backupApplication(record);

    if (!sbOk && !kvOk) {
      return NextResponse.json({ error: "提交失败，请稍后重试" }, { status: 500 });
    }

    // 通知 Jason（best-effort，失败不影响申请提交本身）
    const notified = await sendClubApplicationNotification(record);
    if (!notified.ok) {
      console.error("[club-apply] notification email failed:", notified.error);
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "服务器错误，请稍后重试" }, { status: 500 });
  }
}
