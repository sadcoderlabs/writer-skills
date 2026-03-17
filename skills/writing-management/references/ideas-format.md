# ideas.md Format

## Structure

```markdown
# Idea Pool

## Pending
- [YYYY-MM-DD] idea description
- [YYYY-MM-DD] @contributor: idea description  <!-- contributor is optional -->

## AI Suggestions
> [YYYY-MM-DD] Suggestion about merging/developing ideas, with alignment notes

## Adopted
- [YYYY-MM-DD] → articles/{date}_{slug} (from idea description)  <!-- date is when the idea was adopted -->
```

## Sections

### Pending
New ideas go here. Each entry has a date and description. Contributor attribution (@name) is optional — useful for teams, unnecessary for individual use.

### AI Suggestions
An **append-only log**. New suggestions are appended (never edited or removed) when:
- A new idea is received that connects to existing ideas
- The user asks for the current state of the idea pool

Each suggestion should reference specific pending ideas and note how they relate to goals from `config.md`.

### Adopted
Ideas that have been developed into articles. Includes the adoption date and a link to the article directory.

## When to Suggest Articles
When receiving a new idea and there are 5 or more pending ideas, include article suggestions in the response alongside the idea confirmation.
