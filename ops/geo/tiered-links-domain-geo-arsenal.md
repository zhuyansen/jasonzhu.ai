# 通用 SEO × Domain × GEO 全梯队武器库（Tier-0 ~ Tier-3）

> **定位**：站点无关的通用外部增长武器库（适用于独立站 / SaaS / 工具站 / 开源项目 / 内容品牌）。
> **核心铁律（JP 口径 + 实战复盘）**：
> **「Tier-2 / Tier-3 就是 Tier-2 / Tier-3，绝不要把它们当成 Tier-1 来对待。」**
> 每一层有且仅有自己对应的杠杆——把预算和人力按梯队精准分层，而不是拿 Tier-3 盲盒站群赌主站排名，也不是拿 Tier-1 价格去买泛流量目录。

---

## 一、四层梯队总览（Links × Domain × GEO 三线合一）

| 梯队 | 核心职责 | 指向目标 | 对 Google SEO 作用 | 对 AI 搜索（GEO）作用 | 典型预算 / 形态 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Tier-0：不可伪造的权威实体 & 知识图谱锚点** | 确立全球唯一实体 ID、消歧、提供一手可引用数据/代码源 | 主站实体 (`@id` / `sameAs`) + 核心报告页 | 极强 E-E-A-T 底座（DR 90+ 官方元数据引用） | **最高信任源**：冲突消歧首选、OpenAlex/Google Dataset 抓手、模型训练底座 | `\$0`（拼一手数据/开源/学术门槛） |
| **Tier-1：高权重编辑级外链 / 301 净资产 / AI 已引用榜单** | **决定能否打进 Google Top 10**（95% AI 引用门槛）+ 抢占 AI 扇出榜单前排 | **直指主站 Money Pages** / 核心专题页 | **核心排名引擎**（真实流量 + 页面级相关性传权） | **双重席位**：既推主站进 Top 10，也让高权重第三方页在 Query Fan-out 里直接点名你 | 免费换量（数据 PR / 记者报价）或 `\$60–\$500+`/条；老域 `\$300–\$5,000+` |
| **Tier-2：可秒收高权重社区 / 开发者平台 / 自选真站插链** | 快速索引、稀释锚文本、占领 Perplexity/ChatGPT 最爱的社区 RAG 池、给 Tier-1 加权 | 指向 **主站专题页 + Tier-0 DOI + Tier-1 外链页** | 链接轮廓多样化 + 给 Tier-1 客座文传权防掉收 | **极快见效**：Reddit / GitHub / Dev.to / YouTube 往往当天就能进 AI 引用池 | `\$0`（内容分发）或 `\$15–\$60`/条（自选站/精筛插链） |
| **Tier-3：自动化实体共现池 / 索引助推 / 导航目录** | 铺无链实体+DOI 共现语料、给 Tier-1/Tier-2 页面催收索引、基础发现层 | **严禁当主站支柱**；用于垫底共现或推 Tier-1/2 收录 | 几乎不传核心排名权重（部分甚至无 `<a>` 标签） | 低成本扩充全网「品牌 + 数据 + DOI」共现频率，需过 7 天收录率止损闸门 | 免费额度 / `\$5–\$15`/篇或 `\$7–\$20`/月 |

### 各 Tier 最小有效剂量速查（按「打穿 1 个主题簇 / 重点页」估算）

| 梯队 | GEO 见效门槛（数量） | Google SEO 见效门槛（数量） | 典型见效时间 | 参考投入 / 簇 |
| :--- | :--- | :--- | :--- | :--- |
| **Tier-0** | **1–3 个强实体锚点**（Zenodo DOI + HF/Kaggle + GitHub/npm + Wikidata） | 重质不重量，作 E-E-A-T 底座（需靠 Tier-1/2 引爆） | 3–14 天进学术索引，2–6 周进冲突消歧 | `\$0` |
| **Tier-1** | **2–5 个 AI 已引用榜单/对比页**进前 3 槽位（Greedy Set Cover） | KD < 20：3–8 条；KD 20–45：10–25 条（或 1 个干净同赛道 DR 35–50 301 老域）；KD 50+：30–60+ 条 | GEO 榜单插名 **1–3 周**；Google 排名 **4–12 周** | 免费（数据 PR）或 `\$150–\$1,500` |
| **Tier-2** | **5–15 个多模态分布节点**（Reddit + 带字幕 YouTube + Dev.to/Medium + Awesome PR + G2/PH） | 给 Tier-1 页面加权：每条 Tier-1 配 **3–5 条**干净二级链即可 | **24 小时 – 14 天**进 Perplexity / ChatGPT 引用池 | `\$0` 或 `\$50–\$150` |
| **Tier-3** | **单簇集中 15–30 篇**（前提：Day 7 Google 收录率 ≥ 30%） | 几乎无法独立撬动竞争词排名 | **2–6 周**看长尾共现信号；Day 7 收录 ~0% 则止损 | 免费额度 / `\$100–\$400` |

