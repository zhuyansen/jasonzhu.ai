#set document(
  title: "Supply-Chain Security in Open-Source AI Agent Ecosystems: Security-Grade Coverage in a June 2026 Snapshot of 105,000+ Agent Skills and MCP Servers, and a Five-Dimension Review Checklist",
  author: "Jason Zhu (Yansen Zhu)",
  keywords: ("AI Agent Security", "Model Context Protocol", "MCP Servers", "Supply Chain Security", "Claude Skills", "Static Analysis", "AgentSkillsHub"),
  date: datetime(year: 2026, month: 11, day: 21),
)

#set page(
  paper: "us-letter",
  margin: (top: 0.95in, bottom: 0.95in, left: 1.0in, right: 1.0in),
  header: context {
    if counter(page).get().first() > 1 [
      #set text(size: 8.5pt, fill: luma(100), style: "italic")
      Zhu (2026) — Supply-Chain Security in Open-Source AI Agent Skills & MCP Ecosystems
      #h(1fr)
      Working Paper
      #v(-4pt)
      #line(length: 100%, stroke: 0.4pt + luma(190))
    ]
  },
  footer: context {
    set text(size: 8.5pt, fill: luma(100))
    line(length: 100%, stroke: 0.4pt + luma(200))
    v(-4pt)
    [ORCID: 0009-0000-2894-6285 · AgentSkillsHub (agentskillshub.top) / JasonZhu.AI]
    h(1fr)
    [Page #counter(page).display("1 of 1", both: true)]
  }
)

#set text(
  font: ("New Computer Modern", "Libertinus Serif", "Georgia", "Times New Roman"),
  size: 10.5pt,
  lang: "en",
)

#set par(justify: true, leading: 0.62em, spacing: 0.95em)
#set heading(numbering: "1.1.")
#show heading.where(level: 1): it => {
  v(1.1em, weak: true)
  set text(size: 12.5pt, weight: "bold")
  block(breakable: false, it)
  v(0.45em, weak: true)
}
#show heading.where(level: 2): it => {
  v(0.85em, weak: true)
  set text(size: 11pt, weight: "bold")
  block(breakable: false, it)
  v(0.35em, weak: true)
}
#show link: set text(fill: rgb("#1d4ed8"))

// Title Block
#align(center)[
  #set text(hyphenate: false)
  #text(size: 8.5pt, tracking: 0.08em, fill: luma(90), weight: "semibold")[
    EMPIRICAL WORKING PAPER · AI SYSTEMS SECURITY & SOFTWARE SUPPLY CHAINS
  ]
  #v(0.5em)
  #text(size: 16pt, weight: "bold")[
    Supply-Chain Security in Open-Source AI Agent Ecosystems
  ]
  #v(0.3em)
  #text(size: 11.5pt, style: "italic", fill: luma(60))[
    Security-Grade Coverage in a June 2026 Snapshot of 105,000+ Agent Skills and Model Context Protocol (MCP) Servers, and a Five-Dimension Review Checklist
  ]
  #v(0.9em)
  #text(size: 11pt, weight: "semibold")[Jason Zhu (Yansen Zhu)] \
  #text(size: 9.5pt, fill: luma(70))[
    Founder & Independent Researcher, Agent Skills Hub (BRICKAI / GoSailGlobal LLC) & JasonZhu.AI \
    ORCID: #link("https://orcid.org/0009-0000-2894-6285")[0009-0000-2894-6285] ·
    Email: #link("mailto:hello@gosailglobal.com")[hello\@gosailglobal.com] ·
    Web: #link("https://agentskillshub.top")[agentskillshub.top]
  ]
  #v(0.4em)
  #text(size: 9pt, fill: luma(95))[
    Version 1.1 · November 21, 2026 (corrects version 1.0; see the revision note) · Data:
    #link("https://doi.org/10.5281/zenodo.24387073")[10.5281/zenodo.24387073] &
    #link("https://doi.org/10.5281/zenodo.21292799")[10.5281/zenodo.21292799]
  ]
]

#v(0.6em)

