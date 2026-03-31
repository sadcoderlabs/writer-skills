# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

A writing workflow system powered by AI agent skills, following the [Agent Skills open standard](https://agentskills.io/). Skills guide users from idea to published content — articles through four stages (management → preparation → writing → translation) and social posts through a parallel lightweight workflow (management → post-writing).

## Architecture

Each skill exists in two languages:
- `skills/` — English (published version, translated from Chinese)
- `skills-zhtw/` — Traditional Chinese (source of truth, where all edits happen)

Six skills form the system, each with clear boundaries:

1. **writing-management** (`skills/writing-management/`) — Workspace init, goals/style config (`writing.config.md`), style profiles (`profiles/`), idea pool (`ideas.md`), social style guide, batch style extraction
2. **article-preparation** (`skills/article-preparation/`) — Creates article directory, guides brief completion, optional topic research, interviews author for materials, builds outline with materials
3. **article-writing** (`skills/article-writing/`) — Writes draft from materials-based outline, runs automated review and fact-check loops, revises with author feedback
4. **article-translation** (`skills/article-translation/`) — Translates completed articles into target languages, runs automated translation review loop
5. **post-writing** (`skills/post-writing/`) — Writes social media posts (single or thread), supports article-derived, standalone, and engagement-sourced creation, lightweight automated review, in-file translation, style feedback extraction
6. **x-engagement** (`skills/x-engagement/`) — Daily X engagement discovery via Grok x_search, tweet verification via Syndication API, agent-curated recommendations with draft copy, shared inbox for human execution

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
  social-style-guide.md          # Social style guide (evolving, jackbutcher.md-inspired)
  posts/{YYYY-MM-DD}_{slug}.md   # Social media posts (flat files, with in-file translations)
  engagement/                    # X engagement data (conditional on x-engagement skill)
    interests.yaml               # Interest list for X discovery
    inbox.yaml                   # Rolling recommendation log
    candidates.yaml              # Discovery temp (overwritten each run)
  articles/{YYYY-MM-DD}_{slug}/
    article.{lang}.md            # Article content (clean prose, no metadata). {lang} = original language code from brief.md
    brief.md                     # Brief, materials, outline, progress tracking
    research.md                  # External research and fact-check sources
    reviews/                     # Review reports from automated reviewers
    assets/                      # Images and other assets
```

## Article Brief Lifecycle

`brief.md` status transitions: `draft` → `ready` → `writing` → `review` → `published`

## Post Lifecycle

Post status transitions: `draft` → `review` → `published`

## Writing Rules (article-writing skill)

The writing rules define prohibited AI patterns and quality requirements. The built-in rules are at `skills/article-writing/references/writing-rules.md`; on workspace init, a customizable copy is placed at `{workspace}/writing-rules.md` for users to modify. The article-writing skill commits the first draft (Step 4), then runs an author-paced writing review loop (Step 5) followed by a fact-check review loop (Step 6). Both reviewers produce structured review reports saved to the article's `reviews/` directory.

## Review Dispatch Model

All review/research steps default to **inline execution** — the main agent switches to a reviewer perspective and applies the criteria from the corresponding `*-prompt.md` template. This ensures cross-platform compatibility (works on both synchronous and async agent runtimes). Each review step includes a **Platform note** indicating that runtimes supporting blocking subagent dispatch (e.g., Claude Code Agent tool) may optionally run the review as a subagent for better isolation. The `*-prompt.md` files serve dual purpose: inline review criteria and subagent dispatch templates.

The post-writing skill has its own rules at `skills/post-writing/references/post-rules.md`, covering social-specific prohibited patterns (engagement bait, thread padding, artificial structure) and platform character limits.

## Language Convention

- `skills-zhtw/` directory (SKILL.md, references, assets, templates): Traditional Chinese (繁體中文) — **source of truth**
- `skills/` directory (SKILL.md, references, assets, templates): English — translated from `skills-zhtw/`
- `docs/` directory (specs, plans): Traditional Chinese (繁體中文)

## Sync Workflow (skills-zhtw → skills)

`skills-zhtw/` is the source of truth. All `.md` edits happen there first.

To sync changes to the English `skills/` directory:
1. Complete all changes in `skills-zhtw/` and commit
2. Run `git diff <last-sync-commit>..HEAD -- skills-zhtw/` to identify changed files
3. Translate corresponding changes to `skills/`
4. Commit the English updates

Exception: TypeScript code in `x-engagement/scripts/` is edited in `skills-zhtw/` and copied directly to `skills/` (no translation needed).

## Design Documents

Specs and implementation plans are in `docs/superpowers/`:
- `specs/` — Design documents explaining the rationale behind each skill
- `plans/` — Implementation plans with step-by-step tasks
