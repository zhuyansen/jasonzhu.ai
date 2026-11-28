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
import html as html_mod
import json
import re
import sys
import urllib.parse
import urllib.request
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


GOAL_META: dict[str, tuple[str, str]] = {
    "roundup_listicle": ("GEO 引用 + 引荐流量（不纠结 DF/NF）", "1v1 手工数据 Pitch"),
    "comparison_review": ("GEO 引用 + 对比评测补录（不纠结 DF/NF）", "1v1 手工数据 Pitch"),
    "community_qa": ("品牌实体提及 + 社区引流（实名原创数据帖）", "本人实名数据回帖"),
    "media_newsletter": ("权威媒体引用 / 品牌背书（Digital PR）", "精简数据摘要 Pitch"),
    "competitor_owned": ("竞品拆解（仅监控）", "不外联"),
    "official_docs": ("政策/费率口径核对（仅参考）", "不外联"),
}

# 已核实的一手数据资产目录（口径严格对齐 src/lib/research.ts 与 payments/page.tsx）
PITCH_CATALOG: dict[str, dict[str, str]] = {
    "payments": {
        "summary": "200k 收款链接 + $20 跨国订阅实测净到手数据集（Zenodo DOI: 10.5281/zenodo.24386242 & 10.5281/zenodo.24387071 · 论文 10.5281/zenodo.24420870）+ `/en/go-global/payments`",
        "paper_doi": "https://doi.org/10.5281/zenodo.24420870",
        "dataset_200k_doi": "https://doi.org/10.5281/zenodo.24386242",
        "dataset_fee_doi": "https://doi.org/10.5281/zenodo.24387071",
        "tool_url": "https://jasonzhu.ai/en/go-global/payments",
    },
    "company": {
        "summary": "US LLC vs UK Ltd 2026 官费与银行开户实测对照表（`/en/go-global`）",
        "tool_url": "https://jasonzhu.ai/en/go-global",
    },
    "skills": {
        "summary": "130,173 AI Agent Skills 安全分级数据集（Zenodo DOI: 10.5281/zenodo.21292798 · 论文 10.5281/zenodo.24420919）+ `agentskillshub.top`",
        "paper_doi": "https://doi.org/10.5281/zenodo.24420919",
        "dataset_doi": "https://doi.org/10.5281/zenodo.21292798",
        "tool_url": "https://agentskillshub.top",
    },
    "crawlers": {
        "summary": "`/en/research/ai-crawlers` 月度 AI 爬虫公开数据集（CC-BY-4.0）+ `/en/go-global/ai-readiness` 26 项在线体检",
        "tool_url": "https://jasonzhu.ai/en/research/ai-crawlers",
    },
    "general": {
        "summary": "Jason Zhu 公开实测数据集与工作论文（`/en/research` · Zenodo DOI）",
        "tool_url": "https://jasonzhu.ai/en/research",
    },
}


def detect_topic(question_ids: list[str], urls: list[str]) -> str:
    joined = " ".join(question_ids + urls).lower()
    if any(k in joined for k in ("pay", "mor", "tax", "stripe", "paddle", "dodo", "creem", "waffo", "lemon", "fee")):
        return "payments"
    if any(k in joined for k in ("llc", "uk", "company", "wyoming", "delaware", "wise", "mercury", "co-us-or-uk", "open-account")):
        return "company"
    if any(k in joined for k in ("agent", "mcp", "skill", "harness", "claude", "opus")):
        return "skills"
    if any(k in joined for k in ("crawler", "geo", "seo", "readiness", "visibility")):
        return "crawlers"
    return "general"


def recommend_pitch_asset(question_ids: list[str], urls: list[str]) -> str:
    """根据触发题号与主题，匹配我方最硬核的原创研究数据 Pitch 资产。"""
    return PITCH_CATALOG[detect_topic(question_ids, urls)]["summary"]


