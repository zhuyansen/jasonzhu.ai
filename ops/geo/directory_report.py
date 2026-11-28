#!/usr/bin/env python3
"""按目录汇总 Search Console 曝光 / 点击 / CTR、GA4 原生 AI Assistant 频道、Money Pages 与 6 类单点瓶颈诊断（适配 2026-12-19 转化闸门）。

对应 SEO/GEO 复盘原则（按目录看盘 + 归因 Money Pages + Semrush #10 6 类瓶颈诊断 + GA4 AI Assistant 频道）：
- 默认读取 ops/geo/demand.json（与 fanout_actions.py 同源），也支持直接喂 GSC 导出的「网页」CSV 或 JSON；
- 可选 --previous <旧周期 demand.json/csv> 输出各目录环比增减与内容衰减检测；
- 可选 --conversions <GA4/Supabase 着陆页转化 JSON/CSV> 接入 12-19 转化闸门复盘，锁出 Money Pages；
- 可选 --ga4-ai <GA4 Traffic Acquisition 导出 CSV/JSON> 自动过滤原生 AI Assistant 默认频道（medium: ai-assistant）与主流 AI 引擎来源；
- 自动读取最新 ops/geo/panel/results-*.json 与 read-cited-*.json（可用 --panel / --read-cited 指定或 --no-panel 关闭），
  识别「AI 提品牌但不引链接」与「AI 引链接但无点击回流」两类 GEO 瓶颈；
- 自动标记哪些页面在 src/lib/frozen-pages.ts 冻结期内，避免复盘改稿误碰冻结页。

用法：
  python3 ops/geo/directory_report.py                                       # 基于 ops/geo/demand.json + 最新面板打印 Markdown
  python3 ops/geo/directory_report.py --gsc Pages.csv --ga4-ai ga4_ai.csv
  python3 ops/geo/directory_report.py --previous old.json --conversions ga4.csv --ga4-ai ga4_ai.csv
  python3 ops/geo/directory_report.py --json-out /tmp/dir_report.json
  python3 ops/geo/directory_report.py --selftest
"""
from __future__ import annotations

import argparse
import csv
import io
import json
import re
import sys
from collections import defaultdict
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[2]
GEO_DIR = ROOT / "ops" / "geo"
PANEL_DIR = GEO_DIR / "panel"
DEFAULT_DEMAND = GEO_DIR / "demand.json"
FROZEN_TS = ROOT / "src" / "lib" / "frozen-pages.ts"

AI_ASSISTANT_HOSTS = {
    "chatgpt.com": "ChatGPT",
    "chat.openai.com": "ChatGPT",
    "perplexity.ai": "Perplexity",
    "gemini.google.com": "Gemini",
    "claude.ai": "Claude",
    "copilot.microsoft.com": "Copilot",
    "deepseek.com": "DeepSeek",
    "chat.deepseek.com": "DeepSeek",
    "kimi.com": "Kimi",
    "kimi.moonshot.cn": "Kimi",
    "doubao.com": "Doubao",
    "grok.com": "Grok",
    "you.com": "You.com",
    "phind.com": "Phind",
    "poe.com": "Poe",
    "metaso.cn": "Metaso",
}

# 商业/转化导向目录：即使目前流量占比低，也单独拉表盯 12-19 转化闸门
COMMERCIAL_DIRS = {
    "/go-global",
    "/tools",
    "/club",
    "/services",
    "/handbook",
    "/research",
    "/backlink-spam-list",
}

KNOWN_TOP_DIRS = {
    "prompts",
    "blog",
    "go-global",
    "tools",
    "news",
    "research",
    "club",
    "about",
    "services",
    "handbook",
    "backlink-spam-list",
    "contact",
    "ai-learning-guide",
    "privacy",
    "terms",
    "sitemap-html",
}


@dataclass
class PageRow:
    url: str
    path: str
    lang: str
    directory: str
    impressions: int
    clicks: int
    position: float
    conversions: int = 0
    ai_sessions: int = 0
    ai_conversions: int = 0
    frozen: bool = False


@dataclass
class Ga4AiData:
    total_sessions: int = 0
    total_conversions: int = 0
    by_page: dict[str, dict[str, float]] = field(default_factory=dict)
    by_engine: dict[str, dict[str, int]] = field(default_factory=dict)


@dataclass
class DirStats:
    directory: str
    pages: int = 0
    impressions: int = 0
    clicks: int = 0
    weighted_pos_sum: float = 0.0
    conversions: int = 0
    top_page: str = ""
    top_clicks: int = -1
    top_impressions: int = -1
    rows: list[PageRow] = field(default_factory=list)

    @property
    def ctr(self) -> float:
        return (self.clicks / self.impressions) if self.impressions > 0 else 0.0

    @property
    def avg_position(self) -> float:
        return (self.weighted_pos_sum / self.impressions) if self.impressions > 0 else 0.0


def normalize_url_parts(raw: str) -> tuple[str, str, str]:
    """返回 (normalized_path, lang, directory)。

    例：
      https://jasonzhu.ai/en/go-global/payments -> ("/en/go-global/payments", "en", "/go-global")
      https://jasonzhu.ai/zh                    -> ("/zh", "zh", "/")
      https://jasonzhu.ai/                      -> ("/", "root", "/")
    """
    parsed = urlparse(raw.strip())
    path = parsed.path if parsed.scheme else raw.strip().split("?", 1)[0].split("#", 1)[0]
    if not path.startswith("/"):
        path = "/" + path
    path = re.sub(r"/{2,}", "/", path).rstrip("/") or "/"

    segs = [s for s in path.split("/") if s]
    if segs and segs[0] in ("en", "zh"):
        lang = segs[0]
        rest = segs[1:]
    else:
        lang = "root"
        rest = segs

    if not rest:
        directory = "/"
    elif rest[0] in KNOWN_TOP_DIRS:
        directory = f"/{rest[0]}"
    else:
        directory = f"/{rest[0]}"
    return path, lang, directory


def load_frozen_paths(frozen_file: Path = FROZEN_TS) -> set[str]:
    if not frozen_file.exists():
        return set()
    text = frozen_file.read_text("utf-8")
    m = re.search(r"FROZEN_PATHS[^=]*=\s*new Set\(\[([\s\S]*?)\]\)", text)
    if not m:
        return set()
    return {p.rstrip("/") or "/" for p in re.findall(r'"([^"]+)"', m.group(1))}


