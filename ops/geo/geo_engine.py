#!/usr/bin/env python3
"""
GEO Closed-Loop Engine (L1 -> L2 -> L3 -> L4 -> L5 Measure)
Integrates 100% open-source APIs + Suski 50M LLM Answers empirical rules into one executable system.

Modules:
  1. [L1 Crawl & Pretrain]    Common Crawl CDX API + Wayback CDX + IndexNow real-time push
  2. [L2 Entity & Ontology]   Wikidata Entity Resolution API + OpenAlex KG API + JSON-LD EAV validator
  3. [L3 Fan-out & Prompts]   HuggingFace WildChat-1M API + Google Suggest Fan-out + HN Algolia UGC API
  4. [L4 Chunking & 50-Words] First-50-Words BLUF & Brand Self-Attribution Auditor + Passage Scoring
  5. [L5 Measure & Gap Audit] Audits ops/geo/panel results for PAGE_CITED != BRAND_NAMED leaks & 8 Tracking Rules

Usage:
  python3 ops/geo/geo_engine.py full-audit --domain jasonzhu.ai --query "best payment platform for indie saas"
  python3 ops/geo/geo_engine.py fanout --query "indie saas payment gateway"
  python3 ops/geo/geo_engine.py audit-blogs
  python3 ops/geo/geo_engine.py panel-gap
"""

from __future__ import annotations

import argparse
import glob
import json
import os
import re
import ssl
import sys
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path
from typing import Any

REPO_ROOT = Path(__file__).resolve().parents[2]
BLOG_DIR = REPO_ROOT / "src" / "content" / "blog"
GEO_DIR = REPO_ROOT / "ops" / "geo"
QUESTIONS_FILE = GEO_DIR / "questions.json"
BASELINE_FILE = GEO_DIR / "panel" / "results-2026-11-17-baseline.json"

SSL_CTX = ssl.create_default_context()
USER_AGENT = "Mozilla/5.0 (compatible; JasonZhuGEOEngine/1.0; +https://jasonzhu.ai)"


def http_get_json(url: str, timeout: float = 8.0) -> Any:
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT, "Accept": "application/json"})
    with urllib.request.urlopen(req, timeout=timeout, context=SSL_CTX) as resp:
        return json.loads(resp.read().decode("utf-8", errors="replace"))


def http_get_text(url: str, timeout: float = 8.0) -> str:
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(req, timeout=timeout, context=SSL_CTX) as resp:
        return resp.read().decode("utf-8", errors="replace")


# ==============================================================================
# L1: Crawl, Pretrain Admission & IndexNow
# ==============================================================================
def check_l1_pretrain_admission(domain: str) -> dict[str, Any]:
    """Queries Common Crawl CDX Index & Wayback Machine CDX for L1 corpus presence."""
    result: dict[str, Any] = {
        "domain": domain,
        "common_crawl_latest_index": None,
        "common_crawl_pages_sampled": 0,
        "wayback_snapshots_sampled": 0,
        "status": "unknown",
    }
    # 1. Common Crawl collinfo
    try:
        colls = http_get_json("https://index.commoncrawl.org/collinfo.json", timeout=6.0)
        if isinstance(colls, list) and colls:
            latest_cdx = colls[0]["cdx-api"]
            result["common_crawl_latest_index"] = colls[0]["id"]
            q_url = f"{latest_cdx}?url={urllib.parse.quote(domain + '/*')}&output=json&limit=25"
            lines = [ln for ln in http_get_text(q_url, timeout=7.0).splitlines() if ln.strip()]
            result["common_crawl_pages_sampled"] = len(lines)
    except Exception as exc:
        result["common_crawl_error"] = str(exc)

    # 2. Wayback Machine CDX API (fallback & historical corpus signal)
    try:
        wb_url = (
            f"https://web.archive.org/cdx/search/cdx?url={urllib.parse.quote(domain + '/*')}"
            f"&output=json&limit=50&collapse=urlkey"
        )
        wb_data = http_get_json(wb_url, timeout=7.0)
        if isinstance(wb_data, list) and len(wb_data) > 1:
            result["wayback_snapshots_sampled"] = len(wb_data) - 1
    except Exception as exc:
        result["wayback_error"] = str(exc)

    if result["common_crawl_pages_sampled"] > 0 or result["wayback_snapshots_sampled"] > 0:
        result["status"] = "admitted"
    else:
        result["status"] = "cold_start_warning"
    return result


