# Research and Fact-Check Integration Design

## Context

Our writing system currently operates on a "materials are sacred" principle — article content comes only from author-sourced materials collected during the interview step. While this prevents fabrication, it leaves two gaps:

1. **No pre-writing research.** Authors arrive at the interview with only their existing knowledge. There's no structured way to explore the external landscape of a topic — existing discussions, community perspectives, supporting data, or contrasting viewpoints — before the interview begins.

2. **No fact-checking.** The draft review loop (writing rules reviewer) checks for stylistic violations but doesn't verify whether factual claims in the article are accurate.

This design adds two capabilities: **topic research** (optional, in article-preparation) and **fact-check review** (in article-writing), both implemented as subagent dispatches following the existing reviewer pattern.

### Research reference

This design builds on the findings in `docs/research/2026-03-18-research-in-technical-writing.md`, which surveyed how technical writers conduct online research and identified the key types, timing, and organizational patterns used in the industry.

## Design Principles

**Research broadens perspective, not confirms bias.** Research results include supporting, contrasting, and alternative viewpoints. The goal is to give the author a full picture of the topic's external landscape, not to validate their existing position.

**Author retains final authority.** Research findings and fact-check results are always presented to the author for review. Neither the research subagent nor the fact-check subagent modifies article content autonomously.

**Research is a material source, not a replacement.** Once the author reads and confirms research findings, those findings become legitimate materials — marked with a `Research:` prefix in the outline to maintain traceability. The "materials are sacred" principle extends to cover author-confirmed research.

**Separation of concerns.** Research notes live in a dedicated `research.md` file, parallel to `brief.md` and `article.md`. The brief stays focused on author intent and materials; research.md handles external knowledge.

## Changes Overview

### New files (per article)

```
articles/{YYYY-MM-DD}_{slug}/
  article.md      # Article content (unchanged)
  brief.md        # Author materials and intent (minor changes)
  research.md     # External research and fact-check sources (NEW)
  assets/         # Images etc. (unchanged)
```

### New skill files

| File | Purpose |
|------|---------|
| `skills/article-preparation/topic-researcher-prompt.md` | Prompt template for the research subagent |
| `skills/article-writing/fact-check-reviewer-prompt.md` | Prompt template for the fact-check subagent |

### Step renumbering

Both skills get renumbered to clean integers (no more 3.5, 3.6).

## Article Preparation: New Step Sequence

| Step | Content | Change |
|------|---------|--------|
| 1 | Create article directory | Unchanged |
| 2 | Complete brief fields | Unchanged |
| **3** | **Topic research (optional)** | **New** |
| 4 | Collect existing materials | Was Step 3 |
| 5 | Interview the author | Was Step 4 |
| 6 | Build outline with materials | Was Step 5 |
| 7 | Ready check | Was Step 6 |

### Step 3: Topic Research (optional)

After the brief's basic fields are completed (Step 2), the system asks the author: "Would you like to do some topic research before we continue?"

If the author declines, skip to Step 4. If the author accepts:

**3a. System proposes research questions.** Based on the brief's title, target audience, and reader takeaway, the system proposes 2-3 research questions in ghostwriter mode. Examples:

- "What are the current mainstream approaches to {topic} in the community?"
- "What common problems does {target audience} encounter with {topic}?"
- "Are there recent developments or data related to {reader takeaway}?"

**3b. Author confirms or adjusts.** The author can remove, modify, or add their own research questions.

**3c. Dispatch research subagent.** Send the confirmed research questions to the topic researcher subagent (see `topic-researcher-prompt.md`). The subagent searches online and produces structured research notes.

**3d. Write research.md.** The subagent's findings are written to `research.md` in the article directory.

**3e. Present research summary to author.** The system presents a concise summary of findings, explicitly including contrasting or opposing viewpoints. The author reads and absorbs the research landscape.

**3f. Check "Research completed (or skipped)" in the brief checklist.**

### How research flows into subsequent steps

- **Step 5 (Interview):** The system is aware of `research.md` and can reference research findings during the interview to prompt deeper discussion. For example: "The research found differing views on X — what's been your experience?"
- **Step 6 (Outline):** Research insights confirmed by the author can be included as materials in the outline, marked with the `Research:` prefix to distinguish from author-sourced materials.

## Article Writing: New Step Sequence

| Step | Content | Change |
|------|---------|--------|
| 1 | Read all inputs | Updated: also reads research.md |
| 2 | Update status | Unchanged |
| 3 | Write first draft | Unchanged |
| 4 | Draft review loop (writing rules) | Was Step 3.5 |
| **5** | **Fact-check review** | **New** |
| 6 | Author review | Was Step 4 |
| 7 | Revise based on feedback | Was Step 5 |
| 8 | Finalize | Was Step 6 |