def _parse_int(val: Any) -> int:
    if isinstance(val, (int, float)):
        return int(round(val))
    s = str(val or "").strip().replace(",", "")
    if not s:
        return 0
    return int(round(float(s)))


def _parse_float(val: Any) -> float:
    if isinstance(val, (int, float)):
        return float(val)
    s = str(val or "").strip().replace(",", "").rstrip("%")
    return float(s) if s else 0.0


def load_gsc_rows(source: Path, frozen_paths: set[str] | None = None) -> tuple[str, list[PageRow]]:
    """支持 demand.json、GSC 导出 JSON 数组/字典、以及中英文表头 GSC Pages.csv。"""
    frozen = frozen_paths if frozen_paths is not None else set()
    suffix = source.suffix.lower()
    raw_text = source.read_text("utf-8-sig")

    rows: list[PageRow] = []
    meta_source = source.name

    if suffix == ".json":
        data = json.loads(raw_text)
        if isinstance(data, dict) and "pages" in data and isinstance(data["pages"], dict):
            meta_source = str(data.get("source") or source.name)
            for url, info in data["pages"].items():
                path, lang, directory = normalize_url_parts(url)
                rows.append(
                    PageRow(
                        url=url,
                        path=path,
                        lang=lang,
                        directory=directory,
                        impressions=_parse_int(info.get("impressions", 0)),
                        clicks=_parse_int(info.get("clicks", 0)),
                        position=_parse_float(info.get("position", 0.0)),
                        frozen=path in frozen,
                    )
                )
        elif isinstance(data, list):
            for item in data:
                url = str(item.get("url") or item.get("page") or item.get("keys", [""])[0])
                if not url:
                    continue
                path, lang, directory = normalize_url_parts(url)
                rows.append(
                    PageRow(
                        url=url,
                        path=path,
                        lang=lang,
                        directory=directory,
                        impressions=_parse_int(item.get("impressions", 0)),
                        clicks=_parse_int(item.get("clicks", 0)),
                        position=_parse_float(item.get("position", 0.0)),
                        frozen=path in frozen,
                    )
                )
        else:
            raise ValueError(f"Unsupported JSON shape in {source}")
    elif suffix == ".csv":
        reader = csv.DictReader(io.StringIO(raw_text))
        for rec in reader:
            norm = {k.strip().lower(): (v or "").strip() for k, v in rec.items() if k}
            url = (
                norm.get("top pages")
                or norm.get("page")
                or norm.get("url")
                or norm.get("热门网页")
                or norm.get("网页")
                or ""
            )
            if not url:
                continue
            impressions = _parse_int(norm.get("impressions") or norm.get("展示次数") or 0)
            clicks = _parse_int(norm.get("clicks") or norm.get("点击次数") or 0)
            position = _parse_float(norm.get("position") or norm.get("排名") or 0)
            path, lang, directory = normalize_url_parts(url)
            rows.append(
                PageRow(
                    url=url,
                    path=path,
                    lang=lang,
                    directory=directory,
                    impressions=impressions,
                    clicks=clicks,
                    position=position,
                    frozen=path in frozen,
                )
            )
    else:
        raise ValueError(f"Unsupported file format: {source}")

    return meta_source, rows


def load_conversions(path: Path) -> dict[str, int]:
    """读取着陆页转化数（JSON {path_or_url: count} / [{landing_page, conversions}] 或 CSV）。"""
    raw = path.read_text("utf-8-sig")
    out: dict[str, int] = defaultdict(int)
    if path.suffix.lower() == ".json":
        data = json.loads(raw)
        if isinstance(data, dict):
            for k, v in data.items():
                if k.startswith("_"):
                    continue
                norm_path, _, _ = normalize_url_parts(k)
                count = _parse_int(v.get("conversions", 0) if isinstance(v, dict) else v)
                out[norm_path] += count
        elif isinstance(data, list):
            for item in data:
                lp = str(item.get("landing_page") or item.get("path") or item.get("url") or "")
                if not lp:
                    continue
                norm_path, _, _ = normalize_url_parts(lp)
                out[norm_path] += _parse_int(item.get("conversions") or item.get("signups") or item.get("count") or 0)
    elif path.suffix.lower() == ".csv":
        for rec in csv.DictReader(io.StringIO(raw)):
            norm = {k.strip().lower(): (v or "").strip() for k, v in rec.items() if k}
            lp = norm.get("landing page") or norm.get("landing_page") or norm.get("path") or norm.get("url") or norm.get("着陆页") or ""
            if not lp:
                continue
            norm_path, _, _ = normalize_url_parts(lp)
            c = _parse_int(norm.get("conversions") or norm.get("key events") or norm.get("signups") or norm.get("转化次数") or 0)
            out[norm_path] += c
    else:
        raise ValueError(f"Unsupported conversions format: {path}")
    return dict(out)


def _classify_ai_engine(source_or_medium: str) -> str | None:
    s = (source_or_medium or "").strip().lower()
    if not s:
        return None
    for host, name in AI_ASSISTANT_HOSTS.items():
        if host in s:
            return name
    for kw, name in (
        ("chatgpt", "ChatGPT"),
        ("openai", "ChatGPT"),
        ("perplexity", "Perplexity"),
        ("gemini", "Gemini"),
        ("claude", "Claude"),
        ("copilot", "Copilot"),
        ("deepseek", "DeepSeek"),
        ("kimi", "Kimi"),
        ("doubao", "Doubao"),
    ):
        if kw in s:
            return name
    return None


