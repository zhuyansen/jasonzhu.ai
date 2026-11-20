# GIGALinks 账号 B（jasonzhu.ai）外链型内容投放方案（CMSEO 2026 规则版）

> **目标站点**：`https://jasonzhu.ai`（英文优先落页 `/en/...`，与账号 A 的 `agentskillshub.top` 严格隔离域名、绝不在同一篇外部文章里互链或并列投放）。
> **账号定位**：**外链导权为主（Backlink Guest Posts）** —— 依托 GIGALinks 老域名首页导权特性，把高相关性英文外链精准打向 `jasonzhu.ai` 最具护城河的数据资产页、出海实操指南页与提示词库入口页（目前全站仅 **31 个引用域 / 约 15 个 dofollow 域**，外链权威处于极早期洼地，提升空间极大）。
> **方法论依据**：CMSEO 2026 **Michal Roshwerger**（品牌锚文本 `0.527` 相关性、宿主文章语义聚焦）+ **Alex Galinos**（60–70% 外链打向高价值数据资产与核心落地页、锚文本自然配比）+ **Michal Suski**（1,500–2,200 词 + 对比表让外链文自身也能拿 AI 引用）。

---

## 一、`jasonzhu.ai` 当前 SEO / GEO 底座体检

1. **外链与权重基线（DataForSEO 2026-11-17 实测）**：
   - DataForSEO Rank：**`271`** | Total Backlinks：**`850`** | Referring Domains：**`31`**（Referring IPs `28`，Nofollow 域 `16` → 有效 dofollow 引用域仅 ~**`15` 个**）。
   - 同体量对比：`agentskillshub.top` 已有 `211` 个引用域，而 `jasonzhu.ai` 只有 `31` 个，且站内已有 `108` 篇高质量英文深度长文 + 3 套提示词库 + 1 个垃圾外链数据库 + 原创 20 万支付样本研究——属于典型的 **“内容远超外链权重”** 站点，补外链杠杆极高。
2. **技术抓取与隐藏卡点**：
   - `llms.txt`（42KB 双语全量索引）、`sitemap.xml`（324KB）、`OAI-SearchBot / Claude-SearchBot / PerplexityBot Allow: /` 均已就位，且已进入 `CC-MAIN-2026-43`（2026 年 10 月 Common Crawl）。
   - ⚠️ **技术预警（顺手排查发现）**：线下与线上实测 `https://jasonzhu.ai/robots.txt` 目前体积达 **`510,555` 字节（已超过 RFC 9309 的 `500 KiB` 保证读取上限）**，因为每条无提示词作品详情页都在逐行 `Disallow:`，导致排在文件后段的训练类爬虫规则被截断。建议近期用目录通配符收敛。
3. **英文页优先原则**：
   - GIGALinks 发在英文宿主站，外链必须指向 `https://jasonzhu.ai/en/...`（匹配语言与语义相关性，避免英文文章强行链到中文 `/zh/` 页面造成相关性折损）。

---

## 二、外链型 Guest Post 写法核心法则（区别于账号 A 的纯品牌提及）

| 规则维度 | 账号 B 外链型写法规范 |
| --- | --- |
| **外链数量与配比** | 每篇 **仅放 1 条指向 `jasonzhu.ai/en/...` 的上下文 dofollow 外链** + **1–2 条非竞品高权威外链**（如 Stripe 文档、UK Companies House `gov.uk`、IRS、Anthropic 文档），伪装度拉满、绝不单链孤立 |
| **锚文本比例控制** | **45–50% 品牌+内容混合锚文本**（如 `JasonZhu.AI's 200,000 checkout links study`、`JasonZhu.AI Wyoming LLC guide`）、**25–30% 裸域/文章标题**、**20–25% 自然部分匹配长尾词**（严禁高频硬塞精确商业词） |
| **目标页分配（65/35 法则）** | **65% 外链打向「一手数据研究与硬核出海指南页」**（最容易承接外部链接自然度）；**35% 打向「网站首页 `/en`、提示词库总览、服务与手册页」** |
| **宿主文章长度与结构** | **1,500 – 2,200 词**，聚焦单一英文长尾检索关键词；尽量配 **1 张对比表**，让外链文自己也能进 Google 长尾排名与 AI 引用（一鱼两吃） |
| **域名前置去重** | 每次在账号 B 下单后，必须核对不与账号 A 任何已发布域名重复；且**禁止在同一篇外链文里同时出现 `agentskillshub.top` 与 `jasonzhu.ai`** |

---

## 三、账号 B 首批目标页分级与前 15 篇外链选题矩阵（按优先级分批投放）

### Tier 1（核心数据资产与高护城河研究页 · 占 45% 外链，最自然、转化信任最强）

