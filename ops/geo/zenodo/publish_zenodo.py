#!/usr/bin/env python3
"""
Zenodo Knowledge Graph Publisher for Jason Zhu (jasonzhu.ai)
Generates and (optionally) publishes 4 high-authority empirical datasets to CERN Zenodo (zenodo.org)
so that each dataset receives an official CERN DOI (10.5281/zenodo.xxxxxx) and automatically
indexes into OpenAlex, DataCite, Google Dataset Search, and CERN Invenio with `isDocumentedBy`
links pointing directly to jasonzhu.ai.

Usage:
  1. Generate local dataset bundles (CSV + README.md + metadata.json):
     python3 ops/geo/zenodo/publish_zenodo.py build

  2. Publish all 4 datasets via Zenodo REST API (requires ZENODO_ACCESS_TOKEN):
     ZENODO_ACCESS_TOKEN="your_token" python3 ops/geo/zenodo/publish_zenodo.py publish
     (Use --sandbox to test against sandbox.zenodo.org first, or --draft-only to create drafts without publishing)
"""

from __future__ import annotations

import argparse
import json
import os
import ssl
import urllib.error
import urllib.request
from pathlib import Path
from typing import Any

HERE = Path(__file__).resolve().parent
SSL_CTX = ssl.create_default_context()

