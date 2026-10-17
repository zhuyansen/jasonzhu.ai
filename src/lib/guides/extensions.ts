import type { Guide } from "../go-global-guides";

// 不做网站也能出海：浏览器插件、App、MCP 和 GPT 怎么上架。经验来自 Jason 的 Reply Filter for X（2026-09 上架 Chrome 应用商店）；
// 各家商店的规则在 sections，每条带官方来源。
export const EXTENSIONS: Guide = {
  slug: "extensions",
  short: "插件和应用商店",
  title: "做插件和 App 出海：Chrome 插件开发经验，各家应用商店怎么上架",
  description:
    "不做网站也能出海：Chrome 插件从开发到上架踩过的坑，以及 Chrome 应用商店、Edge、Firefox、App Store、Google Play、MCP 目录和 GPT 商店的上架规则，按官方页面整理。",
  intro: "产品不一定是网站。浏览器插件、手机 App、MCP 服务和 GPT 都有自己的商店，规则各不相同。先看我做插件的经验，再看每家商店的官方规定。",
  checked: "2026-10-17",
  mine: {
    title: "我做 Reply Filter for X 的经验",
    lead: "Reply Filter for X 是我 2026 年 9 月上架 Chrome 应用商店的插件，在 X 上把低质量回复折叠起来，代码开源。",
    points: [
      "模型的 key 不能放在插件里，插件代码谁都能解包。我用 Cloudflare Worker 做中转：key 只放在 Worker 里，插件只调 Worker。",
      "先用本地规则过滤，拿不准的才交给模型，成本低很多。再给每个 IP 每天设免费额度、全局每天设花费上限；用户也可以在设置页填自己的 key 直连。",
      "Cloudflare KV 免费版每天只能写 1,000 次，计数器很快写满；计数改用 Durable Objects 以后就没有这个上限了。",
      "花额度的是请求次数，不是回复条数：客户端攒满 20 条或空闲 1.5 秒再发一批。",
      "Manifest V3 的后台脚本里，几个文件共用一个全局作用域：共享的代码要包在函数里，否则变量重名会直接报错。",
      "插件更新以后，已经打开的网页里跑的还是旧脚本，一调用 chrome.* 就报「Extension context invalidated」。要检测到以后静默停用，并提示用户刷新页面。",
      "权限越少，审核越顺：这个插件只申请了 storage 和两个域名。",
      "商店要求隐私政策链接一直能打开。我们有一次改代码误删了隐私页，链接返回 500，以后每次发版前都要测一下。",
      "发新版不用每次进后台：Chrome 应用商店有官方的发布 API，用 OAuth 授权一次以后，上传和发布都能用脚本完成。Google Cloud 的同意屏幕保持测试模式、把自己加为测试用户就够了。注意旧的 V1 接口只支持到 2026 年 10 月 15 日，要换 V2。",
    ],
    links: [
      { label: "Chrome 应用商店页面", url: "https://chromewebstore.google.com/detail/reply-filter-for-x/ncffadgnbgcfadoaiaglgkbacjepccff" },
      { label: "GitHub 源码", url: "https://github.com/zhuyansen/x-reply-filter" },
    ],
  },
  sections: [
    {
      id: "chrome",
      title: "Chrome 应用商店",
      items: [
        {
          text: "注册要付一次性注册费，官方博客写的是 5 美元。中国在可注册的国家和地区里，账号邮箱注册以后不能改。",
          sources: [
            { label: "注册说明", url: "https://developer.chrome.com/docs/webstore/register" },
            { label: "2020 年官方博客", url: "https://blog.chromium.org/2020/03/new-developer-dashboard-and.html" },
          ],
        },
        {
          text: "发布前 Google 账号必须开两步验证，新账号还要验证联系邮箱。",
          sources: [
            { label: "两步验证", url: "https://developer.chrome.com/docs/webstore/program-policies/two-step-verification" },
            { label: "账号设置", url: "https://developer.chrome.com/docs/webstore/set-up-account" },
          ],
        },
        {
          text: "新发布者默认最多发布 2 个扩展，到上限后可以在后台申请提额（2026 年 8 月起）。",
          sources: [{ label: "官方博客", url: "https://developer.chrome.com/blog/cws-review-updates-2026" }],
        },
        {
          text: "审核多数几天，也可能几周，待审超过 3 周可以联系支持。新开发者、危险权限、宽泛的网站权限、大量代码改动都会拉长审核，代码混淆直接禁止。",
          sources: [{ label: "审核流程", url: "https://developer.chrome.com/docs/webstore/review-process" }],
        },
        {
          text: "一个扩展只能有一个窄而易懂的用途。只申请必需的最窄权限，并在后台 Privacy 标签页逐项写理由。",
          sources: [
            { label: "质量要求", url: "https://developer.chrome.com/docs/webstore/program-policies/quality-guidelines" },
            { label: "权限政策", url: "https://developer.chrome.com/docs/webstore/program-policies/permissions" },
          ],
        },
        {
          text: "只要处理用户数据，就必须填隐私政策链接，后台的数据使用披露要和隐私政策一致。",
          sources: [
            { label: "隐私政策要求", url: "https://developer.chrome.com/docs/webstore/program-policies/privacy" },
            { label: "Privacy 标签页", url: "https://developer.chrome.com/docs/webstore/cws-dashboard-privacy" },
          ],
        },
        {
          text: "商店不能收费：支付功能 2021 年 2 月起就停了。收费要自己接支付、自己校验许可证，写清退款政策并说明卖家是你；有购买功能的扩展还要填实体地址。",
          sources: [
            { label: "停用说明（官方存档）", url: "https://github.com/GoogleChrome/developer.chrome.com/blob/main/site/en/docs/webstore/cws-payments-deprecation/index.md" },
            { label: "收费政策", url: "https://developer.chrome.com/docs/webstore/program-policies/accepting-payment" },
          ],
        },
        {
          text: "所有开发者都要声明自己是不是欧盟的「交易者」：选是，要公开法定名称、电话和地址；选否，欧盟用户会看到「消费者保护法不适用」的提示。",
          sources: [{ label: "交易者声明", url: "https://developer.chrome.com/docs/webstore/program-policies/trader-disclosure" }],
        },
      ],
    },
    {
      id: "edge-firefox",
      title: "Edge 和 Firefox",
      items: [
        {
          text: "Edge 注册免费，分个人和公司账号；审核最长 7 个工作日，同样要填用途、权限理由、远程代码和数据使用。",
          sources: [
            { label: "注册", url: "https://learn.microsoft.com/en-us/microsoft-edge/extensions/publish/create-dev-account" },
            { label: "提交", url: "https://learn.microsoft.com/en-us/microsoft-edge/extensions/publish/publish-extension" },
          ],
        },
        {
          text: "Firefox 正式版只能装 Mozilla 签过名的扩展，签名一般 24 小时内完成。AMO 免费托管但没有内置支付，官方建议用第三方支付（例如 ExtensionPay）或挂捐赠链接。",
          sources: [
            { label: "签名和分发", url: "https://extensionworkshop.com/documentation/publish/signing-and-distribution-overview/" },
            { label: "怎么赚钱", url: "https://extensionworkshop.com/documentation/publish/make-money-from-browser-extensions/" },
          ],
        },
        {
          text: "AMO 禁止混淆代码，压缩或转译过的代码要另交源码；2025 年 11 月 3 日起，新扩展必须在 manifest 里声明收集哪些数据。",
          sources: [
            { label: "上架政策", url: "https://extensionworkshop.com/documentation/publish/add-on-policies/" },
            { label: "数据收集声明", url: "https://extensionworkshop.com/documentation/develop/firefox-builtin-data-consent/" },
          ],
        },
      ],
    },
    {
      id: "app-store",
      title: "苹果 App Store",
      items: [
        {
          text: "开发者计划年费 99 美元。个人账号在商店显示你的法定姓名；组织账号要能签合同的法人、D-U-N-S 编号（免费申请，最多约 7 个工作日）和能打开的官网。",
          sources: [
            { label: "注册", url: "https://developer.apple.com/programs/enroll/" },
            { label: "D-U-N-S", url: "https://developer.apple.com/support/D-U-N-S/" },
          ],
        },
        {
          text: "小企业计划：上一年和当年收入都不超过 100 万美元，佣金 15%。中国大陆店面 2026 年 3 月 15 日起降佣：标准佣金从 30% 降到 25%，小企业计划和订阅第二年起的续费从 15% 降到 12%。",
          sources: [
            { label: "小企业计划", url: "https://developer.apple.com/app-store/small-business-program/" },
            { label: "降佣公告", url: "https://developer.apple.com/news/?id=dadukodv" },
          ],
        },
        {
          text: "要在中国大陆店面上架，App 得有 ICP 备案号，缺了或信息不一致就在大陆不可用。只卖海外的，可以在「App 可用性」里取消勾选中国大陆，注意列表底部「未来新增的国家和地区自动上架」那个选项。",
          sources: [
            { label: "工信部 APP 备案通知", url: "https://www.miit.gov.cn/zwgk/zcwj/wjfb/tz/art/2023/art_920db564162e4312916a01bed6540ad8.html" },
            { label: "苹果的备案说明", url: "https://developer.apple.com/help/app-store-connect/reference/app-information/app-information/" },
            { label: "管理销售范围", url: "https://developer.apple.com/help/app-store-connect/manage-your-apps-availability/manage-availability-for-your-app-on-the-app-store" },
          ],
        },
        {
          text: "依据国务院第 810 号令，苹果自 2025 年 7 月起每季度向国家税务总局报送在 App Store 分发 App 的中国开发者信息：个人是身份证姓名和号码、交易笔数、总收入和退款额。页面没有说只针对中国店面。",
          sources: [{ label: "苹果的 810 号令说明", url: "https://developer.apple.com/help/app-store-connect/manage-compliance-information/manage-information-for-state-council-decree-no-810/" }],
        },
        {
          text: "审核一般一半在 24 小时内、九成在 48 小时内完成。有登录功能要给审核员 demo 账号；支持注册账号，就必须能在 App 内删除账号。",
          sources: [
            { label: "App 审核", url: "https://developer.apple.com/distribute/app-review/" },
            { label: "审核指南", url: "https://developer.apple.com/app-store/review/guidelines/" },
          ],
        },
        {
          text: "2025 年 2 月 17 日起，没有提供交易者身份的 App 会从欧盟 App Store 下架。",
          sources: [{ label: "苹果公告", url: "https://developer.apple.com/news/?id=einwn76m" }],
        },
      ],
    },
    {
      id: "google-play",
      title: "Google Play",
      items: [
        {
          text: "一次性注册费 25 美元，用信用卡或借记卡付，不收预付卡。中国大陆可以注册开发者账号和商家账号，收款是从美国汇出的美元电汇，满 100 美元才付。",
          sources: [
            { label: "注册", url: "https://support.google.com/googleplay/android-developer/answer/6112435?hl=en" },
            { label: "支持的地区", url: "https://support.google.com/googleplay/android-developer/answer/9306917?hl=en" },
            { label: "付款方式", url: "https://support.google.com/googleplay/android-developer/answer/7161440?hl=en" },
          ],
        },
        {
          text: "2023 年 11 月 13 日以后创建的个人账号，要先做封闭测试：至少 12 名测试者连续加入至少 14 天，才能申请上架正式版。新个人账号还要用 Play 管理中心手机 App 证明自己有安卓设备。",
          sources: [
            { label: "测试要求", url: "https://support.google.com/googleplay/android-developer/answer/14151465?hl=en" },
            { label: "注册", url: "https://support.google.com/googleplay/android-developer/answer/6112435?hl=en" },
          ],
        },
        {
          text: "个人账号会公开显示法定姓名、国家和开发者邮箱，开始赚钱后还会显示完整地址；组织账号要 D-U-N-S 编号。",
          sources: [{ label: "账号类型", url: "https://support.google.com/googleplay/android-developer/answer/13628312?hl=en" }],
        },
        {
          text: "App 内卖数字商品必须用 Google Play 结算。多数市场报名 15% 档以后，每年首 100 万美元收 15%、超出部分 30%，自动续订的订阅一律 15%；美国、欧洲经济区、英国（2026 年 6 月 30 日起）和澳大利亚、日本（9 月 30 日起）改成首 100 万美元 10% 加 5% 结算费。",
          sources: [
            { label: "结算要求", url: "https://support.google.com/googleplay/android-developer/answer/10281818?hl=en" },
            { label: "服务费", url: "https://support.google.com/googleplay/android-developer/answer/112622?hl=en" },
          ],
        },
      ],
    },
    {
      id: "mcp",
      title: "MCP 服务",
      items: [
        {
          text: "官方 MCP Registry 还是预览版，只存元数据：代码先发到 npm、PyPI、Docker Hub 等地方，再用 mcp-publisher 生成 server.json，验证身份（GitHub 账号发布的名字要以 io.github.用户名/ 开头，也可以验证自己的域名）后发布。",
          sources: [
            { label: "Registry 介绍", url: "https://modelcontextprotocol.io/registry/about" },
            { label: "发布教程", url: "https://modelcontextprotocol.io/registry/quickstart" },
          ],
        },
        {
          text: "Registry 主要给下游的市场和聚合站定期拉取，发布以后元数据基本不能改。",
          sources: [{ label: "聚合说明", url: "https://modelcontextprotocol.io/registry/registry-aggregators" }],
        },
        {
          text: "上 Claude 的连接器目录：在 claude.ai/directory/manage 提交，要 Pro 以上的付费账号。服务器必须是 HTTPS 远程服务器，要登录的用 OAuth 2.0；每个工具要写标题和只读或会改数据的标注，还要隐私政策、支持联系方式和给审核员的测试账号。",
          sources: [
            { label: "提交入口", url: "https://claude.com/docs/directory/publish" },
            { label: "提交要求", url: "https://claude.com/docs/connectors/building/submission" },
          ],
        },
        {
          text: "Anthropic 支持的国家和地区不含中国大陆，也排除由不支持地区的主体控股的公司。",
          sources: [{ label: "支持地区", url: "https://www.anthropic.com/supported-countries" }],
        },
      ],
    },
    {
      id: "gpts",
      title: "GPT 和 ChatGPT 插件",
      items: [
        {
          text: "自定义 GPT 将在 2026 年 12 月 11 日退役，官方建议迁移到插件；个人账号已经不能创建或发布新的 GPT。",
          sources: [
            { label: "退役说明", url: "https://help.openai.com/en/articles/20001519-custom-gpt-retirement-and-migration-faq" },
            { label: "分享和发布", url: "https://help.openai.com/en/articles/8798878-sharing-and-publishing-gpts" },
          ],
        },
        {
          text: "现在公开上架走 ChatGPT 和 Codex 的插件目录：要完成身份验证和域名验证，提交测试用例和演示视频。插件目前只能卖实物商品，不能卖订阅和点数。",
          sources: [
            { label: "提交", url: "https://developers.openai.com/plugins/deploy/submission" },
            { label: "插件规则", url: "https://developers.openai.com/plugins/plugin-guidelines" },
          ],
        },
        {
          text: "OpenAI 支持的国家和地区不含中国大陆和香港，身份验证要用支持地区签发的证件。",
          sources: [
            { label: "支持地区", url: "https://developers.openai.com/api/docs/supported-countries" },
            { label: "组织验证", url: "https://help.openai.com/en/articles/10910291-api-organization-verification" },
          ],
        },
      ],
    },
  ],
  pitfalls: [
    {
      text: "Chrome 新账号只能发 2 个扩展，别一上来就铺好几个扩展抢关键词。",
      sources: [{ label: "官方博客", url: "https://developer.chrome.com/blog/cws-review-updates-2026" }],
    },
    {
      text: "Chrome、Edge、Firefox 拒绝或拖慢审核的共同原因：多要权限、远程加载代码、代码混淆。",
      sources: [{ label: "Chrome 审核流程", url: "https://developer.chrome.com/docs/webstore/review-process" }],
    },
    {
      text: "Google Play 个人账号的 12 人、14 天封闭测试要提前找人；账号创建满一年还没提交过 App 会被关闭，注册费不退。",
      sources: [{ label: "账号关闭规则", url: "https://support.google.com/googleplay/android-developer/answer/11605267?hl=en" }],
    },
    {
      text: "Google Play 付款资料里的国家设定以后就不能改。",
      sources: [{ label: "付款资料", url: "https://support.google.com/paymentscenter/answer/9037880?hl=en" }],
    },
    {
      text: "用 API 自动发 Chrome 扩展的：V1 接口只支持到 2026 年 10 月 15 日，要换 V2。",
      sources: [{ label: "V1 文档", url: "https://developer.chrome.com/docs/webstore/api/v1" }],
    },
    {
      text: "MCP Registry 的 server.json 里的名字要和包里的 mcpName 一致，否则发布时报「无权限」。",
      sources: [{ label: "发布教程", url: "https://modelcontextprotocol.io/registry/quickstart" }],
    },
    {
      text: "别再做新的 GPT，12 月 11 日就要退役。",
      sources: [{ label: "退役说明", url: "https://help.openai.com/en/articles/20001519-custom-gpt-retirement-and-migration-faq" }],
    },
  ],
  unknowns: [
    "Chrome 注册费的金额：现行文档只写「一次性注册费」，5 美元来自 2020 年的官方博客。",
    "只在海外上架的大陆开发者要不要办 APP 备案：工信部的通知只约束「在境内从事互联网信息服务」的 App，没有直接回答这种情况。",
    "Google Play 美元电汇的银行手续费和结汇怎么处理，官方没写。",
    "Claude 连接器目录的审核要多久、MCP Registry 什么时候转正式版，官方都没给时间。",
    "MCP 官方和 Anthropic 都没有点名任何第三方 MCP 目录（例如 Smithery、Glama、mcp.so）。",
  ],
  posts: ["manus-x-tweet-data-analysis-plugin"],
};
