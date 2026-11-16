"""Seller kinds by Jev (TypeSafe decisions API): one call per site, two typed questions.

    python jev_kinds.py calibrate   # the 191 hand-labelled sellers: agreement, speed, tokens
    python jev_kinds.py run [N]     # the history database, newest sellers first (N sites at most)

TYPESAFE_API_KEY must be in the environment. Writes kind (sellers.KINDS names), kind_by = 'jev'
and an `ai` column (1/0) into new-term-radar/state/sellers_history.db.
"""
from __future__ import annotations

import json
import os
import sqlite3
import sys

import time
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

sys.path.insert(0, os.environ.get("JEV_CLIENT_DIR", str(Path.home() / "content/agent-skills-hub/ops/jev-review")))
sys.path.insert(0, os.environ.get("RADAR_SRC", str(Path.home() / "content/new-term-radar")))
from jev_client import OpenRouter  # noqa: E402
from radar import sellers  # noqa: E402

HERE = Path(__file__).parent / "links"
DB = Path(os.environ.get("SELLER_DB", Path.home() / "content/new-term-radar/state/sellers_history.db"))
WORKERS = 16
QUESTIONS = {
    "kind": {"type": "choice", "instructions": "What does this website sell or ask money for?",
             "criteria": {
                 "software": "Software: an app, SaaS, AI tool, browser extension, API, developer tool or agent",
                 "template": "Templates, themes, UI kits, icons, fonts, 3D models or other design assets",
                 "course": "Courses, training, exam prep, coaching or consulting",
                 "content": "Ebooks, guides, newsletters, communities, memberships, directories or a blog",
                 "physical": "Physical goods shipped to the buyer",
                 "donation": "Donations: a news site, church, charity or nonprofit",
                 "other": "Something else, such as a local or professional service, or a personal portfolio"}},
    "ai": {"type": "noul", "instructions": "Is what it sells built on AI or about AI (an AI tool, agent or model, or training or consulting on AI)?",
           "criteria": {"true": "Yes", "false": "No"}},
}
TO_KIND = {"software": "ai"}


def state_of(host: str, title: str, description: str) -> str:
    return (f"A website that has a payment link, so it takes money for something.\n"
            f"Domain: {host}\nTitle: {title}\nDescription: {description}")


def ask(client: OpenRouter, row: dict) -> dict:
    t = time.time()
    try:
        d = client.decisions(state_of(row["host"], row["title"], row["description"]), QUESTIONS)
    except Exception as exc:  # noqa: BLE001 — one failed site keeps its rules kind
        return {"host": row["host"], "error": str(exc)[:160], "seconds": time.time() - t}
    k, a = d.answers.get("kind") or {}, d.answers.get("ai") or {}
    return {"host": row["host"], "kind": TO_KIND.get(k.get("choice"), k.get("choice")), "p": k.get("probabilities"),
            "ai": a.get("noul"), "model": d.model, "seconds": time.time() - t}


def calibrate() -> None:
    sample = json.load(open(HERE / "calib_sample.json"))
    gold = json.load(open(HERE / "calib_gold.json"))
    client = OpenRouter()
    t0 = time.time()
    with ThreadPoolExecutor(WORKERS) as pool:
        got = list(pool.map(lambda r: ask(client, r), sample))
    wall = time.time() - t0
    json.dump(got, open(HERE / "calib_jev.json", "w"), ensure_ascii=False, indent=0)
    ok = [g for g in got if "error" not in g]
    print(f"{len(ok)}/{len(got)} answered in {wall:.0f}s with {WORKERS} workers; median call "
          f"{sorted(g['seconds'] for g in ok)[len(ok) // 2]:.1f}s; tokens {client.tokens:,} ({client.tokens / max(1, len(ok)):.0f}/site); "
          f"models {sorted(client.models_seen)}")
    print("first answer:", json.dumps(ok[0], ensure_ascii=False)[:400] if ok else None)
    for g in got:
        if "error" in g:
            print("error", g["host"], g["error"])