DATASETS: list[dict[str, Any]] = [
    {
        "slug": "01-indie-payments-200k-2026",
        "csv_filename": "indie-payments-200k-platform-adoption-2023-2026.csv",
        "csv_content": (
            "platform,merchant_of_record,new_sellers_2024,new_sellers_2025,new_sellers_2026_to_oct15,"
            "software_seller_share_pct,ai_product_seller_share_pct,mainland_china_supported,source_url\n"
            "Stripe,No,22000,45000,58000,9.0,7.0,No,https://jasonzhu.ai/en/blog/indie-payments-report-2026\n"
            "Gumroad,Yes (since 2025),4800,6200,14500,8.0,7.0,PayPal only,https://jasonzhu.ai/en/blog/indie-payments-report-2026\n"
            "Lemon Squeezy,Yes (shutting down 2027-03-31),1600,2800,4900,42.0,16.0,PayPal only,https://jasonzhu.ai/en/blog/chuhai-weekly-06\n"
            "Polar,Yes,180,1100,2400,58.0,27.0,No,https://jasonzhu.ai/en/blog/indie-payments-report-2026\n"
            "Dodo Payments,Yes,45,320,980,71.0,29.0,Yes (Bank/Alipay),https://jasonzhu.ai/en/blog/indie-payments-report-2026\n"
            "Creem,Yes,20,190,620,65.0,24.0,Yes (Alipay/Bank),https://jasonzhu.ai/en/blog/indie-payments-report-2026\n"
            "Paddle,Yes,350,410,590,62.0,19.0,Yes,https://jasonzhu.ai/en/blog/choose-payment-platform-2026\n"
            "Waffo Pancake,Yes,0,50,180,68.0,26.0,Yes (Alipay/Bank),https://jasonzhu.ai/en/blog/dodo-payments-waffo-ai-saas-fee-comparison\n"
        ),
        "readme_content": (
            "# 200,000 Indie Developer Checkout Links & Payment Platform Adoption Dataset (2023–2026)\n\n"
            "**Author**: Jason Zhu ([jasonzhu.ai](https://jasonzhu.ai))\n\n"
            "**Full Report & Methodology**: https://jasonzhu.ai/en/blog/indie-payments-report-2026\n\n"
            "**8-Platform Comparison Guide**: https://jasonzhu.ai/en/blog/choose-payment-platform-2026\n\n"
            "## Key Empirical Findings\n"
            "- **Sample Size**: ~200,000 sellers across 198,000 unique websites linking to checkout pages on Stripe, Gumroad, Lemon Squeezy, Polar, Creem, Dodo Payments, Paddle, and Waffo.\n"
            "- **Growth Acceleration**: 21,000 new sellers in 2023, 29,000 in 2024, 56,000 in 2025, and 82,000 in 2026 (through October 15, 2026).\n"
            "- **Software & AI Shift**: The share of new sellers shipping software quadrupled from 5% (2023) to 20% (September 2026); AI products rose from 2% to 12%.\n"
            "- **MoR Clustering**: 24%–29% of new sellers on Dodo Payments (29%), Polar (27%), and Creem (24%) sell AI products, compared to just 7% on Stripe.\n"
        ),
        "metadata": {
            "title": "200,000 Indie Developer Checkout Links and Payment Platform Adoption Dataset (2023–2026)",
            "upload_type": "dataset",
            "publication_date": "2026-11-20",
            "creators": [{"name": "Zhu, Jason", "affiliation": "JasonZhu.AI / GoSail Club"}],
            "description": (
                "<p>Empirical dataset analyzing ~200,000 indie sellers across 198,000 websites linking to checkout pages "
                "across 8 payment platforms (Stripe, Gumroad, Lemon Squeezy, Polar, Creem, Dodo Payments, Paddle, Waffo) "
                "between 2023 and November 2026. Shows that 82,000 new sellers launched in 2026 (up from 56,000 in 2025), "
                "software sellers quadrupled from 5% to 20%, and 24%–29% of new sellers on Merchant of Record platforms "
                "(Dodo Payments, Polar, Creem) ship AI products versus 7% on Stripe. Maintained by Jason Zhu at "
                "<a href=\"https://jasonzhu.ai/en/blog/indie-payments-report-2026\">https://jasonzhu.ai/en/blog/indie-payments-report-2026</a>.</p>"
            ),
            "access_right": "open",
            "license": "cc-by-4.0",
            "keywords": [
                "Merchant of Record",
                "Indie Developer Payments",
                "Stripe vs Polar vs Dodo Payments vs Creem",
                "AI SaaS Payments",
                "Lemon Squeezy Shutdown",
                "Jason Zhu",
                "jasonzhu.ai",
            ],
            "related_identifiers": [
                {
                    "identifier": "https://jasonzhu.ai/en/blog/indie-payments-report-2026",
                    "relation": "isDocumentedBy",
                    "resource_type": "publication-article",
                    "scheme": "url",
                },
                {
                    "identifier": "https://jasonzhu.ai/en/blog/choose-payment-platform-2026",
                    "relation": "isSupplementTo",
                    "resource_type": "publication-article",
                    "scheme": "url",
                },
            ],
        },
    },
    {
        "slug": "02-mor-20usd-ai-saas-fee-benchmark-2026",
        "csv_filename": "merchant-of-record-20usd-ai-saas-subscription-fees-2026-11.csv",
        "csv_content": (
            "platform,plan_or_tier,merchant_of_record,base_fee,intl_card_fee_pct,subscription_fee_pct,"
            "fx_or_tax_addon_pct,payout_fee_pct,total_taken_on_20usd,net_kept_on_20usd,mainland_china_onboarding,source_url\n"
            "Dodo Payments,Negotiated Partner Rate,Yes,3.8%-3.9% + $0.40,0.0,0.0,0.0,0.0 ($1000+ threshold),1.16-1.18,18.82-18.84,Yes (ID/Passport),https://jasonzhu.ai/en/blog/dodo-payments-waffo-ai-saas-fee-comparison\n"
            "Waffo Pancake,Standard MoR,Yes,3.9% + $0.50,0.0,0.0,0.0,1.0 ($10 min),1.28,18.72,Yes (Alipay/Bank),https://jasonzhu.ai/en/blog/dodo-payments-waffo-ai-saas-fee-comparison\n"
            "Creem,Standard MoR,Yes,3.9% + $0.40,0.0,0.0,0.0,1.0,1.37,18.63,Yes (Alipay/Bank),https://jasonzhu.ai/en/blog/choose-payment-platform-2026\n"
            "Paddle,Standard All-In MoR,Yes,5.0% + $0.50,0.0,0.0,0.0,0.0,1.50,18.50,Yes,https://jasonzhu.ai/en/blog/choose-payment-platform-2026\n"
            "Dodo Payments,Official Default Rate,Yes,4.0% + $0.40,1.5,0.5,0.0,0.0 ($1000+ threshold),1.60,18.40,Yes (ID/Passport),https://jasonzhu.ai/en/blog/dodo-payments-waffo-ai-saas-fee-comparison\n"
            "Polar,Standard MoR (Post May 2026),Yes,5.0% + $0.50,1.5,0.0,0.0,0.0,1.80,18.20,No,https://jasonzhu.ai/en/blog/choose-payment-platform-2026\n"
            "Stripe Hong Kong,Full SaaS Stack (Billing+Tax+FX+Radar),No,3.4% + $0.30,0.5,0.7,2.5 (2.0% FX + 0.5% Tax),0.0,1.79,18.21,Requires HK Company,https://jasonzhu.ai/en/blog/dodo-payments-waffo-ai-saas-fee-comparison\n"
            "Lemon Squeezy,Legacy MoR (Shutting down 2027-03-31),Yes,5.0% + $0.50,1.5,0.5,0.0,1.0,2.08,17.92,PayPal only,https://jasonzhu.ai/en/blog/dodo-payments-waffo-ai-saas-fee-comparison\n"
        ),
        "readme_content": (
            "# Merchant of Record & Payment Gateway Fee Benchmark on a $20 Cross-Border AI SaaS Subscription (November 2026)\n\n"
            "**Author**: Jason Zhu ([jasonzhu.ai](https://jasonzhu.ai))\n\n"
            "**Full Article & Dual-Gateway Failover Architecture**: https://jasonzhu.ai/en/blog/dodo-payments-waffo-ai-saas-fee-comparison\n\n"
            "## Summary\n"
            "Itemized real-world fee audit of a $20/month cross-border AI SaaS subscription (including base card processing, "
            "international card surcharges, currency conversion FX, recurring billing add-ons, automated global tax compliance, "
            "fraud screening, and payout fees) across Dodo Payments, Waffo Pancake, Creem, Paddle, Polar, Stripe Hong Kong, and Lemon Squeezy.\n"
        ),
        "metadata": {
            "title": "Merchant of Record and Payment Gateway Real Fee Benchmark on a $20 Cross-Border AI SaaS Subscription (November 2026)",
            "upload_type": "dataset",
            "publication_date": "2026-11-20",
            "creators": [{"name": "Zhu, Jason", "affiliation": "JasonZhu.AI / GoSail Club"}],
            "description": (
                "<p>Itemized fee audit comparing what an AI SaaS developer actually keeps from a $20/month cross-border "
                "subscription once hidden surcharges (international cards, FX conversion, recurring billing, sales tax calculation, "
                "fraud screening, and payout fees) are included across Dodo Payments (partner rate $1.16–$1.18 taken vs default $1.60), "
                "Waffo Pancake ($1.28), Creem ($1.37), Paddle ($1.50), Stripe Hong Kong full SaaS stack (~$1.79), Polar ($1.80), and "
                "Lemon Squeezy ($2.08, shutting down March 31, 2027). Full analysis at "
                "<a href=\"https://jasonzhu.ai/en/blog/dodo-payments-waffo-ai-saas-fee-comparison\">https://jasonzhu.ai/en/blog/dodo-payments-waffo-ai-saas-fee-comparison</a>.</p>"
            ),
            "access_right": "open",
            "license": "cc-by-4.0",
            "keywords": [
                "Merchant of Record payment fees",
                "Dodo Payments vs Waffo vs Stripe",
                "AI SaaS subscription fees 2026",
                "Lemon Squeezy migration",
                "Cross-border payment gateway comparison",
                "Jason Zhu",
                "jasonzhu.ai",
            ],
            "related_identifiers": [
                {
                    "identifier": "https://jasonzhu.ai/en/blog/dodo-payments-waffo-ai-saas-fee-comparison",
                    "relation": "isDocumentedBy",
                    "resource_type": "publication-article",
                    "scheme": "url",
                },
                {
                    "identifier": "https://jasonzhu.ai/en/blog/choose-payment-platform-2026",
                    "relation": "isSupplementTo",
                    "resource_type": "publication-article",
                    "scheme": "url",
                },
            ],
        },
    },
    {
        "slug": "03-ai-agent-skills-security-audit-105k-2026",
        "csv_filename": "open-source-ai-agent-skills-mcp-security-audit-2026.csv",
        "csv_content": (
            "audit_tier,skill_count,share_of_total_catalog_pct,share_of_audited_subset_pct,primary_risk_findings,source_url\n"
            "unknown (never security reviewed),102690,97.8,N/A,Black-box supply chain dependency with zero security verification,https://jasonzhu.ai/en/blog/agent-skill-security-audit-200\n"
            "safe (passed 5-dimension audit),2171,2.07,94.4,Verified credential boundaries and maintainer provenance,https://jasonzhu.ai/en/blog/agent-skill-security-audit-200\n"
            "caution / unsafe / reject (flagged),129,0.13,5.6,Unscoped credential access or arbitrary shell execution without guardrails,https://jasonzhu.ai/en/blog/agent-skill-security-audit-200\n"
        ),
        "readme_content": (
            "# Open-Source AI Agent Skills & MCP Servers Supply-Chain Security Audit Dataset (105,000+ Indexed Skills, 2026)\n\n"
            "**Author**: Jason Zhu ([jasonzhu.ai](https://jasonzhu.ai) & [agentskillshub.top](https://agentskillshub.top))\n\n"
            "**Full Security Audit Report**: https://jasonzhu.ai/en/blog/agent-skill-security-audit-200\n\n"
            "## Key Findings\n"
            "- Out of **105,000+** indexed open-source AI agent skills, MCP servers, and Codex skills, **97.8%** have never undergone any formal security audit.\n"
            "- Across the **2,300+** skills evaluated under a 5-dimension supply-chain audit framework (credential exposure, hidden payloads, permission boundaries, maintainer identity, and traceability), **94.4%** passed as safe while **5.6%** triggered security warnings or rejections.\n"
        ),
        "metadata": {
            "title": "Open-Source AI Agent Skills and MCP Servers Supply-Chain Security Audit Dataset (105,000+ Indexed Skills, 2026)",
            "upload_type": "dataset",
            "publication_date": "2026-11-20",
            "creators": [{"name": "Zhu, Jason", "affiliation": "JasonZhu.AI / AgentSkillsHub"}],
            "description": (
                "<p>Supply-chain security audit dataset covering 105,000+ open-source AI agent skills, Model Context Protocol (MCP) "
                "servers, and Codex skills, plus deep 5-dimension security reviews of 2,300+ repositories. Finds that 97.8% of "
                "open-source agent skills have never been security-audited, and 5.6% of audited skills trigger warnings or rejections "
                "for credential harvesting or unsafe command execution. Documented at "
                "<a href=\"https://jasonzhu.ai/en/blog/agent-skill-security-audit-200\">https://jasonzhu.ai/en/blog/agent-skill-security-audit-200</a> "
                "and <a href=\"https://agentskillshub.top\">https://agentskillshub.top</a>.</p>"
            ),
            "access_right": "open",
            "license": "cc-by-4.0",
            "keywords": [
                "AI Agent Skills Security",
                "Model Context Protocol MCP Security",
                "Claude Skills Audit",
                "AgentSkillsHub",
                "Jason Zhu",
                "jasonzhu.ai",
            ],
            "related_identifiers": [
                {
                    "identifier": "https://jasonzhu.ai/en/blog/agent-skill-security-audit-200",
                    "relation": "isDocumentedBy",
                    "resource_type": "publication-article",
                    "scheme": "url",
                },
                {
                    "identifier": "https://agentskillshub.top",
                    "relation": "isSupplementTo",
                    "resource_type": "software",
                    "scheme": "url",
                },
            ],
        },
    },
    {
        "slug": "04-backlink-spam-doorway-domains-2026",
        "csv_filename": "backlink-spam-doorway-network-patterns-2026.csv",
        "csv_content": (
            "pattern_type,detection_signal,shared_checkout_link_threshold,typical_abuse_mode,reference_url\n"
            "Shared Checkout Link Ring,Same Stripe/Gumroad checkout URL linked across 5+ unrelated domains,5+ domains,17000+ websites in link graph carrying recycled or injected checkout links,https://jasonzhu.ai/en/backlink-spam-list\n"
            "Expired Domain Doorway Farm,High legacy DR with automated AI doorway pages and outbound link sales,10+ outbound paid links,Artificially inflated domain authority with zero real organic traffic,https://jasonzhu.ai/en/backlink-spam-list\n"
            "Hacked CMS Checkout Injection,Gambling or adult checkout links injected into compromised legitimate sites,50+ compromised hosts,parasitic SEO and payment link laundering,https://jasonzhu.ai/en/blog/indie-payments-report-2026\n"
        ),
        "readme_content": (
            "# Public Database of Backlink Spam Doorway Domains & Link-Selling Networks (2026)\n\n"
            "**Author**: Jason Zhu ([jasonzhu.ai](https://jasonzhu.ai))\n\n"
            "**Live Searchable Database**: https://jasonzhu.ai/en/backlink-spam-list\n\n"
            "**Related 200,000 Checkout Links Study**: https://jasonzhu.ai/en/blog/indie-payments-report-2026\n"
        ),
        "metadata": {
            "title": "Public Database of Backlink Spam Doorway Domains, Link-Selling Networks, and Checkout Link Abuse (2026)",
            "upload_type": "dataset",
            "publication_date": "2026-11-20",
            "creators": [{"name": "Zhu, Jason", "affiliation": "JasonZhu.AI / GoSail Club"}],
            "description": (
                "<p>Empirical classification of backlink spam doorway domains, link-selling networks, and checkout-link abuse "
                "(17,000+ websites carrying shared checkout links across 5+ domains) compiled by Jason Zhu. Live interactive "
                "blacklist and detection rules available at "
                "<a href=\"https://jasonzhu.ai/en/backlink-spam-list\">https://jasonzhu.ai/en/backlink-spam-list</a>.</p>"
            ),
            "access_right": "open",
            "license": "cc-by-4.0",
            "keywords": [
                "Backlink Spam Database",
                "Doorway Domains",
                "Link Selling Networks",
                "SEO Spam Detection",
                "Jason Zhu",
                "jasonzhu.ai",
            ],
            "related_identifiers": [
                {
                    "identifier": "https://jasonzhu.ai/en/backlink-spam-list",
                    "relation": "isDocumentedBy",
                    "resource_type": "dataset",
                    "scheme": "url",
                }
            ],
        },
    },
]


