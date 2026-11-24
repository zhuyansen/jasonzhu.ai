#!/usr/bin/env python3
"""面板的子查询：AI 回答每道题之前实际去搜了什么，我们在这些搜索里排不排得上。

面板（panel_run.py）问的是用户的问题。AI 拿到问题后会自己拆成几条搜索词再去搜（query fan-out），
回答只能引用这些搜索搜得到的页面。所以「被引用」之前还有一关：AI 搜的那几条词下面，有没有我们。

两个来源，都是真实的搜索词，不是猜的：
  A  Gemini（接口，开 Google 搜索）：每题问 1 次，它返回自己搜过的词。代表 Google 这一路
     （Gemini App 和 Google AI Mode 不给搜索词，只给引用）。
  B  面板这次的回答里 ChatGPT、Perplexity（每月加跑时还有 Claude）自带的搜索词，从 panel_run.py --full 的文件读。
然后每条词查一次 Google 前 20 名，记下我们排第几。Bing 默认不查（加 --bing 才查）：AIsa 转的 Bing 结果对新品牌
不可靠（2026-11-24 实测，几个新品牌词的第一页全是不相干的网站），也不支持 site: 搜索。

Google 结果怎么认网站：2026-11 起 AIsa 给的 Google 结果网址全是读不出的 google.com/goto 跳转，backlink-guard 0.12.1
认不出是哪个网站，每条搜索都会算成「我们没排上」（11-23 那次「336 条全是 0」就是这么来的，作废）。这里改从 breadcrumb
（「https://jasonzhu.ai › en」）读回网站，名次不变；第一页一个网站都认不出的搜索，不算「查到了」。
每次查排名前先查自检词「site:jasonzhu.ai」：只要本站还在 Google 索引里、认网站这一步没坏，第一条一定是本站；
查不到就不查排名，报告写「测不出来」，不出 0。不用品牌词当自检：「jasonzhu ai」的结果每查一次都不一样
（2026-11-24 一小时内从第 1 掉到前 10 以外），它测的是排名，不是工具坏没坏。

「缺口」：一条词在 Google 前 20 没有 jasonzhu.ai（开了 --bing 时 Bing 前 20 也没有）。两家以上 AI 都搜过的缺口优先补：
那是多家共用的入口，排上去一次，几家都能看到。

提问和查排名都走 backlink-guard（AIsa 接口，和面板同一批），这里只做合并、按题归类和出报告。

公开仓库只提交计数（panel/fanout-<日期>.json：每题 AI 搜了几条、我们排上几条、缺口几条），不提交搜索词原文、
别的网站的网址：它们来自付费接口，和面板一样只进邮件和加密存档。

用法：
  python3 ops/geo/fanout.py --selftest
  python3 ops/geo/fanout.py run --full panel-full.json --sets frozen,real --max-usd 6 --date 2026-11-23 \\
      --public ops/geo/panel/fanout-2026-11-23.json --appendix fanout-appendix.md --archive fanout-full.json
  python3 ops/geo/fanout.py run --sets real --limit 2 --max-usd 0.5 --dry      # 试跑：只问前 2 题，什么都不写
"""
from __future__ import annotations

import argparse
import json
import sys
from collections import defaultdict
from datetime import datetime
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import panel_run as pr  # noqa: E402

GEMINI_SHARE = 0.5      # 预算先给 Gemini 提问用到这个比例，剩下的（连同没花完的）查排名
TOP = 20                # 查排名看前 20（backlink-guard 的 RANK_DEPTH）
FIRST = 10
SOURCES = ("chatgpt", "perplexity", "claude", "gemini")      # 会给出搜索词的几家
LABEL = pr.LABEL
CANARY = "site:" + pr.OWN  # 自检词：第一条必是本站。查不到，说明认网站这一步坏了或本站掉出索引（只查 Google，Bing 不支持 site:）
CANARY_USD = 0.02


def norm(q: str) -> str:
    """和 backlink-guard 的 search_tally 一样：小写、空白合并。"""
    return " ".join(str(q).lower().split())


# ───────────── 查排名：认网站、自检 ─────────────

def from_breadcrumb(item: dict) -> str:
    """读不出的 Google 跳转结果，从 breadcrumb（「https://jasonzhu.ai › en › blog」）拼回网址。社交结果的 breadcrumb
    是「2.1K+ followers」这种，读不到，返回空。路径是 Google 缩写过的，只能当大概；网站是准的。"""
    crumb = str(item.get("breadcrumb") or "").strip()
    if not crumb.startswith(("http://", "https://")):
        return ""
    head, *rest = [x.strip() for x in crumb.split("›")]
    return head.rstrip("/") + "".join("/" + x for x in rest if x and x not in ("...", "…"))