def load_ga4_ai(path: Path) -> Ga4AiData:
    """读取 GA4 Traffic Acquisition 导出（CSV/JSON），自动过滤原生 AI Assistant 默认频道（medium: ai-assistant）与 AI 引擎来源。"""
    raw = path.read_text("utf-8-sig")
    out = Ga4AiData()

    records: list[dict[str, Any]] = []
    if path.suffix.lower() == ".json":
        data = json.loads(raw)
        if isinstance(data, list):
            records = [r for r in data if isinstance(r, dict)]
        elif isinstance(data, dict):
            records = [r for r in (data.get("rows") or data.get("pages") or []) if isinstance(r, dict)]
    elif path.suffix.lower() == ".csv":
        # 跳过 GA4 导出顶部以 # 开头的注释行
        lines = [ln for ln in raw.splitlines() if not ln.lstrip().startswith("#")]
        for rec in csv.DictReader(io.StringIO("\n".join(lines))):
            records.append({k.strip().lower(): (v or "").strip() for k, v in rec.items() if k})
    else:
        raise ValueError(f"Unsupported GA4 AI format: {path}")

    for raw_rec in records:
        rec = {str(k).strip().lower(): raw_rec[k] for k in raw_rec}
        channel = str(
            rec.get("session default channel group")
            or rec.get("default channel group")
            or rec.get("channel")
            or rec.get("会话默认渠道分组")
            or ""
        ).strip()
        source_medium = str(
            rec.get("session source / medium")
            or rec.get("session source/medium")
            or rec.get("source / medium")
            or rec.get("source")
            or rec.get("会话来源/媒介")
            or ""
        ).strip()
        medium = str(rec.get("session medium") or rec.get("medium") or "").strip()

        engine = _classify_ai_engine(source_medium)
        is_ai_row = (
            "ai assistant" in channel.lower()
            or "ai-assistant" in medium.lower()
            or "ai-assistant" in source_medium.lower()
            or "ai_referral" in source_medium.lower()
            or engine is not None
        )
        # 如果文件本身没有渠道/来源列（即用户已提前在 GA4 筛选好 AI Assistant 导出的着陆页表），全部视为 AI Assistant 行
        has_channel_cols = bool(channel or source_medium or medium)
        if has_channel_cols and not is_ai_row:
            continue

        sessions = _parse_int(rec.get("sessions") or rec.get("会话数") or rec.get("visits") or 0)
        key_events = _parse_int(
            rec.get("key events") or rec.get("conversions") or rec.get("关键事件") or rec.get("转化次数") or 0
        )
        eng_rate = _parse_float(rec.get("engagement rate") or rec.get("互动率") or 0.0)
        if eng_rate > 1.0:
            eng_rate = eng_rate / 100.0

        out.total_sessions += sessions
        out.total_conversions += key_events

        eng_key = engine or ("AI Assistant" if is_ai_row else "AI Assistant")
        eb = out.by_engine.setdefault(eng_key, {"sessions": 0, "conversions": 0})
        eb["sessions"] += sessions
        eb["conversions"] += key_events

        lp = str(
            rec.get("landing page + query string")
            or rec.get("landing page")
            or rec.get("landing_page")
            or rec.get("path")
            or rec.get("page")
            or rec.get("着陆页")
            or ""
        ).strip()
        if lp:
            norm_path, _, _ = normalize_url_parts(lp)
            pb = out.by_page.setdefault(norm_path, {"sessions": 0, "conversions": 0, "eng_weighted": 0.0})
            pb["sessions"] += sessions
            pb["conversions"] += key_events
            pb["eng_weighted"] += eng_rate * sessions

    return out


def _latest_panel_file(pattern: str) -> Path | None:
    if not PANEL_DIR.exists():
        return None
    files = sorted(PANEL_DIR.glob(pattern))
    return files[-1] if files else None


def load_panel_signals(
    panel_path: Path | None = None,
    read_cited_path: Path | None = None,
    geo_dir: Path = GEO_DIR,
) -> dict[str, Any]:
    """加载最新 GEO 面板（results-*.json）与 read-cited-*.json，用于识别第 5/6 类 AI 瓶颈。"""
    # 建立 qid -> target_path 映射
    qid_to_path: dict[str, str] = {}
    for qf in sorted(geo_dir.glob("questions*.json")):
        try:
            qdata = json.loads(qf.read_text("utf-8"))
        except (OSError, ValueError):
            continue
        for q in qdata.get("questions") or []:
            if q.get("id") and q.get("target_url"):
                p, _, _ = normalize_url_parts(q["target_url"])
                qid_to_path[q["id"]] = p

    named_not_cited: list[dict[str, Any]] = []
    cited_pages: dict[str, dict[str, Any]] = {}
    panel_date = ""

    if panel_path and panel_path.exists():
        pdata = json.loads(panel_path.read_text("utf-8"))
        panel_date = str(pdata.get("date") or panel_path.stem)
        q_agg: dict[str, dict[str, Any]] = defaultdict(lambda: {"named": 0, "cited": 0, "total": 0, "engines": set()})
        for r in pdata.get("rows") or []:
            if r.get("status") != "answered":
                continue
            qid = str(r.get("question_id") or "")
            if not qid:
                continue
            b = q_agg[qid]
            b["total"] += 1
            if r.get("named"):
                b["named"] += 1
            if r.get("site_cited"):
                b["cited"] += 1
            if r.get("named") and not r.get("site_cited"):
                b["engines"].add(str(r.get("engine") or ""))
            for u in r.get("our_urls") or []:
                np, _, _ = normalize_url_parts(f"https://{u}" if "://" not in str(u) else str(u))
                cp = cited_pages.setdefault(np, {"path": np, "citations": 0, "questions": set()})
                cp["citations"] += 1
                cp["questions"].add(qid)

        for qid, b in q_agg.items():
            # 提了品牌至少 1 次，且出现过「提品牌但未引链接」的回答（优先排高提低引）
            if b["named"] > 0 and b["named"] > b["cited"]:
                named_not_cited.append({
                    "question_id": qid,
                    "target_path": qid_to_path.get(qid, ""),
                    "named_runs": b["named"],
                    "cited_runs": b["cited"],
                    "total_runs": b["total"],
                    "engines": sorted(e for e in b["engines"] if e),
                })
        named_not_cited.sort(key=lambda x: (x["named_runs"] - x["cited_runs"], x["named_runs"]), reverse=True)

    if read_cited_path and read_cited_path.exists():
        rc = json.loads(read_cited_path.read_text("utf-8"))
        for row in rc.get("pages") or []:
            all_cited = int(row.get("all_cited") or 0)
            if all_cited <= 0:
                continue
            pk = str(row.get("page") or "")
            en_path = f"/en{'' if pk == '/' else pk}"
            cp = cited_pages.setdefault(en_path, {"path": en_path, "citations": 0, "questions": set()})
            cp["citations"] = max(cp["citations"], all_cited)
            for qid in row.get("questions") or []:
                cp["questions"].add(qid)

    cited_list = [
        {"path": v["path"], "citations": v["citations"], "questions": sorted(v["questions"])}
        for v in cited_pages.values()
    ]
    cited_list.sort(key=lambda x: (-x["citations"], x["path"]))

    return {
        "panel_date": panel_date,
        "named_not_cited": named_not_cited,
        "cited_pages": cited_list,
    }


