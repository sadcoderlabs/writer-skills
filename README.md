# Writer

A writing workflow system powered by AI agent skills. Guides users from idea to published article with ambient goal alignment.

Works for individuals managing their own writing, or teams collaborating on a shared content pipeline. The workspace structure and skills are the same in both cases — a single person uses `config.md` to describe their own goals and style, while a team uses it to define shared direction that individual authors build on.

## Skills

| Skill | Description |
|-------|-------------|
| [writing-management](skills/writing-management/) | Initialize workspace, set goals and writing style, manage idea pool |
| [article-preparation](skills/article-preparation/) | Create article directory, guide brief, interview author for materials, build outline |
| [article-writing](skills/article-writing/) | Write article draft from materials-based outline, revise with author feedback |

Skills follow the [Agent Skills open standard](https://agentskills.io/) and work with any compatible AI agent (Claude Code, OpenAI Codex, Cursor, Gemini CLI, and 30+ others).

## Quick Start

### 1. Install

Go to the directory where you want to write, and run:

```bash
npx skills add sadcoderlabs/writer-skills -a claude-code
```

The installer will:
- Clone this repository
- Find the 3 skills (writing-management, article-preparation, article-writing)
- Ask you to select which skills to install (select all)
- Copy them to `.claude/skills/` in your project

For other AI agents, see [agentskills.io](https://agentskills.io/) for installation instructions.

### 2. Start writing

Open Claude Code in your writing directory and say something like "I want to start writing, help me set up". The workflow:

1. **Setup** — The Management skill initializes your workspace and guides you through setting your writing goals and style
2. **Collect ideas** — Share ideas anytime; they'll be collected in `ideas.md`
3. **Prepare an article** — The Preparation skill interviews you, extracts your materials, and builds an outline
4. **Write** — The Writing skill produces a draft from your materials and revises it with your feedback

## Workspace Structure

```
config.md                # Your writing goals, direction, and style
ideas.md                 # Idea pool
templates/
  brief-template.md      # Article brief template (editable)
articles/
  {YYYY-MM-DD}_{slug}/
    article.md           # Article content
    article.{lang}.md    # Translated versions
    brief.md             # Writing brief, materials, and progress tracking
    assets/              # Images and other assets
```

## Design

- [Original workflow design](docs/superpowers/specs/2026-03-17-writing-workflow-design.md) — Management and Article Preparation skills
- [Writing skill design](docs/superpowers/specs/2026-03-17-writing-skill-design.md) — Writing skill and Preparation rework
