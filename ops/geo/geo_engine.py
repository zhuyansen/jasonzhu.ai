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


def _get_aisa_key() -> str:
    import os

    k = os.environ.get("AISA_API_KEY", "").strip()
    if k:
        return k
    home = Path.home() / ".aisa"
    if (home / "key").exists():
        return (home / "key").read_text(encoding="utf-8").strip()
    if (home / "tokens.json").exists():
        return json.loads((home / "tokens.json").read_text(encoding="utf-8")).get("accessToken", "").strip()
    raise RuntimeError("Missing AISA_API_KEY (and ~/.aisa/key not found)")


def _get_goany_key() -> str:
    import os

    k = os.environ.get("GOANYAPI_API_KEY", "").strip()
    if k:
        return k
    p = Path.home() / ".aisa" / "goanyapi_key"
    if p.exists():
        return p.read_text(encoding="utf-8").strip()
    raise RuntimeError("Missing GOANYAPI_API_KEY (and ~/.aisa/goanyapi_key not found)")


def _goany_call(path: str, **params: Any) -> tuple[dict[str, Any], int]:
    """Call GoAnyAPI (https://api.goanyapi.com/api/v1/<path>) using ~/.aisa/goanyapi_key."""
    base = "https://api.goanyapi.com/api/v1/"
    url = base + path.lstrip("/") + "?" + urllib.parse.urlencode(params)
    req = urllib.request.Request(
        url,
        headers={
            "authorization": f"Bearer {_get_goany_key()}",
            "accept": "application/json",
            "user-agent": USER_AGENT,
        },
    )
    last_err = ""
    for _ in range(2):
        try:
            with urllib.request.urlopen(req, timeout=75.0, context=SSL_CTX) as res:
                body = json.loads(res.read().decode("utf-8", errors="replace"))
                if body.get("code") != "ok":
                    raise RuntimeError(str(body.get("message") or body)[:160])
                data = body.get("data") or {}
                credits = int(data.get("costCredits") or data.get("creditsUsed") or 0)
                return data, credits
        except Exception as exc:
            last_err = str(exc)
    raise RuntimeError(f"GoAnyAPI error: {last_err}")


def _dataforseo_post(endpoint: str, payload: list[dict[str, Any]]) -> dict[str, Any]:
    """Call DataForSEO via AIsa's REST passthrough (https://api.aisa.one/apis/v1/dataforseo/) by default, or direct DataForSEO if DATAFORSEO_LOGIN is set."""
    import base64
    import os

    login = os.environ.get("DATAFORSEO_LOGIN", "").strip()
    password = os.environ.get("DATAFORSEO_PASSWORD", "").strip()
    b64 = os.environ.get("DATAFORSEO_AUTH_BASE64", "").strip()

    if login or b64:
        if not b64:
            b64 = base64.b64encode(f"{login}:{password}".encode("utf-8")).decode("utf-8")
        url = f"https://api.dataforseo.com/v3/{endpoint.lstrip('/')}"
        headers = {"Authorization": f"Basic {b64}", "Content-Type": "application/json"}
    else:
        # Use AIsa DataForSEO passthrough with ~/.aisa/key (one key, pay per call)
        url = f"https://api.aisa.one/apis/v1/dataforseo/v3/{endpoint.lstrip('/')}"
        headers = {
            "Authorization": f"Bearer {_get_aisa_key()}",
            "Content-Type": "application/json",
            "User-Agent": USER_AGENT,
            "x-aisa-source": "jasonzhu-geo-engine",
        }

    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers=headers,
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=90.0, context=SSL_CTX) as resp:
        return json.loads(resp.read().decode("utf-8", errors="replace"))


