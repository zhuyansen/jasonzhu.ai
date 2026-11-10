/**
 * 群发邮件共用：按发信账本发一期（2026-11-10 从 send-digest-email.mjs 搬出来，快讯和周报共用，逻辑没改）。
 * 账本规则见 digest-email-ledger.mjs：发之前先记「发送中」和按 50 人一批固定的名单，每批一个 Resend Idempotency-Key；
 * 已发完不再发；没发完再跑只补没发出的批次；停在「发送中」不自动重发。
 *
 * job：
 *   id         账本 id：快讯是北京日期（2026-11-10），周报是 weekly:<slug>
 *   keyPrefix  Idempotency-Key 前缀：digest-email/<日期> 或 weekly-email/<slug>
 *   html / subject / from / resendKey / run（这次运行的链接或主机名，记进账本）
 * 返回进程退出码：0 = 发完（或本来就发完 / 按要求不发），1 = 没发完。
 * 调用方负责先拿发信锁（acquireLock），这里不管锁。
 */
import { describe, readLedger, writeLedger } from "./digest-email-ledger.mjs";
import { fetchSubscribers, personalize, pickRecipients } from "./newsletter.mjs";
import { sendBatch } from "./resend-batch.mjs";

const BATCH_SIZE = 50; // Resend 一次最多 100 封

/** 还没开始发就失败了（比如读不到订阅者）：记进账本（保留上次没发完的批次），交给下一档 */
async function recordFailure(job, prev, message) {
  const { id, run } = job;
  console.error(`❌ ${message}`);
  try {
    await writeLedger(id, {
      ...(prev || {}),
      status: "failed",
      run,
      attempts: (prev?.attempts || 0) + 1,
      error: message.slice(0, 300),
    });
  } catch (err) {
    console.error(`⚠️  Couldn't record the failure in the send ledger either: ${err.message}`);
  }
  return 1;
}

export async function sendWithLedger(job) {
  const { id, html, subject, from, resendKey, run, keyPrefix } = job;
  const prev = await readLedger(id);
  if (prev?.status === "sent") {
    console.log(`✅ ${id} 这期已经发过：${describe(prev, id)}。不再发。`);
    return 0;
  }
  if (prev?.status === "skipped") {
    console.log(`⏭️  ${describe(prev, id)}。不发。`);
    return 0;
  }
  if (prev?.status === "sending") {
    console.error(`❌ ${describe(prev, id)}`);
    console.error(
      "   不知道发到哪了，这次不发。看那次的运行日志和 Resend 后台：全发出去了就改成 sent；没发完就改成 failed 再重跑" +
        "（补发用原来的 Idempotency-Key，离那次开始发不到 24 小时，Resend 不会重复发）："
    );
    console.error(`   node --env-file=.env.local scripts/lib/digest-email-ledger.mjs set ${id} sent|failed`);
    return 1;
  }
  if (prev?.status === "failed") console.log(`🔁 Earlier attempt: ${describe(prev, id)}`);

  let subscribers;
  try {
    subscribers = await fetchSubscribers();
  } catch (err) {
    return recordFailure(job, prev, err.message);
  }
  // 名单是空的不正常（平时 1000 个）：多半是 key 配错、读到的是 anon 视角，别当成「发完了」
  if (subscribers.length === 0) return recordFailure(job, prev, "Supabase returned 0 subscribers (wrong SUPABASE_SERVICE_KEY?)");

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
      batches.push({ key: `${keyPrefix}/batch-${n}`, rows: recipients.slice(i, i + BATCH_SIZE) });
    }
    total = recipients.length;
    sent = 0;
  }

  // 先记「发送中」和这次的名单，记不进去就不发
  const record = {
    status: "sending",
    run,
    attempts: (prev?.attempts || 0) + 1,
    startedAt: new Date().toISOString(),
    total,
    sent,
    dropped,
    pending: batches.map(({ key, rows }) => ({ key, ids: rows.map((r) => r.id) })),
  };
  try {
    await writeLedger(id, record);
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
          return { from, to: s.email, subject, html: own.html, headers: own.headers };
        })
      );
      result = await sendBatch(emails, batch.key, label, resendKey);
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
    await writeLedger(id, final);
  } catch (err) {
    console.error(`❌ ${done ? "Every email went out" : `${sent}/${total} went out`}, but the send ledger couldn't be updated: ${err.message}`);
    console.error(
      `   账本停在「发送中」，后面几档不会自动重发。确认后：node --env-file=.env.local scripts/lib/digest-email-ledger.mjs set ${id} ${done ? "sent" : "failed"}`
    );
    return 1;
  }

  const droppedNote = dropped ? `, ${dropped} unsubscribed or left the newest 1000 before their retry` : "";
  if (done) {
    console.log(`\n✅ Email push complete: ${sent}/${total} sent${droppedNote}`);
    return 0;
  }
  console.error(`\n❌ Email push incomplete: ${sent}/${total} sent${droppedNote}`);
  console.error(`   ${stillPending.length} batch(es) not sent yet. Running again sends only those, with the same Idempotency-Keys`);
  return 1;
}
