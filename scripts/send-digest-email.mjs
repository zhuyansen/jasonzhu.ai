/**
 * 快讯邮件推送
 *
 * 读取今日生成的快讯，发给订阅者：最新 1000 个里剔掉已退订、测试地址、英文库订阅者（规则在 scripts/lib/newsletter.mjs）。
 * 每封带收件人自己的退订链接（邮件头一键退订 + 页脚链接）。在 collect-news.mjs 之后运行。
 *
 * 模式（MODE）：
 *   不设     - 发给订阅者（daily-news.yml 的 cron 就是这样跑）
 *   preview  - 只把邮件 HTML 写到 PREVIEW_OUT（默认 /tmp/digest-email.html），不读名单、不发信、不需要任何密钥；
 *              默认今天这期，DATE=YYYY-MM-DD 换一期
 *
 * 环境变量：
 *   RESEND_API_KEY            - Resend API 密钥
 *   NEXT_PUBLIC_SUPABASE_URL  - Supabase URL
 *   SUPABASE_SERVICE_KEY      - Supabase Service Role Key
 *   UNSUBSCRIBE_SECRET        - 退订链接签名，和 Vercel 上的同一个值；缺了报错退出、不发
 *   RESEND_FROM_EMAIL         - 发件人邮箱（默认 news@jasonzhu.ai）
 */

import fs from "fs";
import path from "path";
import {
  PREVIEW_RECIPIENT,
  UNSUBSCRIBE_PLACEHOLDER,
  fetchSubscribers,
  personalize,
  pickRecipients,
  requireUnsubscribeSecret,
} from "./lib/newsletter.mjs";

const MODE = process.env.MODE || "send";
if (MODE !== "send" && MODE !== "preview") {
  console.error(`❌ unknown MODE: ${MODE}（不设 = 发给订阅者，preview = 只写 HTML）`);
  process.exit(1);
}

// 快讯按北京日期分期（和 collect-news.mjs 一样）。cron 在北京清晨跑，那时 UTC 还是前一天，
// 以前按 UTC 取「今天」会把昨天那期再发一遍。DATE 只在 preview 时生效，发信永远是今天这期。
const TODAY = (MODE === "preview" && process.env.DATE) || new Date(Date.now() + 8 * 3600 * 1000).toISOString().split("T")[0];
const MONTH_DAY = (() => {
  const [, month, day] = TODAY.split("-").map(Number);
  return `${month}月${day}日`;
})();

const SITE_URL = "https://jasonzhu.ai";
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "AI快讯 <news@jasonzhu.ai>";

// ─── Check prerequisites ────────────────────────────

const resendKey = process.env.RESEND_API_KEY;
if (MODE === "send") {
  if (!resendKey) {
    console.log("⚠️  RESEND_API_KEY not set, skipping email push");
    process.exit(0);
  }
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
    console.log("⚠️  Supabase not configured, skipping email push");
    process.exit(0);
  }
  // 发出去的邮件必须带能用的退订链接：缺 secret 就整次不发（报错，工作流标红）
  try {
    requireUnsubscribeSecret();
  } catch (err) {
    console.error(`❌ ${err.message}`);
    process.exit(1);
  }
}

// ─── Load today's digest ────────────────────────────

const newsJsonPath = path.join(process.cwd(), "src/generated/news.json");
if (!fs.existsSync(newsJsonPath)) {
  console.error("❌ news.json not found");
  process.exit(1);
}

const digests = JSON.parse(fs.readFileSync(newsJsonPath, "utf-8"));
const todayDigest = digests.find((d) => d.slug === TODAY);

if (!todayDigest || todayDigest.items.length === 0) {
  console.log("⚠️  No digest for today, skipping email");
  process.exit(0);
}

// ─── Build email HTML ───────────────────────────────

const categoryColors = {
  "Skills 生态": "#7c3aed",
  "出海实战": "#ea580c",
  "AI 工具动态": "#2563eb",
  "变现案例": "#16a34a",
};

