#!/usr/bin/env python3
"""New versions of our Zenodo records: a draft with new files and metadata, published only on request.

Each record's new files and metadata live in a folder next to this script (see RECORDS). The flow is the
one Zenodo's deposit API documents: POST /deposit/depositions/{id}/actions/newversion, then the draft at
links.latest_draft: delete the files it carried over, upload ours, PUT the metadata. Publishing is a
separate step.

  python3 ops/geo/zenodo/new_version.py --selftest           # offline checks of every folder
  python3 ops/geo/zenodo/new_version.py plan 24386243        # what `draft` would send (no network)
  python3 ops/geo/zenodo/new_version.py draft 24386243       # needs ZENODO_ACCESS_TOKEN
  python3 ops/geo/zenodo/new_version.py draft 24386243 --reuse <your draft id>
  python3 ops/geo/zenodo/new_version.py show <draft id>
  python3 ops/geo/zenodo/new_version.py publish <draft id> --yes
  python3 ops/geo/zenodo/new_version.py discard <draft id> --yes   # delete an unpublished draft

`draft` never publishes. It stops if the record already has an unpublished draft, so it never touches a
draft someone else opened; to redo one of your own drafts, pass it: `draft 24386243 --reuse 24432849`
(files replaced, metadata sent again).

The metadata starts from the published version online (creators, ORCID, licence, keywords... as they are
there now) and only the keys in zenodo_metadata.json replace it. Creators are never sent from here: they
must already be "Zhu, Jason" with the ORCID online, or the draft stops.

The token is read from ZENODO_ACCESS_TOKEN and never printed, for example:
  export ZENODO_ACCESS_TOKEN="$(grep '^ZENODO_ACCESS_TOKEN=' ~/.claude/.env | cut -d= -f2-)"
"""
from __future__ import annotations

import argparse
import csv
import hashlib
import io
import json
import os
import sys
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

API = "https://zenodo.org/api"
HERE = Path(__file__).resolve().parent
NAME = "Zhu, Jason"
ORCID = "0009-0000-2894-6285"
UA = "zenodo-new-version-script/1.0"

# record id -> (folder with zenodo_metadata.json, files to upload; paths relative to that folder)
RECORDS: dict[str, tuple[str, list[str]]] = {
    "24386243": ("01-indie-payments-200k-2026",
                 ["README.md", "new-sellers-by-platform-since-2025.csv", "new-sellers-by-year.csv"]),
    "24387072": ("02-mor-20usd-ai-saas-fee-benchmark-2026",
                 ["README.md", "merchant-of-record-20usd-ai-saas-subscription-fees-2026-11.csv"]),
    "24387074": ("03-ai-agent-skills-security-audit-105k-2026",
                 ["README.md", "agent-skills-hub-security-grade-coverage.csv"]),
    "24387076": ("04-backlink-spam-doorway-domains-2026",
                 ["README.md", "backlink-spam-list.csv"]),
    "24420920": ("wp-24420920-security-working-paper",
                 ["../../papers/Zhu-2026-AI-Agent-Skills-MCP-Supply-Chain-Security-Working-Paper.pdf"]),
}
REQUIRED = ("title", "publication_date", "version", "description")
# Never sent from here: they come from the published version online (another session fixed the creators).
FROM_ONLINE_ONLY = ("creators", "doi", "prereserve_doi")
# Wording these records must not carry (an archive is not an endorsement).
BANNED = ("CERN", "high-authority", "high authority", "官方")


# ---------- local files ----------

def folder(record: str) -> Path:
    return HERE / RECORDS[record][0]


def files(record: str) -> list[Path]:
    return [(folder(record) / rel).resolve() for rel in RECORDS[record][1]]


def overlay_of(record: str) -> dict:
    return json.loads((folder(record) / "zenodo_metadata.json").read_text(encoding="utf-8"))["metadata"]


def laid_over(current: dict, overlay: dict) -> dict:
    """`current` with each key of `overlay` replacing its value (lists are replaced, not merged)."""
    merged = dict(current)
    merged.update(overlay)
    return merged


def base_metadata(published: dict, draft: dict) -> dict:
    """The published version's metadata, minus its own DOI, carrying the DOI reserved for the draft."""
    base = {k: v for k, v in published.items() if k not in ("doi", "prereserve_doi")}
    if draft.get("prereserve_doi"):
        base["prereserve_doi"] = draft["prereserve_doi"]
    return base


