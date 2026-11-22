#!/usr/bin/env python3
"""
Zenodo records of jasonzhu.ai: propagation check.

The four datasets were first published with this script on 2026-11-20. Their data now lives in the
folders next to it (one per record), and changes go out as new versions with new_version.py. The old
`build` and `publish` commands are gone: `build` rewrote those folders from tables embedded here that
did not match the reports, and `publish` created brand-new records (new DOIs) instead of new versions.

Zenodo is an open repository run by CERN for research outputs. Anyone can upload; it screens for spam
but does not review content, and a DOI says where a file is archived, not that anyone checked it.
Describe the records as "archived on Zenodo (DOI ...)".

Usage:
  python3 ops/geo/zenodo/publish_zenodo.py monitor --doi 10.5281/zenodo.24386243
  python3 ops/geo/zenodo/new_version.py --selftest      # new versions: see that script
"""

from __future__ import annotations

import argparse
import json
import ssl
import urllib.error
import urllib.request
from typing import Any

SSL_CTX = ssl.create_default_context()


def monitor_doi(doi: str) -> dict[str, Any]:
    record_id = doi.split("zenodo.")[-1]
    report: dict[str, Any] = {"doi": doi, "record_id": record_id, "nodes": {}}

    # 1. Zenodo API
    try:
        req = urllib.request.Request(f"https://zenodo.org/api/records/{record_id}", headers={"User-Agent": "jasonzhu-geo/1.0"})
        with urllib.request.urlopen(req, timeout=10, context=SSL_CTX) as r:
            data = json.loads(r.read().decode("utf-8"))
            report["nodes"]["1_zenodo"] = {
                "status": "LIVE",
                "title": data.get("metadata", {}).get("title"),
                "files": [f.get("key") for f in data.get("files", [])],
            }
    except Exception as exc:
        report["nodes"]["1_zenodo"] = {"status": "PENDING", "detail": str(exc)}

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
    parser = argparse.ArgumentParser(description="Check how a Zenodo DOI of jasonzhu.ai has propagated")
    sub = parser.add_subparsers(dest="cmd", required=True)
    p_mon = sub.add_parser("monitor", help="Check a Zenodo DOI on Zenodo, DataCite, doi.org, OpenAIRE and OpenAlex")
    p_mon.add_argument("--doi", default="10.5281/zenodo.24386243", help="DOI to monitor")
    for gone in ("build", "publish"):
        sub.add_parser(gone, help="removed: use new_version.py")

    args = parser.parse_args()
    if args.cmd == "monitor":
        print(json.dumps(monitor_doi(args.doi), ensure_ascii=False, indent=2))
        return 0
    print(f"`{args.cmd}` was removed on 2026-11-21. The record folders are the source now; "
          "send changes as a new version with ops/geo/zenodo/new_version.py.")
    return 2


if __name__ == "__main__":
    raise SystemExit(main())
