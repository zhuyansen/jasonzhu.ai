import { NextRequest, NextResponse } from "next/server";

// ── In-memory session store ──
// Map<token, expiresAt>
const sessions = new Map<string, number>();

// Session lifetime: 2 hours
const SESSION_TTL_MS = 2 * 60 * 60 * 1000;

// ── Rate limiting store ──
// Map<ip, { count, resetAt }>
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 5;

// ── Helpers ──

/** SHA-256 hash a string and return hex digest */
export async function sha256(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** Get the configured admin password (raw) */
function getAdminPassword(): string {
  return (process.env.ADMIN_PASSWORD || process.env.ADMIN_PWD || "").trim();
}

/** Verify a plaintext password against the configured admin password using constant-time-ish hash comparison */
export async function verifyPassword(plaintext: string): Promise<boolean> {
  const configured = getAdminPassword();
  if (!configured) return false;

  const inputHash = await sha256(plaintext);
  const configuredHash = await sha256(configured);

  // Compare hashes (both are hex strings of equal length)
  if (inputHash.length !== configuredHash.length) return false;
  let mismatch = 0;
  for (let i = 0; i < inputHash.length; i++) {
    mismatch |= inputHash.charCodeAt(i) ^ configuredHash.charCodeAt(i);
  }
  return mismatch === 0;
}

// ── Session management ──

/** Create a new session token */
export function createSession(): string {
  // Clean expired sessions first
  const now = Date.now();
  for (const [token, expiresAt] of sessions) {
    if (expiresAt < now) sessions.delete(token);
  }

  const token = crypto.randomUUID();
  sessions.set(token, now + SESSION_TTL_MS);
  return token;
}

/** Verify a session token is valid and not expired */
export function verifySession(token: string): boolean {
  const expiresAt = sessions.get(token);
  if (!expiresAt) return false;
  if (Date.now() > expiresAt) {
    sessions.delete(token);
    return false;
  }
  return true;
}

/** Invalidate a session token */
export function revokeSession(token: string): void {
  sessions.delete(token);
}

// ── Rate limiting ──

/** Check rate limit for an IP. Returns null if OK, or a NextResponse if blocked. */
export function checkRateLimit(ip: string): NextResponse | null {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    // New window
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return null;
  }

  entry.count++;
  if (entry.count > RATE_LIMIT_MAX) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    return NextResponse.json(
      { error: "Too many login attempts. Try again later." },
      {
        status: 429,
        headers: { "Retry-After": String(retryAfter) },
      }
    );
  }

  return null;
}

// ── Auth middleware (for protected API routes) ──

/** Check if a request carries a valid session token via Bearer header. */
export function checkAuth(request: NextRequest): NextResponse | null {
  const password = getAdminPassword();
  if (!password || password.length === 0) {
    return NextResponse.json({ error: "Admin not configured" }, { status: 503 });
  }

  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = authHeader.slice(7);
  if (!verifySession(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return null; // Auth OK
}