def patch_google(bg) -> None:
    """backlink-guard 0.12.1 的 organic() 遇到读不出的跳转，只记 redirect、不记网站。在它的结果上补一层：
    跳转读不出、breadcrumb 读得出的，补上网址和网站，名次不变。"""
    if getattr(bg.organic, "fanout_patched", False):
        return
    original = bg.organic

    def organic(data: dict) -> list[dict]:
        rows = original(data)
        items = [i for i in (data or {}).get("items") or [] if i.get("type") == "organic" and i.get("url")]
        for row, item in zip(rows, items):      # organic() 按同样的条件、同样的顺序一条对一条
            url = from_breadcrumb(item) if row.get("redirect") else ""
            if url:
                row.pop("redirect")
                row.update(url=url, site=bg.page.registrable(url), from_breadcrumb=True)
        return rows
    organic.fanout_patched = True
    bg.organic = organic


def readable(side: dict) -> bool:
    """这一边查到了，而且第一页至少认得出一个网站。全是认不出的跳转时等于没查，不能算「没排上」。"""
    return "first_page" in side and (bool(side["first_page"]) or side.get("you") is not None)


def canary(bg, Budget) -> dict:
    """查排名之前先查 site:本站。第一条不是本站，说明 Google 这一路坏了（接口改了格式、结果认不出网站）或本站掉出了
    索引，这次就不查排名，报告写「测不出来」。"""
    budget = Budget(CANARY_USD)
    try:
        p = bg.placed(bg.results_for("google", CANARY, budget, True), pr.OWN)
    except Exception as exc:  # 接口报错、超预算；不把报错原文带出去
        return {"ok": False, "position": None, "why": f"接口报错（{type(exc).__name__}）", "cost": budget.spent}
    ok = p["you"] == 1
    why = "" if ok else ("第一页一个网站都认不出" if not p["first_page"] else "第一页没有本站")
    return {"ok": ok, "position": p["you"], "why": why, "cost": budget.spent}


# ───────────── 合并、归类 ─────────────

def by_question(answers: list[dict]) -> dict[str, dict[str, set]]:
    """{题 id: {搜索词: {哪几家搜过}}}。"""
    out: dict[str, dict[str, set]] = defaultdict(lambda: defaultdict(set))
    for a in answers:
        for q in a.get("fan_out") or []:
            if norm(q):
                out[a["question_id"]][norm(q)].add(a["engine"])
    return out


def placements(ranks: dict) -> dict[str, dict]:
    """{搜索词: {"google": 名次或 None, "bing": …, "read": Google 查到了没有, "bing_read": …, "page": 我们排上的页面,
    "first_page": [站点]}}。「查到了」见 readable()；Bing 只在开了 --bing 时有，认不出的一边名次记 None。"""
    out = {}
    for r in ranks.get("searches") or []:
        g, b = r.get("google") or {}, r.get("bing") or {}
        g_read, b_read = readable(g), readable(b)
        out[r["query"]] = {"google": g.get("you") if g_read else None, "bing": b.get("you") if b_read else None,
                           "read": g_read, "bing_read": b_read,
                           "page": g.get("your_page") or b.get("your_page") or "",
                           "first_page": list(dict.fromkeys((g.get("first_page") or []) + (b.get("first_page") or [])))}
    return out


def question_rows(qs: list[dict], fan: dict, placed: dict) -> list[dict]:
    """每题一行：AI 搜了几条、查到几条、我们排上几条、缺口几条，多家共搜的缺口几条。"""
    rows = []
    for q in qs:
        terms = fan.get(q["id"], {})
        read = [t for t in terms if placed.get(t, {}).get("read")]
        ranked = [t for t in read if placed[t]["google"] is not None or placed[t]["bing"] is not None]
        top10 = [t for t in read if any(p is not None and p <= FIRST for p in (placed[t]["google"], placed[t]["bing"]))]
        gaps = [t for t in read if t not in ranked]
        shared_gaps = [t for t in gaps if len(terms[t]) >= 2]
        rows.append({"question_id": q["id"], "set": q["set"], "target_url": q.get("target_url", ""),
                     "searches": len(terms), "read": len(read), "ranked": len(ranked), "top10": len(top10),
                     "gaps": len(gaps), "shared_gaps": len(shared_gaps),
                     "by_engine": {e: sum(e in s for s in terms.values()) for e in SOURCES if any(e in s for s in terms.values())}})
    return rows


