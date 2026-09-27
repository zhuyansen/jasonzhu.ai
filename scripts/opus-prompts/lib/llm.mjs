/**
 * 模型调用。两个角色故意用两家模型：
 *   - worker（分类、定位提示词）：Claude，走快讯同一条容灾链 aigocode → apimart → 官方
 *   - reviewer（审核）：flatrouter 上的 GPT；没配 FLATROUTER_API_KEY 时退回 Claude 并在结果里注明
 * 同一个模型不能既干活又给自己签字，所以审核尽量用另一家。
 *
 * 本机 Node 过不了代理时设 CLAUDE_TRANSPORT=curl（CI 不设）。
 */
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
const run = promisify(execFile);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const CURL = process.env.CLAUDE_TRANSPORT === "curl";

const redact = (t) => String(t).replace(/(sk-|Bearer\s+)[A-Za-z0-9_\-]{8,}/g, "$1***");
export const usage = { worker: { calls: 0, in: 0, out: 0 }, reviewer: { calls: 0, in: 0, out: 0, provider: "" } };

const MODELS = (process.env.OPUS_LLM_MODELS || "claude-sonnet-5,claude-sonnet-4-6,claude-sonnet-4-5").split(",").map((s) => s.trim()).filter(Boolean);
const endpoints = [
  process.env.ANTHROPIC_AUTH_TOKEN && { label: "proxy", key: process.env.ANTHROPIC_AUTH_TOKEN, baseURL: process.env.ANTHROPIC_BASE_URL || "https://api.aigocode.app", models: MODELS },
  process.env.APIMART_API_KEY && { label: "apimart", key: process.env.APIMART_API_KEY, baseURL: process.env.APIMART_BASE_URL || "https://api.apimart.ai", models: [process.env.APIMART_MODEL || "claude-opus-4-6"] },
  process.env.ANTHROPIC_API_KEY && { label: "official", key: process.env.ANTHROPIC_API_KEY, baseURL: "https://api.anthropic.com", models: MODELS },
].filter(Boolean);

async function post(url, headers, body, timeoutMs) {
  if (CURL) {
    // 密钥绝不能出现在命令行参数里：execFile 失败时 Node 会把整条命令写进报错，进而进日志。
    // 请求头走 stdin 的 curl 配置（-K -），请求体走临时文件。
    const file = path.join(os.tmpdir(), `opus-llm-${process.pid}-${Date.now()}-${Math.random().toString(36).slice(2)}.json`);
    fs.writeFileSync(file, JSON.stringify(body), { mode: 0o600 });
    try {
      const p = run("curl", ["-sS", "--max-time", String(Math.ceil(timeoutMs / 1000)), "-w", "\n%{http_code}", "-K", "-", "--data-binary", `@${file}`, url], { maxBuffer: 64e6 });
      p.child.stdin.end(Object.entries(headers).map(([k, v]) => `header = "${k}: ${String(v).replace(/"/g, '\\"')}"`).join("\n") + "\n");
      const { stdout } = await p;
      const i = stdout.lastIndexOf("\n");
      return { status: Number(stdout.slice(i + 1)), text: stdout.slice(0, i) };
    } catch (e) {
      throw new Error(`curl failed (exit ${e.code ?? "?"}): ${String(e.stderr || "").trim().slice(0, 160) || "no stderr"}`);
    } finally { fs.rmSync(file, { force: true }); }
  }
  const res = await fetch(url, { method: "POST", headers, body: JSON.stringify(body), signal: AbortSignal.timeout(timeoutMs) });
  return { status: res.status, text: await res.text() };
}

/** 从模型输出里抠出 JSON（容忍代码围栏和前后废话） */
export function parseJSON(text) {
  const t = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  try { return JSON.parse(t); } catch { /* fallthrough */ }
  const a = t.indexOf("["), o = t.indexOf("{");
  const start = a >= 0 && (o < 0 || a < o) ? a : o;
  const end = Math.max(t.lastIndexOf("]"), t.lastIndexOf("}"));
  if (start < 0 || end <= start) throw new Error("no JSON in output");
  return JSON.parse(t.slice(start, end + 1));
}

let epIdx = 0;
const modelIdx = new Map();