function buildEmailHtml(digest) {
  const itemsHtml = digest.items
    .map((item) => {
      const color = categoryColors[item.category] || "#6b7280";
      return `
      <tr>
        <td style="padding: 16px 0; border-bottom: 1px solid #f3f4f6;">
          <span style="display: inline-block; padding: 2px 8px; border-radius: 9999px; font-size: 12px; color: ${color}; background: ${color}11; margin-bottom: 6px;">
            ${item.category}
          </span>
          <span style="font-size: 12px; color: #9ca3af; margin-left: 8px;">${item.source}</span>
          <br/>
          <a href="${item.url}" style="color: #111827; font-weight: 600; font-size: 15px; text-decoration: none;">
            ${item.title} ↗
          </a>
          <p style="color: #6b7280; font-size: 14px; margin: 6px 0 0; line-height: 1.6;">
            ${item.summary}
          </p>
        </td>
      </tr>`;
    })
    .join("");

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/></head>
<body style="margin: 0; padding: 0; background: #f9fafb; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background: #ffffff;">
    <!-- Header -->
    <tr>
      <td style="padding: 32px 24px 16px; text-align: center;">
        <h1 style="margin: 0; font-size: 22px; color: #111827;">AI 快讯 · ${MONTH_DAY}</h1>
        <p style="margin: 8px 0 0; font-size: 13px; color: #9ca3af;">
          每日精选 AI 行业动态 · <a href="${SITE_URL}/zh/news/${TODAY}" style="color: #2563eb;">在线阅读 →</a>
        </p>
      </td>
    </tr>

    <!-- AI 摘要（字段名沿用 jasonSays；邮件在 Jason 点评之前发出，所以只有 AI 摘要） -->
    ${
      digest.jasonSays
        ? `
    <tr>
      <td style="padding: 0 24px 16px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #eff6ff, #eef2ff); border-radius: 12px; border: 1px solid #dbeafe;">
          <tr>
            <td style="padding: 16px;">
              <p style="margin: 0 0 4px; font-size: 12px; font-weight: 600; color: #6b7280;">AI 摘要 · 本期快讯由 AI 整理</p>
              <p style="margin: 0; font-size: 14px; color: #374151; line-height: 1.6;">${digest.jasonSays}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>`
        : ""
    }

    <!-- News Items -->
    <tr>
      <td style="padding: 0 24px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          ${itemsHtml}
        </table>
      </td>
    </tr>

    <!-- CTA -->
    <tr>
      <td style="padding: 32px 24px; text-align: center;">
        <a href="${SITE_URL}/zh/handbook" style="display: inline-block; padding: 10px 24px; background: #2563eb; color: #ffffff; border-radius: 8px; font-size: 14px; font-weight: 500; text-decoration: none;">
          📘 免费获取出海手册
        </a>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="padding: 16px 24px 32px; text-align: center; border-top: 1px solid #f3f4f6;">
        <p style="margin: 0; font-size: 12px; color: #9ca3af;">
          JasonZhu.AI · AI 应用与实践<br/>
          <a href="${SITE_URL}/zh/news" style="color: #6b7280;">往期快讯</a> ·
          <a href="${SITE_URL}/zh/tools" style="color: #6b7280;">AI 工具</a> ·
          <a href="${SITE_URL}/zh/blog" style="color: #6b7280;">博客</a>
        </p>
        <p style="margin: 8px 0 0; font-size: 11px; color: #9ca3af;">
          您收到此邮件是因为订阅了 JasonZhu.AI 快讯。不想再收到？<a href="${UNSUBSCRIBE_PLACEHOLDER}" style="color: #6b7280; text-decoration: underline;">退订</a>
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ─── Fetch subscribers & send ───────────────────────

async function main() {
  const html = buildEmailHtml(todayDigest);
  const subject = `AI 快讯 · ${MONTH_DAY} — ${todayDigest.items[0]?.title || "今日精选"}`;

  if (MODE === "preview") {
    const out = process.env.PREVIEW_OUT || "/tmp/digest-email.html";
    // 假收件人 + 没配 secret 时用占位密钥：链接格式和真的一样，点开是「链接无效」
    const sample = await personalize(html, PREVIEW_RECIPIENT, { secret: process.env.UNSUBSCRIBE_SECRET || "preview-only" });
    fs.writeFileSync(out, sample.html);
    console.log(`📝 preview written: ${out}`);
    console.log(`   Subject: ${subject}`);
    for (const [name, value] of Object.entries(sample.headers)) console.log(`   ${name}: ${value}`);
    return;
  }

  console.log(`\n📧 快讯邮件推送 — ${TODAY}\n`);

  let subscribers;
  try {
    subscribers = await fetchSubscribers();
  } catch (err) {
    console.error(`❌ ${err.message}`);
    process.exit(1);
  }

  if (subscribers.length === 0) {
    console.log("⚠️  No subscribers found");
    return;
  }

  const { recipients, skipped } = pickRecipients(subscribers);
  console.log(
    `📬 Found ${subscribers.length} subscribers, skipped ${skipped.unsubscribed} unsubscribed, ` +
      `${skipped.test} test addresses and ${skipped.english} English prompt-library subscribers`
  );

  // Send in batches of 50 (Resend batch limit)
  const BATCH_SIZE = 50;
  let sent = 0;

  for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
    const batch = recipients.slice(i, i + BATCH_SIZE);
    // 每封的页脚和邮件头带收件人自己的退订链接
    const emails = await Promise.all(
      batch.map(async (s) => {
        const own = await personalize(html, s);
        return { from: FROM_EMAIL, to: s.email, subject, html: own.html, headers: own.headers };
      })
    );

    try {
      const res = await fetch("https://api.resend.com/emails/batch", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(emails),
      });

      if (!res.ok) {
        const errText = await res.text();
        console.error(`❌ Batch ${i / BATCH_SIZE + 1} failed: ${res.status} ${errText}`);
        continue;
      }

      sent += batch.length;
      console.log(`  ✅ Batch ${i / BATCH_SIZE + 1}: sent ${batch.length} emails`);
    } catch (err) {
      console.error(`❌ Batch ${i / BATCH_SIZE + 1} error: ${err.message}`);
    }
  }

  console.log(`\n✅ Email push complete: ${sent}/${recipients.length} sent`);
}

main().catch((err) => {
  console.error("❌ Fatal:", err.message);
  process.exit(1);
});