def aggregate_by_directory(
    rows: list[PageRow],
    conversions: dict[str, int] | None = None,
    ga4_ai: Ga4AiData | None = None,
) -> dict[str, DirStats]:
    conv_map = conversions or {}
    ai_pages = ga4_ai.by_page if ga4_ai else {}
    groups: dict[str, DirStats] = {}
    for row in rows:
        row.conversions = conv_map.get(row.path, 0)
        if row.path in ai_pages:
            row.ai_sessions = int(ai_pages[row.path]["sessions"])
            row.ai_conversions = int(ai_pages[row.path]["conversions"])
        d = groups.get(row.directory)
        if d is None:
            d = DirStats(directory=row.directory)
            groups[row.directory] = d
        d.pages += 1
        d.impressions += row.impressions
        d.clicks += row.clicks
        d.weighted_pos_sum += row.position * row.impressions
        d.conversions += row.conversions
        d.rows.append(row)
        if (row.clicks, row.impressions) > (d.top_clicks, d.top_impressions):
            d.top_clicks = row.clicks
            d.top_impressions = row.impressions
            d.top_page = row.path
    return groups


def aggregate_by_lang(rows: list[PageRow]) -> dict[str, dict[str, int]]:
    out: dict[str, dict[str, int]] = defaultdict(lambda: {"pages": 0, "impressions": 0, "clicks": 0})
    for r in rows:
        b = out[r.lang]
        b["pages"] += 1
        b["impressions"] += r.impressions
        b["clicks"] += r.clicks
    return dict(out)


def money_page_candidates(rows: list[PageRow], limit: int = 12) -> list[PageRow]:
    """挑出商业导向目录页面，或有转化记录的着陆页，按 转化 > 点击 > 展示 排序。"""
    cands = [r for r in rows if r.directory in COMMERCIAL_DIRS or r.conversions > 0]
    cands.sort(key=lambda r: (r.conversions, r.clicks, r.impressions), reverse=True)
    return cands[:limit]


def quick_win_pages(rows: list[PageRow], limit: int = 10) -> list[PageRow]:
    """高曝光低点击（展示 >= 200、排名 <= 15、CTR < 2.5%）的非冻结优先改写候选。"""
    cands = [
        r
        for r in rows
        if r.impressions >= 200 and r.position <= 15.0 and (r.clicks / r.impressions) < 0.025
    ]
    cands.sort(key=lambda r: (r.frozen, -r.impressions))
    return cands[:limit]


def diagnose_bottlenecks(
    rows: list[PageRow],
    prev_rows: list[PageRow] | None = None,
    has_conversions: bool = False,
    ga4_ai: Ga4AiData | None = None,
    panel_signals: dict[str, Any] | None = None,
    frozen_paths: set[str] | None = None,
    limit: int = 5,
) -> list[dict[str, Any]]:
    """Semrush #10 六类单点瓶颈诊断矩阵：将 GSC + 转化 + 环比 + GEO 面板 + GA4 AI 流量映射成可执行行动。"""
    frozen = frozen_paths or set()

    # 1. 高曝光、低排名 → 意图匹配或站点权重不足
    p1 = [r for r in rows if r.impressions >= 150 and r.position > 15.0]
    p1.sort(key=lambda r: (r.frozen, -r.impressions))
    p1_items = [
        f"`{r.path}` ({r.impressions:,} 曝 / 排 {r.position:.1f}{' 🔒' if r.frozen else ''})"
        for r in p1[:limit]
    ]

    # 2. 高排名、低 CTR → Title / 摘要钩子弱
    p2 = [r for r in rows if r.impressions >= 200 and r.position <= 10.0 and (r.clicks / r.impressions) < 0.025]
    p2.sort(key=lambda r: (r.frozen, -r.impressions))
    p2_items = [
        f"`{r.path}` (排 {r.position:.1f} / CTR {r.clicks / r.impressions * 100:.1f}%{' 🔒' if r.frozen else ''})"
        for r in p2[:limit]
    ]

    # 3. 高流量、低转化 → 缺明确下一步 CTA / 承接页
    p3_items: list[str] = []
    if has_conversions:
        p3 = [r for r in rows if r.clicks >= 50 and (r.conversions / r.clicks) < 0.01]
        p3.sort(key=lambda r: (r.frozen, -r.clicks))
        p3_items = [
            f"`{r.path}` ({r.clicks:,} 点 / {r.conversions} 转{' 🔒' if r.frozen else ''})"
            for r in p3[:limit]
        ]

    # 4. 有曝光但环比下滑 / 掉排名 → 内容过期需刷新
    p4_items: list[str] = []
    if prev_rows is not None:
        prev_map = {r.path: r for r in prev_rows}
        declining: list[tuple[PageRow, int, float]] = []
        for r in rows:
            pr = prev_map.get(r.path)
            if not pr or pr.impressions < 100:
                continue
            drop_pct = (r.impressions - pr.impressions) / pr.impressions
            pos_worse = r.position - pr.position
            if drop_pct <= -0.25 or pos_worse >= 3.0:
                declining.append((r, r.impressions - pr.impressions, pos_worse))
        declining.sort(key=lambda t: (t[0].frozen, t[1]))
        p4_items = [
            f"`{r.path}` (曝 {di:+,} / 排名 {dp:+.1f}{' 🔒' if r.frozen else ''})"
            for r, di, dp in declining[:limit]
        ]

    # 5. AI 提品牌但不引链接 → 品牌有认知，缺可引用原始证据页
    p5_items: list[str] = []
    if panel_signals:
        for item in (panel_signals.get("named_not_cited") or [])[:limit]:
            tp = item.get("target_path") or ""
            mark = " 🔒" if tp in frozen else ""
            p5_items.append(
                f"`{item['question_id']}` (提 {item['named_runs']} / 引 {item['cited_runs']}{' · ' + tp if tp else ''}{mark})"
            )

    # 6. AI 引链接但无点击回流 → 缺点击回访的独家工具/完整数据钩子
    p6_items: list[str] = []
    if panel_signals:
        ai_by_page = ga4_ai.by_page if ga4_ai else {}
        for cp in panel_signals.get("cited_pages") or []:
            path = cp["path"]
            ai_sess = int(ai_by_page.get(path, {}).get("sessions", 0))
            if ga4_ai is not None:
                if ai_sess == 0:
                    p6_items.append(f"`{path}` (被引 {cp['citations']} 次 / GA4 AI 回流 0{' 🔒' if path in frozen else ''})")
            else:
                p6_items.append(f"`{path}` (被引 {cp['citations']} 次 · 待喂 `--ga4-ai` 核对回流)")
            if len(p6_items) >= limit:
                break

    return [
        {
            "id": "high_imp_low_rank",
            "symptom": "高曝光、低排名（曝 ≥ 150 · 排名 > 15）",
            "root_cause": "意图匹配偏差或主题集群/内链/外链权重不足",
            "action": "拆低 DR 排前面竞品结构；补内部专题互链与第三方 Source Opportunities",
            "status": "measured",
            "candidates": p1_items,
        },
        {
            "id": "high_rank_low_ctr",
            "symptom": "高排名、低 CTR（排 ≤ 10 · 曝 ≥ 200 · CTR < 2.5%）",
            "root_cause": "Title / Meta 摘要钩子弱，或被 AI Overview 直接截流",
            "action": "非冻结页优先重写 Title（补年份/实测数字/对比边界）与首段价值钩子",
            "status": "measured",
            "candidates": p2_items,
        },
        {
            "id": "high_traffic_low_conv",
            "symptom": "高流量、低转化（点击 ≥ 50 · 转化率 < 1%）",
            "root_cause": "着陆页缺清晰下一步 CTA / 商业承接路径",
            "action": "在首屏下方与正文痛点处补直达工具/订阅/咨询 CTA，对照 12-19 转化闸门",
            "status": "measured" if has_conversions else "needs_conversions",
            "candidates": p3_items,
        },
        {
            "id": "declining_visibility",
            "symptom": "有曝光但环比下滑（曝光降 ≥ 25% 或掉 ≥ 3 名）",
            "root_cause": "内容/费率/政策信息过期或被竞品更新超越",
            "action": "刷新核实日期与一手官方口径（冻结页记入解冻队列）",
            "status": "measured" if prev_rows is not None else "needs_previous",
            "candidates": p4_items,
        },
        {
            "id": "ai_mentioned_not_cited",
            "symptom": "AI 提品牌但不引链接（named > site_cited）",
            "root_cause": "有品牌心智但缺独立可摘录的一手证据/数据页",
            "action": "为对应题补可引用的原创数据锚点、核实表与自归因句（过换品牌名测试）",
            "status": "measured" if panel_signals else "needs_panel",
            "candidates": p5_items,
        },
        {
            "id": "ai_cited_no_referral",
            "symptom": "AI 引链接但无点击回流（被引 ≥ 1 · GA4 AI 访问 = 0）",
            "root_cause": "回答里已读完结论，缺促使访客点进来的互动工具/完整数据集/模板钩子",
            "action": "把静态结论页挂上可交互计算器/原始 CSV 下载/复制即用模板，拉高回流点击",
            "status": "measured" if (panel_signals and ga4_ai is not None) else "needs_ga4_ai",
            "candidates": p6_items,
        },
    ]


