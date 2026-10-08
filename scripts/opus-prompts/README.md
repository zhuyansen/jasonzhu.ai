# Claude 5.5 提示词库（Opus 5.5 · Sonnet 5.5 · Haiku 5.5 · Fable 5.5）· 采集管线

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

- `data/added.json`：每个作品的**收录日期**（第一次进库，不是 X 发帖日期），assemble 给新作品写当次运行日期；页面「本周新增」横条、NEW 角标（最近 3 天）和「最近收录」排序都用它。2026-10-07 从 cases.json 的 git 历史回填。不要手动改。

```bash
node scripts/opus-prompts/assemble.mjs --write && node scripts/generate-opus-prompts.mjs
```

## 自动运行

| 什么 | 在哪 | 频率 | 需要密钥 |
|---|---|---|---|
| **每日收录新作品** | `.github/workflows/opus-prompts-daily.yml` → `daily.mjs` | 每天 10:30（北京） | `TWITTERAPI_IO_KEY`、`JEV_API_KEY`（Jev 官方）、`FLATROUTER_API_KEY`（备用审核）、Claude 那几个 |
| 数据核验：刷新播放量、修复过期视频地址、下架已删帖 | `.github/workflows/opus-prompts-refresh.yml` → `refresh.mjs` | 每周一 11:00（北京） | 不需要 |
| GitHub 合集同步 | `zhuyansen/awesome-opus-5.5-video` 的 `.github/workflows/sync.yml` | 每天 13:00（北京） | 不需要 |

### 每日收录怎么工作

1. **按时间增量搜**（每次最多一天的发布窗口，延迟 24 小时；落后时工作流连跑最多 3 轮自动追上，不需要手动补跑）：搜索词 `"Opus 5.5" OR "Sonnet 5.5" OR "Haiku 5.5" OR "Fable 5.5"`（`lib/x.mjs`，`SEARCH_TERMS` 可覆盖），只搜「两天前那 24 小时」发布的帖子（`since_time`/`until_time`），点赞 ≥100。延迟两天是让播放量涨到位。每条帖子只落在一个窗口里，只付一次钱；见过的 ID 记在 `data/seen.json`，永不重新处理。
2. **限量**：播放 ≥5000 的按播放量取前 80 个（`CAP`）。超出的当天放弃，不补。
   **模型标签**：`lib/models.mjs` 按作者文字判断是 Opus / Sonnet / Haiku / Fable 5.5，提到几个就标几个。**Fable 5.5 截至 2026-10-03 只在内测、未官宣**：页面和 GitHub 上标「内测·未官宣」；作者对模型本身不确定的（「(maybe) Fable 5.5」「疑似 Fable」）不收（`HEDGED`）。官宣后去掉 `MODEL_PREVIEW` 里的标注即可。
   **补跑某个时间段**（比如新模型发布后补首批）：`WINDOW_FROM=… WINDOW_TO=… SEARCH_TERMS='"Sonnet 5.5"' node scripts/opus-prompts/daily.mjs`，不会改动 `state.json` 的窗口。
3. **判断**：Claude 分类（**被筛掉的再让 Jev 过一道**：Jev 判本人作品 ≥0.9 就捞回，分类把握标低，交 Opus 终审定分类）→ 抓作者回复 → Claude 定位提示词 → `lib/resolve.mjs` 逐字对账，对不上带着报错重试一次，再不行按无提示词处理。
4. **审核**：**TypeSafe Jev**（`lib/jev.mjs`：Jev 官方接口 `api.typesafe.ai/v1/systemone`）对每个作品问两个多选题：这条帖子是什么（本人作品 / 本人做的模型对比 / 转发 / 教程 / 新闻 / 评论 / 非视觉产品），定位到的提示词是什么（可用 / 中途追问 / 片段 / 感想 / 给别的模型写的 / 空洞 / 依赖看不见的附件）。单条约 $0.00003。
   - 本人作品概率 ≥0.9 → 通过；转发/教程/新闻/非视觉合计 ≥0.9 → 否决；**判为评论或把握不足 → 交 Opus**
   - 提示词可用概率 ≥0.9 保留、≤0.1 去掉，中间交 Opus
   - 2026-09-30 评测：提示词好坏（人工真值 259 条）AUC 0.946、阈值 0.9 时零漏放；是不是作品（分类器标注 432 条）AUC 0.929。主要误判是把「Opus 5.5 太强了」这类一句话配视频的本人作品判成评论，所以评论不直接否决
   - Jev 不可用（或 `OPUS_AUDITOR=gpt`）时退回 GPT 审核（flatrouter，`prompts/audit.md`）
