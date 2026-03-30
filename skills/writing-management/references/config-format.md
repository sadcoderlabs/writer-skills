# writing.config.md Format

## Location

`writing.config.md` is the entry point for all writing skills. It can live anywhere — typically at the content repository root. The agent's workspace configuration (e.g., MEMORY.md) should record its location so skills can find it.

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
- Otherwise, it is resolved relative to the directory containing `writing.config.md`

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

With this configuration, `ideas.md` lives at `/root/projects/sadcoder-press/ideas.md`, articles at `/root/projects/sadcoder-press/articles/`, etc.

## Social Section (Optional)

When the `post-writing` skill is installed, `writing.config.md` includes an additional `## Social` section:

```markdown
## Social
- Platforms: twitter, threads, bluesky
- Social style guide: {workspace}/social-style-guide.md
- Default post language: en
- Translations: zh
```

**Fields:**
- `Platforms` — comma-separated list of target social platforms. Used by `post-writing` to determine character limits and formatting constraints.
- `Social style guide` — path to the social style guide file (relative to repo root). Resolved the same way as the workspace path.
- `Default post language` — the primary language for social posts (ISO 639-1 code).
- `Translations` — comma-separated list of additional languages for post translations.

This section is only added during workspace initialization when the `post-writing` skill is detected. Existing workspaces without this section continue to work — social features are simply unavailable.

## Example with Social

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

## Social
- Platforms: twitter, threads, bluesky
- Social style guide: writing/social-style-guide.md
- Default post language: en
- Translations: zh
```

## Guidelines

- "About" should be factual: who you are, what you do, your direction
- "Writing Goals" combines purpose, target audience, and tone in one paragraph
- "Writing Style" describes how articles should read — tone, structure preferences, reference articles, or specific rules. This is the global fallback for all articles. Individual articles select a Style Profile in their brief for a more specific writing voice; if no profile is selected, this section applies.
- Keep all sections concise — one paragraph each
- This file is the anchor for ambient goal alignment and style consistency across all skills
- "Social" is optional — only present when the post-writing skill is installed. It configures target platforms, style guide path, and language preferences for social media posts.

## Engagement Section (Optional)

When the `x-engagement` skill is installed and first used, `writing.config.md` includes an additional `## Engagement` section:

```markdown
## Engagement
- Notification channel: slack:C0AMED6RYHJ
- Schedule: "11:00 GMT+9"
- Language: en
- User language: zh
```

**Fields:**
- `Notification channel` — where to send daily engagement recommendations. Format is a soft description (e.g., `slack:CHANNEL_ID`, `discord:#channel`, `terminal`). No default — the x-engagement skill asks the user during first use.
- `Schedule` — preferred time for the daily engagement run. For scheduler reference only — the skill itself does not handle scheduling.
- `Language` — search language for X discovery. Currently only `en` is supported.
- `User language` — the language the user reads and thinks in (ISO 639-1 code). When this differs from `Language`, notifications include bilingual content: original tweets with translations, and draft copy in both languages. Defaults to the same value as `Language` if omitted.

Unlike the `## Social` section, `## Engagement` is NOT added during workspace initialization. It is created interactively by the x-engagement skill when first used, because it requires user input (notification channel preference).
