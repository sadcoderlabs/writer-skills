# Writer

A writing workflow system powered by AI agent skills. Guides users from idea to published content — articles through four stages (management → preparation → writing → translation) and social posts through a parallel lightweight workflow (management → post-writing). An engagement skill discovers daily X interaction opportunities.

Works for individuals managing their own writing, or teams collaborating on a shared content pipeline. The workspace structure and skills are the same in both cases — a single person uses `writing.config.md` to describe their own goals and style, while a team uses it to define shared direction that individual authors build on.

## Skills

| Skill | Description |
|-------|-------------|
| [writing-management](skills/writing-management/) | Initialize workspace, set goals and writing style, manage idea pool, style profiles, batch social style extraction |
| [article-preparation](skills/article-preparation/) | Create article directory, guide brief, interview author for materials, build outline |
| [article-writing](skills/article-writing/) | Write article draft from materials-based outline, revise with author feedback |
| [article-translation](skills/article-translation/) | Translate completed articles into target languages, automated translation review |
| [post-writing](skills/post-writing/) | Write social media posts (single or thread), lightweight review, in-file translation, style feedback extraction |
| [x-engagement](skills/x-engagement/) | Daily X engagement discovery via Grok, tweet verification, agent-curated recommendations with draft copy, quality review loop |

Skills follow the [Agent Skills open standard](https://agentskills.io/) and work with any compatible AI agent (Claude Code, OpenAI Codex, Cursor, Gemini CLI, and 30+ others).

### Languages

Each skill exists in two languages:

- `skills/` — English (published version for installation)
- `skills-zhtw/` — Traditional Chinese (source of truth for development)

All edits happen in `skills-zhtw/` first, then get translated to `skills/`. See [CLAUDE.md](CLAUDE.md) for the sync workflow.

## Quick Start

### 1. Install

Go to the directory where you want to write, and run:

```bash
npx skills add sadcoderlabs/writer-skills -a claude-code
```

The installer will:
- Clone this repository
- Find the 6 skills (writing-management, article-preparation, article-writing, article-translation, post-writing, x-engagement)
- Ask you to select which skills to install (select all or pick what you need)
- Copy them to `.claude/skills/` in your project

For other AI agents, see [agentskills.io](https://agentskills.io/) for installation instructions.

#### Updating

```bash
npx skills update
```

### 2. Start writing

Open Claude Code in your writing directory and say something like "I want to start writing, help me set up". The workflow:

1. **Setup** — The Management skill initializes your workspace and guides you through setting your writing goals and style
2. **Collect ideas** — Share ideas anytime; they'll be collected in `ideas.md`
3. **Prepare an article** — The Preparation skill interviews you, extracts your materials, and builds an outline
4. **Write** — The Writing skill produces a draft from your materials and revises it with your feedback
5. **Translate** — The Translation skill translates your finished article into other languages
6. **Social posts** — The Post-Writing skill creates social media posts (standalone or article-derived) with lightweight review and translation
7. **X engagement** — The Engagement skill discovers tweets worth interacting with, drafts reply/quote copy with quality review, and presents bilingual recommendations for you to execute

## Workspace Structure

`writing.config.md` lives at the repository root. The `workspace` frontmatter field (default: `.`) points to where writing files live. Supports relative paths (from repo root) and absolute paths starting with `/`.

```
writing.config.md            # At repo root — your writing goals, direction, and style
{workspace}/
  ideas.md                   # Idea pool
  profiles/                  # Style profiles (shareable writing voices)
  writing-rules.md           # Customizable writing rules
  social-style-guide.md      # Social style guide with Persona (evolving)
  templates/
    brief-template.md        # Article brief template (editable)
  articles/
    {YYYY-MM-DD}_{slug}/
      article.{lang}.md      # Article content (clean prose, no metadata). {lang} = language code
      brief.md               # Writing brief, materials, and progress tracking
      research.md            # External research and fact-check sources
      reviews/               # Review reports from automated reviewers
      assets/                # Images and other assets
  posts/
    {YYYY-MM-DD}_{slug}.md   # Social media posts (with in-file translations)
  engagement/
    interests.yaml           # Interest list for X discovery
    inbox.yaml               # Rolling recommendation log
    candidates.yaml          # Discovery temp (overwritten each run)
```

## Design

- [Original workflow design](docs/superpowers/specs/2026-03-17-writing-workflow-design.md) — Management and Article Preparation skills
- [Writing skill design](docs/superpowers/specs/2026-03-17-writing-skill-design.md) — Writing skill and Preparation rework
- [Translation skill design](docs/superpowers/specs/2026-03-19-article-translation-design.md) — Translation skill
- [Social post writing design](docs/superpowers/specs/2026-03-25-social-post-writing-design.md) — Post-Writing skill
- [X engagement design](docs/superpowers/specs/2026-03-30-x-engagement-design.md) — X Engagement skill
- [Engagement quality design](docs/superpowers/specs/2026-03-30-engagement-quality-design.md) — Persona, quality review loop, unified feedback extraction
