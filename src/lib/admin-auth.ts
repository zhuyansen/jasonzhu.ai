import { NextRequest, NextResponse } from "next/server";

export function checkAuth(request: NextRequest): NextResponse | null {
  const authHeader = request.headers.get("authorization");
  const password = process.env.ADMIN_PASSWORD || process.env.ADMIN_PWD;

  if (!password) {
    return NextResponse.json({ error: "Admin not configured" }, { status: 503 });
  }

  if (!authHeader || authHeader !== `Bearer ${password}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return null; // Auth OK
}
