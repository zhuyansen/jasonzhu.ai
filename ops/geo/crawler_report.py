#!/usr/bin/env python3
"""生成每周「AI 爬虫与核实」静态 HTML 报告，并通过 OpenSEO MCP（http://localhost:3001/mcp）保存/更新。只用标准库。

数据来源：
  - Supabase 视图 public.ai_crawler_all（GEOInflow 历史 + 长期表 ai_crawler_hits，经 ops/geo/crawler_db.py）
  - Supabase 表 public.bot_ip_ranges（各家官方 IP 段新鲜度）
  - 仓库内 ops/geo/panel/read-cited-*.json（ChatGPT-User 现场读取 vs 面板引用摘要）

严格遵守 OpenSEO save_report 约束：
  - 完整自包含 HTML（以 </html> 结尾）、纯内联 CSS、允许内联 SVG 条形图
  - 无 <script>、无任何外部请求（无外链字体/CSS/图片）
  - 全文不含反引号和美元左花括号
  - 体积严格小于 80 KB（自动校验，不通过则报错退出）

用法：
  python3 ops/geo/crawler_report.py --selftest
  python3 ops/geo/crawler_report.py --dry --out /tmp/ai-crawler-report.html
  python3 ops/geo/crawler_report.py
"""
from __future__ import annotations

import argparse
import html
import json
import re
import sys
import urllib.error
import urllib.request
from collections import Counter, defaultdict
from datetime import date, datetime, timedelta, timezone
from pathlib import Path

GEO = Path(__file__).resolve().parent
sys.path.insert(0, str(GEO))
import crawler_db as db  # noqa: E402
import crawler_stats as cs  # noqa: E402

MCP_URL = "http://localhost:3001/mcp"
PROJECT_ID = "d0b0ef47-d981-4d0d-8455-5cd742098dd3"
REPORT_TITLE = "AI 爬虫与核实"
REPORT_SKILL = "ai-crawler-weekly"
MAX_HTML_BYTES = 80_000
MAX_SUMMARY_CHARS = 2_400

TYPE_LABELS = {
    "搜索": "AI 搜索",
    "训练": "AI 训练",
    "用户触发": "用户触发",
    "传统搜索": "传统搜索",
    "其他": "其他 / 未映射",
}
AI_TYPES_ZH = ("搜索", "训练", "用户触发")
STATUS_LABELS = (
    ("2xx", "2xx 正常"),
    ("3xx", "3xx 跳转"),
    ("4xx", "4xx 客户端错误"),
    ("5xx", "5xx 服务端错误"),
)


def e(val: object) -> str:
    return html.escape(str(val), quote=True)


def pct(num: int, den: int) -> str:
    if den <= 0:
        return "0.0%"
    return f"{num * 100.0 / den:.1f}%"


def status_bucket(code: int) -> str:
    if 200 <= code <= 299:
        return "2xx"
    if 300 <= code <= 399:
        return "3xx"
    if 400 <= code <= 499:
        return "4xx"
    if 500 <= code <= 599:
        return "5xx"
    return "other"


def verify_bucket(origin: str, verification: str, reason: str, verified: bool) -> str:
    if verified:
        return "verified"
    if verification == "range_mismatch" or reason in ("range_mismatch", "rdns_mismatch"):
        return "mismatch"
    if reason == "stale_snapshot":
        return "stale"
    if verification == "no_published_ranges" or reason == "no_official_source":
        return "no_ranges"
    if reason in ("unmapped_identity", "ambiguous_name"):
        return "unmapped"
    return "other"


def fetch_window(days: int, end_day: date) -> dict:
    start_day = end_day - timedelta(days=days - 1)
    where = f"day >= date {db.lit(start_day.isoformat())} AND day <= date {db.lit(end_day.isoformat())}"
    rows = db.query(
        f"SELECT vendor, bot, bot_type, origin, verification, coalesce(reason, '') AS reason, verified, status, sum(n) AS n "
        f"FROM public.ai_crawler_all WHERE {where} "
        f"GROUP BY 1, 2, 3, 4, 5, 6, 7, 8"
    )
    clean = "split_part(split_part(path, '?', 1), '#', 1)"
    sec_rows = db.query(
        f"SELECT CASE WHEN left({clean}, 1) = '/' THEN split_part({clean}, '/', 2) ELSE ':' END AS seg1, "
        f"CASE WHEN split_part({clean}, '/', 2) IN ('zh', 'en') THEN split_part({clean}, '/', 3) ELSE '' END AS seg2, "
        f"bot_type, status, sum(n) AS n FROM public.ai_crawler_all WHERE {where} GROUP BY 1, 2, 3, 4"
    )
    return {
        "days": days,
        "start_day": start_day.isoformat(),
        "end_day": end_day.isoformat(),
        "rows": rows,
        "sections": sec_rows,
    }


