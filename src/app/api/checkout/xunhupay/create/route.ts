import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { rateLimit } from "@/lib/rate-limit";
import { createXunhupayOrder, type XunhupayChannel } from "@/lib/xunhupay";
import { saveOrder } from "@/lib/checkout-orders";
import { getSupabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

const SITE_URL = "https://jasonzhu.ai";

// 启航版早鸟：¥199，2026-07-20 24:00 前；之后恢复 ¥365。跟 ClubClient.tsx 的 TIERS 保持一致。
const EARLY_BIRD_DEADLINE = new Date("2026-07-21T00:00:00+08:00").getTime();
function starterPrice(): number {
  return Date.now() < EARLY_BIRD_DEADLINE ? 199 : 365;
}

export async function POST(request: NextRequest) {
  const rateLimited = rateLimit(request, { limit: 8, prefix: "xhpay-create" });
  if (rateLimited) return rateLimited;

  try {
    const { email, github, channel, website, ts } = await request.json();

    // 反 bot：跟站内其它表单同款
    if (website && String(website).trim() !== "") {
      return NextResponse.json({ error: "创建订单失败" }, { status: 400 });
    }
    if (typeof ts !== "number" || Date.now() - ts < 1500) {
      return NextResponse.json({ error: "创建订单失败，请刷新重试" }, { status: 400 });
    }

    const emailStr = String(email || "").trim().toLowerCase();
    const ghUser = String(github || "").trim().replace(/^@/, "");
    const channelStr = String(channel || "") as XunhupayChannel;

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailStr)) {
      return NextResponse.json({ error: "请输入有效邮箱" }, { status: 400 });
    }
    // GitHub 用户名可选：没有 GitHub 的人不该被挡在付款外面，之后能在会员中心补填
    if (ghUser && !/^[a-zA-Z0-9-]{1,39}$/.test(ghUser)) {
      return NextResponse.json({ error: "GitHub 用户名格式不正确" }, { status: 400 });
    }
    if (channelStr !== "wechat" && channelStr !== "alipay") {
      return NextResponse.json({ error: "支付渠道不正确" }, { status: 400 });
    }

    // 下单前查一下这个邮箱是不是已经是会员了，别让人重复付款
    try {
      const supabase = getSupabase();
      const { data: existing } = await supabase
        .from("member_codes")
        .select("code")
        .eq("email", emailStr)
        .eq("status", "activated")
        .limit(1)
        .maybeSingle();
      if (existing) {
        return NextResponse.json(
          { error: "这个邮箱已经是 GoSail Club 会员了，去登录会员中心查看吧", alreadyMember: true },
          { status: 409 }
        );
      }
    } catch {
      /* 查重是尽力而为，查询失败不阻塞正常付款 */
    }

    const tradeOrderId = `xh${Date.now()}${crypto.randomBytes(4).toString("hex")}`;
    const amount = starterPrice();

    const order = await createXunhupayOrder({
      channel: channelStr,
      tradeOrderId,
      totalFee: amount,
      title: "GoSail Club 启航版",
      notifyUrl: `${SITE_URL}/api/checkout/xunhupay/notify`,
      returnUrl: `${SITE_URL}/zh/club/checkout/success?order=${tradeOrderId}`,
    });

    if (!order.ok) {
      return NextResponse.json({ error: order.error }, { status: 502 });
    }

    const saved = await saveOrder({
      tradeOrderId,
      email: emailStr,
      github: ghUser,
      channel: channelStr,
      amount,
      status: "pending",
      createdAt: new Date().toISOString(),
    });
    if (!saved) {
      return NextResponse.json({ error: "订单存储失败，请稍后重试或联系 Jason" }, { status: 502 });
    }

    return NextResponse.json({
      success: true,
      tradeOrderId,
      amount,
      qrUrl: order.qrUrl,
      payUrl: order.payUrl,
    });
  } catch {
    return NextResponse.json({ error: "服务器错误，请稍后重试" }, { status: 500 });
  }
}