def format_markdown(
    meta_source: str,
    rows: list[PageRow],
    dirs: dict[str, DirStats],
    prev_dirs: dict[str, DirStats] | None = None,
    has_conversions: bool = False,
    ga4_ai: Ga4AiData | None = None,
    bottlenecks: list[dict[str, Any]] | None = None,
    panel_date: str = "",
) -> str:
    total_imp = sum(d.impressions for d in dirs.values())
    total_clk = sum(d.clicks for d in dirs.values())
    total_conv = sum(d.conversions for d in dirs.values())
    total_ctr = (total_clk / total_imp * 100) if total_imp else 0.0

    lines = [
        "# Search Console 按目录复盘 & Money Pages / 6 类瓶颈看盘",
        "",
        f"- **数据源**：{meta_source}" + (f" · GEO 面板 `{panel_date}`" if panel_date else ""),
        f"- **总计**：{len(rows)} 个页面 · {total_imp:,} 曝光 · {total_clk:,} 点击 · 整体 CTR {total_ctr:.2f}%"
        + (f" · {total_conv:,} 转化" if has_conversions else "")
        + (f" · GA4 AI Assistant {ga4_ai.total_sessions:,} 会话 / {ga4_ai.total_conversions:,} 转化" if ga4_ai else ""),
        "",
        "## 1. 按目录汇总（不盯单页波动，看目录结构）",
        "",
    ]

    header = ["目录", "页数", "曝光", "曝光占比", "点击", "点击占比", "CTR", "加权排名"]
    if prev_dirs is not None:
        header.extend(["曝光环比", "点击环比"])
    if has_conversions:
        header.extend(["转化", "点击转化率"])
    header.append("目录头牌页")

    lines.append("| " + " | ".join(header) + " |")
    lines.append("| " + " | ".join(["---"] * len(header)) + " |")

    ordered = sorted(dirs.values(), key=lambda d: (d.clicks, d.impressions), reverse=True)
    for d in ordered:
        imp_share = (d.impressions / total_imp * 100) if total_imp else 0.0
        clk_share = (d.clicks / total_clk * 100) if total_clk else 0.0
        cells = [
            f"`{d.directory}`",
            str(d.pages),
            f"{d.impressions:,}",
            f"{imp_share:.1f}%",
            f"{d.clicks:,}",
            f"{clk_share:.1f}%",
            f"{d.ctr * 100:.2f}%",
            f"{d.avg_position:.1f}",
        ]
        if prev_dirs is not None:
            pd = prev_dirs.get(d.directory)
            di = d.impressions - (pd.impressions if pd else 0)
            dc = d.clicks - (pd.clicks if pd else 0)
            cells.append(f"{di:+,}")
            cells.append(f"{dc:+,}")
        if has_conversions:
            cvr = (d.conversions / d.clicks * 100) if d.clicks else 0.0
            cells.append(f"{d.conversions:,}")
            cells.append(f"{cvr:.2f}%")
        cells.append(f"`{d.top_page}`")
        lines.append("| " + " | ".join(cells) + " |")

    # 语言分布
    lang_agg = aggregate_by_lang(rows)
    lines.extend(["", "## 2. 语种分布（`/en` vs `/zh`）", "", "| 语种 | 页数 | 曝光 | 点击 | CTR |", "| --- | --- | --- | --- | --- |"])
    for lg in sorted(lang_agg.keys(), key=lambda k: lang_agg[k]["clicks"], reverse=True):
        b = lang_agg[lg]
        lctr = (b["clicks"] / b["impressions"] * 100) if b["impressions"] else 0.0
        lines.append(f"| `{lg}` | {b['pages']} | {b['impressions']:,} | {b['clicks']:,} | {lctr:.2f}% |")

    # 商业/转化目录看盘（12-19 转化闸门）
    money = money_page_candidates(rows)
    comm_imp = sum(r.impressions for r in rows if r.directory in COMMERCIAL_DIRS)
    comm_clk = sum(r.clicks for r in rows if r.directory in COMMERCIAL_DIRS)
    lines.extend([
        "",
        "## 3. 商业目录 & Money Pages 复盘（12-19 转化闸门）",
        "",
        f"- 商业目录（`{'`、`'.join(sorted(COMMERCIAL_DIRS))}`）合计：{comm_imp:,} 曝光（{(comm_imp / total_imp * 100) if total_imp else 0:.1f}%） · {comm_clk:,} 点击（{(comm_clk / total_clk * 100) if total_clk else 0:.1f}%）",
        "",
    ])
    m_hdr = ["页面", "目录", "曝光", "点击", "CTR", "排名"]
    if has_conversions:
        m_hdr.append("转化")
    if ga4_ai:
        m_hdr.append("GA4 AI 会话")
    m_hdr.append("冻结状态")
    lines.append("| " + " | ".join(m_hdr) + " |")
    lines.append("| " + " | ".join(["---"] * len(m_hdr)) + " |")
    for r in money:
        ctr = (r.clicks / r.impressions * 100) if r.impressions else 0.0
        c = [f"`{r.path}`", f"`{r.directory}`", f"{r.impressions:,}", f"{r.clicks:,}", f"{ctr:.2f}%", f"{r.position:.1f}"]
        if has_conversions:
            c.append(f"{r.conversions:,}")
        if ga4_ai:
            c.append(f"{r.ai_sessions:,}")
        c.append("🔒 冻结" if r.frozen else "✅ 可改")
        lines.append("| " + " | ".join(c) + " |")

    # 高曝光低点击速赢候选
    qw = quick_win_pages(rows)
    if qw:
        lines.extend([
            "",
            "## 4. 高曝光低点击候选（展示 ≥ 200 · 排名 ≤ 15 · CTR < 2.5%，非冻结优先）",
            "",
            "| 页面 | 目录 | 曝光 | 点击 | CTR | 排名 | 状态 |",
            "| --- | --- | --- | --- | --- | --- | --- |",
        ])
        for r in qw:
            ctr = (r.clicks / r.impressions * 100) if r.impressions else 0.0
            status = "🔒 冻结（暂不动）" if r.frozen else "✅ 可优先改 Title/首段"
            lines.append(f"| `{r.path}` | `{r.directory}` | {r.impressions:,} | {r.clicks:,} | {ctr:.2f}% | {r.position:.1f} | {status} |")

    # Section 5: GA4 原生 AI Assistant 频道看盘
    lines.extend(["", "## 5. GA4 原生 `AI Assistant` 频道看盘（Semrush #10 · 12-19 转化闸门）", ""])
    if ga4_ai:
        lines.append(f"- **AI Assistant 渠道总计**：**{ga4_ai.total_sessions:,}** 会话 · **{ga4_ai.total_conversions:,}** 关键事件/转化")
        if ga4_ai.by_engine:
            lines.extend(["", "| AI 引擎来源 | 会话数 | 转化/Key Events | 转化率 |", "| --- | ---: | ---: | ---: |"])
            for eng, stats in sorted(ga4_ai.by_engine.items(), key=lambda kv: -kv[1]["sessions"]):
                cvr = (stats["conversions"] / stats["sessions"] * 100) if stats["sessions"] else 0.0
                lines.append(f"| {eng} | {stats['sessions']:,} | {stats['conversions']:,} | {cvr:.2f}% |")
        if ga4_ai.by_page:
            lines.extend(["", "| 着陆页 | AI 会话数 | AI 转化 | 互动率 |", "| --- | ---: | ---: | ---: |"])
            for lp, stats in sorted(ga4_ai.by_page.items(), key=lambda kv: (-kv[1]["sessions"], kv[0]))[:10]:
                er = (stats["eng_weighted"] / stats["sessions"] * 100) if stats["sessions"] else 0.0
                lines.append(f"| `{lp}` | {int(stats['sessions']):,} | {int(stats['conversions']):,} | {er:.1f}% |")
    else:
        lines.extend([
            "- **当前未传入 `--ga4-ai`**：本站 `next.config.ts` 已配置 `Referrer-Policy: strict-origin-when-cross-origin`，`ThirdPartyAnalytics.tsx` 已加载 GA4 `gtag`、`text_fragment` 与 PostHog `entry_ai_engine`，不会吞掉 AI 引擎来源。",
            "- **12-19 复盘导出方式**：GA4 → **Reports → Acquisition → Traffic acquisition** → 过滤 `Session default channel group = AI Assistant`（或 `medium = ai-assistant`），叠加次级维度 `Landing page + query string` 导出 CSV，运行：",
            "  `python3 ops/geo/directory_report.py --ga4-ai ga4_ai_assistant.csv --conversions ga4_landing_conv.csv`",
            "- **注意口径边界**：GA4 仅抓带 Referrer 的点击回流，零点击品牌心智须与下方 GEO 引用面板及 `brand_split.py` 品牌词搜索并排看。",
        ])

    # Section 6: 6 类单点瓶颈诊断矩阵
    if bottlenecks:
        lines.extend([
            "",
            "## 6. 6 类单点瓶颈自动诊断矩阵（Semrush #10）",
            "",
            "| 瓶颈现象 | 真正瓶颈 | 优先动作 | 当前命中样本（🔒=冻结不动） |",
            "| --- | --- | --- | --- |",
        ])
        status_hint = {
            "needs_conversions": "（待传入 `--conversions`）",
            "needs_previous": "（待传入 `--previous`）",
            "needs_panel": "（未找到 `ops/geo/panel/results-*.json`）",
            "needs_ga4_ai": "（待传入 `--ga4-ai` 核对 0 回流）",
        }
        for b in bottlenecks:
            if b["candidates"]:
                sample_str = "<br>".join(b["candidates"])
            else:
                sample_str = status_hint.get(b["status"], "当前无命中 ✅")
            lines.append(f"| {b['symptom']} | {b['root_cause']} | {b['action']} | {sample_str} |")

    return "\n".join(lines) + "\n"