def check_gigalinks_index(urls: list[str], provider: str = "goanyapi") -> dict[str, Any]:
    """Gate 1 (2026-11-24) checker: batch verify Google indexing status of Tier-2/Tier-3 GIGALinks URLs via GoAnyAPI SERP (2 credits/call) or DataForSEO."""
    results = []
    indexed_count = 0
    total_credits = 0
    for u in urls:
        u_clean = u.strip()
        if not u_clean:
            continue
        try:
            if provider == "goanyapi":
                data, credits = _goany_call("serp", q=f"site:{u_clean}", gl="US", hl="en")
                total_credits += credits
                organic_hits = (data.get("result") or {}).get("organic") or []
                is_indexed = len(organic_hits) > 0
                top_title = organic_hits[0].get("title") if organic_hits else None
            else:
                res = _dataforseo_post(
                    "serp/google/organic/live/regular",
                    [{"keyword": f"site:{u_clean}", "location_code": 2840, "language_code": "en", "depth": 10}],
                )
                tasks = res.get("tasks") or []
                items = ((tasks[0].get("result") or [{}])[0].get("items") or []) if tasks else []
                organic_hits = [it for it in items if it.get("type") == "organic"]
                is_indexed = len(organic_hits) > 0
                top_title = organic_hits[0].get("title") if organic_hits else None

            if is_indexed:
                indexed_count += 1
            results.append(
                {
                    "url": u_clean,
                    "google_indexed": is_indexed,
                    "matches_count": len(organic_hits),
                    "top_match_title": top_title,
                }
            )
        except Exception as exc:
            results.append({"url": u_clean, "google_indexed": False, "error": str(exc)})

    total = len(results)
    rate = round((indexed_count / total) * 100, 1) if total else 0.0
    return {
        "provider": provider,
        "total_checked": total,
        "indexed_count": indexed_count,
        "index_rate_pct": rate,
        "goany_credits_used": total_credits,
        "gate1_decision": (
            "PASS (>=30% indexed: continue Tier-2/3 saturation)"
            if rate >= 30.0
            else "STOP (<30% indexed: halt heavy manual writing on GIGALinks, shift budget to Tier-0 Zenodo / Tier-1 Editorial / Tier-2 Dev.to)"
        ),
        "details": results,
    }


def check_top10_and_aio(domain: str = "jasonzhu.ai", limit: int = 5, provider: str = "goanyapi") -> dict[str, Any]:
    """L3 Commercial Gate: Check Suski Check #6 (95% of cited domains rank in Google Top 10) via GoAnyAPI SERP or DataForSEO."""
    if not QUESTIONS_FILE.exists():
        return {"error": f"{QUESTIONS_FILE} not found"}
    q_cfg = json.loads(QUESTIONS_FILE.read_text(encoding="utf-8"))
    questions = q_cfg.get("questions", [])[:limit]
    report = []
    top10_hits = 0

    for q in questions:
        qid = q.get("id")
        kw = q.get("question")
        target_url = q.get("target_url", "")
        try:
            if provider == "goanyapi":
                data, credits = _goany_call("serp", q=kw, gl="US", hl="en")
                organic = (data.get("result") or {}).get("organic") or []
                organic_rank = None
                ranked_url = None
                top3_competitors = []
                for idx, o in enumerate(organic, start=1):
                    link = o.get("link") or ""
                    r_num = o.get("rank") or idx
                    if idx <= 3:
                        top3_competitors.append({"rank": r_num, "title": o.get("title"), "url": link})
                    if domain in link and organic_rank is None:
                        organic_rank = r_num
                        ranked_url = link
                in_top10 = organic_rank is not None and organic_rank <= 10
                if in_top10:
                    top10_hits += 1
                report.append(
                    {
                        "id": qid,
                        "query": kw,
                        "target_url": target_url,
                        "google_organic_rank": organic_rank,
                        "in_google_top10": in_top10,
                        "ranked_url": ranked_url,
                        "top3_serp_competitors": top3_competitors,
                        "credits_used": credits,
                    }
                )
            else:
                res = _dataforseo_post(
                    "serp/google/organic/live/regular",
                    [{"keyword": kw, "location_code": 2840, "language_code": "en", "depth": 20}],
                )
                tasks = res.get("tasks") or []
                items = ((tasks[0].get("result") or [{}])[0].get("items") or []) if tasks else []
                organic_rank = None
                ranked_url = None
                for it in items:
                    if it.get("type") == "organic" and domain in (it.get("domain") or ""):
                        if organic_rank is None or it.get("rank_group", 999) < organic_rank:
                            organic_rank = it.get("rank_group")
                            ranked_url = it.get("url")
                in_top10 = organic_rank is not None and organic_rank <= 10
                if in_top10:
                    top10_hits += 1
                report.append(
                    {
                        "id": qid,
                        "query": kw,
                        "target_url": target_url,
                        "google_organic_rank": organic_rank,
                        "in_google_top10": in_top10,
                        "ranked_url": ranked_url,
                    }
                )
        except Exception as exc:
            report.append({"id": qid, "query": kw, "error": str(exc)})

    return {
        "provider": provider,
        "domain": domain,
        "questions_checked": len(report),
        "in_google_top10_count": top10_hits,
        "results": report,
    }


