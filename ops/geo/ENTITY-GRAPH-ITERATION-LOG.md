# 实体图谱迭代记录

方法论和资产清单在 [`entity-consistency-sop.md`](entity-consistency-sop.md)（2026-11-21 由 ENTITY-GRAPH-INFILTRATION-PLAYBOOK.md 改名）。这里记每一轮**发现了什么、改了什么、谁来做、什么时候复查**，最新的在上面。

**怎么查现状：** agent-skills-hub 仓库的 `python3 ops/geo/entity_audit.py --mode molecule --no-save`，一共 8 项。第 7 项查各处事实是否一致，第 8 项查学术索引。第 7、8 项每天也会跑一遍，结果进 ASH 的「数据四件套日报」邮件，有问题时邮件标题会提示。

**每条记录写：** 证据（怎么查到的，能复现）→ 做了什么（提交号、文件）→ 谁做 → 怎么验证的 → 下次什么时候看。

---

## 当前待办

| 事项 | 谁 | 什么时候 / 触发条件 | 状态 |
|---|---|---|---|
| 安全论文 DOI `10.5281/zenodo.24420920`（及上级 concept DOI `24420919`）没登记到 doi.org | Claude 复查，必要时你提工单 | 2026-11-23 22:37（北京时间，发布满 48 小时）；日报第 8 项过了宽限期会报出来 | 🟡 11-23 下午查：concept DOI `24420919` 和 1.1 版 `24432858` 已能解析，只剩已被取代的 1.0 版 `24420920` 没登记。站上用 concept DOI，不受影响；22:37 后还不行再用下文的工单模板 |
| OpenAlex：130K 数据集挂在两个别人名下，你的其余作品拆在两个作者页上 | 你登录 openalex.org | 约 2026-11-24：DataCite 11-22 已改对，等 OpenAlex 刷新（约两天）后再做 | ⏳ 等刷新 |
| ORCID 加任职 | Claude 在你的 Chrome 里填写，你确认后保存 | 2026-11-22 | ✅ GoSailGlobal LLC · Sheridan, Wyoming, US · BRICKAI / Agent Skills Hub · Founder；开始日期没填；ORCID 公开接口已能查到 |
| Wikidata：第一批（建人物条目） | 你 | **暂缓**：Zenodo 数据纠正发布完，并且有 2–3 个独立来源报道之后再说（Jason 2026-11-22 定） | ⏸ 暂缓。现有两个条目是用临时账号 `~2026-55148-80` 建的；批次文件 `ops/geo/wikidata/2026-11-22-batch1-person.txt` 留着不用 |
| Wikidata：第二批（6 个作品条目 + 连上 ASH 和 130K 数据集） | 你 | 同上，第一批之后 | ⏸ 暂缓 |
| 学术外联三封 | 邮件由 Claude 在 Gmail 写信页填好、你点发送；LinkedIn 那条你自己发 | 2026-11-22 | 🟡 两封邮件已发（SkillProbe 一作、NVIDIA 一作），LinkedIn 待发；回复记在本地草稿文件末尾。两封的第二条数据用的是论文 1.0 版说法，更正信已在原对话里回复，两封都已发（11-23） |
| 两个 npm 包发布（cli 0.5.1、mcp 0.3.1，修过期数字） | Claude 用你给的 npm token 发布 | 2026-11-22 | ✅ 已上线（npm 先返回 202，处理几分钟后才可见）。🟡 用过的两个 token（`agentskillshub-4`、`agentskillshub -3`）还没删：删除要在 npm 设置页过安全密钥或密码验证，等你操作；它们 2027-02-19 才过期（之前写「等 7 天过期」是错的）。npm 从 2027-01 起不再允许跳过 2FA 的 token 直接发布，下次发版要换发布方式 |
| Zenodo 7 条记录的单位写法不统一 | 不急 | 有空时 | 记下，没改 |
| Zenodo 纠错新版本：01/02/03/04 四份数据集、两篇工作论文、3 份 11-20 重复记录（24387070、24387080、24387082） | Claude（数据纠错子代理） | 2026-11-22 | ✅ 全部发布并核对：新版本 24432849、24432852、24432855、24432843、24432858、24435484，重复记录 24435488/89/90 指向正版；站上改用总 DOI（每个都在 doi.org 查过能解析）；GitHub、HF、Kaggle 镜像和 dev.to 文章同步改正；给 Polar 的更正信已发（2026-11-22） |
| SSRN 两篇论文换成 1.1 版 | SSRN 客服；换不了就由 Claude 在你的 Chrome 里走 Revise（你登录） | 等客服回复，或等 SSRN 的审核通过邮件 | 🟡 11-23 查：两篇都还在审核队列（PRELIMINARY_UPLOAD），通过前没有 Edit 和 Revise。当天用网站邮箱写信请客服在审核前换成 1.1 版（附两份 PDF，Resend 显示已送达）。改版说明和进展在 `ops/geo/papers/SSRN-revision-notes-2026-11-21.md` |
| 个人档案回链 jasonzhu.ai：Hugging Face、Kaggle、YouTube、B 站没有；X 的 website 字段是 gosaillab.com | 你登录各平台改 | 随时 | ⬜ 清单见下面 2026-11-22 · v2.3 第 4 条 |
| Google Scholar 个人页设成公开（现在对外 404）；B 站改名、写简介（现在是「香菇的猪」、简介空） | 你 | 随时 | ⬜ 这两条还在 Person 的 sameAs 里 |
| 每日实体检查 `check-entities.yml` | 自动 | 每天 | ✅ 已上线，手动跑过一次通过（run 44981354838） |

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

