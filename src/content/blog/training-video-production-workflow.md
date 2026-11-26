---
title: "2026 培训课程制作方法：4 个 AI Skills 跑通从课件 PDF 到教学视频全流程"
date: "2026-03-30"
updated: "2026-11-26"
category: "咨询培训"
tags: ["培训课程制作", "教学视频制作", "Claude Code", "Skills", "PaddleOCR", "Remotion", "Excalidraw"]
excerpt: "2026 年如何高效完成培训课程与教学视频制作？用 Claude Code 串联 4 个开源 Agent Skills（PaddleOCR 解析、Excalidraw 图解、Remotion 编程视频、知识库建站），一套 SOP 跑通从 PDF/PPT 课件到练习题、思维导图、视频与在线课程站的完整流水线。"
---

**先给结论**：2026 年做培训课程和教学视频，不再需要纯手工剪辑和反复排版。在 Claude Code 等编程 Agent 中串联 **4 个开源 Agent Skills**（`paddleocr-doc-parsing`、`excalidraw-diagram-skill`、`remotion-video-skill`、`knowledge-site-creator`），即可把静态 **PDF/PPT 课件**自动化转为**结构化讲义、架构图/思维导图、带字幕的 Remotion 教学视频与可交互在线知识库**。

## 这 4 个核心 Skills 就够了

把教育和企业培训材料做成完整的教学视频与配套课程体系，核心就是串联好下面 4 个开源 Skill，实现 `课件 PDF → 提取内容 → 生成练习题/思维导图/视频 → 在线知识库交付` 的全流程：

1. **paddleocr-doc-parsing**：https://clawhub.ai/bobholamovic/paddleocr-doc-parsing
2. **wshuyi/remotion-video-skill**：https://github.com/wshuyi/remotion-video-skill
3. **joeseesun/knowledge-site-creator**：https://github.com/joeseesun/knowledge-site-creator
4. **coleam00/excalidraw-diagram-skill**：https://github.com/coleam00/excalidraw-diagram-skill

## 培训课程制作 4 阶段自动化流水线（SOP）

传统做一门 10 节的培训课，从整理 PPT、画配图、写逐字稿、录屏剪辑到上线学习网页，往往要耗掉几周时间。用 Agent Skills 改造后，整套流程变成一条**全资产代码化（Markdown / JSON / React）**的四阶段流水线：

| 生产阶段 | 核心目标 | 对应 Skill / 工具 | 输入素材 | 产出交付物 |
|---|---|---|---|---|
| **阶段 1：课件解析** | 高精度还原复杂版式，消除手动抄录 | `paddleocr-doc-parsing` | PDF 讲义、导出的 PPT、扫描版教材/论文 | 结构化 Markdown、JSON、精确表格与 LaTeX 公式 |
| **阶段 2：拆解与可视化** | 提炼课程大纲、出练习题、画清逻辑关系 | `coleam00/excalidraw-diagram-skill` + LLM 提示词 | 阶段 1 输出的结构化 Markdown 文本 | 分章节教学脚本、随堂练习题、`.excalidraw` 架构图/思维导图 |
| **阶段 3：编程化视频生成** | 用代码渲染清晰一致的教学动画与字幕 | `wshuyi/remotion-video-skill` | 教学脚本、配音/TTS 音频、关键图解素材 | 可随时微调重渲的 Remotion 视频工程与 MP4 教学视频 |
| **阶段 4：课程站点交付** | 把静态资料变成可检索、可刷题的学习站 | `joeseesun/knowledge-site-creator` | 全套讲义 Markdown、练习题、图表与视频链接 | 响应式在线课程/知识库网站（含章节导航、闪卡测验与进度追踪） |

## 四个核心 Skills 实操拆解

### 1. `paddleocr-doc-parsing`：攻克复杂 PDF/PPT 的脏数据

培训课件里最难搞的不是纯文字，而是**多栏排版、合并单元格表格、数学公式和扫描图片**。直接把 PDF 扔给普通大模型，经常出现段落错乱或表格串行。

- **核心能力**：底层依托 PaddleOCR 的版面分析与视觉语言解析能力，能精准还原阅读顺序、表格结构和 LaTeX 公式，直接吐出干净的 Markdown 与 JSON。
- **实操要点**：把原始 PPT 先统一导出为高清 PDF，再批量交给该 Skill 解析。运行前需准备好 Python 环境、联网 API 配置与对应环境变量（以仓库文档为准）。

### 2. `coleam00/excalidraw-diagram-skill`：用视觉逻辑替代纯文字堆砌

学员看培训课最怕满屏文字。这个 Skill 不是随便画几个方框连箭头，而是遵循**视觉论证流程**——先判断知识深度、再匹配最合适的图示结构（流程图、因果图、分层架构图），最后输出标准的 `.excalidraw` JSON 文件并渲染校验。

- **核心能力**：把抽象的概念拆成手绘感强、重点突出的信息图与思维导图，风格非常贴合技术培训和商业课程。
- **实操要点**：在这一步同时让 Agent 基于阶段 1 的 Markdown 生成**每章核心知识点总结 + 3–5 道场景选择题/实操练习题**，作为后续视频回顾页和知识库测验的数据源。