def same_concept_others(listing: list[dict], record: str, conceptrecid: str) -> list[dict]:
    """Listing entries of the same concept other than the record itself (the listing shows it too)."""
    return [d for d in listing
            if str(d.get("conceptrecid")) == str(conceptrecid) and str(d.get("id")) != str(record)]


def md5(data: bytes) -> str:
    return hashlib.md5(data).hexdigest()


def read_token() -> str:
    raw = os.environ.get("ZENODO_ACCESS_TOKEN", "")
    return raw.strip().strip('"').strip("'").strip()


# ---------- Zenodo API ----------

def call(method: str, url: str, token: str, payload: dict | None = None,
         raw: bytes | None = None) -> tuple[int, dict | str]:
    headers = {"Accept": "application/json", "User-Agent": UA, "Authorization": f"Bearer {token}"}
    data = None
    if payload is not None:
        headers["Content-Type"] = "application/json"
        data = json.dumps(payload).encode("utf-8")
    elif raw is not None:
        headers["Content-Type"] = "application/octet-stream"
        data = raw
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=120) as resp:
            body = resp.read().decode("utf-8", "ignore")
            return resp.status, (json.loads(body) if body.strip() else {})
    except urllib.error.HTTPError as exc:
        return exc.code, exc.read().decode("utf-8", "ignore")[:600]


def need(ok: bool, message: str) -> None:
    if not ok:
        raise SystemExit(f"stopped: {message}")


def open_drafts(record: str, conceptrecid: str, token: str) -> list[dict]:
    """Unpublished depositions of the same concept, each confirmed with a direct read."""
    found: list[dict] = []
    for page in range(1, 6):
        code, body = call("GET", f"{API}/deposit/depositions?status=draft&size=100&page={page}", token)
        need(code == 200 and isinstance(body, list), f"cannot list drafts (HTTP {code}) {body}")
        if not body:
            break
        for dep in same_concept_others(body, record, conceptrecid):
            code, full = call("GET", f"{API}/deposit/depositions/{dep['id']}", token)
            if code == 200 and not full.get("submitted") and full.get("state") != "done":
                found.append(full)
    return found


def open_draft(record: str, token: str, reuse: str | None) -> tuple[dict, dict]:
    """(published deposition, draft to fill). Never takes over a draft that was not passed with --reuse."""
    code, rec = call("GET", f"{API}/deposit/depositions/{record}", token)
    need(code == 200, f"cannot read deposition {record} with this token (HTTP {code}) {rec}")
    need(bool(rec.get("submitted")) and rec.get("state") == "done", f"{record} is not a published record")
    existing = open_drafts(record, str(rec.get("conceptrecid")), token)
    ids = [str(d["id"]) for d in existing]
    if existing:
        need(reuse in ids, f"record {record} already has an unpublished draft ({', '.join(ids)}); not touching "
                           f"it. Pass --reuse <id> only if that draft is yours.")
        print(f"  reusing your draft {reuse}")
        return rec, next(d for d in existing if str(d["id"]) == reuse)
    need(reuse is None, f"--reuse {reuse} given, but record {record} has no open draft")
    code, body = call("POST", f"{API}/deposit/depositions/{record}/actions/newversion", token)
    need(code in (200, 201) and isinstance(body, dict), f"newversion refused (HTTP {code}) {body}")
    url = body.get("links", {}).get("latest_draft", "")
    need(bool(url), f"newversion gave no latest_draft link: {body}")
    code, draft = call("GET", url, token)
    need(code == 200 and isinstance(draft, dict), f"cannot read the draft at {url} (HTTP {code}) {draft}")
    need(str(draft.get("id")) != str(record), "newversion returned the published record, not a draft")
    need(not draft.get("submitted"), f"{draft.get('id')} is already published")
    return rec, draft


def replace_files(draft: dict, paths: list[Path], token: str) -> None:
    for f in draft.get("files", []):
        link = f.get("links", {}).get("self") or f"{API}/deposit/depositions/{draft['id']}/files/{f['id']}"
        code, body = call("DELETE", link, token)
        need(code in (200, 204), f"could not delete {f.get('filename')} from the draft (HTTP {code}) {body}")
        print(f"  removed {f.get('filename')}")
    bucket = draft.get("links", {}).get("bucket")
    need(bool(bucket), "the draft has no file bucket")
    for path in paths:
        data = path.read_bytes()
        code, body = call("PUT", f"{bucket}/{urllib.parse.quote(path.name)}", token, raw=data)
        need(code in (200, 201), f"upload of {path.name} refused (HTTP {code}) {body}")
        got = str(body.get("checksum", "")) if isinstance(body, dict) else ""
        need(got in ("", f"md5:{md5(data)}"), f"checksum of {path.name} does not match: {got}")
        print(f"  uploaded {path.name} ({len(data):,} bytes)")