def fetch_live_a1_summary() -> dict:
    rows = db.query(
        "SELECT bot_type, verification, method, reason, count(*) AS n, "
        "to_char(min(ts) AT TIME ZONE 'UTC', 'YYYY-MM-DD HH24:MI') AS min_ts, "
        "to_char(max(ts) AT TIME ZONE 'UTC', 'YYYY-MM-DD HH24:MI') AS max_ts "
        "FROM public.ai_crawler_hits GROUP BY 1, 2, 3, 4"
    )
    total = sum(int(r["n"]) for r in rows)
    ai_total = sum(int(r["n"]) for r in rows if r["bot_type"] in AI_TYPES_ZH)
    ai_ver = sum(int(r["n"]) for r in rows if r["bot_type"] in AI_TYPES_ZH and r["verification"] == "verified")
    ai_no_rng = sum(int(r["n"]) for r in rows if r["bot_type"] in AI_TYPES_ZH and r["verification"] == "no_published_ranges")
    ai_checkable = sum(
        int(r["n"])
        for r in rows
        if r["bot_type"] in AI_TYPES_ZH and r["verification"] in ("verified", "range_mismatch")
    )
    all_ver = sum(int(r["n"]) for r in rows if r["verification"] == "verified")
    all_rdns = sum(int(r["n"]) for r in rows if r["method"] == "rdns" and r["verification"] == "verified")
    min_ts = min((r["min_ts"] for r in rows if r.get("min_ts")), default="")
    max_ts = max((r["max_ts"] for r in rows if r.get("max_ts")), default="")
    return {
        "total": total,
        "all_verified": all_ver,
        "rdns_verified": all_rdns,
        "ai_total": ai_total,
        "ai_verified": ai_ver,
        "ai_no_ranges": ai_no_rng,
        "ai_checkable": ai_checkable,
        "min_ts": min_ts,
        "max_ts": max_ts,
    }


def fetch_range_freshness() -> list[dict]:
    return db.query(
        "SELECT vendor, count(distinct bot) AS bots, count(*) AS total_rows, "
        "count(distinct cidr) AS distinct_cidrs, "
        "to_char(max(published_at) AT TIME ZONE 'UTC', 'YYYY-MM-DD') AS published_day, "
        "to_char(max(fetched_at) AT TIME ZONE 'UTC', 'YYYY-MM-DD HH24:MI') AS fetched_utc "
        "FROM public.bot_ip_ranges GROUP BY vendor ORDER BY distinct_cidrs DESC, vendor"
    )


def load_latest_read_cited() -> dict | None:
    files = sorted((GEO / "panel").glob("read-cited-*.json"))
    if not files:
        return None
    return json.loads(files[-1].read_text(encoding="utf-8"))


def summarize_window(raw: dict, known_sections: set[str]) -> dict:
    total = 0
    ai_total = 0
    by_type = Counter()
    by_verify = Counter()
    ai_verify = Counter()
    by_status = Counter()
    ai_status = Counter()
    vendors: dict[str, dict] = {}
    for r in raw["rows"]:
        n = int(r["n"])
        bt = r["bot_type"]
        is_ai = bt in AI_TYPES_ZH
        vb = verify_bucket(r["origin"], r["verification"], r["reason"], bool(r["verified"]))
        sb = status_bucket(int(r["status"]))
        vendor = r["vendor"] or "未映射"
        total += n
        by_type[bt] += n
        by_verify[vb] += n
        by_status[sb] += n
        if is_ai:
            ai_total += n
            ai_verify[vb] += n
            ai_status[sb] += n
        v = vendors.setdefault(
            vendor,
            {"vendor": vendor, "total": 0, "ai": 0, "verified": 0, "mismatch": 0, "stale": 0, "no_ranges": 0, "other": 0, "s4xx": 0},
        )
        v["total"] += n
        if is_ai:
            v["ai"] += n
        if vb == "verified":
            v["verified"] += n
        elif vb == "mismatch":
            v["mismatch"] += n
        elif vb == "stale":
            v["stale"] += n
        elif vb == "no_ranges":
            v["no_ranges"] += n
        else:
            v["other"] += n
        if sb == "4xx":
            v["s4xx"] += n

    vendor_list = sorted(vendors.values(), key=lambda x: (-x["total"], x["vendor"]))

    sec_agg: dict[str, dict] = {}
    for r in raw["sections"]:
        name = cs.section_of(r["seg1"], r["seg2"], known_sections)
        n = int(r["n"])
        is_ai = r["bot_type"] in AI_TYPES_ZH
        sb = status_bucket(int(r["status"]))
        s = sec_agg.setdefault(name, {"section": name, "total": 0, "ai": 0, "ai_2xx": 0, "ai_4xx": 0})
        s["total"] += n
        if is_ai:
            s["ai"] += n
            if sb == "2xx":
                s["ai_2xx"] += n
            elif sb == "4xx":
                s["ai_4xx"] += n
    sections = sorted(sec_agg.values(), key=lambda x: (-x["ai"], -x["total"], x["section"]))[:12]

    return {
        "days": raw["days"],
        "start_day": raw["start_day"],
        "end_day": raw["end_day"],
        "total": total,
        "ai_total": ai_total,
        "by_type": by_type,
        "by_verify": by_verify,
        "ai_verify": ai_verify,
        "by_status": by_status,
        "ai_status": ai_status,
        "vendors": vendor_list,
        "sections": sections,
    }


