import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { rateLimit } from "@/lib/rate-limit";
import { backupLead, clearPendingUnsubscribe } from "@/lib/lead-backup";
import { isLeadMagnet, LINK_TTL_DAYS, type LinkLang } from "@/lib/download-link";
import { overLimit, sendLeadMagnetEmail, sendPromptsEnWelcomeEmail } from "@/lib/lead-magnet-email";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const rateLimited = rateLimit(request, { limit: 10, prefix: "subscribe" });
  if (rateLimited) return rateLimited;

  try {
    const { email, source, website, ts, magnet: rawMagnet, lang: rawLang } = await request.json();
    // 送资料的入口（订阅框送手册、handbook、学习全景图）带 magnet：订阅后把 7 天下载链接发到邮箱（2026-10-31 起，PDF 不再有公开直链）
    const magnet = isLeadMagnet(rawMagnet) ? rawMagnet : null;
    const sourceStr = typeof source === "string" ? source : "website";
    const isPromptsEn = !magnet && sourceStr.startsWith("prompts-en");
    const lang: LinkLang = rawLang === "en" || isPromptsEn ? "en" : "zh";
    const t = (zh: string, en: string) => (lang === "en" ? en : zh);
    // 判成 bot 时静默返回成功：界面照常显示「已发送」，但不写库、不发信
    const fakeOk = () =>
      NextResponse.json({ success: true, emailed: Boolean(magnet), alreadySubscribed: false, message: t("订阅成功！", "Subscribed!") });

    // Honeypot: real users never fill this hidden field. Pretend success.
    if (website && String(website).trim() !== "") {
      console.warn("[subscribe] honeypot triggered", { email, source });
      return fakeOk();
    }

    // Origin / Referer guard: only accept submissions from our own site
    const origin = request.headers.get("origin") || "";
    const referer = request.headers.get("referer") || "";
    const ALLOWED = ["https://jasonzhu.ai", "https://www.jasonzhu.ai"];
    // 本地开发端口不固定（preview server 随机分配），放行任意 localhost 端口
    const isLocalhost =
      /^http:\/\/localhost(:\d+)?$/.test(origin) ||
      /^http:\/\/localhost(:\d+)?\//.test(referer);
    const isOriginOk =
      isLocalhost || ALLOWED.some((o) => origin === o || referer.startsWith(o + "/"));
    if (!isOriginOk) {
      console.warn("[subscribe] origin blocked", { origin, referer, email, source });
      return fakeOk();
    }

    // Time-trap: real form mounts and POSTs include a timestamp.
    // Missing ts = bot posting directly to API; <1.5s = bot rendered but auto-fills.
    if (typeof ts !== "number") {
      console.warn("[subscribe] missing ts (bot)", { email, source });
      return fakeOk();
    }
    const elapsedMs = Date.now() - ts;
    if (elapsedMs < 1500) {
      console.warn("[subscribe] timetrap triggered", { email, source, elapsedMs });
      return fakeOk();
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: t("请输入有效的邮箱地址", "Please enter a valid email address") },
        { status: 400 }
      );
    }

    // 防有人拿别人的邮箱刷我们发信：同一 IP 每小时最多 10 封，在写库之前挡，免得刷进一堆假订阅
    const ip = (request.headers.get("x-forwarded-for") || "").split(",")[0].trim() || request.headers.get("x-real-ip") || "unknown";
    if (magnet && (await overLimit(`lm:ip:${ip}`, 10, 3600))) {
      return NextResponse.json(
        { error: t("请求太频繁了，请稍后再试", "Too many requests. Please try again later.") },
        { status: 429 }
      );
    }

    let supabase;
    try {
      supabase = getSupabase();
    } catch {
      return NextResponse.json(
        { error: t("服务暂未配置，请联系管理员", "Service unavailable. Please try again later.") },
        { status: 503 }
      );
    }

    const addr = email.toLowerCase();
    // 订阅成功或已订阅都发下载链接；同一邮箱 24 小时最多 3 封。发信失败让用户重试（线索已经存下）
    const reply = async (alreadySubscribed: boolean, subscriberId: string | null = null) => {
      if (!magnet) {
        let emailed = false;
        // 英文提示词库新订阅（或退订后重订）：自动发一封欢迎信（书签 Top 50 + Agent Skills Hub + 200K 支付白皮书）
        // best-effort：发信限流或异常绝不阻塞订阅成功
        if (isPromptsEn && !alreadySubscribed) {
          const ipLimited = await overLimit(`pw:ip:${ip}`, 10, 3600);
          const emailLimited = await overLimit(`pw:e:${addr}`, 1, 86400);
          if (!ipLimited && !emailLimited) {
            try {
              await sendPromptsEnWelcomeEmail(addr, subscriberId, sourceStr);
              emailed = true;
            } catch (e) {
              console.warn("[subscribe] prompts-en welcome email failed", { email: addr, source: sourceStr, error: String(e) });
            }
          }
        }
        return NextResponse.json({
          success: true,
          emailed,
          alreadySubscribed,
          message: alreadySubscribed ? t("你已经订阅过了", "You're already subscribed") : t("订阅成功！", "Subscribed!"),
        });
      }
      if (await overLimit(`lm:e:${addr}`, 3, 86400)) {
        return NextResponse.json(
          {
            error: t(
              "这个邮箱今天已经发过好几次了，请先查收之前的邮件（也看看垃圾箱）",
              "We've already sent several links to this address today. Please check your inbox (and spam folder)."
            ),
          },
          { status: 429 }
        );
      }
      try {
        await sendLeadMagnetEmail(addr, magnet, lang);
      } catch (e) {
        console.error("[subscribe] lead magnet email failed", { email: addr, magnet, error: String(e) });
        return NextResponse.json(
          { error: t("邮件发送失败，请稍后重试", "We couldn't send the email. Please try again in a moment.") },
          { status: 502 }
        );
      }
      return NextResponse.json({
        success: true,
        emailed: true,
        alreadySubscribed,
        message: alreadySubscribed
          ? t("你已经订阅过了，下载链接已重新发到你的邮箱", "You're already subscribed. We've sent the download link to your inbox again.")
          : t(`订阅成功！下载链接已发到你的邮箱（${LINK_TTL_DAYS} 天内有效）`, `Subscribed! The download link is in your inbox (valid for ${LINK_TTL_DAYS} days).`),
      });
    };

    // Check if already subscribed
    const { data: existing } = await supabase
      .from("subscribers")
      .select("id")
      .eq("email", addr)
      .single();

    if (existing) {
      // 退订过的人自己又来订阅（2026-11-06 起有退订）：视为重新同意，清空 unsubscribed_at。subscribed_at 不动，
      // 不会因此挪进或挪出群发的「最新 1000 个」。还没跑迁移（没有这一列）时 update 报错，当普通的已订阅处理。
      const { data: resumed } = await supabase
        .from("subscribers")
        .update({ unsubscribed_at: null })
        .eq("id", existing.id)
        .not("unsubscribed_at", "is", null)
        .select("id");
      // Supabase 写失败时记进 KV 的退订也撤掉，免得之后回灌又把人退订了
      await clearPendingUnsubscribe(existing.id);
      return reply(!resumed?.length, existing.id);
    }

    // Insert new subscriber (primary: Supabase)
    const { data: inserted, error } = await supabase
      .from("subscribers")
      .insert({
        email: addr,
        source: sourceStr,
        subscribed_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    // 双写：独立 KV 备份（best-effort，不阻塞成功路径；Supabase 整库被限制时兜底）
    const backedUp = await backupLead(email, sourceStr);

    if (error) {
      console.error("Supabase insert error:", error);
      if (backedUp) {
        // 主写失败但 KV 兜住了线索：照常发下载链接，绝不丢线索 / 不显示「订阅失败」
        console.warn("[subscribe] supabase down, lead captured via KV backup", { email, source: sourceStr });
        return reply(false, null);
      }
      return NextResponse.json(
        { error: t("订阅失败，请稍后重试", "Subscription failed. Please try again later.") },
        { status: 500 }
      );
    }

    return reply(false, inserted?.id ?? null);
  } catch {
    return NextResponse.json(
      { error: "服务器错误，请稍后重试 / Server error, please try again later" },
      { status: 500 }
    );
  }
}
