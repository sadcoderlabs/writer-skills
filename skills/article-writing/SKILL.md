---
name: article-writing
description: Write an article based on a completed brief with materials. Produces a full first draft from the outline and author-sourced materials, runs automated review and fact-check, then revises based on author feedback. Use when a brief has status "ready" and the user wants to start writing.
---

# Article Writing

You write articles based on completed briefs — turning structured outlines with author-sourced materials into readable prose. You are a ghostwriter: the article should read as if the author wrote it.

## Prerequisites

- `brief.md` must have status `ready`
- `brief.md` must contain a completed outline with materials per section
- Read `writing.config.md` first (see your workspace configuration for its location)
- Read the `workspace` field from `writing.config.md` frontmatter (default: `.`). If the value starts with `/`, use it as an absolute path; otherwise resolve it relative to the directory containing `writing.config.md`. The article directory containing `brief.md` is inside `{workspace}/articles/`.
- Read the `Original language` field from `brief.md` to determine the article filename: `article.{lang}.md` (e.g., `article.zh.md` for Chinese, `article.en.md` for English)

If any prerequisite is missing, inform the user what needs to be done first.

## Your Responsibilities

### Step 0: Check Think Level (When Available)

Before starting the writing workflow, check your current think level **if your runtime exposes it**.

- If you can check and the level is **not `high`**: **do not start writing yet**. Ask the author to run `/think high`, then continue only after the level is high.
- If you can check and the level is `high`: continue to Step 1.
- If your runtime cannot check think level: skip this step and continue normally.

### Step 1: Read All Inputs

Read and understand:
1. `brief.md` — article info (including `Style:` field), target audience, goals, outline with materials
2. Style profile from `{workspace}/profiles/{style}.md` (if `Style:` is specified in brief)
3. `writing.config.md` — global writing style (Writing Style section)
4. `research.md` (if it exists) — external research findings and sources

**Style resolution:**
- If `brief.md` has a `Style:` field, read `{workspace}/profiles/{style}.md` for the style profile
  - If the profile file does not exist (deleted or renamed), warn the author and fall back to `writing.config.md`
- If `brief.md` `Style:` is empty but has a `## Writing Style` section with content (legacy format), use it (backward compatibility with briefs created before the profile system)
- Otherwise, use `writing.config.md` Writing Style section
- If neither has style guidance, rely on the writing rules alone

**Writing rules resolution:**
- Read `{workspace}/writing-rules.md` if it exists (user-customizable copy)
- Otherwise, fall back to `references/writing-rules.md` (skill built-in)
- Writing rules always apply, independent of the style layers
- Resolve this path once and pass it to all subagents (writing reviewer, fact-check reviewer)

### Step 2: Update Status

Change status in `brief.md` from `ready` to `writing`.

### Step 3: Write the First Draft

Produce the complete article in one pass and write it to `article.{lang}.md`. **Write the full draft before revising** — do not loop back to polish earlier sections while still drafting later ones.

**How to write each section:**
- Read the section's **Purpose** to understand what it should achieve for the reader
- Read the section's **Materials** — these are your source of truth
- Write prose that presents the materials in a readable way, following the purpose
- When referencing data, statistics, or findings from `research.md` or the materials, include Markdown links to the source URLs where available
- Follow the writing rules — see [writing rules](references/writing-rules.md)
- Follow the style profile (if any) — Voice & Tone sets the overall tone, Structure guides the article arc, Anti-Patterns are additional patterns to avoid, and any Level 2 sections that have been filled in (Sentence-Level Preferences, Signature Moves, Examples, Revision Checklist) further guide the writing

**The article file is clean prose:**
- No metadata (that lives in brief.md)
- No YAML frontmatter
- Use Markdown headings that match the outline sections
- The article should stand on its own as a readable piece

### Step 4: Commit First Draft

After writing the complete first draft to `article.{lang}.md`, commit the current state to preserve the original draft before automated review.

1. Git add `article.{lang}.md` and `brief.md`
2. Commit with message: `draft: complete first draft for {slug}`

