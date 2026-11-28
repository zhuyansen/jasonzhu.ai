#!/usr/bin/env python3
"""GEO 引用面板：每周把固定的题库问一遍几家 AI，记下它们有没有引用、点名 jasonzhu.ai。

提问只用 backlink-guard 的 asked（走 AIsa，和 2026-11-17 基线是同一批接口），这里只做四件事：
读题库 → 调 asked → 给每个回答打分 → 和上一次、和基线比。

六个口径分开记，不混着看：
  site_cited  回答引用了 jasonzhu.ai 的任何页面
  page_cited  回答引用了这道题对应的那个页面
  named       回答正文里写了域名或名字
  first_pick  被引用的第一个网址是我们的
  fact_used   回答里用了只有我们的研究才有的数字（signature-facts.json）
  absorbed    用了这样的数字，却既没点名也没引用我们：工作被吸收了，没署名

另记一项，不算口径（2026-11-26 起）：wrong_facts 是回答里说错、过时、认错的事（stale-facts.json 的 id），
摘要「AI 说错的事」一段按事列出：哪几家、几个回答、哪些题、这些回答有没有引用本站、引用的是本站哪页。

每次结果都记下运行配置（lineage）：题库、事实清单、说错清单、这个脚本的哈希，backlink-guard 版本，每家的模型和
采样次数。和上次比之前先对配置，题库或事实清单变了就明说，不硬比。

同一个问题每次问答案都不一样，所以每家每题问几次（默认 3 次），按「几个回答里有几个命中」算。
基线每题只问了 1 次，和基线比只能比回答命中率，不能比「至少命中一次的题数」（问得多自然命中多）。
安全过滤拒答、空回答不算有效回答，单独记数。

只改报告和统计，不改怎么问（题目、引擎、每家次数、频率都在工作流里定）：
  - 摘要每格带按题算的 95% 区间。同一题的几个回答几乎一样，有效样本是题数，不是回答数，
    所以按题重抽（自助抽样 2,000 次，随机种子固定，同一份结果重算不变）。
  - 单家的变化要区间不重叠（大约差 10–15 个百分点以上）才算数。
  - 对照实验加置换检验的 p 值（题目层面打乱处理组、对照组标签 5,000 次），和「以现在的题数要差多少才测得出来」（MDE），
    每家一格。MDE 用实测的噪声 v 算，不再假设：不在处理组、两期都问到的题，每题两期命中率之差的平方取平均，
    另给几家合在一起的 v。某一家这样的题不到 8 道（或者一点没变，v = 0），这一家才退回假设（每周 5%–15% 的题翻转），标「假设」。
  - 和上次比加每周翻转率：每家每题取多数票（平票不算），和上次不一样算翻了一次；每家和几家合在一起各带精确的 95% 区间
    （Clopper–Pearson）。
  - 「排第一」只做参考，不进结论。每家标明是抓网页界面、搜索结果页，还是走 API。

公开仓库里只提交分数（panel/results-<日期>.json、panel/summary-<日期>.md）。回答原文和别的网站的网址
来自付费接口，不进仓库：完整结果写到 --full 指定的文件，由工作流加密后存进草稿 release。
这个脚本也不往标准输出打印回答原文和别人的网址（公开仓库的 Actions 日志是公开的）。

用法：
  python3 ops/geo/panel_run.py --selftest
  python3 ops/geo/panel_run.py run --sets frozen --max-usd 3
  python3 ops/geo/panel_run.py run --sets frozen,real --engines chatgpt:3,gemini_app:3,ai_mode:3,perplexity:3,claude:1
  python3 ops/geo/panel_run.py summary ops/geo/panel/results-2026-11-24.json
  python3 ops/geo/panel_run.py mail --summary ops/geo/panel/summary-2026-11-24.md --to you@example.com
"""
from __future__ import annotations

import argparse
import hashlib
import json
import math
import os
import random
import re
import sys
import urllib.parse
import urllib.request
from collections import Counter
from datetime import datetime, timedelta, timezone
from pathlib import Path

GEO = Path(__file__).resolve().parent
PANEL = GEO / "panel"
GRID = GEO / "questions-grid-payments.json"
SETS = {"frozen": GEO / "questions.json", "real": GEO / "questions-real.json", "gsc": GEO / "questions-gsc.json", "grid": GRID}
# 收款格子组的三个维度（题库里每题的 grid 字段），摘要按它排成 9 × 4 的格子表
GRID_AXES = {"scene": ("AI 订阅", "课程和数字产品", "实物"), "who": ("大陆个人", "香港公司", "美国 LLC"),
             "ask": ("能不能开户", "到手多少", "审核多久", "被冻结怎么办")}
EXPERIMENTS = GEO / "experiments.json"
FACTS = GEO / "signature-facts.json"
FACT_WINDOW = 80                # near 里的词要在数字前后这么多个字符内
STALE = GEO / "stale-facts.json"   # AI 说错、过时、认错的事；每条怎么认见文件里的 _about
STALE_WINDOW = 80               # stale-facts.json 的 near、unless 默认看命中处前后这么多个字符
WRONG_ZH = {"wrong": "说错", "stale": "过时", "confusion": "认错"}
LINK = re.compile(r"\]\(\s*<?https?://[^)\s]*>?\s*\)|https?://\S+")   # 回答里的链接网址：Gemini 的链接里带着本站原句
BASELINE = "results-2026-11-17-baseline.json"
BASELINE_ENGINES = {"ChatGPT": "chatgpt", "Gemini": "gemini_app", "Perplexity": "perplexity", "Claude": "claude"}
OWN = "jasonzhu.ai"
OWN_ALIASES = ("jasonzhuai.vercel.app",)   # 本站在 Vercel 的默认域名（next.config 308 到 jasonzhu.ai），基线里出现过
NAMES = ["Jason Zhu", "JasonZhu.AI"]
LABEL = {"chatgpt": "ChatGPT", "gemini_app": "Gemini App", "ai_mode": "Google AI Mode", "perplexity": "Perplexity",
         "claude": "Claude", "gemini": "Gemini（接口）"}
# 每家怎么问的。和 backlink-guard 0.12 的 asked.ENGINES 对应（kind：scraper 抓网页界面，serp 抓搜索结果页，llm 走 API）；
# run 会把这次实际用的 kind 和 model 记进运行配置（lineage 的 engines），摘要优先用记下的，旧结果没有就用这张表
SURFACE = {"chatgpt": "scraper", "gemini_app": "scraper", "ai_mode": "serp", "perplexity": "llm", "claude": "llm", "gemini": "llm"}
MODEL = {"perplexity": "sonar", "claude": "claude-sonnet-5-5", "gemini": "gemini-3.8-flash"}
KIND_ZH = {"scraper": "网页界面", "serp": "搜索结果页", "llm": "API"}
KIND_VERB = {"scraper": "抓网页界面（未登录、美国英文）", "serp": "抓 Google 搜索结果页", "llm": "走 API（开联网搜索）"}
BOOT = 2000                 # 区间：按题有放回地重抽这么多次
PERM = 5000                 # 置换检验：打乱处理组、对照组标签这么多次
SEED = 20261121             # 固定随机种子，同一份结果重算，区间和 p 值不变
FLIP = (0.05, 0.15)         # 只在测不了噪声时用：假设每周有这么多比例的题在引用、不引用之间翻转，摘要里标「假设」
                            # （11-17 到 11-21 实测 ChatGPT 15%、Perplexity 20%，那几天站上改过东西，偏高）
MIN_NOISE_Q = 8             # 一家至少要有这么多道不在处理组、两期都有回答的题，才用实测的噪声 v 算「要差多少才测得出来」
DEFAULT_ENGINES = "chatgpt:3,gemini_app:3,ai_mode:3,perplexity:3"   # 都是每个回答 $0.004–0.006 的；Claude 约 $0.045，按月加跑
CALIBERS = ("site_cited", "page_cited", "named", "first_pick", "fact_used", "absorbed")
CALIBER_ZH = {"site_cited": "引用本站", "page_cited": "引用对应页面", "named": "正文点名", "first_pick": "排第一",
              "fact_used": "用了我们的数据", "absorbed": "用了没署名"}
SET_ZH = {"frozen": "冻结组", "real": "真实问法组", "gsc": "Search Console 真题组", "grid": "收款格子组"}
MIN_CHARS = 200                 # 没有任何引用、正文又短于这个长度的，当作没答出来
REFUSAL = re.compile(r"safety (filters?|checks?)|can(no|['’])t help with that|unable to (help|assist) with", re.I)
RESULT_NAME = re.compile(r"^results-(\d{4}-\d{2}-\d{2})\.json$")
CST = timezone(timedelta(hours=8))
# 和 ops/analytics/digest.py 的 AI_REFERRERS 保持一致
AI_REFERRERS = ("chatgpt.com", "chat.openai.com", "perplexity.ai", "gemini.google.com", "claude.ai", "doubao.com", "kimi.com",
                "kimi.moonshot.cn", "deepseek.com", "chat.deepseek.com", "copilot.microsoft.com", "yuanbao.tencent.com",
                "metaso.cn", "grok.com", "you.com", "phind.com", "poe.com")


# ───────────── 题库 ─────────────

def load_questions(sets: list[str]) -> list[dict]:
    """几套题合在一起。id 和问法都不能重复：asked 按问法去重，重复了就对不回题目。"""
    out, ids, texts = [], set(), set()
    for name in sets:
        path = SETS.get(name)
        if not path or not path.exists():
            raise SystemExit(f"没有这套题：{name}（{path}）")
        for q in json.loads(path.read_text(encoding="utf-8"))["questions"]:
            text = " ".join(q["question"].split())
            if q["id"] in ids or text in texts:
                raise SystemExit(f"题目重复：{q['id']}")
            ids.add(q["id"])
            texts.add(text)
            out.append({"id": q["id"], "set": name, "kind": q.get("kind", ""), "question": text,
                        "target_url": q.get("target_url", "")})
    return out


def parse_engines(spec: str) -> dict[str, int]:
    """"chatgpt:3,claude:1" → {"chatgpt": 3, "claude": 1}；不写次数就是 1 次。"""
    plan = {}
    for part in filter(None, (p.strip() for p in spec.split(","))):
        name, _, n = part.partition(":")
        plan[name] = max(1, int(n or 1))
    return plan


# ───────────── 打分 ─────────────

def norm_url(url: str) -> str:
    """主机名去掉 www、路径去掉末尾斜杠，不要参数：ChatGPT 引用的网址常带 ?utm_source=chatgpt.com。"""
    p = urllib.parse.urlparse((url or "").strip())
    return p.netloc.lower().removeprefix("www.") + (p.path.rstrip("/") or "/")


def any_lang(normed: str) -> str:
    """中英文两个版本算同一页：jasonzhu.ai/en/blog/x 和 jasonzhu.ai/zh/blog/x。"""
    return re.sub(r"^([^/]+)/(zh|en)(?=/|$)", r"\1", normed).rstrip("/")


def status_of(text: str, cited: list) -> str:
    """answered / refused（安全过滤）/ empty（没引用、正文又很短）。"""
    text = text or ""
    if not cited and REFUSAL.search(text[:400]):
        return "refused"
    if not cited and len(text) < MIN_CHARS:
        return "empty"
    return "answered"


def load_facts(path: Path = FACTS) -> list[dict]:
    if not path.exists():
        return []
    return [f | {"re": re.compile(f["pattern"], re.I)} for f in json.loads(path.read_text(encoding="utf-8"))["facts"]]


_FACTS: list[dict] | None = None


def facts_in(text: str, facts: list[dict] | None = None) -> list[str]:
    """回答里出现的标志性事实的 id。给了 near 的，数字前后 FACT_WINDOW 个字符里要有其中一个词。"""
    global _FACTS
    if facts is None:
        _FACTS = load_facts() if _FACTS is None else _FACTS
        facts = _FACTS
    text = text or ""
    found = []
    for f in facts:
        for m in f["re"].finditer(text):
            around = text[max(0, m.start() - FACT_WINDOW): m.end() + FACT_WINDOW].lower()
            if not f["near"] or any(w.lower() in around for w in f["near"]):
                found.append(f["id"])
                break
    return found


def load_stale(path: Path = STALE) -> list[dict]:
    """stale-facts.json：每条带编译好的正则。没有文件是空的。"""
    if not path.exists():
        return []
    return [f | {"re": re.compile(f["pattern"], re.I)} for f in json.loads(path.read_text(encoding="utf-8"))["facts"]]


_STALE: list[dict] | None = None


def plain(text: str | None) -> str:
    """去掉回答里的链接网址，留链接文字：[文字](网址) → [文字]，裸网址 → 空格。
    Gemini 的引用链接里带着本站原句（#:~:text=），那是我们页面上的字，不是 AI 自己说的。"""
    return LINK.sub(lambda m: "]" if m.group(0).startswith("]") else " ", text or "")


