# GEO 引用面板

每周把固定的题库问一遍几家 AI，记下它们有没有引用、点名 jasonzhu.ai，再和上周、和 2026-11-17 的基线比。
任何「这个做法能不能让 AI 更多引用我们」的结论，都以这里的数为准。

## 文件

| 文件 | 是什么 |
|---|---|
| `panel_run.py` | 读题库、调 backlink-guard 的 `asked` 提问、打分、出摘要、发邮件。`--selftest` 不联网 |
| `questions.json` | 冻结组 21 题。**不要改题目**：GIGALinks 的实验要在 12-01、12-15、01-01 用同一套题复测 |
| `questions-real.json` | 真实问法组 30 题，都不带品牌名。25 题是三家 AI 写的「买家会怎么问」，5 题是 Google 上真实出现的查询 |
| `experiments.json` | 改动记录和对照实验的分组 |
| `panel/results-<日期>.json` | 每次的分数，一行一个回答 |
| `panel/summary-<日期>.md` | 每次的摘要 |
| `.github/workflows/geo-panel.yml` | 每周一北京 11:37 自动跑，结果提交到仓库并发邮件 |

## 怎么看结果

四个口径分开记，不要混着看：

- **引用本站**：回答引用了 jasonzhu.ai 的任何页面
- **引用对应页面**：回答引用了这道题对应的那个页面
- **正文点名**：回答正文里写了域名或名字
- **排第一**：被引用的第一个网址是我们的

每格是「命中的回答数/有效回答数」。同一个问题每次问答案都不一样，所以每家每题问 3 次。
安全过滤拒答、空回答不算有效回答，摘要里单独列出。

带品牌名的题（冻结组里 4 题）本来就容易被引用，真正要看的是不带品牌名的题。

## 做对照

想知道一个改动有没有用，改之前在 `experiments.json` 里记一笔：

- `treated`：改了哪些题对应的页面
- `control`：哪些同类页故意不改
- `baseline`：和哪一次结果比（`panel/` 下的文件名）

摘要会把两组分开算，「净变化 = 处理组的变化 − 对照组的变化」。题数少的时候只看方向。
全站一起改、留不出对照组的改动，记在 `events` 里，摘要只标出日期。

一次只改一样。同一周里改了两样，就分不清是谁的效果。

## 花费

每个回答：ChatGPT、Gemini App、Google AI Mode $0.004，Perplexity 约 $0.006，Claude 约 $0.045。
冻结组 21 题、四家各 3 次，一次约 $1.2；每月第一个周一加问 Claude，约 $2.1。两套题一起（51 题）约 $2.8，加 Claude 约 $5.1，一个月约 $13。
工作流里 `max_usd` 封顶，超了的不问。

## 什么不进仓库

回答原文和别的网站的网址来自付费接口，不进公开仓库，也不进 Actions 日志。
完整结果加密后放在草稿 release「geo-panel-state」里，被引用最多的网站和页面只出现在邮件里。
解密方法见工作流文件开头。

## 手动跑

```bash
python3 ops/geo/panel_run.py --selftest
python3 ops/geo/panel_run.py run --sets frozen --limit 3 --dry          # 试跑 3 题，不写文件
python3 ops/geo/panel_run.py summary ops/geo/panel/results-<日期>.json   # 从结果重新出摘要
```

本机要先 `pip install backlink-guard`（要有 `gemini_app` 引擎的版本）并 `aisa login`。