def inspect_html_signals(url: str, html_text: str) -> dict[str, Any]:
    """从目标页面 HTML 提取选站核验信号（标题、更新日期、导出外链域数、联系线索、是否已提我方）。"""
    host = host_of(url)
    title_m = re.search(r"<title[^>]*>(.*?)</title>", html_text, re.I | re.S)
    title = re.sub(r"\s+", " ", html_mod.unescape(title_m.group(1))).strip() if title_m else ""

    # 提取发布/更新日期（meta / JSON-LD，忽略 1970-01-01 等无效占位时间戳）
    date_found = ""
    for pat in (
        r'property=["\']article:modified_time["\'][^>]*content=["\']([^"\']+)["\']',
        r'content=["\']([^"\']+)["\'][^>]*property=["\']article:modified_time["\']',
        r'"dateModified"\s*:\s*"([^"]+)"',
        r'"datePublished"\s*:\s*"([^"]+)"',
        r'property=["\']article:published_time["\'][^>]*content=["\']([^"\']+)["\']',
    ):
        m = re.search(pat, html_text, re.I)
        if m:
            cand = m.group(1).strip()[:10]
            if re.match(r"^20[12]\d-\d{2}-\d{2}$", cand):
                date_found = cand
                break

    # 统计页面唯一外部导出域名（识别垃圾外链农场）
    ext_hosts: set[str] = set()
    for href in re.findall(r'href=["\'](https?://[^"\']+)["\']', html_text, re.I):
        eh = host_of(href)
        if eh and eh != host and not eh.endswith("." + host):
            ext_hosts.add(eh)

    # 提取邮箱或联系页线索（过滤常见静态资源/无效示例）
    emails = sorted({
        e.lower()
        for e in re.findall(r"mailto:([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})", html_text, re.I)
        if not e.lower().endswith((".png", ".jpg", ".svg", "example.com"))
    })
    has_contact_link = bool(re.search(r'href=["\'][^"\']*/(contact|about|editorial|submit|write-for-us)[^"\']*["\']', html_text, re.I))

    mentions_us = bool(re.search(r"jasonzhu\.ai|agentskillshub\.top|zenodo\.24386242|zenodo\.24420870", html_text, re.I))
    has_recent_year = bool(re.search(r"\b202[56]\b", html_text))

    return {
        "title": title[:140],
        "date": date_found,
        "has_recent_year": has_recent_year,
        "outbound_domains": len(ext_hosts),
        "emails": emails[:3],
        "has_contact_link": has_contact_link,
        "mentions_us": mentions_us,
    }