# ==============================================================================
# L2: Entity & Knowledge Graph (Wikidata + OpenAlex)
# ==============================================================================
def check_l2_knowledge_graph(entity_query: str) -> dict[str, Any]:
    """Checks Wikidata Entity Resolution and OpenAlex scholarly graph for a brand or topic."""
    out: dict[str, Any] = {"query": entity_query, "wikidata_entities": [], "openalex_works_count": 0}
    # 1. Wikidata API
    try:
        wd_url = (
            "https://www.wikidata.org/w/api.php?action=wbsearchentities"
            f"&search={urllib.parse.quote(entity_query)}&language=en&limit=3&format=json"
        )
        wd = http_get_json(wd_url, timeout=6.0)
        for item in wd.get("search", []):
            out["wikidata_entities"].append(
                {
                    "id": item.get("id"),
                    "label": item.get("label"),
                    "description": item.get("description"),
                    "url": item.get("concepturi"),
                }
            )
    except Exception as exc:
        out["wikidata_error"] = str(exc)

    # 2. OpenAlex API
    try:
        oa_url = f"https://api.openalex.org/works?search={urllib.parse.quote(entity_query)}&per-page=3"
        oa = http_get_json(oa_url, timeout=6.0)
        out["openalex_works_count"] = oa.get("meta", {}).get("count", 0)
        out["openalex_top_citations"] = [
            {
                "title": w.get("title"),
                "publication_year": w.get("publication_year"),
                "cited_by_count": w.get("cited_by_count"),
                "doi": w.get("doi"),
            }
            for w in oa.get("results", [])[:3]
        ]
    except Exception as exc:
        out["openalex_error"] = str(exc)

    return out


# ==============================================================================
# L3: Query Fan-out, WildChat Real Prompts & HN Community Intent
# ==============================================================================
def mine_l3_fanout_and_prompts(seed_query: str) -> dict[str, Any]:
    """Mines Google Autocomplete Fan-out queries, WildChat-1M real user prompts, and HN discussions."""
    out: dict[str, Any] = {
        "seed_query": seed_query,
        "google_fanout_queries": [],
        "wildchat_real_prompts": [],
        "hackernews_discussions": [],
    }

    # 1. Google Suggest Fan-out (base + intent modifiers used by LLM query rewriters)
    modifiers = ["", " vs", " fees", " for indie", " china", " best", " 2026"]
    seen_suggestions: set[str] = set()
    for mod in modifiers:
        q = (seed_query + mod).strip()
        try:
            sug_url = (
                "https://suggestqueries.google.com/complete/search?client=firefox&hl=en&gl=us"
                f"&q={urllib.parse.quote(q)}"
            )
            data = http_get_json(sug_url, timeout=5.0)
            if isinstance(data, list) and len(data) > 1 and isinstance(data[1], list):
                for s in data[1]:
                    if isinstance(s, str) and s not in seen_suggestions:
                        seen_suggestions.add(s)
                        out["google_fanout_queries"].append(s)
        except Exception:
            continue

    # 2. HuggingFace Datasets Server API: allenai/WildChat-1M
    try:
        wc_url = (
            "https://datasets-server.huggingface.co/search"
            f"?dataset=allenai%2FWildChat-1M&config=default&split=train"
            f"&query={urllib.parse.quote(seed_query)}&offset=0&length=5"
        )
        wc_data = http_get_json(wc_url, timeout=7.0)
        for row_wrap in wc_data.get("rows", [])[:5]:
            row = row_wrap.get("row", {})
            conv = row.get("conversation", [])
            if conv and isinstance(conv, list):
                first_user_msg = next(
                    (m.get("content", "") for m in conv if m.get("role") == "user"),
                    "",
                )
                if first_user_msg:
                    snippet = re.sub(r"\s+", " ", first_user_msg).strip()[:220]
                    out["wildchat_real_prompts"].append(
                        {
                            "language": row.get("language"),
                            "model": row.get("model"),
                            "user_prompt_excerpt": snippet,
                        }
                    )
    except Exception as exc:
        out["wildchat_error"] = str(exc)

    # 3. Hacker News Algolia API (UGC comparison & pain-point mining)
    try:
        hn_url = (
            "https://hn.algolia.com/api/v1/search"
            f"?query={urllib.parse.quote(seed_query)}&tags=story&hitsPerPage=5"
        )
        hn_data = http_get_json(hn_url, timeout=6.0)
        for hit in hn_data.get("hits", [])[:5]:
            out["hackernews_discussions"].append(
                {
                    "title": hit.get("title"),
                    "points": hit.get("points"),
                    "num_comments": hit.get("num_comments"),
                    "url": hit.get("url") or f"https://news.ycombinator.com/item?id={hit.get('objectID')}",
                }
            )
    except Exception as exc:
        out["hn_error"] = str(exc)

    return out