def summary(dep: dict) -> dict:
    meta = dep.get("metadata", {})
    links = dep.get("links", {})
    return {
        "draft_id": dep.get("id"),
        "concept_record": dep.get("conceptrecid"),
        "submitted": dep.get("submitted"),
        "state": dep.get("state"),
        "title": meta.get("title"),
        "version": meta.get("version"),
        "publication_date": meta.get("publication_date"),
        "reserved_doi": (meta.get("prereserve_doi") or {}).get("doi"),
        "files": [f.get("filename") for f in dep.get("files", [])],
        "edit_url": links.get("html") or links.get("latest_draft_html"),
    }


def cmd_draft(record: str, reuse: str | None = None) -> int:
    need(record in RECORDS, f"no folder for record {record}; known: {', '.join(RECORDS)}")
    problems = check_record(record)
    need(not problems, "local check failed: " + "; ".join(problems))
    token = read_token()
    need(bool(token), "ZENODO_ACCESS_TOKEN is not set")
    print(f"{record}: opening a new version draft")
    published, draft = open_draft(record, token, reuse)
    print(f"  draft {draft['id']}")
    replace_files(draft, files(record), token)
    code, current = call("GET", f"{API}/deposit/depositions/{draft['id']}", token)
    need(code == 200, f"cannot re-read the draft (HTTP {code}) {current}")
    meta = laid_over(base_metadata(published.get("metadata", {}), current.get("metadata", {})), overlay_of(record))
    creators = [(c.get("name"), c.get("orcid")) for c in meta.get("creators", [])]
    need(creators == [(NAME, ORCID)], f"the published version's creators are {creators}, not {NAME} with the ORCID")
    code, body = call("PUT", f"{API}/deposit/depositions/{draft['id']}", token, {"metadata": meta})
    need(code == 200, f"metadata refused (HTTP {code}) {body}")
    code, final = call("GET", f"{API}/deposit/depositions/{draft['id']}", token)
    need(code == 200, f"cannot re-read the draft (HTTP {code}) {final}")
    out = {"record": record, **summary(final)}
    want = sorted(p.name for p in files(record))
    need(sorted(out["files"]) == want, f"draft files {out['files']} are not {want}")
    need(out["title"] == overlay_of(record)["title"], "draft title is not the one sent")
    need(not out["submitted"], "the draft was published, which this command must never do")
    print("  not published. Review it, then: new_version.py publish {} --yes".format(out["draft_id"]))
    print(json.dumps(out, ensure_ascii=False))
    return 0


def cmd_show(draft_id: str) -> int:
    token = read_token()
    need(bool(token), "ZENODO_ACCESS_TOKEN is not set")
    code, dep = call("GET", f"{API}/deposit/depositions/{draft_id}", token)
    need(code == 200, f"cannot read {draft_id} (HTTP {code}) {dep}")
    print(json.dumps(summary(dep), ensure_ascii=False, indent=2))
    return 0


def cmd_publish(draft_id: str, yes: bool) -> int:
    token = read_token()
    need(bool(token), "ZENODO_ACCESS_TOKEN is not set")
    code, dep = call("GET", f"{API}/deposit/depositions/{draft_id}", token)
    need(code == 200, f"cannot read {draft_id} (HTTP {code}) {dep}")
    need(not dep.get("submitted"), f"{draft_id} is already published")
    print(json.dumps(summary(dep), ensure_ascii=False, indent=2))
    if not yes:
        print("Nothing sent. Add --yes to publish this draft (a published version cannot be deleted).")
        return 1
    code, body = call("POST", f"{API}/deposit/depositions/{draft_id}/actions/publish", token)
    need(code in (200, 202), f"publish refused (HTTP {code}) {body}")
    print(json.dumps({"published": draft_id, "doi": body.get("doi"), "concept_doi": body.get("conceptdoi"),
                      "record": body.get("links", {}).get("record_html") or body.get("links", {}).get("html")},
                     ensure_ascii=False))
    return 0


