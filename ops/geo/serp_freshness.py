#!/usr/bin/env python3
"""Top 20 核心词季度 SERP 构成快照 + 非冻结核心页 90 天新鲜度三批轮换计划。

理论来源（AirOps 2026 + Hank Chang 流量除错框架）：
  1. 超过 3 个月（90 天）未更新的页面，被 AI 引用的概率掉 3 倍；
     核心商业页分三批，每月更新一批、一季转一圈（补新案例/当年数据/新问答）。
  2. 流量下滑 4/5 源于意图漂移（格式变视频/论坛、决策阶段下移）或 AI Overview 拦截，
     必须定期留存核心词 SERP 构成快照，才能做「异常前 vs 现在」的并排比对。
  3. 严格读取 src/lib/frozen-pages.ts，32 个冻结页在 2027-01-01 前全部排入冻结观察区，绝不排进轮换更新。

用法：
  python3 ops/geo/serp_freshness.py --selftest
  python3 ops/geo/serp_freshness.py freshness --date 2026-11-28 --out /Users/zhuyansen/出海/specs/freshness-rotation-2026-11-28.md
  python3 ops/geo/serp_freshness.py serp-diff --prev snap-q3.json --curr snap-q4.json
"""
from __future__ import annotations

import argparse
import json
import re
import subprocess
from datetime import date, datetime, timedelta, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
BLOG_DIR = ROOT / "src" / "content" / "blog"
APP_LANG_DIR = ROOT / "src" / "app" / "[lang]"
FROZEN_TS = ROOT / "src" / "lib" / "frozen-pages.ts"
WATCHLIST_PATH = ROOT / "ops" / "geo" / "serp-watchlist.json"

CORE_APP_PAGES = [
    ("contact", "src/app/[lang]/contact/page.tsx", "/en/contact"),
    ("club", "src/app/[lang]/club/page.tsx", "/en/club"),
    ("research", "src/app/[lang]/research/page.tsx", "/en/research"),
    ("research-ai-crawlers", "src/app/[lang]/research/ai-crawlers/page.tsx", "/en/research/ai-crawlers"),
    ("go-global-domains", "src/app/[lang]/go-global/domains/page.tsx", "/en/go-global/domains"),
    ("go-global-ai-readiness", "src/app/[lang]/go-global/ai-readiness/page.tsx", "/en/go-global/ai-readiness"),
    ("zh-services", "src/app/[lang]/services/page.tsx", "/zh/services"),
]


def load_frozen_paths(frozen_ts: Path = FROZEN_TS) -> set[str]:
    if not frozen_ts.exists():
        return set()
    txt = frozen_ts.read_text(encoding="utf-8")
    m = re.search(r"FROZEN_PATHS[^=]*=\s*new Set\(\[([\s\S]*?)\]\)", txt)
    if not m:
        return set()
    return set(re.findall(r'"([^"]+)"', m.group(1)))


def git_last_commit_date(rel_path: str, root: Path = ROOT) -> str:
    try:
        out = subprocess.check_output(
            ["git", "-C", str(root), "log", "-1", "--format=%cs", "--", rel_path],
            stderr=subprocess.DEVNULL,
            text=True,
            timeout=5,
        ).strip()
        return out if re.match(r"^\d{4}-\d{2}-\d{2}$", out) else ""
    except Exception:
        return ""


def parse_frontmatter_date(md_text: str) -> str:
    m = re.match(r"^---\s*\n([\s\S]*?)\n---", md_text)
    if not m:
        return ""
    fm = m.group(1)
    for key in ("updatedAt", "updated", "date"):
        km = re.search(rf"^{key}\s*:\s*[\"']?(\d{{4}}-\d{{2}}-\d{{2}})", fm, re.M)
        if km:
            return km.group(1)
    return ""


