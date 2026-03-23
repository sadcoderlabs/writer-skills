# Style Profile System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add shareable Style Profiles to the writing workflow, enabling per-author writing voices with a two-layer style resolution (profile > global config) and customizable writing-rules.md.

**Architecture:** Style Profiles are markdown files in `{workspace}/profiles/`. The writing-management skill gains profile creation/update responsibility via AI interview. article-preparation selects profiles during brief completion. article-writing resolves style from profile → config fallback. writing-rules.md is copied to workspace for user customization.

**Spec:** `docs/superpowers/specs/2026-03-23-style-profile-system-design.md`

---

## File Structure

### New files to create

| File | Purpose |
|------|---------|
| `skills/writing-management/assets/profile-template.md` | Template copied to `{workspace}/profiles/` when creating a new profile |
| `skills/writing-management/references/profile-format.md` | Documents the profile format for reference |

### Existing files to modify

| File | Change |
|------|--------|
| `skills/writing-management/SKILL.md` | Add Section 5 (Manage Style Profiles) + workspace init additions |
| `skills/article-preparation/SKILL.md` | Replace Step 2 item 11 (Writing Style) with Style Profile selection |
| `skills/article-preparation/assets/brief-template.md` | Add `Style:` field, remove `## Writing Style` section |
| `skills/article-preparation/references/brief-format.md` | Update field descriptions for `Style:`, remove `## Writing Style` docs |
| `skills/article-writing/SKILL.md` | Update style resolution logic + writing-rules.md path resolution |
| `skills/article-writing/writing-reviewer-prompt.md` | Accept resolved writing-rules.md path + style profile path |
| `skills/article-writing/fact-check-reviewer-prompt.md` | No change needed (fact-checking is about accuracy, not style) |
| `skills/writing-management/references/config-format.md` | Add note about relationship between global style and profiles |
| `CLAUDE.md` | Add `profiles/` and `writing-rules.md` to workspace structure diagram |

---

## Task 1: Create profile template and format reference

**Files:**
- Create: `skills/writing-management/assets/profile-template.md`
- Create: `skills/writing-management/references/profile-format.md`

- [ ] **Step 1: Create profile template**

Create `skills/writing-management/assets/profile-template.md`:

```markdown
---
created_by: {creator name}
---

# {Style Name}

## Voice & Tone
{Concrete contextual descriptions: formality level, emotional temperature, when humor fits, what tone feels "completely wrong"}

## Structure
{How pieces move. e.g., "Open with friction → document experimentation → surface pattern → deliver framework"}

## Anti-Patterns
{Patterns to avoid in this style, with before/after examples. Complements the workspace writing-rules.md — do not repeat rules already there.}

## Sentence-Level Preferences
Not yet defined — will evolve through writing.

## Signature Moves
Not yet defined — will evolve through writing.

## Examples
Not yet defined — will evolve through writing.

## Revision Checklist
Not yet defined — will evolve through writing.
```

- [ ] **Step 2: Create profile format reference**

Create `skills/writing-management/references/profile-format.md`:

```markdown
# Style Profile Format

## Overview

A Style Profile captures a shareable writing voice. It is not an author identity — anyone on the team can select any profile to write with. The creator opens their style for others to use.

## Location

Profiles are stored at `{workspace}/profiles/{style-name}.md`. Filenames use lowercase with hyphens (e.g., `pragmatic-builder.md`).

## Frontmatter

```yaml
---
created_by: Bernard
---
```

- `created_by`: Human-readable name of the person who created this profile

## Sections

### Level 1 (required at creation)

These sections are filled during the AI interview when creating a profile:

- **Voice & Tone**: Concrete contextual descriptions — formality level, emotional temperature, when humor fits, what tone feels "completely wrong". Use specific descriptions, not flattering adjectives like "clear" or "smart".
- **Structure**: How articles move. Describes the typical arc or progression pattern. e.g., "Open with friction → document experimentation → surface pattern → deliver framework".
- **Anti-Patterns**: Patterns this style avoids, with before/after examples. Complements the workspace `writing-rules.md` (which covers universal AI writing pitfalls) — do not repeat rules already there.

### Level 2 (accumulates over time)

These sections start with a placeholder and grow through writing experience:

- **Sentence-Level Preferences**: Specific line-by-line choices — short vs. long sentences, formal vs. colloquial, specific phrasing preferences.
- **Signature Moves**: Distinctive structural or rhetorical habits. e.g., "Borrowed Lens" (explaining tech through cooking metaphors), "Adventure Narrative" (framing a technical decision as a journey).
- **Examples**: Positive and negative examples paired with explanations of why they work or fail. Can be fragments from past articles.
- **Revision Checklist**: Checks built from observed errors during actual writing, not theoretical concerns. e.g., "Stakes clear by paragraph one?", "At least one real number per major section?"

## Style Resolution

When article-writing reads style, the resolution order is:

1. Style Profile specified in `brief.md` `Style:` field
2. `## Writing Style` in `writing.config.md` (global fallback)

The workspace `writing-rules.md` always applies independently — it is universal AI writing pattern defense, not part of the style layers.

## Naming Convention

- Filenames: lowercase with hyphens (e.g., `pragmatic-builder.md`)
- The `Style:` field in `brief.md` uses the filename without `.md` extension (e.g., `Style: pragmatic-builder`)
- If a creator names the profile after themselves, the management skill reminds them that others may use this style and asks if that's OK
```

- [ ] **Step 3: Commit**

```bash
git add skills/writing-management/assets/profile-template.md skills/writing-management/references/profile-format.md
git commit -m "feat: add style profile template and format reference"
```

---

## Task 2: Update writing-management skill

**Files:**
- Modify: `skills/writing-management/SKILL.md`

- [ ] **Step 1: Add profiles directory and writing-rules.md to workspace init (Section 1)**

In `### 1. Initialize Workspace`, after step 3 (creating workspace structure), add two items:

After the line that copies brief template to `{workspace}/templates/brief-template.md`, add:
```markdown
   - Create `{workspace}/profiles/` directory
   - Copy `${CLAUDE_SKILL_DIR}/../article-writing/references/writing-rules.md` to `{workspace}/writing-rules.md` (customizable copy — users can modify this without touching skill source files)
```

- [ ] **Step 2: Add migration check for existing workspaces**

At the top of `## Your Responsibilities`, before `### 1. Initialize Workspace`, add:

```markdown
### Workspace Migration

Before executing any responsibility, check if the workspace needs migration:

1. If `writing.config.md` exists but `{workspace}/profiles/` does not, create the directory
2. If `writing.config.md` exists but `{workspace}/writing-rules.md` does not, copy from `${CLAUDE_SKILL_DIR}/../article-writing/references/writing-rules.md`

This ensures existing workspaces created before the style profile system are automatically upgraded.
```

- [ ] **Step 3: Add Section 5 — Manage Style Profiles**

After `### 4. Update Goals`, add a new section:

```markdown
### 5. Manage Style Profiles

Style profiles capture shareable writing voices. See [profile format](references/profile-format.md) for the full specification and [profile template](assets/profile-template.md) for the template.

#### Create a New Profile

When the user wants to create a style profile:

1. **Name** — Ask what to call this style. The filename will be lowercase with hyphens (e.g., "Pragmatic Builder" → `pragmatic-builder.md`).
   - If the name matches the creator's own name, remind them: "Other team members may also use this style to write. Is that OK with you?" If they mind, guide them toward a style-descriptive name.
2. **Provide examples** — Ask for 2-3 articles they've written or admire (links or pasted fragments). These help you understand their voice.
3. **AI interview** — One question at a time, ghostwriter mode:
   - Voice: "What feeling do you want your writing to convey? Formal or conversational?"
   - Boundaries: "What tone feels completely wrong for you?"
   - Structure: "How do your articles typically progress? How do you like to open?"
   - React to examples: "This paragraph has X quality — is that what you like about it?"
   - Follow up on abstract answers — ask for concrete examples
4. **Synthesize draft** — Produce Level 1 sections (Voice & Tone, Structure, Anti-Patterns) based on the interview. Propose to user for confirmation.
5. **Save** — Copy the profile template from `${CLAUDE_SKILL_DIR}/assets/profile-template.md`, fill in all sections (Level 1 with interview content, Level 2 with placeholders), and save to `{workspace}/profiles/{style-name}.md`.

#### Update an Existing Profile

When the user wants to update a profile:

1. Show current profile content
2. Guide updates to specific sections — or accept direct instructions (e.g., "Add an anti-pattern: don't use rhetorical questions")
3. Save changes to the profile file
```

