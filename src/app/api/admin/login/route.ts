import { NextRequest, NextResponse } from "next/server";
import {
  verifyPassword,
  createSession,
  checkRateLimit,
  revokeSession,
  verifySession,
} from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  // Rate limit by IP
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  const rateLimited = checkRateLimit(ip);
  if (rateLimited) return rateLimited;

  let body: { password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { password } = body;
  if (!password || typeof password !== "string") {
    return NextResponse.json({ error: "Password required" }, { status: 400 });
  }

  const valid = await verifyPassword(password);
  if (!valid) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  const token = createSession();
  return NextResponse.json({ token });
}

/** DELETE /api/admin/login — logout (revoke session) */
export async function DELETE(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    if (verifySession(token)) {
      revokeSession(token);
    }
  }
  return NextResponse.json({ ok: true });
}
