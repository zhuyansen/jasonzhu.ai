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
 * 发信账本（2026-11-06 起，scripts/lib/digest-email-ledger.mjs，KV 的 digest-email:<北京日期>）：
 *   - 今天这期已发完 / 按要求不发：什么都不做，退出 0。重跑、手动补跑都不会再发一遍。
 *   - 上次没发完（Resend 报错、Supabase 读不到……）：只补发还没发出的批次，名单和 Idempotency-Key 用上次固定下来的。
 *   - 上次停在「发送中」没收尾：不知道发到哪了，不发，报错等人处理（账本脚本的 set 命令）。
 *   - 每批 50 封带 Idempotency-Key，5xx / 429 / 超时当场重试；还有批次没发出去就以失败退出（工作流标红），
 *     交给 daily-news.yml 的下一档补发，最后一档还没发完就给 ALERT_EMAIL 告警。
 *   - KV 不通、账本记不进去就不发。
 *
 * 环境变量：
 *   RESEND_API_KEY            - Resend API 密钥
 *   NEXT_PUBLIC_SUPABASE_URL  - Supabase URL
 *   SUPABASE_SERVICE_KEY      - Supabase Service Role Key
 *   UNSUBSCRIBE_SECRET        - 退订链接签名，和 Vercel 上的同一个值；缺了报错退出、不发
 *   KV_REST_API_URL / KV_REST_API_TOKEN - 发信账本（Vercel KV）；缺了报错退出、不发
 *   GH_RUN_URL                - 记进账本的运行链接（工作流传，本地不用）
 *   RESEND_FROM_EMAIL         - 发件人邮箱（默认 news@jasonzhu.ai）
 */

import { randomUUID } from "crypto";
import fs from "fs";
import os from "os";
import path from "path";
import { acquireLock, describe, readLedger, releaseLock, writeLedger } from "./lib/digest-email-ledger.mjs";
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

const BATCH_SIZE = 50; // Resend 一次最多 100 封
const RETRY_DELAYS = [2, 5, 15]; // 一批失败后当场重试前等几秒（共 4 次机会，同一个 Idempotency-Key）
const RUN = process.env.GH_RUN_URL || `local (${os.hostname()})`;
// 发信锁的持有人，每个进程都不一样
const LOCK_OWNER = `${process.env.GITHUB_RUN_ID ? `run ${process.env.GITHUB_RUN_ID}.${process.env.GITHUB_RUN_ATTEMPT || 1}` : os.hostname()} ${randomUUID()}`;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * 发一批（≤50 封）。同一批不管当场重试几次、隔几档补发，都用同一个 Idempotency-Key：Resend 24 小时内见过这个 key 只回放结果、不再发。
 * 返回 { ok: true } 或 { ok: false, error, stop }；stop = 这次别再发后面的批次了（密钥 / 额度问题，或 Resend 一直 5xx、超时）。
 */
