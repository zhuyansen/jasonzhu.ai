# 实体图谱迭代记录

方法论、规则和操作步骤在 [`entity-consistency-sop.md`](entity-consistency-sop.md)。这里只记两样：**还没办完的事**，和**每一轮发现了什么、改了什么、效果怎么看**，最新的在上面。做完的操作步骤不留在这里，要看去 git 历史。

**怎么查现状：**
- 事实和学术索引：agent-skills-hub 仓库的 `python3 ops/geo/entity_audit.py --mode molecule --no-save`，一共 8 项。第 7 项（各处事实是否一致）每天跑，第 8 项（学术索引）每周一跑，结果进 ASH 的「数据四件套日报」邮件，有问题时邮件标题会提示。
- 关系边：ASH 的 `python3 ops/geo/entity_edges.py --json`（12 条，读 sitemap 每种模板，约 200 页；GIGALinks 冻结页上的发现单列到 2027-01-01），每天跑，结果在日报「🔗 实体关系」；本站的 `node scripts/check-entities.mjs`，每天跑。
- 效果：GEO 面板（[`PANEL.md`](PANEL.md)），每周一自动跑。实体图谱看三样：不带品牌名的题有没有引用本站；AI 搜的不带品牌名的词，我们在 Google 前 20 有几条；品牌词（`brand_serp`）本站排第几。

**每一轮记四样：** 证据（怎么查到的，能复现）→ 改了什么（提交号）→ 怎么验证 → 效果看哪一项、哪天看。改动同时在 [`experiments.json`](experiments.json) 记一条，面板周报才对得上。

---

## 当前待办

| 事项 | 谁 | 什么时候 | 状态 |
|---|---|---|---|
| ASH 每日任务第一次带 12 条关系规则和冻结单列：Entity relations 那步成功；日报「🔗 实体关系」写明按模板的覆盖（约 200 页）、0 个问题、🧊 冻结约 199 条 | Claude | 11-27 20:20 UTC 那次跑完后 | ⏳ |
| 第一次带新检查的定时运行：「分数进了仓库」那步通过、子查询自检通过、邮件里有品牌词名次 | Claude | 2026-11-30（周一）跑完后 | ⏳ |
| Search Console 看 4 个品牌词（jasonzhu.ai、jasonzhu ai、jason zhu gosail、gosail club）的展示、平均名次和落地页：只作诊断，品牌词达标仍按每周 3 次抽样算；产品词、公司词另列一组（v2.6） | Claude | 和 11-30 的读数一起 | ⏳ |
| v2.6 第二批，衡量口径：full 模式的 Layer B、C 退役；每周加 3 道消歧题（先拿存下的回答回放打分，额度等你定）；「数据被用却没署名」逐条核出处，加一列新口径；「不带品牌名的词进 Google 前 20」加一列只比两期都查到的同一个词的口径 | Claude | 11-30 读数前后 | ⬜ |
| ASH 冻结页的同类修复：分支 `entity/gigalinks-frozen-fixes`（`08fa81f8`）合并上线。改的是首页 `index.html`（所有 SPA 页都继承它的 `twitter:site` 和首页那份 Person）、场景页和日报的模板、/blog/securing-117k-ai-skills/ | Claude | 2027-01-02（GIGALinks 01-01 读完以后） | ⏳ 01-02 起检查不再把这些算冻结，合不合并都会报 |
| ASH 的 MCP server card（`/.well-known/mcp/server-card.json`）手写着 267,000+，线上实际是 287,000+；在事实检查 20% 的容差内，所以没报。改成构建时和 llms.txt 一起填 | Claude | 第二批一起 | ⬜ |
| 你本人的 3 件：X @GoSailGlobal 简介第一行改成 jasonzhu.ai，gosaillab.com 挪到后面并写明是 MCN 服务，location 不放品牌名；GitHub 简介的 DOI 换成总 DOI 24386242，去掉「105k」，不写会变的数字；ORCID 上 5 个旧版本作品换成最新版本（要登录） | 你 | 有空时，一共约 20 分钟 | ⬜ |
| 要你定的 3 件：关于页正文写不写分工（ASH 由 GoSailGlobal LLC 运营、GoSail Lab 是你的 MCN 服务、ORCID 写进正文；只写文字，不加节点）；Wikidata 产品条目 Q141986406 的 P2037 = zhuyansen（建议只监测，要动只删不增，由你提交）；每周 3 道消歧题要花的 Perplexity 额度 | 你 | 不急 | ⬜ |
| OpenAlex：130K 数据集（W7167922915）仍在 A5009989201「竹彦 森」名下。《Backlink Spam List》（W7237096646，重复记录 W7237007813）11-26 已挪回 A5163069727，这个作者页的 9 个作品都是你的，但没挂 ORCID；按 ORCID 查不到作者（11-27 查） | OpenAlex 客服 | 等回复；回复发到你 OpenAlex 账号的邮箱 | 🟡 11-24 Claude 在你的 Chrome 里用你的 OpenAlex 账号提了两张工单：请求 28329（130K）、28427（Backlink Spam List）。28427 对应的作品已挪回，工单是否结案没核实；认领、合并作者页不做 |
| B 站改名、写简介（现在是「香菇的猪」、简介空），改好后告诉 Claude 加回 sameAs | 你 | 不急 | ⬜ 11-24 已从 sameAs 拿掉 |
| 学术外联 | 你 | 等回复 | 🟡 两封邮件（SkillProbe 一作、NVIDIA 一作）和更正信都已发，LinkedIn 邀请已发；不再追加。回复记在 `~/出海/specs/2026-11-22-academic-outreach.md` 末尾 |
| SSRN 两篇换成 1.1 版 | SSRN 客服 | 等邮件 | ⏳ 不再跟进；审核通过后看一眼是不是 1.1 版（`papers/SSRN-revision-notes-2026-11-21.md`） |