def to_json_payload(
    meta_source: str,
    rows: list[PageRow],
    dirs: dict[str, DirStats],
    prev_dirs: dict[str, DirStats] | None = None,
    ga4_ai: Ga4AiData | None = None,
    bottlenecks: list[dict[str, Any]] | None = None,
) -> dict[str, Any]:
    total_imp = sum(d.impressions for d in dirs.values())
    total_clk = sum(d.clicks for d in dirs.values())
    ordered = sorted(dirs.values(), key=lambda d: (d.clicks, d.impressions), reverse=True)
    return {
        "source": meta_source,
        "totals": {
            "pages": len(rows),
            "impressions": total_imp,
            "clicks": total_clk,
            "ctr": round((total_clk / total_imp) if total_imp else 0.0, 4),
            "conversions": sum(d.conversions for d in dirs.values()),
            "ga4_ai_sessions": ga4_ai.total_sessions if ga4_ai else 0,
            "ga4_ai_conversions": ga4_ai.total_conversions if ga4_ai else 0,
        },
        "directories": [
            {
                "directory": d.directory,
                "pages": d.pages,
                "impressions": d.impressions,
                "impression_share": round((d.impressions / total_imp) if total_imp else 0.0, 4),
                "clicks": d.clicks,
                "click_share": round((d.clicks / total_clk) if total_clk else 0.0, 4),
                "ctr": round(d.ctr, 4),
                "avg_position": round(d.avg_position, 2),
                "conversions": d.conversions,
                "top_page": d.top_page,
                **(
                    {
                        "delta_impressions": d.impressions - (prev_dirs[d.directory].impressions if d.directory in prev_dirs else 0),
                        "delta_clicks": d.clicks - (prev_dirs[d.directory].clicks if d.directory in prev_dirs else 0),
                    }
                    if prev_dirs is not None
                    else {}
                ),
            }
            for d in ordered
        ],
        "languages": aggregate_by_lang(rows),
        "money_pages": [
            {
                "path": r.path,
                "directory": r.directory,
                "impressions": r.impressions,
                "clicks": r.clicks,
                "position": r.position,
                "conversions": r.conversions,
                "ai_sessions": r.ai_sessions,
                "frozen": r.frozen,
            }
            for r in money_page_candidates(rows)
        ],
        "ga4_ai": {
            "total_sessions": ga4_ai.total_sessions,
            "total_conversions": ga4_ai.total_conversions,
            "by_engine": ga4_ai.by_engine,
            "by_page": {
                k: {"sessions": int(v["sessions"]), "conversions": int(v["conversions"])}
                for k, v in ga4_ai.by_page.items()
            },
        }
        if ga4_ai
        else None,
        "bottlenecks": bottlenecks or [],
    }


