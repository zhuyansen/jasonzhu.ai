---
title: "JasonZhu.AI 搭建之路：技术栈、实现框架与费用全记录"
date: "2026-04-12"
category: "Vibe Coding"
tags: ["建站", "Next.js", "Claude Code", "Vercel", "Supabase"]
excerpt: "完整记录 JasonZhu.AI 个人品牌网站的搭建过程，从技术选型到上线运营，包含技术栈、实现框架、开发工具和费用统计。一个AI博主用AI工具建站的全过程。"
slug: "jasonzhu-ai-site-building-journey"
---

# JasonZhu.AI 搭建之路：技术栈、实现框架与费用全记录

> 一个前AI算法工程师用AI工具搭建个人品牌网站的完整记录。从零开始，2天上线，持续迭代。

## 项目概览

**JasonZhu.AI** 是我的个人品牌网站，集博客、AI工具推荐、服务展示、Newsletter订阅于一体。目标是打造一个高效的AI内容发布和个人品牌展示平台。

| 指标 | 数据 |
|------|------|
| 博客文章 | 72篇 |
| 页面数 | 7个主要页面（首页、博客、快讯、AI工具、服务、手册、关于） |
| 代码文件 | 33个TypeScript/React文件 |
| 代码行数 | ~2500行（不含博客内容） |
| Git提交 | 41次 |
| 首次提交 | 2026-04-11 |
| 开发方式 | 99% Claude Code 生成 |

## 技术栈

### 核心框架

| 技术 | 版本 | 用途 |
|------|------|------|
| **Next.js** | 16.2.3 | React全栈框架，App Router |
| **React** | 19.2.4 | UI组件库 |
| **TypeScript** | 5.x | 类型安全 |
| **Tailwind CSS** | 4.x | 原子化CSS样式 |

### 内容系统

| 技术 | 用途 |
|------|------|
| **Markdown (.md)** | 博客文章格式 |
| **gray-matter** | Frontmatter解析（标题、分类、标签等） |
| **next-mdx-remote** | MDX/Markdown渲染 |
| **remark-gfm** | GitHub Flavored Markdown（表格、删除线等） |
| **rehype-highlight** | 代码语法高亮 |
| **rehype-slug** | 标题锚点 |

### 后端服务

| 技术 | 用途 |
|------|------|
| **Supabase** | 数据库 + 存储（PostgreSQL） |
| **Supabase Auth** | 后台管理认证 |
| **Supabase Storage** | 图片存储 |
| **Next.js API Routes** | 后端接口 |

### 部署与运维

| 技术 | 用途 |
|------|------|
| **Vercel** | 托管部署（自动CI/CD） |
| **GitHub** | 代码仓库 |
| **Cloudflare** | DNS + CDN |

### 开发工具

| 工具 | 用途 |
|------|------|
| **Claude Code** | AI编程主力（99%代码生成） |
| **Obsidian** | 博客内容编辑器 |
| **xreach CLI** | X/Twitter推文读取（批量生成博客） |

## 网站架构

```
jasonzhu.ai/
├── src/
│   ├── app/
│   │   ├── [lang]/           # i18n路由 (zh/en)
│   │   │   ├── page.tsx      # 首页
│   │   │   ├── blog/         # 博客列表 + 详情
│   │   │   ├── tools/        # AI工具推荐
│   │   │   ├── services/     # 服务展示
│   │   │   ├── handbook/     # 手册下载(Lead Magnet)
│   │   │   ├── news/         # AI快讯
│   │   │   └── about/        # 关于我
│   │   ├── admin/            # 后台管理
│   │   └── api/              # API接口
│   │       ├── subscribe/    # Newsletter订阅
│   │       ├── views/        # 文章浏览量
│   │       ├── likes/        # 文章点赞
│   │       └── admin/        # 后台管理API
│   ├── components/           # React组件
│   ├── content/blog/         # Markdown博客文章
│   ├── dictionaries/         # i18n翻译文件(zh/en)
│   ├── generated/            # 预构建生成文件
│   └── lib/                  # 工具函数
├── public/                   # 静态资源
├── scripts/                  # 构建脚本
└── supabase/                 # Supabase配置
```

## 核心功能实现

### 1. 博客系统：Markdown + 预构建JSON

最初用`fs.readdirSync`读取Markdown文件，但Vercel Serverless函数无法访问未被Webpack打包的文件。

**解决方案**：预构建JSON清单
- `scripts/generate-posts.mjs` 在构建前读取所有`.md`文件
- 生成 `src/generated/posts.json` 静态JSON
- `mdx.ts` 直接`import`这个JSON，不依赖运行时文件系统

```javascript
// package.json
"prebuild": "node scripts/generate-posts.mjs",
"build": "next build"
```

### 2. 国际化 (i18n)：中英双语

- `[lang]` 动态路由段实现 `/zh/` 和 `/en/` 路径
- `src/dictionaries/zh.json` + `en.json` 存储翻译文本
- Middleware自动检测浏览器语言并重定向
- 博客分类也有翻译映射（`categoryMap`）

### 3. 互动功能

