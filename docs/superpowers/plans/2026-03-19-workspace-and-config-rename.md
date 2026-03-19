# Workspace 機制與 Config 改名 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rename `config.md` to `writing.config.md` with YAML frontmatter workspace field, update all skills to resolve workspace paths, and add Publishing placeholder to brief template.

**Architecture:** This is a prompt/template-only change — no code involved. All three skills gain a shared "workspace resolution" preamble that reads `writing.config.md` frontmatter and prefixes all workspace-relative paths. The config template adds YAML frontmatter, and the brief template adds an empty Publishing section.

**Tech Stack:** Markdown, YAML frontmatter

**Spec:** [2026-03-19-workspace-and-config-rename-design.md](../specs/2026-03-19-workspace-and-config-rename-design.md)

**Note:** All line number references in this plan refer to the original unmodified files. When applying multiple steps to the same file, earlier steps may shift line numbers. Match on text content, not line numbers.

---

## File Map

| Action | File | Responsibility |
|--------|------|----------------|
| Modify | `skills/writing-management/assets/config-template.md` | Add YAML frontmatter with `workspace` field |
| Modify | `skills/writing-management/references/config-format.md` | Update format spec with frontmatter docs |
| Modify | `skills/article-preparation/assets/brief-template.md` | Add empty Publishing section |
| Modify | `skills/article-preparation/references/brief-format.md` | Add Publishing section docs, update `config.md` refs |
| Modify | `skills/writing-management/references/ideas-format.md` | Update `config.md` ref and workspace-relative path |
| Modify | `skills/writing-management/SKILL.md` | Workspace init logic, rename all `config.md` refs |
| Modify | `skills/article-preparation/SKILL.md` | Add workspace resolution preamble, update all paths |
| Modify | `skills/article-writing/SKILL.md` | Add workspace resolution preamble, update all paths |
| Modify | `CLAUDE.md` | Update workspace structure and all `config.md` refs |
| Modify | `README.md` | Update workspace structure and all `config.md` refs |

---

### Task 1: Update config template and format reference

**Files:**
- Modify: `skills/writing-management/assets/config-template.md`
- Modify: `skills/writing-management/references/config-format.md`

- [ ] **Step 1: Update config-template.md — add YAML frontmatter**

Replace the entire content of `skills/writing-management/assets/config-template.md` with:

```markdown
---
workspace: .
---

# Writing Plan

## About
{One paragraph describing who you are — individual or organization — and your vision}

## Writing Goals
{One paragraph describing what the writing aims to achieve, who it targets, and the desired tone}

## Writing Style
{Global writing style preferences — prose description, reference article links, or specific rules}
```

The only change is the added frontmatter block. `workspace: .` is the default (repo root = workspace).

- [ ] **Step 2: Update config-format.md — add frontmatter and workspace documentation**

Replace the entire content of `skills/writing-management/references/config-format.md` with:

```markdown
# writing.config.md Format

## Location

`writing.config.md` is always placed at the repository root. It is the entry point for all writing skills.

## Frontmatter

The file uses YAML frontmatter to declare the workspace directory:

```yaml
---
workspace: writing
---
```

**Rules:**
- `workspace` is the only frontmatter field
- Value is a relative path from repo root to the directory containing `ideas.md`, `templates/`, and `articles/`
- If omitted or empty, defaults to `.` (repo root is the workspace)
- No leading `/`, no trailing `/`
- No `..` (must stay within the repo)
- Maximum two levels deep (e.g., `writing` or `src/writing`)

## Body Structure

```markdown
---
workspace: .
---

# Writing Plan

## About
{One paragraph describing who you are — individual or organization — and your vision}

## Writing Goals
{One paragraph describing what the writing aims to achieve, who it targets, and the desired tone}

## Writing Style
{Global writing style preferences — prose description, reference article links, or specific rules}
```

## Example

```markdown
---
workspace: writing
---

# Writing Plan

## About
sadcoder builds AI agent tools. We envision a future where people rely heavily on AI agents to get work done, and we're building products for that world.

## Writing Goals
Demonstrate our hands-on experience and insights in the AI agent space to attract people interested in AI agents — getting them to follow us on Twitter or leave their email on our website. Tone should be practical and opinionated, like a team that's actually building this stuff sharing what they've learned.

## Writing Style
Direct and conversational. Short paragraphs. Use concrete examples from our own work rather than hypotheticals. Reference specific tools, numbers, and timelines. Avoid corporate-speak.
```

## Guidelines

- "About" should be factual: who you are, what you do, your direction
- "Writing Goals" combines purpose, target audience, and tone in one paragraph
- "Writing Style" describes how articles should read — tone, structure preferences, reference articles, or specific rules. This applies to all articles by default; individual articles can override it in their brief.
- Keep all sections concise — one paragraph each
- This file is the anchor for ambient goal alignment and style consistency across all skills
```