**不做了（2026-11-24 定）：** Wikidata 人物条目和 6 个作品条目（有 2–3 家独立媒体报道后再议，条件见 SOP Phase 3）；OpenAlex 认领、合并作者页、补 DOI；为进学术索引去找 Semantic Scholar 收录、arXiv 背书；Hugging Face、Kaggle 补回链；Zenodo 单位写法统一；追安全论文 1.0 版 DOI `24420920` 的登记（已被 1.1 版取代，站上用总 DOI `24420919`；11-24 查总 DOI 和 1.1 版 `24432858` 都能解析）。

**最近办完：** v2.6 第一批，补检查、修错（11-27，见下）：ASH 非冻结页修好（`e200ca6e`），关系检查扩到每种页面模板、12 条规则、冻结页单列（`63cef48a`），11-27 06:31 UTC 上线后线上 200 页 0 个问题；事实检查 18 个来源 0 处冲突；公司官网改成 44 条规则、加别名 BRICKAI（Cloudflare `49ac6ae7`）；本站 `check-entities.mjs` 改成和 PERSON_PROFILES 逐条比、读不到 Person 就失败，SOP 2A、2B、2D 写明不做；冻结页的修复在 ASH 分支上，2027-01-02 合并。ASH 审计第 8 项认不出「混了别人作品的作者页」也一起修了（`63cef48a`）。ASH 每日任务第一次带「实体关系」检查，9 条都过（11-26，定时运行 `45745517933`，提交 `996dcf4`）：Entity relations 那步成功；线上 12 个页面（8 篇博客）、25 段 JSON-LD、12 个本人档案，0 处问题，没有页面抓取失败；日报里有「🔗 实体关系」一节，写的是「✅ 9 条都过」；13 个离线测试也通过，修复前混在一起的图照样报出 1–8 条。11-27 更正：这次「都过」只覆盖这 12 页，全站另有 36 页违反第 8 条，产品的 founder 断了也报不出来，见 v2.6。130K 数据集两个站的 `@id` 对上（11-25，ASH `4e90ec7`，09:11 UTC 上线）：首页和 /ai-info/ 的数据集 sameAs 里有总 DOI，identifier 仍是版本 DOI，所有 JSON-LD 都能解析，线上 9 条关系规则 VERIFIED；ASH 每天查人和公司分开（11-25，ASH `a57a0f5`）：9 条规则写成 `ops/geo/entity_edges.py`，并进审计第 1 项，每日 analytics 任务跑，日报加「实体关系」一节；改之前的文件查出 18 处，现在线上 0 处。公司官网看得见的 X 改标成创始人的（11-25，Cloudflare 版本 `786a9182`）；ASH 站人和公司拆开上线（11-25，`77e2eb2`）：线上 12 个页面的 JSON-LD 按 9 条查 0 个问题，上线前同一脚本查出 25 个；ASH 审计第 1–7 项 VERIFIED；jasonzhu.ai 实体检查通过；公司官网 gosailglobal.com 改好（11-25，Cloudflare 版本 `06c7b1de`）：Organization 补 `@id`、founder → #person、subOrganization → ASH，sameAs 只留公司 LinkedIn，9 处 X 链接去掉 rel="me"；线上 7 个页面和改后的文件逐字节一致；本人的别名去掉公司名 GoSailGlobal，实体检查加第 5 条（11-24，`9b68f62`，线上 21 页通过）；SOP 文档更正（11-24，`81d2e18`）：文首状态改成维护规则，Wikidata 个人条目写「不做」，个人档案 13 个改 12 个，第 5 节清单和外联文案里的 DOI 换成总 DOI；X 的 website 从 gosaillab.com 改成 jasonzhu.ai（11-24，你本人改的；`api.fxtwitter.com` 和 twitterapi.io 都读到）；npm 两个旧 token（`agentskillshub-4`、`agentskillshub -3`）删了，jasonzhu0526 账号下只剩 3 个早已过期的；2027-01 起跳过 2FA 的 token 不能直接发布，下次发版要换方式（11-24）；Google Scholar 个人页设成公开，不登录能打开了（11-24）；YouTube 频道加了 jasonzhu.ai 链接（11-24）；ORCID 加任职（11-22）；npm 两个包发布 cli 0.5.1、mcp 0.3.1（11-22）；Zenodo 纠错新版本 24432849、24432852、24432855、24432843、24432858、24435484，重复记录 24435488/89/90 指向正版，GitHub、HF、Kaggle 镜像和 dev.to 文章同步改正，给 Polar 的更正信已发（11-22）；每日实体检查 `check-entities.yml` 上线（11-22）。

---

## 2026-11-27 · v2.6：多模型复盘，第一批补检查、修错

### 证据

