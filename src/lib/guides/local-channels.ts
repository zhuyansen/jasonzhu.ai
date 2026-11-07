import type { Guide } from "../go-global-guides";

// 各市场的本地推广渠道：用户量主要用 DataReportal《Digital 2026》（数据 2025 年 10 月，多数是广告可触达人数，不是月活）和各国政府调查，
// 开号条件和发帖规则只写平台自己的帮助页和条款；个别条目用有日期的媒体转述（写明）。调研笔记在 ~/出海/research/2026-11-by-market/10（不在仓库里）。
const PEW_SOCIAL = "https://www.pewresearch.org/internet/fact-sheet/social-media/";
const DR_US = "https://datareportal.com/reports/digital-2026-united-states-of-america";
const DR_ID = "https://datareportal.com/reports/digital-2026-indonesia";
const DR_VN = "https://datareportal.com/reports/digital-2026-vietnam";
const VN_147 = "https://en.baochinhphu.vn/social-media-platforms-have-to-authenticate-users-via-phone-numbers-decree-111241112173317774.htm";
const ZALO_VERIFY = "https://oa.zalo.me/home/documents/policy/xac-thuc-tai-khoan";
const ZALO_OA = "https://oa.zalo.me/home/documents/policy/dang-ky-va-su-dung-tai-khoan-zalo-official-account-doanh-nghiep";
const VIBLO_TERMS = "https://viblo.asia/terms/vi_term";
const SOUMU_SNS = "https://www.soumu.go.jp/menu_news/s-news/01iicp01_02000130.html";
const DR_JP = "https://datareportal.com/reports/digital-2026-japan";
const LINE_HELP = "https://help2.line.me/official_account_jp/web?lang=ja";
const LINE_VERIFY = "https://www.lycbiz.com/jp/column/line-official-account/guideline/20190829/";
const QIITA_GUIDE = "https://help.qiita.com/ja/articles/qiita-community-guideline";
const ZENN_GUIDE = "https://zenn.dev/guideline";
const NOTE_IR = "https://edinetdb.jp/company/E38043/text";
const DR_KR = "https://datareportal.com/reports/digital-2026-south-korea";
const NAVER_ACCOUNT = "https://seoulstart.com/guides/naver-account-guide";
const NAVER_PASSPORT = "https://m.etnews.com/20260609000083";
const KAKAO_CHANNEL = "https://kakaobusiness.gitbook.io/main/channel/start";
const KAKAO_GLOBAL = "https://kakaobusiness.gitbook.io/global/channel/createchannel/licenses";
const GN_GUIDE = "https://news.hada.io/guidelines";
const DISQUIET = "https://yozm.wishket.com/magazine/detail/1975/";
const OKKY = "https://okky.kr/";
const DR_RU = "https://datareportal.com/reports/digital-2026-russian-federation";
const MT_TELEGRAM = "https://www.themoscowtimes.com/2026/02/10/roskomnadzor-tightens-restrictions-on-telegram-as-users-report-disruptions-a91907";
const MEDUZA_TELEGRAM =
  "https://meduza.io/en/feature/2026/06/11/russia-has-been-blocking-telegram-for-months-meduza-asked-five-popular-channel-admins-if-it-s-working";
const WHATSAPP_BLOCK = "https://abc17news.com/money/cnn-business-consumer/2026/02/12/russia-says-it-has-blocked-whatsapp-amid-wider-clampdown-on-social-media/";
const MAX_MEDIASCOPE = "https://verstka.media/messendzher-max-vpervye-operedil-telegram-po-mesyachnoj-auditorii-v-rossii-mediascope";
const MAX_40 = "https://mobile-review.com/all/news/messendzher-max-stal-dostupen-dlya-registraczii-v-40-stranah/";
const RU_406 = "https://habr.com/ru/news/751532/";
const HABR_RULES = "https://habr.com/ru/docs/help/rules/";
const HABR_SANDBOX = "https://habr.com/docs/help/sandbox";
const HABR_PRICE = "https://company.habr.com/static/price-non-resident-ru.pdf";
const VC_RULES = "https://vc.ru/rules";
const RU_ERID = "https://pravo163.ru/pokupka-inostrannymi-kompaniyami-reklamy-u-blogerov/";
const RU_BLOGGERS = "https://rg.ru/2024/08/15/iuristy-raziasnili-kak-budet-rabotat-zakon-o-registracii-blogerov.html";
const RU_META_ADS = "https://rbc.ru/society/07/04/2025/67f3c1569a79478b85f9f1ec";
const CNNIC_57 = "https://www.cnnic.net.cn/n4/2026/0304/c88-11549.html";
const TENCENT_Q2 = "https://www.tencent.com/wp-content/uploads/2026/08/Tencent-Announces-2026-Second-Quarter-Results.pdf";
const BILI_IR = "https://ir.bilibili.com/";
const WX_MP = "https://mp.weixin.qq.com/";
const WX_AGREEMENT = "https://mp.weixin.qq.com/cgi-bin/readtemplate?t=home/agreement_tmpl&type=info&lang=zh_CN";
const ZHIHU_TERMS = "https://www.zhihu.com/term/zhihu-terms";
const V2EX_ABOUT = "https://www.v2ex.com/about";
const V2EX_NODE_HELP = "https://www.v2ex.com/help/node";
const EUROSTAT =
  "https://ec.europa.eu/eurostat/statistics-explained/index.php?title=Digital_economy_and_society_statistics_-_households_and_individuals";