---

## 二、武器库详表（按 Links / Domain / GEO 三条线分类）

### 1. Tier-0：学术实体、开源底座与官方知识图谱（GEO + E-E-A-T 天花板）

| 武器 / 平台 | 类型 | 作用机制 | 成本 | 适用场景与操作要点 |
| :--- | :--- | :--- | :--- | :--- |
| **CERN Zenodo** (`zenodo.org`) | GEO + Link | 上传一手 CSV/Parquet 研究数据集 → 5 分钟签发永久 **DOI** → 自动同步 DataCite / OpenAIRE / OpenAlex / Google Dataset Search | 免费 | 每份原创行业调研/基准测试必发；与官网 `Article` JSON-LD `sameAs`/`citation` 双向绑定 |
| **Hugging Face Datasets** (`huggingface.co`) | GEO + Link | 开发者与 AI 爬虫顶级信任库（DR 90+），适合托管数据卡 + 评测基准 | 免费 | 与 Zenodo DOI 互引；README 写清品牌(域名)与核心统计 |
| **Kaggle Datasets + Notebooks** (`kaggle.com`) | GEO + Link | DR 93 第二条数据进水口，附带可运行分析 Notebook | 免费 | 一份数据「一鱼三吃」：Zenodo + HF + Kaggle |
| **arXiv** (`arxiv.org`) | GEO + Link | 学术预印本（需对应领域 endorser），直接进入 Semantic Scholar / Google Scholar / 顶级科技媒体选题池 | 免费 | 有强实证/系统评测数据时投 `cs.CR` / `cs.SE` / `cs.CL`，再拿论文链接去 Pitch 科技媒体 |
| **Wikidata / Crunchbase / Wikipedia** | GEO Entity | 机器实体身份证（`QID`）；Wikipedia 门槛高（需 5+ 独立权威媒体深报），**先做 Wikidata + 有 DOI 的数据集条目** | 免费 | 严禁买 Fiverr 付费词条（删率 80%）；所有站内 `sameAs` 必须指向同一实体 |
| **平台原生市场（GitHub / npm / PyPI / Chrome Web Store / MCP Registry / GPTs）** | GEO + 分发 | 独立于 Web SEO 的原生搜索入口 + 高 DR 官方页面（Chrome 商店 DR 99）+ 常驻 Agent 触点 | `\$0–\$5` | 优化仓库名关键词、20 个 Topics、结构化 README、npm keywords；「产品即外链」 |

---

### 2. Tier-1：主力外链、权威 PR、AI 榜单插名与 301 老域资产

#### 2A. Links & Digital PR（直指主站 Money Pages）

