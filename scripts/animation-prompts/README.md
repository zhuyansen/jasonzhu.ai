# Claude 动画提示词库 · 数据来源

站内页面 `/[lang]/prompts/claude-animation`，2026-11-21 建。收创作者用 Claude 5.5（Opus、Sonnet、Haiku、Fable）做出来的**动画**：动效与宣传片、科普讲解动画、卡通和角色故事、3D 动画、网页与界面动效、Manim / p5.js 这类数学与代码动画。

为什么建：2026-11-21 的需求调研（agent-skills-hub 仓库 `ops/research/animation-demand`）发现「claude animation」搜索量涨得快（美国上月约 1,600，印尼、印度、孟加拉最强），社区最常见的抱怨是「我做的动画比别人差、做出来都长一个样」，大家要的是参考：真实作品 + 它们的提示词。这些作品 Claude 库里已经有了，v1 先把它们挑出来单独成库。

## 数据从哪来：只有种子（v1）

`assemble.mjs` 是唯一写 `src/content/animation-prompts/animation.json` 的地方，每次都从 Claude 5.5 库（`src/content/opus-prompts/cases.json`）重新挑：

- 播放量跟着 Claude 库的每周核验更新；Claude 库下架的作品这里也跟着消失；Claude 库每天新收的作品，下次组装时按同一条规则自动进来。
- 提示词、标题、摘要、出处都原样沿用 Claude 库（已经过 Jev 审核和 Opus 终审），这里不改。
- `updatedAt` / `statsCheckedAt` 也沿用 Claude 库的，所以重复组装、Claude 库没变时输出不变。

### 选取规则（写在 `assemble.mjs` 的 `selectReason()`，有注释）

Claude 库里每个作品都是视频，所以「是不是动画」要看作品本身。只看作品自己的标题、摘要（中英）、作者公开的提示词和工具名。

| Claude 库的分类 | 怎么收 |
| --- | --- |
| motion 动效设计 | 默认收；剔掉视频生成模型出的写实片、静态图、没有动效的 App / 工具网站 |
| education 科普 · stories 故事 · product 产品广告 | 明说是动画的，或产出是视频且不是视频生成模型直出的 |
| art3d 3D 场景 · comparison 模型对比 | 标题 / 摘要 / 工具里明说是动画（animation、motion graphics、Remotion、Manim、动画…）；只能拖动旋转的互动场景不收 |
| production 制作流程 | 只认标题 / 摘要里的字，不认工具名（After Effects、HyperFrames 也常用来剪实拍素材） |
| game 游戏 | 不收，个别其实是动效的走 `curation.include` |

所有类别：标题说产出是工具、App、网站、可玩的东西，标题里又没说是动画 / 宣传片的，不收；以「Interactive」开头、摘要里没说有动画的，不收。

2026-11-21 第一次组装：Claude 库 2,924 个作品，规则选中 1,116 个，人工剔掉 14 个、补进 2 个，**共 1,104 个，带提示词 316 个**。比调研时粗估的约 714 个多，主要是 Claude 库「故事」「科普」「产品广告」三类里大多数作品就是 Claude 写代码渲染的片子，标题里不一定写 animation。抽查两轮各 20 个：第一轮 18 / 20 对（错的是可拖动的卡通 3D 场景、一个着色器工具，已加规则 / 剔除），第二轮 19 / 20（存疑的一个是 Seedance 参与的角色 MV，留着）。

### 分类：按动画本身是什么分（`categorize()`）

| key | 中文 | English | 认法 |
| --- | --- | --- | --- |
| motion | 动效与宣传片 | Motion graphics & promos | 兜底；产品广告类全部在这 |
| explainer | 科普讲解 | Explainers & education | 科普类；其他类里说 explain / documentary / history 的 |
| story | 故事与卡通 | Stories & cartoons | 故事类；其他类里说 character / cartoon / anime / music video 的 |
| anim3d | 3D 动画 | 3D animation | Blender、Three.js、Unreal、3D；故事类里 3D 渲染的 |
| webui | 网页与界面动效 | Web & UI motion | 标题写明是网页 / 界面 / 组件 / SVG、又不是「宣传片」的，或用了 GSAP、Lottie |
| codeart | 数学与代码艺术 | Math & code art | Manim、p5.js、3Blue1Brown 风格、数学、生成艺术、demoscene |

只用英文标题、英文摘要和工具名来分（中文标题是翻译，词更散，日文的「公式」会被当成数学）。2026-11-21：动效与宣传片 450、科普讲解 168、故事与卡通 243、3D 动画 193、网页与界面动效 32、数学与代码艺术 18。分类名在三处，改的时候一起改：`assemble.mjs` 的 `CATEGORIES`、`../generate-animation-prompts.mjs` 的 `CATS`、`src/lib/animation-prompts-shared.ts`。

```bash
node scripts/animation-prompts/assemble.mjs --report   # 不写文件，按分类列出选中作品的标题，抽查用
node scripts/animation-prompts/assemble.mjs --write && node scripts/generate-animation-prompts.mjs
```

## 页面规则（同 Gemini 4 库）

- 没有提示词的作品不建详情页，卡片直链 X 原帖；robots.txt 不用逐条列。sitemap 只收列表页和带提示词的详情页（zh / en）。
- 组件复用 Gemini 4 / 图片库 / Claude 库的：`CaseVideo`、`CaseMedia`、`CopyPrompt`、`PromptsSubscribe`。卡片上多了作者点名的工具标签（最多 3 个）。
- 详情页和 Claude 库的同一个作品内容一样（同一个 id），页面链回 Claude 库那一条。
- 英文页的订阅框用 `PromptsSubscribe library="claude"`（来源 `prompts-en`，奖励是 Claude 库 Top 50，作品同源）；中文页 `SubscribeForm source="claude-animation"`。
- `/prompts/*` 的 `Referrer-Policy: no-referrer`（next.config + 页面 metadata）已经覆盖这组页面。

## 下架与更正

`data/curation.json`：

- `drop`：规则选中但不是动画的（id → 原因）；
- `include`：规则漏掉的动画作品（id → 原因）；
- `category`：改分类（id → 分类 key）。

Claude 库下架的作品不用在这里处理，下次组装自动消失。改完重跑 `assemble.mjs --write` 和 `generate-animation-prompts.mjs`。

## 还没做

- **每日收录**：v1 没有自己的采集，也没进 `opus-prompts-daily.yml`。Claude 库每天收的新作品要等有人重跑 `assemble.mjs --write` 才进来（prebuild 只跑 `generate-animation-prompts.mjs`，不重新挑）。以后要自己收，流程照 `../gemini-prompts/daily.mjs`，X 搜索词先用这些：
  - `claude animation`、`claude motion graphics`、`claude remotion`、`claude manim`、`claude cinematic`、`opus animation`、`fable animation`
  - 印尼语：`claude animasi`、`animasi claude`、`bikin animasi pakai claude`、`video animasi AI claude`（调研里印尼搜索最强）
- **印尼语页面 / 关键词**：现在只有中英两版，印尼、印度、孟加拉的流量只能吃英文页。
- **YouTube / TikTok 作品**：现在只收 X。很多「用 Claude 做动画」的教程和成片在 YouTube、TikTok 上，需要单独的采集和归属核实。
- **GitHub 合集仓库**：Claude、图片、Gemini 三个库都有 `awesome-*` 公开合集和每日同步，这个库还没有（参照 `../gemini-prompts/build-repo.mjs`）。
- 英文订阅还没有自己的来源前缀（现在混在 `prompts-en` 里）。
