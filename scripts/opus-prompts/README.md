# Opus 5.5 提示词库 · 采集管线

站内页面 `/[lang]/prompts/claude-opus-5-5` 的数据来源。原则：**代码能量的由代码量，模型只做判断，判断结果由代码对账。**

## 收录标准

创作者本人的原帖 · 帖子自带原生视频 · 原帖播放量 ≥ 5000 · 帖子明确说作品用 Claude Opus 5.5 制作。
模型归属以作者自述为准，未独立复现。提示词页只收「有出处的提示词」，出处限于：主帖正文、作者本人回复、作者回复里的截图、作者给出的外链。

## 流程

| 步骤 | 脚本 | 说明 |
|---|---|---|
| 1 搜索发现 | `discover.mjs` | twitterapi.io `advanced_search`，约 15 credits/条。X 搜索不能按播放量筛，先用 `min_faves` 粗筛 |
| 2 种子补全 | `seeds-fetch.mjs` | `data/seeds.txt` 里没被搜到的推文 ID，用 FXTwitter 免登录核验 |
| 3 归一 | `normalize.mjs` | 两路数据合成统一候选，视频取 ≤720p 里码率最高的 mp4 |
| 4 相关性分类 | `prompts/classify.md` | LLM 逐条判断是不是 Opus 5.5 的作品、分类、有无提示词线索 |
| 5 筛选 | `select.mjs` | 校验分类结果，产出进入下一步的 ID |
| 6 抓作者回复 | `threads.mjs` | `conversation_id:<id> from:<handle>`。**最贵的一步**：作者平均在自己帖子下回 7 条，约 110 credits/案例 |
| 7 提示词定位 | `bundles.mjs` + `prompts/extract.md` | LLM 只给出「在哪条推文、从哪到哪」，不复述原文 |
| 8 对账 | `verify.mjs` | 每段提示词必须能在源推文里逐字找到，否则打回 |
| 9 组装 | `assemble.mjs` | 合并 + 人工把关（`data/curation.json`）→ `src/content/opus-prompts/cases.json` |
| 10 编译 | `../generate-opus-prompts.mjs` | → `src/generated/` + `public/data/opus-prompts/`（已接入 prebuild） |

步骤 1–8 的原始抓取数据（约 11MB）不进仓库；仓库里只留 `data/` 下的判断结果和把关记录，够复跑 9–10。

```bash
node scripts/opus-prompts/assemble.mjs --write && node scripts/generate-opus-prompts.mjs
```

## 已知的坑

- **X 视频外链**：`video.twimg.com` 对带外站 Referer 的请求返回 403，不带 Referer 返回 206。所以 `/prompts/*` 必须是 `Referrer-Policy: no-referrer`（`next.config.ts` 响应头 + 页面 metadata 两处都设了）。改动这组页面的 header 前先想清楚。
- **视频链接会失效**：作者删帖或 X 换地址后视频 404，卡片会退回「去 X 看原视频」。建议每月重跑一次核验。
- **提示词的三种形态**：文字、截图、外链。截图要人工转写（`data/transcribed-images.json`）；外链里真贴了原文的很少，多数是项目 README 或需要登录的页面。
- **LLM 提取的典型误判**（都靠 `curation.json` 兜住）：把多轮对话里的追问当成提示词；把 Opus 写给别的模型的输出当成给 Opus 的指令；把作者的感想当成指令；把 one-shot 译成「一镜到底」。
- **同款提示词**：一条爆款提示词会被几十个人复用，成片各不相同。`generate-opus-prompts.mjs` 按开头归组，页面上标「同款提示词 · N 个作品」，统计不同提示词数时只算一次。

## 下架与更正

创作者要求更正署名或下架：在 `data/curation.json` 的 `dropCase` 里加上推文 ID 和原因，重跑步骤 9–10。