def probe_url(url: str, timeout: int = 10) -> dict[str, Any]:
    """可选在线轻量探测目标页状态，用于 1v1 外联前核验（默认关闭，仅传 --probe 时执行）。"""
    req = urllib.request.Request(
        url,
        headers={
            "User-Agent": "Mozilla/5.0 (compatible; JasonZhuResearchCheck/1.0; +https://jasonzhu.ai/en/research)",
            "Accept": "text/html,application/xhtml+xml;q=0.9,*/*;q=0.8",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            status = getattr(resp, "status", 200)
            raw = resp.read(250_000).decode("utf-8", errors="ignore")
            sig = inspect_html_signals(url, raw)
            sig["http_status"] = status
            return sig
    except Exception as exc:
        return {
            "http_status": 0,
            "error": str(exc)[:100],
            "title": "",
            "date": "",
            "has_recent_year": False,
            "outbound_domains": -1,
            "emails": [],
            "has_contact_link": False,
            "mentions_us": False,
        }


def qualify_opportunity(opp: dict[str, Any], probe: dict[str, Any] | None = None) -> dict[str, Any]:
    """按目标分流 + 相关性/近期更新/导出域卫生，给出是否值得 1v1 手工 Pitch 的判定。"""
    bucket = opp["bucket"]
    goal, mode = GOAL_META.get(bucket, ("未知", "人工判断"))
    if opp["priority"] >= 3:
        return {"goal": goal, "mode": mode, "verdict": "SKIP（监控/参考）", "reason": "竞品官网或官方文档，不做外联"}
    if bucket == "community_qa":
        return {"goal": goal, "mode": mode, "verdict": "PARTICIPATE（实名数据回帖）", "reason": "社区帖用一手数据实名补充，禁买外包/丢纯链"}

    if not probe:
        return {
            "goal": goal,
            "mode": mode,
            "verdict": "MANUAL CHECK（未探测）",
            "reason": "运行 `--probe` 或 30 秒人工核验：近期是否有更新、同 Niche 相关性、非卖链农场",
        }

    status = probe.get("http_status", 0)
    if status == 404 or status == 410:
        return {"goal": goal, "mode": mode, "verdict": "SKIP（页面失效）", "reason": f"HTTP {status}"}
    if probe.get("mentions_us"):
        return {"goal": goal, "mode": mode, "verdict": "DONE（已提及我方）", "reason": "页面已出现 jasonzhu.ai / Zenodo 引用"}
    if status == 0 or status >= 400:
        return {"goal": goal, "mode": mode, "verdict": "REVIEW（需浏览器复核）", "reason": f"抓取受限（HTTP {status or 'ERR'}），人工打开确认"}

    out_d = probe.get("outbound_domains", 0)
    if out_d > 80:
        return {"goal": goal, "mode": mode, "verdict": "CAUTION（导出域偏多）", "reason": f"单页导出 {out_d} 个外域，先确认非链接农场/合集垃圾页"}

    recency_ok = bool(probe.get("date", "").startswith(("2025", "2026")) or probe.get("has_recent_year"))
    if recency_ok:
        contact_note = f"邮箱 {', '.join(probe['emails'])}" if probe.get("emails") else ("站内 Contact/About 表单" if probe.get("has_contact_link") else "需查站点页脚/作者 X")
        return {
            "goal": goal,
            "mode": mode,
            "verdict": "GO（1v1 手工 Pitch）",
            "reason": f"HTTP 200 · 近期活跃（{probe.get('date') or '含 2025/2026 内容'}）· 外域 {out_d} 个 · 联系线索：{contact_note}",
        }
    return {
        "goal": goal,
        "mode": mode,
        "verdict": "REVIEW（更新年份偏旧）",
        "reason": f"未见 2025/2026 更新痕迹（外域 {out_d} 个），适合以「2026 费率/停服更新」切入 Pitch",
    }


def render_pitch_draft(opp: dict[str, Any], probe: dict[str, Any] | None = None) -> str:
    """为单条可外联第三方页面生成 1v1 非模板英文 Pitch 邮件草稿（含已核实 Zenodo DOI 与实测数据，留官网 URL 而不只留社交号）。"""
    url = opp["top_urls"][0]
    host = opp["host"]
    topic = detect_topic(opp["questions"], opp["top_urls"])
    title = (probe or {}).get("title") or urllib.parse.urlsplit(url).path.strip("/").split("/")[-1].replace("-", " ").title() or host
    joined = (url + " " + " ".join(opp["questions"])).lower()

    if topic == "payments":
        is_creem_dodo = ("creem" in joined and "dodo" in joined)
        if is_creem_dodo:
            subject = f"2026 empirical data for your Creem vs. Dodo Payments guide ({host})"
            body = (
                f"Hi {host} editorial team,\n\n"
                f"I came across your comparison \"{title}\" ({url}) while auditing how indie AI SaaS founders choose Merchant of Record platforms.\n\n"
                "We recently published an open CC-BY-4.0 dataset tracking ~200,000 hosted checkout links across 7 payment platforms (2023–Oct 2026) plus an itemized $20/month cross-border subscription fee benchmark. Three numbers that may add useful empirical context for your readers:\n\n"
                "- **AI seller concentration (new sellers since 2025):** Dodo Payments has 441 new sellers (71% software, 29% AI) vs. Creem's 249 (65% software, 24% AI), compared with 7% AI on Stripe (Zenodo DOI: https://doi.org/10.5281/zenodo.24386242).\n"
                "- **Net take-home on a $20/mo cross-border subscription:** Creem nets $18.82 before payout ($18.63 after its 1% payout fee; min $7/€7 payout fee), while Dodo Payments' official homepage default (4.0% + $0.40 + 1.5% intl + 0.5% sub) nets $18.40—or $18.82–$18.84 under partner pricing (Zenodo DOI: https://doi.org/10.5281/zenodo.24387071).\n"
                "- **Payout friction:** Dodo waives its $5 payout fee at $1,000+ ($50 min); Creem pays out on the 1st and 15th (7–12 day hold).\n\n"
                "Full working paper (Zenodo DOI: https://doi.org/10.5281/zenodo.24420870) and interactive fee/eligibility picker: https://jasonzhu.ai/en/go-global/payments\n\n"
                "Feel free to cite any of the CSV tables directly if helpful—no obligation at all, and happy to pull a custom slice if you update the comparison.\n\n"
                "Best,\n"
                "Jason Zhu\n"
                "Research & Open Datasets: https://jasonzhu.ai/en/research\n"
                "Press / Data Inquiries: jason@jasonzhu.ai"
            )
        else:
            subject = f"Open 2026 dataset (200k checkout links + $20 MoR fees) for \"{title[:55]}\""
            body = (
                f"Hi {host} team,\n\n"
                f"I was reading \"{title}\" ({url}) and thought our newly archived 2026 open benchmark (CC-BY-4.0) might save you fact-checking time next time you refresh the guide.\n\n"
                "We analyzed ~200,000 hosted checkout links across 7 platforms (2023–Oct 2026) and itemized every fee on a $20/month international SaaS subscription:\n\n"
                "- **AI SaaS shift toward MoRs:** AI products make up 29% of new sellers on Dodo Payments, 27% on Polar, and 24% on Creem, vs. 7% on Stripe (though Stripe still leads in absolute volume at ~7,200 AI sellers; Zenodo DOI: https://doi.org/10.5281/zenodo.24386242).\n"
                "- **Real $20 cross-border net take-home:** Paddle nets $18.50 (all-in), Creem $18.63 (after 1% payout), Dodo default $18.40 ($18.82–$18.84 partner rate), and Waffo Pancake $18.72 (before 1% payout)—all ahead of a full Hong Kong Stripe compliance stack (~$18.21, non-MoR) and Lemon Squeezy ($17.92; shutting down March 31, 2027) (Zenodo DOI: https://doi.org/10.5281/zenodo.24387071).\n"
                "- **Interactive tool for readers:** https://jasonzhu.ai/en/go-global/payments (compares entity eligibility + $20 net take-home).\n\n"
                "The full PDF working paper (DOI: https://doi.org/10.5281/zenodo.24420870) and raw CSVs are free to cite under CC-BY-4.0. Happy to send a custom cut if useful.\n\n"
                "Best,\n"
                "Jason Zhu\n"
                "Research & Open Datasets: https://jasonzhu.ai/en/research\n"
                "Press / Data Inquiries: jason@jasonzhu.ai"
            )
    elif topic == "company":
        subject = f"2026 US LLC vs. UK Ltd fee & banking benchmark for {host}"
        body = (
            f"Hi {host} editorial team,\n\n"
            f"While reviewing \"{title}\" ({url}), I noticed your readers often face the exact follow-up question after formation: which payment rails and banks actually approve non-resident founders.\n\n"
            "We maintain an updated 2026 side-by-side matrix comparing US LLC vs. UK Ltd filing fees, annual compliance costs, Mercury/Wise banking realities, and Stripe vs. Merchant of Record payment eligibility: https://jasonzhu.ai/en/go-global\n\n"
            "If you update the guide, feel free to reference any of the fee tables or our 200k-seller payment dataset (Zenodo DOI: https://doi.org/10.5281/zenodo.24386242).\n\n"
            "Best,\n"
            "Jason Zhu\n"
            "Research & Benchmarks: https://jasonzhu.ai/en/research\n"
            "Press / Data Inquiries: jason@jasonzhu.ai"
        )
    elif topic == "skills":
        subject = f"Open 130K AI Agent Skills security dataset (Zenodo DOI) for {host}"
        body = (
            f"Hi {host} team,\n\n"
            f"Enjoyed your coverage in \"{title}\" ({url}). If you ever add empirical security numbers on MCP servers / AI coding agent skills, we published an open CC-BY-4.0 dataset covering 130,173 repositories (July 2026 snapshot, Zenodo DOI: https://doi.org/10.5281/zenodo.21292798; working paper DOI: https://doi.org/10.5281/zenodo.24420919):\n\n"
            "- Among 21,582 repos with 5+ GitHub stars, **3.3% (~1 in 30)** triggered UNSAFE/REJECT static security grades (3.8% for 5–20 stars vs. 0.4% for 1,000+ stars).\n"
            "- Live catalog (285,000+ indexed, 144,000+ graded): https://agentskillshub.top\n\n"
            "Free to cite with zero strings attached.\n\n"
            "Best,\n"
            "Jason Zhu\n"
            "Research & Open Datasets: https://jasonzhu.ai/en/research\n"
            "Press / Data Inquiries: jason@jasonzhu.ai"
        )
    else:
        subject = f"Open empirical dataset for your piece on {host}"
        body = (
            f"Hi {host} team,\n\n"
            f"I saw \"{title}\" ({url}) and wanted to share our open CC-BY-4.0 datasets & live benchmarks (indie SaaS payments, AI crawler traffic, and AI agent security) archived on Zenodo: https://jasonzhu.ai/en/research\n\n"
            "Happy to share a specific CSV slice or quick comment if you revisit the topic.\n\n"
            "Best,\n"
            "Jason Zhu\n"
            "Research & Open Datasets: https://jasonzhu.ai/en/research\n"
            "Press / Data Inquiries: jason@jasonzhu.ai"
        )

    contact_hint = ""
    if probe:
        if probe.get("emails"):
            contact_hint = f"**已抓联系邮箱**：`{', '.join(probe['emails'])}`"
        elif probe.get("has_contact_link"):
            contact_hint = "**联系入口**：目标页含 `/contact` 或 `/about` 链接（人工点开获取表单/编辑邮箱）"
        else:
            contact_hint = "**联系入口**：未在首屏抓到 `mailto:`，请核对页脚 Contact / 作者 X 或 LinkedIn"
    else:
        contact_hint = "**联系入口**：运行 `--probe` 自动探测或人工核对站点 Contact 页"

    return (
        f"### Target: `{host}` — {title}\n\n"
        f"- **目标 URL**：{url}\n"
        f"- **触发题号**：{', '.join(f'`{q}`' for q in opp['questions'])}\n"
        f"- {contact_hint}\n"
        f"- **Subject**：`{subject}`\n\n"
        "```text\n"
        f"{body}\n"
        "```\n"
    )


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


def render_markdown(
    date_str: str,
    sources_used: list[str],
    opps: list[dict[str, Any]],
    probes: dict[str, dict[str, Any]] | None = None,
    include_drafts: bool = False,
) -> str:
    probes = probes or {}
    bucket_counts = Counter(o["bucket"] for o in opps)
    actionable = [o for o in opps if o["priority"] <= 2]
    monitor_only = [o for o in opps if o["priority"] >= 3]

    lines = [
        f"# 站外 Source Opportunities 清单（{date_str}）",
        "",
        "> 依据 AirOps 2025 研究（~85% AI 品牌提及来自第三方页面）、Semrush #8 与目标分流选站纪律：优先把原创研究数据 1v1 Pitch 给「目标题已被 AI 引用、近期仍活跃、且未提 `jasonzhu.ai`」的第三方榜单/评测/媒体页；以 GEO 引用与引流为目标时不纠结 DF/NF，且外联一律留主站/研究页 URL 而非只留社交账号。",
        "> **隐私提示**：本清单包含具体外部/竞品 URL，仅存本地 `specs/`，不提交到公开仓库。",
        "",
        f"- **输入源**：`{'`、`'.join(sources_used)}`",
        f"- **汇总**：共识别 **{len(opps)}** 个外部被引域名，其中 **P1/P2 可外联/参与第三方源 {len(actionable)} 个**，直接竞品/官方文档 {len(monitor_only)} 个。",
        "",
        "## 1. 按桶分布",
        "",
        "| 分类桶 | 域名数 | 核心目标（不混为一谈） | 行动策略 |",
        "| --- | ---: | --- | --- |",
    ]
    for bkey, (_, label, action) in sorted(BUCKET_META.items(), key=lambda kv: (kv[1][0], kv[0])):
        goal = GOAL_META.get(bkey, ("-", "-"))[0]
        lines.append(f"| {label} | {bucket_counts.get(bkey, 0)} | {goal} | {action} |")

    lines.extend([
        "",
        "## 2. P1 / P2 可执行外联与选站核验清单（第三方源）",
        "",
        "> **选站核验红线**：DR 只有在「同 Niche 相关性 + 近期有更新 + 非卖链/垃圾导出农场」成立时才有效；不买付费位、不买社区水军外包。",
        "",
    ])
    if actionable:
        lines.append("| 优先级/桶 | 第三方域名 | 覆盖题数 | 触发题号 | 选站判定与核验摘要 | 代表被引 URL | 建议 Pitch 原创数据资产 |")
        lines.append("| --- | --- | ---: | --- | --- | --- | --- |")
        for o in actionable:
            b_label = BUCKET_META[o["bucket"]][1].split("（", 1)[0]
            q_str = ", ".join(f"`{q}`" for q in o["questions"][:4])
            u_str = "<br>".join(o["top_urls"][:2])
            qinfo = qualify_opportunity(o, probes.get(o["host"]))
            verdict_cell = f"**{qinfo['verdict']}**<br>{qinfo['reason']}"
            lines.append(
                f"| {b_label} | `{o['host']}` | {o['question_count']} | {q_str} | {verdict_cell} | {u_str} | {o['pitch_asset']} |"
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

    if include_drafts:
        pitch_targets = [
            o for o in actionable
            if o["bucket"] in ("roundup_listicle", "comparison_review", "media_newsletter")
            and not qualify_opportunity(o, probes.get(o["host"]))["verdict"].startswith(("SKIP", "DONE"))
        ]
        lines.extend([
            "",
            "## 4. 1v1 定制外联邮件草稿（人工复核后发出）",
            "",
            "> 发信前只需做 3 件事：(1) 打开目标页确认作者称呼与最近更新时间；(2) 把对方文中一个具体细节补进首段；(3) 用 `jason@jasonzhu.ai` 单发（绝不群发，签名只留官网/研究页 URL + 邮箱，避免对方只链社交号）。",
            "",
        ])
        if pitch_targets:
            for o in pitch_targets:
                lines.append(render_pitch_draft(o, probes.get(o["host"])))
        else:
            lines.append("（当前无可发信的 P1/P2 榜单/对比/媒体目标。）")

    next_sec = "5" if include_drafts else "4"
    lines.extend([
        "",
        f"## {next_sec}. 下一步执行纪律",
        "",
        "1. **只拿一手数据 1v1 Pitch，不买付费位、不求泛外链**：直接附已核实 Zenodo DOI 与具体数字，替作者省掉核实成本。",
        "2. **外联签名只留主站与邮箱**：优先引导引用 `https://jasonzhu.ai/en/research` 或具体工具页，搭配 `jason@jasonzhu.ai`，避免编辑只链社交账号。",
        "3. **社区平台坚持本人实名原创数据帖**：禁买外包链接；用实测表格+边界结论回帖或发原创帖。",
        "4. **下次周报自动刷新**：周一 `geo-panel.yml` 跑完解密 `panel-full.json` 后，加 `--probe --drafts` 一键生成全量核验与草稿。",
        "",
    ])
    return "\n".join(lines)


def selftest() -> int:
    import tempfile

    assert classify_source("https://www.stripe.com/pricing") == "competitor_owned"
    assert classify_source("https://www.gov.uk/limited-company-formation") == "official_docs"
    assert classify_source("https://english.shanghai.gov.cn/en/pay") == "official_docs"
    assert classify_source("https://en.wikipedia.org/wiki/Agent_harness") == "official_docs"
    assert classify_source("https://www.reddit.com/r/SaaS/comments/abc/mor_vs_stripe/") == "community_qa"
    assert classify_source("https://www.g2.com/categories/merchant-of-record") == "comparison_review"
    assert classify_source("https://indieblog.example/best-merchant-of-record-2026") == "roundup_listicle"
    assert classify_source("https://technewsletter.example/mor-trends") == "media_newsletter"

    sig = inspect_html_signals(
        "https://indieblog.example/best-mor",
        '<html><head><title>Best MoR 2026</title><meta property="article:modified_time" content="2026-10-05T00:00:00Z"></head>'
        '<body><a href="mailto:editor@indieblog.example">Email</a><a href="https://paddle.com">Paddle</a></body></html>',
    )
    assert sig["title"] == "Best MoR 2026"
    assert sig["date"] == "2026-10-05"
    assert sig["emails"] == ["editor@indieblog.example"]
    assert sig["outbound_domains"] == 1
    assert sig["mentions_us"] is False

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
                    "question_id": "real-pay-creem-vs-dodo",
                    "engine": "chatgpt",
                    "site_cited": False,
                    "cited": [
                        {"url": "https://comparetool.example/creem-vs-dodo-payments"},
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
        assert any(o["bucket"] == "roundup_listicle" for o in opps)
        assert any(o["bucket"] == "comparison_review" for o in opps)
        assert any(o["bucket"] == "official_docs" for o in opps)

        fake_probes = {"indieblog.example": {**sig, "http_status": 200}}
        q_go = qualify_opportunity([o for o in opps if o["host"] == "indieblog.example"][0], fake_probes["indieblog.example"])
        assert q_go["verdict"].startswith("GO")

        report = render_markdown("2026-11-28", ["panel-full.json", "critic.md"], opps, probes=fake_probes, include_drafts=True)
        assert "P1 榜单/合集" in report and "indieblog.example" in report
        assert "10.5281/zenodo.24386242" in report and "10.5281/zenodo.24387071" in report
        assert "Creem vs. Dodo Payments" in report
        assert "jason@jasonzhu.ai" in report

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
    ex.add_argument("--probe", action="store_true", help="在线轻量探测 P1/P2 目标页（HTTP 状态、更新日期、外链域数、邮箱线索）")
    ex.add_argument("--drafts", action="store_true", help="为 P1/P2 榜单/对比/媒体目标生成 1v1 英文数据 Pitch 邮件草稿")
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

    probes: dict[str, dict[str, Any]] = {}
    if args.probe:
        for o in opps:
            if o["priority"] <= 2 and o["bucket"] != "community_qa" and o["top_urls"]:
                probes[o["host"]] = probe_url(o["top_urls"][0])

    md = render_markdown(date_str, sources_used, opps, probes=probes, include_drafts=args.drafts)

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
