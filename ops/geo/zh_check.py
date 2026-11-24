#!/usr/bin/env python3
"""每月一次：用中文问的时候，AI 用什么语言去搜、引不引中文页、引不引本站。

背景（2026-11-23 手动测了三轮，见 PANEL.md）：真实问法组 30 题翻成中文去问，ChatGPT 238 条搜索词里 237 条是英文，
和英文提问搜的几乎是同一批词；换成新加坡地区加中文界面还是 99.6% 英文。Claude 会中英各搜一条，75% 英文，
引用的网页里 24% 是中文页（知乎最多）。Perplexity 不给搜索词。结论是：中文用户问 AI 出海问题，答案主要引英文页。
这一步每月复查一次，看这个结论变没变。

只问两家：ChatGPT（抓网页界面）每题 3 次、Claude（接口，开联网搜索）每题 1 次，走 backlink-guard 的 asked，
和面板同一条路（美国地区、英文界面）。一次约 $1.8（ChatGPT 90 × ~$0.0046，Claude 30 × ~$0.045）。

怎么判断中文页：网址里有 /zh/、/cn/、lang=zh，或是知乎、CSDN、什么值得买这类中文站。Claude 给的是网页原标题，
标题里有中文也算；ChatGPT 界面会把来源标题翻成用户的语言（stripe.com/global 显示成「Stripe 全球支持地区」），只看网址。

报告只进邮件（--appendix），里面有搜索词原文；--public 只写计数，标准输出也只打计数（Actions 日志是公开的）；
--archive 是完整结果（含回答原文），由工作流加密后放进草稿 release。

用法：
  python3 ops/geo/zh_check.py --selftest
  python3 ops/geo/zh_check.py run --max-usd 3 --date 2026-12-07 --public ops/geo/panel/zh-2026-12-07.json \\
      --appendix zh.md --archive zh-full.json
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from collections import Counter
from datetime import datetime
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import panel_run as pr  # noqa: E402

QUESTIONS = pr.GEO / "questions-real-zh.json"
PLAN = (("chatgpt", 3), ("claude", 1))
TITLE_OK = {"claude", "perplexity"}     # 这几家给的是网页原标题
CJK = re.compile(r"[㐀-鿿豈-﫿]")
LATIN = re.compile(r"[A-Za-z]")
ZH_PATH = re.compile(r"/(zh([-_](cn|hans|hant|tw|hk))?|cn)(/|$|\?)|[?&](lang|hl|locale)=zh", re.I)
CN_SITES = re.compile(r"(\.cn|\.tw|\.hk)$|(^|\.)(zhihu\.com|csdn\.net|juejin\.cn|sohu\.com|163\.com|qq\.com|bilibili\.com|baidu\.com|"
                      r"jianshu\.com|cnblogs\.com|segmentfault\.com|36kr\.com|sspai\.com|woshipm\.com|xiaohongshu\.com|douban\.com|"
                      r"weibo\.com|v2ex\.com|toutiao\.com|smzdm\.com)$")


def lang(q: str) -> str:
    return "zh" if CJK.search(q) else ("en" if LATIN.search(q) else "other")


def chinese_page(p: dict, use_title: bool) -> bool:
    site, url, title = (p.get("site") or "").lower(), p.get("url") or "", p.get("title") or ""
    return (use_title and bool(CJK.search(title))) or bool(ZH_PATH.search(url)) or bool(CN_SITES.search(site))


def stats(rows: list[dict], engine: str) -> dict:
    rs = [r for r in rows if r["engine"] == engine]
    fo = [r for r in rs if r.get("fan_out")]
    qs = [str(q) for r in fo for q in r["fan_out"]]
    pages = [p for r in rs for p in (r.get("cited") or [])]
    zh_page = [chinese_page(p, engine in TITLE_OK) for p in pages]
    ours = Counter((p.get("url") or "").split("?")[0] for p in pages if "jasonzhu.ai" in ((p.get("site") or "") + (p.get("url") or "")))
    return {"answers": len(rs), "with_searches": len(fo), "searches": len(qs),
            "en_search_pct": round(100 * sum(lang(q) == "en" for q in qs) / len(qs), 1) if qs else None,
            "answers_any_en_pct": round(100 * sum(any(lang(q) == "en" for q in r["fan_out"]) for r in fo) / len(fo), 1) if fo else None,
            "cited_pages": len(pages), "chinese_page_pct": round(100 * sum(zh_page) / len(pages), 1) if pages else None,
            "answers_citing_us": sum(1 for r in rs if r.get("cited_you")),
            "our_zh_pages": sum(n for u, n in ours.items() if "/zh" in u), "our_en_pages": sum(n for u, n in ours.items() if "/en" in u),
            "chinese_searches": [q for q in qs if lang(q) == "zh"][:5]}


def report(day: str, st: dict, cost: float, left_out: int, errors: int) -> str:
    out = [f"## 中文提问：AI 用什么语言搜（每月一次，{day}）", "",
           f"真实问法组 30 题的中文版，ChatGPT 每题 3 次、Claude 每题 1 次，花费 ${cost:.2f}"
           + (f"，{left_out} 个没问（预算）" if left_out else "") + (f"，{errors} 个报错" if errors else "") + "。"
           "上次（2026-11-23 手动测）：ChatGPT 99.6% 英文、引用中文页 2.5%；Claude 75% 英文、引用中文页 24%。", "",
           "| | 回答 | 搜了的 | 搜索词 | 英文占比 | 至少搜一次英文 | 引用的网页 | 其中中文页 | 引用本站的回答（中文页 / 英文页次数） |",
           "|---|---|---|---|---|---|---|---|---|"]
    for e, _ in PLAN:
        s = st[e]
        pct = lambda v: "—" if v is None else f"{v}%"
        out.append(f"| {pr.LABEL.get(e, e)} | {s['answers']} | {s['with_searches']} | {s['searches']} | {pct(s['en_search_pct'])} | "
                   f"{pct(s['answers_any_en_pct'])} | {s['cited_pages']} | {pct(s['chinese_page_pct'])} | "
                   f"{s['answers_citing_us']}（{s['our_zh_pages']} / {s['our_en_pages']}） |")
    zh = [(pr.LABEL.get(e, e), q) for e, _ in PLAN for q in st[e]["chinese_searches"]]
    out += ["", "中文搜索词举例：" + ("；".join(f"{e}：{q}" for e, q in zh) if zh else "没有，全是英文。")]
    return "\n".join(out) + "\n"


def cmd_run(a) -> int:
    try:
        from backlink_guard import asked as bg
    except ImportError:
        raise SystemExit('没装 backlink-guard：pip install "backlink-guard>=0.12"')
    qs = json.loads(QUESTIONS.read_text(encoding="utf-8"))["questions"]
    if a.limit:
        qs = qs[:a.limit]
    by_text = {q["question"]: q for q in qs}
    spent, answers, errors, left = 0, [], [], []
    for engine, n in PLAN:
        res = bg.asked(pr.OWN, list(by_text), names=pr.NAMES, engines=[engine], samples=n,
                       max_usd=max(a.max_usd - spent / 1e6, 0.0), fresh=True)
        spent += res["cost"]
        answers += [x | {"question_id": by_text[x["question"]]["id"]} for x in res["answers"] if x["question"] in by_text]
        errors += res["errors"]
        left += res["left_out"]
    ok = [r for r in answers if not r.get("left_out") and not r.get("error")]
    st = {e: stats(ok, e) for e, _ in PLAN}
    day = a.date or datetime.now(pr.CST).strftime("%Y-%m-%d")
    counts = {"date": day, "cost_usd": round(spent / 1e6, 4), "left_out": len(left), "errors": len(errors),
              "by_engine": {e: {k: v for k, v in s.items() if k != "chinese_searches"} | {"chinese_searches": len(s["chinese_searches"])}
                            for e, s in st.items()}}
    if not a.dry:
        if a.appendix:
            Path(a.appendix).write_text(report(day, st, spent / 1e6, len(left), len(errors)), encoding="utf-8")
        if a.public:
            Path(a.public).parent.mkdir(parents=True, exist_ok=True)
            Path(a.public).write_text(json.dumps(counts, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
        if a.archive:
            Path(a.archive).write_text(json.dumps({"answers": answers, "errors": errors, "left_out": left}, ensure_ascii=False),
                                       encoding="utf-8")
    c = st["chatgpt"]
    print(f"中文提问：ChatGPT {c['with_searches']}/{c['answers']} 个回答搜了，英文搜索词 {c['en_search_pct']}%；"
          f"Claude 英文 {st['claude']['en_search_pct']}%；花费 ${spent / 1e6:.2f}，没问 {len(left)}，报错 {len(errors)}"
          + ("（--dry：什么都没写）" if a.dry else ""))
    # 一个回答都没拿到就算失败，别让「0%」当成结果
    return 0 if ok else 1


def selftest() -> int:
    rows = [{"engine": "chatgpt", "fan_out": ["Stripe supported countries China", "Stripe 中国 收款"], "cited_you": True,
             "cited": [{"site": "stripe.com", "url": "https://stripe.com/global", "title": "Stripe 全球支持地区"},
                       {"site": "jasonzhu.ai", "url": "https://jasonzhu.ai/zh/go-global/open-account?utm_source=chatgpt.com"}]},
            {"engine": "chatgpt", "fan_out": [], "cited": []},
            {"engine": "claude", "fan_out": ["Mercury 非美国居民 开户"], "cited_you": False,
             "cited": [{"site": "warpnav.com", "url": "https://warpnav.com/x", "title": "独立开发者收款平台怎么选"}]}]
    c, k = stats(rows, "chatgpt"), stats(rows, "claude")
    assert c["searches"] == 2 and c["en_search_pct"] == 50.0 and c["answers_any_en_pct"] == 100.0, c
    assert c["chinese_page_pct"] == 50.0, c          # 翻译过的标题不算，/zh/ 网址算
    assert c["answers_citing_us"] == 1 and c["our_zh_pages"] == 1 and c["our_en_pages"] == 0, c
    assert k["en_search_pct"] == 0.0 and k["chinese_page_pct"] == 100.0 and k["chinese_searches"] == ["Mercury 非美国居民 开户"], k
    text = report("2026-12-07", {"chatgpt": c, "claude": k}, 1.8, 0, 0)
    assert "| ChatGPT | 2 | 1 | 2 | 50.0% |" in text and "Mercury 非美国居民 开户" in text, text
    qs = json.loads(QUESTIONS.read_text(encoding="utf-8"))["questions"]
    assert len(qs) == 30 and all(q["id"].startswith("zh-") and CJK.search(q["question"]) for q in qs)
    print("selftest ok")
    return 0


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("--selftest", action="store_true")
    sub = ap.add_subparsers(dest="cmd")
    r = sub.add_parser("run")
    r.add_argument("--max-usd", type=float, default=3.0)
    r.add_argument("--date", default="")
    r.add_argument("--limit", type=int, default=0)
    r.add_argument("--public")
    r.add_argument("--appendix")
    r.add_argument("--archive")
    r.add_argument("--dry", action="store_true")
    a = ap.parse_args()
    if a.selftest:
        return selftest()
    if a.cmd == "run":
        return cmd_run(a)
    ap.print_help()
    return 1


if __name__ == "__main__":
    sys.exit(main())
