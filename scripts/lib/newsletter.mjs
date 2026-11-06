/**
 * 群发邮件共用：谁能收、每封带收件人自己的退订链接（2026-11-06 起）。
 * 快讯 send-digest-email.mjs 和周报 send-weekly-email.mjs 都从这里取人；以后新加的群发（包括英文邮件）也走这里，
 * 别再各写一份过滤规则。退订链接的签名见 src/lib/unsubscribe-token.ts（Node 22.18+ 能直接 import .ts）。
 */
import { createClient } from "@supabase/supabase-js";
import { unsubscribeUrls } from "../../src/lib/unsubscribe-token.ts";

// 测试订阅留下的保留域名地址（example.com 之类）。Resend 会把含它们的整批 50 封一起拒掉（422），
// 以前每天第 4、5 批共 100 个真订阅者因此收不到。
export const TEST_ADDRESS = /@(([^@]+\.)?example\.(com|net|org)|[^@]+\.(test|example|invalid|localhost))$/i;

// 英文提示词库的订阅者（来源以 prompts-en 开头）：订阅时只答应「有值得一试的新提示词才发」，不发中文快讯和周报。
// 2026-10-27 到 11-06 这批人（83 个）每天都收到了中文快讯，11-06 起剔除。
export const ENGLISH_LIST = /^prompts-en/;

/** 页脚退订链接的占位符：邮件 HTML 先整封生成一次，发出前每封换成收件人自己的链接 */
export const UNSUBSCRIBE_PLACEHOLDER = "%%UNSUBSCRIBE_URL%%";

/** MODE=preview 用的假收件人：链接格式和真的一样，但库里没有这个 id，点开是「链接无效」 */
export const PREVIEW_RECIPIENT = { id: "00000000-0000-4000-8000-000000000000", email: "preview@example.com" };

/**
 * 读订阅者（id、邮箱、来源、退订时间），按订阅时间从新到旧。
 * 只读得到最新的 1000 个（Supabase max-rows，这里没分页）。2026-10-27 Jason 决定先不扩到全部订阅者
 * （全表约 4,700 个），要改先问他。
 * 还没跑 supabase/add-unsubscribed-at.sql 时这里报错：宁可不发，也不给退订的人发。
 */
export async function fetchSubscribers() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) throw new Error("Supabase not configured");
  const { data, error } = await createClient(url, key, { auth: { persistSession: false } })
    .from("subscribers")
    .select("id, email, source, unsubscribed_at")
    .order("subscribed_at", { ascending: false });
  if (error) throw new Error(`failed to fetch subscribers: ${error.message}`);
  return data || [];
}

/**
 * 从读到的那批里挑收件人：跳过已退订、测试地址、英文库订阅者。
 * 先取最新 1000 个再剔，名单范围不变：有人退订不会把第 1001 个人补进来，不会多发给谁。
 */
export function pickRecipients(rows) {
  const skipped = { unsubscribed: 0, test: 0, english: 0 };
  const recipients = [];
  for (const row of rows) {
    if (row.unsubscribed_at) skipped.unsubscribed++;
    else if (TEST_ADDRESS.test(row.email || "")) skipped.test++;
    else if (ENGLISH_LIST.test(row.source || "")) skipped.english++;
    else recipients.push(row);
  }
  return { recipients, skipped };
}

/** 没有 UNSUBSCRIBE_SECRET 就不发：发出去的邮件里不会有能用的退订链接 */
export function requireUnsubscribeSecret() {
  if (!process.env.UNSUBSCRIBE_SECRET) {
    throw new Error("UNSUBSCRIBE_SECRET not set: the emails would go out without a working unsubscribe link");
  }
}

/**
 * 一封邮件里跟收件人有关的部分：页脚换成他自己的退订链接；邮件头带一键退订
 * （RFC 8058，Gmail / Yahoo 对批量发件人的要求）。row 要有 id 和 email。
 */
export async function personalize(html, row, { lang = "zh", secret } = {}) {
  const { oneClick, page } = await unsubscribeUrls(row.id, row.email, { lang, secret });
  return {
    // split/join 而不是 String.replace：replace 会把替换串里的 $& 之类当特殊符号
    html: html.split(UNSUBSCRIBE_PLACEHOLDER).join(page.replace(/&/g, "&amp;")),
    headers: {
      "List-Unsubscribe": `<${oneClick}>`,
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    },
  };
}