def totals(fan: dict, placed: dict) -> dict:
    terms: dict[str, set] = defaultdict(set)
    for per in fan.values():
        for t, engines in per.items():
            terms[t] |= engines
    read = [t for t in terms if placed.get(t, {}).get("read")]
    you = lambda t, e: placed[t][e] is not None
    return {"searches": len(terms), "read": len(read),
            "google": sum(you(t, "google") for t in read), "bing": sum(you(t, "bing") for t in read),
            "google_top10": sum(you(t, "google") and placed[t]["google"] <= FIRST for t in read),
            "bing_top10": sum(you(t, "bing") and placed[t]["bing"] <= FIRST for t in read),
            "either": sum(you(t, "google") or you(t, "bing") for t in read),
            "shared": sum(len(terms[t]) >= 2 for t in terms),
            "by_engine": {e: sum(e in s for s in terms.values()) for e in SOURCES if any(e in s for s in terms.values())}}


# ───────────── 报告 ─────────────

def pos(p) -> str:
    return "—" if p is None else str(p)


def appendix(day: str, qs: list[dict], fan: dict, placed: dict, ranks: dict, tot: dict, gemini_model: str,
             cost: float, left_out: int, check: dict, bing: bool = False, unreadable: int = 0) -> str:
    """只进邮件和加密存档：搜索词原文、我们的名次、缺口、AI 搜这些词时常见的页面。"""
    q_of = {q["id"]: q for q in qs}
    out = [f"## AI 实际搜了什么，我们在不在（子查询，{day}）", "",
           f"AI 回答这 {len(qs)} 道题时一共搜了 **{tot['searches']} 条不同的词**（"
           + "、".join(f"{LABEL.get(e, e)} {n}" for e, n in tot["by_engine"].items()) + "），"
           f"其中 {tot['shared']} 条不止一家搜过。Gemini 是接口（{gemini_model}，开 Google 搜索），代表 Google 这一路。", ""]
    if not check.get("ok"):
        out += [f"**Google 排名这次测不出来**：查排名前的自检词「{CANARY}」没查到本站（{check.get('why') or '原因不明'}），"
                "所以没查排名，也没有缺口表。下面只列每道题 AI 搜了几条。", "", "| 题 | AI 搜了几条 |", "|---|---|"]
        out += [f"| {qid} | {len(terms)} |" for qid, terms in fan.items()]
        return "\n".join(out) + "\n"
    where = f"Google 前 {TOP}" + (f"、Bing 前 {TOP}" if bing else "")
    line = f"查到排名的 {tot['read']} 条里，我们在 Google 前 {TOP} 的有 {tot['google']} 条（前 {FIRST}：{tot['google_top10']}）"
    if bing:
        line += f"，Bing 前 {TOP} 的有 {tot['bing']} 条（前 {FIRST}：{tot['bing_top10']}；Bing 结果对新品牌不可靠，只作参考）"
    line += (f"，{'都' if bing else ''}没有的 {tot['read'] - tot['either']} 条。自检词「{CANARY}」本站在 Google 排第 {check.get('position')}。"
             + (f"另有 {unreadable} 条 Google 结果认不出是哪些网站，没算进去。" if unreadable else "")
             + f"这部分花费 ${cost:.2f}" + (f"，预算没查到 {left_out} 次" if left_out else "") + "。")
    out += [line, ""]

    gaps = []
    for qid, terms in fan.items():
        for t, engines in terms.items():
            p = placed.get(t)
            if p and p["read"] and p["google"] is None and p["bing"] is None and len(engines) >= 2:
                gaps.append((len(engines), qid, t, engines, p))
    gaps.sort(key=lambda x: (-x[0], x[1], x[2]))
    out += [f"### 该先补的：几家 AI 都搜、我们在 {where} 都没有", ""]
    if gaps:
        out += ["| 搜索词 | 谁搜的 | 哪道题 | 题目对应页面 | 现在第一页常见的站 |", "|---|---|---|---|---|"]
        for _, qid, t, engines, p in gaps[:30]:
            target = q_of.get(qid, {}).get("target_url", "").removeprefix("https://")
            out.append(f"| {t} | {'、'.join(LABEL.get(e, e) for e in sorted(engines))} | {qid} | {target or '—'} | "
                       f"{'、'.join(p['first_page'][:3]) or '—'} |")
    elif tot["shared"]:
        out.append("没有：几家都搜过的词，我们都排上了。")
    else:
        out.append("这次没有几家 AI 搜过同一条词（各家措辞不同），看下面每道题的缺口。")
    out += ["", "### 每道题", "", "缺口举例按搜过它的 AI 家数排，最多三条。", "",
            "| 题 | AI 搜了几条 | 我们排上的 | 其中前 10 | 缺口 | 缺口举例 |", "|---|---|---|---|---|---|"]
    for r in question_rows(qs, fan, placed):
        if r["searches"]:
            terms = fan.get(r["question_id"], {})
            eg = sorted((t for t in terms if placed.get(t, {}).get("read") and placed[t]["google"] is None
                         and placed[t]["bing"] is None), key=lambda t: (-len(terms[t]), t))[:3]
            out.append(f"| {r['question_id']} | {r['searches']} | {r['ranked']}/{r['read']} | {r['top10']} | {r['gaps']} | "
                       f"{'；'.join(eg) or '—'} |")
    out += ["", "### 我们排上了的词", ""]
    mine = sorted({t: p for per in fan.values() for t in per if (p := placed.get(t)) and p["read"]
                   and (p["google"] is not None or p["bing"] is not None)}.items(),
                  key=lambda kv: min(x for x in (kv[1]["google"], kv[1]["bing"]) if x is not None))
    out += [f"- {t}：Google {pos(p['google'])}" + (f"，Bing {pos(p['bing'])}" if bing else "")
            + f"（{p['page'].removeprefix('https://')}）" for t, p in mine[:25]] or ["（没有）"]
    pages = [p for p in ranks.get("pages") or [] if p.get("cited")][:12]
    if pages:
        out += ["", "### AI 搜这些词时最常排在第一页、也被回答引用的页面", "",
                "AI 引用的来源基本出自这个池子。排在这里的别人的页面，是投稿、被收录、请求加链接的候选。", ""]
        out += [f"- {p['url']}（{p['searches']} 次搜索的第一页，被引用 {p['cited']} 次）" + ("  ← 本站" if p.get("you") else "")
                for p in pages]
    return "\n".join(out) + "\n"


