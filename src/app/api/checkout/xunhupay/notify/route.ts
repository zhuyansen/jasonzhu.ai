import { NextRequest, NextResponse } from "next/server";
import { verifyXunhupayNotify, type XunhupayNotifyPayload } from "@/lib/xunhupay";
import { getOrder, saveOrder } from "@/lib/checkout-orders";
import { inviteToTeam, GITHUB_ORG } from "@/lib/github-invite";
import { issueProKey } from "@/lib/agentskillshub";
import { sendActivationEmail } from "@/lib/resend";
import { genClubCode, recordActivatedClubCode } from "@/lib/club-codes";
import { getSupabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

/**
 * 虎皮椒付款成功回调。必须原样返回文本 "success"，否则虎皮椒会重试最多 6 次——
 * 利用这个机制：只有 GitHub 邀请 + Hub Key 发放 + 订单落库全部成功才返回 success，
 * 任何一步失败就返回非 success，让虎皮椒帮我们自动重试，跟 club-activate 同一个思路。
 */
export async function POST(request: NextRequest) {
  let payload: XunhupayNotifyPayload;
  try {
    const form = await request.formData();
    payload = Object.fromEntries(form.entries()) as unknown as XunhupayNotifyPayload;
  } catch {
    return new NextResponse("bad request", { status: 400 });
  }

  if (!payload.trade_order_id || !verifyXunhupayNotify(payload)) {
    console.error("[xunhupay] invalid notify signature or missing order id", payload?.trade_order_id);
    return new NextResponse("invalid signature", { status: 400 });
  }

  // 只处理"已支付"，退款相关状态先原样确认，不做业务处理
  if (payload.status !== "OD") {
    return new NextResponse("success");
  }

  const order = await getOrder(payload.trade_order_id);
  if (!order) {
    console.error("[xunhupay] notify for unknown order:", payload.trade_order_id);
    // 订单丢了重试也没用，确认掉避免虎皮椒白重试 6 次
    return new NextResponse("success");
  }

  // 幂等：已经完整开通过，直接确认
  if (order.status === "completed") {
    return new NextResponse("success");
  }

  try {
    // GitHub 用户名是可选的：没填就跳过邀请，别把付款流程卡在这一步上
    if (order.github) {
      const invite = await inviteToTeam(order.github);
      if (!invite.ok) {
        await saveOrder({ ...order, status: "paid", error: invite.error });
        console.error("[xunhupay] github invite failed:", order.tradeOrderId, invite.error);
        return new NextResponse("github invite failed, retry me", { status: 500 });
      }
    }

    const note = order.amount <= 199 ? "早鸟199" : "标准365";
    const issued = await issueProKey(order.email, note, order.tradeOrderId);
    if (!issued.ok) {
      await saveOrder({ ...order, status: "paid", error: issued.error });
      console.error("[xunhupay] issue pro key failed:", order.tradeOrderId, issued.error);
      return new NextResponse("issue key failed, retry me", { status: 500 });
    }

    const code = genClubCode();
    const activatedAt = new Date().toISOString();
    const expiresAtIso = new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString();
    const activation = {
      github: order.github || null,
      email: order.email,
      wechat: order.wechat,
      hub_key: issued.key,
      activated_at: activatedAt,
      expires_at: expiresAtIso,
    };

    // 生成正式兑换码并落库，跟人工激活走同一套记录格式——
    // 之后用户用同邮箱登录 jasonzhu.ai 时，dashboard 的 claimLegacyActivation() 会按邮箱自动认领这条记录。
    await recordActivatedClubCode(code, activation);
    try {
      const supabase = getSupabase();
      // wechat 列可能还没建（member_codes 表原来没有这个字段），insert 失败就静默——
      // KV 那份（club_activations 流水 + club_code 记录）已经是权威来源，不阻塞主流程。
      await supabase.from("member_codes").insert({
        code,
        github_username: order.github || null,
        email: order.email,
        wechat: order.wechat,
        hub_key: issued.key,
        activated_at: activatedAt,
        expires_at: expiresAtIso,
        status: "activated",
      });
    } catch (e) {
      console.error("[xunhupay] member_codes insert failed (non-fatal):", order.tradeOrderId, e);
    }

    const emailResult = await sendActivationEmail({
      to: order.email,
      code,
      github: order.github,
      hubKey: issued.key,
      org: GITHUB_ORG,
      expiresAt: expiresAtIso.slice(0, 10),
    });
    if (!emailResult.ok) {
      console.error("[xunhupay] activation email failed (non-fatal):", order.tradeOrderId, emailResult.error);
    }

    await saveOrder({
      ...order,
      status: "completed",
      hubKey: issued.key,
      code,
      paidAt: activatedAt,
      emailError: emailResult.ok ? undefined : emailResult.error,
      resendId: emailResult.resendId,
    });

    return new NextResponse("success");
  } catch (err) {
    console.error("[xunhupay] notify processing error:", order.tradeOrderId, err);
    return new NextResponse("internal error, retry me", { status: 500 });
  }
}
