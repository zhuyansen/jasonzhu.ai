#!/usr/bin/env python3
"""站外第三方高频引源挖掘（Source Opportunities，对应 Semrush #8 / AirOps 85% 站外提及规律）。

从已有 AI 引用面板全量文件（panel-full.json）或 CE-GAD 对抗诊断报告（adversarial-critic-*.md）中，
抽取「在目标问题下已被 AI 引用、但 jasonzhu.ai 未被引」的外部 URL，按外联可行性自动分桶并匹配
我方原创研究数据 Pitch 资产（Zenodo 数据集 / AI 爬虫开放数据 / 实时工具），输出可直接执行的外联清单。

隐私护栏（同 fanout_actions.py / adversarial_critic.py）：
  - 含第三方/竞品具体 URL 的明细表只写本地 --out（例如 specs/source-opportunities-YYYY-MM-DD.md），
    绝不提交进公开仓库；
  - --public 仅输出按桶汇总的纯计数 JSON。

用法：
  python3 ops/geo/source_opportunities.py --selftest
  python3 ops/geo/source_opportunities.py extract \\
      --critic-md /Users/zhuyansen/出海/specs/adversarial-critic-2026-11-27.md \\
      --out /Users/zhuyansen/出海/specs/source-opportunities-2026-11-27.md
  python3 ops/geo/source_opportunities.py extract \\
      --full /tmp/panel-full.json --out /tmp/source-opportunities.md
"""
from __future__ import annotations

import argparse
import json
import re
import sys
import urllib.parse
from collections import Counter, defaultdict
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any

OWN_HOST = "jasonzhu.ai"
SKIP_HOSTS = {
    OWN_HOST,
    f"www.{OWN_HOST}",
    "vertexaisearch.cloud.google.com",
    "google.com",
    "www.google.com",
    "bing.com",
    "www.bing.com",
    "t.co",
}

COMMUNITY_HOSTS = {
    "reddit.com",
    "old.reddit.com",
    "news.ycombinator.com",
    "indiehackers.com",
    "dev.to",
    "medium.com",
    "substack.com",
    "github.com",
    "stackoverflow.com",
    "quora.com",
    "v2ex.com",
    "zhihu.com",
    "x.com",
    "twitter.com",
    "linkedin.com",
    "youtube.com",
    "youtu.be",
}

REVIEW_DIRECTORY_HOSTS = {
    "g2.com",
    "capterra.com",
    "trustpilot.com",
    "producthunt.com",
    "alternativeto.net",
    "slant.co",
    "softwareadvice.com",
    "getapp.com",
    "saasworthy.com",
    "sourceforge.net",
    "trustradius.com",
}

OFFICIAL_HOSTS = {
    "irs.gov",
    "gov.uk",
    "sos.wyo.gov",
    "wyoming.gov",
    "corp.delaware.gov",
    "learn.microsoft.com",
    "docs.anthropic.com",
    "anthropic.com",
    "openai.com",
    "platform.openai.com",
    "nvidia.com",
    "developer.nvidia.com",
    "developers.google.com",
    "modelcontextprotocol.io",
    "w3.org",
    "ietf.org",
    "schema.org",
}

COMPETITOR_VENDOR_HOSTS = {
    "stripe.com",
    "paddle.com",
    "dodopayments.com",
    "creem.io",
    "polar.sh",
    "lemonsqueezy.com",
    "gumroad.com",
    "paypal.com",
    "shopify.com",
    "waffo.com",
    "airwallex.com",
    "wise.com",
    "mercury.com",
    "firstbase.io",
    "doola.com",
    "northwestregisteredagent.com",
    "zenbusiness.com",
    "legalzoom.com",
    "1stformations.co.uk",
    "yourcompanyformations.co.uk",
    "rapidformations.co.uk",
    "fastspring.com",
    "payproglobal.com",
    "2checkout.com",
    "verifone.com",
}

BUCKET_META: dict[str, tuple[int, str, str]] = {
    "roundup_listicle": (1, "P1 榜单/合集（高优 Pitch 补录）", "拿原创研究数据/独家边界点联系作者补充条目或数据引用"),
    "comparison_review": (1, "P1 对比/评测目录（高优认领/补录）", "认领产品档案、补充最新费率/实测数据或客户真实评价"),
    "community_qa": (1, "P1 社区/问答/专栏（本人署名参与）", "以 Jason Zhu 实名在原帖/同类问题下用一手数据补充回答，或在同平台发原创数据帖"),
    "media_newsletter": (2, "P2 第三方媒体/行业博客（数据 Pitch）", "定向发简短原创数据摘要（不求泛外链，只供作者引用一手实测数据）"),
    "competitor_owned": (3, "监控：直接竞品/服务商官网", "不外联；留作 CE-GAD 对抗拆解样本"),
    "official_docs": (4, "参考：官方/政府/标准文档", "不可外联；核对自家文章费率与政策口径是否与其同步"),
}


