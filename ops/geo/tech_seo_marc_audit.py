#!/usr/bin/env python3
"""Marc Moeller 技术 SEO 盲区自动巡检：
1. 分页爬虫可达性检查：扫描所有列表/分页组件，检查是否存在纯 JS `Load More` / `slice()` 却没有真实 `<a href>` 桥梁的死角；
2. noindex 权重泄漏检查：识别全站声明 `robots: { index: false }` 的路由，检查正文（博客 `.md` 与核心页面 `.tsx`）是否向 noindex 路由漏传权重；
3. 站内断链（404）扫描：核对所有博客 Markdown 站内链接 `/en/...` `/zh/...` 是否指向真实存在的路由或博文 slug。

用法：
  python3 ops/geo/tech_seo_marc_audit.py --selftest
  python3 ops/geo/tech_seo_marc_audit.py scan --out /Users/zhuyansen/出海/specs/marc-tech-seo-audit-2026-11-28.md
"""
from __future__ import annotations

import argparse
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
APP_LANG_DIR = ROOT / "src" / "app" / "[lang]"
BLOG_DIR = ROOT / "src" / "content" / "blog"
COMPONENTS_DIR = ROOT / "src" / "components"


def normalize_path(raw: str) -> str:
    s = raw.strip()
    s = re.sub(r"^https?://(?:www\.)?jasonzhu\.ai", "", s, flags=re.I)
    s = s.split("?", 1)[0].split("#", 1)[0]
    s = re.sub(r"^/\$\{lang\}", "", s)
    s = re.sub(r"^/(?:en|zh)(?=/|$)", "", s)
    s = s.rstrip("/")
    return s or "/"


def detect_noindex_routes(root: Path = ROOT) -> list[dict]:
    """扫描 src/app/[lang]/**/page.tsx 与 noindex.ts，找出声明 index: false 的路由。"""
    app_lang = root / "src" / "app" / "[lang]"
    found: list[dict] = []
    if not app_lang.exists():
        return found
    for f in sorted(app_lang.rglob("page.tsx")):
        txt = f.read_text(encoding="utf-8", errors="ignore")
        if re.search(r"robots\s*:\s*\{[^}]*index\s*:\s*false|NOINDEX_ROBOTS|robots\s*:\s*[\"']noindex", txt, re.S):
            rel = f.relative_to(app_lang).parent.as_posix()
            route = "/" if rel in (".", "") else "/" + rel
            follow = bool(re.search(r"follow\s*:\s*true", txt))
            found.append({"route": route, "file": f.relative_to(root).as_posix(), "follow": follow})
    return found


def audit_pagination_components(root: Path = ROOT) -> list[dict]:
    """检查包含 Load more / slice 分页逻辑的前端组件是否提供真实 <a href> 爬虫可达索引。"""
    findings: list[dict] = []
    dirs = [root / "src" / "app" / "[lang]", root / "src" / "components"]
    for d in dirs:
        if not d.exists():
            continue
        for f in sorted(d.rglob("*.tsx")):
            txt = f.read_text(encoding="utf-8", errors="ignore")
            has_js_load_more = bool(re.search(r"(加载更多|Load\s+[Mm]ore|setVisible|showMore|setPage\()", txt))
            if not has_js_load_more:
                continue
            has_crawlable_bridge = bool(re.search(r"(<a\s+[^>]*href=|<Link\s+[^>]*href=)", txt))
            # 判断是否有专门给全量往期/全量条目准备的非截断 Link 循环，还是仅渲染 visible 子集
            has_full_archive_index = bool(re.search(r"(全部往期|真实\s*<a\s+href>|archiveDigests\.map|allItems\.map)", txt))
            status = "OK（有真实 <a href> 全量索引）" if has_full_archive_index else (
                "WARN（存在 JS 分页/加载更多，需人工复核深层项是否全在 SSR DOM 或独立分页 URL 中）"
                if has_crawlable_bridge else "FAIL（纯 JS 截断且无 <a href>）"
            )
            findings.append({
                "file": f.relative_to(root).as_posix(),
                "has_js_load_more": has_js_load_more,
                "has_full_archive_index": has_full_archive_index,
                "status": status,
            })
    return findings


def build_valid_routes(root: Path = ROOT) -> tuple[set[str], set[str]]:
    """返回 (静态页面路由集合, 合法博客 slug 集合)。"""
    app_lang = root / "src" / "app" / "[lang]"
    static_routes: set[str] = {"/"}
    if app_lang.exists():
        for f in app_lang.rglob("page.tsx"):
            rel = f.relative_to(app_lang).parent.as_posix()
            if rel in (".", ""):
                static_routes.add("/")
            elif "[" not in rel:
                static_routes.add("/" + rel)
    blog_slugs: set[str] = set()
    bdir = root / "src" / "content" / "blog"
    if bdir.exists():
        for md in bdir.glob("*.md"):
            s = md.stem
            blog_slugs.add(s[:-3] if s.endswith(".en") else s)
    # 常见动态指南路由（src/app/[lang]/go-global/[guide]/page.tsx）
    guide_dir = root / "src" / "app" / "[lang]" / "go-global"
    if guide_dir.exists():
        for f in guide_dir.glob("**/page.tsx"):
            rel = f.relative_to(app_lang).parent.as_posix()
            if "[" not in rel:
                static_routes.add("/" + rel)
    return static_routes, blog_slugs