5. **裁决**：
   - 审核 `publish` 且把握 `high` → 直接提交 main 上线；审核否决了提示词的，作品照常收录但不带提示词
   - 审核 `reject` 且把握 `high` → 丢弃，写进运行摘要
   - 其余（把握不足、分类把握低、提示词在截图里）→ **Opus 终审**（`lib/arbitrate.mjs` + `prompts/arbitrate.md`）拍板通过或否决，并决定提示词留不留。模型优先 `claude-opus-5-5`，通道没开通就用 `claude-opus-5`（`OPUS_ARBITER_MODELS` 可覆盖）
6. **待审队列 / 滚动 PR**（分支 `opus-prompts/pending`）：只有 Opus 终审也不可用时才进这里。合并 = 批准全部；否决某条 = 把 ID 加进 `curation.json` 的 `dropCase`；不管它 = 14 天后自动丢弃。已有队列可用 `node scripts/opus-prompts/arbitrate-pending.mjs` 补跑终审。

干活模型容灾：aigocode（claude-sonnet-5 → sonnet-5-5 → opus-5）→ apimart（sonnet-5-5 → opus-4-6）→ 官方 → flatrouter gpt-6-astra（最后兜底；2026-10-03 评测它比 Claude 更容易漏掉夹在正文里的一句话指令）。

每次运行的摘要（Actions 页面）会列出 twitterapi.io 消耗和两家模型的 token 用量。

### 其他

两个仓库都是公开的，所以合集仓库自己来拉 `cases.json` 和 `build-repo.mjs` 就行，不用跨仓库推送凭证。

`refresh.mjs` 有保险丝：瞬时错误超过 5%，或一次新增不可用超过 10%，判定为接口异常，不写文件、以非零退出（GitHub 会发失败邮件）。「不可用」要同一轮里隔 20 秒再确认一次才算数。被下架的作品记在 `data/unavailable.json`，帖子恢复后下一轮会自动放回。

首次全量采集（步骤 1–9）是手动跑的，日常不需要再跑。

## 已知的坑

- **X 视频外链**：`video.twimg.com` 对带外站 Referer 的请求返回 403，不带 Referer 返回 206。所以 `/prompts/*` 必须是 `Referrer-Policy: no-referrer`（`next.config.ts` 响应头 + 页面 metadata 两处都设了）。改动这组页面的 header 前先想清楚。
- **视频链接会失效**：作者删帖或 X 换地址后视频 404，卡片会退回「去 X 看原视频」。每周的自动核验会修复地址、下架已删帖。
- **提示词的三种形态**：文字、截图、外链。截图要人工转写（`data/transcribed-images.json`）；外链里真贴了原文的很少，多数是项目 README 或需要登录的页面。
- **LLM 提取的典型误判**（都靠 `curation.json` 兜住）：把多轮对话里的追问当成提示词；把 Opus 写给别的模型的输出当成给 Opus 的指令；把作者的感想当成指令；把 one-shot 译成「一镜到底」。
- **同款提示词**：一条爆款提示词会被几十个人复用，成片各不相同。`generate-opus-prompts.mjs` 按开头归组，页面上标「同款提示词 · N 个作品」，统计不同提示词数时只算一次。

## 下架与更正

创作者要求更正署名或下架：在 `data/curation.json` 的 `dropCase` 里加上推文 ID 和原因，重跑步骤 9–10。