def selftest() -> int:
    import tempfile

    assert normalize_url_parts("https://jasonzhu.ai/en/go-global/payments/") == ("/en/go-global/payments", "en", "/go-global")
    assert normalize_url_parts("https://jasonzhu.ai/zh") == ("/zh", "zh", "/")
    assert normalize_url_parts("https://jasonzhu.ai/") == ("/", "root", "/")
    assert normalize_url_parts("/zh/tools?ref=x") == ("/zh/tools", "zh", "/tools")

    with tempfile.TemporaryDirectory() as td:
        t = Path(td)
        gsc_csv = t / "pages.csv"
        gsc_csv.write_text(
            "Top pages,Clicks,Impressions,CTR,Position\n"
            "https://jasonzhu.ai/en/go-global/payments,40,1000,4.0%,6.5\n"
            "https://jasonzhu.ai/zh/go-global/ai-readiness,5,500,1.0%,18.0\n"
            "https://jasonzhu.ai/en/tools,8,600,1.3%,7.2\n"
            "https://jasonzhu.ai/en/prompts/claude-opus-5-5,300,6000,5.0%,5.2\n",
            encoding="utf-8",
        )
        conv_csv = t / "ga4.csv"
        conv_csv.write_text(
            "Landing page,Conversions\n"
            "/en/go-global/payments,8\n"
            "/zh/go-global/ai-readiness,3\n"
            "/en/prompts/claude-opus-5-5,1\n",
            encoding="utf-8",
        )
        ga4_ai_csv = t / "ga4_ai.csv"
        ga4_ai_csv.write_text(
            "# GA4 Export\n"
            "Session default channel group,Session source / medium,Landing page,Sessions,Key events,Engagement rate\n"
            "AI Assistant,chatgpt.com / ai-assistant,/en/go-global/payments,24,4,72.5%\n"
            "AI Assistant,perplexity.ai / ai-assistant,/zh/go-global/ai-readiness,12,2,65.0%\n"
            "Organic Search,google / organic,/en/tools,500,10,50.0%\n",
            encoding="utf-8",
        )
        prev_json = t / "prev.json"
        prev_json.write_text(
            json.dumps({
                "pages": {
                    "https://jasonzhu.ai/en/go-global/payments": {"impressions": 600, "clicks": 20, "position": 8.0},
                    "https://jasonzhu.ai/en/tools": {"impressions": 1000, "clicks": 30, "position": 5.0},
                }
            }),
            encoding="utf-8",
        )
        panel_json = t / "results.json"
        panel_json.write_text(
            json.dumps({
                "date": "2026-11-23",
                "rows": [
                    {"question_id": "brand-who-is-jasonzhu", "engine": "gemini_app", "status": "answered", "named": True, "site_cited": False, "our_urls": []},
                    {"question_id": "data-choose-payment-platform", "engine": "chatgpt", "status": "answered", "named": True, "site_cited": True, "our_urls": ["jasonzhu.ai/en/tools"]},
                ],
            }),
            encoding="utf-8",
        )

        frozen_set = {"/en/go-global/payments"}
        _, rows = load_gsc_rows(gsc_csv, frozen_paths=frozen_set)
        convs = load_conversions(conv_csv)
        ga4_ai = load_ga4_ai(ga4_ai_csv)
        assert ga4_ai.total_sessions == 36
        assert ga4_ai.total_conversions == 6
        assert ga4_ai.by_engine["ChatGPT"]["sessions"] == 24
        assert ga4_ai.by_engine["Perplexity"]["sessions"] == 12

        dirs = aggregate_by_directory(rows, convs, ga4_ai)
        _, prev_rows = load_gsc_rows(prev_json)
        prev_dirs = aggregate_by_directory(prev_rows)
        psig = load_panel_signals(panel_json, None, GEO_DIR)
        bns = diagnose_bottlenecks(rows, prev_rows, True, ga4_ai, psig, frozen_set)
        bn_map = {b["id"]: b for b in bns}
        assert len(bns) == 6
        assert bn_map["high_imp_low_rank"]["candidates"]
        assert bn_map["high_rank_low_ctr"]["candidates"]
        assert bn_map["high_traffic_low_conv"]["candidates"]
        assert bn_map["declining_visibility"]["candidates"]
        assert bn_map["ai_mentioned_not_cited"]["candidates"]
        assert bn_map["ai_cited_no_referral"]["candidates"]

        assert dirs["/go-global"].pages == 2
        assert dirs["/go-global"].impressions == 1500
        assert dirs["/go-global"].clicks == 45
        assert dirs["/go-global"].conversions == 11

        md = format_markdown("test", rows, dirs, prev_dirs, has_conversions=True, ga4_ai=ga4_ai, bottlenecks=bns, panel_date="2026-11-23")
        assert "`/go-global`" in md and "AI Assistant" in md and "6 类单点瓶颈自动诊断矩阵" in md
        payload = to_json_payload("test", rows, dirs, prev_dirs, ga4_ai=ga4_ai, bottlenecks=bns)
        assert payload["totals"]["conversions"] == 12
        assert payload["totals"]["ga4_ai_sessions"] == 36
        assert len(payload["bottlenecks"]) == 6

    # Also smoke-test against repo's real demand.json + latest panel if present
    if DEFAULT_DEMAND.exists():
        frozen = load_frozen_paths()
        _, real_rows = load_gsc_rows(DEFAULT_DEMAND, frozen)
        assert len(real_rows) > 0
        real_dirs = aggregate_by_directory(real_rows)
        assert "/prompts" in real_dirs and "/blog" in real_dirs
        psig = load_panel_signals(_latest_panel_file("results-*.json"), _latest_panel_file("read-cited-*.json"), GEO_DIR)
        bns = diagnose_bottlenecks(real_rows, None, False, None, psig, frozen)
        assert len(bns) == 6

    print("自测通过 (directory_report.py)")
    return 0


