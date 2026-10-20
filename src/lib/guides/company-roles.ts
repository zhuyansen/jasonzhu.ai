import type { Guide } from "../go-global-guides";

// 同时有国内公司、英国公司、美国一人 LLC 时怎么分工，加 D-U-N-S 和开发者账号的步骤清单。
// 「三家各管什么」是建议，不冒充官方规定；其余每条按官方页面整理，核实于 2026-10-20：国内增值税 2026-01-01 起按增值税法实施条例，BOI 豁免 2026-08-14 起是永久的，
// AI 生成内容的显式标识只针对可能让公众混淆的服务（隐式标识全部要加）。
// 美国一侧只写外国人持有的一人 LLC（报税上穿透的 disregarded entity），C 公司另算。

const IRS_W9_FORM = "https://www.irs.gov/pub/irs-pdf/fw9.pdf";
const IRS_5472 = "https://www.irs.gov/instructions/i5472";
const IRS_SS4 = "https://www.irs.gov/instructions/iss4";
const APPLE_ICP = "https://developer.apple.com/help/app-store-connect/reference/app-information/";
const APPLE_STATUS = "https://developer.apple.com/help/app-store-connect/reference/app-information/app-and-submission-statuses/";
const APPLE_DUNS = "https://developer.apple.com/support/D-U-N-S/";
const APPLE_ENROLL = "https://developer.apple.com/support/enrollment/";
const APPLE_DSA = "https://developer.apple.com/help/app-store-connect/manage-compliance-information/manage-european-union-digital-services-act-trader-requirements/";
const GOOGLE_ORG = "https://support.google.com/googleplay/android-developer/answer/13628312";
const MIIT_FILING = "https://www.miit.gov.cn/zwgk/zcwj/wjfb/tz/art/2023/art_920db564162e4312916a01bed6540ad8.html";
const CAC_AI = "https://www.cac.gov.cn/2026-09/14/c_1791136833136332.htm";
const CAC_LABEL = "https://www.cac.gov.cn/2025-03/14/c_1743654684782215.htm";
const WY_SOS = "https://sos.wyo.gov/faqs.aspx?root=BUS";
const VAT_2026 = "https://fgk.chinatax.gov.cn/zcfgk/c102416/c5247437/content.html";
const HMRC_TERRITORIES = "https://www.gov.uk/hmrc-internal-manuals/international-manual/intm412090";
// 国内安卓商店：上架资质（软著）和企业账号认证，各家开发者文档
const SOFTCOPY = [
  { label: "小米", url: "https://dev.mi.com/xiaomihyperos/documentation/detail?pId=2251" },
  { label: "OPPO", url: "https://open.oppomobile.com/documentation/page/info?id=12133" },
  { label: "vivo", url: "https://dev.vivo.com.cn/documentCenter/doc/90" },
  { label: "荣耀", url: "https://developer.honor.com/cn/doc/guides/101152" },
  { label: "应用宝", url: "https://wikinew.open.qq.com/index.html#/iwiki/4007776097" },
  { label: "华为", url: "https://developer.huawei.com/consumer/cn/doc/doccenter-submission/80301" },
];
const STORE_ACCOUNTS = [
  { label: "华为", url: "https://developer.huawei.com/consumer/cn/doc/doccenter-getting-started/hdc-edrna-process-0000002752798603" },
  { label: "小米", url: "https://dev.mi.com/xiaomihyperos/documentation/detail?pId=1731" },
  { label: "OPPO", url: "https://open.oppomobile.com/documentation/page/info?id=10446" },
  { label: "vivo", url: "https://dev.vivo.com.cn/documentCenter/doc/2" },
  { label: "荣耀", url: "https://developer.honor.com/cn/doc/guides/100619" },
  { label: "应用宝", url: "https://wikinew.open.qq.com/index.html#/iwiki/4007776081" },
];

