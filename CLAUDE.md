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

# 批量翻译：
CLAUDE_TRANSPORT=curl node scripts/translate-content.mjs blog|news
CLAUDE_TRANSPORT=curl node scripts/translate-big-blogs.mjs [slug...]   # 超大文分块翻

node scripts/check-sitemap.mjs   # 线上 sitemap URL 数量断言（防再次静默坏掉）
node scripts/indexnow.mjs [range|--url u...] [--dry-run]  # 推 Bing IndexNow；.github/workflows/indexnow.yml 在内容 push / 快讯与提示词 cron 后自动跑
node scripts/reconcile-leads.mjs # Supabase 恢复后把 KV 兜底订阅线索回灌主表
```

Git：commit 后如远程有新提交（cron 会自动 commit 快讯），先 `git pull --rebase` 再 push。

## Architecture

**内容管线（核心模式：md 是源，generated JSON 是编译产物）**
- `src/content/blog/<slug>.md` → `generate-posts.mjs` → `src/generated/posts.json`（meta）+ `post-content/<slug>.json`（正文）。页面经 `src/lib/mdx.ts` 读取，MDXRemote 渲染。
- 双语约定：`<slug>.en.md` 是英文版（不算独立文章），meta 带 `hasEnglish`；`getPostBySlug(slug, lang)` 在 en 时优先英文、回退中文。frontmatter 支持 `updated`（渲染"更新于" + schema dateModified）。
- `src/content/news/<日期>.md` → `generate-news.mjs` → `news.json`。解析器把每个 `###` 段解析成结构化 item；特殊行：`- **TitleEN**：`/`- **EN**：`（双语）；`### 💰 AI 融资速递` 段解析成 `funding[]` 结构化卡片（不算 item）。

**快讯 cron（.github/workflows/daily-news.yml）**
- 北京时间清晨 5:30/6:30/7:15 三档重试；`collect-news.mjs` 抓 RSS → Claude 结构化 → 写 md + Supabase → commit。
- API 容灾链：aigocode（https://api.aigocode.app，注意是 .app）→ apimart → 官方。任何 5xx/超时/账号干涸自动切。主通道模型链 claude-opus-5-5 → claude-sonnet-5 → …（代理开通什么用什么，404「not available for this group」自动换下一个）；apimart 模型列表 claude-sonnet-5-5 → claude-opus-4-6，apimart 的 key 只开通了这两个，`APIMART_MODEL`（逗号分隔）可覆盖。模型被下线时 9/29–9/30 曾因降级条件只认 400 而两天没出快讯。
- `CLAUDE_TRANSPORT=curl` 仅本地用——本机 Node/undici 连不上代理（UND_ERR_CONNECT_TIMEOUT），curl 加 `--http1.1` 正常。
- 融资段规则（在 prompt 里）：只收真实到账事件（含已完成收购）、绝不与当天 items 重复、跨天去重（getRecentFundingCompanies 注入近 4 天清单）。Claude 生成后有代码层复核 `reviewFunding()`：近 7 天同公司同金额去重、与当天正文重复去重、Jev 判传闻/洽谈/未完成 IPO（合计 ≥0.7）删掉；VC 基金募资和只有估值变化的按编辑规则保留。Jev 需要 `OPENROUTER_API_KEY`，缺失时只跳过 Jev 那一步。

**路由/i18n（app/[lang]/，lang = zh|en）**
- 无 app/layout.tsx——`app/[lang]/layout.tsx` 就是 root layout（html lang 来自路由参数；admin 有独立 root layout）。不要在 root 层用 headers()，会把全站打回动态渲染（历史事故：曾因此全站 ƒ Dynamic + sitemap 空）。
- 404 走 `app/global-not-found.tsx`（`experimental.globalNotFound`）+ 各动态段 `dynamicParams = false`。根布局是动态段时 Next 对 `notFound()` 只能客户端渲染 404（HTML body 为空，vercel/next.js#62228），所以不要再加 `[lang]/[...rest]` 兜底或指望 `[lang]/not-found.tsx` 出 SSR 内容。
- 未翻译内容的 en 页 canonical 指回 zh 版、hreflang 不声明 en；sitemap（app/sitemap.ts，动态生成）只收录真有英文内容的 en URL。
- 快讯分类标签双语在组件内 `categoryConfig.en` 映射；digestTitle()/digestJasonSays() 做标题/点评本地化。

**提示词库（app/[lang]/prompts/claude-opus-5-5，收 Opus 5.5 + Sonnet 5.5 + Fable 5.5（内测·未官宣，`MODEL_PREVIEW` 标注），URL 保留原样）**
- 源 `src/content/opus-prompts/cases.json`（全部作品，含无提示词的）→ `generate-opus-prompts.mjs`（已接入 prebuild）→ 站内收全部作品，和 GitHub 合集一致；没有提示词的作品详情页 noindex、不进 sitemap。采集管线和已知的坑见 `scripts/opus-prompts/README.md`。
- 视频和封面是 X 的外链。`video.twimg.com` 拒绝带外站 Referer 的请求，所以 `/prompts/*` 是 `Referrer-Policy: no-referrer`（next.config 响应头 + 页面 metadata），不要删。
- 客户端组件只能引 `@/lib/opus-prompts-shared`；`@/lib/opus-prompts` 导入整份 JSON，引了会打进 JS 包。
- 提示词一律原文照录，出处必须可追溯；人工把关记录在 `scripts/opus-prompts/data/curation.json`，下架也走这里。
- 三条自动任务：每日收录新作品（`opus-prompts-daily.yml`，Opus / Sonnet / Fable 5.5，每天 80 个，Jev 审核、拿不准的交 Opus 终审拍板，终审不可用才进滚动 PR `opus-prompts/pending`）、每周数据核验、GitHub 合集每日同步。细节在 `scripts/opus-prompts/README.md`。

**订阅（核心引流，4 个入口共用 /api/subscribe）**
- 反 bot：honeypot(website 字段) + time-trap(ts<1.5s 拒) + Origin 白名单（localhost 任意端口放行）。被判 bot 时静默返回 success。
- 容灾：Supabase 主写 + Vercel KV 兜底（src/lib/lead-backup.ts，Upstash REST，list `pending_subscribers`）。Supabase 写失败但 KV 兜住时照常给 PDF、不报错。Supabase 免费档 0.5GB 超限会锁全项目写入且要等下个计费周期才解——见 memory。
- views/likes API 有 isKnownSlug 白名单（历史上被 bot 灌了 46 万行撑爆过库）。

**数据日报（.github/workflows/analytics-daily.yml，北京 8:20 邮件）**
- `ops/analytics/`（Python）：fetch_site（订阅 / 文章阅读增量 / KV 漏回灌 / 管线健康）、fetch_gsc、fetch_vercel、fetch_ga、fetch_clarity → digest.py → send_email.py（Resend）。一个源失败只在日报里标 ⚠️，没配凭证的源写「未接入」。
- KV `pending_subscribers` 是每次订阅都双写的镜像，有积压不代表丢线索；只有「KV 有、Supabase 没有」才需要跑 reconcile-leads。
- 转化事件统一走 `src/lib/track.ts` 的 `track()`，事件名和 digest.py 的 CONVERSIONS 对应；GA4/Clarity ID 没填时不加载任何第三方脚本。
- Vercel Web Analytics 用官方 `/v1/query/web-analytics/visits/aggregate`，前提是项目里 Analytics 开关已打开。

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
- G4 安全：anon key 对每张隐私表查数量，必须 0 或 401/403；隐私表禁止 `FOR SELECT USING (true)`。
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
