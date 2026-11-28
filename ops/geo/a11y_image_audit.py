#!/usr/bin/env python3
"""Agentic 可访问性树（Accessibility Tree，Semrush #9）+ 图片 SEO（Image SEO，Semrush #5）统一质检脚本。

目的：
1. 可访问性树（#9）：扫描交互型工具组件（TSX/JSX），抓出浏览器型 AI Agent（Operator / Computer-Use / Playwright）
   和键盘用户看不见或点不动的控件：
   - 无 aria-label / aria-labelledby / 关联 <label> 的 <input> / <select> / <textarea>
   - 无 role="button" / tabIndex / 键盘处理的 clickable <div> / <span>
   - 纯符号或纯 SVG 图标却无 aria-label 的 <button>
2. 图片 SEO（#5）：扫描 Markdown 正文图片、TSX <img>/<Image> 与 public/ 静态图资产：
   - 缺失或敷衍 alt 文本（""、image、screenshot、photo、cover、图片 等）
   - 无语义文件名（IMG_1234.png、image1.png、screenshot-...、纯数字/UUID）
   - 超大非现代格式静态图（> 300 KB 的 PNG/JPG，建议转 WebP/AVIF）
   - 统计正文原创证据图覆盖率与 ImageObject 结构化数据覆盖

用法：
  python3 ops/geo/a11y_image_audit.py --selftest
  python3 ops/geo/a11y_image_audit.py                     # 体检本站交互工具与图片资产
  python3 ops/geo/a11y_image_audit.py --tsx path/to/Comp.tsx --no-images
  python3 ops/geo/a11y_image_audit.py --strict            # 存在高优问题时退出码 1（可接 CI/发稿前检查）
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[2]
FROZEN_TS = ROOT / "src" / "lib" / "frozen-pages.ts"

GENERIC_ALTS = {
    "",
    "image",
    "img",
    "photo",
    "picture",
    "pic",
    "screenshot",
    "screen shot",
    "cover",
    "banner",
    "thumbnail",
    "thumb",
    "icon",
    "logo",
    "图",
    "图片",
    "截图",
    "封面",
    "配图",
}

BAD_FILENAME_RE = re.compile(
    r"^(?:img[_-]?\d+|image[_-]?\d*|photo[_-]?\d*|pic[_-]?\d*|screenshot[_-]?\d*|screen[-_ ]?shot.*|"
    r"pasted[-_ ]?image.*|untitled[_-]?\d*|\d{6,}|[0-9a-f]{16,})\.(?:png|jpe?g|webp|gif|avif)$",
    re.IGNORECASE,
)

OVERSIZED_IMAGE_BYTES = 300 * 1024  # 300 KB


@dataclass
class AuditFinding:
    category: str  # "a11y" | "image_seo"
    severity: str  # "high" | "medium" | "info"
    rule: str
    file: str
    line: int
    detail: str
    frozen: bool = False


def load_frozen_paths(frozen_file: Path = FROZEN_TS) -> set[str]:
    if not frozen_file.exists():
        return set()
    text = frozen_file.read_text("utf-8")
    m = re.search(r"FROZEN_PATHS[^=]*=\s*new Set\(\[([\s\S]*?)\]\)", text)
    if not m:
        return set()
    return {p.rstrip("/") or "/" for p in re.findall(r'"([^"]+)"', m.group(1))}


def _infer_route_frozen(rel_path: str, frozen_paths: set[str]) -> bool:
    norm = rel_path.replace("\\", "/")
    m = re.search(r"src/app/\[lang\]/(.+?)/[^/]+\.tsx$", norm)
    if m:
        route = "/" + m.group(1).rstrip("/")
        return f"/en{route}" in frozen_paths or f"/zh{route}" in frozen_paths
    m_blog = re.search(r"src/content/blog/(?:en/)?([^/]+)\.md$", norm)
    if m_blog:
        slug = m_blog.group(1)
        return f"/en/blog/{slug}" in frozen_paths or f"/zh/blog/{slug}" in frozen_paths
    return False


def _line_no(text: str, pos: int) -> int:
    return text.count("\n", 0, pos) + 1


def _extract_jsx_open_tags(text: str, tag_names: tuple[str, ...]) -> list[tuple[str, str, int, int]]:
    """提取 JSX 开标签，能容忍属性里的箭头函数 => 与嵌套大括号 {}。返回 (tag, attrs_str, start_pos, end_pos)。"""
    results: list[tuple[str, str, int, int]] = []
    pattern = re.compile(r"<(" + "|".join(tag_names) + r")(?=\s|>|/)")
    n = len(text)
    for m in pattern.finditer(text):
        tag = m.group(1)
        i = m.end()
        brace_depth = 0
        quote: str | None = None
        while i < n:
            ch = text[i]
            if quote:
                if ch == "\\" and i + 1 < n:
                    i += 2
                    continue
                if ch == quote:
                    quote = None
            else:
                if ch in ('"', "'", "`"):
                    quote = ch
                elif ch == "{":
                    brace_depth += 1
                elif ch == "}":
                    brace_depth = max(0, brace_depth - 1)
                elif ch == ">" and brace_depth == 0:
                    attrs = text[m.end() : i]
                    results.append((tag, attrs, m.start(), i + 1))
                    break
            i += 1
    return results


def audit_tsx_a11y(path: Path, rel_path: str, frozen: bool = False) -> list[AuditFinding]:
    """静态检查 TSX/JSX 交互组件的 Accessibility Tree 语义。"""
    text = path.read_text("utf-8", errors="ignore")
    findings: list[AuditFinding] = []

    # 收集文件中所有 <label htmlFor="xxx"> 关联的 ID
    labeled_ids = set(re.findall(r'htmlFor\s*=\s*["\']([^"\']+)["\']', text))

    # 1. <input> / <select> / <textarea> 必须有可访问名称
    for tag, attrs, start, _ in _extract_jsx_open_tags(text, ("input", "select", "textarea")):
        if tag == "input" and re.search(r'type\s*=\s*["\'](?:hidden|checkbox|radio)["\']', attrs):
            continue
        has_aria = bool(re.search(r"\b(?:aria-label|aria-labelledby|title)\s*=", attrs))
        id_m = re.search(r'\bid\s*=\s*["\']([^"\']+)["\']', attrs)
        has_label = bool(id_m and id_m.group(1) in labeled_ids)
        # 检查是否紧包在 <label> 里（向前 200 字符内有未闭合的 <label）
        prefix = text[max(0, start - 220) : start]
        wrapped_in_label = prefix.rfind("<label") > prefix.rfind("</label>")
        if not (has_aria or has_label or wrapped_in_label):
            findings.append(
                AuditFinding(
                    category="a11y",
                    severity="high",
                    rule="form-control-missing-label",
                    file=rel_path,
                    line=_line_no(text, start),
                    detail=f"<{tag}> 缺少 aria-label / aria-labelledby 或关联 <label>（AI Agent 与读屏器无法识别输入用途）",
                    frozen=frozen,
                )
            )

    # 2. clickable <div> / <span> 必须带 role + 键盘支持
    for tag, attrs, start, _ in _extract_jsx_open_tags(text, ("div", "span")):
        if not re.search(r"\bonClick\s*=", attrs):
            continue
        # 跳过纯遮罩点击关闭（如 stopPropagation）
        if re.search(r"stopPropagation", attrs) and not re.search(r"set[A-Z]", attrs):
            continue
        has_role = bool(re.search(r"\brole\s*=", attrs))
        has_kbd = bool(re.search(r"\b(?:onKeyDown|onKeyUp|tabIndex)\s*=", attrs))
        if not has_role or not has_kbd:
            findings.append(
                AuditFinding(
                    category="a11y",
                    severity="high",
                    rule="clickable-non-semantic-element",
                    file=rel_path,
                    line=_line_no(text, start),
                    detail=f"<{tag} onClick> 缺少语义 role 或键盘支持（tabIndex/onKeyDown），建议改 <button> 或补全 ARIA",
                    frozen=frozen,
                )
            )

    # 3. 纯图标/符号 <button> 必须有 aria-label
    for _, attrs, start, end in _extract_jsx_open_tags(text, ("button",)):
        if attrs.rstrip().endswith("/"):
            continue
        if re.search(r"\b(?:aria-label|aria-labelledby)\s*=", attrs):
            continue
        close_idx = text.find("</button>", end)
        if close_idx == -1 or close_idx - end > 600:
            continue
        inner = text[end:close_idx]
        # 去掉 <svg>...</svg> 和纯空白与常见符号（✕ × + -）后看是否还有可见文字或插值
        stripped = re.sub(r"<svg[\s\S]*?</svg>", "", inner)
        stripped = re.sub(r"<[^>]+>", "", stripped).strip()
        if not stripped or stripped in ("✕", "×", "X", "x", "+", "-", "…", "⋮", "☰"):
            findings.append(
                AuditFinding(
                    category="a11y",
                    severity="high",
                    rule="icon-button-missing-aria-label",
                    file=rel_path,
                    line=_line_no(text, start),
                    detail="纯图标/符号 <button> 缺少 aria-label（仅有 title 对部分 Agent/无障碍树不稳定）",
                    frozen=frozen,
                )
            )

    return findings


def audit_tsx_images(path: Path, rel_path: str, frozen: bool = False) -> list[AuditFinding]:
    """检查 TSX 中的 <img> / <Image> alt 文本与 LCP loading='lazy' 误用。"""
    text = path.read_text("utf-8", errors="ignore")
    findings: list[AuditFinding] = []
    for tag, attrs, start, _ in _extract_jsx_open_tags(text, ("img", "Image")):
        alt_m = re.search(r'\balt\s*=\s*(?:"([^"]*)"|\'([^\']*)\')', attrs)
        has_dynamic_alt = bool(re.search(r"\balt\s*=\s*\{", attrs))
        is_decorative = bool(re.search(r'aria-hidden\s*=\s*(?:"true"|\{true\})', attrs))
        if not has_dynamic_alt:
            if alt_m is None:
                findings.append(
                    AuditFinding(
                        category="image_seo",
                        severity="high",
                        rule="img-missing-alt",
                        file=rel_path,
                        line=_line_no(text, start),
                        detail=f"<{tag}> 缺少 alt 属性",
                        frozen=frozen,
                    )
                )
            else:
                alt_val = (alt_m.group(1) if alt_m.group(1) is not None else alt_m.group(2) or "").strip().lower()
                if not is_decorative and alt_val in GENERIC_ALTS:
                    findings.append(
                        AuditFinding(
                            category="image_seo",
                            severity="medium",
                            rule="img-generic-or-empty-alt",
                            file=rel_path,
                            line=_line_no(text, start),
                            detail=f"<{tag}> 的 alt='{alt_val}' 过于笼统或为空（非装饰图请写描述性 alt）",
                            frozen=frozen,
                        )
                    )

        # LCP 误用检查：priority / fetchPriority="high" 与 loading="lazy" 冲突
        if re.search(r'loading\s*=\s*["\']lazy["\']', attrs) and re.search(
            r'\bpriority\b|fetchPriority\s*=\s*["\']high["\']', attrs
        ):
            findings.append(
                AuditFinding(
                    category="image_seo",
                    severity="high",
                    rule="lcp-image-lazy-conflict",
                    file=rel_path,
                    line=_line_no(text, start),
                    detail=f"<{tag}> 同时标记了高优 LCP（priority/fetchPriority='high'）与 loading='lazy'",
                    frozen=frozen,
                )
            )
    return findings


def audit_markdown_images(md_dir: Path, root: Path, frozen_paths: set[str]) -> tuple[list[AuditFinding], dict[str, int]]:
    """检查 Markdown 博客里的正文配图 alt、语义化文件名与原创证据图覆盖率。"""
    findings: list[AuditFinding] = []
    stats = {"posts_scanned": 0, "posts_with_inline_images": 0, "inline_images_total": 0}
    if not md_dir.exists():
        return findings, stats

    img_re = re.compile(r"!\[([^\]]*)\]\(([^)\s]+)")
    for md in sorted(md_dir.rglob("*.md")):
        rel = str(md.relative_to(root))
        frozen = _infer_route_frozen(rel, frozen_paths)
        text = md.read_text("utf-8", errors="ignore")
        # 去掉 frontmatter
        body = re.sub(r"\A---[\s\S]*?---\s*", "", text)
        stats["posts_scanned"] += 1
        matches = list(img_re.finditer(body))
        if matches:
            stats["posts_with_inline_images"] += 1
        for m in matches:
            stats["inline_images_total"] += 1
            alt = m.group(1).strip()
            src = m.group(2).strip()
            ln = _line_no(text, m.start())
            if alt.lower() in GENERIC_ALTS or len(alt) < 4:
                findings.append(
                    AuditFinding(
                        category="image_seo",
                        severity="medium",
                        rule="md-img-weak-alt",
                        file=rel,
                        line=ln,
                        detail=f"正文图片 alt 过短或泛泛（alt='{alt}'，src='{src}'）",
                        frozen=frozen,
                    )
                )
            fname = Path(src.split("?", 1)[0]).name
            if BAD_FILENAME_RE.match(fname):
                findings.append(
                    AuditFinding(
                        category="image_seo",
                        severity="medium",
                        rule="img-non-descriptive-filename",
                        file=rel,
                        line=ln,
                        detail=f"图片文件名无语义（'{fname}'），建议改为主题短语如 'us-llc-vs-uk-ltd-fees.webp'",
                        frozen=frozen,
                    )
                )
    return findings, stats


def audit_public_assets(public_dir: Path, root: Path) -> tuple[list[AuditFinding], dict[str, int]]:
    """检查 public/images 与 public/blog 下的大体积非 WebP/AVIF 图与无语义文件名。"""
    findings: list[AuditFinding] = []
    stats = {"assets_scanned": 0, "webp_avif_count": 0, "oversized_legacy_count": 0}
    for sub in ("images", "blog"):
        d = public_dir / sub
        if not d.exists():
            continue
        for p in sorted(d.rglob("*")):
            if not p.is_file():
                continue
            ext = p.suffix.lower()
            if ext not in (".png", ".jpg", ".jpeg", ".webp", ".avif", ".gif"):
                continue
            stats["assets_scanned"] += 1
            rel = str(p.relative_to(root))
            if ext in (".webp", ".avif"):
                stats["webp_avif_count"] += 1
            size = p.stat().st_size
            if ext in (".png", ".jpg", ".jpeg") and size > OVERSIZED_IMAGE_BYTES:
                stats["oversized_legacy_count"] += 1
                findings.append(
                    AuditFinding(
                        category="image_seo",
                        severity="medium",
                        rule="oversized-legacy-image",
                        file=rel,
                        line=0,
                        detail=f"{ext.upper()} 体积 {size // 1024} KB (> 300 KB)，建议压为 WebP/AVIF",
                    )
                )
            if BAD_FILENAME_RE.match(p.name):
                findings.append(
                    AuditFinding(
                        category="image_seo",
                        severity="info",
                        rule="asset-non-descriptive-filename",
                        file=rel,
                        line=0,
                        detail=f"静态图文件名无语义（'{p.name}'）",
                    )
                )
    return findings, stats


def render_markdown(
    a11y_files: list[str],
    findings: list[AuditFinding],
    md_stats: dict[str, int],
    asset_stats: dict[str, int],
    image_object_hits: int,
) -> str:
    a11y_issues = [f for f in findings if f.category == "a11y"]
    img_issues = [f for f in findings if f.category == "image_seo"]
    high_cnt = sum(1 for f in findings if f.severity == "high")

    lines = [
        "# Accessibility Tree（#9）& Image SEO（#5）质检报告",
        "",
        f"- **已检交互组件**：{len(a11y_files)} 个 TSX 文件 · 可访问性问题 **{len(a11y_issues)}** 条（高优 {sum(1 for f in a11y_issues if f.severity == 'high')}）",
        f"- **图片 SEO**：扫描 {md_stats.get('posts_scanned', 0)} 篇博文（含正文配图 {md_stats.get('posts_with_inline_images', 0)} 篇，共 {md_stats.get('inline_images_total', 0)} 张图）· 静态图 {asset_stats.get('assets_scanned', 0)} 张（WebP/AVIF {asset_stats.get('webp_avif_count', 0)} 张，超 300KB PNG/JPG {asset_stats.get('oversized_legacy_count', 0)} 张）· `ImageObject` Schema 命中 {image_object_hits} 处",
        f"- **总高优问题**：**{high_cnt}** 条",
        "",
        "## 1. Accessibility Tree 检查明细（Agentic Search & Commerce）",
        "",
    ]

    if a11y_issues:
        lines.append("| 级别 | 文件 | 行号 | 规则 | 说明 | 状态 |")
        lines.append("| --- | --- | ---: | --- | --- | --- |")
        for f in a11y_issues:
            st = "🔒 冻结（解冻后修）" if f.frozen else "✅ 可立即修"
            lines.append(f"| `{f.severity}` | `{f.file}` | {f.line} | `{f.rule}` | {f.detail} | {st} |")
    else:
        lines.append("✅ 所检交互组件全部通过 Accessibility Tree 基础规则（表单标签、可点击语义、纯图标按钮 `aria-label`）。")

    lines.extend(["", "## 2. Image SEO 检查明细（前 30 条）", ""])
    if img_issues:
        lines.append("| 级别 | 文件 | 行号 | 规则 | 说明 | 状态 |")
        lines.append("| --- | --- | ---: | --- | --- | --- |")
        for f in img_issues[:30]:
            st = "🔒 冻结" if f.frozen else "✅ 可改"
            lines.append(f"| `{f.severity}` | `{f.file}` | {f.line or '-'} | `{f.rule}` | {f.detail} | {st} |")
        if len(img_issues) > 30:
            lines.append(f"\n> 另有 {len(img_issues) - 30} 条图片 SEO 提示，可用 `--json-out` 查看全量。")
    else:
        lines.append("✅ 图片 SEO 检查无异常。")

    return "\n".join(lines) + "\n"


def selftest() -> int:
    import tempfile

    with tempfile.TemporaryDirectory() as td:
        t = Path(td)
        bad_tsx = t / "BadTool.tsx"
        bad_tsx.write_text(
            'export function BadTool() {\n'
            '  return (\n'
            '    <div>\n'
            '      <input type="text" placeholder="domain" />\n'
            '      <div onClick={() => alert(1)}>Click me</div>\n'
            '      <button onClick={() => {}}><svg><path d="M0 0" /></svg></button>\n'
            '      <img src="/IMG_1234.png" alt="image" loading="lazy" fetchPriority="high" />\n'
            '    </div>\n'
            '  );\n'
            '}\n',
            encoding="utf-8",
        )
        good_tsx = t / "GoodTool.tsx"
        good_tsx.write_text(
            'export function GoodTool() {\n'
            '  return (\n'
            '    <div>\n'
            '      <input type="text" aria-label="Domain name" />\n'
            '      <div role="button" tabIndex={0} onClick={() => {}} onKeyDown={() => {}}>Click</div>\n'
            '      <button type="button" aria-label="Close"><svg><path d="M0 0" /></svg></button>\n'
            '      <img src="/payment-fee-chart.webp" alt="2026 MoR fee comparison chart" />\n'
            '    </div>\n'
            '  );\n'
            '}\n',
            encoding="utf-8",
        )
        md_dir = t / "blog"
        md_dir.mkdir()
        (md_dir / "post.md").write_text("---\ntitle: Test\n---\n![cover](/images/IMG_9999.png)\n", encoding="utf-8")

        bad_a11y = audit_tsx_a11y(bad_tsx, "BadTool.tsx")
        bad_rules = {f.rule for f in bad_a11y}
        assert "form-control-missing-label" in bad_rules
        assert "clickable-non-semantic-element" in bad_rules
        assert "icon-button-missing-aria-label" in bad_rules

        bad_img = audit_tsx_images(bad_tsx, "BadTool.tsx")
        bad_img_rules = {f.rule for f in bad_img}
        assert "img-generic-or-empty-alt" in bad_img_rules
        assert "lcp-image-lazy-conflict" in bad_img_rules

        assert audit_tsx_a11y(good_tsx, "GoodTool.tsx") == []
        assert audit_tsx_images(good_tsx, "GoodTool.tsx") == []

        md_findings, md_stats = audit_markdown_images(md_dir, t, set())
        assert md_stats["posts_with_inline_images"] == 1
        md_rules = {f.rule for f in md_findings}
        assert "md-img-weak-alt" in md_rules and "img-non-descriptive-filename" in md_rules

    print("a11y_image_audit selftest ok")
    return 0


def default_tsx_targets(root: Path) -> list[Path]:
    candidates = [
        root / "src" / "app" / "[lang]" / "go-global" / "ai-readiness" / "AiReadinessClinic.tsx",
        root / "src" / "app" / "[lang]" / "go-global" / "payments" / "PaymentPicker.tsx",
        root / "src" / "app" / "[lang]" / "tools" / "page.tsx",
    ]
    return [p for p in candidates if p.exists()]


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(description="Accessibility Tree (#9) + Image SEO (#5) 质检脚本")
    ap.add_argument("--selftest", action="store_true", help="运行本地单测")
    ap.add_argument("--tsx", action="append", default=[], help="指定待检 TSX/JSX 文件（可多次传入；默认检查核心工具页）")
    ap.add_argument("--no-images", action="store_true", help="只跑 Accessibility Tree，不扫 Markdown/public 图片")
    ap.add_argument("--out", type=Path, default=None, help="可选：Markdown 报告输出路径")
    ap.add_argument("--json-out", type=Path, default=None, help="可选：JSON 输出路径")
    ap.add_argument("--strict", action="store_true", help="非冻结文件存在 high 级别问题时返回退出码 1")
    args = ap.parse_args(argv)

    if args.selftest:
        return selftest()

    frozen = load_frozen_paths()
    tsx_files = [Path(p) for p in args.tsx] if args.tsx else default_tsx_targets(ROOT)

    findings: list[AuditFinding] = []
    scanned_tsx_rels: list[str] = []
    for tf in tsx_files:
        if not tf.exists():
            continue
        try:
            rel = str(tf.resolve().relative_to(ROOT.resolve()))
        except ValueError:
            rel = str(tf)
        scanned_tsx_rels.append(rel)
        is_f = _infer_route_frozen(rel, frozen)
        findings.extend(audit_tsx_a11y(tf, rel, frozen=is_f))
        findings.extend(audit_tsx_images(tf, rel, frozen=is_f))

    md_stats: dict[str, int] = {}
    asset_stats: dict[str, int] = {}
    image_object_hits = 0
    if not args.no_images:
        md_f, md_stats = audit_markdown_images(ROOT / "src" / "content" / "blog", ROOT, frozen)
        findings.extend(md_f)
        pub_f, asset_stats = audit_public_assets(ROOT / "public", ROOT)
        findings.extend(pub_f)
        src_dir = ROOT / "src"
        if src_dir.exists():
            for p in src_dir.rglob("*.ts*"):
                if "ImageObject" in p.read_text("utf-8", errors="ignore"):
                    image_object_hits += 1

    md = render_markdown(scanned_tsx_rels, findings, md_stats, asset_stats, image_object_hits)
    if args.out:
        args.out.parent.mkdir(parents=True, exist_ok=True)
        args.out.write_text(md, encoding="utf-8")
    else:
        print(md)

    if args.json_out:
        args.json_out.parent.mkdir(parents=True, exist_ok=True)
        args.json_out.write_text(
            json.dumps(
                {
                    "tsx_scanned": scanned_tsx_rels,
                    "md_stats": md_stats,
                    "asset_stats": asset_stats,
                    "image_object_hits": image_object_hits,
                    "findings": [f.__dict__ for f in findings],
                },
                ensure_ascii=False,
                indent=2,
            )
            + "\n",
            encoding="utf-8",
        )

    if args.strict:
        non_frozen_high = [f for f in findings if f.severity == "high" and not f.frozen]
        if non_frozen_high:
            return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
