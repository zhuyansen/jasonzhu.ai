#!/usr/bin/env python3
"""AI 爬虫与 AI 引用公开数据集（/research/ai-crawlers）的生成脚本。每月跑一次，可以重复跑。只用标准库。

读两样东西，只往外写汇总数：
  1. Supabase 视图 public.ai_crawler_all（通过 ops/geo/crawler_db.py：CI 走 REST + SUPABASE_SERVICE_KEY，本机回退 supabase db query）：
     2026-11-26 13:35 UTC 之前是 GEOInflow 导出的历史（ai_crawler_daily，保留旧标签），之后是 Vercel Log Drain 实时核验写入的长期表
     （ai_crawler_hits，按官方每日刷新的 IP 段或反向 DNS 核验），按 UTC 日、月汇总。
  2. 仓库里的 GEO 引用面板结果 ops/geo/panel/results-*.json：每家 AI 引用本站的回答数，和按题算的 95% 区间。
     区间直接调 panel_run.py 的 rate / cluster_ci，和周报摘要是同一个算法、同一个随机种子，数字对得上。
     GA4 里 AI 带来的访问只用结果文件里已经公开的 ai_referrals（总数、按来源），来源写成 AI 的名字，不写域名。

写三样东西：
  src/generated/ai-crawler-stats.json                 页面数据（页面只能 import 这里，不能用 fs 读 public/）
  public/data/ai-crawlers/ai-crawlers-YYYY-MM.csv     每月一份：每天 × 每个爬虫一行
  public/data/ai-crawlers/ai-crawlers-latest.json     全部汇总（全英文，给下载、给 AI 读；逐日明细在 CSV 里）

怎么跑（在仓库根目录；查不到数据库就报错退出，不会写出空数据）：
  python3 -I ops/geo/crawler_stats.py                      # 数据截到昨天（UTC），写全部文件
  python3 -I ops/geo/crawler_stats.py --until 2026-12-01   # 截止日（不含）。每月 1 日跑，就是上个月整月
  python3 -I ops/geo/crawler_stats.py --dry                # 只算、打印要点，不写文件
  python3 -I ops/geo/crawler_stats.py --selftest           # 不连数据库的自检
同一个截止日重跑，输出逐字节相同；截止日变了，changelog 自动记一条。跑完照常 tsc、build，提交这三样文件。

绝不公开（脚本也不查这些列）：IP（ip_prefix）、User-Agent 原文、地理位置、单条日志和精确时间、
完整网址和查询参数（只取语言前缀之后的第一段路径，问号、井号后面全部丢掉；不是本站栏目的路径合成一项）；
面板的回答原文、搜索词、别的网站的网址（只用打分字段的计数）；GA4 的落地页。
写文件前再扫一遍输出：出现像 IP 的字符串、带问号的路径、页面以外的中文，就报错退出。
"""
from __future__ import annotations

import argparse
import csv
import importlib.util
import io
import json
import math
import re
import sys
from collections import Counter, defaultdict
from datetime import date, datetime, timedelta, timezone
from pathlib import Path

GEO = Path(__file__).resolve().parent
sys.path.insert(0, str(GEO))
import crawler_db as db  # noqa: E402

REPO = GEO.parent.parent
PANEL_DIR = GEO / "panel"
OUT_PAGE = REPO / "src" / "generated" / "ai-crawler-stats.json"
OUT_DIR = REPO / "public" / "data" / "ai-crawlers"
LATEST_NAME = "ai-crawlers-latest.json"
SITE = "https://jasonzhu.ai"
PAGE_PATH = "/research/ai-crawlers"
DATA_URL = "/data/ai-crawlers"
DATASET_NAME = "AI crawler traffic and AI answer citations on jasonzhu.ai"

# bot_type → 英文代码。前三类合起来叫「AI 爬虫」
TYPE = {"训练": "training", "搜索": "ai_search", "用户触发": "user_triggered", "传统搜索": "search_engine", "其他": "other"}
TYPE_ORDER = ("ai_search", "training", "user_triggered", "search_engine", "other")
AI_TYPES = ("ai_search", "training", "user_triggered")
# 公司名里的中文翻成英文；没翻的中文名会让脚本报错停住（英文页和下载文件里不能有中文）
VENDOR = {"字节跳动": "ByteDance", "搜狗": "Sogou", "百度": "Baidu", "360": "Qihoo 360", "其他": "Unknown", "": "Unknown"}
BOT = {"其他": "Unmapped"}   # 认不出是谁的爬虫（UA 像爬虫，但没对上任何已知的官方身份）

# reason → 下载文件里的列。历史数据沿用 GEOInflow verification_reason；新表新增反向 DNS 核验（verified_rdns / rdns_mismatch），
# 归入已核实 / 核验未通过两列以保持输出结构不变。出现表里没有的原因就报错停住：先想清楚怎么归类，再改这张表和页面上的说明。
VERIFY = {
    "verified_range": "verified_in_published_ranges",
    "verified_rdns": "verified_in_published_ranges",
    "range_mismatch": "outside_published_ranges",
    "rdns_mismatch": "outside_published_ranges",
    "stale_snapshot": "unverified_stale_range_list",
    "no_official_source": "unverified_no_published_ranges",
    "unmapped_identity": "unverified_unmapped_bot",
    "ambiguous_name": "unverified_unmapped_bot",
    "missing_snapshot": "unverified_other",
    "invalid_snapshot": "unverified_other",
    "missing_or_stale_snapshot": "unverified_other",
    "untrusted_ip": "unverified_other",
    "dns_missing_input": "unverified_other",
    "dns_timeout": "unverified_other",
    "dns_unavailable": "unverified_other",
    "dns_budget_exhausted": "unverified_other",
    "": "unverified_other",
}
VERIFY_COLS = ("verified_in_published_ranges", "outside_published_ranges", "unverified_stale_range_list",
               "unverified_no_published_ranges", "unverified_unmapped_bot", "unverified_other")
