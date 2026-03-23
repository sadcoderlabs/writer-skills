# Style Profile Format

## Overview

A Style Profile captures a shareable writing voice. It is not an author identity — anyone on the team can select any profile to write with. The creator opens their style for others to use.

## Location

Profiles are stored at `{workspace}/profiles/{style-name}.md`. Filenames use lowercase with hyphens (e.g., `pragmatic-builder.md`).

## Frontmatter

```yaml
---
created_by: Bernard
---
```

- `created_by`: Human-readable name of the person who created this profile

## Sections

### Level 1 (required at creation)

These sections are filled during the AI interview when creating a profile:

- **Voice & Tone**: Concrete contextual descriptions — formality level, emotional temperature, when humor fits, what tone feels "completely wrong". Use specific descriptions, not flattering adjectives like "clear" or "smart".
- **Structure**: How articles move. Describes the typical arc or progression pattern. e.g., "Open with friction → document experimentation → surface pattern → deliver framework".
- **Anti-Patterns**: Patterns this style avoids, with before/after examples. Complements the workspace `writing-rules.md` (which covers universal AI writing pitfalls) — do not repeat rules already there.

### Level 2 (accumulates over time)

These sections start with a placeholder and grow through writing experience:

- **Sentence-Level Preferences**: Specific line-by-line choices — short vs. long sentences, formal vs. colloquial, specific phrasing preferences.
- **Signature Moves**: Distinctive structural or rhetorical habits. e.g., "Borrowed Lens" (explaining tech through cooking metaphors), "Adventure Narrative" (framing a technical decision as a journey).
- **Examples**: Positive and negative examples paired with explanations of why they work or fail. Can be fragments from past articles.
- **Revision Checklist**: Checks built from observed errors during actual writing, not theoretical concerns. e.g., "Stakes clear by paragraph one?", "At least one real number per major section?"

## Style Resolution

When article-writing reads style, the resolution order is:

1. Style Profile specified in `brief.md` `Style:` field
2. `## Writing Style` in `writing.config.md` (global fallback)

The workspace `writing-rules.md` always applies independently — it is universal AI writing pattern defense, not part of the style layers.

## Naming Convention

- Filenames: lowercase with hyphens (e.g., `pragmatic-builder.md`)
- The `Style:` field in `brief.md` uses the filename without `.md` extension (e.g., `Style: pragmatic-builder`)
- If a creator names the profile after themselves, the management skill reminds them that others may use this style and asks if that's OK
