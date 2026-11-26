#!/usr/bin/env python3
"""Bing 站长后台「AI Performance」报表导入（2026-11-26 起，每月手动导出一次再跑这个）。

Bing 没有接口给这份报表，只能在站长后台导出 CSV（Jason 2026-11-24 选的办法 A：每月手动导出 + 导入脚本）。
这是 AI 引用的官方读数：Copilot、Bing 的 AI 摘要这些靠 Bing 检索的 AI，引用本站多少次、引用了几个页面。
它和每周面板是两个口径：面板是我们自己问固定的题，这里是所有真实用户问出来的。水表的引用层两样都看。

认三种导出（按表头认，文件名不要紧）：
  概览   "Date","Citations","Cited Pages"：每天的引用次数和被引用的页面数。
  搜索词 Grounding queries 表：AI 为了回答去 Bing 搜的词和次数。词只进本地报告，不进公开文件。
  页面   Pages 表：每页被引用的次数。只记本站自己的网址。
表头和上面对不上的，报错停下，不猜。

公开文件只有计数：ops/geo/panel/bing-ai-<最后一天>.json（每月、每周的引用次数，被引用页面数，搜索词有几条）。

用法：
  python3 ops/geo/bing_ai.py --selftest
  python3 ops/geo/bing_ai.py run ~/出海/specs/bing-ai/jasonzhu.ai_AIPerformanceOverviewStats_2026-11-26.csv \\
      [更多导出的 CSV …] --site jasonzhu.ai --public auto --out /tmp/bing-ai.md
"""
from __future__ import annotations

import argparse
import csv
import json
import sys
from collections import defaultdict
from datetime import date, datetime, timedelta
from pathlib import Path

PANEL = Path(__file__).resolve().parent / "panel"
QUERY_COLS = ("Grounding Query", "Grounding query", "Query", "Grounding Queries")
PAGE_COLS = ("Page", "Page URL", "URL", "Cited Page")
COUNT_COLS = ("Citations", "Citation Count", "Count")


def read_csv(path: Path) -> tuple[list[str], list[dict]]:
    with open(path, encoding="utf-8-sig", newline="") as f:
        r = csv.DictReader(f)
        return list(r.fieldnames or []), list(r)


def kind_of(cols: list[str]) -> str:
    if "Date" in cols and "Citations" in cols:
        return "overview"
    if any(c in cols for c in QUERY_COLS):
        return "queries"
    if any(c in cols for c in PAGE_COLS):
        return "pages"
    raise SystemExit(f"认不出这份导出的表头：{cols}（概览要有 Date、Citations；搜索词表要有 {QUERY_COLS[0]}；页面表要有 Page）")


def num(v) -> int:
    try:
        return int(float(str(v).replace(",", "") or 0))
    except ValueError:
        return 0


def parse_day(s: str) -> date:
    return datetime.strptime(s.split()[0], "%m/%d/%Y").date()


def overview(rows: list[dict]) -> dict:
    days = sorted((parse_day(r["Date"]), num(r["Citations"]), num(r.get("Cited Pages"))) for r in rows if r.get("Date"))
    if not days:
        return {}
    months: dict[str, dict] = defaultdict(lambda: {"citations": 0, "days": 0, "cited_pages_sum": 0, "cited_pages_max": 0})
    for d, c, p in days:
        m = months[d.strftime("%Y-%m")]
        m["citations"] += c
        m["days"] += 1
        m["cited_pages_sum"] += p
        m["cited_pages_max"] = max(m["cited_pages_max"], p)
    for m in months.values():
        m["per_day"] = round(m["citations"] / m["days"], 1)
        m["cited_pages_per_day"] = round(m.pop("cited_pages_sum") / m["days"], 1)
    last = days[-1][0]
    weeks = []
    for w in range(8):
        hi = last - timedelta(days=7 * w)
        lo = hi - timedelta(days=6)
        sel = [(c, p) for d, c, p in days if lo <= d <= hi]
        if len(sel) == 7:
            weeks.append({"from": str(lo), "to": str(hi), "citations": sum(c for c, _ in sel),
                          "cited_pages_per_day": round(sum(p for _, p in sel) / 7, 1)})
    return {"first": str(days[0][0]), "last": str(last), "days": len(days), "total_citations": sum(c for _, c, _ in days),
            "months": dict(sorted(months.items())), "weeks": list(reversed(weeks))}


def column(rows: list[dict], names: tuple[str, ...]) -> str | None:
    return next((n for n in names if rows and n in rows[0]), None)


def table_counts(rows: list[dict], key_cols: tuple[str, ...]) -> tuple[list[tuple[str, int]], int]:
    k, c = column(rows, key_cols), column(rows, COUNT_COLS)
    if not k:
        return [], 0
    items = sorted(((r[k], num(r[c]) if c else 0) for r in rows if r.get(k)), key=lambda x: -x[1])
    return items, sum(n for _, n in items)