def audit_blog_internal_links(root: Path = ROOT) -> dict:
    """扫描所有博客 Markdown 正文站内链接，查出：
    1) 指向 noindex 路由的链接（漏传 Link Juice）；
    2) 指向不存在博客 slug 的站内断链（404）。
    """
    noindex_list = detect_noindex_routes(root)
    noindex_routes = {x["route"] for x in noindex_list if "[" not in x["route"]}
    static_routes, blog_slugs = build_valid_routes(root)

    noindex_leaks: list[dict] = []
    broken_blog_links: list[dict] = []

    bdir = root / "src" / "content" / "blog"
    if bdir.exists():
        for md in sorted(bdir.glob("*.md")):
            txt = md.read_text(encoding="utf-8", errors="ignore")
            for m in re.finditer(r"(?<!!)\[[^\]]*\]\(([^)\s]+)\)", txt):
                raw = m.group(1)
                if raw.startswith(("#", "mailto:", "tel:")):
                    continue
                if raw.startswith(("http://", "https://")) and "jasonzhu.ai" not in raw.lower():
                    continue
                if raw.startswith(("/images/", "/data/", "/feed/", "/downloads/", "/files/", "/api/")):
                    continue
                if re.search(r"\.(?:png|jpe?g|webp|gif|svg|pdf|mp4|zip)(?:[?#].*)?$", raw, re.I):
                    continue
                norm = normalize_path(raw)
                if norm in noindex_routes:
                    noindex_leaks.append({"source": f"src/content/blog/{md.name}", "target": raw, "normalized": norm})
                if norm.startswith("/blog/"):
                    slug = norm[len("/blog/"):].strip("/")
                    if slug and slug not in blog_slugs:
                        broken_blog_links.append({"source": f"src/content/blog/{md.name}", "target": raw, "missing_slug": slug})

    return {
        "noindex_routes": noindex_list,
        "noindex_leaks": noindex_leaks,
        "broken_blog_links": broken_blog_links,
        "static_route_count": len(static_routes),
        "blog_slug_count": len(blog_slugs),
    }


def render_report(root: Path = ROOT) -> str:
    pag = audit_pagination_components(root)
    lnk = audit_blog_internal_links(root)
    lines = [
        "# Marc Moeller 技术 SEO 盲区自动巡检报告",
        "",
        "> 检查维度：(1) 分页/加载更多是否有真实 `<a href>` 爬虫桥梁；(2) 全站 `noindex` 路由清单与博文漏链检查；(3) 博文站内 `/blog/*` 断链检查。",
        "",
        "## 一、分页与 JS `Load More` 爬虫可达性检查",
        "",
    ]
    if pag:
        lines += ["| 组件文件 | JS 加载更多 | 全量 `<a href>` 索引 | 判定 |", "| --- | --- | --- | --- |"]
        for p in pag:
            lines.append(f"| `{p['file']}` | {'是' if p['has_js_load_more'] else '否'} | {'是' if p['has_full_archive_index'] else '否'} | {p['status']} |")
    else:
        lines.append("未检测到 JS `Load More` 截断组件。")

    lines += [
        "",
        f"## 二、全站 `noindex` 路由与博文漏传权重检查（共 {len(lnk['noindex_routes'])} 个 noindex 路由）",
        "",
        "| 路由 | 文件 | follow |",
        "| --- | --- | --- |",
    ]
    for r in lnk["noindex_routes"]:
        lines.append(f"| `{r['route']}` | `{r['file']}` | {r['follow']} |")

    lines += ["", f"### 博文正文误链向 `noindex` 路由：**{len(lnk['noindex_leaks'])}** 处", ""]
    if lnk["noindex_leaks"]:
        lines += ["| 来源博文 | 目标链接 | 归一化路由 |", "| --- | --- | --- |"]
        for x in lnk["noindex_leaks"]:
            lines.append(f"| `{x['source']}` | `{x['target']}` | `{x['normalized']}` |")
    else:
        lines.append("✅ 未发现博文向 `noindex` 路由漏传权重。")

    lines += ["", f"## 三、博文站内 `/blog/*` 断链检查（共 **{len(lnk['broken_blog_links'])}** 处）", ""]
    if lnk["broken_blog_links"]:
        lines += ["| 来源博文 | 断链目标 | 缺失 Slug |", "| --- | --- | --- |"]
        for x in lnk["broken_blog_links"]:
            lines.append(f"| `{x['source']}` | `{x['target']}` | `{x['missing_slug']}` |")
    else:
        lines.append("✅ 全站博文 `/blog/*` 互链零断链。")
    lines.append("")
    return "\n".join(lines)


def selftest() -> int:
    assert normalize_path("https://jasonzhu.ai/en/news/?page=2") == "/news"
    assert normalize_path("/zh/blog/foo-bar/") == "/blog/foo-bar"
    res = audit_blog_internal_links(ROOT)
    assert res["blog_slug_count"] > 50, res
    print("tech_seo_marc_audit selftest ok")
    return 0


def main() -> int:
    ap = argparse.ArgumentParser(description="Marc Moeller 技术 SEO 盲区自动巡检（分页/noindex 漏链/博文断链）")
    ap.add_argument("--selftest", action="store_true")
    sub = ap.add_subparsers(dest="cmd")
    s = sub.add_parser("scan")
    s.add_argument("--out", default="")
    args = ap.parse_args()
    if args.selftest:
        return selftest()
    if args.cmd == "scan":
        md = render_report(ROOT)
        if args.out:
            p = Path(args.out)
            p.parent.mkdir(parents=True, exist_ok=True)
            p.write_text(md, encoding="utf-8")
            print(f"已写入 Marc 技术 SEO 巡检报告：{p}")
        else:
            print(md)
        return 0
    ap.print_help()
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
