import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { kvCommand, kvEnabled } from "@/lib/lead-backup";

export const dynamic = "force-dynamic";

type SubCheck = {
  ok: boolean;
  latencyMs?: number;
  skipped?: boolean;
  error?: string;
};

async function checkSupabase(): Promise<SubCheck> {
  const start = Date.now();
  try {
    const supabase = getSupabase();
    const { error } = await Promise.race([
      supabase.from("page_views").select("slug", { count: "exact", head: true }),
      new Promise<{ error: { message: string } }>((resolve) =>
        setTimeout(() => resolve({ error: { message: "timeout (5s)" } }), 5000)
      ),
    ]);
    const latencyMs = Date.now() - start;
    if (error) {
      return { ok: false, latencyMs, error: error.message.slice(0, 160) };
    }
    return { ok: true, latencyMs };
  } catch (e) {
    return {
      ok: false,
      latencyMs: Date.now() - start,
      error: (e instanceof Error ? e.message : String(e)).slice(0, 160),
    };
  }
}

async function checkKv(): Promise<SubCheck> {
  if (!kvEnabled()) {
    return { ok: true, skipped: true };
  }
  const start = Date.now();
  const ok = await kvCommand(["PING"]);
  return {
    ok,
    latencyMs: Date.now() - start,
    ...(ok ? {} : { error: "KV PING failed" }),
  };
}

export async function GET() {
  const start = Date.now();
  const [supabase, kv] = await Promise.all([checkSupabase(), checkKv()]);
  const ok = supabase.ok && kv.ok;

  return NextResponse.json(
    {
      ok,
      status: ok ? "healthy" : "degraded",
      latencyMs: Date.now() - start,
      checks: { supabase, kv },
      ts: new Date().toISOString(),
    },
    {
      status: ok ? 200 : 503,
      headers: { "Cache-Control": "no-store, max-age=0" },
    }
  );
}
