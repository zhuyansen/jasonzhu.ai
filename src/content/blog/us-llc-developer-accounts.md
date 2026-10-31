---
title: "人在国内，从注册美国公司到申请苹果和 Google 开发者账号"
date: "2026-10-31"
category: "出海"
tags: ["出海", "美国公司", "怀俄明 LLC", "EIN", "D-U-N-S", "Mercury", "Google Play", "苹果开发者账号"]
coverImage: "/blog/us-llc-developer-accounts/cover.png"
excerpt: "没有 SSN、没去美国，11 天走完怀俄明 LLC、Mercury 开户和苹果、Google 组织开发者账号申请，实付约 $277。"
---

我注册了一家怀俄明州的单人 LLC，用来上架自己的 App、收海外的钱。人在国内，没去美国，也没有 SSN。10 月 20 日下单，10 月 31 日把 Google Play 的验证材料交上去，前后 11 天。

这篇按顺序写四件事：注册公司、开 Mercury 银行账户、注册 Google Play 组织开发者账号、注册苹果组织开发者账号。截图都是办的时候截的，公司名、域名、邮箱、电话、人名、地址和各种编号都打了码。

查规则、填表格这些活，我交给了 Claude（Claude Code 加浏览器插件）。付款、签字、验证码、同意协议，都是我自己点的。

写这篇的时候，苹果和 Google 还在审核，Mercury 账户还没入金。有结果了我再更新。

## 时间线

![11 天时间线](/blog/us-llc-developer-accounts/section-timeline.png)

| 日期 | 进展 |
|---|---|
| 10/20 | 在 Northwest 下单注册怀俄明 LLC |
| 10/21 | 州政府批准；签运营协议；申请 EIN；买域名，上线官网和公司邮箱；申请 D-U-N-S |
| 10/23 | 邓白氏要补材料，第二天回复 |
| 10/28 | 拿到 D-U-N-S 和 EIN 确认信 |
| 10/29 | 提交 Mercury 开户；注册公司专用的 Apple 账号 |
| 10/30 | Mercury 获批；在 iPhone 上提交苹果组织申请，当晚补交材料 |
| 10/31 | 注册 Google Play 组织开发者账号，提交验证 |

---

## 一、注册美国公司（怀俄明 LLC）

### 为什么选怀俄明

不打算拿美国 VC 的钱，怀俄明基本够用。州注册费 100 美元出头，年报每年最低 $60；特拉华的 LLC 每年固定交 $300。怀俄明州层面没有公司所得税，股东信息也不对外公开。

要融资就选特拉华，投资人和律师都习惯它。

### 开始前要准备

- 护照
- 一个邮箱（先用私人邮箱，公司域名邮箱后面再弄）
- 能收短信的手机号
- 一张能付美元的信用卡

不需要 SSN 或 ITIN，也不需要美国地址，地址用注册代理的。

### 第一步：找注册代理下单

美国公司必须有一个注册代理（Registered Agent），在州里有实体地址，替公司接收政府和法院的信件。我用的是 Northwest Registered Agent：

- 服务费 $39，州政府费用 $103，一共 $142，含第一年的注册代理服务
- 第二年起代理费 $125/年，自动续费
- 公司的主要办公地址、邮寄地址，都可以填它的地址

下单时几个选择：

- 管理方式选 member-managed（成员管理）。一个人的公司就选这个。
- 它推荐的 EIN 代办（没有 SSN 要 $200）和 S Corp 选举，我都没买。S Corp 只有美国公民或税务居民能当股东，外国人用不上。

我 10 月 20 日下单，州政府 21 日就批了。批下来后，后台的 Documents 里能下载盖了备案章的成立文件（Articles of Organization）。

![Northwest 后台的 Documents 页面](/blog/us-llc-developer-accounts/01_northwest_documents.jpg)

*Northwest 后台：成立文件、运营协议模板、初始决议都在这里下载。*