export const COMPANY_ROLES: Guide = {
  slug: "company-roles",
  short: "三家公司怎么分工",
  parent: { short: "开户指南", path: "/open-account" },
  title: "国内公司、英国公司、美国 LLC 怎么分工：App 挂哪家、账号怎么开、每年要报什么",
  description:
    "同时有国内公司、英国公司和美国一人 LLC：国内版和海外版 App 各挂哪家，D-U-N-S 和苹果、Google、国内安卓商店的开发者账号按什么顺序开，三家每年各要报什么，国内公司给英国公司做开发怎么按合同收服务费。按官方页面整理。",
  intro:
    "三家各有门槛：苹果中国区要工信部备案号，只有国内公司办得了；商店收入挂英国公司，按英美税收协定一般不被美国预扣；美国 LLC 开 Stripe 美国账户最顺手，但外国人持有的一人 LLC 每年要交 5472。下面先给一种分工和开账号的顺序，再按官方页面整理每家要办的事，最后是三家之间的钱怎么合规地走。",
  checked: "2026-10-20",
  sections: [
    {
      id: "roles",
      title: "三家各管什么",
      lead: "这是一种分法，不是官方规定：按每家能办什么、哪家收钱少被扣税来分。",
      items: [
        {
          text: "国内公司管国内版 App：上架苹果中国区（用国内公司自己的开发者账号）和国内安卓商店，收款用苹果内购、微信支付、支付宝。苹果中国区要填工信部的备案号，备案要国内主体，英国公司和美国公司都办不了。",
          sources: [
            { label: "苹果", url: APPLE_ICP },
            { label: "工信部", url: MIIT_FILING },
          ],
        },
        {
          text: "英国公司管海外版 App，也是海外业务的主体：上架苹果除中国大陆以外的所有区和 Google Play，网页收款用 Stripe 英国账户或 Paddle 这类代收平台。在苹果、Google 填 W-8BEN-E 时按英美税收协定申请优惠，美国区收入一般不被预扣。",
          sources: [{ label: "IRS W-8BEN-E 说明", url: "https://www.irs.gov/instructions/iw8bene" }],
        },
        {
          text: "美国一人 LLC 只管美国收款和要美国主体的事：开 Stripe 美国账户收美国客户的网页付款（美国卡在美国账户按本地费率；在英国账户算国际卡，可能还要付换汇费），开美国账户收美元。不开商店账号。",
          sources: [
            { label: "Stripe 美国费率", url: "https://stripe.com/pricing" },
            { label: "Stripe 英国费率", url: "https://stripe.com/gb/pricing" },
          ],
        },
        {
          text: "商店为什么不挂一人 LLC：外国人持有的一人 LLC 在报税上是穿透的，不能填 W-9，有美国税号也不行，要由外国所有者填 W-8 系列表格；美国区收入按付给外国个人处理，可能被预扣。",
          sources: [{ label: "IRS W-9 表", url: IRS_W9_FORM }],
        },
        {
          text: "国内版和海外版是两个 App：用不同的 Bundle ID，各挂各的开发者账号。国内用户的数据存在国内服务器，海外用户的数据存在海外；国内的个人信息要出境另有规定。",
        },
      ],
    },
    {
      id: "accounts",
      title: "D-U-N-S 和开发者账号：按这个顺序办",
      lead: "D-U-N-S 最慢，最先办；英国公司的账号先开，海外版先上；国内版等备案、软著办齐再提交。",
      items: [
        {
          text: "第 1 步，D-U-N-S（邓白氏编码）：国内公司和英国公司各要一个，美国 LLC 不开商店账号就不用。登录 Apple 账号后用苹果的 D-U-N-S 查询工具查，查不到就在工具里提交：公司法定名称、总部地址、邮寄地址和你的工作联系方式。免费。邓白氏最多 5 个工作日发号，加急没用；发号后苹果最多再过 2 个工作日才能查到。超过 2 周没消息、或者已有编码但信息对不上，都发邮件给邓白氏处理。",
          sources: [
            { label: "苹果 D-U-N-S 说明", url: APPLE_DUNS },
            { label: "中文版", url: "https://developer.apple.com/cn/support/D-U-N-S/" },
            { label: "查询工具", url: "https://developer.apple.com/enroll/duns-lookup/" },
          ],
        },
        {
          text: "第 2 步，英国公司注册苹果开发者（组织）：公司要是法人实体（商号、分支机构不行）；有 D-U-N-S；你有代表公司签约的权限，不是公司所有人的话要提供能证明这一点的联系人；用公司域名的工作邮箱；公司域名上有能正常访问的网站（社交主页、停放的域名不算）；开了双重认证、用法定姓名的 Apple 账号。可以在 iPhone、iPad、Mac 上的 Apple Developer App 里注册。年费 99 美元，注册时按当地货币显示。苹果可能联系你核实，或要公证文件。",
          sources: [
            { label: "苹果注册要求", url: APPLE_ENROLL },
            { label: "费用", url: "https://developer.apple.com/programs/enroll/" },
          ],
        },
        {
          text: "第 3 步，英国公司注册 Google Play（组织账号）：一次性 25 美元，身份核验不通过不退。要 D-U-N-S（免费，但 Google 说申请最长要 30 天）、组织电话和网站；联系人和对外显示的开发者邮箱、电话都要用验证码核验；还要交政府证件和与付款资料一致的组织文件，并验证网站。连续 14 天、至少 12 人的封闭测试要求只针对 2023 年 11 月 13 日以后注册的个人账号。",
          sources: [
            { label: "Google 组织账号要求", url: GOOGLE_ORG },
            { label: "身份核验", url: "https://support.google.com/googleplay/android-developer/answer/10841920" },
            { label: "封闭测试要求", url: "https://support.google.com/googleplay/android-developer/answer/14151465" },
          ],
        },
        {
          text: "第 4 步，英国公司的 App Store Connect：签付费 App 协议，填税表（W-8BEN-E）和银行账户；申报欧盟 DSA 商户身份，每个开发者都要申报，组织的 D-U-N-S 地址会自动显示在欧盟商品页，2025 年 2 月 17 日起没申报的 App 从欧盟下架；销售范围去掉中国大陆。",
          sources: [
            { label: "苹果 DSA 要求", url: APPLE_DSA },
            { label: "苹果公告", url: "https://developer.apple.com/news/?id=einwn76m" },
          ],
        },
        {
          text: "第 5 步，美国 LLC 的 EIN：没有 SSN 或 ITIN 不能网上申请。可以打 +1 267-941-1099（不是免费电话，美东时间周一到周五 6:00 到 23:00，打电话的人要有权代表公司领号）；或把 SS-4 表从美国境外传真到 304-707-9471，一般 4 个工作日内回传；邮寄约 4 周。拿到 EIN 再开美国银行账户和 Stripe 美国账户，Stripe 里以所有者个人身份填 W-8BEN。",
          sources: [
            { label: "IRS SS-4 说明", url: IRS_SS4 },
            { label: "IRS 网上申请说明", url: "https://www.irs.gov/businesses/small-businesses-self-employed/apply-for-an-employer-identification-number-ein-online" },
          ],
        },
        {
          text: "第 6 步，国内公司的苹果开发者：在中国大陆只能用 iPhone 或 iPad 上的 Apple Developer App 注册，要做 CFCA 身份核验和自拍，年费 688 元。",
          sources: [{ label: "苹果中文说明", url: "https://developer.apple.com/cn/support/app-account/" }],
        },
        {
          text: "第 7 步，国内安卓商店的企业开发者：华为、小米、OPPO、vivo、荣耀、应用宝都用营业执照认证，再用对公账户打款或人工审核（各家细节不同）；小米只接受企业账号。软著、App 备案（和需要的 AI 登记）办齐再提交 App。",
          sources: STORE_ACCOUNTS,
        },
      ],
    },
    {
      id: "china-app",
      title: "国内版：国内公司要办的",
      items: [
        {
          text: "App 备案：工信部 2023 年 8 月发的通知要求，在境内提供互联网信息服务的 App 先备案再上线；已有的 App 在 2023 年 9 月到 2024 年 3 月之间补办。应用商店不能分发没备案的 App。",
          sources: [
            { label: "工信部通知", url: MIIT_FILING },
            { label: "中国政府网", url: "https://www.gov.cn/zhengce/zhengceku/202308/content_6897341.htm" },
          ],
        },
        {
          text: "苹果中国区的备案号：在 App Store Connect 的 App 信息里填，要和工信部备案的信息一致；没有有效备案号的 App 不能在中国大陆区上架。",
          sources: [
            { label: "App 信息", url: APPLE_ICP },
            { label: "状态说明", url: APPLE_STATUS },
          ],
        },
        {
          text: "软著：小米、OPPO、vivo、荣耀、应用宝上架每个 App 都要《计算机软件著作权登记证书》，或《APP 电子版权证书》《软件著作权认证证书》之一，小米还不接受「申请中」；华为目前不强制，游戏除外（要软著加版号）。",
          sources: SOFTCOPY,
        },
        {
          text: "生成式 AI：具有舆论属性或社会动员能力的生成式 AI 服务要向网信办备案或登记；直接调用已备案大模型（比如走 API）的 App 或功能，由地方网信办登记。截至 2026 年 8 月 31 日，全国 1,112 款服务完成备案、731 款应用或功能完成登记。上线后要公示用的模型名称和备案号或上线编号。",
          sources: [{ label: "网信办 2026-09-14 公告", url: CAC_AI }],
        },
        {
          text: "AI 生成内容的标识：2025 年 9 月 1 日起，AI 生成的文字、图片、音频、视频、虚拟场景都要在文件元数据里加隐式标识；可能让公众混淆或误认的（比如换脸、合成人声），还要加看得见的显式标识。应用商店上架时会核验标识相关材料。",
          sources: [
            { label: "标识办法", url: CAC_LABEL },
            { label: "深度合成规定第 17 条", url: "https://www.cac.gov.cn/2022-12/11/c_1672221949354811.htm" },
          ],
        },
      ],
    },
    {
      id: "overseas-app",
      title: "海外版：英国公司要办的",
      lead: "开账号见上面第 2 到第 4 步，这里是每年的事。",
      items: [
        {
          text: "公司税：利润 5 万镑以内 19%，25 万镑以上 25%，中间按比例过渡；有关联公司的，这两个界限要按公司数分摊。",
          sources: [
            { label: "GOV.UK", url: "https://www.gov.uk/corporation-tax-rates" },
            { label: "税率表", url: "https://www.gov.uk/government/publications/rates-and-allowances-corporation-tax/rates-and-allowances-corporation-tax" },
          ],
        },
        {
          text: "数据保护费：处理个人信息的英国公司每年交给 ICO。员工 10 人以内或年营业额 63.2 万镑以内的第一档 52 镑，直接扣款 47 镑（2025 年 2 月起，之前是 40 镑）。",
          sources: [
            { label: "ICO", url: "https://ico.org.uk/for-organisations/data-protection-fee/faqs-data-protection-fee-payment-and-online-registration/" },
            { label: "2025 年第 63 号条例", url: "https://www.legislation.gov.uk/uksi/2025/63/contents" },
          ],
        },
        {
          text: "年度账目和确认声明：每年都要交给 Companies House，自己办的过程见文末的相关文章。",
          sources: [
            { label: "年度账目", url: "https://www.gov.uk/file-your-company-annual-accounts" },
            { label: "确认声明", url: "https://www.gov.uk/file-your-confirmation-statement-with-companies-house" },
          ],
        },
      ],
    },
    {
      id: "us-llc",
      title: "美国一人 LLC：每年要报什么",
      lead: "州的部分以最常见的怀俄明 LLC 为例，其他州的年报和州税不一样。",
      items: [
        {
          text: "Form 5472：外国人持有的一人 LLC 每年按 1120 的截止日（日历年就是 4 月 15 日）交 Form 5472，附在一份只填基本信息的 Form 1120 上，1120 顶部写 Foreign-owned U.S. DE。所有者和公司之间的往来，比如往公司里放钱、从公司拿钱，都要报。不能电子申报：传真到 855-887-7737，或寄到 IRS 在犹他州 Ogden 的地址（见说明）。来不及就在 4 月 15 日前用 Form 7004 申请延期，一般延 6 个月。没交或报不全罚 25,000 美元，IRS 通知后 90 天还没改，每 30 天再罚 25,000 美元。",
          sources: [
            { label: "IRS 5472 说明", url: IRS_5472 },
            { label: "1120 截止日", url: "https://www.irs.gov/instructions/i1120" },
            { label: "7004 延期", url: "https://www.irs.gov/instructions/i7004" },
          ],
        },
        {
          text: "怀俄明年报：截止日是每年成立月份的第一天（1 月 15 日成立的，就是每年 1 月 1 日），最早可以提前 120 天交。年费 60 美元，或公司在怀俄明的资产乘 0.0002，取高的（资产 30 万美元以内都是 60 美元）。过了截止日 60 天还没交，公司会被行政解散，2 年内可以恢复。",
          sources: [{ label: "怀俄明州务卿", url: WY_SOS }],
        },
        {
          text: "州所得税：怀俄明没有个人所得税，也没有公司所得税。对比加州：在加州成立或在加州做生意的 LLC 每年至少交 800 美元，加州总收入 25 万美元以上再按档交 900 到 11,790 美元的 LLC 费；公司（C corp）税率 8.84%。外州公司一年在加州的销售额超过 757,070 美元（2025 年的标准）或占总销售额 25%，也算在加州做生意。",
          sources: [
            { label: "怀俄明州政府", url: "https://www.wyo.gov/about-wyoming" },
            { label: "加州 LLC", url: "https://www.ftb.ca.gov/file/business/types/limited-liability-company/index.html" },
            { label: "加州税率", url: "https://www.ftb.ca.gov/file/business/tax-rates.html" },
            { label: "加州「做生意」标准", url: "https://www.ftb.ca.gov/file/business/doing-business-in-california.html" },
          ],
        },
        {
          text: "BOI（受益所有人）申报：FinCEN 2026 年 8 月 14 日生效的最终规则，永久免除了美国本土成立的公司的申报义务。",
          sources: [
            { label: "FinCEN", url: "https://www.fincen.gov/news/news-releases/fincen-permanently-ends-beneficial-ownership-reporting-requirements-millions" },
            { label: "联邦公报", url: "https://www.federalregister.gov/documents/2026/08/14/2026-16576/beneficial-ownership-information-reporting-requirement-revision" },
          ],
        },
      ],
    },
    {
      id: "dev-fee",
      title: "国内公司给英国公司做开发：合同和服务费",
      lead: "海外版的代码由国内团队写的话，常见做法是两家签开发服务合同：英国公司按合同付服务费，代码的知识产权归英国公司。",
      items: [
        {
          text: "合同写清楚：服务范围和交付物、验收方式、付款后代码和相关知识产权归英国公司、定价方法、按月或按季开英文发票（Invoice）、币种和付款期限、保密和适用法律。",
        },
        {
          text: "定价：两家同属一个人控制，是关联交易，要按独立交易原则定价，开发服务常见用成本加成（成本加一个可比的利润率）。国内公司年度企业所得税申报时要附关联业务往来报告表；其他关联交易一年超过 4,000 万元才要另准备本地文档。",
          sources: [{ label: "税务总局 2016 年第 42 号公告", url: "https://fgk.chinatax.gov.cn/zcfgk/c100012/c5194659/content.html" }],
        },
        {
          text: "增值税（2026 年 1 月 1 日起按增值税法实施条例）：向境外单位提供、完全在境外消费的软件服务（含软件开发）、研发服务等适用零税率。走零税率要办出口退（免）税备案，软件服务合同还要先在商务部的「服务外包及软件出口管理信息系统」登记，研发服务要技术出口合同登记证。小规模纳税人改为免税，要办免税备案。也可以放弃零税率选免税，放弃后 36 个月内不能改回；退税或免税没在 36 个月内申报的，按境内销售征税。",
          sources: [
            { label: "增值税法实施条例", url: "https://www.gov.cn/zhengce/content/202512/content_7053149.htm" },
            { label: "2026 年第 11 号公告", url: VAT_2026 },
            { label: "软件服务的范围", url: "https://www.gov.cn/zhengce/zhengceku/202602/content_7056762.htm" },
            { label: "免税备案（2016 年第 29 号公告）", url: "https://fgk.chinatax.gov.cn/zcfgk/c100012/c5194646/content.html" },
          ],
        },
        {
          text: "企业所得税：小型微利企业（年应纳税所得额不超过 300 万元、从业人数不超过 300 人、资产总额不超过 5,000 万元）减按 25% 计入应纳税所得额、按 20% 的税率缴纳，算下来是 5%，执行到 2027 年 12 月 31 日。",
          sources: [{ label: "财政部 税务总局 2023 年第 12 号公告", url: "https://fgk.chinatax.gov.cn/zcfgk/c102416/c5210453/content.html" }],
        },
        {
          text: "合同登记：技术出口合同（含技术服务合同）在合同生效后 60 天内网上登记；给境外客户定制开发软件属于软件出口，走商务部的软件出口合同登记，办零税率时要用。",
          sources: [
            { label: "技术进出口合同登记管理办法", url: "https://policy.mofcom.gov.cn/claw/clawContent.shtml?id=679" },
            { label: "软件出口管理和统计办法", url: "https://www.gov.cn/gongbao/content/2002/content_61890.htm" },
          ],
        },
        {
          text: "收汇：英国公司电汇到国内公司的对公外币账户。单笔 5 万美元以内，银行原则上不审单证；超过的，银行看合同、发票这些单证。境外来的钱在入账或结汇后 5 个工作日内做国际收支申报；关联方之间预收预付的期限原则上不超过 12 个月。",
          sources: [
            { label: "经常项目外汇业务指引（2020 年版）", url: "https://www.gov.cn/gongbao/content/2020/content_5560296.htm" },
            { label: "国际收支申报（汇发〔2022〕22 号）", url: "https://www.safe.gov.cn/shanghai/file/file/20220805/3c96795aa2c74461bd9eee8efe4d8b0c.pdf" },
          ],
        },
        {
          text: "英国这边：中小企业和中国关联方之间的交易不适用英国的转让定价规则，因为中国在 HMRC 的合格地区名单上；但国内一侧的关联交易规则照样适用。",
          sources: [
            { label: "HMRC 中小企业豁免", url: "https://www.gov.uk/hmrc-internal-manuals/international-manual/intm412070" },
            { label: "合格地区名单", url: HMRC_TERRITORIES },
          ],
        },
        {
          text: "别写成授权分成：英国公司向境外付特许权使用费，要按基本税率 20% 代扣所得税，中英税收协定降到 10%。所以合同写成「开发服务 + 代码知识产权转让」，不要写成「授权使用、按销售额分成」；一份合同里既有服务又有授权的，要拆开算。",
          sources: [
            { label: "英国所得税法第 906 条", url: "https://www.legislation.gov.uk/ukpga/2007/3/section/906" },
            { label: "HMRC 说明", url: "https://www.gov.uk/hmrc-internal-manuals/international-manual/intm630250" },
            { label: "混合合同要拆分", url: "https://www.gov.uk/hmrc-internal-manuals/international-manual/intm630330" },
            { label: "中英税收协定", url: "https://www.gov.uk/government/publications/china-tax-treaties/2011-uk-china-double-taxation-agreement-in-force" },
          ],
        },
        {
          text: "出口管制：《中国禁止出口限制出口技术目录》（2023 年版）里限制出口的 AI 技术只有两项：专门用于汉语及少数民族语言的人工智能交互界面技术、基于数据分析的个性化信息推送服务技术，出口要许可。商务部 2026 年 10 月 16 日公布征求意见稿，拟再加 23 项 AI 技术（大模型、智能体等），清单里的技术现在出口就要先登记。商务部的问答说，通过 API、App、网页、SaaS 提供服务不算技术出口，在境外本地部署才算；把代码交给英国公司之前，先对一下清单。",
          sources: [
            { label: "2023 年版目录", url: "https://www.most.gov.cn/tztg/202312/W020231221620858841394.pdf" },
            { label: "2026 年征求意见稿", url: "https://www.mofcom.gov.cn/zwgk/zcfb/art/2026/art_0a31a3c9ac404f7a9b0e917ce3412997.html" },
            { label: "商务部答记者问", url: "https://www.mofcom.gov.cn/syxwfb/art/2026/art_a4acff07e134447fbe7bbeb486df3ea6.html" },
          ],
        },
      ],
    },
  ],
  pitfalls: [
    {
      text: "用英国公司的苹果账号上架时没去掉中国大陆区：没有有效备案号，App 在中国大陆区就上不了。",
      sources: [{ label: "苹果状态说明", url: APPLE_STATUS }],
    },
    {
      text: "D-U-N-S 拖到最后才办：苹果那边最多 5 加 2 个工作日，Google 说申请最长要 30 天。",
      sources: [
        { label: "苹果", url: APPLE_DUNS },
        { label: "Google", url: GOOGLE_ORG },
      ],
    },
    {
      text: "给外国人持有的一人 LLC 填 W-9：不行，要由外国所有者填 W-8。",
      sources: [{ label: "IRS W-9 表", url: IRS_W9_FORM }],
    },
    {
      text: "以为一年没生意就不用报 5472：所有者往公司放钱、从公司拿钱都算要报的往来，没报罚 25,000 美元。",
      sources: [{ label: "IRS 5472 说明", url: IRS_5472 }],
    },
    {
      text: "怀俄明年报忘了交：过截止日 60 天公司就被行政解散。",
      sources: [{ label: "怀俄明州务卿", url: WY_SOS }],
    },
    {
      text: "三家之间不签合同直接转钱，或者让英国公司把钱打到个人账户：国内外的税务和外汇都说不清。",
    },
  ],
  unknowns: [
    "美国一人 LLC 的利润在国内个人所得税上算哪类所得、美国预扣的税能不能抵免，官方没有针对这种结构的说明，要问税务师。",
    "关联交易的成本加成率多少算合理，没有官方固定数字，要看可比公司。",
    "Google 只说 12 人封闭测试针对个人账号，没有明说组织账号不用做。",
    "苹果没公布英国的年费英镑价格，注册时按当地货币显示。",
    "HMRC 没有页面直接写「付给境外的服务费不用代扣税」，只说服务和授权混在一份合同里的要拆开算。",
    "新的 AI 技术出口清单还是征求意见稿（2026 年 11 月 15 日截止），最终范围没定。",
  ],
  posts: ["us-llc-mercury-stripe-168-usd", "uk-company-annual-review-timeline-checklist", "uk-company-wise-business-account"],
};
