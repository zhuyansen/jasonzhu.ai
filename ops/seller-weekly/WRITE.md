# 出海选品周报：写稿说明（GitHub Actions 里由 Claude Code 执行）

这份说明由 `.github/workflows/seller-weekly.yml` 交给 Claude Code（`claude -p`）。数据步骤已经由工作流跑完，你只负责写稿和生成博客文件。
用中文写周报。不要执行 git 命令、不要发任何东西（博客提交、X 草稿、邮件都由工作流在你之后做）。

环境变量：
- `WEEK_END`：这周的最后一天（YYYY-MM-DD，周日）。周报覆盖 `WEEK_END` 往前 7 天。
- `TODAY`：今天（北京日期），也是这期的发布日期。
- `SELLER_EXPORTS`：本周汇总所在目录，读 `$SELLER_EXPORTS/$WEEK_END.md`（里面有网站名单，**只供你挑选和核实，绝不能把名单写进周报**：数据来自 DataForSEO，条款禁止转载）。
- `SELLER_DB`：卖家历史库（SQLite，只读）。

## 1. 写这一期

读本周汇总，再读 `ops/seller-weekly/newsletter/` 里最新的一期（文件名最大的 `*-issue-NN.md`）学格式和语气。期号 = 上一期 + 1（两位数）。
写到 `ops/seller-weekly/newsletter/$TODAY-issue-NN.md`，按这个顺序分节：

- **本周数字**：本周新卖家数、卖软件的、AI 产品的，以及哪些平台在涨。单周数字随链接图收录批次大幅波动（见过每周 1,100 到 6,500），比较要看月度，并用一行话说明这一点。
- **本周值得看的 5 个新产品**：从本周的软件和 AI 卖家里挑 5 个。**逐个打开它的首页**（用 WebFetch，或 `curl -sL` 读 HTML），用一两句平实的话说清它做什么、为什么值得看（价格、收费方式、目标用户这类具体信息）。跳过代理公司、咨询、教练、目录站和大平台；跳过往期已经挑过的产品（往期文件里都有）。首页打不开或说不清在卖什么的，换一个。
- **验证过的需求**：只有你用 Google Trends 12 个月曲线核实过某个需求在涨时才写；做不到就整节省略。关键词工具的同比暴涨经常是假的（例如「engineering software」显示 +10,285%，Trends 却是平的）。
- **一个打法**：你在本周看到的一个模式。如果是通过共用统计 ID 发现的，不要点名那些网站。
- **收款平台动态**：只写能从平台自己的页面或博客找到出处的消息，附链接。去看 Stripe、Lemon Squeezy、Polar、Creem、Paddle、Dodo Payments、Gumroad 的博客或更新日志里最近 7 天的文章；没有就整节省略。

规则：
- 只公开数字和你自己挑的产品，**绝不列网站名单**（DataForSEO 条款禁止转载数据）。
- 中文平实、简洁，不夸张、不灌水，不要一串破折号。
- 结尾用和上一期相同的那一行数据说明。

再写 X 版本到同目录的 `$TODAY-issue-NN-x.md`：把这一期压缩到约 800 个汉字，不用 — 或 – 这类破折号，最后一行是博客链接 `https://jasonzhu.ai/zh/blog/chuhai-weekly-NN`。

## 2. 生成博客文件（JasonZhu.AI，当前目录就是仓库根目录）

1. 写 `src/content/blog/chuhai-weekly-NN.md`：frontmatter 照 `chuhai-weekly-05.md`（标题「出海选品周报 · 第 N 期：<本周标题>」，日期是 `TODAY`，category "出海"，同样的 tags，`coverImage: "/blog/chuhai-weekly-NN/cover.png"`，`series: "chuhai-weekly"`，`issue: N`，一行 excerpt），然后是正文。博客版里平台对比那一行链接到 `/zh/blog/choose-payment-platform-2026` 和 `/zh/blog/indie-payments-report-2026`，写法照第 05 期。
2. 写英文版 `src/content/blog/chuhai-weekly-NN.en.md`，由你翻译：frontmatter 只有 `title`（"Indie Seller Weekly #N: <headline>"，照 `chuhai-weekly-05.en.md`）、`excerpt` 和 `coverImage: "/blog/chuhai-weekly-NN/cover-en.png"`，正文是完整的平实英文，对比那一行链接到 `/en/blog/choose-payment-platform-2026` 和 `/en/blog/indie-payments-report-2026`。
3. 封面：
   ```bash
   mkdir -p public/blog/chuhai-weekly-NN
   python3 ops/seller-weekly/cover.py $WEEK_END public/blog/chuhai-weekly-NN/cover
   python3 ops/seller-weekly/cover.py $WEEK_END public/blog/chuhai-weekly-NN/cover-en en
   rm public/blog/chuhai-weekly-NN/*.svg
   ```
   用 Read 看两张 PNG，确认中英文两张的数字一致、文字没有乱码或方块。
4. `node scripts/generate-posts.mjs`。

## 3. 收尾

最后输出一段简短的中文结果（工作流会把它放进运行摘要和给 Jason 的邮件），包含：期号、本周标题、本周三个核心数字、挑的 5 个产品名、哪些可选小节省略了以及原因、你觉得 Jason 需要注意的地方。
最后一行单独写 `ISSUE=NN`（两位数），工作流靠它找文件。
