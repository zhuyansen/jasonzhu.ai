/**
 * 快讯邮件的发信账本（2026-11-06 起）：每天那期邮件发到哪了，记在 Vercel KV（Upstash REST），key 是 digest-email:<北京日期>。
 *
 * 为什么要有：daily-news.yml 只在提交快讯的那一档发信，后面两档看到快讯已发布就整轮跳过。以前那一档发信失败
 * （Resend 5xx、Supabase 抖一下、缺 UNSUBSCRIBE_SECRET），当天就没人收到，也没有告警；一批被 Resend 拒掉也只打一行日志、照样算成功
 * （10 月有两周每天 100 个人收不到，就是这样没人发现）。
 * 现在：后面两档看到「快讯已发布、邮件没发完」就只补发邮件；最后一档还没发完，给 ALERT_EMAIL 告警。
 *
 * 不重复发（2026-10-27 修过每档重试都给全体订阅者再发一遍的事故）：
 *   - 发之前先记「发送中」和这次的名单：按 50 人一批固定下来，每批一个 Resend Idempotency-Key。记不进去就不发。
 *   - 补发只发还没确认发出的批次，用原来的名单和 key；Resend 24 小时内见到同一个 key 不会再发。
 *   - 看到「发送中」却没有收尾（发到一半进程没了，或发完了但账本没记上），不自动重发，等人看日志和 Resend 后台后用 set 命令改。
 *   - KV 不通就不发：没法确认之前发没发，宁可不发（最后一档会告警）。
 *
 * 账本内容（JSON）：
 *   status    sending 发送中 | sent 发完了 | failed 没发完（等下一档补发）| skipped 这期按要求不发（手动跑选了 skip_email）
 *   total     这期要发的人数（第一次发时固定）；sent 已确认发出的人数
 *   pending   还没发出的批次 [{ key, ids: [订阅者 id] }]（只存 id，不存邮箱）
 *   dropped   补发前退订、或被新订阅挤出最新 1000 个的人数（不补发给他们）
 *   attempts / run / startedAt / finishedAt / error
 *
 * 命令行（工作流和人工排查用；只用 fetch、不依赖 npm 包，runner 自带的 node 就能跑）：
 *   node scripts/lib/digest-email-ledger.mjs status [日期]    打印一个词：sent | skipped | failed | sending | none | unknown（读不到）
 *   node scripts/lib/digest-email-ledger.mjs summary [日期]   一句话说明（告警邮件用）
 *   node scripts/lib/digest-email-ledger.mjs show [日期]      一句话说明 + 账本 JSON（id 列表只打印人数）
 *   node scripts/lib/digest-email-ledger.mjs skip [日期]      记成「这期不发」（已有记录就不动）
 *   node scripts/lib/digest-email-ledger.mjs set <日期> sent|failed   人工处理卡在「发送中」的那天
 * 日期默认今天（北京）。本地跑：node --env-file=.env.local scripts/lib/digest-email-ledger.mjs show
 *
 * 周报也用这个账本（2026-11-10 起；以前周报没有任何记录，跑两次、或一批失败后重跑，都会给全体再发一遍）：
 * 上面命令里的日期换成 weekly:<文章 slug>，如 show weekly:chuhai-weekly-05。KV key 是 weekly-email:<slug>，留 180 天。
 */
import { pathToFileURL } from "node:url";

const LEDGER_TTL = 30 * 24 * 3600; // 快讯账本留 30 天，够查
const WEEKLY_TTL = 180 * 24 * 3600; // 周报账本留 180 天：一期只发一次，隔几个月误跑同一期也要挡住
const LOCK_TTL = 30 * 60; // 发信锁 30 分钟：比 daily-news 的 25 分钟超时长，进程死了锁也会自己过期

/** 北京日期（快讯按北京日期分期，和 collect-news.mjs、send-digest-email.mjs 一样） */
export function beijingToday() {
  return new Date(Date.now() + 8 * 3600 * 1000).toISOString().slice(0, 10);
}

