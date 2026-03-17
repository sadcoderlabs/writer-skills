# Writer

A writing workflow system powered by AI agent skills. Guides users from idea to published article with ambient goal alignment.

## Skills

| Skill | Description |
|-------|-------------|
| [writing-management](skills/writing-management/) | Initialize workspace, set goals, manage idea pool |
| [article-preparation](skills/article-preparation/) | Create article directory, guide brief, build outline |

Skills follow the [Agent Skills open standard](https://agentskills.io/) and work with any compatible AI agent (Claude Code, OpenAI Codex, Cursor, Gemini CLI, and 30+ others).

## Quick Start

1. Copy the `workspace-template/` directory to your working directory (or let the Management skill initialize it for you)
2. Add the skills from `skills/` to your AI agent
3. Start by telling your agent about your writing goals — the Management skill will set up `config.md`
4. Share ideas — they'll be collected in `ideas.md`
5. When ready to write, tell your agent to prepare an article — the Article Preparation skill will guide you

## Workspace Structure

```
config.md                # Your writing goals and direction
ideas.md                 # Idea pool
templates/
  brief-template.md      # Article brief template (editable)
articles/
  {YYYY-MM-DD}_{slug}/
    article.md           # Article content
    article.{lang}.md    # Translated versions
    brief.md             # Writing brief and progress tracking
    assets/              # Images and other assets
```

## Design

See [docs/superpowers/specs/2026-03-17-writing-workflow-design.md](docs/superpowers/specs/2026-03-17-writing-workflow-design.md) for the full design spec.
