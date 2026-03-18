# Review Report and Commit Tracking Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add structured review reports and git commit tracking to the article-writing skill's automated review process.

**Architecture:** Modify four existing markdown files — the main SKILL.md workflow, both reviewer prompt templates, and CLAUDE.md. No new files are created in the skill itself; the `reviews/` directory is created at runtime by the skill during article writing.

**Tech Stack:** Markdown skill definitions (Agent Skills open standard)

**Spec:** `docs/superpowers/specs/2026-03-18-review-report-and-commit-design.md`

---

### Task 1: Update writing-reviewer-prompt.md

**Files:**
- Modify: `skills/article-writing/writing-reviewer-prompt.md`

- [ ] **Step 1: Rewrite the prompt template**

Replace the entire content of `writing-reviewer-prompt.md` with the updated version below. Key changes:
- Step reference updated from "Step 4" to "Step 5"
- Added `[REVIEW_ROUND_NUMBER]` parameter
- Reviewer now fixes issues directly in `article.md` (was: only reports issues)
- Output format changed from simple Status/Issues/Recommendations to structured review report
- Added explicit guidance for the "Approved" case

```markdown
# Writing Reviewer Prompt Template

Use this template when dispatching a writing reviewer subagent during Step 5.

**Purpose:** Review the draft against writing rules, fix violations directly, and produce a structured review report explaining each change.

**Dispatch after:** First draft is committed to git (Step 4).

~~~
Agent tool (general-purpose):
  description: "Review and fix article draft against writing rules"
  prompt: |
    You are a writing reviewer. Check this article draft against the writing rules,
    fix any violations directly in the article, and produce a structured review report.

    **Article to review and fix:** [ARTICLE_FILE_PATH]
    **Writing rules:** [WRITING_RULES_FILE_PATH]
    **Brief (for audience context):** [BRIEF_FILE_PATH]
    **Review round number:** [REVIEW_ROUND_NUMBER]

    Read all three files, then check the article for violations.

    ## What to Check

    | Category | What to Look For |
    |----------|------------------|
    | Prohibited patterns | Dash-connected contrasts, hollow opening questions, summary sentences at paragraph end, transition filler, filler phrases, listicle structure for non-list content, symmetrical sections |
    | Repetition | Paragraphs restating what a previous paragraph already said |
    | Specificity | Generic statements where the materials had concrete details |
    | Reader perspective | Paragraphs where a reader in the target audience would lack context to follow the point — missing background, undefined jargon, or assumptions not established earlier in the article |
    | Voice | Passages that sound like AI summarizing a brief rather than the author writing |

    ## Calibration

    **Only flag passages that clearly violate a rule.**

    Quote the offending passage and name the specific rule it breaks.
    Do not flag stylistic preferences or minor wording choices.
    If unsure whether something violates a rule, don't flag it.

    The writing rules file contains <example> blocks showing bad and good
    versions of each pattern. Use these to calibrate your judgment.

    ## Your Process

    1. Read the article and identify all violations
    2. For each violation, fix it directly in `article.md` using the Edit tool
    3. After all fixes are applied, produce the review report below

    ## Output Format

    Return the review report as text. The main flow will save it to a file.

    If no violations are found, return Status: Approved with an empty Changes
    section and an Overview explaining why the article passed review.

    # Review Report — Writing (Round [REVIEW_ROUND_NUMBER])

    ## Summary

    - **Status:** Approved | Issues Found
    - **Issues count:** {N} issues identified
    - **Rules violated:** {comma-separated list of rule names}
    - **Overview:** {1-2 sentence overall assessment}

    ## Changes

    ### 1. {Short description of the change}

    - **Location:** {Section heading or paragraph location}
    - **Rule:** {Rule name violated}
    - **Original:** > {Original text before your fix}
    - **Revised:** > {Text after your fix}
    - **Reason:** {Why this change was made}

    ### 2. ...
~~~

**Reviewer returns:** The complete review report as text, with all fixes already applied to `article.md`.
```