async function sendBatch(emails, key, label) {
  for (let attempt = 1; ; attempt++) {
    let status = 0;
    let name = "";
    let detail = "";
    let retryAfter = 0;
    try {
      const res = await fetch("https://api.resend.com/emails/batch", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendKey}`,
          "Content-Type": "application/json",
          "Idempotency-Key": key,
        },
        body: JSON.stringify(emails),
        signal: AbortSignal.timeout(30_000),
      });
      if (res.ok) return { ok: true };
      status = res.status;
      retryAfter = Number(res.headers.get("retry-after")) || 0;
      detail = await res.text();
      try {
        const body = JSON.parse(detail);
        name = body.name || "";
        detail = body.message || detail;
      } catch {
        // 不是 JSON，原样记下
      }
    } catch (err) {
      // 超时 / 断线：不知道 Resend 收没收到，用同一个 key 重试是安全的
      detail = `no response: ${err.message}`;
    }
    const error = [status || "", name, detail].filter(Boolean).join(" ").replace(/\s+/g, " ").slice(0, 300);

    // 这个 key 之前带着不一样的内容用过（比如补发前这批有人退订、少了一封）：说明这批早就发出去了
    if (status === 409 && name === "invalid_idempotent_request") return { ok: true, replayed: true };

    const quota = status === 429 && /quota/.test(name);
    const retryable =
      !status || status >= 500 || (status === 429 && !quota) || (status === 409 && name === "concurrent_idempotent_requests");
    if (!retryable) {
      // 401 / 403（密钥、域名）、额度用完、key 格式不对：后面每批都会一样，这次停下。422 之类只是这一批的问题，接着发下一批
      const stop = status === 401 || status === 403 || quota || name === "invalid_idempotency_key";
      return { ok: false, error, stop };
    }
    // 一直 5xx / 超时：Resend 多半挂了，剩下的批次交给下一档
    if (attempt > RETRY_DELAYS.length) return { ok: false, error, stop: true };
    const wait = Math.min(Math.max(retryAfter, RETRY_DELAYS[attempt - 1]), 60);
    console.warn(`  ⚠️  ${label}: ${error} — retrying in ${wait}s with the same Idempotency-Key`);
    await sleep(wait * 1000);
  }
}

/** 还没开始发就失败了（比如读不到订阅者）：记进账本（保留上次没发完的批次），交给下一档 */
async function recordFailure(prev, message) {
  console.error(`❌ ${message}`);
  try {
    await writeLedger(TODAY, {
      ...(prev || {}),
      status: "failed",
      run: RUN,
      attempts: (prev?.attempts || 0) + 1,
      error: message.slice(0, 300),
    });
  } catch (err) {
    console.error(`⚠️  Couldn't record the failure in the send ledger either: ${err.message}`);
  }
  return 1;
}

async function sendWithLedger(html, subject) {
  const prev = await readLedger(TODAY);
  if (prev?.status === "sent") {
    console.log(`✅ ${TODAY} 这期已经发过：${describe(prev, TODAY)}。不再发。`);
    return 0;
  }
  if (prev?.status === "skipped") {
    console.log(`⏭️  ${describe(prev, TODAY)}。不发。`);
    return 0;
  }
  if (prev?.status === "sending") {
    console.error(`❌ ${describe(prev, TODAY)}`);
    console.error(
      "   不知道发到哪了，这次不发。看那次的运行日志和 Resend 后台：全发出去了就改成 sent；没发完就改成 failed 再重跑" +
        "（补发用原来的 Idempotency-Key，离那次开始发不到 24 小时，Resend 不会重复发）："
    );
    console.error(`   node --env-file=.env.local scripts/lib/digest-email-ledger.mjs set ${TODAY} sent|failed`);
    return 1;
  }
  if (prev?.status === "failed") console.log(`🔁 Earlier attempt: ${describe(prev, TODAY)}`);

  let subscribers;
  try {
    subscribers = await fetchSubscribers();
  } catch (err) {
    return recordFailure(prev, err.message);
  }
  // 名单是空的不正常（平时 1000 个）：多半是 key 配错、读到的是 anon 视角，别当成「发完了」
  if (subscribers.length === 0) return recordFailure(prev, "Supabase returned 0 subscribers (wrong SUPABASE_SERVICE_KEY?)");

  const { recipients, skipped } = pickRecipients(subscribers);
  console.log(
    `📬 Found ${subscribers.length} subscribers, skipped ${skipped.unsubscribed} unsubscribed, ` +
      `${skipped.test} test addresses and ${skipped.english} English prompt-library subscribers`
  );

  let batches;
  let total;
  let sent;
  let dropped = prev?.dropped || 0;
  if (prev?.pending?.length) {
    // 补发：只发上次没发出去的批次，名单和 key 都用上次固定下来的。中间退订的、被新订阅挤出最新 1000 个的不补
    const eligible = new Map(recipients.map((r) => [r.id, r]));
    batches = prev.pending.map(({ key, ids }) => {
      const rows = ids.map((id) => eligible.get(id)).filter(Boolean);
      dropped += ids.length - rows.length;
      return { key, rows };
    });
    total = prev.total;
    sent = prev.sent || 0;
    console.log(`🔁 Resuming: ${sent}/${total} already sent, ${batches.length} batch(es) to go`);
  } else {
    batches = [];
    for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
      const n = String(batches.length + 1).padStart(2, "0");
      batches.push({ key: `digest-email/${TODAY}/batch-${n}`, rows: recipients.slice(i, i + BATCH_SIZE) });
    }
    total = recipients.length;
    sent = 0;
  }

  // 先记「发送中」和这次的名单，记不进去就不发
  const record = {
    status: "sending",
    run: RUN,
    attempts: (prev?.attempts || 0) + 1,
    startedAt: new Date().toISOString(),
    total,
    sent,
    dropped,
    pending: batches.map(({ key, rows }) => ({ key, ids: rows.map((r) => r.id) })),
  };
  try {
    await writeLedger(TODAY, record);
  } catch (err) {
    console.error(`❌ Couldn't write the send ledger, not sending: ${err.message}`);
    return 1;
  }

  const stillPending = [];
  let error = null;
  let stop = false;
  for (const batch of batches) {
    const label = batch.key.slice(batch.key.lastIndexOf("/") + 1);
    const ids = batch.rows.map((r) => r.id);
    if (stop) {
      stillPending.push({ key: batch.key, ids });
      continue;
    }
    if (batch.rows.length === 0) {
      console.log(`  ⏭️  ${label}: everyone in it unsubscribed or left the newest 1000`);
      continue;
    }
    let result;
    try {
      // 每封的页脚和邮件头带收件人自己的退订链接
      const emails = await Promise.all(
        batch.rows.map(async (s) => {
          const own = await personalize(html, s);
          return { from: FROM_EMAIL, to: s.email, subject, html: own.html, headers: own.headers };
        })
      );
      result = await sendBatch(emails, batch.key, label);
    } catch (err) {
      result = { ok: false, error: `couldn't build the emails: ${err.message}`, stop: false };
    }
    if (result.ok) {
      sent += batch.rows.length;
      console.log(`  ✅ ${label}: sent ${batch.rows.length} emails${result.replayed ? " (Resend: this batch had already gone out)" : ""}`);
    } else {
      error = `${label}: ${result.error}`;
      stillPending.push({ key: batch.key, ids });
      console.error(`❌ ${error}`);
      if (result.stop) {
        stop = true;
        console.error("   Leaving the remaining batches for the next run");
      }
    }
  }

  const done = stillPending.length === 0;
  const final = { ...record, status: done ? "sent" : "failed", sent, finishedAt: new Date().toISOString() };
  if (done) delete final.pending;
  else Object.assign(final, { pending: stillPending, error });
  try {
    await writeLedger(TODAY, final);
  } catch (err) {
    console.error(`❌ ${done ? "Every email went out" : `${sent}/${total} went out`}, but the send ledger couldn't be updated: ${err.message}`);
    console.error(
      `   账本停在「发送中」，后面几档不会自动重发。确认后：node --env-file=.env.local scripts/lib/digest-email-ledger.mjs set ${TODAY} ${done ? "sent" : "failed"}`
    );
    return 1;
  }

  const droppedNote = dropped ? `, ${dropped} unsubscribed or left the newest 1000 before their retry` : "";
  if (done) {
    console.log(`\n✅ Email push complete: ${sent}/${total} sent${droppedNote}`);
    return 0;
  }
  console.error(`\n❌ Email push incomplete: ${sent}/${total} sent${droppedNote}`);
  console.error(`   ${stillPending.length} batch(es) left for the next run; the last run alerts ALERT_EMAIL if they still haven't gone out`);
  return 1;
}

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
    return 0;
  }

  console.log(`\n📧 快讯邮件推送 — ${TODAY}\n`);

  // 同一天同一时刻只让一个进程发。KV 不通就不发：没法确认今天这期之前发没发
  try {
    if (!(await acquireLock(TODAY, LOCK_OWNER))) {
      console.error(`❌ Another process is sending the ${TODAY} digest right now, not sending`);
      return 1;
    }
  } catch (err) {
    console.error(`❌ Send ledger unavailable, not sending (can't tell whether today's digest already went out): ${err.message}`);
    return 1;
  }
  try {
    return await sendWithLedger(html, subject);
  } finally {
    await releaseLock(TODAY, LOCK_OWNER).catch((err) =>
      console.error(`⚠️  Couldn't release the send lock (it expires by itself in 30 minutes): ${err.message}`)
    );
  }
}

main().then(
  (code) => {
    process.exitCode = code;
  },
  (err) => {
    console.error("❌ Fatal:", err.message);
    process.exitCode = 1;
  }
);
