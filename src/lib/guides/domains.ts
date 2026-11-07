import type { Guide } from "../go-global-guides";

// 出海站域名怎么选，按市场整理：只写搜索引擎、注册局和政府自己的规定，加上 Spamhaus、Interisle 的公开报告。
// 价格是 2026-11 注册商页面上的约数。调研笔记在 ~/出海/research/2026-11-by-market/01–03（不在仓库里）。
const GOOGLE_INTL = "https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites";
const GOOGLE_NEW_TLD = "https://developers.google.com/search/blog/2015/07/googles-handling-of-new-top-level";
const SPAMHAUS = "https://www.spamhaus.org/resource-hub/domain-reputation/domain-reputation-update-april-september-2026/";
const INTERISLE = "https://interisle.net/insights/cybercrimesupplychain2026";
const JPRS_SPEC = "https://jprs.jp/about/jp-dom/spec/";
const JPRS_RULE = "https://jprs.jp/doc/rule/rule-wideusejp.html";
const KISA_RULE = "https://xn--3e0bx5euxnjje69i70af08bea817g.xn--3e0b707e/jsp/infoboard/law/domManRule.jsp";
const CNNIC_RULE = "https://www.cnnic.cn/n4/2022/0817/c93-335.html";
const PANDI_V9 = "https://pandi.id/public/files/2024/10/kebijakan-pendaftaran-nama-domain-versi-9-0-bilingual-new-1729151599.pdf";
const VNNIC_GUIDE = "https://vnnic.vn/vi/ten-mien-vn/danh-cho-chu-the/dang-ky-ten-mien/huong-dan-dang-ky-ten-mien";
const RU_LAW = "http://kremlin.ru/acts/bank/52785";
const RU_FAQ = "https://cctld.ru/help/faq/";
const YANDEX_REGION = "https://yandex.com/support/webmaster/en/site-geography/site-region.html";
const EURID = "https://eurid.eu/en/news/what-to-know-before-registering-a-eu-domain-name/";
const AFNIC = "https://www.afnic.fr/wp-media/uploads/2026/07/afnic-naming-policy-2026-07-06.pdf";
const DENIC_TERMS = "https://www.denic.de/en/domain-terms-and-conditions/";
const US_NEXUS = "https://www.about.us/documents/policies/usTLD_Nexus_Requirements_Policy.pdf";
const SEZNAM = "https://o-seznam.cz/napoveda/vyhledavani/optimalizace/";

