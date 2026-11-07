import type { Guide } from "../go-global-guides";

// 网站流量怎么变现，按市场整理：只写广告平台、联盟平台和监管机构自己的页面，个别条目用有日期的媒体或律所转述（写明）。
// 这是站长变现的角度；卖家拉新用的联盟和广告在「SEO 以外的获客渠道」那篇。调研笔记在 ~/出海/research/2026-11-by-market/11（不在仓库里）。
const ADSENSE_LANG = "https://support.google.com/adsense/answer/9727";
const ADSENSE_PAY = "https://support.google.com/adsense/answer/1714397";
const ADSENSE_HYPERWALLET = "https://support.google.com/adsense/answer/16691394";
const ADSENSE_HW_FAQ = "https://support.google.com/adsense/answer/15292512";
const ADSENSE_THRESHOLD = "https://support.google.com/adsense/answer/1709871";
const ADSENSE_TAX = "https://support.google.com/adsense/answer/1322037";
const AMAZON_FX = "https://affiliate-program.amazon.com/help/node/topic/G8VUMS6GTBCR9RGV";
const AMAZON_TAX = "https://affiliate-program.amazon.com/help/node/topic/GPFZ6W6CF4E5BD9V";
const AMAZON_PAY = "https://affiliate-program.amazon.com/gp/associates/help/t3/a2";
const FTC_2023 =
  "https://www.ftc.gov/news-events/news/press-releases/2023/06/federal-trade-commission-announces-updated-advertising-guides-combat-deceptive-reviews-endorsements";
const FTC_FAQ = "https://www.ftc.gov/business-guidance/resources/ftcs-endorsement-guides-what-people-are-asking";
const SHOPEE_ID_TAX = "https://www.pajak.go.id/id/berita/pajak-lumajang-bantu-shopee-affiliator-padankan-nik-npwp";
const TOKOPEDIA_AFF = "https://affiliate.tokopedia.com/";
const INVOLVE = "https://involve.asia/terms-conditions/";
const ACCESSTRADE = "https://accesstrade.vn/dieu-khoan-su-dung/";
const ADMICRO = "http://publisher.admicro.vn/";
const A8_ABROAD = "https://www.a8.net/faq/9.html";
const A8_PAYOUT = "https://www.a8.net/faq/6.html";
const RAKUTEN_NEWS = "https://ecnomikata.com/ecnews/37724/";
const NEND_CLOSE = "https://gamebiz.jp/news/379899";
const CAA_STEALTH = "https://www.caa.go.jp/policies/policy/representation/fair_labeling/stealth_marketing/";
const SOUMU_EXTERNAL = "https://www.soumu.go.jp/main_sosiki/joho_tsusin/d_syohi/gaibusoushin_kiritsu.html";
const ADFIT_JOIN = "https://kakaobusiness.gitbook.io/main/partner/adfit/join";
const ADFIT_FAQ = "https://kakaobusiness.gitbook.io/main/partner/adfit/faq";
const KFTC_2024 = "https://shinkim.com/kor/media/newsletter/2613";
const KFTC_2025 = "https://www.ajunews.com/view/20251202085042877";
const GOOGLE_PAUSE = "https://support.google.com/publisherpolicies/answer/15766875";
const YANDEX_PAY = "https://yandex.ru/support/partner/ru/payments/index.md";
const YANDEX_OFFER_INTL = "https://yandex.com/legal/yan_service_offer_ae/";
const ADMITAD_COM = "https://www.admitad.com/";
const ADMITAD_RU = "https://www.admitad.ru/pravila-ispolzovaniya-platformy-admitad-ru/";
const RU_AD_LABEL = "https://www.consultant.ru/document/cons_doc_LAW_58968/2c4537e4796f6ff8b2736ed1b0d4fef08e14458e/";
const RU_AD_LEVY = "https://www.consultant.ru/document/cons_doc_LAW_58968/f5499f6a99f4f1011e473eae3412f6c7f0262387/";
const GOOGLE_CMP = "https://support.google.com/adsense/answer/13554116";
const IAB_TCF = "https://iabeurope.eu/transparency-consent-framework/";
const AMAZON_DE_PAY = "https://partnernet.amazon.de/help/topic/t3/a2";
const AMAZON_UK_PAY = "https://affiliate-program.amazon.co.uk/help/topic/t3/a2";
const ASA_AFFILIATE = "https://www.asa.org.uk/advice-online/affiliate-marketing.html";

