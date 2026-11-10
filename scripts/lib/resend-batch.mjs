/**
 * 群发邮件共用：把一批（≤50 封）交给 Resend，带 Idempotency-Key 和当场重试。
 * 快讯 send-digest-email.mjs 和周报 send-weekly-email.mjs 都用它（2026-11-10 从快讯脚本里搬出来，逻辑没改）。
 */
const RETRY_DELAYS = [2, 5, 15]; // 一批失败后当场重试前等几秒（共 4 次机会，同一个 Idempotency-Key）

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * 发一批（≤50 封）。同一批不管当场重试几次、隔几档补发，都用同一个 Idempotency-Key：Resend 24 小时内见过这个 key 只回放结果、不再发。
 * 返回 { ok: true } 或 { ok: false, error, stop }；stop = 这次别再发后面的批次了（密钥 / 额度问题，或 Resend 一直 5xx、超时）。
 */
export async function sendBatch(emails, key, label, resendKey) {
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
