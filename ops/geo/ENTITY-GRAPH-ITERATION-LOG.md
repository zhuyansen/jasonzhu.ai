# 实体图谱迭代记录

方法论、规则和操作步骤在 [`entity-consistency-sop.md`](entity-consistency-sop.md)。这里只记两样：**还没办完的事**，和**每一轮发现了什么、改了什么、效果怎么看**，最新的在上面。做完的操作步骤不留在这里，要看去 git 历史。

**怎么查现状：**
- 事实和学术索引：agent-skills-hub 仓库的 `python3 ops/geo/entity_audit.py --mode molecule --no-save`，一共 8 项。第 7 项（各处事实是否一致）每天跑，第 8 项（学术索引）每周一跑，结果进 ASH 的「数据四件套日报」邮件，有问题时邮件标题会提示。
- 效果：GEO 面板（[`PANEL.md`](PANEL.md)），每周一自动跑。实体图谱看三样：不带品牌名的题有没有引用本站；AI 搜的不带品牌名的词，我们在 Google 前 20 有几条；品牌词（`brand_serp`）本站排第几。

**每一轮记四样：** 证据（怎么查到的，能复现）→ 改了什么（提交号）→ 怎么验证 → 效果看哪一项、哪天看。改动同时在 [`experiments.json`](experiments.json) 记一条，面板周报才对得上。

---

## 当前待办

| 事项 | 谁 | 什么时候 | 状态 |
|---|---|---|---|
| 第一次带新检查的定时运行：「分数进了仓库」那步通过、子查询自检通过、邮件里有品牌词名次 | Claude | 2026-11-30（周一）跑完后 | ⏳ |
| OpenAlex：130K 数据集（W7167922915）还挂在 A5009989201「竹彦 森」名下，按 ORCID 查不到作者（11-24 查） | 你提工单，模板在 SOP 2C | 现在 | 🟡 只做这一件；认领、合并作者页不做 |
| 回链：X 的 website 字段改成 jasonzhu.ai；YouTube 简介加 jasonzhu.ai 链接 | 你登录改 | 定一天一起做，约 10 分钟 | ⬜ |
| Google Scholar 个人页对外 404：点公开；不想公开就告诉 Claude 从 sameAs 删掉 | 你 | 同上 | ⬜ |
| B 站改名、写简介（现在是「香菇的猪」、简介空），改好后告诉 Claude 加回 sameAs | 你 | 不急 | ⬜ 11-24 已从 sameAs 拿掉 |
| npm 两个旧 token（`agentskillshub-4`、`agentskillshub -3`）删掉 | 你在 npm 设置页过安全密钥或密码验证 | 现在 | 🟡 还没删，2027-02-19 才过期。2027-01 起跳过 2FA 的 token 不能直接发布，下次发版要换方式 |
| 学术外联 | 你 | 等回复 | 🟡 两封邮件（SkillProbe 一作、NVIDIA 一作）和更正信都已发，LinkedIn 邀请已发；不再追加。回复记在 `~/出海/specs/2026-11-22-academic-outreach.md` 末尾 |
| SSRN 两篇换成 1.1 版 | SSRN 客服 | 等邮件 | ⏳ 不再跟进；审核通过后看一眼是不是 1.1 版（`papers/SSRN-revision-notes-2026-11-21.md`） |

**不做了（2026-11-24 定）：** Wikidata 人物条目和 6 个作品条目（有 2–3 家独立媒体报道后再议，条件见 SOP Phase 3）；OpenAlex 认领、合并作者页、补 DOI；为进学术索引去找 Semantic Scholar 收录、arXiv 背书；Hugging Face、Kaggle 补回链；Zenodo 单位写法统一；追安全论文 1.0 版 DOI `24420920` 的登记（已被 1.1 版取代，站上用总 DOI `24420919`；11-24 查总 DOI 和 1.1 版 `24432858` 都能解析）。

**最近办完：** ORCID 加任职（11-22）；npm 两个包发布 cli 0.5.1、mcp 0.3.1（11-22）；Zenodo 纠错新版本 24432849、24432852、24432855、24432843、24432858、24435484，重复记录 24435488/89/90 指向正版，GitHub、HF、Kaggle 镜像和 dev.to 文章同步改正，给 Polar 的更正信已发（11-22）；每日实体检查 `check-entities.yml` 上线（11-22）。

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