# ==============================================================================
# L4: First-50-Words BLUF, Brand Self-Attribution & Concrete Fact Density Audit
# ==============================================================================
def strip_frontmatter(md_text: str) -> tuple[dict[str, str], str]:
    meta: dict[str, str] = {}
    if md_text.startswith("---"):
        parts = md_text.split("---", 2)
        if len(parts) >= 3:
            for line in parts[1].splitlines():
                if ":" in line:
                    k, v = line.split(":", 1)
                    meta[k.strip()] = v.strip().strip('"').strip("'")
            return meta, parts[2].strip()
    return meta, md_text.strip()


def audit_markdown_first_50_words(md_path: Path, brand_tokens: list[str]) -> dict[str, Any]:
    raw = md_path.read_text(encoding="utf-8", errors="replace")
    meta, body = strip_frontmatter(raw)

    # Extract first meaningful paragraph (skipping images or headings)
    paragraphs = [
        p.strip()
        for p in re.split(r"\n\s*\n", body)
        if p.strip() and not p.strip().startswith("#") and not p.strip().startswith("![")
    ]
    first_para = paragraphs[0] if paragraphs else ""
    clean_first_para = re.sub(r"[*_`#>\[\]]", "", first_para)
    words = clean_first_para.split()
    first_50_words = " ".join(words[:50]) if len(words) >= 15 else clean_first_para[:220]

    # Check 1: Brand named in first 50 words (prevents PAGE CITED != BRAND NAMED)
    brand_named = any(bt.lower() in first_50_words.lower() for bt in brand_tokens)

    # Check 2: Concrete numbers / facts in first 50 words (0.12 correlation in 50M study)
    number_matches = re.findall(r"(?:\$\d+|\d+(?:\.\d+)?%|\d{1,3}(?:,\d{3})+|\d+\s*(?:万|家|天|个|美元|年))", first_50_words)
    concrete_count = len(number_matches)

    # Check 3: Anti-fluff check (doesn't start with "In this post we will..." without answering)
    fluff_intro = bool(
        re.search(
            r"^(?:In this (?:post|article)|This post puts|Getting paid is often|When shipping an AI product)",
            clean_first_para,
            re.I,
        )
    )

    # Check 4: Markdown comparison table present in body
    has_table = bool(re.search(r"\n\|.+\|\n\|[-:| ]+\|", body))

    score = 0
    if brand_named:
        score += 35
    if concrete_count >= 2:
        score += 35
    elif concrete_count == 1:
        score += 18
    if not fluff_intro:
        score += 15
    if has_table:
        score += 15

    return {
        "file": md_path.name,
        "title": meta.get("title", ""),
        "score_100": score,
        "brand_named_in_first_50_words": brand_named,
        "concrete_numbers_in_first_50_words": number_matches[:8],
        "has_comparison_table": has_table,
        "fluff_intro_detected": fluff_intro,
        "first_50_words_preview": first_50_words[:240],
    }


