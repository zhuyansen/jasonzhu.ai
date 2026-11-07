import type { Guide } from "../go-global-guides";

// 语言和本地化细节，按市场整理：搜索引擎只写 Google、Yandex、百度自己的文档；写法细节用微软各语言的本地化风格指南和 Unicode CLDR；
// 法律只写法条原文（部分是维基文库转载）、监管机构和律所简报（写明）。调研笔记在 ~/出海/research/2026-11-by-market/12（不在仓库里）。
const G_LOCALIZED = "https://developers.google.com/search/docs/specialty/international/localized-versions";
const G_MULTI = "https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites";
const G_URL = "https://developers.google.com/search/docs/crawling-indexing/url-structure";
const G_SPAM = "https://developers.google.com/search/docs/essentials/spam-policies";
const G_UPDATE_2025 = "https://developers.google.com/search/updates#spring-cleaning-in-our-multilingual-documentation";
const SER_2025 = "https://www.seroundtable.com/google-softens-automated-translation-stance-39579.html";
const G_TRANSLATED = "https://developers.google.com/search/docs/appearance/translated-results";
const US_EO = "https://www.whitehouse.gov/presidential-actions/2025/03/designating-english-as-the-official-language-of-the-united-states/";
const CLDR_EN = "https://raw.githubusercontent.com/unicode-org/cldr-json/main/cldr-json/cldr-dates-full/main/en/ca-gregorian.json";
const CLDR_EN_GB = "https://raw.githubusercontent.com/unicode-org/cldr-json/main/cldr-json/cldr-dates-full/main/en-GB/ca-gregorian.json";
const MS_ID = "https://aka.ms/indonesian-styleguide";
const ID_LAW_24 = "https://id.wikisource.org/wiki/Undang-Undang_Republik_Indonesia_Nomor_24_Tahun_2009";
const ID_LAW_8 = "https://id.wikisource.org/wiki/Undang-Undang_Republik_Indonesia_Nomor_8_Tahun_1999";
const MS_VI = "https://aka.ms/vietnamese-styleguide";
const MS_JA = "https://aka.ms/japanese-styleguide";
const CLDR_JA_DATES = "https://raw.githubusercontent.com/unicode-org/cldr-json/main/cldr-json/cldr-dates-full/main/ja/ca-gregorian.json";
const CLDR_JA_CURRENCY = "https://raw.githubusercontent.com/unicode-org/cldr-json/main/cldr-json/cldr-numbers-full/main/ja/currencies.json";
const MS_KO = "https://aka.ms/korean-styleguide";
const YANDEX_HREFLANG = "https://yandex.ru/support/webmaster/ru/yandex-indexing/locale-pages";
const YANDEX_URLS = "https://yandex.ru/support/webmaster/en/recommendations/site-structure";
const RU_CPL_10_1 = "https://www.consultant.ru/document/cons_doc_LAW_305/484f0c7a6ab5d52f83b2d9f852ff8378932d96e2/";
const RU_RPN_SITES =
  "https://www.comnews.ru/content/244017/2026-02-28/2026-w09/1010/rospotrebnadzor-zakon-o-zaschite-russkogo-yazyka-kasaetsya-saytov-internete";
const RU_LIDINGS = "https://www.lidings.com/ru/media/legalupdates/zakon-o-zashchite-russkogo-yazyka-razbiraemsya-v-detalyakh/";
const RU_ART_8 = "https://www.consultant.ru/law/hotdocs/93031.html";
const MS_RU = "https://aka.ms/russian-styleguide";
const CN_LANGUAGE_LAW = "https://zh.wikisource.org/wiki/中华人民共和国国家通用语言文字法_(2025年)";
const BAIDU_URL = "https://ziyuan.baidu.com/college/articleinfo?id=1263";
const MS_ZH_TW = "https://aka.ms/chinese-traditional-styleguide";
const MS_HK_SOFTWARE = "https://www.microsoft.com/zh-hk/software-download";
const MS_TW_SOFTWARE = "https://www.microsoft.com/zh-tw/software-download";
const HK_DIGITAL_POLICY = "https://www.digitalpolicy.gov.hk/tc/";
const TW_MODA = "https://moda.gov.tw/";
const HK_AQHI = "https://www.aqhi.gov.hk/tc/";
const TW_AIR = "https://airtw.moenv.gov.tw/";
const OPENCC = "https://github.com/BYVoid/OpenCC";
const FR_TOUBON = "https://www.legifrance.gouv.fr/loda/id/JORFTEXT000000349929";
const FR_CULTURE =
  "https://www.culture.gouv.fr/thematiques/langue-francaise-et-langues-de-france/agir-pour-les-langues/garantir-l-emploi-du-francais";
