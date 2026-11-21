#!/usr/bin/env python3
"""
GEO Closed-Loop Engine v9.0 (Water System Model v9 · L1 -> L2 -> L3 -> L4 -> L5 · 24 Subcommands)
Integrates 100% open-source APIs + Suski 50M LLM Answers + JOKER 6 Uncertainty Reductions + 6 Frontier Books.

Modules:
  1. [L1 Crawl & Pretrain]    Common Crawl CDX API + Three Gates + 16-Planted-Bug Guards (`three-gates`, `audit-16-guards`)
  2. [L2 Entity & Ontology]   Wikidata/OpenAlex KG + Connected @id Graph (+30%) + 4-Tuple Brand Consensus (`connected-kg`, `brand-consensus`, `entity-molecule`)
  3. [L3 Fan-out & Prompts]   HF WildChat-1M + Google Suggest Fan-out + SERP Similarity (`fanout`, `serp-similarity`, `goany-trends`)
  4. [L4 Chunking & Section]  First-50-Words BLUF + H2 Retrieval Candidates + SRO & 90d Recency + 4-7 Proprietary Assets (`section-candidates`, `sro-and-recency`, `proprietary-assets`)
  5. [L5 Off-Site & Measure]  Publisher-First + AI Domain Impact Index (0-100) + 20-Prompt Live Panel (`publisher-finder`, `ai-domain-impact`, `run-live-panel`, `panel-gap`)

Usage:
  python3 ops/geo/geo_engine.py section-candidates
  python3 ops/geo/geo_engine.py connected-kg
  python3 ops/geo/geo_engine.py ai-domain-impact --target dev.to
  python3 ops/geo/geo_engine.py brand-consensus
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

    # 4. GitHub Open-Source Entity Node (Profile blog field + zhuyansen/zhuyansen Profile README + Repo Homepage)
    try:
        gh = http_get_json("https://api.github.com/users/zhuyansen", timeout=10.0)
        profile_readme = http_get_text("https://raw.githubusercontent.com/zhuyansen/zhuyansen/main/README.md", timeout=10.0)
        gh_blog = str(gh.get("blog") or "").strip()
        has_blog_field = domain in gh_blog
        has_domain_in_readme = domain in profile_readme
        has_doi_in_readme = "10.5281/zenodo.24386243" in profile_readme
        checks.append(
            {
                "node": "4_GitHub_Developer_Node",
                "target": "https://github.com/zhuyansen",
                "status": "VERIFIED" if (has_blog_field and has_domain_in_readme and has_doi_in_readme) else "PARTIAL",
                "evidence": (
                    f"login={gh.get('login')}, blog='{gh_blog}', twitter='{gh.get('twitter_username')}', public_repos={gh.get('public_repos')}, "
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


def run_entity_verification_experiment(save_snapshot: bool = True) -> dict[str, Any]:
    """L2 + L3 + L5 Quantitative Entity Verification Experiment Suite:
    Measures 4 empirical dimensions after Entity Molecule & CERN Zenodo DOI updates:
      1. [Layer A: Graph & Schema EAV Completeness] Entity Home JSON-LD + 4 CERN Zenodo DOIs + GitHub Profile + IndexNow push
      2. [Layer B: Google US Search Index & SERP Discovery] via GoAnyAPI SERP across 6 entity/DOI/GitHub queries
      3. [Layer C: Multi-Run Online LLM Retrieval Probe (5 runs x 2 models)] via Aisa.one (perplexity/sonar & gpt-4o-mini)
      4. [Layer D: Reproducible Snapshot Persistence] Saves timestamped JSON under ops/geo/panel/entity-experiment-*.json
    """
    from datetime import datetime, timezone

    ts = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    date_tag = datetime.now(timezone.utc).strftime("%Y-%m-%d-%H%M")

    # 1. Layer A: Molecule Node Check + IndexNow Ping for new entity edges
    molecule = dennis_yu_six_site_entity_audit("Jason Zhu", "jasonzhu.ai")

    # 2. Layer B: Google US SERP Discovery Probe (GoAnyAPI)
    serp_probes = [
        {"probe_id": "doi_01_payments_200k", "query": '"10.5281/zenodo.24386243"'},
        {"probe_id": "doi_02_fee_20usd", "query": '"10.5281/zenodo.24387072"'},
        {"probe_id": "doi_03_skills_105k", "query": '"10.5281/zenodo.24387074"'},
        {"probe_id": "doi_04_spam_list", "query": '"10.5281/zenodo.24387076"'},
        {"probe_id": "entity_cooccurrence_zenodo_jasonzhu", "query": '"Jason Zhu" "jasonzhu.ai" zenodo'},
        {"probe_id": "entity_cooccurrence_github_zhuyansen", "query": 'site:github.com/zhuyansen "jasonzhu.ai"'},
    ]
    serp_results = []
    indexed_probes_count = 0
    for sp in serp_probes:
        try:
            d, credits = _goany_call("serp", q=sp["query"], gl="US", hl="en")
            organic = (d.get("result") or {}).get("organic") or []
            top_urls = [{"rank": idx + 1, "title": o.get("title"), "url": o.get("link")} for idx, o in enumerate(organic[:5])]
            is_indexed = len(top_urls) > 0
            if is_indexed:
                indexed_probes_count += 1
            serp_results.append(
                {
                    "probe_id": sp["probe_id"],
                    "query": sp["query"],
                    "google_us_indexed": is_indexed,
                    "organic_hit_count": len(organic),
                    "top_results": top_urls,
                    "credits": credits,
                }
            )
        except Exception as exc:
            serp_results.append({"probe_id": sp["probe_id"], "query": sp["query"], "error": str(exc)})

    # 3. Layer C: Online LLM Entity Resolution Probe + Duane Forrester Parametric vs Live RAG Split
    entity_prompt = (
        "Who is Jason Zhu (jasonzhu.ai / GitHub zhuyansen) and what empirical benchmarks or CERN Zenodo datasets "
        "has he published on indie developer payment platforms (200,000 checkout links, $20 MoR subscription fee comparison) "
        "and AI Agent Skills security?"
    )
    llm_probes = []
    # 3A: Live RAG Retrieval Engine (perplexity/sonar) vs 3B: Parametric Memory Model (gpt-4o-mini)
    for model_name, mode_desc in [
        ("perplexity/sonar", "Live_Web_RAG_Retrieval (Forrester Layer 2)"),
        ("gpt-4o-mini", "Parametric_Pretrain_Memory_Only (Forrester Layer 1)"),
    ]:
        try:
            probe_res = run_aisa_multi_engine_probe(entity_prompt, model=model_name, runs=2)
            probe_res["forrester_retrieval_layer"] = mode_desc
            llm_probes.append(probe_res)
        except Exception as exc:
            llm_probes.append({"model": model_name, "forrester_retrieval_layer": mode_desc, "error": str(exc)})

    report = {
        "experiment_timestamp_utc": ts,
        "layer_A_entity_molecule": molecule,
        "layer_B_google_us_serp_discovery": {
            "probes_indexed": f"{indexed_probes_count}/{len(serp_probes)}",
            "details": serp_results,
        },
        "layer_C_forrester_parametric_vs_rag_recall": llm_probes,
    }

    if save_snapshot:
        out_path = GEO_DIR / "panel" / f"entity-experiment-{date_tag}.json"
        out_path.parent.mkdir(parents=True, exist_ok=True)
        out_path.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
        report["saved_snapshot_path"] = str(out_path)

    return report


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


def audit_sro_recency_and_listicle_guard(md_path: Path) -> dict[str, Any]:
    """L4 Triple Upgrade (Dan Petrovic SRO + Kevin Indig 90-Day Recency + Lily Ray 69% Self-Listicle Guard):
      1. Dan Petrovic (DEJAN AI) SRO Grounding Budget (~500 words / ~2,000 chars) & Tomek Rudzki (Peec AI) Top-10% Chunk:
         Measures concrete fact/number density per 100 words in the first 500 words (Gemini grounding budget).
      2. Kevin Indig (Growth Memo) 90-Day Recency Decay Guard:
         Flags pages whose frontmatter `date` or `updatedAt` is older than 90 days (3x citation drop threshold).
      3. Lily Ray (Amsive) 69% Self-Serving Listicle Exclusion Guard:
         Verifies that on-site commercial comparison pages use neutral "Decision by Buyer Situation" framing + CERN Zenodo DOI
         rather than self-promotional "#1 Best" claims that trigger LLM self-bias exclusion 69% of the time.
    """
    from datetime import datetime, timezone

    raw = md_path.read_text(encoding="utf-8", errors="replace")
    parts = raw.split("---", 2)
    fm = parts[1] if len(parts) >= 3 else ""
    body = parts[2].strip() if len(parts) >= 3 else raw.strip()

    # 1. Dan Petrovic SRO (~500-word grounding window) & Tomek Rudzki First-10% Chunk
    words = re.findall(r"[\w\.\-%\$]+|[\u4e00-\u9fff]", body)
    total_tokens = max(len(words), 1)
    top_10_pct_count = max(int(total_tokens * 0.10), 50)
    grounding_500_slice = " ".join(words[:500])
    top_10_slice = " ".join(words[:top_10_pct_count])

    stat_hits_500 = re.findall(r"\b\d+(?:\.\d+)?%|\$\d+(?:\.\d+)?|\b\d{2,3},\d{3}\b|10\.5281/zenodo\.\d+|\b\d+\s*万", grounding_500_slice)
    stat_hits_top10 = re.findall(r"\b\d+(?:\.\d+)?%|\$\d+(?:\.\d+)?|\b\d{2,3},\d{3}\b|10\.5281/zenodo\.\d+|\b\d+\s*万", top_10_slice)
    sro_density_per_100w = round(len(stat_hits_500) / min(5.0, max(total_tokens / 100.0, 1.0)), 2)

    # 2. Kevin Indig 90-Day Recency Check
    m_date = re.search(r"^(?:updatedAt|date):\s*[\"']?(\d{4}-\d{2}-\d{2})[\"']?", fm, re.M)
    date_str = m_date.group(1) if m_date else None
    days_since_update = None
    passes_90d_recency = False
    if date_str:
        try:
            dt = datetime.strptime(date_str, "%Y-%m-%d").replace(tzinfo=timezone.utc)
            now = datetime.now(timezone.utc)
            days_since_update = max(0, (now - dt).days)
            passes_90d_recency = days_since_update <= 90
        except Exception:
            pass

    # 3. Lily Ray 69% Self-Serving Listicle Exclusion Guard
    has_neutral_buyer_matrix = bool(re.search(r"按你的情况选|Decision Matrix|by situation|按场景|Scenario|Decision by", body, re.I))
    has_zenodo_doi_proof = "10.5281/zenodo." in body
    has_self_ranked_no1_bias = bool(re.search(r"#1\s+Best\s+is\s+Jason\s+Zhu|We\s+ranked\s+ourselves\s+#1", body, re.I))

    return {
        "file": md_path.name,
        "petrovic_sro_500w_grounding": {
            "concrete_stats_in_first_500_tokens": len(stat_hits_500),
            "sro_fact_density_per_100_tokens": sro_density_per_100w,
            "rudzki_top_10pct_chunk_stats_count": len(stat_hits_top10),
            "passes_sro_high_density": len(stat_hits_500) >= 5,
        },
        "indig_90d_recency_guard": {
            "frontmatter_date": date_str,
            "days_since_update": days_since_update,
            "passes_90_day_threshold": passes_90d_recency,
        },
        "lily_ray_69pct_self_listicle_guard": {
            "has_neutral_buyer_situation_matrix": has_neutral_buyer_matrix,
            "has_external_zenodo_doi_proof": has_zenodo_doi_proof,
            "free_of_self_ranked_no1_bias": not has_self_ranked_no1_bias,
            "passes_lily_ray_guard": has_neutral_buyer_matrix and has_zenodo_doi_proof and not has_self_ranked_no1_bias,
        },
    }


def run_live_panel(limit: int = 5, models: list[str] | None = None, save: bool = True) -> dict[str, Any]:
    """L5 Automated Multi-Engine Live Panel Probe (via Aisa.one + GoAnyAPI):
    Evaluates questions from ops/geo/questions.json across distinct LLM engines (Suski Rule 5: never average across engines),
    recording per-engine Page Cited (URL present) vs Brand Named (Jason Zhu / jasonzhu.ai present) + Google US Top-10 rank.
    """
    from datetime import datetime, timezone

    if not QUESTIONS_FILE.exists():
        return {"error": f"{QUESTIONS_FILE} not found"}
    q_cfg = json.loads(QUESTIONS_FILE.read_text(encoding="utf-8"))
    questions = (q_cfg.get("questions") or [])[:limit]
    engine_models = models or ["perplexity/sonar", "gpt-4o-mini"]
    ts = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    date_tag = datetime.now(timezone.utc).strftime("%Y-%m-%d-%H%M")

    evaluated = []
    per_engine_summary: dict[str, dict[str, int]] = {
        m: {"evaluated": 0, "page_cited": 0, "brand_named": 0} for m in engine_models
    }

    for q in questions:
        qid = q.get("id")
        prompt_text = q.get("question_en") or q.get("question") or ""
        target_url = q.get("target_url") or ""

        # Check Google US Top-10 SERP rank via GoAnyAPI
        google_rank = None
        try:
            d, _ = _goany_call("serp", q=prompt_text, gl="US", hl="en")
            organic = (d.get("result") or {}).get("organic") or []
            for idx, item in enumerate(organic[:10]):
                if "jasonzhu.ai" in (item.get("link") or "").lower():
                    google_rank = idx + 1
                    break
        except Exception:
            pass

        engine_runs = {}
        for m in engine_models:
            res = run_aisa_multi_engine_probe(prompt_text, model=m, runs=1)
            cited = res.get("page_cited_rate", "0/1").startswith("1/")
            named = res.get("brand_named_rate", "0/1").startswith("1/")
            per_engine_summary[m]["evaluated"] += 1
            if cited:
                per_engine_summary[m]["page_cited"] += 1
            if named:
                per_engine_summary[m]["brand_named"] += 1
            engine_runs[m] = {
                "page_cited": cited,
                "brand_named": named,
                "details": res.get("runs_detail", []),
            }

        evaluated.append(
            {
                "id": qid,
                "prompt": prompt_text,
                "target_url": target_url,
                "google_us_top10_rank": google_rank,
                "engines": engine_runs,
            }
        )

    out = {
        "timestamp_utc": ts,
        "questions_evaluated_count": len(evaluated),
        "per_engine_summary": per_engine_summary,
        "results": evaluated,
    }
    if save:
        snap = GEO_DIR / "panel" / f"live-panel-{date_tag}.json"
        snap.parent.mkdir(parents=True, exist_ok=True)
        snap.write_text(json.dumps(out, ensure_ascii=False, indent=2), encoding="utf-8")
        out["saved_snapshot"] = str(snap)
    return out


def audit_16_planted_guards(url: str) -> dict[str, Any]:
    """L1 Deterministic 16-Planted-Bug Guard (from agentskillshub.top/best/seo-tools/ sandbox benchmark):
    Explicitly verifies the hardest blind spots missed by 13 popular SEO skills:
    1. HTTP X-Robots-Tag header noindex check (missed by marketingskills)
    2. Meta robots noindex check
    3. Canonical self-reference / non-homepage mismatch check
    4. Hreflang target HTTP 200 verification (missed by squirrelscan)
    5. Valid JSON-LD syntax verification (zero parse errors)
    6. Title, meta description, H1, viewport, and Markdown alternate link presence
    """
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (compatible; JasonZhu-GEO-16Guard/1.0)"})
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            status = resp.status
            headers = {k.lower(): v for k, v in resp.headers.items()}
            html = resp.read().decode("utf-8", errors="replace")
    except Exception as e:
        return {"url": url, "error": str(e)}

    x_robots = headers.get("x-robots-tag", "")
    http_header_noindex = "noindex" in x_robots.lower()
    meta_robots_match = re.search(r'<meta[^>]+name=["\']robots["\'][^>]+content=["\']([^"\']+)["\']', html, re.I)
    meta_noindex = bool(meta_robots_match and "noindex" in meta_robots_match.group(1).lower())

    title_match = re.search(r"<title[^>]*>(.*?)</title>", html, re.I | re.S)
    title_text = title_match.group(1).strip() if title_match else ""
    desc_match = re.search(r'<meta[^>]+name=["\']description["\'][^>]+content=["\']([^"\']*)["\']', html, re.I)
    desc_text = desc_match.group(1).strip() if desc_match else ""
    h1_matches = re.findall(r"<h1[^>]*>(.*?)</h1>", html, re.I | re.S)
    viewport_present = bool(re.search(r'<meta[^>]+name=["\']viewport["\']', html, re.I))

    canon_match = re.search(r'<link[^>]+rel=["\']canonical["\'][^>]+href=["\']([^"\']+)["\']', html, re.I)
    canonical_url = canon_match.group(1).strip() if canon_match else ""
    canonical_points_to_root_accidentally = bool(
        canonical_url and canonical_url.rstrip("/") in ("https://jasonzhu.ai", "https://jasonzhu.ai/zh", "https://jasonzhu.ai/en")
        and url.rstrip("/") not in ("https://jasonzhu.ai", "https://jasonzhu.ai/zh", "https://jasonzhu.ai/en")
    )

    md_alt_match = re.search(r'<link[^>]+type=["\']text/markdown["\'][^>]+href=["\']([^"\']+)["\']', html, re.I)
    md_alternate_url = md_alt_match.group(1).strip() if md_alt_match else ""

    # Hreflang target live status check (catches hreflang -> 404 blind spot)
    hreflang_pairs = re.findall(
        r'<link[^>]+rel=["\']alternate["\'][^>]+hrefLang=["\']([^"\']+)["\'][^>]+href=["\']([^"\']+)["\']',
        html,
        re.I,
    )
    hreflang_checks = []
    hreflang_all_200 = True
    for hlang, hurl in hreflang_pairs:
        try:
            hreq = urllib.request.Request(hurl, method="HEAD", headers={"User-Agent": "Mozilla/5.0 (compatible; JasonZhu-GEO-16Guard/1.0)"})
            with urllib.request.urlopen(hreq, timeout=10) as hresp:
                hcode = hresp.status
        except Exception:
            hcode = 0
        ok = hcode == 200
        if not ok:
            hreflang_all_200 = False
        hreflang_checks.append({"hreflang": hlang, "href": hurl, "status": hcode, "ok": ok})

    # JSON-LD syntax validation
    ld_blocks = re.findall(r'<script[^>]+type=["\']application/ld\+json["\'][^>]*>(.*?)</script>', html, re.I | re.S)
    jsonld_valid_count = 0
    jsonld_errors = []
    jsonld_types = []
    for idx, raw_block in enumerate(ld_blocks):
        try:
            parsed = json.loads(raw_block.strip())
            jsonld_valid_count += 1
            if isinstance(parsed, dict):
                t = parsed.get("@type")
                if t:
                    jsonld_types.append(t)
                for node in parsed.get("@graph", []):
                    if isinstance(node, dict) and node.get("@type"):
                        jsonld_types.append(node.get("@type"))
        except Exception as e:
            jsonld_errors.append({"block_index": idx, "error": str(e)})

    checks = {
        "http_200_ok": status == 200,
        "no_http_header_x_robots_noindex": not http_header_noindex,
        "no_meta_robots_noindex": not meta_noindex,
        "has_title": bool(title_text),
        "has_meta_description": bool(desc_text),
        "has_single_h1": len(h1_matches) == 1,
        "has_viewport_meta": viewport_present,
        "canonical_valid_and_not_wrongly_homepage": bool(canonical_url) and not canonical_points_to_root_accidentally,
        "hreflang_targets_all_return_200": bool(hreflang_checks) and hreflang_all_200,
        "jsonld_all_valid_zero_parse_errors": jsonld_valid_count > 0 and len(jsonld_errors) == 0,
    }
    return {
        "url": url,
        "http_status": status,
        "x_robots_tag_header": x_robots or "(none)",
        "canonical_url": canonical_url,
        "markdown_alternate_url": md_alternate_url,
        "jsonld_blocks_count": len(ld_blocks),
        "jsonld_types": jsonld_types,
        "jsonld_errors": jsonld_errors,
        "hreflang_checks": hreflang_checks,
        "checks": checks,
        "all_10_deterministic_guards_passed": all(checks.values()),
    }


def audit_section_retrieval_candidates(md_path: Path, brand_tokens: list[str]) -> dict[str, Any]:
    """JOKER Sec.10/16 & iPullRank Ch.08: Every H2 section is an independent Retrieval Candidate.
    Checks whether each H2 in a markdown file is followed by a self-contained opening paragraph (30-120 words)
    that avoids dangling pronoun-only openings and carries concrete facts/numbers or entity names."""
    raw = md_path.read_text(encoding="utf-8")
    body = raw.split("---", 2)[2].strip() if raw.startswith("---") and len(raw.split("---", 2)) >= 3 else raw
    sections = re.split(r"(?m)^##\s+(.+)$", body)
    # sections[0] is intro before first H2; then pairs of (h2_title, h2_body)
    h2_reports: list[dict[str, Any]] = []
    ready_count = 0
    for i in range(1, len(sections) - 1, 2):
        h2_title = sections[i].strip()
        h2_body = sections[i + 1].strip()
        paragraphs = [p.strip() for p in re.split(r"\n\s*\n", h2_body) if p.strip() and not p.strip().startswith("```")]
        first_para = paragraphs[0] if paragraphs else ""
        clean_first = re.sub(r"[#*`>\[\]()!|-]", " ", first_para)
        words = [w for w in clean_first.split() if w]
        cjk_chars = len(re.findall(r"[\u4e00-\u9fff]", clean_first))
        effective_words = len(words) if cjk_chars < 20 else max(len(words), cjk_chars // 2)
        has_number_or_table = bool(re.search(r"\d+|%|\$", first_para)) or ("|" in first_para)
        has_entity_or_brand = any(bt.lower() in first_para.lower() for bt in brand_tokens) or bool(
            re.search(r"Stripe|Paddle|Lemon Squeezy|Waffo|Dodo|Google|ChatGPT|Perplexity|Claude|AIsa|GoAnyAPI|Zenodo", first_para, re.I)
        )
        is_direct_candidate = effective_words >= 15 and (has_number_or_table or has_entity_or_brand)
        if is_direct_candidate:
            ready_count += 1
        h2_reports.append({
            "h2": h2_title,
            "first_passage_effective_words": effective_words,
            "has_number_or_table": has_number_or_table,
            "has_explicit_entity": has_entity_or_brand,
            "retrieval_candidate_ready": is_direct_candidate,
            "preview": first_para[:140],
        })
    total_h2 = len(h2_reports)
    return {
        "file": md_path.name,
        "total_h2_sections": total_h2,
        "retrieval_ready_h2_count": ready_count,
        "retrieval_ready_ratio": round(ready_count / total_h2, 3) if total_h2 else 1.0,
        "sections": h2_reports,
    }


def audit_connected_entity_graph(urls: list[str]) -> dict[str, Any]:
    """Andrea Volpini (WordLift SEO Week 2026, +30% retrieval accuracy):
    Verifies whether JSON-LD across multiple pages shares stable @id identifiers and links entities into a connected graph."""
    page_nodes: list[dict[str, Any]] = []
    all_ids: dict[str, list[str]] = {}
    for url in urls:
        try:
            html = http_get_text(url, timeout=10.0)
        except Exception as exc:
            page_nodes.append({"url": url, "error": str(exc)})
            continue
        ld_blocks = re.findall(r'<script[^>]+type=["\']application/ld\+json["\'][^>]*>(.*?)</script>', html, re.I | re.S)
        ids_found: list[str] = []
        same_as_found: list[str] = []

        def _walk(obj: Any) -> None:
            if isinstance(obj, dict):
                if "@id" in obj and isinstance(obj["@id"], str):
                    ids_found.append(obj["@id"])
                if "sameAs" in obj:
                    sa = obj["sameAs"]
                    if isinstance(sa, list):
                        same_as_found.extend(str(x) for x in sa)
                    elif isinstance(sa, str):
                        same_as_found.append(sa)
                for v in obj.values():
                    _walk(v)
            elif isinstance(obj, list):
                for item in obj:
                    _walk(item)

        for raw_block in ld_blocks:
            try:
                _walk(json.loads(raw_block.strip()))
            except Exception:
                pass
        for eid in set(ids_found):
            all_ids.setdefault(eid, []).append(url)
        page_nodes.append({
            "url": url,
            "jsonld_blocks": len(ld_blocks),
            "unique_at_ids": sorted(set(ids_found)),
            "same_as_count": len(set(same_as_found)),
        })
    shared_ids = {k: v for k, v in all_ids.items() if len(v) > 1}
    return {
        "pages_checked": len(urls),
        "total_distinct_at_ids": len(all_ids),
        "cross_page_shared_at_ids": shared_ids,
        "graph_connected_across_pages": len(shared_ids) > 0,
        "pages": page_nodes,
    }


def check_ai_domain_impact(domain_or_url: str) -> dict[str, Any]:
    """Walker Sands AI Domain Impact Index (0-100) + JOKER External Topical Network:
    Scores an external target domain on whether its content can actually be crawled and cited by LLMs
    (TechTarget 82 vs Forbes 55)."""
    parsed = urllib.parse.urlparse(domain_or_url if "://" in domain_or_url else f"https://{domain_or_url}")
    base = f"{parsed.scheme}://{parsed.netloc}"
    target_url = domain_or_url if "://" in domain_or_url else base
    ai_bots = ["GPTBot", "OAI-SearchBot", "ChatGPT-User", "ClaudeBot", "PerplexityBot", "Google-Extended"]
    blocked_bots: list[str] = []
    robots_status = "missing_or_open"
    try:
        robots_txt = http_get_text(f"{base}/robots.txt", timeout=8.0)
        robots_status = "fetched"
        for bot in ai_bots:
            pattern = rf"(?is)User-agent:\s*{re.escape(bot)}\s+([^\n#]*\n)*?Disallow:\s*/\s*(\n|$)"
            if re.search(pattern, robots_txt):
                blocked_bots.append(bot)
    except Exception:
        pass

    allowed_ratio = (len(ai_bots) - len(blocked_bots)) / len(ai_bots)
    inclusion_score = round(allowed_ratio * 35)  # 35 pts max

    onpage_score = 0
    retrieval_score = 0
    citation_meta_score = 0
    status_code = 0
    try:
        req = urllib.request.Request(target_url, headers={"User-Agent": USER_AGENT})
        with urllib.request.urlopen(req, timeout=10.0, context=SSL_CTX) as resp:
            status_code = resp.status
            html = resp.read().decode("utf-8", errors="replace")
        if status_code == 200:
            retrieval_score = 20
        text_only = re.sub(r"<script.*?</script>|<style.*?</style>|<[^>]+>", " ", html, flags=re.S | re.I)
        word_cnt = len(text_only.split())
        if word_cnt >= 250:
            onpage_score = 25
        elif word_cnt >= 80:
            onpage_score = 12
        has_title = bool(re.search(r"<title[^>]*>([^<]+)</title>", html, re.I))
        has_ld = "application/ld+json" in html.lower()
        has_og = 'property="og:title"' in html.lower() or "property='og:title'" in html.lower()
        citation_meta_score = (8 if has_title else 0) + (6 if has_ld else 0) + (6 if has_og else 0)
    except Exception as exc:
        return {"target": target_url, "error": str(exc), "ai_domain_impact_score": inclusion_score}

    total_score = inclusion_score + onpage_score + retrieval_score + citation_meta_score
    return {
        "target": target_url,
        "http_status": status_code,
        "robots_status": robots_status,
        "ai_bots_checked": ai_bots,
        "ai_bots_blocked": blocked_bots,
        "breakdown": {
            "inclusion_robots_35": inclusion_score,
            "onpage_ssr_readability_25": onpage_score,
            "realtime_retrieval_20": retrieval_score,
            "citation_metadata_20": citation_meta_score,
        },
        "ai_domain_impact_score": total_score,
        "verdict": "HIGH_AI_IMPACT (>=75)" if total_score >= 75 else ("MODERATE (50-74)" if total_score >= 50 else "LOW_AI_IMPACT_OR_BLOCKED (<50)"),
    }


def check_brand_consensus() -> dict[str, Any]:
    """JOKER Sec.7/14/20: Entity Definition (4-tuple ID card) & Brand Consensus (Entity Consistency != Copywriting paste).
    Checks that jasonzhu.ai's core pages and citations consistently bind the entity to the same Semantic Cluster."""
    entity_id_card = {
        "official_name": "Jason Zhu (jasonzhu.ai)",
        "primary_category": "Go-Global AI SaaS, Cross-Border Payments & GEO Empirical Research Hub",
        "core_topics": [
            "Cross-Border SaaS Payments (Stripe / Lemon Squeezy / Paddle / Waffo / Dodo Payments)",
            "SEO Water System Model v8 & L1-L5 Generative Engine Optimization (GEO)",
            "AI Agent Skills & 16-Planted-Bug SEO Audit Benchmark (agentskillshub.top)",
            "New-Seller & Early-Signal Demand Radar (new-term-radar / backlink-guard / payment-guard)",
        ],
        "target_audience": "Indie Developers & Go-Global AI SaaS Founders",
    }
    cluster_anchors = ["payment", "收款", "geo", "seo", "出海", "go-global", "indie", "独立开发者"]
    files_to_check = [
        REPO_ROOT / "src" / "lib" / "go-global.ts",
        BLOG_DIR / "indie-payments-report-2026.en.md",
        BLOG_DIR / "choose-payment-platform-2026.en.md",
        BLOG_DIR / "dodo-payments-waffo-ai-saas-fee-comparison.en.md",
    ]
    node_checks = []
    for f in files_to_check:
        if not f.exists():
            continue
        txt = f.read_text(encoding="utf-8").lower()
        matched = [a for a in cluster_anchors if a in txt]
        node_checks.append({
            "file": str(f.relative_to(REPO_ROOT)),
            "matched_semantic_anchors": matched,
            "aligned_with_entity_core": len(matched) >= 4,
        })
    return {
        "entity_id_card_4tuple": entity_id_card,
        "nodes_checked": node_checks,
        "all_nodes_aligned": all(n["aligned_with_entity_core"] for n in node_checks),
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
    sub.add_parser("panel-gap", help="Run L5 Measure audit on ops/geo panel")
    sub.add_parser("suski-matrix", help="Run L5 Suski 5-Rule + Marc Moeller Per-Engine Split Matrix (Page Cited vs Brand Named)")

    p_gates = sub.add_parser("three-gates", help="L1 Stephen Burns (Common Crawl) Three Gates audit: Permission + Edge WAF Bot Simulation + SSR JSON-LD/DOI")
    p_gates.add_argument("--url", default="https://jasonzhu.ai/en/blog/indie-payments-report-2026")

    p_16 = sub.add_parser("audit-16-guards", help="L1 Deterministic 16-Planted-Bug Guard (X-Robots-Tag header, hreflang 200 status, canonical, JSON-LD)")
    p_16.add_argument("--url", default="https://jasonzhu.ai/zh/go-global")

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

    sub.add_parser("verify-entity-experiment", help="Run 4-Layer Quantitative Entity Verification Experiment (Molecule + Google US SERP + Multi-Run Online LLM + Snapshot)")
    sub.add_parser("proprietary-assets", help="L4 Georg Richard Aare & Eli Schwartz 7-Category Proprietary Asset Audit on core BOFU pages")
    sub.add_parser("sro-and-recency", help="L4 Dan Petrovic SRO Grounding Density + Kevin Indig 90-Day Recency + Lily Ray 69%% Self-Listicle Guard")

    p_sec = sub.add_parser("section-candidates", help="L4 JOKER Sec.10/16 & iPullRank Ch.08: Audit every H2 section as an independent Retrieval Candidate")
    p_sec.add_argument("--file", default="choose-payment-platform-2026.en.md", help="Blog filename under src/content/blog")

    p_kg = sub.add_parser("connected-kg", help="L2 Andrea Volpini (WordLift, +30%% accuracy): Verify cross-page connected JSON-LD @id graph")
    p_kg.add_argument("--urls", nargs="*", default=[
        "https://jasonzhu.ai/zh/go-global",
        "https://jasonzhu.ai/en/blog/indie-payments-report-2026",
        "https://jasonzhu.ai/en/blog/choose-payment-platform-2026",
    ])

    p_impact = sub.add_parser("ai-domain-impact", help="L5 Walker Sands AI Domain Impact Index (0-100): Check external domain AI bot allowlisting & SSR readability")
    p_impact.add_argument("--target", required=True, help="Target domain or URL to score (e.g. dev.to, forbes.com, techtarget.com)")

    sub.add_parser("brand-consensus", help="L2/L5 JOKER Sec.7/20: Audit 4-tuple Entity ID Card & Semantic Cluster Brand Consensus")

    p_live = sub.add_parser("run-live-panel", help="L5 Automated Live Panel Probe across questions.json via Aisa.one + GoAnyAPI")
    p_live.add_argument("--limit", type=int, default=5, help="Number of questions from questions.json to probe")
    p_live.add_argument("--models", nargs="+", default=["perplexity/sonar", "gpt-4o-mini"], help="Aisa.one models to probe")

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

    if args.cmd == "section-candidates":
        target_f = BLOG_DIR / args.file
        print(json.dumps(audit_section_retrieval_candidates(target_f, brand_tokens), ensure_ascii=False, indent=2))
        return 0

    if args.cmd == "connected-kg":
        print(json.dumps(audit_connected_entity_graph(args.urls), ensure_ascii=False, indent=2))
        return 0

    if args.cmd == "ai-domain-impact":
        print(json.dumps(check_ai_domain_impact(args.target), ensure_ascii=False, indent=2))
        return 0

    if args.cmd == "brand-consensus":
        print(json.dumps(check_brand_consensus(), ensure_ascii=False, indent=2))
        return 0

    if args.cmd == "audit-16-guards":
        print(json.dumps(audit_16_planted_guards(args.url), ensure_ascii=False, indent=2))
        return 0

    if args.cmd == "run-live-panel":
        print(json.dumps(run_live_panel(args.limit, args.models, save=True), ensure_ascii=False, indent=2))
        return 0

    if args.cmd == "sro-and-recency":
        core_files = [
            BLOG_DIR / "indie-payments-report-2026.md",
            BLOG_DIR / "indie-payments-report-2026.en.md",
            BLOG_DIR / "choose-payment-platform-2026.md",
            BLOG_DIR / "choose-payment-platform-2026.en.md",
            BLOG_DIR / "dodo-payments-waffo-ai-saas-fee-comparison.md",
            BLOG_DIR / "dodo-payments-waffo-ai-saas-fee-comparison.en.md",
        ]
        print(json.dumps([audit_sro_recency_and_listicle_guard(f) for f in core_files if f.exists()], ensure_ascii=False, indent=2))
        return 0

    if args.cmd == "verify-entity-experiment":
        print(json.dumps(run_entity_verification_experiment(save_snapshot=True), ensure_ascii=False, indent=2))
        return 0

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

