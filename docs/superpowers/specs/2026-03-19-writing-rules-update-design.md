# Writing Rules Update: Extract Techniques from Article Revision

## Context

After publishing the first article written with writer-skills (`building-writer-skills`), the author revised the AI-generated first draft with manual edits (commit `1719d39` in sadcoder-press). Two recurring revision patterns were identified as generalizable writing rules worth codifying into `writing-rules.md`.

## Changes

### 1. New Prohibited Pattern: Abstract conclusion sentences (Paragraph-level)

**Location**: `skills/article-writing/references/writing-rules.md` → Prohibited Patterns → Paragraph-level

**Rule**: Don't end a point with a vague conclusion sentence like "this changed my entire approach" or "this distinction is important." The reader learns nothing from it. Replace with a concrete outcome, example, or consequence that shows what actually changed.

**Example**:

```
Bad:
The preparation phase determines content quality, while the writing phase determines expression.
This distinction changed the entire direction of my system design.

Good:
Beyond writing technique, pre-writing preparation is a major factor. This shaped my design
approach: extract raw materials first, then let AI do the writing.
```

The good version replaces "changed the entire direction" with a concrete description of what the direction actually became.

### 2. New Required Quality: Make abstract concepts tangible

**Location**: `skills/article-writing/references/writing-rules.md` → Required Quality

**Rule**: When explaining abstract concepts or methodology, use metaphors or concrete sensory experiences so the reader can *feel* it, not just understand it.

**Example**:

```
Bad:
Instead of making AI write better, I shifted to helping authors extract the materials from
their minds.

Good:
Through Q&A, extract the author's experiential materials — use these as raw ingredients and
let AI cook them into a dish. Find the article's "soul": maybe it's the frustration of
debugging for half a day only to find a trivial fix, or the satisfaction of changing one line
and watching everything work.
```

The good version uses a cooking metaphor to make the abstract process concrete, then grounds it further with two emotional scenarios the reader can identify with.

## Scope

- Only `skills/article-writing/references/writing-rules.md` is modified
- Two additions: one prohibited pattern, one required quality item
- No changes to SKILL.md, reviewer prompts, or other skills
