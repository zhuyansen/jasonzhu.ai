---
title: >-
  Andrew Ng 2026 《AI Prompt Engineering》Module 2 Complete Notes: Turning AI into
  Your True Thinking Partner
excerpt: >-
  Complete English notes for Andrew Ng's 《AI Prompting for Everyone》Module 2. 8
  lessons covering: how to brainstorm with AI, manage context, use desktop
  agents, apply deep reasoning, avoid AI sycophancy, iterate on writing, and
  conduct objective reviews. 10 ready-to-use prompt templates you can copy right
  away.
---

Module 1 solves the "finding information" problem; Module 2 puts AI to real work—as a thinking partner, an editor, and a reviewer.

The single most mind-bending consensus across these 8 lessons: **AI is, by default, a high-IQ new grad who's prone to flattery.** Every layer of prompt engineering ultimately exists to bypass its "I want to please you" instinct and force it to give you something genuinely useful.

Organized in a three-part format: **screenshot + one-line takeaway + one template**.

---

## Day 1 · Brainstorming: Push AI Out of Its "Obvious Answer" Comfort Zone

![AI output probability curve: common answers are high-probability, creative answers are low-probability](/blog/wu-enda-prompting-module-2/day-1-brainstorm.png)

**💡 One-line takeaway:** AI defaults to "common answers" (squats, push-ups) because that's what most internet text looks like—if you want creative answers (trampoline breaks, cat-triggered micro-workouts), you need to **provide rich context and iterate across multiple rounds of feedback**.

**📋 Template · Iterative Brainstorming**

```
Help me brainstorm: [problem]

My background and context:
- Current situation: [key constraints]
- Resources: [what I have on hand]
- Things I've already tried: [list 2–3 directions you don't want to revisit]
- Desired angle: [creative / practical / unconventional / contrarian]

Give me 5 approaches from different angles. Keep each to 30 words or fewer.
List them first—hold the details until I give you feedback.

—— After I review, I'll tell you "what I like about option X, what I don't like about Y,"
and you'll generate 5 new options based on that feedback. Repeat for 3 rounds.
```

---

## Day 2 · Context Management: You Have the Equivalent of 4–5 Harry Potter Books

![AI context window capacity = 4–5 Harry Potter books](/blog/wu-enda-prompting-module-2/day-2-context.png)

**💡 One-line takeaway:** Mainstream AI models can hold roughly 750,000 words of context (4–5 Harry Potter books)—most people drastically underestimate this capacity. That said, **always start a new chat when switching topics**; old context will bleed into and distort new answers.

**📋 Template · Context Bundle (Send Everything at Once)**

```
I'm about to ask you a complex question. Here's all the background upfront:

[Who I am] [profession / role / decision-making capacity]
[What I'm doing] [current project / task]
[Key data] [current metrics / time constraints / budget]
[My goal] [desired output format]
[What I've already tried] [to avoid repeated suggestions]
[Expected output] [report / checklist / decision recommendation / option comparison]

The actual question: [your question]

Please answer based on all of the above. Reference specific details where relevant.
```

---

## Day 3 · Desktop AI Agent: Let It Read Files on Your Computer

![AI desktop agents can read and write local files—grant permissions carefully](/blog/wu-enda-prompting-module-2/day-3-desktop-app.png)

**💡 One-line takeaway:** Claude Cowork / Microsoft Copilot / Google Antigravity can read and write files on your machine—but **always have it propose a plan first, never execute directly**. Deleted files don't go to the recycle bin, and overwritten files have no version history.

**📋 Template · Safe Three-Step Process (Force propose → review → execute)**

```
Task: [what you want done, e.g., "organize this folder"]

Please follow this sequence:

Step 1: List the files you plan to read (don't read the contents yet)
        + every action you plan to take (move / rename / delete / create)
        + a risk assessment (which actions are irreversible)
        STOP and wait for my review before proceeding.

Step 2: Once I say "OK," execute in order.
        Output one log line per completed action.
        Stop immediately and ask me if anything unexpected comes up.

⚠️ Never delete any file (move to a .trash/ folder instead)
⚠️ Never touch .git / node_modules / .env*
```

---

## Day 4 · Deep Reasoning: "Think Step by Step" Is Already Outdated

![METR research: the length of tasks AI can complete grew exponentially between 2024 and 2026](/blog/wu-enda-prompting-module-2/day-4-reasoning.png)

**💡 One-line takeaway:** By 2026, reasoning models will be capable of completing complex tasks that take humans hours—stop saying "step by step." Just say **"think hard" / "ultrathink"** and let the model decide how to approach the problem.

**📋 Template · Deep Reasoning Trigger**

```
[Your complex task, with full context]

Requirements:
- Please ultrathink this problem—spend the equivalent of at least 5 minutes thinking before responding
- Search the web for supplementary data if needed
- Provide 2–3 alternative approaches, each including:
  · Core rationale (why this option)
  · Key assumptions (what premises, if wrong, would break the approach)
  · Validation method (how to know whether the approach is working)
- Close with a clear recommendation: "If I had to choose one, I'd pick ___ because ___"
```

---

## Day 5 · Anti-Sycophancy: AI Says "You're Right" Far More Than You Think

