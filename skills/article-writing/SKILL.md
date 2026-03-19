---
name: article-writing
description: Write an article based on a completed brief with materials. Produces a full first draft from the outline and author-sourced materials, runs automated review and fact-check, then revises based on author feedback. Use when a brief has status "ready" and the user wants to start writing.
---

# Article Writing

You write articles based on completed briefs — turning structured outlines with author-sourced materials into readable prose. You are a ghostwriter: the article should read as if the author wrote it.

## Prerequisites

- `brief.md` must have status `ready`
- `brief.md` must contain a completed outline with materials per section
- `writing.config.md` must exist at the repository root (for global writing style)
- Read the `workspace` field from `writing.config.md` frontmatter (default: `.`). If the value starts with `/`, use it as an absolute path; otherwise resolve it relative to the repo root. The article directory containing `brief.md` is inside `{workspace}/articles/`.

If any prerequisite is missing, inform the user what needs to be done first.

## Your Responsibilities

### Step 1: Read All Inputs

Read and understand:
1. `brief.md` — article info, target audience, goals, writing style, outline with materials
2. `writing.config.md` — global writing style (Writing Style section)
3. `research.md` (if it exists) — external research findings and sources

**Style resolution:**
- If `brief.md` has a Writing Style field with content, use it (replaces global style entirely)
- If `brief.md` Writing Style is empty, use `writing.config.md` Writing Style section
- If neither has style guidance, rely on the writing rules alone

### Step 2: Update Status

Change status in `brief.md` from `ready` to `writing`.

### Step 3: Write the First Draft

Produce the complete article in one pass and write it to `article.md`. **Write the full draft before revising** — do not loop back to polish earlier sections while still drafting later ones.

**How to write each section:**
- Read the section's **Purpose** to understand what it should achieve for the reader
- Read the section's **Materials** — these are your source of truth
- Write prose that presents the materials in a readable way, following the purpose
- When referencing data, statistics, or findings from `research.md` or the materials, include Markdown links to the source URLs where available
- Follow the writing rules — see [writing rules](references/writing-rules.md)
- Follow the style reference (if any)

**The article file is clean prose:**
- No metadata (that lives in brief.md)
- No YAML frontmatter
- Use Markdown headings that match the outline sections
- The article should stand on its own as a readable piece

### Step 4: Commit First Draft

After writing the complete first draft to `article.md`, commit the current state to preserve the original draft before automated review.

1. Git add `article.md` and `brief.md`
2. Commit with message: `draft: complete first draft for {slug}`

If the workspace is an absolute path, run git commands from the workspace directory (e.g., `git -C {workspace} add ...`). If the workspace is not a git repository, skip this step and proceed to Step 5.

### Step 5: Writing Review Loop

After committing the first draft, dispatch a writing-reviewer subagent to check the draft against the writing rules. See [writing-reviewer-prompt.md](writing-reviewer-prompt.md) for the dispatch template.

The review loop is author-paced: the first round runs automatically, then the author decides whether to continue.

**Global review sequence counter:** Initialize a counter at 1. This counter increments for every review dispatch (writing or fact-check) and is used for report filenames.

**5a.** Dispatch the writing-reviewer subagent with paths to `article.md`, `references/writing-rules.md`, `brief.md`, `research.md` (if it exists), and the current review round number. The reviewer fixes issues directly in `article.md` and returns a structured review report.

**5b.** Write the returned report to `reviews/review-{NN}-writing.md`, where `{NN}` is the zero-padded global sequence number. Create the `reviews/` directory if it doesn't exist.

**5c.** Git commit with message: `review: writing review round {N} for {slug}`. Include modified `article.md` and the new report file. (`{N}` is the type-local round number; `{NN}` is the global sequence number.) If the workspace is an absolute path, run git commands from the workspace directory. Skip if not a git repository.

**5d.** Present the result to the author:

If Status is "Approved": inform the author and auto-advance to Step 6.

> Writing review complete. No issues found — report saved to `reviews/review-{NN}-writing.md`. Moving to fact-check review.

If Status is "Issues Found": present the choice.

> Writing review round {N} complete. Report saved to `reviews/review-{NN}-writing.md`.
>
> Key findings:
> - {1-2 sentence summary from the report's Overview}
>
> What would you like to do?
> 1. Run another writing review round
> 2. Move to fact-check review

**5e.** If the author chooses another round: increment the global sequence counter and go back to 5a.

**5f.** If the author chooses to move on (or auto-advanced): proceed to Step 6.

### Step 6: Fact-Check Review Loop

Dispatch a fact-check reviewer subagent to verify factual claims. See [fact-check-reviewer-prompt.md](fact-check-reviewer-prompt.md) for the dispatch template.

Like the writing review, the first round runs automatically, then the author decides whether to continue.

**6a.** Dispatch the fact-check reviewer with paths to `article.md`, `brief.md`, `research.md` (if it exists), and the current review round number. The reviewer fixes issues directly in `article.md` and returns a structured review report.

**6b.** Write the returned report to `reviews/review-{NN}-factcheck.md`.

**6c.** Git commit with message: `review: fact-check review round {N} for {slug}`. Include modified `article.md`, the new report file, and `research.md` if modified. (`{N}` is the type-local round number; `{NN}` is the global sequence number.) If the workspace is an absolute path, run git commands from the workspace directory. Skip if not a git repository.

**6d.** Present the result to the author:

If Status is "Approved": inform the author and auto-advance to Step 7.

> Fact-check review complete. No issues found — report saved to `reviews/review-{NN}-factcheck.md`. Moving to author review.

If Status is "Issues Found": present the choice.

> Fact-check review round {N} complete. Report saved to `reviews/review-{NN}-factcheck.md`.
>
> Key findings:
> - {1-2 sentence summary from the report's Overview}
>
> What would you like to do?
> 1. Run another fact-check review round
> 2. Move to author review

**6e.** If the author chooses another round: increment the global sequence counter and go back to 6a.

**6f.** If the author chooses to move on (or auto-advanced): write any remaining verified sources to `research.md` under `## Fact-Check Sources` (create the file if needed). Check "Fact-check completed" in the brief checklist. If `research.md` or `brief.md` were modified, git commit with message: `review: finalize fact-check for {slug}`. Proceed to Step 7.

### Step 7: Author Review

Present the draft to the author and ask for feedback. Point the author to the `reviews/` directory where they can read the full review reports for context on changes made during automated review. The author can:
- Edit `article.md` directly (you read the changes and continue from there)
- Give feedback in conversation (you apply the changes)
- Approve the draft as-is

### Step 8: Revise Based on Feedback

If the author has feedback:
- Apply the requested changes to `article.md`
- Ask if there's more to revise
- Repeat until the author is satisfied

The article stays in `writing` status throughout all revision rounds.

**If materials are insufficient for a section:** Ask the author to provide more details in conversation. Do not fabricate content. If the issue is structural (a section should be cut or merged), suggest the author revisit the outline before continuing.

### Step 9: Complete

When the author approves the draft:
1. Check "First draft completed" in the brief checklist
2. Update status in `brief.md` from `writing` to `review`
3. Inform the user: the article is ready for review

## Output

- `article.md` — complete first draft in the article's original language
- `brief.md` — status updated to `review`, "First draft completed" checked
- `reviews/` — review reports from each automated review round

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
- **Ambient alignment**: The article naturally reflects the goals in `writing.config.md` through the materials — the alignment was built into the brief during preparation.

## Reference

- See [writing rules](references/writing-rules.md) for prohibited patterns and quality requirements
