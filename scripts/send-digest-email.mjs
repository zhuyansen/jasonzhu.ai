/**
 * 快讯邮件推送
 *
 * 读取今日生成的快讯 MDX，发送给所有订阅者。
 * 在 collect-news.mjs 之后运行。
 *
 * 环境变量：
 *   RESEND_API_KEY            - Resend API 密钥
 *   NEXT_PUBLIC_SUPABASE_URL  - Supabase URL
 *   SUPABASE_SERVICE_KEY      - Supabase Service Role Key
 *   RESEND_FROM_EMAIL         - 发件人邮箱（默认 news@jasonzhu.ai）
 */

import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

const TODAY = new Date().toISOString().split("T")[0];
const MONTH_DAY = (() => {
  const d = new Date();
  return `${d.getMonth() + 1}月${d.getDate()}日`;
})();

const SITE_URL = "https://jasonzhu.ai";
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "AI快讯 <news@jasonzhu.ai>";

// ─── Check prerequisites ────────────────────────────

const resendKey = process.env.RESEND_API_KEY;
if (!resendKey) {
  console.log("⚠️  RESEND_API_KEY not set, skipping email push");
  process.exit(0);
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
if (!supabaseUrl || !supabaseKey) {
  console.log("⚠️  Supabase not configured, skipping email push");
  process.exit(0);
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

    <!-- Jason Says -->
    ${
      digest.jasonSays
        ? `
    <tr>
      <td style="padding: 0 24px 16px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #eff6ff, #eef2ff); border-radius: 12px; border: 1px solid #dbeafe;">
          <tr>
            <td style="padding: 16px;">
              <p style="margin: 0 0 4px; font-size: 12px; font-weight: 600; color: #2563eb;">💡 Jason 说</p>
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
        <p style="margin: 8px 0 0; font-size: 11px; color: #d1d5db;">
          您收到此邮件是因为订阅了 JasonZhu.AI 快讯。
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ─── Fetch subscribers & send ───────────────────────

async function main() {
  console.log(`\n📧 快讯邮件推送 — ${TODAY}\n`);

  const supabase = createClient(supabaseUrl, supabaseKey);

  // Fetch all subscribers
  const { data: subscribers, error } = await supabase
    .from("subscribers")
    .select("email")
    .order("subscribed_at", { ascending: false });

  if (error) {
    console.error("❌ Failed to fetch subscribers:", error.message);
    process.exit(1);
  }

  if (!subscribers || subscribers.length === 0) {
    console.log("⚠️  No subscribers found");
    return;
  }

  console.log(`📬 Found ${subscribers.length} subscribers`);

  const html = buildEmailHtml(todayDigest);
  const subject = `AI 快讯 · ${MONTH_DAY} — ${todayDigest.items[0]?.title || "今日精选"}`;

  // Send in batches of 50 (Resend batch limit)
  const BATCH_SIZE = 50;
  let sent = 0;

  for (let i = 0; i < subscribers.length; i += BATCH_SIZE) {
    const batch = subscribers.slice(i, i + BATCH_SIZE);
    const emails = batch.map((s) => ({
      from: FROM_EMAIL,
      to: s.email,
      subject,
      html,
    }));

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

  console.log(`\n✅ Email push complete: ${sent}/${subscribers.length} sent`);
}

main().catch((err) => {
  console.error("❌ Fatal:", err.message);
  process.exit(1);
});
