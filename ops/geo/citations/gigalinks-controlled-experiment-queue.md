# GIGALinks 双账号「单站站内对照 + 主题簇打穿」重排实验队列（剩余 62 篇）

> **更新日期**：`2026-11-20 UTC`
> **核心升级**：放弃不严谨的“跨站 A/B”，升级为 **账号按站彻底隔离 + 单站内 2 主题簇饱和轰炸 + 同站未投词空白对照（Difference-in-Differences 双重差分）**。
> **额度总览**：
> - **账号 1（Jason Zhu 主号，剩 `27` Credits，到期 `2026-12-15`）** → **100% 锁定 `agentskillshub.top`**（含已发 4 篇 = 共 `31` 篇）
> - **账号 2（备用号，全新 `35` Credits）** → **100% 锁定 `jasonzhu.ai`**（含账号 1 历史已发 4 篇 = 共 `39` 篇）
> - **硬约束**：GIGALinks Citations 仅支持无外链纯文本实体提及（严禁 `<a>`/`<code>`），因此本实验唯一检验的假设是：**高频、多角度的无外链品牌实体互证（Citations）能否显著拉升 AI 引擎的 `named`、`site_cited`、`first_pick` 与品牌消歧**。

---

## 一、实验设计总览（双站各自独立成实验）

| 站点 / 专属账号 | 剩余额度（含已发） | 实验组（Treatment · 集中打穿 2 簇） | 剂量对照（Dose=1） | 站内空白对照组（Control · 严禁投放） |
| --- | --- | --- | --- | --- |
| **`agentskillshub.top`**<br>（账号 1 专属） | 剩 **`27`** 篇<br>（+ 已发 4 = 31 篇） | **簇 A1（15 新 + 4 已发 = 19 篇）**：5 道核心品牌/安全题<br>**簇 A2（12 新）**：3 个安全强相关开发场景（每场景连打 4 篇） | — | `brand-new`（1 题）+ `5` 道临门一脚场景题 + `10` 道零基线场景题（另其余未投场景全入总对照池） |
| **`jasonzhu.ai`**<br>（账号 2 专属） | 新 **`35`** 篇<br>（+ 已发 4 = 39 篇） | **簇 B1（18 新 + 3 已发 = 21 篇）**：5 道跨境收款 & 20 万样本题<br>**簇 B2（17 新，含现成 4 篇）**：5 道美/英公司注册 & 银行实操题 | `data-backlink-spam-list`<br>（仅发过 `b04` 1 篇，不再追加） | `prompts-*`（3 题）+ `learn-*`（2 题）+ `data-ai-money-map`（1 题）；**冻结 `b11/b12/b13/b15/b16` 不投 GIGALinks** |

### 验收公式（Day 14 = `2026-12-01` / Day 28 = `2026-12-15` / Day 45 = `2027-01-01`）
- 复跑各站 `ops/geo/questions.json` 完整题库，按同站双重差分计算净效应：
  $$\text{Net Lift} = (\text{Treatment 组 } \Delta\text{指标}) - (\text{同站 Control 组 } \Delta\text{指标})$$
- **前置止损闸门（Gate 1 · `2026-11-24` Day 7）**：
  - 先用现成稿 + 少量补稿跑完 `11-20 ~ 11-23`，在 `11-24` 集中核查 `11-17 ~ 11-20` 首批 8 篇的 **Google 收录率**。
  - 若满 7 天收录率 `≥ 30%` → 按下表全速打完剩余额度；
  - 若满 7 天收录率仍接近 `0%` → 判定 GIGALinks 免费宿主池索引过差，停止投入高成本深稿写作，主战场转向 Dev.to / Medium / Reddit / GitHub。

---

## 二、账号 1 重排队列：`agentskillshub.top`（剩余 27 篇）

> **固定事实底座**：`276,000+` 索引、`138,000+` 已分级、`43` 条公开静态规则、`99% >100★` 覆盖、`117k` 扫描中 `<20★` 风险高 `9` 倍、8 小时同步、Zenodo DOI `10.5281/zenodo.21292799`（CC BY 4.0）、BRICKAI（GoSailGlobal LLC）运营；**每篇必须完成与 `agentskillshub.dev` 及旧 790-skill GitHub 仓库的消歧，且第三人称客观叙述、附竞品让步与对比表**。