- **浏览量统计**：Supabase `page_views` 表，访问自动+1
- **点赞系统**：Supabase `page_likes` 表，localStorage防重复点赞
- **评论系统**：Giscus（基于GitHub Discussions），零成本
- **Newsletter订阅**：Supabase `subscribers` 表

### 4. 后台管理 (`/admin`)

- 简单密码保护（环境变量`ADMIN_PASSWORD`）
- 文章管理：查看所有文章，按分类/标签筛选
- 文章链接：直接跳转网站页面或Obsidian编辑
- 图片上传：上传到Supabase Storage
- 订阅者管理：查看订阅者列表

### 5. Lead Magnet（手册下载）

- 首页醒目的蓝色渐变CTA卡片
- 填写邮箱后下载《AIP出海自媒体实战手册》PDF
- 邮箱自动存入Supabase订阅表

## 内容生产工作流

```
X/Twitter推文 → xreach CLI读取 → Claude Code生成.md → Obsidian编辑 → git push → Vercel自动部署
```

这套工作流让我在短时间内从几篇文章扩展到72篇，覆盖9个分类：

| 分类 | 文章数 | 内容类型 |
|------|--------|----------|
| 观点 | 15+ | AI行业思考 |
| 教程 | 10+ | 工具使用教程 |
| 出海 | 10+ | SaaS出海复盘 |
| Vibe Coding | 8+ | AI编程实践 |
| 营销增长 | 8+ | 增长策略 |
| AI工具 | 5+ | 工具评测 |
| 书单推荐 | 5+ | 读书笔记 |
| 咨询培训 | 5+ | 企业AI培训 |
| 出入金 | 3+ | 支付方案 |

## 费用统计

### 固定成本

| 项目 | 费用 | 周期 |
|------|------|------|
| **域名** (jasonzhu.ai) | ~$30 | /年 |
| **Vercel** (Hobby Plan) | $0 | 免费 |
| **Supabase** (Free Plan) | $0 | 免费 |
| **GitHub** | $0 | 免费 |
| **Cloudflare** (Free Plan) | $0 | 免费 |
| **Giscus** (评论) | $0 | 免费 |

### 开发工具成本

| 项目 | 费用 | 说明 |
|------|------|------|
| **Claude Pro** (含Claude Code) | $20 | /月 |
| **Obsidian** | $0 | 免费 |
| **xreach CLI** | $0 | 免费开源 |

### 总计

| 类型 | 月费用 | 年费用 |
|------|--------|--------|
| 固定成本 | ~$2.5 | ~$30 |
| 工具成本 | $20 | $240 |
| **合计** | **~$22.5** | **~$270** |

> 💡 **核心发现**：得益于Vercel、Supabase、Cloudflare的免费层，一个完整的个人品牌网站的运营成本可以控制在每月$22.5以内。唯一的"大额"支出是Claude Pro订阅，但它同时也是我日常工作的核心工具。

## 踩过的坑

### 1. Vercel Serverless文件访问
**问题**：`fs.readdirSync`在Vercel上找不到Markdown文件
**解决**：预构建JSON清单，静态import

### 2. 环境变量尾部换行符
**问题**：通过`echo | vercel env add`设置的密码末尾多了`\n`，导致后台登录401
**解决**：`.trim()`处理环境变量值

### 3. Obsidian与网站的图片路径兼容
**问题**：Obsidian要求相对路径`public/blog/...`，网站需要`/blog/...`
**解决**：Markdown中写`public/blog/...`，MDXRemote自定义`img`组件自动去掉`public/`前缀

### 4. Zsh中带方括号的Git路径
**问题**：`git add src/app/[lang]/...`在zsh中报"no matches found"
**解决**：用双引号包裹路径

### 5. YAML Frontmatter引号问题
**问题**：标题中包含中文引号导致gray-matter解析失败
**解决**：使用`「」`替代内嵌引号

## Claude Code使用体验

整个网站99%的代码是通过Claude Code生成的，我的角色更多是**产品经理**：
- 提需求和方向
- 审查生成的代码
- 测试功能是否正常
- 反馈问题让Claude Code修复

**Claude Code的优势：**
- 理解项目上下文，能跨文件修改
- 自主运行构建、发现并修复错误
- 一次对话可以完成复杂的多文件改动
- 从需求到部署的全链路支持

**适合Claude Code的场景：**
- 全新项目搭建（框架+路由+组件）
- 重复性工作（批量生成博客、添加工具条目）
- Bug修复（给出错误信息，自动定位并修复）
- 功能迭代（在现有代码基础上添加新功能）

## 总结

JasonZhu.AI的搭建证明了一件事：

> **在AI工具的加持下，一个人可以在极短时间内搭建并运营一个功能完整的个人品牌网站，月成本不到$25。**

关键在于：
1. **选对技术栈**：Next.js + Vercel + Supabase 的免费组合足以应对大部分个人网站需求
2. **善用AI工具**：Claude Code大幅降低了开发门槛，让非前端开发者也能搭建专业网站
3. **内容为王**：技术只是载体，持续产出有价值的内容才是核心
4. **快速迭代**：先上线，再优化，不追求完美

---

💡 **如果你也想搭建类似的个人品牌网站，欢迎参考这篇文章的技术方案，或通过[服务页面](/zh/services)联系我咨询。**
