import { NextRequest, NextResponse } from "next/server";
import { getOrder } from "@/lib/checkout-orders";

export const dynamic = "force-dynamic";

/** 前端轮询这个接口判断二维码有没有被扫码支付完成（微信扫码没有客户端跳转信号）。 */
export async function GET(request: NextRequest) {
  const tradeOrderId = request.nextUrl.searchParams.get("order") || "";
  if (!tradeOrderId) {
    return NextResponse.json({ error: "缺少订单号" }, { status: 400 });
  }

  const order = await getOrder(tradeOrderId);
  if (!order) {
    return NextResponse.json({ status: "not_found" });
  }

  if (order.status === "completed") {
    return NextResponse.json({ status: "completed", github: order.github, hubKey: order.hubKey });
  }
  if (order.status === "paid") {
    // 已扣款，但发放链路还在重试中
    return NextResponse.json({ status: "processing" });
  }
  return NextResponse.json({ status: order.status });
}
