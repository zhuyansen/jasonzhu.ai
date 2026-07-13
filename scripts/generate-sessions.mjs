#!/usr/bin/env node
/**
 * 编译 GoSail Club 闭门讨论会数据：
 *   scripts/sessions-final.txt（日期+主题+文件名+标题）
 *   + scripts/sessions-manifest.jsonl（Cloudflare Stream uid）
 *   + scripts/sessions-transcripts/<name>.srt（本地 whisper 转录，带时间戳）
 *   → src/generated/sessions.json
 *
 * 用法：node scripts/generate-sessions.mjs
 */
import fs from "fs";
import path from "path";

const ROOT = path.join(import.meta.dirname, "..");
const LIST_PATH = path.join(ROOT, "scripts/sessions-final.txt");
const MANIFEST_PATH = path.join(ROOT, "scripts/sessions-manifest.jsonl");
const TRANSCRIPT_DIR = path.join(ROOT, "scripts/sessions-transcripts");
const OUT_PATH = path.join(ROOT, "src/generated/sessions.json");

const CF_CUSTOMER_CODE = "cnda9ycjoid8ngxv"; // customer-<code>.cloudflarestream.com，跟增长视频课共用同一个 Cloudflare Stream 账号

function parseSrt(content) {
  const blocks = content.trim().split(/\r?\n\r?\n/);
  const segments = [];
  for (const block of blocks) {
    const lines = block.split(/\r?\n/).filter(Boolean);
    if (lines.length < 2) continue;
    const timeLine = lines.find((l) => l.includes("-->"));
    if (!timeLine) continue;
    const [startStr, endStr] = timeLine.split("-->").map((s) => s.trim());
    const text = lines.slice(lines.indexOf(timeLine) + 1).join(" ").trim();
    segments.push({ start: srtTimeToSeconds(startStr), end: srtTimeToSeconds(endStr), text });
  }
  return segments;
}

function srtTimeToSeconds(t) {
  const [h, m, sMs] = t.split(":");
  const [s, ms] = sMs.split(",");
  return Number(h) * 3600 + Number(m) * 60 + Number(s) + Number(ms) / 1000;
}

// ── 读日期+主题+标题清单 ──
const list = fs
  .readFileSync(LIST_PATH, "utf-8")
  .split("\n")
  .map((l) => l.trim())
  .filter(Boolean)
  .map((line) => {
    const [date, topic, filename, title] = line.split("|");
    return { date, topic, filename, title };
  });

// ── 读 uid 映射（全部上传完的 manifest 优先；还在传的话读 .tmp 里已完成的部分） ──
const uidByFilename = {};
const manifestSource = fs.existsSync(MANIFEST_PATH) ? MANIFEST_PATH : `${MANIFEST_PATH}.tmp`;
if (fs.existsSync(manifestSource)) {
  for (const line of fs.readFileSync(manifestSource, "utf-8").split("\n")) {
    if (!line.trim()) continue;
    const d = JSON.parse(line);
    uidByFilename[d.filename] = d.uid;
  }
}

// ── 组装 sessions，按日期倒序（最新的讨论会在前） ──
const sessions = list
  .map(({ date, topic, filename, title }) => {
    const stem = filename.replace(/\.[^.]+$/, "");
    const srtPath = path.join(TRANSCRIPT_DIR, `${stem}.srt`);
    const transcript = fs.existsSync(srtPath) ? parseSrt(fs.readFileSync(srtPath, "utf-8")) : [];
    const uid = uidByFilename[filename] || null;
    const duration = transcript.length ? Math.round(transcript[transcript.length - 1].end) : null;

    return {
      slug: stem.replace(/[^a-zA-Z0-9一-龥]+/g, "-"),
      date,
      topic,
      title,
      uid,
      hlsUrl: uid ? `https://customer-${CF_CUSTOMER_CODE}.cloudflarestream.com/${uid}/manifest/video.m3u8` : null,
      iframeUrl: uid ? `https://customer-${CF_CUSTOMER_CODE}.cloudflarestream.com/${uid}/iframe` : null,
      thumbnailUrl: uid ? `https://customer-${CF_CUSTOMER_CODE}.cloudflarestream.com/${uid}/thumbnails/thumbnail.jpg` : null,
      durationSeconds: duration,
      transcript,
    };
  })
  .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));

fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
fs.writeFileSync(OUT_PATH, JSON.stringify({ title: "GoSail Club 闭门讨论会", sessions }, null, 2));

const ready = sessions.filter((e) => e.uid).length;
const withTranscript = sessions.filter((e) => e.transcript.length > 0).length;
console.log(`✅ 生成 ${OUT_PATH}`);
console.log(`   ${sessions.length} 场，${ready} 场已有视频，${withTranscript} 场已有字幕`);
