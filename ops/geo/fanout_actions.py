#!/usr/bin/env python3
"""子查询之后：把这周 AI 搜过的词，变成「改哪页、补哪几个词、去哪几个站」。

fanout.py 回答「AI 搜了什么、我们在 Google 排没排上」。这里接着做三件事，只读面板和 fanout.py 的存档，不另花钱：

  1 页面缺的词：同一道题问几次，整句几乎每次都不一样（两次之间原样相同的只有 7–16%），但 83–86% 的用词是同一批
    「公共词」（至少两个回答都用过的词；2026-11-24 用 11-21、11-23 两次面板和三轮中英文测试算的，见 PANEL.md）。
    把每道题的公共词和这道题 target_url 页面的正文比，列出页面上没有的词。再按 AI 拼搜索词常用的几类词
    （条件、成本、适用对象、年份）看页面缺了哪一类。
  2 代表搜索词：每道题挑一条覆盖公共词最多的真实搜索词，报它的 Google 名次。整句每周会变，但「这道题最典型的
    那条搜索」可以逐周比，比看几百条各不相同的整句稳。
  3 外部网站：AI 搜这些词时 Google 第一页上的网站，按覆盖了几道题排（贪心：每次挑能多盖住最多「我们一条都没排上的题」
    的站）。这是 Rochwerger 讲的 publisher-first：投稿、被收录、请求加链接，先找它们。官方站只能引用，不能投稿，单独标出。
  页面按 demand.json 排先后：Search Console 近 3 个月有展示的页面先改（出海专题只占全站点击约 1.5%，提示词库和学习页更多）。

报告只进邮件（--appendix）：里面有搜索词原文和别的网站的域名，来自付费接口。--public 只写计数，标准输出也只打计数
（公开仓库的 Actions 日志是公开的）。

用法：
  python3 ops/geo/fanout_actions.py --selftest
  python3 ops/geo/fanout_actions.py run --full panel-full.json --archive fanout-full.json --sets frozen,real \\
      --date 2026-11-30 --public ops/geo/panel/actions-2026-11-30.json --appendix actions.md
  python3 ops/geo/fanout_actions.py demand gsc-pages.json     # 用 Search Console 的页面导出更新 demand.json
"""
from __future__ import annotations

import argparse
import html
import json
import re
import sys
import urllib.request
from collections import Counter, defaultdict
from datetime import datetime
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import fanout as fo  # noqa: E402
import panel_run as pr  # noqa: E402

DEMAND = pr.GEO / "demand.json"
MIN_ANSWERS = 2         # 公共词：至少几个回答都用过
SHOWN_WORDS = 8
SHOWN_PAGES = 15
SHOWN_SITES = 15
CLASS_SHARE = 0.4       # 这道题至少这个比例的搜索都带某一类词，页面却一个都没有，才报「缺这一类」
UA = "jasonzhu-geo-panel/1.0 (+https://jasonzhu.ai)"
CJK = re.compile(r"[㐀-鿿]")
TOKEN = re.compile(r"[a-z0-9]+(?:[.+-][a-z0-9]+)*")
STOP = set("a an the of for to in on and or with is are be can do does how what which who where when why my your i we our "
           "it its this that as by from at me you vs via into than then".split())
NOT_ACTIONABLE = {"site", "official", "com", "www", "https", "http", pr.OWN, pr.OWN.split(".")[0]}
CLASSES = {   # AI 拼搜索词最常用、人自己搜几乎不用的几类（fanout_anatomy，2026-11-24）
    "条件（资格、要求、材料、审核）": r"supported|availability|available|eligib\w*|requirements?|required|documents?|\bkyc\b|verif\w*|"
                          r"onboarding|approv\w*|restrict\w*|prohibited|\bein\b|\bitin\b|\bssn\b",
    "成本（费用、价格）": r"fees?\b|pricing|prices?\b|costs?\b|charges?\b|commission|\brates?\b|\bfree\b",
    "适用对象（地区、身份）": r"china|chinese|mainland|non-?us\b|non-?residents?|residents?|foreign|overseas|abroad|international|"
                       r"cross-?border|\buk\b|\bus\b|\busa\b|united states|united kingdom",
    "年份": r"\b20\d\d\b",
}
CLASSES = {k: re.compile(v, re.I) for k, v in CLASSES.items()}
PLATFORMS = {"reddit.com", "youtube.com", "medium.com", "dev.to", "github.com", "linkedin.com", "quora.com", "x.com",
             "twitter.com", "substack.com", "producthunt.com", "indiehackers.com", "news.ycombinator.com", "hashnode.com",
             "stackoverflow.com", "huggingface.co", "facebook.com", "tiktok.com", "zhihu.com"}


