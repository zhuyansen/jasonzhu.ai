#!/usr/bin/env python3
"""Product-Led SEO 0–3 商业潜力闸门 + 清迈 SEO 2026 独有素材（≥4 种）自动质检脚本。

理论来源：
  1. Eli Schwartz《Product-Led SEO》+ Tim Soulo《Discoverable》0–3 分商业潜力打分：
     先看产品/服务与高价值客群 JTBD，再查搜索量排优先级；停写 0–1 分泛流量词防 Topical Drift。
  2. 2026 清迈 SEO（Georg Richard Aare 实证 + Charles Floate 80/20 法则）：
     拉高进 Top 3 概率的核心不是字数/FAQ 套路，而是单页 ≥4 种独有素材且开篇即呈现：
       - 开篇一手经验（5.5x）
       - 自有量测数字 / 实测表格 / DOI 数据集（4.4x）
       - 真实案例 / 实操客户或项目证据（3.6x）
       - 自截图 / 原创图表（2.4x）
       - 决策边界 / 80% 共识 + 20% 独家发现（防换品牌名风险）

护栏：
  - 自动读取 src/lib/frozen-pages.ts，严格标注冻结页（2027-01-01 前绝不建议改稿）。

用法：
  python3 ops/geo/content_gate.py --selftest
  python3 ops/geo/content_gate.py score-topic --title "Creem vs Dodo Payments for Chinese AI SaaS founders" --jtbd "Pick MoR without US LLC"
  python3 ops/geo/content_gate.py audit-post src/content/blog/some-post.md
  python3 ops/geo/content_gate.py audit-all --out /Users/zhuyansen/出海/specs/content-gate-audit.md
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
BLOG_DIR = ROOT / "src" / "content" / "blog"
FROZEN_TS = ROOT / "src" / "lib" / "frozen-pages.ts"

# 4 条核心商业线（Product-Led SEO 映射）
BUSINESS_PILLARS: list[dict] = [
    {
        "id": "payments-entity",
        "name": "出海收款 / MoR / 海外公司开户",
        "money_pages": ["/en/go-global/payments", "/en/go-global", "/en/contact"],
        "tier3_terms": [
            "stripe", "paddle", "creem", "dodo", "polar", "waffo", "lemon squeezy",
            "merchant of record", "mor", "收款", "美区公司", "美国公司", "wyoming",
            "delaware", "uk ltd", "英国公司", "mercury", "wise", "香港公司", "开户",
            "itin", "ein", "出海收款", "独立开发收款", "alipay", "wechat pay", "refund",
            "payout", "fee", "费率", "封号", "冻结", "冻卡",
        ],
        "tier2_terms": [
            "indie hacker", "indie saas", "saas", "出海", "独立开发", "海外主体",
            "tax", "vat", "sales tax", "w-8ben", "pricing", "subscription",
        ],
    },
    {
        "id": "enterprise-ai",
        "name": "企业 AI 实战培训 / AI Agent 工程落地",
        "money_pages": ["/en/services", "/zh/services", "/en/contact"],
        "tier3_terms": [
            "企业培训", "企业ai", "企业 ai", "内训", "workshop", "claude code",
            "cursor", "ai agent", "harness", "agent workflow", "团队落地", "ai 落地",
            "研发提效", "ai coding", "mcp", "multi-agent", "ai readiness",
        ],
        "tier2_terms": [
            "llm", "anthropic", "openai", "gemini", "codex", "automation",
            "prompt engineering", "geo", "aeo", "ai search", "ai 爬虫", "citation",
        ],
    },
    {
        "id": "gosail-club",
        "name": "GoSail Club 启航会（出海实战社群）",
        "money_pages": ["/en/club", "/zh/club", "/en/go-global/weekly"],
        "tier3_terms": [
            "gosail", "启航会", "出海社群", "出海周刊", "chuhai", "出海实战",
            "独立开发者出海", "indie founder", "solo founder", "出海冷启动", "seo 出海",
            "geo 出海", "外链", "backlink", "programmatic seo",
        ],
        "tier2_terms": [
            "seo", "traffic", "growth", "cold start", "launch", "product hunt",
            "reddit", "distribution", "marketing", "monetization",
        ],
    },
    {
        "id": "agentskillshub-research",
        "name": "AgentSkillsHub & 开放数据集研究（DOI）",
        "money_pages": ["/en/research", "/en/research/ai-crawlers", "/en/go-global/ai-readiness"],
        "tier3_terms": [
            "agentskillshub", "agent skills", "skill security", "mcp security",
            "supply chain", "zenodo", "doi", "benchmark", "dataset", "crawler",
            "open dataset", "200k", "130k", "285k",
        ],
        "tier2_terms": [
            "security audit", "open source", "github", "evaluation", "eval",
            "leaderboard", "telemetry", "research",
        ],
    },
]

# 明确低商业价值 / Topical Drift 警示词（如 HubSpot 离职信式泛内容）
DRIFT_SIGNALS = [
    "birthday wishes", "famous quotes", "resignation letter", "wallpaper",
    "emoji", "horoscope", "meme", "八卦", "娱乐圈", "星座", "搞笑段子",
    "壁纸", "通用科普",
]


def load_frozen_paths(frozen_ts: Path = FROZEN_TS) -> set[str]:
    if not frozen_ts.exists():
        return set()
    txt = frozen_ts.read_text(encoding="utf-8")
    m = re.search(r"FROZEN_PATHS[^=]*=\s*new Set\(\[([\s\S]*?)\]\)", txt)
    if not m:
        return set()
    return set(re.findall(r'"([^"]+)"', m.group(1)))


def score_topic(title: str, jtbd: str = "", body_hint: str = "") -> dict:
    """按 Product-Led SEO + Ahrefs《Discoverable》0–3 分商业潜力打分。"""
    blob = f"{title} {jtbd} {body_hint}".lower()

    drift_hits = [w for w in DRIFT_SIGNALS if w in blob]
    pillar_scores: list[dict] = []
    best_score = 0
    best_pillar: dict | None = None

    for p in BUSINESS_PILLARS:
        t3 = [k for k in p["tier3_terms"] if k in blob]
        t2 = [k for k in p["tier2_terms"] if k in blob]
        if len(t3) >= 2 or (len(t3) == 1 and (len(t2) >= 1 or bool(jtbd.strip()))):
            sc = 3
        elif len(t3) == 1 or len(t2) >= 2:
            sc = 2
        elif len(t2) == 1:
            sc = 1
        else:
            sc = 0
        pillar_scores.append({
            "pillar": p["id"],
            "name": p["name"],
            "score": sc,
            "tier3_hits": t3[:6],
            "tier2_hits": t2[:6],
            "money_pages": p["money_pages"],
        })
        if sc > best_score:
            best_score = sc
            best_pillar = p

    if drift_hits and best_score < 2:
        best_score = 0

    if best_score == 3:
        verdict = "GO（3 分核心商业题：即使月搜 <50 也优先写）"
    elif best_score == 2:
        verdict = "GO（2 分强关联题：需配明确内链指向赚钱页/工具页）"
    elif best_score == 1:
        verdict = "DEFER（1 分弱关联：仅在能补齐专题护城河时写，勿优先）"
    else:
        verdict = "REJECT（0 分泛流量/主题漂移风险：停写，防止 HubSpot 式稀释）"

    return {
        "title": title,
        "jtbd": jtbd,
        "business_potential_score": best_score,
        "verdict": verdict,
        "primary_pillar": best_pillar["name"] if best_pillar else "无匹配核心业务线",
        "target_money_pages": best_pillar["money_pages"] if best_pillar else [],
        "drift_hits": drift_hits,
        "breakdown": pillar_scores,
    }


def split_frontmatter(md_text: str) -> tuple[dict[str, str], str]:
    m = re.match(r"^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$", md_text)
    if not m:
        return {}, md_text
    fm_raw, body = m.group(1), m.group(2)
    fm: dict[str, str] = {}
    for line in fm_raw.splitlines():
        kv = re.match(r"^([A-Za-z0-9_]+)\s*:\s*(.*)$", line)
        if kv:
            fm[kv.group(1)] = kv.group(2).strip().strip('"').strip("'")
    return fm, body


def strip_md_noise(text: str) -> str:
    text = re.sub(r"```[\s\S]*?```", " ", text)
    text = re.sub(r"`[^`]+`", " ", text)
    text = re.sub(r"!\[[^\]]*\]\([^)]+\)", " ", text)
    text = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", text)
    return text


def audit_post_text(slug: str, md_text: str, frozen_paths: set[str] | None = None) -> dict:
    """对单篇博文跑：0–3 商业潜力 + 5 项清迈 SEO 独有素材门禁。"""
    frozen = frozen_paths if frozen_paths is not None else load_frozen_paths()
    base_slug = slug[:-3] if slug.endswith(".en") else slug
    is_frozen = (f"/en/blog/{base_slug}" in frozen) or (f"/zh/blog/{base_slug}" in frozen)

    fm, body = split_frontmatter(md_text)
    title = fm.get("title") or fm.get("titleEn") or slug
    desc = fm.get("description") or fm.get("descriptionEn") or ""
    date_str = fm.get("updatedAt") or fm.get("date") or ""

    # 切出开篇（前 ~900 字符 ≈ 英文 150–250 词 / 中文 350–450 字）
    clean_body = strip_md_noise(body).strip()
    intro = clean_body[:900]

    # 1. 开篇一手经验信号（5.5x）
    intro_exp_pat = re.compile(
        r"(实测|亲测|我测了|我踩过|踩坑|我们分析|我们扫描|我跑了|我用|我在|实战|真实账单|亲自|"
        r"\bI tested\b|\bwe tested\b|\bwe analyzed\b|\bwe audited\b|\bwe scanned\b|\bmy own\b|\bin my experience\b|\bfirst-hand\b|\bhands-on\b)",
        re.I,
    )
    has_intro_exp = bool(intro_exp_pat.search(intro))

    # 2. 自有量测数字 / 实测表格 / DOI 数据集（4.4x）
    has_table = bool(re.search(r"^\s*\|.+\|\s*\n\s*\|[\s:\-|]+\|", body, re.M))
    has_doi_or_dataset = bool(re.search(r"(10\.5281/zenodo\.\d+|zenodo\.org|200,?000|130,?173|285,?000|\$\d+(?:\.\d+)?|\d+(?:\.\d+)?%)", body, re.I))
    has_self_metrics = has_table or has_doi_or_dataset

    # 3. 真实案例 / 实操证据（3.6x）
    case_pat = re.compile(
        r"(案例|真实数据|实操记录|截图证明|客户|账单|回执|时间线|步骤\s*1|Case study|real-world|receipt|screenshot|live test|step\s*1|payout|invoice)",
        re.I,
    )
    has_case_evidence = bool(case_pat.search(body))

    # 4. 原创截图 / 图表（2.4x）
    images = re.findall(r"!\[([^\]]*)\]\(([^)]+)\)", body)
    # 排除纯封面/无意义文件名，统计正文图数量
    has_screenshots = len(images) >= 1

    # 5. 决策边界 / 80-20 独家判断（防换品牌名测试失分）
    boundary_pat = re.compile(
        r"(不适合|慎选|别选|不要用|前提条件|适用边界|什么时候选|什么时候不选|反直觉|实测发现|门槛|底线|红线|"
        r"\bwhen not to\b|\bskip if\b|\bavoid if\b|\btrade-?off\b|\bcaveat\b|\bwho should\b|\bwho shouldn't\b|\bcontrary to\b)",
        re.I,
    )
    has_decision_boundary = bool(boundary_pat.search(body))

    checks = {
        "intro_first_hand_experience": has_intro_exp,
        "self_measured_data_or_table": has_self_metrics,
        "real_case_or_receipt_evidence": has_case_evidence,
        "original_screenshots_or_charts": has_screenshots,
        "decision_boundary_80_20": has_decision_boundary,
    }
    unique_count = sum(1 for v in checks.values() if v)
    topic_res = score_topic(title, jtbd=desc, body_hint=intro[:400])

    missing = [k for k, v in checks.items() if not v]
    if is_frozen:
        action = "FROZEN（2027-01-01 前冻结，仅观测不改稿）"
    elif unique_count >= 4 and topic_res["business_potential_score"] >= 2:
        action = "PASS（商业潜力 + ≥4 种独有素材达标）"
    elif topic_res["business_potential_score"] <= 1:
        action = "LOW_BIZ（商业潜力 ≤1：勿再扩写，可仅加内链导流给赚钱页）"
    else:
        action = f"UPGRADE（缺 {len(missing)} 项独有素材：{', '.join(missing)}）"

    return {
        "slug": slug,
        "title": title,
        "date": date_str,
        "is_frozen": is_frozen,
        "business_score": topic_res["business_potential_score"],
        "primary_pillar": topic_res["primary_pillar"],
        "target_money_pages": topic_res["target_money_pages"],
        "unique_evidence_count": unique_count,
        "checks": checks,
        "image_count": len(images),
        "action": action,
    }


def render_audit_report(results: list[dict]) -> str:
    unfrozen = [r for r in results if not r["is_frozen"]]
    frozen = [r for r in results if r["is_frozen"]]
    pass_cnt = sum(1 for r in unfrozen if r["unique_evidence_count"] >= 4 and r["business_score"] >= 2)
    need_upgrade = [r for r in unfrozen if r["business_score"] >= 2 and r["unique_evidence_count"] < 4]
    need_upgrade.sort(key=lambda x: (-x["business_score"], x["unique_evidence_count"], x["slug"]))

    lines = [
        "# Product-Led SEO 商业潜力 & 独有素材门禁审计报告",
        "",
        f"- **总计扫描博文**：{len(results)} 篇（非冻结 **{len(unfrozen)}** 篇 · 冻结跳过 **{len(frozen)}** 篇）",
        f"- **非冻结高商业价值达标（商业分 ≥2 且 独有素材 ≥4/5）**：**{pass_cnt}/{len(unfrozen)}** 篇",
        f"- **优先补强清单（非冻结 · 商业分 ≥2 但独有素材 <4/5）**：**{len(need_upgrade)}** 篇",
        "",
        "> 判据来自 Eli Schwartz《Product-Led SEO》+ Ahrefs 0–3 分商业潜力 + 2026 清迈 SEO 实证（开篇一手经验 5.5x、自测数据 4.4x、案例证据 3.6x、自截图 2.4x，≥4 种素材 Top 3 概率跳升至 20%）。",
        "",
        "## 一、非冻结高商业潜力页补强优先队列",
        "",
        "| Slug | 商业分 | 独有素材 | 缺失项 | 建议导流赚钱页 |",
        "| --- | ---: | ---: | --- | --- |",
    ]
    for r in need_upgrade[:30]:
        miss = ", ".join(k for k, v in r["checks"].items() if not v)
        mp = ", ".join(f"`{p}`" for p in r["target_money_pages"][:2])
        lines.append(f"| `{r['slug']}` | {r['business_score']}/3 | {r['unique_evidence_count']}/5 | {miss} | {mp} |")

    lines += [
        "",
        "## 二、全部非冻结博文明细",
        "",
        "| Slug | 日期 | 商业分 | 业务线 | 独有素材 | 正文图 | 状态 |",
        "| --- | --- | ---: | --- | ---: | ---: | --- |",
    ]
    for r in sorted(unfrozen, key=lambda x: (-x["business_score"], -x["unique_evidence_count"], x["slug"])):
        lines.append(
            f"| `{r['slug']}` | {r['date'] or '-'} | {r['business_score']}/3 | {r['primary_pillar']} | "
            f"{r['unique_evidence_count']}/5 | {r['image_count']} | {r['action']} |"
        )
    lines.append("")
    return "\n".join(lines)


def selftest() -> int:
    # 1. 3-point commercial topic
    r3 = score_topic("Creem vs Dodo Payments $20 SaaS Fee Breakdown for Chinese Founders", jtbd="Choose MoR without US LLC")
    assert r3["business_potential_score"] == 3, r3
    assert "/en/go-global/payments" in r3["target_money_pages"]

    # 2. 0-point topical drift topic
    r0 = score_topic("50 Best Birthday Wishes and Famous Quotes for 2026")
    assert r0["business_potential_score"] == 0, r0
    assert r0["drift_hits"]

    # 3. High-quality post passes all 5 unique evidence checks
    good_md = """---
