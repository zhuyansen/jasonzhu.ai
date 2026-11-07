import type { Guide } from "../go-global-guides";

// 各市场用哪些 AI、联网资料从哪来、robots.txt 放行哪些爬虫：用量是调查和第三方统计，来源和爬虫只写各公司自己的文档。
// 调研笔记在 ~/出海/research/2026-11-by-market/07-ai-assistants.md（不在仓库里）。Statcounter 的 AI 份额一律用 2026-09。
const BING_PREFS = "https://blogs.bing.com/search/2026/10/your-content-your-choice-clearer-preferences-for-training-and-grounding/";
const WEB_IQ = "https://www.microsoft.com/en-us/webiq";
const OPENAI_BOTS = "https://developers.openai.com/api/docs/bots";
const GOOGLE_AI = "https://developers.google.com/search/docs/appearance/ai-features";
const GOOGLE_CRAWLERS = "https://developers.google.com/search/docs/crawling-indexing/google-common-crawlers";
const SC_AI = "https://gs.statcounter.com/ai-chatbot-market-share/all";

export const AI_ASSISTANTS: Guide = {
  slug: "ai-assistants",
  short: "各市场的 AI 助手",
  title: "各市场用哪些 AI，它们的资料从哪来：ChatGPT、Gemini、Copilot、Naver、Yandex、豆包、DeepSeek，以及 robots.txt 放行哪些爬虫",
  description:
    "想被 AI 引用，先知道每个市场的人用哪个 AI、它联网时从哪个索引取资料：美国、印尼、越南、日本、韩国、俄罗斯、中国、欧洲的 AI 用量，各产品的联网来源，以及训练用和搜索用的爬虫怎么分开设置。",
  intro:
    "做 GEO 先得弄清两件事：你的用户在用哪个 AI，这个 AI 联网时从哪里取资料。ChatGPT 和 Copilot 都用得到 Bing 的索引，Gemini 和 AI 概览用 Google 的索引，Naver、Yandex、百度的 AI 主要用自家的搜索结果。下面先按市场看用量，再按产品看来源和爬虫。",
  checked: "2026-11-07",
  sections: [
    {
      id: "markets",
      title: "各市场在用哪些 AI",
      lead: "Statcounter 的「AI 聊天机器人份额」量的是各 AI 送到网站的点击，不是用户数。2026 年 10 月 9 日起，ChatGPT 的很多链接不再带来源标记，被记成直接访问，所以这里用 9 月的数。",
      items: [
        {
          text: "美国：Pew 2026 年 2 月的调查，49% 的成年人用 AI 聊天机器人，其中 ChatGPT 44%、Gemini 24%、Copilot 17%、Meta AI 14%、Grok 8%、Claude 6%；60% 的人读过搜索结果顶部的 AI 摘要。",
          sources: [{ label: "Pew（2026-06-17）", url: "https://www.pewresearch.org/internet/2026/06/17/americans-and-ai/" }],
        },
        {
          text: "Google 只公布全球数：AI 概览月活 25 亿以上；AI Mode 月活 10 亿以上，已经和 AI 概览合并成一个体验；Gemini App 有 10 亿用户。",
          sources: [
            { label: "Google I/O（2026-05-19）", url: "https://blog.google/innovation-and-ai/sundar-pichai-io-2026/" },
            { label: "Alphabet Q2", url: "https://blog.google/company-news/inside-google/message-ceo/alphabet-earnings-q2-2026/" },
            { label: "Alphabet Q3", url: "https://blog.google/company-news/inside-google/message-ceo/alphabet-earnings-q3-2026/" },
          ],
        },
        {
          text: "印尼：2026 年 5 月的真实受众份额 ChatGPT 45.7%、Gemini 31.2%、Claude 7.8%（Sensor Tower）。AI Mode 2025 年 9 月起支持印尼语、日语和韩语。",
          sources: [
            { label: "Databoks", url: "https://databoks.katadata.co.id/en/technology-telecommunications/statistics/6a38aafac9f50/share-of-ai-assistants-audience-in-indonesia-in-may-2026-chatgpt-declines-gemini-rises" },
            { label: "Google", url: "https://blog.google/products/search/ai-mode-expands-more-languages/" },
          ],
        },
        {
          text: "越南：2025 年 7 月的调查，78% 的网民近 3 个月用过 AI；ChatGPT 81%、Gemini 51%、Meta AI 36%，本土的 AI Hay 9%、Zalo 的 Kiki 3%。",
          sources: [{ label: "Việt Nam News", url: "https://bizhub.vietnamnews.vn/vietnamese-embrace-ai-78-have-used-ai-tools-local-platforms-gain-ground-post383046.html" }],
        },
        {
          text: "日本：2026 年 2 月的调查，54.7% 的网民一年内用过生成式 AI；ChatGPT 36.2%、Gemini 25.0%、Copilot 13.3%、Claude 4.3%、Perplexity 4.0%。",
          sources: [{ label: "ICT総研", url: "https://ictr.co.jp/report/20260220.html/" }],
        },
        {
          text: "韩国：2026 年 9 月的 App 月活，ChatGPT 2,470 万、Gemini 987 万、Claude 404 万；Naver 的 AI 摘要（AI 브리핑）每月 3,000 万人用，AI 标签页 7 月破 1,000 万。",
          sources: [
            { label: "byline（2026-10-13）", url: "https://byline.network/?p=9004111222623015" },
            { label: "byline（2026-07-15）", url: "https://byline.network/2026/07/15_naver/" },
          ],
        },
        {
          text: "俄罗斯：2026 年 9 月，12 岁以上人群每月有 55% 用 AI；Yandex 的 Alice AI 5,900 万、DeepSeek 1,300 万、GigaChat 600 万（只算官网和 App）。Yandex 搜索里的 Alice AI 快速回答，二季度每月有 4,950 万人看到，约 42% 的查询会出现。",
          sources: [
            { label: "kod.ru（2026-10-16）", url: "https://kod.ru/auditoriia-neirosetei-vyrosla" },
            { label: "Trashbox（2026-07-29）", url: "https://trashbox.ru/link/2026-07-28-alisa-ai-50-mln-chelovek" },
          ],
        },
        {
          text: "中国大陆：QuestMobile 2026 年 9 月，AI 原生 App 月活 5.46 亿，豆包 4.19 亿、千问 1.58 亿、DeepSeek 1.23 亿、元宝 3,733 万。Statcounter 的中国页只反映装了它统计代码的网站，不代表国内用户。",
          sources: [
            { label: "腾讯新闻（2026-10-20）", url: "https://news.qq.com/rain/a/20261020A06WHG00" },
            { label: "搜狐（2026-11-03）", url: "https://www.sohu.com/a/1096692614_100116740" },
          ],
        },
        {
          text: "欧洲、英国：2025 年欧盟 16–74 岁的人有 32.7% 用过生成式 AI，16–24 岁是 63.8%。Statcounter 9 月：欧洲 ChatGPT 78.8%、Gemini 12.8%；英国 ChatGPT 79.8%、Gemini 10.2%。",
          sources: [
            { label: "Eurostat（2026-02-10）", url: "https://ec.europa.eu/eurostat/web/products-eurostat-news/w/edn-20260210-1" },
            { label: "Statcounter 欧洲", url: `${SC_AI}/europe` },
            { label: "Statcounter 英国", url: `${SC_AI}/united-kingdom` },
          ],
        },
      ],
    },
    {
      id: "chatgpt",
      title: "ChatGPT",
      items: [
        {
          text: "微软的 Web IQ 建在 Bing 的全球索引上，官方产品页写明它支撑包括 Copilot 和 ChatGPT 在内的 AI 助手。",
          sources: [{ label: "Microsoft Web IQ", url: WEB_IQ }],
        },
        {
          text: "OpenAI 的爬虫分开设置：OAI-SearchBot 管搜索，屏蔽了就不会出现在 ChatGPT 搜索的答案里，改 robots.txt 约 24 小时生效；GPTBot 管训练，和前者互不影响；ChatGPT-User 是用户提问时临时抓取，robots.txt 不一定管得到。",
          sources: [{ label: "OpenAI 爬虫", url: OPENAI_BOTS }],
        },
      ],
    },
    {
      id: "copilot",
      title: "Copilot 和 Bing",
      items: [
        {
          text: "微软说 Copilot 和 Microsoft 365 用 Bing 的内容生成回答，爬虫只有 Bingbot。",
          sources: [{ label: "Bing 博客（2026-10-30）", url: BING_PREFS }],
        },
        {
          text: "2027 年 2 月 1 日起，用页面上的 Bingbot meta 标签（ai-grounding）控制内容能不能用于 AI 回答；disallowextended 表示只给微软自己的产品用，不给 Web IQ 等第三方。训练偏好在 robots.txt 里写 __usage_ai-training。这些设置都不能覆盖 robots.txt 对 Bingbot 的屏蔽。",
          sources: [{ label: "Bing 博客（2026-10-30）", url: BING_PREFS }],
        },
        {
          text: "现在用 NOARCHIVE、NOCACHE 控制；2027 年 3 月 1 日以后，Bing 不再把它们当作训练或引用的偏好。",
          sources: [{ label: "Bing 博客（2026-10-30）", url: BING_PREFS }],
        },
      ],
    },
    {
      id: "google",
      title: "Gemini、AI 概览和 AI Mode",
      items: [
        {
          text: "都用 Google 的搜索索引：能被收录、可以显示摘要的页面就有资格进 AI 概览和 AI Mode，没有额外的技术要求。能控制的只有 Googlebot 的 robots 规则和 nosnippet、max-snippet、noindex。",
          sources: [{ label: "Google AI 功能", url: GOOGLE_AI }],
        },
        {
          text: "Google-Extended 只是 robots.txt 里的一个令牌，管 Gemini 的训练，以及 Gemini App 和 Vertex AI 联网时的引用；官方说它不影响 Google 搜索收录，也不是排名信号。所以屏蔽它不会让你退出 AI 概览和 AI Mode，但会退出 Gemini App 的联网引用。",
          sources: [{ label: "Google 常用爬虫", url: GOOGLE_CRAWLERS }],
        },
        {
          text: "Search Console 2026 年 8 月起有一个开关，可以让网站不出现在 AI 概览、AI Mode 等生成式 AI 功能里。",
          sources: [{ label: "Search Console 帮助", url: "https://support.google.com/webmasters/answer/16908024" }],
        },
        {
          text: "Google-Agent 替用户在网页上操作，这类用户触发的抓取通常不看 robots.txt。",
          sources: [{ label: "Google 用户触发的抓取", url: "https://developers.google.com/search/docs/crawling-indexing/google-user-triggered-fetchers" }],
        },
      ],
    },
    {
      id: "perplexity-claude",
      title: "Perplexity 和 Claude",
      items: [
        {
          text: "Perplexity 用自己的索引，号称数千亿网页。PerplexityBot 用于搜索结果、不用于训练；Perplexity-User 是用户触发的抓取，通常忽略 robots.txt。",
          sources: [
            { label: "Perplexity 博客", url: "https://www.perplexity.ai/hub/blog/introducing-the-perplexity-search-api" },
            { label: "Perplexity 爬虫", url: "https://docs.perplexity.ai/guides/bots" },
          ],
        },
        {
          text: "Anthropic 列出的联网搜索服务商有 Brave Search（全部产品），还有 TurboPuffer 和 Parallel Web Systems。Claude 的爬虫分三种：ClaudeBot 管训练，Claude-SearchBot 管搜索索引（屏蔽会降低在搜索结果里的可见度），Claude-User 是用户提问时抓取。",
          sources: [
            { label: "Anthropic 服务商清单", url: "https://trust.anthropic.com/subprocessors" },
            { label: "Claude 爬虫说明", url: "https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler" },
          ],
        },
      ],
    },
    {
      id: "naver-yandex",
      title: "Naver 和 Yandex",
      items: [
        {
          text: "Naver 的 AI 回答主要引用自家平台（博客、Cafe、Clip）和政府等官方出处，第三方统计有 46.5% 的引用来自 Naver 博客。爬虫叫 Yeti，官方 robots 指南里没有单独的 AI 爬虫。",
          sources: [
            { label: "byline（2025-03-24）", url: "https://byline.network/2025/03/27-432/" },
            { label: "ditoday（2026-10-15）", url: "https://ditoday.com/?p=154900" },
            { label: "Naver robots 指南", url: "https://searchadvisor.naver.com/guide/seo-basic-robots" },
          ],
        },
        {
          text: "Yandex 的 Alice AI 先改写问题，再调用 Yandex 搜索的结果，偏好排名靠前的来源。YandexBot 抓主索引；YandexAdditional 单独控制内容能不能进快速回答和 Alice AI 的回答，只对已收录的页面生效；Yandex 没有训练专用的爬虫。",
          sources: [
            { label: "Yandex Webmaster 帮助", url: "https://yandex.ru/support/webmaster/ru/alice.html" },
            { label: "Yandex 爬虫列表", url: "https://yandex.ru/support/webmaster/ru/robot-workings/check-yandex-robots" },
          ],
        },
      ],
    },
    {
      id: "china",
      title: "中国的 AI",
      items: [
        {
          text: "豆包：火山引擎的联网插件默认搜全网，可以再加抖音百科和头条图文；豆包 App 是否用同一套没说。字节的爬虫 Bytespider 没有官方文档，曾被报道不遵守 robots。",
          sources: [
            { label: "火山引擎文档", url: "https://docs.volcengine.com/docs/82379/1756990?lang=zh" },
            { label: "Fortune（2024-10-03）", url: "https://fortune.com/2024/10/03/bytedance-tiktok-bytespider-scraper-bot/" },
          ],
        },
        {
          text: "DeepSeek 的联网搜索 API 写的是「由 DeepSeek 自研搜索引擎提供支持」；App 是否同源没说，爬虫也没有官方文档。",
          sources: [{ label: "DeepSeek 文档", url: "https://api-docs.deepseek.com/zh-cn/guides/search/" }],
        },
        {
          text: "腾讯元宝上线时接入了微信搜一搜和搜狗，覆盖公众号内容；据腾讯内部人士 2026 年的说法，元宝搜索整合了 QQ 浏览器和搜狗的技术，设了反爬的网站不收录。",
          sources: [
            { label: "新京报（2024-05-30）", url: "https://m.bjnews.com.cn/detail/1717043325129809.html" },
            { label: "虎嗅（2026-11-03）", url: "https://www.huxiu.com/article/4899986.html" },
          ],
        },
        {
          text: "百度的 AI 搜索用百度搜索的结果，爬虫是 Baiduspider，没有文心专用的爬虫。",
          sources: [
            { label: "百度千帆文档", url: "https://cloud.baidu.com/doc/qianfan/s/Smh4sutup" },
            { label: "百度帮助", url: "https://help.baidu.com/question?prod_en=master&class=Baiduspider" },
          ],
        },
      ],
    },
  ],
  pitfalls: [
    {
      text: "屏蔽 GPTBot，以为就退出了 ChatGPT 搜索：搜索看的是 OAI-SearchBot。",
      sources: [{ label: "OpenAI 爬虫", url: OPENAI_BOTS }],
    },
    {
      text: "屏蔽 Google-Extended，以为能退出 AI 概览：它只管 Gemini App 和训练，AI 概览跟着 Googlebot 走。",
      sources: [{ label: "Google 常用爬虫", url: GOOGLE_CRAWLERS }],
    },
    {
      text: "只放行 Googlebot、拦掉 Bingbot：Copilot 和用 Web IQ 的 AI 助手都拿不到你的页面。",
      sources: [
        { label: "Bing 博客", url: BING_PREFS },
        { label: "Microsoft Web IQ", url: WEB_IQ },
      ],
    },
    {
      text: "用 Statcounter 2026 年 10 月的数看 ChatGPT 份额：10 月起很多 ChatGPT 链接不带来源标记，份额被大大低估。",
      sources: [{ label: "LLM Pulse", url: "https://llmpulse.ai/blog/chatgpt-referral-traffic-fell/" }],
    },
  ],
  unknowns: [
    "ChatGPT 现在具体用哪几家搜索服务商：微软说 Web IQ 支撑 ChatGPT，OpenAI 自己没点名。",
    "Claude 的三家搜索服务商各管什么。",
    "GigaChat、千问、豆包 App、DeepSeek App 联网用哪套索引。",
    "Bytespider、DeepSeek、夸克、搜狗、元宝的爬虫都没有官方文档。",
    "Naver 有没有独立的 AI 爬虫，AI 回答引用外部网站的比例是多少。",
    "AI 概览和 AI Mode 分国家的用户数，以及 AI Mode 是否支持越南语。",
    "越南、印尼 2026 年的全国性调查，以及 Kimi 和夸克 2026 年的月活。",
  ],
  related: [
    { label: "先讨好哪个搜索引擎", path: "/search-engines" },
    { label: "站长后台和收录提交", path: "/indexing" },
    { label: "域名怎么选", path: "/domains" },
  ],
};
