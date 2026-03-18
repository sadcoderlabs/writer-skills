# Research and Fact-Check Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add optional topic research (article-preparation) and fact-check review (article-writing) to the writing workflow, with corresponding subagent prompt templates and updated documentation.

**Architecture:** Two new subagent dispatch steps — one in article-preparation (Step 3, optional topic research before interview) and one in article-writing (Step 5, fact-check after writing rules review). Both follow the existing reviewer subagent pattern from `writing-reviewer-prompt.md`. Research output lives in a new `research.md` file per article.

**Tech Stack:** Markdown skill definitions, Agent Skills standard

**Spec:** `docs/superpowers/specs/2026-03-18-research-and-fact-check-design.md`

---

### Task 1: Create topic researcher prompt template

**Files:**
- Create: `skills/article-preparation/topic-researcher-prompt.md`

This is a new subagent prompt template following the structural pattern of `skills/article-writing/writing-reviewer-prompt.md`. The research subagent receives research questions and brief context, searches online, and produces structured findings.

- [ ] **Step 1: Create the prompt template file**

Write the following content to `skills/article-preparation/topic-researcher-prompt.md`:

```markdown
# Topic Researcher Prompt Template

Use this template when dispatching a topic researcher subagent during Step 3.

**Purpose:** Research the topic online to give the author a full picture of the external landscape before the interview.

**Dispatch after:** Author confirms research questions in Step 3b.

~~~
Agent tool (general-purpose):
  description: "Research topic for article preparation"
  prompt: |
    You are a topic researcher. Research the following questions to help an author prepare for writing an article.

    **Research questions:**
    [RESEARCH_QUESTIONS]

    **Article context:**
    - Title: [TITLE]
    - Target audience: [TARGET_AUDIENCE]
    - Reader takeaway: [READER_TAKEAWAY]

    **Article directory:** [ARTICLE_DIR_PATH]

    Search online for each research question. For each question, find relevant discussions, data, perspectives, and sources.

    ## Research Principles

    - **Broaden, don't confirm.** Include supporting, contrasting, and alternative viewpoints. The goal is a full landscape, not validation of any position.
    - **No editorializing.** Present findings as-is. Do not recommend which viewpoint the author should adopt.
    - **Credible sources.** Prefer official documentation, well-known publications, and community discussions with substantive content. Include the URL for every source.
    - **Concise summaries.** Each finding should be a clear, digestible summary — not a copy-paste of the source.

    ## Output

    Write a file to `[ARTICLE_DIR_PATH]/research.md` with this format:

    ```markdown
    ## Research Notes

    ### Research Questions
    1. {question 1}
    2. {question 2}
    ...

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
    ```

    After writing the file, return a brief summary of findings for each question.
~~~

**Researcher returns:** Summary of findings per question, with `research.md` written to the article directory.
```

- [ ] **Step 2: Verify file exists and content is correct**

Run: `cat skills/article-preparation/topic-researcher-prompt.md | head -5`
Expected: The file header and purpose line.

- [ ] **Step 3: Commit**

```bash
git add skills/article-preparation/topic-researcher-prompt.md
git commit -m "feat: add topic researcher subagent prompt template"
```

---

### Task 2: Create fact-check reviewer prompt template

**Files:**
- Create: `skills/article-writing/fact-check-reviewer-prompt.md`

This is a new subagent prompt template following the same structural pattern as `skills/article-writing/writing-reviewer-prompt.md`. The fact-check subagent reads the article, identifies factual claims, and verifies them online.

- [ ] **Step 1: Create the prompt template file**

Write the following content to `skills/article-writing/fact-check-reviewer-prompt.md`:

