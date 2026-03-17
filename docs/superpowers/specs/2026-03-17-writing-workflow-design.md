# Writing Workflow System Design

## Overview

A collaborative writing system for sadcoder, powered by OpenClaw on Slack. The system guides team members — especially those not comfortable with writing — through the process of turning ideas into published articles that align with company goals.

**Scope of this design:** Management skill and Article Preparation skill only. Writing skill, Review skill, and social platform integration are out of scope for now.

## Architecture: State-Driven via Files

Each skill is independent. Skills communicate through files in the workspace — no skill needs to know about other skills' existence. This allows:
- Independent development and testing of each skill
- Human intervention at any point (edit files directly)
- Future meta-skill orchestration without changing individual skills

### Four Skills (two in scope now)

| Skill | Responsibility | In Scope |
|-------|---------------|----------|
| Management | Init workspace, set company goals, manage idea pool | Yes |
| Article Preparation | Create article directory, guide brief creation, build outline | Yes |
| Writing | Ghostwrite article based on brief | No (needs research) |
| Review | Check goal alignment, quality, iterate feedback | No |

## Workspace Structure

```
writer/
  config.md                # Writing plan goals, company direction
  ideas.md                 # Idea pool
  templates/
    brief-template.md      # Article brief template (user-editable)
  articles/
    {article-slug}/
      article.md           # Article content (clean, no metadata)
      brief.md             # Copied from template, filled during preparation
      assets/              # Images and other assets
```

## Skill 1: Management

### Responsibilities
1. Initialize workspace
2. Set and maintain company goals
3. Manage idea pool

### Behavior

**Initialization (first use):**
- Create workspace directory structure if not exists
- Guide user to describe company direction and writing purpose → write `config.md`
- Create `ideas.md` and `templates/brief-template.md` (default version)

**Receiving new ideas:**
- Record to `ideas.md` under "Pending" section with date and submitter
- Check for connections with existing ideas; suggest merges in "AI Suggestions" section
- Lightly reference how the idea relates to company goals from `config.md` (ambient alignment)

**Organizing idea pool:**
- When ideas accumulate, proactively suggest which ones could become articles
- Mark adopted ideas, link to corresponding article directory

### Does NOT do
- Create article directories (that's Article Preparation)
- Write articles (that's Writing skill)

### File Format: config.md

```markdown
# Writing Plan

## Company Direction
{One paragraph describing what the company does and its vision}

## Writing Purpose
{One paragraph describing what the writing aims to achieve}

## Content Direction
{One paragraph describing the angle/tone of content}
```

### File Format: ideas.md

```markdown
# Idea Pool

## Pending
- [YYYY-MM-DD] @person: idea description
- [YYYY-MM-DD] @person: idea description

## AI Suggestions
> Suggestion about merging/developing ideas, with alignment notes

## Adopted
- → articles/{slug} (merged from @person1 and @person2's ideas)
```

## Skill 2: Article Preparation

### Responsibilities
1. Create article directory from an idea
2. Guide brief completion through conversation
3. Build outline collaboratively
4. Confirm readiness for writing

### Trigger
A team member decides to develop an idea (or set of ideas) into an article.

### Input
- Selected idea(s) from `ideas.md` or directly described by the team member
- `config.md` (company goals, referenced throughout)
- `templates/brief-template.md` (current version)

### Flow

**Step 1: Create article directory**
- Create `articles/{slug}/` with `brief.md` (copied from template), empty `article.md`, and `assets/`
- Update `ideas.md`: mark related ideas as adopted

**Step 2: Guide brief completion (conversation with team member)**
- For every field, AI proposes suggestions based on the article topic and `config.md`
- Team member confirms, adjusts, or adds detail
- Company goal alignment is suggested naturally by AI — e.g., "This article could naturally showcase sadcoder's hands-on experience, inviting readers to follow for more. Sound good?"
- Tone is collaborative and non-pushy

**Step 3: Build outline**
- AI proposes outline draft based on brief information
- Iterate with team member until each section's purpose is clear
- Write confirmed outline to `brief.md`

**Step 4: Readiness check**
- Confirm all preparation checklist items in `brief.md` are complete
- Inform team member: this article is ready for the writing phase

### Output
- Fully completed `brief.md` (audience, goals, alignment, outline, checklist items checked)
- Team member can return to modify brief at any time

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
- Status: draft

## Target Audience
- Who:
- Background:

## Article Goals
- Reader takeaway:
- Company alignment:

## Outline


## Checklist
- [ ] Target audience confirmed
- [ ] Article goals confirmed
- [ ] Company alignment confirmed
- [ ] Outline completed
- [ ] Ready for writing
- [ ] First draft completed
- [ ] Review completed
- [ ] Finalized
```

## AI Behavior Principles

### Ambient Goal Alignment (throughout all skills)
- Company goals from `config.md` are referenced throughout, not just at one checkpoint
- AI suggests alignment naturally, never demands it
- Tone: "This could be a good opportunity to..." not "You must align with..."

### Ghostwriter Mode
- AI proposes content; team members confirm or adjust
- Especially important for company alignment — team members shouldn't have to figure out how to align on their own
- Lower the barrier: team members provide ideas and direction, AI handles the writing

### State Transitions via File Status
- Each skill reads and writes files; no direct skill-to-skill communication
- `brief.md` checklist tracks overall article progress across all skills
- `ideas.md` status tracks idea lifecycle

## Future Work (Out of Scope)

- **Writing Skill**: Specialized ghostwriting based on brief. Needs research on AI writing quality.
- **Review Skill**: Goal alignment check, quality review, iterative feedback.
- **Social Platform Publishing**: Generate X/Twitter threads from finished articles.
- **Meta Skill**: Orchestrate the four skills into a guided end-to-end workflow.
- **Idea Pool Expansion**: Migrate from single file to per-idea files when volume demands it.