/** 账本 id：北京日期（快讯）或 weekly:<slug>（周报） */
const WEEKLY = /^weekly:([a-z0-9][a-z0-9-]*)$/;
const kind = (id) => (WEEKLY.test(id) ? "weekly-email" : "digest-email");
const bare = (id) => id.replace(/^weekly:/, "");
export const ledgerKey = (id) => `${kind(id)}:${bare(id)}`;
const lockKey = (id) => `${kind(id)}-lock:${bare(id)}`;
const ttlOf = (id) => String(WEEKLY.test(id) ? WEEKLY_TTL : LEDGER_TTL);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** 发一条 Redis 命令（Upstash REST：POST 一个 JSON 数组）。网络错误 / 5xx / 429 最多试 3 次，其余直接报错。 */
async function kv(command) {
  // 兼容两种命名：Vercel KV 经典命名 / Upstash 原生命名（和 src/lib/lead-backup.ts 一样）
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) throw new Error("KV not configured (KV_REST_API_URL / KV_REST_API_TOKEN)");
  for (let attempt = 1; ; attempt++) {
    let problem;
    let retryable = true;
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(command),
        signal: AbortSignal.timeout(10_000),
      });
      const body = await res.json().catch(() => null);
      if (res.ok && body && body.error === undefined) return body.result;
      problem = `${res.status} ${body?.error ?? ""}`.trim();
      retryable = res.status >= 500 || res.status === 429;
    } catch (err) {
      problem = err.message;
    }
    if (!retryable || attempt >= 3) throw new Error(`KV ${command[0]} failed: ${problem}`);
    await sleep(1000 * attempt);
  }
}

/** 读某天的账本；没有记录返回 null，读不到（KV 不通、不是 JSON）抛错 */
export async function readLedger(date) {
  const raw = await kv(["GET", ledgerKey(date)]);
  if (raw === null || raw === undefined) return null;
  try {
    return JSON.parse(raw);
  } catch {
    throw new Error(`${ledgerKey(date)} is not JSON: ${String(raw).slice(0, 80)}`);
  }
}

export async function writeLedger(date, record) {
  const value = JSON.stringify({ ...record, date, updatedAt: new Date().toISOString() });
  await kv(["SET", ledgerKey(date), value, "EX", ttlOf(date)]);
}

/** 记成「这期不发」；已经有记录（发过、发到一半）就不动。返回有没有记上。 */
export async function markSkipped(date, run) {
  const value = JSON.stringify({ date, status: "skipped", run, updatedAt: new Date().toISOString() });
  return (await kv(["SET", ledgerKey(date), value, "NX", "EX", ttlOf(date)])) === "OK";
}

/** 发信锁：同一天同一时刻只让一个进程发（工作流本身是串行的，这把锁防本地手动跑正好撞上）。 */
export async function acquireLock(date, owner) {
  if ((await kv(["SET", lockKey(date), owner, "NX", "EX", String(LOCK_TTL)])) === "OK") return true;
  // SET 其实成功了、只是回包丢了又试了一次：锁里是自己就算拿到
  return (await kv(["GET", lockKey(date)])) === owner;
}

export async function releaseLock(date, owner) {
  if ((await kv(["GET", lockKey(date)])) === owner) await kv(["DEL", lockKey(date)]);
}

const pendingPeople = (record) => (record.pending || []).reduce((n, batch) => n + batch.ids.length, 0);

/** 一句话说明账本（日志、告警邮件、show 命令用） */
export function describe(record, date) {
  if (!record) {
    return `${date} 没有发信记录：发信那一步没跑到，或在记账前就退出了（比如缺 RESEND_API_KEY / UNSUBSCRIBE_SECRET / KV 配置），看运行日志`;
  }
  const dropped = record.dropped ? `；${record.dropped} 人在补发前退订或被挤出最新 1000 个，没补发` : "";
  switch (record.status) {
    case "sent":
      if (record.manualFix) return `人工标记为发完（${record.manualFix}；账本里确认发出 ${record.sent}/${record.total}，${record.run}）`;
      return `已发完 ${record.sent}/${record.total}${dropped}（${record.run}）`;
    case "skipped":
      return `这期按要求不发邮件（${record.run}）`;
    case "sending":
      return (
        `停在「发送中」：${record.run} 从 ${record.startedAt} 开始发，没有收尾（发到一半进程没了，或发完了但账本没记上），` +
        `账本里确认发出 ${record.sent}/${record.total}`
      );
    case "failed":
      if (record.total === undefined) return `一封都没发：${record.error}（${record.run}，第 ${record.attempts} 次）`;
      return (
        `没发完：已发 ${record.sent}/${record.total}，还有 ${record.pending?.length ?? 0} 批 ${pendingPeople(record)} 人没发出去${dropped}；` +
        `最近一次报错：${record.error}（${record.run}，第 ${record.attempts} 次）`
      );
    default:
      return `看不懂的状态：${record.status}`;
  }
}