// Abstract
#block(
  width: 100%,
  inset: (x: 14pt, y: 11pt),
  fill: luma(248),
  stroke: (top: 0.8pt + luma(140), bottom: 0.8pt + luma(140)),
)[
  #align(center)[#text(size: 10pt, weight: "bold", tracking: 0.05em)[ABSTRACT]]
  #v(0.35em)
  #set text(size: 9.6pt)
  #set par(leading: 0.56em)
  Autonomous coding agents—including Claude Code, OpenAI Codex, and Cursor—increasingly rely on community-authored "skills" (instruction manifests paired with helper scripts) and Model Context Protocol (MCP) servers installed directly from GitHub. Unlike conventional package managers, agent skills execute with the host agent's full filesystem permissions, shell access, and live API credentials, yet public marketplaces rank packages almost exclusively by GitHub star counts rather than security posture. Using the Agent Skills Hub catalog (agentskillshub.top), which the author founded, we report how much of this ecosystem carried any security grade. In a snapshot taken around 10 June 2026 the catalog held 105,000+ entries and *97.8%* of them had no security grade; of the 2,300+ entries that had one, 94% were graded safe and about *5.6%* caution, unsafe or reject. Coverage has grown since: on 21 November 2026 the catalog listed 281,000+ entries, 142,000+ of them with a rule-based grade, so the June share describes that snapshot only. In a separate snapshot of 6 July 2026 (130,173 entries; DOI 10.5281/zenodo.21292799), the 21,582 repositories with at least 5 GitHub stars were graded by static rules: 3.3% (about *1 in 30*) received an `UNSAFE` or `REJECT` grade, and that rate was 3.8% for repositories with 5–20 stars against 0.4% for those with 1,000+ stars. We also set out the five-dimension checklist—Code Layer, Credential Handling, Vendor Provenance, Dependency Supply Chain, and Operational Risk—that the author used to review 200+ repositories by hand, and three case studies from that review showing why GitHub stars are a weak proxy for both security and engineering quality. The grading rules and data snapshots are published under CC-BY-4.0.
  #v(0.45em)
  #text(size: 9pt)[
    *Keywords:* AI Agent Security, Model Context Protocol (MCP), Claude Skills, Software Supply Chain, Static Analysis, Credential Governance, Prompt Injection, AgentSkillsHub. \
    *ACM CCS:* Security and privacy → Software and application security; Software and its engineering → Software libraries and repositories; Computing methodologies → Artificial intelligence.
  ]
]

#text(size: 8.8pt, fill: luma(60))[*Revision note (version 1.1, 21 November 2026).* Version 1.0 gave the 105,000-entry catalog and its 97.8% ungraded share without a date; they date from around 10 June 2026, and the catalog count of 21 November 2026 now stands beside them. Version 1.0 also listed counts per grade group (102,690 / 2,171 / 129) that had been worked back from rounded percentages, described the 2,300+ graded entries as a five-dimension audit, described the November 2026 count of graded entries (138,000+) as the number indexed, and named a recurring pattern (typosquatted forks) that no data supports. These are corrected or removed; the findings from the July 2026 snapshot now cite its dataset card.]

#v(0.5em)

= Introduction

The rapid adoption of tool-using coding agents in 2025–2026 has created a new software distribution tier situated between natural-language prompts and executable software packages. An "agent skill" (such as a `SKILL.md` bundle paired with shell or Python scripts) or a Model Context Protocol (MCP) server grants an LLM agent direct capabilities to read repositories, execute terminal commands, query cloud APIs, and post to external services.

Historically, mature software ecosystems (npm, PyPI, Maven Central, Homebrew) developed layered supply-chain defenses over decades: signed releases, automated vulnerability advisories, typosquatting detectors, lockfile integrity hashes, and security scorecards. By contrast, the emerging AI agent skill ecosystem distributes executable logic and privileged prompt instructions primarily through unverified GitHub repositories, raw `curl | sh` installation commands, and popularity-sorted web directories.

This asymmetry creates a dangerous blind spot. When a developer installs a third-party skill or MCP server on a workstation or CI runner, the extension typically inherits access to `~/.ssh`, `~/.aws`, local `.env` files, active browser cookies, and GitHub tokens. Despite this privilege footprint, users overwhelmingly evaluate skills using superficial heuristics—README polish and GitHub star counts.

In this paper, we treat open-source AI agent skills and MCP servers as first-class *software supply-chain dependencies*. Using data collected by Agent Skills Hub (`agentskillshub.top`, launched March 8, 2026 and refreshing GitHub repositories every eight hours), we address three empirical questions:
+ What share of the public AI agent skill and MCP ecosystem has *any* security grade, and what share of graded repositories is flagged?
+ Which concrete threat classes—ranging from code-level shell execution to remote OAuth token custody—appear in real-world skills, and why does static code inspection alone miss critical enterprise risks?
+ How strongly do GitHub star counts correlate with actual security posture and engineering quality?

