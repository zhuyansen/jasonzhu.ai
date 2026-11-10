import { NextRequest, NextResponse } from "next/server";
import { verifyXunhupayNotify, type XunhupayNotifyPayload } from "@/lib/xunhupay";
import { randomUUID } from "crypto";
import { lockOrder, readOrder, saveOrder, unlockOrder, type CheckoutOrder } from "@/lib/checkout-orders";
import { inviteToTeam, GITHUB_ORG } from "@/lib/github-invite";
import { issueProKey } from "@/lib/agentskillshub";
import { sendActivationEmail, sendOpsAlert } from "@/lib/resend";
import { genClubCode, recordActivatedClubCode } from "@/lib/club-codes";
import { getSupabase } from "@/lib/supabase";
import { recordReferral } from "@/lib/referrals";

export const dynamic = "force-dynamic";

/**
 * 虎皮椒付款成功回调。必须原样返回文本 "success"，否则虎皮椒会重试最多 6 次——
 * 利用这个机制：只有 GitHub 邀请 + Hub Key 发放 + 订单落库全部成功才返回 success，
 * 任何一步失败就返回非 success，让虎皮椒帮我们自动重试，跟 club-activate 同一个思路。
 *
 * 2026-11-10 补的几条（以前都会变成「钱收了、没发货、没人知道」）：
 *   - KV 读不到订单 ≠ 订单不存在：读不到返回 500 让虎皮椒重试；真的没有这个订单才确认掉，并给 Jason 发告警。
 *   - 发 Key 失败给 Jason 告警一次；「已发过码」（上次其实发成功了、只是超时没拿到）重试也没用，告警后确认掉、转人工。
 *   - 同一订单同一时刻只处理一个回调（锁），防止后到的把 completed 盖回 paid。
 *   - 收过钱的订单在 KV 留 30 天（以前 24 小时就没了）。
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

  const orderId = payload.trade_order_id;
  const first = await readOrder(orderId);
  if (!first.ok) {
    console.error("[xunhupay] order store unavailable, asking for a retry:", orderId);
    return new NextResponse("order store unavailable, retry me", { status: 500 });
  }
  if (!first.order) {
    console.error("[xunhupay] notify for unknown order:", orderId);
    // 订单真的不在了（比如下单超过 24 小时才付款）：重试也没用，但钱已经收了，必须有人知道
    const alert = await sendOpsAlert({
      subject: `⚠️ 虎皮椒收到一笔找不到订单的付款 ${orderId}`,
      lines: [
        "虎皮椒回调说这笔已支付，但 KV 里没有这个订单（多半是下单超过 24 小时才付款，订单已过期）。会员没有开通，需要人工处理。",
        `订单号：${orderId}`,
        `金额：${payload.total_fee}`,
        `虎皮椒交易号：${payload.transaction_id || "—"} / ${payload.open_order_id || "—"}`,
        "去虎皮椒后台按订单号查付款人，核实后手动发兑换码或退款。",
      ],
    });
    // 告警没发出去就先不确认，让虎皮椒再来一次（下次再试着告警）
    if (!alert.ok) return new NextResponse("alert failed, retry me", { status: 500 });
    return new NextResponse("success");
  }

  // 幂等：已经完整开通过，直接确认
  if (first.order.status === "completed") {
    return new NextResponse("success");
  }

  const lockOwner = randomUUID();
  if (!(await lockOrder(orderId, lockOwner))) {
    console.error("[xunhupay] order is being processed by another notify (or lock unavailable):", orderId);
    return new NextResponse("busy, retry me", { status: 500 });
  }

  let order: CheckoutOrder = first.order;
  try {
    // 拿到锁后重读一遍：等锁的这会儿，上一个回调可能已经处理完了
    const fresh = await readOrder(orderId);
    if (!fresh.ok || !fresh.order) {
      return new NextResponse("order store unavailable, retry me", { status: 500 });
    }
    order = fresh.order;
    if (order.status === "completed") {
      return new NextResponse("success");
    }

    // GitHub 用户名是可选的：没填就跳过邀请。
    // 邀请失败也绝不阻塞发货——"用户名不存在"这类是永久错误，重试也救不回来
    // （7/19 事故：用户填错 GitHub 名，重试 6 次全败，付了钱什么都没收到）。
    // 先把会员开通，GitHub 之后去会员中心补填（/api/dashboard/link-github）。
    let github = order.github;
    let inviteError: string | undefined;
    if (github) {
      const invite = await inviteToTeam(github);
      if (!invite.ok) {
        inviteError = invite.error;
        github = "";
        console.error("[xunhupay] github invite failed (non-fatal):", order.tradeOrderId, invite.error);
      }
    }

    const note = order.amount <= 199 ? "早鸟199" : "标准365";
    const issued = await issueProKey(order.email, note, order.tradeOrderId);
    if (!issued.ok) {
      console.error("[xunhupay] issue pro key failed:", order.tradeOrderId, issued.error);
      const now = new Date().toISOString();
      const facts = [
        `订单号：${order.tradeOrderId}`,
        `邮箱：${order.email} · 微信：${order.wechat || "—"} · 金额：${order.amount}`,
        `报错：${issued.error}`,
      ];
      if (issued.alreadyIssued) {
        // 上一次其实发成功了（超时没拿到 Key）：再重试多少次都一样，转人工
        const alert = order.stuckAlertedAt
          ? { ok: true }
          : await sendOpsAlert({
              subject: `🚨 已付款没发货，需要人工处理 ${order.tradeOrderId}`,
              lines: [
                "这笔订单已付款，Hub Key 在 agentskillshub 那边已经发过（上次请求超时，没拿到明文 Key），自动重试拿不回来。会员没有开通，用户没收到邮件。",
                ...facts,
                "处理：去 agentskillshub 的 member_keys 表按 order_id 作废旧 Key、重发一个，再手动给用户发兑换码。",
              ],
            });
        await saveOrder({ ...order, status: "paid", error: issued.error, alertedAt: order.alertedAt || now, stuckAlertedAt: alert.ok ? order.stuckAlertedAt || now : undefined });
        if (!alert.ok) return new NextResponse("alert failed, retry me", { status: 500 });
        return new NextResponse("success");
      }
      // 普通失败：虎皮椒会重试；第一次失败就告诉 Jason，免得 6 次都失败后没人知道
      let alertedAt = order.alertedAt;
      if (!alertedAt) {
        const alert = await sendOpsAlert({
          subject: `⚠️ 已付款，发 Hub Key 失败（虎皮椒会重试） ${order.tradeOrderId}`,
          lines: [
            "这笔订单已付款，但发 Hub Key 失败。虎皮椒会自动重试几次；过半小时这位用户还没收到开通邮件，就需要人工处理。",
            ...facts,
          ],
        });
        if (alert.ok) alertedAt = now;
      }
      await saveOrder({ ...order, status: "paid", error: issued.error, alertedAt });
      return new NextResponse("issue key failed, retry me", { status: 500 });
    }

    const code = genClubCode();
    const activatedAt = new Date().toISOString();
    const expiresAtIso = new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString();
    const activation = {
      github: github || null,
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
        github_username: github || null,
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

    // 分销记账（幂等，失败不阻塞开通）
    if (order.ref && order.refEmail) {
      try {
        await recordReferral({
          orderId: order.tradeOrderId,
          refCode: order.ref,
          referrerEmail: order.refEmail,
          buyerEmail: order.email,
          amount: order.amount,
        });
      } catch (e) {
        console.error("[xunhupay] referral record failed (non-fatal):", order.tradeOrderId, e);
      }
    }

    const emailResult = await sendActivationEmail({
      to: order.email,
      code,
      github,
      hubKey: issued.key,
      org: GITHUB_ORG,
      expiresAt: expiresAtIso.slice(0, 10),
    });
    if (!emailResult.ok) {
      console.error("[xunhupay] activation email failed (non-fatal):", order.tradeOrderId, emailResult.error);
    }

    const completed: CheckoutOrder = {
      ...order,
      status: "completed",
      hubKey: issued.key,
      code,
      paidAt: activatedAt,
      // GitHub 邀请失败时记录原因，但不影响 completed 状态；用户可在会员中心补填
      error: inviteError,
      emailError: emailResult.ok ? undefined : emailResult.error,
      resendId: emailResult.resendId,
    };
    // 订单记不成 completed 的话，付款页会一直转圈，下一次回调还会走到「已发过码」。多试两次；
    // 还不行也不能让虎皮椒重试（Key 已经发了），告警后确认掉。
    let saved = false;
    for (let i = 0; i < 3 && !saved; i++) saved = await saveOrder(completed);
    if (!saved) {
      console.error("[xunhupay] could not record the order as completed:", order.tradeOrderId);
      await sendOpsAlert({
        subject: `⚠️ 会员已开通，但订单状态没记上 ${order.tradeOrderId}`,
        lines: [
          "这笔订单的会员已经开通" + (emailResult.ok ? "、开通邮件已发" : "，但开通邮件也没发出去") + "，只是 KV 里的订单状态没更新成 completed：用户的付款页不会自动跳到成功。",
          `订单号：${order.tradeOrderId} · 邮箱：${order.email} · 兑换码：${code}`,
        ],
      });
    }

    return new NextResponse("success");
  } catch (err) {
    console.error("[xunhupay] notify processing error:", order.tradeOrderId, err);
    return new NextResponse("internal error, retry me", { status: 500 });
  } finally {
    await unlockOrder(orderId, lockOwner);
  }
}