- **多模型复盘（11-27，pstack arena）：** Grok 4.7、GPT-6.2 Astra、Claude Fable 5.2 各自独立写下一版方案（Gemini 两次失败，没交卷），GPT-6.2 Astra 匿名打分，Claude Opus 5.5 合成。合成稿里的 18 条现状写进复查脚本重跑：属实 18、不符 0。全文在本机总文档 `~/出海/specs/实体入侵图谱.md` 附录 D（内部，不进仓库）。下面几条是这一轮要修的。
- **11-26 的「9 条都过」只覆盖 12 页：** 把 ASH 的 sitemap 全量扫一遍，场景页 24/74、蓝皮书页 12/17 带着不是 `#person` 的「Jason Zhu」，违反第 8 条。把产品节点的 founder 删掉或改指公司，9 条也都报 0 处；没有 JSON-LD 的博客页也算通过。
- **ASH 的 `twitter:site` 是本人的 @GoSailGlobal：** 仓库 20 个文件 22 处，线上也是这样，分享卡把产品归到了本人的账号上。
- **/ai-info/ 的三处摘要（description、og、twitter）写的是「287,000+ … graded」**，表格里已评级是 146,000+。事实检查不读 meta，所以没查到。
- **公司官网写「42 published rules」，ASH 现在是 44 条。** 公司官网不在任何检查里。
- **本站 `check-entities.mjs` 一个 Person 都没读到时也打印「通过」**，`x.com/<任意账号>` 都算个人档案。
- **学术检查把任何同名的 Jason Zhu 都算成本人**，修复建议写着「添加即合并」，违反维护规则第 1 条。
- **ASH 还有 10 行用着旧的版本 DOI 24387074：** `entity_audit.py` 7 行（其中两行是通过条件），首页、`llms.txt`、`CITATION.cff` 各 1 行。
- **SOP 2A 还写着「2026-11-26 follow-up」**，和 11-24 定的「学术外联不再追加」矛盾。

### 决定

- Jason 11-26 选了 arena、四家各出一个模型、推理强度 high；11-27 说「写，开工」：第一批（附录 D 第 1–9 条）当天做。
- 改到一半发现 ASH 的 GIGALinks 实验把一批页面冻结到 2027-01-01：全部 /best/，以及 /、/zh/、/how-we-grade/、/analyzer/、/agent-skills-directories/、/daily/、/stats/、/blog/securing-117k-ai-skills/。所有 SPA 页共用的首页 `index.html` 也算冻结。Jason 选「等 01-01 读完再改」：冻结页的修复放在分支上，2027-01-02 合并；在那之前，检查把冻结页上的发现单列为「🧊 冻结中」，不算问题。

### 改了什么

| 提交 | 改动 |
|---|---|
| ASH `e200ca6e` | 非冻结页修好：蓝皮书页的作者和审阅者改成只引用 `#person`（共用 `founder-ld.mjs`）；技能、审计、对比页模板和 11 篇博客的 `twitter:site` 从 @GoSailGlobal 改成产品的 @agentskillshub，博客另加 `twitter:creator` @GoSailGlobal；/about/ 的 Person 别名和本站对齐（祝彦森、Yansen Zhu、zhuyansen、JasonZhu.AI）；/ai-info/ 的 founder 只留引用，三处摘要把总数写成收录数（indexed）；`llms.txt`、`CITATION.cff` 换成总 DOI 24387073 和最新标题 |
| ASH `63cef48a` | 关系检查读 sitemap 的每种模板：static、categories、scenarios、comparisons、book、blog 全查，top、audit、daily 各取固定的 20 页，一次约 200 页。规则从 9 条加到 12 条：第 10 条产品的 founder 必须是 `#person`；第 11 条已知的博客页必须有作者边；第 12 条 `twitter:site` 不能是本人的档案。第 2 条连别名一起比。冻结页上的发现单列，2027-01-01 以后自动算回问题。事实检查读三处摘要，收录数和已评级数分开比，来源加上公司官网首页、本站 /en/about 和 `llms.txt`。学术检查认本人要 ORCID 一致，或作品 DOI 在本人的作品单里；不再建议认领、合并。`entity_audit.py` 的通过条件换成总 DOI。日报「🔗 实体关系」按规则分组，并写出覆盖了多少页 |
| ASH 分支 `entity/gigalinks-frozen-fixes`（`08fa81f8`，没合并） | 冻结页的同类修复：首页 `index.html`（`twitter:site`、Person 别名、DOI）、场景页和日报模板、/blog/securing-117k-ai-skills/。2027-01-02 合并 |
| gosailglobal.com（Cloudflare 版本 `49ac6ae7`） | 「42 published rules」改成 44；Organization 加 `alternateName` BRICKAI，Company details 加一行「Also known as: BRICKAI」。归属不变 |
| jasonzhu.ai（和这条记录同一个提交） | `check-entities.mjs`：Person 的 sameAs 要和 `PERSON_PROFILES` 逐条一致，多了、少了都报；关于页读不到 Person 记「测不出来」并失败，查全站一个都读不到也失败；B 站规则去掉。SOP 2A、2B、2D 写明「不做（11-24 定）」，删掉 11-26 的跟进 |

### 怎么验证的

- **ASH 关系检查，上线前后用同一个脚本：**
  - 上线前（冻结页已单列）线上 198 页，60 个问题：第 2 条 2 处（/about/、/ai-info/），第 8 条 12 处（蓝皮书页），第 12 条 46 处（/about/、/ai-info/、20 个审计页、11 篇博客、13 个对比页）。
  - 11-27 06:31 UTC 部署（运行 `45949188392`）以后：线上 200 页，0 个问题，VERIFIED，没有抓取失败。
  - 🧊 冻结 199 条，落在 119 页上：
    - 第 12 条 119 页：/best/ 74、/daily/ 20、蓝皮书 17，加上首页、/zh/、/analyzer/、/agent-skills-directories/、/enterprise/、/submit/、/verified-creator/、/blog/securing-117k-ai-skills/；
    - 第 8 条 28 个 /best/ 页，56 处；
    - 第 2 条 24 页：蓝皮书 17 页加 7 个 SPA 页，别名都来自首页那份 Person。
  - 第 8 条的 /best/ 从复盘时的 24 页变成 28 页。多出的 4 页是 summarization、content-writing 的中英两版，11-27 ASH `5a5b1974` 改过这两个冻结页。
