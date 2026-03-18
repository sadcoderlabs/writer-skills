# Review Report and Commit Tracking Design

## Context

The article-writing skill's automated review process (writing-reviewer in Step 4, fact-check reviewer in Step 5) currently modifies `article.md` directly without preserving the original draft or explaining why changes were made. This creates two problems:

1. **No version history.** The first draft is overwritten by review fixes. There's no way to see what the original draft looked like or compare before/after.

2. **No change rationale.** The reviewer subagents fix issues silently — the author sees only the final result, not why each change was made. This makes it hard to learn from the review or to judge whether a change was appropriate.

This design adds **git commits at key milestones** and **structured review reports** that document every change and its rationale.

## Design Principles

**Transparency over automation.** Every automated change to the article must be accompanied by a written explanation. The author should be able to understand and evaluate each change.

**Author controls the pace.** After the first automatic review round, the author decides whether to run additional rounds or move to the next stage. No hard-coded iteration limits.

**Version history as safety net.** Git commits at each stage let the author compare versions, revert changes, or understand the evolution of the article.

**Separation of concerns.** Reviewer subagents produce content (article fixes + report text). The main flow handles file management (writing report files) and git operations (commits).

## Changes Overview

### New files (per article)

```
articles/{YYYY-MM-DD}_{slug}/
  article.md        # Article content (unchanged)
  brief.md          # Brief and tracking (unchanged)
  research.md       # Research sources (unchanged)
  assets/           # Images etc. (unchanged)
  reviews/          # Review reports (NEW)
    review-01-writing.md
    review-02-writing.md
    review-03-factcheck.md
    ...
```

### Modified skill files

| File | Change |
|------|--------|
| `skills/article-writing/SKILL.md` | Rewrite Steps 4-9 to add commits, reports, and author checkpoints |
| `skills/article-writing/writing-reviewer-prompt.md` | Change output format to structured review report |
| `skills/article-writing/fact-check-reviewer-prompt.md` | Change output format to structured review report; reviewer now fixes article directly |
| `CLAUDE.md` | Update workspace structure to include `reviews/` directory |

### Step renumbering

Steps are renumbered to accommodate the new commit step. The step count increases from 8 to 9.

## Article Writing: New Step Sequence

| Step | Content | Change |
|------|---------|--------|
| 1 | Read all inputs | Unchanged |
| 2 | Update status | Unchanged |
| 3 | Write first draft | Unchanged |
| **4** | **Commit first draft** | **New** |
| **5** | **Writing review loop (author-paced)** | **Replaces old Step 4** |
| **6** | **Fact-check review loop (author-paced)** | **Replaces old Step 5** |
| 7 | Author review | Was Step 6 |
| 8 | Revise based on feedback | Was Step 7 |
| 9 | Complete | Was Step 8 |

The new Step 4 (Commit First Draft) is inserted between writing and review. Old Steps 4-5 become new Steps 5-6 (with structural changes), and old Steps 6-8 shift to Steps 7-9.

### Step 4: Commit First Draft

After writing the complete first draft to `article.md`:

1. Git add `article.md` and `brief.md` (status was updated in Step 2)
2. Commit with message: `draft: complete first draft for {slug}`

This preserves the original draft before any automated review modifies it.

**Git availability:** If the workspace is not a git repository, skip all git commit steps (4, 5c, 6c) and continue the workflow normally. The review reports are still written regardless of git availability.

### Step 5: Writing Review Loop (Author-Paced)

**5a. Dispatch writing-reviewer subagent** (automatic — no confirmation needed for the first round).

The reviewer:
- Reads `article.md`, `references/writing-rules.md`, and `brief.md`
- Fixes flagged passages directly in `article.md`
- Returns a structured review report (see Review Report Format below)

**5b. Main flow writes the report** to `reviews/review-{NN}-writing.md`, where `{NN}` is the global review sequence number (zero-padded, starting at 01).

**5c. Git commit** with message: `review: writing review round {N} for {slug}`. Commit includes modified `article.md` and the new report file.

**5d. Present summary and ask author:**

If the reviewer returned Status "Approved" (no issues found), inform the author and auto-advance to Step 6:

```
Writing review complete. No issues found — report saved to reviews/review-{NN}-writing.md.
Moving to fact-check review.
```

If the reviewer returned Status "Issues Found", present the choice:

```
Writing review round {N} complete. Report saved to reviews/review-{NN}-writing.md.

Key findings:
- {1-2 sentence summary from the report's Overview field}

What would you like to do?
1. Run another writing review round
2. Move to fact-check review
```

**5e. If the author chooses another round:** increment the global sequence number and go back to 5a.

**5f. If the author chooses to move on (or auto-advanced):** proceed to Step 6.

### Step 6: Fact-Check Review Loop (Author-Paced)

**6a. Dispatch fact-check-reviewer subagent** (automatic — no confirmation needed for the first round).

The reviewer:
- Reads `article.md`, `brief.md`, and `research.md` (if exists)
- Identifies factual claims, skips opinion expressions, verifies claims online
- Fixes or flags issues directly in `article.md`
- Returns a structured review report (see Review Report Format below)

**6b. Main flow writes the report** to `reviews/review-{NN}-factcheck.md`.

**6c. Git commit** with message: `review: fact-check review round {N} for {slug}`. Commit includes modified `article.md`, the new report file, and `research.md` if modified.

**6d. Present summary and ask author:**

If the reviewer returned Status "Approved" (no issues found), inform the author and auto-advance to Step 7:

```
Fact-check review complete. No issues found — report saved to reviews/review-{NN}-factcheck.md.
Moving to author review.
```

If the reviewer returned Status "Issues Found", present the choice:

```
Fact-check review round {N} complete. Report saved to reviews/review-{NN}-factcheck.md.

Key findings:
- {1-2 sentence summary from the report's Overview field}

What would you like to do?
1. Run another fact-check review round
2. Move to author review
```

**6e. If the author chooses another round:** increment and go back to 6a.

**6f. If the author chooses to move on (or auto-advanced):** write any remaining verified sources to `research.md` under `## Fact-Check Sources` (create file if needed), check "Fact-check completed" in brief checklist. If `research.md` or `brief.md` were modified, git commit with message: `review: finalize fact-check for {slug}`. Proceed to Step 7.

### Change to fact-check resolution flow

**Deliberate design decision:** The current design has the fact-check reviewer return results for the author to resolve one-by-one (correct / rephrase / provide source / remove). This new design changes the fact-check reviewer to apply fixes directly to `article.md` (like the writing reviewer does) and document each change in the report.

This is a trade-off: the previous per-claim approval flow gave the author stronger control over each factual correction, but created significant back-and-forth overhead. The new design trades per-claim approval for a faster workflow where the reviewer acts autonomously, but the author retains full authority to override any change during Step 7 (Author Review) — where they see the complete article alongside all review reports with detailed rationale for each change. The git commit history also allows the author to diff before/after any review round.

## Review Report Format

Both reviewer types use the same base structure. Type-specific fields are noted.

```markdown
# Review Report — {Writing | Fact-Check} (Round {N})

## Summary

- **Status:** Issues Found | Approved
- **Issues count:** {N} issues identified
- **Rules violated:** {comma-separated list of rule names} ← writing review only
- **Overview:** {1-2 sentence overall assessment}

## Changes

### 1. {Short description of the change}

- **Location:** {Section heading or paragraph location}
- **Rule:** {Rule name violated} ← writing review only
- **Claim:** {The factual claim in question} ← fact-check only
- **Original:** > {Original text}
- **Revised:** > {Revised text}
- **Reason:** {Why this change was made}

### 2. {Short description of the change}
...
```

When Status is "Approved" (no issues found), the Changes section is empty and the Overview explains why the article passed. Both reviewer prompts must include explicit guidance for this case: "If no violations are found, return Status: Approved with an empty Changes section and an Overview explaining why the article passed review."

## Reviewer Prompt Changes

### writing-reviewer-prompt.md

Changes to the existing prompt:

1. **New responsibility:** The reviewer now fixes issues directly in `article.md`. This is a behavioral change — currently, the reviewer only returns a list of issues and the main flow applies fixes before re-dispatching. Moving the fix responsibility to the reviewer ensures the report accurately reflects what was changed.
2. **New input parameter:** `[REVIEW_ROUND_NUMBER]` — used in the report title.
3. **New output format:** The full review report format defined above, returned as text. The main flow writes it to a file.
4. **Removed:** The simple Status/Issues/Recommendations output format.