def svg_bar(parts: list[tuple[int, str]], width: int = 220, height: int = 12) -> str:
    total = sum(v for v, _ in parts)
    if total <= 0:
        return f'<svg width="{width}" height="{height}" viewBox="0 0 {width} {height}" role="img" aria-label="empty"><rect width="{width}" height="{height}" rx="3" fill="#e5e7eb"/></svg>'
    rects = []
    x = 0.0
    for val, color in parts:
        if val <= 0:
            continue
        w = max(1.0, width * val / total)
        if x + w > width:
            w = max(0.0, width - x)
        rects.append(f'<rect x="{x:.1f}" y="0" width="{w:.1f}" height="{height}" fill="{color}"/>')
        x += w
    return (
        f'<svg width="{width}" height="{height}" viewBox="0 0 {width} {height}" role="img" aria-label="bar">'
        f'<rect width="{width}" height="{height}" rx="3" fill="#eef2f7"/>{"".join(rects)}</svg>'
    )


def render_vendor_rows(vendors: list[dict], limit: int = 14) -> str:
    out = []
    for v in vendors[:limit]:
        bar = svg_bar(
            [
                (v["verified"], "#16a34a"),
                (v["mismatch"], "#dc2626"),
                (v["stale"], "#d97706"),
                (v["no_ranges"], "#64748b"),
                (v["other"], "#cbd5e1"),
            ],
            width=120,
            height=10,
        )
        out.append(
            "<tr>"
            f"<td><strong>{e(v['vendor'])}</strong></td>"
            f"<td class=\"num\">{v['total']:,}</td>"
            f"<td class=\"num\">{v['ai']:,}</td>"
            f"<td class=\"num\">{pct(v['verified'], v['total'])}</td>"
            f"<td class=\"num\">{v['stale']:,}</td>"
            f"<td class=\"num\">{v['no_ranges']:,}</td>"
            f"<td class=\"num\">{pct(v['s4xx'], v['total'])}</td>"
            f"<td>{bar}</td>"
            "</tr>"
        )
    return "\n".join(out)


def render_type_rows(s7: dict, s30: dict) -> str:
    out = []
    for key in ("搜索", "训练", "用户触发", "传统搜索", "其他"):
        n7 = s7["by_type"][key]
        n30 = s30["by_type"][key]
        out.append(
            "<tr>"
            f"<td>{e(TYPE_LABELS[key])}</td>"
            f"<td class=\"num\">{n7:,}</td>"
            f"<td class=\"num\">{pct(n7, s7['total'])}</td>"
            f"<td class=\"num\">{n30:,}</td>"
            f"<td class=\"num\">{pct(n30, s30['total'])}</td>"
            "</tr>"
        )
    return "\n".join(out)


def render_status_rows(s7: dict, s30: dict) -> str:
    out = []
    for key, label in STATUS_LABELS:
        out.append(
            "<tr>"
            f"<td>{e(label)}</td>"
            f"<td class=\"num\">{s7['by_status'][key]:,} ({pct(s7['by_status'][key], s7['total'])})</td>"
            f"<td class=\"num\">{s7['ai_status'][key]:,} ({pct(s7['ai_status'][key], s7['ai_total'])})</td>"
            f"<td class=\"num\">{s30['by_status'][key]:,} ({pct(s30['by_status'][key], s30['total'])})</td>"
            f"<td class=\"num\">{s30['ai_status'][key]:,} ({pct(s30['ai_status'][key], s30['ai_total'])})</td>"
            "</tr>"
        )
    return "\n".join(out)


def render_section_rows(sections: list[dict], ai_total: int) -> str:
    out = []
    for s in sections:
        bar = svg_bar([(s["ai_2xx"], "#2563eb"), (s["ai_4xx"], "#dc2626"), (max(0, s["ai"] - s["ai_2xx"] - s["ai_4xx"]), "#94a3b8")], 110, 10)
        out.append(
            "<tr>"
            f"<td><span class=\"mono\">{e(s['section'])}</span></td>"
            f"<td class=\"num\">{s['ai']:,}</td>"
            f"<td class=\"num\">{pct(s['ai'], ai_total)}</td>"
            f"<td class=\"num\">{s['total']:,}</td>"
            f"<td class=\"num\">{pct(s['ai_4xx'], s['ai'])}</td>"
            f"<td>{bar}</td>"
            "</tr>"
        )
    return "\n".join(out)


