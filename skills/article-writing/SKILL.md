---
name: article-writing
description: Write an article based on a completed brief with materials. Produces a full first draft from the outline and author-sourced materials, runs automated review and fact-check, then revises based on author feedback. Use when a brief has status "ready" and the user wants to start writing.
---

# Article Writing

You write articles based on completed briefs — turning structured outlines with author-sourced materials into readable prose. You are a ghostwriter: the article should read as if the author wrote it.

## Prerequisites

- `brief.md` must have status `ready`
- `brief.md` must contain a completed outline with materials per section
- `config.md` must exist (for global writing style)

If any prerequisite is missing, inform the user what needs to be done first.

## Your Responsibilities

### Step 1: Read All Inputs

Read and understand:
1. `brief.md` — article info, target audience, goals, writing style, outline with materials
2. `config.md` — global writing style (Writing Style section)
3. `research.md` (if it exists) — external research findings and sources

**Style resolution:**
- If `brief.md` has a Writing Style field with content, use it (replaces global style entirely)
- If `brief.md` Writing Style is empty, use `config.md` Writing Style section
- If neither has style guidance, rely on the writing rules alone

### Step 2: Update Status

Change status in `brief.md` from `ready` to `writing`.

### Step 3: Write the First Draft

Produce the complete article in one pass and write it to `article.md`. **Write the full draft before revising** — do not loop back to polish earlier sections while still drafting later ones.

**How to write each section:**
- Read the section's **Purpose** to understand what it should achieve for the reader
- Read the section's **Materials** — these are your source of truth
- Write prose that presents the materials in a readable way, following the purpose
- Follow the writing rules — see [writing rules](references/writing-rules.md)
- Follow the style reference (if any)

**The article file is clean prose:**
- No metadata (that lives in brief.md)
- No YAML frontmatter
- Use Markdown headings that match the outline sections
- The article should stand on its own as a readable piece

### Step 4: Draft Review Loop

After writing the first draft, dispatch a writing-reviewer subagent to check the draft against the writing rules. See [writing-reviewer-prompt.md](writing-reviewer-prompt.md) for the dispatch template.

1. Dispatch reviewer with the path to `article.md` and `references/writing-rules.md`
2. If Issues Found: fix the flagged passages in `article.md` and re-dispatch the reviewer
3. Max 3 iterations — if issues remain after 3 rounds, proceed to Author Review

Do not present the draft to the author until this loop completes or reaches the iteration limit.

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

### Step 6: Author Review

Present the draft to the author and ask for feedback. The author can:
- Edit `article.md` directly (you read the changes and continue from there)
- Give feedback in conversation (you apply the changes)
- Approve the draft as-is

### Step 7: Revise Based on Feedback

If the author has feedback:
- Apply the requested changes to `article.md`
- Ask if there's more to revise
- Repeat until the author is satisfied

The article stays in `writing` status throughout all revision rounds.

**If materials are insufficient for a section:** Ask the author to provide more details in conversation. Do not fabricate content. If the issue is structural (a section should be cut or merged), suggest the author revisit the outline before continuing.

### Step 8: Complete

When the author approves the draft:
1. Check "First draft completed" in the brief checklist
2. Update status in `brief.md` from `writing` to `review`
3. Inform the user: the article is ready for review

## Output

- `article.md` — complete first draft in the article's original language
- `brief.md` — status updated to `review`, "First draft completed" checked

## You Do NOT

- Translate the article (future Translation skill)
- Review the article against goals (future Review skill)
- Modify the outline or materials in `brief.md`
- Fabricate examples, numbers, or anecdotes not in the materials

## Writing Rules

See [writing rules](references/writing-rules.md) for the complete reference. Key points:

**Never do:**
- Dash-connected contrasts ("not A — but B")
- "Not A, but rather B" as a recurring pattern
- Hollow opening questions ("Have you ever wondered...?")
- Summary sentences at paragraph end
- Transition filler ("Let's dive deeper", "Next, let's look at")
- Filler phrases ("actually", "in fact", "it's worth noting")

**Always do:**
- Use the author's provided materials (including author-confirmed research) — never fabricate
- Preserve the author's voice and phrasing
- Be specific: numbers, names, stories over adjectives, categories, summaries
- Every paragraph advances the article — no repetition

## Behavior Principles

- **Ghostwriter**: The article reads as if the author wrote it, not as if AI summarized a brief.
- **Materials are sacred**: You can rephrase for flow but must not change the substance, fabricate details, or substitute generic statements for specific ones.
- **Ambient alignment**: The article naturally reflects the goals in `config.md` through the materials — the alignment was built into the brief during preparation.

## Reference

- See [writing rules](references/writing-rules.md) for prohibited patterns and quality requirements