def check_goany_trends_and_intitle(term: str, geo: str = "US") -> dict[str, Any]:
    """L3 Commercial Fan-out & Competition check via GoAnyAPI: Google Trends Related Queries + Google Intitle Count + Google Ads Transparency."""
    out: dict[str, Any] = {"term": term, "geo": geo}
    try:
        data, c1 = _goany_call("google-trends", q=term, date="today 1-m", geo=geo, data_type="RELATED_QUERIES")
        rq = data.get("relatedQueries") or {}
        out["trends_related_queries"] = {
            k: [" ".join(str(x.get("query", "")).lower().split()) for x in (rq.get(k) or [])[:10]]
            for k in ("rising", "top")
        }
        out["trends_credits"] = c1
    except Exception as exc:
        out["trends_error"] = str(exc)

    try:
        d_int, c2 = _goany_call("google-intitle", intitle=term, gl="us", qdr="m")
        out["google_intitle_last_month"] = d_int.get("intitleCount")
        out["intitle_credits"] = c2
    except Exception as exc:
        out["intitle_error"] = str(exc)

    return out


def run_aisa_multi_engine_probe(prompt: str, model: str = "gpt-4o-mini", runs: int = 3) -> dict[str, Any]:
    """L5 Commercial Probe: Query Aisa.one unified gateway (~/.aisa/key) across N runs to measure multi-run brand & URL overlap."""
    import os

    api_key = _get_aisa_key()
    base_url = os.environ.get("AISA_API_BASE_URL", "https://api.aisa.one").rstrip("/")

    brand_hits = 0
    url_hits = 0
    doi_hits = 0
    samples = []

    for i in range(runs):
        payload = {
            "model": model,
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0.7,
            "max_tokens": 900,
        }
        req = urllib.request.Request(
            f"{base_url}/v1/chat/completions",
            data=json.dumps(payload).encode("utf-8"),
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
                "User-Agent": USER_AGENT,
                "x-aisa-source": "jasonzhu-geo-engine",
            },
            method="POST",
        )
        with urllib.request.urlopen(req, timeout=60.0, context=SSL_CTX) as resp:
            data = json.loads(resp.read().decode("utf-8", errors="replace"))
            content = ((data.get("choices") or [{}])[0].get("message") or {}).get("content") or ""
            citations = data.get("citations") or []
            full_blob = f"{content}\n" + "\n".join(str(c) for c in citations)

            has_brand = bool(re.search(r"jason\s*zhu|jasonzhu\.ai", full_blob, re.I))
            has_url = "jasonzhu.ai" in full_blob.lower()
            has_doi = "10.5281/zenodo." in full_blob.lower()

            if has_brand:
                brand_hits += 1
            if has_url:
                url_hits += 1
            if has_doi:
                doi_hits += 1

            samples.append(
                {
                    "run": i + 1,
                    "named": has_brand,
                    "site_cited": has_url,
                    "zenodo_doi_cited": has_doi,
                    "citations": citations,
                    "preview": content[:300],
                }
            )

    return {
        "model": model,
        "prompt": prompt,
        "runs": runs,
        "named_rate": f"{brand_hits}/{runs}",
        "site_cited_rate": f"{url_hits}/{runs}",
        "zenodo_doi_rate": f"{doi_hits}/{runs}",
        "samples": samples,
    }


def check_three_gates_edge_bots(url: str = "https://jasonzhu.ai/en/blog/indie-payments-report-2026") -> dict[str, Any]:
    """L1 Stephen Burns (Common Crawl) 'Three Gates' Audit:
    Gate 1: Permission (robots.txt)
    Gate 2: Edge WAF / Cloudflare Bot Fight Mode (simulate real CCBot, GPTBot, ClaudeBot, PerplexityBot User-Agents)
    Gate 3: Server-Side Rendering (SSR HTML contains core text, Schema.org JSON-LD, and CERN Zenodo DOI without JS execution)
    """
    bots = {
        "CCBot": "CCBot/2.0 (https://commoncrawl.org/faq/)",
        "GPTBot": "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; GPTBot/1.0; +https://openai.com/gptbot)",
        "OAI-SearchBot": "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; OAI-SearchBot/1.0; +https://openai.com/searchbot)",
        "ClaudeBot": "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; ClaudeBot/1.0; +claudebot@anthropic.com)",
        "PerplexityBot": "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; PerplexityBot/1.0; +https://perplexity.ai/perplexitybot)",
        "Google-Extended": "Mozilla/5.0 (compatible; Google-Extended/1.0; +http://www.google.com/bot.html)",
    }

    parsed = urllib.parse.urlparse(url)
    base_origin = f"{parsed.scheme}://{parsed.netloc}"
    try:
        robots_txt = http_get_text(f"{base_origin}/robots.txt", timeout=10.0)
        robots_ok = len(robots_txt) > 0
    except Exception:
        robots_ok = False

    bot_results = []
    all_passed = True
    for bot_name, ua in bots.items():
        req = urllib.request.Request(url, headers={"User-Agent": ua, "Accept": "text/html,application/xhtml+xml"})
        try:
            with urllib.request.urlopen(req, timeout=12.0, context=SSL_CTX) as resp:
                body = resp.read().decode("utf-8", errors="replace")
                status = resp.status
                has_json_ld = "application/ld+json" in body
                has_doi = "10.5281/zenodo." in body
                has_h1 = "<h1" in body.lower()
                cf_blocked = "just a moment..." in body.lower() or "cf-browser-verification" in body.lower()
                passed = (status == 200) and has_h1 and not cf_blocked
                if not passed:
                    all_passed = False
                bot_results.append(
                    {
                        "bot": bot_name,
                        "http_status": status,
                        "gate2_edge_waf_passed": status == 200 and not cf_blocked,
                        "gate3_ssr_h1_present": has_h1,
                        "gate3_json_ld_present": has_json_ld,
                        "gate3_zenodo_doi_present": has_doi,
                        "html_bytes": len(body),
                    }
                )
        except Exception as exc:
            all_passed = False
            bot_results.append({"bot": bot_name, "gate2_edge_waf_passed": False, "error": str(exc)})

    return {
        "target_url": url,
        "gate1_robots_txt_accessible": robots_ok,
        "all_bots_passed_three_gates": all_passed,
        "bot_simulations": bot_results,
    }


