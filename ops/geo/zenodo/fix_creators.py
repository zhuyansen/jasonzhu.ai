#!/usr/bin/env python3
"""Make every Zenodo record name its author the same way: one creator, "Zhu, Jason", with the ORCID.

Why (found 2026-11-22, see ops/geo/ENTITY-GRAPH-ITERATION-LOG.md):
  - 21292799 (AI Agent Skills Security Grades, 130K) listed the same person twice, "zhu, yansen" and
    "Jason Zhu". OpenAlex matched "zhu, yansen" to an unrelated Japanese author (A5009989201), so the
    dataset shows up there under someone else's name.
  - 24386243 (200,000 checkout links) had no ORCID on its creator, so it never linked back to the ORCID.

A metadata-only edit: the DOI, files and version stay the same; Zenodo re-sends the metadata to DataCite,
and OpenAlex picks it up on its next refresh. Affiliations already on a record are kept.

  python3 ops/geo/zenodo/fix_creators.py                  # dry run: what would change
  ZENODO_ACCESS_TOKEN=... python3 ops/geo/zenodo/fix_creators.py --apply
"""
from __future__ import annotations

import argparse
import json
import os
import sys
import urllib.error
import urllib.request

ORCID = "0009-0000-2894-6285"
NAME = "Zhu, Jason"
# record id -> affiliation to use when the record has none
RECORDS = {
    "21292799": "Agent Skills Hub (BRICKAI / GoSailGlobal LLC)",
    "24386243": "",
}
API = "https://zenodo.org/api"


def call(method: str, url: str, token: str = "", payload: dict | None = None) -> tuple[int, dict | str]:
    headers = {"Accept": "application/json", "User-Agent": "jasonzhu-entity-fix/1.0"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    data = None
    if payload is not None:
        headers["Content-Type"] = "application/json"
        data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            return resp.status, json.loads(resp.read().decode("utf-8", "ignore"))
    except urllib.error.HTTPError as exc:
        return exc.code, exc.read().decode("utf-8", "ignore")[:500]


def wanted(creators: list[dict], default_affiliation: str) -> list[dict]:
    """One creator, our name and ORCID, keeping the first affiliation any current creator has."""
    affiliation = next((c.get("affiliation") for c in creators if c.get("affiliation")), "") or default_affiliation
    one = {"name": NAME, "orcid": ORCID}
    if affiliation:
        one["affiliation"] = affiliation
    return [one]


def same(a: list[dict], b: list[dict]) -> bool:
    key = lambda cs: [(c.get("name"), c.get("orcid"), c.get("affiliation") or "") for c in cs]
    return key(a) == key(b)


def fix(record: str, default_affiliation: str, token: str, apply: bool) -> bool:
    code, rec = call("GET", f"{API}/records/{record}")
    if code != 200:
        print(f"{record}: cannot read the public record (HTTP {code})")
        return False
    now = rec["metadata"].get("creators", [])
    new = wanted(now, default_affiliation)
    print(f"{record} ({rec.get('doi')}):")
    print(f"  now:  {json.dumps(now, ensure_ascii=False)}")
    print(f"  want: {json.dumps(new, ensure_ascii=False)}")
    if same(now, new):
        print("  already right, nothing to do")
        return True
    if not apply:
        return True
    code, dep = call("POST", f"{API}/deposit/depositions/{record}/actions/edit", token)
    if code not in (200, 201):
        print(f"  could not open it for editing: HTTP {code} {dep}")
        return False
    meta = dep["metadata"]
    meta["creators"] = new
    code, body = call("PUT", f"{API}/deposit/depositions/{record}", token, {"metadata": meta})
    if code != 200:
        print(f"  update refused: HTTP {code} {body}")
        call("POST", f"{API}/deposit/depositions/{record}/actions/discard", token)   # leave the record as it was
        return False
    code, body = call("POST", f"{API}/deposit/depositions/{record}/actions/publish", token)
    if code not in (200, 202):
        print(f"  publish refused: HTTP {code} {body}")
        return False
    print(f"  published: creators now {json.dumps(body['metadata']['creators'], ensure_ascii=False)}")
    return True


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("--apply", action="store_true", help="edit and publish on Zenodo (default: dry run)")
    a = ap.parse_args()
    token = os.environ.get("ZENODO_ACCESS_TOKEN", "").strip()
    if a.apply and not token:
        print("ZENODO_ACCESS_TOKEN is required with --apply", file=sys.stderr)
        return 2
    ok = all([fix(r, aff, token, a.apply) for r, aff in RECORDS.items()])
    if not a.apply:
        print("\nDry run: nothing sent. Add --apply to edit and publish.")
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