- [ ] **Step 2: Verify the file reads correctly**

Read `skills/article-writing/writing-reviewer-prompt.md` and confirm:
- The `[REVIEW_ROUND_NUMBER]` parameter appears in both the input list and the report title
- The "Your Process" section instructs the reviewer to fix issues using the Edit tool
- The "Approved" case guidance is present
- The output format matches the spec's review report format (with `Rule` field, no `Claim` field)

- [ ] **Step 3: Commit**

```bash
git add skills/article-writing/writing-reviewer-prompt.md
git commit -m "feat: update writing-reviewer prompt with report format and direct fixes"
```

---

### Task 2: Update fact-check-reviewer-prompt.md

**Files:**
- Modify: `skills/article-writing/fact-check-reviewer-prompt.md`

- [ ] **Step 1: Rewrite the prompt template**

Replace the entire content of `fact-check-reviewer-prompt.md` with the updated version below. Key changes:
- Step reference updated from "Step 5" to "Step 6"
- Added `[REVIEW_ROUND_NUMBER]` parameter
- Reviewer now fixes issues directly in `article.md` (was: returns suggestions for author resolution)
- Output format changed from Verified/Unverified/Corrections to structured review report
- Removed per-claim author resolution flow
- Added explicit guidance for the "Approved" case

```markdown
# Fact-Check Reviewer Prompt Template

Use this template when dispatching a fact-check reviewer subagent during Step 6.

**Purpose:** Verify factual claims in the article draft, fix issues directly, and produce a structured review report explaining each change.

**Dispatch after:** Writing review loop (Step 5) completes.

~~~
Agent tool (general-purpose):
  description: "Fact-check and fix article draft"
  prompt: |
    You are a fact-check reviewer. Verify the factual claims in this article draft,
    fix any issues directly in the article, and produce a structured review report.

    **Article to review and fix:** [ARTICLE_FILE_PATH]
    **Brief (for context):** [BRIEF_FILE_PATH]
    **Research notes (if exists):** [RESEARCH_FILE_PATH]
    **Review round number:** [REVIEW_ROUND_NUMBER]

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

    ## Your Process

    1. Read the article and identify all factual claims
    2. Verify each claim using research.md and online sources
    3. For claims that are incorrect or unverified, fix them directly in `article.md` using the Edit tool:
       - Incorrect claims: correct the information
       - Unverified claims that are non-essential: remove or rephrase as opinion
       - Unverified claims that are essential: keep but note in the report
    4. After all fixes are applied, produce the review report below

    ## Output Format

    Return the review report as text. The main flow will save it to a file.

    If no issues are found, return Status: Approved with an empty Changes
    section and an Overview explaining why the article passed review.

    # Review Report — Fact-Check (Round [REVIEW_ROUND_NUMBER])

    ## Summary

    - **Status:** Approved | Issues Found
    - **Issues count:** {N} issues identified
    - **Overview:** {1-2 sentence overall assessment}

    ## Changes

    ### 1. {Short description of the change}

    - **Location:** {Section heading or paragraph location}
    - **Claim:** {The factual claim in question}
    - **Original:** > {Original text before your fix}
    - **Revised:** > {Text after your fix}
    - **Reason:** {Why this change was made — include source URL if applicable}

    ### 2. ...
~~~

**Reviewer returns:** The complete review report as text, with all fixes already applied to `article.md`.
```

- [ ] **Step 2: Verify the file reads correctly**

Read `skills/article-writing/fact-check-reviewer-prompt.md` and confirm:
- The `[REVIEW_ROUND_NUMBER]` parameter appears in both the input list and the report title
- The "Your Process" section instructs the reviewer to fix issues using the Edit tool
- The "Approved" case guidance is present
- The output format uses `Claim` field (not `Rule`)
- No mention of the old per-claim author resolution flow (correct/rephrase/provide source/remove)

- [ ] **Step 3: Commit**

```bash
git add skills/article-writing/fact-check-reviewer-prompt.md
git commit -m "feat: update fact-check-reviewer prompt with report format and direct fixes"
```