STATUS_COLS = ("status_2xx", "status_3xx", "status_4xx", "status_5xx", "status_other")
CSV_HEAD = ("date", "day_coverage", "vendor", "bot", "bot_type", "requests") + VERIFY_COLS + STATUS_COLS

# 常被讨论的「给机器读的文件」：本站有没有、谁来读。有几个本站没有（llms-full.txt、ai.txt），照样记来访次数
MACHINE_FILES = ("/robots.txt", "/sitemap.xml", "/llms.txt", "/llms-full.txt", "/ai.txt", "/agents.md",
                 "/.well-known/mcp/server-card.json")
TOP_SECTIONS = 14
NOT_SITE = "(not a site path)"
LANGS = ("zh", "en")

# 面板
ENGINE_ORDER = ("chatgpt", "gemini_app", "ai_mode", "perplexity", "claude")
ENGINE_LABEL = {"chatgpt": "ChatGPT", "gemini_app": "Gemini App", "ai_mode": "Google AI Mode", "perplexity": "Perplexity",
                "claude": "Claude"}
SURFACE_EN = {"scraper": "web interface (logged out, US English)", "serp": "Google search results page (US English)",
              "llm": "API with web search"}
CALIBERS = ("site_cited", "page_cited", "named")
SET_LABEL = {"frozen": "Fixed set", "real": "Real-world phrasing set", "gsc": "Search Console query set",
             "grid": "Payments grid set"}
# GA4 的来源域名 → AI 名字（页面和下载文件不写域名）
REFERRER = (("chatgpt.com", "ChatGPT"), ("chat.openai.com", "ChatGPT"), ("claude.ai", "Claude"), ("perplexity.ai", "Perplexity"),
            ("gemini.google.com", "Gemini"), ("copilot.microsoft.com", "Copilot"), ("deepseek.com", "DeepSeek"),
            ("doubao.com", "Doubao"), ("kimi.com", "Kimi"), ("kimi.moonshot.cn", "Kimi"), ("grok.com", "Grok"),
            ("you.com", "You.com"), ("phind.com", "Phind"), ("poe.com", "Poe"), ("metaso.cn", "Metaso"),
            ("yuanbao.tencent.com", "Yuanbao"))
# 用户触发的抓取和 GA4 访问对着看：哪家 AI 的访问对应哪个公司的用户触发爬虫
ASSISTANT_VENDOR = {"ChatGPT": "OpenAI", "Claude": "Anthropic", "Perplexity": "Perplexity"}

CJK = re.compile(r"[　-鿿＀-￯]")
IPV4 = re.compile(r"(?<![\d.])(?:\d{1,3}\.){3}\d{1,3}(?![\d.])")
IPV6 = re.compile(r"\b[0-9a-f]{1,4}(?::[0-9a-f]{0,4}){4,7}\b", re.I)


class Abort(Exception):
    """上游有问题：停住、不写文件（不要当成 0 条写出去）。"""


# ───────────── 小工具（自检覆盖） ─────────────

def status_class(code: int) -> str:
    for lo, col in ((200, "status_2xx"), (300, "status_3xx"), (400, "status_4xx"), (500, "status_5xx")):
        if lo <= code <= lo + 99:
            return col
    return "status_other"


def verify_col(reason: str | None) -> str:
    r = reason or ""
    if r not in VERIFY:
        raise Abort(f"不认识的核验原因 {r!r}：先在 VERIFY 里归类，再改页面上的说明")
    return VERIFY[r]


def section_of(seg1: str, seg2: str, known: set[str]) -> str:
    """路径（已去掉问号、井号后面）的第一、二段 → 栏目。/zh/、/en/ 开头的取语言之后那段；首页是「/」；
    不是本站栏目的（扫描器乱试的路径、旧链接）合成一项。"""
    seg = seg2 if seg1 in LANGS else seg1
    if seg == "":
        return "/"
    return "/" + seg if seg in known else NOT_SITE


def site_sections(repo: Path = REPO) -> set[str]:
    """本站真有的第一段路径：app/[lang] 下的栏目、app 下的根路由、public 下的顶层文件和目录，加上 _next。
    从文件系统现读，加了新栏目不用改脚本。IndexNow 的 key 文件（32 位十六进制 .txt）不算栏目。"""
    known = {"_next"}
    app = repo / "src" / "app"
    for p in (app / "[lang]").iterdir():
        if p.is_dir() and not p.name.startswith(("[", "(", "_")):
            known.add(p.name)
    for p in app.iterdir():
        if p.name.startswith(("[", "(", "_")) or p.suffix in (".css", ".tsx"):
            continue
        name = {"sitemap.ts": "sitemap.xml", "robots.ts": "robots.txt"}.get(p.name, p.name)
        known.add(name)
    for p in (repo / "public").iterdir():
        if re.fullmatch(r"[0-9a-f]{32}\.txt", p.name) or p.name == ".DS_Store":
            continue
        known.add(p.name)
    return known


def month_of(day: str) -> str:
    return day[:7]


def month_days(month: str) -> tuple[date, date]:
    y, m = int(month[:4]), int(month[5:7])
    first = date(y, m, 1)
    nxt = date(y + (m == 12), m % 12 + 1, 1)
    return first, nxt - timedelta(days=1)


