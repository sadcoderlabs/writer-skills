# Writing Skill & Preparation Rework Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rework Article Preparation skill (add interview + materials-based outline) and create new Writing skill, with minor Management skill updates.

**Architecture:** All changes are Markdown skill files — no code, no tests. The system is file-driven: skills are SKILL.md files with YAML frontmatter, supported by reference files and templates. Skills communicate through workspace files (config.md, ideas.md, brief.md, article.md).

**Tech Stack:** Markdown, YAML frontmatter, Agent Skills open standard (agentskills.io)

**Spec:** `docs/superpowers/specs/2026-03-17-writing-skill-design.md`

---

## File Map

### Modified files

| File | Responsibility | Change |
|------|---------------|--------|
| `workspace-template/config.md` | Empty config template for new workspaces | Add `## Writing Style` section |
| `workspace-template/templates/brief-template.md` | Empty brief template for new workspaces | Add Writing Style field, update checklist (Interview + Outline with materials) |
| `skills/writing-management/references/config-format.md` | Documents config.md format | Add Writing Style section + example + guidelines |
| `skills/writing-management/SKILL.md` | Management skill instructions | Add Writing Style to initialization flow |
| `skills/article-preparation/assets/brief-template.md` | Default brief template bundled with skill | Same changes as workspace-template version |
| `skills/article-preparation/references/brief-format.md` | Documents brief.md format | Add Writing Style section, update Outline description, update checklist, update status transitions |
| `skills/article-preparation/SKILL.md` | Article Preparation skill instructions | Rewrite: add interview step, move outline after interview, add Writing Style collection |

### New files

| File | Responsibility |
|------|---------------|
| `skills/article-writing/SKILL.md` | Writing skill instructions |
| `skills/article-writing/references/writing-rules.md` | Anti-template writing rules reference |

---

### Task 1: Update workspace templates

These are the empty templates that get copied into new workspaces. Update them first so all downstream files are consistent.

**Files:**
- Modify: `workspace-template/config.md`
- Modify: `workspace-template/templates/brief-template.md`

- [ ] **Step 1: Update config.md template**

Add `## Writing Style` section to `workspace-template/config.md`:

```markdown
# Writing Plan

## About
{One paragraph describing who you are — individual or organization — and your vision}

## Writing Goals
{One paragraph describing what the writing aims to achieve, who it targets, and the desired tone}

## Writing Style
{Global writing style preferences — prose description, reference article links, or specific rules}
```

- [ ] **Step 2: Update brief-template.md template**

Replace `workspace-template/templates/brief-template.md` with:

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

## Writing Style
{Optional — article-specific style references that replace the global style in config.md. Leave empty to use the global default.}

## Outline

{Built after interview — each section includes purpose and materials.}

## Checklist

### Preparation
- [ ] Target audience confirmed
- [ ] Article goals confirmed
- [ ] Goal alignment confirmed
- [ ] Language and translations confirmed
- [ ] Interview completed
- [ ] Outline with materials completed
- [ ] Ready for writing

### Writing & Review (managed by later skills)
- [ ] First draft completed
- [ ] Review completed
- [ ] Translations completed
- [ ] Finalized
```

- [ ] **Step 3: Commit**

```bash
git add workspace-template/config.md workspace-template/templates/brief-template.md
git commit -m "feat: update workspace templates with Writing Style and interview checklist"
```

---

### Task 2: Update Management skill references

Update the config format reference to document the new Writing Style section, then update the Management SKILL.md to include Writing Style in the initialization flow.

**Files:**
- Modify: `skills/writing-management/references/config-format.md`
- Modify: `skills/writing-management/SKILL.md`

- [ ] **Step 1: Update config-format.md**

Replace the entire content of `skills/writing-management/references/config-format.md`. The file contains inner code fences, so here is the content described structurally:

**File: `skills/writing-management/references/config-format.md`**

The file has 4 sections:

1. **Heading**: `# config.md Format`