= Ecosystem Census and Audit Methodology

== Catalog Scope and Dual-Snapshot Architecture

Our analysis draws on two catalog snapshots and one manual review:
+ *June 2026 coverage snapshot (DOI: 10.5281/zenodo.24387073):* the share of the catalog (105,000+ entries, read around 10 June 2026) with and without a security grade, and the grade outcomes for the 2,300+ entries that had one. The same record gives the catalog count on 21 November 2026: 281,000+ entries, 142,000+ of them with a rule-based grade.
+ *July 2026 graded snapshot (DOI: 10.5281/zenodo.21292799; Wikidata Q141735092):* 130,173 open-source skills and MCP servers as of 6 July 2026. The 21,582 repositories with at least 5 GitHub stars were graded by the Hub's static rules (the published rule set, `agentskillshub.top/how-we-grade/`, had 44 rules by November 2026), and each entry carries a quality score (0–100).
+ *Manual review:* the author reviewed 200+ repositories by hand with the five-dimension checklist below. Section 4 reports three cases from it. These reviews are not part of the grade statistics.

== Five-Dimension Supply-Chain Audit Framework

Static scanning for obfuscated payloads catches overt malware, but fails to evaluate whether an extension is safe for production teams. We therefore formalize a five-layer evaluation rubric (Table 1) spanning technical execution, credential custody, maintainer accountability, transitive dependencies, and operational blast radius.

#figure(
  table(
    columns: (1.1fr, 2.3fr, 1.3fr),
    align: (left, left, left),
    stroke: none,
    table.hline(stroke: 1pt),
    table.header(
      [*Audit Layer*], [*Core Security Questions & Checks*], [*Primary Failure Modes*]
    ),
    table.hline(stroke: 0.5pt),
    [1. Code Layer], [Static inspection for obfuscation, dynamic `eval`/`exec`, undeclared network calls, runtime remote script downloads (`curl | sh`), and hidden prompt-override directives in `SKILL.md`.], [Arbitrary command execution; prompt injection; undeclared telemetry],
    [2. Credential Handling], [Scope of requested secrets (`.env`, `~/.ssh`, `~/.aws`, OAuth scopes) and storage locality (strictly local encrypted/env vs. transmitted to third-party servers).], [Remote OAuth custody; overly broad API token scopes; secret exfiltration],
    [3. Vendor Provenance], [Maintainer identity verification: established organization or named individual with verifiable track record vs. anonymous zero-follower account; license clarity.], [Flight risk; zero legal accountability; silent repository ownership transfer],
    [4. Dependency Supply Chain], [Transitive package hygiene, pinned versions/SHAs, typosquatting checks, archived/deleted upstream dependencies, and star-inflation anomalies.], [Stale forks swapping API endpoints; hijacked transitive packages],
    [5. Operational Risk], [Availability, breach blast radius, compliance guarantees (DPA/SOC2), audit logging, and graceful degradation if an upstream backend fails or changes pricing.], [Silent account takeover of brand assets; unlogged agent actions],
    table.hline(stroke: 1pt),
  ),
  caption: [Five-dimension supply-chain audit framework applied to open-source AI agent skills and MCP servers.],
) <tab-five-dims>

Let $S_i in {"SAFE", "CAUTION", "UNSAFE", "REJECT", "UNAUDITED"}$ denote the assigned security grade for skill $i$. Automated rule scanning maps deterministic triggers—such as unguarded remote shell execution, unprompted credential exfiltration, destructive filesystem operations, or explicit safety-bypass prompt injections—to red-flag identifiers $R_i$. Importantly, *a clean Layer-1 code scan is necessary but not sufficient for production certification*: a skill with zero malicious lines of code can still receive a `CAUTION` or `UNSAFE` operational verdict if Layers 2, 3, and 5 expose user credentials to unverified remote servers.

= Quantitative Findings: Grade Coverage and Grade Outcomes

== Audit Coverage and Flag Distribution

In the June 2026 snapshot, the striking finding was not that many skills were malicious but that *almost none had been checked at all* (Table 2).