def referrer_label(source: str) -> str:
    s = source.lower()
    for dom, label in REFERRER:
        if s == dom or s.endswith("." + dom):
            return label
    return "Other AI assistant"


def privacy_scan(text: str, allow_cjk: bool = False) -> list[str]:
    """输出里不该有的东西：像 IP 的字符串、带问号的网址路径、（英文文件里的）中文。返回问题清单，空的才算过。"""
    bad = []
    if IPV4.search(text):
        bad.append(f"像 IPv4 的字符串：{IPV4.search(text).group(0)}")
    if IPV6.search(text):
        bad.append(f"像 IPv6 的字符串：{IPV6.search(text).group(0)}")
    if re.search(r'"/[^"\s]*\?', text):
        bad.append("带问号的路径")
    if not allow_cjk and CJK.search(text):
        bad.append(f"中文：{CJK.search(text).group(0)}")
    return bad


def pct_cell(hits: int, n: int, lo: float, hi: float) -> dict:
    """和 panel_run.pct_ci 一样取整：命中率向下取整，区间向外取整（不会比算出来的窄）。"""
    return {"hits": hits, "answers": n, "pct": hits * 100 // n,
            "ci_pct": [math.floor(lo * 100 + 1e-9), math.ceil(hi * 100 - 1e-9)]}


# ───────────── 爬虫日志 ─────────────

def query_db(sql: str) -> list[dict]:
    try:
        return db.query(sql)
    except db.DBError as e:
        raise Abort(f"Supabase 查询失败：{e}") from None


def fetch_logs(until: date) -> dict:
    """只查汇总，不查 IP、UA、地理位置、单条日志。时间一律 UTC。"""
    where = f"day < date {db.lit(until.isoformat())}"
    clean = "split_part(split_part(path, '?', 1), '#', 1)"
    span = query_db(
        f"SELECT to_char(min(first_at) AT TIME ZONE 'UTC', 'YYYY-MM-DD HH24:MI:SS.US') AS first, "
        f"coalesce(sum(n), 0) AS n FROM public.ai_crawler_all WHERE {where}"
    )
    hours = query_db(
        f"SELECT to_char(day, 'YYYY-MM-DD') AS day, "
        f"length(replace(bit_or(hour_mask)::bit(24)::text, '0', '')) AS hours "
        f"FROM public.ai_crawler_all WHERE {where} GROUP BY day"
    )
    main = query_db(
        f"SELECT to_char(day, 'YYYY-MM-DD') AS day, vendor, bot, bot_type, coalesce(reason, '') AS reason, "
        f"status, sum(n) AS n FROM public.ai_crawler_all WHERE {where} GROUP BY 1, 2, 3, 4, 5, 6"
    )
    # 不以 / 开头的路径（整条网址之类）第一段记成 ':'，本站没有这个栏目，落进「不是本站路径」
    sections = query_db(
        f"SELECT to_char(day, 'YYYY-MM') AS month, "
        f"CASE WHEN left({clean}, 1) = '/' THEN split_part({clean}, '/', 2) ELSE ':' END AS seg1, "
        f"CASE WHEN split_part({clean}, '/', 2) IN ('zh', 'en') THEN split_part({clean}, '/', 3) ELSE '' END AS seg2, "
        f"bot_type, status, sum(n) AS n FROM public.ai_crawler_all WHERE {where} GROUP BY 1, 2, 3, 4, 5"
    )
    files = ", ".join(db.lit(p) for p in MACHINE_FILES)
    machine = query_db(
        f"SELECT {clean} AS file, vendor, bot, bot_type, status, sum(n) AS n FROM public.ai_crawler_all "
        f"WHERE {where} AND {clean} IN ({files}) GROUP BY 1, 2, 3, 4, 5"
    )
    return {"span": span[0] if span else {"first": None, "n": 0}, "hours": hours, "main": main, "sections": sections, "machine": machine}


def english(name: str, table: dict[str, str], what: str) -> str:
    out = table.get(name, name)
    if CJK.search(out):
        raise Abort(f"{what}「{name}」没有英文名：加进 {'VENDOR' if table is VENDOR else 'BOT'} 表")
    return out


