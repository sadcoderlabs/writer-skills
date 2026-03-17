# Writing Skill & Preparation Rework Design

## Overview

Redesign of the Article Preparation skill and addition of a new Writing skill. The core insight: good tech writing (experience-sharing type) gets its value from the author's real decisions, surprises, and specific details — not from AI's ability to generate fluent text. The system must extract these materials from the author before writing, not after.

**Scope:** Article Preparation skill rework + new Writing skill + minor Management skill update (Writing Style section in config.md). Translation and Review skills remain out of scope.

### Key Design Decisions

1. **Interview before outline** — The original flow built an outline during preparation, then tried to fill it with content. The new flow interviews the author first, then builds an outline around the actual materials. You can't structure what you don't have.
2. **Materials embedded in outline** — Interview materials are attached directly to outline sections, not stored separately. This gives the Writing skill a clear "write this section using these materials" contract per section.
3. **Writing skill receives complete input** — By the time the Writing skill runs, all materials are gathered and organized. Its job is purely about craft: turning structured materials into readable prose.
4. **Anti-template writing rules** — Built-in rules to avoid common AI writing patterns (dash-connected contrasts, hollow opening questions, filler transitions). Combined with author-provided style references.

## Revised Flow

```
Original:  Idea → Brief(info) → Outline → Ready → (no writing skill)
New:       Idea → Brief(info) → Interview → Outline(with materials) → Ready → Write draft → Author review
```

**State transitions remain:** `draft` → `ready` → `writing` → `review` → `published`

**Definitions:**
- **Materials** — The specific details, quotes, decisions, numbers, timelines, and examples extracted from the author during the interview. These are the factual foundation of the article that only the author can provide.

## Article Preparation Skill (Reworked)

### Responsibilities

1. Create article directory (unchanged)
2. Guide brief completion — basic info only, no outline yet
3. **NEW: Interview the author** — extract materials
4. **MOVED: Build outline** — now based on interview materials, not guessing
5. Readiness check (unchanged)

### Step 1: Create Article Directory (unchanged)

Same as current design:
- Propose slug, create `articles/{YYYY-MM-DD}_{slug}/`
- Copy brief template, create empty `article.md` and `assets/`
- Update `ideas.md`

### Step 2: Guide Brief Completion

Same fields as before (Title, Author, Date, Language, Translations, Target Audience, Article Goals, Goal alignment), with one addition:

- **Writing Style** (optional): Ask the author if they want to use the default style from `config.md`, or provide specific style references for this article (links to articles they like, descriptions of tone, specific rules). If they choose the default, leave this field empty.

No outline in this step — that comes after the interview.

### Step 3: Interview the Author (NEW)

**Purpose:** Extract the specific details, decisions, surprises, and insights that only someone who did the work would know.

**Strategy: Open question → Topic dimensions → Specific follow-ups**

1. **Opening** (open-ended): "What's the one thing you most want the reader to take away from this article?"
2. **Decisions**: "What key choices did you make along the way? Why did you go in this direction?"
3. **Surprises**: "What didn't you expect? What went wrong?"
4. **Insights**: "Looking back, what was counterintuitive? What would you do differently?"
5. **Specifics**: Follow up on any answer that's abstract — ask for numbers, timelines, concrete technical choices, actual error messages, real before/after comparisons.

**Interview behavior:**
- Ghostwriter mode — AI can propose hypotheses based on known context for the author to confirm or correct, rather than always asking blank questions
- One question at a time
- If the author gives an abstract answer, follow up asking for a concrete example
- Don't follow the order rigidly — let the conversation flow naturally
- Record materials to a `## Raw Materials` section in `brief.md` during the interview (temporary staging area)
- **Resumability**: If the conversation is interrupted mid-interview, the AI reads existing Raw Materials in `brief.md` and continues from where things left off, rather than restarting

**Interview completion:** When the AI has enough material to build a solid outline, propose wrapping up. A good heuristic: at least one concrete detail or author quote per expected section, and the author has addressed at least 3 of the 4 dimensions (decisions, surprises, insights, specifics). The author can always add more.

**Skipping the interview:** If the author already has detailed notes, an existing outline with specifics, or other prepared materials, they can provide these directly. The AI organizes the provided materials into the outline format (Step 4) instead of conducting the full interview. The key requirement is that the outline ends up with concrete materials per section — how they get there is flexible.

### Step 4: Build Outline with Materials

After the interview, AI proposes an outline where each section includes its purpose and the materials that belong there.

**Format:**

```markdown
## Outline

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
- The AI removes the `## Raw Materials` staging area once all materials are organized into the outline (no author confirmation needed — the materials are still there, just reorganized)

Iterate with the author until the outline is solid. Write confirmed outline to `brief.md`.

### Step 5: Readiness Check (unchanged)

Verify all checklist items, mark status as `ready`.

## Writing Skill (NEW)

### Trigger

`brief.md` has status `ready` and a completed outline with materials.

### Input

