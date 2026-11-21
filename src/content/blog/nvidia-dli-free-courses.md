---
title: "NVIDIA DLI 免费课 2026 实测：现在还有哪些免费、有没有证书、认证多少钱"
date: "2026-05-18"
updated: "2026-10-04"
category: "教程"
tags: ["NVIDIA", "Deep Learning", "CUDA", "RAG", "免费课程", "学习路径"]
coverImage: "/blog/nvidia-dli-free-courses/cover.png"
excerpt: "NVIDIA Deep Learning Institute 还免费吗？只有一部分。2026 年 10 月我把 DLI 课程目录重新核对了一遍：现在真正免费的 10 门课、哪些有证书、$30/$90 课程和 $125 认证考试怎么选，以及大多数攻略都漏掉的免费开源深度学习课。"
---

> **2026 年 10 月 4 日更新。** 我在 NVIDIA 官方页面上逐门重新核对了一遍，和 5 月首发时比变化很大：*Getting Started with Deep Learning*、*Generative AI Explained* 和 RAPIDS 数据科学课已经下线；*Building RAG Agents with LLMs* 和 *Fundamentals of Accelerated Computing with CUDA Python* 现在是 **$90 付费课**。本文用新清单替换了旧内容。

**一句话回答：NVIDIA Deep Learning Institute（DLI）只有一部分是免费的。** 现在一共有 **10 门免费自学课**，主要是智能体、Omniverse、OpenUSD 和机器人方向；深度学习、RAG、CUDA 这些核心课要 **$30–$90**；NVIDIA 认证考试 **$125 起**。现在想免费跟 NVIDIA 学深度学习，最好的选择是 GitHub 上的开源课 **Fundamentals of Deep Learning**，但它没有证书。

---

## NVIDIA DLI 有哪些形式、各要多少钱