### 回链核对（补回链要你登录各平台）

| 档案 | 链回 jasonzhu.ai |
|---|---|
| ORCID、GitHub | 有 |
| X | 部分：website 字段是 gosaillab.com，简介正文写了 jasonzhu.ai |
| Hugging Face、Kaggle、YouTube、B 站 | 没有 |
| 抖音、小红书 | 不登录看不到 |
| SSRN、LinkedIn、Product Hunt | 脚本被拦或要登录，没法确认 |

GitHub 简介里「200k Checkout Links & 105k」两个数要等 Zenodo 纠错发布后跟着改。

### 下次看

Zenodo 新版本发布后当天：站上 DOI 换成 concept DOI，跑 `node scripts/check-entities.mjs`；2026-11-24 和 v2.2 的 OpenAlex 复查一起看。

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

### 你要做的

**OpenAlex（约 11-24 之后）**

1. 先看那天的日报「学术索引」。W7167922915 如果已经不挂在 A5009989201 / A5048188910 名下，说明 OpenAlex 已经按 DataCite 的新数据刷新了。
2. 在 openalex.org 注册（免费），进 Settings → Link ORCID，用 ORCID 登录。如果有作者页挂着你的 ORCID，会自动认领给你。
3. 认领后，在你的作者页用 DOI 添加作品：
   - 7 个 Zenodo DOI：24420871、24420920、24386243、24387072、24387074、24387076、21292799，前缀都是 `10.5281/zenodo.`；
   - A5163069727、A5087679970 上的作品也加进来。OpenAlex 的说法是，加进来就算合并。
4. 如果没有任何作者页挂着你的 ORCID，就打开 A5163069727 点 Claim，在"证明链接"里填一个同时写着你 OpenAlex 账号邮箱的论文页面。安全那篇工作论文的 PDF 首页印着联系邮箱（已核实）：OpenAlex 账号用那个邮箱注册，就能用论文链接证明。个人网站和 LinkedIn 它不认。
5. 如果 W7167922915 还挂在别人名下，又移不过来：到 help.openalex.org 提工单。写明作者 A5009989201、A5048188910，作品 W7167922915，证据是 DataCite 上 `10.5281/zenodo.21292799` 的唯一作者是 Zhu, Jason，ORCID 0009-0000-2894-6285。