def cmd_discard(draft_id: str, yes: bool) -> int:
    token = read_token()
    need(bool(token), "ZENODO_ACCESS_TOKEN is not set")
    code, dep = call("GET", f"{API}/deposit/depositions/{draft_id}", token)
    need(code == 200, f"cannot read {draft_id} (HTTP {code}) {dep}")
    need(not dep.get("submitted"), f"{draft_id} is published; only drafts can be deleted")
    if not yes:
        print(f"Nothing sent. Add --yes to delete the unpublished draft {draft_id}.")
        return 1
    code, body = call("DELETE", f"{API}/deposit/depositions/{draft_id}", token)
    need(code in (200, 201, 204), f"delete refused (HTTP {code}) {body}")
    print(f"deleted draft {draft_id}")
    return 0


def cmd_plan(record: str) -> int:
    need(record in RECORDS, f"no folder for record {record}")
    meta = overlay_of(record)
    print(f"{record} -> {RECORDS[record][0]}")
    print(f"  title: {meta['title']}")
    print(f"  version {meta['version']}, {meta['publication_date']}")
    for path in files(record):
        data = path.read_bytes()
        print(f"  file: {path.name} ({len(data):,} bytes, md5 {md5(data)})")
    problems = check_record(record)
    print("  local check: " + ("ok" if not problems else "; ".join(problems)))
    return 0 if not problems else 1


# ---------- offline checks ----------

def csv_rows(path: Path) -> list[dict]:
    text = path.read_text(encoding="utf-8")
    rows = list(csv.reader(io.StringIO(text)))
    width = len(rows[0])
    bad = [i + 1 for i, r in enumerate(rows) if len(r) != width]
    if bad:
        raise ValueError(f"{path.name}: rows {bad[:5]} do not have {width} columns")
    return [dict(zip(rows[0], r)) for r in rows[1:]]


def check_record(record: str) -> list[str]:
    problems: list[str] = []
    try:
        meta = overlay_of(record)
    except Exception as exc:  # noqa: BLE001 - reported, not raised
        return [f"zenodo_metadata.json: {exc}"]
    for key in REQUIRED:
        if not meta.get(key):
            problems.append(f"metadata has no {key}")
    for key in FROM_ONLINE_ONLY:
        if key in meta:
            problems.append(f"metadata must not set {key}: it comes from the published version online")
    if not str(meta.get("description", "")).startswith("<p><strong>What changed in this version"):
        problems.append("description must open with what changed in this version")
    texts = {"title": str(meta.get("title", "")), "description": str(meta.get("description", ""))}
    for path in files(record):
        if not path.is_file() or path.stat().st_size == 0:
            problems.append(f"missing or empty file {path}")
            continue
        if path.suffix == ".md":
            texts[path.name] = path.read_text(encoding="utf-8")
        if path.suffix == ".csv":
            try:
                csv_rows(path)
            except ValueError as exc:
                problems.append(str(exc))
        if path.suffix == ".pdf" and not path.read_bytes().startswith(b"%PDF"):
            problems.append(f"{path.name} is not a PDF")
    for name, text in texts.items():
        for word in BANNED:
            if word in text:
                problems.append(f"{name} contains {word!r}")
    readme = texts.get("README.md")
    if readme is not None and "## What changed in this version" not in readme:
        problems.append("README.md has no 'What changed in this version' section")
    return problems


def data_checks() -> list[str]:
    """Facts each corrected table must keep (taken from the sources named in the READMEs)."""
    p: list[str] = []
    one = {r["platform"]: r for r in csv_rows(folder("24386243") / "new-sellers-by-platform-since-2025.csv")}
    if set(one) != {"Stripe", "Gumroad", "Lemon Squeezy", "Polar", "Dodo Payments", "Creem", "Paddle"}:
        p.append(f"01: platforms are {sorted(one)}")
    if one.get("Polar", {}).get("new_sellers_2024") != "55" or one.get("Polar", {}).get("new_sellers_2026_to_oct15") != "1364":
        p.append("01: Polar must be 55 / 305 / 1364 as in the report")
    if one.get("Stripe", {}).get("new_sellers_since_2025") != "102590":
        p.append("01: Stripe since 2025 must be 102590")
    years = {r["year"]: r["new_sellers"] for r in csv_rows(folder("24386243") / "new-sellers-by-year.csv")}
    if years != {"2023": "21000", "2024": "29000", "2025": "56000", "2026": "82000"}:
        p.append(f"01: yearly totals are {years}")
    two = csv_rows(folder("24387072") / "merchant-of-record-20usd-ai-saas-subscription-fees-2026-11.csv")
    waffo = [r for r in two if r["setup"].startswith("Waffo")]
    if len(two) != 8 or not waffo or waffo[0]["payout_fee_in_total"] != "no" or waffo[0]["taken_usd"] != "1.28":
        p.append("02: eight rows, and Waffo at 1.28 with its payout fee marked as not included")
    if any(not r["payout_fee_in_total"] for r in two):
        p.append("02: every row must say whether a payout fee is in the total")
    if any("Creem" == r["setup"] for r in two):
        p.append("02: the source does not name Creem for the 3.9% row")
    three = csv_rows(folder("24387074") / "agent-skills-hub-security-grade-coverage.csv")
    if {r["snapshot_date"] for r in three} != {"2026-06-10", "2026-11-21"}:
        p.append("03: both snapshot dates must be present")
    if "102690" in (folder("24387074") / "agent-skills-hub-security-grade-coverage.csv").read_text(encoding="utf-8"):
        p.append("03: counts worked back from percentages must not return")
    four = csv_rows(folder("24387076") / "backlink-spam-list.csv")
    if len(four) != 581 or len({r["domain"] for r in four}) != 581:
        p.append(f"04: expected 581 unique domains, got {len(four)}")
    if set(four[0]) != {"domain", "category", "family", "evidence", "evidence_url", "first_listed",
                        "last_checked", "status", "source"}:
        p.append("04: columns must be those of list.csv")
    return p