### 第二步：运营协议和初始决议

运营协议（Operating Agreement）写清楚谁是股东、出资多少、公司怎么管。单人 LLC 不用交给州政府，但开银行账户、苹果审核都可能要看。

Northwest 送了一份模板，我没用，因为里面有一条：唯一成员去世，公司解散。我自己写了一份，写明我持股 100%、出资 $1,000，用电子签名签了。

Northwest 给的初始决议（Initial Resolutions）也要留好。成立文件上的组织者（Organizer）是 Northwest，不是你本人。初始决议是 Northwest 把公司交给你这个成员的书面文件。后来苹果要我证明「你和公司是什么关系」，我交的就是运营协议、初始决议和 EIN 确认信。

### 第三步：申请 EIN（联邦税号）

EIN 相当于公司的税号，开银行账户、上架收款都要用。没有 SSN 的外国人有三种办法：

| 方式 | 费用 | 说明 |
|---|---|---|
| 打 IRS 国际电话 267-941-1099 | 免费（只付国际话费） | 美东时间周一到周五 6:00 到 23:00 接听，要能用英文对答，电话里当场给号 |
| 传真 SS-4 表 | 免费 | 境外传真到 304-707-9471，表上要留能收传真的号码，IRS 把 EIN 传真回来 |
| 找代办 | $50 到 $200 | 我用的 EasyFiling，$99，从提交到收到 147C 确认信用了 7 天 |

![EasyFiling 的 EIN 代办页面](/blog/us-llc-developer-accounts/01_easyfiling_services.jpg)

*EasyFiling 的 EIN 代办，$99 一口价。IRS 本身不收钱。*

用代办要注意两点：

- 负责人（Responsible Party）填你自己，身份选外国人（Foreigner），不需要 SSN。
- EasyFiling 有个「从成立文件自动提取信息」的按钮。我试了一下，它把公司名识别成「Limited Liability Company」，后缀识别成「Ltd」。别点它，手动填。

![Responsible Party 一栏填 Foreigner](/blog/us-llc-developer-accounts/01_easyfiling_foreigner.jpg)

*负责人没有 SSN 或 ITIN，这一栏就填 Foreigner。*

EIN 下来后，保存 IRS 的确认信（CP 575 或 147C）。Mercury、Google 都要看这封信。

![IRS 的 147C 确认信](/blog/us-llc-developer-accounts/01_irs_147c.jpg)

*IRS 的 147C 确认信。公司名、地址、EIN 和信件编号都打了码。*

### 第四步：域名、官网和公司邮箱

后面开户和开发者审核都会看官网，邮箱也最好是公司域名的。

- 域名：我在 Cloudflare 买的 .com，一年 $11 左右。Cloudflare 按成本价卖，没有首年便宜、续费涨价那一套。
- 邮箱：Cloudflare 的 Email Routing 免费，可以把 hello@你的域名 转发到自己的 Gmail。后来注册 Google Play 时又加了一个 dev@，几分钟就加好。
- 官网：一个静态页面就够。写清楚公司法定名称、注册地址、联系邮箱，再放一个隐私政策页。苹果对官网的要求是能打开、域名属于公司，不能是空壳页面。我放在 Cloudflare Workers 上，免费。

![Cloudflare 电子邮件路由，新建转发规则](/blog/us-llc-developer-accounts/01_cloudflare_email_route.jpg)

*Cloudflare 的电子邮件路由：新建一条规则，把 dev@ 转发到私人 Gmail。背后列表里那条是之前建的 hello@。*

### 第五步：申请邓白氏编码（D-U-N-S）

D-U-N-S 是邓白氏（Dun & Bradstreet）给企业的九位编号，免费。苹果和 Google 的组织开发者账号都要它，用来核实公司真实存在。

最省事的入口是苹果的查询工具 developer.apple.com/enroll/duns-lookup，用任意 Apple 账号登录就能用：

