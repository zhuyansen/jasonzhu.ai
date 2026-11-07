// English version of ../ai-assistants.ts. Keep in sync when the Chinese guide changes.
import type { Guide } from "../../go-global-guides";

// Which AI assistants each market uses, where their web results come from, and which crawlers to allow in robots.txt:
// usage from surveys and third-party counts; sources and crawlers only from each company's own docs. Statcounter AI shares use September 2026.
const BING_PREFS = "https://blogs.bing.com/search/2026/10/your-content-your-choice-clearer-preferences-for-training-and-grounding/";
const WEB_IQ = "https://www.microsoft.com/en-us/webiq";
const OPENAI_BOTS = "https://developers.openai.com/api/docs/bots";
const GOOGLE_AI = "https://developers.google.com/search/docs/appearance/ai-features";
const GOOGLE_CRAWLERS = "https://developers.google.com/search/docs/crawling-indexing/google-common-crawlers";
const SC_AI = "https://gs.statcounter.com/ai-chatbot-market-share/all";

export const AI_ASSISTANTS_EN: Guide = {
  slug: "ai-assistants",
  short: "AI assistants by market",
  title: "Which AI assistants each market uses and where they get their answers: ChatGPT, Gemini, Copilot, Naver, Yandex, Doubao and DeepSeek, and which crawlers to allow",
  description:
    "To get cited by AI, first know which assistant people use in each market and which index it searches: AI usage in the US, Indonesia, Vietnam, Japan, South Korea, Russia, China and Europe, where each product's web results come from, and how to set training and search crawlers separately.",
  intro:
    "Two things come first in AI search optimisation: which AI your users use, and where that AI gets its web results. ChatGPT and Copilot both draw on Bing's index, Gemini and AI Overviews use Google's, and the AI answers of Naver, Yandex and Baidu rely mainly on their own search results. Below is usage by market first, then sources and crawlers by product.",
  checked: "2026-11-07",
  sections: [
    {
      id: "markets",
      title: "Which AI each market uses",
      lead: "Statcounter's AI chatbot share measures clicks each AI sends to websites, not users. From 9 October 2026 many ChatGPT links stopped carrying a referrer and were counted as direct visits, so this page uses September figures.",
      items: [
        {
          text: "US: in Pew's February 2026 survey, 49% of adults use AI chatbots: ChatGPT 44%, Gemini 24%, Copilot 17%, Meta AI 14%, Grok 8%, Claude 6%. 60% have read an AI summary at the top of search results.",
          sources: [{ label: "Pew (2026-06-17)", url: "https://www.pewresearch.org/internet/2026/06/17/americans-and-ai/" }],
        },
        {
          text: "Google publishes only global figures: AI Overviews has more than 2.5 billion monthly users; AI Mode more than 1 billion, now merged with AI Overviews into one experience; the Gemini app 1 billion users.",
          sources: [
            { label: "Google I/O (2026-05-19)", url: "https://blog.google/innovation-and-ai/sundar-pichai-io-2026/" },
            { label: "Alphabet Q2", url: "https://blog.google/company-news/inside-google/message-ceo/alphabet-earnings-q2-2026/" },
            { label: "Alphabet Q3", url: "https://blog.google/company-news/inside-google/message-ceo/alphabet-earnings-q3-2026/" },
          ],
        },
        {
          text: "Indonesia: audience share in May 2026 was ChatGPT 45.7%, Gemini 31.2%, Claude 7.8% (Sensor Tower). AI Mode has supported Indonesian, Japanese and Korean since September 2025.",
          sources: [
            { label: "Databoks", url: "https://databoks.katadata.co.id/en/technology-telecommunications/statistics/6a38aafac9f50/share-of-ai-assistants-audience-in-indonesia-in-may-2026-chatgpt-declines-gemini-rises" },
            { label: "Google", url: "https://blog.google/products/search/ai-mode-expands-more-languages/" },
          ],
        },
        {
          text: "Vietnam: in a July 2025 survey, 78% of internet users had used AI in the past three months: ChatGPT 81%, Gemini 51%, Meta AI 36%, the local AI Hay 9% and Zalo's Kiki 3%.",
          sources: [{ label: "Việt Nam News", url: "https://bizhub.vietnamnews.vn/vietnamese-embrace-ai-78-have-used-ai-tools-local-platforms-gain-ground-post383046.html" }],
        },
        {
          text: "Japan: in a February 2026 survey, 54.7% of internet users had used generative AI in the past year: ChatGPT 36.2%, Gemini 25.0%, Copilot 13.3%, Claude 4.3%, Perplexity 4.0%.",
          sources: [{ label: "ICT Research Institute", url: "https://ictr.co.jp/report/20260220.html/" }],
        },
        {
          text: "South Korea: monthly app users in September 2026 were ChatGPT 24.7 million, Gemini 9.87 million and Claude 4.04 million. Naver's AI summaries (AI Briefing) reach 30 million people a month, and its AI tab passed 10 million users in July.",
          sources: [
            { label: "byline (2026-10-13)", url: "https://byline.network/?p=9004111222623015" },
            { label: "byline (2026-07-15)", url: "https://byline.network/2026/07/15_naver/" },
          ],
        },
        {
          text: "Russia: in September 2026, 55% of people aged 12+ used AI each month: Yandex's Alice AI 59 million, DeepSeek 13 million, GigaChat 6 million (websites and apps only). Alice AI quick answers inside Yandex search reached 49.5 million people a month in Q2 and appear on about 42% of queries.",
          sources: [
            { label: "kod.ru (2026-10-16)", url: "https://kod.ru/auditoriia-neirosetei-vyrosla" },
            { label: "Trashbox (2026-07-29)", url: "https://trashbox.ru/link/2026-07-28-alisa-ai-50-mln-chelovek" },
          ],
        },
        {
          text: "Mainland China: QuestMobile counts 546 million monthly users of AI-native apps in September 2026: Doubao 419 million, Qwen 158 million, DeepSeek 123 million, Yuanbao 37.33 million. Statcounter's China page reflects only sites running its code, not Chinese users at large.",
          sources: [
            { label: "Tencent News (2026-10-20)", url: "https://news.qq.com/rain/a/20261020A06WHG00" },
            { label: "Sohu (2026-11-03)", url: "https://www.sohu.com/a/1096692614_100116740" },
          ],
        },
        {
          text: "Europe and the UK: in 2025, 32.7% of people aged 16–74 in the EU had used generative AI, and 63.8% of those aged 16–24. Statcounter for September: Europe ChatGPT 78.8%, Gemini 12.8%; UK ChatGPT 79.8%, Gemini 10.2%.",
          sources: [
            { label: "Eurostat (2026-02-10)", url: "https://ec.europa.eu/eurostat/web/products-eurostat-news/w/edn-20260210-1" },
            { label: "Statcounter Europe", url: `${SC_AI}/europe` },
            { label: "Statcounter UK", url: `${SC_AI}/united-kingdom` },
          ],
        },
      ],
    },
    {
      id: "chatgpt",
      title: "ChatGPT",
      items: [
        {
          text: "Microsoft's Web IQ is built on Bing's global index, and its official product page says it powers AI assistants including Copilot and ChatGPT.",
          sources: [{ label: "Microsoft Web IQ", url: WEB_IQ }],
        },
        {
          text: "OpenAI's crawlers are set separately: OAI-SearchBot is for search, and blocking it keeps you out of ChatGPT search answers (robots.txt changes take about 24 hours); GPTBot is for training and works independently; ChatGPT-User fetches pages when a user asks, and robots.txt may not apply to it.",
          sources: [{ label: "OpenAI crawlers", url: OPENAI_BOTS }],
        },
      ],
    },
    {
      id: "copilot",
      title: "Copilot and Bing",
      items: [
        {
          text: "Microsoft says Copilot and Microsoft 365 build answers from Bing's content; the only crawler is Bingbot.",
          sources: [{ label: "Bing blog (2026-10-30)", url: BING_PREFS }],
        },
        {
          text: "From 1 February 2027, a Bingbot meta tag on the page (ai-grounding) controls whether content may be used in AI answers; disallowextended limits it to Microsoft's own products and excludes third parties such as Web IQ. Training preferences go in robots.txt as __usage_ai-training. None of these overrides a robots.txt block on Bingbot.",
          sources: [{ label: "Bing blog (2026-10-30)", url: BING_PREFS }],
        },
        {
          text: "Today NOARCHIVE and NOCACHE do this job; after 1 March 2027 Bing stops treating them as training or citation preferences.",
          sources: [{ label: "Bing blog (2026-10-30)", url: BING_PREFS }],
        },
      ],
    },
    {
      id: "google",
      title: "Gemini, AI Overviews and AI Mode",
      items: [
        {
          text: "All use Google's search index: any page that can be indexed and shown with a snippet is eligible for AI Overviews and AI Mode, with no extra technical requirements. The only controls are Googlebot's robots rules and nosnippet, max-snippet and noindex.",
          sources: [{ label: "Google AI features", url: GOOGLE_AI }],
        },
        {
          text: "Google-Extended is only a token in robots.txt. It governs Gemini training and the web citations of the Gemini app and Vertex AI grounding; Google says it doesn't affect Search indexing and isn't a ranking signal. Blocking it doesn't take you out of AI Overviews or AI Mode, but it does take you out of the Gemini app's web citations.",
          sources: [{ label: "Google common crawlers", url: GOOGLE_CRAWLERS }],
        },
        {
          text: "Since August 2026 Search Console has a setting that keeps a site out of generative AI features such as AI Overviews and AI Mode.",
          sources: [{ label: "Search Console help", url: "https://support.google.com/webmasters/answer/16908024" }],
        },
        {
          text: "Google-Agent acts on web pages for users, and such user-triggered fetches usually ignore robots.txt.",
          sources: [{ label: "Google user-triggered fetchers", url: "https://developers.google.com/search/docs/crawling-indexing/google-user-triggered-fetchers" }],
        },
      ],
    },
    {
      id: "perplexity-claude",
      title: "Perplexity and Claude",
      items: [
        {
          text: "Perplexity runs its own index of what it calls hundreds of billions of pages. PerplexityBot is for search results, not training; Perplexity-User is a user-triggered fetcher that usually ignores robots.txt.",
          sources: [
            { label: "Perplexity blog", url: "https://www.perplexity.ai/hub/blog/introducing-the-perplexity-search-api" },
            { label: "Perplexity crawlers", url: "https://docs.perplexity.ai/guides/bots" },
          ],
        },
        {
          text: "Anthropic lists Brave Search (all products) plus TurboPuffer and Parallel Web Systems as web search providers. Claude has three crawlers: ClaudeBot for training, Claude-SearchBot for the search index (blocking it lowers visibility in search results), and Claude-User for fetches when a user asks.",
          sources: [
            { label: "Anthropic subprocessors", url: "https://trust.anthropic.com/subprocessors" },
            { label: "Claude crawler help", url: "https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler" },
          ],
        },
      ],
    },
    {
      id: "naver-yandex",
      title: "Naver and Yandex",
      items: [
        {
          text: "Naver's AI answers cite mainly its own platforms (Blog, Cafe, Clip) plus government and other official sources; one third-party count found 46.5% of citations from Naver Blog. Its crawler is Yeti, and its robots guide lists no separate AI crawler.",
          sources: [
            { label: "byline (2025-03-24)", url: "https://byline.network/2025/03/27-432/" },
            { label: "ditoday (2026-10-15)", url: "https://ditoday.com/?p=154900" },
            { label: "Naver robots guide", url: "https://searchadvisor.naver.com/guide/seo-basic-robots" },
          ],
        },
        {
          text: "Yandex's Alice AI rewrites the question and calls Yandex search, preferring top-ranked sources. YandexBot crawls the main index; YandexAdditional separately controls whether content can appear in quick answers and Alice AI answers, and applies only to indexed pages. Yandex has no training-only crawler.",
          sources: [
            { label: "Yandex Webmaster help", url: "https://yandex.ru/support/webmaster/ru/alice.html" },
            { label: "Yandex crawler list", url: "https://yandex.ru/support/webmaster/ru/robot-workings/check-yandex-robots" },
          ],
        },
      ],
    },
    {
      id: "china",
      title: "AI in China",
      items: [
        {
          text: "Doubao: the web search plugin on Volcano Engine searches the whole web by default and can add Douyin encyclopedia and Toutiao articles; whether the Doubao app uses the same setup isn't stated. ByteDance's crawler, Bytespider, has no official documentation and has been reported to ignore robots.txt.",
          sources: [
            { label: "Volcano Engine docs", url: "https://docs.volcengine.com/docs/82379/1756990?lang=zh" },
            { label: "Fortune (2024-10-03)", url: "https://fortune.com/2024/10/03/bytedance-tiktok-bytespider-scraper-bot/" },
          ],
        },
        {
          text: "DeepSeek's web search API says it is \"powered by DeepSeek's own search engine\"; whether the app uses the same isn't stated, and its crawler has no official documentation.",
          sources: [{ label: "DeepSeek docs", url: "https://api-docs.deepseek.com/zh-cn/guides/search/" }],
        },
        {
          text: "Tencent's Yuanbao launched with WeChat search and Sogou, covering WeChat official-account articles; according to a Tencent insider in 2026, Yuanbao search combines QQ Browser and Sogou technology and doesn't index sites that block crawlers.",
          sources: [
            { label: "Beijing News (2024-05-30)", url: "https://m.bjnews.com.cn/detail/1717043325129809.html" },
            { label: "Huxiu (2026-11-03)", url: "https://www.huxiu.com/article/4899986.html" },
          ],
        },
        {
          text: "Baidu's AI search uses Baidu's search results; the crawler is Baiduspider, with no separate crawler for its ERNIE models.",
          sources: [
            { label: "Baidu Qianfan docs", url: "https://cloud.baidu.com/doc/qianfan/s/Smh4sutup" },
            { label: "Baidu help", url: "https://help.baidu.com/question?prod_en=master&class=Baiduspider" },
          ],
        },
      ],
    },
  ],
  pitfalls: [
    {
      text: "Blocking GPTBot and assuming you're out of ChatGPT search: search follows OAI-SearchBot.",
      sources: [{ label: "OpenAI crawlers", url: OPENAI_BOTS }],
    },
    {
      text: "Blocking Google-Extended to leave AI Overviews: it covers only the Gemini app and training; AI Overviews follow Googlebot.",
      sources: [{ label: "Google common crawlers", url: GOOGLE_CRAWLERS }],
    },
    {
      text: "Allowing Googlebot but blocking Bingbot: Copilot and AI assistants built on Web IQ can't get your pages.",
      sources: [
        { label: "Bing blog", url: BING_PREFS },
        { label: "Microsoft Web IQ", url: WEB_IQ },
      ],
    },
    {
      text: "Reading ChatGPT's share from Statcounter's October 2026 data: from October many ChatGPT links lost their referrer, so its share is badly understated.",
      sources: [{ label: "LLM Pulse", url: "https://llmpulse.ai/blog/chatgpt-referral-traffic-fell/" }],
    },
  ],
  unknowns: [
    "Exactly which search providers ChatGPT uses today: Microsoft says Web IQ powers ChatGPT, and OpenAI names no one.",
    "What each of Claude's three search providers handles.",
    "Which index GigaChat, Qwen, the Doubao app and the DeepSeek app use for web search.",
    "Bytespider, DeepSeek, Quark, Sogou and Yuanbao crawlers have no official documentation.",
    "Whether Naver has a separate AI crawler, and what share of its AI answers cite outside sites.",
    "AI Overviews and AI Mode users by country, and whether AI Mode supports Vietnamese.",
    "National surveys for Vietnam and Indonesia in 2026, and 2026 monthly users for Kimi and Quark.",
  ],
  related: [
    { label: "Which search engine to please first", path: "/search-engines" },
    { label: "Webmaster consoles and getting indexed", path: "/indexing" },
    { label: "Choosing a domain", path: "/domains" },
  ],
};