def build_crawl(raw: dict, until: date) -> dict:
    if not raw["main"] or int(raw["span"]["n"] or 0) == 0:
        raise Abort("Supabase 视图 ai_crawler_all 里没有 jasonzhu.ai 的记录：检查历史回填和 vercel-drain 链路")
    first_ts = datetime.fromisoformat(raw["span"]["first"]).replace(tzinfo=timezone.utc)
    first_day, last_day = first_ts.date(), until - timedelta(days=1)
    hours = {r["day"]: int(r["hours"]) for r in raw["hours"]}
    days, d = [], first_day
    while d <= last_day:
        days.append(d.isoformat())
        d += timedelta(days=1)
    gaps = [x for x in days if x not in hours]
    if gaps:
        raise Abort(f"这几天一条日志都没有：{', '.join(gaps[:5])}…（转发链路断过？先补数据再发布）")
    coverage = {}
    for x in days:
        if x == first_day.isoformat() and (first_ts.hour or first_ts.minute > 10):
            coverage[x] = "partial"            # 日志从这天中间才开始转进来
        else:
            coverage[x] = "full" if hours[x] == 24 else "partial"
    if coverage[days[-1]] != "full":
        raise Abort(f"最后一天 {days[-1]} 只有 {hours[days[-1]]} 个小时有数据：日志可能还没转完，过一会儿再跑，或把 --until 往前挪")

    per_bot_day: dict[tuple, Counter] = defaultdict(Counter)      # (day, vendor, bot, type) → 各列
    for r in raw["main"]:
        typ = TYPE.get(r["bot_type"])
        if not typ:
            raise Abort(f"不认识的 bot_type {r['bot_type']!r}：加进 TYPE 表")
        key = (r["day"], english(r["vendor"], VENDOR, "公司"), english(r["bot"], BOT, "爬虫"), typ)
        n = int(r["n"])
        c = per_bot_day[key]
        c["requests"] += n
        c[verify_col(r["reason"])] += n
        c[status_class(int(r["status"]))] += n

    # 每天 × 每个爬虫（CSV 和完整 JSON 用）
    daily_rows = []
    for (day, vendor, bot, typ), c in per_bot_day.items():
        daily_rows.append({"date": day, "day_coverage": coverage[day], "vendor": vendor, "bot": bot, "bot_type": typ,
                           "requests": c["requests"], **{k: c[k] for k in VERIFY_COLS + STATUS_COLS}})
    daily_rows.sort(key=lambda r: (r["date"], -r["requests"], r["bot"], r["vendor"]))

    def blank() -> dict:
        return {"requests": 0, "ai_requests": 0, "by_type": {t: 0 for t in TYPE_ORDER},
                "status": {k: 0 for k in STATUS_COLS}, "ai_status": {k: 0 for k in STATUS_COLS},
                "verification": {k: 0 for k in VERIFY_COLS}, "ai_verification": {k: 0 for k in VERIFY_COLS}}

    def add(agg: dict, r: dict) -> None:
        ai = r["bot_type"] in AI_TYPES
        agg["requests"] += r["requests"]
        agg["by_type"][r["bot_type"]] += r["requests"]
        if ai:
            agg["ai_requests"] += r["requests"]
        for k in STATUS_COLS:
            agg["status"][k] += r[k]
            if ai:
                agg["ai_status"][k] += r[k]
        for k in VERIFY_COLS:
            agg["verification"][k] += r[k]
            if ai:
                agg["ai_verification"][k] += r[k]

    totals, by_month, by_day = blank(), defaultdict(blank), defaultdict(lambda: {t: 0 for t in TYPE_ORDER})
    bots: dict[tuple, dict] = {}
    last7_start = (last_day - timedelta(days=6)).isoformat()
    last7: dict[tuple, int] = Counter()
    for r in daily_rows:
        add(totals, r)
        add(by_month[month_of(r["date"])], r)
        by_day[r["date"]][r["bot_type"]] += r["requests"]
        key = (r["vendor"], r["bot"], r["bot_type"])
        b = bots.setdefault(key, {"vendor": r["vendor"], "bot": r["bot"], "bot_type": r["bot_type"], "requests": 0,
                                  "verification": {k: 0 for k in VERIFY_COLS}, "status": {k: 0 for k in STATUS_COLS},
                                  "by_month": Counter(), "first_seen": r["date"], "last_seen": r["date"], "days_seen": 0})
        b["requests"] += r["requests"]
        b["days_seen"] += 1
        b["last_seen"] = max(b["last_seen"], r["date"])
        b["first_seen"] = min(b["first_seen"], r["date"])
        b["by_month"][month_of(r["date"])] += r["requests"]
        for k in VERIFY_COLS:
            b["verification"][k] += r[k]
        for k in STATUS_COLS:
            b["status"][k] += r[k]
        if r["date"] >= last7_start:
            last7[key] += r["requests"]

    months = []
    for m in sorted(by_month):
        lo, hi = month_days(m)
        m_days = [x for x in days if month_of(x) == m]
        partial = lo.isoformat() < m_days[0] or hi.isoformat() > m_days[-1] or any(coverage[x] != "full" for x in m_days)
        months.append({"month": m, "partial": partial, "first_day": m_days[0], "last_day": m_days[-1], "days": len(m_days),
                       **by_month[m]})

    bot_list = []
    for b in sorted(bots.values(), key=lambda b: (-b["requests"], b["bot"])):
        b["by_month"] = {m: b["by_month"][m] for m in sorted(b["by_month"])}
        bot_list.append(b)

    # 栏目：整段时间合计，取 AI 爬虫请求最多的 TOP_SECTIONS 个，其余本站栏目合成一项，「不是本站路径」单列
    known = site_sections()
    sec: dict[str, dict] = {}
    for r in raw["sections"]:
        name = section_of(r["seg1"], r["seg2"], known)
        typ = TYPE.get(r["bot_type"])
        s = sec.setdefault(name, {"section": name, "requests": 0, "ai_requests": 0, "by_type": {t: 0 for t in TYPE_ORDER},
                                  "status": {k: 0 for k in STATUS_COLS}, "ai_status": {k: 0 for k in STATUS_COLS}})
        n = int(r["n"])
        col = status_class(int(r["status"]))
        s["requests"] += n
        s["by_type"][typ] += n
        s["status"][col] += n
        if typ in AI_TYPES:
            s["ai_requests"] += n
            s["ai_status"][col] += n
    ranked = sorted((s for s in sec.values() if s["section"] != NOT_SITE), key=lambda s: (-s["ai_requests"], -s["requests"], s["section"]))
    sections = ranked[:TOP_SECTIONS]
    rest = ranked[TOP_SECTIONS:]
    if rest:
        other = {"section": "(other site sections)", "requests": 0, "ai_requests": 0, "by_type": {t: 0 for t in TYPE_ORDER},
                 "status": {k: 0 for k in STATUS_COLS}, "ai_status": {k: 0 for k in STATUS_COLS}}
        for s in rest:
            for k in ("requests", "ai_requests"):
                other[k] += s[k]
            for grp in ("by_type", "status", "ai_status"):
                for k in other[grp]:
                    other[grp][k] += s[grp][k]
        sections.append(other)
    if NOT_SITE in sec:
        sections.append(sec[NOT_SITE])
    sec_total = sum(s["requests"] for s in sec.values())
    if sec_total != totals["requests"]:
        raise Abort(f"栏目合计 {sec_total} 和总数 {totals['requests']} 对不上")

    # 给机器读的文件
    mf: dict[str, dict] = {p: {"file": p, "requests": 0, "ai_requests": 0, "status_2xx": 0, "status_4xx": 0, "by_bot": Counter()}
                           for p in MACHINE_FILES}
    for r in raw["machine"]:
        f = mf[r["file"]]
        n = int(r["n"])
        f["requests"] += n
        if TYPE.get(r["bot_type"]) in AI_TYPES:
            f["ai_requests"] += n
        col = status_class(int(r["status"]))
        if col in ("status_2xx", "status_4xx"):
            f[col] += n
        f["by_bot"][english(r["bot"], BOT, "爬虫")] += n
    machine = []
    for p in MACHINE_FILES:
        f = mf[p]
        f["by_bot"] = [[b, n] for b, n in sorted(f["by_bot"].items(), key=lambda kv: (-kv[1], kv[0]))]
        machine.append(f)

    daily = [{"date": x, "coverage": coverage[x], **{t: by_day[x][t] for t in TYPE_ORDER}} for x in days]
    last7_list = [{"vendor": v, "bot": b, "bot_type": t, "requests": n}
                  for (v, b, t), n in sorted(last7.items(), key=lambda kv: (-kv[1], kv[0][1]))]
    return {
        "coverage": {"timezone": "UTC", "first_day": days[0], "last_day": days[-1], "days": len(days),
                     "first_request_utc": first_ts.strftime("%Y-%m-%d %H:%M"),
                     "partial_days": [x for x in days if coverage[x] != "full"]},
        "totals": totals,
        "months": months,
        "bots": bot_list,
        "daily_by_type": daily,
        "sections": sections,
        "machine_files": machine,
        "last_7_days": {"first_day": last7_start, "last_day": days[-1], "bots": last7_list},
        "_daily_rows": daily_rows,
    }


