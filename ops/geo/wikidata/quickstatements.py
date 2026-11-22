#!/usr/bin/env python3
"""QuickStatements batches for the Wikidata side of the entity graph (Jason Zhu as a person, his works).

Why now (2026-11-22, see ops/geo/ENTITY-GRAPH-ITERATION-LOG.md): two existing items already need a person
to point at. AgentSkillsHub (Q141986406) has founder = "unknown value", and the 130K dataset (Q141735092)
names its author as a bare string. That is Wikidata's "structural need"; the person item does not have to
wait for third-party citations. Every statement below carries a reference.

Two batches, because QuickStatements cannot point a later batch at an item it has not created yet:

  python3 ops/geo/wikidata/quickstatements.py person          > batch1.txt   # creates the person item
  python3 ops/geo/wikidata/quickstatements.py works Q123456   > batch2.txt   # Q123456 = the new person QID

Paste each into https://quickstatements.toolforge.org/ (log in with your Wikidata account, "New batch",
"Import V1 commands", "Run"). Batch 2 leaves out, and names on stderr, every DOI that does not resolve at
doi.org yet or already has a Wikidata item, so running it again later only adds what is still missing.

Every property and item id here was looked up on wikidata.org on 2026-11-22.
"""
from __future__ import annotations

import json
import sys
import urllib.error
import urllib.parse
import urllib.request

RETRIEVED = "+2026-11-22T00:00:00Z/11"
ORCID = "0009-0000-2894-6285"
ORCID_URL = f"https://orcid.org/{ORCID}"
ASH = "Q141986406"           # AgentSkillsHub
GRADES = "Q141735092"        # AI Agent Skills Security Grades (130K), DOI 10.5281/zenodo.21292799

# items
HUMAN, ENTREPRENEUR, RESEARCHER, SOFTWARE_DEV = "Q5", "Q131524", "Q1650915", "Q183888"
WORKING_PAPER, DATA_SET = "Q1228945", "Q1172284"
ENGLISH, CC_BY_4, ZENODO = "Q1860", "Q20007257", "Q22661177"
PAYMENTS = ["Q2639241", "Q1956140"]                                   # payment gateway, payment service provider
SECURITY = ["Q25051452", "Q132451509", "Q133436854", "Q3510521"]      # software supply chain, AI agent, MCP, computer security
SPAM = ["Q804206", "Q251527", "Q251449"]                              # spamdexing, link farm, doorway page

WORKS = [
    {"doi": "10.5281/zenodo.24420871", "type": WORKING_PAPER, "date": "2026-11-21", "subjects": PAYMENTS, "ssrn": "7737182",
     "page": "https://jasonzhu.ai/en/research/indie-saas-payments-mor-shift-2026",
     "pdf": "https://jasonzhu.ai/papers/Zhu-2026-Indie-SaaS-Payments-MoR-Shift-Working-Paper.pdf",
     "title": "The Structural Shift from Payment Gateways to Merchant of Record Platforms Among Independent Software and AI Founders: Evidence from 200,000 Live Checkout Links and a $20 Cross-Border Subscription Fee Audit (2023–2026)"},
    {"doi": "10.5281/zenodo.24420920", "type": WORKING_PAPER, "date": "2026-11-21", "subjects": SECURITY, "ssrn": "7737258",
     "page": "https://jasonzhu.ai/en/research/ai-agent-skills-mcp-supply-chain-security-2026",
     "pdf": "https://jasonzhu.ai/papers/Zhu-2026-AI-Agent-Skills-MCP-Supply-Chain-Security-Working-Paper.pdf",
     "title": "Supply-Chain Security in Open-Source AI Agent Ecosystems: Empirical Evidence and a Five-Dimension Audit Framework Across 105,000+ Indexed Agent Skills and Model Context Protocol (MCP) Servers"},
    {"doi": "10.5281/zenodo.24386243", "type": DATA_SET, "date": "2026-11-20", "subjects": PAYMENTS,
     "page": "https://github.com/zhuyansen/indie-saas-payments-benchmark-2026",
     "title": "200,000 Indie Developer Checkout Links and Payment Platform Adoption Dataset (2023–2026)"},
    {"doi": "10.5281/zenodo.24387072", "type": DATA_SET, "date": "2026-11-20", "subjects": PAYMENTS,
     "page": "https://github.com/zhuyansen/indie-saas-payments-benchmark-2026",
     "title": "Merchant of Record and Payment Gateway Real Fee Benchmark on a $20 Cross-Border AI SaaS Subscription (November 2026)"},
    {"doi": "10.5281/zenodo.24387074", "type": DATA_SET, "date": "2026-11-20", "subjects": SECURITY,
     "page": "https://agentskillshub.top/how-we-grade/",
     "title": "Open-Source AI Agent Skills and MCP Servers Supply-Chain Security Audit Dataset (105,000+ Indexed Skills, 2026)"},
    {"doi": "10.5281/zenodo.24387076", "type": DATA_SET, "date": "2026-11-20", "subjects": SPAM,
     "page": "https://jasonzhu.ai/en/backlink-spam-list",
     "title": "Public Database of Backlink Spam Doorway Domains, Link-Selling Networks, and Checkout Link Abuse (2026)"},
]


