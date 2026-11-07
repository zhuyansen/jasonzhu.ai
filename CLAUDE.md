# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

JasonZhu.AI — 中文为主、双语（zh/en）的 AI 博客 + 每日 AI 快讯站。Next.js App Router，全站 SSG，内容以 Markdown 为源，Vercel 部署（push 到 main 自动部署）。订阅（lead magnet 换邮箱）是核心引流渠道。

## Commands

```bash
npm run dev                      # 本地开发（prebuild 会先跑内容生成）
npm run build                    # 生产构建（= 验证一切正常的"测试"）
npx tsc --noEmit                 # 类型检查
npx eslint .                     # lint（.obsidian/ 和 scripts/ 已 ignore）

# 内容变更后必跑（把 md 编译进 src/generated/）：
node scripts/generate-posts.mjs  # 博客 md → posts.json + post-content/*.json
node scripts/generate-news.mjs   # 快讯 md → news.json（含融资段/双语字段解析）
node scripts/generate-opus-prompts.mjs  # 提示词库 cases.json → generated + public/data

# 快讯手动补日（cron 失败时）：
CLAUDE_TRANSPORT=curl DATE=2026-XX-XX node scripts/collect-news.mjs --force

# 批量翻译（走 apimart 的 Claude，key 只在 GitHub secret 里，本机跑不了 → 用工作流）：
gh workflow run translate-content.yml -f mode=news -f all=true   # 给缺英文的快讯条目补 TitleEN / EN
CLAUDE_TRANSPORT=curl node scripts/translate-big-blogs.mjs [slug...]   # 超大文分块翻（需本地有 APIMART_CLAUDE_KEY）
node scripts/check-tag-labels.mjs   # 博客新用的中文标签有没有英文显示名

node scripts/check-sitemap.mjs   # 线上 sitemap URL 数量断言（防再次静默坏掉）
node scripts/indexnow.mjs [range|--url u...] [--dry-run]  # 推 Bing IndexNow；.github/workflows/indexnow.yml 在内容 push / 快讯与提示词 cron 后自动跑
node scripts/reconcile-leads.mjs # Supabase 恢复后把 KV 兜底的订阅线索、退订写回主表

# 群发邮件只看效果、不发信（不读名单、不需要密钥）：
MODE=preview PREVIEW_OUT=/tmp/d.html node scripts/send-digest-email.mjs   # DATE=YYYY-MM-DD 换一期
MODE=preview POST_SLUG=chuhai-weekly-01 PREVIEW_OUT=/tmp/w.html node scripts/send-weekly-email.mjs
```

Git：commit 后如远程有新提交（cron 会自动 commit 快讯），先 `git pull --rebase` 再 push。

## Architecture

**内容管线（核心模式：md 是源，generated JSON 是编译产物）**
- `src/content/blog/<slug>.md` → `generate-posts.mjs` → `src/generated/posts.json`（meta）+ `post-content/<slug>.json`（正文）。页面经 `src/lib/mdx.ts` 读取，MDXRemote 渲染。
- 双语约定：`<slug>.en.md` 是英文版（不算独立文章），meta 带 `hasEnglish`；`getPostBySlug(slug, lang)` 在 en 时优先英文、回退中文。frontmatter 支持 `updated`（渲染"更新于" + schema dateModified）。
- 作者：投稿文的作者取文末「`**撰稿人**: [名字](主页) | [原文链接](…)`」那一行（没有这行又要指定作者时，在 frontmatter 写 `author` / `authorUrl`，正文不用动），`generate-posts.mjs` 记进 meta 的 `author`。文章页标题下的撰稿人、文末作者卡、`<meta name="author">`、OG、twitter:creator、Article JSON-LD 的 author 都按它输出；撰稿人是 Jason 或没有这行的，按 Jason Zhu 输出。publisher 不变。
- 英文页不该出现中文（2026-10-31 全站扫过一遍）：新博客发布时一起写 `.en.md`（选品周报的定时任务已经这么做）；标签在 frontmatter 里保持中文，英文显示名在 `src/lib/tag-labels.ts`，新标签补进去；出海专题指南的英文版在 `src/lib/guides/en/`，改中文指南时同步改。封面也分中英：博客有封面的文章要出一张英文封面，`.en.md` frontmatter 写 `coverImage`（编辑式封面用 `python3 scripts/render-blog-cover.py spec.json`，spec 里 `"lang": "en"`，输出 `public/blog/<slug>/cover-en.png`）；快讯英文封面 `public/news/en/<日期>.png` 由 `render-news-cover-en.mjs` 按英文标题排版（字体在 `scripts/fonts/`，开源字体，GitHub Actions 上也能跑），`generate-news.mjs` 识别成 `coverImageEn`，英文页只用它，没有就不放封面。快讯 md 的英文行注入必须按行处理：旧翻译脚本的 `\Z`（JS 里是字面量 Z）和 `String.replace` 注入（标题里的 `$1` 被替换）插坏过 19 期。
- `src/content/news/<日期>.md` → `generate-news.mjs` → `news.json`。解析器把每个 `###` 段解析成结构化 item；特殊行：`- **TitleEN**：`/`- **EN**：`（双语）；`### 💰 AI 融资速递` 段解析成 `funding[]` 结构化卡片（不算 item）。融资卡的英文版在 frontmatter 的 `fundingEn`（按公司名对应，正文不动），由 daily-news 里的翻译步骤（`translate-content.mjs news`，失败不挡发布）补上。翻译之后还有一步出英文封面（`render-news-cover-en.mjs`，同样失败不挡发布）；补历史：`node scripts/render-news-cover-en.mjs --all`。