def words(text: str) -> set[str]:
    return {w for w in TOKEN.findall(str(text).lower()) if w not in STOP}


def singular(w: str) -> str:
    return w[:-1] if len(w) > 3 and w.endswith("s") and not w.endswith("ss") else w


def on_page(w: str, page_words: set[str], page_text: str) -> bool:
    """这个词在页面上有没有：原样、单复数、连字符写成空格（non-US / non US）都算有。"""
    if w in page_words or singular(w) in page_words or singular(w) in {singular(x) for x in page_words if x[:2] == w[:2]}:
        return True
    return any(sep in w for sep in "-.") and w.replace("-", " ").replace(".", " ") in page_text


# ───────────── 每道题：公共词、代表搜索词 ─────────────

def per_question(answers: list[dict]) -> dict[str, list[dict]]:
    out = defaultdict(list)
    for a in answers:
        if a.get("fan_out"):
            out[a["question_id"]].append(a)
    return out


def core_words(answers: list[dict]) -> list[tuple[str, int]]:
    """[(词, 几个回答用过)]：至少 MIN_ANSWERS 个回答都用过的英文词；只有一个回答搜了，就用它的词（标为不稳）。"""
    c = Counter()
    for a in answers:
        c.update(set().union(*(words(q) for q in a["fan_out"] if not CJK.search(str(q)))) if a["fan_out"] else set())
    need = min(MIN_ANSWERS, len(answers)) or 1
    return sorted(((w, n) for w, n in c.items() if n >= need), key=lambda x: (-x[1], x[0]))


def representative(answers: list[dict], core: set[str]) -> str:
    """覆盖公共词最多的那条真实搜索词；一样多取短的。"""
    searches = {fo.norm(q) for a in answers for q in a["fan_out"] if fo.norm(q) and not CJK.search(str(q))}
    return max(sorted(searches), key=lambda q: (len(words(q) & core), -len(q)), default="")


def classes_used(answers: list[dict]) -> list[str]:
    qs = [str(q) for a in answers for q in a["fan_out"] if not CJK.search(str(q))]
    return [k for k, rx in CLASSES.items() if qs and sum(bool(rx.search(q)) for q in qs) / len(qs) >= CLASS_SHARE]


# ───────────── 页面 ─────────────

def fetch_page(url: str) -> str | None:
    """页面正文（小写）：去掉脚本、样式，留标题和 meta description。取不到返回 None。"""
    try:
        req = urllib.request.Request(url, headers={"User-Agent": UA})
        with urllib.request.urlopen(req, timeout=20) as res:
            body = res.read(3_000_000).decode("utf-8", "ignore")
    except Exception:
        return None
    meta = " ".join(re.findall(r'<meta[^>]+name="description"[^>]+content="([^"]*)"', body, re.I))
    body = re.sub(r"(?is)<(script|style|noscript|svg)\b.*?</\1>", " ", body)
    return " ".join(html.unescape(meta + " " + re.sub(r"(?s)<[^>]+>", " ", body)).lower().split())


def norm_url(u: str) -> str:
    return u.split("#")[0].split("?")[0].rstrip("/")


def load_demand(path: Path = DEMAND) -> dict[str, dict]:
    if not path.exists():
        return {}
    return {norm_url(k): v for k, v in json.loads(path.read_text(encoding="utf-8")).get("pages", {}).items()}


