import type { Guide } from "../go-global-guides";

// 服务器放哪、当地用户能不能打开，按市场整理：只写云厂商和 CDN 的官方文档、监管机构、法律数据库，以及有方法说明的测量（OONI、GreatFire）。
// 中国大陆那条 Globalping 测量是我们自己 2026-09-17 测的，样本小。调研笔记在 ~/出海/research/2026-11-by-market/09（不在仓库里）。
const CF_ROUTING = "https://developers.cloudflare.com/support/troubleshooting/general-troubleshooting/geographic-traffic-routing/";
const CF_HN = "https://news.ycombinator.com/item?id=45042460";
const CF_NETWORK = "https://www.cloudflare.com/network/";
const VERCEL_REGIONS = "https://vercel.com/docs/regions";
const VERCEL_FN_REGION = "https://vercel.com/docs/functions/configuring-functions/region";
const NETLIFY_FN = "https://docs.netlify.com/functions/optional-configuration/";
const CLOUDFRONT_PRICE = "https://aws.amazon.com/cloudfront/pricing/pay-as-you-go/";
const CLOUDFRONT_FEATURES = "https://aws.amazon.com/cloudfront/features/";
const FASTLY_MAP = "https://www.fastly.com/network-map/";
const DOJ_DATA = "https://www.justice.gov/nsd/data-security";
const ID_BLOCK_2025 = "https://www.hukumonline.com/berita/a/komdigi-blokir-ebay-hingga-maskapai-klm-lt68626c8177d07?page=all";
const OONI_ID = "https://ooni.org/post/indonesia-internet-censorship/";
const OONI_ID_REDDIT =
  "https://api.ooni.io/api/v1/aggregation?probe_cc=ID&test_name=web_connectivity&domain=www.reddit.com&since=2026-08-01&until=2026-11-01";
const DLA_ID_TRANSFER = "https://www.dlapiperdataprotection.com/?t=transfer&c=ID";
const VN_CABLES = "https://english.vov.vn/en/society/four-undersea-cables-hit-faults-vietnams-international-internet-slows-locally-post1328208.vov";
const VN_CABLES_WMEDIA = "https://w.media/four-out-of-six-subsea-cables-in-vietnam-out-of-service/";
const VN_DECREE_53 = "https://www.tilleke.com/insights/decree-53-provides-long-awaited-guidance-on-implementation-of-vietnams-cybersecurity-law/";
const DLA_VN_TRANSFER = "https://www.dlapiperdataprotection.com/?t=transfer&c=VN";
const PPC_OVERSEAS_SERVER = "https://www.ppc.go.jp/all_faq_index/faq1-q12-3/";
const ISOC_KR = "https://www.internetsociety.org/resources/doc/2022/south-koreas-interconnection-rules/";
const TWITCH_KR = "https://blog.twitch.tv/en/2023/12/05/an-update-on-twitch-in-korea/";
const KR_GOOGLE_MAPS =
  "https://www.cp24.com/news/world/2026/02/27/south-korea-allows-google-to-export-map-data-after-years-of-frustration-over-google-maps";
const KR_PIPA_28_8 = "https://prighter.com/resources/laws/korean-pipa/main/articles/article-28-8";
const CF_RUSSIA = "https://blog.cloudflare.com/russian-internet-users-are-unable-to-access-the-open-internet/";
const RU_ECH =
  "https://meduza.io/en/news/2024/11/08/russia-s-internet-censor-demands-a-break-from-cloudflare-after-the-american-company-enabled-new-privacy-tools-last-month";
const CF_ECH = "https://developers.cloudflare.com/ssl/edge-certificates/ech/";
const RU_WHITELIST =
  "https://meduza.io/en/news/2026/08/05/kommersant-only-one-third-of-mobile-internet-traffic-in-central-russia-was-unrestricted-nearly-90-in-border-regions-went-through-whitelists";
