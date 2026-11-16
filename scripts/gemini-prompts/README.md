# Gemini 4 合集 · 数据来源

站内页面 `/[lang]/prompts/gemini-4`，2026-11-16 建。收 X 上作者说用 Gemini 4（Argon、Carbon、Pro、Hydrogen…）写代码做出来的作品：Three.js / WebGL / Blender 脚本 / SVG / 网页，和 Claude 库同类。

## 现在的数据：种子

`seed-from-opus.mjs` 从 Claude 5.5 库（`src/content/opus-prompts/cases.json`，已过 Jev 审核和 Opus 终审）里挑出**作者自己写的正文**提到 Gemini 4 的作品，写进 `src/content/gemini-prompts/gemini-4.json`。不花钱、不调模型。

- 只在引用的别人帖子里提到 Gemini 4 的不算（建库时剔了 10 条，原因在 `data/seed-curation.json` 的 `dropSeed`）。
- 题材分类是人工逐条定的（`data/seed-curation.json` 的 `category`）：scene3d / physics / mechanics / game / sim / ui / svg / motion。Claude 库的分类在这里没用：种子里 135/138 都是「同题对比」。
- 子模型（`models`）和对比对象（`rivals`，按厂商归组）由 `lib/profile.mjs` 从作者正文里认。
- 因为种子来自 Claude 库，现在每条都是和 Claude 的对比（`rivals` 里都有 claude）。
- Claude 库以后新收了提到 Gemini 4 的作品：重跑 `node scripts/gemini-prompts/seed-from-opus.mjs`，脚本会报「没有题材分类」，在 `seed-curation.json` 里补上再跑。

```bash
node scripts/gemini-prompts/seed-from-opus.mjs --dry   # 只看统计
node scripts/gemini-prompts/seed-from-opus.mjs && node scripts/generate-gemini-prompts.mjs
```

## 页面规则（同 ChatGPT Images 2.6 库）

- 没有提示词的作品不建详情页，卡片直链 X 原帖；robots.txt 不用逐条列。
- 媒体用图片库的 `media[]` 结构，卡片里视频按 16:9 显示（和 Claude 库一样）。
- 英文页订阅来源 `prompts-en-gemini`。

## 还没做

- 每日自动收录（X 搜索 → 分类 → 定位提示词 → Jev 审核 → Opus 终审），照 `../image-prompts/` 做一份，接进 `.github/workflows/opus-prompts-daily.yml`。
- GitHub 公开合集 `awesome-gemini-4-prompts`（`build-repo.mjs`）。
- 下架与更正：现在直接改 `data/seed-curation.json` 的 `dropSeed`，重跑上面两条命令。
