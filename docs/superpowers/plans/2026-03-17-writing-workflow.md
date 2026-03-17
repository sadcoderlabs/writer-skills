# Writing Workflow Skills Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create two Agent Skills (Management and Article Preparation) that guide users through collaborative writing with ambient goal alignment.

**Architecture:** Each skill is a directory with a `SKILL.md` file following the [agentskills.io](https://agentskills.io/) open standard. Skills operate on a shared workspace of markdown files (`config.md`, `ideas.md`, `templates/`, `articles/`). No code — all deliverables are markdown.

**Tech Stack:** Markdown, YAML frontmatter, Agent Skills standard (SKILL.md format)

**Spec:** `docs/superpowers/specs/2026-03-17-writing-workflow-design.md`

---

## File Structure

```
skills/
  writing-management/
    SKILL.md                    # Management skill instructions
    references/
      config-format.md          # config.md file format reference
      ideas-format.md           # ideas.md file format reference
  article-preparation/
    SKILL.md                    # Article Preparation skill instructions
    references/
      brief-format.md           # brief.md file format reference
    assets/
      brief-template.md         # Default brief template (copied to workspace)
workspace-template/
  config.md                     # Empty config.md scaffold
  ideas.md                      # Empty ideas.md scaffold
  templates/
    brief-template.md           # Default brief template (same as above)
  articles/                     # Empty directory
```

**Why this structure:**
- `skills/` contains the two Agent Skills per agentskills.io standard — these are what AI agents load
- `workspace-template/` is a ready-to-copy workspace structure that users can clone into their working directory
- The brief template exists in both places: `skills/article-preparation/assets/` (for the skill to reference) and `workspace-template/templates/` (for users who just want to copy the whole workspace)
- Reference files keep SKILL.md under 500 lines per the agentskills.io progressive disclosure recommendation

---

### Task 1: Workspace Template Files

Create the empty workspace scaffolding that Management skill will initialize.

**Files:**
- Create: `workspace-template/config.md`
- Create: `workspace-template/ideas.md`
- Create: `workspace-template/templates/brief-template.md`

- [ ] **Step 1: Create `workspace-template/config.md`**

This is the scaffold that Management skill will guide users to fill in.

```markdown
# Writing Plan

## About
{One paragraph describing who you are — individual or organization — and your vision}

## Writing Goals
{One paragraph describing what the writing aims to achieve, who it targets, and the desired tone}
```

- [ ] **Step 2: Create `workspace-template/ideas.md`**

```markdown
# Idea Pool

## Pending

## AI Suggestions

## Adopted
```

- [ ] **Step 3: Create `workspace-template/templates/brief-template.md`**

This is the default brief template per the spec. Users can edit it later.

```markdown
# Writing Brief

## Article Info
- Title:
- Author:
- Date:
- Status: draft  <!-- draft | ready | writing | review | published -->
- Original language:
- Translations:  <!-- e.g., en, zh -->

## Target Audience
- Who:
- Background:

## Source Ideas
- {references to original ideas from ideas.md, for traceability}

## Article Goals
- Reader takeaway:
- Goal alignment:

## Outline


## Checklist

### Preparation
- [ ] Target audience confirmed
- [ ] Article goals confirmed
- [ ] Goal alignment confirmed
- [ ] Language and translations confirmed
- [ ] Outline completed
- [ ] Ready for writing

### Writing & Review (managed by later skills)
- [ ] First draft completed
- [ ] Review completed
- [ ] Translations completed
- [ ] Finalized
```

- [ ] **Step 4: Verify workspace template structure**

Run: `find workspace-template -type f | sort`

Expected:
```
workspace-template/config.md
workspace-template/ideas.md
workspace-template/templates/brief-template.md
```

- [ ] **Step 5: Commit**

```bash
git add workspace-template/
git commit -m "feat: add workspace template files (config, ideas, brief template)"
```

---

### Task 2: Management Skill — Reference Files

Create the reference documents that the Management SKILL.md will point to. These keep the main SKILL.md focused.

**Files:**
- Create: `skills/writing-management/references/config-format.md`
- Create: `skills/writing-management/references/ideas-format.md`

- [ ] **Step 1: Create `skills/writing-management/references/config-format.md`**

````markdown
# config.md Format

## Structure

```markdown
# Writing Plan

## About
{One paragraph describing who you are — individual or organization — and your vision}

## Writing Goals
{One paragraph describing what the writing aims to achieve, who it targets, and the desired tone}
```

## Example

```markdown
# Writing Plan

## About
sadcoder builds AI agent tools. We envision a future where people rely heavily on AI agents to get work done, and we're building products for that world.

## Writing Goals
Demonstrate our hands-on experience and insights in the AI agent space to attract people interested in AI agents — getting them to follow us on Twitter or leave their email on our website. Tone should be practical and opinionated, like a team that's actually building this stuff sharing what they've learned.
```

## Guidelines

- "About" should be factual: who you are, what you do, your direction
- "Writing Goals" combines purpose, target audience, and tone in one paragraph
- Keep both sections concise — one paragraph each
- This file is the anchor for ambient goal alignment across all skills
````

- [ ] **Step 2: Create `skills/writing-management/references/ideas-format.md`**

````markdown
# ideas.md Format

## Structure

```markdown
# Idea Pool

## Pending
- [YYYY-MM-DD] idea description
- [YYYY-MM-DD] @contributor: idea description  <!-- contributor is optional -->

## AI Suggestions
> [YYYY-MM-DD] Suggestion about merging/developing ideas, with alignment notes

## Adopted
- [YYYY-MM-DD] → articles/{date}_{slug} (from idea description)  <!-- date is when the idea was adopted -->
```

## Sections

### Pending
New ideas go here. Each entry has a date and description. Contributor attribution (@name) is optional — useful for teams, unnecessary for individual use.

### AI Suggestions
An **append-only log**. New suggestions are appended (never edited or removed) when:
- A new idea is received that connects to existing ideas
- The user asks for the current state of the idea pool

Each suggestion should reference specific pending ideas and note how they relate to goals from `config.md`.

### Adopted
Ideas that have been developed into articles. Includes the adoption date and a link to the article directory.

## When to Suggest Articles
When receiving a new idea and there are 5 or more pending ideas, include article suggestions in the response alongside the idea confirmation.
````

- [ ] **Step 3: Commit**

```bash
git add skills/writing-management/references/
git commit -m "feat: add Management skill reference files (config and ideas format)"
```

---

### Task 3: Management Skill — SKILL.md

Create the main Management skill file.

**Files:**
- Create: `skills/writing-management/SKILL.md`

- [ ] **Step 1: Create `skills/writing-management/SKILL.md`**

```markdown
---
name: writing-management
description: Initialize and manage a writing workspace. Set writing goals, collect ideas, suggest which ideas could become articles. Use when the user wants to set up a writing project, add ideas, review the idea pool, or update goals.
---

# Writing Management

You manage a writing workspace — setting up the structure, maintaining goals, and organizing an idea pool.

## Workspace Structure

The workspace has this structure:

```
config.md                # Writing plan goals and direction
ideas.md                 # Idea pool
templates/
  brief-template.md      # Article brief template (user-editable)
articles/
  {YYYY-MM-DD}_{slug}/
    article.md           # Article content
    brief.md             # Writing brief
    assets/              # Images and other assets
```

## Your Responsibilities

### 1. Initialize Workspace (first use)

If `config.md` does not exist, the workspace needs initialization:

1. Create the directory structure above (if any part is missing)
2. Guide the user to describe who they are and their writing goals
   - Propose suggestions based on what you know from the conversation
   - User confirms or adjusts
3. Write the result to `config.md` — see [config format](references/config-format.md)
4. Create `ideas.md` with empty sections — see [ideas format](references/ideas-format.md)
5. Create `templates/brief-template.md` with the default brief template

### 2. Receive New Ideas

When the user shares an idea:

1. Record it to `ideas.md` under "Pending" with today's date
   - Include `@contributor` if the user identifies themselves or someone else
2. Check for connections with existing pending ideas
   - If connections exist, append a suggestion to "AI Suggestions" noting how ideas could be merged or developed together
3. **Ambient alignment**: Briefly and naturally mention how the idea relates to the goals in `config.md`
   - Tone: "This connects well with your goal of..." not "You must align with..."
4. If there are now 5+ pending ideas, include article suggestions alongside your response — which ideas could become articles, and why

### 3. Organize Idea Pool

When the user asks about the idea pool:

1. Present the current state of pending ideas
2. Suggest which ideas could be developed into articles
3. For each suggestion, note goal alignment
4. Append suggestions to the "AI Suggestions" section

When an idea is adopted (developed into an article by the Article Preparation skill):

1. Move it from "Pending" to "Adopted" with today's date and a link to the article directory

### 4. Update Goals

If `config.md` already exists and the user wants to change goals:

1. Show current goals
2. Guide the user to update — propose new wording, user confirms
3. Rewrite the relevant section in `config.md`
4. Note: existing articles are not retroactively checked; alignment only applies going forward

## You Do NOT

- Create article directories (that's the Article Preparation skill)
- Write articles (that's the Writing skill)
- Review articles (that's the Review skill)

## Behavior Principles

- **Ghostwriter mode**: Always propose content for the user to confirm or adjust. Never ask the user to write from scratch.
- **Ambient alignment**: Reference goals naturally throughout, not just at checkpoints. Suggest, don't demand.
- **Tone**: Collaborative and non-pushy. "This could be a good opportunity to..." not "You must align with..."
```

- [ ] **Step 2: Validate SKILL.md frontmatter**

Check that:
- `name` field is `writing-management` (matches directory name)
- `name` is lowercase, letters/numbers/hyphens only, no leading/trailing hyphens
- `description` is non-empty, under 1024 characters
- Frontmatter is valid YAML between `---` delimiters

- [ ] **Step 3: Verify the skill directory structure**

Run: `find skills/writing-management -type f | sort`

Expected:
```
skills/writing-management/SKILL.md
skills/writing-management/references/config-format.md
skills/writing-management/references/ideas-format.md
```

- [ ] **Step 4: Commit**

```bash
git add skills/writing-management/SKILL.md
git commit -m "feat: add Management SKILL.md with initialization, idea management, and goal alignment"
```

---

### Task 4: Article Preparation Skill — Reference Files and Assets

Create the reference document and the default brief template asset.

**Files:**
- Create: `skills/article-preparation/references/brief-format.md`
- Create: `skills/article-preparation/assets/brief-template.md`

- [ ] **Step 1: Create `skills/article-preparation/references/brief-format.md`**

```markdown
# brief.md Format

## Structure

The brief is copied from `templates/brief-template.md` when a new article is created. It tracks all planning information and progress for one article.

### Sections

#### Article Info
- **Title**: Article title (proposed by AI, confirmed by user)
- **Author**: Who is writing this article
- **Date**: Creation date
- **Status**: One of `draft`, `ready`, `writing`, `review`, `published`
  - `draft` → initial state when article directory is created
  - `ready` → all Preparation checklist items complete, ready for writing
  - Other states are managed by later skills
- **Original language**: The language the article will be written in (e.g., "Chinese", "English")
- **Translations**: Comma-separated language codes for translated versions (e.g., "en, zh"). Translated files are named `article.{lang}.md`

#### Target Audience
- **Who**: One-line description of the target reader
- **Background**: Brief description of the audience's context, needs, and knowledge level

#### Source Ideas
References to the original idea(s) from `ideas.md` that sparked this article. For traceability.

#### Article Goals
- **Reader takeaway**: What the reader will gain from reading this article
- **Goal alignment**: How this article connects to the goals in `config.md`

#### Outline
The article's section-by-section structure. Each section should have a clear purpose.

#### Checklist
Tracks progress across all skills. The Preparation section is managed by this skill. Writing & Review section is managed by later skills.

## Status Transitions

| From | To | Trigger |
|------|----|---------|
| draft | ready | All Preparation checklist items complete |
| ready | writing | Writing skill begins (future) |
| writing | review | First draft complete (future) |
| review | published | Finalized (future) |
```

- [ ] **Step 2: Create `skills/article-preparation/assets/brief-template.md`**

This is identical to `workspace-template/templates/brief-template.md` — it's the default brief template that the skill references.

```markdown
# Writing Brief

## Article Info
- Title:
- Author:
- Date:
- Status: draft  <!-- draft | ready | writing | review | published -->
- Original language:
- Translations:  <!-- e.g., en, zh -->

## Target Audience
- Who:
- Background:

## Source Ideas
- {references to original ideas from ideas.md, for traceability}

## Article Goals
- Reader takeaway:
- Goal alignment:

## Outline


## Checklist

### Preparation
- [ ] Target audience confirmed
- [ ] Article goals confirmed
- [ ] Goal alignment confirmed
- [ ] Language and translations confirmed
- [ ] Outline completed
- [ ] Ready for writing

### Writing & Review (managed by later skills)
- [ ] First draft completed
- [ ] Review completed
- [ ] Translations completed
- [ ] Finalized
```

- [ ] **Step 3: Commit**

```bash
git add skills/article-preparation/references/ skills/article-preparation/assets/
git commit -m "feat: add Article Preparation skill reference and template files"
```

---

### Task 5: Article Preparation Skill — SKILL.md

Create the main Article Preparation skill file.

**Files:**
- Create: `skills/article-preparation/SKILL.md`

- [ ] **Step 1: Create `skills/article-preparation/SKILL.md`**

```markdown
---
name: article-preparation
description: Prepare an article for writing. Creates article directory, guides brief completion (audience, goals, alignment, language), builds outline. Use when the user wants to start writing an article from an idea.
---

# Article Preparation

You prepare articles for writing — turning an idea into a fully planned article with a completed brief and outline.

## Prerequisites

- `config.md` must exist (workspace must be initialized). If it doesn't, tell the user to set up the workspace first using the Management skill.
- `templates/brief-template.md` must exist.

## Your Responsibilities

### Step 1: Create Article Directory

When the user wants to develop an idea into an article:

1. Propose a slug based on the article topic (e.g., `2026-03-17_ai-agent-dev-workflow`)
   - Format: `{YYYY-MM-DD}_{slug}` where slug is lowercase, hyphens between words, concise but descriptive
   - Date is today's date, user confirms or adjusts the slug part
2. If `articles/{date}_{slug}/` already exists, append a number suffix to the slug (e.g., `2026-03-17_ai-agent-workflow-2`) and confirm with the user
3. Create the directory structure:
   ```
   articles/{date}_{slug}/
     article.md    # Empty file
     brief.md      # Copied from templates/brief-template.md
     assets/       # Empty directory
   ```
4. Populate the **Source Ideas** section in `brief.md` with references to the original idea(s)
5. Update `ideas.md`: move related ideas from "Pending" to "Adopted" with today's date and a link to `articles/{date}_{slug}`
   - If an idea is already in the "Adopted" section, inform the user and link to the existing article instead of re-adopting

### Step 2: Guide Brief Completion

Walk through each section of `brief.md` with the user. For every field:
- **You propose** suggestions based on the article topic and `config.md`
- User confirms, adjusts, or adds detail

The fields to complete:

1. **Title**: Propose a working title based on the idea
2. **Author**: Ask who is writing this
3. **Date**: Set to today
4. **Original language**: Ask which language the article will be written in
5. **Translations**: Ask if translations are needed and to which languages
6. **Target Audience — Who**: Propose who would benefit from this article
7. **Target Audience — Background**: Propose a brief description of the audience's context
8. **Reader takeaway**: Propose what the reader will gain
9. **Goal alignment**: Read `config.md` and **proactively suggest** how this article naturally connects to the writing goals
   - This is especially important — users often forget or resist alignment, so make it natural
   - Example: "This article could naturally showcase your hands-on experience with agent tools, inviting readers to follow for more practical insights. Sound good?"
   - Never ask "how does this align?" — always propose alignment yourself

After each field is confirmed, update `brief.md` and check the corresponding checklist item.

### Step 3: Build Outline

1. Based on the completed brief, propose an outline draft
   - Each section should have a clear purpose noted
   - Keep it concise: section titles + one-line descriptions
2. Iterate with the user until the structure is solid
3. Write the confirmed outline to the **Outline** section of `brief.md`
4. Check "Outline completed" in the checklist

### Step 4: Readiness Check

1. Verify all Preparation checklist items are checked (except "Ready for writing")
2. Check "Ready for writing" as the final confirmation
3. Update **Status** in `brief.md` from `draft` to `ready`
4. Inform the user: this article is ready for the writing phase

## Output

A fully completed `brief.md` in `articles/{date}_{slug}/` with:
- All Article Info fields filled
- Target Audience described
- Source Ideas linked
- Article Goals defined with goal alignment
- Outline confirmed
- All Preparation checklist items checked
- Status set to `ready`

The user can return to modify the brief at any time.

## You Do NOT

- Write article content (that's the Writing skill)
- Review articles (that's the Review skill)

## Behavior Principles

- **Ghostwriter mode**: Always propose content for the user to confirm or adjust. Never ask the user to write from scratch.
- **Ambient alignment**: Reference goals from `config.md` naturally throughout. Proactively suggest alignment — don't wait to be asked.
- **Tone**: Collaborative and non-pushy. "This could be a good opportunity to..." not "You must align with..."

## Reference

- See [brief format](references/brief-format.md) for detailed field descriptions and status transitions
- Default template: [brief-template.md](assets/brief-template.md)
```

- [ ] **Step 2: Validate SKILL.md frontmatter**

Check that:
- `name` field is `article-preparation` (matches directory name)
- `name` is lowercase, letters/numbers/hyphens only, no leading/trailing hyphens
- `description` is non-empty, under 1024 characters
- Frontmatter is valid YAML between `---` delimiters

- [ ] **Step 3: Verify the skill directory structure**

Run: `find skills/article-preparation -type f | sort`

Expected:
```
skills/article-preparation/SKILL.md
skills/article-preparation/assets/brief-template.md
skills/article-preparation/references/brief-format.md
```

- [ ] **Step 4: Commit**

```bash
git add skills/article-preparation/SKILL.md
git commit -m "feat: add Article Preparation SKILL.md with brief guidance and outline building"
```

---

### Task 6: Final Verification and Documentation

Verify the complete structure and add a README.

**Files:**
- Create: `README.md`

- [ ] **Step 1: Verify complete file structure**

Run: `find skills workspace-template -type f | sort`

Expected:
```
skills/article-preparation/SKILL.md
skills/article-preparation/assets/brief-template.md
skills/article-preparation/references/brief-format.md
skills/writing-management/SKILL.md
skills/writing-management/references/config-format.md
skills/writing-management/references/ideas-format.md
workspace-template/config.md
workspace-template/ideas.md
workspace-template/templates/brief-template.md
```

- [ ] **Step 2: Verify brief template consistency**

Check that `skills/article-preparation/assets/brief-template.md` and `workspace-template/templates/brief-template.md` have identical content.

Run: `diff skills/article-preparation/assets/brief-template.md workspace-template/templates/brief-template.md`

Expected: no output (files are identical)

- [ ] **Step 3: Create README.md**

```markdown
# Writer

A writing workflow system powered by AI agent skills. Guides users from idea to published article with ambient goal alignment.

## Skills

| Skill | Description |
|-------|-------------|
| [writing-management](skills/writing-management/) | Initialize workspace, set goals, manage idea pool |
| [article-preparation](skills/article-preparation/) | Create article directory, guide brief, build outline |

Skills follow the [Agent Skills open standard](https://agentskills.io/) and work with any compatible AI agent (Claude Code, OpenAI Codex, Cursor, Gemini CLI, and 30+ others).

## Quick Start

1. Copy the `workspace-template/` directory to your working directory (or let the Management skill initialize it for you)
2. Add the skills from `skills/` to your AI agent
3. Start by telling your agent about your writing goals — the Management skill will set up `config.md`
4. Share ideas — they'll be collected in `ideas.md`
5. When ready to write, tell your agent to prepare an article — the Article Preparation skill will guide you

## Workspace Structure

```
config.md                # Your writing goals and direction
ideas.md                 # Idea pool
templates/
  brief-template.md      # Article brief template (editable)
articles/
  {YYYY-MM-DD}_{slug}/
    article.md           # Article content
    article.{lang}.md    # Translated versions
    brief.md             # Writing brief and progress tracking
    assets/              # Images and other assets
```

## Design

See [docs/superpowers/specs/2026-03-17-writing-workflow-design.md](docs/superpowers/specs/2026-03-17-writing-workflow-design.md) for the full design spec.
```

- [ ] **Step 4: Commit**

```bash
git add README.md
git commit -m "docs: add README with quick start guide and skill overview"
```

- [ ] **Step 5: Final commit check**

Run: `git log --oneline`

Expected: 6 commits for this implementation (workspace template, management references, management SKILL.md, preparation references, preparation SKILL.md, README).
