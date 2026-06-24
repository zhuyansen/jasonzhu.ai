import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { rateLimit } from "@/lib/rate-limit";
import { backupLead } from "@/lib/lead-backup";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const rateLimited = rateLimit(request, { limit: 10, prefix: "subscribe" });
  if (rateLimited) return rateLimited;

  try {
    const { email, source, website, ts } = await request.json();

    // Honeypot: real users never fill this hidden field. Pretend success.
    if (website && String(website).trim() !== "") {
      console.warn("[subscribe] honeypot triggered", { email, source });
      return NextResponse.json({
        success: true,
        message: "订阅成功！你现在可以下载完整手册了",
        alreadySubscribed: false,
      });
    }

    // Origin / Referer guard: only accept submissions from our own site
    const origin = request.headers.get("origin") || "";
    const referer = request.headers.get("referer") || "";
    const ALLOWED = ["https://jasonzhu.ai", "https://www.jasonzhu.ai"];
    // 本地开发端口不固定（preview server 随机分配），放行任意 localhost 端口
    const isLocalhost =
      /^http:\/\/localhost(:\d+)?$/.test(origin) ||
      /^http:\/\/localhost(:\d+)?\//.test(referer);
    const isOriginOk =
      isLocalhost || ALLOWED.some((o) => origin === o || referer.startsWith(o + "/"));
    if (!isOriginOk) {
      console.warn("[subscribe] origin blocked", { origin, referer, email, source });
      return NextResponse.json({
        success: true,
        message: "订阅成功！你现在可以下载完整手册了",
        alreadySubscribed: false,
      });
    }

    // Time-trap: real form mounts and POSTs include a timestamp.
    // Missing ts = bot posting directly to API; <1.5s = bot rendered but auto-fills.
    if (typeof ts !== "number") {
      console.warn("[subscribe] missing ts (bot)", { email, source });
      return NextResponse.json({
        success: true,
        message: "订阅成功！你现在可以下载完整手册了",
        alreadySubscribed: false,
      });
    }
    const elapsedMs = Date.now() - ts;
    if (elapsedMs < 1500) {
      console.warn("[subscribe] timetrap triggered", { email, source, elapsedMs });
      return NextResponse.json({
        success: true,
        message: "订阅成功！你现在可以下载完整手册了",
        alreadySubscribed: false,
      });
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "请输入有效的邮箱地址" },
        { status: 400 }
      );
    }

    let supabase;
    try {
      supabase = getSupabase();
    } catch {
      return NextResponse.json(
        { error: "服务暂未配置，请联系管理员" },
        { status: 503 }
      );
    }

    // Check if already subscribed
    const { data: existing } = await supabase
      .from("subscribers")
      .select("id")
      .eq("email", email.toLowerCase())
      .single();

    if (existing) {
      return NextResponse.json({
        success: true,
        message: "你已经订阅过了，请查收邮件获取手册链接",
        alreadySubscribed: true,
      });
    }

    // Insert new subscriber (primary: Supabase)
    const { error } = await supabase.from("subscribers").insert({
      email: email.toLowerCase(),
      source: source || "website",
      subscribed_at: new Date().toISOString(),
    });

    // 双写：独立 KV 备份（best-effort，不阻塞成功路径；Supabase 整库被限制时兜底）
    const backedUp = await backupLead(email, source);

    if (error) {
      console.error("Supabase insert error:", error);
      if (backedUp) {
        // 主写失败但 KV 兜住了线索：照常解锁 PDF，绝不丢线索 / 不显示「订阅失败」
        console.warn("[subscribe] supabase down, lead captured via KV backup", { email, source });
        return NextResponse.json({
          success: true,
          message: "订阅成功！你现在可以下载完整手册了",
          alreadySubscribed: false,
        });
      }
      return NextResponse.json(
        { error: "订阅失败，请稍后重试" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "订阅成功！你现在可以下载完整手册了",
      alreadySubscribed: false,
    });
  } catch {
    return NextResponse.json(
      { error: "服务器错误，请稍后重试" },
      { status: 500 }
    );
  }
}
