// English version of ../indexing.ts. Keep in sync when the Chinese guide changes.
import type { Guide } from "../../go-global-guides";

// Each search engine's webmaster console and URL submission: only the engines' own help pages and blogs, plus indexnow.org.
const INDEXNOW_DOC = "https://www.indexnow.org/documentation";
const GSC_RECRAWL = "https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl";
const BING_SUBMIT = "https://www.bing.com/webmasters/help/url-submission-62f2860b";
const BAIDU_COURSE = "https://ziyuan.baidu.com/college/courseinfo?id=267";
const NAVER = "https://searchadvisor.naver.com/guide";

export const INDEXING_EN: Guide = {
  slug: "indexing",
  short: "Webmaster consoles and indexing",
  title: "Webmaster consoles and getting indexed: signing up, submitting and reporting on Google, Bing, Yandex, Naver, Baidu and Seznam",
  description:
    "Setting up webmaster consoles on Google, Bing, Yandex, Naver, Baidu and Seznam after launch: who can sign up, how to verify, how to submit sitemaps and single URLs and how many per day, which engines IndexNow reaches, and the new AI citation reports.",
  intro:
    "Once the site is live, open a webmaster console on each engine you want to please: verify the site, submit the sitemap, and watch indexing and queries. Bing, Yandex, Naver and Seznam share IndexNow, so one submission reaches all four. Google and Baidu don't take IndexNow and need their own submissions.",
  checked: "2026-11-07",
  sections: [
    {
      id: "indexnow",
      title: "IndexNow: submit once, four engines share it",
      items: [
        {
          text: "The IndexNow site lists Bing, Naver, Seznam, Yandex and Yep as participants; its FAQ also lists Amazon.",
          sources: [
            { label: "IndexNow", url: "https://www.indexnow.org/" },
            { label: "IndexNow FAQ", url: "https://www.indexnow.org/faq" },
          ],
        },
        {
          text: "The protocol says submitted URLs are automatically shared with all participating engines, so submitting to any one of them is enough.",
          sources: [{ label: "IndexNow docs", url: INDEXNOW_DOC }],
        },
        {
          text: "Google and Baidu aren't on the list. Google relies on URL Inspection and sitemaps; Baidu has only its own regular submission and fast crawling.",
          sources: [
            { label: "Google recrawl", url: GSC_RECRAWL },
            { label: "Baidu submission", url: `${BAIDU_COURSE}&page=2` },
          ],
        },
        {
          text: "Bing strongly recommends IndexNow and says manual submission and the URL Submission API may be retired in future.",
          sources: [{ label: "Bing URL submission", url: BING_SUBMIT }],
        },
      ],
    },
    {
      id: "google",
      title: "Google Search Console",
      items: [
        {
          text: "Any Google account can use it, with up to 1,000 properties per account. Domain properties verify only through DNS; URL-prefix properties can also use an HTML file, a meta tag, Google Analytics or Tag Manager.",
          sources: [
            { label: "Add a property", url: "https://support.google.com/webmasters/answer/34592" },
            { label: "Verification", url: "https://support.google.com/webmasters/answer/9008080" },
          ],
        },
        {
          text: "Submit sitemaps in the Sitemaps report, and single URLs with Request Indexing in URL Inspection. Google says that has a daily limit it doesn't publish, and repeating a request won't speed things up. The sitemap ping endpoint was retired in 2023.",
          sources: [
            { label: "Sitemaps", url: "https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap" },
            { label: "Ask Google to recrawl", url: GSC_RECRAWL },
            { label: "Ping retired", url: "https://developers.google.com/search/blog/2023/06/sitemaps-lastmod-ping" },
          ],
        },
        {
          text: "The Indexing API is only for job postings and livestream video pages; you can't use it to submit ordinary pages.",
          sources: [{ label: "Indexing API", url: "https://developers.google.com/search/apis/indexing-api/v3/quickstart" }],
        },
        {
          text: "Since 31 August 2026 every site can see the generative AI performance report, covering AI Overviews, AI Mode and Discover. It shows impressions only, grouped by page, country, device and date. A new setting also keeps a site out of these AI features without affecting AI training.",
          sources: [
            { label: "Google blog", url: "https://developers.google.com/search/blog/2026/06/gen-ai-performance-reports" },
            { label: "Report help", url: "https://support.google.com/webmasters/answer/16984139" },
            { label: "Opt-out setting", url: "https://support.google.com/webmasters/answer/16908024" },
          ],
        },
      ],
    },
    {
      id: "bing",
      title: "Bing Webmaster Tools",
      lead: "Yahoo's results and most of DuckDuckGo's web results also come from Bing, so this one console covers all three.",
      items: [
        {
          text: "Sign in with a Microsoft, Google or Facebook account. You can import sites from Search Console with automatic verification, up to 100 at a time, or verify by hand with DNS, a BingSiteAuth.xml file, a meta tag or a CNAME.",
          sources: [
            { label: "Bing Webmaster Tools", url: "https://www.bing.com/webmasters/about" },
            { label: "Add and verify", url: "https://www.bing.com/webmasters/help/add-and-verify-site-12184f8b" },
          ],
        },
        {
          text: "Manual submission and the URL Submission API allow up to 10,000 URLs per domain per day, with subdomains counted under the main domain and the quota resetting at midnight UTC.",
          sources: [{ label: "Bing URL submission", url: BING_SUBMIT }],
        },
        {
          text: "The AI Performance report, in public preview since February 2026, shows how often the site is cited in Copilot, Bing's AI summaries and some partners, which pages and for which queries. The data is sampled and has no clicks. In June it gained intent, topic, citation share and comparison views.",
          sources: [
            { label: "Bing blog (2026-02)", url: "https://blogs.bing.com/webmaster/February-2026/Introducing-AI-Performance-in-Bing-Webmaster-Tools-Public-Preview" },
            { label: "Bing blog (2026-06)", url: "https://blogs.bing.com/search/June-2026/New-AI-Visibility-Insights-in-Bing-Webmaster-Tools-Intents-Topics-Citation-Share-Compare" },
          ],
        },
      ],
    },
    {
      id: "yandex",
      title: "Yandex Webmaster",
      items: [
        {
          text: "Sign in with a Yandex ID; a full registration needs a confirmed phone number. Verify with an HTML file in the root (recommended), a meta tag on the home page or a DNS TXT record; it takes up to 24 hours.",
          sources: [
            { label: "Yandex ID", url: "https://yandex.ru/support/id/ru/authorization/lite.html" },
            { label: "Verification", url: "https://yandex.com/support/webmaster/service/rights.html" },
          ],
        },
        {
          text: "Submit through sitemaps, Reindex (a daily limit shared by the domain and its subdomains, number not published) or IndexNow (unlimited requests, up to 10,000 URLs each).",
          sources: [
            { label: "Submission options", url: "https://yandex.ru/support/webmaster/en/robot-workings/new-changed" },
            { label: "Reindex", url: "https://yandex.com/support/webmaster/en/robot-workings/site-reindex" },
            { label: "IndexNow", url: "https://yandex.com/support/webmaster/en/indexnow/reference/post-url.html" },
          ],
        },
        {
          text: "Since April 2026 the Efficiency section shows the site's share of the sources cited in Alice AI answers, updated weekly, with no effect on ranking.",
          sources: [{ label: "Yandex Webmaster blog", url: "https://webmaster.yandex.ru/blog/efficiency-alice" }],
        },
        {
          text: "A site's region has to be set by hand in the console and passes a manual review; see the Russia section of the domain guide.",
          sources: [{ label: "Yandex site region", url: "https://yandex.com/support/webmaster/en/site-geography/site-region.html" }],
        },
      ],
    },
    {
      id: "naver",
      title: "Naver Search Advisor",
      items: [
        {
          text: "Naver indexes sites even if you never register them; you need to register and verify to see reports. Verify with a meta tag or an HTML file; the meta tag must be in the head, because verification doesn't run JavaScript.",
          sources: [{ label: "Naver FAQ", url: `${NAVER}/faq-start-register` }],
        },
        {
          text: "You can submit RSS feeds and sitemaps (up to 50,000 URLs and 10MB each). Page collection requests are limited per site, take a day to several weeks, and don't need resubmitting daily.",
          sources: [
            { label: "Submit sitemaps", url: `${NAVER}/request-feed` },
            { label: "Collection requests", url: `${NAVER}/request-crawl` },
          ],
        },
        {
          text: "It has supported IndexNow since July 2023, with no total limit but with rate limiting.",
          sources: [{ label: "Naver IndexNow", url: `${NAVER}/indexnow-about` }],
        },
        {
          text: "Changes in 2026: FAQ rich results stopped showing on 9 July, and report numbers shifted from October because of a system migration.",
          sources: [{ label: "Naver webmaster blog", url: "https://m.blog.naver.com/PostList.naver?blogId=naver_webmaster" }],
        },
      ],
    },
    {
      id: "baidu",
      title: "Baidu webmaster platform",
      items: [
        {
          text: "A Baidu account needs a mainland China phone number; the sign-up page has no country-code option.",
          sources: [{ label: "Baidu sign-up", url: "https://passport.baidu.com/v2/?reg" }],
        },
        {
          text: "Since September 2023 the platform has removed verified sites from risky accounts, including those without real-name verification. Sites under unverified accounts can no longer submit sitemaps, and their API quotas were cut.",
          sources: [
            { label: "Baidu notice 3529", url: "https://ziyuan.baidu.com/wiki/3529" },
            { label: "Baidu notice 3531", url: "https://ziyuan.baidu.com/wiki/3531" },
          ],
        },
        {
          text: "Verify with a file or an HTML tag; CNAME verification has been suspended since January 2023.",
          sources: [
            { label: "Verification", url: `${BAIDU_COURSE}&page=1` },
            { label: "CNAME suspended", url: "https://ziyuan.baidu.com/wiki/3462" },
          ],
        },
        {
          text: "Regular submission works through API push, sitemaps or by hand. Quotas depend on site quality and differ per site; pushing old links again and again lowers them. Sitemaps hold up to 50,000 links, and index sitemaps are no longer supported.",
          sources: [
            { label: "Regular submission", url: `${BAIDU_COURSE}&page=2` },
            { label: "Sitemap rules", url: `${BAIDU_COURSE}&page=17` },
          ],
        },
        {
          text: "Fast indexing was retired on 26 April 2024 and replaced by fast crawling, available only to VIP partner sites; others can earn it only through platform campaigns.",
          sources: [
            { label: "Baidu notice", url: "https://ziyuan.baidu.com/wiki/3546" },
            { label: "Baidu explainer", url: "https://ziyuan.baidu.com/college/articleinfo?id=3549" },
          ],
        },
        {
          text: "In September 2026 Baidu announced AI traffic analysis (AI citations, impressions and clicks), opening in stages; the data isn't live yet.",
          sources: [{ label: "Baidu notice", url: "https://ziyuan.baidu.com/wiki/3519" }],
        },
      ],
    },
    {
      id: "others",
      title: "Seznam, Cốc Cốc and Yahoo! JAPAN",
      items: [
        {
          text: "Seznam Webmaster in Czechia is still in beta: sign in with a Seznam account and verify with a home-page meta tag or a root file (meta tags inserted by script don't count). Its API guarantees up to 500 URLs a day enter the index within minutes.",
          sources: [
            { label: "Seznam Webmaster", url: "https://o-seznam.cz/napoveda/vyhledavani/seznam-webmaster/" },
            { label: "Seznam IndexNow", url: "https://o-seznam.cz/napoveda/vyhledavani/seznambot/protokol-indexnow/" },
          ],
        },
        {
          text: "Cốc Cốc in Vietnam has no webmaster console, just a submission form with no verification, and reads sitemaps from robots.txt.",
          sources: [{ label: "Cốc Cốc", url: "https://coccoc.com/search/console/get-your-website-on-coc-coc-search" }],
        },
        {
          text: "Yahoo! JAPAN uses Google's search engine and has no console of its own; manage it through Google Search Console.",
          sources: [
            { label: "2010 announcement", url: "https://www.lycorp.co.jp/news/archive/Y/ja/ja20100727_A.pdf" },
            { label: "Yahoo! JAPAN help", url: "https://support.yahoo-net.jp/SccSearch/s/article/H000010324" },
          ],
        },
      ],
    },
  ],
  pitfalls: [
    {
      text: "Clicking Request Indexing on the same URL every day: Google says repeat requests don't speed anything up.",
      sources: [{ label: "Google recrawl", url: GSC_RECRAWL }],
    },
    {
      text: "Using the Indexing API for ordinary pages: it only supports job postings and livestream video.",
      sources: [{ label: "Indexing API", url: "https://developers.google.com/search/apis/indexing-api/v3/quickstart" }],
    },
    {
      text: "Expecting IndexNow to notify Google and Baidu: neither accepts it.",
      sources: [{ label: "IndexNow docs", url: INDEXNOW_DOC }],
    },
    {
      text: "Inserting the verification meta tag with JavaScript: Naver doesn't run JavaScript when verifying, and Seznam ignores script-inserted meta tags.",
      sources: [
        { label: "Naver FAQ", url: `${NAVER}/faq-start-register` },
        { label: "Seznam", url: "https://o-seznam.cz/napoveda/vyhledavani/seznam-webmaster/" },
      ],
    },
    {
      text: "Pushing the same old links to Baidu again and again: it lowers your quota.",
      sources: [{ label: "Baidu submission", url: `${BAIDU_COURSE}&page=2` }],
    },
  ],
  unknowns: [
    "How many Request Indexing calls Google allows per day; it only says there is a limit.",
    "Whether adding a site to Baidu requires an ICP filing, and which IDs foreigners can use for real-name verification; Baidu's docs say neither.",
    "Whether foreigners can sign up for a Naver ID with a foreign phone number (only third parties say so), and how many collection requests Naver allows per day.",
    "Whether a Yandex ID registered with email only can use Webmaster, and the actual daily Reindex limit.",
    "Seznam's conditions for foreign accounts, and whether its console has a sitemap submission field.",
    "Whether Yahoo! JAPAN still uses Google's results; we found only the 2010 announcement.",
  ],
  related: [
    { label: "Which search engine to please first", path: "/search-engines" },
    { label: "Choosing a domain", path: "/domains" },
    { label: "AI assistants in each market", path: "/ai-assistants" },
  ],
};