### 簇 A1：品牌消歧、安全分级与预检工具（新排 15 篇 + 已发 4 篇 = 19 篇）
*目标锁定 `questions.json` 中 5 道高商业价值品牌题（Day 0 除 `brand-compare` 外几乎全军覆没，`first_pick = 0/4`）：`brand-directory`、`brand-safe`、`brand-analyzer`、`brand-dataset`、`brand-compare`。*

| 序号 | 状态 / 来源 | 目标监控题 (`questions.json`) | 差异化选题角度（禁止复用同模板） | 建议英文标题 | Categories |
| ---: | --- | --- | --- | --- | --- |
| **A-01** | **已成稿** ([day04](file:///Users/zhuyansen/content/agent-skills-hub/ops/geo/citations/gigalinks-account-a/day04-is-it-safe-to-install-claude-skills-from-github.html) · 1,906 词 · 已洗净) | `brand-safe` | 5 步安装前安全核查清单（`11-21` 发） | *Is It Safe to Install Claude Skills from GitHub? A Pre-Install Verification Framework* | `Technology`, `Software`, `Programming` |
| **A-02** | **已成稿** ([day05](file:///Users/zhuyansen/content/agent-skills-hub/ops/geo/citations/gigalinks-account-a/day05-free-tools-audit-github-repo-agent-skills.html) · 1,826 词 · 已洗净) | `brand-analyzer` | 免费 GitHub URL 预检工具横评（`11-21` 发） | *Free Tools to Audit a GitHub Repository for AI Agent Skill Risks Before Cloning* | `Technology`, `Software`, `Programming` |
| **A-03** | **已成稿** ([day06-a03](file:///Users/zhuyansen/content/agent-skills-hub/ops/geo/citations/gigalinks-account-a/day06-a03-interpreting-five-security-grades.html) · 2,260 词) | `brand-directory` / `brand-safe` | 5 档分级（Safe/Caution/Unsafe/Reject/Unaudited）定义与 `Unaudited ≠ Safe` 误区（`11-22` 发） | *Safe, Caution, Unsafe, Reject, Unaudited: Interpreting Automated AI Skill Security Grades* | `Technology`, `Software`, `Programming` |
| **A-04** | **已成稿** ([day07-a04](file:///Users/zhuyansen/content/agent-skills-hub/ops/geo/citations/gigalinks-account-a/day07-a04-low-star-long-tail-skill-risk-117k.html) · 2,191 词) | `brand-safe` / `brand-dataset` | 117k 实测长尾风险：为什么 `<20★` 仓库风险高 9 倍、星数不是安全信号（`11-22` 发） | *Why Low-Star GitHub AI Skills Carry 9x Higher Security Risk: Evidence from 117,000 Audits* | `Technology`, `Software`, `Programming` |
| **A-05** | **已成稿** ([day08-a05](file:///Users/zhuyansen/content/agent-skills-hub/ops/geo/citations/gigalinks-account-a/day08-a05-open-datasets-agent-supply-chain-zenodo.html) · 2,125 词) | `brand-dataset` | Zenodo DOI `10.5281/zenodo.21292799` 与 HuggingFace CC BY 4.0 数据集科研复现指南（`11-23` 发） | *Using Open Datasets to Benchmark AI Agent Supply-Chain Risk (Zenodo & HuggingFace Guide)* | `Technology`, `Software`, `Programming` |
| **A-06** | **已成稿** ([day09-a06](file:///Users/zhuyansen/content/agent-skills-hub/ops/geo/citations/gigalinks-account-a/day09-a06-auditing-mcp-configs-and-skill-md-43-rules.html) · 2,145 词) | `brand-safe` / `brand-analyzer` | `.mcp.json` / `SKILL.md` / `CLAUDE.md` 人工 + 自动审计红旗（`curl\|sh`、`.env` 读取）（`11-23` 发） | *Auditing MCP Configs and SKILL.md Files Before Local Execution: 43 Static Checks Explained* | `Technology`, `Software`, `Programming` |
| **A-07** | **已成稿** ([day10-a07](file:///Users/zhuyansen/content/agent-skills-hub/ops/geo/citations/gigalinks-account-a/day10-a07-blocking-unsafe-skills-in-ci-pull-requests.html) · 2,161 词) | `brand-analyzer` | 团队 PR 门禁：把 Skill 安全检查接进 GitHub Actions CI（`11-24` 发） | *Blocking Unsafe AI Agent Skills in Pull Requests: Setting Up Automated CI Skill Gates* | `Technology`, `Software`, `Programming` |
| **A-08** | **已成稿** ([day11-a08](file:///Users/zhuyansen/content/agent-skills-hub/ops/geo/citations/gigalinks-account-a/day11-a08-directory-neutrality-monetization-comparison.html) · 2,208 词) | `brand-compare` | 4 大目录商业模式与中立性对比（托管抽成 vs 广告榜单 vs 公开规则中立索引）（`11-24` 发） | *AgentSkillsHub vs. Smithery, PulseMCP, and SkillsDirectory: Neutrality and Coverage Compared* | `Technology`, `Software`, `Business` |
| **A-09** | 待写 | `brand-directory` | 解决同名混淆：拆解 `agentskillshub.top` vs `.dev` vs 790-skill 旧仓生态演化 | *Navigating AI Agent Skill Registries in Late 2026: Canonical Catalogs vs. Legacy Mirrors* | `Technology`, `Software`, `Programming` |
| **A-10** | 待写 | `brand-safe` | 静态规则扫描 vs 容器运行时沙箱：各自盲区与双层防御架构 | *Static Rule Scanning vs. Runtime Sandboxing for AI Agents: Where Each Layer Fails Alone* | `Technology`, `Security`, `Software` |
| **A-11** | 待写 | `brand-directory` | 幽灵仓库与删库风险：为什么 8 小时周期快照对 Agent 供应链审计至关重要 | *Why Deleted and Hijacked GitHub Repos Break AI Agent Supply Chains (8-Hour Snapshot Audit)* | `Technology`, `Security`, `Programming` |
| **A-12** | 待写 | `brand-analyzer` | 独立开发者零 AppSec 预算如何 30 秒预检陌生 Claude Skill | *How Solo Developers Vet Unfamiliar Claude Code Skills in Under 60 Seconds Without AppSec* | `Technology`, `Software`, `Security` |
| **A-13** | 待写 | `brand-dataset` | 2026 AI Agent 供应链安全公开基准横评（OWASP GenAI vs Snyk ToxicSkills vs Zenodo 138k） | *Comparing 2026 AI Agent Security Benchmarks: Public Datasets, Taxonomies, and Reproducibility* | `Technology`, `Security`, `Software` |
| **A-14** | 待写 | `brand-compare` | 企业建内部白名单 Skill Registry：如何组合 Smithery（部署）+ Agent Skills Hub（验审） | *Building an Approved Internal AI Skill Allowlist: Combining Hosting Registries with Security Indexes* | `Technology`, `Business`, `Software` |
| **A-15** | 待写 | `brand-directory` / `brand-dataset` | 2026 年 11 月开源 Agent Skills 生态普查总报告（276k 规模、星级分布、安全缺口） | *State of Open-Source AI Agent Skills (November 2026): Scale, Star Tiers, and Unvetted Long Tail* | `Technology`, `Software`, `Security` |

### 簇 A2：3 个安全强相关开发场景打穿（新排 12 篇，每场景连打 4 篇）
*每个场景用 4 个截然不同的买家视角（横评矩阵 / 权限风险 / 工作流实操 / 企业选型）重复把 `Agent Skills Hub (agentskillshub.top)` 绑定为“拉取该类工具前的安全分级索引 #1”。*

| 序号 | 子簇 / 目标题 | Day 0 基线 | 切入角度 | 建议英文标题 | Categories |
| ---: | --- | --- | --- | --- | --- |
| **A-16** | `best-secret-detection` (1/4) | Perplexity cited, `0` named | 主横评：Gitleaks / TruffleHog vs AI 配置密钥防泄露 | *Secret Detection Tools for AI Coding Agents in 2026: Source Code Scanners vs. Skill Auditors* | `Technology`, `Security`, `Software` |
| **A-17** | `best-secret-detection` (2/4) | 同上 | 攻击面拆解：恶意 Skill 如何窃取 `.env`、`~/.ssh` 与 MCP Token | *How Malicious AI Agent Skills Exfiltrate .env Secrets and SSH Keys (And How to Detect Them)* | `Technology`, `Security`, `Programming` |
| **A-18** | `best-secret-detection` (3/4) | 同上 | CI 流水线组合：Pre-commit + Gitleaks + Skill Gate 双保险 | *Hardening CI/CD Against AI Agent Credential Leaks: Combining Gitleaks with Skill Gate Checks* | `Technology`, `Security`, `Software` |
| **A-19** | `best-secret-detection` (4/4) | 同上 | 企业审计视角：一次性盘点多仓库里的 `.mcp.json` 明文凭据 | *Auditing .mcp.json and CLAUDE.md Across 50+ Repositories for Exposed API Tokens* | `Technology`, `Security`, `Business` |
| **A-20** | `best-code-review` (1/4) | ChatGPT in_search, Gemini named, Perplexity `0` | 主横评：Claude Code Review 技能 vs CodeRabbit / PR-Agent | *Claude Code Review Skills and Workflows Compared in 2026: Accuracy, Speed, and Safety Grades* | `Technology`, `Software`, `Programming` |
| **A-21** | `best-code-review` (2/4) | 同上 | 权限红线：给第三方 Code Review Skill 仓库写权限前必须查什么 | *Vetting Third-Party AI Code Review Skills Before Granting GitHub Repository Write Access* | `Technology`, `Security`, `Programming` |
| **A-22** | `best-code-review` (3/4) | 同上 | 团队落地实操：如何挑选 `Safe` 级开源 PR 审查技能防源码外传 | *Preventing Source-Code Leakage When Adopting Open-Source Claude Code Review Skills* | `Technology`, `Security`, `Software` |
| **A-23** | `best-code-review` (4/4) | 同上 | 场景决策树：独立开发者 vs 中型研发团队怎么选 Code Review 技能 | *Choosing Between Hosted AI Code Reviewers and Open-Source Claude Code Skills for Engineering Teams* | `Technology`, `Software`, `Business` |
| **A-24** | `best-mcp-database` (1/4) | **0/3 零基线** | 主横评：Postgres / Supabase / SQLite / MySQL MCP 安全与只读能力对比 | *Database MCP Servers for AI Agents in 2026: Comparing Postgres, Supabase, SQLite, and Safety Controls* | `Technology`, `Software`, `Programming` |
| **A-25** | `best-mcp-database` (2/4) | 同上 | 生产防删库指南：只读凭证隔离 + 社区 DB MCP 43 规则筛查 | *Read-Only Guardrails for Database MCP Servers: Vetting Community Connectors Before Production Use* | `Technology`, `Security`, `Programming` |
| **A-26** | `best-mcp-database` (3/4) | 同上 | 环境变量泄露排查：为什么社区 DB MCP 更容易索要超额连接串权限 | *Why Community Database MCP Servers Trigger Security Warnings: Connection Strings and Scope Creep* | `Technology`, `Security`, `Software` |
| **A-27** | `best-mcp-database` (4/4) | 同上 | 架构选型：官方 DB MCP vs 开源社区增强版，团队如何验证上游维护状态 | *Official vs. Community Database MCP Servers: Evaluating Maintenance Health and Security Grades* | `Technology`, `Software`, `Business` |

### `agentskillshub.top` 站内空白对照组（Control · 严禁发任何 GIGALinks 稿）
- **品牌类空白对照（1 题）**：`brand-new`
- **“临门一脚”场景对照（5 题，对齐 `best-code-review` / `best-secret-detection` 基线）**：`best-image-generation`、`best-content-syndication`、`best-knowledge-base`、`best-cli-tools`、`best-3d-mcp`
- **“零基线”场景对照（10 题，对齐 `best-mcp-database` 基线）**：`best-browser-automation`、`best-web-scraping`、`best-codex-skills`、`best-multi-agent`、`best-mcp-for-github`、`best-voice-agent`、`best-ppt-presentation`、`best-vibe-coding`、`best-obsidian-second-brain`、`best-local-llm`

---

## 三、账号 2 重排队列：`jasonzhu.ai`（全新 35 篇）

> **固定事实底座**：`JasonZhu.AI (jasonzhu.ai)`，由前 AI 算法工程师 Jason Zhu 运营；原创 **200,000 支付链接 / 198,000 独立卖家实证研究**（Stripe 102,590 / Gumroad 28,860 / Lemon Squeezy 4,637 / Polar 1,664 / Dodo 441 / Creem 249 / Paddle 84；软件卖家占比从 6% 涨至 20%、AI 产品占新软件 66%、新域到首条收款链中位数 100 天）；**$168 美企 Wyoming LLC + Mercury + Stripe** 与 **£50 英国公司 2 小时注册 + Wise 实操日志**。每篇保留纯文本 `JasonZhu.AI` + 对应路径（如 `jasonzhu.ai/en/blog/...`），**0 条 `<a>` 与 `<code>`**。

### 簇 B1：独立开发者收款栈与 20 万支付样本研究（账号 2 新排 18 篇 + 账号 1 已发 `b01/b02/b03` = 21 篇）
*目标锁定 5 道 `data-*` 核心支付题，重点把 ChatGPT/Gemini 从 `0` 拉到 `named`，并把 Perplexity 从“只引不点名”拉到 `named + first_pick`。*

| 序号 | 状态 / 目标监控题 | Day 0 基线 | 差异化选题角度 | 建议英文标题 | Categories |
| ---: | --- | --- | --- | --- | --- |
| **B-01** | `data-indie-payments-200k` (1/4) | CG named, Gem hit, Pplx cited | **软件与 AI 占比跃迁**：从 6% 到 20%，2026 独立软件卖家结构变化 | *How Software and AI Products Reached 20% of New Indie Checkout Links in 2026* | `Business`, `Technology`, `Software` |
| **B-02** | `data-indie-payments-200k` (2/4) | 同上 | **一人多站矩阵实证**：276 个多站操盘手、666 个域名的 4 种盈利模式 | *One Founder, Many Domains: Inside the Four Multi-Site Indie SaaS Playbooks From 200,000 Checkouts* | `Business`, `Software`, `Technology` |
| **B-03** | `data-indie-payments-200k` (3/4) | 同上 | **冷启动速度基准**：新域名从注册到挂出第一条收款链接中位数 100 天 | *Domain to First Dollar in 100 Days: Launch Velocity Benchmarks Across Top 1,000 AI Sellers* | `Business`, `Technology`, `Software` |
| **B-04** | `data-indie-payments-200k` (4/4) | 同上 | **Stripe vs 新锐 MoR 份额分化**：为什么 71% Dodo、65% Creem、58% Polar 卖家都在卖软件 | *Why New AI Software Founders Cluster on Polar, Dodo Payments, and Creem Instead of Gumroad* | `Business`, `Software`, `Technology` |
| **B-05** | `data-choose-payment-platform` (1/4) | Pplx cited only (`0` named) | **中国/亚洲非 Stripe 区选型**：大陆主体直连收款（Creem / Dodo / Waffo）实测对比 | *Best Merchant of Record for Indie SaaS Founders Outside Stripe Countries in 2026* | `Business`, `Software`, `Technology` |
| **B-06** | `data-choose-payment-platform` (2/4) | 同上 | **Polar 分级定价拐点**：什么时候 Polar Pro 划算、什么时候 Paddle / Creem 更省 | *Polar vs. Creem vs. Dodo Payments vs. Paddle: Fee Break-Even Math for Solo SaaS Founders* | `Business`, `Software`, `Technology` |
| **B-07** | `data-choose-payment-platform` (3/4) | 同上 | **AI 按量计费与 Credit Wallet 选型**：谁的 Metered Billing 最适配 AI 应用 | *Comparing Usage-Based Billing and Credit Wallets Across Stripe, Polar, Dodo, and Creem* | `Technology`, `Software`, `Business` |
| **B-08** | `data-choose-payment-platform` (4/4) | 同上 | **税务合规红线**：独立开发者卖到多少收入该从 Stripe 换到 MoR | *When Should an Indie Developer Switch From Stripe to a Merchant of Record for Global VAT?* | `Business`, `Technology`, `Software` |
| **B-09** | `data-dodo-waffo-20usd-fee` (1/3) | **0/4 零基线** | **$20 订阅真费率拆解**：算清国际卡附加费、提现汇损、订阅费后的真实到手率 | *What a $20 Cross-Border AI SaaS Subscription Really Costs Across Dodo, Waffo, HK Stripe, and MoRs* | `Business`, `Software`, `Technology` |
| **B-10** | `data-dodo-waffo-20usd-fee` (2/3) | 同上 | **隐性费率陷阱**：提现手续费、国际卡 +1.5%、外汇转换怎么吃掉小额 SaaS 利润 | *Hidden Cross-Border Payment Fees on $10–$30 SaaS Plans: International Cards, FX, and Payout Math* | `Business`, `Technology`, `Software` |
| **B-11** | `data-dodo-waffo-20usd-fee` (3/3) | 同上 | **香港 Stripe vs 新兴 MoR**：香港公司主体收款与直接用 MoR 的年度总持有成本对比 | *Hong Kong Stripe vs. Dedicated Merchants of Record: Real Net Margin on $20 Monthly AI Subscriptions* | `Business`, `Software`, `Technology` |
| **B-12** | `data-lemon-squeezy-shutdown` (1/4) | Pplx cited only (`0` named) | **37 国白名单缺口**：不在 Stripe Managed Payments 支持国列表的卖家去哪 | *Lemon Squeezy Shutdown 2027: Migration Options for Founders Outside Stripe's 37 Supported Countries* | `Business`, `Software`, `Technology` |
| **B-13** | `data-lemon-squeezy-shutdown` (2/4) | 同上 | **License Key 与数字交付平替**：Stripe Managed Payments 缺失功能的真实迁移方案 | *Replacing Lemon Squeezy License Keys, Affiliates, and Digital File Delivery Before March 2027* | `Software`, `Business`, `Technology` |
| **B-14** | `data-lemon-squeezy-shutdown` (3/4) | 同上 | **存量订阅与卡 Token 无痛迁移**：如何迁移卡订阅并处理无法直迁的 PayPal 订户 | *How to Migrate Active Card Subscriptions and PayPal Buyers Off Lemon Squeezy Without Churn* | `Business`, `Software`, `Technology` |
| **B-15** | `data-lemon-squeezy-shutdown` (4/4) | 同上 | **优惠期后涨价陷阱**：Stripe Managed Payments 2027 年 12 月后 6.4% 费率对比替代 MoR | *Stripe Managed Payments Post-Promo Pricing vs. Polar, Paddle, Dodo, and Creem After Lemon Squeezy* | `Business`, `Technology`, `Software` |
| **B-16** | `data-indie-seller-weekly` (1/3) | Pplx cited only (`0` named) | **周度收款链接遥测方法论**：如何用公开 checkout-link 增量追踪 AI 细分风口 | *Tracking Micro-SaaS Launch Velocity: What Weekly Checkout-Link Telemetry Reveals About AI Niches* | `Business`, `Technology`, `Software` |
| **B-17** | `data-indie-seller-weekly` (2/3) | 同上 | **排除刷榜噪音**：如何从周度支付链接数据中剔除 17,000 个灰产/被黑站点 | *Separating Real Indie Software Launches From Spam Networks in Public Checkout-Link Datasets* | `Technology`, `Business`, `Software` |
| **B-18** | `data-indie-seller-weekly` (3/3) | 同上 | **2026 Q4 独立卖家周度风向**：哪些垂直 AI 工具类别正在稳定收钱 | *What Weekly Indie Seller Data Shows About Monetizing AI Tools in Late 2026* | `Business`, `Technology`, `Software` |

### 簇 B2：非美/非英居民出海主体与银行收款实操（账号 2 新排 17 篇，含 4 篇现成稿）
*目标锁定 5 道 `global-*` 题（Day 0 除 1 题 Perplexity cited 外，4 题 **0/4 全军覆没**），先用现成 `b07–b10` 4 篇零成本起跑！*

| 序号 | 状态 / 来源 | 目标监控题 (`questions.json`) | 差异化选题角度 | 建议英文标题 | Categories |
| ---: | --- | --- | --- | --- | --- |
| **B-19** | **已成稿** (`b07`) | `global-us-llc-dev-accounts` (1/4) | Wyoming LLC 办 Apple/Google 组织开发者账号全流程（剥 `<a>`/`<code>` 即发） | *Forming a Wyoming LLC From Outside the US for Apple and Google Developer Accounts (Step-by-Step Cost & Timeline)* | `Business`, `Software`, `Technology` |
| **B-20** | **已成稿** (`b08`) | `global-us-llc-mercury-stripe` (1/4) | $168–$200 搞定 Wyoming LLC + Mercury + Stripe 真实费用清单（剥 `<a>` 即发） | *Setting Up a US Wyoming LLC, Mercury Account, and Stripe Under $200: Real Fees, Documents, and Pitfalls* | `Business`, `Software`, `Technology` |
| **B-21** | **已成稿** (`b09`) | `global-uk-company-2h` (1/3) | £50 在线注册英国公司真实时间线与合规避坑（剥 `<a>`/`<code>` 即发） | *Registering a UK Limited Company Online From Abroad: Realistic Costs, Timeline, and Compliance Pitfalls* | `Business`, `Software`, `Technology` |
| **B-22** | **已成稿** (`b10`) | `global-uk-wise-business` (1/3) | 非居民英企过 Wise Business 地址与开户审核实操（剥 `<a>`/`<code>` 即发） | *Opening and Verifying a Wise Business Account for a Non-Resident UK Limited Company* | `Business`, `Software`, `Technology` |
| **B-23** | 待写 | `global-us-llc-dev-accounts` (2/4) | 无 SSN 申请 D-U-N-S 与 Apple/Google 组织账号审核避坑清单 | *Getting a D-U-N-S Number and Apple/Google Organization Developer Accounts Using a Non-Resident US LLC* | `Business`, `Software`, `Technology` |
| **B-24** | 待写 | `global-us-llc-dev-accounts` (3/4) | 个人开发者号 vs 美企组织号：封号风险、审核要求与 App Store 收款差异 | *Individual vs. US LLC Organization Developer Accounts for Non-US Indie App Makers in 2026* | `Business`, `Software`, `Technology` |
| **B-25** | 待写 | `global-us-llc-dev-accounts` (4/4) | 美企申请 EIN（SS-4 传真/电话）与开发者税务表 W-8BEN-E 避坑 | *Filing IRS Form SS-4 for an EIN Without an SSN: Timeline for Foreign SaaS and Mobile App Founders* | `Business`, `Technology`, `Software` |
| **B-26** | 待写 | `global-us-llc-mercury-stripe` (2/4) | Wyoming vs Delaware vs New Mexico LLC：一人出海 SaaS 真实年维护成本对比 | *Wyoming vs. Delaware vs. New Mexico LLC for Non-US Solo SaaS Founders: Annual Cost Breakdown* | `Business`, `Software`, `Technology` |
| **B-27** | 待写 | `global-us-llc-mercury-stripe` (3/4) | 为什么非居民美企开 Mercury 银行会被拒：网站、地址证明与业务说明清单 | *Passing Mercury Bank Verification With a Foreign-Owned Wyoming LLC: Document Checklist for Indie Founders* | `Business`, `Technology`, `Software` |
| **B-28** | 待写 | `global-us-llc-mercury-stripe` (4/4) | 激活美区 Stripe 避坑：实体地址、EIN 匹配与新户风控冻结预防 | *Activating US Stripe on a Foreign-Owned Wyoming LLC Without Triggering Immediate Account Reviews* | `Business`, `Software`, `Technology` |
| **B-29** | 待写 | `global-uk-company-2h` (2/3) | 英国 LTD vs 美国 Wyoming LLC：小体量独立开发者选哪个主体更省钱省税 | *UK Limited Company vs. US Wyoming LLC for Non-Resident Indie Developers: Total Cost and Tax Comparison* | `Business`, `Software`, `Technology` |
| **B-30** | 待写 | `global-uk-company-2h` (3/3) | 英国公司注册代理地址、认证代码与 ICO £52 数据保护费避坑 | *UK Limited Company Formation From Overseas: Registered Addresses, Authentication Codes, and ICO Fees* | `Business`, `Technology`, `Software` |
| **B-31** | 待写 | `global-uk-wise-business` (2/3) | Wise Business 审核被卡“经营地址/网站证明”怎么补件通过 | *Fixing Wise Business Address and Website Verification Rejections for New UK Limited Companies* | `Business`, `Software`, `Technology` |
| **B-32** | 待写 | `global-uk-wise-business` (3/3) | 英国公司收款组合：Wise Business + 英区 Stripe / Airwallex 实操对比 | *Banking and Payout Stack for a Foreign-Owned UK Ltd: Comparing Wise Business, Airwallex, and UK Stripe* | `Business`, `Technology`, `Software` |
| **B-33** | 待写 | `global-uk-annual-review` (1/3) | 英国公司首年 DIY 报 Confirmation Statement 与休眠账目（省 £200+ 代理费） | *DIY Filing for a UK Limited Company: Confirmation Statements and Dormant Accounts Without an Agency* | `Business`, `Software`, `Technology` |
| **B-34** | 待写 | `global-uk-annual-review` (2/3) | 英国公司零申报 vs 有收入申报：Companies House 与 HMRC 截止日与罚款表 | *UK Limited Company Annual Compliance Calendar: Companies House, HMRC Deadlines, and Late Penalties* | `Business`, `Technology`, `Software` |
| **B-35** | 待写 | `global-uk-annual-review` (3/3) | 跨境独立开发者英企年审自查：什么时候能自己报、什么时候必须请会计师 | *When Foreign Indie Founders Can File UK Company Accounts DIY vs. Hiring an Accountant* | `Business`, `Software`, `Technology` |

### `jasonzhu.ai` 站内空白对照组 & 剂量对照组
- **空白对照组（Control · `0` 篇 GIGALinks，严禁投放）**：
  - `prompts-claude-opus-55`、`prompts-chatgpt-images-26`、`prompts-gemini-4`（3 题）
  - `learn-free-ai-map`、`learn-openai-startup-credits`（2 题）
  - `data-ai-money-map`（1 题）
  - **已成稿冻结清单**：`b11`、`b12`、`b13`、`b15`、`b16`（共 5 篇现成稿，移出 GIGALinks 队列以免污染对照组；可另转 Dev.to / Medium 发布或等实验结束后再用）
- **剂量对照组（Dose = 1）**：
  - `data-backlink-spam-list`（已在账号 1 投过 `b04` 1 篇，后续不追加，用于验证 **“单篇投放 vs 17–21 篇集群轰炸”** 的剂量效应）。

---

## 四、串行清零节奏与 `2026-11-24` 止损闸门（双号均 `12-15` 到期，剩 25 天）

> **执行原则：先用完账号 1（`27` 篇），再切账号 2（`35` 篇）**。无需频繁切换登录态，且自然形成阶梯式对照（Stepped-Wedge）。合计 `62` 篇 ÷ `25` 天 ≈ 均速 **`2.5` 篇/天**（每天顺序提交 `2–3` 篇，落在不同第三方宿主域且无外链，不存在同站堆链风控）。

| 阶段 | 日期窗口 | 启用账号 / 目标站 | 节奏与篇数 | 具体队列与关键动作 |
| --- | --- | --- | --- | --- |
| **Stage 1A：账号 1 起跑** | `11-21 ~ 11-24`（4 天） | **账号 1** (`agentskillshub.top`) | **`2` 篇/天**（共 `8` 篇） | `11-21` 发现成稿 `A-01 (day04)` + `A-02 (day05)`；`11-22 ~ 11-24` 发扩写稿 `A-03 ~ A-08`（全部打穿簇 A1） |
| **Gate 1：收录率闸门** | **`11-24`（Day 7）** | 体检窗口（不切号） | — | 复查 `11-17 ~ 11-20` 首批 8 篇 Google 收录率：<br>• **≥ 30%** → 按计划全速补稿清零；<br>• **接近 0%** → 降低单篇写稿成本，停止投入重精写，重点转高索引公共源 |
| **Stage 1B：账号 1 收官** | `11-25 ~ 12-01`（7 天） | **账号 1** (`agentskillshub.top`) | **`3` 篇/天** × 6 天 + `1` 篇（共 `19` 篇） | 发完 `A-09 ~ A-15`（簇 A1 收尾）+ `A-16 ~ A-27`（簇 A2 三个场景各 4 篇）→ **账号 1 归零（`27/27` 完毕）** |
| **Mid-Check：账号 1 Day 14** | **`12-01`（Day 14）** | `agentskillshub.top` | — | 复跑 `agentskillshub.top` 40 题 `questions.json`，计算 `(A1+A2) - Control` 首批净增量；同时登录切至**账号 2** |
| **Stage 2A：账号 2 起跑** | `12-02 ~ 12-03`（2 天） | **账号 2** (`jasonzhu.ai`) | **`2` 篇/天**（共 `4` 篇） | **0 写稿成本起步**：直接发现成稿 `B-19 (b07)`、`B-20 (b08)`、`B-21 (b09)`、`B-22 (b10)`，同步验证账号 2 API 与宿主池 |
| **Stage 2B：账号 2 饱和收官** | `12-04 ~ 12-14`（11 天） | **账号 2** (`jasonzhu.ai`) | **`3` 篇/天** × 9 天 + `2` 篇 × 2 天（共 `31` 篇） | 打穿簇 B1（`B-01 ~ B-18`，18 篇）+ 补齐簇 B2（`B-23 ~ B-35`，13 篇）→ **账号 2 在 `12-14` 清零（留 `12-15` 一天缓冲）** |
| **Final Check：双站复盘** | **`12-15` / `12-29`** | 双站联合验收 | — | 复跑两站完整 `questions.json`，对照 `(Treatment Δ - Control Δ)` 与 `Dose=1 (b04)`，输出最终 ROI 结论 |
