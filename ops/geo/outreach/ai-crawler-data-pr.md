# AI 爬虫公开数据：PR 外联计划（草稿，一封没发）

> **创建**：2026-11-26。数据页 `/research/ai-crawlers`（中英）、下载在 `/data/ai-crawlers/`，生成脚本 `ops/geo/crawler_stats.py`。
> **现在不发**：等分支合并、页面上线、Jason 看过这份名单和邮件再发。发之前打开数据页，把邮件里的数换成当时页面上的数。
> **规矩（和 `ops/geo/tier1-data-outreach-pack.md` 一致）**：
> - 不买链接，也不在信里要链接。先讲故事和数据，链接只放数据页本身（`https://jasonzhu.ai/en/research/ai-crawlers`）和下载文件。
> - 不链冻结组的页面：`questions.json` 的目标页，`experiments.json` 两个实验（gigalinks-jasonzhu、bluf-real-2026-11-25）处理组、对照组的页面。提示词库、首页、收款报告这些都不放进信里。
> - 收件人的邮箱、DM 记录不写进这个公开仓库；发了什么、哪天发、谁回了，记在私下的表里。
> - 一个人最多跟进一次，间隔至少一周。

## 为什么找这批人

Eli Schwartz 在 *Product-Led SEO* 里讲蓝海做法：做一份只有你有的数据页，靠 PR 拿链接，而不是写关键词文章。找人的规则是：**已经写过这个话题（或写过同类数据）的人，最可能再写你**；开口先讲故事，不是求链接。

下面 13 组人都公开写过 AI 爬虫流量、llms.txt 或 AI 搜索引用，每条附他们的原文。我们的数据是一个真实独立站的服务器日志，能补上他们的两类缺口：
- **网络级数据的一个落地样本**：Cloudflare、Akamai、TollBit、Vercel 看的是整个网络或大批出版商，单个独立站的情况没人公开过；我们有逐个爬虫、逐天、带 IP 段核验的计数。
- **llms.txt 和引用率的实测**：Ahrefs 量了 13.7 万个站的 llms.txt，我们这边是同一件事在单个站上谁来读；引用率是每周固定题、按题算区间的面板。

## 能讲的故事（2026-11-26 版本，数字都能在页面上找到）

数据范围：2026-10-26 到 11-25（UTC，31 天，10-26 从 12:58 开始记）。

| # | 故事 | 数 | 要一起说的限制 |
|---|---|---|---|
| A | **最大的 AI 爬虫不是 OpenAI，是 Exa** | 69,348 次 AI 爬虫请求里 Exa 23,465 次（34%，其中 ExaSearchBot 22,218）；OpenAI 10,788（16%）、Perplexity 10,602（15%）、Anthropic 9,036（13%） | 按 User-Agent 认的；Exa 没有可核对的公开 IP 段，这部分没核验 |
| B | **llms.txt 一个月 88 次，robots.txt 5,900 次** | llms.txt 88 次，AI 爬虫 32 次（ExaSearchBot 10、ChatGPT-User 8、OAI-SearchBot 2、GPTBot 2、ClaudeBot 1、PerplexityBot 1）；本站没有的 `/ai.txt` 也被要了 23 次 | 只有一个站；llms.txt 11-24 改过一次 |
| C | **AI 替人读了 8,979 次页面，AI 带来的访问一周约 70 次** | 用户触发：Claude-User 4,490、ChatGPT-User 3,183、ExaUser 1,247；GA4 里 11-16 到 11-22 的 7 天，ChatGPT 带来 52 次会话、Claude 18 次；同样几天 ChatGPT-User 读 897 次、Claude-User 606 次 | GA4 只算允许统计的访客（欧洲要先同意）；面板自己会触发一部分读页（11-21 面板那天 ChatGPT-User 322 次，平时中位数 93）。只比数量级 |
| D | **只有 29% 的 AI 爬虫请求能用公布的 IP 段核实** | 19,902 / 69,348；OpenAI 三个爬虫 97.5–99.4% 在段内；Anthropic 全部、PerplexityBot 82% 没核验 | 没核验不等于冒充：工具手里 Anthropic、Perplexity 的 IP 段超过 7 天没更新，这是我们这边的缺口 |
| E | **Perplexity 引用最多，但 Perplexity-User 一次都没来过** | 11-23 面板，不提本站的题：Perplexity 42/141（29%，区间 17–45%），ChatGPT 8/137（5%），Gemini App 4/130（3%），Google AI Mode 4/139（2%）；PerplexityBot 10,602 次，Perplexity-User 0 次 | Perplexity 走 API（sonar），和网页版可能不同；题目是本站自己的话题 |
| F | **训练爬虫还在撞旧链接** | ClaudeBot 11% 的请求是 4xx，Amazonbot 16%；GPTBot 0.6%、ChatGPT-User 0.8% | 4xx 多是提示词库的旧详情页，11-25 起改成 301 |
| G | **62% 的 AI 爬虫请求去了提示词库** | /prompts 42,975 次 | 本站结构特殊（提示词库很大），别的站会不一样 |

