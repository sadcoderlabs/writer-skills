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

### Install (Claude Code)

```bash
cd your-writing-directory
npx skills add sadcoderlabs/writer-skills -a claude-code
```

### Install (other agents)

See [agentskills.io](https://agentskills.io/) for how to add skills to your agent. The skills are in the `skills/` directory.

### Start writing

1. Tell your agent "I want to start writing" — the Management skill will initialize the workspace and guide you through setting up your goals
2. Share ideas — they'll be collected in `ideas.md`
3. When ready to write, tell your agent to prepare an article — the Article Preparation skill will interview you, extract materials, and build an outline
4. When the brief is ready, the Writing skill produces a draft based on your materials and revises it with you

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
