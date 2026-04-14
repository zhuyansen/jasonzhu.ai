# JasonZhu.AI

AI 出海博主 Jason Zhu 的个人网站。前 AI 算法工程师，现专注于 AI 出海内容创作、MCN 运营和企业 AI 培训。

**线上地址**: [https://jasonzhu.ai](https://jasonzhu.ai)

---

## 技术栈

| 分类 | 技术 |
| --- | --- |
| 框架 | Next.js 16 (App Router) + React 19 |
| 语言 | TypeScript |
| 样式 | Tailwind CSS 4 |
| 内容 | MDX (next-mdx-remote) + gray-matter |
| 数据库 | Supabase (订阅、浏览量、点赞、快讯) |
| AI | Anthropic Claude API (快讯摘要生成) |
| 评论 | Giscus (基于 GitHub Discussions) |
| 部署 | Vercel |
| SEO | next-sitemap 自动生成 sitemap |

## 项目结构

```
src/
├── app/
│   ├── [lang]/              # 国际化路由 (zh/en)
│   │   ├── page.tsx         # 首页
│   │   ├── blog/            # 博客列表 & 文章详情
│   │   ├── news/            # AI 快讯列表 & 详情
│   │   ├── tools/           # AI 工具推荐
│   │   ├── handbook/        # 出海手册 (订阅引流)
│   │   ├── services/        # 服务介绍
│   │   ├── about/           # 关于页面
│   │   ├── privacy/         # 隐私政策
│   │   └── terms/           # 服务条款
│   ├── admin/               # 管理后台
│   └── api/
│       ├── subscribe/       # 邮箱订阅接口
│       ├── views/[slug]/    # 浏览量统计
│       ├── likes/[slug]/    # 点赞接口
│       └── admin/           # 后台管理 API (文章 CRUD、标签、图片上传)
├── content/
│   ├── blog/                # 博客 MDX/MD 文件
│   └── news/                # AI 快讯 MD 文件 (自动生成)
├── components/              # React 组件
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── BlogCard.tsx
│   ├── SubscribeForm.tsx
│   ├── ViewCounter.tsx
│   ├── LikeButton.tsx
│   └── GiscusComments.tsx
├── dictionaries/            # 国际化翻译文件
├── generated/               # 构建时生成的 JSON (posts.json, news.json)
└── lib/
    ├── mdx.ts               # MDX 解析工具
    ├── news.ts              # 快讯数据读取
    ├── supabase.ts          # Supabase 客户端
    ├── dictionaries.ts      # 国际化加载
    ├── admin-auth.ts        # 管理后台鉴权
    └── rate-limit.ts        # API 限流

scripts/
├── collect-news.mjs         # AI 快讯自动采集管线
├── generate-posts.mjs       # 构建时生成 posts.json
├── generate-news.mjs        # 构建时生成 news.json
└── supabase-news-schema.sql # Supabase 快讯表结构

.github/workflows/
└── daily-news.yml           # 每日快讯自动采集 GitHub Action
```

## 功能模块

### 博客系统

基于 MDX 的静态博客，支持 GFM 语法、代码高亮、自动目录锚点。文章存放在 `src/content/blog/`，构建时通过 `generate-posts.mjs` 生成索引 JSON。支持分类、标签、封面图、置顶文章。

### AI 快讯 (自动采集管线)

全自动的每日 AI 新闻聚合：

1. **RSS 采集** -- 从 Anthropic、OpenAI、Google AI、Vercel、Hacker News、TechCrunch 等源抓取最近 2 天内容
2. **Claude 筛选** -- 调用 Claude API 从原始条目中筛选 6-8 条，生成中文标题和摘要，自动分类 (Skills 生态 / 出海实战 / AI 工具动态)
3. **Supabase 存储** -- 结构化数据写入数据库
4. **MDX 生成** -- 输出到 `src/content/news/YYYY-MM-DD.md`
5. **自动部署** -- GitHub Actions 提交变更后触发 Vercel 重新部署

### AI 工具推荐

精选 AI 工具推荐页面，面向出海开发者和创业者。

### Agent Skills Hub

独立项目 [agentskillshub.top](https://agentskillshub.top)，从首页项目卡片链接跳转。

### 订阅系统 + 出海手册

邮箱订阅表单 (接入 Supabase)，订阅后获取《X 增长手册》等出海资料作为 lead magnet。

### 管理后台

位于 `/admin`，提供文章 CRUD、标签管理、图片上传等功能，通过 `admin-auth.ts` 进行鉴权。

## 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看效果。

构建流程会自动执行 `prebuild` 脚本生成 posts.json 和 news.json：

```bash
npm run build
```

## 环境变量

在项目根目录创建 `.env.local` 文件：

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=         # Supabase 项目 URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=    # Supabase 匿名 Key (前端用)
SUPABASE_SERVICE_KEY=             # Supabase Service Role Key (后端写入)

# Claude API (快讯采集)
ANTHROPIC_AUTH_TOKEN=             # Claude API 密钥 (支持中转站)
ANTHROPIC_BASE_URL=               # API 地址 (默认 https://api.aigocode.com)
ANTHROPIC_API_KEY=                # 备选: 原生 Anthropic API 密钥
CLAUDE_MODEL=                     # 模型名称 (默认 claude-sonnet-4-6)

# 管理后台
ADMIN_PASSWORD=                   # 后台登录密码
```

## 自动化

### 每日 AI 快讯采集

通过 GitHub Actions (`.github/workflows/daily-news.yml`) 每天北京时间 08:00 自动运行：

1. 拉取最新代码
2. 执行 `node scripts/collect-news.mjs`
3. 检测 `src/content/news/` 是否有变更
4. 有变更则自动 commit 并 push，触发 Vercel 部署

也支持在 GitHub Actions 页面手动触发 (`workflow_dispatch`)。

## 部署

项目部署在 Vercel 上，`main` 分支推送后自动触发部署。

需要在 Vercel 项目设置中配置上述环境变量 (不含 `ANTHROPIC_*` 系列，这些仅在 GitHub Actions 中使用)。

## 内容管理

### 添加博客文章

1. 在 `src/content/blog/` 下新建 `.md` 或 `.mdx` 文件
2. 添加 frontmatter:

```yaml
---
title: "文章标题"
date: "2026-01-01"
category: "出海实战"
tags: ["AI", "出海"]
excerpt: "文章摘要"
coverImage: "/images/cover.jpg"
---
```

3. 编写正文内容
4. 提交后构建时自动生成索引

### 管理快讯

快讯由自动管线生成，一般无需手动操作。如需手动运行：

```bash
# 需要配置 ANTHROPIC_AUTH_TOKEN 和 Supabase 环境变量
node scripts/collect-news.mjs
```

## 国际化

支持中文 (`/zh`) 和英文 (`/en`) 两种语言，翻译文件位于 `src/dictionaries/`。

## License

Private project. All rights reserved.
