import type { Guide } from "../go-global-guides";

// 上线前必备的合规页面和登记，按市场整理：只写法律原文、监管机构和法律数据库（DLA Piper 手册），个别条目用有日期的律所简报（写明）。
// 税务登记在「数字产品的税」，ICP 备案在「域名怎么选」，这里只一句带过。调研笔记在 ~/出海/research/2026-11-by-market/08（不在仓库里）。
const CALOPPA = "https://leginfo.legislature.ca.gov/faces/codes_displayText.xhtml?division=8.&chapter=22.&lawCode=BPC";
const CPPA_FAQ = "https://cppa.ca.gov/faq.html";
const COPPA_2025 = "https://www.federalregister.gov/documents/2025/04/22/2025-05904/childrens-online-privacy-protection-rule";
const CA_ARL = "https://dwt.com/insights/2024/10/ab-2863-updates-california-automatic-renewal-law";
const FTC_VACATED = "https://www.lw.com/en/insights/eighth-circuit-vacates-ftc-click-to-cancel-rule";
const FTC_ANPRM =
  "https://www.ftc.gov/news-events/news/press-releases/2026/03/ftc-seeks-public-comment-response-advance-notice-proposed-rulemaking-regarding-negative-option";
const ADA_GUIDANCE = "https://www.ada.gov/resources/web-guidance/";
const ADA_SUITS = "https://www.adatitleiii.com/2026/03/federal-court-website-accessibility-lawsuit-filings-bounce-back-in-2025/";
const DLA_ID = "https://www.dlapiperdataprotection.com/index.html?t=law&c=ID";
const PSE_PORTAL = "https://pse.komdigi.go.id/";
const PSE_2022 = "https://www.thejakartapost.com/indonesia/2022/07/30/govt-blocks-yahoo-steam-paypal-for-failing-to-comply-with-licensing-policy.html";
const PSE_2025 = "https://www.hukumonline.com/berita/a/komdigi-blokir-ebay-hingga-maskapai-klm-lt68626c8177d07?page=all";
const PSE_2026 =
  "https://infopublik.id/kategori/siaran-pers/989544/siaran-pers-perketat-pengawasan-komdigi-minta-25-pse-lingkup-privat-penuhi-kewajiban-pendaftaran";
const DLA_VN = "https://www.dlapiperdataprotection.com/index.html?t=law&c=VN";
const JP_FOREIGN = "https://www.no-trouble.caa.go.jp/qa/foreign.html";
const JP_MAILORDER = "https://www.no-trouble.caa.go.jp/what/mailorder/";
const JP_FINAL_SCREEN = "https://www.caa.go.jp/notice/assets/consumer_transaction_cms203_240425_01.pdf";
const PPC_FOREIGN = "https://www.ppc.go.jp/all_faq_index/faq1-q11-2/";
const PPC_GUIDE = "https://www.ppc.go.jp/files/pdf/kihon_202309.pdf";
const SOUMU_EXTERNAL = "https://www.soumu.go.jp/main_sosiki/joho_tsusin/d_syohi/gaibusoushin_kiritsu.html";
const KR_ECOMMERCE_10 = "https://www.law.go.kr/LSW/ftcInfoP.do?ftcSeq=753";
const KFTC_AGENT =
  "https://www.ftc.go.kr/www/selectBbsNttView.do?pageUnit=10&pageIndex=1&searchCnd=all&key=12&bordCd=3&searchCtgry=01%2C02&nttSn=47730";
