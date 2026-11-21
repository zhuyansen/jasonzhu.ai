#!/usr/bin/env python3
"""GEO 引用面板：每周把固定的题库问一遍几家 AI，记下它们有没有引用、点名 jasonzhu.ai。

提问只用 backlink-guard 的 asked（走 AIsa，和 2026-11-17 基线是同一批接口），这里只做四件事：
读题库 → 调 asked → 给每个回答打分 → 和上一次、和基线比。

四个口径分开记，不混着看：
  site_cited  回答引用了 jasonzhu.ai 的任何页面
  page_cited  回答引用了这道题对应的那个页面
  named       回答正文里写了域名或名字
  first_pick  被引用的第一个网址是我们的

同一个问题每次问答案都不一样，所以每家每题问几次（默认 3 次），按「几个回答里有几个命中」算。
基线每题只问了 1 次，和基线比只能比回答命中率，不能比「至少命中一次的题数」（问得多自然命中多）。
安全过滤拒答、空回答不算有效回答，单独记数。

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
import json
import os
import re
import sys
import urllib.parse
import urllib.request
from collections import Counter
from datetime import datetime, timedelta, timezone
from pathlib import Path

GEO = Path(__file__).resolve().parent
PANEL = GEO / "panel"
SETS = {"frozen": GEO / "questions.json", "real": GEO / "questions-real.json"}
EXPERIMENTS = GEO / "experiments.json"
BASELINE = "results-2026-11-17-baseline.json"
BASELINE_ENGINES = {"ChatGPT": "chatgpt", "Gemini": "gemini_app", "Perplexity": "perplexity", "Claude": "claude"}
OWN = "jasonzhu.ai"
NAMES = ["Jason Zhu", "JasonZhu.AI"]
LABEL = {"chatgpt": "ChatGPT", "gemini_app": "Gemini App", "ai_mode": "Google AI Mode", "perplexity": "Perplexity",
         "claude": "Claude", "gemini": "Gemini（接口）"}
DEFAULT_ENGINES = "chatgpt:3,gemini_app:3,ai_mode:3,perplexity:3"   # 都是每个回答 $0.004–0.006 的；Claude 约 $0.045，按月加跑
CALIBERS = ("site_cited", "page_cited", "named", "first_pick")
CALIBER_ZH = {"site_cited": "引用本站", "page_cited": "引用对应页面", "named": "正文点名", "first_pick": "排第一"}
SET_ZH = {"frozen": "冻结组", "real": "真实问法组"}
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


def score_row(row: dict, q: dict) -> dict:
    """asked 的一个回答 → 一行分数。只留我们自己的网址，别的网站的不留。"""
    cited = row.get("cited") or []
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


def previous(day: str) -> Path | None:
    """这一天之前最近的一次结果（不含基线）。"""
    found = sorted(p for p in PANEL.glob("results-*.json") if (m := RESULT_NAME.match(p.name)) and m.group(1) < day)
    return found[-1] if found else None


# ───────────── 对照实验 ─────────────

def experiment_table(now: list[dict], base: list[dict], exp: dict, caliber: str = "site_cited") -> list[dict]:
    """处理组和对照组各自的回答命中率，这次和基线各一个；净变化 = 处理组的变化 − 对照组的变化。"""
    treated, control = set(exp["treated"]), set(exp["control"])
    out = []
    for e in engines_in(now):
        tn, cn, tb, cb = rate(now, e, caliber, treated), rate(now, e, caliber, control), rate(base, e, caliber, treated), rate(base, e, caliber, control)
        net = None
        if all(x[1] for x in (tn, cn, tb, cb)):
            net = (tn[0] / tn[1] - tb[0] / tb[1]) - (cn[0] / cn[1] - cb[0] / cb[1])
        out.append({"engine": e, "treated_now": tn, "control_now": cn, "treated_base": tb, "control_base": cb, "net": net})
    return out


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


# ───────────── 摘要 ─────────────

def pct(hit: int, total: int) -> str:
    return f"{hit}/{total}（{hit * 100 // total}%）" if total else "–"


def engine_table(rows: list[dict], base: list[dict] | None, ids: set | None = None) -> list[str]:
    head = "| AI | 有效回答 | 引用本站 | 引用对应页面 | 正文点名 | 排第一 |" + (" 基线：引用本站 |" if base else "")
    lines = [head, "|---|---|---|---|---|---|" + ("---|" if base else "")]
    for e in engines_in(rows):
        n = rate(rows, e, "site_cited", ids)[1]
        cells = [LABEL.get(e, e), str(n)] + [pct(*rate(rows, e, c, ids)) for c in CALIBERS]
        if base:
            cells.append(pct(*rate(base, e, "site_cited", ids)))
        lines.append("| " + " | ".join(cells) + " |")
    return lines


def summary(result: dict, prev: list[dict] | None = None, prev_day: str = "") -> str:
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
    out += ["每格是「命中的回答数/有效回答数」。同一个问题每次问答案都不一样，所以每题问多次。", ""]
    for s in sets:
        ids = {r["question_id"] for r in rows if r["set"] == s}
        out += [f"## {SET_ZH[s]}", ""] + engine_table(rows, base if s == "frozen" else None, ids) + [""]
        if s == "frozen" and base:
            out += ["基线是 2026-11-17 那次，每题每家只问了 1 次，Google AI Mode 当时没测。", ""]
    brand = {r["question_id"] for r in rows if r["kind"] == "brand"}
    if brand and len(brand) < len({r["question_id"] for r in rows}):
        others = {r["question_id"] for r in rows} - brand
        out += ["## 带品牌名的题和不带的分开看", "", "| AI | 带品牌名：引用本站 | 不带品牌名：引用本站 |", "|---|---|---|"]
        out += [f"| {LABEL.get(e, e)} | {pct(*rate(rows, e, 'site_cited', brand))} | {pct(*rate(rows, e, 'site_cited', others))} |"
                for e in engines_in(rows)] + ["", "带品牌名的题本来就容易被引用，真正要看的是右边一列。", ""]
    exps = json.loads(EXPERIMENTS.read_text(encoding="utf-8")) if EXPERIMENTS.exists() else {}
    present = {r["question_id"] for r in rows}
    for exp in exps.get("experiments", []):
        exp_base = PANEL / exp["baseline"]
        if exp["started"] > day or not exp_base.exists() or not present & set(exp["treated"] + exp["control"]):
            continue                    # 这次没问到实验里的题（比如只跑了真实问法组），这一段不出
        out += [f"## 对照实验：{exp['note']}", "",
                f"{exp['started']} 开始。处理组 {len(exp['treated'])} 题，对照组 {len(exp['control'])} 题，看的是「引用本站」。", "",
                "| AI | 处理组 现在 | 处理组 基线 | 对照组 现在 | 对照组 基线 | 净变化 |", "|---|---|---|---|---|---|"]
        for t in experiment_table(rows, load_rows(exp_base), exp):
            net = "–" if t["net"] is None else f"{t['net'] * 100:+.0f} 个百分点"
            out.append(f"| {LABEL.get(t['engine'], t['engine'])} | {pct(*t['treated_now'])} | {pct(*t['treated_base'])} | "
                       f"{pct(*t['control_now'])} | {pct(*t['control_base'])} | {net} |")
        out += ["", "净变化 = 处理组的变化 − 对照组的变化。题数少，只看方向，一两个回答就能让它变 10 个百分点以上。", ""]
    if prev is not None:
        new, gone = sorted(hits(rows) - hits(prev)), sorted(hits(prev) - hits(rows))
        asked_both = {(r["engine"], r["question_id"]) for r in valid(rows)} & {(r["engine"], r["question_id"]) for r in valid(prev)}
        new, gone = [x for x in new if x in asked_both], [x for x in gone if x in asked_both]
        out += [f"## 和上次（{prev_day}）比", "",
                "新出现引用本站的：" + ("、".join(f"{LABEL.get(e, e)} · {q}" for e, q in new) or "没有"), "",
                "这次没再引用的：" + ("、".join(f"{LABEL.get(e, e)} · {q}" for e, q in gone) or "没有"), ""]
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


def appendix(answers: list[dict]) -> str:
    """只进邮件和加密存档的部分：AI 引用最多的网站和页面、它们搜了什么。"""
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
              "cost_usd": round(spent / 1e6, 4), "errors": len(errors), "left_out": len(left_out), "rows": rows}
    done = tally(rows)
    result["incomplete"] = any(done.get(e, {}).get("valid", 0) * 2 < len(qs) * n for e, n in plan.items())
    if a.ga and Path(a.ga).exists():
        result["ai_referrals"] = ai_referrals(json.loads(Path(a.ga).read_text(encoding="utf-8")))
    prev_path = previous(day)
    text = summary(result, load_rows(prev_path) if prev_path else None, RESULT_NAME.match(prev_path.name).group(1) if prev_path else "")
    if not a.dry:
        PANEL.mkdir(exist_ok=True)
        (PANEL / f"results-{day}.json").write_text(json.dumps(result, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
        (PANEL / f"summary-{day}.md").write_text(text + "\n", encoding="utf-8")
    if a.full:
        Path(a.full).write_text(json.dumps({"result": result, "errors": errors, "left_out": left_out, "answers": answers},
                                           ensure_ascii=False), encoding="utf-8")
    if a.appendix:
        Path(a.appendix).write_text(appendix(answers), encoding="utf-8")
    print(text)
    print(f"\n回答 {len(rows)} 个，接口报错 {len(errors)} 个，预算没问到 {len(left_out)} 个，花费 ${spent / 1e6:.2f}", file=sys.stderr)
    return 2 if result["incomplete"] else 0


def cmd_summary(a) -> int:
    path = Path(a.results)
    result = json.loads(path.read_text(encoding="utf-8"))
    prev_path = previous(result["date"])
    print(summary(result, load_rows(prev_path) if prev_path else None, RESULT_NAME.match(prev_path.name).group(1) if prev_path else ""))
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
    # 旧格式的基线能读
    old = PANEL / BASELINE
    if old.exists():
        b = load_rows(old)
        assert {r["engine"] for r in b} == {"chatgpt", "gemini_app", "perplexity", "claude"} and all(r["status"] == "answered" for r in b)
        assert rate(b, "perplexity", "site_cited") == (12, 20) and rate(b, "chatgpt", "page_cited") == (1, 20)   # 和 11-17 的摘要一致
    assert is_ai("chatgpt.com") and is_ai("perplexity") and not is_ai("google")
    ga = {"ok": True, "srcLanding7": {"rows": [{"sessionSource": "chatgpt.com", "landingPage": "/en", "sessions": 3.0},
                                               {"sessionSource": "google", "landingPage": "/en", "sessions": 9.0}]}}
    assert ai_referrals(ga) == {"total": 3, "sources": [["chatgpt.com", 3]], "pages": [["/en", 3]]} and ai_referrals({"ok": False}) is None
    result = {"date": "2026-11-24", "engines": {"chatgpt": 3}, "cost_usd": 1.0, "rows": rows, "ai_referrals": ai_referrals(ga)}
    text = summary(result, prev=[mk("data-x", False)], prev_day="2026-11-17")
    assert "新出现引用本站的：ChatGPT · data-x" in text and "安全过滤拒答 1 个" in text and "共 3 次会话" in text
    assert "对照实验" not in text                                  # data-x 不在任何实验的分组里
    assert "other.example" not in text and "other.example" not in json.dumps(rows)              # 公开的部分没有别人的网址
    assert "other.example（2）" in appendix([{"cited": [page("https://other.example/a")], "fan_out": ["Best  X"]},
                                           {"cited": [page("https://other.example/b")], "fan_out": ["best x"]}])
    print("自测通过")
    return 0


def main() -> int:
    if "--selftest" in sys.argv:
        return selftest()
    ap = argparse.ArgumentParser(description="GEO 引用面板")
    sub = ap.add_subparsers(dest="cmd", required=True)
    r = sub.add_parser("run", help="问一遍、打分、写结果")
    r.add_argument("--sets", default="frozen", help="题库，逗号分隔：frozen、real（默认 frozen）")
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
