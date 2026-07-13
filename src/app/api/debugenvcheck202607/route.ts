import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// 临时诊断用，排查 RESEND_API_KEY 为什么线上读不到，用完即删。
export async function GET() {
  const key = process.env.RESEND_API_KEY;
  return NextResponse.json({
    hasKey: Boolean(key),
    keyLength: key?.length ?? 0,
    keyPrefix: key?.slice(0, 4) ?? null,
    nodeEnv: process.env.NODE_ENV,
    vercelEnv: process.env.VERCEL_ENV,
  });
}