def selftest() -> int:
    failures: list[str] = []
    merged = laid_over({"title": "old", "keywords": ["a", "b"], "notes": "kept"}, {"title": "new", "keywords": ["c"]})
    if merged != {"title": "new", "keywords": ["c"], "notes": "kept"}:
        failures.append(f"laid_over: {merged}")
    base = base_metadata({"title": "t", "creators": [1], "doi": "10.5281/zenodo.1",
                          "prereserve_doi": {"doi": "10.5281/zenodo.1"}},
                         {"prereserve_doi": {"doi": "10.5281/zenodo.2"}})
    if base != {"title": "t", "creators": [1], "prereserve_doi": {"doi": "10.5281/zenodo.2"}}:
        failures.append(f"base_metadata keeps the old DOI or drops the draft's: {base}")
    listing = [{"id": 10, "conceptrecid": "9"}, {"id": 11, "conceptrecid": "9"}, {"id": 12, "conceptrecid": "8"}]
    if [d["id"] for d in same_concept_others(listing, "10", "9")] != [11]:
        failures.append("same_concept_others must skip the record itself and other concepts")
    saved = os.environ.get("ZENODO_ACCESS_TOKEN")
    try:
        os.environ["ZENODO_ACCESS_TOKEN"] = ' "abc123" \n'
        if read_token() != "abc123":
            failures.append("read_token does not strip quotes and spaces")
    finally:
        if saved is None:
            os.environ.pop("ZENODO_ACCESS_TOKEN", None)
        else:
            os.environ["ZENODO_ACCESS_TOKEN"] = saved
    if urllib.parse.quote("a b.csv") != "a%20b.csv":
        failures.append("file names are not quoted for the bucket URL")
    for record in RECORDS:
        failures += [f"{record}: {msg}" for msg in check_record(record)]
    try:
        failures += data_checks()
    except Exception as exc:  # noqa: BLE001 - a missing file is a failure, not a crash
        failures.append(f"data checks: {exc}")
    for msg in failures:
        print(f"FAIL {msg}")
    print(f"selftest: {'ok' if not failures else f'{len(failures)} failure(s)'} ({len(RECORDS)} records)")
    return 0 if not failures else 1


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("--selftest", action="store_true", help="offline checks of every record folder")
    ap.add_argument("command", nargs="?", choices=["plan", "draft", "show", "publish", "discard"])
    ap.add_argument("target", nargs="?", help="record id (plan, draft) or draft id (show, publish, discard)")
    ap.add_argument("--yes", action="store_true", help="really publish or delete")
    ap.add_argument("--reuse", help="draft: refill this draft of yours instead of opening a new one")
    a = ap.parse_args()
    if a.selftest:
        return selftest()
    if not a.command or not a.target:
        ap.error("give a command and an id, or --selftest")
    if a.command == "plan":
        return cmd_plan(a.target)
    if a.command == "draft":
        return cmd_draft(a.target, a.reuse)
    if a.command == "show":
        return cmd_show(a.target)
    if a.command == "publish":
        return cmd_publish(a.target, a.yes)
    return cmd_discard(a.target, a.yes)


if __name__ == "__main__":
    sys.exit(main())
