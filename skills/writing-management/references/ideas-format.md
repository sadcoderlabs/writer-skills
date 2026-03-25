# ideas.md Format

## Structure

```markdown
# Idea Pool

## Pending
- [YYYY-MM-DD] idea description `[article]`
- [YYYY-MM-DD] @contributor: idea description `[post]`
- [YYYY-MM-DD] idea description `[article, post]` — notes

## AI Suggestions
> [YYYY-MM-DD] Suggestion about merging/developing ideas, with alignment notes

## Adopted
- [YYYY-MM-DD] → {workspace}/articles/{date}_{slug} (from idea description) `[article]`
- [YYYY-MM-DD] → {workspace}/posts/{date}_{slug}.md (from idea description) `[post]`
- [YYYY-MM-DD] idea description `[article, post]`
  - → {workspace}/articles/{date}_{slug}
  - → {workspace}/posts/{date}_{slug}.md
```

## Sections

### Pending
New ideas go here. Each entry has a date and description. Contributor attribution (@name) is optional — useful for teams, unnecessary for individual use.

#### Type Tags

Each idea has an optional type tag in backtick-code format at the end of the description:

- `[article]` — this idea targets a long-form article
- `[post]` — this idea targets a social media post or thread
- `[article, post]` — this idea targets both formats

**Backward compatibility:** Ideas without a type tag default to `[article]`. Existing ideas do not need retroactive tagging.

### AI Suggestions
An **append-only log**. New suggestions are appended (never edited or removed) when:
- A new idea is received that connects to existing ideas
- The user asks for the current state of the idea pool

Each suggestion should reference specific pending ideas and note how they relate to goals from `writing.config.md`.

### Adopted
Ideas that have been developed into articles or posts. Includes the adoption date and links to the output paths.

For ideas with multiple outputs (`[article, post]`), each output is listed as a sub-item under the same Adopted entry.

## When to Suggest Content
When receiving a new idea and there are 5 or more pending ideas, include content suggestions in the response alongside the idea confirmation. Suggest which ideas could become articles, posts, or both based on the idea's nature (long-form analysis → article, punchy observation → post, major insight → both).