# ───────────── 外部网站 ─────────────

def site_labels(site: str) -> list[str]:
    """域名里除了后缀的几段：google.co.uk → [google]，deepmind.google → [deepmind, google]。"""
    parts = site.lower().split(".")
    if len(parts) >= 3 and parts[-2] in {"co", "com", "org", "net", "ac", "gov", "edu"} and len(parts[-1]) == 2:
        parts = parts[:-2]
    elif len(parts) >= 2:
        parts = parts[:-1] if len(parts[-1]) <= 3 or parts[-1] in {"google"} else parts
    return [p for p in parts if p not in {"www", "m", "en", "docs", "help", "support"}]


def site_kind(site: str, question_texts: list[str]) -> str:
    if site in PLATFORMS or any(site.endswith("." + p) for p in PLATFORMS):
        return "平台（可以自己发）"
    joined = " ".join(t.lower().replace(" ", "") for t in question_texts)
    if re.search(r"\.(gov|edu)(\.[a-z]{2})?$|\.gov\.uk$|\.ac\.uk$", site) or any(len(lb) >= 4 and lb in joined for lb in site_labels(site)):
        return OFFICIAL
    return "媒体、博客（投稿、请求收录）"


OFFICIAL = "官方（引用它，不能投稿）"


def coverage(fan: dict, placed: dict, q_of: dict, own: str = pr.OWN, shown: int = SHOWN_SITES) -> tuple[list[dict], list[dict]]:
    """(能投放的站, 官方站)，每项 {site, kind, new, questions, searches, examples}。
    能投放的（平台、媒体、博客）用贪心排：每次挑能多盖住最多「我们一条都没排上的题」的站。官方站只能引用、链接，
    不能投稿，单独按出现在几道题排，不参与贪心（不然它们会占掉前几名）。"""
    gapq, dom_q, dom_s = set(), defaultdict(set), Counter()
    for qid, terms in fan.items():
        read = [t for t in terms if placed.get(t, {}).get("read")]
        if not read:
            continue
        if not any(placed[t]["google"] is not None or placed[t]["bing"] is not None for t in read):
            gapq.add(qid)
        for t in read:
            for site in placed[t]["first_page"]:
                if site and site != own and not site.endswith("." + own):
                    dom_q[site].add(qid)
                    dom_s[site] += 1
    kind = {s: site_kind(s, [q_of[q]["question"] for q in qids if q in q_of]) for s, qids in dom_q.items()}
    officials = sorted((s for s in dom_q if kind[s] == OFFICIAL), key=lambda s: (-len(dom_q[s]), -dom_s[s], s))
    official_rows = [{"site": s, "kind": OFFICIAL, "new": 0, "questions": len(dom_q[s]), "searches": dom_s[s],
                      "examples": sorted(dom_q[s])[:3]} for s in officials[:shown]]
    order, covered, pool = [], set(), {s: q for s, q in dom_q.items() if kind[s] != OFFICIAL}
    while pool and len(order) < shown:
        site = max(sorted(pool), key=lambda s: (len((pool[s] & gapq) - covered), len(pool[s]), dom_s[s]))
        new = (pool[site] & gapq) - covered
        order.append({"site": site, "kind": kind[site], "new": len(new), "questions": len(pool[site]),
                      "searches": dom_s[site], "examples": sorted(new or pool[site])[:3]})
        covered |= new
        del pool[site]
    return order, official_rows


# ───────────── 汇总 ─────────────