def main(argv: list[str]) -> int:
    parser = argparse.ArgumentParser(description="按目录汇总 GSC、GA4 AI Assistant 与 6 类单点瓶颈复盘")
    parser.add_argument("--gsc", type=Path, default=DEFAULT_DEMAND, help="GSC 数据源（默认 ops/geo/demand.json，也支持 Pages.csv）")
    parser.add_argument("--previous", type=Path, default=None, help="上一周期 GSC 数据（JSON/CSV），用于输出目录环比与衰减诊断")
    parser.add_argument("--conversions", type=Path, default=None, help="着陆页转化数据（GA4/Supabase 导出 JSON/CSV）")
    parser.add_argument("--ga4-ai", type=Path, default=None, help="GA4 Traffic Acquisition 导出（自动过滤原生 AI Assistant 频道）")
    parser.add_argument("--panel", type=Path, default=None, help="GEO 面板 results-*.json（默认自动取最新）")
    parser.add_argument("--read-cited", type=Path, default=None, help="read-cited-*.json（默认自动取最新）")
    parser.add_argument("--no-panel", action="store_true", help="不自动加载 GEO 面板数据")
    parser.add_argument("--out", type=Path, default=None, help="可选：Markdown 输出路径")
    parser.add_argument("--json-out", type=Path, default=None, help="可选：JSON 输出路径")
    parser.add_argument("--selftest", action="store_true", help="运行自测")
    args = parser.parse_args(argv)

    if args.selftest:
        return selftest()

    frozen = load_frozen_paths()
    meta_source, rows = load_gsc_rows(args.gsc, frozen)
    convs = load_conversions(args.conversions) if args.conversions else None
    ga4_ai = load_ga4_ai(args.ga4_ai) if args.ga4_ai else None
    dirs = aggregate_by_directory(rows, convs, ga4_ai)

    prev_rows = None
    prev_dirs = None
    if args.previous:
        _, prev_rows = load_gsc_rows(args.previous, frozen)
        prev_dirs = aggregate_by_directory(prev_rows)

    panel_signals = None
    panel_date = ""
    if not args.no_panel:
        p_path = args.panel or _latest_panel_file("results-*.json")
        rc_path = args.read_cited or _latest_panel_file("read-cited-*.json")
        if p_path or rc_path:
            panel_signals = load_panel_signals(p_path, rc_path, GEO_DIR)
            panel_date = panel_signals.get("panel_date", "")

    bottlenecks = diagnose_bottlenecks(
        rows=rows,
        prev_rows=prev_rows,
        has_conversions=bool(args.conversions),
        ga4_ai=ga4_ai,
        panel_signals=panel_signals,
        frozen_paths=frozen,
    )

    md = format_markdown(
        meta_source,
        rows,
        dirs,
        prev_dirs,
        has_conversions=bool(args.conversions),
        ga4_ai=ga4_ai,
        bottlenecks=bottlenecks,
        panel_date=panel_date,
    )
    if args.out:
        args.out.parent.mkdir(parents=True, exist_ok=True)
        args.out.write_text(md, encoding="utf-8")
    else:
        print(md)

    if args.json_out:
        args.json_out.parent.mkdir(parents=True, exist_ok=True)
        args.json_out.write_text(
            json.dumps(to_json_payload(meta_source, rows, dirs, prev_dirs, ga4_ai=ga4_ai, bottlenecks=bottlenecks), ensure_ascii=False, indent=2) + "\n",
            encoding="utf-8",
        )
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