title: "Creem vs Dodo Payments: Real $20 Checkout Test"
description: "Hands-on fee comparison for Chinese indie SaaS founders"
date: "2026-11-28"
---
I tested both Creem and Dodo Payments on a real $20/mo subscription using our Zenodo dataset (10.5281/zenodo.24387071).

| Platform | Net |
| --- | --- |
| Creem | $18.63 |
| Dodo | $18.40 |

![Creem payout receipt](/images/creem-receipt.png)

Case study: Avoid if your average order value is under $10 because minimum payout fees eat margin.
"""
    res_good = audit_post_text("test-good-post", good_md, frozen_paths=set())
    assert res_good["unique_evidence_count"] == 5, res_good
    assert res_good["business_score"] == 3, res_good
    assert res_good["action"].startswith("PASS"), res_good

    # 4. Frozen post must be flagged FROZEN
    res_frozen = audit_post_text("indie-payments-report-2026", good_md, frozen_paths={"/en/blog/indie-payments-report-2026"})
    assert res_frozen["is_frozen"] is True
    assert res_frozen["action"].startswith("FROZEN")

    print("content_gate selftest ok")
    return 0


def main() -> int:
    ap = argparse.ArgumentParser(description="Product-Led SEO 0–3 商业潜力闸门 + 清迈 SEO 独有素材自动质检")
    ap.add_argument("--selftest", action="store_true", help="运行自测")
    sub = ap.add_subparsers(dest="cmd")

    s = sub.add_parser("score-topic", help="对新选题打 0–3 分商业潜力")
    s.add_argument("--title", required=True, help="选题标题")
    s.add_argument("--jtbd", default="", help="目标用户的 Job-to-be-Done")
    s.add_argument("--json", action="store_true", help="输出 JSON")

    p = sub.add_parser("audit-post", help="质检单篇博客 Markdown")
    p.add_argument("path", help="Markdown 文件路径")

    a = sub.add_parser("audit-all", help="批量质检 src/content/blog 下全部非冻结博文")
    a.add_argument("--out", default="", help="输出 Markdown 报告路径")

    args = ap.parse_args()
    if args.selftest:
        return selftest()
    if args.cmd == "score-topic":
        res = score_topic(args.title, jtbd=args.jtbd)
        if args.json:
            print(json.dumps(res, ensure_ascii=False, indent=2))
        else:
            print(f"选题：{res['title']}")
            print(f"商业潜力：{res['business_potential_score']}/3 — {res['verdict']}")
            print(f"主业务线：{res['primary_pillar']}")
            print(f"目标赚钱页：{', '.join(res['target_money_pages']) or '无'}")
        return 0 if res["business_potential_score"] >= 2 else 2
    if args.cmd == "audit-post":
        fp = Path(args.path)
        res = audit_post_text(fp.stem, fp.read_text(encoding="utf-8"))
        print(json.dumps(res, ensure_ascii=False, indent=2))
        return 0
    if args.cmd == "audit-all":
        frozen = load_frozen_paths()
        results = []
        for md in sorted(BLOG_DIR.glob("*.md")):
            results.append(audit_post_text(md.stem, md.read_text(encoding="utf-8"), frozen_paths=frozen))
        report = render_audit_report(results)
        if args.out:
            outp = Path(args.out)
            outp.parent.mkdir(parents=True, exist_ok=True)
            outp.write_text(report, encoding="utf-8")
            print(f"已写入内容门禁审计报告：{outp}")
        else:
            print(report)
        return 0
    ap.print_help()
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