export const DOMAINS: Guide = {
  slug: "domains",
  short: "域名怎么选",
  title: "出海站域名怎么选：.com 还是国家后缀，各国谁能注册、要什么材料",
  description:
    "按市场整理出海站的域名选择：Google 怎么看国家后缀和 .ai、.io 这类当通用用的后缀，美国、印尼、越南、日本、韩国、俄罗斯、中国、欧洲和英国的后缀谁能注册、要什么材料、大概多少钱，以及便宜新后缀在收录和邮件上的风险。",
  intro:
    "先想清楚卖给哪个国家，再定域名。一个 .com 加子目录可以覆盖多数市场；国家后缀是很强的本地信号，但日本、韩国要本地地址，俄罗斯从 2026 年 9 月起要用俄罗斯政务账号实名，.eu、.fr 只给欧洲主体。下面按市场列出搜索引擎和各国注册局自己的规定。",
  checked: "2026-11-07",
  sections: [
    {
      id: "structure",
      title: "先定结构：一国一个后缀，还是一个 .com 管全球",
      lead: "Google 官方列了四种网址结构，各有取舍。",
      items: [
        {
          text: "国家后缀（example.de）是很强的国家信号，服务器放在哪都行；但贵、好名字可能被占、要多套设施，有的国家限制谁能注册，而且一个域名只能对准一个国家。",
          sources: [{ label: "Google 多区域网站", url: GOOGLE_INTL }],
        },
        {
          text: "子域名（de.example.com）好搭，但用户从网址看不出 de 指语言还是国家；子目录（example.com/de/）放在同一台主机上最省事，缺点是网址看不出地区；URL 参数（?loc=de）Google 明确不推荐。",
          sources: [{ label: "Google 多区域网站", url: GOOGLE_INTL }],
        },
        {
          text: "不管用哪种，都用 hreflang 标出各语言、各国家的版本。Search Console 的「国际定位」报告 2022 年 9 月已经停用，不能再手动给 .com 指定国家。",
          sources: [
            { label: "Google 多区域网站", url: GOOGLE_INTL },
            { label: "国际定位报告停用", url: "https://support.google.com/webmasters/answer/12474899" },
          ],
        },
        {
          text: "服务器在哪个国家，Google 只当参考；它也不读 geo.position 这类地理标签。Google 的爬虫多从美国抓取，所以别按访客 IP 自动跳到别的语言版本。",
          sources: [{ label: "Google 多区域网站", url: GOOGLE_INTL }],
        },
        {
          text: "社群经验：后缀对排名基本中立，影响的是信任感和点击习惯；国家后缀在本地搜索里有加权。",
          sources: [{ label: "Niko 的帖子（2025-10-03）", url: "https://x.com/guishou_56/status/1973971390220153221" }],
        },
      ],
    },
    {
      id: "generic-cctld",
      title: "看着像国家后缀，其实是通用的：.ai、.io、.co、.me、.tv",
      lead: "这几个在 Google 眼里不带国家定位，可以当 .com 用；但它们归某个国家或地区的政府管，各有风险。",
      items: [
        {
          text: "Google 当作通用域名处理的国家后缀：.ad .ai .as .bz .cc .cd .co .dj .fm .io .la .me .ms .nu .sc .sr .su .tv .tk .ws（名单会变）。用 .ai、.io 不会让你只在安圭拉或英属印度洋领地有排名。",
          sources: [{ label: "Google 多区域网站", url: GOOGLE_INTL }],
        },
        {
          text: ".eu、.asia，.app、.dev、.shop、.top、.xyz 这类新后缀，还有 .london、.berlin 这样的城市后缀，Google 都按通用域名处理；后缀里带关键词既不加分也不减分。",
          sources: [
            { label: "Google 多区域网站", url: GOOGLE_INTL },
            { label: "Google 谈新后缀（2015）", url: GOOGLE_NEW_TLD },
          ],
        },
        {
          text: ".app、.dev 在浏览器的 HSTS 预加载名单里，网站必须上 HTTPS。",
          sources: [
            { label: ".app", url: "https://get.app/" },
            { label: ".dev", url: "https://get.dev/" },
          ],
        },
        {
          text: ".io：英国和毛里求斯 2025-05-22 签了查戈斯群岛主权条约，到 2026 年 10 月还没生效。ICANN 说如果 IO 这个国家代码以后被删除，.io 有 5 年过渡期，特定情况下可以延长；注册局表示会继续支持 .io。",
          sources: [
            { label: "英国议会法案进度", url: "https://bills.parliament.uk/bills/4004" },
            { label: "半岛电视台（2026-10-02）", url: "https://www.aljazeera.com/news/2026/10/2/uk-mauritius-chagos-sovereignty-deal-stalls-amid-fears-of-further-delays" },
            { label: "ICANN 说明", url: "https://www.icann.org/en/blogs/details/the-chagos-archipelago-and-the-io-domain-14-11-2024-en" },
            { label: "The Register", url: "https://www.theregister.com/2024/10/10/io_domain_uk_mauritius/" },
          ],
        },
        {
          text: ".ai：由安圭拉政府管理，官方 FAQ 写明政府可以停用、注销或转移域名（比如出现滥用时）；注册和续费最少 2 年，Porkbun 标价每年 82.70 美元。",
          sources: [
            { label: ".ai 官方 FAQ", url: "https://www.nic.ai/faq" },
            { label: "Porkbun 价格", url: "https://porkbun.com/tld/ai" },
          ],
        },
        {
          text: ".co：由哥伦比亚管理，任何人都能注册；在 Spamhaus 2026 年 4–9 月的国家后缀滥用排名里排第 6，比上一期多了 221%。",
          sources: [
            { label: "IANA", url: "https://www.iana.org/domains/root/db/co.html" },
            { label: "Spamhaus", url: SPAMHAUS },
          ],
        },
      ],
    },
    {
      id: "cheap-tlds",
      title: "便宜的新后缀：排名不吃亏，收录、邮件和外链会受影响",
      lead: "Google 官方没说哪个后缀减分，但 Google 的 John Mueller 多次提醒：别挑被垃圾站占满的后缀。",
      items: [
        {
          text: "Spamhaus 2026 年 4–9 月：被列为恶意或可疑的域名数，.com 第 1（72.4 万），.top 第 2（62.8 万，比上一期多 132%），.cn 第 3（46.5 万），.shop 第 7，.xyz 第 8，.icu 第 9。按比例算，.icu 有 9.03%、.top 有 4.99% 被列入；Spamhaus 认为超过 5% 就是危险信号。",
          sources: [{ label: "Spamhaus", url: SPAMHAUS }],
        },
        {
          text: "Interisle 2026 年报告：犯罪域名数 .top 第 2（360 万），.cn 第 3；新 gTLD 只占全部注册量的 15%，却占犯罪域名的 43%。",
          sources: [{ label: "Interisle", url: INTERISLE }],
        },
        {
          text: "Mueller 2025 年 9 月说，他会避开免费、便宜、滥用处理差的后缀：这类域名可能抓取和收录更慢，发信受影响，还可能被别人整个后缀批量拒绝外链。",
          sources: [
            { label: "Domain Name Wire（2025-09-08）", url: "https://domainnamewire.com/2025/09/08/google-reiterates-spammy-top-level-domain-advice/" },
            { label: "Search Engine Roundtable（2023）", url: "https://www.seroundtable.com/google-seo-cheap-tlds-spam-35498.html" },
          ],
        },
        {
          text: "邮件：常用的 SpamAssassin 规则会给 .top、.xyz、.icu、.online 等后缀的发件地址加分，正文里有这些后缀的链接再加 2 分；Microsoft 365 管理员写一条规则就能屏蔽整个后缀的来信。",
          sources: [
            { label: "SpamAssassin 规则", url: "https://github.com/apache/spamassassin/blob/trunk/rulesrc/sandbox/pds/20_ntld.cf" },
            { label: "Microsoft 365", url: "https://learn.microsoft.com/en-us/defender-office-365/tenant-allow-block-list-email-spoof-configure" },
          ],
        },
      ],
    },
    {
      id: "us",
      title: "美国：.com 优先",
      lead: ".com 没有注册门槛；.us 要和美国有关联，而且不能隐藏注册人信息。",
      items: [
        {
          text: ".com、.net 个人和公司都能注册。.com 批发价 2026-11-01 起从 10.26 美元涨到 10.97 美元；按 2024 年续签的协议，之后六年里最多有四年可以各涨 7%。",
          sources: [
            { label: "Verisign", url: "https://www.verisign.com/resources/become-a-registrar/" },
            { label: "Verisign 财报", url: "https://www.sec.gov/Archives/edgar/data/0001014473/000101447326000019/q12026earningsrelease.htm" },
            { label: "NTIA", url: "https://www.ntia.gov/blog/2024/com-cooperative-agreement-ensuring-internet-stability-and-security" },
          ],
        },
        {
          text: ".us 要满足三类关联之一：美国公民或主要住所在美国的个人，在美国成立的实体，在美国有实际经营的外国实体。不合格的冻结 30 天，没改正就取消、不退费。",
          sources: [{ label: ".us 关联要求", url: US_NEXUS }],
        },
        {
          text: "外国人在美国注册的公司（比如一人 LLC）按政策文本属于第二类，政策没限制股东国籍；注册局没有专门答复过这种情况。",
          sources: [{ label: ".us 关联要求", url: US_NEXUS }],
        },
        {
          text: ".us 不允许隐私保护或代理注册，注册人的姓名和地址谁都能查到。",
          sources: [{ label: ".us 隐私政策", url: "https://about.us/policies/us-privacy-services-policy" }],
        },
      ],
    },
    {
      id: "id-vn",
      title: "印尼、越南：用 .com 就行，要本地后缀也能直接注册",
      lead: "这两国 Google 都占九成以上。.id 和 .vn 外国人都能注册，.co.id 不行。",
      items: [
        {
          text: ".id：印尼域名注册局 PANDI 2024 年 9 月的规则写明个人、外国人和法人都能注册，证件可以用任何国家的护照；所有域名都要验证邮箱。",
          sources: [{ label: "PANDI 规则 v9.0", url: PANDI_V9 }],
        },
        {
          text: ".co.id 只给在印尼运营的实体，要印尼的营业登记号（NIB）。有注册商提供代持，但 PANDI 2025 年 5 月的提案打算要求境外实体 6 个月内合规，否则不能续费。",
          sources: [
            { label: "PANDI 规则 v9.0", url: PANDI_V9 },
            { label: "PANDI 2025 提案", url: "https://pandi.id/public/files/2025/5/rumusan-usulan-pengembangan-kebijakan-layanan-proxy-nama-domain-hasil-rapat-pleno-fms-1746966280.pdf" },
            { label: "Gandi", url: "https://www.gandi.net/en/tlds/id" },
          ],
        },
        {
          text: "印尼价格参考：Rumahweb 的 .id 每年 21.9 万印尼盾，.co.id 每年 30 万印尼盾。",
          sources: [{ label: "Rumahweb", url: "https://www.rumahweb.com/domain-murah/" }],
        },
        {
          text: ".vn：境内外的个人和机构都能注册，地址在越南以外的可以找境外注册商。2024-12-25 起施行的第 147 号法令要求填身份证或护照号，信息不准、认不出注册人的先暂停，30 天内没补正可以收回。",
          sources: [
            { label: "VNNIC", url: VNNIC_GUIDE },
            { label: "第 147 号法令", url: "https://www.vnnic.vn/index.php/vi/van-ban-so-lieu/van-ban-qppl/nghi-dinh-so-1472024nd-cp-ngay-09112024-ve-quan-ly-cung-cap-su-dung" },
            { label: "暂停规定", url: "https://tapchicongthuong.vn/4-truong-hop-tam-ngung-hoat-dong-cua-ten-mien---vn--tu-ngay-25-12-2024-129687.htm" },
          ],
        },
        {
          text: ".vn 官方收费：首年登记费 10 万越南盾，年费 35 万越南盾；境外注册商贵得多，101domain 首年约 169 美元，续费也要重新交身份材料。",
          sources: [
            { label: "收费标准", url: "https://luatvietan.vn/quy-dinh-ve-phi-le-phi-su-dung-ten-mien-theo-thong-tu-10-2025-tt-btc.html" },
            { label: "101domain", url: "https://www.101domain.com/vn.htm" },
          ],
        },
        {
          text: "越南本地搜索引擎 Cốc Cốc 优先抓越南语网站和 .vn 域名；它没有站长后台，只有一个手动提交网址的表单。",
          sources: [{ label: "Cốc Cốc", url: "https://coccoc.com/search/console/get-your-website-on-coc-coc-search" }],
        },
      ],
    },
    {
      id: "japan",
      title: "日本：.jp 要日本地址，没有就用 .com",
      items: [
        {
          text: "日本域名注册局 JPRS 的规则要求注册人本身有日本地址或营业场所。JPRS 可以要求补交登记证明；查不到资格、寄去的文件被退回，登记就终止。",
          sources: [
            { label: "JPRS 规则", url: JPRS_RULE },
            { label: "JPRS 说明", url: JPRS_SPEC },
          ],
        },
        {
          text: ".co.jp 只给在日本登记的公司（包括在日本登记的外国公司），原则上一家一个。",
          sources: [{ label: "JPRS 说明", url: JPRS_SPEC }],
        },
        {
          text: "有注册商提供代持，但 JPRS 的规则和 FAQ 都没提这种做法；101domain 的 .co.jp 代持不能改 DNS，只能转发网址，等于没法用来建站。",
          sources: [
            { label: "JPRS 规则", url: JPRS_RULE },
            { label: "101domain", url: "https://www.101domain.com/co_jp.htm" },
          ],
        },
        {
          text: "日本价格参考：ムームードメイン的 .jp 首年 990 日元，续费 3,344 日元。",
          sources: [{ label: "ムームードメイン", url: "https://muumuu-domain.com/domain/price" }],
        },
        {
          text: "Yahoo! JAPAN 2010 年宣布搜索结果改用 Google；日本电脑端用 Bing 的人很多，见「先讨好哪个搜索引擎」那篇。",
          sources: [{ label: "2010 年报道", url: "https://internet.watch.impress.co.jp/docs/news/383638.html" }],
        },
      ],
    },
    {
      id: "korea",
      title: "韩国：.kr 要韩国地址",
      items: [
        {
          text: "韩国互联网振兴院（KISA）的准则写明申请人和注册人都要有韩国地址；.co.kr 给法人或个人。",
          sources: [{ label: "KISA 准则", url: KISA_RULE }],
        },
        {
          text: "境外注册人只能靠注册商代持：GoDaddy 免费提供，101domain 等也有；KISA 准则没提代持。",
          sources: [{ label: "GoDaddy", url: "https://www.godaddy.com/en/help/about-kr-domains-19996" }],
        },
        {
          text: "2025 年 3 月开放的 ai.kr、io.kr、it.kr、me.kr 同样只给有韩国地址的人，每年约 2 万韩元。",
          sources: [{ label: "KISA", url: "https://www.kisa.or.kr/402/form?postSeq=2468&page=1" }],
        },
        {
          text: "Naver 建议用用户熟悉的后缀，例子是 .com、.net、.co.kr、.kr、.io；要用独立域名，不要用主机商送的子域名。",
          sources: [{ label: "Naver Search Advisor", url: "https://searchadvisor.naver.com/guide/seo-advanced-url" }],
        },
        {
          text: "韩国价格参考：101domain 的 .kr 首年 52.49 美元，.co.kr 首年 47.49 美元。",
          sources: [{ label: "101domain", url: "https://www.101domain.com/co_kr.htm" }],
        },
      ],
    },
    {
      id: "russia",
      title: "俄罗斯：2026 年 9 月起，.ru 要用俄罗斯政务账号实名",
      lead: "没有俄罗斯身份或机构的外国人，现在基本注册不了、也续不了 .ru；做俄罗斯用户，用 .com 加 Yandex 的地区设置更现实。",
      items: [
        {
          text: "第 569-FZ 号联邦法：2026-09-01 起，注册 .ru、.рф、.su 要先通过俄罗斯政务服务门户（Gosuslugi）做身份识别；注册商也只能是名录里的俄罗斯法人。",
          sources: [
            { label: "法律原文", url: RU_LAW },
            { label: "注册局公告", url: "https://cctld.ru/media/news/kc/40971/" },
          ],
        },
        {
          text: "外国个人要有俄罗斯居留或劳务许可，外加已确认的政务账户；外国公司要有在俄分支或代表处。都没有的，注册局给的出路是把管理权转给在俄的个人或机构，或者换别的后缀。",
          sources: [{ label: "注册局 FAQ", url: RU_FAQ }],
        },
        {
          text: "已有的域名：9 月以后续费、换注册商都要先识别；不识别能用到本期到期，之后停止解析，宽限期过后被注销。对未识别者的限制，过渡期最晚到 2027-01-18。",
          sources: [
            { label: "注册局 FAQ", url: RU_FAQ },
            { label: "Tproger（2026-09-01）", url: "https://tproger.ru/news/vstupil-v-silu-zakon-ob-identifikacii-vladelcev-domenov-ru-r" },
          ],
        },
        {
          text: "Reg.ru、RU-CENTER 推出了给非居民的代持，由俄罗斯公司做名义持有人；报道的价格是首年 1.05 万卢布，续费每年 1.45 万卢布。",
          sources: [
            { label: "ComNews", url: "https://www.comnews.ru/content/247495/2026-09-22/2026-w39/1010/zona-rf-vyshla-lidery-tempam-identifikacii-administratorov-cherez-gosuslugi" },
            { label: "Name.am", url: "https://name.am/articles/ru-domains-discontinued" },
          ],
        },
        {
          text: "2025 年 12 月，注册商应俄罗斯通信监管局要求，没有法院判决就停用了 moscowtimes.ru 等域名。",
          sources: [{ label: "The Moscow Times", url: "https://www.themoscowtimes.com/2025/12/17/roskomnadzor-seizes-domains-including-moscowtimesru-without-court-order-a91464" }],
        },
        {
          text: "Yandex 不会自动给 .com 网站分配地区：在 Yandex Webmaster 里手动设成俄罗斯或某个城市（要附联系方式页面，人工审核几天到几周），或者通过 Yandex Business。Yandex 支持 hreflang。",
          sources: [
            { label: "Yandex 网站地区", url: YANDEX_REGION },
            { label: "Yandex hreflang", url: "https://yandex.com/support/webmaster/en/yandex-indexing/locale-pages.md" },
          ],
        },
      ],
    },
    {
      id: "china",
      title: "中国：.cn 外国人也能注册，服务器放在大陆要先备案",
      items: [
        {
          text: "CNNIC 的实施细则写明自然人、法人和其他组织都能注册 .cn，没有限定在境内；所有 .cn 都要实名，境外机构交本国的商业登记证明。",
          sources: [
            { label: "CNNIC 实施细则", url: CNNIC_RULE },
            { label: "阿里云国际站实名说明", url: "https://www.alibabacloud.com/help/en/dws/user-guide/real-name-verification-for-cn-domain-names" },
          ],
        },
        {
          text: "2022 年起，没实名的 .cn 不能注册、续费、转移，还可能被暂停解析。",
          sources: [
            { label: "Gandi 公告", url: "https://news.gandi.net/?p=98120" },
            { label: "阿里云", url: "https://help.aliyun.com/knowledge_detail/35810.html" },
          ],
        },
        {
          text: "网站放在大陆的服务器上要先做 ICP 备案，未经备案不得提供服务；企业备案要有大陆注册的实体。只有域名解析到大陆服务器才需要备案。",
          sources: [
            { label: "工信部备案办法", url: "https://www.miit.gov.cn/gyhxxhb/jgsj/cyzcyfgs/bmgz/xxtxl/art/2024/art_84a0cfa0ebd049bbbe751dca9a008e56.html" },
            { label: "阿里云备案说明", url: "https://www.alibabacloud.com/en/icp" },
          ],
        },
        {
          text: "百度 2017 年的官方说法：中文网站不建议用国外服务器，服务器在国外的中文网站在百度搜索里会出现展示问题。之后没找到更新的说法。",
          sources: [
            { label: "百度公告", url: "https://ziyuan.baidu.com/wiki/1586" },
            { label: "百度说明", url: "https://ziyuan.baidu.com/college/articleinfo?id=1585" },
          ],
        },
      ],
    },
    {
      id: "europe",
      title: "欧洲、英国：.eu、.fr 只给欧洲主体，.uk、.de 谁都能注册",
      items: [
        {
          text: ".eu 给欧盟、冰岛、列支敦士登、挪威的公民（住在哪都行）、居民，以及在这些国家设立的机构。英国脱欧以后，英国公司要有欧盟或欧洲经济区的实体才合格，2022 年约 4.8 万个英国注册人的 .eu 被收回。",
          sources: [
            { label: "EURid", url: EURID },
            { label: "EURid 脱欧公告", url: "https://eurid.eu/en/news/the-brexit-related-domain-names-are-released-today/" },
          ],
        },
        {
          text: ".fr 要住在欧盟、冰岛、列支敦士登、挪威或瑞士，机构要在这些地方注册或主要营业。",
          sources: [{ label: "AFNIC 命名政策", url: AFNIC }],
        },
        {
          text: ".uk 和 .co.uk 任何人都能注册，没有英国地址要求；注册局 Nominet 会用第三方数据核对姓名和地址，核对不了可能被暂停。",
          sources: [
            { label: "Nominet 注册规则", url: "https://media.nominet.uk/wp-content/uploads/2018/05/22141819/dotUK-Rules-of-Registration.pdf" },
            { label: "Nominet 数据核对", url: "https://registrars.nominet.uk/uk-namespace/data-quality-policy/how-does-nominet-validate-data/" },
          ],
        },
        {
          text: ".de 注册时不需要德国地址；但持有人不住在德国的，一旦注册局 DENIC 提出要求，要在两周内指定德国境内的送达代理人，否则可能被解约。",
          sources: [{ label: "DENIC 条款", url: DENIC_TERMS }],
        },
        {
          text: ".cz 任何人都能注册；欧盟以外的持有人要按要求提供欧盟境内的联系地址，持有人电话 2026 年起改为必填。捷克的 Seznam 对所有后缀一视同仁，面向捷克用户大概率选 .cz。",
          sources: [
            { label: "CZ.NIC 联系人核验", url: "https://fred.nic.cz/documentation/html/Features/General/ContactVerification.html" },
            { label: "Lupa.cz", url: "https://www.lupa.cz/aktuality/pri-registraci-domeny-s-koncovkou-cz-bude-nyni-nutne-uvest-telefonni-cislo/" },
            { label: "Seznam", url: SEZNAM },
          ],
        },
        {
          text: "注册信息公开：.de 从 2025-12-06 起公开法人持有人的姓名、地址、邮箱和电话，个人不公开；.eu、.uk、.fr 的个人注册人默认都不公开。",
          sources: [
            { label: "DENIC", url: "https://blog.denic.de/en/new-legislation-what-is-changing-for-users-of-denics-whois-lookup/" },
            { label: "EURid", url: "https://eurid.eu/en/gdpr/" },
            { label: "Nominet", url: "https://registrars.nominet.uk/uk-namespace/registration-and-domain-management/query-tools/whois/whois-basic-instructions/" },
          ],
        },
      ],
    },
  ],
  pitfalls: [
    {
      text: "以为 .ai、.io、.co 能帮你在某个国家排名：Google 把它们当通用域名。",
      sources: [{ label: "Google 多区域网站", url: GOOGLE_INTL }],
    },
    {
      text: "主站用 .top、.xyz 这类便宜后缀，又用同一个域名发邮件：发件地址和正文链接都会被垃圾邮件规则加分。",
      sources: [{ label: "SpamAssassin 规则", url: "https://github.com/apache/spamassassin/blob/trunk/rulesrc/sandbox/pds/20_ntld.cf" }],
    },
    {
      text: "注册 .us 时以为能隐藏注册信息：.us 不允许隐私保护。",
      sources: [{ label: ".us 隐私政策", url: "https://about.us/policies/us-privacy-services-policy" }],
    },
    {
      text: "用英国公司注册 .eu、.fr：不合格，会被暂停和收回。",
      sources: [
        { label: "EURid", url: EURID },
        { label: "AFNIC", url: AFNIC },
      ],
    },
    {
      text: "日韩后缀走注册商代持：名义上的注册人是注册商，注册局的规则里没有这种做法；.co.jp 的代持还不能改 DNS。",
      sources: [{ label: "101domain .co.jp", url: "https://www.101domain.com/co_jp.htm" }],
    },
    {
      text: "2026 年 9 月以后忘了 .ru 续费要实名：到期后停止解析，宽限期过后别人就能注册。",
      sources: [{ label: "注册局 FAQ", url: RU_FAQ }],
    },
    {
      text: "按访客 IP 自动跳转语言版本：Google 的爬虫多从美国抓取，别的语言版本可能收录不了。",
      sources: [{ label: "Google 多区域网站", url: GOOGLE_INTL }],
    },
  ],
  unknowns: [
    "Yandex 会不会自动把 .ru、.рф 网站归到俄罗斯，官方没写。",
    "Bing 后台的地区定位入口 2026 年还在不在（只看到接口文档），以及 Bing 对 hreflang 的最新说法（找到的最新是 2020 年）。",
    "百度对备案和收录的关系、.cn 和 .com 的差别，2017 年以后没有新的官方说法。",
    "Naver 对放在海外服务器上的 .com 网站是否正常收录，官方没写。",
    "日本 JPRS、韩国 KISA 是否认可注册商代持，规则里都没提。",
    "Yahoo! JAPAN 现在是否仍用 Google 的结果，只找到 2010 年的公告。",
    "印尼 PANDI 2025 年 5 月的代持新规是否已经生效。",
    "俄罗斯是否每年都要重新实名，以及 2027-01-18 之后怎么执行。",
    "外国人持有的美国公司能不能注册 .us，注册局没有明文答复。",
  ],
  related: [
    { label: "先讨好哪个搜索引擎", path: "/search-engines" },
    { label: "站长后台和收录提交", path: "/indexing" },
    { label: "个人还是公司，怎么开户", path: "/open-account" },
    { label: "国内、英国、美国三家公司怎么分工", path: "/company-roles" },
  ],
};
