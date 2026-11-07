import type { Guide } from "../go-global-guides";

// 出海站先讨好哪个搜索引擎：Jason 2026-11 的排序（mine）+ 各市场份额和各引擎自己的说法。
// 份额主表是 Statcounter 2026-10（2026-11-01 下载）；俄罗斯、韩国、日本、中国另配本地口径。
// 数据整理在私有 SEO 对照手册的份额附录页，调研笔记在 ~/出海/research/2026-11-by-market/（不在仓库里）。
const SC = "https://gs.statcounter.com/search-engine-market-share";
const WEB_IQ = "https://www.microsoft.com/en-us/webiq";

export const SEARCH_ENGINES: Guide = {
  slug: "search-engines",
  short: "先讨好哪个搜索引擎",
  title: "出海站先讨好哪个搜索引擎：美国、印尼、越南、日本、韩国、俄罗斯、中国、欧洲按市场排先后",
  description:
    "做出海站，SEO 第一步是先想清楚讨好哪个搜索引擎：各市场 Google、Bing、Naver、Yandex、百度、Seznam 的份额，几种统计口径差在哪，以及 Bing 索引为什么连着 Copilot 和 ChatGPT。",
  intro:
    "做出海站，SEO 第一步不是写内容，是先想清楚该讨好哪个搜索引擎。份额主要用 Statcounter 2026 年 10 月的数：它量的是装了统计代码的网站收到的搜索来访，按访客 IP 分国家，不是搜索次数，AI 回答里没点出去的也不算。俄罗斯、韩国、日本、中国这几个地方，要配本地口径一起看。",
  checked: "2026-11-07",
  mine: {
    title: "我的排序",
    lead: "别默认全世界都是 Google；日韩俄中，每个市场都有自己的门要过。",
    points: [
      "美国英文站：Google 优先，其次 Bing。做 GEO 的话 Bing 就不是可选项。",
      "印尼、越南：只管 Google。",
      "日本：Google 和 Bing 一样重要。电脑端一半以上在 Bing，B2B 和工具站别忽略。",
      "韩国：先做 Naver。它先排自家平台内容，外部网站排在后面，玩法完全不同。",
      "俄罗斯：Yandex 优先，Google 也不能丢。",
      "中国：百度。先过实名、站点验证、主动推送这几道门。",
      "欧洲、英国：Google 优先，其次 Bing；做捷克市场要加上 Seznam。",
    ],
    links: [],
  },
  sections: [
    {
      id: "us",
      title: "美国：Google 优先，其次 Bing",
      items: [
        {
          text: "Statcounter 2026 年 10 月：Google 85.5%，Bing 9.8%，Yahoo 2.5%，DuckDuckGo 1.7%。Bing 的年平均从 2019 年的 6.1% 涨到 2026 年 1–10 月的 9.5%。",
          sources: [{ label: "Statcounter 美国", url: `${SC}/all/united-states-of-america` }],
        },
        {
          text: "Yahoo 的搜索结果全部来自 Bing，DuckDuckGo 的网页结果大部分来自 Bing，所以美国走 Bing 索引的搜索来访合计约 14%。",
          sources: [
            { label: "Yahoo 帮助", url: "https://en-maktoob.help.yahoo.com/kb/SLN35619.html" },
            { label: "DuckDuckGo", url: "https://duckduckgo.com/duckduckgo-help-pages/results/sources/" },
          ],
        },
        {
          text: "微软说 Copilot 和 Microsoft 365 用 Bing 的内容生成回答；它 2026 年 6 月推出的 Web IQ 建在 Bing 的全球索引上，官方产品页写明 Web IQ 支撑包括 Copilot 和 ChatGPT 在内的 AI 助手。",
          sources: [
            { label: "Bing 博客（2026-10-30）", url: "https://blogs.bing.com/search/2026/10/your-content-your-choice-clearer-preferences-for-training-and-grounding/" },
            { label: "Microsoft Web IQ", url: WEB_IQ },
          ],
        },
      ],
    },
    {
      id: "id-vn",
      title: "印尼、越南：只管 Google",
      items: [
        {
          text: "印尼 Google 91.4%、Bing 3.4%；越南 Google 93.4%，本地引擎 Cốc Cốc 5.6%（2019 年 3.4%）。",
          sources: [
            { label: "Statcounter 印尼", url: `${SC}/all/indonesia` },
            { label: "Statcounter 越南", url: `${SC}/all/viet-nam` },
          ],
        },
        {
          text: "Cốc Cốc 没有站长后台，只有一个提交网址的表单，站点地图要写在 robots.txt 里；它优先抓越南语网站和 .vn 域名。",
          sources: [{ label: "Cốc Cốc", url: "https://coccoc.com/search/console/get-your-website-on-coc-coc-search" }],
        },
      ],
    },
    {
      id: "japan",
      title: "日本：Google 和 Bing 一样重要",
      items: [
        {
          text: "全部设备合计：Google 59.3%，Bing 32.5%，Yahoo! JAPAN 6.6%。",
          sources: [{ label: "Statcounter 日本", url: `${SC}/all/japan` }],
        },
        {
          text: "电脑端 Bing 从 2025 年 7 月的 17.0% 涨到 2026 年 10 月的 55.4%，有几个月超过了 Google；手机端 Bing 一直不到 1%，Google 88.0%，Yahoo! JAPAN 9.2%。",
          sources: [
            { label: "Statcounter 日本电脑端", url: `${SC}/desktop/japan` },
            { label: "Statcounter 日本手机端", url: `${SC}/mobile/japan` },
          ],
        },
        {
          text: "Yahoo! JAPAN 2010 年起用 Google 的搜索引擎，没有自己的站长后台，所以手机上约 97% 的搜索来访走 Google 的索引。",
          sources: [
            { label: "2010 年公告", url: "https://www.lycorp.co.jp/news/archive/Y/ja/ja20100727_A.pdf" },
            { label: "Yahoo! JAPAN 帮助", url: "https://support.yahoo-net.jp/SccSearch/s/article/H000010324" },
          ],
        },
      ],
    },
    {
      id: "korea",
      title: "韩国：先做 Naver",
      items: [
        {
          text: "本地口径 InternetTrend（BizSpring）：2026 年 1 月 1 日到 10 月 29 日 Naver 65.7%、Google 27.7%。Statcounter 同期是 Google 46.9%、Naver 43.6%；它 2019 年的 Naver 只有 14.5%，看长期走势别用它。",
          sources: [
            { label: "InternetTrend", url: "https://www.internettrend.co.kr/" },
            { label: "Statcounter 韩国", url: `${SC}/all/south-korea` },
          ],
        },
        {
          text: "Statcounter 按设备拆开（2026 年 1–9 月）：手机端 Naver 65.0%、Google 31.1%；电脑端 Google 62.5%、Naver 22.5%、Bing 10.8%。",
          sources: [
            { label: "Statcounter 韩国手机端", url: `${SC}/mobile/south-korea` },
            { label: "Statcounter 韩国电脑端", url: `${SC}/desktop/south-korea` },
          ],
        },
        {
          text: "Naver 的 AI 回答主要引用自家平台的内容（Naver 博客、Cafe、Clip）和政府等官方出处；第三方统计有 46.5% 的引用来自 Naver 博客。",
          sources: [
            { label: "byline（2025-03-24）", url: "https://byline.network/2025/03/27-432/" },
            { label: "ditoday（2026-10-15）", url: "https://ditoday.com/?p=154900" },
          ],
        },
        {
          text: "Naver 不注册也会收录网站，在 Search Advisor 注册验证以后才能看报告；它支持 IndexNow。",
          sources: [
            { label: "Naver FAQ", url: "https://searchadvisor.naver.com/guide/faq-start-register" },
            { label: "Naver IndexNow", url: "https://searchadvisor.naver.com/guide/indexnow-about" },
          ],
        },
      ],
    },
    {
      id: "russia",
      title: "俄罗斯：Yandex 优先，Google 也不能丢",
      items: [
        {
          text: "Yandex 自己公布 2026 年二季度份额 69.9%；Statcounter 2026 年 10 月 Yandex 70.2%、Google 28.4%。",
          sources: [
            { label: "ppc.world 转述财报", url: "https://ppc.world/news/vyruchka-yandeksa-ot-reklamy-i-uslug-prodvizheniya-vyrosla-na-103-vo-vtorom-kvartale-2026-goda/" },
            { label: "Statcounter 俄罗斯", url: `${SC}/all/russian-federation` },
          ],
        },
        {
          text: "LiveInternet 统计的俄语网站正好相反：2026 年 10 月 Google 54.4%、Yandex 45.5%；从 2024 年 3 月起抽的 6 个月里，Google 都在 54% 到 57%。",
          sources: [{ label: "LiveInternet", url: "https://www.liveinternet.ru/stat/ru/searches.html?period=month&total=yes" }],
        },
        {
          text: "Yandex 的 AI 回答（Alice AI）先改写问题再调用 Yandex 搜索的结果，偏好排名靠前的来源；Yandex Webmaster 从 2026 年 4 月起能看网站在 Alice AI 回答引用里占多少。",
          sources: [
            { label: "Yandex Webmaster 帮助", url: "https://yandex.ru/support/webmaster/ru/alice.html" },
            { label: "Yandex Webmaster 博客", url: "https://webmaster.yandex.ru/blog/efficiency-alice" },
          ],
        },
      ],
    },
    {
      id: "china",
      title: "中国：百度，先过几道门",
      items: [
        {
          text: "Statcounter 的中国数据有明显不合理的地方：Yandex 2026 年 10 月 11.8%，被屏蔽的 Google 6.8%。所以百度 49.0%、Bing 21.7% 也只能当参考，看份额别用 Statcounter。",
          sources: [{ label: "Statcounter 中国", url: `${SC}/all/china` }],
        },
        {
          text: "百度搜索资源平台注册要中国大陆手机号；2023 年 9 月起，非实名账户下的站点不能再提交 sitemap，API 推送额度也被调整。",
          sources: [
            { label: "百度注册页", url: "https://passport.baidu.com/v2/?reg" },
            { label: "百度公告", url: "https://ziyuan.baidu.com/wiki/3531" },
          ],
        },
        {
          text: "百度不收 IndexNow；「快速收录」2024 年 4 月下线，换成只给 VIP 合作站的「快速抓取」。",
          sources: [
            { label: "IndexNow", url: "https://www.indexnow.org/" },
            { label: "百度公告", url: "https://ziyuan.baidu.com/wiki/3546" },
          ],
        },
        {
          text: "越来越多搜索发生在 AI App 里：QuestMobile 2026 年 9 月的 AI 原生 App 月活 5.46 亿，豆包 4.19 亿、千问 1.58 亿、DeepSeek 1.23 亿。",
          sources: [
            { label: "腾讯新闻（2026-10-20）", url: "https://news.qq.com/rain/a/20261020A06WHG00" },
            { label: "搜狐（2026-11-03）", url: "https://www.sohu.com/a/1096692614_100116740" },
          ],
        },
      ],
    },
    {
      id: "europe",
      title: "欧洲、英国：Google 优先，其次 Bing",
      items: [
        {
          text: "欧洲整体 Google 88.8%、Bing 5.6%（2019 年 Bing 2.4%）；英国 Google 90.6%、Bing 6.8%，加上用 Bing 索引的 Yahoo 和 DuckDuckGo，约 9%。",
          sources: [
            { label: "Statcounter 欧洲", url: `${SC}/all/europe` },
            { label: "Statcounter 英国", url: `${SC}/all/united-kingdom` },
          ],
        },
        {
          text: "德国的 Bing 2026 年上半年在 9% 到 10%，7 月起回落，10 月 6.4%；法国本地引擎 Qwant 只有 0.8%，Ecosia 1.2%。",
          sources: [
            { label: "Statcounter 德国", url: `${SC}/all/germany` },
            { label: "Statcounter 法国", url: `${SC}/all/france` },
          ],
        },
        {
          text: "查过的欧洲国家里只有捷克的本地引擎成气候：Seznam 13.1%，2019 年是 12.0%，几年来一直在 12% 到 13%。",
          sources: [{ label: "Statcounter 捷克", url: `${SC}/all/czech-republic` }],
        },
      ],
    },
  ],
  pitfalls: [
    {
      text: "用 Statcounter 看中国和韩国：中国的样本不可信，韩国的 Naver 被明显低估。",
      sources: [{ label: "Statcounter 中国", url: `${SC}/all/china` }],
    },
    {
      text: "只开 Google Search Console、不开 Bing Webmaster Tools：美国约 14% 的搜索来访，加上 Copilot 和 ChatGPT 的一部分回答，都走 Bing 的索引。",
      sources: [{ label: "Microsoft Web IQ", url: WEB_IQ }],
    },
    {
      text: "把份额当成搜索次数：这些统计量的是送到网站的来访，AI 回答里没点出去的不算。",
      sources: [{ label: "Statcounter 美国", url: `${SC}/all/united-states-of-america` }],
    },
    {
      text: "以为提交一次 IndexNow 所有引擎都能收到：Bing、Yandex、Naver、Seznam 会互相共享，Google 和百度都不收。",
      sources: [{ label: "IndexNow", url: "https://www.indexnow.org/documentation" }],
    },
    {
      text: "做俄罗斯只看一个口径：Statcounter、Yandex 自报和 LiveInternet 差得很远。",
      sources: [{ label: "LiveInternet", url: "https://www.liveinternet.ru/stat/ru/searches.html?period=month&total=yes" }],
    },
  ],
  unknowns: [
    "俄罗斯三家口径为什么差这么多：Statcounter 按 IP 分国家，用 VPN 的用户会被算到别国；LiveInternet 的样本以俄语媒体站为主。这两种解释都没核实。",
    "日本电脑端 Bing 为什么涨这么多：日本总务省 2026 年的白皮书认为和 Edge 默认用 Bing 有关；和 Windows 10 停止支持的时间对得上，是我们的猜测。",
    "德国 Bing 2026 年上半年冲高又回落的原因。",
    "百度 App 的月活没有和 AI App 同一口径的数。",
    "Yahoo! JAPAN 现在是否仍用 Google 的结果，只找到 2010 年的公告。",
  ],
  related: [
    { label: "域名怎么选", path: "/domains" },
    { label: "站长后台和收录提交", path: "/indexing" },
    { label: "各市场的 AI 助手", path: "/ai-assistants" },
  ],
};