| 武器 / 平台 | 类型 | 特点与核心指标 | 参考价格（2026） | 选型建议 |
| :--- | :--- | :--- | :--- | :--- |
| **Featured** (`featured.com`，已整合 **HARO** 与 **Connectively**) | Tier-1 PR + GEO | 记者实时提问聚合 + AI 辅助写 Pitch + GEO 追踪，拿真实媒体专家引用与高 DR 外链 | 免费版 / `\$39–\$299`/月 | **独立开发者首选 Tier-1 入口**；拿自己的一手数据回答记者，转化率远高于泛泛而谈 |
| **Qwoted** (`qwoted.com`) | Tier-1 PR + GEO | 实时检索记者需求 + 建被动专家档案等记者主动联系，国际化媒体多 | 免费版 / ~`\$150`/月 | 与 Featured 搭配用，尤其适合金融/出海/AI/创业赛道 |
| **一手数据反向 Outreach（BlueTree "Make Sense" 打法）** | Tier-1 编辑链 | 把你的行业报告/评测数据直接发给报告里表现亮眼的 SaaS 厂商博客、垂直媒体编辑或已引用竞品的榜单作者 | `\$0`（时间成本） | 最高质量且 100% 免费——先用 Greedy Set Cover 算出 AI 面板里边际覆盖最高的 10–15 个真站精准突破 |
| **BlueTree Digital** (`bluetree.digital`) | 托管 Tier-1 PR | B2B/SaaS 托管编辑外链，650+ 合作媒体，保底 DR 60+ 且月自然流量 >3,000，带 12 个月补链保障 | `\$3,500`/月起（6 条） | 有成熟 MRR、预算充足的 SaaS 团队外包主力 |
| **Editorial.Link / uSERP / Siege Media** | 托管 Tier-1 | 按条买真实编辑链（Editorial.Link ~`\$375`/条）或内容驱动 PR（uSERP / Siege Media `\$3,000+`/月） | `\$375`/条起 | 适合单点攻克极高商业价值核心词 |
| **INSERT.LINK** (`insert.link`) | Tier-1/2 自选 + GEO | 3.6 万+真实站、5,000 万+已收录页面，支持 **NLP 按具体单页搜索**（精准找已排首页的 Listicle 做插链），支持 **AIO 引用筛选** + **API / MCP** | ~`\$20`/条起 | **性价比最高的自选真站插链市场**；挑单页本身有自然流量且放行 AI 爬虫的对比页 |
| **Collaborator.pro** (`collaborator.pro`) | Tier-1/2 自选 + GEO | 3.8 万+真站 + 3k Telegram，接入真实 GA/GSC 流量验证，支持按 **Google AI Overviews** 筛选，75% 订单 48h 内交付 | ~`\$40–\$90`/篇起 | 透明度高、交付快，适合挑真实垂直科技/SaaS 站 |
| **CiteMP / SearchEye / Dageno AI** | GEO 专向市场 | 专门针对「LLM 已经引用的对比文 / 榜单 / 媒体」投放品牌位与引用追踪（SearchEye 5 万+审核媒体） | `\$40`/篇起 | 专门用于填补「AI 引用缺口（Citation Gap）」 |
| **WhitePress / Loganix / Rhino Rank / FATJOE** | 客座文 / Niche Edits | **WhitePress**：15 万+多语种媒体、36 个月质保；**Rhino Rank**：人工精筛插链（`\$60` 起）；**FATJOE**：代理白标固定档位（`\$72–\$80` 起，不提前看域） | `\$60–\$500`/条 | 需出海多语种选 WhitePress；可控性优先选自选库（INSERT.LINK / Collaborator / WhitePress）而非盲订 |

#### 2B. Domain：过期老域、301 沉睡资产套利与 PPN（高杠杆，但 2026 验毒极严）

| 武器 / 平台 | 类型 | 作用与特点 | 参考价格（2026） | 避坑与风控要点 |
| :--- | :--- | :--- | :--- | :--- |
| **Odys Global** (`odys.global`) | 精选老域 + DFY 301 | 人工严选 1,000+ 高权威老域，附带完整外链与历史报告，提供交钥匙 301 并购方案 | `\$1,000–\$20,000+` | 省心但贵，适合成熟主站直接并购同赛道老牌资产 |
| **SEO.Domains** (`seo.domains`) | 大体量固定价老域库 | 22 万+ 老域库存（含 150+ 国家 ccTLD 与细分垂直域），**注：也是 GIGALinks 的母公司** | `\$30–\$60,000+` | 买**干净同赛道老域做 301 / 建站**可用（但仍须二次验毒）；**不建议买它家站群租链** |
| **GoDaddy Auctions** | 过期域名竞拍 / Closeout | 全网最大原始池；竞拍后 5 天 Closeout 阶段每日降价（`\$50 → \$5` + 续费） | `\$4.99`/年会员 + 竞价 | 零审核，必须自己用 SpamZilla + Ahrefs + Wayback 全套验毒 |
| **DropCatch / NameJet / SnapNames** | 删期抢注（Drop-Catch） | 盯住刚过期进入 `PendingDelete` 的竞品/行业死站毫秒级抢注（DropCatch 主打 `.com`，单人抢注 `\$59`） | `\$59` 起（多人抢则公开竞拍） | 配合 DataForSEO Backlinks API 定期扫竞品死链 / 过期工具站，捡漏性价比极高 |
| **ExpiredDomains.net + SpamZilla + DomCop** | 发现与验毒筛子（不卖域） | **ExpiredDomains.net** 免费抓全网 660+ 后缀；**SpamZilla**（`\$37`/月）聚合 35 万+/天待删域并打垃圾分（SZ Score） | 免费 / `\$37–\$98`/月 | 标配筛选流：**ExpiredDomains/SpamZilla 初筛 → Wayback 查 5 年快照 → Ahrefs 查锚文本/外链 → VirusTotal 查黑历史** |