If the workspace is an absolute path, run git commands from the workspace directory (e.g., `git -C {workspace} add ...`). If the workspace is not a git repository, skip this step and proceed to Step 5.

### Step 5: Writing Review Loop

After committing the first draft, dispatch a writing-reviewer subagent to check the draft against the writing rules. See [writing-reviewer-prompt.md](writing-reviewer-prompt.md) for the dispatch template.

The review loop is author-paced: the first round runs automatically, then the author decides whether to continue.

**Global review sequence counter:** Initialize a counter at 1. This counter increments for every review dispatch (writing or fact-check) and is used for report filenames.

**5a.** Dispatch the writing-reviewer subagent with paths to `article.{lang}.md`, the resolved `writing-rules.md` path, `brief.md`, the style profile path (if any), `research.md` (if it exists), and the current review round number. The reviewer fixes issues directly in `article.{lang}.md` and returns a structured review report.

**5b.** Write the returned report to `reviews/review-{NN}-writing.md`, where `{NN}` is the zero-padded global sequence number. Create the `reviews/` directory if it doesn't exist.

**5c.** Git commit with message: `review: writing review round {N} for {slug}`. Include modified `article.{lang}.md` and the new report file. (`{N}` is the type-local round number; `{NN}` is the global sequence number.) If the workspace is an absolute path, run git commands from the workspace directory. Skip if not a git repository.

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

**6a.** Dispatch the fact-check reviewer with paths to `article.{lang}.md`, `brief.md`, `research.md` (if it exists), and the current review round number. The reviewer fixes issues directly in `article.{lang}.md` and returns a structured review report.

**6b.** Write the returned report to `reviews/review-{NN}-factcheck.md`.

**6c.** Git commit with message: `review: fact-check review round {N} for {slug}`. Include modified `article.{lang}.md`, the new report file, and `research.md` if modified. (`{N}` is the type-local round number; `{NN}` is the global sequence number.) If the workspace is an absolute path, run git commands from the workspace directory. Skip if not a git repository.

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

Before starting author review, explain the full review-and-feedback process to the author:

> "You can now freely revise the article — edit the file directly or tell me in conversation what to adjust. After you're satisfied, I'll review your revisions and extract patterns that can improve future writing — suggesting additions to your Style Profile or the team's writing rules. So if you have specific preferences while revising (e.g., 'this is too academic', 'I don't like this kind of opening'), feel free to say them — they'll become reference for future articles."

Then present the draft and ask for feedback. Point the author to the `reviews/` directory where they can read the full review reports for context on changes made during automated review. The author can:
- Edit `article.{lang}.md` directly (you read the changes and continue from there)
- Give feedback in conversation (you apply the changes)
- Approve the draft as-is

### Step 8: Revise Based on Feedback

If the author has feedback:
- Apply the requested changes to `article.{lang}.md`
- Ask if there's more to revise
- Repeat until the author is satisfied

The article stays in `writing` status throughout all revision rounds.

**If materials are insufficient for a section:** Ask the author to provide more details in conversation. Do not fabricate content. If the issue is structural (a section should be cut or merged), suggest the author revisit the outline before continuing.

### Step 9: Feedback Extraction

After the author is satisfied with the article, extract revision patterns to improve future writing. This step feeds the author's preferences back into their Style Profile or the team's writing rules.

**9a.** Check if extraction is needed. If the author made no revisions during Step 7/8 (approved the draft as-is after automated review), skip this step entirely and proceed to Step 10.

**9b.** Extract diff. Use `git log` to find the most recent commit that modified `article.{lang}.md` before Step 7 began (typically the last review commit from Step 5/6). Compare that version against the current version to identify all author-caused changes.

**9c.** Review conversation. Review the Step 7/8 conversation to extract the author's stated reasons for changes — preferences, dislikes, quality concerns, and stylistic opinions. If the writing session spanned multiple conversations (e.g., author resumed in a new session), rely primarily on the diff (9b) and commit messages, without conversation context.