def clean_url(raw: str) -> str:
    u = str(raw or "").strip()
    u = u.split("#:~:text=", 1)[0].split("#", 1)[0].strip()
    return u.rstrip(".,);]")


def host_of(url: str) -> str:
    try:
        h = (urllib.parse.urlsplit(url).hostname or "").lower()
        return h.removeprefix("www.")
    except Exception:
        return ""


def _host_matches(host: str, group: set[str]) -> bool:
    return host in group or any(host.endswith("." + g) for g in group)


def classify_source(url: str) -> str:
    """将外部被引 URL 分类到 6 个外联/监控桶。"""
    h = host_of(url)
    path_q = urllib.parse.urlsplit(url).path.lower()

    if not h:
        return "media_newsletter"
    if (
        _host_matches(h, OFFICIAL_HOSTS)
        or h.endswith((".gov", ".gov.uk", ".gov.cn", ".edu"))
        or ".gov." in h
        or h == "wikipedia.org"
        or h.endswith(".wikipedia.org")
    ):
        return "official_docs"
    if _host_matches(h, COMMUNITY_HOSTS):
        return "community_qa"
    if _host_matches(h, REVIEW_DIRECTORY_HOSTS):
        return "comparison_review"
    if _host_matches(h, COMPETITOR_VENDOR_HOSTS):
        return "competitor_owned"

    # 第三方站点按 URL 路径语义细分：榜单合集 vs 对比评测 vs 行业博客/媒体
    if re.search(r"/(best|top)[-_]|alternatives|roundup|directory|list-of|awesome", path_q):
        return "roundup_listicle"
    if re.search(r"-vs-|_vs_|comparison|compare|review|pricing-comparison", path_q):
        return "comparison_review"
    return "media_newsletter"


def recommend_pitch_asset(question_ids: list[str], urls: list[str]) -> str:
    """根据触发题号与主题，匹配我方最硬核的原创研究数据 Pitch 资产。"""
    joined = " ".join(question_ids + urls).lower()
    if any(k in joined for k in ("pay", "mor", "tax", "stripe", "paddle", "dodo", "creem", "waffo", "lemon", "fee")):
        return "200k 独立开发者收款调研数据集（Zenodo DOI）+ `/en/go-global/payments` 实时净到手计算器"
    if any(k in joined for k in ("llc", "uk", "company", "wyoming", "delaware", "wise", "mercury", "co-us-or-uk", "open-account")):
        return "US LLC vs UK Ltd 2026 官费与银行开户实测对照表（`/en/go-global`）"
    if any(k in joined for k in ("agent", "mcp", "skill", "harness", "claude", "opus")):
        return "130k+ AI Agent Skills 安全分级数据集（Zenodo DOI）+ `agentskillshub.top` 实测评级"
    if any(k in joined for k in ("crawler", "geo", "seo", "readiness", "visibility")):
        return "`/en/research/ai-crawlers` 月度 AI 爬虫公开数据集（CC BY 4.0）+ `/en/go-global/ai-readiness` 26 项在线体检"
    return "Jason Zhu 公开实测数据集与工作论文（`/en/research` · Zenodo DOI）"


def parse_panel_full(path: Path) -> list[dict[str, Any]]:
    """从 panel-full.json 提取「我方未被引用时」出现的外部被引记录。"""
    data = json.loads(path.read_text(encoding="utf-8"))
    records: list[dict[str, Any]] = []
    for row in data.get("answers") or data.get("rows") or []:
        qid = str(row.get("question_id") or "")
        engine = str(row.get("engine") or "unknown")
        our_cited = bool(row.get("site_cited"))
        for c in row.get("cited") or row.get("citations") or []:
            raw_u = c.get("url") if isinstance(c, dict) else str(c)
            u = clean_url(raw_u)
            if not u.startswith(("http://", "https://")):
                continue
            h = host_of(u)
            if not h or h in SKIP_HOSTS or h.endswith("." + OWN_HOST):
                continue
            records.append({
                "url": u,
                "host": h,
                "question_id": qid,
                "engine": engine,
                "our_missed": not our_cited,
                "source_file": path.name,
            })
    return records