# ───────────── 引用面板 ─────────────

def panel_module():
    spec = importlib.util.spec_from_file_location("panel_run", GEO / "panel_run.py")
    mod = importlib.util.module_from_spec(spec)
    sys.modules["panel_run"] = mod
    spec.loader.exec_module(mod)
    return mod


def build_citations(crawl: dict | None) -> dict:
    pr = panel_module()
    files = sorted(PANEL_DIR.glob("results-*.json"))
    if not files:
        raise Abort("ops/geo/panel/ 下没有 results-*.json")
    runs = []
    for f in files:
        d = json.loads(f.read_text(encoding="utf-8"))
        rows = pr.load_rows(f)
        if not rows:
            raise Abort(f"{f.name} 里没有回答行")
        run_sets = [s for s in ("frozen", "real", "gsc", "grid") if any(r.get("set") == s for r in rows)]
        ids = {s: {r["question_id"] for r in rows if r.get("set") == s} for s in run_sets}
        brand = {r["question_id"] for r in rows if r.get("kind") == "brand"}
        unbranded = {r["question_id"] for r in rows} - brand
        engines = []
        for e in pr.engines_in(rows):
            if e not in ENGINE_LABEL:
                continue
            kind, model = pr.surface_of(d, e)
            entry = {"engine": e, "label": ENGINE_LABEL[e], "surface": SURFACE_EN.get(kind, "unknown"),
                     "model": model if kind == "llm" else "", "samples": int((d.get("engines") or {}).get(e, 1)),
                     "sets": {}}
            for s in run_sets:
                cells = {}
                for c in CALIBERS:
                    hit, n = pr.rate(rows, e, c, ids[s])
                    if n:
                        lo, hi = pr.cluster_ci(rows, e, c, ids[s])
                        cells[c] = pct_cell(hit, n, lo, hi)
                if cells:
                    entry["sets"][s] = cells
            for name, group in (("branded", brand), ("unbranded", unbranded)):
                hit, n = pr.rate(rows, e, "site_cited", group)
                if n:
                    lo, hi = pr.cluster_ci(rows, e, "site_cited", group)
                    entry[name] = pct_cell(hit, n, lo, hi)
            engines.append(entry)
        engines.sort(key=lambda x: ENGINE_ORDER.index(x["engine"]))
        ref = d.get("ai_referrals")
        referrals = None
        if ref:
            by = Counter()
            for src, n in ref.get("sources", []):
                by[referrer_label(src)] += int(n)
            other = int(ref["total"]) - sum(by.values())
            if other > 0:
                by["Other AI assistant"] += other
            run_day = date.fromisoformat(d["date"])
            referrals = {"window_first_day": (run_day - timedelta(days=7)).isoformat(),
                         "window_last_day": (run_day - timedelta(days=1)).isoformat(),
                         "sessions": int(ref["total"]),
                         "by_assistant": [[k, n] for k, n in sorted(by.items(), key=lambda kv: (-kv[1], kv[0]))]}
            if crawl:
                referrals["user_triggered_fetches"] = fetches_in(crawl, referrals["window_first_day"], referrals["window_last_day"])
        runs.append({"date": d["date"], "baseline": "baseline" in f.name,
                     "questions": {s: len(ids[s]) for s in run_sets}, "brand_questions": len(brand),
                     "unbranded_questions": len(unbranded), "engines": engines, "ai_referrals": referrals})
    runs.sort(key=lambda r: r["date"])
    return {"runs": runs, "engines": [ENGINE_LABEL[e] for e in ENGINE_ORDER],
            "set_labels": SET_LABEL, "method": "panel_run.py cluster_ci (question-level bootstrap, 2,000 resamples, fixed seed)",
            "panel_days": panel_days(crawl, [r["date"] for r in runs]) if crawl else None}