> **⚠️ 2026 年 301 资产套利 3 条生死红线（Google Expired Domain Abuse 专项打击）**：
> 1. **严禁跨品类硬跳**：学校/慈善/本地餐饮老域 301 到 SaaS/AI 站，Google 极大概率直接忽略权重甚至触发整站波动；必须**同赛道主题连续**。
> 2. **页面级 1:1 映射 > 全站跳首页**：把带外链的旧深层 URL 全部通配 301 到首页会被判 Soft 404 丢权；必须按主题一对一 301 到对应专题页/文章页。
> 3. **先验毒再买单**：只要 Wayback 出现过博彩/成人/日韩灰产跳转或锚文本畸形，一律放弃。

---

### 3. Tier-2：高权重社区、开发者内容源、口碑目录与干净二级助推

| 武器 / 平台 | 类型 | 作用机制 | 成本 | 实战要点 |
| :--- | :--- | :--- | :--- | :--- |
| **YouTube（含清晰字幕 Transcript）** | GEO 核心模态 | 实证 AI 搜索引用率是其他视频平台 **200 倍**，出现在近 30% AI Overviews 中 | `\$0` | **前 30 秒口播/字幕必须直接说出品牌名、定义与核心数据**（AI 算的是字幕切片相似度） |
| **Reddit**（垂直 Subreddit） | GEO + 社区 | ChatGPT / Perplexity 高频引用源（Perplexity 约 18% 落地在 Reddit/Quora） | `\$0` | 先养 500+ Karma；用实测干货/数据表回帖，切忌首楼硬塞链接和多号互顶 |
| **Dev.to / Hashnode / Medium / Substack / LinkedIn Articles** | Tier-2 长文 + GEO | 极快秒收、高 DR 寄生排名，极易进入 AI 联网检索 Top 10 | `\$0` | 适合同步发评测拆解、改写版长文（注明 canonical 或差异化角度），同时指回主站 + Tier-0 Zenodo DOI |
| **Hacker News (`Show HN`) / Indie Hackers / Quora** | GEO + 曝光 | 一次高赞 Show HN 天然衍生 10+ 镜像站回链；Indie Hackers 是出海/SaaS 词的 AI 爱抓源 | `\$0` | 钩子必须是**一手实证结论**（如「扫了 13 万技能 / 20 万收款链接发现…」），不是产品广告 |
| **G2 / Capterra / Product Hunt / AlternativeTo / StackShare / SourceForge / Trustpilot** | 行业口碑与评测目录 | 吃「Best X / X alternatives / X reviews」商业意图词，同时提供高权重品牌实体背书 | 免费起步 | 一次性必铺齐；上线后引导 5–10 个真实用户留评解锁精选位 |
| **GitHub Awesome 列表 PR / 开源项目赞助** | 开发者 Tier-2 | 高星 Awesome README 的链接与品牌描述直接被开发者和 AI 双重抓取 | `\$0`（或小额赞助） | **核心技巧**：争取写进顶部对比表/前排条目（防长文档底部截断），统一写「品牌名 (域名)」 |
| **Serpzilla（Tier-2 助推模式）/ PressWhizz / Adsy / iCopify** | 付费 Tier-2 放大器 | **Serpzilla**（`\$7–\$8`/月起，支持按天租链+自动检查收录并替换未收录链）；**Adsy / iCopify**（`\$5–\$20` 自选站） | `\$5–\$30` | **只用来给已发好的 Tier-1 客座文、媒体报道或专题页加权催收**，绝不拿廉价租链直接猛灌主站首页 |

---

### 4. Tier-3：自动化实体共现池、索引垫脚石与基础目录（严格限权使用）

| 武器 / 平台 | 类型 | 真实定位 | 参考成本 | 正确姿势 & 严禁事项 |
| :--- | :--- | :--- | :--- | :--- |
| **GIGALinks** (`gigalinks.com`，SEO.Domains 旗下) | Tier-3 无外链 Citations | 自有 ~3 万过期域发无外链品牌提及文章，支持 API / 表格批量发 | 免费额度 / `\$14`/篇 | **绝不当 Tier-1 用**；用来集中打穿 1–2 个主题簇铺设「品牌 + 核心数字 + Zenodo DOI」共现，**必须设 Day 7 收录率闸门**（收录差就降写稿成本、不再续费） |
| **PRNEWS.IO / EIN Presswire / BrandPush** | 通稿分发 | 新闻稿一键分发到上百家地方/聚合新闻站（多为 nofollow 或易过期） | `\$5` 起 / `\$99–\$300`/次 | 只用来在新产品发布/重磅研究报告上线时造「全网品牌一致性声量 + 辅助收录」，别指望单靠通稿推高竞争词排名 |
| **免费 AI / SaaS 导航站 & 通用目录** | 发现层 | 新站冷启动触发初始抓取、建立基础品牌曝光 | 免费 | **不花钱买付费目录 dofollow 位**；挑高流量垂直目录过一遍即可，止步于发现层 |
| **GSA SER / RankerX / 社交书签** | 灰帽自动化 Tier-3 | 纯粹用于给 Tier-2 缓冲页催爬、推收录 | 工具订阅 | 常规白帽品牌站直接跳过；若用，必须严格隔在 Tier-2 之后，**严禁直指主站或 Tier-1 优质媒体页** |