def audit_freshness(as_of: date, stale_days: int = 90, root: Path = ROOT) -> dict:
    frozen = load_frozen_paths(root / "src" / "lib" / "frozen-pages.ts")
    items: list[dict] = []

    # 1. 非冻结核心落地页
    for label, rel, path in CORE_APP_PAGES:
        if path in frozen:
            continue
        fp = root / rel
        if not fp.exists():
            continue
        dstr = git_last_commit_date(rel, root=root)
        age = (as_of - date.fromisoformat(dstr)).days if dstr else 999
        items.append({
            "kind": "core-page",
            "path": path,
            "file": rel,
            "last_updated": dstr or "unknown",
            "age_days": age,
            "stale": age > stale_days,
        })

    # 2. 非冻结博文
    bdir = root / "src" / "content" / "blog"
    if bdir.exists():
        for md in sorted(bdir.glob("*.md")):
            slug = md.stem
            base_slug = slug[:-3] if slug.endswith(".en") else slug
            en_path = f"/en/blog/{base_slug}"
            zh_path = f"/zh/blog/{base_slug}"
            if en_path in frozen or zh_path in frozen:
                continue
            txt = md.read_text(encoding="utf-8", errors="ignore")
            dstr = parse_frontmatter_date(txt) or git_last_commit_date(f"src/content/blog/{md.name}", root=root)
            age = (as_of - date.fromisoformat(dstr)).days if dstr else 999
            items.append({
                "kind": "blog-en" if slug.endswith(".en") else "blog",
                "path": f"/en/blog/{base_slug}" if slug.endswith(".en") else f"/zh/blog/{base_slug}",
                "file": f"src/content/blog/{md.name}",
                "last_updated": dstr or "unknown",
                "age_days": age,
                "stale": age > stale_days,
            })

    # 按最久未更新排序，并分成 Month 1 / Month 2 / Month 3 三批季度轮换
    items.sort(key=lambda x: (-x["age_days"], x["kind"] != "core-page", x["path"]))
    for idx, it in enumerate(items):
        it["rotation_batch"] = (idx % 3) + 1  # Batch 1=本月, 2=下月, 3=后月

    return {
        "as_of": as_of.isoformat(),
        "stale_days": stale_days,
        "frozen_skipped": len(frozen),
        "total_unfrozen": len(items),
        "stale_count": sum(1 for x in items if x["stale"]),
        "items": items,
    }


def diff_serp_snapshots(prev: dict, curr: dict) -> list[dict]:
    """比较两份季度 SERP 构成快照，标出 AIO 出现/消失、格式漂移、前 5 域名洗牌。"""
    p_map = {q["id"]: q for q in (prev.get("queries") or [])}
    alerts: list[dict] = []
    for cq in curr.get("queries") or []:
        qid = cq["id"]
        pq = p_map.get(qid)
        if not pq:
            continue
        changes: list[str] = []
        if bool(pq.get("has_ai_overview")) != bool(cq.get("has_ai_overview")):
            changes.append(f"AI Overview: {pq.get('has_ai_overview')} → {cq.get('has_ai_overview')}")
        if (pq.get("dominant_format") or "") != (cq.get("dominant_format") or ""):
            changes.append(f"主导格式漂移: {pq.get('dominant_format')} → {cq.get('dominant_format')}")
        p_top = set(pq.get("top5_domains") or [])
        c_top = set(cq.get("top5_domains") or [])
        if p_top and c_top:
            overlap = len(p_top & c_top)
            if overlap <= 2:
                changes.append(f"Top 5 域名大洗牌（仅保留 {overlap}/5：{sorted(c_top - p_top)} 新进）")
        if changes:
            alerts.append({"id": qid, "query": cq.get("query", qid), "changes": changes})
    return alerts


def render_freshness_md(data: dict) -> str:
    lines = [
        f"# 非冻结核心页 90 天新鲜度巡检与季度三批轮换表（{data['as_of']}）",
        "",
        f"- **衰减红线**：>{data['stale_days']} 天未更新（AirOps 2026：超过 3 个月未更新页面 AI 引用率掉 3 倍）",
        f"- **跳过冻结页**：{data['frozen_skipped']} 个（2027-01-01 前不动）",
        f"- **非冻结页面总数**：{data['total_unfrozen']} 个，其中 **超期 >{data['stale_days']} 天**：**{data['stale_count']}** 个",
        "",
        "> 每次轮换刷新不必重写全文：补 1 个最新实测案例 / 刷新当年费率与数字 / 新增 1–2 个真实客户 FAQ，即可更新 `updatedAt` 触发 AI 新鲜度信号。",
        "",
    ]
    for batch, label in ((1, "第一批（本月优先刷新）"), (2, "第二批（下月刷新）"), (3, "第三批（第三个月刷新）")):
        b_items = [x for x in data["items"] if x["rotation_batch"] == batch]
        lines += [
            f"## {label}（共 {len(b_items)} 页）",
            "",
            "| 类型 | 页面路径 | 最近更新 | 已过天数 | 状态 |",
            "| --- | --- | --- | ---: | --- |",
        ]
        for x in b_items[:20]:
            st = "🔴 超 90 天需刷新" if x["stale"] else "🟢 新鲜"
            lines.append(f"| `{x['kind']}` | `{x['path']}` | {x['last_updated']} | {x['age_days']} | {st} |")
        lines.append("")
    return "\n".join(lines)


