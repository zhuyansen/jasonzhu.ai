import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { rateLimit } from "@/lib/rate-limit";

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
    const ALLOWED = ["https://jasonzhu.ai", "https://www.jasonzhu.ai", "http://localhost:3000"];
    const isOriginOk = ALLOWED.some((o) => origin === o || referer.startsWith(o + "/"));
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

    // Insert new subscriber
    const { error } = await supabase.from("subscribers").insert({
      email: email.toLowerCase(),
      source: source || "website",
      subscribed_at: new Date().toISOString(),
    });

    if (error) {
      console.error("Supabase insert error:", error);
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