### 3. `wshuyi/remotion-video-skill`：像写代码一样批量做教学视频

很多人问“做视频的 Skill 怎么挑”。相比纯 AI 生成视频（画面容易漂移、文字经常乱码），教育培训场景最需要**字迹清晰、节奏可控、改错成本低**，这正是基于 React 的 **Remotion** 框架的强项。

- **核心能力**：支持用 React 组件编排标题卡片、代码高亮演示、数据动画、自动字幕与 AI 配音（TTS），特别适合做概念讲解、软件教程和批量系列微课。
- **实操要点**：先让 Agent 输出**分镜脚本（每页不超过 3 个要点、单句口播控制在 15 秒内）**，人工快速审一遍脚本再渲染视频。后续哪怕发现某页写错了一个数据，改一行文案重新 render 即可，不用重新录屏剪辑。

### 4. `joeseesun/knowledge-site-creator`：一键升级为可交互课程站

光发一个网盘视频包，完课率往往极低。最后一环用 `knowledge-site-creator` 把前面沉淀下来的讲义、图解、练习题和视频统一打包成公开或内网可访问的学习网站。

- **核心能力**：不拘泥于死板模板，能将零散 Markdown 笔记重构为带全文搜索、闪卡复习、随堂测验、学习进度追踪和快捷键交互的现代 Web 知识站点，并重视基础前端安全规范。
- **实操要点**：企业内训场景可直接部署在内网或带访问权限的静态托管平台上，新员工入职随时回看和刷题。

## 质检（QA）与企业级培训部署注意事项

把这套流程真正用到企业内训或付费课程交付时，有 4 个关键把控点不能省：

1. **OCR 解析后必须抽检核心数据与公式**：再强的文档解析工具面对模糊扫描件或复杂嵌套表格都可能有细微误差，讲师必须在进入视频制作前核对关键数字、术语和专有名词。
2. **先审分镜，再做渲染，避免“AI 念 PPT”**：优质培训视频的核心是“场景案例 + 视觉拆解”，在生成 Remotion 代码前，建议人工把抽象概念补充成企业真实业务案例。
3. **企业敏感课件注意脱敏与 Skill 安全审计**：涉及企业内部机密流程、客户数据的培训材料，上传外部 OCR 或模型 API 前必须先脱敏；在生产环境引入第三方开源 Agent Skill 前，务必先审查其脚本权限与外连行为（可参考我写的 [200 个 Agent Skills 安全审计实测](/zh/blog/agent-skill-security-audit-200)）。
4. **把全部产物放进 Git 仓库做版本管理**：这套工作流最大的长期红利在于“课程即代码”——半年后业务流程变了，只需更新对应章节的 Markdown 和 Excalidraw 图，重新渲染单个片段并发布站点即可，维护成本比传统剪辑低一个量级。

## 常见问题（FAQ）

### 1. 不会写前端代码，能用 Remotion Video Skill 做培训视频吗？

可以。通过 Claude Code、Cursor 等编程 Agent 加载 `SKILL.md` 后，你只需要用自然语言描述每节课的脚本、视觉风格和配色要求，Agent 会自动编写 React 组件并调用 Remotion 渲染成 MP4 视频。唯一需要掌握的是基础的本地环境运行和预览操作。

### 2. 这套 AI 工作流和传统剪映、PPT 录屏做课有什么区别？

核心区别在**批量化与后期修改成本**。PPT 录屏一旦讲错或业务更新，往往需要重录重剪；而这套工作流把文字、图表、视频组件全部结构化，一套模板跑通后可以批量生产 10 节甚至 50 节风格高度统一的系列课，改错就像改文档一样快。

### 3. 企业内部保密课件，怎么安全地用 AI 做成培训课程？

遵循两个原则：第一，解析前先剥离客户姓名、合同金额、核心代码等敏感字段，或优先采用本地化部署的 OCR 与私有模型；第二，在把任何开源 Skill 装进团队开发机之前，先检查其源码是否存在未声明的外部请求或敏感目录读取。

### 4. 除了这 4 个，去哪里找更多靠谱的 Agent Skills？

如果你在找更多覆盖文档处理、编程提效、SEO、营销自动化等场景的优质 Skills，可以直接去我维护的 [Agent Skills Hub (agentskillshub.top)](https://agentskillshub.top) 检索，也可以配合阅读 [Claude Code Skills 使用指南](/zh/blog/claude-code-skills-guide) 快速上手安装和编排。

---

如果你的企业正在规划内部的 AI 工具落地与员工技能升级，欢迎参考我的 [五天企业 AI 培训大纲](/zh/blog/five-day-ai-training-outline) 和 [企业 AI 培训方法论复盘](/zh/blog/ai-enterprise-training-insights)；需要针对团队真实业务场景定制工作流或内训，可以直接查看 [企业 AI 培训与咨询服务](/zh/services)。

---

**撰稿人**: [Jason Zhu](https://x.com/GoSailGlobal) | [原文链接](https://x.com/GoSailGlobal/status/2038528339581997500)
