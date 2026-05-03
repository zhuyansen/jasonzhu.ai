---
title: "吴恩达 2026 提示词课 Day 1-5 笔记：12 个可直接套的 Prompt 模板"
date: "2026-04-30"
category: "教程"
tags: ["吴恩达", "AI Prompting", "DeepLearning.AI", "Prompt 模板", "Module 1"]
excerpt: "吴恩达在 DeepLearning.AI 上线了新课《AI Prompting for Everyone》。第一个 Module「Finding Information」5 节课讲透了新手与高手的核心差距、AI 知识的 3 层来源、Web Search 双 AI 架构、源可靠度问题与 Deep Research 的真正用法。这篇笔记把每节课压成一段+1 张图+2 个可直接套的 Prompt 模板，共 12 个。"
---

吴恩达在 DeepLearning.AI 上线了一门新课《AI Prompting for Everyone》，3 个 Module 共 21 节课。这是 Module 1「Finding Information」5 节课的完整笔记，每天一节，每节配一张图加 2 个可直接抄走的 Prompt 模板。读完整篇可以直接拿去用，不需要再翻视频。

![吴恩达 2026 提示词课 Day 1-5 笔记封面](/blog/andrew-ng-prompting-day-1-5/hero.png)

## Day 1：新手 vs 高手的 4 大分水岭

吴恩达开篇就把整门课的总框架立了起来。同一个 ChatGPT，AI 新手和高手用出来的产出能差 5 到 10 倍，差别全在 4 个维度。

![新手 vs 高手 4 大维度对比](/blog/andrew-ng-prompting-day-1-5/day1.png)

第一是问题难度。新手当 Google 用，问「Taco Bell 还有 Double Decker Taco 吗」。高手扔进去整套买车文档（车型规格、报价、保险方案），让 AI 通读全部、慢慢思考、对比利弊。模型现在能想几十秒甚至几分钟才回答。

第二是上下文。新手发短 prompt 期待 AI 自己补全空白。高手把 AI 当一个智商很高、刚毕业、对你一无所知的实习生，给足背景。让 AI 写自我评价，新手只发一句「写一份给老板的自我评价」。高手把项目跟踪截图、最近文档、语音备忘的摘录全传上去。

第三是是否引导。新手会问「我有个绝妙的生意点子，移动扎染服务，请评价」。AI 听到「绝妙」会顺着夸下去，这就是 Sycophancy。高手要么用中性提问，要么直接给评分卡。

第四是写作流程。新手让 AI 直接写文章，得到的是 AI Slop。高手不让模型一上来就写正文，先让它出大纲，反复迭代大纲，再展开成 bullet points，再迭代 bullet points，最后才扩成正文。

**【上下文模板】**

```
我现在的情况：[1-3 句背景]
我已经做了：[过去尝试过什么]
我想要：[具体目标 + 输出格式]
请基于这些回答：[问题]
```

**【反引导模板】**

```
请客观分析以下方案
列 5 个支持 + 5 个反对的理由
最后按 0-10 打分给结论
```

## Day 2：AI 的知识从哪来

要会用 AI，先要懂它的知识来源。吴恩达把这块叫 Pretrained Knowledge。

![Pretrained Knowledge 频率金字塔与知识截止日期](/blog/andrew-ng-prompting-day-1-5/day2.png)

模型从互联网海量文本学的，频率决定可靠度。烹饪、明星、电影这种高频内容，AI 答得超准；类星体、粤语这种小众话题，答案就差。粤语虽然有 8000 万人讲，但只占互联网内容不到 0.1%，所以英文以外的语料覆盖普遍较差。

每个模型有一个 knowledge cutoff date 知识截止日期。比如 GPT-5.4 截至 2025 年 8 月，截止日之后的事它不知道。问 2025 年才火的「6 7 meme」它就傻眼，必须主动让它做 web search。

实操：问任何最近 3 个月的事都要先让它搜，问任何冷门专业话题（医学、法律、金融监管）也要先让它搜，不然它会用过期或低密度的语料编出听起来对但事实错的答案。

**【强制搜索模板】**

```
这个话题可能在你的知识截止日期之后
请先 web search 最新信息（重点 2025 Q3 之后）
然后再综合回答：[问题]
```

**【可靠源指定模板】**

```
回答时请优先引用以下来源类型：
- 官方机构（WHO / FDA / 央行 / 政府白皮书）
- 顶级期刊（Nature / Science / NEJM）
- 行业头部机构（Gartner / McKinsey 报告）
避免引用社交媒体和个人博客
```

## Day 3：Web Search 不是搜索引擎，是双 AI

吴恩达讲了一段大多数人不知道的内幕。AI 的 web search 背后其实是双 AI 架构。

![AI Web Search 双 AI 架构图](/blog/andrew-ng-prompting-day-1-5/day3.png)

第一个是你聊天的 user-facing AI。第二个是它内部调用的 assistant AI，专门负责执行 web search、过滤结果、下载相关页面、总结摘要返回。