async function claudeText(prompt, { maxTokens, timeoutMs }) {
  if (!endpoints.length) throw new Error("没有可用的 Claude 端点（缺 ANTHROPIC_AUTH_TOKEN / APIMART_API_KEY / ANTHROPIC_API_KEY）");
  const ep = endpoints[epIdx];
  const model = ep.models[modelIdx.get(ep.label) || 0];
  const { status, text } = await post(`${ep.baseURL}/v1/messages`, { "x-api-key": ep.key, "anthropic-version": "2023-06-01", "content-type": "application/json" },
    { model, max_tokens: maxTokens, messages: [{ role: "user", content: prompt }] }, timeoutMs);
  if (status >= 400 || !text) {
    const err = new Error(`${ep.label}/${model} HTTP ${status}: ${redact(text.slice(0, 200))}`);
    // 代理对模型名敏感：4xx 且报模型问题 → 换下一个模型，不算一次失败
    err.modelProblem = status >= 400 && status < 500 && /model/i.test(text) && (modelIdx.get(ep.label) || 0) < ep.models.length - 1;
    throw err;
  }
  const j = JSON.parse(text);
  if (j.type === "error") throw new Error(`${ep.label}/${model} API error: ${JSON.stringify(j.error).slice(0, 200)}`);
  usage.worker.calls++; usage.worker.in += j.usage?.input_tokens || 0; usage.worker.out += j.usage?.output_tokens || 0;
  if (j.stop_reason === "max_tokens") { const e = new Error(`${ep.label}/${model} output truncated at max_tokens`); e.tooBig = true; throw e; }
  return { text: (j.content || []).filter((b) => b.type === "text").map((b) => b.text).join("").trim(), via: `${ep.label}/${model}` };
}

async function withFailover(label, fn, validate) {
  let bad = 0, last;
  for (let attempt = 1; attempt <= 6; attempt++) {
    try {
      const { text, via } = await fn();
      const json = parseJSON(text);
      const problem = validate?.(json);
      if (problem) throw new Error(`bad output: ${problem}`);
      return { json, via };
    } catch (e) {
      last = e;
      if (e.tooBig) throw e; // 这批太大，换谁都一样，让调用方拆批
      const ep = endpoints[epIdx];
      if (e.modelProblem) { modelIdx.set(ep.label, (modelIdx.get(ep.label) || 0) + 1); attempt--; console.log(`  ↪ ${label}: ${ep.label} 不支持该模型，换 ${ep.models[modelIdx.get(ep.label)]}`); continue; }
      console.log(`  ⚠️ ${label} attempt ${attempt}: ${String(e.message).slice(0, 160)}`);
      // 同一家连续两次失败就换后端（7/14 教训：坏输出靠重试同一家没用）
      if (++bad >= 2 && epIdx < endpoints.length - 1) { epIdx++; bad = 0; console.log(`  🔀 ${label}: 切到 ${endpoints[epIdx].label}`); }
      await sleep(3000 * attempt);
    }
  }
  throw new Error(`${label} failed after retries: ${last?.message}`);
}

export const workerJSON = (prompt, { label = "worker", maxTokens = 8000, timeoutMs = 240000, validate } = {}) =>
  withFailover(label, () => claudeText(prompt, { maxTokens, timeoutMs }), validate);

export async function reviewerJSON(prompt, { label = "reviewer", maxTokens = 6000, timeoutMs = 240000, validate } = {}) {
  const key = process.env.FLATROUTER_API_KEY;
  if (!key) {
    usage.reviewer.provider = "claude (未配置 FLATROUTER_API_KEY，审核与干活是同一家模型)";
    return workerJSON(prompt, { label, maxTokens, timeoutMs, validate });
  }
  const base = (process.env.FLATROUTER_BASE_URL || "https://api.flatrouter.com/v1").replace(/\/$/, "");
  const model = process.env.OPUS_REVIEWER_MODEL || "gpt-6-astra";
  usage.reviewer.provider = `flatrouter/${model}`;
  let last;
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      const { status, text } = await post(`${base}/chat/completions`, { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        { model, temperature: 0.1, max_tokens: maxTokens, messages: [{ role: "system", content: "You are a strict content auditor. Output only JSON." }, { role: "user", content: prompt }] }, timeoutMs);
      if (status >= 400 || !text) throw new Error(`HTTP ${status}: ${redact(text.slice(0, 200))}`);
      const j = JSON.parse(text);
      usage.reviewer.calls++; usage.reviewer.in += j.usage?.prompt_tokens || 0; usage.reviewer.out += j.usage?.completion_tokens || 0;
      const json = parseJSON(j.choices?.[0]?.message?.content || "");
      const problem = validate?.(json);
      if (problem) throw new Error(`bad output: ${problem}`);
      return { json, via: usage.reviewer.provider };
    } catch (e) { last = e; console.log(`  ⚠️ ${label} attempt ${attempt}: ${String(e.message).slice(0, 160)}`); await sleep(4000 * attempt); }
  }
  // 第二模型彻底不可用：不降级成自审自签，让调用方把这批全部转人工
  throw new Error(`reviewer unavailable: ${last?.message}`);
}