**快讯收录规则（2026-10-06 起，应对「无人监督批量 AI 内容」审计风险）**
- 快讯每天 AI 生成、自动发布 + 发邮件不变；但**默认 noindex、不进 sitemap**，`/news` 列表页也 noindex。只有 frontmatter 有 `humanComment`（Jason 本人点评）的那期才 index + 进 sitemap（`isDigestIndexable()`）。
- AI 生成的那句（字段名沿用 `jasonSays`）在页面 / 列表 / RSS / 邮件上标「AI 摘要」，不再署 Jason 的名；Jason 点评显示为「Jason 说」。生成 prompt 要求客观、不用第一人称。
- 点评入口：管理后台「快讯点评」标签 → `/api/admin/news` 通过 GitHub API 提交 frontmatter（需 Vercel 的 `GITHUB_CONTENTS_TOKEN`）→ 自动部署。清空点评 = 撤回、重新 noindex。不要再给快讯整体放开收录。
- 署名（2026-11-01 起）：快讯的作者是站点，JSON-LD 写 Organization「JasonZhu.AI」，`<meta name="author">` 和 `article:author` 同；有 `humanComment` 的那期再加 Person「Jason Zhu」，两项分开写。publisher 始终是 Jason。日期后的署名行「JasonZhu.AI · AI 整理 · Jason Zhu 点评」和它对应。不要改回全署 Jason（AI 写的内容署个人，属于 Google 说的误导性作者信息）。