1. 填公司法定名称、地址、电话，查一下。
2. 查不到就点「submit your information」，把公司信息提交给邓白氏。
3. 过两天，邓白氏发邮件要材料。我是 10 月 23 日收到的，要求 72 小时内回复。第二天我回了他们的企业信息表（Business Information Form）和成立文件。
4. 10 月 28 日收到编号。

![邓白氏要求补材料的邮件](/blog/us-llc-developer-accounts/01_dnb_email.jpg)

*邓白氏的补材料邮件：要两份能看出公司名称和地址的文件。*

拿到编号不等于马上能用，邓白氏要先同步到自己的数据库，苹果再从邓白氏那边同步。我是拿到编号两天后，才在苹果查询工具里查到自己的公司。

有个坑：我第一次查的时候，工具匹配出一家名字很像的公司，也在怀俄明，同一栋楼，只是 Suite 不同。别选它，选了就等于用了别人的编号。

### 每年要做的事

- Form 5472 加一份形式上的 1120：外国人持有的单人 LLC，每年 4 月 15 日前要报，哪怕一分钱收入都没有，成立当年就要报。漏报罚款 $25,000 起。你替公司付的钱（注册费、年费）、往公司账户的出资，都算要申报的关联交易，收据要留好。
- 怀俄明年报：每年在公司成立的那个月交，最低 $60。
- 注册代理续费：$125/年。
- 域名续费。
- BOI（受益所有人）报告：2025 年起，FinCEN 规定美国本土成立的公司不用报。这条规则变过好几次，到时候去 FinCEN 官网再确认一遍。

### 这一部分踩过的坑

- Northwest 送的免费域名，创建了两次都失败，最后自己去 Cloudflare 买的。
- 买域名时手快，多买了一个拼错的域名。只能给它设个跳转、关掉自动续费，$11 就当学费了。
- 成立文件上没有你的名字，组织者是注册代理。要证明公司是你的，靠的是运营协议和初始决议，这两份一定要留好。
- 所有表格里的英文名都以护照为准，姓、名、空格都要一致。

---

## 二、开 Mercury 银行账户

公司有了 EIN，下一步是开公司银行账户。我选的是 Mercury，一家美国线上银行，支持非美国居民的创始人远程开户，基础账户没有月费。10 月 29 日下午提交，第二天就收到了批准邮件。

### 开户前准备

| 材料 | 要求 | 我用的 |
|---|---|---|
| 护照 | 在手机上拍证件、自拍 | 护照 |
| 地址证明 | 90 天内的，上面有你的名字和住址 | 招行信用卡的 10 月账单（PDF） |
| EIN 确认信 | IRS 的 CP 575 或 147C | 147C |
| 资金来源证明 | 首笔钱从哪个账户来，就交哪个账户的对账单 | 香港 ZA Bank 的月结单 |
| 公司成立文件 | Mercury 会自己去州政府核对 | 没让我传 |
| 官网 | 能打开，有公司信息 | 公司官网 |

公司简介最多 299 个字符，先写好。

### 申请步骤

1. 注册：用公司邮箱注册，设密码。
2. 公司信息：行业、公司类型（LLC）、简介、电话、官网、社交账号。

![Mercury 的公司信息页](/blog/us-llc-developer-accounts/02_company_info.jpg)

*公司信息页。简介超过 299 个字符不会报错，只是存不上。*

3. 地址：要填两个。法定地址（Legal Address）填注册代理的美国地址。实际经营地址（Physical Address）填你在国内的真实住址，Mercury 不接受代收地址、虚拟地址当实际地址。

![Mercury 的实际经营地址页](/blog/us-llc-developer-accounts/02_physical_address.jpg)

*实际经营地址：办公室、住处或能核实的海外地址都行，虚拟地址、代收点、注册代理地址都不行。*

4. 股东信息：职位（我填 CEO）、持股 100%、选 Non-Resident（非美国居民）、住址同上。控制人（Control Person）也是自己。
5. 身份验证：用手机扫码，拍护照、自拍。
6. 上传 EIN 确认信和地址证明。

