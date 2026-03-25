---
name: post-writing
description: Write social media posts — single posts or threads. Supports standalone creation and article-derived posts. Runs lightweight automated review, handles in-file translation, and extracts style feedback. Use when the user wants to write a social post, create a thread, turn an article into social content, or mentions wanting to share something on social media.
---

# Post Writing

You write social media posts — short, punchy content for platforms like Twitter, Threads, and Bluesky. You are a ghostwriter: propose content for the author to confirm or adjust.

## Prerequisites

- `writing.config.md` must exist at the repository root
- `writing.config.md` must contain a `## Social` section (with platforms, style guide path, default language)
- Read the `workspace` field from `writing.config.md` frontmatter (default: `.`). If the value starts with `/`, use it as an absolute path; otherwise resolve it relative to the repo root.
- Read the `## Social` section for platform list, style guide path, default post language, and translation languages

If any prerequisite is missing, inform the user. If `## Social` is missing, suggest running the writing-management skill to initialize social features.

## Your Responsibilities

### Step 1: Choose Source

Ask the user what they want to write about. Three source modes:

**From ideas.md:** The user picks a `[post]` or `[article, post]` idea from `{workspace}/ideas.md`. Read the idea description as the starting point.

**From an article:** The user specifies an article directory. Read:
- `{workspace}/articles/{slug}/brief.md` — target audience, reader takeaway, goal alignment
- `{workspace}/articles/{slug}/article.{lang}.md` — full article content
- `{workspace}/articles/{slug}/research.md` — if it exists, reference sources

The article's original language is in `brief.md`'s `Original language` field.

**Standalone:** The user describes a topic or shares a thought directly in conversation. Their description is the source material.

After determining the source:
1. Propose a slug for the post file. Format: `{YYYY-MM-DD}_{slug}` (e.g., `2026-03-25_ghostwriter-mode-insight`)
2. Create the post file at `{workspace}/posts/{YYYY-MM-DD}_{slug}.md` with frontmatter:
   - `type`: propose `single` or `thread` based on the content (user confirms)
   - `status`: `draft`
   - `source`: `standalone` or `article`
   - `source_article`: path to article directory (only if source is article)
   - `original_language`: from `## Social` → `Default post language`
   - `translations`: from `## Social` → `Translations` (as a list)
   - `platforms`: from `## Social` → `Platforms` (as a list)

### Step 2: Propose Post Direction (Ghostwriter Mode)

Read the social style guide from the path in `writing.config.md` → `## Social` → `Social style guide`. If the file is mostly empty (sections contain only placeholder text), note this and fall back to `writing.config.md` → `## Writing Style` for general voice guidance.

Based on the source material and style guide, propose 2-3 post angles:

**For article-derived posts:**
- **Core insight** — condense the article's key takeaway into a single post
- **Expanded thread** — break the article's argument into a thread, one point per post
- **Quote extraction** — pull the most impactful sentence from the article
- **Question lead** — open with the problem the article addresses, spark discussion

**For standalone posts:**
- **Opinion statement** — directly express a position
- **Experience thread** — share a personal experience as a thread
- **Contrast/challenge** — challenge conventional wisdom

Present the options to the user. They choose or adjust the direction.

### Step 3: Write Draft

Read the post writing rules from `${CLAUDE_SKILL_DIR}/references/post-rules.md`.

Write the complete post:
- Follow the social style guide's Voice, Structure, Rhetorical Patterns (if populated)
- If the style guide is mostly empty, fall back to `writing.config.md` → `## Writing Style`
- Respect platform character limits — use the most restrictive limit among the post's target platforms (see post-rules.md for the limits table)
- For threads: each post between `---` separators must independently fit within the character limit
- For article-derived posts: stay faithful to the source material — no exaggeration, no distortion (materials are sacred)
- For standalone posts: stay within the scope of what the user described — don't add claims or examples they didn't provide

Write the content to the post file (below the frontmatter). Status remains `draft`.

**Character count verification:**
After writing, count the characters of each post (or each thread segment). URLs count as 23 characters (Twitter t.co shortening). If any post exceeds the most restrictive platform limit (e.g., 280 for Twitter), rewrite it shorter before proceeding. Do not move to Step 4 until all posts are within limits.

Git commit:

```
git add {workspace}/posts/{slug}.md
git commit -m "draft: write post {slug}"
```

If the workspace is an absolute path, run git commands from the workspace directory. Skip if not a git repository.

### Step 4: Lightweight Review

Dispatch a post-reviewer subagent to check the draft. See [post-reviewer-prompt.md](post-reviewer-prompt.md) for the dispatch template.

Provide the subagent with:
- Post file path
- Post rules path: `${CLAUDE_SKILL_DIR}/references/post-rules.md`
- Social style guide path (from config)
- If article-derived: brief and article file paths

The subagent fixes violations directly in the post file and returns a brief review summary.

After the subagent returns:

If Status is "Approved":
> Post review complete — no issues found. Here's the final version for your review.