const DR_UK = "https://datareportal.com/reports/digital-2026-united-kingdom";
const DR_DE = "https://datareportal.com/reports/digital-2026-germany";
const DR_FR = "https://datareportal.com/reports/digital-2026-france";
const XING_WIKI = "https://de.wikipedia.org/wiki/XING";
const WYKOP_RULES = "https://wykop.pl/regulamin";

export const LOCAL_CHANNELS: Guide = {
  slug: "local-channels",
  short: "当地推广渠道",
  title: "各市场的本地推广渠道：当地人用哪些平台和社区，境外的个人和公司能不能开号",
  description:
    "按市场整理 SEO 以外的本地推广渠道：日本的 X、LINE、Qiita、Zenn，韩国的 KakaoTalk、Naver、GeekNews，越南的 Facebook、Zalo，印尼的 TikTok，俄罗斯的 VK、Habr 和被限的 Telegram，中国的公众号、B 站、V2EX，欧洲的 LinkedIn；各平台的用户量、官方号要不要当地执照、能不能发推广。",
  intro:
    "每个市场的人聚在不同的平台：日本看 X 和 LINE，韩国看 KakaoTalk 和 Naver，越南看 Facebook 和 Zalo，俄罗斯看 VK，中国看微信。两条通用的规律：官方号、企业号多半要当地营业执照；开发者社区普遍不让发硬广，能发的是自家产品的技术实现。用户量多来自 DataReportal《Digital 2026》，大多是广告能触达的人数，不是月活，只能比量级。Product Hunt、Hacker News、Reddit 这些全球渠道见「SEO 以外的获客渠道」那篇。",
  checked: "2026-11-07",
  sections: [
    {
      id: "us",
      title: "美国：按全球渠道那篇做",
      items: [
        {
          text: "Pew 2026 年的调查：美国成年人用 YouTube 的 84%、Facebook 70%、Instagram 51%。",
          sources: [{ label: "Pew Research（2026-10-19）", url: PEW_SOCIAL }],
        },
        {
          text: "广告能触达的人数：YouTube 2.54 亿、Facebook 1.98 亿、TikTok 1.53 亿（18 岁以上）、X 9,900 万（占人口 28.5%）；LinkedIn 注册会员 2.7 亿。",
          sources: [{ label: "DataReportal 美国", url: DR_US }],
        },
      ],
    },
    {
      id: "id",
      title: "印尼：TikTok、YouTube 最大，LinkedIn 在涨",
      items: [
        {
          text: "社交媒体用户 1.8 亿，占人口 62.9%。广告能触达的人数：TikTok 1.8 亿（18 岁以上）、YouTube 1.51 亿、Facebook 1.21 亿、Instagram 1.08 亿、X 2,290 万。",
          sources: [{ label: "DataReportal 印尼", url: DR_ID }],
        },
        {
          text: "LinkedIn 注册会员 3,700 万，一年涨了 15.6%，同期 X 的广告触达降了 8.6%（两者口径不同，只看方向）。",
          sources: [{ label: "DataReportal 印尼", url: DR_ID }],
        },
      ],
    },
    {
      id: "vn",
      title: "越南：Facebook、Zalo、TikTok 三家，Zalo 官方号要越南执照",
      items: [
        {
          text: "Facebook 广告能触达 7,900 万人（占人口 77.6%），Zalo 月活 7,830 万（VNG 公布），TikTok 7,610 万（18 岁以上），YouTube 6,210 万；Instagram 只有 1,170 万。",
          sources: [{ label: "DataReportal 越南", url: DR_VN }],
        },
        {
          text: "第 147 号法令 2024 年 12 月 25 日起施行：境内外的社交平台都要用越南手机号认证用户，没有越南号的改用身份识别号；只有认证过的账号能发帖、分享。",
          sources: [{ label: "越南政府网（2024-11-12）", url: VN_147 }],
        },
        {
          text: "Zalo 官方账号（OA）认证要证明企业已按越南法律注册并在经营；创建后 14 天内交认证材料，被拒后 14 天内不重交就永久锁号。境外公司直接开基本走不通。",
          sources: [
            { label: "Zalo OA 认证规则", url: ZALO_VERIFY },
            { label: "Zalo OA 使用规则", url: ZALO_OA },
          ],
        },
        {
          text: "开发者社区 Viblo 还在更新，但条款禁止以商业目的做宣传，带广告性质内容或链接的文章受限，违规会被停号。",
          sources: [{ label: "Viblo 条款", url: VIBLO_TERMS }],
        },
      ],
    },
    {
      id: "jp",
      title: "日本：X 比别的市场强得多，开发者社区只收技术文",
      items: [
        {
          text: "总务省 2025 年 12 月调查（13–79 岁）：用 LINE 的 92.9%、YouTube 81.5%、Instagram 54.8%、X 44.7%、TikTok 36.7%、Facebook 27.0%。",
          sources: [{ label: "总务省（2026-06-26）", url: SOUMU_SNS }],
        },
        {
          text: "X 在日本广告能触达 7,120 万人，占人口 57.9%（美国只有 28.5%）；LINE 月活 9,900 万。",
          sources: [{ label: "DataReportal 日本", url: DR_JP }],
        },
        {
          text: "LINE 官方账号的「认证账号」只对日本、台湾、泰国的账号开放审核；账号属于哪个国家按创建时自动定、不能改；以公司名义申请要填日本的法人番号，个人不能认证。",
          sources: [
            { label: "LINE 官方账号帮助", url: LINE_HELP },
            { label: "LY 认证说明（2026-10-28 更新）", url: LINE_VERIFY },
          ],
        },
        {
          text: "Qiita 不能发以宣传或销售为主要目的的文章，讲自家产品技术实现的不算宣传；Zenn 也要求避免以产品宣传为主，宣传最好只放在文末。",
          sources: [
            { label: "Qiita 社区规范", url: QIITA_GUIDE },
            { label: "Zenn 规范", url: ZENN_GUIDE },
          ],
        },
        {
          text: "note 会员 1,114 万（2025 年 11 月底），适合写长文讲产品背后的故事。",
          sources: [{ label: "note 有价证券报告书摘录", url: NOTE_IR }],
        },
      ],
    },
    {
      id: "kr",
      title: "韩国：KakaoTalk 人人都在用，商业频道要营业执照",
      items: [
        {
          text: "KakaoTalk 月活 4,910 万，占人口 95.1%；广告能触达 YouTube 4,290 万、Instagram 2,560 万、TikTok 1,180 万、X 1,040 万。",
          sources: [{ label: "DataReportal 韩国", url: DR_KR }],
        },
        {
          text: "Naver 账号据第三方说明可以用境外手机号注册，但 Naver Pay、购物这些实名功能要本人名下的韩国手机号；2026 年 6 月起外国人能用护照认证，只开放 Naver 地图的预约和支付。",
          sources: [
            { label: "Seoul Start 指南", url: NAVER_ACCOUNT },
            { label: "电子新闻（2026-06-09）", url: NAVER_PASSPORT },
          ],
        },
        {
          text: "KakaoTalk 频道谁都能免费开；转成商业频道要填营业登记号、交营业执照。Kakao 只给美国企业写了办法（护照加美国营业执照），别的国家没写。",
          sources: [
            { label: "Kakao 频道入门", url: KAKAO_CHANNEL },
            { label: "Kakao 海外企业材料", url: KAKAO_GLOBAL },
          ],
        },
        {
          text: "开发者社区 GeekNews：自己或所在团队做的产品只能发到 Show，只收能直接试用的东西，博客、介绍页、YouTube 链接都不收；短期连发多个项目会被限制。",
          sources: [{ label: "GeekNews 使用指南", url: GN_GUIDE }],
        },
        {
          text: "Disquiet 是晒产品、写开发日志的社区（2023 年累计用户 33 万）；开发者社区 OKKY 有专门的「宣传·广告」版块。",
          sources: [
            { label: "Wishket 报道（2023-04-14）", url: DISQUIET },
            { label: "OKKY", url: OKKY },
          ],
        },
      ],
    },
    {
      id: "ru",
      title: "俄罗斯：VK 和 Habr 为主，Telegram 已经靠不住",
      items: [
        {
          text: "VK 月活 9,250 万；TikTok 广告能触达 6,670 万（18 岁以上）；X 只有 46.4 万。",
          sources: [{ label: "DataReportal 俄罗斯", url: DR_RU }],
        },
        {
          text: "Roskomnadzor 2026 年 2 月 10 日起限制 Telegram，到 6 月不用 VPN 已经打不开；据 Agentstvo，4 月底到 5 月初那轮限速让俄罗斯频道的受众掉了约一半。WhatsApp 2026 年 2 月被克宫确认已封。",
          sources: [
            { label: "The Moscow Times（2026-02-10）", url: MT_TELEGRAM },
            { label: "Meduza（2026-06-11）", url: MEDUZA_TELEGRAM },
            { label: "CNN（2026-02-12，转载）", url: WHATSAPP_BLOCK },
          ],
        },
        {
          text: "国产通讯软件 Max：Mediascope 统计 2026 年 6 月月覆盖 8,630 万，已经超过 Telegram 的 7,570 万；2026 年 3 月起开放 40 个国家的手机号注册，报道点名的有越南、印尼、阿联酋、泰国、土耳其，没提中国。",
          sources: [
            { label: "Verstka（2026-07-21）", url: MAX_MEDIASCOPE },
            { label: "Mobile-review（2026-03-06）", url: MAX_40 },
          ],
        },
        {
          text: "第 406 号联邦法 2023 年 12 月起施行：俄罗斯网站的注册登录只能用俄罗斯手机号、政务服务账号或俄罗斯的账号体系，境外邮箱不行。",
          sources: [{ label: "Habr 新闻（2023-07-31）", url: RU_406 }],
        },
        {
          text: "Habr 的推广内容只能发在公司博客，或在「Я пиарюсь」版块发一次；新作者的文章先进沙盒审核，广告性质的过不了。非居民公司博客 3 个月 6,710 美元起。vc.ru 的规则也禁止推广商业服务的帖子。",
          sources: [
            { label: "Habr 规则（2026-07-08）", url: HABR_RULES },
            { label: "Habr 沙盒", url: HABR_SANDBOX },
            { label: "Habr 非居民报价", url: HABR_PRICE },
            { label: "vc.ru 规则（2019）", url: VC_RULES },
          ],
        },
        {
          text: "找俄罗斯博主投广告：网络广告 2022 年 9 月起必须带识别码（ERID），要按俄罗斯税号申请，境外公司只能通过俄罗斯中介；1 万粉以上的博主没在 Roskomnadzor 登记，2025 年起不能接广告；2025 年 9 月起禁止在 Instagram、Facebook 等被封平台投广告。",
          sources: [
            { label: "pravo163（2026-09-22 核对）", url: RU_ERID },
            { label: "俄罗斯报（2024-08-15）", url: RU_BLOGGERS },
            { label: "RBC（2025-04-07）", url: RU_META_ADS },
          ],
        },
      ],
    },
    {
      id: "cn",
      title: "中国大陆：公众号、B 站、V2EX，公众号和知乎要实名",
      items: [
        {
          text: "网民 11.25 亿（2025 年 12 月）；微信和 WeChat 合计月活 14.39 亿（含海外），B 站月活 3.71 亿。",
          sources: [
            { label: "CNNIC 第 57 次报告", url: CNNIC_57 },
            { label: "腾讯 2026 年二季度财报", url: TENCENT_Q2 },
            { label: "哔哩哔哩投资者关系", url: BILI_IR },
          ],
        },
        {
          text: "微信公众平台分「服务号」（企业和组织）和「公众号」（个人、媒体、企业都可以），注册实名；协议禁止诱导关注、点链接、分享，未经腾讯书面许可不能和别的号或第三方平台互推。",
          sources: [
            { label: "微信公众平台", url: WX_MP },
            { label: "公众平台服务协议", url: WX_AGREEMENT },
          ],
        },
        {
          text: "知乎要求按法规完成真实身份认证，机构号另有协议。",
          sources: [{ label: "知乎协议（2025-03-20 更新）", url: ZHIHU_TERMS }],
        },
        {
          text: "V2EX 会员 75 万以上；自己做的作品发「分享创造」节点，公司的营销内容必须发「推广」节点，发错会被移过去，屡犯影响账号。",
          sources: [
            { label: "V2EX 关于", url: V2EX_ABOUT },
            { label: "V2EX 节点说明", url: V2EX_NODE_HELP },
          ],
        },
      ],
    },
    {
      id: "eu-uk",
      title: "欧洲、英国：LinkedIn、Reddit、X 为主，本地社区很少",
      items: [
        {
          text: "欧盟 16–74 岁的人有 67% 用社交网络（2025 年）。",
          sources: [{ label: "Eurostat", url: EUROSTAT }],
        },
        {
          text: "LinkedIn 注册会员：英国 4,800 万、法国 3,800 万、德国 2,400 万。Reddit 广告能触达：英国 4,580 万、德国 2,930 万、法国 2,050 万。X：英国、德国各 1,900 万，法国 1,240 万。",
          sources: [
            { label: "DataReportal 英国", url: DR_UK },
            { label: "DataReportal 德国", url: DR_DE },
            { label: "DataReportal 法国", url: DR_FR },
          ],
        },
        {
          text: "别把 XING 当德国版 LinkedIn：它 2023 年关了群组和活动，改做求职平台。",
          sources: [{ label: "维基百科（引 heise 等）", url: XING_WIKI }],
        },
        {
          text: "查到还活跃的国家级社区只有波兰的 Wykop，规则禁止操纵投票、刷屏和隐性广告。",
          sources: [{ label: "Wykop 规则（2026-05-11）", url: WYKOP_RULES }],
        },
      ],
    },
  ],
  pitfalls: [
    {
      text: "照 2025 年以前的经验，把俄罗斯推广押在 Telegram 频道上：2026 年起被限，频道受众掉了约一半，WhatsApp 已封。",
      sources: [{ label: "Meduza（2026-06-11）", url: MEDUZA_TELEGRAM }],
    },
    {
      text: "用境外公司直接开当地的官方号：Zalo 官方号要越南执照，Kakao 商业频道要营业执照，LINE 认证账号要日本法人番号。",
      sources: [
        { label: "Zalo OA 认证规则", url: ZALO_VERIFY },
        { label: "Kakao 频道入门", url: KAKAO_CHANNEL },
        { label: "LY 认证说明", url: LINE_VERIFY },
      ],
    },
    {
      text: "在开发者社区发产品介绍：Qiita、Zenn、Viblo、Habr 都不收以宣传为主的文章，GeekNews 只收能直接试用的 Show；能发的是自家产品的技术实现。",
      sources: [
        { label: "Qiita 社区规范", url: QIITA_GUIDE },
        { label: "GeekNews 使用指南", url: GN_GUIDE },
      ],
    },
    {
      text: "自己找俄罗斯博主投广告：要 ERID 识别码，境外公司只能走俄罗斯中介；博主没登记的不能接广告。",
      sources: [{ label: "pravo163", url: RU_ERID }],
    },
    {
      text: "把 DataReportal 的数字当月活比：多数是广告能触达的人数，有的超过人口，只能比量级。",
      sources: [{ label: "DataReportal 美国", url: DR_US }],
    },
  ],
  unknowns: [
    "印尼 WhatsApp 的用量和 Kaskus 现在的活跃度，以及印尼有没有像 Qiita、Viblo 那样的开发者社区。",
    "Zalo 个人号能不能用中国手机号注册；越南 147 号法令对境外注册的账号怎么执行。",
    "没有日本法人番号的境外公司能不能拿 LINE 认证账号；はてなブックマーク单独的月活。",
    "Naver 帮助中心对境外手机号的原文；美国以外的境外企业转 Kakao 商业频道要什么材料。",
    "VK 现在收不收外国手机号；Max 开放的 40 国完整名单。",
    "境外公司、境外个人开微信公众号或服务号要什么材料；小红书专业号、B 站、知乎机构号对境外主体的要求。",
    "英国、德国、法国有没有值得单列的本地科技社区。",
  ],
  related: [
    { label: "SEO 以外的获客渠道（Product Hunt、HN、Reddit、X）", path: "/channels" },
    { label: "先讨好哪个搜索引擎", path: "/search-engines" },
    { label: "语言和本地化细节", path: "/localization" },
  ],
};