def rows_for(qs: list[dict], answers: list[dict], placed: dict, demand: dict, pages: dict[str, str | None]) -> list[dict]:
    """每道不带品牌名的题一行。pages：{target_url: 正文或 None}。"""
    by_q = per_question(answers)
    out = []
    for q in qs:
        if q.get("kind") == "brand":
            continue
        ans = by_q.get(q["id"], [])
        core = core_words(ans)
        core_set = {w for w, _ in core}
        rep = representative(ans, core_set) if ans else ""
        p = placed.get(rep, {})
        rep_pos = p.get("google") if p.get("read") else None
        read = [placed[fo.norm(x)] for a in ans for x in a["fan_out"] if placed.get(fo.norm(x), {}).get("read")]
        best = min((r["google"] for r in read if r["google"] is not None), default=None)
        url = norm_url(q.get("target_url", ""))
        text = pages.get(url)
        if text is None:
            missing, miss_cls = None, None
        else:
            pw = words(text)
            year_now = str(datetime.now().year)
            missing = [w for w, _ in core if w not in NOT_ACTIONABLE and not (re.fullmatch(r"20\d\d", w) and w != year_now)
                       and not on_page(w, pw, text)]
            miss_cls = [k for k in classes_used(ans) if not CLASSES[k].search(text)]
        out.append({"question_id": q["id"], "set": q.get("set", ""), "target_url": url,
                    "impressions": (demand.get(url) or {}).get("impressions", 0),
                    "answers": len(ans), "core": core, "representative": rep,
                    "rep_checked": bool(p.get("read")), "rep_google": rep_pos, "best_google": best, "read": len(read),
                    "missing": missing, "missing_classes": miss_cls, "single": len(ans) == 1})
    return out


def pos(p) -> str:
    return "—" if p is None else str(p)


def report(day: str, rows: list[dict], sites: list[dict], ranks_ok: bool, officials: list[dict] | None = None,
           read: tuple[int, int] = (0, 0)) -> str:
    out = [f"## 子查询之后：改哪页、补哪些词、去哪些站（{day}）", "",
           "公共词 = 同一道题至少两个回答都用过的词；整句每次都变，这批词基本不变。页面按 Search Console 近 3 个月的展示次数排，"
           "有人搜的先改。代表搜索词 = 这道题覆盖公共词最多的那条真实搜索词。", ""]
    n_read, n_all = read
    if not ranks_ok:
        out += ["这次没有可用的 Google 排名（子查询没跑，或自检没过），名次一栏是「—」，只看页面缺的词。", ""]
    elif n_all and n_read / n_all < 0.5:
        out += [f"Google 第一页只读到 {n_read}/{n_all} 条搜索：名次和第 2 节只供参考。", ""]
    elif n_all:
        out += [f"Google 第一页读到 {n_read}/{n_all} 条搜索。", ""]
    by_page = defaultdict(list)
    for r in rows:
        if r["answers"]:
            by_page[r["target_url"]].append(r)
    order = sorted(by_page.items(), key=lambda kv: (-max(r["impressions"] for r in kv[1]),
                                                   -sum(len(r["missing"] or []) for r in kv[1]), kv[0]))
    out += ["### 1 先改哪些页、补哪些词", "",
            "缺的词先判断再补：有的是 AI 理解偏了（问 fable 5.5，AI 去搜 Xbox 上的游戏《Fable》），那就该在页面上写清楚"
            "「不是那个」，而不是把词补进去；竞品名是 AI 拿来对比的那一圈，页面上写到它们才进得了对比类的搜索。", "",
            "| 页面 | 近 3 个月展示 | 题 · 代表搜索词（Google 名次） | 页面上没有的公共词 | 缺的类别 |", "|---|---|---|---|---|"]
    for url, rs in order[:SHOWN_PAGES]:
        qcell = "；".join(f"{r['question_id']} · {r['representative'] or '—'}（{pos(r['rep_google'])}）"
                         + ("（只有 1 个回答搜了，词不稳）" if r["single"] else "") for r in rs)
        miss = Counter(w for r in rs for w in (r["missing"] or []))
        mcell = "页面打不开" if all(r["missing"] is None for r in rs) else ("、".join(w for w, _ in miss.most_common(SHOWN_WORDS)) or "都有")
        ccell = "、".join(sorted({c for r in rs for c in (r["missing_classes"] or [])})) or "—"
        out.append(f"| {url.removeprefix('https://')} | {rs[0]['impressions']} | {qcell} | {mcell} | {ccell} |")
    out += ["", "### 2 外部网站：AI 搜这些词时常在 Google 第一页，按能补上几道「我们一条都没排上」的题排", ""]
    if sites:
        out += ["能投放的（平台自己发；媒体、博客投稿或请求收录）：", "",
                "| 网站 | 类型 | 新补上几道题 | 一共出现在几道题 | 几条搜索的第一页 | 例题 |", "|---|---|---|---|---|---|"]
        out += [f"| {s['site']} | {s['kind']} | {s['new']} | {s['questions']} | {s['searches']} | {'、'.join(s['examples'])} |"
                for s in sites]
    elif ranks_ok:
        out.append("第一页上没有能投放的网站（都是官方站或本站）。")
    else:
        out.append("没有：这次没有查到 Google 第一页（子查询没跑或自检没过）。")
    if officials:
        out += ["", "官方站（只能在页面里引用、链接，不能投稿）：" + "、".join(f"{s['site']}（{s['questions']} 题）" for s in officials)]
    return "\n".join(out) + "\n"


