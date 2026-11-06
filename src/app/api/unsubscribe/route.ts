import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { rateLimit } from "@/lib/rate-limit";
import { backupUnsubscribe, clearPendingUnsubscribe } from "@/lib/lead-backup";
import { isSubscriberId, verifyUnsubscribeToken } from "@/lib/unsubscribe-token";

export const dynamic = "force-dynamic";

/**
 * 退订（2026-11-06 起），链接签名见 src/lib/unsubscribe-token.ts。一次退订 = 快讯和周报都不再发（subscribers.unsubscribed_at）。
 *
 * POST ?id=&t=      邮件客户端的一键退订：Gmail / Yahoo 直接 POST 邮件头 List-Unsubscribe 里的地址（RFC 8058，
 *                    body 是 List-Unsubscribe=One-Click，不带 cookie）→ 200 纯文本，不跳转
 * POST（表单）       退订页上的按钮：body 带 id、t、l、action=unsubscribe|resubscribe → 303 回退订页显示结果
 * GET ?id=&t=&l=    不支持一键退订的客户端会在浏览器里打开 List-Unsubscribe 的地址 → 303 到确认页。
 *                    GET 绝不退订：企业邮件网关、Outlook 安全链接会预先打开邮件里的每个链接，GET 就退订会误退一批人。
 *
 * 写库失败时记进 KV 兜底（lead-backup.ts），照常显示已退订；两边都写不进才报错。
 */

type Action = "unsubscribe" | "resubscribe";
type UnsubscribeOutcome ="unsubscribed" | "resubscribed" | "invalid" | "error";

const NO_STORE = { "Cache-Control": "no-store" };

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  return NextResponse.redirect(pageUrl(request, sp.get("l"), sp.get("id"), sp.get("t")), { status: 303, headers: NO_STORE });
}

export async function POST(request: NextRequest) {
  const limited = rateLimit(request, { limit: 60, prefix: "unsubscribe" });
  if (limited) return limited;

  const sp = request.nextUrl.searchParams;
  // 一键退订的 body 是 urlencoded 或 multipart，id / t 在 URL 里；退订页的表单把它们放在 body 里
  const form = await request.formData().catch(() => null);
  const field = (name: string) => {
    const value = form?.get(name);
    return typeof value === "string" ? value : sp.get(name);
  };
  const id = field("id");
  const t = field("t");
  const fromPage = typeof form?.get("action") === "string";
  const action: Action = form?.get("action") === "resubscribe" ? "resubscribe" : "unsubscribe";

  const outcome = await apply(id, t, action);

  if (fromPage) {
    return NextResponse.redirect(pageUrl(request, field("l"), id, t, outcome), { status: 303, headers: NO_STORE });
  }
  const reply = {
    unsubscribed: [200, "Unsubscribed. You will no longer receive JasonZhu.AI newsletters."],
    resubscribed: [200, "Resubscribed."],
    invalid: [400, "Invalid unsubscribe link."],
    error: [503, "Temporarily unavailable. Please try again later."],
  } as const;
  const [status, text] = reply[outcome];
  return new NextResponse(text, { status, headers: { ...NO_STORE, "Content-Type": "text/plain; charset=utf-8" } });
}

async function apply(id: string | null, t: string | null, action: Action): Promise<UnsubscribeOutcome> {
  if (!isSubscriberId(id) || !t) return "invalid";

  let supabase;
  try {
    supabase = getSupabase();
  } catch {
    return "error";
  }

  // 验签要用库里的邮箱；读不出来就验不了，也没法兜底
  const { data: row, error } = await supabase.from("subscribers").select("email, unsubscribed_at").eq("id", id).maybeSingle();
  if (error) {
    console.error("[unsubscribe] lookup failed", { id, error: error.message });
    return "error";
  }
  if (!row || !(await verifyUnsubscribeToken(row.email, t))) return "invalid";

  if (action === "resubscribe") {
    const { error: updateError } = await supabase.from("subscribers").update({ unsubscribed_at: null }).eq("id", id);
    if (updateError) {
      console.error("[unsubscribe] resubscribe failed", { id, error: updateError.message });
      return "error";
    }
    await clearPendingUnsubscribe(id);
    return "resubscribed";
  }

  if (row.unsubscribed_at) return "unsubscribed"; // 退订过了，再点一次照样显示成功
  const { error: updateError } = await supabase
    .from("subscribers")
    .update({ unsubscribed_at: new Date().toISOString() })
    .eq("id", id)
    .is("unsubscribed_at", null);
  if (!updateError) return "unsubscribed";

  console.error("[unsubscribe] update failed, trying KV backup", { id, error: updateError.message });
  return (await backupUnsubscribe(id)) ? "unsubscribed" : "error";
}

function pageUrl(request: NextRequest, rawLang: string | null, id: string | null, t: string | null, outcome?: UnsubscribeOutcome) {
  const lang = rawLang === "en" ? "en" : "zh";
  const url = new URL(`/${lang}/unsubscribe`, request.url);
  if (id) url.searchParams.set("id", id);
  if (t) url.searchParams.set("t", t);
  if (outcome) url.searchParams.set("s", outcome);
  return url;
}
