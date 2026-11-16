# Gemini 4 合集 · 数据来源

站内页面 `/[lang]/prompts/gemini-4`，2026-11-16 建。收 X 上作者说用 Gemini 4（Argon、Carbon、Pro、Hydrogen…）写代码做出来的作品：Three.js / WebGL / Blender 脚本 / SVG / 网页，和 Claude 库同类。

## 数据从哪来：种子 + 每日收录

`assemble.mjs` 是唯一写 `src/content/gemini-prompts/gemini-4.json` 的地方，每次把两部分合在一起：

1. **种子**（`lib/seeds.mjs`）：Claude 5.5 库里作者**自己写的正文**提到 Gemini 4 的作品，2026-11-16 建库时导入。
   - 范围和题材都在 `data/seed-curation.json`：`category` 人工逐条定（Claude 库的分类在这里没用：种子几乎全是同题对比），`dropSeed` 是剔掉的及原因（只在引用的别人帖子里提到 Gemini 4、作品其实是别的模型做的）。
   - 每次组装都从 Claude 库重新取，所以播放量跟着 Claude 库的每周核验更新，Claude 库下架的这里也跟着消失。
   - Claude 库以后又收了提到 Gemini 4 的作品：`node scripts/gemini-prompts/seed-from-opus.mjs` 会列出没定题材的 ID，补进 `seed-curation.json`（不补也行，组装时跳过，每日收录通常自己也会收到）。
2. **每日收录**（`daily.mjs`，流程同 `../image-prompts/`，共用 `../opus-prompts/lib/`）：
   - 搜索 `"Gemini 4" OR "Gemini4" OR "gemini-4"`，带媒体、点赞 ≥100、浏览 ≥5000，延迟 24 小时，每天最多 80 个。
   - 作者自己写的正文没提 Gemini 4 的先剔掉（引用别人帖子里提到的不算，也挡掉 1965 年的 Gemini 4 航天任务）；官方 / 平台账号（Google、DeepMind、Arena…）在 `lib/profile.mjs` 的 `PLATFORM_HANDLES` 里剔掉。
   - 分类（`prompts/classify.md`）按题材分，同题对比照收；只收 Gemini 4 **写代码**做出来的东西，Nano Banana / Imagen / Veo 直接出的图和视频不收。
   - 抓作者回复 → 定位提示词 → 代码逐字对账 → Jev 审核（`lib/profile.mjs` 的 `JEV_PROFILE`）→ 拿不准的交 Opus 终审，终审不可用留在 `data/pending.json`，下次先补。
   - 没有图片库的「看图改标题」那步：作品是代码录屏，封面帧帮不上标题。
   - 同一条帖子种子里也有时用种子。
3. 子模型（`models`：argon / carbon / hydrogen / krypton / pro…）和对比对象（`rivals`，按厂商归组）由 `lib/profile.mjs` 从作者正文里认，新版本名出现时在那里和 `src/lib/gemini-prompts-shared.ts`、`generate-gemini-prompts.mjs` 三处一起加。

## 自动运行

在 `.github/workflows/opus-prompts-daily.yml` 里接在图片库后面跑（北京 9:17，Vercel Cron 按点触发），三个库一起提交一次，不多一次部署；这一步失败不挡别的库。组装放在 Claude 库组装之后，种子拿到的是当天的 Claude 库。只跑这个库或补跑某段时间：手动运行时 `only=gemini`，再填 `window_from` / `window_to`。

```bash
# 本机跑需要的 key 同图片库（本机没有 Opus 终审通道，拿不准的进 pending.json）
OPUS_TRANSPORT=curl WINDOW_FROM=2026-11-14T00:00Z WINDOW_TO=2026-11-15T00:00Z node scripts/gemini-prompts/daily.mjs --dry
node scripts/gemini-prompts/assemble.mjs --write && node scripts/generate-gemini-prompts.mjs
```

## 页面规则（同 ChatGPT Images 2.6 库）

- 没有提示词的作品不建详情页，卡片直链 X 原帖；robots.txt 不用逐条列。
- 媒体用图片库的 `media[]` 结构，卡片里视频按 16:9 显示（和 Claude 库一样）。
- 英文页订阅来源 `prompts-en-gemini`。

## 下架与更正

- 种子：`data/seed-curation.json` 的 `dropSeed` 加 ID 和原因。
- 每日收录的：`data/curation.json`（`dropCase` / `dropPrompt` / `title` / `category`，同图片库）。
- 改完重跑 `assemble.mjs --write` 和 `generate-gemini-prompts.mjs`。

## 还没做

- 10-14 到 11-14 之间、Claude 库没收到的 Gemini 4 作品（每日收录从建库前一天开始往后收）。要补就手动跑几次 `only=gemini` + `window_from` / `window_to`。
- 每周核验（刷新播放量、下架已删帖）：种子跟着 Claude 库更新，每日收录的还没有。
- GitHub 公开合集 `awesome-gemini-4-prompts`（`build-repo.mjs`）。