// ─── 命令行 ─────────────────────────────────────────

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function pickDate(arg) {
  const date = arg || beijingToday();
  if (!DATE_RE.test(date) && !WEEKLY.test(date)) throw new Error(`not a date: ${date} (want YYYY-MM-DD, or weekly:<slug> for a weekly issue)`);
  return date;
}

async function cli([command, ...args]) {
  switch (command) {
    case "status": {
      // 工作流靠这个词决定这档干什么：读不到也要打印一个词（unknown），不让 step 挂掉
      try {
        const record = await readLedger(pickDate(args[0]));
        console.log(record?.status || "none");
      } catch (err) {
        console.error(`⚠️  ${err.message}`);
        console.log("unknown");
      }
      return 0;
    }
    case "summary": {
      const date = pickDate(args[0]);
      try {
        console.log(describe(await readLedger(date), date));
      } catch (err) {
        console.log(`读不到发信账本，没法确认发没发：${err.message}`);
      }
      return 0;
    }
    case "show": {
      const date = pickDate(args[0]);
      const record = await readLedger(date);
      console.log(describe(record, date));
      if (record) {
        const brief = { ...record, pending: record.pending?.map((b) => ({ key: b.key, people: b.ids.length })) };
        console.log(JSON.stringify(brief, null, 2));
      }
      return 0;
    }
    case "skip": {
      const date = pickDate(args[0]);
      const run = process.env.GH_RUN_URL || "manual";
      if (await markSkipped(date, run)) {
        console.log(`⏭️  ${date}：记成这期不发邮件，之后的定时档不会补发`);
      } else {
        console.log(`${date} 已经有发信记录，不改：${describe(await readLedger(date), date)}`);
      }
      return 0;
    }
    case "set": {
      // 只给人工用：卡在「发送中」时，看过运行日志和 Resend 后台再改
      const [dateArg, status] = args;
      const date = pickDate(dateArg);
      if (!dateArg || !["sent", "failed"].includes(status)) throw new Error("usage: set <YYYY-MM-DD> sent|failed");
      const record = await readLedger(date);
      if (!record) throw new Error(`${date} has no ledger record`);
      console.log(`before: ${describe(record, date)}`);
      const updated = { ...record, status, manualFix: new Date().toISOString() };
      if (status === "sent") {
        delete updated.pending;
        delete updated.error;
      }
      await writeLedger(date, updated);
      console.log(`after:  ${describe(updated, date)}`);
      if (status === "failed") {
        console.log(
          (WEEKLY.test(date) ? "在 Actions 里重新跑 Weekly Email（同一个 slug，mode=all）" : "下一档定时跑（或在 Actions 里手动 Run workflow，date 留空）") +
            "会补发 pending 里的批次，用原来的 Idempotency-Key：" +
            "Resend 只记 24 小时，离那次开始发超过 24 小时，已经发出的批次可能会重复。"
        );
      }
      return 0;
    }
    default:
      console.error("usage: digest-email-ledger.mjs status|summary|show|skip [YYYY-MM-DD]  |  set <YYYY-MM-DD> sent|failed");
      return 1;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  cli(process.argv.slice(2)).then(
    (code) => {
      process.exitCode = code;
    },
    (err) => {
      console.error(`❌ ${err.message}`);
      process.exitCode = 1;
    }
  );
}