---

## 三、所有外链 & GEO 靶站的通用「选站 4 条硬门槛」

不管从哪个付费平台（INSERT.LINK / Collaborator / Adsy / WhitePress / 老域市场）挑站，付款前先过这 4 关：

1. **AI 可读性闸门（Walker Sands AI Domain Impact Index）**：检查目标站 `robots.txt` 是否放行 `GPTBot / PerplexityBot / ClaudeBot / Google-Extended`，正文是否服务端渲染无付费墙——宁要 82 分向 AI 敞开的垂直技术站，不要封杀爬虫的高 DR 大门户。
2. **单页相关性 + 自身有流量（大罗页面级法则）**：不只看整站 DR，要看外链所在的**具体那一页**主题是否与你的目标页完全同频、有没有真实 Google 自然流量与排词。
3. **顶部位置法则（防截断）**：在榜单文/对比页/Awesome 列表插名时，尽量进入**顶部汇总表或前 3 槽位**（前 3 位品牌点名率 ~48%，沉在长文底部可能跌至 ~5%）。
4. **语义一致性（Entity Consistency）**：全网所有 Tier-0 ~ Tier-3 节点对你的核心定义必须落在同一个品类语义簇内，并统一带消歧写法（例如 `Brand Name (domain.com)` + 稳定核心统计数字 + DOI）。

---

## 四、配套监测与情报雷达（验证每个梯队是否真有效）

| 维度 | 免费 / 低成本标配 | 进阶商业 API / 专业工具 |
| :--- | :--- | :--- |
| **传统 SEO & 收录** | Google Search Console、Bing Webmaster Tools（含免费 Backlinks + AI Performance）、Ahrefs 免费 Backlink Checker | **DataForSEO**（SERP / Backlinks / AIO API）、**Ahrefs**、**Semrush** |
| **GEO / AI 引用监控** | Microsoft Clarity AI Visibility、Bing AI Performance、GA4 自定义 AI 渠道分组、自建多引擎 5-Run 脚本（如 `geo_engine.py` + Aisa.one） | **DataForSEO LLM Mentions API**、**Otterly.AI**（`\$29`/月起）、**Rankscale**（`\$17`/月起）、**Peec AI**、**Ahrefs Brand Radar**、**Profound**（企业级） |

---

## 五、按预算阶段的标准配比建议（可直接套用到任何新旧站）

- **阶段 1：零预算 / 冷启动验证（`\$0/月`）**
  - **70% 精力放 Tier-0 + Tier-2 免费公共源**：发 Zenodo DOI + HF/Kaggle 数据集 + GitHub/npm/Awesome PR + Dev.to/Medium/Reddit/YouTube + G2/AlternativeTo/PH。
  - **30% 精力放免费 Tier-1 PR**：Featured / Qwoted 免费额度 + 拿一手数据直联行业头部 SaaS 博客互引。
- **阶段 2：独立开发者增长期（`\$100–\$500/月`）**
  - 保留全部阶段 1 动作 + 开 **Featured/Qwoted 付费版**（拿高 DR 媒体）+ 拿小预算在 **INSERT.LINK / Collaborator.pro** 按「AI 已引用榜单缺口（Greedy Set Cover）」精准买 3–8 个高相关单页插名 + 用 **SpamZilla** 蹲 1–2 个干净同赛道过期域做页面级 301。
  - Tier-3（如 GIGALinks 免费额度）只作实验性语料垫底，不占主预算。
- **阶段 3：商业化成熟站冲头部大词（`\$1,500+/月`）**
  - **70% 预算砸 Tier-1**：BlueTree / Editorial.Link / 垂直媒体深度 PR + Odys/竞拍精选同赛道老域 301 并购。
  - **20% 预算放 Tier-2 放大器**：INSERT.LINK / Rhino Rank / Serpzilla 给已上线的 Tier-1 媒体文做二级加权与稳收。
  - **10% 预算放 GEO 雷达监测**：按月跑 5-Run 多引擎面板 + 双重差分（DiD）验收 ROI。