- [ ] **Step 3: Commit**

```bash
git add skills/writing-management/assets/config-template.md skills/writing-management/references/config-format.md
git commit -m "feat: add YAML frontmatter with workspace field to config template and format"
```

---

### Task 2: Update brief template and format reference

**Files:**
- Modify: `skills/article-preparation/assets/brief-template.md`
- Modify: `skills/article-preparation/references/brief-format.md`

- [ ] **Step 1: Add Publishing section to brief-template.md**

In `skills/article-preparation/assets/brief-template.md`, insert a new `## Publishing` section after the `## Article Info` section (after line 9, before the blank line before `## Target Audience`):

```markdown
## Publishing
<!-- Managed by publishing tools. Leave empty during writing. -->
```

The full Article Info + Publishing block should look like:

```markdown
## Article Info
- Title:
- Author:
- Date:
- Status: draft  <!-- draft | ready | writing | review | published -->
- Original language:
- Translations:  <!-- e.g., en, zh -->

## Publishing
<!-- Managed by publishing tools. Leave empty during writing. -->

## Target Audience
```

Also update the `config.md` reference on line 24. Change:

```markdown
{Optional — article-specific style references that replace the global style in config.md. Leave empty to use the global default.}
```

to:

```markdown
{Optional — article-specific style references that replace the global style in writing.config.md. Leave empty to use the global default.}
```

- [ ] **Step 2: Add Publishing section documentation to brief-format.md**

In `skills/article-preparation/references/brief-format.md`, make these changes:

**2a.** On line 5, change `templates/brief-template.md` reference (no change needed — this path is workspace-relative and stays the same).

**2b.** On line 32, change:
```
- **Goal alignment**: How this article connects to the goals in `config.md`
```
to:
```
- **Goal alignment**: How this article connects to the goals in `writing.config.md`
```

**2c.** On line 35, change:
```
Optional. Article-specific style references that replace the global style in `config.md`. Can be a prose description, links to reference articles, or specific rules. Leave empty to use the global default.
```
to:
```
Optional. Article-specific style references that replace the global style in `writing.config.md`. Can be a prose description, links to reference articles, or specific rules. Leave empty to use the global default.
```

**2d.** Add a new `#### Publishing` section after `#### Article Info` (after line 20, before `#### Target Audience`). Insert:

```markdown

#### Publishing
Reserved for publishing tools. Initially empty. When an article is published to a CMS, the publishing tool writes target, path, date, and slug here. Writing skills do not read or write this section.
```

- [ ] **Step 3: Commit**

```bash
git add skills/article-preparation/assets/brief-template.md skills/article-preparation/references/brief-format.md
git commit -m "feat: add Publishing section to brief template and format reference"
```

---

### Task 3: Update writing-management SKILL.md and ideas-format.md

**Files:**
- Modify: `skills/writing-management/SKILL.md`
- Modify: `skills/writing-management/references/ideas-format.md`

This is the most significant change — the initialization logic needs to handle workspace directory selection.

- [ ] **Step 1: Update Workspace Structure section**

Replace lines 10-24 (the `## Workspace Structure` section) with:

```markdown
## Workspace Structure

`writing.config.md` lives at the repository root. The `workspace` field in its frontmatter points to where all writing files live.

```
writing.config.md            # At repo root — writing plan goals, direction, style
{workspace}/
  ideas.md                   # Idea pool
  templates/
    brief-template.md        # Article brief template (user-editable)
  articles/
    {YYYY-MM-DD}_{slug}/
      article.md             # Article content
      brief.md               # Writing brief
      assets/                # Images and other assets
```

**Workspace resolution:** Read the `workspace` field from `writing.config.md` frontmatter. If absent or empty, default to `.` (repo root). All paths below are relative to the workspace directory.
```

- [ ] **Step 2: Update Initialize Workspace section**

Replace lines 28-43 (the `### 1. Initialize Workspace` section) with:

```markdown
### 1. Initialize Workspace (first use)

If `writing.config.md` does not exist at the repository root, the workspace needs initialization:

1. Ask the user if this repository has other purposes (e.g., it's a Hugo or Astro project) and where they'd like to keep writing files
   - If the user says no special directory is needed → workspace is `.`
   - If the user specifies a directory (e.g., `writing`) → workspace is that path
   - Validate: no `..`, no leading/trailing `/`, maximum two levels deep
2. Create `writing.config.md` at the repository root with the workspace value — see [config format](references/config-format.md) and template at `${CLAUDE_SKILL_DIR}/assets/config-template.md`
3. Create the workspace directory (if not `.`) and the structure inside it:
   - Copy `${CLAUDE_SKILL_DIR}/assets/ideas-template.md` to `{workspace}/ideas.md`
   - Copy the brief template from the article-preparation skill's assets to `{workspace}/templates/brief-template.md`
4. Guide the user to describe who they are and their writing goals
   - Propose suggestions based on what you know from the conversation
   - User confirms or adjusts
5. Guide the user to describe their preferred writing style
   - Propose a style based on the goals and context from the conversation
   - The user can also provide links to articles they like as style references
   - If the user wants to skip this for now, write a placeholder: "Not yet defined"
   - User confirms or adjusts
6. Write the About, Writing Goals, and Writing Style sections to the body of `writing.config.md`
```

- [ ] **Step 3: Update remaining config.md references**

**3a.** Line 49 — change `ideas.md` to `{workspace}/ideas.md`:
```
1. Record it to `{workspace}/ideas.md` under "Pending" with today's date
```

**3b.** Line 53 — change `config.md` to `writing.config.md`:
```
3. **Ambient alignment**: Briefly and naturally mention how the idea relates to the goals in `writing.config.md`
```

**3c.** Line 68 — change `ideas.md` path:
Already workspace-relative in context, no change needed (the surrounding text makes the workspace context clear).

**3d.** Lines 72-76 — Update Goals section:
```markdown
### 4. Update Goals

If `writing.config.md` already exists and the user wants to change goals:

1. Show current goals
2. Guide the user to update — propose new wording, user confirms
3. Rewrite the relevant section in `writing.config.md`
4. Note: existing articles are not retroactively checked; alignment only applies going forward
```

- [ ] **Step 4: Update ideas-format.md**

In `skills/writing-management/references/ideas-format.md`, make two changes:

**4a.** Line 16 — change `articles/{date}_{slug}` to `{workspace}/articles/{date}_{slug}`:
```
- [YYYY-MM-DD] → {workspace}/articles/{date}_{slug} (from idea description)  <!-- date is when the idea was adopted -->
```

**4b.** Line 29 — change `config.md` to `writing.config.md`:
```
Each suggestion should reference specific pending ideas and note how they relate to goals from `writing.config.md`.
```

- [ ] **Step 5: Commit**

```bash
git add skills/writing-management/SKILL.md skills/writing-management/references/ideas-format.md
git commit -m "feat: update writing-management skill for workspace mechanism and config rename"
```

---

### Task 4: Update article-preparation SKILL.md

**Files:**
- Modify: `skills/article-preparation/SKILL.md`

- [ ] **Step 1: Update Prerequisites section**

Replace lines 10-13 with:

```markdown
## Prerequisites

- `writing.config.md` must exist at the repository root (workspace must be initialized). If it doesn't, tell the user to set up the workspace first using the Management skill.
- Read the `workspace` field from `writing.config.md` frontmatter (default: `.`). All paths below are relative to this workspace directory.
- `{workspace}/templates/brief-template.md` must exist. If missing, copy from `${CLAUDE_SKILL_DIR}/assets/brief-template.md`.
```

- [ ] **Step 2: Update Step 1 path references**

**2a.** Line 24 — change `articles/{date}_{slug}/` to `{workspace}/articles/{date}_{slug}/`

**2b.** Line 27 — change directory structure listing:
```
   {workspace}/articles/{date}_{slug}/
     article.md    # Empty file
     brief.md      # Copied from {workspace}/templates/brief-template.md
     assets/       # Empty directory
```

**2c.** Line 29 — change `templates/brief-template.md` to `{workspace}/templates/brief-template.md`

**2d.** Line 33 — change `ideas.md` to `{workspace}/ideas.md` and `articles/{date}_{slug}` to `{workspace}/articles/{date}_{slug}`

- [ ] **Step 3: Update config.md references in Step 2 and Step 5**

**3a.** Line 39 — change `config.md` to `writing.config.md`:
```
- **You propose** suggestions based on the article topic and `writing.config.md`
```

**3b.** Line 53 — change `config.md` to `writing.config.md`:
```
10. **Goal alignment**: Read `writing.config.md` and **proactively suggest** how this article naturally connects to the writing goals
```

**3c.** Line 57 — change `config.md` to `writing.config.md`:
```
11. **Writing Style**: Ask the author if they want to use the default style from `writing.config.md`, or provide specific style references for this article (links to articles they like, descriptions of tone, specific rules). If they choose the default, leave this field empty.
```

- [ ] **Step 4: Update Output section and Behavior Principles**

