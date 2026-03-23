# writing.config.md Format

## Location

`writing.config.md` is always placed at the repository root. It is the entry point for all writing skills.

## Frontmatter

The file uses YAML frontmatter to declare the workspace directory:

```yaml
---
workspace: writing
---
```

**Rules:**
- `workspace` is the only frontmatter field
- Value is a directory path pointing to where `ideas.md`, `templates/`, and `articles/` live
- If omitted or empty, defaults to `.` (repo root is the workspace)
- If the value starts with `/`, it is treated as an absolute path
- Otherwise, it is resolved relative to the repo root

## Body Structure

```markdown
---
workspace: .
---

# Writing Plan

## About
{One paragraph describing who you are — individual or organization — and your vision}

## Writing Goals
{One paragraph describing what the writing aims to achieve, who it targets, and the desired tone}

## Writing Style
{Global writing style preferences — prose description, reference article links, or specific rules}
```

## Example

```markdown
---
workspace: writing
---

# Writing Plan

## About
sadcoder builds AI agent tools. We envision a future where people rely heavily on AI agents to get work done, and we're building products for that world.

## Writing Goals
Demonstrate our hands-on experience and insights in the AI agent space to attract people interested in AI agents — getting them to follow us on Twitter or leave their email on our website. Tone should be practical and opinionated, like a team that's actually building this stuff sharing what they've learned.

## Writing Style
Direct and conversational. Short paragraphs. Use concrete examples from our own work rather than hypotheticals. Reference specific tools, numbers, and timelines. Avoid corporate-speak.
```

## Absolute Path Example

When skills are installed separately from the writing output (e.g., an AI agent's workspace pointing to an external content repository):

```yaml
---
workspace: /root/projects/sadcoder-press
---
```

With this configuration, `ideas.md` lives at `/root/projects/sadcoder-press/ideas.md`, articles at `/root/projects/sadcoder-press/articles/`, etc. The `writing.config.md` file itself stays at the repo root where skills are invoked.

## Guidelines

- "About" should be factual: who you are, what you do, your direction
- "Writing Goals" combines purpose, target audience, and tone in one paragraph
- "Writing Style" describes how articles should read — tone, structure preferences, reference articles, or specific rules. This is the global fallback for all articles. Individual articles select a Style Profile in their brief for a more specific writing voice; if no profile is selected, this section applies.
- Keep all sections concise — one paragraph each
- This file is the anchor for ambient goal alignment and style consistency across all skills