![Ratio of AI agreement vs. disagreement: roughly 10:1 (Washington Post research)](/blog/wu-enda-prompting-module-2/day-5-sycophancy.png)

**💡 One-line takeaway:** Washington Post research found ChatGPT says "That's correct / Good point" **10 times more often** than "Not quite right / Actually"—any question loaded with emotion or preference gets mirrored straight back at you. You have to enforce a neutral framing.

**📋 Template · Neutral Question Rewriter**

```
I originally wanted to ask: [your raw question, which may carry a built-in preference]

Please do two things:
1) Identify every phrase in the original question that implies "I'm hoping to hear X"
2) Rewrite it as a fully neutral version (one where you can't tell which side I'm leaning toward)

Then answer me using the rewritten neutral version.

Neutral framing checklist:
- Don't use "Isn't X better than Y?"
- Don't use "I think X, right?"
- Use "pros and cons of X vs. Y" or "under what conditions is X better, and under what conditions is Y better"
```

---

## Day 6 · Writing: What AI Slop Looks Like—and How to Avoid It

![Em dash frequency spiked after ChatGPT's launch (Bluesky data)](/blog/wu-enda-prompting-module-2/day-6-writing.png)

**💡 One-line takeaway:** AI slop signatures: overuse of em dashes, "nuanced," "delve," the "not X but Y" construction, and an addiction to three-item lists. The fix is a **progressive outline approach**—outline first, then bullet points, then full prose, with iteration at every stage.

**📋 Template · Progressive Writing Workflow**

```
I need to write: [article topic + target audience + word count]

Please work through the following 3 phases, stopping after each one to wait for my feedback:

Phase 1 · Outline (under 200 words)
- Give me 3 structurally distinct outline options
- For each, note: core argument, reader takeaway, potential weaknesses

Phase 2 · Key points (5–8 bullets per section)
- Once an outline is chosen, list bullet points for each section
- Include evidence sources, examples, and data placeholders

Phase 3 · Full draft
- Only expand into prose once all bullet points are confirmed
- Writing style: [your style preferences]
- Banned: em dashes, "delve," "nuanced," "not X but Y"
- Banned: three or more consecutive bullet-point lists
```

---

## Day 7 · Honest Critique: Use a Rubric to Choke Out AI's Flattery Instinct

![Good rubric vs. bad rubric comparison: objective criteria force AI to score honestly](/blog/wu-enda-prompting-module-2/day-7-critique.png)

**💡 One-line takeaway:** No rubric → AI gives you a 90. Write each criterion as a binary yes/no judgment → AI honestly gives you a 75 and tells you exactly where points were lost. **Critique quality = rubric quality.**

**📋 Template · Objective Critique Rubric Generator**

```
I need to review: [article / design / code / PRD / business plan]

Please follow this process:

Step 1 · Draft a rubric for me first
- 5–7 evaluation dimensions, each worth 10–20 points
- Under each dimension, 3–5 yes/no sub-criteria (strictly binary—no "decent" or "okay")
- For example, don't write "Argument is clear (10 pts)"
  Write "✅ Each argument is backed by data (3 pts) ✅ Each data point has a source (3 pts) ✅ Arguments are internally consistent (4 pts)"

Step 2 · Once I confirm the rubric
- Use it to review [my content]
- Score each sub-criterion independently + one-sentence rationale
- Close with a total score + improvement suggestions (ordered by points lost)
```

---

## Day 8 · Lab Exercise: Feel the Score Gap Between "Subjective Prompt" and "Objective Rubric" Firsthand

![Lab screenshot: subjective rubric gives 83; objective rubric gives 75](/blog/wu-enda-prompting-module-2/day-8-lab.png)

**💡 One-line takeaway:** In Andrew Ng's lab, the same sci-fi short story scored 83 under a subjective rubric (all praise) and 75 under an objective rubric with specific criticisms called out. **That 8-point gap is the real feedback you've been leaving on the table.**

**📋 Template · 5-Minute Self-Test: Your Writing's Real Score**

```
Take something you've written recently—an article, a piece of code, a proposal—and run two reviews:

Review 1 (subjective):
"Please evaluate the quality of the following and score it out of 100." + content

Review 2 (objective, using a rubric generated from Template 7):
[Generate rubric first → then use rubric to review]

Compare:
- How far apart are the two total scores?
- What specific issues did the objective version flag that the subjective version ignored?
- Are those issues ones you'd already vaguely sensed yourself?

→ Revise based on the objective rubric, then compare before and after.
```

---

## 8 Lessons Distilled to One Line

> **AI is a high-IQ new grad who wants to please you—give it enough context so it can actually do the work, use a rubric to lock down its output standards, and use ultrathink to unlock its reasoning.**

Module 3 "Multimodal + Code" (6 lessons) drops next week—covering image understanding, AI image generation, building mini apps with prompts, AI data analysis, and a final capstone project.

Full 21-lesson notes + 100+ prompt templates—subscribe to get the free handbook 👉 [Free Handbook](/zh/handbook).

→ Previous post: [Module 1 · Finding Information](/en/blog/wu-enda-prompting-module-1)
