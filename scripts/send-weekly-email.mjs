/**
 * 周报邮件推送（手动触发：.github/workflows/weekly-email.yml）
 *
 * 读一篇博客文章（出海选品周报），把指定的几节做成邮件，末尾放「在线阅读全文」按钮。
 * 表格和图片留在博客里看，邮件只放文字、列表和链接。
 *
 * 模式（MODE）：
 *   preview - 只把邮件 HTML 写到 PREVIEW_OUT（默认 /tmp/weekly-email.html），不发送，不需要任何密钥
 *   test    - 只发给 ALERT_EMAIL（默认）
 *   all     - 发给全部订阅者；必须同时设置 CONFIRM=SEND，防止误发
 *
 * 环境变量：
 *   POST_SLUG                 - 文章 slug，如 chuhai-weekly-01（必填）
 *   SECTIONS                  - 放进邮件的二级标题，逗号分隔（默认：本周数字,本周值得看的 5 个新产品）
 *   RESEND_API_KEY            - Resend API 密钥（test / all）
 *   ALERT_EMAIL               - test 模式的收件人
 *   NEXT_PUBLIC_SUPABASE_URL  - Supabase URL（all）
 *   SUPABASE_SERVICE_KEY      - Supabase Service Role Key（all）
 *   RESEND_FROM_EMAIL         - 发件人（默认 出海选品周报 <news@jasonzhu.ai>）
 */

import fs from "fs";
import path from "path";
import matter from "gray-matter";

const SITE_URL = "https://jasonzhu.ai";
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "出海选品周报 <news@jasonzhu.ai>";
const MODE = process.env.MODE || "test";
const SLUG = process.env.POST_SLUG || "";
const SECTIONS = (process.env.SECTIONS || "本周数字,本周值得看的 5 个新产品").split(",").map((s) => s.trim());
const BATCH_SIZE = 50; // Resend batch limit

function fail(message) {
  console.error(`❌ ${message}`);
  process.exit(1);
}

// ─── Markdown → email HTML (the subset a weekly issue uses) ─────────