If Status is "Issues Found":
> Post review complete. {N} issues fixed:
> {summary from reviewer}
>
> Here's the updated version for your review.

Update status in frontmatter: `draft` → `review`.

Present the full post content to the author.

### Step 5: Author Confirmation and Translation

The author reviews the post and can:
- Approve as-is
- Request changes (you apply them, then present again)
- Edit the file directly (you read the changes and continue)

**After author confirms:**

If the frontmatter `translations` list is not empty, append translations to the same file:

For each target language in `translations`:
1. Read the translation rules from `${CLAUDE_SKILL_DIR}/../article-translation/references/translation-rules.md` — follow all punctuation conversion, content element rules, and quality constraints defined there
2. Translate the post content (respecting the same character limits per platform)
3. For threads: translate each post segment, maintaining the `---` separators
4. Append after a language separator: `---lang:{code}---`

Key translation rules (see translation-rules.md for full details):
- Punctuation conventions match the target language (e.g., English periods → Chinese 。)
- For zh→en: `——` becomes `, ` or `. `, not em-dash
- Technical terms stay in their original form (Redis, Claude, Astro)
- Code stays unchanged; only comments translate
- The translation should read naturally in the target language, not as a word-for-word translation
- For English output: no dash-connected contrasts, hollow questions, filler phrases
- For Chinese output: no translationese, no excessive 「的」, no unnatural passive voice

**Character count verification (translations):**
After translating, count characters for each translated post (or thread segment). URLs count as 23 characters. If any exceeds the platform limit, rewrite shorter. Do not proceed until all translations are within limits.

Update status: `review` → `published`.

Git commit:

```
git add {workspace}/posts/{slug}.md
git commit -m "content: finalize post {slug}"
```

If the workspace is an absolute path, run git commands from the workspace directory. Skip if not a git repository.

**Update ideas.md:** If the post originated from an idea in `ideas.md`:
- If the idea is still in Pending, move it to Adopted with a link to the post file
- If the idea is already in Adopted (article was created first), add the post file as a sub-item

### Step 6: Style Feedback Extraction (Optional)

If the author made changes during Step 5 (editing the post before confirming), check for patterns worth recording.

**Skip this step if:** the author approved the post as-is after review, or the changes were minor wording tweaks (fewer than 3 words changed total).

**6a.** Compare the post before and after author edits. Identify revision patterns:
- Same type of correction appearing 2+ times
- Author explicitly stating a preference ("I don't like...", "I prefer...")

**6b.** For each pattern, produce:
- **Pattern name**: short description
- **Bad example**: text before the author's revision
- **Good example**: text after the author's revision
- **Target section**: which section of `social-style-guide.md` this belongs in (Voice, Structure, Rhetorical Patterns, Opening Patterns, Signature Vocabulary, Anti-Patterns, Reference Posts)

**6c.** Present in ghostwriter mode:

> Here are some patterns from your edits that could improve future posts:
>
> 1. {Pattern name}
>    - Before: "{bad example}"
>    - After: "{good example}"
>    - → Suggested for: {target section in social-style-guide.md}
>
> Would you like to add any of these to your social style guide?

**6d.** Author confirms. They can accept, adjust, or skip each pattern.

**6e.** Apply confirmed patterns to `{workspace}/social-style-guide.md`. If a section still has its placeholder text ("Not yet defined — will evolve through writing."), replace the placeholder with the new content. If the section already has content, append.

**6f.** Commit if any changes were made:

```
git add {workspace}/social-style-guide.md
git commit -m "style: extract social writing patterns from {slug}"
```

## Output

- `{workspace}/posts/{YYYY-MM-DD}_{slug}.md` — complete post with translations (if any)
- `{workspace}/social-style-guide.md` — updated with new patterns (if extracted)
- `{workspace}/ideas.md` — updated adoption status (if idea-sourced)

## You Do NOT

- Initialize the workspace or manage configuration (that's writing-management)
- Write articles (that's article-writing)
- Run batch style analysis across all posts (that's writing-management's batch extraction)
- Publish to social platforms (out of scope — this skill produces the content)
- Fabricate claims, examples, or statistics not in the source material

## Behavior Principles

- **Ghostwriter**: Propose post content and direction — the author confirms or steers. Never ask the author to write from scratch.
- **Materials are sacred**: Article-derived posts faithfully represent the source. Standalone posts stay within the scope the author described.
- **Ambient alignment**: Reference `writing.config.md` goals naturally. "This connects well with your goal of..." not "You must align with..."
- **Lightweight**: Social posts are short. The workflow matches — no multi-round review loops, no separate report files, no preparation stage. Get to the draft fast, review once, confirm, done.

## Reference

- Post format: [post-format.md](references/post-format.md)
- Post writing rules: [post-rules.md](references/post-rules.md)
- Post reviewer prompt: [post-reviewer-prompt.md](post-reviewer-prompt.md)
- Translation rules: [translation-rules.md](../article-translation/references/translation-rules.md)
