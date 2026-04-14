import { NextRequest, NextResponse } from "next/server";

interface RateLimitEntry {
  timestamps: number[];
}

const rateLimitMap = new Map<string, RateLimitEntry>();

// Clean up expired entries every 5 minutes
const CLEANUP_INTERVAL = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanup(windowMs: number) {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;

  for (const [key, entry] of rateLimitMap) {
    entry.timestamps = entry.timestamps.filter((t) => now - t < windowMs);
    if (entry.timestamps.length === 0) {
      rateLimitMap.delete(key);
    }
  }
}

function getIP(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

/**
 * Simple in-memory sliding window rate limiter.
 * Returns null if the request is allowed, or a 429 NextResponse if rate limited.
 */
export function rateLimit(
  request: NextRequest,
  {
    limit = 30,
    windowMs = 60 * 1000,
    prefix = "global",
  }: { limit?: number; windowMs?: number; prefix?: string } = {}
): NextResponse | null {
  cleanup(windowMs);

  const ip = getIP(request);
  const key = `${prefix}:${ip}`;
  const now = Date.now();

  const entry = rateLimitMap.get(key) || { timestamps: [] };

  // Remove timestamps outside the current window
  entry.timestamps = entry.timestamps.filter((t) => now - t < windowMs);

  if (entry.timestamps.length >= limit) {
    return NextResponse.json(
      { error: "Too many requests, please try again later." },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil(windowMs / 1000)),
        },
      }
    );
  }

  entry.timestamps.push(now);
  rateLimitMap.set(key, entry);

  return null;
}