def selftest() -> int:
    # 1. Frontmatter date parse
    assert parse_frontmatter_date("---\ntitle: X\ndate: 2026-08-01\nupdatedAt: 2026-10-15\n---\nbody") == "2026-10-15"
    assert parse_frontmatter_date("---\ndate: '2026-06-01'\n---\nbody") == "2026-06-01"

    # 2. SERP snapshot diff catches AIO + format drift + top5 churn
    prev = {
        "queries": [
            {"id": "q1", "query": "creem vs dodo payments", "has_ai_overview": False, "dominant_format": "comparison",
             "top5_domains": ["paas.build", "saastracker.org", "creem.io", "dodopayments.com", "reddit.com"]},
            {"id": "q2", "query": "stripe china founder", "has_ai_overview": True, "dominant_format": "guide",
             "top5_domains": ["stripe.com", "jasonzhu.ai", "atlas.com", "wise.com", "mercury.com"]},
        ]
    }
    curr = {
        "queries": [
            {"id": "q1", "query": "creem vs dodo payments", "has_ai_overview": True, "dominant_format": "reddit+video",
             "top5_domains": ["reddit.com", "youtube.com", "new1.com", "new2.com", "paas.build"]},
            {"id": "q2", "query": "stripe china founder", "has_ai_overview": True, "dominant_format": "guide",
             "top5_domains": ["stripe.com", "jasonzhu.ai", "atlas.com", "wise.com", "mercury.com"]},
        ]
    }
    alerts = diff_serp_snapshots(prev, curr)
    assert len(alerts) == 1 and alerts[0]["id"] == "q1" and len(alerts[0]["changes"]) == 3, alerts

    # 3. Watchlist exists and has >= 20 queries when present
    if WATCHLIST_PATH.exists():
        wl = json.loads(WATCHLIST_PATH.read_text(encoding="utf-8"))
        assert len(wl.get("queries") or []) >= 20, "watchlist should have >=20 core queries"

    print("serp_freshness selftest ok")
    return 0


def main() -> int:
    ap = argparse.ArgumentParser(description="Top 20 SERP 快照对比 + 非冻结核心页 90 天新鲜度三批轮换")
    ap.add_argument("--selftest", action="store_true")
    sub = ap.add_subparsers(dest="cmd")

    f = sub.add_parser("freshness", help="生成非冻结页 90 天新鲜度与三批轮换表")
    f.add_argument("--date", default="", help="基准日期 YYYY-MM-DD")
    f.add_argument("--stale-days", type=int, default=90)
    f.add_argument("--out", default="")

    d = sub.add_parser("serp-diff", help="对比两份季度 SERP 快照")
    d.add_argument("--prev", required=True)
    d.add_argument("--curr", required=True)

    args = ap.parse_args()
    if args.selftest:
        return selftest()
    if args.cmd == "freshness":
        as_of = date.fromisoformat(args.date) if args.date else datetime.now(timezone(timedelta(hours=8))).date()
        res = audit_freshness(as_of=as_of, stale_days=args.stale_days)
        md = render_freshness_md(res)
        if args.out:
            p = Path(args.out)
            p.parent.mkdir(parents=True, exist_ok=True)
            p.write_text(md, encoding="utf-8")
            print(f"已写入新鲜度轮换报告：{p}")
        else:
            print(md)
        return 0
    if args.cmd == "serp-diff":
        prev = json.loads(Path(args.prev).read_text(encoding="utf-8"))
        curr = json.loads(Path(args.curr).read_text(encoding="utf-8"))
        alerts = diff_serp_snapshots(prev, curr)
        print(json.dumps(alerts, ensure_ascii=False, indent=2))
        return 0
    ap.print_help()
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