2. **Structure section** (`## Structure`): Contains a markdown code block showing the config.md template with three sections: `## About` (one paragraph, who you are and vision), `## Writing Goals` (one paragraph, purpose/audience/tone), and `## Writing Style` (global writing style preferences — prose description, reference article links, or specific rules).

3. **Example section** (`## Example`): Contains a markdown code block with a filled-in example:
   - About: "sadcoder builds AI agent tools. We envision a future where people rely heavily on AI agents to get work done, and we're building products for that world."
   - Writing Goals: "Demonstrate our hands-on experience and insights in the AI agent space to attract people interested in AI agents — getting them to follow us on Twitter or leave their email on our website. Tone should be practical and opinionated, like a team that's actually building this stuff sharing what they've learned."
   - Writing Style: "Direct and conversational. Short paragraphs. Use concrete examples from our own work rather than hypotheticals. Reference specific tools, numbers, and timelines. Avoid corporate-speak."

4. **Guidelines section** (`## Guidelines`): Bullet list:
   - "About" should be factual: who you are, what you do, your direction
   - "Writing Goals" combines purpose, target audience, and tone in one paragraph
   - "Writing Style" describes how articles should read — tone, structure preferences, reference articles, or specific rules. This applies to all articles by default; individual articles can override it in their brief.
   - Keep all sections concise — one paragraph each
   - This file is the anchor for ambient goal alignment and style consistency across all skills

Use the existing `config-format.md` as a structural guide — the only changes are adding the `## Writing Style` section to the Structure code block, adding a Writing Style example to the Example code block, and adding the Writing Style bullet to Guidelines.

- [ ] **Step 2: Update Management SKILL.md — initialization section**

In `skills/writing-management/SKILL.md`, replace the entire "### 1. Initialize Workspace (first use)" subsection (lines 28-38) with:

```markdown
### 1. Initialize Workspace (first use)

If `config.md` does not exist, the workspace needs initialization:

1. Create the directory structure above (if any part is missing)
2. Guide the user to describe who they are and their writing goals
   - Propose suggestions based on what you know from the conversation
   - User confirms or adjusts
3. Guide the user to describe their preferred writing style
   - Propose a style based on the goals and context from the conversation
   - The user can also provide links to articles they like as style references
   - If the user wants to skip this for now, write a placeholder: "Not yet defined"
   - User confirms or adjusts
4. Write the result to `config.md` — see [config format](references/config-format.md)
5. Create `ideas.md` with empty sections — see [ideas format](references/ideas-format.md)
6. Create `templates/brief-template.md` with the default brief template
```

- [ ] **Step 3: Commit**

```bash
git add skills/writing-management/references/config-format.md skills/writing-management/SKILL.md
git commit -m "feat: add Writing Style to Management skill and config format"
```

---

### Task 3: Update Article Preparation references and template

Update the brief format reference and the bundled brief template to match the new design.

**Files:**
- Modify: `skills/article-preparation/assets/brief-template.md`
- Modify: `skills/article-preparation/references/brief-format.md`

- [ ] **Step 1: Update bundled brief-template.md**

Replace `skills/article-preparation/assets/brief-template.md` with the exact same content as `workspace-template/templates/brief-template.md` from Task 1 Step 2.

- [ ] **Step 2: Update brief-format.md**

Replace `skills/article-preparation/references/brief-format.md` with:

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
  - `writing` → Writing skill is producing/revising the draft
  - `review` → author has approved the draft, ready for review
  - `published` → finalized and published
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

#### Writing Style
Optional. Article-specific style references that replace the global style in `config.md`. Can be a prose description, links to reference articles, or specific rules. Leave empty to use the global default.

#### Outline
The article's structure, built after the author interview. Each section includes:
- **Section title**: What this part of the article covers
- **Purpose**: What this section achieves for the reader
- **Materials**: Specific details, quotes, decisions, numbers, and examples from the author interview that belong in this section

The outline is shaped by the materials gathered during the interview, not by a generic template. Every section must have concrete materials — if a section has no materials, it should be cut or the author should be interviewed further.

#### Checklist
Tracks progress across all skills.