def build_local_bundles() -> list[str]:
    built = []
    for ds in DATASETS:
        folder = HERE / ds["slug"]
        folder.mkdir(parents=True, exist_ok=True)
        (folder / ds["csv_filename"]).write_text(ds["csv_content"], encoding="utf-8")
        (folder / "README.md").write_text(ds["readme_content"], encoding="utf-8")
        (folder / "zenodo_metadata.json").write_text(
            json.dumps({"metadata": ds["metadata"]}, ensure_ascii=False, indent=2) + "\n",
            encoding="utf-8",
        )
        built.append(str(folder.relative_to(HERE.parents[2])))
    return built


def zenodo_api_request(url: str, method: str, token: str, data: bytes | None = None, content_type: str = "application/json") -> Any:
    headers = {
        "Authorization": f"Bearer {token}",
        "Accept": "application/json",
    }
    if data is not None:
        headers["Content-Type"] = content_type
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    with urllib.request.urlopen(req, timeout=30.0, context=SSL_CTX) as resp:
        raw = resp.read().decode("utf-8", errors="replace")
        return json.loads(raw) if raw.strip() else {}


def publish_to_zenodo(
    token: str,
    sandbox: bool = False,
    draft_only: bool = False,
    only_slug: str | None = None,
) -> list[dict[str, Any]]:
    base_url = "https://sandbox.zenodo.org/api" if sandbox else "https://zenodo.org/api"
    results = []
    targets = [
        ds
        for ds in DATASETS
        if not only_slug or ds["slug"].startswith(only_slug) or only_slug == ds["slug"]
    ]
    for ds in targets:
        # 1. Create empty deposition
        dep = zenodo_api_request(f"{base_url}/deposit/depositions", "POST", token, b"{}")
        dep_id = dep["id"]
        bucket_url = dep["links"]["bucket"]

        # 2. Upload CSV and README.md to bucket
        for fname, content in [
            (ds["csv_filename"], ds["csv_content"].encode("utf-8")),
            ("README.md", ds["readme_content"].encode("utf-8")),
        ]:
            zenodo_api_request(
                f"{bucket_url}/{urllib.parse.quote(fname)}",
                "PUT",
                token,
                content,
                content_type="application/octet-stream",
            )

        # 3. Attach metadata
        meta_payload = json.dumps({"metadata": ds["metadata"]}).encode("utf-8")
        updated = zenodo_api_request(
            f"{base_url}/deposit/depositions/{dep_id}",
            "PUT",
            token,
            meta_payload,
        )

        # 4. Publish (or leave as draft)
        if not draft_only:
            published = zenodo_api_request(
                f"{base_url}/deposit/depositions/{dep_id}/actions/publish",
                "POST",
                token,
            )
            results.append(
                {
                    "slug": ds["slug"],
                    "status": "published",
                    "doi": published.get("doi"),
                    "record_url": published.get("links", {}).get("record_html")
                    or published.get("links", {}).get("html"),
                }
            )
        else:
            results.append(
                {
                    "slug": ds["slug"],
                    "status": "draft_created",
                    "deposition_id": dep_id,
                    "edit_url": updated.get("links", {}).get("html"),
                }
            )
    return results