def wrong_hits(text: str | None, q: dict | None = None, stale: list[dict] | None = None) -> list[tuple[str, str]]:
    """回答里说错、过时、认错的地方：[(stale-facts.json 的 id, 命中处前后的原文)]，每条事只记第一处。
    near：命中处前后 window 个字符里要有其中一个词；unless：这个范围里有其中一个词就不算（多半是在澄清）；
    unless_answer：整段回答里有其中一个词就不算；target：只看对应页面网址里含这一段的题（q 没给就不看这种）。
    原文片段只给邮件用，不进结果文件。"""
    global _STALE
    if stale is None:
        _STALE = load_stale() if _STALE is None else _STALE
        stale = _STALE
    text = plain(text)
    low = text.lower()
    found = []
    for f in stale:
        if f.get("target") and f["target"] not in ((q or {}).get("target_url") or ""):
            continue
        if any(w.lower() in low for w in f.get("unless_answer", [])):
            continue
        w = f.get("window", STALE_WINDOW)
        for m in f["re"].finditer(text):
            around = text[max(0, m.start() - w): m.end() + w].lower()
            if f.get("near") and not any(n.lower() in around for n in f["near"]):
                continue
            if any(u.lower() in around for u in f.get("unless", [])):
                continue
            found.append((f["id"], " ".join(text[max(0, m.start() - 90): m.end() + 90].split())))
            break
    return found


def wrong_in(text: str | None, q: dict | None = None, stale: list[dict] | None = None) -> list[str]:
    """回答里说错、过时、认错的事的 id（stale-facts.json）。"""
    return [i for i, _ in wrong_hits(text, q, stale)]


def score_row(row: dict, q: dict, facts: list[dict] | None = None, stale: list[dict] | None = None) -> dict:
    """asked 的一个回答 → 一行分数。只留我们自己的网址，别的网站的不留；回答原文也不留，只留命中的事实 id
    和说错的事的 id（wrong_facts）。"""
    cited = row.get("cited") or []
    used = facts_in(row.get("text"), facts)
    ours = sorted({norm_url(p["url"]) for p in cited if p.get("site") == OWN and p.get("url")})
    target = norm_url(q["target_url"]) if q.get("target_url") else ""
    return {
        "engine": row["engine"], "question_id": q["id"], "set": q["set"], "kind": q["kind"], "sample": row.get("sample", 0),
        "status": status_of(row.get("text"), cited),
        "site_cited": bool(row.get("cited_you")),
        "page_cited": bool(target) and target in ours,
        "page_cited_any_lang": bool(target) and any_lang(target) in {any_lang(u) for u in ours},
        "named": bool(row.get("named_you")),
        "first_pick": bool(cited) and cited[0].get("site") == OWN,
        "fact_used": bool(used),
        "absorbed": bool(used) and not row.get("named_you") and not row.get("cited_you"),
        "facts": used,
        "wrong_facts": wrong_in(row.get("text"), q, stale),
        "read": bool(row.get("read_you")),
        "cited_count": len(cited),
        "our_urls": ours,
    }


def valid(rows: list[dict]) -> list[dict]:
    return [r for r in rows if r["status"] == "answered"]


def engines_in(rows: list[dict]) -> list[str]:
    order = list(LABEL)
    return sorted({r["engine"] for r in rows}, key=lambda e: order.index(e) if e in order else len(order))


def tally(rows: list[dict]) -> dict[str, dict]:
    """每家 AI：回答数、有效回答数、拒答和空回答数；每个口径命中的回答数和题数。"""
    out = {}
    for e in engines_in(rows):
        rs = [r for r in rows if r["engine"] == e]
        ok = valid(rs)
        t = {"answers": len(rs), "valid": len(ok), "refused": sum(r["status"] == "refused" for r in rs),
             "empty": sum(r["status"] == "empty" for r in rs), "questions": len({r["question_id"] for r in ok})}
        for c in CALIBERS:
            t[c] = {"answers": sum(1 for r in ok if r.get(c)), "questions": len({r["question_id"] for r in ok if r.get(c)})}
        out[e] = t
    return out


def rate(rows: list[dict], engine: str, caliber: str, ids: set | None = None) -> tuple[int, int]:
    """(命中的有效回答数, 有效回答数)。ids 给了就只算这些题。"""
    ok = [r for r in valid(rows) if r["engine"] == engine and (ids is None or r["question_id"] in ids)]
    return sum(1 for r in ok if r.get(caliber)), len(ok)


def hits(rows: list[dict], caliber: str = "site_cited") -> set[tuple[str, str]]:
    """至少有一个有效回答命中的（AI, 题目）。"""
    return {(r["engine"], r["question_id"]) for r in valid(rows) if r.get(caliber)}


# ───────────── 不确定性：按题算 ─────────────

def per_question(rows: list[dict], engine: str, caliber: str, ids: set | None = None) -> dict[str, tuple[int, int]]:
    """每道题：(命中的有效回答数, 有效回答数)。"""
    out: dict[str, tuple[int, int]] = {}
    for r in valid(rows):
        if r["engine"] == engine and (ids is None or r["question_id"] in ids):
            h, n = out.get(r["question_id"], (0, 0))
            out[r["question_id"]] = (h + bool(r.get(caliber)), n + 1)
    return out


def cluster_ci(rows: list[dict], engine: str, caliber: str, ids: set | None = None) -> tuple[float, float] | None:
    """按题聚类的 95% 区间（下限, 上限），没有有效回答是 None。

    同一题的几个回答几乎一样（2026-11-21 实测：Perplexity 3 次完全相同，ChatGPT「有没有引用本站」3 次完全一致），
    有效样本是题数，不是回答数。所以以题为单位有放回地重抽 BOOT 次，一道题的几个回答一起进出，
    取第 2.5 和第 97.5 百分位。题按 id 排好再抽，随机种子固定：同一份结果重算，区间不变。
    全都没命中（或全都命中）时重抽给不出宽度，改用按题数算的精确界：上限 1 − 0.025^(1/题数)，约 3.7/题数
    （下限反过来）。题多时和「三分之一法则」差不多，题少时更准：4 题全没命中，上限是 60%，不是 75%。"""
    per = [v for _, v in sorted(per_question(rows, engine, caliber, ids).items())]
    if not per:
        return None
    k, hit, total = len(per), sum(h for h, _ in per), sum(n for _, n in per)
    if hit == 0:
        return 0.0, 1 - 0.025 ** (1 / k)
    if hit == total:
        return 0.025 ** (1 / k), 1.0
    rnd, est = random.Random(SEED), []
    for _ in range(BOOT):
        pick = rnd.choices(per, k=k)
        est.append(sum(h for h, _ in pick) / sum(n for _, n in pick))
    est.sort()
    return est[math.ceil(0.025 * BOOT) - 1], est[math.ceil(0.975 * BOOT) - 1]


def overlap(a: tuple[float, float], b: tuple[float, float]) -> bool:
    return a[0] <= b[1] and b[0] <= a[1]


def clopper_pearson(k: int, n: int, alpha: float = 0.05) -> tuple[float, float] | None:
    """n 个里有 k 个时，这个比例的精确 95% 区间（Clopper–Pearson）；n = 0 是 None。
    下限是让「至少 k 个」的概率正好 2.5% 的比例，上限是让「至多 k 个」的概率正好 2.5% 的比例。
    二项分布的累计概率用 math.comb 逐项加（取对数再加，n 大了也不溢出），比例用二分法找，到浮点数的精度为止。
    0 个时下限是 0，上限是 1 − 0.025^(1/n)（20 个里 0 个：约 16.8%）；n 个全是时反过来。"""
    if not n:
        return None
    logc = [math.log(math.comb(n, i)) for i in range(n + 1)]

    def at_most(j: int, p: float) -> float:            # 比例是 p 时，n 个里至多 j 个的概率；p 越大，它越小
        lp, lq = math.log(p), math.log1p(-p)
        return sum(math.exp(logc[i] + i * lp + (n - i) * lq) for i in range(j + 1))

    def solve(j: int, target: float) -> float:          # 找 at_most(j, p) = target 的 p
        lo, hi = 0.0, 1.0
        for _ in range(100):
            mid = (lo + hi) / 2
            if mid in (lo, hi):                         # 已经分不出来了
                break
            lo, hi = (mid, hi) if at_most(j, mid) > target else (lo, mid)
        return (lo + hi) / 2

    return (0.0 if k == 0 else solve(k - 1, 1 - alpha / 2)), (1.0 if k == n else solve(k, alpha / 2))


def majority(rows: list[dict], caliber: str = "site_cited") -> dict[tuple[str, str], bool]:
    """每个（AI, 题目）的多数票：有效回答里过半命中是 True，过半没命中是 False。
    平票的（比如 2 个有效回答 1 中 1 不中）不算，不在结果里；没有有效回答的也不在。"""
    count: dict[tuple[str, str], tuple[int, int]] = {}
    for r in valid(rows):
        h, n = count.get((r["engine"], r["question_id"]), (0, 0))
        count[(r["engine"], r["question_id"])] = (h + bool(r.get(caliber)), n + 1)
    return {k: 2 * h > n for k, (h, n) in count.items() if 2 * h != n}


def flips(now: list[dict], prev: list[dict], caliber: str = "site_cited") -> dict[str, tuple[int, int]]:
    """每周翻转：每家 (多数票和上次不一样的题数, 两次都有多数票的题数)。两次里有一次平票、或没有有效回答的题不算。"""
    a, b = majority(now, caliber), majority(prev, caliber)
    out: dict[str, tuple[int, int]] = {}
    for e, q in sorted(set(a) & set(b)):
        f, n = out.get(e, (0, 0))
        out[e] = (f + (a[(e, q)] != b[(e, q)]), n + 1)
    return out


# ───────────── 读以前的结果 ─────────────

def load_rows(path: Path) -> list[dict]:
    """这个脚本写的结果，或 2026-11-17 那份旧格式的基线（每题每家 1 次，分数在 scores 里）。"""
    d = json.loads(path.read_text(encoding="utf-8"))
    if "rows" in d:
        return d["rows"]
    rows = []
    for r in d.get("results", []):
        s = r.get("scores") or {}
        rows.append({"engine": BASELINE_ENGINES.get(r["engine"], r["engine"].lower()), "question_id": r["question_id"],
                     "set": "frozen", "kind": r.get("kind", ""), "sample": 0,
                     "status": "answered" if r.get("status") == "answered" else "empty",
                     **{c: bool(s.get(c)) for c in CALIBERS}})
    return rows


def previous_run(day: str) -> tuple[list[dict] | None, str, dict | None]:
    """上一次的（回答行, 日期, 运行配置）；没有就是 (None, "", None)。"""
    path = previous(day)
    if not path:
        return None, "", None
    return load_rows(path), RESULT_NAME.match(path.name).group(1), json.loads(path.read_text(encoding="utf-8")).get("lineage")


def previous(day: str) -> Path | None:
    """这一天之前最近的一次结果（不含基线）。"""
    found = sorted(p for p in PANEL.glob("results-*.json") if (m := RESULT_NAME.match(p.name)) and m.group(1) < day)
    return found[-1] if found else None


# ───────────── 对照实验 ─────────────

def experiment_table(now: list[dict], base: list[dict], exp: dict, caliber: str = "site_cited") -> list[dict]:
    """处理组和对照组各自的回答命中数（命中, 有效），这次和基线各一个，照原样给出来方便核对；
    净变化用 net_change：只算两期都有有效回答的题，每题同权（2026-11-26 起，和「要差多少才测得出」同一口径）。"""
    treated, control = set(exp["treated"]), set(exp["control"])
    out = []
    for e in engines_in(now):
        tn, cn, tb, cb = rate(now, e, caliber, treated), rate(now, e, caliber, control), rate(base, e, caliber, treated), rate(base, e, caliber, control)
        pool = treated | control
        net = net_change(per_question(now, e, caliber, pool), per_question(base, e, caliber, pool), treated, control)
        out.append({"engine": e, "treated_now": tn, "control_now": cn, "treated_base": tb, "control_base": cb, "net": net})
    return out


def net_change(now_q: dict, base_q: dict, treated: set, control: set) -> float | None:
    """净变化 = 处理组每题变化的平均 − 对照组每题变化的平均。输入是 per_question 的结果。
    只算两期都有有效回答的题，每题同权，和 mde() 的口径一样（2026-11-26 起；以前按回答合并、也不要求两期都有，
    回答多的题权重大）。有一组没有这样的题就是 None。"""
    def change(ids: set) -> float | None:
        both = sorted(q for q in ids if q in now_q and q in base_q and now_q[q][1] and base_q[q][1])
        if not both:
            return None
        return sum(now_q[q][0] / now_q[q][1] - base_q[q][0] / base_q[q][1] for q in both) / len(both)
    t, c = change(treated), change(control)
    if t is None or c is None:
        return None
    return t - c


def perm_test(now: list[dict], base: list[dict], exp: dict, engine: str, caliber: str = "site_cited") -> float | None:
    """置换检验的 p 值：在题目层面把处理组、对照组的标签随机打乱 PERM 次（两组题数不变，随机种子固定），
    看打乱后的净变化里，绝对值不小于实际净变化的占多少（分子分母各加 1）。题少的时候，这比看百分比诚实。"""
    treated, control = set(exp["treated"]), set(exp["control"])
    pool = sorted(treated | control)
    now_q, base_q = per_question(now, engine, caliber, set(pool)), per_question(base, engine, caliber, set(pool))
    seen = net_change(now_q, base_q, treated, control)
    if seen is None:
        return None
    rnd, order, done, extreme = random.Random(SEED), list(pool), 0, 0
    for _ in range(PERM):
        rnd.shuffle(order)
        t = set(order[:len(treated)])
        v = net_change(now_q, base_q, t, set(order) - t)
        if v is None:
            continue
        done += 1
        extreme += abs(v) >= abs(seen) - 1e-9
    return (extreme + 1) / (done + 1) if done else None