def parse_critic_markdown(path: Path) -> list[dict[str, Any]]:
    """从 adversarial-critic-*.md 解析每题实际被引的外部竞品/第三方 URL。"""
    text = path.read_text(encoding="utf-8")
    records: list[dict[str, Any]] = []
    current_qid = ""
    for line in text.splitlines():
        m_q = re.search(r"###\s+\d+\.\s+`[^`]+`\s*·\s*题\s*`([^`]+)`", line)
        if m_q:
            current_qid = m_q.group(1).strip()
            continue
        if "实际被引 Top 竞品" in line:
            for raw_u in re.findall(r"https?://[^\s)（）;；]+", line):
                u = clean_url(raw_u)
                h = host_of(u)
                if not h or h in SKIP_HOSTS or h.endswith("." + OWN_HOST):
                    continue
                records.append({
                    "url": u,
                    "host": h,
                    "question_id": current_qid or "unknown",
                    "engine": "critic_probe",
                    "our_missed": True,
                    "source_file": path.name,
                })
    return records


def parse_urls_json(path: Path) -> list[dict[str, Any]]:
    """通用 JSON 输入：支持 [{url, question_id, engine, our_missed}]。"""
    data = json.loads(path.read_text(encoding="utf-8"))
    items = data if isinstance(data, list) else data.get("items") or []
    records: list[dict[str, Any]] = []
    for item in items:
        u = clean_url(item.get("url") or "")
        if not u.startswith(("http://", "https://")):
            continue
        h = host_of(u)
        if not h or h in SKIP_HOSTS or h.endswith("." + OWN_HOST):
            continue
        records.append({
            "url": u,
            "host": h,
            "question_id": str(item.get("question_id") or "unknown"),
            "engine": str(item.get("engine") or "unknown"),
            "our_missed": bool(item.get("our_missed", True)),
            "source_file": path.name,
        })
    return records


def aggregate_opportunities(records: list[dict[str, Any]], only_missed: bool = True) -> list[dict[str, Any]]:
    """按域名聚合第三方/外部引源，返回按优先级与失分频次排序的机会列表。"""
    by_host: dict[str, dict[str, Any]] = {}
    for r in records:
        if only_missed and not r.get("our_missed", True):
            continue
        u = r["url"]
        h = r["host"]
        bucket = classify_source(u)
        entry = by_host.get(h)
        if entry is None:
            entry = {
                "host": h,
                "bucket": bucket,
                "priority": BUCKET_META[bucket][0],
                "citations": 0,
                "urls": Counter(),
                "questions": set(),
                "engines": set(),
            }
            by_host[h] = entry
        # 如果同一域名下出现更高优桶（例如某站点同时有普通博客和 roundup 榜单），提升至更优桶
        if BUCKET_META[bucket][0] < entry["priority"]:
            entry["bucket"] = bucket
            entry["priority"] = BUCKET_META[bucket][0]
        entry["citations"] += 1
        entry["urls"][u] += 1
        if r.get("question_id"):
            entry["questions"].add(r["question_id"])
        if r.get("engine"):
            entry["engines"].add(r["engine"])

    out: list[dict[str, Any]] = []
    for entry in by_host.values():
        q_list = sorted(entry["questions"])
        top_urls = [u for u, _ in entry["urls"].most_common(3)]
        out.append({
            "host": entry["host"],
            "bucket": entry["bucket"],
            "priority": entry["priority"],
            "citations": entry["citations"],
            "question_count": len(q_list),
            "questions": q_list,
            "engines": sorted(entry["engines"]),
            "top_urls": top_urls,
            "pitch_asset": recommend_pitch_asset(q_list, top_urls),
            "action": BUCKET_META[entry["bucket"]][2],
        })

    out.sort(key=lambda x: (x["priority"], -x["question_count"], -x["citations"], x["host"]))
    return out


