# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

A writing workflow system powered by AI agent skills, following the [Agent Skills open standard](https://agentskills.io/). Skills guide users from idea to published article through four stages: management → preparation → writing → translation.

## Architecture

Four skills form a pipeline, each with clear boundaries:

1. **writing-management** (`skills/writing-management/`) — Workspace init, goals/style config (`writing.config.md`), style profiles (`profiles/`), idea pool (`ideas.md`)
2. **article-preparation** (`skills/article-preparation/`) — Creates article directory, guides brief completion, optional topic research, interviews author for materials, builds outline with materials
3. **article-writing** (`skills/article-writing/`) — Writes draft from materials-based outline, runs automated review and fact-check loops, revises with author feedback
4. **article-translation** (`skills/article-translation/`) — Translates completed articles into target languages, runs automated translation review loop

Each skill has: `SKILL.md` (main definition with frontmatter), `references/` (supporting docs), `assets/` (templates).

The `reference/blog-writing/` directory contains a separate blog-writing skill specific to Bernard's blog — it's a reference implementation, not part of the installable skills.

## Key Design Principles

- **Ghostwriter mode**: Skills propose content for the user to confirm/adjust. Never ask the user to write from scratch.
- **Ambient alignment**: Goals from `writing.config.md` are referenced naturally throughout, not forced. "This connects well with..." not "You must align with..."
- **Materials are sacred**: Articles are written from author-sourced materials and author-confirmed research findings. Never fabricate examples, numbers, or anecdotes.

## Workspace Structure (created by skills in user's project)

`writing.config.md` lives at the repository root. The `workspace` frontmatter field (default: `.`) points to where writing files live. It can be a relative path (resolved from repo root) or an absolute path starting with `/` (for cross-repo setups where skills and content live in different directories).

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

## Article Brief Lifecycle

`brief.md` status transitions: `draft` → `ready` → `writing` → `review` → `published`

## Writing Rules (article-writing skill)

The writing rules define prohibited AI patterns and quality requirements. The built-in rules are at `skills/article-writing/references/writing-rules.md`; on workspace init, a customizable copy is placed at `{workspace}/writing-rules.md` for users to modify. The article-writing skill commits the first draft (Step 4), then runs an author-paced writing review loop (Step 5) that dispatches a writing reviewer subagent, followed by a fact-check review loop (Step 6) that dispatches a fact-check reviewer subagent. Both reviewers produce structured review reports saved to the article's `reviews/` directory.

## Design Documents

Specs and implementation plans are in `docs/superpowers/`:
- `specs/` — Design documents explaining the rationale behind each skill
- `plans/` — Implementation plans with step-by-step tasks