def report(site: str, ov: dict, queries: list[tuple[str, int]], pages: list[tuple[str, int]]) -> str:
    out = [f"## Bing AI 引用（官方报表，{site}）", ""]
    if ov:
        out += [f"{ov['first']} 至 {ov['last']}，共 {ov['days']} 天，引用 {ov['total_citations']:,} 次。", "",
                "| 月 | 引用次数 | 日均 | 被引用页面（日均 / 最多） | 天数 |", "|---|---|---|---|---|"]
        out += [f"| {k} | {m['citations']:,} | {m['per_day']} | {m['cited_pages_per_day']} / {m['cited_pages_max']} | {m['days']} |"
                for k, m in ov["months"].items()]
        if ov["weeks"]:
            out += ["", "最近几周（每周 7 天）：" + "；".join(f"{w['from'][5:]}–{w['to'][5:]} {w['citations']}" for w in ov["weeks"])]
        out.append("")
    if queries:
        out += [f"### AI 为回答去 Bing 搜的词（{len(queries)} 条，只在本地报告里）", ""]
        out += [f"- {q}：{n}" for q, n in queries[:30]] + [""]
    if pages:
        out += [f"### 被引用的页面（{len(pages)} 个）", ""]
        out += [f"- {p}：{n}" for p, n in pages[:30]] + [""]
    out.append("这是所有真实用户问出来的引用，和每周面板（我们自己问固定的题）是两个口径，水表引用层两样都看。")
    return "\n".join(out) + "\n"


def cmd_run(a) -> int:
    ov, queries, pages = {}, [], []
    for p in a.files:
        cols, rows = read_csv(Path(p).expanduser())
        k = kind_of(cols)
        if k == "overview":
            ov = overview(rows)
        elif k == "queries":
            queries, _ = table_counts(rows, QUERY_COLS)
        else:
            pages, _ = table_counts(rows, PAGE_COLS)
            pages = [(u, n) for u, n in pages if a.site in u]
    text = report(a.site, ov, queries, pages)
    public = {"site": a.site, "source": "Bing Webmaster Tools · AI Performance（手动导出）", "overview": ov,
              "grounding_queries": len(queries), "grounding_query_citations": sum(n for _, n in queries),
              "pages": [{"url": u, "citations": n} for u, n in pages]}
    out = a.public
    if out == "auto":
        out = str(PANEL / f"bing-ai-{ov.get('last', date.today().isoformat())}.json")
    if out:
        Path(out).write_text(json.dumps(public, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    if a.out:
        Path(a.out).write_text(text, encoding="utf-8")
    print(text)
    return 0


def selftest() -> int:
    rows = [{"Date": f"{m}/{d}/2026 12:00:00 AM", "Citations": str(c), "Cited Pages": str(p)}
            for m, d, c, p in [(10, 30, 10, 2), (10, 31, 20, 4)] + [(11, d, 7, 3) for d in range(1, 15)]]
    ov = overview(rows)
    assert ov["total_citations"] == 30 + 98 and ov["days"] == 16 and ov["last"] == "2026-11-14", ov
    assert ov["months"]["2026-10"] == {"citations": 30, "days": 2, "cited_pages_max": 4, "per_day": 15.0, "cited_pages_per_day": 3.0}, ov
    assert [w["citations"] for w in ov["weeks"]] == [49, 49] and ov["weeks"][-1]["to"] == "2026-11-14", ov["weeks"]
    assert kind_of(["Date", "Citations", "Cited Pages"]) == "overview" and kind_of(["Grounding Query", "Citations"]) == "queries"
    assert kind_of(["Page", "Citations"]) == "pages"
    try:
        kind_of(["Foo"])
        raise AssertionError("认不出的表头要报错")
    except SystemExit:
        pass
    q, total = table_counts([{"Grounding Query": "stripe china", "Citations": "3"}, {"Grounding Query": "mor fees", "Citations": "5"}], QUERY_COLS)
    assert q == [("mor fees", 5), ("stripe china", 3)] and total == 8
    text = report("jasonzhu.ai", ov, q, [])
    assert "| 2026-10 | 30 | 15.0 | 3.0 / 4 | 2 |" in text and "mor fees：5" in text, text
    pub = {"grounding_queries": len(q)}
    assert "stripe" not in json.dumps(pub)
    print("bing_ai selftest ok")
    return 0


def main() -> int:
    if "--selftest" in sys.argv:
        return selftest()
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    sub = ap.add_subparsers(dest="cmd", required=True)
    r = sub.add_parser("run", help="导入一个站的 AI Performance 导出")
    r.add_argument("files", nargs="+", help="导出的 CSV（概览、搜索词、页面，给几份都行）")
    r.add_argument("--site", required=True)
    r.add_argument("--public", help="计数文件路径；auto = ops/geo/panel/bing-ai-<最后一天>.json")
    r.add_argument("--out", help="本地报告（markdown）")
    return cmd_run(ap.parse_args())


if __name__ == "__main__":
    sys.exit(main())