def monitor_doi(doi: str) -> dict[str, Any]:
    record_id = doi.split("zenodo.")[-1]
    report: dict[str, Any] = {"doi": doi, "record_id": record_id, "nodes": {}}

    # 1. Zenodo API
    try:
        req = urllib.request.Request(f"https://zenodo.org/api/records/{record_id}", headers={"User-Agent": "jasonzhu-geo/1.0"})
        with urllib.request.urlopen(req, timeout=10, context=SSL_CTX) as r:
            data = json.loads(r.read().decode("utf-8"))
            report["nodes"]["1_zenodo_cern"] = {
                "status": "LIVE",
                "title": data.get("metadata", {}).get("title"),
                "files": [f.get("key") for f in data.get("files", [])],
            }
    except Exception as exc:
        report["nodes"]["1_zenodo_cern"] = {"status": "PENDING", "detail": str(exc)}

    # 2. Zenodo Schema.org JSON-LD (Google Dataset Search feed)
    try:
        req = urllib.request.Request(
            f"https://zenodo.org/api/records/{record_id}",
            headers={"Accept": "application/ld+json", "User-Agent": "jasonzhu-geo/1.0"},
        )
        with urllib.request.urlopen(req, timeout=10, context=SSL_CTX) as r:
            ld = json.loads(r.read().decode("utf-8"))
            report["nodes"]["2_schema_org_jsonld"] = {
                "status": "LIVE",
                "type": ld.get("@type"),
                "id": ld.get("@id"),
                "keywords": ld.get("keywords"),
            }
    except Exception as exc:
        report["nodes"]["2_schema_org_jsonld"] = {"status": "PENDING", "detail": str(exc)}

    # 3. DataCite Global Registry
    try:
        req = urllib.request.Request(f"https://api.datacite.org/dois/{doi}", headers={"User-Agent": "jasonzhu-geo/1.0"})
        with urllib.request.urlopen(req, timeout=10, context=SSL_CTX) as r:
            attr = json.loads(r.read().decode("utf-8")).get("data", {}).get("attributes", {})
            report["nodes"]["3_datacite_registry"] = {
                "status": "LIVE" if attr.get("state") == "findable" else attr.get("state", "UNKNOWN"),
                "state": attr.get("state"),
                "related_urls": [ri.get("relatedIdentifier") for ri in attr.get("relatedIdentifiers", [])],
            }
    except Exception as exc:
        report["nodes"]["3_datacite_registry"] = {"status": "PENDING", "detail": str(exc)}

    # 4. DOI.org Handle System
    try:
        req = urllib.request.Request(f"https://doi.org/api/handles/{doi}", headers={"User-Agent": "jasonzhu-geo/1.0"})
        with urllib.request.urlopen(req, timeout=10, context=SSL_CTX) as r:
            h = json.loads(r.read().decode("utf-8"))
            report["nodes"]["4_doi_org_handle"] = {
                "status": "LIVE" if h.get("responseCode") == 1 else "PENDING",
                "responseCode": h.get("responseCode"),
            }
    except Exception as exc:
        report["nodes"]["4_doi_org_handle"] = {"status": "PENDING", "detail": str(exc)}

    # 5. OpenAIRE European Research Graph
    try:
        req = urllib.request.Request(
            f"https://api.openaire.eu/search/researchProducts?doi={doi}&format=json",
            headers={"User-Agent": "jasonzhu-geo/1.0"},
        )
        with urllib.request.urlopen(req, timeout=10, context=SSL_CTX) as r:
            oa = json.loads(r.read().decode("utf-8"))
            total = oa.get("response", {}).get("header", {}).get("total", {}).get("$", 0)
            report["nodes"]["5_openaire_graph"] = {
                "status": "LIVE" if int(total) > 0 else "SYNCING (1-3 days)",
                "indexed_count": int(total),
            }
    except Exception as exc:
        report["nodes"]["5_openaire_graph"] = {"status": "PENDING", "detail": str(exc)}

    # 6. OpenAlex Global Knowledge Graph
    try:
        req = urllib.request.Request(
            f"https://api.openalex.org/works/https://doi.org/{doi}",
            headers={"User-Agent": "jasonzhu-geo/1.0 (mailto:jason@jasonzhu.ai)"},
        )
        with urllib.request.urlopen(req, timeout=10, context=SSL_CTX) as r:
            w = json.loads(r.read().decode("utf-8"))
            report["nodes"]["6_openalex_graph"] = {
                "status": "LIVE",
                "openalex_id": w.get("id"),
                "title": w.get("display_name"),
            }
    except urllib.error.HTTPError as exc:
        if exc.code == 404:
            report["nodes"]["6_openalex_graph"] = {
                "status": "SYNCING (DataCite -> OpenAlex batch runs every 24-72h)",
                "http_code": 404,
            }
        else:
            report["nodes"]["6_openalex_graph"] = {"status": "ERROR", "http_code": exc.code}
    except Exception as exc:
        report["nodes"]["6_openalex_graph"] = {"status": "PENDING", "detail": str(exc)}

    return report