- `brief.md` — basic info + outline with materials
- `config.md` — global writing style (Writing Style section)
- `article.md` — empty, to be written

### Flow

1. **Read all inputs** — brief (info + outline with materials), config (global style)
2. **Update status** — `ready` → `writing`
3. **Produce complete first draft** — write to `article.md` in one pass
4. **Ask author to review** — author can edit `article.md` directly or give feedback via conversation
5. **Revise based on feedback** — multiple rounds until the author is satisfied
6. **Complete** — when the author approves the draft (after any number of revision rounds), check "First draft completed" in brief checklist, update status to `review`

**Note:** The article stays in `writing` status throughout all revision rounds. The transition to `review` only happens when the author explicitly approves the draft.

### Writing Rules (Anti-Template)

Built-in rules to counter common AI writing patterns:

**Prohibited patterns:**
- No dash-connected contrast sentences ("not A — but B")
- No "not A, but rather B" as a recurring sentence pattern
- No hollow opening questions ("Have you ever wondered...?")
- No summary sentences at the end of every paragraph
- No transition filler ("Let's dive deeper", "Next, let's look at", "Let's explore")
- No filler phrases ("actually", "in fact", "it's worth noting", "it turns out")

**Required quality:**
- Use the author's provided materials — never fabricate examples or numbers
- Preserve the author's voice — don't convert colloquial phrasing to formal prose unless the style reference calls for it
- Specific over abstract: use numbers when available, tell stories when available
- Each paragraph must advance the article — no repeating what the previous paragraph said
- The article reads as if the author wrote it, not as if AI summarized a brief

### Style Reference Usage

1. Read `config.md` Writing Style section (global default)
2. Read `brief.md` Writing Style field (article-level; if present, it **replaces** the global style entirely — no merging)
3. Style references can be: a prose description, links to reference articles, or specific rules
4. If no style reference exists at either level, use the anti-template rules as the only style guidance

### Output

- `article.md` — complete first draft in the article's original language
- `brief.md` — status updated, checklist items checked
- The article is clean prose with no metadata (metadata lives in brief.md)

### Does NOT Do

- Translate the article (future Translation skill)
- Review the article against goals (future Review skill)
- Modify the outline or materials in brief.md — if a section has insufficient materials to write well, ask the author to provide more details in conversation rather than fabricating content. If the issue is structural (section should be cut or merged), suggest the author revisit the outline before continuing.

## File Format Changes

### config.md — Added Writing Style section

```markdown
# Writing Plan

## About
{Who you are and your vision}

## Writing Goals
{What the writing aims to achieve, target audience, desired tone}

## Writing Style
{Global writing style preferences — prose description, reference article links, or specific rules}
```

### brief.md — Updated template

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
- {references to original ideas from ideas.md}

## Article Goals
- Reader takeaway:
- Goal alignment:

## Writing Style
{Optional — article-specific style references that replace the global style in config.md. Leave empty to use the global default.}

## Outline

{Built after interview — each section includes purpose and materials. See design doc for format.}

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

### Article directory structure — unchanged

```
articles/{YYYY-MM-DD}_{slug}/
  article.md    # Article content (original language, clean prose, no metadata)
  brief.md      # Brief + outline with materials
  assets/       # Images and other assets
```

## Affected Artifacts

This design requires changes to the following existing files:

| File | Change |
|------|--------|
| `skills/article-preparation/SKILL.md` | Rewrite to match new flow (interview, outline with materials) |
| `skills/article-preparation/assets/brief-template.md` | Update template (add Writing Style, new checklist items) |
| `skills/article-preparation/references/brief-format.md` | Update format reference to match new template |
| `skills/writing-management/SKILL.md` | Add Writing Style section to config.md initialization and update flow |
| `skills/writing-management/references/config-format.md` | Add Writing Style section |
| `workspace-template/config.md` | Add Writing Style section |
| `workspace-template/templates/brief-template.md` | Update to match new template |

New files to create:

| File | Purpose |
|------|---------|
| `skills/article-writing/SKILL.md` | New Writing skill |
| `skills/article-writing/references/writing-rules.md` | Anti-template rules reference |

### Management Skill Update

The Management skill needs a minor update: when initializing a workspace or updating `config.md`, it should include the `## Writing Style` section. During initialization, AI guides the user to describe their preferred writing style (or skip it for now). The rest of the Management skill is unchanged.

## AI Behavior Principles (unchanged, extended)

All principles from the original design still apply:

- **Ghostwriter mode**: AI proposes, user confirms or adjusts. Applies to interview questions (AI can propose hypotheses), outline structure, and article drafts.
- **Ambient alignment**: Reference goals from `config.md` naturally throughout. Proactively suggest alignment.
- **Collaborative tone**: "This could be a good opportunity to..." not "You must..."

**New for Writing skill:**
- **Materials are sacred**: The Writing skill uses the author's materials as-is. It can rephrase for flow but must not change the substance, fabricate details, or substitute generic statements for specific ones.
- **Author's voice**: The article should read as if the author wrote it. AI is the ghostwriter, not the author.