#figure(
  table(
    columns: (1.8fr, 1.0fr, 1.35fr),
    align: (left, right, right),
    stroke: none,
    table.hline(stroke: 1pt),
    table.header(
      [*Security grade (catalog, around 10 June 2026)*], [*Share of catalog*], [*Share of graded entries*]
    ),
    table.hline(stroke: 0.5pt),
    [*No security grade ("unknown")*], [*97.8%*], [—],
    [Safe], [2.1%], [94%],
    [Caution / Unsafe / Reject], [0.1%], [about 5.6%],
    table.hline(stroke: 0.5pt),
    [*Catalog size*], [*105,000+ entries*], [*2,300+ graded*],
    table.hline(stroke: 1pt),
  ),
  caption: [Security grades in the Agent Skills Hub catalog around 10 June 2026, as published at the time (DOI: 10.5281/zenodo.24387073). Shares are rounded as published; counts per group were not recorded. On 21 November 2026 the catalog listed 281,000+ entries, 142,000+ of them with a rule-based grade.],
) <tab-audit-dist>

Two further sets of figures come from the snapshots:
+ *Grade outcomes, June 2026:* among the 2,300+ entries that had a grade, 94% were safe and about *5.6%* caution, unsafe or reject. These are catalog grades, not results of the five-dimension review.
+ *Long-tail risk, July 2026:* in the 130,173-entry snapshot (DOI: 10.5281/zenodo.21292799), 711 of the 21,582 graded repositories (3.3%, about *1 in 30*) received an `UNSAFE` or `REJECT` grade, and 108,591 entries (83%) were below the 5-star threshold and ungraded. The `UNSAFE`/`REJECT` rate was 3.8% for repositories with 5–20 stars, 3.7% for 20–100, 0.9% for 100–1,000 and 0.4% for 1,000+ stars: about nine times higher in the long tail than at the head. The most common red flags were `sudo` usage (1,146 entries), service persistence (327), `curl | sh` pipes (238), agent-configuration theft (155) and tunnel services (137). Source: the dataset card of 10.5281/zenodo.21292799 (Hugging Face mirror).

== Recurring Vulnerability Taxonomy

In the manual review, three patterns recurred (qualitative observations, not counts):
+ *Unscoped shell and filesystem hooks:* Setup or runtime scripts executing remote payloads or silently harvesting `~/.aws`, `~/.ssh`, or project `.env` files without explicit scope declarations.
+ *Prompt-injection directives embedded in Markdown:* Long `SKILL.md` instruction files containing hidden system-override directives instructing the agent to bypass user confirmation gates or exfiltrate context summaries.
+ *Remote credential custody without vendor accountability:* Clean local client wrappers that proxy authentication through an anonymous maintainer's hosted backend (examined in Case A below).

= Empirical Case Studies: Why Stars Fail as a Security and Quality Signal

Quantitative rates alone understate why traditional GitHub popularity signals break down in agent ecosystems. Below we summarize three audited real-world repositories representing distinct corners of the quality-versus-popularity matrix (Table 3).

#figure(
  table(
    columns: (1.1fr, 0.85fr, 1.1fr, 1.1fr, 1.25fr),
    align: (left, left, left, left, left),
    stroke: none,
    table.hline(stroke: 1pt),
    table.header(
      [*Case Study*], [*GitHub Stars*], [*Layer 1 (Code)*], [*Layers 2–5 (Ops/Creds)*], [*Audit Verdict*]
    ),
    table.hline(stroke: 0.5pt),
    [Case A: Social Media Scheduler Skill], [Thousands (high)], [Clean; 0 runtime deps; MIT license], [*Critical risk:* OAuth tokens stored on anonymous maintainer's server], [*Not production-ready* for brand/business accounts],
    [Case B: Niche Research Workflow Skill], [0 stars (unpromoted)], [8 KB engineering-grade `SKILL.md` rubric], [Zero remote deps; strictly local execution], [*High quality;* discoverability failure, not quality failure],
    [Case C: Alibaba Cloud ECS Security Suite], [Official org], [51 analyzers + 10 collectors; 88 kernel CVE checks], [Verified enterprise org; Apache 2.0; 103+ MITRE ATT&CK mappings], [*Enterprise reference benchmark*],
    table.hline(stroke: 1pt),
  ),
  caption: [Summary of three representative five-dimension skill audits illustrating the decoupling between GitHub star counts, static code cleanliness, and enterprise production readiness.],
) <tab-cases>

