# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

A writing workflow system powered by AI agent skills, following the [Agent Skills open standard](https://agentskills.io/). Skills guide users from idea to published article through three stages: management → preparation → writing.

## Architecture

Three skills form a pipeline, each with clear boundaries:

1. **writing-management** (`skills/writing-management/`) — Workspace init, goals/style config (`config.md`), idea pool (`ideas.md`)
2. **article-preparation** (`skills/article-preparation/`) — Creates article directory, guides brief completion, optional topic research, interviews author for materials, builds outline with materials
3. **article-writing** (`skills/article-writing/`) — Writes draft from materials-based outline, runs automated review and fact-check loops, revises with author feedback

Each skill has: `SKILL.md` (main definition with frontmatter), `references/` (supporting docs), `assets/` (templates).

The `reference/blog-writing/` directory contains a separate blog-writing skill specific to Bernard's blog — it's a reference implementation, not part of the installable skills.

## Key Design Principles

- **Ghostwriter mode**: Skills propose content for the user to confirm/adjust. Never ask the user to write from scratch.
- **Ambient alignment**: Goals from `config.md` are referenced naturally throughout, not forced. "This connects well with..." not "You must align with..."
- **Materials are sacred**: Articles are written from author-sourced materials and author-confirmed research findings. Never fabricate examples, numbers, or anecdotes.

## Workspace Structure (created by skills in user's project)

```
config.md                    # Writing goals, direction, style
ideas.md                     # Idea pool (Pending → Adopted)
templates/brief-template.md  # Article brief template
articles/{YYYY-MM-DD}_{slug}/
  article.md                 # Article content (clean prose, no metadata)
  brief.md                   # Brief, materials, outline, progress tracking
  research.md                # External research and fact-check sources
  assets/                    # Images and other assets
```

## Article Brief Lifecycle

`brief.md` status transitions: `draft` → `ready` → `writing` → `review` → `published`

## Writing Rules (article-writing skill)

The writing rules in `skills/article-writing/references/writing-rules.md` define prohibited AI patterns and quality requirements. The article-writing skill includes a draft review loop (Step 4) that dispatches a writing reviewer subagent, followed by a fact-check review (Step 5) that dispatches a fact-check reviewer subagent.

## Design Documents

Specs and implementation plans are in `docs/superpowers/`:
- `specs/` — Design documents explaining the rationale behind each skill
- `plans/` — Implementation plans with step-by-step tasks