def render_read_cited(rc: dict | None) -> str:
    if not rc:
        return "<p class=\"muted\">暂无 read-cited-*.json 面板对比存档。</p>"
    cls = rc.get("classes") or {}
    totals = rc.get("totals") or {}
    pages = rc.get("pages") or []
    unasked = rc.get("unasked") or []
    read_not_cited = [p for p in pages if p.get("class") == "读了不引"]
    rows_html = []
    for p in read_not_cited[:10]:
        hold = p.get("hold") or "可优化页面（L4）"
        rows_html.append(
            "<tr>"
            f"<td><span class=\"mono\">{e(p['page'])}</span></td>"
            f"<td class=\"num\">{int(p.get('chatgpt_reads', 0))}</td>"
            f"<td class=\"num\">{int(p.get('chatgpt_cited', 0))}/{int(p.get('chatgpt_answers', 0))}</td>"
            f"<td class=\"num\">{int(p.get('all_cited', 0))}</td>"
            f"<td class=\"num\">{int(p.get('impressions', 0)):,}</td>"
            f"<td>{e(hold)}</td>"
            "</tr>"
        )
    unasked_items = "".join(
        f"<li><span class=\"mono\">{e(u['page'])}</span>：ChatGPT 现场读 {int(u.get('chatgpt_reads', 0))} 次，Claude-User {int(u.get('claude_reads', 0))} 次</li>"
        for u in unasked[:6]
    )
    return (
        f"<p>最新面板 <strong>{e(rc.get('date', ''))}</strong>（前 {int(rc.get('days', 7))} 天，{e(rc.get('skip_note', ''))}）："
        f"ChatGPT-User 已核实读取 <strong>{int(totals.get('chatgpt', 0)):,}</strong> 次"
        f"（未核实 {int(totals.get('chatgpt_other', 0)):,} 次），Claude-User {int(totals.get('claude', 0)):,} 次。"
        f"有题指向的 {len(pages)} 页中：<strong>读了不引 {int(cls.get('读了不引', 0))}</strong>、"
        f"没读也没引 {int(cls.get('没读也没引', 0))}、读了也被引 {int(cls.get('读了也被引', 0))}、"
        f"引了但没现场读 {int(cls.get('引了但没现场读', 0))}。</p>"
        "<table><thead><tr><th>读了不引（Top 10）</th><th class=\"num\">ChatGPT 读</th><th class=\"num\">ChatGPT 引</th>"
        "<th class=\"num\">各家引</th><th class=\"num\">3 月展示</th><th>状态 / 建议</th></tr></thead>"
        f"<tbody>{''.join(rows_html) or '<tr><td colspan=\"6\">无</td></tr>'}</tbody></table>"
        + (f"<p class=\"sub\">AI 读得多但面板无题（候选新题）：</p><ul class=\"compact\">{unasked_items}</ul>" if unasked_items else "")
    )


def render_freshness_rows(rows: list[dict]) -> str:
    out = []
    for r in rows:
        out.append(
            "<tr>"
            f"<td><strong>{e(r['vendor'])}</strong></td>"
            f"<td class=\"num\">{int(r['bots'])}</td>"
            f"<td class=\"num\">{int(r['distinct_cidrs']):,}</td>"
            f"<td class=\"num\">{e(r.get('published_day') or '—')}</td>"
            f"<td class=\"num\">{e(r.get('fetched_utc') or '—')} UTC</td>"
            "</tr>"
        )
    return "\n".join(out)