def agreement() -> None:
    """Jev and the keyword rules against the hand labels; no labels change after this."""
    sample = {s["host"]: s for s in json.load(open(HERE / "calib_sample.json"))}
    gold = json.load(open(HERE / "calib_gold.json"))
    jev = {g["host"]: g for g in json.load(open(HERE / "calib_jev.json")) if "error" not in g}
    rules = {h: sellers.kind_by_rules(s) for h, s in sample.items()}
    hosts = [h for h in gold if h in jev]
    def acc(pred): return sum(pred[h] == gold[h]["kind"] for h in hosts) / len(hosts)
    print(f"n={len(hosts)}  kind accuracy: Jev {acc({h: jev[h]['kind'] for h in hosts}):.0%}, keyword rules {acc(rules):.0%}")
    for name, pred in (("Jev", {h: jev[h]["kind"] for h in hosts}), ("rules", rules)):
        sw_pred = {h for h in hosts if pred[h] == "ai"}
        sw_gold = {h for h in hosts if gold[h]["kind"] == "ai"}
        tp = len(sw_pred & sw_gold)
        print(f"  {name}: software precision {tp / max(1, len(sw_pred)):.0%}, recall {tp / max(1, len(sw_gold)):.0%}")
    truth = {h: gold[h]["ai"] for h in hosts}
    def yes(v): return v is True or v == "true" or (isinstance(v, (int, float)) and not isinstance(v, bool) and v >= 0.5)
    jai = {h: yes(jev[h]["ai"]) for h in hosts}
    kw = {h: bool(__import__("re").search(r"\b(ai|gpt|llm|agents?|copilot|mcp|claude|openai)\b",
                                          f"{sample[h]['title']} {sample[h]['description']}".lower())) for h in hosts}
    for name, pred in (("Jev", jai), ("AI keywords", kw)):
        tp = sum(pred[h] and truth[h] for h in hosts)
        fp = sum(pred[h] and not truth[h] for h in hosts)
        fn = sum(truth[h] and not pred[h] for h in hosts)
        print(f"  AI flag {name}: accuracy {sum(pred[h] == truth[h] for h in hosts) / len(hosts):.0%}, "
              f"precision {tp / max(1, tp + fp):.0%}, recall {tp / max(1, tp + fn):.0%}")
    from collections import Counter
    miss = Counter((gold[h]["kind"], jev[h]["kind"]) for h in hosts if jev[h]["kind"] != gold[h]["kind"])
    print("  Jev disagreements (label -> Jev):", dict(miss.most_common(8)))


def run(limit: int | None) -> None:
    db = sqlite3.connect(DB, timeout=60)
    cols = {r[1] for r in db.execute("PRAGMA table_info(sites)")}
    if "ai" not in cols:
        db.execute("ALTER TABLE sites ADD COLUMN ai INTEGER")
    rows = [{"host": h, "title": t or "", "description": d or ""} for h, t, d in db.execute(
        "SELECT host, max(title), max(description) FROM sites WHERE pays = 1 AND (kind IS NULL OR kind_by = 'rules') "
        "AND (title != '' OR description != '') GROUP BY host ORDER BY max(first_seen) DESC")][:limit]
    client, done, failed, t0, pending = OpenRouter(), 0, 0, time.time(), []

    def flush() -> None:      # short transactions: the page reader writes to the same file
        db.executemany("UPDATE sites SET kind = ?, kind_by = 'jev', ai = ? WHERE host = ?", pending)
        db.commit()
        pending.clear()
    with ThreadPoolExecutor(WORKERS) as pool:
        for g in pool.map(lambda r: ask(client, r), rows):
            if "error" in g or g.get("kind") not in sellers.KINDS:
                failed += 1
                continue
            ai = g["ai"] is True or g["ai"] == "true" or (isinstance(g["ai"], (int, float)) and not isinstance(g["ai"], bool) and g["ai"] >= 0.5)
            pending.append((g["kind"], int(ai), g["host"]))
            done += 1
            if len(pending) >= 100:
                flush()
            if done % 1000 == 0:
                print(f"jev {done:,}/{len(rows):,} sites, {failed:,} failed, {client.tokens:,} tokens, "
                      f"{(time.time() - t0) / 60:.0f} min", file=sys.stderr, flush=True)
    flush()
    print(f"jev done: {done:,} sorted, {failed:,} failed, {client.tokens:,} tokens, {(time.time() - t0) / 60:.0f} min")


if __name__ == "__main__":
    cmd = sys.argv[1] if len(sys.argv) > 1 else "calibrate"
    if cmd == "calibrate":
        calibrate()
        agreement()
    elif cmd == "agreement":
        agreement()
    else:
        run(int(sys.argv[2]) if len(sys.argv) > 2 else None)