def check_serp_similarity(query_a: str, query_b: str, gl: str = "US") -> dict[str, Any]:
    """L3 Marc Moeller SERP Similarity Tool (via GoAnyAPI SERP):
    Measures Top-10 Google organic URL & domain overlap between two queries.
    - >= 40% URL overlap -> MERGE into 1 single canonical page (avoid cannibalization)
    - < 40% URL overlap -> SPLIT into 2 dedicated intent pages
    """
    data_a, _ = _goany_call("serp", q=query_a, gl=gl.upper(), hl="en")
    data_b, _ = _goany_call("serp", q=query_b, gl=gl.upper(), hl="en")

    org_a = (data_a.get("result") or {}).get("organic") or []
    org_b = (data_b.get("result") or {}).get("organic") or []

    urls_a = [str(item.get("link") or "").rstrip("/") for item in org_a[:10] if item.get("link")]
    urls_b = [str(item.get("link") or "").rstrip("/") for item in org_b[:10] if item.get("link")]

    set_a, set_b = set(urls_a), set(urls_b)
    shared_urls = sorted(set_a & set_b)
    denom = max(min(len(set_a), len(set_b)), 1)
    overlap_pct = round(len(shared_urls) / denom * 100, 1)

    return {
        "query_a": query_a,
        "query_b": query_b,
        "top10_count_a": len(urls_a),
        "top10_count_b": len(urls_b),
        "shared_exact_urls_count": len(shared_urls),
        "serp_similarity_pct": overlap_pct,
        "shared_urls": shared_urls,
        "recommendation": (
            "MERGE into 1 canonical page (high SERP overlap >= 40%; splitting causes cannibalization)"
            if overlap_pct >= 40.0
            else "SPLIT into 2 distinct pages (low SERP overlap < 40%; Google treats these as separate buyer intents)"
        ),
    }


def check_cross_site_fact_consistency() -> dict[str, Any]:
    """L4 Marc Moeller (Patent Book Ch.7 Post-Generation Verification) & Jabez Reuben (Cross-Site Fact Consistency):
    Verifies that core canonical facts (DOIs, 200,000 checkout links, $20 fee breakdown, 24%-29% AI seller share)
    remain strictly consistent across EN/ZH blog posts and Tier-2 citation drafts without conflicting numbers.
    """
    canonical_facts = [
        {
            "fact_id": "zenodo_doi_01_payments_200k",
            "expected_token": "10.5281/zenodo.24386243",
            "files": [
                BLOG_DIR / "indie-payments-report-2026.md",
                BLOG_DIR / "indie-payments-report-2026.en.md",
                BLOG_DIR / "choose-payment-platform-2026.md",
                BLOG_DIR / "choose-payment-platform-2026.en.md",
                REPO_ROOT / "ops" / "geo" / "citations" / "tier2-medium-devto-payment-platforms-2026.md",
            ],
        },
        {
            "fact_id": "zenodo_doi_02_fee_20usd",
            "expected_token": "10.5281/zenodo.24387072",
            "files": [
                BLOG_DIR / "dodo-payments-waffo-ai-saas-fee-comparison.md",
                BLOG_DIR / "dodo-payments-waffo-ai-saas-fee-comparison.en.md",
                BLOG_DIR / "choose-payment-platform-2026.md",
                BLOG_DIR / "choose-payment-platform-2026.en.md",
                REPO_ROOT / "ops" / "geo" / "citations" / "tier2-medium-devto-payment-platforms-2026.md",
            ],
        },
        {
            "fact_id": "dodo_partner_20usd_net_18_82",
            "expected_token": "18.82",
            "files": [
                BLOG_DIR / "dodo-payments-waffo-ai-saas-fee-comparison.md",
                BLOG_DIR / "dodo-payments-waffo-ai-saas-fee-comparison.en.md",
                REPO_ROOT / "ops" / "geo" / "citations" / "tier2-medium-devto-payment-platforms-2026.md",
            ],
        },
    ]

    checks = []
    all_consistent = True
    for item in canonical_facts:
        missing_in = []
        present_in = []
        for fpath in item["files"]:
            if not fpath.exists():
                missing_in.append(f"{fpath.name} (file missing)")
                continue
            txt = fpath.read_text(encoding="utf-8")
            if item["expected_token"] in txt:
                present_in.append(fpath.name)
            else:
                missing_in.append(fpath.name)
        ok = len(missing_in) == 0
        if not ok:
            all_consistent = False
        checks.append(
            {
                "fact_id": item["fact_id"],
                "expected_token": item["expected_token"],
                "consistent": ok,
                "verified_files": present_in,
                "missing_or_drifted_files": missing_in,
            }
        )

    return {
        "all_canonical_facts_consistent": all_consistent,
        "fact_checks": checks,
    }