![上传 EIN 确认信](/blog/us-llc-developer-accounts/02_ein_document.jpg)

*传 147C 就行。下面出现「Your document has all the information we need」，说明识别通过了。*

7. 预计交易：首笔资金来源选 Self（自有资金）。预计月均余额、每月收付款金额我都选了 $0 到 $10K 这一档。收付款国家选了中国和美国，后来又加了香港，因为钱要从香港汇过去。

![预计交易页](/blog/us-llc-developer-accounts/02_expected_activity.jpg)

*预计交易：首笔资金来源勾 Self，别勾 Revenue。*

8. 补充问题：上传资金来源证明，回答几个业务问题。
9. 勾选协议，提交。页面显示「In review, approx. 1 day」。

### 批下来之后：第一笔钱怎么进来

![获批后的 Mercury 首页](/blog/us-llc-developer-accounts/02_fund_account.jpg)

*获批后，首页第一件事就是问你怎么入金。从国外汇款点 Wire Transfer。*

用国际电汇（SWIFT）：

1. 收款信息在后台首页：在 How do you want to fund your account? 下面依次点 Wire Transfer、Send international wire。页面上有收款银行（我的是 Column N.A.）、SWIFT 代码和账号。
2. 账号用页面上的复制按钮复制，别手抄，抄错一位钱就汇丢了。
3. 付款账户最好就是开户时交了对账单的那个账户，户名是你本人。
4. 附言写 Capital contribution（股东出资）加上你的名字，以后记账方便。
5. 中间行可能扣十几到几十美元手续费，可以多汇一点。
6. 汇款回单留好，明年报 Form 5472 要用。

![国际电汇的收款信息](/blog/us-llc-developer-accounts/02_international_wire.jpg)

*Send international wire 页面。路由号和账号打了码，旁边都有复制按钮。*

钱到账后可以开虚拟借记卡，付苹果、Google 这些开发者费用和订阅。批准邮件里推荐的 IO 信用卡，我暂时没开。

### 外汇提醒

国内个人每年 5 万美元的便利化额度，不能用于境外投资，给自己的美国公司出资也算在里面。我用的是本来就在香港账户里的钱。金额大的话，先问问专业人士怎么做才合规。

### 这一部分踩过的坑

- 公司简介超过 299 个字符，不会报错，只是悄悄没存上。到最后一页才提示「公司信息未完成」，回去缩短才过。
- 点 Save 之后一直转圈。其实已经存上了，刷新页面就好。
- 合并账单被判「太旧」。我先传的是 7 到 10 月的合并账单，系统按最早的 7 月算，判超过 90 天。改传 10 月的单月账单就过了。
- 首笔资金来源别勾 Revenue（营业收入）。勾了就要你证明公司已经有收入。
- 券商的投资月结单不算银行对账单，要传银行的综合月结单。我账户里现金不多，就把两份合成一个 PDF 一起传了，也过了。
- 双重验证别用默认的 passkey。它走的手机通行密钥在国内经常连不上。选「Use 2FA codes instead」，用 Google Authenticator 扫码。
- 首页会提示用 Plaid 连接美国银行账户，没有美国账户的直接跳过。

---

## 三、Google Play 组织开发者账号

2023 年 11 月以后新开的 Google Play 个人开发者账号，第一个应用上架前，要先找至少 12 个测试者连续封闭测试 14 天。组织账号没有这条要求，商店页面上显示的也是公司名。代价是要 D-U-N-S 编号，验证步骤多一些。

我 10 月 31 日注册，交了 $25，当天就把能做的验证都提交了，现在在等 Google 审核。

### 准备