- **直接抽查线上页面：**
  - `twitter:site` 是 @agentskillshub：4 个技能页、3 个审计页、2 个对比页、/category/、/about/、/ai-info/。
  - 博客：`twitter:creator` 是 @GoSailGlobal，作者是 `#person`。
  - 蓝皮书页：作者是 `#person`。它的 `twitter:site` 和那份带「Zhu Yansen」的 Person 来自冻结的首页，等分支合并。
  - /about/：Person 别名是「祝彦森、Yansen Zhu、zhuyansen、JasonZhu.AI」，12 个档案。/ai-info/：founder 只剩引用。
  - 仓库 main 上，写着 @GoSailGlobal 的 `twitter:site` 只剩 4 处，都在冻结的文件里；分支上是 0 处。
- **事实检查：** 部署后线上 18 个来源，0 处冲突，VERIFIED。部署前唯一的冲突是 /ai-info/ 摘要里的「287,000+ … graded」，现在没了。公司官网线上能看到「44 published rules」、`alternateName` BRICKAI 和「Also known as: BRICKAI」。
- **离线测试：**
  - ASH geo 76 个通过：关系 34 个、学术 12 个、事实 23 个。冻结分支上 `founder-ld` 4 个通过。
  - 这些情况都会报警：删掉产品的 founder、founder 改指公司、博客页没有 JSON-LD 或没有作者、`twitter:site` 用本人档案、别名和本站不一致、收录数和已评级数对调、公司官网规则数不对。
- **学术检查：**
  - 回放旧的响应，报挂错。
  - 今天的响应：130K 仍在「竹彦 森」名下；A5163069727 算你的（9 个作品里 6 个能用 ORCID 或 DataCite 的 DOI 对上）。
  - 输出里没有「认领」「合并」。
- **本站：** `check-entities.mjs` 线上 21 页通过，两个关于页都读到了 Person 和 12 个档案；`--static` 通过。样例里塞进 x.com/agentskillshub 会失败，页面上没有 Person 也会失败。

### 效果看哪、哪天看

- **ASH 每日任务：** 11-27 20:20 UTC 那次是第一次带 12 条规则和冻结单列。日报「🔗 实体关系」应写出约 200 页的覆盖、0 个问题、🧊 冻结约 199 条。
- **2027-01-02：** 冻结分支合并上线。从这天起，冻结页上的发现算回问题，不合并也会在日报里报出来。
- **面板：** 11-30 第一次读数（见当前待办）。这一轮改的是结构化数据和检查，不指望面板马上有变化。

---

## 2026-11-24 · v2.5：人和公司拆开

### 证据

- **AI 回答里没混（11-24 各问一次）：** 问「jasonzhu.ai 的 Jason Zhu 是谁」，Perplexity 和 ChatGPT 都答对了身份、作品（JasonZhu.AI、AgentSkillsHub、GoSail、数据集）和机构（BRICKAI / GoSailGlobal LLC），没混进别的 Jason Zhu；问 ASH 的事实，Perplexity 6 项全对。混淆在下面几处。
- **ASH 站的 JSON-LD 把产品、公司和人混在一起：** AgentSkillsHub 机构带着公司的法定名「BRICKAI (GoSailGlobal LLC)」和别名 BRICKAI；它的 sameAs 里有本人的 X（@GoSailGlobal）和 YouTube；首页的 Person 把 jasonzhu.ai 和 agentskillshub.top/about/ 放进 sameAs，还带 worksFor；8 篇博客的作者是没有 @id 的匿名 Person。
- **名字撞车：** jasonzhu.ai 上本人的 alternateName 有「GoSailGlobal」，和公司同名；公司官网 gosailglobal.com 的 sameAs 也有 x.com/GoSailGlobal。这个 X 账号显示名是「Jason Zhu（GEO）」，是本人的。
- **OpenAlex 混得比 28329 报的多：** 《Backlink Spam List》（W7237096646、重复记录 W7237007813）挂在 A5087679970 名下，这个作者页其余 7 个作品是斯坦福一位做金融和机器学习的 Jason Zhu 的（*Deep Learning in Asset Pricing*、*Forest through the Trees*）。DataCite 上这个数据集的作者挂着本人 ORCID。
- **Google：** 搜「jasonzhu.ai」前 20 全是别的 Jason Zhu（v2.4 已记），改站解决不了。

### 决定（Jason 2026-11-24「修」）

人、产品、公司三个实体分开：X @GoSailGlobal 归本人；运营公司 GoSailGlobal LLC（BRICKAI）单列，AgentSkillsHub 用 parentOrganization 指向它；本人的别名里不放公司名。

### 改了什么