- [ ] **Step 4: Update the "You Do NOT" section**

No change needed — profile management is within writing-management's scope.

- [ ] **Step 5: Update skill description in frontmatter**

Change the `description` field to include profile management:

```yaml
description: Initialize and manage a writing workspace. Set writing goals, manage style profiles, collect ideas, suggest which ideas could become articles. Use when the user wants to set up a writing project, create or update a style profile, add ideas, review the idea pool, update goals, or mentions a topic that could become an article.
```

- [ ] **Step 6: Commit**

```bash
git add skills/writing-management/SKILL.md
git commit -m "feat: add style profile management to writing-management skill"
```

---

## Task 3: Update brief template and format

**Files:**
- Modify: `skills/article-preparation/assets/brief-template.md`
- Modify: `skills/article-preparation/references/brief-format.md`

- [ ] **Step 1: Update brief template**

In `skills/article-preparation/assets/brief-template.md`, add `Style:` field to Article Info and remove `## Writing Style` section.

The Article Info section becomes:
```markdown
## Article Info
- Title:
- Author:
- Style:  <!-- profile filename without .md, e.g., pragmatic-builder. Leave empty for global default. -->
- Date:
- Status: draft  <!-- draft | ready | writing | review | published -->
- Original language:  <!-- zh, en -->
- Translations:  <!-- e.g., en, zh -->
```

Remove the entire `## Writing Style` section:
```markdown
## Writing Style
{Optional — article-specific style references that replace the global style in writing.config.md. Leave empty to use the global default.}
```

- [ ] **Step 2: Update brief format reference**

In `skills/article-preparation/references/brief-format.md`:

Add `Style` field description to the Article Info section, after the `Author` entry:
```markdown
- **Style**: Profile filename without the `.md` extension (e.g., `pragmatic-builder`). Points to `{workspace}/profiles/{style}.md`. Leave empty to use the global style from `writing.config.md`.
```

Replace the `#### Writing Style` section with:
```markdown
#### Style (in Article Info)
The `Style` field in Article Info replaces the former `## Writing Style` section. It points to a style profile file in `{workspace}/profiles/`. If empty, article-writing falls back to `## Writing Style` in `writing.config.md`.
```

- [ ] **Step 3: Commit**

```bash
git add skills/article-preparation/assets/brief-template.md skills/article-preparation/references/brief-format.md
git commit -m "feat: replace Writing Style section with Style field in brief"
```

---

## Task 4: Update article-preparation skill

**Files:**
- Modify: `skills/article-preparation/SKILL.md`

- [ ] **Step 1: Replace Step 2 item 11 (Writing Style) with Style Profile selection**

In `### Step 2: Guide Brief Completion`, replace item 11:

Current item 11:
```markdown
11. **Writing Style**: Ask the author if they want to use the default style from `writing.config.md`, or provide specific style references for this article (links to articles they like, descriptions of tone, specific rules). If they choose the default, leave this field empty.
```