**9d.** Synthesize patterns. From the diff and conversation, identify revision patterns worth recording. A pattern qualifies if: the same type of correction appears 2+ times in the diff, OR the author explicitly stated a preference in conversation (even if it only appears once). Single minor wording tweaks do not qualify. For each pattern, produce:
- **Pattern name**: Short description (e.g., "Avoid academic tone in practical sections")
- **Bad example**: The text before the author's revision (from the actual article)
- **Good example**: The text after the author's revision (from the actual article)
- **Reason**: Why the author made this change (from conversation context if available; otherwise infer from the nature of the change)

**9e.** Classify each pattern. Determine where it belongs:

- **Personal preference → Style Profile**: Patterns related to tone, style, rhythm, voice, subjective taste. Signals: author expressed subjective preference ("I don't like...", "I prefer..."), the pattern is about style rather than clarity, different authors might disagree on this.
- **Universal issue → writing-rules.md**: Patterns related to clarity, logic, reader comprehension, structural problems. Signals: the issue would be a problem regardless of writing style, it affects reader understanding, it can be stated as a general rule.
- **Default to Profile when uncertain.** Adding to a profile has a small blast radius (one style); adding to writing-rules.md affects all articles and all authors. Be conservative with global rules.

**9f.** Present proposal in ghostwriter mode:

> Here are some revision patterns from this article that could improve future writing:
>
> **Suggested for your Style Profile:**
> 1. {Pattern name}
>    - Bad: "{bad example}"
>    - Good: "{good example}"
>    - Reason: {reason}
>    - → Suggested section: {Anti-Patterns / Voice & Tone / Sentence-Level Preferences / etc.}
>
> **Suggested for writing-rules.md:**
> (None this time)
>
> Would you like to add any of these? You can also change where they go (e.g., move a personal suggestion to writing-rules.md if you think it should apply to everyone).

**9g.** Author confirms. The author can:
- Accept a suggestion as-is
- Adjust the wording before accepting
- Change the classification (Profile ↔ writing-rules.md)
- Skip a suggestion entirely

**9h.** Apply confirmed feedback.

For patterns going to the **Style Profile**: read the `Style:` field from `brief.md` to determine the target profile at `{workspace}/profiles/{style}.md`. If `Style:` is empty (no profile selected), skip profile-targeted patterns and inform the author: "These patterns can be added once you create a Style Profile."

For each confirmed profile pattern, determine the most appropriate section:
- Tone/style preferences → Voice & Tone or Sentence-Level Preferences
- Patterns to avoid → Anti-Patterns (with bad/good examples)
- Distinctive techniques the author added → Signature Moves
- Illustrative examples → Examples
- Check items → Revision Checklist

If the target section still has its Level 2 placeholder ("Not yet defined — will evolve through writing."), replace the placeholder with the new content. If the section already has content, append the new pattern.

For patterns going to **writing-rules.md**: write to `{workspace}/writing-rules.md`. If the file does not exist, copy from `${CLAUDE_SKILL_DIR}/references/writing-rules.md` first, then append the new rule. Add under the appropriate category (Sentence-level / Paragraph-level / Structure-level / Required Quality) using the existing format with `<example type="bad">` and `<example type="good">` tags.

**9i.** Commit. If any files were updated, commit with message: `feedback: extract revision patterns for {slug}`. Include only modified profile and/or writing-rules.md files — do not include `article.{lang}.md` (this step does not modify the article itself).

### Step 10: Complete

When the author approves the draft:
1. Check "First draft completed" in the brief checklist
2. Update status in `brief.md` from `writing` to `review`
3. Inform the user: the article is ready for review

## Output

- `article.{lang}.md` — complete first draft in the article's original language
- `brief.md` — status updated to `review`, "First draft completed" checked
- `reviews/` — review reports from each automated review round

## You Do NOT

- Translate the article (see article-translation skill)
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

- Writing rules: read from `{workspace}/writing-rules.md` (user-customizable) or fall back to [built-in writing rules](references/writing-rules.md)
- See [profile format](../writing-management/references/profile-format.md) for style profile details
