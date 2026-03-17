# Writing Workflow System Design

## Overview

A writing system that guides users — especially those not comfortable with writing — through the process of turning ideas into published articles that align with their goals. Works for individuals and teams alike.

**Scope of this design:** Management skill and Article Preparation skill only. Writing skill, Review skill, and social platform integration are out of scope for now.

### Platform Independence

This system is designed to work with any AI agent that can read and write files. The workspace structure (`config.md`, `ideas.md`, `templates/`, `articles/`) is the shared data layer — it contains no platform-specific logic.

Skills (the instructions that tell agents how to operate on workspace files) follow the [Agent Skills open standard](https://agentskills.io/) (`SKILL.md` format with YAML frontmatter). This standard is supported by 30+ platforms including Claude Code, OpenAI Codex, Cursor, Gemini CLI, GitHub Copilot, OpenHands, Goose, Roo Code, and others.

Each skill is packaged as a directory with a `SKILL.md` file and optional `scripts/`, `references/`, and `assets/` subdirectories per the specification.

## Architecture: State-Driven via Files

Each skill is independent. Skills communicate through files in the workspace — no skill needs to know about other skills' existence. This allows:
- Independent development and testing of each skill
- Human intervention at any point (edit files directly)
- Future meta-skill orchestration without changing individual skills

### Four Skills (two in scope now)

| Skill | Responsibility | In Scope |
|-------|---------------|----------|
| Management | Init workspace, set goals, manage idea pool | Yes |
| Article Preparation | Create article directory, guide brief creation, build outline | Yes |
| Writing | Ghostwrite article based on brief | No (needs research) |
| Review | Check goal alignment, quality, iterate feedback | No |

## Workspace Structure

```
writer/
  config.md                # Writing plan goals and direction
  ideas.md                 # Idea pool
  templates/
    brief-template.md      # Article brief template (user-editable)
  articles/
    {article-slug}/
      article.md           # Article content in original language (clean, no metadata)
      article.{lang}.md    # Translated versions (e.g., article.en.md, article.zh.md)
      brief.md             # Copied from template, filled during preparation
      assets/              # Images and other assets
```

## Skill 1: Management

### Responsibilities
1. Initialize workspace
2. Set and maintain writing goals
3. Manage idea pool

### Behavior

**Initialization (first use):**
- Create workspace directory structure if not exists
- Guide user to describe who they are and their writing goals → write `config.md`
- Create `ideas.md` and `templates/brief-template.md` (default version)

**Receiving new ideas:**
- Record to `ideas.md` under "Pending" section with date and contributor (if applicable)
- Check for connections with existing ideas; suggest merges in "AI Suggestions" section
- Lightly reference how the idea relates to goals from `config.md` (ambient alignment)

**Organizing idea pool:**
- When the user asks about the idea pool, or when receiving a new idea and there are 5+ pending ideas, include article suggestions in the response alongside the idea confirmation
- Mark adopted ideas, link to corresponding article directory

### Does NOT do
- Create article directories (that's Article Preparation)
- Write articles (that's Writing skill)

### File Format: config.md

```markdown
# Writing Plan

## About
{One paragraph describing who you are — individual or organization — and your vision}

## Writing Goals
{One paragraph describing what the writing aims to achieve, who it targets, and the desired tone}
```

**Example (sadcoder):**

```markdown
# Writing Plan

## About
sadcoder builds AI agent tools. We envision a future where people rely heavily on AI agents to get work done, and we're building products for that world.

## Writing Goals
Demonstrate our hands-on experience and insights in the AI agent space to attract people interested in AI agents — getting them to follow us on Twitter or leave their email on our website. Tone should be practical and opinionated, like a team that's actually building this stuff sharing what they've learned.
```

### File Format: ideas.md

```markdown
# Idea Pool

## Pending
- [YYYY-MM-DD] idea description
- [YYYY-MM-DD] @contributor: idea description  <!-- contributor is optional -->

## AI Suggestions
> [YYYY-MM-DD] Suggestion about merging/developing ideas, with alignment notes
> [YYYY-MM-DD] Another suggestion (append-only log, new suggestions are appended)

## Adopted
- [YYYY-MM-DD] → articles/{slug} (from idea description)  <!-- date is when the idea was adopted -->
```

AI Suggestions is an append-only log. New suggestions are added when:
- A new idea is received that connects to existing ideas
- The user asks for the current state of the idea pool

## Skill 2: Article Preparation

### Responsibilities
1. Create article directory from an idea
2. Guide brief completion through conversation
3. Build outline collaboratively
4. Confirm readiness for writing

### Trigger
The user decides to develop an idea (or set of ideas) into an article.

### Input
- Selected idea(s) from `ideas.md` or directly described by the user
- `config.md` (goals, referenced throughout)
- `templates/brief-template.md` (current version)

### Flow

**Step 1: Create article directory**
- AI proposes a slug based on the article topic (e.g., `ai-agent-dev-workflow`); user confirms or adjusts
- Create `articles/{slug}/` with `brief.md` (copied from template), empty `article.md`, and `assets/`
- Populate the Source Ideas section in `brief.md` with references to the original idea(s) from `ideas.md`
- Update `ideas.md`: mark related ideas as adopted

**Step 2: Guide brief completion (conversation with user)**
- For every field, AI proposes suggestions based on the article topic and `config.md`
- User confirms, adjusts, or adds detail
- Ask which language the article will be written in, and whether translations are needed (e.g., write in Chinese, translate to English)
- Goal alignment is suggested naturally by AI — e.g., "This article could naturally showcase your hands-on experience, inviting readers to follow for more. Sound good?"
- Tone is collaborative and non-pushy

**Step 3: Build outline**
- AI proposes outline draft based on brief information
- Iterate with user until each section's purpose is clear
- Write confirmed outline to `brief.md`

**Step 4: Readiness check**
- Confirm all other items under the "Preparation" section of the checklist in `brief.md` are complete
- Check "Ready for writing" as the final confirmation
- Update Status in `brief.md` from `draft` to `ready`
- Inform user: this article is ready for the writing phase

### Output
- Fully completed `brief.md` (audience, goals, alignment, outline, checklist items checked)
- User can return to modify brief at any time

### Does NOT do
- Write article content (that's Writing skill)
- Review articles (that's Review skill)

## Template: brief-template.md (Default Version)

User-editable. Initialization creates this default; users can modify it to fit their needs.

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

## AI Behavior Principles

### Ambient Goal Alignment (throughout all skills)
- Goals from `config.md` are referenced throughout, not just at one checkpoint
- AI suggests alignment naturally, never demands it
- Tone: "This could be a good opportunity to..." not "You must align with..."

### Ghostwriter Mode (applies to all skills, not just Writing)
- AI proposes content; users confirm or adjust
- In Article Preparation: AI proposes audience descriptions, goals, alignment points, and outlines
- In Writing (future): AI drafts full article text
- Especially important for goal alignment — users shouldn't have to figure out how to align on their own
- Lower the barrier: users provide ideas and direction, AI handles the writing

### Updating Goals
- Users can update `config.md` at any time through conversation with the Management skill
- Updates are full rewrites of the relevant section (about, writing goals)
- Existing articles are not retroactively checked; alignment checks only apply going forward

### State Transitions via File Status
- Each skill reads and writes files; no direct skill-to-skill communication
- `brief.md` checklist tracks overall article progress across all skills
- `ideas.md` status tracks idea lifecycle

## Edge Cases

- **Workspace already initialized**: Management skill detects existing `config.md` and skips initialization; offers to update goals instead
- **Slug collision**: If `articles/{slug}/` already exists, AI appends a number suffix (e.g., `ai-agent-workflow-2`) and confirms with the user
- **Article Preparation without config**: AI informs the user that the workspace needs to be initialized first and guides them to set up `config.md`
- **Re-adopting an idea**: If an idea is already marked as adopted, AI informs the user and links to the existing article

## Future Work (Out of Scope)

- **Writing Skill**: Specialized ghostwriting based on brief. Needs research on AI writing quality.
- **Review Skill**: Alignment check, quality review, iterative feedback.
- **Social Platform Publishing**: Generate X/Twitter threads from finished articles.
- **Meta Skill**: Orchestrate the four skills into a guided end-to-end workflow.
- **Idea Pool Expansion**: Migrate from single file to per-idea files when volume demands it.
- **Published Archive**: Move finalized articles from `articles/` to `published/{year}/{slug}/` for easier browsing by year.