const KR_PIPA_AGENT = "https://prighter.com/resources/laws/korean-pipa/enforcement-decree/articles/article-32-2";
const KR_PIPA_2025 = "https://www.asiae.co.kr/en/article/2025053008290385821";
const DLA_KR = "https://www.dlapiperdataprotection.com/index.html?t=law&c=KR";
const RU_152_NOTIFY = "https://www.consultant.ru/document/cons_doc_LAW_61801/d996966e22e1320c9de1ab82d9f6be12c3d9d765/";
const RU_KOAP = "https://www.consultant.ru/document/cons_doc_LAW_34661/1f421640c6775ff67079ebde06a7d2f6d17b96db/";
const RU_152_LOCAL = "https://www.consultant.ru/document/cons_doc_LAW_61801/cbf4e15b7c330f9372e876cdf2bc928bad7950ef/";
const RU_152_TRANSFER = "https://www.consultant.ru/document/cons_doc_LAW_61801/e4ebbe1780de623c7cf32a59ca82a7bb523a25dd/";
const RU_152_POLICY = "https://www.consultant.ru/document/cons_doc_LAW_61801/eeeebe22bf738fd65bb66b95cc278911ae2525ee/";
const MIIT_ICP = "https://www.miit.gov.cn/gyhxxhb/jgsj/cyzcyfgs/bmgz/xxtxl/art/2024/art_84a0cfa0ebd049bbbe751dca9a008e56.html";
const CN_ICP_MEASURES = "http://www.cac.gov.cn/2000-09/30/c_126193701.htm";
const CN_PIPL = "http://www.cac.gov.cn/2021-08/20/c_1631050028355286.htm";
const CN_DATA_EXPORT = "https://www.cac.gov.cn/2024-03/22/c_1712776611775634.htm";
const CN_RENEWAL = "https://www.gov.cn/zhengce/content/202403/content_6940158.htm";
const CN_GENAI = "https://www.cac.gov.cn/2023-07/13/c_1690898327029107.htm";
const CN_AI_LABEL = "https://www.cac.gov.cn/2025-03/14/c_1743654684782215.htm";
const GDPR_13 = "https://gdpr-info.eu/art-13-gdpr/";
const GDPR_83 = "https://gdpr-info.eu/art-83-gdpr/";
const EDPB_SCOPE =
  "https://www.edpb.europa.eu/system/files/documents/files/file1/edpb_guidelines_3_2018_territorial_scope_after_public_consultation_en_1.pdf";
const NL_FINE = "https://www.huntonprivacyblog.com/2021/05/19/dutch-dpa-fines-company-525000-eur-for-failure-to-designate-eu-representative/";
const EU_COOKIES = "https://europa.eu/youreurope/citizens/consumers/internet-telecoms/data-protection-online-privacy/index_en.htm";
const EU_OMNIBUS =
  "https://www.heuking.de/en/news-events/newsletter-articles/detail/cookie-consent-under-the-digital-omnibus-planned-changes-and-technical-implementation.html";
const EU_CRD = "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A02011L0083-20220528";
const EU_RETURNS = "https://europa.eu/youreurope/citizens/consumers/shopping/returns/index_en.htm";
const EU_WITHDRAW_BUTTON = "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32023L2673";
const EU_EAA = "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32019L0882";
const EU_DSA = "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32022R2065";
const BIPT_DSA =
  "https://bipt.be/consumers/publication/providers-of-intermediary-services-without-an-establishment-in-the-eu-appointment-of-a-legal-representative";
const DDG_5 = "https://www.gesetze-im-internet.de/ddg/__5.html";
const DDG_33 = "https://www.gesetze-im-internet.de/ddg/__33.html";
const UK_GDPR_27 = "https://www.legislation.gov.uk/eur/2016/679/article/27";
const UK_DUAA_START = "https://www.legislation.gov.uk/uksi/2026/82/regulation/2/made";
const UK_DUAA_COOKIES = "https://www.legislation.gov.uk/ukpga/2025/18/schedule/12";
const UK_COOKIE_FINES = "https://www.mishcon.com/news/unlawful-cookies-a-new-avenue-for-the-ico-to-issue-fines";
const UK_RETURNS = "https://www.gov.uk/accepting-returns-and-giving-refunds";