| 形式 | 价格 | 证书 | 入口 |
|---|---|---|---|
| 免费自学课 | 免费 | 免费课页面都没写有证书 | [免费课清单](https://www.nvidia.com/en-us/training/self-paced-courses/#free-courses) |
| 付费自学课 | $30（2–4 小时）或 $90（8 小时） | 有考核的课程有 | [自学课目录](https://www.nvidia.com/en-us/training/self-paced-courses/) |
| 开源课程 | 免费，不用注册 | 没有 | [开源课程](https://www.nvidia.com/en-us/training/open-source/) |
| 讲师带领的工作坊 | 每人 $500 起 | 有 | [查找培训](https://www.nvidia.com/en-us/training/find-training/) |
| 认证考试 | 初级 $125，专业级 $200–$500 | 数字徽章，有效期 2 年 | [认证](https://www.nvidia.com/en-us/learn/certification/) |

自学课在浏览器里跑，配的是**云端 GPU 工作站**，本地不需要 NVIDIA 显卡。课程和考试券买了不能退，付钱前先看清课程大纲。

---

## 现在免费的 10 门 DLI 课

2026 年 10 月 4 日在 NVIDIA 自学课页面上核对：

| 课程 | 方向 | 时长 |
|---|---|---|
| [Agentic AI Explained](https://learn.nvidia.com/courses/course-detail?course_id=course-v1:DLI+S-FX-39+V1) | 什么是 AI 智能体，不用写代码 | 1 小时 |
| [Securing Agents with NemoClaw and OpenShell](https://learn.nvidia.com/courses/course-detail?course_id=course-v1:DLI+S-FX-43+V1) | 智能体安全，动手实操 | 4 小时 |
| [A Beginner's Guide to Autonomous Robots](https://learn.nvidia.com/courses/course-detail?course_id=course-v1:DLI+S-OV-35+V1) | 机器人入门 | 1 小时 |
| [Generating High-Quality Motion Data for Robotics With MobilityGen](https://learn.nvidia.com/courses/course-detail?course_id=course-v1:DLI+S-OV-37+V1) | 机器人训练数据 | 1.5 小时 |
| [Software-in-the-Loop Testing for Robots With OpenUSD, Isaac Sim, and ROS](https://learn.nvidia.com/courses/course-detail?course_id=course-v1:DLI+S-OV-39+V1) | 机器人仿真测试 | 2 小时 |
| [An Introduction to Developing With NVIDIA Omniverse](https://learn.nvidia.com/courses/course-detail?course_id=course-v1:DLI+S-OV-11+V1) | Omniverse 入门 | 2 小时 |
| [Fundamentals of Working With OpenUSD](https://learn.nvidia.com/courses/course-detail?course_id=course-v1:DLI+S-OV-15+V1) | 3D 场景格式 | 2 小时 |
| [Creating an Omniverse Extension With Python](https://learn.nvidia.com/courses/course-detail?course_id=course-v1:DLI+S-OV-16+V1) | Omniverse + Python | 2 小时 |
| [Extend Omniverse Kit Applications for Building Digital Twins](https://learn.nvidia.com/courses/course-detail?course_id=course-v1:DLI+S-OV-13+V1) | 数字孪生 | 2 小时 |
| [Building AI-Powered Material Generation for Omniverse With DGX Cloud](https://learn.nvidia.com/courses/course-detail?course_id=course-v1:DLI+S-OV-53+V1) | 生成式材质 | 2 小时 |

**我的推荐：** 先上 **Agentic AI Explained**，一小时讲清楚智能体，非技术同事也能听，拿来给团队做分享也合适；做智能体开发的再上 **Securing Agents with NemoClaw and OpenShell**。机器人和 Omniverse 方向的课只在你做这个领域时才值得花时间，但免费课大部分都在这两个方向。

> 💡 免费清单变化很快。页面上写着「This course will soon be retired」的课，到期就停止报名。先报名占位，学可以晚点学。

---

## 大多数攻略漏掉的免费深度学习课

搜「NVIDIA 深度学习课程」，大家通常会找到 *Getting Started with Deep Learning*，但这门课现在是 $90，而且即将下线。免费的替代品是 **Fundamentals of Deep Learning**，现在作为 [NVIDIA 开源课程](https://www.nvidia.com/en-us/training/open-source/)发布：

- 代码、notebook 和实验指南都在 [GitHub（NVDLI/fundamentals-of-deep-learning）](https://github.com/NVDLI/fundamentals-of-deep-learning)，Apache 2.0 / CC BY 4.0 协议
- **不用注册**。NVIDIA 官方说开源课和付费课是同等质量
- 要自己准备环境：用自己的 NVIDIA 显卡，或者自费租云 GPU
- **没有证书**：NVIDIA 明确说开源课程不发证书

想打好深度学习基础、不在乎证书的话，这是 NVIDIA 现在最好的免费选择。

---

## NVIDIA 免费课有证书吗？

**大多数没有。** NVIDIA 的证书只在「部分课程」里发，也就是带考核的课程。我查过的免费课页面都没提证书，开源课程也不发。

如果目标就是证书，现实的选择是：

1. **$90 的带考核课程。** [Building RAG Agents with LLMs](https://learn.nvidia.com/courses/course-detail?course_id=course-v1:DLI+S-FX-15+V1) 和 [Fundamentals of Accelerated Computing with CUDA Python](https://learn.nvidia.com/courses/course-detail?course_id=course-v1:DLI+S-AC-10+V1) 都是 8 小时，配云端 GPU，考核通过发证书。
2. **认证考试**（见下一节）。它是监考的正式认证，和课程结业证书不是一回事。

---

## NVIDIA 认证免费吗？

不免费。所有考试都要付费，通过 Certiverse 线上远程监考，**有效期两年**：

| 级别 | 例子 | 价格 | 时长 |
|---|---|---|---|
| 初级（Associate） | Generative AI LLMs（NCA-GENL）、Generative AI Multimodal（NCA-GENM）、AI Infrastructure and Operations（NCA-AIIO） | $125 | 1 小时，50–60 题 |
| 专业级（Professional） | Generative AI LLMs（NCP-GENL）等 | $200–$500 | 2 小时 |

第一张 NVIDIA 认证，最常见的是 **NCA-GENL**（$125）。买考试券之前，先把免费的开源深度学习课和智能体课学完。

---

## 付费课有没有免费拿的办法

- **高校老师**：加入 [DLI Teaching Kit Program](https://developer.nvidia.com/teaching-kits)，审核通过后可以给自己和学生领免费的自学课兑换码，官方说法是「每人每门课价值最高 $90」。
- **学生**：问问你的老师或院系有没有加入 Teaching Kit 或 [University Ambassador](https://www.nvidia.com/en-us/training/educator-programs/) 计划，这是官方渠道。

> 更正：旧版说用学校邮箱注册能解锁付费实验。我在 NVIDIA 官方页面上没有找到这个机制，已删除。

---

## 免费的官方 CUDA 学习资源

DLI 的 CUDA Python 课现在要 $90，已经不算免费入口了。下面这些官方资源是免费的：

- [An Even Easier Introduction to CUDA](https://developer.nvidia.com/blog/even-easier-introduction-cuda/)：NVIDIA 的经典入门教程（2025 年更新过）
- [CUDA C++ Programming Guide](https://docs.nvidia.com/cuda/cuda-c-programming-guide/)：官方参考手册
- [CUDA Python 文档](https://nvidia.github.io/cuda-python/)：习惯用 Python 的看这个

只有当你想要带指导的实验、云端 GPU 和证书时，才值得花 $90 上 DLI 的那门课。

---

## 零成本入门路线

1. **Agentic AI Explained**：1 小时，建立全局认识
2. **Fundamentals of Deep Learning**（开源课）：神经网络基础，动手练
3. **An Even Easier Introduction to CUDA**：弄懂 GPU 加速到底怎么回事
4. **Securing Agents with NemoClaw and OpenShell**：搭一个智能体，并做好安全

学完这些再决定花不花钱、花在哪：要证书就上 $90 的课，要认证就考 $125 的 NCA-GENL。

---

## 常见问题

### NVIDIA Deep Learning Institute 是免费的吗？

只有一部分。截至 2026 年 10 月，DLI 有 10 门免费自学课，主要是智能体、Omniverse、OpenUSD 和机器人方向。大部分深度学习、RAG、CUDA 课程是 $30 或 $90，讲师工作坊 $500 起，认证考试 $125 起。

### NVIDIA 免费课有证书吗？

通常没有。NVIDIA 只在带考核的部分课程里发证书，这些大多是 $90 的付费课。Fundamentals of Deep Learning 这类开源课程不发证书。

### 有免费的 NVIDIA 深度学习课吗？

有。Fundamentals of Deep Learning 作为 NVIDIA 开源课程在 GitHub 上免费提供（NVDLI/fundamentals-of-deep-learning），不用注册，但要自己准备 GPU，也没有证书。原来的 Getting Started with Deep Learning 现在是 $90，而且即将下线。

### NVIDIA DLI 课程多少钱？

付费自学课 $30（2–4 小时）或 $90（8 小时），公开的讲师工作坊每人 $500 起。购买后不能退款。

### NVIDIA 认证免费吗？

不免费。初级考试 $125，专业级 $200 到 $500，都通过 Certiverse 线上监考，有效期两年。

### 想免费学 CUDA 去哪里？

看 NVIDIA 官方的免费教程《An Even Easier Introduction to CUDA》、CUDA C++ Programming Guide 和 CUDA Python 文档。DLI 的 Fundamentals of Accelerated Computing with CUDA Python 现在要 $90。

### 本地没有 GPU 能学吗？

DLI 自学课可以：它们跑在浏览器里的云端 GPU 工作站上。开源课程不一样，要用自己的 NVIDIA 显卡或者自费租云 GPU。

---

## 一句话总结

> **NVIDIA DLI 已经不是当年那个免费学深度学习的地方了：免费课现在主要是智能体、Omniverse 和机器人方向，经典的深度学习、RAG、CUDA 课都要 $90。NVIDIA 最好的免费深度学习内容，现在在 GitHub 上的开源课程里。**

→ [Google Skills 游戏化学习路径](/zh/blog/google-skills-ai-learning-paths)
→ [Claude Certified Architect 完整路线图](/zh/blog/anthropic-claude-certified-architect-roadmap)
→ [OpenAI Academy vs Anthropic 完整对比](/zh/blog/openai-academy-vs-anthropic-learning-paths)

---

📚 **[10 大平台 AI 免费学习全景图 →](/zh/blog/ai-free-learning-hub)** 一张表 + 按身份选路径，完整系列总目录。