def build_report(s7: dict, s30: dict, live: dict, freshness: list[dict], rc: dict | None, generated_utc: str) -> tuple[str, str]:
    ai_ver_30 = pct(s30["ai_verify"]["verified"], s30["ai_total"])
    ai_ver_7 = pct(s7["ai_verify"]["verified"], s7["ai_total"])
    ai_ver_live = pct(live["ai_verified"], live["ai_total"]) if live["ai_total"] else "待积累"
    ai_checkable_live = pct(live["ai_verified"], live["ai_checkable"]) if live["ai_checkable"] else "—"
    all_ver_live = pct(live["all_verified"], live["total"]) if live["total"] else "待积累"

    rc_cls = (rc or {}).get("classes") or {}
    rc_date = (rc or {}).get("date", "—")
    top_action = (
        f"保持 A1 并行期观察 3–7 天，确认 ai_crawler_hits 与 GEOInflow 逐小时计数一致后再执行 Phase 5 下线；"
        f"页面侧优先处理「读了不引」里未冻结的页面（最新面板 {rc_date} 共 {int(rc_cls.get('读了不引', 0))} 页读了不引）。"
    )
    summary = (
        f"**结论**：方案 A1 入口核实已上线（`ai_crawler_hits` 已收 {live['total']:,} 条，总核实率 {all_ver_live}，"
        f"AI 爬虫核实率 {ai_ver_live}，其中有官方列表的 AI 爬虫核实率 {ai_checkable_live}；对比 GEOInflow 历史期约 28.7%）。\n\n"
        f"**首要动作**：{top_action}\n\n"
        f"**关键数字（截至 {s30['end_day']} UTC）**：\n"
        f"- 近 7 天（{s7['start_day']}–{s7['end_day']}）：总请求 {s7['total']:,}，AI 爬虫 {s7['ai_total']:,}（{pct(s7['ai_total'], s7['total'])}），"
        f"AI 核实率 {ai_ver_7}，AI 4xx {pct(s7['ai_status']['4xx'], s7['ai_total'])}。\n"
        f"- 近 30 天（{s30['start_day']}–{s30['end_day']}）：总请求 {s30['total']:,}，AI 爬虫 {s30['ai_total']:,}（{pct(s30['ai_total'], s30['total'])}），"
        f"AI 核实率 {ai_ver_30}（含 GEOInflow 历史期 stale_snapshot {s30['ai_verify']['stale']:,} 条）。\n"
        f"- 官方 IP 段表 `bot_ip_ranges`：覆盖 {len(freshness)} 家运营方，共 {sum(int(r['distinct_cidrs']) for r in freshness):,} 个去重网段，最新刷新 {freshness[0]['fetched_utc'] if freshness else '—'} UTC。"
    )
    summary = summary.replace("`", "")[:MAX_SUMMARY_CHARS]

    vbar_30 = svg_bar(
        [
            (s30["ai_verify"]["verified"], "#16a34a"),
            (s30["ai_verify"]["mismatch"], "#dc2626"),
            (s30["ai_verify"]["stale"], "#d97706"),
            (s30["ai_verify"]["no_ranges"], "#64748b"),
            (s30["ai_verify"]["other"] + s30["ai_verify"]["unmapped"], "#cbd5e1"),
        ],
        width=360,
        height=14,
    )
    vbar_7 = svg_bar(
        [
            (s7["ai_verify"]["verified"], "#16a34a"),
            (s7["ai_verify"]["mismatch"], "#dc2626"),
            (s7["ai_verify"]["stale"], "#d97706"),
            (s7["ai_verify"]["no_ranges"], "#64748b"),
            (s7["ai_verify"]["other"] + s7["ai_verify"]["unmapped"], "#cbd5e1"),
        ],
        width=360,
        height=14,
    )

    doc = f"""<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{e(REPORT_TITLE)}</title>
<style>
:root {{ --bg:#f8fafc; --card:#ffffff; --ink:#0f172a; --muted:#475569; --line:#e2e8f0; --accent:#2563eb; --ok:#16a34a; --warn:#d97706; --bad:#dc2626; }}
* {{ box-sizing:border-box; }}
body {{ margin:0; padding:24px; background:var(--bg); color:var(--ink); font:14px/1.6 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"PingFang SC","Noto Sans SC",sans-serif; }}
.wrap {{ max-width:980px; margin:0 auto; }}
header {{ margin-bottom:20px; }}
h1 {{ margin:0 0 6px; font-size:24px; letter-spacing:-0.01em; }}
h2 {{ margin:24px 0 10px; font-size:17px; border-bottom:1px solid var(--line); padding-bottom:6px; }}
p {{ margin:8px 0; }}
.meta {{ color:var(--muted); font-size:13px; }}
.grid {{ display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:12px; margin:16px 0; }}
@media (max-width:760px) {{ .grid {{ grid-template-columns:repeat(2,minmax(0,1fr)); }} }}
.card {{ background:var(--card); border:1px solid var(--line); border-radius:10px; padding:14px 16px; }}
.kpi-label {{ color:var(--muted); font-size:12px; }}
.kpi-val {{ font-size:22px; font-weight:700; margin:4px 0 2px; }}
.kpi-sub {{ color:var(--muted); font-size:12px; }}
.panel {{ background:var(--card); border:1px solid var(--line); border-radius:10px; padding:16px 18px; margin-bottom:16px; }}
table {{ width:100%; border-collapse:collapse; font-size:13px; margin-top:8px; }}
th,td {{ padding:7px 8px; border-bottom:1px solid var(--line); text-align:left; vertical-align:middle; }}
th {{ color:var(--muted); font-weight:600; font-size:12px; background:#f8fafc; }}
td.num,th.num {{ text-align:right; font-variant-numeric:tabular-nums; white-space:nowrap; }}
.mono {{ font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace; font-size:12px; }}
.legend {{ display:flex; flex-wrap:wrap; gap:12px; font-size:12px; color:var(--muted); margin:8px 0; }}
.dot {{ display:inline-block; width:10px; height:10px; border-radius:2px; margin-right:4px; vertical-align:middle; }}
.muted {{ color:var(--muted); }}
.sub {{ margin-top:12px; font-weight:600; font-size:13px; }}
ul.compact {{ margin:6px 0 0 18px; padding:0; font-size:13px; }}
.note {{ background:#f1f5f9; border-left:3px solid var(--accent); padding:10px 14px; border-radius:6px; font-size:13px; color:#334155; }}
</style>
</head>
<body>
<div class="wrap">
<header>
  <h1>{e(REPORT_TITLE)}</h1>
  <div class="meta">生成时间：{e(generated_utc)} UTC · 数据源：Supabase public.ai_crawler_all（GEOInflow 历史 + 方案 A1 实时表 ai_crawler_hits）</div>
</header>

<section class="grid">
  <div class="card">
    <div class="kpi-label">近 7 天总爬虫 / AI 爬虫</div>
    <div class="kpi-val">{s7['total']:,}</div>
    <div class="kpi-sub">AI 爬虫 {s7['ai_total']:,}（{pct(s7['ai_total'], s7['total'])}）· {e(s7['start_day'])} 至 {e(s7['end_day'])}</div>
  </div>
  <div class="card">
    <div class="kpi-label">近 30 天总爬虫 / AI 爬虫</div>
    <div class="kpi-val">{s30['total']:,}</div>
    <div class="kpi-sub">AI 爬虫 {s30['ai_total']:,}（{pct(s30['ai_total'], s30['total'])}）· {e(s30['start_day'])} 至 {e(s30['end_day'])}</div>
  </div>
  <div class="card">
    <div class="kpi-label">方案 A1 实时核实率（AI 爬虫）</div>
    <div class="kpi-val">{e(ai_ver_live)}</div>
    <div class="kpi-sub">有官方列表的 AI 爬虫：{e(ai_checkable_live)} · 总样本 {live['total']:,} 条（{e(live['min_ts'] or '—')} 起）</div>
  </div>
  <div class="card">
    <div class="kpi-label">近 7 天 AI 爬虫 4xx 占比</div>
    <div class="kpi-val">{pct(s7['ai_status']['4xx'], s7['ai_total'])}</div>
    <div class="kpi-sub">{s7['ai_status']['4xx']:,} / {s7['ai_total']:,}（近 30 天 {pct(s30['ai_status']['4xx'], s30['ai_total'])}）</div>
  </div>
</section>

<section class="panel">
  <h2>1. 核实分布与爬虫类型（近 7 天 vs 近 30 天）</h2>
  <div class="legend">
    <span><i class="dot" style="background:#16a34a"></i>已核实（IP 段 / rDNS）</span>
    <span><i class="dot" style="background:#dc2626"></i>不在官方范围</span>
    <span><i class="dot" style="background:#d97706"></i>列表过期（GEOInflow 历史期）</span>
    <span><i class="dot" style="background:#64748b"></i>无官方列表（如 Exa / Bytespider）</span>
    <span><i class="dot" style="background:#cbd5e1"></i>其他 / 未映射</span>
  </div>
  <p>近 7 天 AI 爬虫核实（{s7['ai_total']:,} 条）：{vbar_7} 已核实 {ai_ver_7} · 过期 {pct(s7['ai_verify']['stale'], s7['ai_total'])} · 无官方列表 {pct(s7['ai_verify']['no_ranges'], s7['ai_total'])}</p>
  <p>近 30 天 AI 爬虫核实（{s30['ai_total']:,} 条）：{vbar_30} 已核实 {ai_ver_30} · 过期 {pct(s30['ai_verify']['stale'], s30['ai_total'])} · 无官方列表 {pct(s30['ai_verify']['no_ranges'], s30['ai_total'])}</p>
  <table>
    <thead><tr><th>爬虫类型</th><th class="num">近 7 天</th><th class="num">占比</th><th class="num">近 30 天</th><th class="num">占比</th></tr></thead>
    <tbody>{render_type_rows(s7, s30)}</tbody>
  </table>
</section>

<section class="panel">
  <h2>2. 运营方排行与核实率（近 7 天）</h2>
  <table>
    <thead><tr><th>运营方</th><th class="num">总请求</th><th class="num">AI 爬虫</th><th class="num">已核实率</th><th class="num">过期未核</th><th class="num">无官方列表</th><th class="num">4xx 占比</th><th>分布</th></tr></thead>
    <tbody>{render_vendor_rows(s7['vendors'])}</tbody>
  </table>
  <p class="sub">近 30 天运营方排行（Top 14）</p>
  <table>
    <thead><tr><th>运营方</th><th class="num">总请求</th><th class="num">AI 爬虫</th><th class="num">已核实率</th><th class="num">过期未核</th><th class="num">无官方列表</th><th class="num">4xx 占比</th><th>分布</th></tr></thead>
    <tbody>{render_vendor_rows(s30['vendors'])}</tbody>
  </table>
</section>

<section class="panel">
  <h2>3. HTTP 状态码分布</h2>
  <table>
    <thead><tr><th>状态类别</th><th class="num">近 7 天全部</th><th class="num">近 7 天 AI</th><th class="num">近 30 天全部</th><th class="num">近 30 天 AI</th></tr></thead>
    <tbody>{render_status_rows(s7, s30)}</tbody>
  </table>
</section>

<section class="panel">
  <h2>4. 热门栏目（近 7 天按 AI 爬虫排序）</h2>
  <table>
    <thead><tr><th>栏目</th><th class="num">AI 请求</th><th class="num">AI 占比</th><th class="num">总爬虫</th><th class="num">AI 4xx</th><th>2xx / 4xx</th></tr></thead>
    <tbody>{render_section_rows(s7['sections'], s7['ai_total'])}</tbody>
  </table>
</section>

<section class="panel">
  <h2>5. ChatGPT-User 现场读取 vs 面板引用（读了不引）</h2>
  {render_read_cited(rc)}
</section>

<section class="panel">
  <h2>6. 官方 IP 段覆盖与新鲜度（bot_ip_ranges）</h2>
  <table>
    <thead><tr><th>运营方</th><th class="num">爬虫数</th><th class="num">去重 CIDR 数</th><th class="num">官方发布日</th><th class="num">最近拉取</th></tr></thead>
    <tbody>{render_freshness_rows(freshness)}</tbody>
  </table>
</section>

<section class="panel">
  <h2>7. 口径与方法说明</h2>
  <div class="note">
    <p><strong>数据链路（方案 A1 并行期）</strong>：Vercel Log Drain 推送至 Supabase Edge Function（vercel-drain），继续写中转表 vercel_drain 供本机 GEOInflow 并行运行，同时实时分类、核实并写入长期表 ai_crawler_hits。2026-11-26 13:35 UTC 之前的历史来自 GEOInflow 导出表 ai_crawler_daily（保留原标签），视图 ai_crawler_all 将两段无缝合并。</p>
    <p><strong>核实方式</strong>：有官方 IP 段的运营方按 bot_ip_ranges（GitHub Actions 每日刷新，空表或失败直接标红不覆盖）即时比对；Yandex、百度、搜狗、Seznam、Naver 使用正向确认反向 DNS（rDNS）；Exa、Bytespider 等未公布官方列表的运营方记为 no_published_ranges（不再混作 unverified）。Anthropic 官方 bots.json 覆盖其主抓取网段，但部分 Claude-User 现场抓取会经 Anthropic 自有出站段（AS399358），该现象已记录。</p>
    <p><strong>隐私原则</strong>：长期表与归档均不保存完整 IP 或可逆哈希，仅保留 IPv4 /24、IPv6 /48 前缀与去掉查询参数的路径。</p>
  </div>
</section>
</div>
</body>
</html>"""
    validate_html(doc)
    return summary, doc