def public_counts(day: str, rows: list[dict], sites: list[dict]) -> dict:
    """只有计数，不含搜索词、不含别的网站。"""
    return {"date": day, "questions": len(rows), "with_searches": sum(1 for r in rows if r["answers"]),
            "pages_checked": sum(1 for r in rows if r["missing"] is not None),
            "rows": [{"question_id": r["question_id"], "target_url": r["target_url"], "impressions": r["impressions"],
                      "core_words": len(r["core"]), "missing_words": None if r["missing"] is None else len(r["missing"]),
                      "missing_classes": None if r["missing_classes"] is None else len(r["missing_classes"]),
                      "representative_google": r["rep_google"], "representative_checked": r["rep_checked"],
                      "best_google": r["best_google"]} for r in rows],
            "sites_listed": len(sites), "sites_new_questions": sum(s["new"] for s in sites)}


# ───────────── 命令 ─────────────

def cmd_run(a) -> int:
    qs = pr.load_questions(a.sets.split(","))
    if a.limit:
        qs = qs[:a.limit]
    q_of = {q["id"]: q for q in qs}
    answers = []
    if a.full and Path(a.full).exists():
        answers = [x for x in json.loads(Path(a.full).read_text(encoding="utf-8")).get("answers") or [] if x.get("question_id") in q_of]
    ranks, ranks_ok = {"searches": []}, False
    if a.archive and Path(a.archive).exists():
        arch = json.loads(Path(a.archive).read_text(encoding="utf-8"))
        answers += [x for x in arch.get("gemini_answers") or [] if x.get("question_id") in q_of]
        ranks = arch.get("ranks") or ranks
        ranks_ok = any(fo.readable(r.get("google") or {}) for r in ranks.get("searches") or [])
    placed = fo.placements(ranks)
    targets = sorted({norm_url(q.get("target_url", "")) for q in qs if q.get("target_url") and q.get("kind") != "brand"})
    pages = {u: fetch_page(u) for u in targets}
    rows = rows_for(qs, answers, placed, load_demand(Path(a.demand)), pages)
    fan = {k: v for k, v in fo.by_question(answers).items() if q_of.get(k, {}).get("kind") != "brand"}
    sites, officials = coverage(fan, placed, q_of) if ranks_ok else ([], [])
    all_terms = {t for per in fan.values() for t in per}
    read = (sum(1 for t in all_terms if placed.get(t, {}).get("read")), len(all_terms))
    day = a.date or datetime.now(pr.CST).strftime("%Y-%m-%d")
    text = report(day, rows, sites, ranks_ok, officials, read)
    counts = public_counts(day, rows, sites)
    if not a.dry:
        if a.appendix:
            Path(a.appendix).write_text(text, encoding="utf-8")
        if a.public:
            Path(a.public).parent.mkdir(parents=True, exist_ok=True)
            Path(a.public).write_text(json.dumps(counts, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    # 标准输出只打计数
    miss = [r for r in rows if r["missing"]]
    print(f"行动清单：{counts['with_searches']}/{counts['questions']} 道不带品牌名的题有搜索词；页面取到 {counts['pages_checked']} 个题的页面，"
          f"{len(miss)} 道题的页面缺公共词；排名{'可用' if ranks_ok else '不可用'}，外部网站列了 {len(sites)} 个"
          + ("（--dry：什么都没写）" if a.dry else ""))
    return 0


def cmd_demand(a) -> int:
    """Search Console 页面导出（openseo get_search_console_performance，dimensions=["page"]）→ demand.json。"""
    src = json.loads(Path(a.export).read_text(encoding="utf-8"))
    pages = {norm_url(r["keys"][0]): {"impressions": r.get("impressions", 0), "clicks": r.get("clicks", 0),
                                      "position": round(r.get("position", 0), 1)}
             for r in src.get("rows") or [] if r.get("impressions", 0) >= a.min_impressions}
    out = {"_说明": "Search Console 各页面的展示和点击，fanout_actions.py 用它决定先改哪页。每月更新一次：导出页面维度、跑 demand 命令。",
           "source": f"Search Console {src.get('siteUrl', '')}, {src.get('startDate')} 至 {src.get('endDate')}，网页搜索，展示 ≥ {a.min_impressions}",
           "pages": dict(sorted(pages.items(), key=lambda kv: -kv[1]["impressions"]))}
    Path(a.out).write_text(json.dumps(out, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    print(f"demand.json：{len(pages)} 个页面（{out['source']}）")
    return 0


def selftest() -> int:
    qs = [{"id": "q1", "set": "real", "kind": "assistant", "question": "Can non-US residents open a Mercury account?",
           "target_url": "https://jasonzhu.ai/en/x"},
          {"id": "q2", "set": "real", "kind": "assistant", "question": "Stripe in China?", "target_url": "https://jasonzhu.ai/en/y"},
          {"id": "qb", "set": "frozen", "kind": "brand", "question": "who is jason", "target_url": "https://jasonzhu.ai/en"}]
    answers = [
        {"question_id": "q1", "engine": "chatgpt", "sample": 0, "fan_out": ["Mercury bank account non-US residents LLC required documents official 2026"]},
        {"question_id": "q1", "engine": "chatgpt", "sample": 1, "fan_out": ["Mercury non-US residents LLC eligibility documents 2026", "site:mercury.com help"]},
        {"question_id": "q1", "engine": "chatgpt", "sample": 2, "fan_out": ["Mercury LLC non-US founders requirements"]},
        {"question_id": "q2", "engine": "chatgpt", "sample": 0, "fan_out": ["Stripe supported countries China mainland"]},
        {"question_id": "qb", "engine": "chatgpt", "sample": 0, "fan_out": ["site:jasonzhu.ai"]},
    ]
    core = dict(core_words([a for a in answers if a["question_id"] == "q1"]))
    assert core["mercury"] == 3 and core["llc"] == 3 and core["non-us"] == 3 and core["documents"] == 2 and "eligibility" not in core, core
    rep = representative([a for a in answers if a["question_id"] == "q1"], set(core))
    assert rep == fo.norm("Mercury non-US residents LLC eligibility documents 2026"), rep     # 两条都盖住 6 个公共词，取短的
    assert on_page("non-us", {"non", "us"}, "for non us residents") and on_page("documents", {"document"}, "document")
    seen = lambda you, fp: {"you": you, "your_page": "", "first_page": list(fp)}
    ranks = {"searches": [
        {"query": fo.norm("Mercury bank account non-US residents LLC required documents official 2026"), "google": seen(None, ["mercury.com", "reddit.com", "doola.com"])},
        {"query": fo.norm("Mercury non-US residents LLC eligibility documents 2026"), "google": seen(None, ["doola.com", "mercury.com"])},
        {"query": fo.norm("Stripe supported countries China mainland"), "google": seen(7, ["stripe.com", "reddit.com"])},
    ]}
    placed = fo.placements(ranks)
    pages = {"https://jasonzhu.ai/en/x": "mercury bank account for an llc. fees and pricing.", "https://jasonzhu.ai/en/y": None}
    rows = {r["question_id"]: r for r in rows_for(qs, answers, placed, {"https://jasonzhu.ai/en/x": {"impressions": 50}}, pages)}
    assert "qb" not in rows and rows["q1"]["impressions"] == 50 and rows["q1"]["rep_google"] is None and rows["q1"]["rep_checked"]
    assert rows["q1"]["missing"][:3] == ["non-us", "documents", "residents"] or set(rows["q1"]["missing"]) >= {"non-us", "documents", "2026"}, rows["q1"]["missing"]
    assert "official" not in rows["q1"]["missing"] and "mercury" not in rows["q1"]["missing"]
    assert "年份" in rows["q1"]["missing_classes"] and "适用对象（地区、身份）" in rows["q1"]["missing_classes"], rows["q1"]["missing_classes"]
    assert rows["q2"]["missing"] is None and rows["q2"]["best_google"] == 7
    fan = {k: v for k, v in fo.by_question(answers).items() if k != "qb"}
    sites, officials = coverage(fan, placed, {q["id"]: q for q in qs})
    # q1 我们一条没排上，q2 排上了：reddit 两题都在、补上 q1，排第一；doola 只在 q1，已被补上，新补 0；官方站不进贪心
    assert [(s["site"], s["new"]) for s in sites] == [("reddit.com", 1), ("doola.com", 0)], sites
    assert sites[0]["kind"] == "平台（可以自己发）" and sites[1]["kind"] == "媒体、博客（投稿、请求收录）"
    assert [s["site"] for s in officials] == ["mercury.com", "stripe.com"] and officials[0]["kind"] == OFFICIAL, officials
    text = report("2026-11-30", list(rows.values()), sites, True, officials)
    assert "jasonzhu.ai/en/x | 50 |" in text and "页面打不开" in text and "doola.com" in text and "mercury.com（1 题）" in text
    pub = json.dumps(public_counts("2026-11-30", list(rows.values()), sites), ensure_ascii=False)
    assert "mercury" not in pub.lower() and "doola" not in pub and "reddit" not in pub, pub     # 公开计数里不能有搜索词和别的网站
    assert "页面打不开" not in report("d", [], [], False) and "测不出来" not in pub
    assert "只供参考" in report("d", [], [], True, [], (9, 454)) and "只供参考" not in report("d", [], [], True, [], (400, 454))
    assert site_kind("google.co.uk", ["How does Google rank?"]) == OFFICIAL and site_labels("deepmind.google") == ["deepmind"]
    assert site_kind("google.com.hk", ["What about Stripe?"]) == "媒体、博客（投稿、请求收录）"
    print("selftest ok")
    return 0


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("--selftest", action="store_true")
    sub = ap.add_subparsers(dest="cmd")
    r = sub.add_parser("run", help="出行动清单")
    r.add_argument("--sets", default="frozen,real")
    r.add_argument("--full", help="panel_run.py --full 的完整结果")
    r.add_argument("--archive", help="fanout.py --archive 的完整结果（排名、Gemini 搜索词）")
    r.add_argument("--demand", default=str(DEMAND))
    r.add_argument("--date", default="")
    r.add_argument("--limit", type=int, default=0)
    r.add_argument("--public", help="只含计数的文件，进仓库")
    r.add_argument("--appendix", help="邮件附录（含搜索词和别的网站），不进仓库")
    r.add_argument("--dry", action="store_true")
    d = sub.add_parser("demand", help="用 Search Console 页面导出更新 demand.json")
    d.add_argument("export")
    d.add_argument("--out", default=str(DEMAND))
    d.add_argument("--min-impressions", type=int, default=5)
    a = ap.parse_args()
    if a.selftest:
        return selftest()
    if a.cmd == "run":
        return cmd_run(a)
    if a.cmd == "demand":
        return cmd_demand(a)
    ap.print_help()
    return 1


if __name__ == "__main__":
    sys.exit(main())