**快讯 cron（.github/workflows/daily-news.yml）**
- 北京时间清晨 5:30/6:30/7:15 三档重试；`collect-news.mjs` 抓 RSS → Claude 结构化 → 写 md + Supabase → commit。今天的快讯已发出（≥3 条）时，后面几档不再采集、重画封面、提交：以前每档都重画封面、多一次提交和部署、给订阅者重复发信（2026-10-27 修）。邮件脚本按北京日期取当期。
- 发信账本（2026-11-06 起）：KV `digest-email:<北京日期>` 记这期邮件发到哪（`scripts/lib/digest-email-ledger.mjs`）。发信前先记「发送中」和按 50 人一批固定的名单，每批带 Resend `Idempotency-Key`（24 小时内同一个 key 不会再发），5xx / 429 / 超时当场重试；还有批次没发出去就以失败退出（以前一批被拒照样算成功，10 月每天 100 人收不到没人发现）。后面两档看到「快讯已发布、邮件没发完」只补发没发出的批次；已发完再跑（包括手动重跑）不会再发。最后一档快讯没生成、或邮件没发完（账本不是 sent / skipped），给 ALERT_EMAIL 告警。KV 不通就不发；停在「发送中」（发到一半进程没了，或收尾记账失败）不自动重发，看运行日志和 Resend 后台后用 `node --env-file=.env.local scripts/lib/digest-email-ledger.mjs set <日期> sent|failed` 改。补发：原因修好后在 Actions 里手动 Run workflow（date 留空），手动跑也看账本、只补没收到的人（别用 Re-run：它检出的是原来那次的提交，可能还没有今天的快讯）。手动跑选了 skip_email 会记成 skipped，之后的定时档不补发。
- 快讯邮件只发最新的 1000 个订阅者（`send-digest-email.mjs` 没分页，Supabase max-rows 截断；全表约 4,700 个）：2026-10-27 Jason 决定先不扩，要扩先问他。example.com 之类保留域名的测试地址在发信前过滤，否则 Resend 会把整批 50 封一起拒掉。英文提示词库的订阅者（来源 `prompts-en*`）也在这 1000 个里剔掉，不发中文快讯（周报同样）。已退订的同样在这 1000 个里剔掉（先取再剔，有人退订不会把第 1001 个人补进来），规则都在 `scripts/lib/newsletter.mjs`，见下面订阅段的「退订」。
- API 容灾链（快讯和提示词库相同）：flatrouter（OpenAI 兼容，只有 GPT：gpt-6-astra / gpt-5.6-sol，主力）→ apimart（Claude）→ 官方。2026-10-24 起不用 aigocode（余额用完，用户决定去掉；工作流不再传 `ANTHROPIC_AUTH_TOKEN`，代码里的 proxy 通道只在设了这个变量时才启用）。5xx/超时/账号干涸/429 限流自动切。主通道模型链 claude-opus-5-5 → claude-sonnet-5 → …（代理开通什么用什么，404「not available for this group」自动换下一个）。模型被下线时 9/29–9/30 曾因降级条件只认 400 而两天没出快讯。
- apimart 的 key 按模型分组开通，分两个 secret：`APIMART_CLAUDE_KEY` 调 Claude（只开通 claude-opus-5-5；代码模型顺序 opus-5-5 → sonnet-5-5 → opus-4-6，旧 key 也能跑），`APIMART_API_KEY` 只给生图（快讯/博客封面，模型 gpt-image-2.5-flare，`APIMART_IMAGE_MODEL` 可覆盖）。生图原图约 2MB，下载后用 sharp 转调色板 PNG（quality 100，约原图一半；90 及以下会在米色圆章、深蓝侧栏上压出噪点）再存，快讯和博客封面都这样。其他 PNG（正文配图、手动做的封面）用 `node scripts/compress-png.mjs <文件…>`：先试调色板，颜色多的截图会整块偏色（小块平均色差超过 6 级）就自动改无损，并保留色彩配置文件（macOS 截图常带 Display P3）；render-blog-cover.py 出图后自动调，发博客时新拷进来的配图也跑一遍。它只能保留原图的大截图（调色板偏色、无损省不下来）转 WebP：sharp `keepIccProfile().webp({ quality: 90, smartSubsample: true })`，比 PNG 小约 85%，正文中英文 md 的链接改成 .webp 再跑 generate-posts。历史快讯封面、博客封面、正文配图 2026-10-31 已回填（吴恩达 Module 2/3 等 12 张大截图已转 WebP）。public/downloads/ 下的 PDF（handbook.pdf、ai-free-learning-guide.pdf，都是 Chrome 打印的）换新版时用 `python3 scripts/compress-pdf.py 原文件 输出` 压：先把页面大图转 JPEG（字体和 emoji 不动），再无损整理结构（要求逐像素一致），最后核对文字和链接（handbook 32MB → 12.7MB，学习全景图 0.9MB → 0.34MB）。别用 Ghostscript 或 PyMuPDF 的 rewrite_images。邮件里写的大小在 `src/lib/download-link.ts` 的 LEAD_MAGNETS，跟着改。提示词库终审只用 Opus（apimart Opus 5.5），不让 GPT 拍板。
- 数据日报每天做模型通道体检（`ops/analytics/fetch_channels.py`：每条通道 8 token 探测、生图空 prompt 探测），任何通道不通在日报开头告警——2026-10-04 备用 key 坏了几个月没人发现，主代理一限流 11 个作品卡进待审。2026-11-07 起也查提示词库 X 数据两个通道（AIsa、twitterapi.io）的余额，任一边不到 $1 告警。
- `CLAUDE_TRANSPORT=curl` 仅本地用——本机 Node/undici 连不上代理（UND_ERR_CONNECT_TIMEOUT），curl 加 `--http1.1` 正常。
- 融资段规则（在 prompt 里）：只收真实到账事件（含已完成收购）、绝不与当天 items 重复、跨天去重（getRecentFundingCompanies 注入近 4 天清单）。Claude 生成后有代码层复核 `reviewFunding()`：近 7 天同公司同金额去重、与当天正文重复去重、Jev 判传闻/洽谈/未完成 IPO（合计 ≥0.7）删掉；VC 基金募资和只有估值变化的按编辑规则保留。Jev 通道（`scripts/opus-prompts/lib/jev.mjs` 的 `jevDecide`，快讯和提示词库共用）：Jev 官方 `JEV_API_KEY`（`api.typesafe.ai/v1/systemone`，模型 `jev-latest`）。2026-10-08 前走 OpenRouter，余额用光后换官方、OpenRouter key 已删。缺 key 或调用失败时：快讯只跳过 Jev 那一步，提示词库审核退回 GPT。