| 项目 | 说明 |
|---|---|
| D-U-N-S 编号 | 我是拿到编号 3 天后注册的，输入编号就带出了公司信息 |
| 公司专用 Google 账号 | 用公司域名邮箱注册，比如 hello@你的域名 |
| 第二个公司邮箱 | 联系邮箱不能和登录邮箱相同，我加了一个 dev@ |
| 官网 | 后面要验证所有权 |
| 护照 | 拍资料页照片 |
| 公司证明文件 | IRS 的 EIN 确认信，或州政府的成立证书 |
| 信用卡 | 付 $25 注册费 |

### 第一步：用公司邮箱注册 Google 账号

在 accounts.google.com 创建账号，有三个地方要注意。

第一，选「供个人使用」。选「工作或企业」会跳到 Google Workspace 的注册页，那是收费的企业邮箱服务，还会接管你域名的邮件设置。

![Google Workspace 的注册页](/blog/us-llc-developer-accounts/03_workspace_trap.jpg)

*选了「工作或企业」就会到这一页。这是 Workspace 的付费注册，关掉重来。*

第二，到选 Gmail 地址那一步，点「使用现有邮箱」，填 hello@你的域名。验证码会转发到你的私人邮箱。

![创建邮箱这一步](/blog/us-llc-developer-accounts/03_use_existing_email.jpg)

*把公司邮箱填进 Gmail 地址框会报错。要点右下角的「使用现有邮箱」。*

第三，验证手机号。我的 +86 号码直接提示「此电话号码无法用于进行验证」，换了一个泰国号码才过。号码被拒别反复试，试多了只会更严。换个号码，或者换到手机上注册。

![+86 号码被拒](/blog/us-llc-developer-accounts/03_phone_rejected.jpg)

*+86 号码被拒。*

建好后马上开两步验证，用 Google Authenticator，备用码存进密码管理器。

浏览器里同时登着私人 Gmail 的话，每一步都看一眼当前是哪个账号。我第一次打开 Play Console 注册页时，默认用的就是私人 Gmail，差点把开发者账号注册在私人名下。

### 第二步：注册表每一页怎么填

打开 play.google.com/console/signup：

| 页面 | 怎么填 |
|---|---|
| 账号类型 | 组织，再选「公司或企业」 |
| 开发者名称 | 商店里显示的名字，可以和法定名称不同，以后能改 |
| 支付资料 | 新建，输入 D-U-N-S，它会自动带出邓白氏登记的公司名和地址，核对后确认。国家定了就不能改 |
| 贵组织 | 员工人数；单位电话写成 +86 加号码，中间不要空格，有空格会报错；官网 |
| 公开资料 | 开发者电话和邮箱，会公开显示给所有用户。勾选同意公开 |
| 关于您 | 你的开发经验，可以放 GitHub 链接；过去 6 个月有没有用别的账号登录过 Play Console，照实填 |
| 应用 | 未来 12 个月打算发几个应用、怎么赚钱、是否属于金融、医疗、儿童这类敏感类别 |
| Google 如何与您联系 | 联系人、联系邮箱（必须和登录邮箱不同，还要是公司域名）、邮件语言、电话 |
| 条款 | 勾选两项协议，点「创建账号并付款」 |

![输入 D-U-N-S 后带出的公司信息](/blog/us-llc-developer-accounts/03_duns_confirm.jpg)

*支付资料：输入 D-U-N-S 后弹出邓白氏登记的公司名和地址，核对没问题再点确认。*

![贵组织](/blog/us-llc-developer-accounts/03_org_info.jpg)

*贵组织：员工数、单位电话、官网。电话号码中间别加空格。*

![Google 如何与您联系](/blog/us-llc-developer-accounts/03_contact_email_rules.jpg)

*联系邮箱的四条要求。最容易踩的是第一条：不能和登录邮箱相同。*

![条款](/blog/us-llc-developer-accounts/03_terms.jpg)

*条款页：前两项协议必须勾，后两项是营销订阅，可以不勾。*

$25 我用个人信用卡付的，在公司账上记作股东垫付。