| 提交 | 改动 |
|---|---|
| ASH `77e2eb2` | 运营公司单列成节点（`@id` https://gosailglobal.com/#organization，法定名、别名 BRICKAI、注册地址、founder → #person），ASH 机构用 parentOrganization 指向它，不再带法定名和别名 BRICKAI；ASH 机构的 sameAs 拿掉本人的 X 和 YouTube，换成 ASH 自己的 @agentskillshub；首页和 /about/ 的 Person 用和 jasonzhu.ai 一样的 12 个个人档案，不放网站页面，去掉 worksFor；/ai-info/、/contact/ 只引用 `@id`；8 篇博客的作者接到 https://jasonzhu.ai/#person |
| `9b68f62` | `AUTHOR_ALT_NAMES` 去掉 GoSailGlobal；`check-entities.mjs` 加第 5 条：Person 的 alternateName 不能有 GoSailGlobal、BRICKAI |
| OpenAlex 请求 28427 | 《Backlink Spam List》挂错作者，接在 28329 后面报 |
| gosailglobal.com（Cloudflare 版本 `06c7b1de`，11-25） | Organization 补 `@id` https://gosailglobal.com/#organization、legalName、founder → #person、subOrganization → ASH 机构；sameAs 拿掉本人的 X，只留公司 LinkedIn；7 个页面上 9 处 X 链接去掉 rel="me"（它和 sameAs 是同一个声明）。页面上看得见的文字没动。官网源码不在 git 里，是本机的 Cloudflare Workers 静态站 `gosailglobal-site`，用 wrangler 部署；要回滚用上一版 `7f431dac` |
| ASH `a57a0f5`（11-25） | 9 条关系规则写成 `ops/geo/entity_edges.py`（13 个离线测试），并进审计第 1 项：有一条不过，第 1 项就是 ISSUES_FOUND。每日 analytics 任务加「Entity relations」一步，日报加「🔗 实体关系」一节。本人的档案以 jasonzhu.ai 上 Person 的 sameAs 为准，读不到时第 1 条用备用名单、第 2 条不查 |
| gosailglobal.com（Cloudflare 版本 `786a9182`，11-25） | 页面上看得见的 X 改标成创始人的：首页 Company details 的「X」行改成「Founder：Jason Zhu（链到 jasonzhu.ai/en）、@GoSailGlobal on X」；联系页那节标题改成「Founder on X」，说明改成「Product news and updates from our founder, Jason Zhu.」；7 个页面页脚的「X」改成「Founder on X」 |
| ASH `4e90ec7`（11-25） | 130K 数据集两个站的 `@id` 不一样：本站用总 DOI `21292798`，ASH 用 `#dataset`、identifier 写版本 DOI `21292799`。ASH 首页和 /ai-info/ 的数据集节点在 sameAs 里加上总 DOI，也就是本站给它的 `@id`，两个站明确是同一个节点。identifier 仍写版本 DOI：Zenodo 上只有一个版本，Wikidata Q141735092、ORCID、已发的文章记的都是它；ASH 其余 28 个文件不动。SOP 维护规则第 2 条加了这条例外 |

### 怎么验证的

- **ASH：** 本地把改过的 25 段 JSON-LD 全部解析，按四条查：非 Person 节点的 sameAs 不能有个人档案、ASH 机构不带法定名、Person 没有 worksFor、首页和 /about/ 的个人档案和 jasonzhu.ai 一致。结果 0 个问题；同一套检查放在改之前的文件上能查出 3 类问题。上线后（11-25 03:36 UTC 部署）在线上 12 个页面（首页、/about/、/ai-info/、/contact/、8 篇博客）的 25 段 JSON-LD 上按 9 条查：上面 4 条和「Person 的 sameAs 不放网站页面」，加上运营公司节点在首页、ASH 机构用 parentOrganization 指向它、博客作者是 #person、每段都能解析。结果 0 个问题；同一个脚本在上线前的线上页面查出 25 个。ASH 审计第 1–7 项 VERIFIED，第 8 项仍是 OpenAlex 两处（等工单）。
- **jasonzhu.ai：** 第 5 条先在部署前的线上跑，报出 /en/about 的「GoSailGlobal」；部署后线上 21 页全部通过，Person 的 alternateName 是「祝彦森、Yansen Zhu、zhuyansen、JasonZhu.AI」。`npx tsc --noEmit` 通过。
- **gosailglobal.com：** 部署前先确认线上 10 个文件和本地逐字节一致，部署不会盖掉别处的改动；部署后线上 7 个页面（含 404）和改后的文件逐字节一致，首页 JSON-LD 能解析，sameAs 里没有 x.com，www 子域同样生效。
- **ASH 每日检查（`a57a0f5`）：** 改之前（`77e2eb2^`）的首页、联系页和 8 篇博客查出 18 处，规则 1–8 都报到；改之后 0 处；线上 12 个页面、25 段 JSON-LD 0 处；把首页换成改之前的版本喂给第 1 项，它报 ISSUES_FOUND。42 个 geo 离线测试在 Python 3.12 和 3.14 都通过。每日任务还没真跑过，见待办。
- **gosailglobal.com 第二次（`786a9182`）：** 部署前在本机起静态服务，用 agent-browser 自己的浏览器按桌面 1280、手机 390 宽截图看了首页 Company details、联系页和页脚；部署后线上 7 个页面和改后的文件逐字节一致，JSON-LD 没变。
- **130K 数据集（`4e90ec7`）：** 首页 6 段 JSON-LD 都能解析，生成器里 /ai-info/ 那段能解析，`node --check` 通过，9 条关系规则 0 处。先查过：总 DOI 解析到的就是 `21292799` 这条记录（唯一版本），OpenAlex 已把两个 DOI 认作同一个作品 W7167922915。上线后的核对见待办。

### 效果看哪、哪天看

- **关系边：** jasonzhu.ai 的 `check-entities.yml` 每天跑，第 5 条防止公司名回到人的别名里；ASH 每日 analytics 任务跑 `entity_edges.py` 的 9 条（11-25 起），日报里看「🔗 实体关系」。更正：之前写的「ASH 审计第 1 项每天跑」不对，每日任务只跑第 7 项和每周一的第 8 项，第 1 项一直不在里面。
- **OpenAlex：** ASH 日报「学术索引」每周一看，两个数据集回到你名下才算修好。
- **AI 回答：** 每周一面板的品牌题；ASH 引用面板下一次在 11-30。