**路由/i18n（app/[lang]/，lang = zh|en）**
- 无 app/layout.tsx——`app/[lang]/layout.tsx` 就是 root layout（html lang 来自路由参数；admin 有独立 root layout）。不要在 root 层用 headers()，会把全站打回动态渲染（历史事故：曾因此全站 ƒ Dynamic + sitemap 空）。
- 404 走 `app/global-not-found.tsx`（`experimental.globalNotFound`）+ 各动态段 `dynamicParams = false`。根布局是动态段时 Next 对 `notFound()` 只能客户端渲染 404（HTML body 为空，vercel/next.js#62228），所以不要再加 `[lang]/[...rest]` 兜底或指望 `[lang]/not-found.tsx` 出 SSR 内容。
- 未翻译内容的 en 页 canonical 指回 zh 版、hreflang 不声明 en；sitemap（app/sitemap.ts，动态生成）只收录真有英文内容的 en URL。
- 快讯分类标签双语在组件内 `categoryConfig.en` 映射；digestTitle()/digestJasonSays() 做标题/点评本地化。

**提示词库（app/[lang]/prompts/claude-opus-5-5，收 Opus 5.5 + Sonnet 5.5 + Haiku 5.5（10/7 发布）+ Fable 5.5（内测·未官宣，`MODEL_PREVIEW` 标注），URL 保留原样）**
- 源 `src/content/opus-prompts/cases.json`（全部作品，含无提示词的）→ `generate-opus-prompts.mjs`（已接入 prebuild）→ 站内收全部作品，和 GitHub 合集一致；没有提示词的作品详情页 noindex、不进 sitemap。采集管线和已知的坑见 `scripts/opus-prompts/README.md`。
- 视频和封面是 X 的外链。`video.twimg.com` 拒绝带外站 Referer 的请求，所以 `/prompts/*` 是 `Referrer-Policy: no-referrer`（next.config 响应头 + 页面 metadata），不要删。
- 客户端组件只能引 `@/lib/opus-prompts-shared`；`@/lib/opus-prompts` 导入整份 JSON，引了会打进 JS 包。
- 提示词一律原文照录，出处必须可追溯；人工把关记录在 `scripts/opus-prompts/data/curation.json`，下架也走这里。
- X 数据（两个库共用 `scripts/opus-prompts/lib/x.mjs`）：2026-11-07 起 Jason 定的顺序是先 AIsa（`AISA_API_KEY`，tool router 的 `get_twitter_tweet_advanced_search`）、出错再直连 twitterapi.io（`TWITTERAPI_IO_KEY`）。AIsa 的 X 工具底层就是 twitterapi.io，返回格式和价格一样（每条 $0.00015），换通道不影响数据；两边各自一个钱包，一边余额用完另一边顶上。起因：11-06 twitterapi.io 余额用完，两个库停了一天。
- 三条自动任务：每日收录新作品（`opus-prompts-daily.yml`，Opus / Sonnet / Haiku / Fable 5.5，一天跑一次（北京 9:17；每次 push 都是一次 Vercel 部署、约 1.4 GB 按月计存储费，别再加档）、每次最多 80 个，延迟 24 小时，Jev 审核、拿不准的交 Opus 终审拍板，终审不可用才进滚动 PR `opus-prompts/pending`）、每周数据核验、GitHub 合集每日同步。细节在 `scripts/opus-prompts/README.md`。
- **第二个库：ChatGPT Images 2.6 合集（2026-11-05 起，`app/[lang]/prompts/chatgpt-images-2-6`）**：OpenAI 11-04 发布的图像模型，收 X 上浏览 ≥5000、作者说用 Images 2.6 做的图片 / GIF / 视频。管线在 `scripts/image-prompts/`（流程同 Claude 库，共用 `opus-prompts/lib`，共用模块只加了可选参数，不传就是原行为），每天在同一个工作流里接着 Claude 库跑、一起提交一次（失败不挡 Claude 库）。源 `src/content/image-prompts/chatgpt-images-2-6.json` → `generate-image-prompts.mjs`（已接入 prebuild）。没有提示词的作品不建详情页，卡片直链原帖，别加回 noindex 详情页（robots.txt 会再涨）。分类之后有一步看图（第一张图 + 帖子文字交给能看图的 GPT）：重写标题、核对视觉分类，也是唯一看像素的安全检查；看图写的标题终审不能改。`/prompts` 是两个库的总览页（以前直接跳 Claude 库），导航「提示词」指向它。GitHub 合集 `zhuyansen/awesome-chatgpt-images-2.6`。细节见 `scripts/image-prompts/README.md`。