**4a.** Line 165 — change `articles/{date}_{slug}/` to `{workspace}/articles/{date}_{slug}/`

**4b.** Line 185 — change `config.md` to `writing.config.md`:
```
- **Ambient alignment**: Reference goals from `writing.config.md` naturally throughout. Proactively suggest alignment — don't wait to be asked.
```

- [ ] **Step 5: Commit**

```bash
git add skills/article-preparation/SKILL.md
git commit -m "feat: update article-preparation skill for workspace mechanism and config rename"
```

---

### Task 5: Update article-writing SKILL.md

**Files:**
- Modify: `skills/article-writing/SKILL.md`

- [ ] **Step 1: Update Prerequisites section**

Replace lines 10-16 with:

```markdown
## Prerequisites

- `brief.md` must have status `ready`
- `brief.md` must contain a completed outline with materials per section
- `writing.config.md` must exist at the repository root (for global writing style)
- Read the `workspace` field from `writing.config.md` frontmatter (default: `.`). The article directory containing `brief.md` is inside `{workspace}/articles/`.

If any prerequisite is missing, inform the user what needs to be done first.
```

- [ ] **Step 2: Update Step 1 config.md references**

**2a.** Line 24 — change `config.md` to `writing.config.md`:
```
2. `writing.config.md` — global writing style (Writing Style section)
```

**2b.** Lines 28-30 — update style resolution:
```markdown
**Style resolution:**
- If `brief.md` has a Writing Style field with content, use it (replaces global style entirely)
- If `brief.md` Writing Style is empty, use `writing.config.md` Writing Style section
- If neither has style guidance, rely on the writing rules alone
```

- [ ] **Step 3: Update Behavior Principles**

Line 190 — change `config.md` to `writing.config.md`:
```
- **Ambient alignment**: The article naturally reflects the goals in `writing.config.md` through the materials — the alignment was built into the brief during preparation.
```

- [ ] **Step 4: Commit**

```bash
git add skills/article-writing/SKILL.md
git commit -m "feat: update article-writing skill for workspace mechanism and config rename"
```

---

### Task 6: Update project documentation

**Files:**
- Modify: `CLAUDE.md`
- Modify: `README.md`

- [ ] **Step 1: Update CLAUDE.md**

**1a.** Line 13 — change `config.md` to `writing.config.md`:
```
1. **writing-management** (`skills/writing-management/`) — Workspace init, goals/style config (`writing.config.md`), idea pool (`ideas.md`)
```

**1b.** Line 24 — change `config.md` to `writing.config.md`:
```
- **Ambient alignment**: Goals from `writing.config.md` are referenced naturally throughout, not forced. "This connects well with..." not "You must align with..."
```

**1c.** Replace lines 27-39 (Workspace Structure section) with:

```markdown
## Workspace Structure (created by skills in user's project)

`writing.config.md` lives at the repository root. The `workspace` frontmatter field (default: `.`) points to where writing files live.

```
writing.config.md                # At repo root — goals, direction, style (workspace field in frontmatter)
{workspace}/
  ideas.md                       # Idea pool (Pending → Adopted)
  templates/brief-template.md    # Article brief template
  articles/{YYYY-MM-DD}_{slug}/
    article.md                   # Article content (clean prose, no metadata)
    brief.md                     # Brief, materials, outline, progress tracking
    research.md                  # External research and fact-check sources
    reviews/                     # Review reports from automated reviewers
    assets/                      # Images and other assets
```
```

- [ ] **Step 2: Update README.md**

**2a.** Line 5 — change `config.md` to `writing.config.md`:
```
Works for individuals managing their own writing, or teams collaborating on a shared content pipeline. The workspace structure and skills are the same in both cases — a single person uses `writing.config.md` to describe their own goals and style, while a team uses it to define shared direction that individual authors build on.
```

**2b.** Replace lines 50-63 (Workspace Structure section) with:

```markdown
## Workspace Structure

`writing.config.md` lives at the repository root. The `workspace` frontmatter field (default: `.`) points to where writing files live.

```
writing.config.md            # At repo root — your writing goals, direction, and style
{workspace}/
  ideas.md                   # Idea pool
  templates/
    brief-template.md        # Article brief template (editable)
  articles/
    {YYYY-MM-DD}_{slug}/
      article.md             # Article content
      article.{lang}.md      # Translated versions
      brief.md               # Writing brief, materials, and progress tracking
      assets/                # Images and other assets
```
```

- [ ] **Step 3: Commit**

```bash
git add CLAUDE.md README.md
git commit -m "docs: update CLAUDE.md and README.md for workspace mechanism and config rename"
```