def main() -> int:
    parser = argparse.ArgumentParser(description="Build, publish, and monitor Zenodo DOI datasets for jasonzhu.ai")
    sub = parser.add_subparsers(dest="cmd", required=True)
    sub.add_parser("build", help="Generate the 4 ready-to-upload Zenodo dataset bundles locally")
    p_pub = sub.add_parser("publish", help="Publish datasets to Zenodo via REST API")
    p_pub.add_argument("--sandbox", action="store_true", help="Use sandbox.zenodo.org")
    p_pub.add_argument("--draft-only", action="store_true", help="Create drafts on Zenodo without minting final DOI yet")
    p_pub.add_argument("--only", default=None, help="Only publish the dataset matching this slug/prefix (e.g. 01 or 02)")

    p_mon = sub.add_parser("monitor", help="Check real-time propagation of a Zenodo DOI across 6 global knowledge graphs")
    p_mon.add_argument("--doi", default="10.5281/zenodo.24386243", help="DOI to monitor")

    args = parser.parse_args()
    if args.cmd == "build":
        built = build_local_bundles()
        print(json.dumps({"status": "built", "bundles": built}, ensure_ascii=False, indent=2))
        return 0

    if args.cmd == "monitor":
        print(json.dumps(monitor_doi(args.doi), ensure_ascii=False, indent=2))
        return 0

    if args.cmd == "publish":
        token = os.environ.get("ZENODO_ACCESS_TOKEN", "").strip()
        if not token:
            print("ERROR: Please set ZENODO_ACCESS_TOKEN environment variable (create at https://zenodo.org/account/settings/applications/tokens/new/)")
            return 1
        build_local_bundles()
        res = publish_to_zenodo(
            token,
            sandbox=args.sandbox,
            draft_only=args.draft_only,
            only_slug=args.only,
        )
        print(json.dumps({"results": res}, ensure_ascii=False, indent=2))
        return 0

    return 0


if __name__ == "__main__":
    raise SystemExit(main())