```markdown
# Fact-Check Reviewer Prompt Template

Use this template when dispatching a fact-check reviewer subagent during Step 5.

**Purpose:** Verify factual claims in the article draft before presenting to the author.

**Dispatch after:** Draft review loop (Step 4) completes.

~~~
Agent tool (general-purpose):
  description: "Fact-check article draft"
  prompt: |
    You are a fact-check reviewer. Verify the factual claims in this article draft.

    **Article to review:** [ARTICLE_FILE_PATH]
    **Brief (for context):** [BRIEF_FILE_PATH]
    **Research notes (if exists):** [RESEARCH_FILE_PATH]

    Read all provided files, then identify and verify factual claims.

    ## What to Check

    **Identify factual claims** — statements that assert something verifiable about the world: numbers, dates, version information, API behavior, performance metrics, adoption statistics, historical events, technical specifications.

    **Skip opinion expressions** — do NOT flag statements that are clearly the author's perspective or experience:
    - "I think...", "I believe...", "In my experience..."
    - "I prefer X over Y"
    - "X is better for this use case" (subjective assessment)
    - "This approach felt more natural"
    - Recommendations, preferences, and value judgments

    ## Verification Process

    1. List all factual claims found in the article
    2. If `research.md` exists and contains relevant sources, check against those first
    3. For claims not covered by existing sources, search online for verification
    4. Use credible sources: official documentation, reputable publications, well-known community resources

    ## Calibration

    - Only flag claims you can specifically verify or contradict with a source
    - If a claim is plausible but you cannot find a definitive source, list it as unverified — do not mark it as a correction
    - Technical claims about specific tools or APIs should be checked against official documentation
    - Do not flag rounded numbers or approximations unless they are significantly off

    ## Output Format

    ## Fact-Check Review

    **Status:** Approved | Issues Found

    **Verified claims:**
    - "[quoted passage]" — Verified. Source: [{source title}]({URL})

    **Unverified claims:**
    - "[quoted passage]" — Could not verify. Suggestion: [remove, rephrase as opinion, or ask author for source]

    **Corrections:**
    - "[quoted passage]" — Contradicted by [{source title}]({URL}). Actual: [correct information]
~~~

**Reviewer returns:** Status, Verified claims, Unverified claims, Corrections.
```

- [ ] **Step 2: Verify file exists and content is correct**

Run: `cat skills/article-writing/fact-check-reviewer-prompt.md | head -5`
Expected: The file header and purpose line.

- [ ] **Step 3: Commit**

```bash
git add skills/article-writing/fact-check-reviewer-prompt.md
git commit -m "feat: add fact-check reviewer subagent prompt template"
```

---

### Task 3: Update brief template and format documentation

**Files:**
- Modify: `skills/article-preparation/assets/brief-template.md:30-45` (checklist section)
- Modify: `skills/article-preparation/references/brief-format.md:45-61` (checklist documentation)

Add the two new checklist items and their documentation.

- [ ] **Step 1: Add "Research completed (or skipped)" to brief template**

In `skills/article-preparation/assets/brief-template.md`, in the Preparation checklist, insert after `- [ ] Language and translations confirmed` and before `- [ ] Interview completed`:

```
- [ ] Research completed (or skipped)
```

The Preparation checklist should now read:
```
### Preparation
- [ ] Target audience confirmed
- [ ] Article goals confirmed
- [ ] Goal alignment confirmed
- [ ] Language and translations confirmed
- [ ] Research completed (or skipped)
- [ ] Interview completed
- [ ] Outline with materials completed
- [ ] Ready for writing
```

- [ ] **Step 2: Add "Fact-check completed" to brief template**

In `skills/article-preparation/assets/brief-template.md`, in the Writing & Review checklist, insert after `- [ ] First draft completed` and before `- [ ] Review completed`:

```
- [ ] Fact-check completed
```

The Writing & Review checklist should now read:
```
### Writing & Review (managed by later skills)
- [ ] First draft completed
- [ ] Fact-check completed
- [ ] Review completed
- [ ] Translations completed
- [ ] Finalized
```

- [ ] **Step 3: Update brief-format.md checklist documentation**

In `skills/article-preparation/references/brief-format.md`, update the Preparation checklist list (around line 48-55) to include the new item. Insert after `- Language and translations confirmed` and before `- Interview completed`:

```
- Research completed (or skipped)
```

Also update the Writing & Review checklist list (around line 57-61) to include after `- First draft completed` and before `- Review completed`:

```
- Fact-check completed
```

- [ ] **Step 4: Add documentation for new checklist items in brief-format.md**

After the existing checklist section text in `skills/article-preparation/references/brief-format.md` (after line 61, before `## Status Transitions`), add:

```markdown

**New checklist items:**
- **Research completed (or skipped)**: Checked after the author completes topic research in article-preparation Step 3, or immediately if the author declines research. Tracks that the research decision has been made.
- **Fact-check completed**: Checked after all fact-check findings have been resolved by the author in article-writing Step 5. Tracks that factual claims have been verified.
```

- [ ] **Step 5: Verify changes**

Run: `grep -n "Research completed\|Fact-check completed" skills/article-preparation/assets/brief-template.md skills/article-preparation/references/brief-format.md`
Expected: Both items appear in both files.