---

### Task 3: Rewrite SKILL.md Steps 4-9

**Files:**
- Modify: `skills/article-writing/SKILL.md`

This is the largest task. It replaces old Steps 4-8 with new Steps 4-9: commit first draft, writing review loop, fact-check review loop, author review, revise, complete.

**Important:** Locate sections by heading text (e.g., `### Step 4:`), not by line numbers, because each replacement shifts subsequent line numbers.

- [ ] **Step 1: Replace Step 4 (was Draft Review Loop) with Commit First Draft**

In `skills/article-writing/SKILL.md`, find the heading `### Step 4: Draft Review Loop` and replace everything from that heading through the line "Do not present the draft to the author until this loop completes or reaches the iteration limit." with:

```markdown
### Step 4: Commit First Draft

After writing the complete first draft to `article.md`, commit the current state to preserve the original draft before automated review.

1. Git add `article.md` and `brief.md`
2. Commit with message: `draft: complete first draft for {slug}`

If the workspace is not a git repository, skip this step and proceed to Step 5.
```

- [ ] **Step 2: Replace Step 5 (was Fact-Check Review) with Writing Review Loop**

Find the heading `### Step 5: Fact-Check Review` and replace everything from that heading through the line "No re-dispatch needed — each resolution is author-confirmed." with the new writing review loop:

```markdown
### Step 5: Writing Review Loop

After committing the first draft, dispatch a writing-reviewer subagent to check the draft against the writing rules. See [writing-reviewer-prompt.md](writing-reviewer-prompt.md) for the dispatch template.

The review loop is author-paced: the first round runs automatically, then the author decides whether to continue.

**Global review sequence counter:** Initialize a counter at 1. This counter increments for every review dispatch (writing or fact-check) and is used for report filenames.

**5a.** Dispatch the writing-reviewer subagent with paths to `article.md`, `references/writing-rules.md`, `brief.md`, and the current review round number. The reviewer fixes issues directly in `article.md` and returns a structured review report.

**5b.** Write the returned report to `reviews/review-{NN}-writing.md`, where `{NN}` is the zero-padded global sequence number. Create the `reviews/` directory if it doesn't exist.

**5c.** Git commit with message: `review: writing review round {N} for {slug}`. Include modified `article.md` and the new report file. (`{N}` is the type-local round number; `{NN}` is the global sequence number.) Skip if not a git repository.

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
```

- [ ] **Step 3: Add Step 6 (Fact-Check Review Loop)**

Insert the new Step 6 after the Step 5 content just written:

```markdown
### Step 6: Fact-Check Review Loop

Dispatch a fact-check reviewer subagent to verify factual claims. See [fact-check-reviewer-prompt.md](fact-check-reviewer-prompt.md) for the dispatch template.

Like the writing review, the first round runs automatically, then the author decides whether to continue.

**6a.** Dispatch the fact-check reviewer with paths to `article.md`, `brief.md`, `research.md` (if it exists), and the current review round number. The reviewer fixes issues directly in `article.md` and returns a structured review report.

**6b.** Write the returned report to `reviews/review-{NN}-factcheck.md`.

**6c.** Git commit with message: `review: fact-check review round {N} for {slug}`. Include modified `article.md`, the new report file, and `research.md` if modified. (`{N}` is the type-local round number; `{NN}` is the global sequence number.) Skip if not a git repository.

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
```

- [ ] **Step 4: Renumber Steps 6-8 to 7-9**

Find the heading `### Step 6: Author Review` and replace everything from that heading through the end of Step 8 (the line "3. Inform the user: the article is ready for review") with renumbered versions:

```markdown
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
```

- [ ] **Step 5: Update the Output section**

Find the `## Output` section and replace:

```markdown
## Output

- `article.md` — complete first draft in the article's original language
- `brief.md` — status updated to `review`, "First draft completed" checked
```

With:

```markdown
## Output

- `article.md` — complete first draft in the article's original language
- `brief.md` — status updated to `review`, "First draft completed" checked
- `reviews/` — review reports from each automated review round
```