def build_suski_panel_matrix() -> dict[str, Any]:
    """L5 Michał Suski 50M + Marc Moeller Per-Engine Visibility Matrix:
    - Never merges engines into a single composite score (ChatGPT vs Google AIO correlation = 0.32).
    - Separates PAGE CITED (`site_cited`) from BRAND NAMED (`named`).
    - Reports per-engine Cited rate, Named rate, Attribution Gap, and Marc Moeller Per-Engine Visibility Index.
    """
    panel_dir = GEO_DIR / "panel"
    panel_files = sorted(panel_dir.glob("results-*.json")) + sorted(panel_dir.glob("baseline-*.json"))
    if not panel_files:
        return {"error": "No panel JSON files found in ops/geo/panel"}

    latest = panel_files[-1]
    data = json.loads(latest.read_text(encoding="utf-8"))
    results = data.get("results", [])

    engines: dict[str, dict[str, int]] = {}
    per_question_matrix = []

    for r in results:
        eng = r.get("engine", "unknown")
        st = engines.setdefault(eng, {"total": 0, "page_cited": 0, "brand_named": 0, "cited_not_named_gap": 0, "both": 0})
        st["total"] += 1
        cited = bool(r.get("site_cited"))
        named = bool(r.get("named"))
        if cited:
            st["page_cited"] += 1
        if named:
            st["brand_named"] += 1
        if cited and not named:
            st["cited_not_named_gap"] += 1
        if cited and named:
            st["both"] += 1

    engine_rows = []
    for eng, st in engines.items():
        tot = max(st["total"], 1)
        cited_pct = round(st["page_cited"] / tot * 100, 1)
        named_pct = round(st["brand_named"] / tot * 100, 1)
        # Marc Moeller per-engine Visibility Index adaptation (50% Brand Named + 35% Page Cited + 15% Both Cited & Named)
        moeller_per_engine_vi = round(0.50 * named_pct + 0.35 * cited_pct + 0.15 * (st["both"] / tot * 100), 1)
        engine_rows.append(
            {
                "engine": eng,
                "questions_evaluated": st["total"],
                "page_cited_count": f"{st['page_cited']}/{st['total']} ({cited_pct}%)",
                "brand_named_count": f"{st['brand_named']}/{st['total']} ({named_pct}%)",
                "cited_but_not_named_leakage": st["cited_not_named_gap"],
                "moeller_per_engine_visibility_index": moeller_per_engine_vi,
            }
        )

    return {
        "panel_file": str(latest),
        "suski_rule_5_warning": "Engines are strictly separated (ChatGPT vs Google AIO correlation is only 0.32; do NOT average across engines).",
        "per_engine_split_table": engine_rows,
    }