# ───────────── 命令 ─────────────

def cmd_run(a) -> int:
    try:
        from backlink_guard import asked as bg
        from backlink_guard import __version__ as bg_version
        from backlink_guard.budget import Budget
    except ImportError:
        raise SystemExit('没装 backlink-guard：pip install "backlink-guard>=0.12"')
    day = a.date or datetime.now(pr.CST).strftime("%Y-%m-%d")
    qs = pr.load_questions(a.sets.split(","))
    if a.limit:
        qs = qs[:a.limit]
    by_text = {q["question"]: q for q in qs}

    panel = []
    if a.full and Path(a.full).exists():
        full = json.loads(Path(a.full).read_text(encoding="utf-8"))
        panel = [x for x in full.get("answers") or [] if x.get("question_id") in {q["id"] for q in qs}]
    spent, errors, left = 0, [], []
    gemini = []
    if a.gemini:
        res = bg.asked(pr.OWN, [q["question"] for q in qs], names=pr.NAMES, engines=["gemini"], samples=a.gemini,
                       max_usd=a.max_usd * GEMINI_SHARE, fresh=True)
        spent += res["cost"]
        errors += res["errors"]
        left += res["left_out"]
        gemini = [x | {"question_id": by_text[x["question"]]["id"]} for x in res["answers"] if x["question"] in by_text]
    answers = panel + gemini

    searches = bg.search_tally(answers)
    patch_google(bg)
    if not a.bing:
        bg.RANK_PATHS = {"google": bg.RANK_PATHS["google"]}     # backlink-guard 每次都现读这个表
    ranks = {"searches": [], "pages": [], "by_engine": [], "left_out": []}
    check = {"ok": False, "position": None, "why": "没有搜索词或没有预算"}
    if searches and a.max_usd - spent / 1e6 > 0:
        check = canary(bg, Budget)
        spent += check.pop("cost", 0)
        room = a.max_usd - spent / 1e6
        if check["ok"] and room > 0:
            budget = Budget(room)
            ranks = bg.ranks(searches, pr.OWN, bg.site_tally(answers, pr.OWN), budget, True, bg.page_tally(answers))
            spent += budget.spent
    unreadable = sum(1 for r in ranks.get("searches") or []
                     if "first_page" in (r.get("google") or {}) and not readable(r["google"]))
    fan = by_question(answers)
    placed = placements(ranks)
    tot = totals(fan, placed)
    model = bg.ENGINES["gemini"].get("model", "")
    public = {"date": day, "site": pr.OWN, "sets": a.sets.split(","), "questions": len(qs), "cost_usd": round(spent / 1e6, 4),
              "lineage": {"backlink_guard": bg_version, "gemini_model": model, "gemini_samples": a.gemini, "depth": TOP,
                          "engines": list(bg.RANK_PATHS), "google_sites_from": "breadcrumb",
                          "panel_answers": len(panel), "fanout_script": pr.file_hash(Path(__file__))},
              "google_check": check, "unreadable_google": unreadable,
              "totals": tot, "questions_rows": question_rows(qs, fan, placed),
              "errors": len(errors), "left_out": len(left) + len(ranks.get("left_out") or [])}
    text = appendix(day, qs, fan, placed, ranks, tot, model, spent / 1e6, public["left_out"], check, a.bing, unreadable)
    if not a.dry:
        if a.public:
            Path(a.public).parent.mkdir(parents=True, exist_ok=True)
            Path(a.public).write_text(json.dumps(public, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
        if a.appendix:
            Path(a.appendix).write_text(text, encoding="utf-8")
        if a.archive:
            Path(a.archive).write_text(json.dumps({"public": public, "gemini_answers": gemini, "ranks": ranks,
                                                   "errors": errors, "left_out": left}, ensure_ascii=False), encoding="utf-8")
    # 标准输出只打计数（公开仓库的 Actions 日志是公开的），搜索词原文只进 --appendix
    t = tot
    if not check["ok"]:
        print(f"子查询：{len(qs)} 题，AI 搜了 {t['searches']} 条不同的词（{t['by_engine']}）；Google 排名测不出来"
              f"（自检：{check['why']}），没查排名；花费 ${spent / 1e6:.2f}；接口报错 {len(errors)}")
        return 3
    print(f"子查询：{len(qs)} 题，AI 搜了 {t['searches']} 条不同的词（{t['by_engine']}），查到排名 {t['read']} 条"
          f"（另有 {unreadable} 条认不出网站）；自检词本站排第 {check['position']}；我们在 Google 前 {TOP} {t['google']} 条"
          f"（前 {FIRST} {t['google_top10']} 条）" + (f"，Bing 前 {TOP} {t['bing']} 条" if a.bing else "")
          + f"；花费 ${spent / 1e6:.2f}；接口报错 {len(errors)}，预算没做到 {public['left_out']}")
    return 0


# ───────────── 自测 ─────────────

def selftest() -> int:
    qs = [{"id": "q1", "set": "real", "kind": "", "question": "how to pay", "target_url": "https://jasonzhu.ai/en/a"},
          {"id": "q2", "set": "real", "kind": "", "question": "which mor", "target_url": ""}]
    answers = [{"engine": "chatgpt", "question_id": "q1", "fan_out": ["Stripe China ", "polar fees"]},
               {"engine": "gemini", "question_id": "q1", "fan_out": ["stripe   china", "Paddle countries"]},
               {"engine": "perplexity", "question_id": "q2", "fan_out": ["best mor 2026"]},
               {"engine": "gemini_app", "question_id": "q2", "fan_out": []}]
    fan = by_question(answers)
    assert fan["q1"]["stripe china"] == {"chatgpt", "gemini"}, fan
    assert set(fan["q1"]) == {"stripe china", "polar fees", "paddle countries"}
    seen = lambda you, page="", fp=("a.com",): {"you": you, "your_page": page, "first_page": list(fp)}
    ranks = {"searches": [
        {"query": "stripe china", "google": seen(None), "bing": seen(None)},                        # 多家共搜的缺口
        {"query": "polar fees", "google": seen(4, "https://jasonzhu.ai/en/a"), "bing": seen(None)},
        {"query": "paddle countries", "google": seen(None, fp=()), "bing": {"error": "x"}},        # Google 认不出网站：不算查到
        {"query": "best mor 2026", "google": seen(15, "https://jasonzhu.ai/en/b"), "bing": seen(12, "https://jasonzhu.ai/en/b")}],
        "pages": [{"url": "https://a.com/x", "searches": 3, "cited": 2, "you": False}]}
    placed = placements(ranks)
    assert placed["paddle countries"]["read"] is False and placed["polar fees"]["google"] == 4
    rows = {r["question_id"]: r for r in question_rows(qs, fan, placed)}
    assert rows["q1"] == rows["q1"] | {"searches": 3, "read": 2, "ranked": 1, "top10": 1, "gaps": 1, "shared_gaps": 1}, rows["q1"]
    assert rows["q2"] | {} == rows["q2"] | {"searches": 1, "ranked": 1, "top10": 0, "gaps": 0}, rows["q2"]
    tot = totals(fan, placed)
    assert tot == tot | {"searches": 4, "read": 3, "google": 2, "bing": 1, "google_top10": 1, "bing_top10": 0, "either": 2,
                         "shared": 1}, tot
    text = appendix("2026-11-23", qs, fan, placed, ranks, tot, "m", 0.1, 0, {"ok": True, "position": 1}, True)
    assert "| stripe china | ChatGPT、Gemini（接口） | q1 | jasonzhu.ai/en/a | a.com |" in text, text
    assert "polar fees：Google 4，Bing —" in text and "← 本站" not in text
    assert "测不出来" not in text and "本站在 Google 排第 1" in text, text
    bad = appendix("2026-11-23", qs, fan, placed, ranks, tot, "m", 0.1, 0, {"ok": False, "why": "第一页没有本站"})
    assert "Google 排名这次测不出来" in bad and "我们在 Google 前" not in bad and "| q1 | 3 |" in bad, bad
    assert readable({"first_page": []}) is False and readable({"first_page": ["a.com"], "you": None})
    assert from_breadcrumb({"breadcrumb": "https://jasonzhu.ai › en › blog"}) == "https://jasonzhu.ai/en/blog"
    assert from_breadcrumb({"breadcrumb": "https://jasonzhu.ai › ..."}) == "https://jasonzhu.ai"
    assert from_breadcrumb({"breadcrumb": "2.1K+ followers"}) == ""
    from types import SimpleNamespace

    def raw(data):      # backlink-guard 0.12.1 对读不出的跳转的输出
        items = [i for i in data["items"] if i.get("type") == "organic" and i.get("url")]
        return [{"url": i["url"], "site": "", "position": n, "redirect": True} for n, i in enumerate(items, 1)]
    fake = SimpleNamespace(organic=raw, page=SimpleNamespace(registrable=lambda u: u.split("/")[2].removeprefix("www.")))
    patch_google(fake)
    patch_google(fake)      # 装两次不叠加
    got = fake.organic({"items": [
        {"type": "organic", "url": "https://google.com/goto?url=CAES", "breadcrumb": "https://www.jasonzhu.ai › en"},
        {"type": "organic", "url": "https://google.com/goto?url=CAES", "breadcrumb": "235K+ followers"}]})
    assert got[0] == {"url": "https://www.jasonzhu.ai/en", "site": "jasonzhu.ai", "position": 1, "from_breadcrumb": True}, got
    assert got[1]["redirect"] is True and got[1]["site"] == "", got
    pub = json.dumps(question_rows(qs, fan, placed)) + json.dumps(tot)
    assert "stripe" not in pub and "a.com" not in pub, "公开文件不能带搜索词和别的网站"
    print("fanout selftest ok")
    return 0


def main() -> int:
    if "--selftest" in sys.argv:
        return selftest()
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    sub = ap.add_subparsers(dest="cmd", required=True)
    r = sub.add_parser("run", help="合并搜索词、查排名、出报告")
    r.add_argument("--sets", default="frozen,real")
    r.add_argument("--full", help="panel_run.py run --full 写的文件（含 ChatGPT、Perplexity 的搜索词）；没有就只用 Gemini")
    r.add_argument("--gemini", type=int, default=1, help="Gemini 接口每题问几次；0 = 不问")
    r.add_argument("--max-usd", type=float, default=6.0)
    r.add_argument("--limit", type=int, default=0)
    r.add_argument("--date", default="")
    r.add_argument("--public", help="只有计数的结果，提交到公开仓库")
    r.add_argument("--appendix", help="邮件里看的部分（含搜索词原文）")
    r.add_argument("--archive", help="完整结果，加密存档用")
    r.add_argument("--bing", action="store_true", help="也查 Bing（AIsa 转的 Bing 结果对新品牌不可靠，默认不查）")
    r.add_argument("--dry", action="store_true", help="什么文件都不写")
    a = ap.parse_args()
    return cmd_run(a)


if __name__ == "__main__":
    sys.exit(main())