### Step 1 update

Add `research.md` (if it exists) to the list of inputs. The writing step can reference research findings that have been incorporated into the outline materials.

### Step 5: Fact-Check Review

After the draft review loop (Step 4) completes, dispatch a fact-check reviewer subagent.

**Subagent responsibilities:**

1. Read the article and identify all factual claims
2. Skip explicit opinion expressions — phrases like "I think," "in my experience," "I prefer," or subjective assessments don't need verification
3. For each factual claim, search online for verification using credible sources
4. If `research.md` exists and already contains relevant sources, use those first to avoid redundant searches

**Subagent output format:**

```markdown
## Fact-Check Review

**Status:** Approved | Issues Found

**Verified claims:**
- "[quoted passage]" — Verified. Source: [{source title}]({URL})

**Unverified claims:**
- "[quoted passage]" — Could not verify. Suggestion: [remove, rephrase as opinion, or ask author for source]

**Corrections:**
- "[quoted passage]" — Contradicted by [{source title}]({URL}). Actual: [correct information]
```

### Fact-check feedback and resolution flow

After the subagent returns results, the system (not the subagent) presents the report to the author.

**If Approved:** Check "Fact-check completed" in the brief checklist. Write verified sources to `research.md` under `## Fact-Check Sources`. Proceed to Step 6.

**If Issues Found:** Present each flagged claim to the author one by one. For each claim, the author chooses one of:

- **Correct:** Accept the fact-check finding; the system updates the passage in `article.md`
- **Rephrase as opinion:** The claim is actually the author's experience, not a factual assertion; the system adjusts wording (e.g., adds "in my experience")
- **Provide source:** The author knows the source; add it to `research.md`
- **Remove:** The claim isn't essential; remove it from the article

After the author resolves all flagged issues, check "Fact-check completed" in the brief checklist. **No re-dispatch needed** — each resolution is author-confirmed, unlike the writing rules review loop which auto-fixes and re-checks.

## research.md Format

```markdown
## Research Notes

### Research Questions
1. {research question confirmed by author}
2. ...

### Findings

#### {Research question 1}
{Finding summary — includes supporting, contrasting, and alternative viewpoints}

**Sources:**
- [{source title}]({URL}) — {one-line description of this source's value}
- ...

**Key insights:**
- {key insight that could be referenced in the article}
- ...

#### {Research question 2}
...

## Fact-Check Sources
- "[claim from article]" — [{source title}]({URL})
- ...
```

The `## Research Notes` section is populated during article-preparation Step 3. The `## Fact-Check Sources` section is populated during article-writing Step 5. If the author skips research, the file may only contain the fact-check section (created during article-writing).

## Changes to Existing Files

### brief-template.md

**Preparation checklist** — add one item before "Interview completed":
```
- [ ] Research completed (or skipped)
```

**Writing & Review checklist** — add one item before "Review completed":
```
- [ ] Fact-check completed
```

### brief-format.md

Add documentation for the new checklist items. No new brief sections needed — research content lives in `research.md`.

### Outline materials format

Add the `Research:` prefix as a material source type in the outline format documentation:

```
### 1. Section title
**Purpose:** What this section achieves for the reader
**Materials:**
- Author quote: "exact words from interview"
- Research: {insight from research.md, confirmed by author for inclusion}
- Specific detail: numbers, timelines, technical choices
```

### writing-rules.md

Expand the "use author's materials" rule to acknowledge research as a legitimate material source:

> Every claim, example, and number in the article must come from the outline materials. Materials include author-sourced content (from the interview) and research findings (from research.md) that the author has confirmed for inclusion. Never fabricate examples, statistics, or anecdotes.

### article-writing SKILL.md

- Renumber all steps to clean integers (no 3.5)
- Add Step 5 (fact-check review) description
- Update Step 1 to include `research.md` in inputs

### article-preparation SKILL.md

- Renumber steps to accommodate the new Step 3
- Add Step 3 (topic research) description
- Update Step 5 (interview) to mention referencing research.md
- Update Step 6 (outline) to document the `Research:` material prefix

## What Does NOT Change

- **writing-management skill:** Entirely unchanged
- **config.md / ideas.md formats:** Unchanged
- **Writing rules reviewer (Step 4):** Unchanged — keeps its focused responsibility on writing rules only
- **Core writing process (Step 3):** Unchanged — still writes from outline materials
- **The "materials are sacred" principle:** Extended, not weakened — research becomes a material source only after author confirmation