export const ADS_AFFILIATE: Guide = {
  slug: "ads-affiliate",
  short: "广告和联盟变现",
  title: "网站流量怎么变现：AdSense、各市场的广告联盟和联盟营销，境外站长能接哪些、钱怎么收",
  description:
    "按市场整理工具站、内容站的变现方式：AdSense 在各市场的限制和中国站长的收款方式，亚马逊联盟各站点给境外站长的付款，日本 A8.net、乐天，韩国 Kakao AdFit，俄罗斯 Yandex 广告网络，印尼、越南的联盟平台，以及欧盟、英国、美国、日本、韩国对广告同意和推荐披露的要求。",
  intro:
    "广告和联盟是工具站、内容站最常见的变现方式，但能不能接、钱能不能收到，要看流量来自哪个市场：AdSense 覆盖大部分市场，俄罗斯的访客却基本没有 Google 广告；日本、韩国的本地联盟多数要当地银行账户、当地身份或者邀请；欧盟和英国的流量要先接上认证的同意管理平台。下面按市场列出在当地没有公司和银行账户的站长能接哪些、钱怎么收。",
  checked: "2026-11-07",
  sections: [
    {
      id: "global",
      title: "先看 AdSense 和亚马逊联盟",
      lead: "这两家覆盖的市场最多，先看它们对网站语言、收款方式和美国税表的要求。",
      items: [
        {
          text: "AdSense 只给主要语言在它支持列表里的网页放广告，列表里有简体中文、繁体中文、日文、韩文、印尼文、越南文、俄文和英文。",
          sources: [{ label: "AdSense 支持的语言", url: ADSENSE_LANG }],
        },
        {
          text: "收款方式按站长所在地定：中国大陆可以电汇，2025 年 10 月 30 日起也能用 PayPal Hyperwallet（必须新开一个 Hyperwallet 账户，已有的不能用）；香港是电子转账和电汇；俄罗斯不在收款国家表里。",
          sources: [
            { label: "AdSense 收款方式", url: ADSENSE_PAY },
            { label: "Hyperwallet 开放公告", url: ADSENSE_HYPERWALLET },
            { label: "Hyperwallet 常见问题", url: ADSENSE_HW_FAQ },
          ],
        },
        {
          text: "付款门槛是 100 美元，港币是 800、英镑 60、欧元 70、日元 8,000。",
          sources: [{ label: "AdSense 付款门槛", url: ADSENSE_THRESHOLD }],
        },
        {
          text: "所有变现的站长都要交美国税务信息：非美国个人填 W-8BEN，公司填 W-8BEN-E；来自美国用户的收入，Google 按收入类型和税收协定扣税。",
          sources: [{ label: "AdSense 税务信息", url: ADSENSE_TAX }],
        },
        {
          text: "亚马逊联盟的国际银行转账（Fx4Cash）只给美国、英国、德国、法国、意大利、西班牙、加拿大站的伙伴，而且收款账户要在美国、英国或欧元区等 52 个国家，名单里没有中国大陆和香港。",
          sources: [{ label: "Amazon Fx4Cash 常见问题", url: AMAZON_FX }],
        },
      ],
    },
    {
      id: "us",
      title: "美国：AdSense 和亚马逊之外，重点是披露",
      items: [
        {
          text: "亚马逊美国站：非美国伙伴不交带税收协定优惠的 W-8BEN，Amazon 按美国国税局要求最多扣 30%。",
          sources: [{ label: "Amazon 税务说明", url: AMAZON_TAX }],
        },
        {
          text: "亚马逊美国站月末后约 60 天付款；银行转账和礼品卡满 10 美元，支票满 100 美元。只有中国大陆或香港账户的，实际只能选礼品卡或支票，或者另备美国、英国、欧元区的账户。",
          sources: [
            { label: "Amazon 付款方式", url: AMAZON_PAY },
            { label: "Fx4Cash", url: AMAZON_FX },
          ],
        },
        {
          text: "FTC 2023 年 6 月更新了《推荐和代言指南》。它的问答写明：网站上有联盟链接要清楚披露、离推荐越近越好；链接旁写「Paid link」算够，只写「affiliate link」不够；可以合理预见美国消费者会看到的内容就适用美国规则，站长在不在美国都一样。",
          sources: [
            { label: "FTC 2023 公告", url: FTC_2023 },
            { label: "FTC 问答", url: FTC_FAQ },
          ],
        },
      ],
    },
    {
      id: "id",
      title: "印尼：电商联盟多，提现要印尼税号",
      items: [
        {
          text: "Shopee 印尼联盟提现要填 16 位税号，也就是和税号绑定的印尼身份号码（NIK），Shopee 每笔按所得税自动扣。没有印尼身份的站长提不了现。",
          sources: [{ label: "印尼税务总局新闻（页面没写年份）", url: SHOPEE_ID_TAX }],
        },
        {
          text: "Tokopedia 联盟还在运营，注册入口跳到 TikTok；要求有 Tokopedia 账号和公开的社交账号或博客，第一次提现到个人银行账户前要审核。页面没写国籍要求。",
          sources: [{ label: "Tokopedia Affiliate", url: TOKOPEDIA_AFF }],
        },
        {
          text: "东南亚的联盟网络 Involve Asia 上有 Shopee、Lazada 等商家，条款只要求是法人或年满 18 岁的个人，没写国家限制；付款时依法扣税。",
          sources: [{ label: "Involve Asia 条款", url: INVOLVE }],
        },
      ],
    },
    {
      id: "vn",
      title: "越南：Accesstrade 门槛低，本地广告网络门槛高",
      items: [
        {
          text: "Accesstrade 越南站：个人和机构都能做站长，个人的个税由平台代扣；条款没写国籍、证件和是否要越南银行账户（2026 年 11 月 4 日更新到第 5 版）。",
          sources: [{ label: "Accesstrade 条款", url: ACCESSTRADE }],
        },
        {
          text: "本地广告网络 Admicro 要求每月页面浏览量超过 100 万，申请时要上传 Google Analytics 报表；没写收不收境外站长、怎么付款。",
          sources: [{ label: "Admicro", url: ADMICRO }],
        },
      ],
    },
    {
      id: "jp",
      title: "日本：本地联盟要日本银行账户，nend 已经关了",
      items: [
        {
          text: "A8.net：住在日本以外也能注册，前提是有日本国内的银行账户和日本国内能联系上的地址；只能放在日文网站上。",
          sources: [{ label: "A8.net 常见问题", url: A8_ABROAD }],
        },
        {
          text: "A8.net 每个网站的报酬满 1,000 日元才付，月末结算、再下个月 15 日转账，手续费由站长承担。",
          sources: [{ label: "A8.net 付款", url: A8_PAYOUT }],
        },
        {
          text: "亚马逊日本站不在 Fx4Cash 国际转账的名单里；它的付款帮助页 2026 年 11 月 7 日打不开，付款门槛和支持哪些国家的银行账户没核实到。",
          sources: [{ label: "Fx4Cash", url: AMAZON_FX }],
        },
        {
          text: "乐天联盟的报酬先进乐天 Cash；据媒体报道，想转到银行要连续 3 个月每月确定报酬都在 3,001 日元以上，还要交身份证件、过网站审核。",
          sources: [{ label: "ECのミカタ（2024-04-16）", url: RAKUTEN_NEWS }],
        },
        {
          text: "本地广告网络 nend 2024 年 3 月 29 日停止投放，5 月关闭后台。",
          sources: [{ label: "gamebiz（2024-01-05）", url: NEND_CLOSE }],
        },
        {
          text: "2023 年 10 月起，隐形营销违反《景品表示法》：企业委托第三方发的内容也算广告，要标明。被管的是广告主，所以联盟文章也会被要求写清楚。",
          sources: [{ label: "消费者厅", url: CAA_STEALTH }],
        },
        {
          text: "2023 年 6 月起的「外部送信规律」：新闻、策展这类网站把用户信息发给第三方（比如广告代码）之前，要公布或取得同意；页面没说管不管境外运营者。",
          sources: [{ label: "总务省", url: SOUMU_EXTERNAL }],
        },
      ],
    },
    {
      id: "kr",
      title: "韩国：本地联盟难进，披露要放在开头",
      items: [
        {
          text: "Kakao AdFit 只给事先批准或受邀的媒体用，注册要填对接人给的认证码；公司账户要核验韩国营业登记号。",
          sources: [
            { label: "AdFit 注册", url: ADFIT_JOIN },
            { label: "AdFit 常见问题", url: ADFIT_FAQ },
          ],
        },
        {
          text: "韩国公平交易委员会修订的推荐广告审查指南 2024 年 12 月 1 日施行：按购买链接销量拿佣金明确算经济利益，要披露；博客要写在标题或开头，「可能获得少量佣金」这种含糊写法不算。2025 年 12 月又按博客、Instagram、YouTube、TikTok 分别给了配图示例。",
          sources: [
            { label: "Shin & Kim 律所简报（2024-11-19）", url: KFTC_2024 },
            { label: "亚洲经济（2025-12-02）", url: KFTC_2025 },
          ],
        },
      ],
    },
    {
      id: "ru",
      title: "俄罗斯：Google 广告基本没有，Yandex 广告网络收境外站长",
      items: [
        {
          text: "Google 2022 年 3 月起暂停在俄罗斯的广告系统、停开新的俄罗斯账户，2024 年 8 月 12 日又停了俄罗斯站长的变现；2025 年 1 月的更新仍写着不向俄罗斯用户投放 AdMob 广告。境外网站的俄罗斯访客基本带不来 Google 广告收入。",
          sources: [{ label: "Google 地区暂停变现政策", url: GOOGLE_PAUSE }],
        },
        {
          text: "Yandex 广告网络对其他国家的个人和公司都开放，收款到银行账户，币种是美元或欧元，门槛 150 美元或 100 欧元。",
          sources: [{ label: "Yandex 合作伙伴付款", url: YANDEX_PAY }],
        },
        {
          text: "俄罗斯以外的伙伴签的是英文版合同，对方是迪拜的 Air Smart Advertising Solutions FZ-LLC，适用英国法、在迪拜国际仲裁中心仲裁，也就是钱从阿联酋付。",
          sources: [{ label: "Yandex 广告网络合同（2024-11-28 生效）", url: YANDEX_OFFER_INTL }],
        },
        {
          text: "联盟营销平台 Admitad 现在分成两家：德国的 admitad.com 选国家时没有俄罗斯；俄罗斯的 admitad.ru 由一家俄罗斯公司运营，写的用户是俄罗斯的公司、个体户和自雇者。",
          sources: [
            { label: "admitad.com", url: ADMITAD_COM },
            { label: "admitad.ru 规则（2025-01-31）", url: ADMITAD_RU },
          ],
        },
        {
          text: "俄罗斯《广告法》：网络广告要标「реклама」、写明广告主，并从广告数据运营商拿到识别码才能投放；2024 年 12 月加入的第 18.2 条，对面向俄罗斯消费者的网络广告收入收 3%。",
          sources: [
            { label: "《广告法》第 18.1 条", url: RU_AD_LABEL },
            { label: "《广告法》第 18.2 条", url: RU_AD_LEVY },
          ],
        },
      ],
    },
    {
      id: "cn",
      title: "中国大陆：站长能收 AdSense，国内联盟的条件没读到",
      items: [
        {
          text: "大陆站长可以注册 AdSense，收款用电汇，或 2025 年 10 月 30 日起的 PayPal Hyperwallet。",
          sources: [
            { label: "AdSense 收款方式", url: ADSENSE_PAY },
            { label: "Hyperwallet 开放公告", url: ADSENSE_HYPERWALLET },
          ],
        },
        {
          text: "淘宝联盟、京东联盟、百度联盟的规则页都要运行脚本才显示，没读到它们对境外公司、港澳台和外籍站长的要求，见文末「查不到的」。",
        },
      ],
    },
    {
      id: "eu-uk",
      title: "欧盟和英国：先接认证的同意管理平台",
      items: [
        {
          text: "Google 要求：2024 年 1 月 16 日起，给欧洲经济区和英国用户放个性化广告，必须用 Google 认证、接入 IAB TCF 的同意管理平台（CMP），瑞士从 2024 年 7 月 31 日起。没接的只能拿到非个性化或有限广告；AdSense 的搜索广告没接就完全不出。",
          sources: [{ label: "Google 同意管理要求", url: GOOGLE_CMP }],
        },
        {
          text: "TCF 现行版本是 v2.3，2026 年 2 月 28 日起都要用这一版。",
          sources: [{ label: "IAB Europe", url: IAB_TCF }],
        },
        {
          text: "亚马逊德国站给境外伙伴的付款：礼品卡和银行转账满 25 欧元，支票满 50 欧元。英国站：银行转账和礼品卡满 25 英镑，支票满 50 英镑且只寄给非英国居民；没有英国账户要填 IBAN 和 BIC。",
          sources: [
            { label: "Amazon.de 付款", url: AMAZON_DE_PAY },
            { label: "Amazon.co.uk 付款", url: AMAZON_UK_PAY },
          ],
        },
        {
          text: "英国广告标准局（ASA）：联盟内容适用广告守则，商家和作者都要负责；博客文章建议在标题加「Ad」，只写「*affiliate」不够。",
          sources: [{ label: "ASA 联盟营销指引", url: ASA_AFFILIATE }],
        },
      ],
    },
  ],
  pitfalls: [
    {
      text: "做俄罗斯流量还指望 AdSense：Google 不向俄罗斯用户投放广告，能接的是 Yandex 广告网络。",
      sources: [{ label: "Google 地区暂停变现政策", url: GOOGLE_PAUSE }],
    },
    {
      text: "以为日本的联盟和亚马逊一样谁都能接：A8.net 要日本银行账户、日本地址和日文网站，nend 已经关了，乐天转银行有门槛。",
      sources: [{ label: "A8.net 常见问题", url: A8_ABROAD }],
    },
    {
      text: "联盟披露写在文末、写得含糊：韩国要求放在标题或开头，美国「affiliate link」一个词不够，英国建议标题加「Ad」。",
      sources: [
        { label: "Shin & Kim 律所简报", url: KFTC_2024 },
        { label: "FTC 问答", url: FTC_FAQ },
        { label: "ASA", url: ASA_AFFILIATE },
      ],
    },
    {
      text: "只有国内或香港的银行账户就去做亚马逊美国站：国际转账名单里没有这两地，只能收礼品卡或支票；不交带协定的 W-8BEN 最多扣 30%。",
      sources: [
        { label: "Fx4Cash", url: AMAZON_FX },
        { label: "Amazon 税务说明", url: AMAZON_TAX },
      ],
    },
    {
      text: "欧洲流量没接认证的同意管理平台：个性化广告没了，AdSense 搜索广告完全不出。",
      sources: [{ label: "Google 同意管理要求", url: GOOGLE_CMP }],
    },
    {
      text: "用已有的 Hyperwallet 账户收 AdSense：必须新开一个。",
      sources: [{ label: "Hyperwallet 开放公告", url: ADSENSE_HYPERWALLET }],
    },
  ],
  unknowns: [
    "各国 AdSense 单价：没找到有方法说明的公开数据，Google 的收益计算器不写方法。",
    "大陆访客能不能加载 AdSense 广告，Google 没有说明。",
    "Naver AdPost 和 Coupang Partners 现行的资格要求（官网拒绝自动访问），所以「要韩国身份」这个常见说法没核实。",
    "淘宝联盟、京东联盟、百度联盟对境外公司和外籍站长的要求。",
    "亚马逊日本站、乐天联盟能不能付到中国大陆或香港的账户。",
    "Shopee 越南联盟的资格（条款页打不开），以及 Shopee 印尼是否允许外籍站长注册。",
    "印尼、越南对联盟推广的披露规则，中国《互联网广告管理办法》对带购物链接的测评要不要标「广告」。",
    "Yandex 用美元、欧元付到中国大陆和香港银行的实际到账情况。",
  ],
  related: [
    { label: "SEO 以外的获客渠道（卖家拉新用的联盟和广告）", path: "/channels" },
    { label: "上线前必备的合规页面", path: "/compliance" },
    { label: "各市场的买家怎么付钱", path: "/local-payments" },
  ],
};