## 名单（13 组，按优先级）

「署名」一列：**原文** = 在原文页面或作者自己的网站上能看到署名；**摘要** = 搜索摘要里给的署名，发之前打开原文再看一眼。

| # | 谁 | 写过什么 | 署名 | 为什么合适 | 先讲 |
|---|---|---|---|---|---|
| 1 | **Louise Linehan**（Ahrefs 内容营销） | [We Analyzed 137K Sites: 97% of llms.txt Files Never Get Read](https://ahrefs.com/blog/llmstxt-study/)（2026-06-15，13.7 万个站的服务器日志） | 原文 | 她量的是 llms.txt 在大量站点上有没有人读；我们给出单个站上「到底是谁在读」，按爬虫拆开、带 IP 核验，正好是她那篇的一个具体样本 | B，再带 A |
| 2 | **Dries Buytaert**（Drupal 创始人，个人站 dri.es） | [Markdown, llms.txt and AI crawlers](https://dri.es/node/6121)，另有 [The Third Audience](https://dri.es/node/6051) | 原文 | 他自己公开过个人站的爬虫日志和 llms.txt 请求，是最接近的同行；两个个人站的数据放在一起比，本身就是一篇文章 | B、C |
| 3 | **Matt G. Southern**（Search Engine Journal 资深新闻作者） | [97% Of LLMS.txt Files Got No Requests, Ahrefs Data Shows](https://www.searchenginejournal.com/97-of-llms-txt-files-got-no-requests-ahrefs-data-shows/579478/) | 摘要 | 他常把各家的爬虫、llms.txt 研究写成新闻；「最大的 AI 爬虫是 Exa」是新闻钩子，CSV 让他能自己核 | A，限制一起说 |
| 4 | **Ryan Siddle**（MERJ，和 Vercel 合作的研究） | [The rise of the AI crawler](https://vercel.com/blog/the-rise-of-the-ai-crawler)（2024-12，ChatGPT、Claude 爬虫三成多的请求撞 404，不执行 JavaScript） | 摘要 | 本站就在 Vercel 上，数据正是从 Vercel 日志转出来的；两年后单站的 404 比例（GPTBot 0.6%、ClaudeBot 11%）可以对照他们当时的结论 | F、A |
| 5 | **David Belson、Sam Rhea**（Cloudflare） | [The crawl before the fall… of referrals](https://blog.cloudflare.com/ai-search-crawl-refer-ratio-on-radar)（Radar 上的 crawl-to-refer 比） | 摘要 | 他们算的是全网的「爬多少、带回多少」；我们有单站的用户触发读页和 GA4 访问，还写清了 GA4 同意、面板自触发这些会让比例失真的地方 | C、D |
| 6 | **Kevin Indig**（Growth Memo） | [AI 怎么挑引用来源](https://www.growth-memo.com/p/the-science-of-how-ai-picks-its-sources)、[几家引擎引用的重合度（consensus gap）](https://www.growth-memo.com/p/the-consensus-gap) | 原文（他自己的通讯） | 他研究 AI 引用哪些来源、各引擎差多少；我们的面板每周固定题、每题问 3 次、按题算 95% 区间，提不提品牌名差别极大（ChatGPT 83% 对 5%） | E |
| 7 | **Tom Emmons**（Akamai AI Pulse） | [AI Pulse 系列里讲 AI 搜索爬虫增长的一篇](https://www.akamai.com/blog/security/ai-pulse-rise-ai-search-crawlers) | 原文 | 他看到 AI 搜索爬虫阶梯式猛涨；本站 AI 搜索爬虫占 AI 爬虫请求的 58%，11-22 单日 5,195 次（PerplexityBot、GPTBot 同一天猛增）可以拿来和他的曲线对照 | A，附每天的图 |
| 8 | **Jeremy Howard**（Answer.AI，llms.txt 提出人） | [/llms.txt—a proposal to provide information to help LLMs use websites](https://www.answer.ai/posts/2024-09-03-llmstxt)（2024-09-03） | 原文 | llms.txt 有没有人读，提出人最关心；单站一个月按爬虫拆开的实测，不带立场 | B |
| 9 | **Simon Willison**（simonwillison.net） | [2025-08-04 测 ChatGPT agent 的 User-Agent](https://simonwillison.net/2025/Aug/4/chatgpt-agents-user-agent/)（ChatGPT agent 用普通浏览器 UA 访问） | 原文 | 他写过「AI 代理用浏览器 UA 来访，日志里认不出」；我们页面把这条写进局限，另有 ChatGPT-User、Claude-User 的核验结果，他会在意这种把限制写清楚的数据 | C、D |
| 10 | **Evil Martians 团队**（Martian Chronicles） | [Which AI actually reads your site? Two months of AI agent and LLM traffic, measured](https://evilmartians.com/chronicles/which-ai-actually-reads-your-site-two-months-of-llm-traffic-measured) | 没查到个人署名，发之前看原文 | 他们在自己网站上量出 Claude Code 是最大的 AI 读者；本站用户触发里 Claude-User 也是第一（4,490 次，多过 ChatGPT-User 的 3,183 次），两边可以互相印证 | C |
| 11 | **Slobodan「Sani」Manić**（No Hacks 播客） | [229: Does llms.txt Work? What 137,000 Domains' Server Logs Show](https://nohacks.co/episode/229-does-llmstxt-work-what-137000-domains-server-logs-show) | 原文 | 播客专讲 agentic web，刚做过 llms.txt 日志这一期；适合约一期嘉宾，讲一个独立站一个月的真实日志 | B、C（做嘉宾，不是要链接） |
| 12 | **Toshit Panigrahi、Olivia Joslin**（TollBit 联合创始人） | [State of the AI Bots 季度报告](https://tollbit.com/bots/25q2)（抓取和带回流量的比） | 原文 | 他们的报告看出版商，我们是独立开发者的站，属于报告里没有的那一类；可以问他们要不要把这类站当对照 | C |
| 13 | **Charlotte Tobitt**（Press Gazette） | [采访 TollBit 两位创始人：机器读者会成为出版商的主要收入来源](https://pressgazette.co.uk/platforms/publishers-urged-to-embrace-future-where-bot-readers-provide-majority-of-revenue/) | 摘要 | 她报道「机器读者」这条线；我们能给一个非出版商网站一个月里机器怎么读的完整账本 | C、A |

先发 1–5（最贴近、最可能写），过一周再发 6–13。12 月初数据页第一次每月更新（补齐 11 月），是第二个时间点：没回的人这时可以用新一个月的数再跟进一次。

## 英文邮件草稿（通用版）

每封只改第一段，写对方那篇文章里的一个具体点；不加附件，只给链接。下面用的是 2026-11-26 版本的数。

```text
Subject: Open data: on a real indie site, the biggest AI crawler wasn't OpenAI

Hi {first name},

{One sentence on their piece, e.g. "Your 137K-site llms.txt study made me look at who reads mine."}

I run jasonzhu.ai, a bilingual indie blog hosted on Vercel, and I've started publishing its
crawler logs as monthly open data (CC BY 4.0). Three things from the first month
(Oct 26 – Nov 25, 2026, UTC) surprised me:

1. The biggest AI crawler wasn't OpenAI or Anthropic. Exa made 34% of the 69,348 AI crawler
   requests (by user agent; Exa publishes no IP list to check against). OpenAI, Perplexity and
   Anthropic made 13–16% each.
2. llms.txt was requested 88 times in 31 days; robots.txt 5,900 times. 32 of the llms.txt
   requests came from AI crawlers (ExaSearchBot 10, ChatGPT-User 8).
3. Only 29% of the AI crawler requests could be verified against the operators' published IP
   ranges, partly because the IP lists our log tool held for Anthropic and Perplexity were more
   than a week old. Unverified isn't the same as fake, and the page says so.

The page has daily counts per crawler, what they read, verification, and a weekly panel of how
often ChatGPT, Gemini, Google AI Mode and Perplexity cite the site, with 95% intervals:
https://jasonzhu.ai/en/research/ai-crawlers

If a cut that isn't in the CSV would help, I'm happy to run it. No IP addresses or user agent
strings are published.

Jason Zhu
jasonzhu.ai
```

按人换的那一条（第 1、3 条之间选一条放最前面）：
- 写 llms.txt 的（1、2、8、11）：把第 2 条放第一。
- 写 crawl-to-refer、出版商的（5、12、13）：第一条换成故事 C：「AI assistants fetched pages 8,979 times on users' behalf; GA4 counted about 70 visits a week from them」，限制照写。
- 写 AI 引用的（6）：第一条换成故事 E。
- 写 404 和 JavaScript 的（4）：第一条换成故事 F。

## 发之前检查

- [ ] 分支已合并、页面已上线，`/en/research/ai-crawlers` 和两份 CSV、JSON 都能打开。
- [ ] 信里的数和当时的页面一致（每月更新后数字会变，版本号见页面头部）。
- [ ] 每封第一段写了对方文章里的具体一点；「署名」一列写着「摘要」的，打开原文确认过名字。
- [ ] 信里只有数据页和下载文件的链接，没有冻结组页面的链接。
- [ ] 发了什么记在私下的表里，不进这个仓库。