**订阅（核心引流，4 个入口共用 /api/subscribe）**
- 反 bot：honeypot(website 字段) + time-trap(ts<1.5s 拒) + Origin 白名单（localhost 任意端口放行）。被判 bot 时静默返回 success。
- **Lead magnet 订阅后邮件发 7 天限时链接（2026-10-31 起）**：handbook、学习全景图、送手册的订阅框（SubscribeForm）带 `magnet` + `lang` 调 /api/subscribe，订阅成功或已订阅都用 Resend 发一封带签名下载链接的邮件（`src/lib/lead-magnet-email.ts`），页面只显示「已发送」+ 重新发送。PDF 在 `public/downloads/`，`middleware.ts` 匹配 `/downloads/:path*` 校验签名（`src/lib/download-link.ts`，密钥 `DOWNLOAD_LINK_SECRET` 在 Vercel），无效或过期跳回订阅页 `?expired=1`；旧直链 `/handbook.pdf`、`/ai-free-learning-guide.pdf` 在 next.config 跳回订阅页。不要再在页面上放 PDF 直链或 `?unlocked=true` 这类前端解锁。防刷：同一 IP 每小时 10 封、同一邮箱 24 小时 3 封（KV 计数）；发信失败返回 502 让用户重试，线索照样存。中间件在 `next dev` 下不生效，测下载校验用 launch.json 的 `start`（生产构建）。
- **英文提示词库的订阅入口（PromptsSubscribe）**：中文手册对英文访客没用，Claude 库和 ChatGPT Images 2.6 图片库的英文列表页、英文详情页用这个组件，订阅后当场解锁 Top 50 页（不发 PDF、不发信）。来源以 `prompts-en` 开头（Claude 库 `prompts-en`，图片库 `prompts-en-images`），以后做英文邮件按这个前缀挑人。还没有英文邮件，文案只承诺「有值得一试的新提示词才发」，所以中文快讯和周报的发信脚本剔除这批人（2026-11-06 起；之前 10-27 起的 83 个人每天都收到了中文快讯）。
- **退订（2026-11-06 起；以前邮件头的退订地址指向快讯页，Gmail 一键退订点了没用）**：快讯、周报的每封邮件带收件人自己的退订链接——邮件头 `List-Unsubscribe` 是一键退订（RFC 8058，POST `/api/unsubscribe`），页脚「退订」打开确认页 `/[lang]/unsubscribe`。一次退订 = 快讯和周报都停，写 `subscribers.unsubscribed_at`（`supabase/add-unsubscribed-at.sql`）。
  - 签名在 `src/lib/unsubscribe-token.ts`：URL 只带订阅者 id 和 HMAC，不带邮箱。`UNSUBSCRIBE_SECRET` 在 Vercel 和 GitHub Actions 各存一份、值相同，**不能换**，换了历史邮件里的退订链接全部失效。
  - GET 绝不退订（企业邮件网关、Outlook 安全链接会预先打开邮件里的每个链接），只有 POST 才算；确认页用原生表单，不依赖 JS。
  - 群发的收件人规则统一在 `scripts/lib/newsletter.mjs`（`fetchSubscribers` / `pickRecipients` / `personalize`）。以后新加的群发（包括英文邮件）也必须走它：跳过已退订、每封带退订链接。缺 secret 或缺这一列时发信脚本报错退出、不发。
  - 退订的人自己在网站上再订阅 = 重新同意，`/api/subscribe` 清空 unsubscribed_at（subscribed_at 不动）。确认页也有「重新订阅」按钮。
  - Supabase 写不进时退订记进 KV hash `pending_unsubscribes`，页面照常显示已退订；日报会告警，跑 `reconcile-leads.mjs` 写回。日报 KPI 里有每天的退订数。
