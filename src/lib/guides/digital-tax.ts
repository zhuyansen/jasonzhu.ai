import type { Guide } from "../go-global-guides";

// 境外卖家卖数字服务给各市场消费者要交的税：只写各国税务机关、法律原文和代收平台自己的文档；越南等新规部分来自四大事务所的解读。
// 一般信息，不是税务建议。调研笔记在 ~/出海/research/2026-11-by-market/06-digital-tax.md（不在仓库里）。
const OSS_GUIDE =
  "https://vat-one-stop-shop.ec.europa.eu/document/download/55f4ec9d-83e6-4942-9e8d-11d44c243087_en?filename=OSS+Guidelines_revised_1Jan2027_0.pdf";
const NTA_FOREIGN = "https://www.nta.go.jp/english/taxes/consumption_tax/0024006-219.pdf";
const KR_VAT_LAW = "https://www.law.go.kr/LSW/lsInfoP.do?lsId=001571";
const ID_PMSE = "https://www.pajak.go.id/id/pajakdigital";
const PADDLE_TAX = "https://www.paddle.com/help/sell/tax/which-countries-does-paddle-charge-sales-tax-or-vat-for";
const STRIPE_MP = "https://docs.stripe.com/payments/managed-payments/tax-compliance";

export const DIGITAL_TAX: Guide = {
  slug: "digital-tax",
  short: "卖数字产品要交的税",
  parent: { short: "收款平台选择器", path: "/payments" },
  title: "卖数字产品给海外消费者要交什么税：欧盟、英国、美国、日本、韩国、印尼、越南、俄罗斯的规定，以及代收平台替你交了哪些",
  description:
    "境外卖家把订阅软件、AI 工具、电子书卖给各国消费者时的税：欧盟和英国从第一笔就要交，日本、韩国、印尼、越南、俄罗斯给境外卖家的专门规定，美国各州的销售税，以及 Paddle、Lemon Squeezy、FastSpring 和应用商店替你交了哪些。",
  intro:
    "卖给个人消费者的数字产品，多数市场按买家所在地收税，境外卖家也逃不掉：欧盟和英国从第一笔就要交，日本、韩国、印尼、越南、俄罗斯都有专门给境外卖家的规定。最省事的办法是用代收平台（Merchant of Record），由它当卖方，替你算税、收税、交税。下面「境外卖家」都指在当地没有公司或机构的卖家。",
  checked: "2026-11-07",
  warning: {
    text: "这一页按各国税务机关和法律原文整理，是一般信息，不是税务建议。具体到你自己的情况，请找当地的税务顾问。",
  },
  sections: [
    {
      id: "mor",
      title: "先看代收平台替你交了哪些",
      lead: "直接用 Stripe、PayPal 收款时，你自己是卖方，各国的税要自己登记申报；代收平台是替你当卖方。",
      items: [
        {
          text: "Paddle 的税务页（2025 年 8 月更新）：欧盟走 OSS，只管个人买家；英国 20%、日本 10%、印尼 12%，个人和企业买家都收；韩国 10% 只收个人买家；越南按外国承包商税收；美国 38 个州加丹佛和华盛顿特区；没有列俄罗斯和中国。",
          sources: [{ label: "Paddle 税务", url: PADDLE_TAX }],
        },
        {
          text: "Lemon Squeezy 只说自己作为代收方代收代缴，没公布逐国清单，也不卖给俄罗斯买家。它 2026 年 1 月宣布推出 Stripe Managed Payments，并计划帮现有用户迁移；Stripe 这套方案在 80 多个国家代缴，包括欧盟、英国、美国、日本、韩国、印尼、越南，不包括俄罗斯和中国大陆。",
          sources: [
            { label: "Lemon Squeezy 税务", url: "https://docs.lemonsqueezy.com/help/payments/sales-tax-vat" },
            { label: "Lemon Squeezy 2026 公告", url: "https://www.lemonsqueezy.com/blog/2026-update" },
            { label: "Stripe Managed Payments", url: STRIPE_MP },
          ],
        },
        {
          text: "FastSpring 代收欧盟、英国、日本、韩国、印尼、越南、俄罗斯和美国 45 个州的税；在俄罗斯和越南，企业买家提供税号也不免税。",
          sources: [{ label: "FastSpring", url: "https://developer.fastspring.com/docs/about-vat-and-sales-tax" }],
        },
        {
          text: "应用内购买：Apple 在 80 多个地区代算、代收、代缴；Google Play 用自家结算时，替境外开发者负责欧盟、英国、美国所列各州、印尼、日本、韩国、越南和俄罗斯的税，用替代结算的要自己交。",
          sources: [
            { label: "Apple", url: "https://developer.apple.com/in-app-purchase/" },
            { label: "Google Play", url: "https://support.google.com/googleplay/android-developer/answer/138000" },
          ],
        },
      ],
    },
    {
      id: "eu",
      title: "欧盟：从第一笔就要交",
      items: [
        {
          text: "各成员国的标准税率在 17%（卢森堡）到 27%（匈牙利）之间。",
          sources: [{ label: "欧盟税率", url: "https://europa.eu/youreurope/business/finance-and-tax/vat/vat-rules-rates/index_en.htm" }],
        },
        {
          text: "1 万欧元的起征点只给只在一个欧盟国家设立的卖家；欧盟以外的卖家，第一笔卖给个人就要按买家所在国交税。",
          sources: [{ label: "欧盟 OSS 指南", url: OSS_GUIDE }],
        },
        {
          text: "用「非欧盟 OSS」在任意一个成员国登记，在那一处申报所有成员国的销售。按季度申报，没卖也要零申报，季度结束后的下个月月底前申报和缴款。",
          sources: [
            { label: "欧盟 OSS", url: "https://europa.eu/youreurope/business/taxation/vat/one-stop-shop/index_en.htm" },
            { label: "欧盟 OSS 指南", url: OSS_GUIDE },
          ],
        },
        {
          text: "卖给企业的，一般由买方在本国做逆向征收。",
          sources: [{ label: "跨境增值税", url: "https://europa.eu/youreurope/business/taxation/vat/cross-border-vat/index_en.htm" }],
        },
      ],
    },
    {
      id: "uk",
      title: "英国：也是第一笔就要登记",
      items: [
        {
          text: "标准税率 20%。在英国没有机构的卖家不适用 9 万英镑的起征点，卖出第一笔应税服务（包括数字服务）就要登记，30 天内办。",
          sources: [
            { label: "英国税率", url: "https://www.gov.uk/vat-rates" },
            { label: "HMRC 登记要求", url: "https://www.gov.uk/government/publications/vat-notice-7001-should-i-be-registered-for-vat/vat-notice-7001-should-i-be-registered-for-vat" },
          ],
        },
        {
          text: "通常每 3 个月申报一次，期末后 1 个月零 7 天内申报和缴款；卖给英国企业的由买方逆向征收。",
          sources: [
            { label: "HMRC 申报", url: "https://www.gov.uk/vat-returns" },
            { label: "HMRC 服务地规则", url: "https://www.gov.uk/guidance/vat-place-of-supply-of-services-notice-741a" },
          ],
        },
      ],
    },
    {
      id: "us",
      title: "美国：各州的销售税",
      items: [
        {
          text: "经济关联门槛：41 个州是一年卖进该州 10 万美元；加州、得州 50 万美元；纽约 50 万美元且超过 100 笔。还有 15 个州保留「或 200 笔」的标准，伊利诺伊、肯塔基 2026 年已经取消。",
          sources: [
            { label: "Sales Tax Institute", url: "https://salestaxinstitute.com/resources/economic-nexus-state-guide" },
            { label: "Avalara", url: "https://www.avalara.com/us/en/blog/2025/06/states-eliminating-economic-nexus-transaction-thresholds" },
          ],
        },
        {
          text: "SaaS：约 18 个州加华盛顿特区全额征税，康涅狄格、马里兰、俄亥俄、得州等部分征税；加州、佛州目前不征，但加州和科罗拉多从 2027 年 1 月 1 日起对 SaaS 征税。",
          sources: [
            { label: "TaxJar", url: "https://www.taxjar.com/sales-tax/saas-sales-tax" },
            { label: "Eide Bailly（2026-10-15）", url: "https://www.eidebailly.com/insights/blogs/2026/10/salt20261015" },
          ],
        },
        {
          text: "电子书、下载软件这类数字下载，约 31 个州一般要征税。",
          sources: [{ label: "Avalara", url: "https://www.avalara.com/us/en/blog/state-by-state-guide-to-digital-products-and-sales-tax.html" }],
        },
      ],
    },
    {
      id: "japan",
      title: "日本：消费税 10%",
      items: [
        {
          text: "税率 10%，其中国税 7.8%、地方税 2.2%。",
          sources: [{ label: "日本国税厅", url: "https://www.nta.go.jp/english/taxes/consumption_tax/01.htm" }],
        },
        {
          text: "卖给消费者的电子服务（电子书、软件、云服务等）由境外卖家自己申报缴纳；只给企业用的（比如广告）由日本买方逆向征收。网站写着「仅限企业」、实际挡不住个人购买的，仍算卖给消费者。",
          sources: [{ label: "国税厅境外企业手册", url: NTA_FOREIGN }],
        },
        {
          text: "基准期间的应税销售额不超过 1,000 万日元可以免税；境外卖家要指定纳税管理人。也可以自愿登记成合格发票开具方，日本企业买方要抵扣需要这种发票；登记以后，不论销售额多少都要纳税。",
          sources: [{ label: "国税厅境外企业手册", url: NTA_FOREIGN }],
        },
        {
          text: "2025 年 4 月起实行平台课税：经过被指定平台（App Store、Google Play、AWS Marketplace、Nintendo eShop，Epic Games Store 从 2026 年 12 月 1 日起）卖出并收款的部分，由平台申报纳税，卖家不用申报。",
          sources: [
            { label: "平台课税说明", url: "https://www.nta.go.jp/english/taxes/consumption_tax/0024004-028_01.pdf" },
            { label: "指定平台名单", url: "https://www.nta.go.jp/publication/pamph/shohi/kazei/pdf/0024010-019.pdf" },
          ],
        },
      ],
    },
    {
      id: "korea",
      title: "韩国：增值税 10%，没有起征点",
      items: [
        {
          text: "境外企业通过网络向韩国提供游戏、音视频、软件、广告、云服务等，开始营业 20 日内要办简易事业者登记，法律没有金额门槛；税率 10%，每季度结束后 25 日内申报缴纳。",
          sources: [{ label: "韩国增值税法", url: KR_VAT_LAW }],
        },
        {
          text: "卖给已登记的韩国企业、用于其经营的，不在这项登记范围内；开放市场和代收货款的平台被视为提供者。",
          sources: [{ label: "韩国增值税法", url: KR_VAT_LAW }],
        },
      ],
    },
    {
      id: "indonesia",
      title: "印尼：由税务总局指定",
      items: [
        {
          text: "境外电商卖家代收增值税，名义税率 12%，但税基是售价的 11/12，实际约 11%。",
          sources: [
            { label: "印尼税务总局", url: ID_PMSE },
            { label: "PMK 131/2024 解读", url: "https://www.pajak.go.id/id/artikel/pmk-1312024-tarif-ppn-sebelas-dua-belas" },
          ],
        },
        {
          text: "一年在印尼的交易额超过 6 亿印尼盾（或每月 5,000 万），和/或访问量超过一年 12,000 次（或每月 1,000 次）的，会被税务总局指定为代收人；没到门槛也可以主动申请。按月缴款和申报，下个月月底前。",
          sources: [{ label: "印尼税务总局", url: ID_PMSE }],
        },
      ],
    },
    {
      id: "vietnam",
      title: "越南：2025、2026 年连续改规则",
      items: [
        {
          text: "2025 年 7 月 1 日起，境外卖家经电商或数字平台向越南提供服务，增值税从 5% 改成 10%。",
          sources: [
            { label: "Deloitte", url: "https://www.deloitte.com/content/dam/assets-zone1/southeast-asia/en/docs/services/tax/2024/vn-tax-alert-new-law-on-vat-vi.pdf" },
            { label: "PwC", url: "https://taxsummaries.pwc.com/vietnam/corporate/other-taxes" },
          ],
        },
        {
          text: "2026 年 7 月 1 日起的第 252 号议定：越南企业买方付款时代扣；有下单和支付功能的平台代扣；都没人代扣的，卖家自己登记、申报、缴纳，经常性业务按月报。",
          sources: [
            { label: "EY（2026-07-30）", url: "https://www.ey.com/en_vn/technical/tax/tax-and-law-updates/digital-tax-regulatory-update-in-vietnam" },
            { label: "PwC", url: "https://taxsummaries.pwc.com/vietnam/corporate/withholding-taxes" },
          ],
        },
        {
          text: "越南收入已经全部被代扣代缴的卖家，可以不办税务登记。",
          sources: [{ label: "LuatVietnam（2026-07-09）", url: "https://luatvietnam.vn/legal-updates/foreign-suppliers-exempt-from-tax-registration-in-certain-cases-from-july-1-2026-892-110260-article.html" }],
        },
      ],
    },
    {
      id: "russia",
      title: "俄罗斯",
      items: [
        {
          text: "增值税 2026 年 1 月 1 日起涨到 22%；电子服务按含税价的 22/122 计算，约 18.03%。",
          sources: [
            { label: "俄罗斯税务局", url: "https://www.nalog.gov.ru/rn26/news/smi/16596761/" },
            { label: "税法典第 174.2 条", url: "https://www.audit-it.ru/nk/174_2.html" },
          ],
        },
        {
          text: "境外电子服务商在税务局的专门网上专区登记，约 30 个工作日开通；季度结束后下个月 25 日前申报、28 日前缴款。卖给俄罗斯企业也由卖家交，不做逆向征收。",
          sources: [
            { label: "境外服务商专区", url: "https://lkioreg.nalog.ru/en/" },
            { label: "税法典第 174.2 条", url: "https://www.audit-it.ru/nk/174_2.html" },
          ],
        },
        {
          text: "实际上 Paddle 和 Lemon Squeezy 都不卖给俄罗斯买家，见「各市场买家怎么付钱」那篇。",
          sources: [{ label: "Paddle", url: "https://www.paddle.com/help/legal/sanctions/which-countries-are-supported-by-paddle" }],
        },
      ],
    },
    {
      id: "china",
      title: "中国大陆",
      items: [
        {
          text: "《增值税法》2026 年 1 月 1 日施行：服务在境内消费就要交税，服务的税率一般是 6%；境外卖家在境内的应税交易，由购买方代扣代缴。",
          sources: [{ label: "增值税法", url: "https://fgk.chinatax.gov.cn/zcfgk/c100009/c5237365/content.html" }],
        },
        {
          text: "实施条例没写境外卖家卖给个人时怎么登记，没找到类似欧盟 OSS 那样给境外卖家的途径。",
          sources: [{ label: "增值税法实施条例", url: "https://fgk.chinatax.gov.cn/zcfgk/c100010/c5246349/content.html" }],
        },
      ],
    },
  ],
  pitfalls: [
    {
      text: "以为没卖到 1 万欧元就不用交欧盟增值税：这个起征点只给在欧盟设立的卖家。",
      sources: [{ label: "欧盟 OSS 指南", url: OSS_GUIDE }],
    },
    {
      text: "以为英国有 9 万英镑的起征点：境外卖家第一笔就要登记。",
      sources: [{ label: "HMRC 登记要求", url: "https://www.gov.uk/government/publications/vat-notice-7001-should-i-be-registered-for-vat/vat-notice-7001-should-i-be-registered-for-vat" }],
    },
    {
      text: "网站写一句「仅限企业购买」就当成卖给企业：日本国税厅说挡不住个人购买的，仍算卖给消费者。",
      sources: [{ label: "国税厅境外企业手册", url: NTA_FOREIGN }],
    },
    {
      text: "美国只看销售额门槛：还有 15 个州按笔数算，一年 200 笔就够了。",
      sources: [{ label: "Sales Tax Institute", url: "https://salestaxinstitute.com/resources/economic-nexus-state-guide" }],
    },
    {
      text: "卖给俄罗斯企业，以为对方会逆向征收：俄罗斯规定由境外卖家交。",
      sources: [{ label: "税法典第 174.2 条", url: "https://www.audit-it.ru/nk/174_2.html" }],
    },
  ],
  unknowns: [
    "越南：第 252、90 号文件原文没读到，越南给境外卖家的报税网站打不开；数字服务的企业所得税比例、按月申报的截止日、有没有登记门槛，以及 2025 年 7 月到 2026 年底增值税减 2% 是否适用于境外数字服务，都没核实。",
    "俄罗斯：18.03% 来自法条转载，税务局官网没有专门说明；FastSpring 现在是否实际接受俄罗斯的付款。",
    "韩国：未登记的罚则没核实。",
    "印尼：卖给企业怎么处理，税务总局的页面没写。",
    "日本：「基准期间」的具体定义，以及 2024 年改正对新设外国公司的其他规定。",
    "欧盟：电子书等能不能用低税率，各国不同，没有逐国查。",
    "美国：各州的申报频率和地方税没覆盖；不同来源统计的 SaaS 应税州数不一致。",
    "Paddle 税务页是 2025 年 8 月的版本，越南改成 10% 以后是否已更新；Lemon Squeezy 迁移到 Stripe 的时间表没公布。",
  ],
  related: [
    { label: "收款平台选择器", path: "/payments" },
    { label: "各市场买家怎么付钱", path: "/local-payments" },
    { label: "国内、英国、美国三家公司怎么分工", path: "/company-roles" },
    { label: "出金和报税", path: "/cash-out" },
  ],
};