PANEL_FETCHERS = ("ChatGPT-User", "Claude-User")   # 面板问的 AI 里，会替用户现场读页的爬虫


def panel_days(crawl: dict, run_dates: list[str]) -> dict:
    """面板运行那几天（UTC）这几个爬虫各读了多少次，和其余完整日子的中位数比：面板自己会让 AI 来读本站，
    页面的「局限」一段照这个写，不写死数字。"""
    cov = crawl["coverage"]
    per_day: dict[str, Counter] = defaultdict(Counter)
    for r in crawl["_daily_rows"]:
        if r["bot"] in PANEL_FETCHERS:
            per_day[r["date"]][r["bot"]] += r["requests"]
    panel = [d for d in sorted(set(run_dates)) if cov["first_day"] <= d <= cov["last_day"]]
    others = [d["date"] for d in crawl["daily_by_type"] if d["coverage"] == "full" and d["date"] not in panel]

    def median(xs: list[int]) -> int:
        s = sorted(xs)
        if not s:
            return 0
        mid = len(s) // 2
        return s[mid] if len(s) % 2 else round((s[mid - 1] + s[mid]) / 2)

    return {"bots": list(PANEL_FETCHERS),
            "days": [{"date": d, **{b: per_day[d][b] for b in PANEL_FETCHERS}} for d in panel],
            "median_other_days": {b: median([per_day[d][b] for d in others]) for b in PANEL_FETCHERS}}


def fetches_in(crawl: dict, first: str, last: str) -> dict | None:
    """这几天（UTC）每家公司用户触发的抓取次数；不全在数据范围里就是 None。"""
    cov = crawl["coverage"]
    if first < cov["first_day"] or last > cov["last_day"]:
        return None
    out = Counter()
    for r in crawl["_daily_rows"]:
        if first <= r["date"] <= last and r["bot_type"] == "user_triggered":
            out[r["vendor"]] += r["requests"]
    return {v: out.get(v, 0) for v in sorted(set(ASSISTANT_VENDOR.values()) | set(out))}


# ───────────── 写文件 ─────────────

def csv_text(rows: list[dict]) -> str:
    buf = io.StringIO()
    w = csv.DictWriter(buf, fieldnames=CSV_HEAD, lineterminator="\n")
    w.writeheader()
    for r in rows:
        w.writerow({k: r[k] for k in CSV_HEAD})
    return buf.getvalue()


def changelog(prev: dict | None, crawl: dict, cites: dict, release: str) -> list[dict]:
    """沿用上一次的 changelog；数据范围变了才加一条（同一截止日重跑不加，输出不变）。
    同一个截止日又跑了一次、数据范围却变了（比如面板多了一次），改写这一天那条，不加第二条。"""
    log = list((prev or {}).get("changelog") or [])
    cov = crawl["coverage"]
    panel_first, panel_last = cites["runs"][0]["date"], cites["runs"][-1]["date"]
    prev_cov = (prev or {}).get("coverage") or {}
    prev_runs = ((prev or {}).get("citations") or {}).get("runs") or [{}]
    if log and prev_cov.get("last_day") == cov["last_day"] and prev_runs[-1].get("date") == panel_last:
        return log
    log = [c for c in log if c["date"] != release]
    if not log:
        entry = {"date": release,
                 "en": f"First release. Crawler logs {cov['first_day']} to {cov['last_day']} (UTC); "
                       f"answer panel runs {panel_first} to {panel_last}.",
                 "zh": f"首次发布。爬虫日志 {cov['first_day']} 至 {cov['last_day']}（UTC），"
                       f"引用面板 {panel_first} 至 {panel_last} 的几次。"}
    else:
        entry = {"date": release,
                 "en": f"Monthly update: crawler logs through {cov['last_day']} (UTC); answer panel through {panel_last}.",
                 "zh": f"每月更新：爬虫日志截至 {cov['last_day']}（UTC），引用面板截至 {panel_last}。"}
    return [entry] + log