| 编号 | 目标接收页 (`jasonzhu.ai/en/...`) | 推荐 Guest Post 文章标题（英） | 宿主文主关键词 | 建议锚文本（轮换使用） |
| --- | --- | --- | --- | --- |
| **B-01** | `/en/blog/indie-payments-report-2026` | *Where Indie Software and AI Makers Collect Payments in 2026: Trends Across 200,000 Checkout Links* | `indie saas payment trends 2026` | `JasonZhu.AI's 200,000 checkout links report` |
| **B-02** | `/en/blog/choose-payment-platform-2026` | *Merchant of Record vs. Stripe in 2026: Comparing Polar, Dodo Payments, Creem, and Paddle for Solo Founders* | `best merchant of record for indie saas 2026` | `JasonZhu.AI eight-platform payment breakdown` |
| **B-03** | `/en/blog/chuhai-weekly-06` | *Life After Lemon Squeezy's 2027 Shutdown: Practical Migration Paths for Digital Product Sellers* | `lemon squeezy alternatives migration 2027` | `data tracked in Indie Seller Weekly on jasonzhu.ai` |
| **B-04** | `/en/backlink-spam-list` | *How SEO Teams Spot Automated Link-Selling Networks and Doorway Domains Before Buying Placements* | `how to identify backlink spam networks` | `public backlink spam list on JasonZhu.AI` |
| **B-05** | `/en/go-global/weekly` | *Tracking Micro-SaaS Launch Velocity: What Weekly Checkout-Link Telemetry Reveals About AI Niches* | `micro saas ai market trends weekly data` | `https://jasonzhu.ai/en/go-global/weekly` |
| **B-06** | `/en/blog/ai-money-map-2026` | *Seven Revenue Layers in Applied AI: How Solo Engineers Monetize Narrow Workflows in 2026* | `how indie developers monetize ai apps` | `JasonZhu.AI 2026 AI monetization map` |

### Tier 2（高需求跨境实操指南页 · 占 35% 外链，精准搜索流量入口）

| 编号 | 目标接收页 (`jasonzhu.ai/en/...`) | 推荐 Guest Post 文章标题（英） | 宿主文主关键词 | 建议锚文本 |
| --- | --- | --- | --- | --- |
| **B-07** | `/en/blog/us-llc-developer-accounts` | *Forming a Wyoming LLC From Outside the US for Apple and Google Organization Developer Accounts (Step-by-Step)* | `wyoming llc for apple google developer account non us` | `step-by-step China-to-Wyoming LLC walkthrough on jasonzhu.ai` |
| **B-08** | `/en/blog/us-llc-mercury-stripe-168-usd` | *Setting Up a US LLC, Mercury Account, and Stripe Under $200: Real Fees and Timeline Breakdown* | `wyoming llc mercury stripe cost breakdown` | `JasonZhu.AI's $168 US setup cost log` |
| **B-09** | `/en/blog/uk-company-registration-2hours` | *Registering a UK Limited Company Online From Abroad: Realistic Costs, Timeline, and Pitfalls* | `register uk limited company online non resident cost` | `JasonZhu.AI UK company 2-hour filing guide` |
| **B-10** | `/en/blog/uk-company-wise-business-account` | *Passing Wise Business Address Verification for a Non-Resident UK Ltd Company* | `wise business address verification uk company` | `https://jasonzhu.ai/en/blog/uk-company-wise-business-account` |
| **B-11** | `/en/blog/ai-free-learning-hub` | *Ten Official AI Learning Platforms Worth Completing Before Paying for Any Bootcamps (2026 Guide)* | `best free official ai courses 2026` | `JasonZhu.AI's 10-platform free AI learning map` |
| **B-12** | `/en/blog/openai-startup-credits-application-guide` | *Qualifying for Up to $2,500 in OpenAI Startup Credits: Application Checklist for Early-Stage Builders* | `how to apply openai startup credits 2500` | `JasonZhu.AI OpenAI credits checklist` |

### Tier 3（提示词库与品牌商业核心页 · 占 20% 外链，稳住根域与服务页权重）

| 编号 | 目标接收页 (`jasonzhu.ai/en/...`) | 推荐 Guest Post 文章标题（英） | 宿主文主关键词 | 建议锚文本 |
| --- | --- | --- | --- | --- |
| **B-13** | `/en/prompts/claude-opus-5-5` | *Studying Real Claude Opus 5.5 and Sonnet 5.5 Production Prompts: Patterns From Curated Showcases* | `claude opus 5.5 prompt examples showcase` | `Claude 5.5 prompt gallery at JasonZhu.AI` |
| **B-14** | `/en/prompts/chatgpt-images-2-6` | *Prompt Structure Patterns Behind High-Engagement ChatGPT Images 2.6 Visuals* | `chatgpt images 2.6 prompts examples` | `JasonZhu.AI ChatGPT Images 2.6 showcase` |
| **B-15** | `/en` & `/en/services` | *How Former AI Algorithm Engineers Structure Practical Tool Benchmarks and Team AI Training* | `practical enterprise ai implementation training` | `JasonZhu.AI`（首页品牌锚文本 / `/en/services` 混投） |
| **B-16** | `/en/blog/openai-academy-vs-anthropic-learning-paths` | *OpenAI Academy vs. Anthropic Learning Paths in 2026: Which Official Free AI Curriculum Fits Your Role?* | `openai academy vs anthropic learning paths` | `JasonZhu.AI OpenAI vs Anthropic 10-week study roadmap`（GSC 全站点击第一名，`pos 5.2` / `1,310` 曝光，优先冲击 Top 1-2） |

---

## 四、双站点协同验收周期（Day 0 → Day 14 → Day 28 → Day 56）

- **`agentskillshub.top`（账号 A · 纯品牌提及）**：追踪 `ops/geo/questions.json`（40 题）的 `named` 与 `first_pick` 跃迁 + 品牌消歧（压过 790-skill 旧仓库）。
- **`jasonzhu.ai`（账号 B · 外链导权为主）**：追踪 **DataForSEO Referring Domains（基线 `31`）** + **GSC 英文长尾页点击增量** + `jasonzhu.ai/ops/geo/questions.json`（20 题）的 `site_cited`、`page_cited`、`named` 变化。