const RU_YOUTUBE = "https://www.themoscowtimes.com/2026/02/12/whatsapp-accuses-russian-government-of-trying-to-fully-block-platform-a91928";
const OONI_RU_YOUTUBE =
  "https://api.ooni.io/api/v1/aggregation?probe_cc=RU&test_name=web_connectivity&domain=www.youtube.com&since=2026-08-01&until=2026-11-01";
const TILDA_RU = "https://tilda.cc/ru/answers/a/rkn-block/";
const RU_LOCALISATION = "https://b1.ru/en/insights/law-messenger/localization-of-personal-data-of-russian-citizens-6-march-2025/";
const GLOBALPING = "https://globalping.io/";
const GF_VERCEL = "https://en.greatfire.org/vercel.app";
const VERCEL_CN = "https://vercel.com/kb/guide/accessing-vercel-hosted-sites-from-mainland-china";
const GF_NETLIFY = "https://en.greatfire.org/netlify.app";
const GF_PAGES = "https://en.greatfire.org/pages.dev";
const GF_GITHUB = "https://en.greatfire.org/github.io";
const GF_GOOGLE = "https://en.greatfire.org/https/www.google.com";
const RECAPTCHA_FAQ = "https://developers.google.com/recaptcha/docs/faq";
const GF_GTM = "https://en.greatfire.org/https/www.googletagmanager.com";
const GF_GA4 = "https://en.greatfire.org/https/region1.google-analytics.com";
const GF_FONTS = "https://en.greatfire.org/fonts.googleapis.com";
const GF_YOUTUBE = "https://en.greatfire.org/https/www.youtube.com";
const JSDELIVR_ICP = "https://github.com/jsdelivr/jsdelivr/issues/18348";
const GF_JSDELIVR = "https://en.greatfire.org/https/cdn.jsdelivr.net";
const GF_STRIPE = "https://en.greatfire.org/https/js.stripe.com";
const CF_CHINA_FAQ = "https://developers.cloudflare.com/china-network/faq/";
const CF_CHINA = "https://developers.cloudflare.com/china-network/";
const CN_PIPL = "http://www.cac.gov.cn/2021-08/20/c_1631050028355286.htm";
const VERCEL_HKG_OPENAI = "https://vercel.com/changelog/openai-will-not-support-the-hong-kong-region-hkg1-for-functions";
const OONI_LALIGA = "https://ooni.org/post/2026-laliga-collateral/";
const EU_LATOMBE = "https://curia.europa.eu/jcms/upload/docs/application/pdf/2025-09/cp250106en.pdf";
const EU_LATOMBE_APPEAL =
  "https://digitalpolicyalert.org/event/35459-latombe-filed-appeal-against-general-court-dismissal-of-challenge-to-european-unionunited-states-data-protection-framework-adequacy-decision-in-latombe-v-commission";
const UK_DATA_BRIDGE = "https://www.gov.uk/government/publications/uk-us-data-bridge-supporting-documents";
const EDPB_TRANSFER = "https://www.edpb.europa.eu/our-work-tools/our-documents/guidelines/guidelines-052021-interplay-between-application-article-3_en";
const MUNICH_FONTS = "https://www.gesetze-bayern.de/Content/Document/Y-300-Z-BECKRS-B-2022-N-612";

