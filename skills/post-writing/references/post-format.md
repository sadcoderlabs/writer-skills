# Post File Format

## Location

Posts are stored as flat files at `{workspace}/posts/{YYYY-MM-DD}_{slug}.md`.

## Frontmatter

```yaml
---
type: single | thread
status: draft | review | published
source: standalone | article
source_article: articles/{YYYY-MM-DD}_{slug}/  # only when source: article
original_language: en
translations: [zh]
platforms: [twitter, threads, bluesky]
---
```

**Fields:**

- `type` — `single` for a standalone post, `thread` for a multi-post thread
- `status` — lifecycle state: `draft` → `review` → `published`
- `source` — `standalone` for independently created posts, `article` for posts derived from an article
- `source_article` — relative path from workspace to the source article directory (only when `source: article`)
- `original_language` — ISO 639-1 code for the primary language (e.g., `en`, `zh`)
- `translations` — list of ISO 639-1 codes for translated versions included in this file
- `platforms` — list of target social platforms; determines character limits for the post

## Body Structure

### Single Post

```markdown
---
type: single
status: draft
source: standalone
original_language: en
translations: []
platforms: [twitter, threads, bluesky]
---

# Post title or hook

Post content here. Keep within the character limit of the most restrictive target platform.
```

### Thread

Each post in the thread is separated by `---` (horizontal rule):

```markdown
---
type: thread
status: draft
source: article
source_article: articles/2026-03-24_example-article/
original_language: en
translations: []
platforms: [twitter, threads]
---

# Thread title — first post

Opening post that hooks the reader.

---

1/ First point of the thread.

Supporting detail or example.

---

2/ Second point of the thread.

Another supporting detail.

---

Final post — conclusion or call to action.
```

Each section between `---` separators is one individual post in the thread. Each must respect the platform character limit independently.

## Translations

Translations are appended to the same file, separated by a language marker:

```markdown
(original language content above)

---lang:zh---

# 翻譯後的標題

翻譯後的內容。
```

For threads, the translation includes its own `---` separators for each post in the thread.

## Parsing Rules

Post files contain three types of `---` separators. Parse in this order:

1. **YAML frontmatter** — the first `---` on line 1 opens frontmatter; the next `---` closes it
2. **Language separator** — matches the pattern `---lang:{code}---` exactly (e.g., `---lang:zh---`). Marks the start of a translated version.
3. **Thread separator** — any remaining `---` after frontmatter and before a language separator are thread post boundaries

**Parsing algorithm:** Strip frontmatter first. Split by `---lang:{code}---` to get per-language blocks. Within each language block, split by `---` to get individual thread posts (for threads) or the single post body (for single posts).

## Status Lifecycle

```
draft → review → published
```

- `draft` — post created, direction confirmed, draft written, not yet reviewed
- `review` — automated review complete, awaiting author confirmation
- `published` — author confirmed, translations added (if any), ready to publish

## File Naming

- Format: `{YYYY-MM-DD}_{slug}.md`
- Date: the date the post was created
- Slug: lowercase, hyphen-separated, descriptive (e.g., `writing-skills-key-insight`, `ghostwriter-mode-thread`)
- The slug should be concise but recognizable