![开发者账号已创建](/blog/us-llc-developer-accounts/03_account_created.jpg)

*付完款，开发者账号就建好了，收据发到登录邮箱。*

### 第三步：身份和组织验证

付款后，首页列出三项待办：验证身份、验证网站、验证电话。

![Play Console 首页的三项待办](/blog/us-llc-developer-accounts/03_dashboard_tasks.jpg)

*Play Console 首页。打码的是公司名和账号 ID。*

验证身份分两部分。

组织部分，上传一份带公司注册信息的文件。Google 列的第一类就是 IRS 的信件（比如 CP 575），我传的是 EIN 确认信 147C。文件不能改动。

![组织验证接受的文件](/blog/us-llc-developer-accounts/03_org_doc_list.jpg)

*组织验证接受的文件。我交的是 IRS 的 147C，还在审核。*

授权代表部分，核实的是你本人：

- Google 默认让你用手机扫码继续。我手机上的代理没配好，一直连不上，最后选了「在此设备上继续操作」，在电脑上做完的。
- 签发国家默认是美国，要改成中国，证件类型选护照。
- 我第一次传的是以前办签证用的扫描件，一张 A4 纸上有两页护照。提交后提示「验证信息存在 1 个问题」，退回来重填。重新用手机拍了一张护照资料页，就提交成功了。
- 最后填你本人的住址。

![选择证件签发国家](/blog/us-llc-developer-accounts/03_id_country.jpg)

*签发国家改成中国，默认选中的是驾照，要改选护照。*

还有两个操作上的小坑：

- 验证窗口是嵌在页面里的独立框架，上传文件最省事的办法，是从访达里把文件直接拖进去。
- 国家列表很长，排序也怪。选证件国家的列表里，「中国」在最上面；选地址国家的列表里，「中国」在最下面。

![验证材料提交完成](/blog/us-llc-developer-accounts/03_verification_done.jpg)

*都交上去以后是这个页面，剩下的就是等。*

### 第四步：验证网站

Play Console 要你证明官网是你的：

1. 用同一个公司 Google 账号打开 Search Console，添加「网域」类型的资源，填你的域名。
2. 它会给一条 TXT 记录。如果域名在 Cloudflare，它会推荐「授权 Google 访问你的 Cloudflare 账号」一键验证。我改选了「任何 DNS 提供商」，自己去 Cloudflare 加了这条 TXT 记录，少授一份权限。
3. 回 Search Console 点「验证」，通过。
4. 回 Play Console 的「账号详情」，在单位网站旁边点「发送验证请求」。Search Console 的所有者就是你自己，所以马上显示「网站已通过验证」。

![Search Console 的 DNS 验证](/blog/us-llc-developer-accounts/03_dns_txt.jpg)

*Search Console 识别出域名在 Cloudflare。下拉框里改选「任何 DNS 提供商」，就会给你 TXT 记录自己去加。*

![网站已通过验证](/blog/us-llc-developer-accounts/03_website_verified.jpg)

*回到 Play Console 的账号详情，单位网站下面显示「网站已通过验证」。*

这条 TXT 记录别删，删了验证就失效了。

### 第五步：验证电话

要等组织和身份审核通过才开放。我还在等，通过后补上这一节。

### 这一部分踩过的坑

- Play Console 注册页默认用了浏览器里登录的私人 Gmail。
- 注册 Google 账号时选「工作或企业」，会进 Workspace 的付费注册。
- +86 号码在注册 Google 账号时被拒。
- 联系邮箱不能和登录邮箱相同，临时在 Cloudflare 加了一个 dev@ 转发。
- 电话号码中间有空格，会报格式错误。
- 旧的护照扫描件没通过，新拍的照片可以。

---

## 四、苹果组织开发者账号

苹果的组织开发者账号，App Store 上显示的卖家是公司名。年费 $99，我在 App 里看到的是 $98.99/年。和 Google 一样要 D-U-N-S 编号。

