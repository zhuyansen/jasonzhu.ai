# ChatGPT Images 2.6 合集 · 采集管线

站内页面 `/[lang]/prompts/chatgpt-images-2-6` 的数据来源，2026-11-05 建（Images 2.6 是 11-04 发布的）。流程和 `../opus-prompts/`（Claude 5.5 提示词库）相同，只把「视频作品」换成「图片 / GIF / 视频作品」。原则同样是：**代码能量的由代码量，模型只做判断，判断结果由代码对账。**

## 和 Claude 库共用什么

- 共用 `../opus-prompts/lib/`：X 搜索和作者回复（`x.mjs` 的 `paged` / `authorThread` / `pickMp4`）、模型调用（`llm.mjs`）、逐字对账（`resolve.mjs`）、Jev 审核（`jev.mjs`）、Opus 终审（`arbitrate.mjs`）。
- 共用模块只加了可选参数（Jev 的选项说明、终审的提示词和分类表），不传就是 Claude 库原来的行为。
- 这里自己的：媒体解析 `lib/media.mjs`、分类和 Jev 用语 `lib/profile.mjs`、四个提示词 `prompts/*.md`、`daily.mjs` / `assemble.mjs` / `build-repo.mjs`、数据 `data/`。

## 收录标准

创作者本人的原帖 · 帖子自带图片 / GIF / 视频 · 原帖浏览 ≥ 5000 · 帖子明确说是 ChatGPT Images 2.6（GPT-Image-2.6）做的。别家叫「2.6」的模型（Kling、Seedream…）在 `profile.mjs` 的 `mentionsModel` 里先剔掉。官方演示、平台推广、转发不收。真实可辨认人物的以假乱真图、涉及未成年人的不当内容直接否决（审核和终审的提示词里都写了）。

## 和 Claude 库不同的地方

- **Jev 的「写给别的模型」**：Claude 库里「AI 写给图像模型的提示词」是不可用；这里提示词本来就是给图像模型的，所以 `profile.mjs` 换了说明（ChatGPT 自己的回复、写给视频模型或只有 Midjourney 参数的才算）。不换的话好提示词会被成批判掉。
- **没有提示词的作品没有站内详情页**：卡片直接链到 X 原帖，不产生 noindex 页面，robots.txt 不用逐条列（Claude 库的 robots.txt 因为逐条列，11 月中旬会超 500 KiB）。
- **待审队列不开滚动 PR**：拿不准的作品留在 `data/pending.json`（带着作者回复），下次运行开头先交 Opus 终审；本机没有 Opus 通道时就一直留着，等工作流里补。
- **分类**：portrait / illustration / product / design / gif / edit / sticker / comparison。
- **看图起标题（2026-11-06 加）**：分类、审核、终审的模型都看不到图，标题常写成「动图生成测试」「生成图片示例」。分类之后多一步：每个作品的全部图（最多 4 张，GIF / 视频用封面帧，`name=small`）连同帖子文字交给能看图的模型（flatrouter 的 GPT，`llm.mjs` 的 `workerJSON` 加了可选的 `images`），重写中英文标题；纯视觉分类（人像 / 插画 / 产品 / 海报 / 表情包）以图为准，GIF / 改图 / 对比仍按帖子文字。看图写的标题标 `titleFrom: "image"`，后面的 GPT 备用审核和 Opus 终审不能改它。这一步也是唯一一道看像素的安全检查：色情、未成年人、血腥直接否决，列在运行摘要「看图安全否决」里；「可能是真人以假乱真」常被假截图里编的用户名误触发，所以只标出来交 Opus 终审按描述判（无名的写实人像不算）。看图失败就保留原标题，不挡收录。
- **官方 / 平台账号不收**：`profile.mjs` 的 `PLATFORM_HANDLES`（OpenAI、Higgsfield、Freepik、Krea 等）在搜索后直接剔掉。分类提示词也写了，但 11-05 补跑时 Higgsfield 自己的 4 条推广被当成作品。

## 自动运行

在 `.github/workflows/opus-prompts-daily.yml` 里接在 Claude 库后面跑（北京 9:17，一天一次），两个库一起提交一次，不多一次部署；这一步失败不挡 Claude 库。只跑图片库或补跑某段时间：手动运行时 `only=images`，再填 `window_from` / `window_to` 等。

GitHub 公开合集 `zhuyansen/awesome-chatgpt-images-2.6` 的 `.github/workflows/sync.yml` 每天北京 13:30 拉 `src/content/image-prompts/chatgpt-images-2-6.json` 和 `build-repo.mjs` 重新生成。

还没做：每周核验（刷新浏览量、下架已删帖），等作品多了再从 `../opus-prompts/refresh.mjs` 改一份。

## 本机跑

```bash
# 需要 TWITTERAPI_IO_KEY、JEV_API_KEY、FLATROUTER_API_KEY；本机没有 Opus 终审通道，拿不准的进 pending.json
OPUS_TRANSPORT=curl WINDOW_FROM=2026-11-04T23:00Z WINDOW_TO=2026-11-05T16:30Z node scripts/image-prompts/daily.mjs --dry
node scripts/image-prompts/assemble.mjs --write && node scripts/generate-image-prompts.mjs
```

下架与更正：在 `data/curation.json` 的 `dropCase` 里加推文 ID 和原因，重跑 assemble + generate。
