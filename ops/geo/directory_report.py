#!/usr/bin/env python3
"""按目录汇总 Search Console 曝光 / 点击 / CTR 与 Money Pages 转化复盘（适配 2026-12-19 转化闸门）。

对应 SEO 复盘原则（按目录看盘，不盯单页短期波动；把转化归因回着陆页锁出 Money Pages）：
- 默认读取 ops/geo/demand.json（与 fanout_actions.py 同源），也支持直接喂 GSC 导出的「网页」CSV 或 JSON；
- 可选 --previous <旧周期 demand.json/csv> 输出各目录环比增减；
- 可选 --conversions <GA4/Supabase 着陆页转化 JSON/CSV> 接入 12-19 转化闸门复盘，按 转化 × 曝光 排序锁出 Money Pages；
- 自动标记哪些页面在 src/lib/frozen-pages.ts 冻结期内，避免复盘改稿误碰冻结页。

用法：
  python3 ops/geo/directory_report.py                                       # 基于 ops/geo/demand.json 打印 Markdown
  python3 ops/geo/directory_report.py --gsc Pages.csv                       # 直接读 GSC 导出的 Pages.csv
  python3 ops/geo/directory_report.py --previous old.json --conversions ga4.csv
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
DEFAULT_DEMAND = ROOT / "ops" / "geo" / "demand.json"
FROZEN_TS = ROOT / "src" / "lib" / "frozen-pages.ts"

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
    frozen: bool = False


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


def aggregate_by_directory(rows: list[PageRow], conversions: dict[str, int] | None = None) -> dict[str, DirStats]:
    conv_map = conversions or {}
    groups: dict[str, DirStats] = {}
    for row in rows:
        row.conversions = conv_map.get(row.path, 0)
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


def format_markdown(
    meta_source: str,
    rows: list[PageRow],
    dirs: dict[str, DirStats],
    prev_dirs: dict[str, DirStats] | None = None,
    has_conversions: bool = False,
) -> str:
    total_imp = sum(d.impressions for d in dirs.values())
    total_clk = sum(d.clicks for d in dirs.values())
    total_conv = sum(d.conversions for d in dirs.values())
    total_ctr = (total_clk / total_imp * 100) if total_imp else 0.0

    lines = [
        "# Search Console 按目录复盘 & Money Pages 看盘",
        "",
        f"- **数据源**：{meta_source}",
        f"- **总计**：{len(rows)} 个页面 · {total_imp:,} 曝光 · {total_clk:,} 点击 · 整体 CTR {total_ctr:.2f}%"
        + (f" · {total_conv:,} 转化" if has_conversions else ""),
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
    m_hdr.append("冻结状态")
    lines.append("| " + " | ".join(m_hdr) + " |")
    lines.append("| " + " | ".join(["---"] * len(m_hdr)) + " |")
    for r in money:
        ctr = (r.clicks / r.impressions * 100) if r.impressions else 0.0
        c = [f"`{r.path}`", f"`{r.directory}`", f"{r.impressions:,}", f"{r.clicks:,}", f"{ctr:.2f}%", f"{r.position:.1f}"]
        if has_conversions:
            c.append(f"{r.conversions:,}")
        c.append("🔒 冻结至 2027-01-01" if r.frozen else "✅ 可改")
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

    return "\n".join(lines) + "\n"


def to_json_payload(
    meta_source: str,
    rows: list[PageRow],
    dirs: dict[str, DirStats],
    prev_dirs: dict[str, DirStats] | None = None,
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
                "frozen": r.frozen,
            }
            for r in money_page_candidates(rows)
        ],
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
            "https://jasonzhu.ai/zh/go-global/ai-readiness,10,500,2.0%,11.0\n"
            "https://jasonzhu.ai/en/prompts/claude-opus-5-5,300,6000,5.0%,5.2\n",
            encoding="utf-8",
        )
        conv_csv = t / "ga4.csv"
        conv_csv.write_text(
            "Landing page,Conversions\n"
            "/en/go-global/payments,8\n"
            "/zh/go-global/ai-readiness,3\n",
            encoding="utf-8",
        )
        prev_json = t / "prev.json"
        prev_json.write_text(
            json.dumps({
                "pages": {
                    "https://jasonzhu.ai/en/go-global/payments": {"impressions": 600, "clicks": 20, "position": 8.0},
                }
            }),
            encoding="utf-8",
        )

        _, rows = load_gsc_rows(gsc_csv, frozen_paths={"/en/go-global/payments"})
        convs = load_conversions(conv_csv)
        dirs = aggregate_by_directory(rows, convs)
        _, prev_rows = load_gsc_rows(prev_json)
        prev_dirs = aggregate_by_directory(prev_rows)

        assert dirs["/go-global"].pages == 2
        assert dirs["/go-global"].impressions == 1500
        assert dirs["/go-global"].clicks == 50
        assert dirs["/go-global"].conversions == 11
        assert abs(dirs["/go-global"].avg_position - ((6.5 * 1000 + 11.0 * 500) / 1500)) < 1e-6

        md = format_markdown("test", rows, dirs, prev_dirs, has_conversions=True)
        assert "`/go-global`" in md and "+900" in md and "🔒 冻结" in md and "✅ 可改" in md
        payload = to_json_payload("test", rows, dirs, prev_dirs)
        assert payload["totals"]["conversions"] == 11
        assert payload["money_pages"][0]["path"] == "/en/go-global/payments"

    # Also smoke-test against repo's real demand.json if present
    if DEFAULT_DEMAND.exists():
        frozen = load_frozen_paths()
        _, real_rows = load_gsc_rows(DEFAULT_DEMAND, frozen)
        assert len(real_rows) > 0
        real_dirs = aggregate_by_directory(real_rows)
        assert "/prompts" in real_dirs and "/blog" in real_dirs

    print("自测通过 (directory_report.py)")
    return 0


def main(argv: list[str]) -> int:
    parser = argparse.ArgumentParser(description="按目录汇总 GSC 曝光/点击/CTR 与 Money Pages 复盘")
    parser.add_argument("--gsc", type=Path, default=DEFAULT_DEMAND, help="GSC 数据源（默认 ops/geo/demand.json，也支持 Pages.csv）")
    parser.add_argument("--previous", type=Path, default=None, help="上一周期 GSC 数据（JSON/CSV），用于输出目录环比")
    parser.add_argument("--conversions", type=Path, default=None, help="着陆页转化数据（GA4/Supabase 导出 JSON/CSV）")
    parser.add_argument("--out", type=Path, default=None, help="可选：Markdown 输出路径")
    parser.add_argument("--json-out", type=Path, default=None, help="可选：JSON 输出路径")
    parser.add_argument("--selftest", action="store_true", help="运行自测")
    args = parser.parse_args(argv)

    if args.selftest:
        return selftest()

    frozen = load_frozen_paths()
    meta_source, rows = load_gsc_rows(args.gsc, frozen)
    convs = load_conversions(args.conversions) if args.conversions else None
    dirs = aggregate_by_directory(rows, convs)

    prev_dirs = None
    if args.previous:
        _, prev_rows = load_gsc_rows(args.previous, frozen)
        prev_dirs = aggregate_by_directory(prev_rows)

    md = format_markdown(meta_source, rows, dirs, prev_dirs, has_conversions=bool(args.conversions))
    if args.out:
        args.out.parent.mkdir(parents=True, exist_ok=True)
        args.out.write_text(md, encoding="utf-8")
    else:
        print(md)

    if args.json_out:
        args.json_out.parent.mkdir(parents=True, exist_ok=True)
        args.json_out.write_text(
            json.dumps(to_json_payload(meta_source, rows, dirs, prev_dirs), ensure_ascii=False, indent=2) + "\n",
            encoding="utf-8",
        )
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