The reviewer's checking criteria (prohibited patterns, repetition, specificity, reader perspective, voice) and calibration rules remain unchanged.

### fact-check-reviewer-prompt.md

Changes to the existing prompt:

1. **New responsibility:** The reviewer now applies fixes directly to `article.md` instead of returning suggestions for author resolution.
2. **New input parameter:** `[REVIEW_ROUND_NUMBER]` — used in the report title.
3. **New output format:** The full review report format (with `Claim` field instead of `Rule`), returned as text.
4. **Removed:** The Verified/Unverified/Corrections output format and the per-claim author resolution flow.

The reviewer's identification criteria (factual claims vs. opinion expressions) and calibration rules remain unchanged.

## Git Commit Strategy

| Timing | Commit message | Files included |
|--------|---------------|----------------|
| After first draft (Step 4) | `draft: complete first draft for {slug}` | `article.md`, `brief.md` |
| After each writing review round (Step 5c) | `review: writing review round {N} for {slug}` | `article.md`, `reviews/review-{NN}-writing.md` |
| After each fact-check review round (Step 6c) | `review: fact-check review round {N} for {slug}` | `article.md`, `reviews/review-{NN}-factcheck.md`, `research.md` (if modified) |

**Round number clarification:** `{N}` in commit messages is the type-local round number (e.g., "writing review round 2" for the second writing review). `{NN}` in filenames is the zero-padded global sequence number across all review types.

All git operations are performed by the main flow, never by reviewer subagents.

## Global Review Sequence Number

The `{NN}` in report filenames is a zero-padded global counter that increments across all review types within one article. Example sequence:

```
review-01-writing.md      # Writing review round 1
review-02-writing.md      # Writing review round 2
review-03-factcheck.md    # Fact-check review round 1
review-04-factcheck.md    # Fact-check review round 2
```

The main flow tracks this counter. It starts at 1 when Step 5 begins and increments for every review dispatch regardless of type.

## Changes to Existing Files

### SKILL.md (article-writing)

- Rewrite Steps 4-9 according to the new step sequence
- Remove the 3-iteration hard limit from the writing review loop
- Remove the per-claim author resolution flow from fact-check
- Add git commit instructions at Steps 4, 5c, and 6c
- Add author checkpoint prompts at Steps 5d and 6d
- Update Step 9 (Complete) numbering

### writing-reviewer-prompt.md

- Add `[REVIEW_ROUND_NUMBER]` parameter
- Add instruction to fix issues directly in `article.md`
- Replace output format with the review report format
- Keep all checking criteria and calibration rules unchanged

### fact-check-reviewer-prompt.md

- Add `[REVIEW_ROUND_NUMBER]` parameter
- Add instruction to fix issues directly in `article.md`
- Replace output format with the review report format (using `Claim` field)
- Remove the per-claim resolution options (correct/rephrase/provide source/remove)
- Keep all identification criteria and calibration rules unchanged

### CLAUDE.md

Update workspace structure to include `reviews/` directory:

```
articles/{YYYY-MM-DD}_{slug}/
  article.md                 # Article content (clean prose, no metadata)
  brief.md                   # Brief, materials, outline, progress tracking
  research.md                # External research and fact-check sources
  reviews/                   # Review reports from automated reviewers
  assets/                    # Images and other assets
```

Update article-writing skill description to mention review reports and commit tracking. Update step number references (current "Step 4" → "Step 5", current "Step 5" → "Step 6").

## What Does NOT Change

- **writing-management skill:** Entirely unchanged
- **article-preparation skill:** Entirely unchanged
- **config.md / ideas.md formats:** Unchanged
- **brief.md format:** Unchanged (no new checklist items needed)
- **research.md format:** Unchanged
- **Writing rules (writing-rules.md):** Unchanged
- **Review criteria and calibration:** Both reviewers keep their existing checking logic
- **The "materials are sacred" principle:** Unchanged
- **Status lifecycle:** Unchanged (`draft` → `ready` → `writing` → `review` → `published`)