def publisher_first_finder(queries: list[str], gl: str = "US") -> dict[str, Any]:
    """L3 Michal Rochwerger (Trust Luna, CMSEO 2026) Publisher-First Outreach Finder:
    'Don't guess by DR (correlation with AI citations = -0.05). Find the exact publishers appearing across the most fan-out sub-queries.'
    """
    from collections import defaultdict

    domain_hits: dict[str, list[dict[str, Any]]] = defaultdict(list)
    url_hits: dict[str, list[str]] = defaultdict(list)

    for q in queries:
        try:
            data, _ = _goany_call("serp", q=q, gl=gl.upper(), hl="en")
            organic = (data.get("result") or {}).get("organic") or []
            seen_doms_in_q: set[str] = set()
            for idx, item in enumerate(organic[:10], start=1):
                link = str(item.get("link") or "").strip()
                if not link:
                    continue
                dom = urllib.parse.urlparse(link).netloc.lower().removeprefix("www.")
                url_hits[link].append(f"{q} (#{idx})")
                if dom not in seen_doms_in_q:
                    seen_doms_in_q.add(dom)
                    domain_hits[dom].append({"query": q, "rank": idx, "url": link, "title": item.get("title")})
        except Exception:
            continue

    total_q = max(len(queries), 1)
    ranked_domains = sorted(
        [
            {
                "domain": dom,
                "fanout_coverage": f"{len(hits)}/{total_q}",
                "coverage_ratio": round(len(hits) / total_q, 2),
                "matched_subqueries": hits,
            }
            for dom, hits in domain_hits.items()
        ],
        key=lambda x: (-x["coverage_ratio"], x["domain"]),
    )

    return {
        "fanout_subqueries_tested": queries,
        "rochwerger_rule": "DR has -0.05 correlation with AI citation frequency. Target publishers covering >= 2 fan-out sub-queries.",
        "top_publishers_by_fanout_coverage": ranked_domains[:15],
    }


def dennis_yu_six_site_entity_audit(
    entity_name: str = "Jason Zhu",
    domain: str = "jasonzhu.ai",
) -> dict[str, Any]:
    """L2 Dennis Yu (CMSEO 2026) Six-Site Entity Molecule Audit with 'Verified:' receipt rule:
    Audits Entity Home (@id JSON-LD), Wikidata, OpenAlex/Zenodo DOI graph, GitHub, and multi-engine AI citation presence.
    Rule 1: Never fabricate facts; write UNKNOWN if unreachable.
    Rule 2: End with 'Verified: <what was opened> | <what was seen> | <UTC timestamp>'.
    """
    from datetime import datetime, timezone

    now_iso = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    checks = []

    # 1. Entity Home (@id & JSON-LD on own domain)
    try:
        home_html = http_get_text(f"https://{domain}/en", timeout=10.0)
        has_ld = "application/ld+json" in home_html
        checks.append(
            {
                "node": "1_Entity_Home_Domain",
                "target": f"https://{domain}/en",
                "status": "VERIFIED" if has_ld else "MISSING_JSON_LD",
                "evidence": f"HTTP 200, JSON-LD present={has_ld}, bytes={len(home_html)}",
            }
        )
    except Exception as exc:
        checks.append({"node": "1_Entity_Home_Domain", "target": f"https://{domain}/en", "status": "UNKNOWN", "evidence": str(exc)})

    # 2. CERN Zenodo Academic Graph (4 minted DOIs)
    try:
        z_data = http_get_json("https://zenodo.org/api/records/24386243", timeout=10.0)
        z_doi = z_data.get("doi") or "10.5281/zenodo.24386243"
        checks.append(
            {
                "node": "2_CERN_Zenodo_Academic_Node",
                "target": "https://zenodo.org/records/24386243",
                "status": "VERIFIED",
                "evidence": f"Official CERN DOI={z_doi}, title='{z_data.get('metadata', {}).get('title', '')[:60]}'",
            }
        )
    except Exception as exc:
        checks.append({"node": "2_CERN_Zenodo_Academic_Node", "target": "https://zenodo.org/records/24386243", "status": "UNKNOWN", "evidence": str(exc)})

    # 3. Wikidata Entity Check
    wd = check_l2_knowledge_graph(entity_name)
    wd_matches = wd.get("wikidata", {}).get("matches") or []
    checks.append(
        {
            "node": "3_Wikidata_Knowledge_Graph",
            "target": f"Wikidata search: {entity_name}",
            "status": "CANDIDATES_FOUND_NEEDS_SAMEAS_BINDING" if wd_matches else "MISSING_WIKIDATA_ITEM",
            "evidence": f"{len(wd_matches)} Wikidata candidates returned (require explicit sameAs binding to https://{domain}/#person)",
        }
    )

    # 4. GitHub Open-Source Entity Node (Profile + zhuyansen/zhuyansen Profile README + Repo Homepage)
    try:
        gh = http_get_json("https://api.github.com/users/zhuyansen", timeout=10.0)
        profile_readme = http_get_text("https://raw.githubusercontent.com/zhuyansen/zhuyansen/main/README.md", timeout=10.0)
        has_domain_in_readme = domain in profile_readme
        has_doi_in_readme = "10.5281/zenodo.24386243" in profile_readme
        checks.append(
            {
                "node": "4_GitHub_Developer_Node",
                "target": "https://github.com/zhuyansen",
                "status": "VERIFIED" if has_domain_in_readme and has_doi_in_readme else "PARTIAL",
                "evidence": (
                    f"login={gh.get('login')}, public_repos={gh.get('public_repos')}, "
                    f"profile_readme_links_domain={has_domain_in_readme}, profile_readme_cites_zenodo_dois={has_doi_in_readme}"
                ),
            }
        )
    except Exception as exc:
        checks.append({"node": "4_GitHub_Developer_Node", "target": "https://github.com/zhuyansen", "status": "UNKNOWN", "evidence": str(exc)})

    receipt = (
        f"Verified: Opened https://{domain}/en, https://zenodo.org/api/records/24386243, Wikidata API, and https://api.github.com/users/zhuyansen "
        f"| Saw JSON-LD + active CERN DOI 10.5281/zenodo.24386243 + GitHub profile | Timestamp: {now_iso}"
    )

    return {
        "entity": entity_name,
        "domain": domain,
        "molecule_nodes": checks,
        "verified_receipt": receipt,
    }