- [ ] **Step 6: Commit**

```bash
git add skills/article-preparation/assets/brief-template.md skills/article-preparation/references/brief-format.md
git commit -m "feat: add research and fact-check checklist items to brief template and format docs"
```

---

### Task 4: Update writing rules to acknowledge research as material source

**Files:**
- Modify: `skills/article-writing/references/writing-rules.md:104-106` (Use the author's materials section)

- [ ] **Step 1: Expand the materials rule**

In `skills/article-writing/references/writing-rules.md`, replace the first bullet under `### Use the author's materials` (line 105):

Current:
```
- Every claim, example, and number in the article must come from the materials in the outline. Never fabricate examples, statistics, or anecdotes.
```

Replace with:
```
- Every claim, example, and number in the article must come from the outline materials. Materials include author-sourced content (from the interview) and research findings (from research.md) that the author has confirmed for inclusion. Never fabricate examples, statistics, or anecdotes.
```

- [ ] **Step 2: Verify change**

Run: `grep -A2 "Use the author" skills/article-writing/references/writing-rules.md`
Expected: The expanded rule text mentioning research.md.

- [ ] **Step 3: Commit**

```bash
git add skills/article-writing/references/writing-rules.md
git commit -m "feat: expand materials rule to include author-confirmed research findings"
```

---

### Task 5: Update article-preparation SKILL.md — renumber and add research step

**Files:**
- Modify: `skills/article-preparation/SKILL.md`

This is the largest change. The current steps are 1-6. After this task they become 1-7, with the new Step 3 (Topic Research) inserted and all subsequent steps renumbered.

- [ ] **Step 1: Renumber Step 3 → Step 4**

In `skills/article-preparation/SKILL.md`, rename `### Step 3: Collect Existing Materials` to `### Step 4: Collect Existing Materials`.

Also update the internal references within this section:
- "Proceed to Step 4 (Interview)" → "Proceed to Step 5 (Interview)"
- "proceed directly to Step 4 (Interview)" → "proceed directly to Step 5 (Interview)"

- [ ] **Step 2: Renumber Step 4 → Step 5**

Rename `### Step 4: Interview the Author` to `### Step 5: Interview the Author`.

Update internal references:
- "If existing materials were collected in Step 3" → "If existing materials were collected in Step 4"
- "you may skip directly to Step 5 (Build Outline)" → "you may skip directly to Step 6 (Build Outline)"

- [ ] **Step 3: Renumber Step 5 → Step 6**

Rename `### Step 5: Build Outline with Materials` to `### Step 6: Build Outline with Materials`.

- [ ] **Step 4: Renumber Step 6 → Step 7**

Rename `### Step 6: Readiness Check` to `### Step 7: Readiness Check`.

- [ ] **Step 5: Insert new Step 3 (Topic Research)**

After the end of the Step 2 section and before the new Step 4, insert:

```markdown
### Step 3: Topic Research (optional)

After the brief fields are completed, ask the author: "Would you like to do some topic research before we continue?"

If the author declines, check "Research completed (or skipped)" in the checklist and skip to Step 4.

If the author accepts:

**3a. Propose research questions.** Based on the brief's title, target audience, and reader takeaway, propose 2-3 research questions in ghostwriter mode. Examples:
- "What are the current mainstream approaches to {topic} in the community?"
- "What common problems does {target audience} encounter with {topic}?"
- "Are there recent developments or data related to {reader takeaway}?"

**3b. Author confirms or adjusts.** The author can remove, modify, or add their own research questions.

**3c. Dispatch research subagent.** Send the confirmed questions to the topic researcher subagent — see [topic-researcher-prompt.md](topic-researcher-prompt.md) for the dispatch template. This is a single dispatch, no retry loop. If results are thin, the author can refine questions and re-trigger, or proceed without it.

**3d. Present research summary.** After the subagent writes `research.md` in the article directory, present a concise summary to the author. Include contrasting or opposing viewpoints explicitly — research broadens perspective, not confirms bias.

**3e. Check "Research completed (or skipped)" in the brief checklist.**
```

- [ ] **Step 6: Update Step 5 (Interview) to reference research.md**

In the new Step 5 (Interview the Author), after the `**Behavior:**` section's last bullet point (the Resumability bullet), add a new bullet:

```
- **Research-informed**: If `research.md` exists, reference research findings during the interview to prompt deeper discussion. For example: "The research found differing views on X — what's been your experience?"
```

- [ ] **Step 7: Update Step 6 (Outline) to document Research: prefix**

In the new Step 6 (Build Outline with Materials), update the materials format example to include the `Research:` prefix. In the format block, add a line after `- Specific detail:`:

```
- Research: {insight from research.md, confirmed by author for inclusion}
```

Also add a new bullet to the **Key principles** list:

```
- Research materials use the `Research:` prefix — only include research insights the author has confirmed for inclusion in the article
```

- [ ] **Step 8: Verify renumbering is consistent**

Run: `grep -n "Step [0-9]" skills/article-preparation/SKILL.md`
Expected: Steps 1 through 7, no gaps, no 3.5-style decimals.

- [ ] **Step 9: Commit**

```bash
git add skills/article-preparation/SKILL.md
git commit -m "feat: add optional topic research step and renumber article-preparation steps"
```

---

### Task 6: Update article-writing SKILL.md — renumber and add fact-check step

**Files:**
- Modify: `skills/article-writing/SKILL.md`
- Modify: `skills/article-writing/writing-reviewer-prompt.md:3` (step reference update)

The current steps are 1, 2, 3, 3.5, 4, 5, 6. After this task they become 1-8 with the new Step 5 (Fact-Check Review) inserted.

- [ ] **Step 1: Renumber Step 3.5 → Step 4**

In `skills/article-writing/SKILL.md`, rename `### Step 3.5: Draft Review Loop` to `### Step 4: Draft Review Loop`.

- [ ] **Step 2: Renumber Step 4 → Step 6**

Rename `### Step 4: Author Review` to `### Step 6: Author Review`.

- [ ] **Step 3: Renumber Step 5 → Step 7**

Rename `### Step 5: Revise Based on Feedback` to `### Step 7: Revise Based on Feedback`.

- [ ] **Step 4: Renumber Step 6 → Step 8**

Rename `### Step 6: Complete` to `### Step 8: Complete`.

No content changes needed in this section beyond the heading rename — the fact-check checklist item is handled in Step 5 (Fact-Check Review), not here.

- [ ] **Step 5: Update Step 1 to include research.md**

In `### Step 1: Read All Inputs`, update the numbered list:

Current:
```
Read and understand:
1. `brief.md` — article info, target audience, goals, writing style, outline with materials
2. `config.md` — global writing style (Writing Style section)
```

Replace with:
```
Read and understand:
1. `brief.md` — article info, target audience, goals, writing style, outline with materials
2. `config.md` — global writing style (Writing Style section)
3. `research.md` (if it exists) — external research findings and sources
```

- [ ] **Step 6: Insert new Step 5 (Fact-Check Review)**

After the end of Step 4 (Draft Review Loop) and before Step 6 (Author Review), insert:

```markdown
### Step 5: Fact-Check Review

After the draft review loop (Step 4) completes, dispatch a fact-check reviewer subagent to verify factual claims. See [fact-check-reviewer-prompt.md](fact-check-reviewer-prompt.md) for the dispatch template.

1. Dispatch the fact-check reviewer with paths to `article.md`, `brief.md`, and `research.md` (if it exists)
2. The reviewer identifies factual claims, skips opinion expressions, and verifies claims online
3. Present the fact-check report to the author

**Resolution flow — for each flagged claim, the author chooses one of:**
- **Correct:** Accept the finding and update the passage in `article.md`
- **Rephrase as opinion:** Adjust wording to frame as experience (e.g., add "in my experience")
- **Provide source:** The author supplies the source; add it to `research.md`
- **Remove:** Remove the claim from the article

Whether the status is Approved or after all flagged issues are resolved, write verified sources to `research.md` under `## Fact-Check Sources`. If `research.md` does not exist, create it with only the `## Fact-Check Sources` section. Check "Fact-check completed" in the brief checklist.

No re-dispatch needed — each resolution is author-confirmed.
```

- [ ] **Step 7: Update the frontmatter description**

Update the SKILL.md frontmatter `description` to mention fact-checking:

Current:
```
description: Write an article based on a completed brief with materials. Produces a full first draft from the outline and author-sourced materials, then revises based on author feedback. Use when a brief has status "ready" and the user wants to start writing.
```

Replace with:
```
description: Write an article based on a completed brief with materials. Produces a full first draft from the outline and author-sourced materials, runs automated review and fact-check, then revises based on author feedback. Use when a brief has status "ready" and the user wants to start writing.
```

- [ ] **Step 8: Update the Writing Rules summary section**

In the `## Writing Rules` section near the bottom, update the "Always do" list. Change:

```
- Use the author's provided materials — never fabricate
```

to:

```
- Use the author's provided materials (including author-confirmed research) — never fabricate
```

- [ ] **Step 9: Update writing-reviewer-prompt.md step reference**

In `skills/article-writing/writing-reviewer-prompt.md`, update the step reference on line 3:

Current:
```
Use this template when dispatching a writing reviewer subagent during Step 3.5.
```

Replace with:
```
Use this template when dispatching a writing reviewer subagent during Step 4.
```

- [ ] **Step 10: Verify renumbering is consistent**

Run: `grep -n "Step [0-9]" skills/article-writing/SKILL.md skills/article-writing/writing-reviewer-prompt.md`
Expected: Steps 1 through 8 in SKILL.md, Step 4 in writing-reviewer-prompt.md, no 3.5-style decimals.

- [ ] **Step 11: Commit**

```bash
git add skills/article-writing/SKILL.md skills/article-writing/writing-reviewer-prompt.md
git commit -m "feat: add fact-check review step and renumber article-writing steps"
```

---

### Task 7: Update CLAUDE.md

**Files:**
- Modify: `CLAUDE.md`

Update the project-level documentation to reflect the new workflow steps, workspace structure, and status lifecycle.

- [ ] **Step 1: Update workspace structure**

In `CLAUDE.md`, replace the workspace structure code block (lines 29-37):

Current:
```
articles/{YYYY-MM-DD}_{slug}/
  article.md                 # Article content (clean prose, no metadata)
  brief.md                   # Brief, materials, outline, progress tracking
  assets/                    # Images and other assets
```

Replace with:
```
articles/{YYYY-MM-DD}_{slug}/
  article.md                 # Article content (clean prose, no metadata)
  brief.md                   # Brief, materials, outline, progress tracking
  research.md                # External research and fact-check sources
  assets/                    # Images and other assets
```

- [ ] **Step 2: Update status lifecycle**

Replace line 41:

Current:
```
`brief.md` status transitions: `draft` → `ready` → `writing` → `review`
```

Replace with:
```
`brief.md` status transitions: `draft` → `ready` → `writing` → `review` → `published`
```

- [ ] **Step 3: Update architecture description**

In the Architecture section, update the article-preparation description (line 14):

Current:
```
2. **article-preparation** (`skills/article-preparation/`) — Creates article directory, guides brief completion, interviews author for materials, builds outline with materials
```

Replace with:
```
2. **article-preparation** (`skills/article-preparation/`) — Creates article directory, guides brief completion, optional topic research, interviews author for materials, builds outline with materials
```

Update the article-writing description (line 15):

Current:
```
3. **article-writing** (`skills/article-writing/`) — Writes draft from materials-based outline, runs automated review loop, revises with author feedback
```

Replace with:
```
3. **article-writing** (`skills/article-writing/`) — Writes draft from materials-based outline, runs automated review and fact-check loops, revises with author feedback
```

- [ ] **Step 4: Update Writing Rules section**

Replace the Writing Rules section description (line 45):

Current:
```
The writing rules in `skills/article-writing/references/writing-rules.md` define prohibited AI patterns and quality requirements. The article-writing skill includes a draft review loop (Step 3.5) that dispatches a reviewer subagent using the template in `skills/article-writing/writing-reviewer-prompt.md`.
```

Replace with:
```
The writing rules in `skills/article-writing/references/writing-rules.md` define prohibited AI patterns and quality requirements. The article-writing skill includes a draft review loop (Step 4) that dispatches a writing reviewer subagent, followed by a fact-check review (Step 5) that dispatches a fact-check reviewer subagent.
```

- [ ] **Step 5: Update Materials principle**

In Key Design Principles, update the materials principle (line 25):

Current:
```
- **Materials are sacred**: Articles are written from author-sourced materials only. Never fabricate examples, numbers, or anecdotes.
```

Replace with:
```
- **Materials are sacred**: Articles are written from author-sourced materials and author-confirmed research findings. Never fabricate examples, numbers, or anecdotes.
```

- [ ] **Step 6: Verify all changes**

Run: `grep -n "research\|fact-check\|published\|Step [0-9]" CLAUDE.md`
Expected: research.md in workspace structure, fact-check in architecture, published in status lifecycle, integer step numbers.

- [ ] **Step 7: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: update CLAUDE.md for research and fact-check integration"
```