const escape = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function inline(text) {
  return escape(text)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/`([^`]+)`/g, '<code style="font-size: 13px;">$1</code>')
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, label, href) => {
      const url = href.startsWith("/") ? SITE_URL + href : href;
      return `<a href="${url}" style="color: #2563eb;">${label}</a>`;
    });
}

const P = "margin: 0 0 12px; font-size: 15px; color: #374151; line-height: 1.7;";

function blocks(markdown) {
  const out = [];
  let list = null;
  const close = () => {
    if (list) out.push(`<${list.tag} style="margin: 0 0 12px; padding-left: 20px;">${list.items.join("")}</${list.tag}>`);
    list = null;
  };
  for (const raw of markdown.split("\n")) {
    const line = raw.trim();
    const bullet = line.match(/^[-*·] (.*)$/);
    const numbered = line.match(/^\d+\. (.*)$/);
    if (bullet || numbered) {
      const tag = bullet ? "ul" : "ol";
      if (!list || list.tag !== tag) {
        close();
        list = { tag, items: [] };
      }
      list.items.push(`<li style="${P} margin-bottom: 8px;">${inline((bullet || numbered)[1])}</li>`);
      continue;
    }
    close();
    if (!line || line.startsWith("|") || line.startsWith("![")) continue; // tables and images stay on the blog
    if (line.startsWith("> ")) {
      out.push(`<p style="${P} color: #6b7280; border-left: 3px solid #e5e7eb; padding-left: 12px;">${inline(line.slice(2))}</p>`);
    } else if (line.startsWith("（") && line.endsWith("）")) {
      out.push(`<p style="${P} color: #6b7280; font-size: 13px;">${inline(line)}</p>`);
    } else {
      out.push(`<p style="${P}">${inline(line)}</p>`);
    }
  }
  close();
  return out.join("\n");
}

function sections(markdown, wanted) {
  const parts = markdown.split(/^## /m).slice(1);
  return wanted
    .map((title) => parts.find((p) => p.split("\n")[0].trim() === title))
    .filter(Boolean)
    .map((p) => {
      const [heading, ...rest] = p.split("\n");
      return `<h2 style="margin: 24px 0 12px; font-size: 18px; color: #111827;">${escape(heading.trim())}</h2>\n${blocks(rest.join("\n"))}`;
    })
    .join("\n");
}

function emailHtml(post) {
  const url = `${SITE_URL}/zh/blog/${SLUG}`;
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/></head>
<body style="margin: 0; padding: 0; background: #f9fafb; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background: #ffffff;">
    <tr>
      <td style="padding: 32px 24px 8px;">
        <h1 style="margin: 0; font-size: 22px; color: #111827; line-height: 1.4;">${escape(post.title)}</h1>
        <p style="margin: 10px 0 0; font-size: 14px; color: #6b7280; line-height: 1.6;">${escape(post.excerpt || "")}</p>
      </td>
    </tr>
    <tr><td style="padding: 0 24px;">${post.body}</td></tr>
    <tr>
      <td style="padding: 24px; text-align: center;">
        <a href="${url}" style="display: inline-block; padding: 10px 24px; background: #2563eb; color: #ffffff; border-radius: 8px; font-size: 14px; font-weight: 500; text-decoration: none;">
          在线阅读全文 →
        </a>
        <p style="margin: 10px 0 0; font-size: 12px; color: #9ca3af;">全文还有：起量最快的新站、验证过的需求、本周打法、收款平台动态</p>
      </td>
    </tr>
    <tr>
      <td style="padding: 16px 24px 32px; text-align: center; border-top: 1px solid #f3f4f6;">
        <p style="margin: 0; font-size: 12px; color: #9ca3af;">
          JasonZhu.AI · 出海选品周报<br/>
          <a href="${SITE_URL}/zh/blog" style="color: #6b7280;">博客</a> ·
          <a href="${SITE_URL}/zh/news" style="color: #6b7280;">AI 快讯</a>
        </p>
        <p style="margin: 8px 0 0; font-size: 11px; color: #d1d5db;">您收到此邮件是因为订阅了 JasonZhu.AI。</p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ─── Load the post ─────────────────────────────────

function loadPost() {
  if (!SLUG) fail("POST_SLUG is required");
  const file = path.join(process.cwd(), "src/content/blog", `${SLUG}.md`);
  if (!fs.existsSync(file)) fail(`post not found: ${file}`);
  const { data, content } = matter(fs.readFileSync(file, "utf-8"));
  const body = sections(content, SECTIONS);
  if (!body) fail(`none of the sections ${SECTIONS.join(" / ")} found in ${SLUG}`);
  return { title: data.title, excerpt: data.excerpt, body };
}

// ─── Recipients & sending ──────────────────────────

async function recipients() {
  if (MODE === "test") {
    if (!process.env.ALERT_EMAIL) fail("ALERT_EMAIL not set: test mode has nobody to send to");
    return [process.env.ALERT_EMAIL];
  }
  if (MODE !== "all") fail(`unknown MODE: ${MODE}`);
  if (process.env.CONFIRM !== "SEND") fail("MODE=all sends to every subscriber: set CONFIRM=SEND to go ahead");
  const { createClient } = await import("@supabase/supabase-js");
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
  if (!supabaseUrl || !supabaseKey) fail("Supabase not configured");
  const { data, error } = await createClient(supabaseUrl, supabaseKey)
    .from("subscribers")
    .select("email")
    .order("subscribed_at", { ascending: false });
  if (error) fail(`failed to fetch subscribers: ${error.message}`);
  return (data || []).map((s) => s.email);
}

async function send(to, subject, html) {
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) fail("RESEND_API_KEY not set");
  let sent = 0;
  for (let i = 0; i < to.length; i += BATCH_SIZE) {
    const batch = to.slice(i, i + BATCH_SIZE).map((email) => ({
      from: FROM_EMAIL,
      to: email,
      subject,
      html,
      headers: {
        "List-Unsubscribe": `<${SITE_URL}/zh/blog>`,
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
      },
    }));
    try {
      const res = await fetch("https://api.resend.com/emails/batch", {
        method: "POST",
        headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
        body: JSON.stringify(batch),
      });
      if (!res.ok) {
        console.error(`❌ Batch ${i / BATCH_SIZE + 1} failed: ${res.status} ${await res.text()}`);
        continue;
      }
      sent += batch.length;
      console.log(`  ✅ Batch ${i / BATCH_SIZE + 1}: sent ${batch.length}`);
    } catch (err) {
      console.error(`❌ Batch ${i / BATCH_SIZE + 1} error: ${err.message}`);
    }
  }
  return sent;
}

async function main() {
  const post = loadPost();
  const html = emailHtml(post);
  if (MODE === "preview") {
    const out = process.env.PREVIEW_OUT || "/tmp/weekly-email.html";
    fs.writeFileSync(out, html);
    console.log(`📝 preview written: ${out}`);
    return;
  }
  const to = await recipients();
  console.log(`\n📧 周报邮件 — ${SLUG} — mode ${MODE}, ${to.length} recipient(s)\n`);
  const sent = await send(to, post.title, html);
  console.log(`\n✅ ${sent}/${to.length} sent`);
  if (sent < to.length) process.exit(1);
}

main().catch((err) => fail(`fatal: ${err.message}`));