def assemble(crawl: dict, cites: dict, release: str, prev: dict | None) -> tuple[dict, dict, dict[str, str]]:
    """→ (页面 JSON, 公开 JSON, {文件名: CSV 内容})"""
    csvs: dict[str, str] = {}
    downloads = []
    for m in crawl["months"]:
        name = f"ai-crawlers-{m['month']}.csv"
        rows = [r for r in crawl["_daily_rows"] if month_of(r["date"]) == m["month"]]
        csvs[name] = csv_text(rows)
        downloads.append({"file": name, "url": f"{DATA_URL}/{name}", "format": "text/csv", "month": m["month"],
                          "partial": m["partial"], "rows": len(rows), "bytes": len(csvs[name].encode("utf-8"))})
    downloads.append({"file": LATEST_NAME, "url": f"{DATA_URL}/{LATEST_NAME}", "format": "application/json",
                      "month": "", "partial": False, "rows": 0, "bytes": 0})
    log = changelog(prev, crawl, cites, release)
    core = {
        "name": DATASET_NAME,
        "version": release,
        "site": "jasonzhu.ai",
        "landing_page": f"{SITE}/en{PAGE_PATH}",
        "creator": "Jason Zhu (jasonzhu.ai)",
        "license": "CC-BY-4.0",
        "license_url": "https://creativecommons.org/licenses/by/4.0/",
        "update_cadence": "monthly",
        "coverage": crawl["coverage"],
        "totals": crawl["totals"],
        "months": crawl["months"],
        "bots": crawl["bots"],
        "daily_by_type": crawl["daily_by_type"],
        "sections": crawl["sections"],
        "machine_files": crawl["machine_files"],
        "last_7_days": crawl["last_7_days"],
        "citations": cites,
        "downloads": downloads,
    }
    page = {**core, "changelog": log}
    public = {
        **core,
        "how_to_cite": f"Zhu, J. ({release[:4]}). {DATASET_NAME} (version {release}) [Data set]. "
                       f"{SITE}/en{PAGE_PATH}. Licensed CC BY 4.0.",
        "definitions": {
            "bot_type": {"ai_search": "crawlers that build AI search indexes (OAI-SearchBot, PerplexityBot, ExaSearchBot ...)",
                         "training": "crawlers that collect model training data (GPTBot, ClaudeBot, Bytespider ...)",
                         "user_triggered": "fetches an AI assistant makes while answering a user (ChatGPT-User, Claude-User ...)",
                         "search_engine": "traditional search engine crawlers (Googlebot, bingbot ...)",
                         "other": "SEO tools, Common Crawl and user agents that look automated but are not mapped to an operator"},
            "ai_crawlers": "ai_search + training + user_triggered",
            "verification": {
                "verified_in_published_ranges": "request IP inside the operator's published IP ranges",
                "outside_published_ranges": "operator publishes IP ranges and the request IP was outside them",
                "unverified_stale_range_list": "operator publishes IP ranges, but the pipeline's copy was more than 7 days old, so the request was not checked",
                "unverified_no_published_ranges": "no official IP range list is used for this crawler",
                "unverified_unmapped_bot": "user agent not mapped to a known crawler",
                "unverified_other": "not checked for another reason"},
            "status": "HTTP status classes; status_4xx is almost all 404",
            "section": "first path segment after the /zh or /en prefix; query strings removed; paths that are not on the site are grouped",
            "day_coverage": "full = all 24 UTC hours have log rows; the first day is partial because logging began that day",
            "citations": "share of valid answers that cite any jasonzhu.ai page (site_cited), the page the question targets (page_cited) "
                         "or name the site in the text (named); 95% intervals by question-level bootstrap"},
        "never_published": ["IP addresses", "user agent strings", "locations", "individual log rows or timestamps",
                            "full URLs or query strings", "AI answer text", "search queries", "URLs of other websites",
                            "analytics landing pages"],
        "changelog": [{"date": c["date"], "note": c["en"]} for c in log],
        "daily_rows": "one row per UTC day and crawler in the monthly CSV files listed under downloads",
    }
    return page, public, csvs


def dump(obj: dict) -> str:
    return json.dumps(obj, ensure_ascii=False, indent=1) + "\n"


def write_all(page: dict, public: dict, csvs: dict[str, str]) -> list[Path]:
    page_text, public_text = dump(page), dump(public)
    problems = privacy_scan(public_text) + [f"CSV：{p}" for t in csvs.values() for p in privacy_scan(t)]
    problems += [f"页面数据：{p}" for p in privacy_scan(page_text, allow_cjk=True)]
    zh_outside_changelog = privacy_scan(dump({k: v for k, v in page.items() if k != "changelog"}))
    problems += [f"页面数据（changelog 以外）：{p}" for p in zh_outside_changelog]
    if problems:
        raise Abort("输出没过隐私和语言检查，不写文件：" + "；".join(problems))
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    written = []
    for name, text in csvs.items():
        written.append(write_if_changed(OUT_DIR / name, text))
    written.append(write_if_changed(OUT_DIR / LATEST_NAME, public_text))
    written.append(write_if_changed(OUT_PAGE, page_text))
    return [p for p in written if p]


def write_if_changed(path: Path, text: str) -> Path | None:
    if path.exists() and path.read_text(encoding="utf-8") == text:
        return None
    path.write_text(text, encoding="utf-8")
    return path


def headline(page: dict) -> str:
    t, cov = page["totals"], page["coverage"]
    ai = t["ai_requests"]
    ver = t["ai_verification"]["verified_in_published_ranges"]
    lines = [f"范围 {cov['first_day']} 至 {cov['last_day']}（UTC，{cov['days']} 天；不完整的天：{', '.join(cov['partial_days']) or '无'}）",
             f"爬虫请求 {t['requests']:,}，其中 AI 爬虫 {ai:,}（{ai / t['requests']:.1%}）：" +
             "、".join(f"{k} {t['by_type'][k]:,}" for k in AI_TYPES),
             f"AI 爬虫请求在公布的 IP 段里核验通过 {ver:,}（{ver / ai:.1%}），4xx {t['ai_status']['status_4xx']:,}（{t['ai_status']['status_4xx'] / ai:.1%}）",
             "AI 爬虫前 8：" + "、".join([f"{b['bot']} {b['requests']:,}" for b in page["bots"] if b["bot_type"] in AI_TYPES][:8]),
             "最近 7 天：" + "、".join(f"{b['bot']} {b['requests']:,}" for b in page["last_7_days"]["bots"]
                                     if b["bot"] in ("ChatGPT-User", "Claude-User", "OAI-SearchBot", "PerplexityBot", "Perplexity-User"))]
    last = page["citations"]["runs"][-1]
    lines.append(f"面板 {last['date']} 不带品牌名的题，引用本站：" + "、".join(
        f"{e['label']} {e['unbranded']['hits']}/{e['unbranded']['answers']}（{e['unbranded']['pct']}%）"
        for e in last["engines"] if e.get("unbranded")))
    return "\n".join(lines)


