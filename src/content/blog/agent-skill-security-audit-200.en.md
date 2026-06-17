---
title: "I Audited 200+ Open-Source AI Agent Skills — 97.8% Have Never Had a Security Review"
excerpt: "Who actually reviewed those open-source skills your AI agent installed last week? I put 200+ open-source agent skills through a 5-dimension audit framework and did deep security reviews on a subset. The scariest finding isn't a single number — it's this: out of 100,000+ skills, 97.8% have never been security-audited by anyone."
---

Your AI agent installed a few open-source skills last week.

Who reviewed them?

I did something most people skip: I treated open-source AI agent skills as **supply chain dependencies** and audited them seriously. Not checking star counts or whether the README looks polished — actually digging into whether they ask for your credentials, whether there's anything hidden in the code, who the maintainer is, and whether there's any accountability if something goes wrong.

I went through 200+, doing deep scans on a meaningful subset. Here's what I found — and why I think this is one of the most underrated risks heading into 2026.

---

## The Most Counterintuitive Finding First

Our directory currently indexes **105,000+** open-source agent skills, MCP servers, and Codex skills. When I pulled their security rating distribution, this is what it looked like:

| Security Rating | Share |
| --- | --- |
| **unknown (never reviewed)** | **97.8%** |
| safe (reviewed, no issues) | 2.1% |
| caution / unsafe / reject (flagged) | 0.1% |

Let that sink in.

**The real risk isn't "lots of skills are malicious" — it's "the vast majority of skills are black boxes."** Out of 100,000 skills, 98,000 of them have never had a single security check by anyone, including the people using them. You install them, hand over your API keys, let them run commands in your environment — all based on how nice the README looks.

Among the **2,300+ we've actually rated**, 94% are clean and about 5.6% triggered warnings or rejections. That ratio sounds manageable — but remember, those 2,300 are just the tip of the iceberg. Nobody knows what's in the other 100,000.

---

## The 5 Dimensions I Use

When I audit a skill as a supply chain dependency, I always look at five layers:

1. **Code layer** — Obfuscated code? Suspicious network requests? Does it download and execute external files at runtime?
2. **Credential handling** — What does it ask for? Where are keys stored — locally, or uploaded to a remote server somewhere?
3. **Vendor trustworthiness** — Who's the maintainer? Real name, organization, or an anonymous account with 0 followers? Is there a flight risk?
4. **Supply chain** — What does it depend on? Any typosquatting, deleted upstream packages, or artificially inflated star counts?
5. **Operational risk** — If the service goes down, gets hacked, or jacks up prices, what's your exposure? Are there audit logs for accountability?

Of these five, **the code layer is the easiest to check and the operational layer is the most dangerous to overlook**. The three real-world cases below illustrate exactly that.

---

## Case A: The "Completely Normal" One Is the Most Dangerous

I audited an open-source social media scheduling skill. On the surface it was **impeccable**:

- ✓ Thousands of stars
- ✓ Complete documentation
- ✓ Demo video
- ✓ MIT license

The code itself had no obvious malicious behavior — zero runtime dependencies, clean. By the "check stars and docs" standard, it would score full marks.

But I hit the brakes on **credential handling** and **operational risk**: every social media account you connect through this skill has its OAuth tokens **stored not locally, but on the maintainer's remote server**. And that maintainer is an anonymous account — no real name, no company entity, no DPA, no compliance commitments of any kind.

What does that mean? **If that server is ever compromised, an attacker gains posting access to every platform account you've connected.** A company's brand account could turn into a crypto ad farm overnight. This isn't fear-mongering — it's the inevitable attack surface of combining "remote credential hosting" with "anonymous operation."

**Bottom line: works fine ≠ production-ready.** Fine for a personal throwaway account. Never connect a brand or business account.

---

## Case B: Stars Lie. Audits Don't.

The flip side also surprised me.

I came across a skill with **0 stars** and almost scrolled past it. Then I opened its `SKILL.md` and found 8KB of engineering-grade methodology, with priorities explicitly hardcoded up front:

> No hallucination > No misreading of source material > Mechanism clarity > Readability > Relevance of examples > Virality of phrasing

Only someone who's actually built this and hit the pitfalls writes rules like that. The quality blew most 50,000-star "influencer skills" stitched together from prompt templates completely out of the water.

Why 0 stars? Unfriendly repo name, Chinese-only README, 0-follower author, zero promotion. **Discoverability failure, not quality failure.**

This confirmed something I now believe firmly: **star count is the worst metric for judging a skill.** It measures marketing, not engineering.

---

## Case C: What Enterprise-Grade Actually Looks Like

So what does "good" look like? I audited an ECS troubleshooting skill suite released officially by Alibaba Cloud — it's a useful benchmark:

- **51 security analyzers + 10 data collectors**
- Coverage across processes, networking, authentication, persistence, rootkits, malware, memory forensics, and container escapes
- **Maps to 103+ MITRE ATT&CK techniques**
- 88 kernel CVE detectors with a built-in CTF framework to automatically verify vulnerability reproducibility

Official organization, Apache 2.0, actively maintained. This is something with real security engineering investment behind it — worlds apart from the "prompt wrapper + call Nmap" toys that also get called "skills."

**Two things can both be called a "skill" and be separated by entire orders of magnitude in rigor.** And average users have no tools to tell the difference.

---

## What I'm Doing About It

This is exactly why we built [Agent Skills Hub](https://agentskillshub.top).

It's not "yet another open-source directory." Directories solve "what exists" — they don't solve "what can be trusted." We're building the **trust layer** for agent skills: every skill goes through three dimensions —

- 🟢 **Security**: Static scanning + credential, supply chain, and operational risk assessment
- 🟢 **Quality**: 6-dimension quality scoring, no star dependence
- 🟢 **Maintenance activity**: Still being iterated on, or effectively abandoned

Red flags get flagged. Verified skills get certified. The goal is to slowly turn that 97.8% black box into something checkable, trustworthy, and production-ready.

---

## Three Invitations

**1. Got a skill you're not sure about?**
Drop a GitHub link in the comments and I'll run it through all 5 dimensions. First 10 are free, sorted by popularity.

**2. Are you an official skill maintainer who wants Verified status?**
We're building a Verified Creator / Verified Organization program — official skills that pass the audit get a ✓ badge and featured placement. DM me.

**3. Want to check for yourself?**
Head to [agentskillshub.top](https://agentskillshub.top), search for any skill you're using, and see its scores and flags.

---

Back to the question I opened with: **who actually reviewed those skills your agent installed last week?**

If the answer is "nobody" — now you know where to look.