我 10 月 30 日晚上提交，一分钟后苹果就发邮件要补材料。补完几分钟，苹果回信说收到了，现在在等审核。

### 准备

- D-U-N-S 编号，而且苹果已经能查到
- 公司专用的 Apple 账号，开双重认证
- 公司域名邮箱
- 官网
- 你有权代表公司签协议（股东或创始人就行）
- 公司文件：成立文件、运营协议、EIN 确认信，再加上护照

### 第一步：注册公司专用 Apple 账号

在 account.apple.com 网页上注册新账号，别用私人的 Apple ID。

- 姓名填护照上的拼音，比如 San Zhang。苹果要求名和姓都是法定姓名。
- 邮箱用公司域名邮箱。
- 国家或地区：我选了中国大陆，和我的护照、手机号一致。这个选择的后果，见第三步。
- 手机号收验证码，注册完双重认证就开好了。
- 这个账号只在网页和 Apple Developer App 里登录，不要登录到 iPhone 或 Mac 的系统设置里，免得和私人 iCloud 混在一起。

![注册 Apple 账号的最后几项](/blog/us-llc-developer-accounts/04_account_consent.jpg)

*注册页最后是数据隐私说明、两个营销订阅和图片验证码。营销订阅可以不勾，验证码自己输。*

建议在「账户安全」里再加一个受信任手机号，以后换号也不会被锁在外面。

![账户安全里的两个受信任号码](/blog/us-llc-developer-accounts/04_trusted_numbers.jpg)

*加了第二个受信任号码。*

### 第二步：确认苹果能查到你的 D-U-N-S

拿到编号后，先去 developer.apple.com/enroll/duns-lookup 查一下，我是两天后才查到的。能查到你的公司，苹果就会把编号发到你填的邮箱，说明可以申请了。查询表单最后有个图片验证码，要自己输。

![D-U-N-S 查询成功](/blog/us-llc-developer-accounts/04_duns_lookup_found.jpg)

*查到公司以后是这个页面，编号会发到你填的邮箱。*

### 第三步：网页申请，还是 App 申请

我用公司账号登录开发者网站，同意开发者协议之后，打开申请页，只看到一句「请用 Apple Developer App 注册」，网页上没有申请入口。苹果的中文帮助页里，组织注册写的也是在 iPhone 或 iPad 上用 App 完成，而且整个过程要用同一台设备。

![申请页只有一句：用 App 注册](/blog/us-llc-developer-accounts/04_enroll_with_app.jpg)

*我的账号打开申请页，只有这一句。*

所以：

1. 在 iPhone 上安装 Apple Developer App。
2. 点 Account，用公司 Apple 账号登录。这里只是登录这个 App，手机系统里的 Apple ID 不用换。
3. 点 Enroll Now。

### 第四步：App 里的申请表

你本人的信息：账号是中国大陆区，这一步要填中文姓名和身份证号，再自拍做人脸核验，跟国内 App 的实名认证一样。核实的是你本人，和公司名称没关系。

地址：省份列表是中文的，填你本人的住址。

实体类型：选 Organization。别选 Individual，选了它，商店上显示的卖家就是你个人的名字。

![实体类型](/blog/us-llc-developer-accounts/04_entity_type.jpg)

*实体类型选 Organization。*

公司信息：

| 项目 | 填写 |
|---|---|
| 法定名称 | 和成立文件完全一致，带上 LLC |
| D-U-N-S | 九位编号 |
| 总部地址、电话 | 和邓白氏登记的一致 |
| 网站 | 公司官网 |
| Job Title | 我填的 Owner |
| Work Email | 公司域名邮箱 |

签字权（Signing Authority）：打开这个开关，确认你有权代表公司签协议。下面还要填一个能证明你签字权的人，一人公司就填自己。我在这一页卡了一下，Continue 一直是灰的，原因就是这个开关没打开。

![Signing Authority 开关](/blog/us-llc-developer-accounts/04_signing_authority.jpg)