def validate_html(doc: str) -> None:
    if "`" in doc:
        raise ValueError("HTML 含反引号，违反 OpenSEO save_report 规则")
    if "${" in doc:
        raise ValueError("HTML 含 ${ 序列，违反 OpenSEO save_report 规则")
    if "<script" in doc.lower():
        raise ValueError("HTML 含 <script> 标签，违反 OpenSEO save_report 规则")
    if re.search(r'(?:href|src)\s*=\s*["\']https?://', doc, re.I) or re.search(r"url\(\s*['\"]?https?://", doc, re.I):
        raise ValueError("HTML 含外部请求链接，违反 OpenSEO save_report 规则")
    if not doc.rstrip().endswith("</html>"):
        raise ValueError("HTML 未以 </html> 结尾")
    size = len(doc.encode("utf-8"))
    if size >= MAX_HTML_BYTES:
        raise ValueError(f"HTML 体积 {size} 字节超过上限 {MAX_HTML_BYTES}")


def mcp_call(tool: str, arguments: dict) -> dict:
    payload = {
        "jsonrpc": "2.0",
        "id": 1,
        "method": "tools/call",
        "params": {"name": tool, "arguments": arguments},
    }
    req = urllib.request.Request(
        MCP_URL,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json", "Accept": "application/json, text/event-stream"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            body = r.read().decode("utf-8")
    except urllib.error.URLError as e:
        raise RuntimeError(f"OpenSEO MCP ({MCP_URL}) 连不上：{e}") from None
    data = json.loads(body)
    if "error" in data:
        raise RuntimeError(f"OpenSEO MCP {tool} 报错：{data['error']}")
    res = data.get("result") or {}
    if res.get("isError"):
        raise RuntimeError(f"OpenSEO MCP {tool} 执行失败：{res.get('content')}")
    return res.get("structuredContent") or res


def find_existing_report_id() -> str | None:
    res = mcp_call("list_reports", {"projectId": PROJECT_ID, "limit": 50})
    for r in res.get("reports") or []:
        if r.get("title") == REPORT_TITLE:
            return r.get("id")
    return None


def save_to_openseo(summary: str, doc: str) -> dict:
    existing = find_existing_report_id()
    args = {
        "projectId": PROJECT_ID,
        "title": REPORT_TITLE,
        "summary": summary,
        "html": doc,
        "skill": REPORT_SKILL,
    }
    if existing:
        args["reportId"] = existing
    return mcp_call("save_report", args)


def selftest() -> int:
    sample_rows = [
        {"vendor": "OpenAI", "bot": "ChatGPT-User", "bot_type": "用户触发", "origin": "hits", "verification": "verified", "reason": "verified_range", "verified": True, "status": 200, "n": 120},
        {"vendor": "Exa", "bot": "ExaSearchBot", "bot_type": "搜索", "origin": "hits", "verification": "no_published_ranges", "reason": "no_official_source", "verified": False, "status": 200, "n": 80},
        {"vendor": "Anthropic", "bot": "ClaudeBot", "bot_type": "训练", "origin": "geoinflow", "verification": "unverified", "reason": "stale_snapshot", "verified": False, "status": 404, "n": 40},
    ]
    sample_secs = [
        {"seg1": "en", "seg2": "blog", "bot_type": "搜索", "status": 200, "n": 80},
        {"seg1": "zh", "seg2": "prompts", "bot_type": "训练", "status": 404, "n": 40},
    ]
    known = {"blog", "prompts"}
    s7 = summarize_window({"days": 7, "start_day": "2026-11-20", "end_day": "2026-11-26", "rows": sample_rows, "sections": sample_secs}, known)
    s30 = summarize_window({"days": 30, "start_day": "2026-10-28", "end_day": "2026-11-26", "rows": sample_rows, "sections": sample_secs}, known)
    live = {"total": 200, "all_verified": 120, "rdns_verified": 0, "ai_total": 200, "ai_verified": 120, "ai_no_ranges": 80, "ai_checkable": 120, "min_ts": "2026-11-26 13:31", "max_ts": "2026-11-26 13:45"}
    freshness = [{"vendor": "OpenAI", "bots": 4, "total_rows": 426, "distinct_cidrs": 426, "published_day": "2026-11-25", "fetched_utc": "2026-11-26 13:26"}]
    summary, doc = build_report(s7, s30, live, freshness, None, "2026-11-26 13:45")
    validate_html(doc)
    assert len(summary) <= MAX_SUMMARY_CHARS and len(doc.encode("utf-8")) < MAX_HTML_BYTES
    assert REPORT_TITLE in doc and "<svg" in doc
    for bad in ("<html>`</html>", "<html>${x}</html>", "<html><script></script></html>", '<html><img src="https://x.test/a.png"></html>'):
        try:
            validate_html(bad)
            raise AssertionError(f"应该拒绝：{bad}")
        except ValueError:
            pass
    print("crawler_report selftest ok")
    return 0


def main() -> int:
    ap = argparse.ArgumentParser(description="生成并上传 OpenSEO「AI 爬虫与核实」周报")
    ap.add_argument("--selftest", action="store_true")
    ap.add_argument("--dry", action="store_true", help="只生成并校验，不上传到 OpenSEO")
    ap.add_argument("--out", help="将生成的 HTML 额外保存到本地路径")
    a = ap.parse_args()
    if a.selftest:
        return selftest()
    now = datetime.now(timezone.utc)
    end_day = now.date()
    known = cs.site_sections()
    s7 = summarize_window(fetch_window(7, end_day), known)
    s30 = summarize_window(fetch_window(30, end_day), known)
    live = fetch_live_a1_summary()
    freshness = fetch_range_freshness()
    rc = load_latest_read_cited()
    summary, doc = build_report(s7, s30, live, freshness, rc, now.strftime("%Y-%m-%d %H:%M"))
    size = len(doc.encode("utf-8"))
    if a.out:
        Path(a.out).write_text(doc, encoding="utf-8")
        print(f"已写入 {a.out}（{size:,} 字节）")
    if a.dry:
        print(f"（--dry：HTML 校验通过，{size:,} 字节，未上传 OpenSEO）")
        return 0
    saved = save_to_openseo(summary, doc)
    rid = saved.get("reportId") or saved.get("id") or (saved.get("report") or {}).get("id") or ""
    url = saved.get("url") or (saved.get("meta") or {}).get("url") or f"http://localhost:3001/p/{PROJECT_ID}/reports/{rid}"
    print(f"已保存到 OpenSEO：id={rid} title={REPORT_TITLE} size={size:,}B url={url}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
