---
title: >-
  Andrew Ng's 2026 'AI Prompting for Everyone' — Complete Module 1 Notes: How AI
  Has Rewritten the Way We Find Information
excerpt: >-
  Full notes for Module 1 of Andrew Ng's 2026 course 'AI Prompting for Everyone'
  — 6 lessons plus 7 ready-to-copy prompt templates. The one-sentence takeaway:
  90% of people are still using AI like Google, and they're leaving most of its
  potential on the table.
---

Andrew Ng released a new course in 2026 called *AI Prompting for Everyone*, built specifically for a world where AI has advanced far beyond where it stood in 2022. Module 1 is all about **finding information** — the most common use case for most people, and also the one where most people go wrong.

I've condensed all 6 lessons into a three-part format: **screenshot + one key insight + one ready-to-use template**. Every template can be copied and pasted directly.

---

## Day 1 · The Prompt Gap Between Beginners and Power Users

![AI beginner vs. AI power user: using a rubric to get an honest score](/blog/wu-enda-prompting-module-1/day-1-rubric.png)

**💡 One-sentence insight:** Emotionally loaded prompts → AI will flatter you every time. Neutral prompts with a rubric → AI will actually give you a real score. (In the course example, mobile tie-dying was scored 8/100 — no sugarcoating.)

**📋 Template · Anti-Flattery Evaluation (based on the course's 5-dimension rubric)**

```
Please evaluate the following objectively: [your idea]

Scoring dimensions (based on Andrew Ng's course rubric — 20 points each, 100 total):
1) The Problem & Market
   Does a real pain point exist? Market size? Reachability?
2) Solution & Value Proposition
   How does it solve the problem? Why would users pay for it?
3) Competitive Advantage
   What can't competitors easily copy?
4) Business Model
   How does it make money? Gross margin? Growth flywheel?
5) Feasibility & Execution
   What verifiable milestones can be hit within 12 months?

For each dimension, you must explain the reasoning behind any deductions. No consolation prizes.
Finish with a total score and a clear recommendation on whether this is worth 6 months of serious effort.
```

---

## Day 2 · Where Does AI's Knowledge Actually Come From?

![Pretrained knowledge reflects the frequency of training data](/blog/wu-enda-prompting-module-1/day-2-pretrained.png)

**💡 One-sentence insight:** How reliable an AI's answer is depends largely on how well-represented your topic is on the internet. Cooking / Celebrities / Movies ✅ — Quasars / Cantonese ⚠️ — your company's internal data ❌.

**📋 Template · Pre-Answer Self-Check**

```
Before answering, tell me:
1) What types of sources does your training data mainly draw from for this topic?
   (Social media / Academic papers / Official documentation / Encyclopedia)
2) What information might be outdated? What is your knowledge cutoff?
3) Your self-assessed reliability for this answer: High / Medium / Low

Then provide your answer.

If your reliability self-assessment is "Medium" or "Low", proactively search the web to supplement your response.
```

---

## Day 3 · When Does AI Automatically Search the Web?

![GPT-5.4 knowledge cutoff vs. the surge in 6-7 meme search volume](/blog/wu-enda-prompting-module-1/day-3-web-search.png)

**💡 One-sentence insight:** Knowledge has an expiration date. GPT-5.4 cuts off at August 2025, which means it has no idea the 6-7 meme exploded after that — unless it goes online. Four types of questions tend to trigger automatic web search: current events, location-specific queries, niche topics, and questions with a specific year.

**📋 Template · Force Web Search + Freshness Check**

```
Please search the web for: [your question]

Requirements:
- Prioritize information from the past 30 days
- Include a URL and publication date for every claim
- If sources contradict each other, present both sides
- Flag anything older than 30 days with ⚠️ to indicate it may be outdated
```

---

## Day 4 · Web Search ≠ Reliable

![Web search's dual-AI architecture: what you're reading is "a summary of a summary"](/blog/wu-enda-prompting-module-1/day-4-two-ai.png)

**💡 One-sentence insight:** The answer you receive is actually one AI paraphrasing a page summary for another AI — it never read the full page ("Not read all pages in their entirety!"). Citations frequently misrepresent the original source.

**📋 Template · High-Quality Source Restrictions**

```
When answering, only draw from the following sources:
- Official institutions (WHO / FDA / national statistics bureaus / central banks, etc.)
- Peer-reviewed academic papers
- Primary data / original reports

Explicitly avoid: Reddit / Quora / personal blogs / sales pages / content farms

Every citation must include:
1) Source type (official / academic / media / social media)
2) Publication date
3) Did you read the full text or only the abstract/summary?
   If summary only, please flag with ⚠️
```

---

## Day 5 · Deep Research — The Most Underrated Feature

![Deep Research's agentic loop: parallel retrieval → evaluation → search again if needed → structured report](/blog/wu-enda-prompting-module-1/day-5-deep-research.png)

**💡 One-sentence insight:** Regular web search = a few seconds, 3–5 pages. Deep Research = 5–30 minutes, 20–50+ pages, multiple rounds of iterative searching (Plan → parallel search → read → evaluate → search again if needed) → structured report. Anything with high decision-making stakes deserves this treatment.

**📋 Template · Deep Research Kickoff**

```
Enter deep research mode and investigate: [topic]

Requirements:
1) First give me your research plan (5–8 angles of investigation). Wait for my confirmation before starting.
2) Draw from at least 20 independent sources, covering both supporting and opposing perspectives.
3) The final report must include:
   - Key findings (3–5 points)
   - A side-by-side comparison of opposing viewpoints
   - Key data points with source timestamps
   - Uncertainties and risk factors
4) End with a list of "3 decisions I can make right now" based on the research.
```

---

## Day 6 · Lab Exercise: Experiencing the Difference Firsthand Beats Reading 100 Articles

![Lab screenshot: same question — no web search (wrong math joke answer) vs. web search (correct TikTok meme explanation)](/blog/wu-enda-prompting-module-1/day-6-lab.png)

**💡 One-sentence insight:** The most striking demo in Andrew Ng's official lab — ask both versions "What's the 6-7 meme?" and watch what happens. On the left, ChatGPT 5.4 without web access interprets it as a math joke (completely wrong). On the right, with web search enabled, it accurately explains that this is a LaMelo Ball meme that originated on TikTok in January 2025 — source and all.

**📋 Template · 5-Minute Self-Test (Three-Way Comparison)**

```
Open any AI (ChatGPT / Claude / Gemini).
Ask the same question three different ways and compare the outputs:

1) Plain prompt (no web search, pure pretrained knowledge)
2) Web search enabled + "Use only high-quality sources (official/academic). No Reddit or blogs."
3) Deep Research mode + provide a rubric

Observe:
- Which approach gave you something you could actually act on?
- Which approach had the AI sounding confident while making things up?
- Identify where you've been leaving AI capability on the table.
```

---

## Six Lessons, One Sentence

> **Providing rich context, prompting AI to reason like a person, and enforcing neutral framing will always outperform writing a flashy prompt.**

Next week I'll be posting Module 2 notes: "AI as a Thinking Partner" (7 lessons) — covering brainstorming, context management, AI desktop apps, reasoning, anti-flattery mechanisms, iterative writing, and AI critique.

For the full 21-lesson notes plus 100+ prompt templates, subscribe to get the free handbook 👉 [Free Handbook](/en/handbook).