export const HOSTING: Guide = {
  slug: "hosting",
  short: "服务器放哪、能不能打开",
  title: "服务器放哪、当地用户能不能打开：各市场的屏蔽和限速、加载不出来的第三方资源、CDN 节点和数据本地化",
  description:
    "按市场整理出海站的托管和访问问题：vercel.app 在中国大陆被封、GA 在大陆悄悄丢数据，俄罗斯对 Cloudflare 上的网站限速到 16KB，越南国际海缆常断，韩国网络费贵、CDN 节点少，西班牙球赛期间按 IP 连带封站；各家 CDN 在当地有没有节点，以及欧盟、俄罗斯、越南对数据存放的要求。",
  intro:
    "大多数出海站放在 Vercel、Cloudflare 或 AWS 的美国区，美国、日本、欧洲打开都没问题，但有几个市场要单独看：中国大陆封了 vercel.app 和 Google 的大部分服务，俄罗斯对 Cloudflare 上的网站限速到只能加载 16KB，越南的国际海缆常断，韩国的网络费让 CDN 节点少。下面按市场列出能不能打开、哪些第三方资源会坏、各家 CDN 在当地有没有节点，以及有没有要求数据存在境内。",
  checked: "2026-11-07",
  sections: [
    {
      id: "defaults",
      title: "先看几家托管和 CDN 的默认设置",
      lead: "静态页走边缘节点，问题不大；服务端渲染和 API 走函数所在的区，默认都在美国东部。",
      items: [
        {
          text: "Cloudflare：哪些数据中心服务你的域名因客户而异，不能按账户指定；中国大陆不在它的网络里，大陆访客由境外节点服务。CEO 在 Hacker News 上说，容量紧张时免费客户最先被挪到别的节点，通常只持续很短一段时间。",
          sources: [
            { label: "Cloudflare 文档（2026-10-14）", url: CF_ROUTING },
            { label: "Matthew Prince 在 HN（2025-08-27）", url: CF_HN },
          ],
        },
        {
          text: "Vercel 的函数默认在 iad1（华盛顿），Hobby 只能选一个区；Netlify 的函数默认在俄亥俄，只有付费版能改，亚太只能选东京、新加坡、悉尼。",
          sources: [
            { label: "Vercel 区域", url: VERCEL_REGIONS },
            { label: "Vercel 函数区域", url: VERCEL_FN_REGION },
            { label: "Netlify 函数配置", url: NETLIFY_FN },
          ],
        },
        {
          text: "CloudFront 最便宜的 Price Class 100 只含美国、加拿大、墨西哥和欧洲，日本、韩国和东南亚要选 Price Class 200 才用得到当地节点。",
          sources: [{ label: "CloudFront 价格", url: CLOUDFRONT_PRICE }],
        },
        {
          text: "Fastly 在亚洲的节点有东京、大阪、首尔、香港、新加坡，雅加达即将上线；越南、中国大陆、俄罗斯没有。",
          sources: [{ label: "Fastly 网络地图", url: FASTLY_MAP }],
        },
      ],
    },
    {
      id: "us",
      title: "美国：节点最全，注意司法部的数据安全规则",
      items: [
        {
          text: "Cloudflare 在美国有约 47 个城市的节点，Vercel 有 4 个计算区。",
          sources: [
            { label: "Cloudflare 网络", url: CF_NETWORK },
            { label: "Vercel 区域", url: VERCEL_REGIONS },
          ],
        },
        {
          text: "美国司法部的数据安全规则 2025 年 4 月 8 日生效：限制美国人和「受关注国家」（包括中国内地、香港、澳门和俄罗斯）的公司和个人做涉及大批量美国人敏感数据的交易。直接向美国用户收数据不算数据经纪，但卖 B2B SaaS 给美国公司、能接触对方大批量敏感数据时，对方可能要求你证明接触不到。",
          sources: [{ label: "美国司法部（2026-10-08 更新）", url: DOJ_DATA }],
        },
      ],
    },
    {
      id: "id",
      title: "印尼：本地有节点，过滤各家运营商不一样",
      items: [
        {
          text: "Cloudflare 在雅加达等 4 个城市有节点，CloudFront 在雅加达有节点；Vercel、Netlify 没有印尼区，最近的是新加坡。",
          sources: [
            { label: "Cloudflare 网络", url: CF_NETWORK },
            { label: "CloudFront 节点", url: CLOUDFRONT_FEATURES },
          ],
        },
        {
          text: "没做 PSE 登记会被封：2025 年 6 月 Komdigi 以此为由封了 eBay、KLM 等的印尼站。登记要求见「上线前必备的合规页面」那篇。",
          sources: [{ label: "Hukumonline（2025-06-30）", url: ID_BLOCK_2025 }],
        },
        {
          text: "过滤靠政府名单和运营商的 DNS 劫持，各家运营商做法不一样：OONI 2026 年 8 到 10 月测 reddit.com 1.5 万次，216 次确认被封，绝大多数正常。",
          sources: [
            { label: "OONI 报告", url: OONI_ID },
            { label: "OONI 数据", url: OONI_ID_REDDIT },
          ],
        },
        {
          text: "数据可以放在境外，条件是保证主管部门能监管；个人数据跨境要对方国家保护水平不低于印尼、有约束力的保护措施或本人同意。",
          sources: [{ label: "DLA Piper 印尼（2026-02-13）", url: DLA_ID_TRANSFER }],
        },
      ],
    },
    {
      id: "vn",
      title: "越南：国际海缆常断，放在境内的不受影响",
      items: [
        {
          text: "据越南之声，2026 年 8 月 25 日 SJC2、AAE-1 两条海缆几乎同时故障，加上之前没修好的，8 条国际海缆有 4 条出问题，高峰期访问境外变慢；托管在越南境内的网站和服务预计不受影响。",
          sources: [{ label: "越南之声（2026-08-28）", url: VN_CABLES }],
        },
        {
          text: "Cloudflare 在河内、胡志明市、岘港有节点，CloudFront 在河内、西贡有；Fastly、Vercel、Netlify 都没有越南节点或区。",
          sources: [
            { label: "Cloudflare 网络", url: CF_NETWORK },
            { label: "CloudFront 节点", url: CLOUDFRONT_FEATURES },
          ],
        },
        {
          text: "2026 年 1 月起，把在越南收集的个人数据存到境外服务器或境外云上也算跨境传输，60 天内要向公安部交传输影响评估。第 53/2022 号议定只要求 10 类服务的境外企业在不配合执法时才本地存储。",
          sources: [
            { label: "DLA Piper 越南（2026-02-15）", url: DLA_VN_TRANSFER },
            { label: "Tilleke & Gibbins（2022-08-19）", url: VN_DECREE_53 },
          ],
        },
      ],
    },
    {
      id: "jp",
      title: "日本：节点齐全，数据可以放境外",
      items: [
        {
          text: "Cloudflare 在东京、大阪、福冈、那霸有节点；CloudFront、Fastly 在东京和大阪有；Vercel 有东京、大阪两个区。CloudFront 选 Price Class 100 的话，日本用户用不到日本节点。",
          sources: [
            { label: "Cloudflare 网络", url: CF_NETWORK },
            { label: "CloudFront 价格", url: CLOUDFRONT_PRICE },
            { label: "Vercel 区域", url: VERCEL_REGIONS },
          ],
        },
        {
          text: "个人信息保护委员会：把个人数据存在自己管理的境外服务器，或云服务商按合同不接触数据，不算向外国第三方提供，不用另取同意；但要了解该国的个人信息制度、做好安全措施，并让用户能知道。",
          sources: [{ label: "个人信息保护委员会问答", url: PPC_OVERSEAS_SERVER }],
        },
      ],
    },
    {
      id: "kr",
      title: "韩国：网络费贵，境外节点会慢",
      items: [
        {
          text: "韩国 2016 年起运营商之间按发送方付费结算，首尔的 IP 带宽价格约是法兰克福、伦敦的 10 倍；和韩国运营商的流量交换常在境外进行，内容放境外会增加延迟。Twitch 2024 年 2 月因此退出韩国。",
          sources: [
            { label: "Internet Society（2022-05-11）", url: ISOC_KR },
            { label: "Twitch（2023-12-05）", url: TWITCH_KR },
          ],
        },
        {
          text: "Cloudflare 在韩国只有首尔一个节点；CloudFront、Fastly 也在首尔，Vercel 有首尔区，Netlify 没有。免费版和 Pro 的访客是不是由首尔节点服务，没找到实据。",
          sources: [
            { label: "Cloudflare 网络", url: CF_NETWORK },
            { label: "Vercel 区域", url: VERCEL_REGIONS },
          ],
        },
        {
          text: "Google 地图在韩国一直没有完整的步行和驾车导航，2026 年 2 月韩国才附条件批准导出地图数据；要嵌地图的，本地用户更习惯 Naver 或 Kakao 地图。",
          sources: [{ label: "CP24（2026-02-27）", url: KR_GOOGLE_MAPS }],
        },
        {
          text: "没查到服务器本地化要求；为履行和用户的合同把数据放在境外，只要在隐私政策里写明传到哪个国家、给谁，就不用另取同意。",
          sources: [{ label: "个人信息保护法第 28-8 条（英译）", url: KR_PIPA_28_8 }],
        },
      ],
    },
    {
      id: "ru",
      title: "俄罗斯：Cloudflare 上的网站只能加载 16KB",
      items: [
        {
          text: "2025 年 6 月 9 日起，俄罗斯主要运营商对 Cloudflare 托管的网站限速，每个资源只能加载前 16KB，大多数网页实际打不开；外部报告说 Hetzner、DigitalOcean、OVH 也受影响。Cloudflare 说它无法恢复访问。",
          sources: [{ label: "Cloudflare 博客（2025-06-26）", url: CF_RUSSIA }],
        },
        {
          text: "2024 年 11 月起俄罗斯封锁使用 ECH 的 Cloudflare 连接；Cloudflare 免费版默认开着 ECH，只有付费版能关。",
          sources: [
            { label: "Meduza（2024-11-08）", url: RU_ECH },
            { label: "Cloudflare ECH 文档", url: CF_ECH },
          ],
        },
        {
          text: "移动网络还有「白名单模式」，只能打开批准名单上的网站：据《生意人报》，2026 年 7 月中部地区只有约三成移动会话不受限，莫斯科约一半走白名单，边境地区近九成。",
          sources: [{ label: "Meduza 转述（2026-08-05）", url: RU_WHITELIST }],
        },
        {
          text: "YouTube 2026 年 2 月被从俄罗斯的国家域名系统里删除，OONI 测到一半以上访问异常，嵌入视频基本放不了。俄罗斯建站平台 Tilda 建议把 Google Fonts 换成系统字体、GA 换成 Yandex Metrica、Google 地图换成 Yandex 地图。",
          sources: [
            { label: "The Moscow Times（2026-02-12）", url: RU_YOUTUBE },
            { label: "OONI 数据", url: OONI_RU_YOUTUBE },
            { label: "Tilda 帮助", url: TILDA_RU },
          ],
        },
        {
          text: "2025 年 7 月起，收集俄罗斯公民的个人数据时不允许用境外数据库存储和处理，以前「境内先存一份再传境外」的做法可能不再被认可。罚款见「上线前必备的合规页面」那篇。",
          sources: [{ label: "B1 律所（2025-03-06）", url: RU_LOCALISATION }],
        },
      ],
    },
    {
      id: "cn",
      title: "中国大陆：默认域名被封，Google 的东西大多加载不了",
      items: [
        {
          text: "我们 2026 年 9 月 17 日用 Globalping 从大陆 8 个探针测 443 端口的连接时间，Cloudflare 免费版对比 GitHub Pages：联通中位数 1,054 毫秒对 167 毫秒，移动 348 对 103，电信 274 对 930（电信上 Cloudflare 反而快）。样本小，只测了连接握手。",
          sources: [{ label: "Globalping（我们的测量）", url: GLOBALPING }],
        },
        {
          text: "vercel.app 在大陆被封，GreatFire 测过的网址全部打不开；Vercel 自己说在大陆没有服务器和节点，建议换自己的域名，但不保证能用。netlify.app、pages.dev、github.io 也有不少网址被封或受干扰。",
          sources: [
            { label: "GreatFire：vercel.app", url: GF_VERCEL },
            { label: "Vercel 知识库（2026-09-11）", url: VERCEL_CN },
            { label: "GreatFire：netlify.app", url: GF_NETLIFY },
            { label: "GreatFire：pages.dev", url: GF_PAGES },
            { label: "GreatFire：github.io", url: GF_GITHUB },
          ],
        },
        {
          text: "www.google.com 被封，所以默认的 reCAPTCHA 加载不了，Google 让这种情况改用 www.recaptcha.net。GA 的脚本能加载，但 GA4 的数据上报地址被封，后台看到的大陆流量会偏少。Google Fonts 能连，YouTube 被封。",
          sources: [
            { label: "GreatFire：google.com", url: GF_GOOGLE },
            { label: "reCAPTCHA 常见问题", url: RECAPTCHA_FAQ },
            { label: "GreatFire：googletagmanager.com", url: GF_GTM },
            { label: "GreatFire：GA4 上报地址", url: GF_GA4 },
            { label: "GreatFire：Google Fonts", url: GF_FONTS },
            { label: "GreatFire：YouTube", url: GF_YOUTUBE },
          ],
        },
        {
          text: "jsDelivr 2021 年 12 月丢了大陆的 ICP 备案，之后由「靠近中国」的节点服务，现在能连；Stripe 的 js.stripe.com 能连。Cloudflare 的 Turnstile 验证码官方写明不支持中国大陆。",
          sources: [
            { label: "jsDelivr（2021-12-20）", url: JSDELIVR_ICP },
            { label: "GreatFire：jsDelivr", url: GF_JSDELIVR },
            { label: "GreatFire：Stripe", url: GF_STRIPE },
            { label: "Cloudflare 中国网络常见问题", url: CF_CHINA_FAQ },
          ],
        },
        {
          text: "Cloudflare 的中国网络只给企业版客户另行订阅，节点由京东云运营，每个域名要有 ICP 备案或许可证。服务器放在大陆要先备案，见「域名怎么选」那篇。",
          sources: [{ label: "Cloudflare 中国网络", url: CF_CHINA }],
        },
        {
          text: "想靠近大陆，把 Vercel 函数放在香港区（hkg1）：OpenAI 2024 年 7 月起拦截不支持地区的 API 请求，Vercel 当时就提醒香港区的函数会受影响。",
          sources: [{ label: "Vercel 更新日志（2024-06-27）", url: VERCEL_HKG_OPENAI }],
        },
        {
          text: "个人信息保护法要求境内存储的，只有关键信息基础设施运营者和处理量达到网信办规定数量的处理者（第 40 条）；境外向境内个人提供服务也适用这部法。",
          sources: [{ label: "个人信息保护法", url: CN_PIPL }],
        },
      ],
    },
    {
      id: "eu-uk",
      title: "欧盟和英国：访问没问题，数据放美国要有依据",
      items: [
        {
          text: "例外是西班牙：西甲比赛期间运营商按 IP 封盗播，连带封到 Cloudflare 等共享 IP。OONI 统计 2026 年 1 到 6 月测的 920 万个域名里，有 55.4 万个一度被封，九成在 Cloudflare 上；开球前开始封，终场后解除。",
          sources: [{ label: "OONI（2026-06-30）", url: OONI_LALIGA }],
        },
        {
          text: "欧美数据隐私框架（DPF）仍有效：欧盟普通法院 2025 年 9 月 3 日驳回了要求撤销的诉讼，原告 10 月已上诉。英国的「数据桥」2023 年 10 月起可以向加入 DPF 英国扩展的美国机构传数据。",
          sources: [
            { label: "欧盟法院新闻稿（2025-09-03）", url: EU_LATOMBE },
            { label: "上诉记录（2025-10-31）", url: EU_LATOMBE_APPEAL },
            { label: "英国政府（2023-09-21）", url: UK_DATA_BRIDGE },
          ],
        },
        {
          text: "没有欧盟公司的中国卖家：用户自己把数据交给你不算「传输」；但你受 GDPR 管辖，再把数据放到美国云上就算传输，要靠对方的 DPF 认证或标准合同条款。",
          sources: [{ label: "EDPB 指南 05/2021", url: EDPB_TRANSFER }],
        },
        {
          text: "慕尼黑法院 2022 年判过：网站未经同意动态加载 Google Fonts、把访客 IP 传给 Google 违法，赔 100 欧元。面向欧洲的站把字体放在自己服务器上更稳。",
          sources: [{ label: "慕尼黑第一地区法院（2022-01-20）", url: MUNICH_FONTS }],
        },
        {
          text: "Cloudflare 在欧洲有 57 个城市的节点；Vercel 有斯德哥尔摩、巴黎、都柏林、法兰克福、伦敦 5 个区；CloudFront 最便宜的价格档已经含欧洲。",
          sources: [
            { label: "Cloudflare 网络", url: CF_NETWORK },
            { label: "Vercel 区域", url: VERCEL_REGIONS },
            { label: "CloudFront 价格", url: CLOUDFRONT_PRICE },
          ],
        },
      ],
    },
  ],
  pitfalls: [
    {
      text: "面向大陆用平台默认域名：vercel.app 全封，netlify.app、pages.dev、github.io 也有不少被干扰；换成自己的域名只是少被封，Vercel 明说不保证。",
      sources: [
        { label: "GreatFire：vercel.app", url: GF_VERCEL },
        { label: "Vercel 知识库", url: VERCEL_CN },
      ],
    },
    {
      text: "看 GA 后台说「没有中国流量」：脚本能加载，上报地址被封，数据悄悄丢了。面向大陆的注册表单别用默认的 reCAPTCHA 和 Turnstile。",
      sources: [
        { label: "GreatFire：GA4 上报地址", url: GF_GA4 },
        { label: "reCAPTCHA 常见问题", url: RECAPTCHA_FAQ },
      ],
    },
    {
      text: "以为 Cloudflare 哪里都快：俄罗斯整体限速到 16KB，西班牙球赛时按 IP 连坐，免费版容量紧张时先被挪走。俄语、西班牙语用户多的站，要准备一个不经过 Cloudflare 的备用入口。",
      sources: [
        { label: "Cloudflare 博客", url: CF_RUSSIA },
        { label: "OONI", url: OONI_LALIGA },
      ],
    },
    {
      text: "函数用默认区：Vercel 和 Netlify 都在美国东部，静态页走边缘没事，服务端渲染和 API 每次都要跨太平洋。",
      sources: [
        { label: "Vercel 函数区域", url: VERCEL_FN_REGION },
        { label: "Netlify 函数配置", url: NETLIFY_FN },
      ],
    },
    {
      text: "CloudFront 选最便宜的 Price Class 100：日本、韩国、东南亚用户全从欧美节点取内容。",
      sources: [{ label: "CloudFront 价格", url: CLOUDFRONT_PRICE }],
    },
    {
      text: "越南用户多却只用境外节点：断缆是常态，要用有越南节点的 CDN（Cloudflare 有 3 个城市）。",
      sources: [{ label: "W.Media（2026-09-03）", url: VN_CABLES_WMEDIA }],
    },
  ],
  unknowns: [
    "Cloudflare 免费版和 Pro 在韩国是不是被路由到境外节点：没有官方说法，也没找到近年的公开测量。",
    "俄罗斯 16KB 限速 2026 年的现状，以及 CloudFront、Fastly 在俄罗斯是否同样受限。",
    "各市场访问美国、新加坡源站的公开延迟数据；「香港、新加坡服务器是大陆的折中」没找到公开测量。",
    "欧美数据隐私框架上诉案（C-703/25 P）2026 年的进展。",
    "越南 2026 年 8 月断缆的修复完成日期。",
    "印尼 Komdigi 对小型境外 SaaS 是否实际执法；越南的传输影响评估对没有越南实体的境外小卖家是否实际执行。",
    "美国司法部规则各类数据的批量门槛原文。",
  ],
  related: [
    { label: "上线前必备的合规页面（数据本地化和登记）", path: "/compliance" },
    { label: "域名怎么选（ICP 备案）", path: "/domains" },
    { label: "站长后台和收录提交", path: "/indexing" },
  ],
};