**ORCID 任职（orcid.org → Employment → Add）**

- 组织：GoSailGlobal LLC。不在下拉列表里就手动填，城市 Sheridan，州 Wyoming，国家 United States。这个地址和 jasonzhu.ai 结构化数据里公开的公司地址一致。
- 职位：Founder；部门可以填 BRICKAI / Agent Skills Hub。
- 开始时间：按实际填（我不知道）。
- URL：https://jasonzhu.ai/en

**Wikidata（quickstatements.toolforge.org，用你的 Wikidata 账号登录）**

0. 先在 https://www.wikidata.org/wiki/Special:CreateAccount 注册账号。Q141986406、Q141735092 两个条目当初是没登录时编辑的，系统记在临时账号 `~2026-55148-80` 名下，这个账号用不了 QuickStatements。新账号头几天编辑速度有限制，QuickStatements 会自动慢慢提交。
1. New batch → 粘贴 `wikidata/2026-11-22-batch1-person.txt` 的内容 → Import V1 commands → Run。建好后记下新人物条目的 QID。
2. 把 QID 告诉 Claude，或者自己运行 `python3 ops/geo/wikidata/quickstatements.py works Q你的QID > batch2.txt`，再按同样步骤提交。第二批会：
   - 给 AgentSkillsHub（Q141986406）填创办人；
   - 给 130K 数据集（Q141735092）填作者，并删掉原来的纯文字作者名；
   - 建 5 个作品条目。24420920 的 DOI 打不开，脚本会自动跳过。等它能解析了再跑一次即可：已经有 Wikidata 条目的 DOI 会自动跳过，不会重复建。
3. 第二批之后，在 Q141986406 页面手动删掉旧的「founder: unknown value」那条。QuickStatements 删不掉这种值。
4. 风险：这是给自己建条目。每条陈述都带了来源（ORCID、Zenodo、ASH /about/），措辞中立，但仍可能有编辑提出质疑。真有人质疑，就以 130K 数据集和 AgentSkillsHub 两个条目需要指向作者为理由（Wikidata 收录标准第 3 条"结构性需要"）。

**外联**：打开 `~/出海/specs/2026-11-22-academic-outreach.md`，按里面的顺序发。

### Zenodo 工单模板（11-23 后 DOI 仍打不开时用）

先由 Claude 用 token 对这条记录做一次不改内容的「编辑 → 发布」，这样会重新触发 DOI 登记。还不行，你再提工单，地址 https://zenodo.org/support，类别选 "Record / DOI"：

> Subject: DOI 10.5281/zenodo.24420920 (and concept 10.5281/zenodo.24420919) not registered with DataCite
>
> Hello, record https://zenodo.org/records/24420920 was published on 2026-11-21 at 14:37 UTC and shows DOI 10.5281/zenodo.24420920, but the DOI does not resolve at doi.org (handle API returns responseCode 100) and DataCite returns 404 for it and for the concept DOI 10.5281/zenodo.24420919. A record I published two minutes earlier (24420871) registered normally. Could you re-trigger the DataCite registration? Thank you.

### 复查节点

- **2026-11-23 晚：** DOI 24420920。过了宽限期，日报第 8 项会把它列为问题。
- **约 2026-11-24：** OpenAlex 刷新后，看 W7167922915 挂在谁名下、有没有作者页挂上 ORCID，然后做上面的 OpenAlex 步骤。
- **每周看一次日报第 8 项的覆盖率：** OpenAlex 目标 7/7，Wikidata 目标 7/7，Semantic Scholar 要等 arXiv。

### 顺带记下

- **Agent Skills '26（ACM CAIS 2026）** 是专门讨论 agent skills 的学术研讨会，NVIDIA 那篇 Evaluating Skills 就在这里发表。明年可以考虑投稿，比单靠 SSRN 和 Zenodo 更容易进 Semantic Scholar 和 Google Scholar。
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
