#!/usr/bin/env python3
"""水表的「曝光层」，和点击层一起按品牌词 / 非品牌词拆开（2026-11-26 起，每月一次）。

为什么拆：品牌词的流量跟着名气涨，不算 SEO 的成绩；成绩看非品牌（《Product-Led SEO》p137）。曝光又比点击早，
是新页起作用最早看得到的信号（p90、p167）。所以水表在点击层前面加一层曝光，两层都分品牌、非品牌。

口径（Search Console，sc-domain:jasonzhu.ai，网页搜索）：
  总数   不带维度查：含 Google 隐去的匿名查询，是全部。
  品牌   按搜索词查到的词里，命中 BRAND 的（jasonzhu、jason zhu、祝彦森、gosail……）。
  非品牌 按搜索词查到的其余的词。
  带操作符的（site:、引号、减号……）是排名监控工具在跑，不是人，单列，不进品牌和非品牌（和数据日报 fetch_gsc.py 同一个规则）。
  匿名   总数减去按词查到的全部：Google 不给词，分不了品牌不品牌，单列。
改了 BRAND 的写法，前后几个月就不能比；要改就在 lineage 里记一笔。

凭证：和数据日报一样，环境变量 GSC_TOKEN_JSON，本地是 ops/analytics/.secrets/gsc_token.json。只读，不花钱。
公开文件只有计数，没有搜索词：ops/geo/panel/brand-split-<年-月>.json。

用法：
  python3 ops/geo/brand_split.py --selftest
  python3 ops/geo/brand_split.py run --month 2026-10 --public ops/geo/panel/brand-split-2026-10.json
  python3 ops/geo/brand_split.py run --prev --public auto --appendix /tmp/brand.md   # 上个整月（工作流每月第一个周一）
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from datetime import date, timedelta
from pathlib import Path

GEO = Path(__file__).resolve().parent
PANEL = GEO / "panel"
BRAND = re.compile(r"jason\s*-?\s*zhu|jasonzhu|祝彦森|朱彦森|zhu\s*yansen|yansen|gosail|go\s*sail", re.I)
PAGE = 25000            # Search Console 每次最多给这么多行


def is_brand(q: str) -> bool:
    return bool(BRAND.search(q or ""))


def month_range(month: str) -> tuple[date, date]:
    y, m = map(int, month.split("-"))
    start = date(y, m, 1)
    end = (date(y + (m == 12), m % 12 + 1, 1)) - timedelta(days=1)
    return start, end


def split(total: dict, rows: list[dict], is_operator) -> dict:
    """total：不带维度的总数；rows：按搜索词的行。返回各类的点击、曝光和占比。"""
    out = {k: {"clicks": 0, "impressions": 0, "queries": 0} for k in ("brand", "nonbrand", "operator")}
    for r in rows:
        k = "operator" if is_operator(r["query"]) else ("brand" if is_brand(r["query"]) else "nonbrand")
        out[k]["clicks"] += r["clicks"]
        out[k]["impressions"] += r["impressions"]
        out[k]["queries"] += 1
    seen = {m: sum(out[k][m] for k in out) for m in ("clicks", "impressions")}
    out["anonymized"] = {m: max(0, total[m] - seen[m]) for m in ("clicks", "impressions")}
    out["total"] = {m: total[m] for m in ("clicks", "impressions")}
    known = {m: out["brand"][m] + out["nonbrand"][m] for m in ("clicks", "impressions")}
    out["nonbrand_share"] = {m: round(out["nonbrand"][m] / known[m], 4) if known[m] else None for m in ("clicks", "impressions")}
    out["anonymized_share"] = {m: round(out["anonymized"][m] / total[m], 4) if total[m] else None for m in ("clicks", "impressions")}
    return out


def lines(month: str, start: date, end: date, s: dict, prev: dict | None = None) -> list[str]:
    pc = lambda x: "—" if x is None else f"{round(x * 100)}%"
    out = [f"### 水表 · 曝光层和点击层：品牌词 / 非品牌词（{month}，{start} 至 {end}）", "",
           "| | 曝光 | 点击 |", "|---|---|---|"]
    for k, name in (("total", "全部"), ("nonbrand", "非品牌"), ("brand", "品牌"), ("anonymized", "匿名（Google 不给词）"),
                    ("operator", "带操作符（排名工具）")):
        out.append(f"| {name} | {s[k]['impressions']:,} | {s[k]['clicks']:,} |")
    out += ["", f"能分的部分里非品牌占：曝光 {pc(s['nonbrand_share']['impressions'])}、点击 {pc(s['nonbrand_share']['clicks'])}；"
            f"匿名占全部的：曝光 {pc(s['anonymized_share']['impressions'])}、点击 {pc(s['anonymized_share']['clicks'])}。"]
    if prev:
        d = lambda k, m: s[k][m] - prev[k][m]
        out.append(f"比上个月：非品牌曝光 {d('nonbrand', 'impressions'):+,}、非品牌点击 {d('nonbrand', 'clicks'):+,}；"
                   f"品牌曝光 {d('brand', 'impressions'):+,}、品牌点击 {d('brand', 'clicks'):+,}。")
    out += ["成绩看非品牌；品牌那行跟着名气走。匿名那部分分不了，只看它的占比变没变。", ""]
    return out


def fetch(start: date, end: date) -> tuple[dict, list[dict], object]:
    sys.path.insert(0, str(GEO.parent / "analytics"))
    import fetch_gsc as g     # noqa: E402  数据日报同一套凭证和操作符规则
    s = g.session()
    if not s:
        raise SystemExit("没有 Search Console 凭证：设 GSC_TOKEN_JSON，或放 ops/analytics/.secrets/gsc_token.json")
    url = f"{g.API}/sites/{g.quote(g.SITE, safe='')}/searchAnalytics/query"
    base = {"startDate": str(start), "endDate": str(end), "type": "web"}
    r = s.post(url, json=base, timeout=60)
    r.raise_for_status()
    t = (r.json().get("rows") or [{"clicks": 0, "impressions": 0}])[0]
    rows, offset = [], 0
    while True:
        r = s.post(url, json=base | {"dimensions": ["query"], "rowLimit": PAGE, "startRow": offset}, timeout=120)
        r.raise_for_status()
        got = r.json().get("rows") or []
        rows += [{"query": x["keys"][0], "clicks": x["clicks"], "impressions": x["impressions"]} for x in got]
        if len(got) < PAGE:
            break
        offset += PAGE
    return {"clicks": t["clicks"], "impressions": t["impressions"]}, rows, g.is_operator


def cmd_run(a) -> int:
    if a.prev:
        first = date.today().replace(day=1) - timedelta(days=1)
        month = first.strftime("%Y-%m")
    else:
        month = a.month
    start, end = month_range(month)
    partial = end > date.today() - timedelta(days=3)          # Search Console 约晚 2–3 天：没过完的月只取到能取的那天
    end = min(end, date.today() - timedelta(days=3))
    total, rows, is_operator = fetch(start, end)
    s = split(total, rows, is_operator)
    prev_month = (start - timedelta(days=1)).strftime("%Y-%m")
    prev_file = PANEL / f"brand-split-{prev_month}.json"
    prev_doc = json.loads(prev_file.read_text(encoding="utf-8")) if prev_file.exists() else None
    prev = prev_doc["split"] if prev_doc and not partial and not prev_doc.get("partial") else None   # 不完整的月不和上月比
    text = "\n".join(lines(month, start, end, s, prev))
    public = {"month": month, "window": [str(start), str(end)], "partial": partial, "site": "sc-domain:jasonzhu.ai", "search_type": "web",
              "brand_pattern": BRAND.pattern, "split": s}
    out = a.public if a.public != "auto" else str(PANEL / f"brand-split-{month}.json")
    if out:
        Path(out).write_text(json.dumps(public, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    if a.appendix:
        Path(a.appendix).write_text(text + "\n", encoding="utf-8")
    print(text)
    return 0


def selftest() -> int:
    assert is_brand("jasonzhu ai") and is_brand("Jason Zhu GoSail") and is_brand("祝彦森") and is_brand("jason-zhu")
    assert not is_brand("best ai video generator") and not is_brand("zhuque") and not is_brand("json")
    assert month_range("2026-12") == (date(2026, 12, 1), date(2026, 12, 31)) and month_range("2026-02")[1] == date(2026, 2, 28)
    op = lambda q: q.startswith("site:")
    rows = [{"query": "jasonzhu", "clicks": 5, "impressions": 50}, {"query": "stripe china", "clicks": 3, "impressions": 300},
            {"query": "site:jasonzhu.ai", "clicks": 0, "impressions": 40}, {"query": "fable 5.5", "clicks": 1, "impressions": 100}]
    s = split({"clicks": 12, "impressions": 700}, rows, op)
    assert s["brand"] == {"clicks": 5, "impressions": 50, "queries": 1} and s["nonbrand"]["impressions"] == 400, s
    assert s["operator"]["impressions"] == 40 and s["anonymized"] == {"clicks": 3, "impressions": 210}, s
    assert s["nonbrand_share"] == {"clicks": round(4 / 9, 4), "impressions": round(400 / 450, 4)}, s
    text = "\n".join(lines("2026-10", date(2026, 10, 1), date(2026, 10, 31), s, s))
    assert "| 非品牌 | 400 | 4 |" in text and "匿名占全部的：曝光 30%" in text and "非品牌曝光 +0" in text, text
    assert "stripe" not in json.dumps(s), "公开文件不能带搜索词"
    print("brand_split selftest ok")
    return 0


def main() -> int:
    if "--selftest" in sys.argv:
        return selftest()
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    sub = ap.add_subparsers(dest="cmd", required=True)
    r = sub.add_parser("run", help="拆一个月的品牌词 / 非品牌词")
    g = r.add_mutually_exclusive_group(required=True)
    g.add_argument("--month", help="YYYY-MM")
    g.add_argument("--prev", action="store_true", help="上个整月")
    r.add_argument("--public", help="计数文件路径；auto = ops/geo/panel/brand-split-<月>.json")
    r.add_argument("--appendix", help="邮件里看的部分（markdown）")
    return cmd_run(ap.parse_args())


if __name__ == "__main__":
    sys.exit(main())
