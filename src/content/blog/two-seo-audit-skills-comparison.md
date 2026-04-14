---
title: "同名不同命：两个SEO Audit Skills的定位差异与推荐"
date: "2026-04-14"
category: "AI工具"
tags: ["Claude Code", "Skills", "SEO", "Agent"]
excerpt: "Claude Code Skills生态越来越丰富，连skill都开始重名了。两个都叫seo-audit的skill，定位和实现思路完全不同，这里做个对比推荐。"
slug: "two-seo-audit-skills-comparison"
---

# 同名不同命：两个SEO Audit Skills的定位差异与推荐

> 来源：[@GoSailGlobal](https://x.com/GoSailGlobal/status/2043971983772397720)

Skill多了，还会重名。

SEO审计目前有两个skill，恰巧两名开发者都取名了**seo-audit**。虽然同名，但它们的定位、实现思路和适用场景都很不一样。这里做个对比推荐。

## 两个Skill概览

| 对比维度 | wonfull888 版 | CoderJeffLee 版 |
|----------|--------------|-----------------|
| **仓库** | [wonfull888/seo-audit](https://github.com/wonfull888/seo-audit) | [JeffLi1993/seo-audit-skill](https://github.com/JeffLi1993/seo-audit-skill) |
| **作者X** | [@wonfull888](https://x.com/wonfull888) | [@CoderJeffLee](https://x.com/CoderJeffLee) |
| **检查项数** | 92项（完整模式） | 20+项（基础）+ 高级模式 |
| **报告格式** | Markdown | HTML |
| **架构思路** | 纯LLM驱动 | Python+LLM混合架构 |
| **定位** | 全面诊断型 | 精准工程型 |

## wonfull888 版：全面诊断的「体检报告」

这是我自己在用的版本（本站的SEO审计就是用它做的）。

**核心特点：**
- **92项全面检查**，覆盖技术SEO（29项）、页面元素（27项）、内容质量与E-E-A-T（33项）、本地SEO（3项）
- **四维度加权评分**，给出0-100的综合分数
- **P0/P1/P2优先级分类**，让你知道先修什么
- **智能站点分类**，根据网站类型（电商/SaaS/内容站等）动态选择诊断页面
- **中英双语报告**，自动检测语言
- 可选配置Google PageSpeed API获取Core Web Vitals数据

**适合场景：**
- 网站上线后的全面SEO体检
- 定期SEO健康度监控
- 需要一份完整的SEO诊断报告交付给团队或客户

**使用方式：**
```bash
# 安装
git clone https://github.com/wonfull888/seo-audit.git
cp -r seo-audit ~/.claude/skills/

# 使用
/seo-audit https://example.com
```

## CoderJeffLee 版：精准可靠的「工程检测」

这个版本的设计理念很不一样，更偏工程化思路。

**核心特点：**
- **Python+LLM混合架构**，确定性检查（robots.txt解析、HTTP状态码、XML验证）用Python脚本处理，语义判断（H1意图对齐、内容质量）交给LLM
- **`llm_review_required`标志位**，明确标记哪些结果需要人工复核，防止LLM在事实性检查上产生幻觉
- **HTML独立报告**，输出到`reports/<hostname>-audit.html`，可直接在浏览器打开
- 高级模式支持Google Search Console、CrUX数据和竞品分析

**适合场景：**
- 对SEO检查结果的准确性要求极高
- 需要区分「机器确定的结果」和「AI判断的结果」
- 偏好HTML格式的可视化报告
- 需要与Google Search Console等工具联动

**使用方式：**
```bash
# 安装
git clone https://github.com/JeffLi1993/seo-audit-skill.git
cp -r seo-audit-skill ~/.claude/skills/

# 使用
/seo-audit https://example.com
```

## 如何选择？

简单来说：

- **想要全面体检、快速了解网站整体SEO状况** → 选 wonfull888 版
- **想要精准检测、区分AI判断与确定性结果** → 选 CoderJeffLee 版
- **两个都装？** → 目前会冲突（同名），需要改一个的目录名

## 关于Skill重名问题

这其实反映了Claude Code Skills生态的一个现象：随着越来越多开发者贡献skill，命名冲突开始出现。目前的解决方式是修改本地目录名，但长期来看可能需要：

- **命名空间**：类似npm的`@scope/package`机制
- **Skill Registry**：统一的skill注册和发现平台（如[OpenClaw](https://openclaw.com)正在做的事）
- **版本管理**：支持同一skill的多个版本共存

这也从侧面说明了Claude Code Skills生态正在快速发展，期待官方或社区给出更好的治理方案。

---

📎 **相关链接：**
- [wonfull888/seo-audit](https://github.com/wonfull888/seo-audit) — 92项全面SEO诊断
- [JeffLi1993/seo-audit-skill](https://github.com/JeffLi1993/seo-audit-skill) — Python+LLM混合架构SEO检测
- [OpenClaw](https://openclaw.com) — Claude Code Skills聚合平台

> 更多AI工具和Skills推荐请查看 [AI工具页面](/zh/tools)。