- **Supabase 权限（2026-10-05 修复泄露后）**：服务端 `getSupabase()` 用 `SUPABASE_SERVICE_KEY`（Vercel 和 GitHub Actions 各存一份，必须是 `sb_secret_…` 或旧版 service_role JWT——`sb_publishable_…` 是公开 key，等同 anon，曾经存错过一次）。subscribers / member_codes / club_applications 对 anon 完全不开放，news_* / page_views / page_likes 只读；浏览器端只用 Supabase 做登录。管理后台读订阅者和阅读数走 `/api/admin/subscribers`、`/api/admin/page-views`。策略以 `supabase/lock-down-rls.sql` 为准，新建表不要写 `FOR ALL USING (true)`。
- 容灾：Supabase 主写 + Vercel KV 兜底（src/lib/lead-backup.ts，Upstash REST，list `pending_subscribers`）。Supabase 写失败但 KV 兜住时照常给 PDF、不报错。Supabase 免费档 0.5GB 超限会锁全项目写入且要等下个计费周期才解——见 memory。
- views/likes API 有 isKnownSlug 白名单（历史上被 bot 灌了 46 万行撑爆过库）。

**数据日报（.github/workflows/analytics-daily.yml，北京 8:20 邮件）**
- `ops/analytics/`（Python）：fetch_site（订阅 / 文章阅读增量 / KV 漏回灌 / 管线健康）、fetch_gsc、fetch_vercel、fetch_ga、fetch_clarity → digest.py → send_email.py（Resend）。一个源失败只在日报里标 ⚠️，没配凭证的源写「未接入」。
- KV `pending_subscribers` 是每次订阅都双写的镜像，有积压不代表丢线索；只有「KV 有、Supabase 没有」才需要跑 reconcile-leads。
- 「昨日快讯邮件」一行（2026-11-06 起）：只读 KV 发信账本 `digest-email:<昨天>`，给 daily-news 最后一档的告警兜底（那档被 GitHub 丢掉、或 runner 中途没了，就没人告警）。昨天的快讯没生成，或生成了但账本没有记录 / failed / sending / 读不到，日报开头告警。看昨天不看今天：快讯和日报的 cron 都常被 GitHub 推迟好几个小时（11-06 快讯 9:44–11:26 才跑；日报排在 8:20，近 10 天实际 13:54–14:59 才跑），日报跑的时候今天这期不一定发完，昨天的已经定了。
- 转化事件统一走 `src/lib/track.ts` 的 `track()`，事件名和 digest.py 的 CONVERSIONS 对应；GA4/Clarity ID 没填时不加载任何第三方脚本。
- Vercel Web Analytics 用官方 `/v1/query/web-analytics/visits/aggregate`，前提是项目里 Analytics 开关已打开。