const FR_FINES = "https://simonassocies.com/wp-content/uploads/2024/06/Lettre-de-la-Consommation-Juin-2024-vf.pdf";
const MS_DE = "https://aka.ms/german-styleguide";
const APPLE_DE = "https://www.apple.com/de/iphone/";
const MS_EN_GB = "https://aka.ms/english-uk-styleguide";

export const LOCALIZATION: Guide = {
  slug: "localization",
  short: "语言和本地化",
  title: "语言和本地化细节：hreflang 和本地文字网址怎么写、机器翻译页面的风险、各语言的称呼和格式、法律对语言的硬性要求",
  description:
    "按市场整理出海站多语言版本的细节：Google 认哪些 hreflang 代码、本地文字网址行不行、机器翻译的页面算不算垃圾内容；日语、韩语、印尼语、越南语、俄语、德语怎么称呼用户；台湾和香港的繁体用词差别；俄罗斯 2026 年 3 月起的俄语要求、法国 Toubon 法、印尼语言法和中国新修订的《国家通用语言文字法》。",
  intro:
    "用 AI 把英文站翻成几种语言很快，但有三件事机器不会替你想：搜索引擎认不认、当地人读着别不别扭、法律有没有硬性要求。Google 只按页面可见的内容判断语言，只翻界面不翻正文会被当成重复页；日语、韩语、德语都有称呼和语气的讲究；俄罗斯 2026 年 3 月起要求面向消费者的信息用俄语，监管部门说网站也算；法国面向消费者的报价和说明必须有法语版本。hreflang 的基本写法和「别按 IP 自动跳转语言」见「域名怎么选」那篇。",
  checked: "2026-11-07",
  sections: [
    {
      id: "google",
      title: "先看 Google 怎么处理多语言页面",
      items: [
        {
          text: "hreflang 的写法：语言用 ISO 639-1 代码，地区可选，用 ISO 3166-1 两位代码，也可以加文字代码，比如 zh-Hans（简体）、zh-Hant（繁体）。写 zh-TW 时 Google 自动当作繁体；只写地区无效；不分大小写。",
          sources: [{ label: "Google：本地化版本", url: G_LOCALIZED }],
        },
        {
          text: "Google 只按页面可见的内容判断语言，不看 lang 属性和网址，也不用 hreflang 判断语言。",
          sources: [
            { label: "Google：多区域网站", url: G_MULTI },
            { label: "Google：本地化版本", url: G_LOCALIZED },
          ],
        },
        {
          text: "网址里可以用本地语言的词（必要时也可以用转写），也可以用国际化域名；要用 UTF-8，链接里的非 ASCII 字符要做百分号编码。",
          sources: [
            { label: "Google：多区域网站", url: G_MULTI },
            { label: "Google：网址结构", url: G_URL },
          ],
        },
        {
          text: "机器翻译和 AI 翻译：2024 年 3 月起的「规模化内容滥用」政策点名了通过翻译等自动转换批量生成页面、对用户价值不大的情况，不管内容是怎么生成的。2025 年 6 月 Google 删掉了「用 robots.txt 屏蔽自动翻译页」那段建议，Google 说这只是文档调整、行为没有变。这不等于放行机器翻译。",
          sources: [
            { label: "Google 垃圾内容政策", url: G_SPAM },
            { label: "Google 文档更新（2025-06-11）", url: G_UPDATE_2025 },
            { label: "Search Engine Roundtable（2025-06-12）", url: SER_2025 },
          ],
        },
        {
          text: "只翻译了界面、正文还是原文的页面，会被当成重复页。",
          sources: [{ label: "Google：本地化版本", url: G_LOCALIZED }],
        },
        {
          text: "Google 自己也会翻译搜索结果：结果语言和搜索语言不同时，可能翻译标题和摘要，点进去是机器翻译的页面；目标语言包括印尼语、越南语、韩语和英语，不包括日语、俄语和中文。不想被翻译可以加 notranslate。",
          sources: [{ label: "Google：翻译后的搜索结果", url: G_TRANSLATED }],
        },
      ],
    },
    {
      id: "us",
      title: "美国：没有要求私人网站用英语，注意日期写法",
      items: [
        {
          text: "2025 年 3 月的行政令把英语定为美国官方语言，对象是联邦机构，没提对私人企业的要求。",
          sources: [{ label: "白宫（2025-03-01）", url: US_EO }],
        },
        {
          text: "美国的短日期是「月/日/年」，英国是「日/月/年」，11/07/26 在两边读法相反；面向两地的页面最好写成 2026 年 11 月 7 日这种不会读错的格式。",
          sources: [
            { label: "Unicode CLDR 英语", url: CLDR_EN },
            { label: "Unicode CLDR 英式英语", url: CLDR_EN_GB },
          ],
        },
      ],
    },
    {
      id: "id",
      title: "印尼：称呼用户用 Anda，法律要求印尼语",
      items: [
        {
          text: "微软的印尼语风格指南称呼用户一律用 Anda（大写），语气正式；没有用 kamu 称呼用户的例子。",
          sources: [{ label: "微软印尼语风格指南", url: MS_ID }],
        },
        {
          text: "2009 年第 24 号法：涉及印尼公民的协议必须用印尼语，有外国一方时可以同时用对方语言或英语；在印尼流通的商品和服务信息必须用印尼语。字面上，和印尼用户订的服务条款也算这类协议，执法和判例没查到。消费者保护法也禁止不提供印尼语的使用说明。",
          sources: [
            { label: "2009 年第 24 号法（维基文库）", url: ID_LAW_24 },
            { label: "1999 年第 8 号法（维基文库）", url: ID_LAW_8 },
          ],
        },
      ],
    },
    {
      id: "vn",
      title: "越南：称呼用 bạn，网址带不带声调都行",
      items: [
        {
          text: "微软的越南语风格指南称呼用户用 bạn，泛指时不用带性别的称呼（ông、bà、anh、chị 等）。",
          sources: [{ label: "微软越南语风格指南", url: MS_VI }],
        },
        {
          text: "按 Google 的规则，网址里用带声调的越南语词（百分号编码）或去掉声调的转写都可以。",
          sources: [{ label: "Google：网址结构", url: G_URL }],
        },
      ],
    },
    {
      id: "jp",
      title: "日本：です・ます调，敬语别过度",
      items: [
        {
          text: "微软的日语风格指南：一般用です・ます调，菜单、按钮、标题用名词结尾；一般不用尊敬语和谦让语，但有卖方和顾客关系的地方要用（比如お問い合わせください），同时别过度客气。",
          sources: [{ label: "微软日语风格指南（2026-10-20）", url: MS_JA }],
        },
        {
          text: "主语能省就省；「あなた」要慎用，面向顾客用「お客様」。片假名用全角，英文字母和数字用半角。",
          sources: [{ label: "微软日语风格指南（2026-10-20）", url: MS_JA }],
        },
        {
          text: "日期写成 2026年11月7日，日语环境里的日元符号是全角「￥」。",
          sources: [
            { label: "Unicode CLDR 日语日期", url: CLDR_JA_DATES },
            { label: "Unicode CLDR 日语货币", url: CLDR_JA_CURRENCY },
          ],
        },
      ],
    },
    {
      id: "kr",
      title: "韩国：请求用 -세요，法律文本用 -십시오",
      items: [
        {
          text: "微软的韩语风格指南：请用户做事用「-세요」代替「-십시오」（참조하십시오 → 참조하세요），更自然；陈述句用「-습니다」；最终用户许可协议和法律文本用「-십시오」。",
          sources: [{ label: "微软韩语风格指南", url: MS_KO }],
        },
        {
          text: "同一指南建议避免不必要的正式语气、少用难懂的汉字词，动作名词后面别再加「수행」「실행」「제공」这类词（제거를 수행합니다 → 제거합니다）。",
          sources: [{ label: "微软韩语风格指南", url: MS_KO }],
        },
      ],
    },
    {
      id: "ru",
      title: "俄罗斯：2026 年 3 月起面向消费者的信息要用俄语，网站也算",
      items: [
        {
          text: "Yandex 支持写在 head 里的 hreflang，但已经不再读 Sitemap 里的语言版本；它把 hreflang 当作建议而不是指令。",
          sources: [{ label: "Yandex：语言版本", url: YANDEX_HREFLANG }],
        },
        {
          text: "Yandex：西里尔字母的网址可以用，但页面和网址要用同一种编码；用转写的网址也能让爬虫看懂页面主题。",
          sources: [{ label: "Yandex：网站结构", url: YANDEX_URLS }],
        },
        {
          text: "《消费者权益保护法》新加的第 10.1 条 2026 年 3 月 1 日起施行：在公开场所或面向不特定消费者的非广告信息要用俄语，可以另加外语，商号和商标除外。条文没写网站，但消费者权益监管局说网站也算公开场所，律所也这样解读。",
          sources: [
            { label: "第 10.1 条", url: RU_CPL_10_1 },
            { label: "ComNews（2026-02-28）", url: RU_RPN_SITES },
            { label: "Lidings 律所（2026-03-23）", url: RU_LIDINGS },
          ],
        },
        {
          text: "原来的第 8 条就要求卖家和商品信息用俄语，新条款不改它。对境外卖家是否适用、罚则是什么，没查到。",
          sources: [{ label: "Consultant（2026-03-04）", url: RU_ART_8 }],
        },
        {
          text: "微软的俄语风格指南称呼用户用 вы（例句里是小写），没有用 ты 的。",
          sources: [{ label: "微软俄语风格指南", url: MS_RU }],
        },
      ],
    },
    {
      id: "cn",
      title: "中国大陆：《国家通用语言文字法》2026 年起施行新版",
      items: [
        {
          text: "修订后的《国家通用语言文字法》2026 年 1 月 1 日施行：网络游戏、网络视听节目、招牌广告、企业名称、在境内销售的商品名称和说明等，要以国家通用语言文字为基本用语用字。点名要符合国家规范的互联网平台只有政府主办或提供社会公共服务的，普通商业网站没被点名。",
          sources: [{ label: "国家通用语言文字法（2025 年修订，维基文库）", url: CN_LANGUAGE_LAW }],
        },
        {
          text: "繁体字只在文物古迹、姓氏、书法、出版教学研究等列明的情形可以用；违法的由主管部门责令改正，拒不改正的警告或通报批评，没有罚款数额。",
          sources: [{ label: "国家通用语言文字法（2025 年修订，维基文库）", url: CN_LANGUAGE_LAW }],
        },
        {
          text: "百度不建议网址里有中文字符，容易出现识别问题；网址从 www 起总长不超过 1024 字节。",
          sources: [{ label: "百度搜索资源平台（2019-08-17）", url: BAIDU_URL }],
        },
      ],
    },
    {
      id: "zh-hant",
      title: "繁体中文：台湾和香港要分开过一遍用词",
      items: [
        {
          text: "hreflang 写 zh-TW 会被当作繁体，zh-Hant 可以做不分地区的兜底，zh-HK 按「语言加地区」的规则也有效。同一种语言有地区版本、内容相似时，Google 建议用 canonical 和 hreflang 标出来，再给不分地区的用户一个兜底版本。",
          sources: [
            { label: "Google：本地化版本", url: G_LOCALIZED },
            { label: "Google：多区域网站", url: G_MULTI },
          ],
        },
        {
          text: "用词差别，看官方网站就知道：香港微软写「軟件」、台湾写「軟體」；香港政府写「網絡」「數碼」、台湾写「網路」「數位」；香港写「空氣質素」、台湾写「空氣品質」。",
          sources: [
            { label: "微软香港", url: MS_HK_SOFTWARE },
            { label: "微软台湾", url: MS_TW_SOFTWARE },
            { label: "香港数字政策办公室", url: HK_DIGITAL_POLICY },
            { label: "台湾数位发展部", url: TW_MODA },
            { label: "香港空气质素健康指数", url: HK_AQHI },
            { label: "台湾空气品质监测网", url: TW_AIR },
          ],
        },
        {
          text: "微软的繁体中文风格指南只有台湾版：称呼一律用「您」，中文和英文字母、数字之间加半角空格。",
          sources: [{ label: "微软繁体中文风格指南", url: MS_ZH_TW }],
        },
        {
          text: "简繁自动转换：OpenCC 的配置里只有 s2twp 会换成台湾常用词，s2t、s2tw、s2hk 只转字不换词。",
          sources: [{ label: "OpenCC", url: OPENCC }],
        },
      ],
    },
    {
      id: "eu-uk",
      title: "欧洲和英国：法国必须有法语，德语选 du 还是 Sie",
      items: [
        {
          text: "法国 Toubon 法：商品和服务的名称、报价、介绍、使用说明、保修条件、发票和广告必须用法语；有译文的，法语版要同样清楚。法国文化部说，在网站和电商平台上卖给法国的也适用。",
          sources: [
            { label: "Toubon 法（Légifrance）", url: FR_TOUBON },
            { label: "法国文化部", url: FR_CULTURE },
          ],
        },
        {
          text: "罚款按每次违规计：个人 750 欧元、公司 3,750 欧元，可以乘以违规次数；企业之间的发票和订单不强制法语。",
          sources: [{ label: "Simon Associés 律所（2024-06）", url: FR_FINES }],
        },
        {
          text: "德语称呼：微软对成年用户用 Sie、对 18 岁以下用 du；苹果德国官网用 du。选一种，全站统一。",
          sources: [
            { label: "微软德语风格指南（2026-04-15）", url: MS_DE },
            { label: "苹果德国官网", url: APPLE_DE },
          ],
        },
        {
          text: "比利时：hreflang 写 de-BE、nl-BE、fr-BE；单写 be 是白俄罗斯语。",
          sources: [{ label: "Google：本地化版本", url: G_LOCALIZED }],
        },
        {
          text: "英式英语：Favourite、Centre、Optimise，Mobile phone 而不是 Cell phone；句末标点放在引号外面。",
          sources: [{ label: "微软英式英语风格指南", url: MS_EN_GB }],
        },
      ],
    },
  ],
  pitfalls: [
    {
      text: "把简体一键转成繁体当台湾版：字转了词没换，台湾用户一眼看出是大陆站；香港版也要另过一遍词表。",
      sources: [{ label: "OpenCC", url: OPENCC }],
    },
    {
      text: "hreflang 只放在 Sitemap 里：Google 认，Yandex 已经不读，要放在 head 里；只写地区代码无效，单写 be 是白俄罗斯语。",
      sources: [
        { label: "Yandex：语言版本", url: YANDEX_HREFLANG },
        { label: "Google：本地化版本", url: G_LOCALIZED },
      ],
    },
    {
      text: "以为 Google 删了「屏蔽自动翻译页」就是放行机器翻译：规模化内容滥用仍点名翻译；只翻界面不翻正文还会被当成重复页。",
      sources: [{ label: "Google 垃圾内容政策", url: G_SPAM }],
    },
    {
      text: "面向俄罗斯消费者只放英文页：2026 年 3 月起监管部门认定网站也要有俄语。",
      sources: [{ label: "ComNews（2026-02-28）", url: RU_RPN_SITES }],
    },
    {
      text: "面向法国消费者的报价、说明和发票没有法语：罚款按每次违规累计。",
      sources: [{ label: "Simon Associés 律所", url: FR_FINES }],
    },
    {
      text: "照搬英文的语气：日语过度用敬语、乱用「あなた」，韩语请求句用「-십시오」，德语 du 和 Sie 混用。",
      sources: [
        { label: "微软日语风格指南", url: MS_JA },
        { label: "微软韩语风格指南", url: MS_KO },
      ],
    },
  ],
  unknowns: [
    "Naver 和百度对 hreflang 的官方说法。",
    "越南《消费者权益保护法》对越南语的条款原文，印尼 2019 年第 63 号总统条例原文。",
    "俄罗斯第 10.1 条的罚则，以及对境外卖家和境外网站是否适用。",
    "比利时、瑞士、加拿大魁北克的语言法原文。",
    "日本、韩国有没有要求私人网站用本国语言的法律：没查到，但没能拿法条做否定确认。",
    "美国加州民法典第 1632 条（用西班牙语、中文、越南语等谈判的特定合同要给译本）的原文。",
  ],
  related: [
    { label: "域名怎么选（hreflang 和语言跳转）", path: "/domains" },
    { label: "先讨好哪个搜索引擎", path: "/search-engines" },
    { label: "上线前必备的合规页面", path: "/compliance" },
  ],
};
