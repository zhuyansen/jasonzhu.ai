#!/usr/bin/env python3
"""全站核心赚钱页/工具页站内上下文入链巡检（目标：每页 ≥7 条非导航上下文内链）。

理论来源（大罗 SEO + Alex Galinos Revenue-First Digital PR）：
  - 每个核心商业页 / 工具落地页至少应有 6–7 条来自站内正文（博客/指南/研究页）的上下文入链；
  - 纯 Header/Footer 全站导航链接不算“上下文内链”（权重稀释且缺少语义锚文本）；
  - 严格遵守 FROZEN_PATHS：只推荐从「非冻结页面」补内链，绝不动 32 个冻结实验页。

用法：
  python3 ops/geo/money_links_audit.py --selftest
  python3 ops/geo/money_links_audit.py scan --min-links 7 --out /Users/zhuyansen/出海/specs/money-links-audit-2026-11-28.md
"""
from __future__ import annotations

import argparse
import json
import re
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
BLOG_DIR = ROOT / "src" / "content" / "blog"
APP_LANG_DIR = ROOT / "src" / "app" / "[lang]"
FROZEN_TS = ROOT / "src" / "lib" / "frozen-pages.ts"

# 核心赚钱页与工具页（不含 /en /zh 前缀，合并统计双语入链）
MONEY_TARGETS: list[dict] = [
    {"key": "/services", "name": "企业 AI 培训与出海咨询（Money Page）", "topic_hints": ["培训", "企业", "agent", "claude", "cursor", "workshop", "consulting", "咨询"]},
    {"key": "/club", "name": "GoSail Club 启航会 ¥365/年（Money Page）", "topic_hints": ["出海", "独立开发", "gosail", "社群", "周刊", "seo", "geo", "saas"]},
    {"key": "/contact", "name": "1v1 合作与媒体/数据核验入口", "topic_hints": ["咨询", "合作", "dataset", "zenodo", "doi", "research", "培训", "press"]},
    {"key": "/go-global/payments", "name": "出海收款选型与 $20 净到手交互工具", "topic_hints": ["stripe", "paddle", "creem", "dodo", "polar", "waffo", "收款", "mor", "payment", "lemon"]},
    {"key": "/go-global", "name": "出海实战指南总枢纽（公司/收款/开户）", "topic_hints": ["出海", "llc", "uk", "美国公司", "英国公司", "wise", "mercury", "公司"]},
    {"key": "/go-global/ai-readiness", "name": "AI 就绪度 26 项免费体检工具", "topic_hints": ["geo", "aeo", "crawler", "ai search", "schema", "llms", "sitemap", "seo"]},
    {"key": "/research", "name": "开源研究论文与 Zenodo 数据集枢纽", "topic_hints": ["zenodo", "doi", "benchmark", "dataset", "study", "report", "200k", "130k", "研究"]},
    {"key": "/research/ai-crawlers", "name": "AI 爬虫与引用月度实测数据页", "topic_hints": ["crawler", "gptbot", "claudebot", "perplexity", "ai search", "geo", "引用", "爬虫"]},
]

TARGET_KEYS = [t["key"] for t in MONEY_TARGETS]


def load_frozen_paths(frozen_ts: Path = FROZEN_TS) -> set[str]:
    if not frozen_ts.exists():
        return set()
    txt = frozen_ts.read_text(encoding="utf-8")
    m = re.search(r"FROZEN_PATHS[^=]*=\s*new Set\(\[([\s\S]*?)\]\)", txt)
    if not m:
        return set()
    return set(re.findall(r'"([^"]+)"', m.group(1)))


def normalize_internal_path(raw: str) -> str:
    s = raw.strip()
    s = re.sub(r"^https?://(?:www\.)?jasonzhu\.ai", "", s, flags=re.I)
    s = s.split("?", 1)[0].split("#", 1)[0]
    s = re.sub(r"^\$\{lang\}", "", s)
    s = re.sub(r"^/\$\{lang\}", "", s)
    s = re.sub(r"^/(?:en|zh)(?=/|$)", "", s)
    s = s.rstrip("/")
    return s or "/"


