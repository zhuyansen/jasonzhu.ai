import type { Guide } from "../go-global-guides";

// 各搜索引擎的站长后台和收录提交：只写各引擎自己的帮助页、博客和 indexnow.org。
// 调研笔记在 ~/出海/research/2026-11-by-market/04-indexing.md（不在仓库里）。
const INDEXNOW_DOC = "https://www.indexnow.org/documentation";
const GSC_RECRAWL = "https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl";
const BING_SUBMIT = "https://www.bing.com/webmasters/help/url-submission-62f2860b";
const BAIDU_COURSE = "https://ziyuan.baidu.com/college/courseinfo?id=267";
const NAVER = "https://searchadvisor.naver.com/guide";

export const INDEXING: Guide = {
  slug: "indexing",
  short: "站长后台和收录提交",
  title: "各搜索引擎的站长后台和收录提交：Google、Bing、Yandex、Naver、百度、Seznam 怎么注册、怎么提交、能看到什么",
  description:
    "网站上线后在 Google、Bing、Yandex、Naver、百度、Seznam 开站长后台：谁能注册、怎么验证、站点地图和单个网址怎么提交、每天能交多少，IndexNow 覆盖哪几家，以及各家新出的 AI 引用报告。",
  intro:
    "网站上线以后，先在要讨好的那几家引擎开站长后台：验证网站、交站点地图、看收录和搜索词。Bing、Yandex、Naver、Seznam 共用 IndexNow，提交一次就互相共享；Google 和百度不收 IndexNow，要分别提交。",
  checked: "2026-11-07",
  sections: [
    {
      id: "indexnow",
      title: "IndexNow：提交一次，四家共享",
      items: [
        {
          text: "IndexNow 官网列出的参与引擎是 Bing、Naver、Seznam、Yandex、Yep，常见问题页还列了 Amazon。",
          sources: [
            { label: "IndexNow 官网", url: "https://www.indexnow.org/" },
            { label: "IndexNow FAQ", url: "https://www.indexnow.org/faq" },
          ],
        },
        {
          text: "协议文档写明，提交的网址会自动共享给所有参与的引擎，所以提交给任意一家就够了。",
          sources: [{ label: "IndexNow 文档", url: INDEXNOW_DOC }],
        },
        {
          text: "Google 和百度都不在名单上：Google 只认网址检查和站点地图，百度只有自己的普通收录和快速抓取。",
          sources: [
            { label: "Google 重新抓取", url: GSC_RECRAWL },
            { label: "百度普通收录", url: `${BAIDU_COURSE}&page=2` },
          ],
        },
        {
          text: "Bing 强烈推荐用 IndexNow，并说后台手动提交和 URL 提交 API 将来可能停用。",
          sources: [{ label: "Bing 网址提交", url: BING_SUBMIT }],
        },
      ],
    },
    {
      id: "google",
      title: "Google Search Console",
      items: [
        {
          text: "有 Google 账号就能用，一个账号最多 1,000 个资源。网域资源只能用 DNS 记录验证，网址前缀资源还能用 HTML 文件、meta 标签、Google Analytics 或 Tag Manager。",
          sources: [
            { label: "添加资源", url: "https://support.google.com/webmasters/answer/34592" },
            { label: "验证方式", url: "https://support.google.com/webmasters/answer/9008080" },
          ],
        },
        {
          text: "站点地图在 Sitemaps 报告里提交；单个网址用「网址检查」里的「请求编入索引」。官方说这个功能有每日上限、不公布具体数字，重复请求也不会更快。站点地图 ping 接口 2023 年已经停用。",
          sources: [
            { label: "站点地图", url: "https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap" },
            { label: "请求重新抓取", url: GSC_RECRAWL },
            { label: "ping 停用", url: "https://developers.google.com/search/blog/2023/06/sitemaps-lastmod-ping" },
          ],
        },
        {
          text: "Indexing API 只能用于招聘信息和直播视频页面，普通网页不能用它提交。",
          sources: [{ label: "Indexing API", url: "https://developers.google.com/search/apis/indexing-api/v3/quickstart" }],
        },
        {
          text: "2026 年 8 月 31 日起，所有网站都能看「生成式 AI 效果」报告：覆盖 AI 概览、AI Mode 和 Discover，目前只有展示次数，可按网页、国家、设备和日期分组。同时多了一个开关，可以让网站不出现在这些 AI 功能里，不影响 AI 训练。",
          sources: [
            { label: "Google 博客", url: "https://developers.google.com/search/blog/2026/06/gen-ai-performance-reports" },
            { label: "报告说明", url: "https://support.google.com/webmasters/answer/16984139" },
            { label: "退出开关", url: "https://support.google.com/webmasters/answer/16908024" },
          ],
        },
      ],
    },
    {
      id: "bing",
      title: "Bing Webmaster Tools",
      lead: "Yahoo 的结果和 DuckDuckGo 的大部分网页结果也来自 Bing，管好这一个后台，三家都照顾到了。",
      items: [
        {
          text: "可以用 Microsoft、Google 或 Facebook 账号登录；能从 Search Console 导入网站并自动验证，一次最多 100 个。也可以用 DNS、BingSiteAuth.xml 文件、meta 标签或 CNAME 手动验证。",
          sources: [
            { label: "Bing 后台", url: "https://www.bing.com/webmasters/about" },
            { label: "添加和验证", url: "https://www.bing.com/webmasters/help/add-and-verify-site-12184f8b" },
          ],
        },
        {
          text: "后台手动提交和 URL 提交 API 每个域名每天最多 10,000 个网址，子域名不另算，UTC 零点重置。",
          sources: [{ label: "Bing 网址提交", url: BING_SUBMIT }],
        },
        {
          text: "AI Performance 报告 2026 年 2 月起公开预览：看网站在 Copilot、Bing 的 AI 摘要和部分合作方里被引用了多少次、哪些页面被引用、对应什么查询。数据是抽样，没有点击数。6 月又加了意图、主题、引用占比和对比几个视图。",
          sources: [
            { label: "Bing 博客（2026-02）", url: "https://blogs.bing.com/webmaster/February-2026/Introducing-AI-Performance-in-Bing-Webmaster-Tools-Public-Preview" },
            { label: "Bing 博客（2026-06）", url: "https://blogs.bing.com/search/June-2026/New-AI-Visibility-Insights-in-Bing-Webmaster-Tools-Intents-Topics-Citation-Share-Compare" },
          ],
        },
      ],
    },
    {
      id: "yandex",
      title: "Yandex Webmaster",
      items: [
        {
          text: "用 Yandex ID 登录，完整注册要确认手机号。验证用根目录 HTML 文件（官方推荐）、首页 meta 标签或 DNS TXT 记录，最长 24 小时生效。",
          sources: [
            { label: "Yandex ID", url: "https://yandex.ru/support/id/ru/authorization/lite.html" },
            { label: "验证方式", url: "https://yandex.com/support/webmaster/service/rights.html" },
          ],
        },
        {
          text: "提交方式有站点地图、Reindex（每日上限由主域名和子域名共用，不公布数字）、IndexNow（次数不限，一次最多 1 万个网址）。",
          sources: [
            { label: "提交方式", url: "https://yandex.ru/support/webmaster/en/robot-workings/new-changed" },
            { label: "Reindex", url: "https://yandex.com/support/webmaster/en/robot-workings/site-reindex" },
            { label: "IndexNow", url: "https://yandex.com/support/webmaster/en/indexnow/reference/post-url.html" },
          ],
        },
        {
          text: "2026 年 4 月起，后台「效率」栏目能看网站在 Alice AI 回答的引用来源里占多少，每周更新，不影响排名。",
          sources: [{ label: "Yandex Webmaster 博客", url: "https://webmaster.yandex.ru/blog/efficiency-alice" }],
        },
        {
          text: "网站属于哪个地区，要在后台手动设置并过人工审核，见「域名怎么选」那篇的俄罗斯一节。",
          sources: [{ label: "Yandex 网站地区", url: "https://yandex.com/support/webmaster/en/site-geography/site-region.html" }],
        },
      ],
    },
    {
      id: "naver",
      title: "Naver Search Advisor",
      items: [
        {
          text: "不注册也会被收录；注册并验证以后才能看报告。验证用 meta 标签或 HTML 文件，meta 必须写在 head 里，验证时不执行 JavaScript。",
          sources: [{ label: "Naver FAQ", url: `${NAVER}/faq-start-register` }],
        },
        {
          text: "可以提交 RSS 和站点地图，单个站点地图最多 5 万个网址、不超过 10MB；网页收集请求按站点限量，处理要 1 天到几周，不用每天重复交。",
          sources: [
            { label: "提交站点地图", url: `${NAVER}/request-feed` },
            { label: "收集请求", url: `${NAVER}/request-crawl` },
          ],
        },
        {
          text: "2023 年 7 月起支持 IndexNow，总次数不限但会限流。",
          sources: [{ label: "Naver IndexNow", url: `${NAVER}/indexnow-about` }],
        },
        {
          text: "2026 年的变化：FAQ 富结果 7 月 9 日起停止展示；10 月起报告数字因为系统迁移有变动。",
          sources: [{ label: "Naver 站长博客", url: "https://m.blog.naver.com/PostList.naver?blogId=naver_webmaster" }],
        },
      ],
    },
    {
      id: "baidu",
      title: "百度搜索资源平台",
      items: [
        {
          text: "注册百度账号要中国大陆手机号，注册页没有国家区号选项。",
          sources: [{ label: "百度注册页", url: "https://passport.baidu.com/v2/?reg" }],
        },
        {
          text: "2023 年 9 月起，平台清退未实名账号等风险站点的验证关系；非实名账户下的站点不能再提交 sitemap，API 推送额度也被调整。",
          sources: [
            { label: "百度公告 3529", url: "https://ziyuan.baidu.com/wiki/3529" },
            { label: "百度公告 3531", url: "https://ziyuan.baidu.com/wiki/3531" },
          ],
        },
        {
          text: "验证用文件或 HTML 标签，CNAME 验证 2023 年 1 月起暂停。",
          sources: [
            { label: "验证方式", url: `${BAIDU_COURSE}&page=1` },
            { label: "CNAME 暂停", url: "https://ziyuan.baidu.com/wiki/3462" },
          ],
        },
        {
          text: "普通收录有 API 推送、sitemap 和手动提交三种。配额按站点质量给，各站不同；反复提交旧链接会被降额。sitemap 最多 5 万条，不再支持索引型 sitemap。",
          sources: [
            { label: "普通收录", url: `${BAIDU_COURSE}&page=2` },
            { label: "sitemap 规则", url: `${BAIDU_COURSE}&page=17` },
          ],
        },
        {
          text: "「快速收录」2024 年 4 月 26 日下线，换成「快速抓取」，只给 VIP 合作站，其他站只能参加平台活动获得。",
          sources: [
            { label: "百度公告", url: "https://ziyuan.baidu.com/wiki/3546" },
            { label: "百度说明", url: "https://ziyuan.baidu.com/college/articleinfo?id=3549" },
          ],
        },
        {
          text: "2026 年 9 月公告了「AI 流量分析」（AI 引用、曝光、点击），分阶段开放，数据还没正式启用。",
          sources: [{ label: "百度公告", url: "https://ziyuan.baidu.com/wiki/3519" }],
        },
      ],
    },
    {
      id: "others",
      title: "Seznam、Cốc Cốc、Yahoo! JAPAN",
      items: [
        {
          text: "捷克的 Seznam Webmaster 还在测试：用 Seznam 账号，首页 meta 或根目录文件验证，脚本插入的 meta 不认；它的 API 保证每天最多 500 个网址几分钟内进索引。",
          sources: [
            { label: "Seznam Webmaster", url: "https://o-seznam.cz/napoveda/vyhledavani/seznam-webmaster/" },
            { label: "Seznam IndexNow", url: "https://o-seznam.cz/napoveda/vyhledavani/seznambot/protokol-indexnow/" },
          ],
        },
        {
          text: "越南的 Cốc Cốc 没有站长后台，只有一个不用验证的提交表单，站点地图写在 robots.txt 里。",
          sources: [{ label: "Cốc Cốc", url: "https://coccoc.com/search/console/get-your-website-on-coc-coc-search" }],
        },
        {
          text: "Yahoo! JAPAN 用 Google 的搜索引擎，没有自己的站长后台，在 Google Search Console 里管就行。",
          sources: [
            { label: "2010 年公告", url: "https://www.lycorp.co.jp/news/archive/Y/ja/ja20100727_A.pdf" },
            { label: "Yahoo! JAPAN 帮助", url: "https://support.yahoo-net.jp/SccSearch/s/article/H000010324" },
          ],
        },
      ],
    },
  ],
  pitfalls: [
    {
      text: "每天对同一个网址点「请求编入索引」：Google 说重复请求不会更快。",
      sources: [{ label: "Google 重新抓取", url: GSC_RECRAWL }],
    },
    {
      text: "用 Indexing API 提交普通网页：它只支持招聘信息和直播视频。",
      sources: [{ label: "Indexing API", url: "https://developers.google.com/search/apis/indexing-api/v3/quickstart" }],
    },
    {
      text: "以为 IndexNow 能通知 Google 和百度：两家都不收。",
      sources: [{ label: "IndexNow 文档", url: INDEXNOW_DOC }],
    },
    {
      text: "用 JavaScript 插入验证用的 meta 标签：Naver 验证时不执行 JavaScript，Seznam 也不认脚本插入的 meta。",
      sources: [
        { label: "Naver FAQ", url: `${NAVER}/faq-start-register` },
        { label: "Seznam", url: "https://o-seznam.cz/napoveda/vyhledavani/seznam-webmaster/" },
      ],
    },
    {
      text: "给百度反复推送旧链接：配额会被降。",
      sources: [{ label: "百度普通收录", url: `${BAIDU_COURSE}&page=2` }],
    },
  ],
  unknowns: [
    "Google「请求编入索引」每天具体能用多少次，官方只说有上限。",
    "在百度添加站点是否必须做 ICP 备案，外国人做实名认证能用哪些证件，官方文档都没写。",
    "外国人能不能用海外手机号注册 Naver ID，只有第三方说法；Naver 收集请求每天能交多少也没公布。",
    "只用邮箱注册的 Yandex ID 能不能用 Webmaster，以及 Reindex 每天的具体数量。",
    "Seznam 对外国人注册账号的条件，以及后台有没有提交站点地图的入口。",
    "Yahoo! JAPAN 现在是否仍用 Google 的结果，只找到 2010 年的公告。",
  ],
  related: [
    { label: "先讨好哪个搜索引擎", path: "/search-engines" },
    { label: "域名怎么选", path: "/domains" },
    { label: "各市场的 AI 助手", path: "/ai-assistants" },
  ],
};
