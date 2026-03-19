# Writing Rules Update Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add two new writing rules to `writing-rules.md` extracted from manual article revision patterns.

**Architecture:** Two additions to a single file — one prohibited pattern (paragraph-level) and one required quality item. Uses existing `<example>` tag format for consistency.

**Spec:** `docs/superpowers/specs/2026-03-19-writing-rules-update-design.md`

---

### Task 1: Add "Abstract conclusion sentences" prohibited pattern

**Files:**
- Modify: `skills/article-writing/references/writing-rules.md:71-72` (after the "Repetition across paragraphs" entry, before `### Structure-level`)

- [ ] **Step 1: Add the new prohibited pattern**

Insert after the "Repetition across paragraphs" entry (after line 71), before the `### Structure-level` heading:

```markdown
- **Abstract conclusion sentences**: Don't end a point with a vague conclusion like "this changed my entire approach" or "this distinction is important." The reader learns nothing. Replace with a concrete outcome, example, or consequence that shows what actually changed.

<example type="bad">
The preparation phase determines content quality, while the writing phase determines expression. This distinction changed the entire direction of my system design.
</example>

<example type="good">
Beyond writing technique, pre-writing preparation is a major factor. This shaped my design approach: extract raw materials first, then let AI do the writing.
</example>

The ending should show what concretely changed, not just assert that something changed.
```

- [ ] **Step 2: Verify the file structure is correct**

Read `skills/article-writing/references/writing-rules.md` and confirm:
- The new entry sits under `### Paragraph-level`
- It appears before `### Structure-level`
- The `<example>` tags match the existing format

- [ ] **Step 3: Commit**

```bash
git add skills/article-writing/references/writing-rules.md
git commit -m "feat: add prohibited pattern for abstract conclusion sentences"
```

### Task 2: Add "Make abstract concepts tangible" required quality

**Files:**
- Modify: `skills/article-writing/references/writing-rules.md` (at the end of the `## Required Quality` section)

- [ ] **Step 1: Add the new required quality item**

Append after the "Advance, don't repeat" entry at the end of the file:

```markdown
### Make abstract concepts tangible
- When explaining abstract concepts or methodology, use metaphors or concrete sensory experiences so the reader can *feel* it, not just understand it.
- A well-chosen metaphor grounds the reader. Pair it with specific emotional or physical scenarios they can identify with.

<example type="bad">
Instead of making AI write better, I shifted to helping authors extract the materials from their minds.
</example>

<example type="good">
Through Q&A, extract the author's experiential materials — use these as raw ingredients and let AI cook them into a dish. Find the article's "soul": maybe it's the frustration of debugging for half a day only to find a trivial fix, or the satisfaction of changing one line and watching everything work.
</example>
```

- [ ] **Step 2: Verify the file structure is correct**

Read `skills/article-writing/references/writing-rules.md` and confirm:
- The new entry sits under `## Required Quality`
- The `<example>` tags match the existing format
- The file ends cleanly

- [ ] **Step 3: Commit**

```bash
git add skills/article-writing/references/writing-rules.md
git commit -m "feat: add required quality rule for tangible abstract concepts"
```
