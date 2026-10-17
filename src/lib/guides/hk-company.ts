import type { Guide } from "../go-global-guides";

// 香港公司注册以后每年要做什么、花多少：全部按公司注册处、税务局、条例原文和金管局整理；
// 审计、秘书、地址的价格没有官方标准，标「市场报价」。
const CR = "https://www.cr.gov.hk/en/compliance/annual-return/private-company.htm";
const BEL = "https://www.ird.gov.hk/eng/pdf/bel26e.pdf";
const CR_AUDIT_FAQ = "https://cr.gov.hk/en/companies_ordinance/faq_account-audit.htm";

export const HK_COMPANY: Guide = {
  slug: "hk-company",
  short: "香港公司年审",
  parent: { short: "开户指南", path: "/open-account" },
  title: "香港公司注册以后每年要做什么：周年申报、商业登记、审计报税和费用",
  description:
    "为了开 Stripe 注册了香港公司，之后每年要交周年申报表、续商业登记、做审计报利得税，还要有公司秘书和香港地址。按公司注册处、税务局官方页面整理时间表和每年最低成本。",
  intro:
    "很多人为了开 Stripe 注册香港公司，注册完才发现每年都有固定的申报和审计。下面按公司注册处、税务局和条例原文整理，从第一年到注销都包括在内。",
  checked: "2026-10-17",
  sections: [
    {
      id: "yearly",
      title: "每年固定要交的",
      items: [
        {
          text: "周年申报表（NAR1）：每年成立周年日后 42 天内交，按时交 HK$105。逾期 42 天到 3 个月 HK$870，之后逐级加到 HK$3,480，处长不能延期也不能免；逾期还属刑事罪行，最高罚 HK$50,000。成立当年不用交。",
          sources: [
            { label: "公司注册处", url: CR },
            { label: "条例第 662 条", url: "https://www.elegislation.gov.hk/hk/cap622!en/s662" },
          ],
        },
        {
          text: "商业登记证：本地公司不论有没有营业，都要每年续，直到公司解散。2026 年 4 月 1 日以后起始的 1 年证 HK$2,350（登记费 2,200 加征费 150），3 年证 HK$6,170。",
          sources: [
            { label: "税务局", url: "https://www.ird.gov.hk/eng/tax/bre_cbr.htm" },
            { label: "费用数据", url: "https://www.ird.gov.hk/datagovhk/brfee.csv" },
          ],
        },
        {
          text: "利得税报税表（BIR51）：新公司一般在成立后约 18 个月收到第一份，3 个月内交。之后每年 4 月 1 日整批发出，一般 1 个月内交；请了税务代表的可以按年结日整批延期。",
          sources: [
            { label: "整批延期信", url: BEL },
            { label: "2026 年发表公告", url: "https://www.ird.gov.hk/eng/ppr/archives/26040102.htm" },
          ],
        },
        {
          text: "雇主报税表（BIR56A）：每年 4 月发出，收到后 1 个月内交，没有雇员也要交（勾「NO」）。",
          sources: [{ label: "税务局", url: "https://www.ird.gov.hk/eng/tax/ere_obl.htm" }],
        },
      ],
    },
    {
      id: "audit",
      title: "审计绕不开",
      items: [
        {
          text: "有任何收入的公司，交利得税报税表时必须附核数师报告和财务报表。2022/23 年度起不论收入多少都要附，网上「年收入 200 万以下不用附」的说法已经过时。",
          sources: [
            { label: "税务局", url: "https://www.ird.gov.hk/eng/tax/bus_cpt.htm" },
            { label: "2023 年公告", url: "https://www.ird.gov.hk/eng/ppr/archives/23040301.htm" },
          ],
        },
        {
          text: "只有执业会计师或会计师事务所能做审计。「简化报告豁免」只是让报表可以按中小企财务报告准则编，仍然要审计。",
          sources: [
            { label: "条例第 393 条", url: "https://www.elegislation.gov.hk/hk/cap622!en/s393" },
            { label: "公司注册处问答", url: CR_AUDIT_FAQ },
          ],
        },
        {
          text: "申报为「不活动公司」可以免审计和周年申报，但一有会计交易就失去豁免。用 Stripe 收过钱的公司用不了。",
          sources: [
            { label: "条例第 5 条", url: "https://www.elegislation.gov.hk/hk/cap622!en/s5" },
            { label: "第 447 条", url: "https://www.elegislation.gov.hk/hk/cap622!en/s447" },
          ],
        },
        {
          text: "审计费没有官方标准。市场报价：零交易的公司 HK$5,000 到 10,000，营业额 500 万以下的小公司 HK$8,000 到 20,000，通常包含税务计算。",
          sources: [{ label: "市场报价，非官方", url: "https://air-corporate.com/hk/blog/hong-kong-company-audit" }],
        },
      ],
    },
    {
      id: "secretary",
      title: "公司秘书、注册地址和重要控制人登记册",
      items: [
        {
          text: "必须有公司秘书：个人要通常住在香港，公司要在香港有注册办事处或营业地点；唯一的董事不能兼任。",
          sources: [
            { label: "条例第 474 条", url: "https://www.elegislation.gov.hk/hk/cap622!en/s474" },
            { label: "第 475 条", url: "https://www.elegislation.gov.hk/hk/cap622!en/s475" },
          ],
        },
        {
          text: "注册办事处必须在香港，不收海外地址、转交地址或邮政信箱。以做生意的方式提供秘书或地址服务的，要有 TCSP 牌照，持牌人可以在网上免费查。",
          sources: [
            { label: "公司注册处问答", url: "https://www.cr.gov.hk/en/faq/local-company/incorporation.htm" },
            { label: "TCSP 名册", url: "https://www.tcsp.cr.gov.hk/" },
          ],
        },
        {
          text: "所有本地公司都要备存重要控制人登记册，放在香港、不用交给处长，并指定一名代表；违反最高罚 HK$25,000。",
          sources: [
            { label: "登记册问答", url: "https://www.cr.gov.hk/en/legislation/scr/faq.htm" },
            { label: "条例第 653H 条", url: "https://www.elegislation.gov.hk/hk/cap622!en/s653H" },
          ],
        },
        {
          text: "秘书和地址同样没有官方价格。市场报价：公司秘书每年 HK$1,300 到 8,000，注册地址有的另算。",
          sources: [{ label: "市场报价，非官方", url: "https://sleek.com/hk/resources/company-secretary-cost-hong-kong/" }],
        },
      ],
    },
    {
      id: "offshore",
      title: "钱是在内地赚的，要不要交香港利得税",
      items: [
        {
          text: "香港只对在香港产生的利润征税，不分居民和非居民。判断看「赚这笔钱的运作在哪里做」；人在香港用电话或网络订立的合约，算在香港订立。",
          sources: [
            { label: "税务条例第 14 条", url: "https://www.elegislation.gov.hk/hk/cap112!en/s14" },
            { label: "释义及执行指引第 21 号", url: "https://www.ird.gov.hk/eng/pdf/dipn21.pdf" },
          ],
        },
        {
          text: "网上业务一样按这个原则判断，服务器放在哪里本身不决定利润来源。政府 2026 年 6 月答复立法会时说，要看在香港活动的性质、程度和个案事实。",
          sources: [
            { label: "指引第 39 号", url: "https://www.ird.gov.hk/eng/pdf/dipn39.pdf" },
            { label: "立法会答复", url: "https://www.info.gov.hk/gia/general/202606/17/P2026061700398.htm" },
          ],
        },
        {
          text: "主张离岸，也要照常交报税表和审计报表，在报税表里申报离岸利润并附说明；有争议时，举证责任在公司。",
          sources: [
            { label: "整批延期信", url: BEL },
            { label: "税务条例第 68 条", url: "https://www.elegislation.gov.hk/hk/cap112!en/s68" },
          ],
        },
        {
          text: "两级制税率：首 HK$200 万利润按 8.25%，其余按 16.5%。2025/26 年度一次性宽减 100%，每宗上限 HK$3,000。",
          sources: [
            { label: "税务局", url: "https://www.ird.gov.hk/eng/tax/bus_pft.htm" },
            { label: "预算案措施", url: "https://www.ird.gov.hk/eng/tax/budget.htm" },
          ],
        },
        {
          text: "境外收入豁免（FSIE）只管利息、股息、处置收益和知识产权收入；SaaS 订阅和软件销售是营业收入，不在其中，仍按上面的来源原则判断。",
          sources: [{ label: "税务局 FSIE", url: "https://www.ird.gov.hk/eng/tax/bus_fsie.htm" }],
        },
      ],
    },
    {
      id: "bank",
      title: "银行账户",
      items: [
        {
          text: "金管局要求银行按风险审查、不能一刀切，不应只因为董事和股东是非居民就拒绝开户。开户有困难可以找金管局专责小组：电话 2878 1133，邮箱 accountopening@hkma.gov.hk。",
          sources: [
            { label: "金管局", url: "https://www.hkma.gov.hk/eng/smart-consumers/account-opening/role-of-the-hkma/" },
            { label: "尽职审查问答", url: "https://www.hkma.gov.hk/media/eng/doc/key-functions/banking-stability/aml-cft/faq_cdd.pdf" },
          ],
        },
        {
          text: "数字银行由金管局认可，但开户条件各家自己定。例如 ZA Bank 的商业账户要求全部股东和董事持香港身份证。",
          sources: [
            { label: "金管局数字银行", url: "https://www.hkma.gov.hk/eng/key-functions/banking/banking-regulatory-and-supervisory-regime/digital-banks/" },
            { label: "ZA Bank 说明", url: "https://bank.za.group/en/faqs/Business/Open_account/Account_opening_requirements/66504817b359be4a1952343b" },
          ],
        },
        {
          text: "Airwallex 不是银行：它的香港主体持有海关发的金钱服务经营者牌照，集团另有储值支付工具牌照。",
          sources: [
            { label: "Airwallex 说明", url: "https://help.airwallex.com/hc/en-gb/articles/900001757106" },
            { label: "储值支付工具名册", url: "https://www.hkma.gov.hk/eng/regulatory-resources/registers/register-of-svf-licensees/" },
          ],
        },
      ],
    },
    {
      id: "calendar",
      title: "一年的时间表和最低成本",
      lead: "以 6 月 15 日成立、12 月 31 日年结、请了会计师当税务代表为例，从第三年起的常规年份：",
      items: [
        { text: "1 月：新财年开始，上一年的账交给会计师审计。" },
        { text: "4 月初：税务局寄出利得税报税表和雇主报税表。有利润却没收到报税表的，要在年结后 4 个月内书面通知税务局。", sources: [{ label: "税务局", url: "https://www.ird.gov.hk/eng/tax/noc.htm" }] },
        { text: "5 月初：雇主报税表截止，没有雇员也要交。" },
        { text: "6 月中：商业登记到期，缴 HK$2,350。" },
        { text: "7 月下旬：周年申报表截止（周年日后第 42 天），HK$105。" },
        { text: "8 月中下旬：利得税报税表连审计报表截止（2025/26 年度是纸本 8 月 31 日、电子 10 月 2 日）。", sources: [{ label: "整批延期信", url: BEL }] },
        { text: "随时：董事、秘书或注册地址有变，15 天内申报。", sources: [{ label: "公司注册处问答", url: "https://www.cr.gov.hk/en/faq/local-company/directors-secretary.htm" }] },
        {
          text: "每年最低成本：官方费用约 HK$2,455（周年申报 105 加商业登记 2,350）；再加市场报价的秘书和地址 HK$1,300 到 8,000、审计 HK$5,000 到 20,000，合计每年大约 HK$9,000 到 30,000，不含记账费、利得税和银行费。",
        },
      ],
    },
    {
      id: "close",
      title: "不做了怎么关",
      items: [
        {
          text: "撤销注册的条件：全体成员同意，公司没开业或申请前 3 个月没有营运，没有负债，不涉及诉讼，没有香港不动产。",
          sources: [{ label: "条例第 750 条", url: "https://www.elegislation.gov.hk/hk/cap622!en/s750" }],
        },
        {
          text: "先向税务局申请不反对撤销注册通知书（HK$270，一般 21 个工作日），再在 3 个月内向公司注册处交申请（HK$420）。处长刊宪，3 个月内没人反对，公司就解散了。",
          sources: [
            { label: "税务局", url: "https://www.ird.gov.hk/eng/tax/bus_han.htm" },
            { label: "公司注册处", url: "https://www.cr.gov.hk/en/services/deregister-company.htm" },
          ],
        },
        {
          text: "解散之前，周年申报和商业登记费都要照交。",
          sources: [{ label: "公司注册处问答", url: "https://www.cr.gov.hk/en/faq/local-company/dereg-striking-off-winding-up.htm" }],
        },
      ],
    },
  ],
  pitfalls: [
    {
      text: "以为没收入就不用管：商业登记、周年申报和雇主报税表每年都要交，周年申报逾期会一路加价，还是刑事罪行。",
      sources: [{ label: "公司注册处", url: CR }],
    },
    {
      text: "以为小公司不用审计：除了不活动公司都要执业会计师审计，而用 Stripe 收过钱就不算不活动公司。",
      sources: [{ label: "公司注册处问答", url: CR_AUDIT_FAQ }],
    },
    {
      text: "以为离岸是自动的：要申报、附说明，还要能举证。",
      sources: [{ label: "税务条例第 68 条", url: "https://www.elegislation.gov.hk/hk/cap112!en/s68" }],
    },
    {
      text: "业务记录至少要保存 7 年。",
      sources: [{ label: "税务条例第 51C 条", url: "https://www.elegislation.gov.hk/hk/cap112!en/s51C" }],
    },
  ],
  unknowns: [
    "内地团队远程运营、在香港没有人员的 SaaS 公司，利润能不能算离岸：官方只给了判断原则，没有这类业务的例子，只能逐案判断。",
    "内地一侧的税务问题（会不会被认定为内地居民企业、个人所得税、CRS 信息交换）不在香港官方资料的范围内。",
    "审计、秘书、注册地址、记账都没有官方收费标准，上面的价格只是个别服务商的报价，记账费没找到可靠报价。",
    "金管局没有公布哪些银行接受内地股东或董事的公司开户。",
  ],
  posts: ["uk-company-annual-review-timeline-checklist", "us-company-annual-tax-filing-diy"],
};
