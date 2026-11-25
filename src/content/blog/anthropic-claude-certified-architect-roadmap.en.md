---
title: "Claude Certified Architect: Who Can Take It, How to Prepare"
excerpt: "Claude certification exams are open only to Claude Partner Network members, and membership is free for organizations bringing Claude to market. The Architect – Foundations exam (CCAR-F) costs $125: 60 questions in 120 minutes, pass mark 720 of 1,000. Who qualifies, the five certifications, what the exam covers, and a free 12-week study plan."
coverImage: "/blog/anthropic-claude-certified-architect-roadmap/cover-en.png"
---

**Short answer (checked November 25, 2026): the Claude Certified Architect exam is open only to members of the Claude Partner Network.** Any organization bringing Claude to market can join for free, so in practice you sit the exam through your employer. The Foundations exam (code CCAR-F) costs $125 and has 60 questions in 120 minutes, proctored online or at a Pearson VUE test center; the pass mark is 720 out of 1,000. The Anthropic Academy courses that prepare you are free for anyone.

> **Updated November 25, 2026.** I first published this in May 2026 as a study roadmap, priced the exam at $99 and wrote as if anyone could book it. Neither holds today: Anthropic opens its exams to partner-network members, and the official exam guide lists a $125 fee. Four course links had also moved. This version follows Anthropic's [exam page and guide](https://anthropic-partners.skilljar.com/claude-certified-architect-foundations-certification) (guide version 1.0, effective July 2026), its [certification overview](https://claude.com/resources/articles/four-role-based-claude-certifications) and Pearson's [exam page](https://www.pearsonvue.com/us/en/anthropic.html).

---

## Who can take the exam

- **Partner-network members only.** "Exams are available to members of the Claude Partner Network," says Anthropic's [certification overview](https://claude.com/resources/articles/four-role-based-claude-certifications). Pearson's [exam page](https://www.pearsonvue.com/us/en/anthropic.html) says the same.
- **Joining is free.** Any organization bringing Claude to market is eligible, and membership is free of charge ([Anthropic, March 12, 2026](https://www.anthropic.com/news/claude-partner-network)).
- **The certificate is yours, not your employer's.** Certifications belong to individual people, not firms ([Anthropic, June 3, 2026](https://www.anthropic.com/news/services-track-partner-hub)).
- **Why firms care.** New partners start at the Registered tier with a commitment to 10 certified practitioners. A practitioner counts while their certification is current and they have used Claude in the past 90 days.
- **Who it's designed for.** The exam guide describes a solution architect with 6+ months of hands-on work with the Claude API, the Claude Agent SDK, Claude Code and MCP.

Training a team on Claude? See [team training](/en/services).

---

## The five Claude certifications

| Certification | Exam code | Who it's for |
|---|---|---|
| Associate – Foundations | CCAO-F | Everyday use of Claude, for anyone working on Claude projects |
| Developer – Foundations | CCDV-F | Engineers building with the Claude API, tool use and agents |
| Developer – Professional | CCDV-P | The advanced developer exam |
| Architect – Foundations | CCAR-F | Solution architects who design and build agent systems with Claude |
| Architect – Professional | CCAR-P | Integration architecture, governance and evaluation at large-enterprise scale; the next step after Foundations |

Names and codes are from Pearson's exam page (updated November 24, 2026); the descriptions are from Anthropic's certification overview. Pearson lists updated content for the Associate – Foundations, Developer – Foundations and Architect – Professional exams from December 7, 2026.

---

## How the Architect – Foundations exam works

| Item | Detail |
|---|---|
| Questions | 60, multiple-choice and multiple-response |
| Format | 4 scenarios picked at random from a bank of 6 |
| Time | 120 minutes |
| Delivery | Proctored, online or at a Pearson VUE test center |
| Pass mark | Scaled score of 720 on a 100–1,000 scale |
| Fee | $125 per attempt; any partner-tier discount shows at checkout |
| Valid for | 12 months; renewing on time is a free, non-proctored assessment |
| Retakes | Wait 14, then 30, then 90 days; up to 4 attempts in 12 months |

The scenarios come from real customer work: a customer-support agent, a multi-agent research pipeline, Claude Code in CI/CD, developer productivity tools and structured data extraction. You can cancel or reschedule up to 24 hours before the appointment; later changes forfeit the fee.

The exam covers five domains:

| Domain | Weight | Free course that covers it |
|---|---|---|
| 1. Agentic Architecture & Orchestration | 27% | Building with the Claude API; Introduction to subagents |
| 2. Tool Design & MCP Integration | 18% | Introduction to Model Context Protocol; Model Context Protocol: Advanced Topics |
| 3. Claude Code Configuration & Workflows | 20% | Claude Code in Action; Introduction to agent skills |
| 4. Prompt Engineering & Structured Output | 20% | Building with the Claude API |
| 5. Context Management & Reliability | 15% | Building with the Claude API; Introduction to subagents |

Domains and weights are from the exam guide; the course column is my own mapping.

---

## How to prepare: a 12-week plan with free courses

Every course below is free on [Anthropic Academy](https://anthropic.skilljar.com). Links re-checked on November 25, 2026.

### Weeks 1–2 · Foundations

#### 1. Claude 101

🔗 [anthropic.skilljar.com/claude-101](https://anthropic.skilljar.com/claude-101)

Covers how Claude works day to day: Projects, Artifacts, Skills, Connectors and real-world workflows.

> ⚠️ **Even if you've been using Claude for months, start here.** The exam assumes you know these basics.

#### 2. AI Fluency: Framework & Foundations

🔗 [anthropic.skilljar.com/ai-fluency-framework-foundations](https://anthropic.skilljar.com/ai-fluency-framework-foundations)

Co-developed with university professors, this course introduces **four core principles** for working with AI:

- **Delegation**: what to hand off to AI vs. handle yourself
- **Description**: how to clearly communicate your intent
- **Discernment**: how to evaluate whether AI output is correct
- **Diligence**: your responsibility to verify in a human-AI workflow

### Weeks 3–5 · Building with the Claude API (domains 1, 4 and 5)

#### 3. Building with the Claude API

🔗 [anthropic.skilljar.com/claude-with-the-anthropic-api](https://anthropic.skilljar.com/claude-with-the-anthropic-api)

**The centerpiece of the plan.** It runs from basic API calls to agentic architectures:

- System prompts
- Tool use
- Streaming
- Structured outputs
- Context management
- Production patterns

> 📚 **Supplementary resource**: [Claude API documentation](https://platform.claude.com/docs)

### Weeks 6–7 · Model Context Protocol (domain 2)

#### 4. Introduction to Model Context Protocol

🔗 [anthropic.skilljar.com/introduction-to-model-context-protocol](https://anthropic.skilljar.com/introduction-to-model-context-protocol)

The fundamentals of MCP: **tools, resources and prompts**.

#### 5. Model Context Protocol: Advanced Topics

🔗 [anthropic.skilljar.com/model-context-protocol-advanced-topics](https://anthropic.skilljar.com/model-context-protocol-advanced-topics)

Hands-on MCP servers and clients, including sampling, notifications, filesystem access and production transports.

> 📚 **Supplementary resource**: [MCP specification and docs](https://modelcontextprotocol.io)

### Weeks 8–9 · Claude Code and agent skills (domain 3)

#### 6. Claude Code in Action

🔗 [anthropic.skilljar.com/claude-code-in-action](https://anthropic.skilljar.com/claude-code-in-action)

Configuring Claude Code for a team:

- `CLAUDE.md` hierarchy
- Path-specific rules
- Custom slash commands
- Skills
- Hooks
- CI/CD integration

#### 7. Claude Code on Coursera (Vanderbilt University · free audit)

🔗 [coursera.org/specializations](https://www.coursera.org/specializations/generative-ai-software-engineering)

The module is **Claude Code: Software Engineering with Generative AI Agents**, taught by Dr. Jules White as part of the "Generative AI Software Engineering Specialization". It focuses on **AI-first development** and the **"Best of N" pattern**.

> 💡 **Audit it for free.** It comes at the material from a different angle than Anthropic's courses, so taking both side by side is worth it.

#### 8. Introduction to agent skills

🔗 [anthropic.skilljar.com/introduction-to-agent-skills](https://anthropic.skilljar.com/introduction-to-agent-skills)

Creating, configuring and sharing reusable skills, which the exam tests under Claude Code configuration.

### Weeks 10–12 · Subagents and the official practice projects

#### 9. Introduction to subagents

🔗 [anthropic.skilljar.com/introduction-to-subagents](https://anthropic.skilljar.com/introduction-to-subagents)

Spawning subagents and passing context between them, which shows up in domains 1 and 5.

#### 10. Build the exam guide's practice projects

The exam guide's "How to Prepare" section lists hands-on work. Do these before you book:

- **An agent with the Claude Agent SDK**: a complete agentic loop with tool calling, error handling and session management, plus subagents
- **Claude Code on a real project**: a `CLAUDE.md` hierarchy, path-specific rules in `.claude/rules/`, custom skills and at least one MCP server
- **MCP tools**: descriptions that tell similar tools apart, structured error responses, and tool selection tested with ambiguous requests
- **A structured data extraction pipeline**: tool use with JSON schemas, validation-retry loops and batch processing with the Message Batches API
- **Prompting, context and escalation**: few-shot examples for ambiguous cases, scratchpad files for long sessions, and human-review routing

Then work through the sample questions in the exam guide.

---

## If your company isn't a partner

- **Ask your employer.** Any organization bringing Claude to market can join the [Claude Partner Network](https://www.anthropic.com/news/claude-partner-network) for free, and certifications count toward its standing.
- **Take the courses anyway.** They're free and cover all five exam domains.
- **Show the skill without the credential.** Publish one of the practice projects above, such as an MCP server or an Agent SDK agent, on GitHub.

---

## My Study Recommendations

1. **Don't skip Claude 101**: The exam assumes you already understand Projects, Artifacts, Skills and Connectors.
2. **Go through Building with the Claude API twice**: It's dense, and it feeds three of the five domains.
3. **Actually build something for the MCP section**: Finish the intro course, then spin up an MCP server. That hands-on experience is worth more than ten lectures.
4. **Alternate between the Claude Code and Coursera courses**: One is Anthropic's practitioner view, the other is more academic and AI-first.
5. **Book the exam once the practice projects work**: It's $125 an attempt, changes inside 24 hours forfeit the fee, and the credential lasts 12 months.

---

## FAQ

### Can anyone take the Claude Certified Architect exam?

No. Exams are open to members of the Claude Partner Network. Membership is free for organizations bringing Claude to market, and the certification belongs to the person who passes.

### How much does the Claude Certified Architect exam cost?

$125 per attempt for Architect – Foundations, according to Anthropic's exam guide (version 1.0, effective July 2026). Partner tiers may get a discount on the first attempt; checkout shows the final fee.

### What's on the Claude Certified Architect exam?

60 questions in 120 minutes across five domains: Agentic Architecture & Orchestration (27%), Tool Design & MCP Integration (18%), Claude Code Configuration & Workflows (20%), Prompt Engineering & Structured Output (20%) and Context Management & Reliability (15%). The pass mark is a scaled 720 out of 1,000.

### Is Anthropic Academy the same as Claude certification?

No. Anthropic Academy courses are free for anyone. The certification exams are proctored, cost money and are open to partner-network members.

### How long is the certification valid?

12 months. Renewing on time is a free, non-proctored assessment on the Anthropic Partner Academy; if it lapses, you retake the full exam at the full fee.

### How long does it take to prepare?

The exam guide expects about six months of hands-on work with Claude. If you already build with the API and Claude Code, the 12-week plan above covers the courses and practice projects; starting from scratch, plan for longer.

---

## The Bottom Line

> **If you build with Claude at a partner firm, the Foundations exam is worth booking: $125, 120 minutes, and the free Anthropic Academy courses cover all five domains. If you're not at a partner, take the same courses and build the guide's practice projects; those skills are what the exam measures.**

Want to see how OpenAI Academy stacks up? Check out → [OpenAI Academy vs. Anthropic: A Full Comparison of Two Free AI Learning Paths](/en/blog/openai-academy-vs-anthropic-learning-paths)

---

📚 **[The Complete Map of Free AI Learning Across 10 Platforms →](/en/blog/ai-free-learning-hub)** One reference table, paths organized by role — the full series index.