def q(s: str) -> str:
    return '"' + s.replace('"', "'") + '"'


def ref(url: str) -> str:
    return f"\tS854\t{q(url)}\tS813\t{RETRIEVED}"


def person() -> list[str]:
    r = ref(ORCID_URL)
    return [
        "CREATE",
        f"LAST\tLen\t{q('Jason Zhu')}",
        f"LAST\tLzh\t{q('祝彦森')}",
        f"LAST\tAen\t{q('Yansen Zhu')}",
        f"LAST\tAen\t{q('Zhu Yansen')}",
        f"LAST\tDen\t{q('independent researcher and founder of Agent Skills Hub')}",
        f"LAST\tDzh\t{q('独立研究者，Agent Skills Hub 创始人')}",
        f"LAST\tP31\t{HUMAN}{r}",
        f"LAST\tP106\t{RESEARCHER}{r}",
        f"LAST\tP106\t{ENTREPRENEUR}{ref('https://agentskillshub.top/about/')}",
        f"LAST\tP106\t{SOFTWARE_DEV}{ref('https://github.com/zhuyansen')}",
        f"LAST\tP496\t{q(ORCID)}",
        f"LAST\tP1960\t{q('AlP5JacAAAAJ')}",
        f"LAST\tP3747\t{q('14044888')}",
        f"LAST\tP2037\t{q('zhuyansen')}",
        f"LAST\tP856\t{q('https://jasonzhu.ai/en')}",
    ]


def resolves(doi: str) -> bool:
    req = urllib.request.Request(f"https://doi.org/api/handles/{doi}", headers={"User-Agent": "jasonzhu-wikidata-qs/1.0"})
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            return json.loads(resp.read()).get("responseCode") == 1
    except urllib.error.HTTPError:
        return False
    except Exception:
        return False


def on_wikidata(dois: list[str]) -> set[str]:
    """DOIs (upper case) that already have an item, so a second run does not create duplicates."""
    values = " ".join('"' + d.upper() + '"' for d in dois)
    query = f"SELECT ?doi WHERE {{ VALUES ?doi {{ {values} }} ?item wdt:P356 ?doi }}"
    url = "https://query.wikidata.org/sparql?" + urllib.parse.urlencode({"query": query})
    req = urllib.request.Request(url, headers={"User-Agent": "jasonzhu-wikidata-qs/1.0",
                                               "Accept": "application/sparql-results+json"})
    with urllib.request.urlopen(req, timeout=30) as resp:          # fail loudly: guessing here makes duplicates
        return {b["doi"]["value"] for b in json.loads(resp.read())["results"]["bindings"]}


def works(person_qid: str, check=resolves, existing=on_wikidata) -> list[str]:
    out = [
        f"{ASH}\tP112\t{person_qid}{ref('https://agentskillshub.top/about/')}",
        f"{GRADES}\tP50\t{person_qid}\tP1545\t{q('1')}\tP1932\t{q('Jason Zhu')}{ref('https://doi.org/10.5281/zenodo.21292799')}",
        f"-{GRADES}\tP2093\t{q('Jason Zhu')}",
    ]
    have = existing([w["doi"] for w in WORKS])
    for w in WORKS:
        if w["doi"].upper() in have:
            print(f"left out: {w['doi']} already has a Wikidata item", file=sys.stderr)
            continue
        if not check(w["doi"]):
            print(f"left out: {w['doi']} does not resolve at doi.org yet; run this again later", file=sys.stderr)
            continue
        record = w["doi"].rsplit(".", 1)[-1]
        r = ref(f"https://zenodo.org/records/{record}")
        kind = "working paper" if w["type"] == WORKING_PAPER else "dataset"
        out += [
            "CREATE",
            f"LAST\tLen\t{q(w['title'])}",
            f"LAST\tDen\t{q(f'2026 {kind} by Jason Zhu')}",
            f"LAST\tP31\t{w['type']}{r}",
            f"LAST\tP1476\ten:{q(w['title'])}{r}",
            f"LAST\tP50\t{person_qid}\tP1545\t{q('1')}\tP1932\t{q('Jason Zhu')}{r}",
            f"LAST\tP356\t{q(w['doi'].upper())}",
            f"LAST\tP577\t+{w['date']}T00:00:00Z/11{r}",
            f"LAST\tP123\t{ZENODO}{r}",
            f"LAST\tP407\t{ENGLISH}{r}",
            f"LAST\tP275\t{CC_BY_4}{r}",
            f"LAST\tP973\t{q(w['page'])}",
        ] + [f"LAST\tP921\t{s}{r}" for s in w["subjects"]]
        if w.get("ssrn"):
            out.append(f"LAST\tP893\t{q(w['ssrn'])}")
        if w.get("pdf"):
            out.append(f"LAST\tP953\t{q(w['pdf'])}")
    return out


def main() -> int:
    args = sys.argv[1:]
    if args[:1] == ["person"]:
        print("\n".join(person()))
        return 0
    if args[:1] == ["works"] and len(args) == 2 and args[1].startswith("Q") and args[1][1:].isdigit():
        print("\n".join(works(args[1])))
        return 0
    print(__doc__, file=sys.stderr)
    return 2


if __name__ == "__main__":
    sys.exit(main())