# ───────────── 自检 ─────────────

def selftest() -> int:
    known = {"blog", "prompts", "robots.txt", "_next", "llms.txt"}
    assert section_of("zh", "blog", known) == "/blog"
    assert section_of("en", "prompts", known) == "/prompts"
    assert section_of("", "", known) == "/"
    assert section_of("zh", "", known) == "/"                     # /zh 首页
    assert section_of("robots.txt", "", known) == "/robots.txt"
    assert section_of("wp-login.php", "", known) == NOT_SITE       # 扫描器乱试的路径
    assert section_of("blog", "", known) == "/blog"                 # 不带语言的 /blog/<slug>/cover.png（博客配图）
    assert section_of("en", "wp-admin", known) == NOT_SITE
    assert [status_class(c) for c in (200, 206, 301, 308, 404, 499, 500, 0)] == \
        ["status_2xx", "status_2xx", "status_3xx", "status_3xx", "status_4xx", "status_4xx", "status_5xx", "status_other"]
    assert verify_col("verified_range") == "verified_in_published_ranges"
    assert verify_col("verified_rdns") == "verified_in_published_ranges"
    assert verify_col("rdns_mismatch") == "outside_published_ranges"
    assert verify_col("stale_snapshot") == "unverified_stale_range_list"
    assert verify_col(None) == "unverified_other"
    try:
        verify_col("verified_dns")
        raise AssertionError("新的核验方式应该报错停住")
    except Abort:
        pass
    assert referrer_label("chatgpt.com") == "ChatGPT" and referrer_label("claude.ai") == "Claude"
    assert referrer_label("chat.deepseek.com") == "DeepSeek" and referrer_label("example.com") == "Other AI assistant"
    assert month_days("2026-11") == (date(2026, 11, 1), date(2026, 11, 30))
    assert month_days("2026-12") == (date(2026, 12, 1), date(2026, 12, 31))
    assert privacy_scan('{"ip": "203.0.113.7"}') and privacy_scan('{"path": "/en/blog?x=1"}')
    assert privacy_scan('{"vendor": "字节跳动"}') and not privacy_scan('{"vendor": "字节跳动"}', allow_cjk=True)
    assert not privacy_scan('{"date": "2026-11-25", "version": "0.12.1", "bot": "MJ12bot"}')
    assert privacy_scan("2001:db8:85a3:0:0:8a2e:370:7334")
    try:
        english("新公司", VENDOR, "公司")
        raise AssertionError("没有英文名的公司应该报错停住")
    except Abort:
        pass
    assert pct_cell(18, 63, 0.111, 0.4801) == {"hits": 18, "answers": 63, "pct": 28, "ci_pct": [11, 49]}
    row = {k: 0 for k in CSV_HEAD} | {"date": "2026-11-01", "day_coverage": "full", "vendor": "OpenAI", "bot": "GPTBot",
                                       "bot_type": "training", "requests": 3, "status_2xx": 3}
    back = list(csv.DictReader(io.StringIO(csv_text([row]))))
    assert back[0]["bot"] == "GPTBot" and back[0]["requests"] == "3" and list(back[0]) == list(CSV_HEAD)
    secs = site_sections()
    assert {"blog", "prompts", "research", "llms.txt", "robots.txt", "sitemap.xml", "_next", "data"} <= secs, secs
    assert not any(re.fullmatch(r"[0-9a-f]{32}\.txt", s) for s in secs)
    pr = panel_module()
    rows = pr.load_rows(PANEL_DIR / "results-2026-11-23.json")
    ids = {r["question_id"] for r in rows if r.get("set") == "frozen"}
    hit, n = pr.rate(rows, "chatgpt", "site_cited", ids)
    lo, hi = pr.cluster_ci(rows, "chatgpt", "site_cited", ids)
    # 和 summary-2026-11-23.md 冻结组 ChatGPT「引用本站」那格逐字相同：18/63（28%，区间 11–48%）
    assert pct_cell(hit, n, lo, hi) == {"hits": 18, "answers": 63, "pct": 28, "ci_pct": [11, 48]}, pct_cell(hit, n, lo, hi)
    print("selftest ok")
    return 0


def main() -> int:
    ap = argparse.ArgumentParser(description="AI 爬虫与 AI 引用公开数据集（/research/ai-crawlers）")
    ap.add_argument("--until", help="截止日（不含），YYYY-MM-DD，默认今天（UTC）")
    ap.add_argument("--dry", action="store_true", help="只算、打印要点，不写文件")
    ap.add_argument("--selftest", action="store_true")
    a = ap.parse_args()
    if a.selftest:
        return selftest()
    today = datetime.now(timezone.utc).date()
    until = date.fromisoformat(a.until) if a.until else today
    if until > today:
        print(f"截止日 {until} 在今天（UTC {today}）之后", file=sys.stderr)
        return 2
    try:
        crawl = build_crawl(fetch_logs(until), until)
        cites = build_citations(crawl)
        prev = json.loads(OUT_PAGE.read_text(encoding="utf-8")) if OUT_PAGE.exists() else None
        release = until.isoformat()
        page, public, csvs = assemble(crawl, cites, release, prev)
        print(headline(page))
        if a.dry:
            print("（--dry：没写文件）")
            return 0
        written = write_all(page, public, csvs)
    except Abort as e:
        print(f"停住：{e}", file=sys.stderr)
        return 1
    for p in written:
        print(f"写了 {p.relative_to(REPO)}")
    if not written:
        print("和上次一样，没有文件变化")
    return 0


if __name__ == "__main__":
    sys.exit(main())