**Preparation** (managed by Article Preparation skill):
- Target audience confirmed
- Article goals confirmed
- Goal alignment confirmed
- Language and translations confirmed
- Interview completed
- Outline with materials completed
- Ready for writing

**Writing & Review** (managed by later skills):
- First draft completed
- Review completed
- Translations completed
- Finalized

## Status Transitions

| From | To | Trigger |
|------|----|---------|
| draft | ready | All Preparation checklist items complete |
| ready | writing | Writing skill begins |
| writing | review | Author approves the draft after revision rounds |
| review | published | Finalized |
```

- [ ] **Step 3: Commit**

```bash
git add skills/article-preparation/assets/brief-template.md skills/article-preparation/references/brief-format.md
git commit -m "feat: update brief template and format with Writing Style, interview, and materials outline"
```

---

### Task 4: Rewrite Article Preparation SKILL.md

This is the biggest change — rewriting the skill to include the interview step and move the outline after the interview.

**Files:**
- Modify: `skills/article-preparation/SKILL.md`

- [ ] **Step 1: Rewrite SKILL.md**

Replace `skills/article-preparation/SKILL.md` with:

```markdown
---
name: article-preparation
description: Prepare an article for writing. Creates article directory, interviews the author to extract materials, builds an outline based on those materials. Use when the user wants to start writing an article from an idea.
---

# Article Preparation

You prepare articles for writing — turning an idea into a fully planned article with a completed brief, author-sourced materials, and a structured outline.

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
10. **Writing Style**: Ask the author if they want to use the default style from `config.md`, or provide specific style references for this article (links to articles they like, descriptions of tone, specific rules). If they choose the default, leave this field empty.

After each field is confirmed, update `brief.md` and check the corresponding checklist item.

### Step 3: Interview the Author

**Purpose:** Extract the specific details, decisions, surprises, and insights that only someone who did the work would know. These materials are the factual foundation of the article.

**Strategy: Open question → Topic dimensions → Specific follow-ups**

1. **Opening** (open-ended): "What's the one thing you most want the reader to take away from this article?"
2. **Decisions**: "What key choices did you make along the way? Why did you go in this direction?"
3. **Surprises**: "What didn't you expect? What went wrong?"
4. **Insights**: "Looking back, what was counterintuitive? What would you do differently?"
5. **Specifics**: Follow up on any answer that's abstract — ask for numbers, timelines, concrete technical choices, actual error messages, real before/after comparisons.

**Behavior:**
- Ghostwriter mode — you can propose hypotheses based on known context for the author to confirm or correct, rather than always asking blank questions
- One question at a time
- If the author gives an abstract answer, follow up asking for a concrete example
- Don't follow the order rigidly — let the conversation flow naturally
- Record materials to a `## Raw Materials` section in `brief.md` during the interview (temporary staging area)
- **Resumability**: If the conversation was interrupted, read existing Raw Materials in `brief.md` and continue from where things left off

**When to wrap up:** When you have enough material to build a solid outline. A good heuristic: at least one concrete detail or author quote per expected section, and the author has addressed at least 3 of the 4 dimensions (decisions, surprises, insights, specifics). The author can always add more.

**Skipping the interview:** If the author already has detailed notes, an existing outline with specifics, or other prepared materials, they can provide these directly. Organize the provided materials into the outline format (Step 4) instead of conducting the full interview. The key requirement is that the outline ends up with concrete materials per section — how they get there is flexible.

After wrapping up, check "Interview completed" in the checklist.

### Step 4: Build Outline with Materials

Based on the interview materials, propose an outline where each section includes its purpose and the materials that belong there.

**Format:**

```
### 1. Section title
**Purpose:** What this section achieves for the reader
**Materials:**
- Author quote: "exact words from interview"
- Specific detail: numbers, timelines, technical choices
- Context: background needed to understand this section

### 2. Section title
**Purpose:** ...
**Materials:**
- ...
```

**Key principles:**
- Structure follows materials — the outline is shaped by what the author actually has to say, not by a generic template
- Every section must have materials — if a section has no materials, either interview more or cut the section
- Remove the `## Raw Materials` staging area once all materials are organized into the outline (no author confirmation needed — the materials are still there, just reorganized)