**Vercel 请求额度（2026-10-07 事故后，Pro 套餐，每月 1000 万 Edge Requests）**
- 全站链接一律 `import Link from "@/components/Link"`（默认 `prefetch={false}`），**不要直接用 `next/link`**：默认预加载会让导航 / 页脚 / 提示词卡片每次访问多发十几到几十个请求。2026-10-07 免费版 30 天用到 440 万次（额度 100 万），整站被停用（402 DEPLOYMENT_DISABLED），升级 Pro 才恢复。
- `middleware.ts` 只匹配 `/`、`/admin`、`/auth`、会员中心 / 登录、不带语言前缀的旧链接；带 `/zh` `/en` 的公开页不经过它，不要改回匹配全部页面。本地 `next dev` 下 `/` 会 404（中间件在开发环境不生效），用生产构建 `next start` 验证 rewrite。
- `src/app/robots.ts` 构建时生成 robots.txt：AI 爬虫禁止抓**没有提示词**的作品详情页（noindex 页，曾占全站请求 29%）；搜索引擎和 `*-User` 代理不受影响。不要再加回 `public/robots.txt`（会和它冲突）。
  - AI 爬虫分两组（2026-11-02）：检索类（OAI-SearchBot、Claude-SearchBot、PerplexityBot）单独一组、明确 Allow: /，放在前面；训练类（GPTBot、ClaudeBot 等）在后面。两组 Disallow 一样。
  - 文件大小：两组各列一遍，约 425KB。没有提示词的作品每天多约 28 个，文件每天长约 6.6KB，11 月中旬会超过 500 KiB（RFC 9309 只保证读到这么多），超出部分截掉的是后面的训练类。要长期解决，得让这些页面用一条规则就能挡住，不再逐条列。
- 用量查询：`GET https://api.vercel.com/v2/usage?teamId=…&type=requests`（按天），`/v4/usage/top?pathType=request_path&sortKey=requests`（按路径）。

**SEO/AI-SEO 已就位的约定**
- 文章里写 `## 常见问题`（或英文 `## FAQ`）段 + `### 问题`，src/lib/faq.ts 自动生成 FAQPage JSON-LD——写内容时优先带上。
- app/llms.txt/route.ts 动态生成 LLM 爬虫导览；/feed/blog.xml、/feed/news.xml 双 RSS。
- 博客封面用 next/image + priority（勿改回裸 img，LCP 曾 13.8s）。作者中文名是**祝彦森**（不是朱延森）。

## 上线检查（docs/launch-checklist.html，任何功能上线都走）

总规则：代码写好 ≠ 功能上线，每项在「数据终点」验证（数据真的进来、邮件真的到、接口真的拒绝）。
- G0 开工：`git status` 有不认识的改动先问；只推自己的提交（可能有别的会话同时在改 main）。
- G1 代码：tsc + eslint + build，内容页必须还是 ○/●；还原误改的 `src/generated/*`。
- G2 开关与凭证：控制台开关单独打开（Vercel Analytics 曾经只装了代码、从没采过数据）；secret 让用户用 `gh secret set NAME` 的提示符粘贴，存完看长度/格式；每个查询维度确认套餐支持（402）。
- G3 数据终点：线上页确认脚本加载、上报请求发出；平台后台看到访问；定时任务手动跑一次，邮件到收件箱。
- G4 安全：anon key 对每张隐私表查数量，必须 0 或 401/403；隐私表禁止 `USING (true)`；存 service key 后检查前缀是 `sb_secret_`（不是 `sb_publishable_`），并用「只有 service key 才能通过」的功能验证（如订阅重复识别）。
- G5 失败路径：上游出错时任务必须报错停住，不能当 0 条推进进度；降级覆盖 400/401/403/404/429/5xx；抽查 10 条产出，发现一类问题就加代码层结构检查。
- G6 告警对账：每条告警先和实际情况核对一次；依赖时间的告警加时间条件；总数用平台总数，不自己加。
- 交付：结论用短句写清通过/未通过；流程改动配图；上线类交付出 HTML 看版。

## Skill routing

When the user's request matches an available skill, ALWAYS invoke it using the Skill
tool as your FIRST action. Do NOT answer directly, do NOT use other tools first.
The skill has specialized workflows that produce better results than ad-hoc answers.

Key routing rules:
- Product ideas, "is this worth building", brainstorming → invoke office-hours
- Bugs, errors, "why is this broken", 500 errors → invoke investigate
- Ship, deploy, push, create PR → invoke ship
- QA, test the site, find bugs → invoke qa
- Code review, check my diff → invoke review
- Update docs after shipping → invoke document-release
- Weekly retro → invoke retro
- Design system, brand → invoke design-consultation
- Visual audit, design polish → invoke design-review
- Architecture review → invoke plan-eng-review
- Save progress, save state, save my work → invoke context-save
- Resume, where was I, pick up where I left off → invoke context-restore
- Code quality, health check → invoke health

## Health Stack

- typecheck: npx tsc --noEmit
- lint: npx eslint .
- test: npm run build