def render_markdown(date_str: str, sources_used: list[str], opps: list[dict[str, Any]]) -> str:
    bucket_counts = Counter(o["bucket"] for o in opps)
    actionable = [o for o in opps if o["priority"] <= 2]
    monitor_only = [o for o in opps if o["priority"] >= 3]

    lines = [
        f"# 站外 Source Opportunities 清单（{date_str}）",
        "",
        "> 依据 AirOps 2025 研究（~85% AI 品牌提及来自第三方页面）与 Semrush #8 打法：优先把原创研究数据 Pitch 给「目标题已被 AI 引用、但未提 `jasonzhu.ai`」的第三方榜单/评测/社区/媒体页，而非泛泛换外链。",
        "> **隐私提示**：本清单包含具体外部/竞品 URL，仅存本地 `specs/`，不提交到公开仓库。",
        "",
        f"- **输入源**：`{'`、`'.join(sources_used)}`",
        f"- **汇总**：共识别 **{len(opps)}** 个外部被引域名，其中 **P1/P2 可外联/参与第三方源 {len(actionable)} 个**，直接竞品/官方文档 {len(monitor_only)} 个。",
        "",
        "## 1. 按桶分布",
        "",
        "| 分类桶 | 域名数 | 行动策略 |",
        "| --- | ---: | --- |",
    ]
    for bkey, (_, label, action) in sorted(BUCKET_META.items(), key=lambda kv: (kv[1][0], kv[0])):
        lines.append(f"| {label} | {bucket_counts.get(bkey, 0)} | {action} |")

    lines.extend([
        "",
        "## 2. P1 / P2 可执行外联与参与清单（第三方源）",
        "",
    ])
    if actionable:
        lines.append("| 优先级/桶 | 第三方域名 | 覆盖题数 | 被引次 | 触发题号 | 代表被引 URL | 建议 Pitch 原创数据资产 |")
        lines.append("| --- | --- | ---: | ---: | --- | --- | --- |")
        for o in actionable:
            b_label = BUCKET_META[o["bucket"]][1].split("（", 1)[0]
            q_str = ", ".join(f"`{q}`" for q in o["questions"][:4])
            u_str = "<br>".join(o["top_urls"][:2])
            lines.append(
                f"| {b_label} | `{o['host']}` | {o['question_count']} | {o['citations']} | {q_str} | {u_str} | {o['pitch_asset']} |"
            )
    else:
        lines.append("（当前输入源中暂无 P1/P2 第三方域名；传入最新 `panel-full.json` 后可覆盖全量 50+ 题。）")

    if monitor_only:
        lines.extend([
            "",
            "## 3. 直接竞品官网 & 官方文档（仅监控/口径对齐，不做外联）",
            "",
            "| 分类 | 域名 | 覆盖题数 | 被引次 | 代表被引 URL |",
            "| --- | --- | ---: | ---: | --- |",
        ])
        for o in monitor_only:
            b_label = "竞品官网" if o["bucket"] == "competitor_owned" else "官方文档"
            lines.append(f"| {b_label} | `{o['host']}` | {o['question_count']} | {o['citations']} | {o['top_urls'][0]} |")

    lines.extend([
        "",
        "## 4. 下一步执行纪律",
        "",
        "1. **只拿一手数据 Pitch，不求泛外链**：发邮件/留言时直接附具体实测结论 + 公开数据集 DOI / 工具页链接，让作者省去核实成本。",
        "2. **社区平台以原创数据帖为主**：遵循 LinkedIn/社区 95% 原创帖被引规律，用实测表格+边界结论发原创帖，而非丢纯链接。",
        "3. **下次周报自动刷新**：周一 `geo-panel.yml` 跑完解密 `panel-full.json` 后，顺手跑本脚本更新全量 Source Opportunities。",
        "",
    ])
    return "\n".join(lines)