def extract_links_from_markdown(md_text: str) -> set[str]:
    found: set[str] = set()
    for m in re.finditer(r"\]\(([^)\s]+)\)", md_text):
        u = m.group(1)
        if u.startswith("/") or "jasonzhu.ai/" in u.lower():
            found.add(normalize_internal_path(u))
    for m in re.finditer(r'href=["\']([^"\']+)["\']', md_text):
        u = m.group(1)
        if u.startswith("/") or "jasonzhu.ai/" in u.lower():
            found.add(normalize_internal_path(u))
    return found


def extract_links_from_tsx(tsx_text: str) -> set[str]:
    found: set[str] = set()
    for pat in (
        r'href=\{`([^`]+)`\}',
        r'href=["\']([^"\']+)["\']',
    ):
        for m in re.finditer(pat, tsx_text):
            u = m.group(1)
            if u.startswith("/") or "${lang}" in u or "jasonzhu.ai/" in u.lower():
                found.add(normalize_internal_path(u))
    return found


def scan_site(root: Path = ROOT, min_links: int = 7) -> dict:
    frozen = load_frozen_paths(root / "src" / "lib" / "frozen-pages.ts")
    inbound: dict[str, list[dict]] = defaultdict(list)
    blog_records: list[dict] = []

    # 1. 扫描所有博客 Markdown 正文
    blog_dir = root / "src" / "content" / "blog"
    if blog_dir.exists():
        for md in sorted(blog_dir.glob("*.md")):
            slug = md.stem
            base_slug = slug[:-3] if slug.endswith(".en") else slug
            txt = md.read_text(encoding="utf-8", errors="ignore")
            links = extract_links_from_markdown(txt)
            src_key = f"/blog/{slug}"
            is_frozen = (f"/en/blog/{base_slug}" in frozen) or (f"/zh/blog/{base_slug}" in frozen)
            blog_records.append({
                "slug": slug,
                "src": src_key,
                "is_frozen": is_frozen,
                "links": links,
                "text_lower": txt[:4000].lower(),
            })
            for tk in TARGET_KEYS:
                if tk in links and tk != src_key:
                    inbound[tk].append({"source": src_key, "type": "blog", "frozen_source": is_frozen})

    # 2. 扫描 src/app/[lang]/**/page.tsx（跳过 layout.tsx 与 sitemap-html 等导航页）
    app_lang = root / "src" / "app" / "[lang]"
    if app_lang.exists():
        for page_f in sorted(app_lang.rglob("page.tsx")):
            rel = page_f.relative_to(app_lang).parent.as_posix()
            if rel in (".", ""):
                src_key = "/"
            else:
                src_key = "/" + rel
            if "sitemap-html" in src_key or "[" in src_key:
                continue
            txt = page_f.read_text(encoding="utf-8", errors="ignore")
            links = extract_links_from_tsx(txt)
            is_frozen = (f"/en{'' if src_key == '/' else src_key}" in frozen) or (f"/zh{'' if src_key == '/' else src_key}" in frozen)
            for tk in TARGET_KEYS:
                if tk in links and tk != src_key:
                    inbound[tk].append({"source": src_key, "type": "page", "frozen_source": is_frozen})

    rows = []
    for t in MONEY_TARGETS:
        tk = t["key"]
        sources = inbound.get(tk, [])
        cnt = len(sources)
        deficit = max(0, min_links - cnt)
        # 仅从未冻结且尚未链接到该目标页的高相关博文中推荐补链候选
        candidates = []
        if deficit > 0:
            for b in blog_records:
                if b["is_frozen"] or tk in b["links"]:
                    continue
                hits = sum(1 for h in t["topic_hints"] if h in b["text_lower"])
                if hits > 0:
                    candidates.append((hits, b["src"]))
            candidates.sort(key=lambda x: (-x[0], x[1]))

        rows.append({
            "target": tk,
            "name": t["name"],
            "contextual_inbound": cnt,
            "blog_inbound": sum(1 for s in sources if s["type"] == "blog"),
            "page_inbound": sum(1 for s in sources if s["type"] == "page"),
            "status": "OK" if cnt >= min_links else f"DEFICIT (-{deficit})",
            "sources": [s["source"] for s in sources],
            "unfrozen_candidates": [c[1] for c in candidates[: max(deficit + 3, 5)]],
        })

    return {"min_links": min_links, "rows": rows}