---

## 2026-11-24 · v2.4：转成维护，加效果指标

### 证据

- **11-23 面板**（[摘要](panel/summary-2026-11-23.md)）：带品牌名的题四家引用本站 50–100%；不带品牌名的 ChatGPT 5%、Gemini App 3%、Google AI Mode 2%、Perplexity 29%。冻结组和 11-21 比，四家都在区间内，实体改动还没测出效果。
- **AI 自己搜的词：** 不带品牌名的 122 条里，我们在 Google 前 20 只有 6 条，前 10 只有 3 条。这是 11-24 用修好的代码重查邮件里能看到的 162 条（全部 454 条在加密存档里），每条查 1 次。
- **品牌词：** 直接搜「jasonzhu.ai」5 次都不在 Google 前 20，前 20 全是别的 Jason Zhu；「jasonzhu ai」8 次里 2 次第 1；「gosail club」3 次都不在前 20。实体图谱真正该补的是这里。
- **学术站不在 AI 的引用里：** 11-23 AI 引用最多的 20 个网站里，Zenodo、OpenAlex、SSRN、Scholar、Wikidata 一个都没有。
- **测量自己出了四次错**，都是「没测到」被写成「0」或「通过」：定时运行跳过提交却显示成功；子查询的 Google 结果全认不出网站，报成「前 20 共 0 条」；AIsa 的 Bing 结果对新品牌不相干；ASH 实体审计第 3 项（v2.2 时发现）。

### 决定（Jason 2026-11-24「按你的来」）

实体图谱转成维护：每天查事实、每周查品牌词；学术图谱只修错、不扩张；时间挪到不带品牌名的搜索词缺口上。

### 改了什么

| 提交 | 改动 |
|---|---|
| `8772edf` | 定时触发时 `inputs.publish` 为空，`!= '0'` 判成假，提交、邮件、存档被跳过：改成 `(inputs.publish \|\| '1') != '0'`（geo-panel、seller-weekly） |
| `e24dd97` | 子查询：Google 结果改从 breadcrumb 认网站；先查 `site:jasonzhu.ai` 自检，不过就写「测不出来」；Bing 默认不查；11-23 的排名标作废 |
| `62cf192` | 品牌词每周查（4 个词各 3 次）；缺口只算不带品牌名的题；Gemini 子查询改成每月一次；定时运行后直接看仓库里有没有当天的分数；`experiments.json` 补上 11-22、11-24；Person 的 sameAs 拿掉 B 站 |
| `3d80543` | 日志瘦身，操作步骤挪进 SOP；SOP 加维护规则，2C、Phase 3 改成不做 |
| ASH `6054e06e` | 学术索引检查（第 8 项）改成每周一；其余日子日报不出这一段，也不报「没核成」 |
| backlink-guard `5ed6810`（0.12.2，已上 PyPI） | 上游修好：Google 结果从 breadcrumb 认网站；Bing 不再问 `site:` 词。面板下次安装自动用上，`fanout.py` 里那层补丁变成空操作 |

### 怎么验证的

fanout 自测通过；真接口跑冻结组前 5 题：自检 `site:jasonzhu.ai` 排第 1，4 道品牌题单列、不进缺口，品牌词 4 个都有名次；`npx tsc --noEmit` 通过。部署后线上 Person 的 sameAs 是 12 条、没有 B 站，`node scripts/check-entities.mjs` 通过。backlink-guard 194 个测试通过，真接口 `site:jasonzhu.ai` 第一条认出本站；PyPI 已是 0.12.2。

### 效果看哪、哪天看

每周一的面板邮件，看走势，差 10–15 个百分点以上才算数。第一次带新检查的定时运行是 11-30。

| 指标 | 起点 | 在哪看 |
|---|---|---|
| 品牌词进 Google 前 3 | jasonzhu.ai 0/3，jasonzhu ai 1/3，gosail club 0/3（11-24） | 邮件「品牌词」、`fanout-<日期>.json` 的 `brand_serp` |
| 不带品牌名的题引用本站 | ChatGPT 5%、Gemini App 3%、Google AI Mode 2%、Perplexity 29%（11-23） | 面板摘要「带品牌名的题和不带的分开看」 |
| 不带品牌名的搜索词在 Google 前 20 | 6/122（11-24 重查） | 邮件「AI 实际搜了什么」、`totals_unbranded` |

---

## 2026-11-22 · v2.3：关系边拆开，个人站，学术图谱暂停加新东西

### 起因

v2.2 第 5 条：Person 的 sameAs 里混着作品、另一个网站，Organization 复制了同一个列表。另一个会话（「出海基本功 SEO+GEO」）2026-11-21 抓线上 JSON-LD 复核，确认 v2 文档里「已修复」的说法和线上不符：`src/lib/profiles.ts` 只有一份 `PROFILES`，Person 和 Organization 的 sameAs 都读它。

### Jason 的决定（2026-11-21/22）

1. **个人站，不写公司。** JSON-LD 不再有 jasonzhu.ai 的 Organization 节点，网站的发布者、GoSail Club 的提供者都是 #person。
2. **关系边现在修。**
3. **数据纠错提前做；纠正完之前不再往学术图谱（ORCID、Scholar、SSRN、Wikidata、OpenAlex）绑新东西。** 所以 Wikidata 两批暂缓。

### 做了什么