Iterate with the user until the outline is solid. Write the confirmed outline to the **Outline** section of `brief.md`. Check "Outline with materials completed" in the checklist.

### Step 5: Readiness Check

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
- Writing Style specified (or empty for global default)
- Outline with materials per section
- All Preparation checklist items checked
- Status set to `ready`

The user can return to modify the brief at any time.

## You Do NOT

- Write article content (that's the Writing skill)
- Review articles (that's the Review skill)

## Behavior Principles

- **Ghostwriter mode**: Always propose content for the user to confirm or adjust. Never ask the user to write from scratch. During interviews, propose hypotheses for the author to confirm or correct.
- **Ambient alignment**: Reference goals from `config.md` naturally throughout. Proactively suggest alignment — don't wait to be asked.
- **Tone**: Collaborative and non-pushy. "This could be a good opportunity to..." not "You must align with..."

## Reference

- See [brief format](references/brief-format.md) for detailed field descriptions and status transitions
- Default template: [brief-template.md](assets/brief-template.md)
```

- [ ] **Step 2: Commit**

```bash
git add skills/article-preparation/SKILL.md
git commit -m "feat: rewrite Article Preparation skill with interview and materials-based outline"
```

---

### Task 5: Create Writing skill reference — writing rules

Create the anti-template writing rules reference file before the main SKILL.md, so the skill can reference it.

**Files:**
- Create: `skills/article-writing/references/writing-rules.md`

- [ ] **Step 1: Create directory and writing-rules.md**

```bash
mkdir -p skills/article-writing/references
```

Write `skills/article-writing/references/writing-rules.md`:

```markdown
# Writing Rules

Rules to counter common AI writing patterns and ensure the article reads as if the author wrote it.

## Prohibited Patterns

These patterns are telltale signs of AI-generated text. Avoid them entirely.

### Sentence-level
- **Dash-connected contrasts**: "not A — but B", "not A — rather B". Rephrase as two separate sentences or use a different structure.
- **"Not A, but rather B"**: Overused contrast formula. Find a different way to make the point.
- **Hollow opening questions**: "Have you ever wondered...?", "What if I told you...?". Start with a concrete statement or story instead.
- **Filler phrases**: "actually", "in fact", "it's worth noting", "it turns out", "interestingly enough". Cut them — they add no information.

### Paragraph-level
- **Summary sentences at paragraph end**: Don't restate what the paragraph just said. End with the last real point or let the next paragraph provide the transition.
- **Transition filler**: "Let's dive deeper", "Next, let's look at", "Let's explore", "Moving on to". Just start the next section — the heading provides the transition.
- **Repetition across paragraphs**: Each paragraph must advance the article. If a paragraph restates what the previous one said, merge them or cut the repetition.

### Structure-level
- **Listicle structure for non-list content**: Don't force content into numbered lists when prose would be more natural.
- **Symmetrical sections**: Not every section needs the same length or structure. Let the content dictate the shape.

## Required Quality

### Use the author's materials
- Every claim, example, and number in the article must come from the materials in the outline. Never fabricate examples, statistics, or anecdotes.
- If a section's materials are too thin to write well, flag it to the author rather than padding with generic statements.

### Preserve the author's voice
- Keep the author's original phrasing when it's vivid or distinctive. Don't smooth colloquial language into formal prose unless the style reference specifically asks for it.
- Match the tone and register of the style reference. If no style reference exists, default to direct and conversational.

### Be specific
- Numbers over adjectives: "3x faster" not "significantly faster"
- Names over categories: "we used Redis" not "we used a caching solution"
- Stories over summaries: "On day one, the deploy failed because..." not "We encountered some initial challenges"

### Advance, don't repeat
- Each paragraph should move the article forward. The reader should learn something new in every paragraph.
- If you find yourself restating a point, you're either padding or the outline has a structural issue.
```

- [ ] **Step 2: Commit**

```bash
git add skills/article-writing/references/writing-rules.md
git commit -m "feat: add anti-template writing rules reference"
```

---

### Task 6: Create Writing skill SKILL.md

The main Writing skill file — the core of this entire design.

**Files:**
- Create: `skills/article-writing/SKILL.md`

- [ ] **Step 1: Write SKILL.md**

Write `skills/article-writing/SKILL.md`:

```markdown
---
name: article-writing
description: Write an article based on a completed brief with materials. Produces a full first draft from the outline and author-sourced materials, then revises based on author feedback. Use when a brief has status "ready" and the user wants to start writing.
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

**Style resolution:**
- If `brief.md` has a Writing Style field with content, use it (replaces global style entirely)
- If `brief.md` Writing Style is empty, use `config.md` Writing Style section
- If neither has style guidance, rely on the writing rules alone

### Step 2: Update Status

Change status in `brief.md` from `ready` to `writing`.

### Step 3: Write the First Draft

Produce the complete article in one pass and write it to `article.md`.

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

### Step 4: Author Review

Present the draft to the author and ask for feedback. The author can:
- Edit `article.md` directly (you read the changes and continue from there)
- Give feedback in conversation (you apply the changes)
- Approve the draft as-is

### Step 5: Revise Based on Feedback

If the author has feedback:
- Apply the requested changes to `article.md`
- Ask if there's more to revise
- Repeat until the author is satisfied

The article stays in `writing` status throughout all revision rounds.

**If materials are insufficient for a section:** Ask the author to provide more details in conversation. Do not fabricate content. If the issue is structural (a section should be cut or merged), suggest the author revisit the outline before continuing.

### Step 6: Complete

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
- Use the author's provided materials — never fabricate
- Preserve the author's voice and phrasing
- Be specific: numbers, names, stories over adjectives, categories, summaries
- Every paragraph advances the article — no repetition

## Behavior Principles

- **Ghostwriter**: The article reads as if the author wrote it, not as if AI summarized a brief.
- **Materials are sacred**: You can rephrase for flow but must not change the substance, fabricate details, or substitute generic statements for specific ones.
- **Ambient alignment**: The article naturally reflects the goals in `config.md` through the materials — the alignment was built into the brief during preparation.

## Reference

- See [writing rules](references/writing-rules.md) for prohibited patterns and quality requirements
```

- [ ] **Step 2: Commit**

```bash
git add skills/article-writing/SKILL.md
git commit -m "feat: add Writing skill with anti-template rules and materials-based drafting"
```

---

### Task 7: Final verification

Verify all files are consistent and the full skill set is complete.

- [ ] **Step 1: Verify new files exist**

```bash
ls skills/article-writing/SKILL.md skills/article-writing/references/writing-rules.md
```

Expected: both files exist, no errors.

- [ ] **Step 2: Verify brief templates are identical**

```bash
diff workspace-template/templates/brief-template.md skills/article-preparation/assets/brief-template.md
```

Expected: no output (files are identical).

- [ ] **Step 3: Verify config template has Writing Style section**

```bash
grep "## Writing Style" workspace-template/config.md skills/writing-management/references/config-format.md
```

Expected: both files contain `## Writing Style`.

- [ ] **Step 4: Verify checklist consistency**

Check that both brief templates and the brief-format.md reference all list the same checklist items: "Interview completed" and "Outline with materials completed" (not the old "Outline completed").

```bash
grep -n "Interview completed\|Outline with materials completed\|Outline completed" skills/article-preparation/assets/brief-template.md skills/article-preparation/references/brief-format.md workspace-template/templates/brief-template.md
```

Expected: "Interview completed" and "Outline with materials completed" appear in all three files. "Outline completed" (without "with materials") should NOT appear.

- [ ] **Step 5: Verify Management SKILL.md has 6 initialization steps**

```bash
grep -c "^[0-9]\." skills/writing-management/SKILL.md
```

Expected: 6 (was 5 before, now includes the Writing Style step).

- [ ] **Step 6: Verify Article Preparation SKILL.md has interview step**

```bash
grep "Interview the Author" skills/article-preparation/SKILL.md
```

Expected: matches "### Step 3: Interview the Author".