# ==============================================================================
# L5: Measure — Panel Gap Detector (PAGE_CITED vs BRAND_NAMED) & 8 Rules Audit
# ==============================================================================
def audit_geo_panel_gaps() -> dict[str, Any]:
    out: dict[str, Any] = {
        "questions_config_audit": {},
        "citation_without_naming_leaks": [],
        "zero_citation_questions": [],
    }
    if QUESTIONS_FILE.exists():
        q_cfg = json.loads(QUESTIONS_FILE.read_text(encoding="utf-8"))
        proto = q_cfg.get("measurement_protocol", {})
        out["questions_config_audit"] = {
            "total_questions": len(q_cfg.get("questions", [])),
            "runs_per_prompt": proto.get("runs_per_prompt", 1),
            "surface": proto.get("surface", "unspecified"),
            "separate_engine_reporting": proto.get("separate_engine_reporting", False),
            "passes_50m_multi_run_rule": proto.get("runs_per_prompt", 1) >= 3,
        }

    if BASELINE_FILE.exists():
        b_data = json.loads(BASELINE_FILE.read_text(encoding="utf-8"))
        rows = b_data.get("results", b_data if isinstance(b_data, list) else [])
        if isinstance(rows, list):
            for r in rows:
                if not isinstance(r, dict):
                    continue
                qid = r.get("question_id") or r.get("id")
                engine = r.get("engine")
                scores = r.get("scores", {}) if isinstance(r.get("scores"), dict) else r
                site_cited = bool(scores.get("site_cited"))
                page_cited = bool(scores.get("page_cited"))
                named = bool(scores.get("named"))
                if (site_cited or page_cited) and not named:
                    out["citation_without_naming_leaks"].append(
                        {
                            "question_id": qid,
                            "engine": engine,
                            "target_url": r.get("target_url"),
                            "fan_out_queries": r.get("fan_out_queries", []),
                            "diagnosis": "PAGE_CITED_WITHOUT_BRAND_NAME: AI quoted the passage but dropped brand attribution. Fix: inject 'Jason Zhu (jasonzhu.ai)' in first 50 words.",
                        }
                    )
                elif not site_cited and not page_cited and not named:
                    out["zero_citation_questions"].append(
                        {
                            "question_id": qid,
                            "engine": engine,
                            "target_url": r.get("target_url"),
                            "fan_out_queries": r.get("fan_out_queries", []),
                        }
                    )
    return out