- [ ] **Step 6: Verify the full SKILL.md reads correctly**

Read the complete `skills/article-writing/SKILL.md` and verify:
- Steps are numbered 1-9 with no gaps or duplicates
- Step 4 is "Commit First Draft"
- Step 5 is "Writing Review Loop" with the global sequence counter
- Step 6 is "Fact-Check Review Loop" referencing the same counter
- Step 7 mentions the `reviews/` directory
- No remnants of old Step 4 (3-iteration limit) or old Step 5 (per-claim resolution flow)
- The frontmatter description still accurately describes the skill

- [ ] **Step 7: Commit**

```bash
git add skills/article-writing/SKILL.md
git commit -m "feat: rewrite article-writing steps 4-9 with review reports and commit tracking"
```

---

### Task 4: Update CLAUDE.md

**Files:**
- Modify: `CLAUDE.md:27-46`

- [ ] **Step 1: Update workspace structure**

In `CLAUDE.md`, find the Workspace Structure section (line 29-38) and add the `reviews/` directory. Replace:

```
articles/{YYYY-MM-DD}_{slug}/
  article.md                 # Article content (clean prose, no metadata)
  brief.md                   # Brief, materials, outline, progress tracking
  research.md                # External research and fact-check sources
  assets/                    # Images and other assets
```

With:

```
articles/{YYYY-MM-DD}_{slug}/
  article.md                 # Article content (clean prose, no metadata)
  brief.md                   # Brief, materials, outline, progress tracking
  research.md                # External research and fact-check sources
  reviews/                   # Review reports from automated reviewers
  assets/                    # Images and other assets
```

- [ ] **Step 2: Update step number references**

In `CLAUDE.md`, find line 46:

```
The writing rules in `skills/article-writing/references/writing-rules.md` define prohibited AI patterns and quality requirements. The article-writing skill includes a draft review loop (Step 4) that dispatches a writing reviewer subagent, followed by a fact-check review (Step 5) that dispatches a fact-check reviewer subagent.
```

Replace with:

```
The writing rules in `skills/article-writing/references/writing-rules.md` define prohibited AI patterns and quality requirements. The article-writing skill commits the first draft (Step 4), then runs an author-paced writing review loop (Step 5) that dispatches a writing reviewer subagent, followed by a fact-check review loop (Step 6) that dispatches a fact-check reviewer subagent. Both reviewers produce structured review reports saved to the article's `reviews/` directory.
```

- [ ] **Step 3: Verify CLAUDE.md reads correctly**

Read `CLAUDE.md` and confirm:
- The workspace structure includes `reviews/`
- Step references say Step 5 (writing) and Step 6 (fact-check)
- Review reports are mentioned

- [ ] **Step 4: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: update CLAUDE.md with review reports and new step numbers"
```

---

### Task 5: Final Verification

- [ ] **Step 1: Cross-reference all files**

Read all four modified files and verify consistency:
- `SKILL.md` Step 5 says "See writing-reviewer-prompt.md" → that file exists and its step reference says "Step 5"
- `SKILL.md` Step 6 says "See fact-check-reviewer-prompt.md" → that file exists and its step reference says "Step 6"
- `CLAUDE.md` step numbers match `SKILL.md` step numbers
- The review report format in both prompt templates matches the spec's format
- Both prompt templates include the `[REVIEW_ROUND_NUMBER]` parameter
- Both prompt templates include "Approved" case guidance

- [ ] **Step 2: Verify no stale references remain**

Search all files in `skills/article-writing/` and `CLAUDE.md` for:
- "Step 4" that should now be "Step 5" (draft review references)
- "Step 5" that should now be "Step 6" (fact-check references)
- "Max 3 iterations" (removed)
- "correct / rephrase / provide source / remove" or similar per-claim resolution language (removed from fact-check)

- [ ] **Step 3: Commit any fixes if needed**

If any stale references were found, fix them and commit:

```bash
git add -A
git commit -m "fix: clean up stale step references"
```