def mde(v: float, n_treated: int, n_control: int) -> float | None:
    """以现在的题数，净变化至少要差多少个百分点才测得出来（5% 显著性、80% 把握）：
    (1.96 + 0.84) × √(v/处理组题数 + v/对照组题数) × 100。每题每期按 1 个样本算（同一题的几个回答几乎一样）。
    v 估的是一道题两期命中率之差的方差（measured_noise 不减平均变化，整体一起涨跌时偏大，偏保守）：
    净变化是两组各自平均变化之差，标准误约 √(v/处理组题数 + v/对照组题数)，要测得出来大约要 (1.96 + 0.84) 倍标准误。
    每题只有 0 和 1 时，v 就是翻转的题占多少。"""
    if not n_treated or not n_control:
        return None
    return (1.96 + 0.84) * math.sqrt(v / n_treated + v / n_control) * 100


def detectable(n_treated: int, n_control: int) -> tuple[int, int] | None:
    """测不了噪声时的退路：v 取 FLIP 假设的两头（每周 5%、15% 的题翻转），各算一个 mde，取整。"""
    if not n_treated or not n_control:
        return None
    lo, hi = (round(mde(r, n_treated, n_control)) for r in FLIP)
    return lo, hi


def paired_counts(now: list[dict], base: list[dict], exp: dict, engine: str, caliber: str = "site_cited") -> tuple[int, int]:
    """两期都有有效回答的题：处理组几题、对照组几题。"""
    both = set(per_question(now, engine, caliber)) & set(per_question(base, engine, caliber))
    return len(both & set(exp["treated"])), len(both & set(exp["control"]))


def measured_noise(now: list[dict], base: list[dict], exp: dict, engine: str, caliber: str = "site_cited",
                   exclude: frozenset = frozenset()) -> tuple[float, int] | None:
    """实测的噪声 (v, 题数)。取不在处理组、两期都有有效回答的题（对照组，加上没分进两组的题），
    每题两期命中率之差的平方，取平均。命中率和 net_change 用的一样：per_question 的「命中/有效」。
    这些题没为这个实验改过，它们两期之间的变化就是本来的波动。没有这样的题是 None。题按 id 排好再加，重算不变。
    exclude 是别的实验的处理组（2026-11-27 起）：那些题为别的实验改过，它们的变化不是本来的波动，也不算进 v。"""
    now_q, base_q = per_question(now, engine, caliber), per_question(base, engine, caliber)
    ids = sorted((set(now_q) & set(base_q)) - set(exp["treated"]) - set(exclude))
    if not ids:
        return None
    return sum((now_q[q][0] / now_q[q][1] - base_q[q][0] / base_q[q][1]) ** 2 for q in ids) / len(ids), len(ids)


def engine_mde(now: list[dict], base: list[dict], exp: dict, engine: str, caliber: str = "site_cited",
               exclude: frozenset = frozenset()) -> dict | None:
    """一家的「要差多少才测得出来」：{nt, nc, v, k} 加上 mde（实测，一个数）或 assumed（假设，FLIP 两头的范围）。
    nt、nc 是 paired_counts 的处理组、对照组题数，有一组是 0 就是 None。k 是算 v 用了几道题。
    k 不到 MIN_NOISE_Q，或者 v = 0（这些题两期一点没变，不等于没有波动，只是没测到），就退回 FLIP 的假设。"""
    nt, nc = paired_counts(now, base, exp, engine, caliber)
    if not nt or not nc:
        return None
    v, k = measured_noise(now, base, exp, engine, caliber, exclude) or (0.0, 0)
    if k >= MIN_NOISE_Q and v > 0:
        return {"nt": nt, "nc": nc, "v": v, "k": k, "mde": mde(v, nt, nc)}
    return {"nt": nt, "nc": nc, "v": v, "k": k, "assumed": detectable(nt, nc)}


def mde_cell(m: dict | None) -> str:
    """表里「要差多少才测得出」那一格。实测的是一个数；假设的是 FLIP 两头的范围，后面标「假设」。"""
    if not m:
        return "–"
    if "mde" in m:
        d = round(m["mde"])
        return f"约 {d} 个百分点" + ("，基本测不出来" if d > 100 else "")
    lo, hi = m["assumed"]
    return (f"约 {lo}–{hi} 个百分点" if hi <= 100 else f"至少约 {lo} 个百分点，基本测不出来") + "（假设）"


# ───────────── GA4：AI 带来的真实访问 ─────────────

def is_ai(source: str) -> bool:
    return any(source.endswith(a) or source.endswith(a.split(".")[0]) for a in AI_REFERRERS)


def ai_referrals(ga: dict) -> dict | None:
    """ops/analytics/fetch_ga.py 存下的 ga.json → 近 7 天来自 AI 的会话数，按来源和落地页。"""
    if not ga.get("ok") or not ga.get("srcLanding7"):
        return None
    by_src, by_page = Counter(), Counter()
    for r in ga["srcLanding7"]["rows"]:
        if is_ai(r["sessionSource"]):
            by_src[r["sessionSource"]] += r["sessions"]
            by_page[r["landingPage"]] += r["sessions"]
    return {"total": int(sum(by_src.values())), "sources": [[s, int(n)] for s, n in by_src.most_common(8)],
            "pages": [[p, int(n)] for p, n in by_page.most_common(8)]}


# ───────────── 运行配置 ─────────────