def render_markdown(data: dict) -> str:
    min_l = data["min_links"]
    rows = data["rows"]
    lines = [
        f"# 核心赚钱页 / 工具页站内上下文入链巡检（目标 ≥ {min_l} 条/页）",
        "",
        "> 仅统计正文（博客 `.md` 与非导航 `page.tsx`）内的上下文内链，不计入全站 Header/Footer/HTML Sitemap 导航链接。补链候选严格排除 32 个冻结实验页。",
        "",
        "| 目标页 | 说明 | 正文入链总数 | 博客入链 | 落地页入链 | 状态 |",
        "| --- | --- | ---: | ---: | ---: | --- |",
    ]
    for r in rows:
        lines.append(
            f"| `{r['target']}` | {r['name']} | **{r['contextual_inbound']}** | {r['blog_inbound']} | {r['page_inbound']} | {r['status']} |"
        )

    lines += ["", "## 缺口页补链建议（仅推荐非冻结来源页）", ""]
    any_deficit = False
    for r in rows:
        if r["status"] == "OK":
            continue
        any_deficit = True
        lines.append(f"### `{r['target']}` — {r['name']}（当前 {r['contextual_inbound']}/{min_l}）")
        lines.append(f"- **已有入链来源**：" + (", ".join(f"`{s}`" for s in r["sources"]) if r["sources"] else "（无）"))
        cands = r["unfrozen_candidates"]
        lines.append(f"- **建议优先补链的非冻结相关博文**：" + (", ".join(f"`{c}`" for c in cands) if cands else "（暂无强相关非冻结博文，可随新文补齐）"))
        lines.append("")
    if not any_deficit:
        lines.append("全部核心赚钱页与工具页均已达到 ≥7 条上下文入链门槛！")
    return "\n".join(lines) + "\n"


def selftest() -> int:
    assert normalize_internal_path("https://jasonzhu.ai/en/go-global/payments/?ref=x") == "/go-global/payments"
    assert normalize_internal_path("/${lang}/services") == "/services"
    assert normalize_internal_path("/zh/club/") == "/club"
    md = "Read [payments](/en/go-global/payments) and [club](https://jasonzhu.ai/zh/club) now."
    links = extract_links_from_markdown(md)
    assert "/go-global/payments" in links and "/club" in links, links
    tsx = '<Link href={`/${lang}/services`}>Services</Link><a href="/en/contact">Contact</a>'
    tlinks = extract_links_from_tsx(tsx)
    assert "/services" in tlinks and "/contact" in tlinks, tlinks
    print("money_links_audit selftest ok")
    return 0


def main() -> int:
    ap = argparse.ArgumentParser(description="全站赚钱页/工具页上下文入链巡检（≥7 条门槛）")
    ap.add_argument("--selftest", action="store_true")
    sub = ap.add_subparsers(dest="cmd")
    s = sub.add_parser("scan", help="扫描全站上下文入链")
    s.add_argument("--min-links", type=int, default=7)
    s.add_argument("--out", default="", help="输出 Markdown 路径")
    s.add_argument("--json", action="store_true")
    args = ap.parse_args()

    if args.selftest:
        return selftest()
    if args.cmd == "scan":
        data = scan_site(ROOT, min_links=args.min_links)
        if args.json:
            print(json.dumps(data, ensure_ascii=False, indent=2))
            return 0
        md = render_markdown(data)
        if args.out:
            p = Path(args.out)
            p.parent.mkdir(parents=True, exist_ok=True)
            p.write_text(md, encoding="utf-8")
            print(f"已写入赚钱页内链巡检报告：{p}")
        else:
            print(md)
        return 0
    ap.print_help()
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