- `08fce2d`、`30d3287`、`fe818b4`、`0c830e3`：`PROFILES` 拆成 `PERSON_PROFILES`（13 个个人档案）、`WORKS`（2 篇论文 ScholarlyArticle、5 份 Dataset、4 个 SoftwareSourceCode）、`RELATED_SITES`（AgentSkillsHub，founder → #person，sameAs 只留 Wikidata Q141986406 和 Crunchbase）；博客文章用 citation 指向数据集，不再把 DOI 当自己的 sameAs；llms.txt 分作者、作品、相关网站三段。
- 新增 `scripts/check-entities.mjs` 和 `.github/workflows/check-entities.yml`：Person 的 sameAs 只能是个人档案；同一网址不能同时出现在 Person 和别的节点；不再引用 jasonzhu.ai 的 #organization；作品 DOI 和博客、research.ts 对得上。
- playbook 改名为 `entity-consistency-sop.md`，去掉「渗透、入侵」措辞和私人邮箱，第 3 节照实写，Wikidata 人物条目改为暂缓。

### 怎么验证的

部署后用脚本抓线上 JSON-LD：`/en`、`/zh`、`/en/about` 各 4 个节点，Person 的 sameAs 13 条全是个人档案，没有 worksFor；`/en/blog/indie-payments-report-2026`、`/en/research`、`/en/backlink-spam-list` 的作品节点作者都指向 #person；检查脚本 21 页通过。

回链核对表挪进了 SOP 第 5 节「回链核对」。

---

## 2026-11-22 · v2.2：学术索引核查与修复

### 发现

都是用公开接口实测的，2026-11-22 北京时间上午。

1. **安全论文的 DOI 没登记。** `10.5281/zenodo.24420920` 和它的上级 concept DOI `10.5281/zenodo.24420919`：
   - 在 doi.org 打不开：Handle 接口返回 `responseCode 100`，即不存在；
   - DataCite 返回 404；
   - 但 Zenodo 记录显示已发布（2026-11-21 14:37 UTC）。
   两分钟前发布的 `24420871` 是正常的。这个 DOI 已经写进了 awesome 列表的提交文案、外联话术、论文页和个人页的 sameAs。
2. **OpenAlex 把 130K 数据集挂到了别人名下。** 作品 W7167922915（`10.5281/zenodo.21292799`，concept DOI `…21292798`）的两个署名都挂错了：
   - 「zhu, yansen」被归到 A5009989201「竹彦 森」。这个作者名下另一篇是 1986 年的日本核聚变论文；
   - 「Jason Zhu」被归到 A5048188910「J ZHU」，挂着另一个人的 ORCID。
   根源：Zenodo 上这条记录把同一个人登记成了两个作者，两个都挂着你的 ORCID，OpenAlex 仍然拿名字去匹配了。
3. **OpenAlex 里你被拆成了多个作者，没有一个挂着 ORCID。** 其余作品分散在 A5163069727 和 A5087679970 两个"Jason Zhu"作者页上；用 ORCID 查 OpenAlex 作者，查不到。
4. **`10.5281/zenodo.24386243`（20 万结账链接数据集）的作者没挂 ORCID**，这条作品连不回 ORCID。
5. **jasonzhu.ai 的 Person JSON-LD 把作品写进了 `sameAs`。**
   - 23 条 sameAs 里有 10 条不是个人主页：6 个 DOI（包括上面那个打不开的）、2 篇 SSRN 论文、PyPI 包页、agentskillshub.top。
   - Organization 的 sameAs 用的是同一个列表，相当于说公司就是你的 ORCID、Google Scholar 和那几篇论文，把人和公司混成了一个实体。
   - 论文页的出版方写的是 `@id: /#org`，全站实际定义的是 `/#organization`，这条链接没有指向任何节点。
6. **收录现状**（ORCID 上 7 个作品）：
   - doi.org 能解析 6/7；
   - OpenAlex 5/7（两篇工作论文还没进）；
   - Semantic Scholar 0/7（它基本不收 Zenodo 上的工作论文，要靠 arXiv）；
   - Wikidata 1/7（只有 130K 数据集，Q141735092）。
   两篇 SSRN 论文的 DOI 也还没生成，SSRN 要等审核通过才生成。
7. **零散缺口：**
   - 5 个代码/数据仓库都没有 CITATION.cff；
   - ORCID 没有任职信息；
   - Zenodo 7 条记录的单位写法有 5 种。
8. **工具的盲区：** ASH 实体审计的第 3 项只查 DOI 能不能打开、有没有标题，所以同一天它显示 VERIFIED，没发现第 1–3 条问题。

**更正：** 前一轮对话里我说「竹彦 森」名下是一篇日本医学论文，不对，是 1986 年的核聚变论文（ICRF 加热）。

### 做了什么

