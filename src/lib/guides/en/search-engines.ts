// English version of ../search-engines.ts. Keep in sync when the Chinese guide changes.
import type { Guide } from "../../go-global-guides";

// Which search engine to please first in each market: Jason's November 2026 ranking (mine) plus each market's share
// and what each engine says. The main share table is Statcounter, October 2026 (downloaded 2026-11-01).
const SC = "https://gs.statcounter.com/search-engine-market-share";
const WEB_IQ = "https://www.microsoft.com/en-us/webiq";

export const SEARCH_ENGINES_EN: Guide = {
  slug: "search-engines",
  short: "Which search engine first",
  title: "Which search engine to please first: the US, Indonesia, Vietnam, Japan, South Korea, Russia, China and Europe, market by market",
  description:
    "The first SEO decision for an overseas site is which search engine to please: the share of Google, Bing, Naver, Yandex, Baidu and Seznam in each market, how the measurements differ, and why Bing's index also feeds Copilot and ChatGPT.",
  intro:
    "For an overseas site, the first SEO step isn't writing content. It's deciding which search engine to please. Shares below are mostly Statcounter's October 2026 figures: search visits received by sites running its tracking code, split by visitor IP. That isn't the number of searches, and AI answers nobody clicked through from don't count. For Russia, South Korea, Japan and China, read a local measurement alongside it.",
  checked: "2026-11-07",
  mine: {
    title: "My ranking",
    lead: "Don't assume the whole world is Google. Japan, Korea, Russia and China each have their own gate to pass.",
    points: [
      "US English sites: Google first, then Bing. If you care about AI answers, Bing isn't optional.",
      "Indonesia and Vietnam: Google only.",
      "Japan: Google and Bing matter equally. More than half of desktop search is on Bing; B2B and tool sites shouldn't ignore it.",
      "South Korea: Naver first. It ranks its own platforms' content ahead of outside sites, so the game is different.",
      "Russia: Yandex first, but don't drop Google.",
      "China: Baidu, after passing real-name checks, site verification and active URL submission.",
      "Europe and the UK: Google first, then Bing; add Seznam for the Czech market.",
    ],
    links: [],
  },
  sections: [
    {
      id: "us",
      title: "United States: Google first, then Bing",
      items: [
        {
          text: "Statcounter, October 2026: Google 85.5%, Bing 9.8%, Yahoo 2.5%, DuckDuckGo 1.7%. Bing's yearly average rose from 6.1% in 2019 to 9.5% for January–October 2026.",
          sources: [{ label: "Statcounter US", url: `${SC}/all/united-states-of-america` }],
        },
        {
          text: "Yahoo's search results all come from Bing, and DuckDuckGo's web results largely do, so about 14% of US search visits run on Bing's index.",
          sources: [
            { label: "Yahoo help", url: "https://en-maktoob.help.yahoo.com/kb/SLN35619.html" },
            { label: "DuckDuckGo", url: "https://duckduckgo.com/duckduckgo-help-pages/results/sources/" },
          ],
        },
        {
          text: "Microsoft says Copilot and Microsoft 365 build answers from Bing's content. Its Web IQ, launched in June 2026, is built on Bing's global index, and the official product page says it powers AI assistants including Copilot and ChatGPT.",
          sources: [
            { label: "Bing blog (2026-10-30)", url: "https://blogs.bing.com/search/2026/10/your-content-your-choice-clearer-preferences-for-training-and-grounding/" },
            { label: "Microsoft Web IQ", url: WEB_IQ },
          ],
        },
      ],
    },
    {
      id: "id-vn",
      title: "Indonesia and Vietnam: Google only",
      items: [
        {
          text: "Indonesia: Google 91.4%, Bing 3.4%. Vietnam: Google 93.4%, and the local engine Cốc Cốc 5.6% (3.4% in 2019).",
          sources: [
            { label: "Statcounter Indonesia", url: `${SC}/all/indonesia` },
            { label: "Statcounter Vietnam", url: `${SC}/all/viet-nam` },
          ],
        },
        {
          text: "Cốc Cốc has no webmaster console, only a form to submit URLs, and reads sitemaps from robots.txt. It crawls Vietnamese-language sites and .vn domains first.",
          sources: [{ label: "Cốc Cốc", url: "https://coccoc.com/search/console/get-your-website-on-coc-coc-search" }],
        },
      ],
    },
    {
      id: "japan",
      title: "Japan: Google and Bing matter equally",
      items: [
        {
          text: "All devices: Google 59.3%, Bing 32.5%, Yahoo! JAPAN 6.6%.",
          sources: [{ label: "Statcounter Japan", url: `${SC}/all/japan` }],
        },
        {
          text: "On desktop, Bing rose from 17.0% in July 2025 to 55.4% in October 2026 and passed Google in several months. On mobile, Bing has stayed under 1%, with Google at 88.0% and Yahoo! JAPAN at 9.2%.",
          sources: [
            { label: "Statcounter Japan desktop", url: `${SC}/desktop/japan` },
            { label: "Statcounter Japan mobile", url: `${SC}/mobile/japan` },
          ],
        },
        {
          text: "Yahoo! JAPAN has used Google's search engine since 2010 and has no webmaster console of its own, so about 97% of mobile search visits run on Google's index.",
          sources: [
            { label: "2010 announcement", url: "https://www.lycorp.co.jp/news/archive/Y/ja/ja20100727_A.pdf" },
            { label: "Yahoo! JAPAN help", url: "https://support.yahoo-net.jp/SccSearch/s/article/H000010324" },
          ],
        },
      ],
    },
    {
      id: "korea",
      title: "South Korea: Naver first",
      items: [
        {
          text: "The local measurement, InternetTrend (BizSpring), gives Naver 65.7% and Google 27.7% for 1 January to 29 October 2026. Statcounter has Google 46.9% and Naver 43.6% for the same months; its 2019 Naver figure was only 14.5%, so don't use it for long-term trends.",
          sources: [
            { label: "InternetTrend", url: "https://www.internettrend.co.kr/" },
            { label: "Statcounter South Korea", url: `${SC}/all/south-korea` },
          ],
        },
        {
          text: "Statcounter by device (January–September 2026): on mobile Naver 65.0% and Google 31.1%; on desktop Google 62.5%, Naver 22.5% and Bing 10.8%.",
          sources: [
            { label: "Statcounter Korea mobile", url: `${SC}/mobile/south-korea` },
            { label: "Statcounter Korea desktop", url: `${SC}/desktop/south-korea` },
          ],
        },
        {
          text: "Naver's AI answers cite mainly its own platforms (Naver Blog, Cafe and Clip) plus government and other official sources; one third-party count found 46.5% of citations came from Naver Blog.",
          sources: [
            { label: "byline (2025-03-24)", url: "https://byline.network/2025/03/27-432/" },
            { label: "ditoday (2026-10-15)", url: "https://ditoday.com/?p=154900" },
          ],
        },
        {
          text: "Naver indexes sites even if you never register them; you need to register and verify in Search Advisor to see reports. It supports IndexNow.",
          sources: [
            { label: "Naver FAQ", url: "https://searchadvisor.naver.com/guide/faq-start-register" },
            { label: "Naver IndexNow", url: "https://searchadvisor.naver.com/guide/indexnow-about" },
          ],
        },
      ],
    },
    {
      id: "russia",
      title: "Russia: Yandex first, but don't drop Google",
      items: [
        {
          text: "Yandex reports a 69.9% share for Q2 2026; Statcounter has Yandex at 70.2% and Google at 28.4% for October 2026.",
          sources: [
            { label: "ppc.world on the results", url: "https://ppc.world/news/vyruchka-yandeksa-ot-reklamy-i-uslug-prodvizheniya-vyrosla-na-103-vo-vtorom-kvartale-2026-goda/" },
            { label: "Statcounter Russia", url: `${SC}/all/russian-federation` },
          ],
        },
        {
          text: "LiveInternet, which counts Russian-language sites, shows the opposite: Google 54.4% and Yandex 45.5% in October 2026, with Google between 54% and 57% in all six months sampled since March 2024.",
          sources: [{ label: "LiveInternet", url: "https://www.liveinternet.ru/stat/ru/searches.html?period=month&total=yes" }],
        },
        {
          text: "Yandex's AI answers (Alice AI) rewrite the question and call Yandex search, preferring top-ranked sources. Since April 2026 Yandex Webmaster shows a site's share of the sources cited in Alice AI answers.",
          sources: [
            { label: "Yandex Webmaster help", url: "https://yandex.ru/support/webmaster/ru/alice.html" },
            { label: "Yandex Webmaster blog", url: "https://webmaster.yandex.ru/blog/efficiency-alice" },
          ],
        },
      ],
    },
    {
      id: "china",
      title: "China: Baidu, after a few gates",
      items: [
        {
          text: "Statcounter's China data has obvious problems: Yandex at 11.8% and the blocked Google at 6.8% in October 2026. So treat Baidu's 49.0% and Bing's 21.7% as rough at best, and don't use Statcounter for China.",
          sources: [{ label: "Statcounter China", url: `${SC}/all/china` }],
        },
        {
          text: "Signing up for Baidu's webmaster platform requires a mainland China phone number. Since September 2023, sites under accounts without real-name verification can no longer submit sitemaps, and their API quotas were cut.",
          sources: [
            { label: "Baidu sign-up", url: "https://passport.baidu.com/v2/?reg" },
            { label: "Baidu notice", url: "https://ziyuan.baidu.com/wiki/3531" },
          ],
        },
        {
          text: "Baidu doesn't accept IndexNow. Its fast indexing was retired in April 2024 and replaced by fast crawling, available only to VIP partner sites.",
          sources: [
            { label: "IndexNow", url: "https://www.indexnow.org/" },
            { label: "Baidu notice", url: "https://ziyuan.baidu.com/wiki/3546" },
          ],
        },
        {
          text: "More searching now happens in AI apps: QuestMobile counts 546 million monthly users of AI-native apps in September 2026, with Doubao at 419 million, Qwen at 158 million and DeepSeek at 123 million.",
          sources: [
            { label: "Tencent News (2026-10-20)", url: "https://news.qq.com/rain/a/20261020A06WHG00" },
            { label: "Sohu (2026-11-03)", url: "https://www.sohu.com/a/1096692614_100116740" },
          ],
        },
      ],
    },
    {
      id: "europe",
      title: "Europe and the UK: Google first, then Bing",
      items: [
        {
          text: "Europe overall: Google 88.8%, Bing 5.6% (2.4% in 2019). UK: Google 90.6%, Bing 6.8%, or about 9% with Yahoo and DuckDuckGo, which use Bing's index.",
          sources: [
            { label: "Statcounter Europe", url: `${SC}/all/europe` },
            { label: "Statcounter UK", url: `${SC}/all/united-kingdom` },
          ],
        },
        {
          text: "Bing in Germany ran at 9–10% in the first half of 2026, then fell back from July to 6.4% in October. In France the local engine Qwant has 0.8% and Ecosia 1.2%.",
          sources: [
            { label: "Statcounter Germany", url: `${SC}/all/germany` },
            { label: "Statcounter France", url: `${SC}/all/france` },
          ],
        },
        {
          text: "Of the European countries we checked, only Czechia has a local engine that matters: Seznam at 13.1%, against 12.0% in 2019, steady at 12–13% for years.",
          sources: [{ label: "Statcounter Czechia", url: `${SC}/all/czech-republic` }],
        },
      ],
    },
  ],
  pitfalls: [
    {
      text: "Reading China or South Korea from Statcounter: the China sample isn't reliable, and Naver is clearly understated for Korea.",
      sources: [{ label: "Statcounter China", url: `${SC}/all/china` }],
    },
    {
      text: "Opening Google Search Console but not Bing Webmaster Tools: about 14% of US search visits, plus some Copilot and ChatGPT answers, run on Bing's index.",
      sources: [{ label: "Microsoft Web IQ", url: WEB_IQ }],
    },
    {
      text: "Treating these shares as numbers of searches: they count visits sent to websites, not AI answers nobody clicked through from.",
      sources: [{ label: "Statcounter US", url: `${SC}/all/united-states-of-america` }],
    },
    {
      text: "Thinking one IndexNow submission reaches every engine: Bing, Yandex, Naver and Seznam share it with each other, but Google and Baidu don't accept it.",
      sources: [{ label: "IndexNow", url: "https://www.indexnow.org/documentation" }],
    },
    {
      text: "Judging Russia from one measurement: Statcounter, Yandex's own figure and LiveInternet are far apart.",
      sources: [{ label: "LiveInternet", url: "https://www.liveinternet.ru/stat/ru/searches.html?period=month&total=yes" }],
    },
  ],
  unknowns: [
    "Why Russia's three measurements differ so much: Statcounter splits countries by IP, so VPN users count as other countries, and LiveInternet's sample leans on Russian-language media sites. Neither explanation is confirmed.",
    "Why Bing grew so much on desktop in Japan: the Japanese government's 2026 white paper links it to Edge defaulting to Bing; the timing also matches the end of Windows 10 support, which is our guess.",
    "Why Bing in Germany rose in the first half of 2026 and then fell back.",
    "Baidu's app has no monthly-user figure measured the same way as the AI apps.",
    "Whether Yahoo! JAPAN still uses Google's results; we found only the 2010 announcement.",
  ],
  related: [
    { label: "Choosing a domain", path: "/domains" },
    { label: "Webmaster consoles and getting indexed", path: "/indexing" },
    { label: "AI assistants in each market", path: "/ai-assistants" },
  ],
};