关键 quirk：user-facing AI 看到的只是 assistant AI 给的摘要，没有读完整页面。所以你经常会看到「AI 引用了某个 URL，但实际页面并没有说那句话」的怪现象。模型在用别人转述的内容回答你，转述本身就可能失真。

破解办法是反过来要求它先列出来源。把验证的环节交给你自己。

**【验证来源模板】**

```
回答前请先列出你打算用的 3 个来源 URL
和每个来源的核心论点（1 句概括）
确认后我让你继续生成完整答案
```

**【时间锁定模板】**

```
只用 2025 年 10 月之后发布的内容
对每条信息标注发布日期
不接受超过 6 个月的旧资料
```

## Day 4：AI 默认拉的源跟你想的不一样

这一节是 Module 1 最颠覆认知的部分。AI 的引用频率 Top 5 来源是：

1. Reddit
2. Wikipedia
3. YouTube
4. Google 自己
5. Yelp

![AI 引用 Top 5 来源排行 + 危险提示](/blog/andrew-ng-prompting-day-1-5/day4.png)

问健康类问题（peptides、补剂、减肥药），默认 AI 拉的是论坛和卖货网站，不是 WHO 和 FDA。问理财类问题，默认拉的是 Reddit 个人经验贴，不是央行和持牌机构。不主动指定权威源，得到的就是社交媒体的平均水平。

吴恩达举了一个真实翻车案例：朋友问 AI「Henderson, Nevada 跑步好去处」，AI 拉了 20 年前的旧网页，推荐了一所早就关闭、不再对公众开放的学校。

更狠的实操：让 AI 把找到的来源都列出来，并标注每个来源的最后更新时间。超过 18 个月的全部不用。

**【源类型限制模板】**

```
回答此问题只用以下来源类型：
1. 政府或国际组织官方网站
2. 同行评议期刊（PubMed / arXiv 等）
3. 行业头部机构白皮书
明确禁用：Reddit / Quora / 个人博客 / 卖货网站
```

**【时效双重验证】**

```
列出你找到的所有来源
检查每个来源的最后更新时间
超过 18 个月的标黄
最终结论只引用近期来源
```

## Day 5：Deep Research = 几十个源平行查

吴恩达说被严重低估的能力。普通 web search 是 3 到 5 个来源、几秒回答。Deep Research 是几十个源、平行查询、几分钟到十几分钟出报告。

![Deep Research 流程 · 研究计划 → 平行抛出 N 个搜索 → 综合报告](/blog/andrew-ng-prompting-day-1-5/day5.png)

适合的任务：综合多角度对比（买车、选房、选学校）；复杂规划（万圣节布置鬼屋、罗马 5 地标路线）；投资决策、创业 PRD、医疗第二意见。

不适合的任务：要快速答案、单点事实查询、简单计算。

吴恩达自己用 Deep Research 规划万圣节鬼屋的演示是这门课最实用的桥段之一。他给的 prompt 包含场地尺寸、想要的体验类型、安全顾虑、预算范围，AI 自己列研究计划、查当地法规、查装饰创意、查安全标准，10 分钟出一份带引用的完整方案。

要想用好 Deep Research，关键是给足维度和锁定输出格式。维度让它知道往哪几个方向研究，输出格式让它不会给你一份冗长无重点的散文。

**【Deep Research 启动模板】**

```
请用 Deep Research 模式
从以下 4 个维度综合调研「[话题]」
1. [维度 A]
2. [维度 B]
3. [维度 C]
4. [维度 D]
预算时间：10 分钟以内
```

**【输出格式锁定】**

```
报告必须包含：
- 一页执行摘要（5 个关键结论）
- 数据表（横向对比 5+ 选项）
- 风险与反对意见专门一节
- 完整引用来源列表（标注权威度）
```

## Day 1-5 抓重点

Module 1「Finding Information」的核心论点是：现在的 AI 比 2022 年那个聊天机器人强太多，能 reasoning 几十秒、能并行查几十个网页、能区分权威源和社媒。但大多数人还在用 2022 年的方式（短 prompt + Google 搜索式问法）问它问题。

3 个 Module 共 21 节课，这是前 5 节。

剩下的 Module 2「AI as a Thought Partner」（8 节）讲 brainstorm 迭代心法、75 万字 Context 怎么用、Desktop App 工作流、ultrathink 关键词、反 Sycophancy 4 招、渐进式大纲 + 评分卡。

Module 3「Working with Multimedia & Code」（6 节）讲多模态成本梯度、图片识别能力边界、Diffusion Model 的怪手乱字问题、Vibe Coding 5 个一句 prompt 应用、AI 调用 run-code 工具做数据分析。

Day 6-10 笔记会更新到 [jasonzhu.ai/blog/andrew-ng-prompting-day-6-10](https://jasonzhu.ai/blog/andrew-ng-prompting-day-6-10)（周末上线）。完整课程在 [DeepLearning.AI](https://learn.deeplearning.ai/courses/ai-prompting-for-everyone/)，免费，3 个 Module 共约 2 小时刷完。