| # | 事 | 谁 | 结果 / 证据 | 验证 |
|---|---|---|---|---|
| 1 | Zenodo 作者统一成一个「Zhu, Jason」并挂 ORCID：21292799（合并重复作者，补单位）、24386243（补 ORCID） | Claude，用 `~/.claude/.env` 里的 Zenodo token 调接口 | 新脚本 [`zenodo/fix_creators.py`](zenodo/fix_creators.py)，默认只预览；只改元数据，DOI、文件和版本都不变 | DataCite 2026-11-22 01:39 UTC 已同步，两条都只剩一个作者并挂着 ORCID；第 8 项不再报作者问题 |
| 2 | OpenAlex 认领作者页、把作品归到你名下 | 你 | 步骤见下文「你要做的」 | 等 OpenAlex 刷新后看日报第 8 项 |
| 3 | 24420920 的 DOI | Claude 复查 | 发布满 48 小时前不报；之后日报第 8 项会列为问题并附修法；工单模板见下文 | 2026-11-23 晚 |
| 4 | Person JSON-LD 只留个人主页；Organization 的 sameAs 只留公司 LinkedIn；ASH 节点补 `founder → #person`；论文页出版方改成 `/#organization` | Claude | `src/lib/profiles.ts` 每条标上 `kind`（profile / work / org），新增 `PERSON_SAME_AS`；llms.txt 仍列出全部 | `npx tsc --noEmit` 通过；Vercel 部署后用 curl 核对了线上 jasonzhu.ai/en：Person sameAs 13 条全是个人主页，Organization 只剩 LinkedIn，ASH 节点带 founder → #person，论文页 publisher → /#organization |
| 5 | 实体审计第 8 项：学术索引 | Claude | ASH `2e95053`：`ops/geo/academic_index.py`，8 项离线测试；作品清单从 ORCID 读，新论文自动纳入；接进 `entity_audit.py` 和每日日报 | 第一次实跑查出第 1–3 条，同一天第 3 项仍显示 VERIFIED |
| 6 | CITATION.cff | Claude | ASH `18065c3`、backlink-guard `b9909e2`、indie-saas-payments-benchmark-2026 `ac3e3a1`、cli `8dc5974`、mcp `c524704`。不写目录规模、版本、日期，文件不会过时 | 5 份都通过 cffconvert 2.0.0 校验（schema 1.2.0） |
| 6b | ORCID 加任职 | Claude 用 agent-browser 连上你的 Chrome（你开了远程调试）填写，你确认后保存 | GoSailGlobal 不在 ORCID 机构库里，按手动输入保存，页面显示为 "Unidentified organization" | ORCID 公开接口已能查到这条任职，公开可见 |
| 7 | Wikidata 人物条目 + 6 个作品条目 | 你提交，Claude 准备 | 脚本 [`wikidata/quickstatements.py`](wikidata/quickstatements.py)；第一批已生成 [`wikidata/2026-11-22-batch1-person.txt`](wikidata/2026-11-22-batch1-person.txt)。所有属性号和条目号都在 wikidata.org 上逐个核过；按 ORCID 查过没有重复条目 | 第 8 项的 Wikidata 覆盖率应从 1/7 升到 6/7 或 7/7 |
| 8 | 联系同领域三篇论文的作者，SkillProbe 那封问 arXiv cs.CR 背书 | Claude 起草，你发 | 草稿里有对方的邮箱，这个仓库是公开的，所以只存本地：`~/出海/specs/2026-11-22-academic-outreach.md` | 回复记在那份文件末尾的表里 |
| + | `agentskillshub-mcp` 的 GitHub 仓库简介去掉「100K+」 | Claude | 改成不带数字的版本，和 npm 文案「对 AI 不写数字」的规则一致 | `gh api` 已确认 |

操作步骤（OpenAlex、ORCID、Wikidata、外联）和 Zenodo 工单模板已删：做完了或者 11-24 定了不做。OpenAlex 工单模板挪进 SOP 2C；原文看 git 历史（`53bb913`）。

### 顺带记下

- **大模型实体识别的证据：** 2026 年的研究里，没有一篇单独测出 Wikidata 或 sameAs 对大模型认出品牌的效果。能确认的是：认不认得按话题算；不带品牌名的问题里，品牌被提到的概率低得多。所以实体图谱只算地基，效果要看 GEO 面板里"不带品牌名的题"和"用了没署名"两列。

---

## 2026-11-21 ~ 22 · v2.1：事实一致性

- **ASH 实体审计第 7 项**（agent-skills-hub `75d9e9d`）：网站、GitHub、npm、Wikidata、Zenodo 共 15 处说的数字、日期、创始人、仿冒域名是否一致。账本在 `ops/geo/brand-facts.json`，收录数和评级数从网站实时读取。
- **第一次跑**查出 4 处过期数字，已修（`6062d83`）。修法：网站页面改成构建时自动填数；发出去就改不了的文案只写往下取整的数（250K+）；发给 AI 的说明不写数字。两个 npm 包 2026-11-22 发布（cli 0.5.1、mcp 0.3.1）；上线后重跑第 7 项，15 处来源 No conflicts，第一次全部一致。
- **接进每日日报**（`3d8be96`），并直接给出待办：改哪个文件、改成什么（`f6f619d`）。同时修了一个漏洞：实时数没读到时，原来会把所有数字误报成过期，现在当天跳过数字比对并注明。
- **GEO 面板**（这个仓库 `ed36bd6`）：
  - 新增"用了我们的数据""用了没署名"两个口径，依据是 `signature-facts.json` 里我们独有的 23 个数字；
  - 每次结果记下运行配置（题库、事实清单和脚本的哈希，backlink-guard 版本，每家的模型和采样次数），配置变了摘要里会写明。

## 2026-11-21 · v2：身份统一、结构化数据、多平台互链、学术 PDF

见 playbook 第 3 节。主要做了这些：
- 开了 ORCID，认证了 Google Scholar，绑定了 SSRN；
- 写清"人 → 公司 → AgentSkillsHub""人 → 数据集"两条关系；
- 5 个 Zenodo 数据集写回 ORCID，HuggingFace、Kaggle 各 3 个数据集补齐；
- 两篇工作论文发在 Zenodo、SSRN 和 jasonzhu.ai 的论文页。

## v1：起点

见 playbook 第 3 节「What v1 Already Had」：4 份原创数据集、两个主站、零散的外部节点。
