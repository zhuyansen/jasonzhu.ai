/**
 * 周报邮件推送（手动触发：.github/workflows/weekly-email.yml）
 *
 * 读一篇博客文章（出海选品周报），把指定的几节做成邮件，末尾放「在线阅读全文」按钮。
 * 表格和图片留在博客里看，邮件只放文字、列表和链接。
 *
 * 模式（MODE）：
 *   preview - 只把邮件 HTML 写到 PREVIEW_OUT（默认 /tmp/weekly-email.html），不发送，不需要任何密钥
 *   test    - 只发给 ALERT_EMAIL（默认）。退订链接用 ALERT_EMAIL 在订阅者表里的那一行，点开能走完整个退订流程
 *   all     - 发给订阅者（最新 1000 个里剔掉已退订、测试地址、英文库订阅者，规则在 scripts/lib/newsletter.mjs）；
 *             必须同时设置 CONFIRM=SEND，防止误发。
 *             走发信账本（KV weekly-email:<slug>，和快讯同一套，见 scripts/lib/digest-email-ledger.mjs）：
 *             一期只发一次，发完再跑不会再发；有批次没发出去，再跑只补那几批；KV 不通就不发。
 *             2026-11-10 以前没有账本：跑两次、或一批失败后重跑，全体订阅者都会再收一遍。
 * 每封都带收件人自己的退订链接（邮件头一键退订 + 页脚链接）。
 *
 * 环境变量：
 *   POST_SLUG                 - 文章 slug，如 chuhai-weekly-01（必填）
 *   SECTIONS                  - 放进邮件的二级标题，逗号分隔（默认：本周数字,本周值得看的 5 个新产品）
 *   RESEND_API_KEY            - Resend API 密钥（test / all）
 *   UNSUBSCRIBE_SECRET        - 退订链接签名，和 Vercel 上的同一个值（test / all）；缺了报错、不发
 *   ALERT_EMAIL               - test 模式的收件人
 *   NEXT_PUBLIC_SUPABASE_URL  - Supabase URL（all；test 用来查 ALERT_EMAIL 的订阅者 id）
 *   SUPABASE_SERVICE_KEY      - Supabase Service Role Key（同上）
 *   RESEND_FROM_EMAIL         - 发件人（默认 出海选品周报 <news@jasonzhu.ai>）
 *   KV_REST_API_URL / KV_REST_API_TOKEN - 发信账本（all）；不通就不发
 */

import { randomUUID } from "crypto";
import fs from "fs";
import os from "os";
import path from "path";
import matter from "gray-matter";
import { acquireLock, releaseLock } from "./lib/digest-email-ledger.mjs";
import { sendWithLedger } from "./lib/ledger-send.mjs";
import { PREVIEW_RECIPIENT, UNSUBSCRIBE_PLACEHOLDER, personalize, requireUnsubscribeSecret } from "./lib/newsletter.mjs";
import { sendBatch } from "./lib/resend-batch.mjs";

const SITE_URL = "https://jasonzhu.ai";
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "出海选品周报 <news@jasonzhu.ai>";
const MODE = process.env.MODE || "test";
const SLUG = process.env.POST_SLUG || "";
const SECTIONS = (process.env.SECTIONS || "本周数字,本周值得看的 5 个新产品").split(",").map((s) => s.trim());

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
        <p style="margin: 8px 0 0; font-size: 11px; color: #9ca3af;">您收到此邮件是因为订阅了 JasonZhu.AI。不想再收到？<a href="${UNSUBSCRIBE_PLACEHOLDER}" style="color: #6b7280; text-decoration: underline;">退订</a></p>
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

// test 模式：退订链接用 ALERT_EMAIL 自己那一行；不在表里（或没配 Supabase）就用假 id，点开显示「链接无效」
async function testRecipient(email) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
  if (supabaseUrl && supabaseKey) {
    const { createClient } = await import("@supabase/supabase-js");
    const { data } = await createClient(supabaseUrl, supabaseKey)
      .from("subscribers")
      .select("id, email")
      .eq("email", email.trim().toLowerCase())
      .maybeSingle();
    if (data) return data;
  }
  console.log("⚠️  ALERT_EMAIL 不在订阅者表里（或没配 Supabase）：退订链接用假 id，点开会显示「链接无效」");
  return { id: PREVIEW_RECIPIENT.id, email };
}