def file_hash(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()[:12] if path.exists() else ""


def lineage(sets: list[str], plan: dict[str, int], engines_spec: dict, max_usd: float, limit: int) -> dict:
    """这次是怎么跑的：两次结果能不能直接比，看的就是这些。"""
    try:
        from importlib.metadata import version
        bg_version = version("backlink-guard")
    except Exception:
        bg_version = ""
    return {
        "questions": {s: file_hash(SETS[s]) for s in sets if s in SETS},
        "signature_facts": file_hash(FACTS),
        "runner": file_hash(Path(__file__)),
        "backlink_guard": bg_version,
        "engines": {e: {"samples": n, "model": engines_spec.get(e, {}).get("model") or engines_spec.get(e, {}).get("path", ""),
                        "kind": engines_spec.get(e, {}).get("kind", "")}    # scraper 抓网页界面，serp 抓搜索结果页，llm 走 API
                    for e, n in plan.items()},
        "max_usd": max_usd,
        "limit": limit,
        "stale_facts": file_hash(STALE),        # 2026-11-26 起：说错清单（stale-facts.json）
    }


def lineage_diff(now: dict | None, prev: dict | None) -> list[str]:
    """两次配置的差别，写成人话。旧结果没有配置记录的，说没法对。"""
    if not now:
        return []
    if not prev:
        return ["上次没有记运行配置（这个功能 2026-11-22 才加），没法确认两次是同一套题、同一批模型。"]
    out = []
    for s in sorted(set(now.get("questions", {})) | set(prev.get("questions", {}))):
        a, b = prev.get("questions", {}).get(s), now.get("questions", {}).get(s)
        if a and b and a != b:
            out.append(f"{SET_ZH.get(s, s)}的题库改过（{a} → {b}）：这一组和上次的比较不作数。")
    if prev.get("signature_facts") and prev.get("signature_facts") != now.get("signature_facts"):
        out.append("事实清单改过：「用了我们的数据」「用了没署名」两列和上次不能比。")
    if prev.get("stale_facts") and prev.get("stale_facts") != now.get("stale_facts"):
        out.append("说错清单（stale-facts.json）改过：「AI 说错的事」一段和上次不能直接比。")
    for e, cfg in now.get("engines", {}).items():
        old = prev.get("engines", {}).get(e)
        if old and old.get("model") != cfg.get("model"):
            out.append(f"{LABEL.get(e, e)} 的模型换了（{old.get('model')} → {cfg.get('model')}）。")
        if old and old.get("samples") != cfg.get("samples"):
            out.append(f"{LABEL.get(e, e)} 每题问的次数变了（{old.get('samples')} → {cfg.get('samples')}），看命中率，别看命中题数。")
    if prev.get("backlink_guard") and prev.get("backlink_guard") != now.get("backlink_guard"):
        out.append(f"backlink-guard 版本变了（{prev['backlink_guard']} → {now.get('backlink_guard')}），解析方式可能不同。")
    return out


# ───────────── 摘要 ─────────────

def pct(hit: int, total: int) -> str:
    return f"{hit}/{total}（{hit * 100 // total}%）" if total else "–"


def pct_ci(rows: list[dict], engine: str, caliber: str, ids: set | None = None) -> str:
    """「命中/有效（命中率，区间 下限–上限%）」。命中率和以前一样向下取整；区间向外取整，不会比算出来的窄。"""
    hit, total = rate(rows, engine, caliber, ids)
    if not total:
        return "–"
    lo, hi = cluster_ci(rows, engine, caliber, ids)
    return f"{hit}/{total}（{hit * 100 // total}%，区间 {math.floor(lo * 100 + 1e-9)}–{math.ceil(hi * 100 - 1e-9)}%）"


def fmt_p(p: float | None) -> str:
    if p is None:
        return "–"
    return f"{p:.2f}" if p >= 0.01 else f"{p:.3f}"


def flip_cell(k: int, n: int) -> str:
    """「翻了的/总数（翻转率，区间 下限–上限%）」，区间是 Clopper–Pearson。翻转率一般只有百分之几到十几，
    命中率那样取整会丢太多，这里保留一位小数，四舍五入。"""
    if not n:
        return "–"
    lo, hi = clopper_pearson(k, n)
    return f"{k}/{n}（{k / n * 100:.1f}%，区间 {lo * 100:.1f}–{hi * 100:.1f}%）"


def surface_of(result: dict, engine: str) -> tuple[str, str]:
    """(kind, model)：这次运行配置（lineage）里记下的优先，旧结果没记就用 SURFACE、MODEL 两张表。"""
    got = ((result.get("lineage") or {}).get("engines") or {}).get(engine) or {}
    kind = got.get("kind") or SURFACE.get(engine, "")
    model = got["model"] if kind == "llm" and got.get("kind") == "llm" and got.get("model") else MODEL.get(engine, "")
    return kind, model


def surface_line(result: dict, engines: list[str]) -> str:
    """「ChatGPT、Gemini App 抓网页界面（…）；Google AI Mode 抓 Google 搜索结果页；Perplexity（sonar）、Claude（…）走 API」"""
    groups: dict[str, list[str]] = {}
    for e in engines:
        kind, model = surface_of(result, e)
        groups.setdefault(kind, []).append(LABEL.get(e, e) + (f"（{model}）" if kind == "llm" and model else ""))
    return "；".join("、".join(names) + ("" if names[-1].endswith("）") else " ") + KIND_VERB.get(kind, "不清楚怎么问的")
                    for kind, names in groups.items())


def engine_table(rows: list[dict], base: list[dict] | None, ids: set | None = None, result: dict | None = None) -> list[str]:
    head = ("| AI | 怎么问的 | 有效回答 | " + " | ".join(CALIBER_ZH[c] + ("（只做参考）" if c == "first_pick" else "") for c in CALIBERS)
            + " |" + (" 基线：引用本站 |" if base else ""))
    lines = [head, "|---|---|---|" + "---|" * len(CALIBERS) + ("---|" if base else "")]
    measured = {c for r in rows for c in CALIBERS if c in r}      # 2026-11-22 前的结果没有后两列，显示 –，不显示 0
    for e in engines_in(rows):
        n = rate(rows, e, "site_cited", ids)[1]
        cells = [LABEL.get(e, e), KIND_ZH.get(surface_of(result or {}, e)[0], "–"), str(n)]
        cells += [pct_ci(rows, e, c, ids) if c in measured else "–" for c in CALIBERS]
        if base:
            cells.append(pct_ci(base, e, "site_cited", ids))
        lines.append("| " + " | ".join(cells) + " |")
    return lines


PAGE_CALIBER = "page_cited_any_lang"    # 引用了题目自己的目标页（中英文版都算）


def target_pages() -> dict[str, str]:
    """题号 → 目标页（any_lang 之后），几套题合在一起。"""
    out = {}
    for path in SETS.values():
        if path.exists():
            for q in json.loads(path.read_text(encoding="utf-8"))["questions"]:
                if q.get("target_url"):
                    out[q["id"]] = any_lang(norm_url(q["target_url"]))
    return out


def cross_lines(rows: list[dict], exp: dict, others: list[dict], pages: dict[str, str]) -> list[str]:
    """几个实验同时跑时会不会串：这个实验的题，回答里引用了别的实验处理组的目标页（那些页为别的实验改过）几次。
    「引用本站」只要引了本站任何一页就算，别的实验改过的页被引用，会被算成这个实验的变化（2026-11-27 起）。"""
    other_pages = {pages[q] for o in others for q in o["treated"] if q in pages}
    if not other_pages:
        return []
    cells = []
    for name, ids in (("处理组", set(exp["treated"])), ("对照组", set(exp["control"]))):
        ok = [r for r in valid(rows) if r["question_id"] in ids]
        hit = [r for r in ok if {any_lang(u) for u in r.get("our_urls") or []} & (other_pages - {pages.get(r["question_id"])})]
        cells.append(f"{name} {len(hit)}/{len(ok)} 个有效回答")
    return [f"跟别的实验串没串：这次回答引用了别的实验处理组的页（那些页为别的实验改过）——{'，'.join(cells)}。"
            "不是 0 的话，上面「引用本站」的变化里有一部分来自别的实验，以下面「引用对应页面」为准。", ""]


def page_lines(rows: list[dict], base: list[dict], exp: dict) -> list[str]:
    """同一个实验只算「引用对应页面」：题目自己的目标页被引用才算。目标页冻结，别的实验改别的页影响不到它。
    两期用同一列：基线有「中英文版都算」（page_cited_any_lang，2026-11-22 起才有）就用它，没有就两期都用 page_cited（只认同一语言版本）。"""
    caliber = PAGE_CALIBER if any(PAGE_CALIBER in r for r in base) else "page_cited"
    if not any(caliber in r for r in base):
        return ["只算「引用对应页面」：基线里还没有这一列，从有这一列的结果当基线起才有。", ""]
    treated, control = set(exp["treated"]), set(exp["control"])
    lang = "中英文版都算" if caliber == PAGE_CALIBER else "只认同一语言版本，基线只有这一列"
    out = [f"只算「引用对应页面」（题目自己的目标页被引用才算，{lang}；不受别的实验改的页影响）：", "",
           "| AI | 处理组 现在 | 处理组 基线 | 对照组 现在 | 对照组 基线 | 净变化 | p 值 |", "|---|---|---|---|---|---|---|"]
    for t in experiment_table(rows, base, exp, caliber):
        e = t["engine"]
        net = "–" if t["net"] is None else f"{t['net'] * 100:+.0f} 个百分点"
        out.append(f"| {LABEL.get(e, e)} | {pct_ci(rows, e, caliber, treated)} | {pct_ci(base, e, caliber, treated)} | "
                   f"{pct_ci(rows, e, caliber, control)} | {pct_ci(base, e, caliber, control)} | {net} | "
                   f"{fmt_p(perm_test(rows, base, exp, e, caliber))} |")
    return out + [""]


def experiment_section(rows: list[dict], base: list[dict], exp: dict, others: list[dict] = (),
                       pages: dict[str, str] | None = None) -> list[str]:
    """对照实验一段：两组各自的命中率和区间、净变化、置换检验 p 值，和以现在的题数要差多少才测得出来（MDE）。
    MDE 用实测的噪声 v 算（measured_noise），每家一格；某一家测不了才按 FLIP 假设，标「假设」。另给几家合在一起的 v。
    others 是同时在跑的别的实验（2026-11-27 起）：它们的处理组不算进 v；另给「跟别的实验串没串」一行和只算「引用对应页面」的表。"""
    treated, control = set(exp["treated"]), set(exp["control"])
    exclude = frozenset(q for o in others for q in o["treated"]) - treated - control
    out = [f"## 对照实验：{exp['note']}", "",
           f"{exp['started']} 开始。处理组 {len(treated)} 题，对照组 {len(control)} 题，看的是「引用本站」。", "",
           "| AI | 处理组 现在 | 处理组 基线 | 对照组 现在 | 对照组 基线 | 净变化 | p 值 | 要差多少才测得出 |",
           "|---|---|---|---|---|---|---|---|"]
    sizes: dict[tuple[int, int], list[str]] = {}
    measured, assumed, noises = [], [], []
    for t in experiment_table(rows, base, exp):
        e, name = t["engine"], LABEL.get(t["engine"], t["engine"])
        net = "–" if t["net"] is None else f"{t['net'] * 100:+.0f} 个百分点"
        m = engine_mde(rows, base, exp, e, exclude=exclude) if t["net"] is not None else None
        out.append(f"| {name} | {pct_ci(rows, e, 'site_cited', treated)} | {pct_ci(base, e, 'site_cited', treated)} | "
                   f"{pct_ci(rows, e, 'site_cited', control)} | {pct_ci(base, e, 'site_cited', control)} | {net} | "
                   f"{fmt_p(perm_test(rows, base, exp, e))} | {mde_cell(m)} |")
        if (got := measured_noise(rows, base, exp, e, exclude=exclude)):
            noises.append(got)
        if m:
            sizes.setdefault((m["nt"], m["nc"]), []).append(name)
            (measured if "mde" in m else assumed).append((name, m))
    out += ["", f"净变化 = 处理组的变化 − 对照组的变化。p 值：把这 {len(treated | control)} 题的处理组、对照组标签随机打乱 "
                f"{PERM:,} 次（随机种子固定），看有多大比例的打乱结果，净变化的绝对值不小于实际这个；小于 0.05 才算测出来了。", ""]
    if others:
        out += cross_lines(rows, exp, list(others), target_pages() if pages is None else pages)
        out += page_lines(rows, base, exp)
    if not sizes:
        return out
    out += ["「要差多少才测得出」（MDE）：以现在的题数，净变化至少要有这么大，才有 80% 的把握在 5% 显著性下测出来，"
            "算法是 (1.96 + 0.84) × √(v/处理组题数 + v/对照组题数) × 100 个百分点，题数只算两期都问到的（"
            + "；".join(f"{'、'.join(names)}：处理组 {nt} 题、对照组 {nc} 题" for (nt, nc), names in sizes.items())
            + "）。比 MDE 小的净变化只是方向，不算结果。", "",
            "v 是实测的噪声，不是假设的：取两期都问到、又不在处理组的题（对照组，加上没分进两组的题；别的实验的处理组不算），"
            "每题两期的命中率相减、平方，再取平均。这些题没为这个实验改过，它们两期之间的变化就是本来的波动；"
            "每题的命中率只有 0 和 1 时，v 就是两期之间翻转的题占多少。"
            + ("各家：" + "、".join(f"{name} {m['v']:.2f}（{m['k']} 题）" for name, m in measured) + "。" if measured else ""), ""]
    if (k := sum(n for _, n in noises)) >= MIN_NOISE_Q:     # 合在一起的题也不到 MIN_NOISE_Q 道，就不给这个数
        out += [f"几家合在一起：v = {sum(v * n for v, n in noises) / k:.2f}（{len(noises)} 家共 {k} 题）。", ""]
    if assumed:
        why = [f"{name} 的 {m['k']} 道题两期一点没变（v = 0，测不出波动）" if m["k"] >= MIN_NOISE_Q
               else f"{name} 只有 {m['k']} 道这样的题（不到 {MIN_NOISE_Q} 道）" for name, m in assumed]
        out += ["；".join(why) + f"，v 测不准，按以前的假设估算：每周有 {FLIP[0]:.0%}–{FLIP[1]:.0%} 的题在引用、不引用之间翻转"
                f"（v 取 {FLIP[0]:.2f}–{FLIP[1]:.2f}），表里标「假设」。", ""]
    return out


def compare_section(rows: list[dict], prev: list[dict], prev_day: str) -> list[str]:
    """和上次比：只比两次都有有效回答的题。单家两次的区间不重叠才算数。
    另给每周翻转率（flips）：每家每题的多数票和上次不一样的占多少，每家一格，再给几家合在一起的，都带 Clopper–Pearson 区间。"""
    asked_both = {(r["engine"], r["question_id"]) for r in valid(rows)} & {(r["engine"], r["question_id"]) for r in valid(prev)}
    new = [x for x in sorted(hits(rows) - hits(prev)) if x in asked_both]
    gone = [x for x in sorted(hits(prev) - hits(rows)) if x in asked_both]
    flipped = flips(rows, prev)
    out = [f"## 和上次（{prev_day}）比", ""]
    lines = []
    for e in engines_in(rows):
        ids = {q for x, q in asked_both if x == e}
        if not ids:
            continue
        a, b = cluster_ci(rows, e, "site_cited", ids), cluster_ci(prev, e, "site_cited", ids)
        verdict = "区间不重叠，算数" if a and b and not overlap(a, b) else "区间重叠，不算数"
        lines.append(f"| {LABEL.get(e, e)} | {len(ids)} | {pct_ci(rows, e, 'site_cited', ids)} | {pct_ci(prev, e, 'site_cited', ids)} | "
                     f"{verdict} | {flip_cell(*flipped.get(e, (0, 0)))} |")
    if lines:
        out += ["只比两次都问到的题。", "", "| AI | 题数 | 这次：引用本站 | 上次：引用本站 | 算不算数 | 多数票翻了的 |",
                "|---|---|---|---|---|---|"] + lines + [""]
        total = sum(f for f, _ in flipped.values()), sum(n for _, n in flipped.values())
        if total[1]:
            out += [f"每周翻转率，几家合在一起：{flip_cell(*total)}。每家每题取多数票（过半的有效回答引用了本站算引用，平票的不算），"
                    "和上次不一样就算翻了一次；区间是精确的 95% 二项区间（Clopper–Pearson）。"
                    "翻转率说明两次之间有多少题会在引用、不引用之间换边，单题的「新出现」「没再引用」要先当成这种波动，"
                    "不能直接算成改动的效果。", ""]
    out += ["新出现引用本站的：" + ("、".join(f"{LABEL.get(e, e)} · {q}" for e, q in new) or "没有"), "",
            "这次没再引用的：" + ("、".join(f"{LABEL.get(e, e)} · {q}" for e, q in gone) or "没有"), ""]
    return out


def absorbed_section(rows: list[dict]) -> list[str]:
    """哪些数字被用了却没署名、被哪几家用了。只有我们自己的事实 id，没有回答原文。"""
    used, absorbed = Counter(), Counter()
    by = {}
    for r in valid(rows):
        for f in r.get("facts") or []:
            used[f] += 1
            if r.get("absorbed"):
                absorbed[f] += 1
                by.setdefault(f, set()).add(LABEL.get(r["engine"], r["engine"]))
    if not any("fact_used" in r for r in rows):
        return []                                                     # 旧结果，没测这一项
    if not used:
        return ["## 我们的数据有没有被用", "", "这次没有回答用到 signature-facts.json 里的数字。", ""]
    out = ["## 我们的数据有没有被用", "",
           "「用了没署名」= 回答写出了只有我们研究里才有的数字，却既没点名也没引用 jasonzhu.ai。"
           "这说明内容已经被吸收（多半经别人转述），下一步是让它带上出处。", "",
           "| 事实 | 被用的回答数 | 其中没署名 | 没署名的是哪几家 |", "|---|---|---|---|"]
    for f, n in used.most_common():
        out.append(f"| `{f}` | {n} | {absorbed.get(f, 0)} | {'、'.join(sorted(by.get(f, []))) or '–'} |")
    return out + [""]


def stale_section(rows: list[dict], stale: list[dict] | None = None) -> list[str]:
    """AI 说错的事：每件事是哪一类、几个回答、哪几家、哪些题，这些回答有没有引用本站、引用的是本站哪页。
    只有 stale-facts.json 的 id、计数和本站网址，没有回答原文，也没有别的网站（那些在邮件附录里）。"""
    if not any("wrong_facts" in r for r in rows):
        return []                                                     # 2026-11-26 前的结果，没测这一项
    meta = {f["id"]: f for f in (load_stale() if stale is None else stale)}
    ok = valid(rows)
    by: dict[str, list[dict]] = {}
    for r in ok:
        for f in r.get("wrong_facts") or []:
            by.setdefault(f, []).append(r)
    out = ["## AI 说错的事", ""]
    if not by:
        return out + [f"这次 {len(ok)} 个有效回答都没说到 stale-facts.json 记下的错事。", ""]
    order = list(LABEL)
    out += [f"这次 {len(ok)} 个有效回答里，{sum(1 for r in ok if r.get('wrong_facts'))} 个说到了 stale-facts.json 记下的事："
            "说错（数字或说法不对）、过时（旧数字当成现在的）、认错（混成别的人、别的网站、别的东西）。"
            "按写法认，换了说法的认不出来；命中的要看一眼原文再下结论，原文片段在邮件后面「只在邮件里看的部分」。"
            "引用了本站的，先查引用的那页是不是还写着旧说法；没引用本站的，错多半来自别处。", "",
            "| 说错的事 | 类型 | 回答数 | 哪几家 | 题 | 其中引用了本站 | 引用的本站页面 |", "|---|---|---|---|---|---|---|"]
    for fid, rs in sorted(by.items(), key=lambda kv: (-len(kv[1]), kv[0])):
        per = Counter(r["engine"] for r in rs)
        engines = "、".join(f"{LABEL.get(e, e)} {per[e]}" for e in sorted(per, key=lambda e: order.index(e) if e in order else len(order)))
        qids = sorted({r["question_id"] for r in rs})
        cited = [r for r in rs if r.get("site_cited")]
        urls = Counter(u for r in cited for u in r.get("our_urls") or [])
        out.append(f"| `{fid}` | {WRONG_ZH.get(meta.get(fid, {}).get('kind'), '–')} | {len(rs)} | {engines} | "
                   f"{'、'.join(qids[:8])}{f' 等 {len(qids)} 题' if len(qids) > 8 else ''} | {len(cited)}/{len(rs)} | "
                   f"{'、'.join(f'{u}（{n}）' for u, n in sorted(urls.items(), key=lambda x: (-x[1], x[0]))[:5]) or '–'} |")
    out += ["", "对的说法："] + [f"- `{fid}`：{meta[fid]['correct']}" for fid in sorted(by, key=lambda f: (-len(by[f]), f)) if fid in meta]
    return out + [""]


def grid_meta(path: Path = GRID) -> dict[str, dict]:
    """收款格子组每道题在哪一格：{题 id: {scene, who, ask}}，从题库的 grid 字段读（结果文件里不重复存）。没有文件是空的。"""
    if not path.exists():
        return {}
    return {q["id"]: q["grid"] for q in json.loads(path.read_text(encoding="utf-8"))["questions"] if q.get("grid")}


def grid_section(rows: list[dict], meta: dict[str, dict] | None = None) -> list[str]:
    """收款格子：每一格这次有没有被 AI 引用。一格算「被引用」= 至少一家的多数票引用了本站（过半的有效回答引用，平票不算），
    和 GEO 总页「Query 格子」水表的口径一样。每格写多数票引用了本站的是哪几家；有一家引用到这道题的对应页面，标「含对应页」。"""
    meta = grid_meta() if meta is None else meta
    rs = [r for r in rows if r.get("set") == "grid" and r["question_id"] in meta]
    if not rs:
        return []
    site, page, engines = majority(rs), majority(rs, "page_cited"), engines_in(rs)
    at = {(g["scene"], g["who"], g["ask"]): qid for qid, g in meta.items()}
    asked = {r["question_id"] for r in rs}
    hit = {q for q in asked if any(site.get((e, q)) for e in engines)}
    hit_page = {q for q in asked if any(page.get((e, q)) for e in engines)}

    def cell(qid: str | None) -> str:
        if qid is None:
            return "（没有这格）"
        if qid not in asked:
            return "没问"
        if not any((e, qid) in site for e in engines):
            return "没测到"                 # 没有有效回答，或每家都是平票
        cited = [LABEL.get(e, e) for e in engines if site.get((e, qid))]
        return ("、".join(cited) + ("（含对应页）" if qid in hit_page else "")) if cited else "–"

    out = ["## 收款格子：哪几格被 AI 引用", "",
           f"格子 {len(meta)} 个，这次问到 {len(asked)} 个；被 AI 引用的格子 {len(hit)} 个（至少一家多数票引用本站），"
           f"其中引用到对应页面的 {len(hit_page)} 个。每格写的是多数票引用了本站的几家，「–」是都没引用，"
           "「没测到」是没有有效回答或平票。有答案的格子（站上有一段直接回答）不在面板里量，见 GEO 总页「Query 格子」。", "",
           "| 场景 × 人群 | " + " | ".join(GRID_AXES["ask"]) + " |", "|---|" + "---|" * len(GRID_AXES["ask"])]
    for scene in GRID_AXES["scene"]:
        for who in GRID_AXES["who"]:
            out.append(f"| {scene} × {who} | " + " | ".join(cell(at.get((scene, who, ask))) for ask in GRID_AXES["ask"]) + " |")
    return out + [""]


def summary(result: dict, prev: list[dict] | None = None, prev_day: str = "", prev_lineage: dict | None = None) -> str:
    rows, day = result["rows"], result["date"]
    base_path = PANEL / BASELINE
    base = load_rows(base_path) if base_path.exists() else None
    plan = "、".join(f"{LABEL.get(e, e)} {n} 次" for e, n in result["engines"].items())
    sets = [s for s in SETS if any(r["set"] == s for r in rows)]
    out = [f"# GEO 引用面板 {day}（{OWN}）", "",
           f"{'、'.join(SET_ZH[s] + ' ' + str(len({r['question_id'] for r in rows if r['set'] == s})) + ' 题' for s in sets)}。"
           f"每题问：{plan}。共 {len(rows)} 个回答，花费 ${result['cost_usd']:.2f}。", ""]
    if result.get("incomplete"):
        out += ["**这次不完整**：有的 AI 有效回答不到应有的一半，下面的数只能当参考。", ""]
    out += [f"每格是「命中的回答数/有效回答数（命中率，区间）」。区间是按题算的 95% 区间：同一题的几个回答几乎一样，"
            f"有效样本是题数，不是回答数，所以按题重抽 {BOOT:,} 次（随机种子固定，同一份结果重算不变）。"
            "全都没命中（或全都命中）的格重抽给不出宽度，改用按题数算的精确界（约 3.7/题数）。", "",
            "怎么算数：单家的变化要和比较对象的区间不重叠，大约差 10–15 个百分点以上才算数，区间重叠的只当噪声。"
            "「排第一」只做参考，不进结论（同一题每次回答的排序都在变）。", "",
            "怎么问的：" + surface_line(result, engines_in(rows)) + "。走 API 的，和用户在网页上看到的可能不一样。", ""]
    lin = result.get("lineage")
    if lin:
        out += ["运行配置：" + "、".join(f"{SET_ZH.get(k, k)} {v}" for k, v in lin["questions"].items())
                + f"，事实清单 {lin['signature_facts'] or '无'}"
                + (f"，说错清单 {lin['stale_facts'] or '无'}" if "stale_facts" in lin else "")
                + f"，脚本 {lin['runner']}，backlink-guard {lin['backlink_guard'] or '未知'}。", ""]
    for s in sets:
        ids = {r["question_id"] for r in rows if r["set"] == s}
        out += [f"## {SET_ZH[s]}", ""] + engine_table(rows, base if s == "frozen" else None, ids, result) + [""]
        if s == "frozen" and base:
            out += ["基线是 2026-11-17 那次，每题每家只问了 1 次，Google AI Mode 当时没测。", ""]
        if s == "grid":
            out += grid_section(rows)
    brand = {r["question_id"] for r in rows if r["kind"] == "brand"}
    if brand and len(brand) < len({r["question_id"] for r in rows}):
        others = {r["question_id"] for r in rows} - brand
        out += ["## 带品牌名的题和不带的分开看", "", "| AI | 带品牌名：引用本站 | 不带品牌名：引用本站 |", "|---|---|---|"]
        out += [f"| {LABEL.get(e, e)} | {pct_ci(rows, e, 'site_cited', brand)} | {pct_ci(rows, e, 'site_cited', others)} |"
                for e in engines_in(rows)] + ["", "带品牌名的题本来就容易被引用，真正要看的是右边一列。", ""]
    exps = json.loads(EXPERIMENTS.read_text(encoding="utf-8")) if EXPERIMENTS.exists() else {}
    present = {r["question_id"] for r in rows}
    for exp in exps.get("experiments", []):
        exp_base = PANEL / exp["baseline"]
        if exp["started"] > day or not exp_base.exists() or not present & set(exp["treated"] + exp["control"]):
            continue                    # 这次没问到实验里的题（比如只跑了真实问法组），这一段不出
        others = [o for o in exps["experiments"] if o is not exp]
        out += experiment_section(rows, load_rows(exp_base), exp, others)
    out += absorbed_section(rows)
    out += stale_section(rows)
    if prev is not None:
        notes = lineage_diff(lin, prev_lineage)
        if notes:
            out += [f"## 和上次（{prev_day}）的运行配置不一样", ""] + [f"- {n}" for n in notes] + [""]
        out += compare_section(rows, prev, prev_day)
    bad = [(LABEL.get(e, e), t["refused"], t["empty"]) for e, t in tally(rows).items() if t["refused"] or t["empty"]]
    if bad:
        out += ["## 没答出来的", ""] + [f"- {name}：安全过滤拒答 {refused} 个，空回答 {empty} 个" for name, refused, empty in bad] + [""]
    ai = result.get("ai_referrals")
    if ai:
        out += ["## 真实结果：GA4 里来自 AI 的访问（近 7 天）", "",
                f"共 {ai['total']} 次会话：" + ("、".join(f"{s} {n}" for s, n in ai["sources"]) or "没有"), ""]
        if ai["pages"]:
            out += ["落在：" + "、".join(f"{p} {n}" for p, n in ai["pages"][:5]), ""]
    recent = [ev for ev in exps.get("events", []) if ev["date"] <= day][-5:]
    if recent:
        out += ["## 这段时间站上改过什么", ""] + [f"- {ev['date']}：{ev['note']}" for ev in recent] + [""]
    return "\n".join(out)


def wrong_appendix(answers: list[dict], qs: dict[str, dict] | None = None, stale: list[dict] | None = None) -> list[str]:
    """只进邮件：「AI 说错的事」每件事的原文片段（每件最多 2 段），和这些回答引用的别的网站、页面
    （错是从哪来的）。和摘要一样只看有效回答。没有命中就是空的。"""
    stale = load_stale() if stale is None else stale
    kinds = {f["id"]: f.get("kind") for f in stale}
    by: dict[str, list[tuple[dict, str]]] = {}
    for a in answers:
        if status_of(a.get("text"), a.get("cited") or []) != "answered":
            continue
        for fid, said in wrong_hits(a.get("text"), (qs or {}).get(a.get("question_id")), stale):
            by.setdefault(fid, []).append((a, said))
    if not by:
        return []
    out = ["", "**AI 说错的地方：原文片段，和这些回答引用的别的网站**（对应摘要「AI 说错的事」；原文来自付费接口）", ""]
    for fid, hits_ in sorted(by.items(), key=lambda kv: (-len(kv[1]), kv[0])):
        out.append(f"- `{fid}`（{WRONG_ZH.get(kinds.get(fid), '–')}，{len(hits_)} 个回答）")
        ordered = sorted(range(len(hits_)), key=lambda i: (hits_[i][0].get("engine") or "", hits_[i][0].get("question_id") or ""))
        picked = []                                     # 先每家挑一段，不够 2 段再补同一家的
        for i in ordered:
            if len(picked) < 2 and all(hits_[j][0].get("engine") != hits_[i][0].get("engine") for j in picked):
                picked.append(i)
        picked += [i for i in ordered if i not in picked][:2 - len(picked)]
        for i in picked:
            a, said = hits_[i]
            out.append(f"  - {LABEL.get(a.get('engine'), a.get('engine'))} · {a.get('question_id', '?')}：`…{said.replace('`', ' ')}…`")
        sites, pages = Counter(), Counter()
        for a, _ in hits_:
            cited = [p for p in a.get("cited") or [] if p.get("site") and p["site"] not in (OWN, *OWN_ALIASES)]
            sites.update({p["site"] for p in cited})
            pages.update({norm_url(p["url"]) for p in cited if p.get("url")})
        out.append("  - 这些回答引用的别的网站：" + ("、".join(f"{s}（{n}）" for s, n in sites.most_common(6)) or "没有"))
        if pages:
            out.append("  - 引用最多的别的页面：" + "、".join(f"{u}（{n}）" for u, n in pages.most_common(3)))
    return out


def appendix(answers: list[dict], qs: dict[str, dict] | None = None) -> str:
    """只进邮件和加密存档的部分：AI 引用最多的网站和页面、它们搜了什么；AI 说错的原文片段和它们引用的别的网站。
    qs（题 id → 题）给了才看只限某类题的说错（比如 Fable 只看提示词库的题）。"""
    sites, pages, searches = Counter(), Counter(), Counter()
    for a in answers:
        for site in {p.get("site") for p in a.get("cited") or [] if p.get("site")}:
            sites[site] += 1
        for url in {p.get("url") for p in a.get("cited") or [] if p.get("url")}:
            pages[norm_url(url)] += 1
        for q in {" ".join(s.lower().split()) for s in a.get("fan_out") or []}:
            searches[q] += 1
    out = ["## 只在邮件里看的部分（来自付费接口，不进公开仓库）", "", "**被引用最多的网站**（括号里是引用它的回答数）", ""]
    out += [f"- {s}（{n}）" + ("  ← 本站" if s == OWN else "") for s, n in sites.most_common(20)]
    out += ["", "**被引用最多的页面**", ""] + [f"- {u}（{n}）" for u, n in pages.most_common(20)]
    out += ["", "**它们搜了什么**（能看到搜索词的只有 ChatGPT、Perplexity、Claude）", ""] + [f"- {q}（{n}）" for q, n in searches.most_common(25)]
    out += wrong_appendix(answers, qs)
    return "\n".join(out) + "\n"


# ───────────── 命令 ─────────────

def cmd_run(a) -> int:
    try:
        from backlink_guard import asked as bg
    except ImportError:
        raise SystemExit('没装 backlink-guard：pip install "backlink-guard>=0.12"')
    day = a.date or datetime.now(CST).strftime("%Y-%m-%d")
    qs = load_questions(a.sets.split(","))
    if a.limit:
        qs = qs[:a.limit]
    plan = parse_engines(a.engines)
    unknown = [e for e in plan if e not in bg.ENGINES]
    if unknown:
        raise SystemExit(f"backlink-guard 不认识这些引擎：{unknown}")
    by_text = {q["question"]: q for q in qs}
    spent, answers, errors, left_out = 0, [], [], []
    for n in sorted(set(plan.values()), reverse=True):          # 问的次数相同的几家一起问
        engines = [e for e, k in plan.items() if k == n]
        cap = a.max_usd - spent / 1e6
        if cap <= 0:
            left_out += [f"{e}（预算用完，没问）" for e in engines]
            continue
        res = bg.asked(OWN, [q["question"] for q in qs], names=NAMES, engines=engines, samples=n, max_usd=cap, fresh=True)
        spent += res["cost"]
        answers += res["answers"]
        errors += res["errors"]
        left_out += res["left_out"]
    answers = [x | {"question_id": by_text[x["question"]]["id"]} for x in answers if x["question"] in by_text]
    rows = [score_row(x, by_text[x["question"]]) for x in answers]
    result = {"date": day, "site": OWN, "sets": a.sets.split(","), "engines": plan, "questions": len(qs),
              "cost_usd": round(spent / 1e6, 4), "errors": len(errors), "left_out": len(left_out), "rows": rows,
              "lineage": lineage(a.sets.split(","), plan, bg.ENGINES, a.max_usd, a.limit)}
    done = tally(rows)
    result["incomplete"] = any(done.get(e, {}).get("valid", 0) * 2 < len(qs) * n for e, n in plan.items())
    if a.ga and Path(a.ga).exists():
        result["ai_referrals"] = ai_referrals(json.loads(Path(a.ga).read_text(encoding="utf-8")))
    text = summary(result, *previous_run(day))
    if not a.dry:
        PANEL.mkdir(exist_ok=True)
        (PANEL / f"results-{day}.json").write_text(json.dumps(result, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
        (PANEL / f"summary-{day}.md").write_text(text + "\n", encoding="utf-8")
    if a.full:
        Path(a.full).write_text(json.dumps({"result": result, "errors": errors, "left_out": left_out, "answers": answers},
                                           ensure_ascii=False), encoding="utf-8")
    if a.appendix:
        Path(a.appendix).write_text(appendix(answers, {q["id"]: q for q in qs}), encoding="utf-8")
    print(text)
    print(f"\n回答 {len(rows)} 个，接口报错 {len(errors)} 个，预算没问到 {len(left_out)} 个，花费 ${spent / 1e6:.2f}", file=sys.stderr)
    return 2 if result["incomplete"] else 0


def cmd_summary(a) -> int:
    path = Path(a.results)
    result = json.loads(path.read_text(encoding="utf-8"))
    print(summary(result, *previous_run(result["date"])))
    return 0


def cmd_mail(a) -> int:
    """摘要（加上只进邮件的那部分）用 Resend 发出去。"""
    key = os.environ.get("RESEND_API_KEY", "").strip()
    if not key:
        raise SystemExit("RESEND_API_KEY 没配")
    md = Path(a.summary).read_text(encoding="utf-8")
    if a.appendix and Path(a.appendix).exists():
        md += "\n\n" + Path(a.appendix).read_text(encoding="utf-8")
    try:
        import markdown
        html = markdown.markdown(md, extensions=["tables"])
    except ImportError:
        html = "<pre>" + md.replace("&", "&amp;").replace("<", "&lt;") + "</pre>"
    title = md.splitlines()[0].lstrip("# ").strip()
    body = {"from": a.sender, "to": [a.to], "subject": a.subject or title,
            "html": f'<div style="font-family:-apple-system,Segoe UI,sans-serif;font-size:14px;line-height:1.6">{html}</div>'}
    req = urllib.request.Request("https://api.resend.com/emails", data=json.dumps(body).encode(), method="POST",
                                 headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json",
                                          "User-Agent": "jasonzhu-geo-panel/1.0"})
    with urllib.request.urlopen(req, timeout=30) as res:
        print("邮件已发：", json.load(res).get("id"))
    return 0


# ───────────── 自测 ─────────────

def selftest() -> int:
    page = lambda url, site=None: {"url": url, "site": site or urllib.parse.urlparse(url).netloc.removeprefix("www."), "title": "t"}
    q = {"id": "data-x", "set": "frozen", "kind": "data_asset", "question": "what is x?", "target_url": "https://jasonzhu.ai/en/blog/x"}
    long = "an answer " * 40
    exact = score_row({"engine": "chatgpt", "sample": 0, "text": long, "cited_you": True, "named_you": "domain", "read_you": True,
                       "cited": [page("https://jasonzhu.ai/en/blog/x?utm_source=chatgpt.com"), page("https://other.example/a")]}, q)
    assert exact["status"] == "answered" and exact["site_cited"] and exact["page_cited"] and exact["first_pick"] and exact["named"]
    assert exact["our_urls"] == ["jasonzhu.ai/en/blog/x"] and exact["cited_count"] == 2          # 别人的网址不留
    twin = score_row({"engine": "perplexity", "sample": 1, "text": long, "cited_you": True, "named_you": "",
                      "cited": [page("https://other.example/a"), page("https://www.jasonzhu.ai/zh/blog/x/")]}, q)
    assert twin["site_cited"] and not twin["page_cited"] and twin["page_cited_any_lang"] and not twin["first_pick"]
    other = score_row({"engine": "perplexity", "sample": 0, "text": long, "cited_you": True, "named_you": "name",
                       "cited": [page("https://jasonzhu.ai/en")]}, q)
    assert other["site_cited"] and not other["page_cited"] and not other["page_cited_any_lang"] and other["named"]
    refused = score_row({"engine": "gemini_app", "sample": 0, "cited": [], "cited_you": False, "named_you": "",
                         "text": "I want to help as much as I can, but my safety filters kicked in."}, q)
    empty = score_row({"engine": "gemini_app", "sample": 1, "cited": [], "cited_you": False, "named_you": "", "text": "Sure."}, q)
    plain = score_row({"engine": "gemini_app", "sample": 2, "cited": [], "cited_you": False, "named_you": "", "text": long}, q)
    assert (refused["status"], empty["status"], plain["status"]) == ("refused", "empty", "answered")
    assert any_lang("jasonzhu.ai/en") == "jasonzhu.ai" and any_lang("jasonzhu.ai/english/x") == "jasonzhu.ai/english/x"
    rows = [exact, twin, other, refused, empty, plain]
    t = tally(rows)
    assert list(t) == ["chatgpt", "gemini_app", "perplexity"]
    assert (t["gemini_app"]["answers"], t["gemini_app"]["valid"], t["gemini_app"]["refused"], t["gemini_app"]["empty"]) == (3, 1, 1, 1)
    assert t["perplexity"]["site_cited"] == {"answers": 2, "questions": 1} and t["perplexity"]["page_cited"]["answers"] == 0
    assert rate(rows, "gemini_app", "site_cited") == (0, 1) and rate(rows, "chatgpt", "site_cited", {"nope"}) == (0, 0)
    assert hits(rows) == {("chatgpt", "data-x"), ("perplexity", "data-x")} and pct(1, 3) == "1/3（33%）" and pct(0, 0) == "–"
    assert parse_engines("chatgpt:3, claude") == {"chatgpt": 3, "claude": 1}
    # 对照实验：处理组 1/2 → 2/2（+50 点），对照组 1/2 → 1/2（0），净变化 +50 点
    mk = lambda qid, hit: {"engine": "chatgpt", "question_id": qid, "status": "answered", "site_cited": hit}
    base = [mk("t1", True), mk("t2", False), mk("c1", True), mk("c2", False)]
    now = [mk("t1", True), mk("t2", True), mk("c1", False), mk("c2", True)]
    row = experiment_table(now, base, {"treated": ["t1", "t2"], "control": ["c1", "c2"]})[0]
    assert row["treated_now"] == (2, 2) and row["control_base"] == (1, 2) and abs(row["net"] - 0.5) < 1e-9
    assert experiment_table(now, [mk("t1", True)], {"treated": ["t1", "t2"], "control": ["c1", "c2"]})[0]["net"] is None
    # 净变化只算两期都有回答的题、每题同权（2026-11-26 起，和 mde 同口径）：t1 这期问了 3 次，按回答合并时它占 3/4，
    # 每题同权时只占一半；t3 只有这一期有回答，不算
    now2 = [mk("t1", True)] * 3 + [mk("t2", False), mk("t3", True), mk("c1", True), mk("c2", False)]
    base2 = [mk("t1", False), mk("t2", False), mk("c1", True), mk("c2", False)]
    n2 = experiment_table(now2, base2, {"treated": ["t1", "t2", "t3"], "control": ["c1", "c2"]})[0]["net"]
    assert abs(n2 - 0.5) < 1e-9, n2        # 处理组每题变化 (+1, 0) 平均 +0.5，对照组 0；以前按回答合并、连 t3 一起算是 4/5 − 0/2 = 0.8
    # 按题算的区间：一题 3 次全中、一题 3 次全不中，重抽只会得到 0、50%、100%，区间就是 0–100%
    two = [mk("q1", True)] * 3 + [mk("q2", False)] * 3
    assert per_question(two, "chatgpt", "site_cited") == {"q1": (3, 3), "q2": (0, 3)}
    assert cluster_ci(two, "chatgpt", "site_cited") == (0.0, 1.0) and pct_ci(two, "chatgpt", "site_cited") == "3/6（50%，区间 0–100%）"
    assert cluster_ci([], "chatgpt", "site_cited") is None and pct_ci([], "chatgpt", "site_cited") == "–"
    # 20 题里 5 题命中：区间包住 25%，重算不变，回答的先后顺序也不影响（题按 id 排好再抽）
    mixed = [mk(f"q{i:02d}", i % 4 == 0) for i in range(20) for _ in range(3)]
    ci = cluster_ci(mixed, "chatgpt", "site_cited")
    assert 0.0 < ci[0] < 0.25 < ci[1] < 0.6 and ci == cluster_ci(list(reversed(mixed)), "chatgpt", "site_cited")
    # 全都没命中、全都命中：精确界，17 题全没中上限约 19.5%，4 题全中下限约 40%
    zero = [mk(f"z{i:02d}", False) for i in range(17) for _ in range(3)]
    assert cluster_ci(zero, "chatgpt", "site_cited") == (0.0, 1 - 0.025 ** (1 / 17)) and pct_ci(zero, "chatgpt", "site_cited") == "0/51（0%，区间 0–20%）"
    assert pct_ci([mk(f"f{i}", True) for i in range(4)], "chatgpt", "site_cited") == "4/4（100%，区间 39–100%）"
    assert overlap((0.1, 0.3), (0.3, 0.5)) and not overlap((0.1, 0.29), (0.3, 0.5))
    # 和上次比：12 题从全不中变成全中，区间不重叠才算数；同一份数据比自己，区间重叠，不算数
    before = [mk(f"w{i:02d}", False) for i in range(12) for _ in range(3)]
    after = [mk(f"w{i:02d}", True) for i in range(12) for _ in range(3)]
    flipped12 = compare_section(after, before, "x")
    assert "| ChatGPT | 12 | 36/36（100%，区间 73–100%） | 0/36（0%，区间 0–27%） | 区间不重叠，算数 | 12/12（100.0%，区间 73.5–100.0%） |" in flipped12
    assert any(s.startswith("每周翻转率，几家合在一起：12/12（100.0%，区间 73.5–100.0%）。") for s in flipped12)
    same = "\n".join(compare_section(mixed, mixed, "x"))
    assert "区间重叠，不算数" in same and "| 0/20（0.0%，区间 0.0–16.8%） |" in same       # 同一份数据比自己，一题都没翻
    # Clopper–Pearson：20 个里 0 个，上限就是 1 − 0.025^(1/20)，约 16.8%；82 个里 8 个约 4.3%–18.3%
    # （对照值用分数精确算、二分 60 次得到）；k 个和 n − k 个的区间互为镜像；全中时下限 0.025^(1/n)；n 大了也不溢出
    assert clopper_pearson(0, 20)[0] == 0.0 and abs(clopper_pearson(0, 20)[1] - (1 - 0.025 ** (1 / 20))) < 1e-12
    lo, hi = clopper_pearson(8, 82)
    assert abs(lo - 0.0430688434401038) < 1e-9 and abs(hi - 0.1832139383994276) < 1e-9
    assert flip_cell(8, 82) == "8/82（9.8%，区间 4.3–18.3%）" and flip_cell(0, 0) == "–" and clopper_pearson(0, 0) is None
    a, b = clopper_pearson(3, 20), clopper_pearson(17, 20)
    assert abs(a[0] - (1 - b[1])) < 1e-12 and abs(a[1] - (1 - b[0])) < 1e-12
    assert clopper_pearson(12, 12)[1] == 1.0 and abs(clopper_pearson(12, 12)[0] - 0.025 ** (1 / 12)) < 1e-12
    lo, hi = clopper_pearson(150, 1500)
    assert 0.08 < lo < 0.1 < hi < 0.12
    # 多数票：3 次里 2 次中算中；2 个有效回答 1 中 1 不中是平票，不算；拒答不算有效回答，剩下的 1 个说了算
    px = lambda r: r | {"engine": "perplexity"}
    prev_m = [mk("m1", True)] * 2 + [mk("m1", False), mk("m2", True), mk("m2", False)] + [mk("m3", True)] * 3 + [mk("m4", False), px(mk("m1", False))]
    now_m = [mk("m1", False)] * 3 + [mk("m2", True)] * 3 + [mk("m3", True)] * 2 + [mk("m3", False), mk("m4", True),
                                                                                   mk("m4", False) | {"status": "refused"}, px(mk("m1", False))]
    assert majority(prev_m) == {("chatgpt", "m1"): True, ("chatgpt", "m3"): True, ("chatgpt", "m4"): False, ("perplexity", "m1"): False}
    assert flips(now_m, prev_m) == {"chatgpt": (2, 3), "perplexity": (0, 1)}            # m1、m4 翻了，m2 平票不算，m3 没翻
    text_m = "\n".join(compare_section(now_m, prev_m, "x"))
    assert f"| 区间重叠，不算数 | {flip_cell(2, 3)} |" in text_m and f"每周翻转率，几家合在一起：{flip_cell(2, 4)}。" in text_m
    # 置换检验：处理组 6 题全从不引用变成引用、对照组 6 题不动 → 一样极端的分法只有 2/924，p 很小，重算不变；
    # 两组一起变，净变化 0，p = 1；没有基线就没有 p
    exp6 = {"note": "测试", "started": "2026-11-17", "treated": [f"t{i}" for i in range(6)], "control": [f"c{i}" for i in range(6)]}
    base6 = [mk(x, False) for x in exp6["treated"] + exp6["control"]]
    up6 = [mk(x, x.startswith("t")) for x in exp6["treated"] + exp6["control"]]
    p6 = perm_test(up6, base6, exp6, "chatgpt")
    assert p6 < 0.01 and p6 == perm_test(up6, base6, exp6, "chatgpt")
    assert perm_test([mk(x, True) for x in exp6["treated"] + exp6["control"]], base6, exp6, "chatgpt") == 1.0
    assert perm_test(up6, [], exp6, "chatgpt") is None and fmt_p(None) == "–" and fmt_p(0.4949) == "0.49" and fmt_p(0.0024) == "0.002"
    # 以现在的题数要差多少才测得出来（MDE）。退路（按 FLIP 假设）：处理 10 题、对照 6 题，约 32–56 个百分点
    assert detectable(10, 6) == (32, 56) and detectable(6, 6) == (36, 63) and detectable(0, 6) is None
    assert abs(mde(0.15, 10, 6) - 56) < 1e-9 and mde(0.1, 0, 6) is None
    assert mde_cell(None) == "–" and mde_cell({"mde": 118.8}) == "约 119 个百分点，基本测不出来"
    assert mde_cell({"assumed": (32, 56)}) == "约 32–56 个百分点（假设）" and mde_cell({"assumed": (69, 119)}) == "至少约 69 个百分点，基本测不出来（假设）"
    # 实测：处理组 6 题、对照组 6 题，另有 4 题没分组，基线每题 1 次、全不中，这次每题 3 次。
    # 不在处理组的 10 题里，ChatGPT 的 c0 从 0 变成 3/3（差的平方 1），x0 从 0 变成 1/3（1/9），其余没变：v = (1 + 1/9)/10 = 1/9，
    # MDE = 2.8 × √(v/6 + v/6) × 100 ≈ 54；Perplexity 的 c0、c1 翻了：v = 2/10，MDE ≈ 72。合在一起 (10/9 + 2)/20 ≈ 0.16
    xs = [f"x{i}" for i in range(4)]
    base10 = base6 + [mk(x, False) for x in xs]
    base10 += [px(r) for r in base10]
    now10 = ([mk(x, True) for x in exp6["treated"] for _ in range(3)] + [mk(x, x == "c0") for x in exp6["control"] for _ in range(3)]
             + [mk(x, x == "x0" and s == 0) for x in xs for s in range(3)])
    now10 += ([px(mk(x, True)) for x in exp6["treated"] for _ in range(3)] + [px(mk(x, x in ("c0", "c1"))) for x in exp6["control"] for _ in range(3)]
              + [px(mk(x, False)) for x in xs for _ in range(3)])
    v, k = measured_noise(now10, base10, exp6, "chatgpt")
    assert k == 10 and abs(v - 1 / 9) < 1e-12 and (v, k) == measured_noise(list(reversed(now10)), list(reversed(base10)), exp6, "chatgpt")
    assert measured_noise(now10, base10, exp6, "perplexity") == (0.2, 10) and measured_noise(now10, [], exp6, "chatgpt") is None
    got = engine_mde(now10, base10, exp6, "chatgpt")
    assert (got["nt"], got["nc"], got["k"]) == (6, 6, 10) and abs(got["mde"] - 2.8 * math.sqrt(2 / 54) * 100) < 1e-9 and "assumed" not in got
    sec = "\n".join(experiment_section(now10, base10, exp6))
    assert re.search(r"^\| ChatGPT \| .* \| 约 54 个百分点 \|$", sec, re.M) and re.search(r"^\| Perplexity \| .* \| 约 72 个百分点 \|$", sec, re.M)
    assert "各家：ChatGPT 0.11（10 题）、Perplexity 0.20（10 题）。" in sec and "几家合在一起：v = 0.16（2 家共 20 题）。" in sec
    assert "ChatGPT、Perplexity：处理组 6 题、对照组 6 题" in sec and "比 MDE 小的净变化只是方向，不算结果" in sec
    assert "v 是实测的噪声" in sec and "（假设）" not in sec and "按以前的假设" not in sec
    # 退路一：不在处理组的只有对照组 6 题，不到 8 道，按 FLIP 假设，标「假设」；合在一起也不到 8 道，不给合在一起的 v
    sec = "\n".join(experiment_section(up6, base6, exp6))
    assert "| ChatGPT | 6/6（100%，区间 54–100%） | 0/6（0%，区间 0–46%） | 0/6（0%，区间 0–46%） | 0/6（0%，区间 0–46%） | +100 个百分点 | 0.0" in sec
    assert re.search(r"^\| ChatGPT \| .* \| 约 36–63 个百分点（假设） \|$", sec, re.M) and "打乱 5,000 次" in sec
    assert "ChatGPT 只有 6 道这样的题（不到 8 道），v 测不准，按以前的假设估算：每周有 5%–15% 的题" in sec
    assert "各家：" not in sec and "几家合在一起" not in sec
    # 退路二：10 题都在，但两期一点没变（v = 0），也按假设，不写成「约 0 个百分点」
    still = [r for r in now10 if r["engine"] == "chatgpt" and r["question_id"] not in ("c0", "x0")] + [mk(x, False) for x in ("c0", "x0")]
    assert engine_mde(still, base10, exp6, "chatgpt")["assumed"] == (36, 63)
    sec = "\n".join(experiment_section(still, base10, exp6))
    assert "ChatGPT 的 10 道题两期一点没变（v = 0，测不出波动）" in sec and "约 0 个百分点" not in sec
    few = "\n".join(experiment_section(up6[:5] + up6[6:7], base6[:5] + base6[6:7], exp6))
    assert "至少约 69 个百分点，基本测不出来（假设）" in few and "处理组 5 题、对照组 1 题" in few
    # 几个实验同时跑（2026-11-27）：别的实验的处理组不算进 v；x0 归别的实验处理，剩 9 题，c0 翻了一次：v = 1/9
    assert measured_noise(now10, base10, exp6, "chatgpt", exclude=frozenset({"x0"})) == (1 / 9, 9)
    other = {"treated": ["x0"], "control": []}
    sec = "\n".join(experiment_section(now10, base10, exp6, [other], pages={}))
    assert "跟别的实验串没串" not in sec and "基线里还没有这一列" in sec      # 没有页面名单不出串没串那行；基线一列「引用对应页面」都没有
    ans = lambda qid, urls, page: {"engine": "chatgpt", "question_id": qid, "status": "answered", "site_cited": bool(urls),
                                   "page_cited_any_lang": page, "our_urls": urls}
    pg = {"t0": "jasonzhu.ai/blog/t", "c0": "jasonzhu.ai/blog/c", "x0": "jasonzhu.ai/go-global"}
    ex2 = {"note": "x", "started": "2026-11-01", "treated": ["t0"], "control": ["c0"]}
    now2 = [ans("t0", ["jasonzhu.ai/zh/go-global"], False), ans("t0", ["jasonzhu.ai/en/blog/t"], True), ans("c0", [], False)]
    base2 = [ans("t0", [], False), ans("c0", [], False)]
    sec = "\n".join(experiment_section(now2, base2, ex2, [other], pages=pg))
    assert "处理组 1/2 个有效回答，对照组 0/1 个有效回答" in sec       # 中文版的 /go-global 也算别的实验的页
    assert "只算「引用对应页面」" in sec and re.search(r"^\| ChatGPT \| 1/2", sec, re.M) and "基线里还没有这一列" not in sec
    assert "处理组 0/2" in "\n".join(cross_lines(now2, ex2, [{"treated": ["t0"]}], pg))   # 题目自己的目标页不算串
    old2 = [{k: v for k, v in r.items() if k != "page_cited_any_lang"} | {"page_cited": False} for r in base2]
    sec = "\n".join(page_lines([r | {"page_cited": r["page_cited_any_lang"]} for r in now2], old2, ex2))
    assert "只认同一语言版本，基线只有这一列" in sec and re.search(r"^\| ChatGPT \| 1/2", sec, re.M)   # 旧基线只有 page_cited：两期都用它
    # 每家怎么问的：这次运行记下的优先，旧结果用表
    assert surface_of({}, "perplexity") == ("llm", "sonar")
    assert surface_of({"lineage": {"engines": {"perplexity": {"samples": 3, "model": "sonar-pro", "kind": "llm"}}}}, "perplexity") == ("llm", "sonar-pro")
    assert surface_of({"lineage": {"engines": {"perplexity": {"samples": 3, "model": "x/llm_scraper", "kind": "scraper"}}}}, "perplexity")[0] == "scraper"
    assert surface_line({}, ["chatgpt", "gemini_app", "ai_mode", "perplexity"]) == \
        "ChatGPT、Gemini App 抓网页界面（未登录、美国英文）；Google AI Mode 抓 Google 搜索结果页；Perplexity（sonar）走 API（开联网搜索）"
    # 旧格式的基线能读，而且里面只剩本站网址（PANEL.md：别的网站的网址不进公开仓库）
    old = PANEL / BASELINE
    if old.exists():
        b = load_rows(old)
        assert {r["engine"] for r in b} == {"chatgpt", "gemini_app", "perplexity", "claude"} and all(r["status"] == "answered" for r in b)
        assert rate(b, "perplexity", "site_cited") == (12, 20) and rate(b, "chatgpt", "page_cited") == (1, 20)   # 和 11-17 的摘要一致
        hosts = {urllib.parse.urlparse(u).netloc.lower().removeprefix("www.")
                 for u in re.findall(r"https?://[^\s)\]}\"'<>]+", old.read_text(encoding="utf-8"))}
        assert hosts <= {OWN, *OWN_ALIASES}, f"基线里还有别的网站的网址：{sorted(hosts - {OWN, *OWN_ALIASES})[:5]}"
    assert is_ai("chatgpt.com") and is_ai("perplexity") and not is_ai("google")
    ga = {"ok": True, "srcLanding7": {"rows": [{"sessionSource": "chatgpt.com", "landingPage": "/en", "sessions": 3.0},
                                               {"sessionSource": "google", "landingPage": "/en", "sessions": 9.0}]}}
    assert ai_referrals(ga) == {"total": 3, "sources": [["chatgpt.com", 3]], "pages": [["/en", 3]]} and ai_referrals({"ok": False}) is None
    result = {"date": "2026-11-24", "engines": {"chatgpt": 3}, "cost_usd": 1.0, "rows": rows, "ai_referrals": ai_referrals(ga)}
    text = summary(result, prev=[mk("data-x", False)], prev_day="2026-11-17")
    assert "新出现引用本站的：ChatGPT · data-x" in text and "安全过滤拒答 1 个" in text and "共 3 次会话" in text
    assert "对照实验" not in text                                  # data-x 不在任何实验的分组里
    assert "| ChatGPT | 网页界面 | 1 | 1/1（100%，区间 2–100%） |" in text and "排第一（只做参考）" in text
    assert "怎么问的：ChatGPT、Gemini App 抓网页界面" in text and "区间不重叠，大约差 10–15 个百分点以上才算数" in text
    assert "| ChatGPT | 1 | 1/1（100%，区间 2–100%） | 0/1（0%，区间 0–98%） | 区间重叠，不算数 |" in text
    assert "other.example" not in text and "other.example" not in json.dumps(rows)              # 公开的部分没有别人的网址
    assert "other.example（2）" in appendix([{"cited": [page("https://other.example/a")], "fan_out": ["Best  X"]},
                                           {"cited": [page("https://other.example/b")], "fan_out": ["best x"]}])
    # 吸收：用了我们独有的数字，却没点名也没引用
    facts = [{"id": "fee-waffo-128", "near": ["Waffo"], "re": re.compile(r"\$1\.28", re.I)},
             {"id": "pay-stripe-102590", "near": [], "re": re.compile("102,590")}]
    assert facts_in("Waffo Pancake keeps about $1.28 per $20 order", facts) == ["fee-waffo-128"]
    assert facts_in("a coffee costs $1.28 here", facts) == []                      # 数字对，旁边没有 Waffo
    assert facts_in("Stripe links: 102,590 sites. Waffo $1.28.", facts) == ["fee-waffo-128", "pay-stripe-102590"]
    fee = "Waffo takes $1.28 on a $20 order. " + long
    took = score_row({"engine": "chatgpt", "sample": 0, "text": fee, "cited": [page("https://other.example/a")],
                      "cited_you": False, "named_you": ""}, q, facts)
    credited = score_row({"engine": "perplexity", "sample": 0, "text": fee, "cited": [page("https://jasonzhu.ai/en")],
                          "cited_you": True, "named_you": ""}, q, facts)
    assert took["fact_used"] and took["absorbed"] and took["facts"] == ["fee-waffo-128"]
    assert credited["fact_used"] and not credited["absorbed"]
    assert "Waffo takes" not in json.dumps([took, credited])                       # 回答原文不进结果
    sec = "\n".join(absorbed_section([took, credited]))
    assert "| `fee-waffo-128` | 2 | 1 | ChatGPT |" in sec
    assert absorbed_section([mk("x", True)]) == []                                 # 旧结果不出这一段
    assert "| – | – |" in "\n".join(engine_table([mk("x", True)], None))             # 旧结果两列是 –
    # AI 说错的事：near、unless、unless_answer、target 各管一件事；链接网址里的字不算；原文不进结果和摘要
    st = [{"id": "w-polar", "kind": "wrong", "correct": "1,364", "near": ["Polar"], "unless": ["not to be confused"],
           "re": re.compile(r"(?<![\d$.,])2,400\+?(?![\d%]|,\d)", re.I)},
          {"id": "c-fable", "kind": "confusion", "correct": "Claude", "near": ["Fable"], "unless_answer": ["Claude"], "target": "/prompts",
           "re": re.compile(r"\bXbox\b", re.I)}]
    prompts_q = {"target_url": "https://jasonzhu.ai/en/prompts/claude-opus-5-5"}
    assert wrong_in("Polar tracked 2,400+ new sellers.", None, st) == ["w-polar"]
    assert wrong_in("Polar tracked 1,364 new sellers; credits up to $2,400.", None, st) == []     # 对的数、带 $ 的都不算
    assert wrong_in("A course costs 2,400 dollars.", None, st) == []                              # 附近没有 Polar
    assert wrong_in("[Polar 2,400 sellers](https://x.example/a)", None, st) == ["w-polar"]         # 链接文字算
    assert wrong_in("See https://x.example/polar-2,400-sellers for more.", None, st) == []          # 链接网址不算
    assert wrong_in("Fable is out on Xbox in 2027.", prompts_q, st) == ["c-fable"]
    assert wrong_in("Fable is out on Xbox in 2027.", q, st) == [] and wrong_in("Fable is out on Xbox in 2027.", None, st) == []
    assert wrong_in("Claude Fable 5.5 is a model. The Fable game is on Xbox.", prompts_q, st) == []   # 两种都讲了，不算认错
    assert wrong_hits("Polar tracked 2,400+ new sellers.", None, st)[0][1] == "Polar tracked 2,400+ new sellers."
    said = "Polar tracked 2,400+ new sellers in 2026."
    w1 = score_row({"engine": "chatgpt", "sample": 0, "text": said + long, "cited": [page("https://jasonzhu.ai/en/blog/x"), page("https://other.example/a")],
                    "cited_you": True, "named_you": ""}, q, facts, st)
    w2 = score_row({"engine": "perplexity", "sample": 0, "text": said + long, "cited": [page("https://other.example/b")],
                    "cited_you": False, "named_you": ""}, q, facts, st)
    w3 = score_row({"engine": "perplexity", "sample": 1, "text": long, "cited": [], "cited_you": False, "named_you": ""}, q, facts, st)
    assert (w1["wrong_facts"], w2["wrong_facts"], w3["wrong_facts"]) == (["w-polar"], ["w-polar"], [])
    assert "Polar tracked" not in json.dumps([w1, w2, w3])                         # 回答原文不进结果
    sec = "\n".join(stale_section([w1, w2, w3], st))
    assert "## AI 说错的事" in sec and "3 个有效回答里，2 个说到了" in sec, sec
    assert "| `w-polar` | 说错 | 2 | ChatGPT 1、Perplexity 1 | data-x | 1/2 | jasonzhu.ai/en/blog/x（1） |" in sec, sec
    assert "- `w-polar`：1,364" in sec and "other.example" not in sec and "Polar tracked" not in sec
    assert stale_section([w3], st)[2].startswith("这次 1 个有效回答都没说到") and stale_section([mk("x", True)], st) == []
    mail = "\n".join(wrong_appendix([{"engine": "perplexity", "question_id": "data-x", "text": said + long, "cited": [page("https://other.example/b")]},
                                     {"engine": "chatgpt", "question_id": "data-x", "text": said + long,
                                      "cited": [page("https://jasonzhu.ai/en/blog/x"), page("https://other.example/a")]}], None, st))
    assert "`w-polar`（说错，2 个回答）" in mail and "ChatGPT · data-x：`…Polar tracked 2,400+" in mail and "Perplexity · data-x" in mail, mail
    assert "这些回答引用的别的网站：other.example（2）" in mail and "jasonzhu.ai（" not in mail, mail
    assert wrong_appendix([{"engine": "chatgpt", "question_id": "data-x", "text": long, "cited": []}], None, st) == []
    # stale-facts.json 本身：每条的 examples 里 hit 都要命中、miss 都不能命中；限定 target 的，换成别的题就不命中
    stale = load_stale()
    if STALE.exists():
        assert stale and len({f["id"] for f in stale}) == len(stale), "stale-facts.json 的 id 不能重复"
        for f in stale:
            assert f["kind"] in WRONG_ZH and f.get("correct") and f.get("note") and re.fullmatch(r"\d{4}-\d{2}-\d{2}", f.get("since", "")), f["id"]
            ex = f.get("examples") or {}
            assert ex.get("hit") and ex.get("miss"), f"{f['id']}：examples 要有 hit 和 miss"
            on = {"target_url": f"https://{OWN}/en{f['target']}/x"} if f.get("target") else None
            for s in ex["hit"]:
                assert wrong_in(s, on, [f]) == [f["id"]], (f["id"], "该命中却没命中", s)
                assert not f.get("target") or wrong_in(s, q, [f]) == [], (f["id"], "别的题不该算", s)
            for s in ex["miss"]:
                assert wrong_in(s, on, [f]) == [], (f["id"], "不该命中却命中了", s)
        one = {f["id"]: [f] for f in stale}
        assert wrong_in("Polar had 1,364 new sellers in 2026 up to October 15.", None, one["pay-polar-2400"]) == []
        assert wrong_in("Polar had 2,400+ new sellers in 2026.", None, one["pay-polar-2400"]) == ["pay-polar-2400"]
        assert wrong_in("Jason Zhu runs jasonzhu.ai and writes about AI.", None, one["jason-cannon"]) == []
        assert wrong_in("Jason Zhu, also known as Jason Cannon, runs jasonzhu.ai.", None, one["jason-cannon"]) == ["jason-cannon"]
    # 运行配置：题库、模型、次数变了要说出来
    lin = {"questions": {"frozen": "aaa"}, "signature_facts": "f1", "runner": "r", "backlink_guard": "0.12.0",
           "engines": {"chatgpt": {"samples": 3, "model": "m1"}}}
    assert lineage_diff(lin, lin) == [] and "没有记运行配置" in lineage_diff(lin, None)[0]
    changed = lineage_diff(lin, lin | {"questions": {"frozen": "bbb"}, "signature_facts": "f0",
                                       "engines": {"chatgpt": {"samples": 1, "model": "m0"}}})
    assert len(changed) == 4 and "题库改过" in changed[0]
    text = summary(result | {"lineage": lin}, prev=[mk("data-x", False)], prev_day="2026-11-21", prev_lineage=None)
    assert "运行配置：冻结组 aaa" in text and "和上次（2026-11-21）的运行配置不一样" in text
    assert "说错清单" not in text and "有效回答都没说到 stale-facts.json 记下的错事" in text   # 配置里没有这一项就不写；没人说错也写一句
    # 说错清单：新键 stale_facts，原来的键不变；上次没有这个键（11-26 前）不提，改过了要说
    assert lineage_diff(lin | {"stale_facts": "s1"}, lin) == [] and lineage_diff(lin | {"stale_facts": "s1"}, lin | {"stale_facts": "s1"}) == []
    assert lineage_diff(lin | {"stale_facts": "s1"}, lin | {"stale_facts": "s0"}) == ["说错清单（stale-facts.json）改过：「AI 说错的事」一段和上次不能直接比。"]
    got = lineage(["frozen"], {"chatgpt": 3}, {}, 1.0, 0)
    assert got["stale_facts"] == file_hash(STALE) and {"questions", "signature_facts", "runner", "backlink_guard", "engines", "max_usd", "limit"} <= set(got)
    text = summary(result | {"rows": rows + [w1, w2, w3], "lineage": lin | {"stale_facts": "s1"}})
    assert "事实清单 f1，说错清单 s1，脚本 r" in text and "## AI 说错的事" in text and "Polar tracked" not in text
    # 收款格子：一格算被引用 = 至少一家多数票引用本站。g1 ChatGPT 3 次 2 中、Perplexity 1 次 1 中且是对应页；g2 全没中；
    # g3 一中一不中是平票，没测到；g4 在题库里但这次没问；题库里没有的格写「（没有这格）」
    gm = {"g1": {"scene": "AI 订阅", "who": "大陆个人", "ask": "能不能开户"}, "g2": {"scene": "AI 订阅", "who": "大陆个人", "ask": "到手多少"},
          "g3": {"scene": "实物", "who": "美国 LLC", "ask": "被冻结怎么办"}, "g4": {"scene": "实物", "who": "美国 LLC", "ask": "审核多久"}}
    gr = lambda qid, hit, e="chatgpt", **kw: {"engine": e, "question_id": qid, "set": "grid", "status": "answered",
                                              "site_cited": hit, "page_cited": False} | kw
    grows = ([gr("g1", True)] * 2 + [gr("g1", False), gr("g1", True, "perplexity", page_cited=True)]
             + [gr("g2", False)] * 3 + [gr("g3", True), gr("g3", False)])
    sec = "\n".join(grid_section(grows, gm))
    assert "格子 4 个，这次问到 3 个；被 AI 引用的格子 1 个（至少一家多数票引用本站），其中引用到对应页面的 1 个。" in sec, sec
    assert "| AI 订阅 × 大陆个人 | ChatGPT、Perplexity（含对应页） | – | （没有这格） | （没有这格） |" in sec, sec
    assert "| 实物 × 美国 LLC | （没有这格） | （没有这格） | 没问 | 没测到 |" in sec, sec
    assert grid_section([mk("x", True)], gm) == [] and grid_section(grows, {}) == []          # 没有格子题就不出这一段
    # 收款格子组的题库：36 格各一题，id 和格子对得上，问法来源可查，和别的题组不重复（load_questions 不报错）
    if GRID.exists():
        gq = json.loads(GRID.read_text(encoding="utf-8"))["questions"]
        code = {"scene": dict(zip(GRID_AXES["scene"], ("ai", "course", "goods"))), "who": dict(zip(GRID_AXES["who"], ("cn", "hk", "us"))),
                "ask": dict(zip(GRID_AXES["ask"], ("open", "net", "review", "frozen")))}
        others = {q["id"] for s in ("frozen", "real", "gsc") for q in json.loads(SETS[s].read_text(encoding="utf-8"))["questions"]}
        assert len(gq) == 36 and len({tuple(q["grid"][k] for k in code) for q in gq}) == 36, "收款格子组要 36 格各一题"
        for q in gq:
            g, src = q["grid"], q["phrasing_source"]
            assert all(g[k] in code[k] for k in code) and q["kind"] == "grid", q["id"]
            assert q["id"] == "grid-pay-" + "-".join(code[k][g[k]] for k in code), q["id"]
            assert not q["target_url"] or q["target_url"].startswith(f"https://{OWN}/en/"), q["id"]
            assert not re.search(r"[㐀-鿿]", q["question"]) and OWN.split(".")[0] not in q["question"].lower(), q["id"]
            ref = re.fullmatch(r"fanout:(.+)@\d{4}-\d{2}-\d{2}", src)
            assert src == "drafted" or src.startswith("gsc:") or (src.startswith("set:") and src[4:] in others) \
                or (ref and ref.group(1) in others), (q["id"], src)
        assert [q["id"] for q in load_questions(["grid"])] == [q["id"] for q in gq]
        assert len(load_questions(list(SETS))) == sum(len(json.loads(p.read_text(encoding="utf-8"))["questions"]) for p in SETS.values())
    print("自测通过")
    return 0


def main() -> int:
    if "--selftest" in sys.argv:
        return selftest()
    ap = argparse.ArgumentParser(description="GEO 引用面板")
    sub = ap.add_subparsers(dest="cmd", required=True)
    r = sub.add_parser("run", help="问一遍、打分、写结果")
    r.add_argument("--sets", default="frozen", help="题库，逗号分隔：frozen、real、gsc、grid（默认 frozen）")
    r.add_argument("--engines", default=DEFAULT_ENGINES, help=f"引擎:次数，逗号分隔（默认 {DEFAULT_ENGINES}）")
    r.add_argument("--max-usd", type=float, default=3.0, help="这次最多花多少美元（默认 3）")
    r.add_argument("--limit", type=int, default=0, help="只问前 N 题（试跑用）")
    r.add_argument("--date", default="", help="记在哪一天（默认北京时间今天）")
    r.add_argument("--ga", default="", help="ops/analytics/out/ga.json，有就加上 AI 引荐那一段")
    r.add_argument("--full", default="", help="完整结果（含回答原文）写到这个文件，不进仓库")
    r.add_argument("--appendix", default="", help="只进邮件的那部分写到这个文件")
    r.add_argument("--dry", action="store_true", help="不写 panel/ 下的文件，只打印摘要")
    s = sub.add_parser("summary", help="从一份结果重新出摘要")
    s.add_argument("results")
    m = sub.add_parser("mail", help="把摘要发到邮箱（Resend）")
    m.add_argument("--summary", required=True)
    m.add_argument("--appendix", default="")
    m.add_argument("--to", required=True)
    m.add_argument("--subject", default="")
    m.add_argument("--sender", default="GEO 引用面板 <news@jasonzhu.ai>")
    a = ap.parse_args()
    return {"run": cmd_run, "summary": cmd_summary, "mail": cmd_mail}[a.cmd](a)


if __name__ == "__main__":
    sys.exit(main())
