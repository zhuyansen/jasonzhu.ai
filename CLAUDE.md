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

# 快讯手动补日（cron 失败时）：
CLAUDE_TRANSPORT=curl DATE=2026-XX-XX node scripts/collect-news.mjs --force

# 批量翻译：
CLAUDE_TRANSPORT=curl node scripts/translate-content.mjs blog|news
CLAUDE_TRANSPORT=curl node scripts/translate-big-blogs.mjs [slug...]   # 超大文分块翻

node scripts/check-sitemap.mjs   # 线上 sitemap URL 数量断言（防再次静默坏掉）
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
- API 容灾链：aigocode（https://api.aigocode.app，注意是 .app）→ apimart（claude-opus-4-6，key 只对这一个模型有权限）→ 官方。任何 5xx/超时/账号干涸自动切。
- `CLAUDE_TRANSPORT=curl` 仅本地用——本机 Node/undici 连不上代理（UND_ERR_CONNECT_TIMEOUT），curl 加 `--http1.1` 正常。
- 融资段规则（在 prompt 里）：只收真实到账事件（含已完成收购）、绝不与当天 items 重复、跨天去重（getRecentFundingCompanies 注入近 4 天清单）。Claude 仍偶发把同一公司同时放 items 和 funding——发现就手动删融资卡里那条。

**路由/i18n（app/[lang]/，lang = zh|en）**
- 无 app/layout.tsx——`app/[lang]/layout.tsx` 就是 root layout（html lang 来自路由参数；admin 有独立 root layout）。不要在 root 层用 headers()，会把全站打回动态渲染（历史事故：曾因此全站 ƒ Dynamic + sitemap 空）。
- 未翻译内容的 en 页 canonical 指回 zh 版、hreflang 不声明 en；sitemap（app/sitemap.ts，动态生成）只收录真有英文内容的 en URL。
- 快讯分类标签双语在组件内 `categoryConfig.en` 映射；digestTitle()/digestJasonSays() 做标题/点评本地化。

**订阅（核心引流，4 个入口共用 /api/subscribe）**
- 反 bot：honeypot(website 字段) + time-trap(ts<1.5s 拒) + Origin 白名单（localhost 任意端口放行）。被判 bot 时静默返回 success。
- 容灾：Supabase 主写 + Vercel KV 兜底（src/lib/lead-backup.ts，Upstash REST，list `pending_subscribers`）。Supabase 写失败但 KV 兜住时照常给 PDF、不报错。Supabase 免费档 0.5GB 超限会锁全项目写入且要等下个计费周期才解——见 memory。
- views/likes API 有 isKnownSlug 白名单（历史上被 bot 灌了 46 万行撑爆过库）。

**SEO/AI-SEO 已就位的约定**
- 文章里写 `## 常见问题`（或英文 `## FAQ`）段 + `### 问题`，src/lib/faq.ts 自动生成 FAQPage JSON-LD——写内容时优先带上。
- app/llms.txt/route.ts 动态生成 LLM 爬虫导览；/feed/blog.xml、/feed/news.xml 双 RSS。
- 博客封面用 next/image + priority（勿改回裸 img，LCP 曾 13.8s）。作者中文名是**祝彦森**（不是朱延森）。

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