/** test：只发给 ALERT_EMAIL 一封，不记账本（可以反复发） */
async function sendTest(subject, html) {
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) fail("RESEND_API_KEY not set");
  if (!process.env.ALERT_EMAIL) fail("ALERT_EMAIL not set: test mode has nobody to send to");
  const row = await testRecipient(process.env.ALERT_EMAIL);
  const own = await personalize(html, row);
  console.log(`\n📧 周报邮件 — ${SLUG} — mode test, 1 recipient\n`);
  // key 每次不一样：test 就是要能反复发
  const result = await sendBatch(
    [{ from: FROM_EMAIL, to: row.email, subject, html: own.html, headers: own.headers }],
    `weekly-email-test/${SLUG}/${randomUUID()}`,
    "test",
    resendKey
  );
  if (!result.ok) fail(`test email not sent: ${result.error}`);
  console.log("\n✅ 1/1 sent");
}

/** all：按账本群发。返回退出码 */
async function sendAll(subject, html) {
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) fail("RESEND_API_KEY not set");
  if (process.env.CONFIRM !== "SEND") fail("MODE=all sends to every subscriber: set CONFIRM=SEND to go ahead");
  // 账本按 slug 记：slug 得是小写字母、数字、连字符（和博客文件名一致）
  if (!/^[a-z0-9][a-z0-9-]*$/.test(SLUG)) fail(`POST_SLUG "${SLUG}" can't be used as a ledger id (want lowercase letters, digits and hyphens)`);
  const id = `weekly:${SLUG}`;
  const owner = `${process.env.GITHUB_RUN_ID ? `run ${process.env.GITHUB_RUN_ID}.${process.env.GITHUB_RUN_ATTEMPT || 1}` : os.hostname()} ${randomUUID()}`;
  console.log(`\n📧 周报邮件 — ${SLUG} — mode all\n`);
  // 同一期同一时刻只让一个进程发。KV 不通就不发：没法确认这一期之前发没发
  try {
    if (!(await acquireLock(id, owner))) {
      console.error(`❌ Another process is sending ${SLUG} right now, not sending`);
      return 1;
    }
  } catch (err) {
    console.error(`❌ Send ledger unavailable, not sending (can't tell whether this issue already went out): ${err.message}`);
    return 1;
  }
  try {
    return await sendWithLedger({
      id,
      keyPrefix: `weekly-email/${SLUG}`,
      html,
      subject,
      from: FROM_EMAIL,
      resendKey,
      run: process.env.GH_RUN_URL || `local (${os.hostname()})`,
    });
  } finally {
    await releaseLock(id, owner).catch((err) =>
      console.error(`⚠️  Couldn't release the send lock (it expires by itself in 30 minutes): ${err.message}`)
    );
  }
}

async function main() {
  const post = loadPost();
  const html = emailHtml(post);
  if (MODE === "preview") {
    const out = process.env.PREVIEW_OUT || "/tmp/weekly-email.html";
    // 假收件人 + 没配 secret 时用占位密钥：链接格式和真的一样，点开是「链接无效」
    const sample = await personalize(html, PREVIEW_RECIPIENT, { secret: process.env.UNSUBSCRIBE_SECRET || "preview-only" });
    fs.writeFileSync(out, sample.html);
    console.log(`📝 preview written: ${out}`);
    for (const [name, value] of Object.entries(sample.headers)) console.log(`   ${name}: ${value}`);
    return;
  }
  // 发出去的邮件必须带能用的退订链接：缺 secret 就不发
  try {
    requireUnsubscribeSecret();
  } catch (err) {
    fail(err.message);
  }
  if (MODE === "test") return sendTest(post.title, html);
  if (MODE !== "all") fail(`unknown MODE: ${MODE}`);
  process.exitCode = await sendAll(post.title, html);
}

main().catch((err) => fail(`fatal: ${err.message}`));
