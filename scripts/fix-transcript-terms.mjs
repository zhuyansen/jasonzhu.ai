#!/usr/bin/env node
/**
 * 修正 whisper 转录里已知的专有名词识别错误（Grok/GoSail 这类品牌词经常被听岔）。
 * 对指定目录下所有 .txt/.srt/.vtt 原地替换。
 * 用法：node scripts/fix-transcript-terms.mjs [目录名，默认 course-transcripts]
 */
import fs from "fs";
import path from "path";

const DIR = path.join(import.meta.dirname, process.argv[2] || "course-transcripts");

// 顺序重要：先替换长词，避免短词替换污染长词（比如先修 superglock 再修 glock）
const FIXES = [
  [/superglock/gi, "SuperGrok"],
  [/glock/gi, "Grok"],
  [/go\s*sell\s*club/gi, "GoSail Club"],
  [/gosell\s*global/gi, "GoSail Global"],
  [/乐点/g, "热点"],
  [/primo/gi, "Premium"],
  [/premote/gi, "Premium"],
  [/plymouth/gi, "Premium"],
];

let totalReplacements = 0;
for (const file of fs.readdirSync(DIR)) {
  if (!/\.(txt|srt|vtt)$/.test(file)) continue;
  const filePath = path.join(DIR, file);
  let content = fs.readFileSync(filePath, "utf-8");
  let fileReplacements = 0;
  for (const [pattern, replacement] of FIXES) {
    const matches = content.match(pattern);
    if (matches) fileReplacements += matches.length;
    content = content.replace(pattern, replacement);
  }
  if (fileReplacements > 0) {
    fs.writeFileSync(filePath, content);
    console.log(`  ${file}: ${fileReplacements} 处修正`);
    totalReplacements += fileReplacements;
  }
}
console.log(`✅ 共修正 ${totalReplacements} 处`);
