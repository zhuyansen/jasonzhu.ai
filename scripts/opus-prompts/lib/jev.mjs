/**
 * TypeSafe Jev 审核（OpenRouter decisions 接口，~typesafe/jev-latest）。
 * 只问封闭问题、一次前向拿概率分布，单条约 $0.00003。按作者的实验经验，问「这是什么」（多选一）而不是「是不是」。
 *
 * 2026-09-30 用现有标注评测：
 *   提示词好坏（人工看过的 259 条）AUC 0.946，阈值 0.9 时 20 条坏提示词零漏放
 *   是不是本人作品（分类器标注 432 条）AUC 0.929
 *   主要误判：把「Opus 5.5 太强了」这类一句话配视频的本人作品判成 commentary —— 所以 commentary 不直接否决，交 Opus 终审
 */
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
const run = promisify(execFile);
export const jevUsage = { calls: 0, cost: 0, model: "" };

const KIND = {
  own_work: "The poster shows a visual work they made or directed with the AI (animation, video, motion graphic, 3D scene, game, simulation, interactive page, ad, explainer)",
  own_comparison: "The poster ran the same task on several AI models themselves and shows the outputs side by side",
  repost: "The poster showcases somebody else's result (aggregator, fan or news account, 'someone made this', 'this guy')",
  tutorial_or_talk: "A tutorial, walkthrough, course promo, talking head, podcast or interview clip",
  news: "A launch announcement, feature news, pricing or benchmark chart",
  commentary: "Commentary, opinion, a joke or meme, a reaction",
  non_visual: "A non-visual product or tool (trading bot, CLI, data pipeline) where the video is just a screen demo of software",
};
const PROMPT = {
  usable: "A self-contained instruction someone could paste to an AI to get a comparable result",
  followup: "A follow-up message from the middle of a longer session (refers to earlier work: 'now add', 'continue', 'fix that')",
  fragment: "Only part of an instruction, cut off or clearly incomplete",
  commentary: "The creator's commentary about what they did, not the instruction itself",
  for_other_model: "An instruction the AI wrote for a different model (image or video generator), not the creator's instruction to the AI",
  empty: "Has no real content about what to make ('have fun', 'make no mistakes', 'show off')",
  needs_attachment: "Meaningless without an attachment or reference the reader cannot see ('make a similar one', 'recreate it')",
};
const HARD_OUT = ["repost", "tutorial_or_talk", "news", "non_visual"]; // 高把握时可直接否决的类型（commentary 不在内）
const clip = (t, n) => (t.length <= n ? t : t.slice(0, n - 200) + " … " + t.slice(-180));

function request(cases) {
  const lines = ["Posts on X that mention Claude Opus 5.5, Sonnet 5.5 or Fable 5.5 and have a video attached. Judge each post on its own.", ""];
  const questions = {};
  cases.forEach((c, i) => {
    const k = `p${i + 1}`;
    lines.push(`=== ${k} (by @${c.handle}) ===`, `POST: ${clip(c.text.replace(/https:\/\/t\.co\/\w+/g, ""), 1400)}`);
    if (c.thread?.length) lines.push(`CREATOR'S OWN REPLIES: ${clip(c.thread.join(" / "), 700)}`);
    if (c.prompt) lines.push(`LOCATED PROMPT: ${clip(c.prompt, 900)}`);
    lines.push("");
    questions[`${k}_kind`] = { type: "choice", instructions: `What is post ${k}?`, criteria: KIND };
    if (c.prompt) questions[`${k}_prompt`] = { type: "choice", instructions: `What is the LOCATED PROMPT of ${k}?`, criteria: PROMPT };
  });
  return { model: process.env.JEV_MODEL || "~typesafe/jev-latest", state: lines.join("\n"), questions };
}

async function call(cases, key) {
  const file = path.join(os.tmpdir(), `jev-${process.pid}-${Math.random().toString(36).slice(2)}.json`);
  fs.writeFileSync(file, JSON.stringify(request(cases)), { mode: 0o600 });
  try {
    for (let a = 1; a <= 5; a++) {
      try {
        // 密钥走 stdin 的 curl 配置，不进命令行
        const p = run("curl", ["-sS", "-m", "150", "-K", "-", "-w", "\n%{http_code}", "--data-binary", `@${file}`, "https://openrouter.ai/api/alpha/decisions"], { maxBuffer: 64e6 });
        p.child.stdin.end(`header = "Authorization: Bearer ${key}"\nheader = "Content-Type: application/json"\n`);
        const { stdout } = await p; const i = stdout.lastIndexOf("\n"); const status = +stdout.slice(i + 1), text = stdout.slice(0, i);
        if (status === 429 || status >= 500) throw new Error(`HTTP ${status}`);
        if (status >= 400) { const e = new Error(`HTTP ${status}: ${text.slice(0, 160).replace(/sk-[\w-]{8,}/g, "sk-***")}`); e.fatal = true; throw e; }
        const o = JSON.parse(text);
        jevUsage.calls++; jevUsage.cost += +(o.usage?.cost || 0); jevUsage.model = o.model || jevUsage.model;
        return cases.map((_, j) => ({ kind: o.answers[`p${j + 1}_kind`], prompt: o.answers[`p${j + 1}_prompt`] }));
      } catch (e) {
        if (e.fatal || a === 5) throw new Error(String(e.stderr || e.message).slice(0, 160));
        await new Promise((r) => setTimeout(r, 3000 * a));
      }
    }
  } finally { fs.rmSync(file, { force: true }); }
}

/**
 * @param cases [{ id, handle, text, thread: string[], prompt?: string }]
 * @returns Record<id, { verdict, confidence, prompt_ok, issues, reason, jev }>，与 GPT 审核同一形状
 */
export async function jevAudit(cases) {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) throw new Error("缺 OPENROUTER_API_KEY");
  const out = {};
  for (let i = 0; i < cases.length; i += 8) {
    const part = cases.slice(i, i + 8);
    const ans = await call(part, key);
    part.forEach((c, j) => {
      const k = ans[j].kind, pr = ans[j].prompt, P = k?.probabilities || {};
      const pIn = (P.own_work || 0) + (P.own_comparison || 0);
      const hard = HARD_OUT.reduce((s, x) => s + (P[x] || 0), 0);
      const usable = pr ? pr.probabilities?.usable ?? 0 : null;
      let verdict = "hold", conf = "low", reason = `Jev: ${k?.choice} (作品 ${pIn.toFixed(2)})`;
      if (pIn >= 0.9) { verdict = "publish"; conf = "high"; }
      else if (hard >= 0.9) { verdict = "reject"; conf = "high"; reason = `Jev: ${k.choice} ${hard.toFixed(2)}`; }
      else if (k?.choice === "commentary") reason += "，Jev 判为评论（它常把一句话配视频的本人作品误判为评论）";
      let prompt_ok = null;
      if (pr) {
        if (usable >= 0.9) prompt_ok = true;
        else if (usable <= 0.1) prompt_ok = false;
        else if (verdict === "publish") { verdict = "hold"; conf = "medium"; reason += `；提示词可用性 ${usable.toFixed(2)}（${pr.choice}）拿不准`; }
        if (prompt_ok === false) reason += `；提示词判为 ${pr.choice}`;
      }
      out[c.id] = { verdict, confidence: conf, prompt_ok, issues: prompt_ok === false ? [`prompt_${pr.choice}`] : [], reason, jev: { kind: k?.choice, pIn: +pIn.toFixed(3), usable } };
    });
  }
  return out;
}