def main() -> int:
    parser = argparse.ArgumentParser(description="GEO Closed-Loop Engine (L1-L5)")
    sub = parser.add_subparsers(dest="cmd", required=True)

    p_full = sub.add_parser("full-audit", help="Run L1-L5 full open-source GEO audit")
    p_full.add_argument("--domain", default="jasonzhu.ai")
    p_full.add_argument("--entity", default="Stripe")
    p_full.add_argument("--query", default="indie saas payment gateway")

    p_fan = sub.add_parser("fanout", help="Run L3 Query Fan-out + WildChat-1M + HN mining")
    p_fan.add_argument("--query", required=True)

    sub.add_parser("audit-blogs", help="Run L4 Suski 50M First-50-Words audit on core blog posts")
    p_all = sub.add_parser("audit-all-blogs", help="Run L4 First-50-Words audit across all blog posts in src/content/blog")
    p_all.add_argument("--only-missing-brand", action="store_true", help="Only list posts missing brand in first 50 words")
    sub.add_parser("upgrade-all-blogs", help="Batch-upgrade all remaining blog posts to include BLUF + Jason Zhu (jasonzhu.ai) in first 50 words")
    sub.add_parser("panel-gap", help="Run L5 Measure audit on ops/geo panel")

    args = parser.parse_args()
    brand_tokens = ["Jason Zhu", "jasonzhu.ai", "JasonZhu.AI"]

    if args.cmd == "upgrade-all-blogs":
        all_files = sorted(BLOG_DIR.glob("*.md"))
        upgraded = []
        for f in all_files:
            if f.name == "jev-1-14-review.md":
                continue
            audit = audit_markdown_first_50_words(f, brand_tokens)
            if audit["brand_named_in_first_50_words"]:
                continue
            raw = f.read_text(encoding="utf-8")
            if not raw.startswith("---"):
                continue
            parts = raw.split("---", 2)
            if len(parts) < 3:
                continue
            fm, body = parts[1], parts[2].strip()
            m = re.search(
                r"^excerpt:\s*(?:>-\s*\n((?:  .+\n)+)|\"([^\"]+)\"|\x27([^\x27]+)\x27|([^\n]+))",
                fm,
                re.M,
            )
            if not m:
                continue
            excerpt = re.sub(
                r"\s+",
                " ",
                (m.group(1) or m.group(2) or m.group(3) or m.group(4) or "").strip(),
            )
            is_en = f.name.endswith(".en.md")
            prefix = (
                "**Key Takeaway (Jason Zhu · jasonzhu.ai)**: "
                if is_en
                else "**核心摘要（Jason Zhu · jasonzhu.ai）**："
            )
            first_line = body.splitlines()[0].strip() if body else ""
            if excerpt[:35].lower() in first_line.lower():
                new_body = prefix + body
            else:
                new_body = f"{prefix}{excerpt}\n\n{body}"
            f.write_text(f"---{fm}---\n\n{new_body}\n", encoding="utf-8")
            upgraded.append(f.name)
        print(json.dumps({"upgraded_count": len(upgraded), "upgraded_files": upgraded}, ensure_ascii=False, indent=2))
        return 0

    if args.cmd == "audit-all-blogs":
        q_slugs: dict[str, str] = {}
        if QUESTIONS_FILE.exists():
            q_cfg = json.loads(QUESTIONS_FILE.read_text(encoding="utf-8"))
            for q in q_cfg.get("questions", []):
                t_url = q.get("target_url", "")
                if "/blog/" in t_url:
                    slug = t_url.rsplit("/blog/", 1)[-1].strip("/")
                    q_slugs[slug] = q.get("question", "")

        all_files = sorted(BLOG_DIR.glob("*.md"))
        results = []
        for f in all_files:
            if f.name == "jev-1-14-review.md":
                continue
            base_slug = f.name[:-6] if f.name.endswith(".en.md") else f.name[:-3]
            lang = "en" if f.name.endswith(".en.md") else "zh"
            r = audit_markdown_first_50_words(f, brand_tokens)
            r["slug"] = base_slug
            r["lang"] = lang
            r["is_geo_panel_target"] = base_slug in q_slugs
            r["geo_question"] = q_slugs.get(base_slug, "")
            if args.only_missing_brand and r["brand_named_in_first_50_words"]:
                continue
            results.append(r)

        total = len(all_files) - (1 if (BLOG_DIR / "jev-1-14-review.md").exists() else 0)
        named_count = sum(1 for f in all_files if f.name != "jev-1-14-review.md" and audit_markdown_first_50_words(f, brand_tokens)["brand_named_in_first_50_words"])
        summary = {
            "total_markdown_files": total,
            "brand_named_in_first_50_words_count": named_count,
            "missing_brand_in_first_50_words_count": total - named_count,
            "geo_panel_targets_missing_brand": [
                r for r in results if r["is_geo_panel_target"] and not r["brand_named_in_first_50_words"]
            ],
            "all_results_count": len(results),
            "results": results,
        }
        print(json.dumps(summary, ensure_ascii=False, indent=2))
        return 0

    if args.cmd == "fanout":
        res = mine_l3_fanout_and_prompts(args.query)
        print(json.dumps(res, ensure_ascii=False, indent=2))
        return 0

    if args.cmd == "audit-blogs":
        targets = [
            "choose-payment-platform-2026.md",
            "choose-payment-platform-2026.en.md",
            "indie-payments-report-2026.md",
            "indie-payments-report-2026.en.md",
            "dodo-payments-waffo-ai-saas-fee-comparison.md",
            "dodo-payments-waffo-ai-saas-fee-comparison.en.md",
            "us-llc-developer-accounts.md",
            "us-llc-developer-accounts.en.md",
            "chuhai-weekly-06.md",
            "chuhai-weekly-06.en.md",
        ]
        reports = [
            audit_markdown_first_50_words(BLOG_DIR / t, brand_tokens)
            for t in targets
            if (BLOG_DIR / t).exists()
        ]
        print(json.dumps({"l4_first_50_words_audit": reports}, ensure_ascii=False, indent=2))
        return 0

    if args.cmd == "panel-gap":
        print(json.dumps(audit_geo_panel_gaps(), ensure_ascii=False, indent=2))
        return 0

    if args.cmd == "full-audit":
        targets = [
            "choose-payment-platform-2026.en.md",
            "indie-payments-report-2026.en.md",
            "dodo-payments-waffo-ai-saas-fee-comparison.en.md",
            "us-llc-developer-accounts.en.md",
            "chuhai-weekly-06.en.md",
        ]
        report = {
            "L1_pretrain_and_crawl": check_l1_pretrain_admission(args.domain),
            "L2_entity_knowledge_graph": check_l2_knowledge_graph(args.entity),
            "L3_fanout_and_wildchat": mine_l3_fanout_and_prompts(args.query),
            "L4_first_50_words_blog_scores": [
                audit_markdown_first_50_words(BLOG_DIR / t, brand_tokens)
                for t in targets
                if (BLOG_DIR / t).exists()
            ],
            "L5_measurement_and_attribution_gaps": audit_geo_panel_gaps(),
        }
        print(json.dumps(report, ensure_ascii=False, indent=2))
        return 0

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