*开关是关着的，所以最下面的 Continue 是灰的。*

提交后会显示一个 Enrollment ID，记下来，以后联系苹果要用。

![申请已提交](/blog/us-llc-developer-accounts/04_review.jpg)

*提交成功。Enrollment ID 打了码。*

### 第五步：补交材料

提交后一分钟，苹果发来邮件，说无法核实我的身份以及我和公司的关系，要三样东西：

1. 本人带照片的证件。上传页写着：证件上没有拼音或英文名的，要附律师认证的英文翻译。所以用护照，别用身份证。
2. 你和公司关系的证明（原文是 employment verification）。一人公司没有劳动合同，我交的是运营协议（写明我是唯一成员、持股 100%）、注册代理出具的初始决议（把公司交给我），还有 IRS 的 EIN 确认信（收件人写着我是唯一成员）。
3. 一份公司文件。我交的是州政府备案的成立文件（Articles of Organization）。

上传地址在邮件里，是 developer.apple.com/contact/file-upload/。规则如下：

- 格式限 JPG、PNG、TIFF、PDF，单个文件不超过 5MB。
- 一次选一个文件，要传多个就点「Add another file」。
- 说明（Notes）最多 200 个字符。写超了，Continue 按钮就是灰的。
- 点提交后会弹窗提醒：交了就不能再补文件。

我把护照和这几份文件合成一个 13 页的 PDF，大约 1MB，说明里写清楚哪几页是什么，一次交完。几分钟后苹果回信，说材料收到了，审核后会联系我。

![苹果的材料上传页](/blog/us-llc-developer-accounts/04_upload_notes.jpg)

*一个 PDF 交完，说明里按页码写清楚每部分是什么。右上角的 27 是还剩几个字符。*

### 第六步：审核通过后付款

审核通过后苹果会发邮件。之后回到同一台 iPhone 上的 App，点 Account，再点 Continue Your Enrollment，同意许可协议，再订阅。钱从这台手机登录的 Apple ID（也就是你私人的那个）绑定的付款方式里扣，之后每年自动续费。收据存好，在公司账上记作股东垫付。

我还在等审核结果，有进展再更新。

### 这一部分踩过的坑

- 账号地区选了中国大陆，结果只能用 App 申请，还要身份证实名。选美国地区会不会不一样，我没试过，不好下结论。
- 邓白氏把我的公司类型记成了 Corporation，实际是 LLC。目前苹果没有因为这个卡我。要是卡了，就联系邓白氏改，改完还要等它同步到苹果。
- 签字权开关没打开，Continue 一直是灰的。
- 补材料的说明只有 200 个字符，写长了也提交不了。

---

## 总花费

![总花费拆分](/blog/us-llc-developer-accounts/section-cost.png)

| 项目 | 金额 | 备注 |
|---|---|---|
| Northwest：服务费 + 州费 + 首年注册代理 | $142 | 次年起代理费 $125/年 |
| EIN 代办 | $99 | 自己打 IRS 电话可以省掉 |
| 域名 | 约 $11/年 | Cloudflare |
| Google Play 注册费 | $25 | 一次性 |
| 苹果开发者年费 | $99/年 | App 里显示 $98.99，审核通过后付 |
| D-U-N-S、Mercury 开户、邮箱转发、官网托管 | 免费 | |

到现在实际付了大约 $277，苹果的年费还没付。从第二年起，每年固定要交的是注册代理 $125、州年报最低 $60、域名约 $11、苹果年费 $99，加起来约 $295。Form 5472 每年也要报，找会计代报要另外花钱。

苹果和 Google 审核结果出来后，我会补上 Google 的电话验证和苹果的付款这两节。

---

## 本站相关文章

- [168 美元跑通海外收款：美国 LLC + Mercury + Stripe 实测要点（整理自玄同）](/zh/blog/us-llc-mercury-stripe-168-usd)