Replace with:
```markdown
11. **Style**: List available profiles from `{workspace}/profiles/` and let the author pick one.
   - If profiles exist, show the list with a brief description (the profile's `# {Style Name}` heading and `created_by` from frontmatter)
   - If no profiles exist, inform the author they can create one later via the Management skill, and proceed with the global default
   - If the author wants to create a new profile now, guide them to use the Management skill's profile creation flow first, then return to continue the brief
   - If the author doesn't want any profile, leave `Style:` empty — falls back to `writing.config.md` global style
```

- [ ] **Step 2: Update the Output section**

In the `## Output` section of `skills/article-preparation/SKILL.md`, change:

Current:
```markdown
- Writing Style specified (or empty for global default)
```

Replace with:
```markdown
- Style profile selected (or empty for global default)
```

- [ ] **Step 3: Commit**

```bash
git add skills/article-preparation/SKILL.md
git commit -m "feat: add style profile selection to article-preparation"
```

---

## Task 5: Update article-writing skill

**Files:**
- Modify: `skills/article-writing/SKILL.md`

- [ ] **Step 1: Update Step 1 (Read All Inputs) — style resolution**

Replace the current style resolution block in Step 1:

Current:
```markdown
**Style resolution:**
- If `brief.md` has a Writing Style field with content, use it (replaces global style entirely)
- If `brief.md` Writing Style is empty, use `writing.config.md` Writing Style section
- If neither has style guidance, rely on the writing rules alone
```

Replace with:
```markdown
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
```

- [ ] **Step 2: Update Step 1 item list — add style profile to inputs**

In the numbered list under "Read and understand:", change item 1:

Current:
```markdown
1. `brief.md` — article info, target audience, goals, writing style, outline with materials
```

Replace with:
```markdown
1. `brief.md` — article info (including `Style:` field), target audience, goals, outline with materials
2. Style profile from `{workspace}/profiles/{style}.md` (if `Style:` is specified in brief)
```

And renumber the remaining items (current 2 becomes 3, current 3 becomes 4).

- [ ] **Step 3: Update Step 3 (Write the First Draft) — style reference**

Change the line:
```markdown
- Follow the style reference (if any)
```

To:
```markdown
- Follow the style profile (if any) — Voice & Tone sets the overall tone, Structure guides the article arc, Anti-Patterns are additional patterns to avoid, and any Level 2 sections that have been filled in (Sentence-Level Preferences, Signature Moves, Examples, Revision Checklist) further guide the writing
```

- [ ] **Step 4: Update Step 5a — pass resolved writing-rules.md path**

Change the dispatch description in Step 5a:

Current:
```markdown
**5a.** Dispatch the writing-reviewer subagent with paths to `article.{lang}.md`, `references/writing-rules.md`, `brief.md`, `research.md` (if it exists), and the current review round number.
```

Replace with:
```markdown
**5a.** Dispatch the writing-reviewer subagent with paths to `article.{lang}.md`, the resolved `writing-rules.md` path, `brief.md`, the style profile path (if any), `research.md` (if it exists), and the current review round number.
```

- [ ] **Step 5: Update Writing Rules section reference**

Change the reference at the bottom:

Current:
```markdown
- See [writing rules](references/writing-rules.md) for prohibited patterns and quality requirements
```

Replace with:
```markdown
- Writing rules: read from `{workspace}/writing-rules.md` (user-customizable) or fall back to [built-in writing rules](references/writing-rules.md)
- See [profile format](../writing-management/references/profile-format.md) for style profile details
```

- [ ] **Step 6: Commit**

```bash
git add skills/article-writing/SKILL.md
git commit -m "feat: update article-writing style resolution for profiles and customizable writing-rules"
```

---

## Task 6: Update reviewer prompt templates

**Files:**
- Modify: `skills/article-writing/writing-reviewer-prompt.md`
- Modify: `skills/article-writing/fact-check-reviewer-prompt.md`

- [ ] **Step 1: Update writing-reviewer-prompt.md**

In the dispatch template, add a style profile parameter and change the writing rules path to be a resolved path:

After the line:
```
    **Writing rules:** [WRITING_RULES_FILE_PATH]
```

Add:
```
    **Style profile (if any):** [STYLE_PROFILE_FILE_PATH]
```

Add a new section after "## What to Check" table, before "## Calibration":

```markdown
    ## Style Profile Awareness

    If a style profile is provided, also check for:
    - Violations of the profile's **Anti-Patterns** section (on top of writing-rules.md)
    - Tone mismatches with the profile's **Voice & Tone** section
    - If the profile has a **Revision Checklist** with items, run those checks too

    The style profile complements the writing rules — it does not replace them.
```

- [ ] **Step 2: Update fact-check-reviewer-prompt.md**

The fact-check reviewer doesn't need the style profile, but it should accept the resolved writing-rules.md path. The current template doesn't reference writing-rules at all (fact-checking is about factual accuracy, not style), so no change is needed for the path.

Verify: the fact-check reviewer prompt does not reference `references/writing-rules.md`. Confirmed — it doesn't. No change needed.

- [ ] **Step 3: Commit**

```bash
git add skills/article-writing/writing-reviewer-prompt.md
git commit -m "feat: add style profile awareness to writing reviewer"
```

---

## Task 7: Update config-format.md and CLAUDE.md

**Files:**
- Modify: `skills/writing-management/references/config-format.md`
- Modify: `CLAUDE.md`

- [ ] **Step 1: Update config-format.md**

Add a note about profiles to the Guidelines section. After the line:
```markdown
- "Writing Style" describes how articles should read — tone, structure preferences, reference articles, or specific rules. This applies to all articles by default; individual articles can override it in their brief.
```

Replace with:
```markdown
- "Writing Style" describes how articles should read — tone, structure preferences, reference articles, or specific rules. This is the global fallback for all articles. Individual articles select a Style Profile in their brief for a more specific writing voice; if no profile is selected, this section applies.
```

- [ ] **Step 2: Update CLAUDE.md workspace structure**

In the workspace structure diagram, add `profiles/` and `writing-rules.md`:

```
writing.config.md                # At repo root — goals, direction, style (workspace field in frontmatter)
{workspace}/
  ideas.md                       # Idea pool (Pending → Adopted)
  profiles/                      # Style profiles (shareable writing voices)
  writing-rules.md               # Customizable writing rules (copied from skill source)
  templates/brief-template.md    # Article brief template
  articles/{YYYY-MM-DD}_{slug}/
    article.{lang}.md            # Article content (clean prose, no metadata). {lang} = original language code from brief.md
    brief.md                     # Brief, materials, outline, progress tracking
    research.md                  # External research and fact-check sources
    reviews/                     # Review reports from automated reviewers
    assets/                      # Images and other assets
```

- [ ] **Step 3: Update CLAUDE.md Writing Rules section**

In the "Writing Rules (article-writing skill)" section, update the first sentence:

Current:
```markdown
The writing rules in `skills/article-writing/references/writing-rules.md` define prohibited AI patterns and quality requirements.
```

Replace with:
```markdown
The writing rules define prohibited AI patterns and quality requirements. The built-in rules are at `skills/article-writing/references/writing-rules.md`; on workspace init, a customizable copy is placed at `{workspace}/writing-rules.md` for users to modify.
```

- [ ] **Step 4: Update CLAUDE.md architecture description**

In the writing-management description, add profile management:

Current:
```markdown
1. **writing-management** (`skills/writing-management/`) — Workspace init, goals/style config (`writing.config.md`), idea pool (`ideas.md`)
```

Replace with:
```markdown
1. **writing-management** (`skills/writing-management/`) — Workspace init, goals/style config (`writing.config.md`), style profiles (`profiles/`), idea pool (`ideas.md`)
```

- [ ] **Step 5: Commit**

```bash
git add skills/writing-management/references/config-format.md CLAUDE.md
git commit -m "docs: update config-format and CLAUDE.md for style profiles"
```