export const COMPLIANCE: Guide = {
  slug: "compliance",
  short: "上线前的合规页面",
  title: "上线前必备的合规页面和登记：隐私政策、cookie、卖家信息页、当地代表，境外小卖家按市场要做什么",
  description:
    "按市场整理面向当地用户上线前要挂的页面、要办的登记和要指定的代表：美国的隐私政策和自动续费规则，印尼 PSE 登记，越南个人数据保护法，日本特商法表记，韩国电子商务法，俄罗斯个人数据本地化，中国个人信息保护法和经营许可证，欧盟 GDPR 代表、cookie、14 天撤回、无障碍法和 DSA，德国 Impressum，英国 cookie 新规。",
  intro:
    "人在国外、没有当地公司，不等于当地法律管不到你：日本的特商法、欧盟和英国的 GDPR、中国的个人信息保护法都写明管境外卖家，印尼的 PSE 登记境外也要做，2022 年还因此封过 PayPal 和 Steam。下面按市场列出面向当地用户上线前要挂的页面、要办的登记、要指定的代表，以及达到什么门槛才适用。税务登记见「数字产品的税」那篇，ICP 备案见「域名怎么选」那篇。",
  checked: "2026-11-07",
  warning: {
    text: "这一页按各国法律原文和监管机构的说明整理，是一般信息，不是法律建议。具体到你的产品和用户，请找当地律师。",
  },
  sections: [
    {
      id: "us",
      title: "美国：隐私政策没有门槛，自动续费按州管",
      items: [
        {
          text: "加州 CalOPPA：收集加州居民个人信息的商业网站，都要显著挂出隐私政策，写明收集什么、分享给哪类第三方、用户怎么查改、政策怎么变更通知，以及怎么回应「请勿追踪」。这条没有营收或用户数门槛。",
          sources: [{ label: "加州商业与职业法典", url: CALOPPA }],
        },
        {
          text: "CCPA 只管满足其一的企业：上一年营收超过 2,662.5 万美元（2025 年起的数）、买卖或共享 10 万以上加州居民的个人信息、一半以上收入来自卖或共享个人信息。多数小站够不上。",
          sources: [{ label: "加州隐私保护局", url: CPPA_FAQ }],
        },
        {
          text: "面向 13 岁以下儿童的网站适用 COPPA；修订版 2025 年 6 月 23 日生效，多数条款 2026 年 4 月 22 日起必须合规，比如把儿童的数据交给第三方做广告，要另外取得家长同意。",
          sources: [{ label: "联邦公报（2025-04-22）", url: COPPA_2025 }],
        },
        {
          text: "加州自动续订法的修订 2025 年 7 月 1 日起适用：自动续费要单独取得用户明确同意，免费试用转付费也算；取消要和注册一样容易。",
          sources: [{ label: "DWT 律所简报（2024-10-01）", url: CA_ARL }],
        },
        {
          text: "FTC 的「一键取消」规则 2025 年 7 月 8 日被第八巡回上诉法院整体撤销，但联邦 ROSCA 法和各州的自动续订法照样适用；FTC 2026 年 3 月又开始重新征求意见。",
          sources: [
            { label: "Latham & Watkins（2025-07-11）", url: FTC_VACATED },
            { label: "FTC（2026-03-11）", url: FTC_ANPRM },
          ],
        },
        {
          text: "无障碍：司法部的指引说 ADA 适用于企业在网上提供的商品和服务，但没给私营网站定技术标准；2025 年联邦法院受理的网站无障碍诉讼有 3,117 起。",
          sources: [
            { label: "美国司法部", url: ADA_GUIDANCE },
            { label: "Seyfarth 统计（2026-03）", url: ADA_SUITS },
          ],
        },
      ],
    },
    {
      id: "id",
      title: "印尼：境外运营者也要做 PSE 登记，不登记会被封",
      items: [
        {
          text: "在印尼通过网站或 App 提供商品和服务的，不论境内境外，都要向 Komdigi 登记为私营电子系统运营者（PSE），登记门户写明每个私营 PSE 都必须登记。",
          sources: [
            { label: "DLA Piper 印尼（2026-02-13）", url: DLA_ID },
            { label: "PSE 登记门户", url: PSE_PORTAL },
          ],
        },
        {
          text: "执法实例：2022 年 7 月 30 日因未登记封了 Yahoo、Steam、PayPal、Epic Games 等；2025 年 6 月封了 eBay、KLM 等的印尼站；2026 年 9 月又发函要求 25 家限期登记，其中 2 家在境外。",
          sources: [
            { label: "Jakarta Post（2022-07-30）", url: PSE_2022 },
            { label: "Hukumonline（2025-06-30）", url: PSE_2025 },
            { label: "Komdigi 新闻稿（2026-09-17）", url: PSE_2026 },
          ],
        },
        {
          text: "个人数据保护法（UU 27/2022）的两年过渡期 2024 年 10 月 17 日结束，现在要全面合规：数据泄露 72 小时内书面通知本人和监管机构，行政罚款最高为年收入的 2%；实施条例还没出。",
          sources: [{ label: "DLA Piper 印尼（2026-02-13）", url: DLA_ID }],
        },
      ],
    },
    {
      id: "vn",
      title: "越南：新的个人数据保护法 2026 年 1 月起施行",
      items: [
        {
          text: "《个人数据保护法》（第 91/2025/QH15 号）2026 年 1 月 1 日施行，配套的第 356/2025 号议定同日生效，取代 2023 年的第 13 号议定。",
          sources: [{ label: "DLA Piper 越南（2026-02-15）", url: DLA_VN }],
        },
        {
          text: "处理越南公民个人数据的，开始处理后 60 天内要向公安部提交影响评估；把数据传到境外（包括存在境外服务器或境外云上）的，60 天内另交传输影响评估，之后每半年复核。同意要逐个目的取得，沉默不算同意。",
          sources: [{ label: "DLA Piper 越南（2026-02-15）", url: DLA_VN }],
        },
        {
          text: "小企业和初创企业符合条件的，5 年内可以免做这两份评估、免设数据保护负责人。违规跨境传输最高罚上一年收入的 5%。",
          sources: [{ label: "DLA Piper 越南（2026-02-15）", url: DLA_VN }],
        },
      ],
    },
    {
      id: "jp",
      title: "日本：海外卖家也要挂特商法表记",
      items: [
        {
          text: "消费者厅写明：从海外通过网站卖给日本消费者，同样适用《特定商取引法》，国籍和服务器在哪都不影响；但不需要许可或登记。",
          sources: [{ label: "消费者厅：海外网售问答", url: JP_FOREIGN }],
        },
        {
          text: "「特定商取引法に基づく表記」里的地址要写实际经营的地方，海外地址也可以，不能借用日本亲友的地址。",
          sources: [{ label: "消费者厅：海外网售问答", url: JP_FOREIGN }],
        },
        {
          text: "可以写「请求时立即以书面或邮件提供」来省略姓名、地址和电话，前提是真的做得到；退货和解约条件不能省。",
          sources: [{ label: "消费者厅：网售规则", url: JP_MAILORDER }],
        },
        {
          text: "2022 年 6 月起，网购的最终确认页必须写数量、价格、付款时间和方式、交付时间、撤回和解约条件；2023 年 9 月到 2024 年 4 月消费者厅处罚了 3 家定期购买业务，都涉及最终确认页。",
          sources: [{ label: "消费者厅（2024-04-25）", url: JP_FINAL_SCREEN }],
        },
        {
          text: "个人信息保护法也管境外企业：为了向日本的人提供服务而处理他们的个人信息就适用。要让用户能知道企业名称、地址、代表人、利用目的、请求手续、安全措施和投诉窗口，通常写在网站的隐私政策里。",
          sources: [
            { label: "个人信息保护委员会问答", url: PPC_FOREIGN },
            { label: "个人信息保护委员会指南", url: PPC_GUIDE },
          ],
        },
        {
          text: "cookie 在日本不靠同意靠公示：新闻、社交、搜索、策展类网站要用日语公布发送了什么信息、发给谁、做什么用；只卖自家商品的网店不在范围内。",
          sources: [{ label: "总务省：外部送信规律", url: SOUMU_EXTERNAL }],
        },
      ],
    },
    {
      id: "kr",
      title: "韩国：首页要挂经营者信息，国内代理人有门槛",
      items: [
        {
          text: "电子商务法第 10 条：网店要在首页显示商号和代表人姓名、营业地址、电话和邮箱、营业登记号、使用条款等。",
          sources: [{ label: "公平交易委员会决议", url: KR_ECOMMERCE_10 }],
        },
        {
          text: "电子商务法修订后，在韩国没有住所和营业所的海外经营者，上一年营业额 1 万亿韩元以上、或韩国消费者月均访问 100 万以上、或被公平委要求的，要指定国内代理人并在首页公示，2027 年 1 月 21 日起施行。小卖家一般够不上。",
          sources: [{ label: "公平交易委员会（2026-07-14）", url: KFTC_AGENT }],
        },
        {
          text: "个人信息保护法的国内代理人也有门槛（比如上一年营业额 1 万亿韩元以上）；2025 年 10 月起，在韩国有法人的海外企业必须指定该法人当代理人。2026 年的修订把重复违法的罚款上限提到营业额的 10%。",
          sources: [
            { label: "Prighter 法条译本", url: KR_PIPA_AGENT },
            { label: "亚洲经济（2025-05-30）", url: KR_PIPA_2025 },
            { label: "DLA Piper 韩国（2026-03-20）", url: DLA_KR },
          ],
        },
      ],
    },
    {
      id: "ru",
      title: "俄罗斯：先通知监管部门，数据要存在俄罗斯",
      items: [
        {
          text: "处理个人数据前要书面通知 Roskomnadzor；2022 年 9 月起原来的豁免大多取消了。不通知的，公司罚 10 万到 30 万卢布。",
          sources: [
            { label: "152-FZ 第 22 条", url: RU_152_NOTIFY },
            { label: "行政违法法典第 13.11 条", url: RU_KOAP },
          ],
        },
        {
          text: "收集俄罗斯公民的个人数据时，不允许用境外数据库记录、整理、存储和更新（第 18 条第 5 款，2025 年修订）；违反的公司罚 100 万到 600 万卢布，再犯 600 万到 1,800 万。",
          sources: [
            { label: "152-FZ 第 18 条", url: RU_152_LOCAL },
            { label: "行政违法法典第 13.11 条", url: RU_KOAP },
          ],
        },
        {
          text: "跨境传输前要另行通知；在线收集个人数据的，要在收集页面公开个人数据处理政策和保护措施。",
          sources: [
            { label: "152-FZ 第 12 条", url: RU_152_TRANSFER },
            { label: "152-FZ 第 18.1 条", url: RU_152_POLICY },
          ],
        },
      ],
    },
    {
      id: "cn",
      title: "中国大陆：个人信息保护法管境外，收费服务要经营许可证",
      items: [
        {
          text: "ICP 备案见「域名怎么选」那篇；备案号要标在首页底部中央，没备案罚 1 万元。",
          sources: [{ label: "工信部备案办法", url: MIIT_ICP }],
        },
        {
          text: "在境内向用户有偿提供信息服务属于经营性互联网信息服务，要先取得经营许可证，并在首页显著位置标出许可证编号；无证经营最高罚 100 万元，情节严重的关站。",
          sources: [{ label: "互联网信息服务管理办法", url: CN_ICP_MEASURES }],
        },
        {
          text: "个人信息保护法管到境外：以向境内的人提供产品或服务为目的处理他们个人信息的，同样适用，而且要在境内设专门机构或指定代表，报给监管部门（第 53 条）。",
          sources: [{ label: "个人信息保护法", url: CN_PIPL }],
        },
        {
          text: "隐私告知至少写处理者名称和联系方式、目的、方式、信息种类、保存期限和用户怎么行使权利；情节严重的最高罚 5,000 万元或上一年营业额的 5%。",
          sources: [{ label: "个人信息保护法", url: CN_PIPL }],
        },
        {
          text: "数据出境：为订立和履行与个人的合同（比如跨境购物）确需出境的，以及一年累计不满 10 万人非敏感个人信息的，免做安全评估、标准合同和认证。",
          sources: [{ label: "网信办（2024-03-22）", url: CN_DATA_EXPORT }],
        },
        {
          text: "自动续费：服务开始前和每次自动续费前都要显著提醒（2024 年 7 月起）。面向境内公众的生成式 AI 服务另有管理办法，2025 年 9 月起 AI 生成的内容要加标识。",
          sources: [
            { label: "消费者权益保护法实施条例", url: CN_RENEWAL },
            { label: "生成式 AI 服务管理办法", url: CN_GENAI },
            { label: "AI 生成内容标识办法", url: CN_AI_LABEL },
          ],
        },
      ],
    },
    {
      id: "eu",
      title: "欧盟：GDPR 代表、cookie、14 天撤回、无障碍和 DSA",
      items: [
        {
          text: "隐私声明（GDPR 第 13 条）要写控制者和欧盟代表的联系方式、目的和法律依据、接收方、跨境传输、保存期限、各项权利和投诉权；违反最高罚 2,000 万欧元或全球营业额 4%。",
          sources: [
            { label: "GDPR 第 13 条", url: GDPR_13 },
            { label: "GDPR 第 83 条", url: GDPR_83 },
          ],
        },
        {
          text: "欧盟以外的公司向欧盟的人提供商品服务，要书面指定欧盟代表（第 27 条）。豁免只给偶发、不大规模处理敏感数据的情况，持续运营的网站很难算偶发。荷兰监管机构 2021 年就因为没指定代表罚了 Locatefamily.com 52.5 万欧元。",
          sources: [
            { label: "EDPB 地域适用指南", url: EDPB_SCOPE },
            { label: "Hunton（2021-05-19）", url: NL_FINE },
          ],
        },
        {
          text: "cookie 要在写入前取得同意，只告知或教用户怎么关都不算；只有传输必需或用户明确请求的服务严格必需的（比如购物车）可以免同意。欧盟在讨论放宽，预计 2027 年前不会生效。",
          sources: [
            { label: "欧盟 Your Europe", url: EU_COOKIES },
            { label: "Heuking 律所（2026-10-23）", url: EU_OMNIBUS },
          ],
        },
        {
          text: "14 天撤回：在线数字内容要让撤回权消失，三样缺一不可：用户事先明确同意立即开始、确认知道因此失去撤回权、你用邮件等耐久介质确认。缺一样，用户撤回可以一分不付。SaaS 这类服务应用户要求提前开始的，撤回时按比例付费。",
          sources: [
            { label: "消费者权利指令", url: EU_CRD },
            { label: "欧盟 Your Europe", url: EU_RETURNS },
          ],
        },
        {
          text: "2026 年 6 月 19 日起，网上订立的合同要提供撤回功能：标着「withdraw from contract here」或同样清楚的字样，撤回期内一直可用，再加一步确认，你要及时发回执。",
          sources: [{ label: "指令 2023/2673", url: EU_WITHDRAW_BUTTON }],
        },
        {
          text: "《无障碍法》（EAA）2025 年 6 月 28 日起适用于面向消费者的电商服务；少于 10 人、年营业额或资产负债表不超过 200 万欧元的微型企业，提供服务时豁免。",
          sources: [{ label: "指令 2019/882", url: EU_EAA }],
        },
        {
          text: "《数字服务法》（DSA）：在欧盟没有机构、但向欧盟提供托管等中介服务的（比如存用户上传的内容），要指定一个成员国的法律代表，小微企业也不豁免；使用条款要写内容审核政策。网站能被访问本身不算向欧盟提供服务，要看用户量或是否针对欧盟。",
          sources: [
            { label: "DSA 条例", url: EU_DSA },
            { label: "比利时监管机构（2026-09-22）", url: BIPT_DSA },
          ],
        },
        {
          text: "德国 Impressum：现在依据《数字服务法》（DDG）第 5 条，营业性的数字服务要列出名称和营业地址、法定代表人、能快速联系的方式（含邮箱）、商业登记号和增值税号等；缺漏最高罚 5 万欧元。",
          sources: [
            { label: "DDG 第 5 条", url: DDG_5 },
            { label: "DDG 第 33 条", url: DDG_33 },
          ],
        },
      ],
    },
    {
      id: "uk",
      title: "英国：要指定英国代表，cookie 规则 2026 年放宽了一部分",
      items: [
        {
          text: "英国 GDPR 第 27 条还在：受英国 GDPR 管辖的境外公司要书面指定英国代表，豁免条件和欧盟一样。",
          sources: [{ label: "英国 GDPR 第 27 条", url: UK_GDPR_27 }],
        },
        {
          text: "《数据使用和访问法》的 cookie 改动 2026 年 2 月 5 日生效：只为统计改进自家服务、或只为调整网站外观和功能的 cookie 可以不经同意，但要清楚告知并提供免费、简单的拒绝方式；广告追踪照样要同意。",
          sources: [
            { label: "生效条例 SI 2026/82", url: UK_DUAA_START },
            { label: "法案附表 12", url: UK_DUAA_COOKIES },
          ],
        },
        {
          text: "同一天起 cookie 违规的罚款上限从 50 万英镑提到 1,750 万英镑或全球营业额的 4%。",
          sources: [{ label: "Mishcon de Reya（2026-02-12）", url: UK_COOKIE_FINES }],
        },
        {
          text: "网购的消费者 14 天内可以取消，退款要在 14 天内完成。",
          sources: [{ label: "GOV.UK", url: UK_RETURNS }],
        },
      ],
    },
  ],
  pitfalls: [
    {
      text: "以为人在国外、没有当地公司就不适用：日本特商法、GDPR 和英国 GDPR 的代表条款、中国个人信息保护法第 53 条都专门管境外卖家，印尼不登记 PSE 会被封站。",
      sources: [
        { label: "消费者厅：海外网售问答", url: JP_FOREIGN },
        { label: "Jakarta Post（2022-07-30）", url: PSE_2022 },
      ],
    },
    {
      text: "在欧盟卖在线数字内容，结账时漏了「同意立即开始并放弃撤回权」的勾选和确认邮件：用户 14 天内撤回可以一分不付；2026 年 6 月 19 日起还必须有撤回按钮。",
      sources: [
        { label: "消费者权利指令", url: EU_CRD },
        { label: "指令 2023/2673", url: EU_WITHDRAW_BUTTON },
      ],
    },
    {
      text: "以为英国新规让 cookie 横幅可以撤了：放宽的只是统计和外观功能两类，仍要告知并给拒绝入口，罚款上限反而涨到 1,750 万英镑。",
      sources: [{ label: "法案附表 12", url: UK_DUAA_COOKIES }],
    },
    {
      text: "日本特商法表记借日本朋友的地址，或者干脆不挂：地址必须是实际经营地，可以写「请求时提供」，但退货规则不能省。",
      sources: [{ label: "消费者厅：海外网售问答", url: JP_FOREIGN }],
    },
    {
      text: "美国以为够不上 CCPA 就什么都不用挂：CalOPPA 没有门槛，收集加州用户信息就要隐私政策。",
      sources: [{ label: "加州商业与职业法典", url: CALOPPA }],
    },
    {
      text: "默认把俄罗斯用户的数据放在境外云上：用境外数据库收集和存储俄罗斯公民数据本身就违法，公司首次就罚 100 万到 600 万卢布。",
      sources: [{ label: "152-FZ 第 18 条", url: RU_152_LOCAL }],
    },
  ],
  unknowns: [
    "越南第 85/2021 号议定对境外商家的电商登记条件，以及新的《电子商务法》是否已经生效。",
    "印尼 PP 80/2019 要求境外电商指定当地代表的门槛；Komdigi 对小型境外 SaaS 是否实际执法。",
    "俄罗斯 152-FZ 怎么认定「面向俄罗斯的境外网站」（俄语、.ru、卢布结算等），监管部门没有公开口径。",
    "韩国没有营业执照的海外小卖家，首页的经营者信息怎么填、要不要做通信销售业申报。",
    "日本「外部送信规律」是否管境外运营者；数字内容和在线服务是否适用「8 天内可退」。",
    "德国 DDG 第 5 条对欧盟以外卖家的具体口径。",
    "英国 ICO 数据保护年费是否适用境外控制者。",
    "中国：境外服务器上的网站向境内用户收费，算不算「在境内」提供、要不要经营许可证；境外网站直接收集境内个人信息算不算数据出境。",
  ],
  related: [
    { label: "域名怎么选（ICP 备案）", path: "/domains" },
    { label: "服务器放哪、能不能打开（数据本地化）", path: "/hosting" },
    { label: "卖数字产品要交的税", path: "/digital-tax" },
    { label: "广告和联盟变现（广告的 cookie 同意）", path: "/ads-affiliate" },
  ],
};