def selftest() -> int:
    import tempfile

    assert classify_source("https://www.stripe.com/pricing") == "competitor_owned"
    assert classify_source("https://www.gov.uk/limited-company-formation") == "official_docs"
    assert classify_source("https://www.reddit.com/r/SaaS/comments/abc/mor_vs_stripe/") == "community_qa"
    assert classify_source("https://www.g2.com/categories/merchant-of-record") == "comparison_review"
    assert classify_source("https://indieblog.example/best-merchant-of-record-2026") == "roundup_listicle"
    assert classify_source("https://technewsletter.example/mor-trends") == "media_newsletter"

    with tempfile.TemporaryDirectory() as td:
        t = Path(td)
        full_p = t / "panel-full.json"
        full_p.write_text(json.dumps({
            "answers": [
                {
                    "question_id": "real-pay-tax-headaches",
                    "engine": "perplexity",
                    "site_cited": False,
                    "cited": [
                        {"url": "https://indieblog.example/best-mor-platforms#:~:text=paddle"},
                        {"url": "https://www.reddit.com/r/SaaS/comments/123/mor/"},
                        {"url": "https://stripe.com/guides/sales-tax"},
                        {"url": "https://jasonzhu.ai/en/go-global/payments"},
                    ],
                },
                {
                    "question_id": "brand-who-is-jasonzhu",
                    "engine": "chatgpt",
                    "site_cited": True,
                    "cited": [{"url": "https://already-won.example/profile"}],
                },
            ]
        }), encoding="utf-8")

        md_p = t / "critic.md"
        md_p.write_text(
            "### 1. `/go-global` · 题 `real-co-us-or-uk-remote`\n"
            "- **实际被引 Top 竞品**：https://www.gov.uk/set-up-limited-company (已抓正文)；https://founderreview.example/us-llc-vs-uk-ltd (已抓正文)\n",
            encoding="utf-8",
        )

        recs = parse_panel_full(full_p) + parse_critic_markdown(md_p)
        opps = aggregate_opportunities(recs, only_missed=True)
        hosts = [o["host"] for o in opps]
        assert "jasonzhu.ai" not in hosts
        assert "already-won.example" not in hosts
        assert hosts[0] in ("founderreview.example", "indieblog.example", "reddit.com")
        assert any(o["bucket"] == "roundup_listicle" for o in opps)
        assert any(o["bucket"] == "comparison_review" for o in opps)
        assert any(o["bucket"] == "official_docs" for o in opps)

        report = render_markdown("2026-11-27", ["panel-full.json", "critic.md"], opps)
        assert "P1 榜单/合集" in report and "indieblog.example" in report

    print("source_opportunities selftest ok")
    return 0


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(description="抽取 AI 高频引用的第三方 Source Opportunities 外联清单")
    ap.add_argument("--selftest", action="store_true", help="运行本地单测")
    sub = ap.add_subparsers(dest="cmd")
    ex = sub.add_parser("extract", help="从 panel-full.json / adversarial-critic-*.md 提取第三方外联清单")
    ex.add_argument("--full", action="append", default=[], help="panel-full.json 路径（可多次传入）")
    ex.add_argument("--critic-md", action="append", default=[], help="adversarial-critic-*.md 路径（可多次传入）")
    ex.add_argument("--urls-json", action="append", default=[], help="通用 JSON URL 列表（可多次传入）")
    ex.add_argument("--include-won", action="store_true", help="也包含我方已被引的回答里的第三方源（默认只看我方未被引）")
    ex.add_argument("--date", default="", help="日期 YYYY-MM-DD（默认北京时间今天）")
    ex.add_argument("--out", default="", help="详细 Markdown 输出路径（存本地 specs/，不进公开仓库）")
    ex.add_argument("--public", default="", help="可选：不含 URL 明细的纯计数 JSON 输出路径")
    args = ap.parse_args(argv)

    if args.selftest:
        return selftest()
    if args.cmd != "extract":
        ap.print_help()
        return 1

    records: list[dict[str, Any]] = []
    sources_used: list[str] = []
    for p_str in args.full:
        p = Path(p_str)
        if p.exists():
            records.extend(parse_panel_full(p))
            sources_used.append(p.name)
    for p_str in args.critic_md:
        p = Path(p_str)
        if p.exists():
            records.extend(parse_critic_markdown(p))
            sources_used.append(p.name)
    for p_str in args.urls_json:
        p = Path(p_str)
        if p.exists():
            records.extend(parse_urls_json(p))
            sources_used.append(p.name)

    if not sources_used:
        raise SystemExit("未找到可用输入文件，请提供 --full、--critic-md 或 --urls-json")

    date_str = args.date or datetime.now(timezone(timedelta(hours=8))).date().isoformat()
    opps = aggregate_opportunities(records, only_missed=not args.include_won)
    md = render_markdown(date_str, sources_used, opps)

    if args.out:
        out_p = Path(args.out)
        out_p.parent.mkdir(parents=True, exist_ok=True)
        out_p.write_text(md, encoding="utf-8")
        print(f"已写入 Source Opportunities 报告：{out_p}")
    else:
        print(md)

    if args.public:
        bc = Counter(o["bucket"] for o in opps)
        pub = {
            "date": date_str,
            "sources_count": len(sources_used),
            "total_external_hosts": len(opps),
            "actionable_third_party_hosts": sum(1 for o in opps if o["priority"] <= 2),
            "by_bucket": dict(sorted(bc.items())),
            "script": "ops/geo/source_opportunities.py",
        }
        pub_p = Path(args.public)
        pub_p.parent.mkdir(parents=True, exist_ok=True)
        pub_p.write_text(json.dumps(pub, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        print(f"已写入公开计数：{pub_p}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