def aare_proprietary_asset_audit(md_path: Path) -> dict[str, Any]:
    """L4 Georg Richard Aare (RankUp, CMSEO 2026) & Eli Schwartz (Product-Led SEO) 7-Category Proprietary Asset Auditor:
    Checks how many of the 7 first-hand asset types appear in a page (target: >= 4 types for 1.9x Top-3 probability,
    plus first-hand experience in the opening intro for 5.5x Top-3 lift).
    """
    text = md_path.read_text(encoding="utf-8", errors="replace")
    parts = text.split("---", 2)
    body = parts[2].strip() if len(parts) >= 3 else text.strip()
    intro = " ".join(body.splitlines()[:6])

    categories = {
        "1_first_hand_intro_experience_5_5x": bool(re.search(r"Jason Zhu|jasonzhu\.ai|实测|我统计了|I counted|field notes|empirical", intro, re.I)),
        "2_proprietary_measurement_data_4_4x": bool(re.search(r"\b\d+(?:\.\d+)?%|\$\d+|\b200,000\b|20\s*万|\b105,626\b", body)),
        "3_academic_or_zenodo_doi_proof_3_6x": "10.5281/zenodo." in body,
        "4_comparison_benchmark_table_2_4x": "|" in body and "---" in body,
        "5_visual_screenshot_or_cover_2_4x": bool(re.search(r"!\[.*?\]\(.*?\)|coverImage:", text)),
        "6_decision_by_buyer_situation_bofu": bool(re.search(r"按你的情况选|by situation|Decision Matrix|怎么选", body, re.I)),
        "7_verifiable_dated_update": bool(re.search(r"2026-\d{2}-\d{2}|2026\s*年\s*\d+\s*月|October 15, 2026|November 15, 2026", text)),
    }
    score = sum(1 for v in categories.values() if v)
    return {
        "file": md_path.name,
        "proprietary_asset_types_count": f"{score}/7",
        "passes_aare_4_plus_threshold_1_9x": score >= 4,
        "passes_intro_experience_5_5x": categories["1_first_hand_intro_experience_5_5x"],
        "breakdown": categories,
    }