== Case A: Clean Code, Catastrophic Operational Risk

We audited a widely starred open-source social-media scheduling skill featuring thorough documentation, polished demo videos, an MIT license, and zero suspicious runtime dependencies. Under conventional code-only scanning or star-based marketplace ranking, this repository would receive top marks.

Inspection of *Layer 2 (Credential Handling)* and *Layer 3/5 (Vendor Provenance & Operational Risk)*, however, revealed a critical architectural hazard: every social-media account connected through the skill stored its OAuth tokens *remotely on the maintainer's private server* rather than locally. Furthermore, the maintainer operated under an anonymous handle with no legal entity, no Data Processing Agreement (DPA), and no incident-response commitment. Compromise of that single third-party server would grant an attacker immediate posting privileges across every connected user and corporate brand account.

*Takeaway:* "Works smoothly and passes static code checks" is fundamentally distinct from "safe for production credentials."

== Case B: Zero Stars, High Engineering Rigor

Conversely, manual auditing uncovered a 0-star repository that most popularity-sorted directories bury invisibly. Opening its `SKILL.md` revealed an 8 KB engineering specification encoding explicit anti-hallucination hierarchy rules directly at the top of the prompt:

#quote(block: true)[
  *No hallucination > No misreading of source material > Mechanism clarity > Readability > Relevance of examples > Virality of phrasing.*
]

Its zero-star status resulted purely from an unremarkable repository name, Chinese-only documentation, and zero social-media marketing—a *discoverability failure*, not an engineering failure. It was not the only case in the manual review where a little-known specialist skill was better engineered than far more popular prompt wrappers (an observation, not a count).

== Case C: Enterprise-Grade Reference Architecture

At the upper end of the rigor spectrum, we audited an official Alibaba Cloud Elastic Compute Service (ECS) troubleshooting and security skill suite. Unlike prompt-only wrappers that merely invoke `nmap`, this suite ships *51 specialized security analyzers*, *10 telemetry collectors* (covering processes, networking, authentication, persistence, rootkits, memory forensics, and container escapes), mappings to *103+ MITRE ATT&CK techniques*, and *88 kernel CVE detectors* paired with an automated CTF verification harness—maintained under Apache 2.0 by a verified enterprise security organization.

The gap between Case C and typical viral wrapper skills spans orders of magnitude in engineering investment, yet current agent ecosystems label both identically as a "skill."

= Governance Recommendations for Engineering Teams

Based on our empirical audit findings, organizations deploying Claude Code, Cursor, or Codex across engineering workstations should adopt four concrete supply-chain controls:

+ *Ban floating `main`-branch installs; pin immutable commit SHAs:* Treat every skill and MCP server like a production npm/PyPI dependency—pin exact Git commit SHAs and mirror approved versions into an internal organization fork.
+ *Enforce local-only credential boundaries:* Prohibit skills that transmit OAuth tokens, `.env` secrets, or SSH keys to third-party relays unless backed by a legally accountable vendor with a signed DPA and audit logs.
+ *Run automated pre-install CI gates:* Integrate deterministic static security checks (such as Agent Skills Hub's open 44-rule scanner or `@agentskillshub/cli` / `@agentskillshub/mcp`) into developer onboarding and repository CI pipelines to block `UNSAFE` and `REJECT` patterns before execution.
+ *Decouple quality discovery from star counts:* Require explicit review of maintainer provenance, maintenance recency, and multi-dimension quality scores rather than relying on viral social-media posts or raw GitHub stars.

= Limitations and Future Work

Four limitations apply. First, our automated rule scanner (`agentskillshub.top/how-we-grade/`) serves as a *first-layer deterministic filter*, not a substitute for line-by-line human penetration testing; zero static flags cannot guarantee the absence of subtle logic bugs or delayed server-side rug pulls. Second, dynamic runtime sandboxing (observing outbound syscalls and network packets inside ephemeral containers during live agent execution) is not run across the 281,000+ indexed repositories (21 November 2026) and remains future work. Third, because GitHub repositories evolve continuously, point-in-time Zenodo snapshots represent fixed historical baselines while live scores update on an 8-hour crawl cadence. Fourth, the June 2026 shares were read once from the catalog for a blog post; the exact time was not recorded and counts per group were not kept.

= Conclusion and Data Availability

Open-source AI agent skills and MCP servers have scaled faster than the security tooling needed to govern them. With *97.8%* of the catalog ungraded in June 2026, about *5.6%* of graded entries flagged, a far higher `UNSAFE`/`REJECT` rate in the low-star long tail, and GitHub stars failing to distinguish clean-code credential traps from enterprise-grade tools, the ecosystem needs an open, transparent trust layer. By publishing the grading rules and CC-BY-4.0 data snapshots on Zenodo (with mirrors on Hugging Face and Kaggle), we aim to give security researchers and AI engineering teams baselines they can check.

#v(0.4em)
*Open Data, Code & Persistent Identifiers (CC-BY-4.0):*
- *June 2026 coverage snapshot (Zenodo):* #link("https://doi.org/10.5281/zenodo.24387073")[https://doi.org/10.5281/zenodo.24387073]
- *July 2026 graded snapshot, 130,173 entries (Zenodo):* #link("https://doi.org/10.5281/zenodo.21292799")[https://doi.org/10.5281/zenodo.21292799]
- *Wikidata Knowledge Graph Entities:* Platform #link("https://www.wikidata.org/wiki/Q141986406")[Q141986406] · Dataset #link("https://www.wikidata.org/wiki/Q141735092")[Q141735092]
- *Hugging Face Dataset Mirror:* #link("https://huggingface.co/datasets/jasonzhuyansen/agent-skills-security-grades")[https://huggingface.co/datasets/jasonzhuyansen/agent-skills-security-grades]
- *Kaggle Dataset Mirror:* #link("https://www.kaggle.com/datasets/yansenzhu/agent-skills-security-grades")[https://www.kaggle.com/datasets/yansenzhu/agent-skills-security-grades]
- *Public Grading Methodology & Live Trust Layer:* #link("https://agentskillshub.top/how-we-grade/")[https://agentskillshub.top/how-we-grade/] · #link("https://jasonzhu.ai/en/blog/agent-skill-security-audit-200")[https://jasonzhu.ai/en/blog/agent-skill-security-audit-200]
- *Author Persistent Identifiers:* ORCID #link("https://orcid.org/0009-0000-2894-6285")[0009-0000-2894-6285] · Google Scholar #link("https://scholar.google.com/citations?user=AlP5JacAAAAJ")[AlP5JacAAAAJ]

#set heading(numbering: none)
= References

#set text(size: 9.2pt)
#set par(hanging-indent: 1.5em, leading: 0.55em, spacing: 0.55em)

Alibaba Cloud Security. (2026). *Official ECS Troubleshooting and Security Analysis Skill Suite (Apache 2.0)*. GitHub Open-Source Release.

Anthropic. (2025). *Model Context Protocol (MCP) Specification and Claude Code Skills Architecture*. https://modelcontextprotocol.io

Greshake, K., Abdelnabi, S., Mishra, S., Endres, C., Holz, T., & Fritz, M. (2023). Not what you've signed up for: Compromising real-world LLM-integrated applications with indirect prompt injection. *Proceedings of the 16th ACM Workshop on Artificial Intelligence and Security (AISec)*, 79–90.

MITRE Corporation. (2026). *MITRE ATT&CK Enterprise Matrix*. https://attack.mitre.org

Ohm, M., Plate, H., Sykosch, A., & Meier, M. (2020). Backstabber's knife collection: A review of open source software supply chain attacks. *Detection of Intrusions and Malware, and Vulnerability Assessment (DIMVA)*, 23–43.

OpenSSF. (2025). *OpenSSF Scorecard: Security Health Metrics for Open Source Projects*. Linux Foundation. https://securityscorecards.dev

Zhu, J. (2026a). *AI Agent Skills Security Grades (130K)* [Data set]. Zenodo. https://doi.org/10.5281/zenodo.21292799 (Wikidata: Q141735092)

Zhu, J. (2026b). *Security-Grade Coverage in the Agent Skills Hub Catalog: June 2026 Snapshot (105,000+ Entries) and November 2026 Count* (Version 2) [Data set]. Zenodo. https://doi.org/10.5281/zenodo.24387073

Zhu, J. (2026c). *Agent Skills Hub: 44-Rule Automated Security Grading Methodology*. https://agentskillshub.top/how-we-grade/

Zhu, J. (2026d). *Blue Book of Agent Skills 2026*. GitHub. https://github.com/zhuyansen/skill-blue-book