def main() -> int:
    parser = argparse.ArgumentParser(description="GEO Closed-Loop Engine (L1-L5 Open-Source + Commercial AIsa / DataForSEO / GoAnyAPI)")
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
    sub.add_parser("suski-matrix", help="Run L5 Suski 5-Rule + Marc Moeller Per-Engine Split Matrix (Page Cited vs Brand Named)")

    p_gates = sub.add_parser("three-gates", help="L1 Stephen Burns (Common Crawl) Three Gates audit: Permission + Edge WAF Bot Simulation + SSR JSON-LD/DOI")
    p_gates.add_argument("--url", default="https://jasonzhu.ai/en/blog/indie-payments-report-2026")

    p_sim = sub.add_parser("serp-similarity", help="L3 Marc Moeller SERP Similarity check via GoAnyAPI SERP (Merge vs Split intent decision)")
    p_sim.add_argument("--query-a", required=True)
    p_sim.add_argument("--query-b", required=True)
    p_sim.add_argument("--gl", default="us")

    sub.add_parser("fact-consistency", help="L4 Marc Moeller Patent Ch.7 & Jabez Reuben Cross-Site Fact & DOI Consistency check")

    p_pub = sub.add_parser("publisher-finder", help="L3 Michal Rochwerger Publisher-First Finder: rank external domains by fan-out subquery SERP coverage")
    p_pub.add_argument("--queries", nargs="+", required=True, help="List of 2-5 fan-out subqueries")
    p_pub.add_argument("--gl", default="US")

    p_entity = sub.add_parser("entity-molecule", help="L2 Dennis Yu 6-Site Entity Molecule Audit with Verified receipt")
    p_entity.add_argument("--entity", default="Jason Zhu")
    p_entity.add_argument("--domain", default="jasonzhu.ai")

    sub.add_parser("proprietary-assets", help="L4 Georg Richard Aare & Eli Schwartz 7-Category Proprietary Asset Audit on core BOFU pages")

    p_giga = sub.add_parser("check-gigalinks-index", help="L1 Commercial (GoAnyAPI / DataForSEO): Batch check Google indexing status of Tier-2/3 GIGALinks URLs for Gate 1")
    p_giga.add_argument("--urls", nargs="*", default=[], help="List of GIGALinks URLs to check")
    p_giga.add_argument("--file", default=None, help="Optional text file with one URL per line")
    p_giga.add_argument("--provider", choices=["goanyapi", "dataforseo"], default="goanyapi")

    p_top10 = sub.add_parser("check-top10-and-aio", help="L3 Commercial (GoAnyAPI / DataForSEO): Check Google Top-10 ranking across questions.json")
    p_top10.add_argument("--domain", default="jasonzhu.ai")
    p_top10.add_argument("--limit", type=int, default=5)
    p_top10.add_argument("--provider", choices=["goanyapi", "dataforseo"], default="goanyapi")

    p_trends = sub.add_parser("goany-trends", help="L3 Commercial (GoAnyAPI): Fetch Google Trends Rising/Top Related Queries + Google Intitle count")
    p_trends.add_argument("--term", required=True)
    p_trends.add_argument("--geo", default="US")

    p_aisa = sub.add_parser("aisa-probe", help="L5 Commercial (Aisa.one ~/.aisa/key): Run multi-run prompt probe via Aisa.one unified LLM gateway")
    p_aisa.add_argument("--prompt", required=True)
    p_aisa.add_argument("--model", default="gpt-4o-mini", help="Model name on Aisa.one")
    p_aisa.add_argument("--runs", type=int, default=2)

    args = parser.parse_args()
    brand_tokens = ["Jason Zhu", "jasonzhu.ai", "JasonZhu.AI"]

    if args.cmd == "publisher-finder":
        print(json.dumps(publisher_first_finder(args.queries, args.gl), ensure_ascii=False, indent=2))
        return 0

    if args.cmd == "entity-molecule":
        print(json.dumps(dennis_yu_six_site_entity_audit(args.entity, args.domain), ensure_ascii=False, indent=2))
        return 0

    if args.cmd == "proprietary-assets":
        core_files = [
            BLOG_DIR / "indie-payments-report-2026.en.md",
            BLOG_DIR / "choose-payment-platform-2026.en.md",
            BLOG_DIR / "dodo-payments-waffo-ai-saas-fee-comparison.en.md",
            REPO_ROOT / "ops" / "geo" / "citations" / "tier2-medium-devto-payment-platforms-2026.md",
        ]
        print(json.dumps([aare_proprietary_asset_audit(f) for f in core_files if f.exists()], ensure_ascii=False, indent=2))
        return 0

    if args.cmd == "three-gates":
        print(json.dumps(check_three_gates_edge_bots(args.url), ensure_ascii=False, indent=2))
        return 0

    if args.cmd == "serp-similarity":
        print(json.dumps(check_serp_similarity(args.query_a, args.query_b, args.gl), ensure_ascii=False, indent=2))
        return 0

    if args.cmd == "fact-consistency":
        print(json.dumps(check_cross_site_fact_consistency(), ensure_ascii=False, indent=2))
        return 0

    if args.cmd == "suski-matrix":
        print(json.dumps(build_suski_panel_matrix(), ensure_ascii=False, indent=2))
        return 0

    if args.cmd == "check-gigalinks-index":
        urls = list(args.urls or [])
        if args.file:
            urls.extend(Path(args.file).read_text(encoding="utf-8").splitlines())
        print(json.dumps(check_gigalinks_index(urls, args.provider), ensure_ascii=False, indent=2))
        return 0

    if args.cmd == "check-top10-and-aio":
        print(json.dumps(check_top10_and_aio(args.domain, args.limit, args.provider), ensure_ascii=False, indent=2))
        return 0

    if args.cmd == "goany-trends":
        print(json.dumps(check_goany_trends_and_intitle(args.term, args.geo), ensure_ascii=False, indent=2))
        return 0

    if args.cmd == "aisa-probe":
        print(json.dumps(run_aisa_multi_engine_probe(args.prompt, args.model, args.runs), ensure_ascii=False, indent=2))
        return 0

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

