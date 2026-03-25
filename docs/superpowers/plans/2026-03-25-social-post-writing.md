# 社群貼文撰寫技能實作計畫

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add social post writing capability to the writing skills system by extending `writing-management` and creating a new `post-writing` skill.

**Architecture:** Extend `writing-management` with conditional social initialization (style guide template, ideas type tags, config `## Social` section, `posts/` directory). Create `post-writing` as a new skill with a 6-step workflow (source → direction → draft → review → confirm/translate → feedback extraction). The social style guide evolves through per-post feedback extraction and batch analysis.

**Tech Stack:** Markdown skill definitions following the Agent Skills open standard. No executable code — all files are markdown documents that define skill behavior, reference formats, and subagent prompts.

**Design spec:** `docs/superpowers/specs/2026-03-25-social-post-writing-design.md`

---

### Task 1: Create social style guide template

**Files:**
- Create: `skills/writing-management/assets/social-style-guide-template.md`

This template is placed alongside existing templates (`config-template.md`, `ideas-template.md`, `profile-template.md`). It is copied to `{workspace}/social-style-guide.md` during conditional initialization.

- [ ] **Step 1: Create the template file**

```markdown
# Social Style Guide

## Voice

(Not yet defined — will evolve through writing.)

## Structure

(Not yet defined — will evolve through writing.)

## Rhetorical Patterns

(Not yet defined — will evolve through writing.)

## Opening Patterns

(Not yet defined — will evolve through writing.)

## Signature Vocabulary

(Not yet defined — will evolve through writing.)

## Anti-Patterns

(Not yet defined — will evolve through writing.)

## Reference Posts

(Not yet defined — will evolve through writing.)
```

Write this to `skills/writing-management/assets/social-style-guide-template.md`.

The placeholder text "(Not yet defined — will evolve through writing.)" follows the same pattern used in the profile template's Level 2 sections.

- [ ] **Step 2: Verify template is alongside existing assets**

Run: `ls skills/writing-management/assets/`

Expected: `config-template.md`, `ideas-template.md`, `profile-template.md`, `social-style-guide-template.md`

- [ ] **Step 3: Commit**

```bash
git add skills/writing-management/assets/social-style-guide-template.md
git commit -m "feat(writing-management): add social style guide template"
```

---

### Task 2: Expand ideas format and template with type tags

**Files:**
- Modify: `skills/writing-management/references/ideas-format.md`
- Modify: `skills/writing-management/assets/ideas-template.md`

- [ ] **Step 1: Replace ideas-format.md with updated version**

Replace the entire content of `skills/writing-management/references/ideas-format.md` with:

````markdown
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
````

- [ ] **Step 2: Update ideas-template.md**

The template is minimal and doesn't need type tags in the empty sections — tags are added when ideas are recorded. No change needed to the template file itself (it already has empty `## Pending`, `## AI Suggestions`, `## Adopted` sections).

Verify the template is still correct:

Run: `cat skills/writing-management/assets/ideas-template.md`

Expected: The existing template with three empty sections.

- [ ] **Step 3: Verify format doc consistency**

Read `skills/writing-management/references/ideas-format.md` and check that:
- The Structure code block shows type tags
- The Pending section documents type tags and backward compatibility
- The Adopted section shows multi-output format
- The suggestion trigger section mentions posts

- [ ] **Step 4: Commit**

```bash
git add skills/writing-management/references/ideas-format.md
git commit -m "feat(writing-management): add type tags to ideas format"
```

---

### Task 3: Expand config format and template with Social section

**Files:**
- Modify: `skills/writing-management/references/config-format.md`
- Modify: `skills/writing-management/assets/config-template.md`

- [ ] **Step 1: Update config-format.md**

After the existing `## Body Structure` section (which documents About, Writing Goals, Writing Style), add a new section:

```markdown
## Social Section (Optional)

When the `post-writing` skill is installed, `writing.config.md` includes an additional `## Social` section:

` `` `markdown
## Social
- Platforms: twitter, threads, bluesky
- Social style guide: {workspace}/social-style-guide.md
- Default post language: en
- Translations: zh
` `` `

**Fields:**
- `Platforms` — comma-separated list of target social platforms. Used by `post-writing` to determine character limits and formatting constraints.
- `Social style guide` — path to the social style guide file (relative to repo root). Resolved the same way as the workspace path.
- `Default post language` — the primary language for social posts (ISO 639-1 code).
- `Translations` — comma-separated list of additional languages for post translations.

This section is only added during workspace initialization when the `post-writing` skill is detected. Existing workspaces without this section continue to work — social features are simply unavailable.
```

Also add a social example to the `## Example` section:

```markdown
## Example with Social

` `` `markdown
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
` `` `
```

In the `## Guidelines` section, add:

```markdown
- "Social" is optional — only present when the post-writing skill is installed. It configures target platforms, style guide path, and language preferences for social media posts.
```

- [ ] **Step 2: Update config-template.md**

Add the `## Social` section to the template. Since the template is used during initialization, and initialization is conditional on post-writing skill presence, the template should include the section but the writing-management SKILL.md will control when to include it.

**Important:** The `{workspace}` in the template's `Social style guide` field is a placeholder. During initialization, the writing-management skill resolves it to the actual workspace path (just as it resolves `{workspace}` in other template fields). For example, if the workspace is `writing`, the resulting line becomes `Social style guide: writing/social-style-guide.md`.

Append to the end of `skills/writing-management/assets/config-template.md`:

```markdown

## Social
- Platforms: twitter, threads, bluesky
- Social style guide: {workspace}/social-style-guide.md
- Default post language: en
- Translations: zh
```

- [ ] **Step 3: Verify consistency**

Read both files and verify:
- config-format.md documents the Social section as optional
- config-template.md includes the Social section
- The field names match between format doc and template

- [ ] **Step 4: Commit**

```bash
git add skills/writing-management/references/config-format.md skills/writing-management/assets/config-template.md
git commit -m "feat(writing-management): add Social section to config format and template"
```

---

### Task 4: Update writing-management SKILL.md

**Files:**
- Modify: `skills/writing-management/SKILL.md`

This is the most complex modification — adding conditional social initialization, idea type tag handling, and batch style extraction to the existing skill.

- [ ] **Step 1: Update Workspace Structure section**

In the workspace structure diagram (the code block under `## Workspace Structure`), after the `articles/` block ending with `assets/`, add:

```
  posts/                     # Social media posts (flat files)
    {YYYY-MM-DD}_{slug}.md   # Post content with frontmatter
  social-style-guide.md      # Social style guide (evolving)
```

These are marked as conditional — only present when post-writing skill is installed.

- [ ] **Step 2: Update Workspace Migration section**

After the existing two migration checks (ending with "automatically upgraded"), add new migration checks:

```markdown
3. If `writing.config.md` exists and `${CLAUDE_SKILL_DIR}/../post-writing/SKILL.md` exists but `{workspace}/posts/` does not, create the directory and copy `${CLAUDE_SKILL_DIR}/assets/social-style-guide-template.md` to `{workspace}/social-style-guide.md`
4. If `writing.config.md` exists and `${CLAUDE_SKILL_DIR}/../post-writing/SKILL.md` exists but `writing.config.md` does not contain a `## Social` section, append the Social section from the config template
```

- [ ] **Step 3: Update Initialize Workspace section**

In the `### 1. Initialize Workspace` section, step 3 (which creates the workspace directory structure), after the existing items ending with the `writing-rules.md` copy, add conditional initialization:

```markdown
   - **If `${CLAUDE_SKILL_DIR}/../post-writing/SKILL.md` exists** (social features enabled):
     - Create `{workspace}/posts/` directory
     - Copy `${CLAUDE_SKILL_DIR}/assets/social-style-guide-template.md` to `{workspace}/social-style-guide.md`
     - Include `## Social` section when writing `writing.config.md` (see config format)
```

- [ ] **Step 4: Update Receive New Ideas section**

Update `### 2. Receive New Ideas` section to support type tags. The key changes:

After the line "Record it to `{workspace}/ideas.md` under 'Pending' with today's date", add:

```markdown
   - Add a type tag based on the nature of the idea: `[article]` for long-form analysis, `[post]` for punchy observations or social content, `[article, post]` for ideas that work as both. Propose the type in ghostwriter mode — the user confirms or changes it.
```

Update the line containing "include article suggestions" to "include content suggestions — which ideas could become articles, posts, or both, and why".

Update the next step hint paragraph to also mention posts:

```markdown
   - Tone: "When you'd like to develop this into an article or a social post, just let me know."
```

- [ ] **Step 5: Update Organize Idea Pool section**

In `### 3. Organize Idea Pool`, change "Suggest which ideas could be developed into articles" to "Suggest which ideas could be developed into articles or posts".

Update the adoption flow to support multi-output linking:

```markdown
When an idea is adopted (developed into an article or post):

1. Move it from "Pending" to "Adopted" with today's date and a link to the output path
2. If the idea has type `[article, post]` and one output already exists, add the new output as a sub-item under the existing Adopted entry
```

- [ ] **Step 6: Add Batch Style Extraction section**

Add a new responsibility section after "5. Manage Style Profiles":

```markdown
### 6. Batch Social Style Extraction

When the user requests a comprehensive review of their social writing style (e.g., "analyze my post writing style", "extract patterns from my posts"):

1. Read all published posts from `{workspace}/posts/` (files where frontmatter `status: published`)
2. If fewer than 10 published posts exist, inform the user that more posts are needed for meaningful pattern extraction
3. Analyze across all posts:
   - Word count distribution (average, median, range)
   - Opening patterns (how posts typically start)
   - Rhetorical patterns (contrast frames, repetition, hooks)
   - Vocabulary frequency (recurring terms and phrases)
   - Structure patterns (single vs. thread ratio, thread length distribution)
4. Present findings in a statistical summary similar to jackbutcher.md style
5. Propose updates to `{workspace}/social-style-guide.md` for each section
6. Author confirms which updates to apply
7. Write confirmed updates to the style guide
8. Commit with message: `style: batch extract social writing patterns`

This is a management operation — analyzing all posts and updating the style guide. It complements the per-post feedback extraction in the `post-writing` skill (Step 6).
```

- [ ] **Step 7: Update You Do NOT section**

Add to the existing `## You Do NOT` list (after "Review articles"):

```markdown
- Write social media posts (that's the post-writing skill)
```

- [ ] **Step 8: Verify all changes are consistent**

Read the complete updated SKILL.md and check:
- Workspace structure includes posts/ and social-style-guide.md
- Migration checks include social features
- Initialization includes conditional social setup
- Idea handling mentions type tags
- Batch extraction is documented
- "You Do NOT" includes post writing

- [ ] **Step 9: Commit**

```bash
git add skills/writing-management/SKILL.md
git commit -m "feat(writing-management): add social features — conditional init, type tags, batch extraction"
```

---

### Task 5: Create post format reference

**Files:**
- Create: `skills/post-writing/references/post-format.md`

- [ ] **Step 1: Create directory structure**

```bash
mkdir -p skills/post-writing/references
```

- [ ] **Step 2: Create post-format.md**

```markdown
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
```

Write this to `skills/post-writing/references/post-format.md`.

- [ ] **Step 3: Commit**

```bash
git add skills/post-writing/references/post-format.md
git commit -m "feat(post-writing): add post file format reference"
```

---

### Task 6: Create post rules reference

**Files:**
- Create: `skills/post-writing/references/post-rules.md`

- [ ] **Step 1: Create post-rules.md**

This file defines social-post-specific writing rules and platform constraints. It is the social counterpart to `article-writing/references/writing-rules.md` but adapted for short-form content.

```markdown
# Post Writing Rules

Rules for social media post writing. These apply exclusively to posts — article-writing uses its own `writing-rules.md`.

## Platform Character Limits

| Platform | Single Post Limit |
|---|---|
| Twitter/X | 280 characters |
| Bluesky | 300 characters |
| Threads | 500 characters |
| Mastodon | 500 characters |

When a post targets multiple platforms, respect the most restrictive limit. For threads, each individual post must independently fit within the limit.

## Prohibited Patterns

These patterns are common in AI-generated social content. Avoid them entirely.

### Engagement bait
- **Hollow hooks**: "Here's the thing nobody tells you about...", "Most people don't know this, but...", "Stop doing X. Start doing Y."
- **Numbered clickbait**: "5 things I learned about..." (unless the post genuinely lists 5 distinct items)
- **False urgency**: "You need to read this", "This changes everything"

<example type="bad">
Here's the thing nobody tells you about writing with AI: it's not about the prompts.
</example>

<example type="good">
Writing with AI isn't about prompts. It's about having something to say before you open the chat window.
</example>

### Filler and padding
- **Thread padding**: Stretching a 3-post idea into 7 posts with repetition and restating
- **Engagement closers**: "Follow for more", "Like if you agree", "What do you think? Let me know in the replies"
- **Empty affirmations**: "This is so important", "Read that again", "Let that sink in"

<example type="bad">
This is so important. Let me say it again.

AI can't replace your thinking. Read that again.
</example>

<example type="good">
AI can't replace your thinking. What it can do is ask better questions than you'd ask yourself.
</example>

### Artificial structure
- **Forced frameworks**: "The 3 pillars of...", "A framework for..." (unless you actually have a genuine framework)
- **Symmetrical thread posts**: Every post the same length and structure. Let each post be as long as it needs to be.
- **Emoji bullets**: 🔑 Key insight: ... 💡 Pro tip: ... ⚡ Quick win: ...

### Voice issues
- **Corporate motivational**: "Unlock your potential", "Level up your skills", "10x your productivity"
- **Performative vulnerability**: "I'll be honest...", "Can I be real for a second?"
- **AI summary voice**: Posts that sound like a summary of an article rather than an original thought

## Required Quality

### Materials are sacred
- Article-derived posts must faithfully represent the source article — no exaggeration, no distortion, no fabrication
- Standalone posts use the author's provided direction as source material — don't add claims or examples beyond what the author shared

### Be specific
- Numbers over adjectives: "took 2 weeks" not "took a while"
- Names over categories: "Claude Code" not "an AI tool"
- Concrete outcomes over vague claims: "cut review time from 3 hours to 20 minutes" not "dramatically improved our workflow"

### Every post earns its place
- In threads: each post must add something new. If you can cut a post without losing information, cut it.
- In single posts: every sentence must carry weight. Social posts have no room for filler.

### Match the style guide
- Read `social-style-guide.md` before writing. If it has content, follow its patterns.
- If the style guide is mostly empty (early stage), fall back to `writing.config.md` global style and these rules.
```

Write this to `skills/post-writing/references/post-rules.md`.

- [ ] **Step 2: Commit**

```bash
git add skills/post-writing/references/post-rules.md
git commit -m "feat(post-writing): add post writing rules reference"
```

---

### Task 7: Create post reviewer subagent prompt

**Files:**
- Create: `skills/post-writing/post-reviewer-prompt.md`

- [ ] **Step 1: Create post-reviewer-prompt.md**

This follows the same structure as `article-writing/writing-reviewer-prompt.md` but adapted for social posts.

```markdown
# Post Reviewer Prompt Template

Use this template when dispatching a post reviewer subagent during Step 4.

**Purpose:** Review the post draft against post writing rules and social style guide, fix violations directly, and return a brief review summary.

**Dispatch after:** Draft is written (Step 3).

~~~
Agent tool (general-purpose):
  description: "Review and fix social post against post rules"
  prompt: |
    You are a social post reviewer. Check this post against the post writing rules
    and social style guide, fix any violations directly in the post file, and return
    a brief review summary.

    **Post to review and fix:** [POST_FILE_PATH]
    **Post writing rules:** [POST_RULES_FILE_PATH]
    **Social style guide:** [SOCIAL_STYLE_GUIDE_PATH]
    **Source article brief (if article-derived):** [BRIEF_FILE_PATH]
    **Source article (if article-derived):** [ARTICLE_FILE_PATH]

    Read all provided files, then check the post for violations.

    ## What to Check

    | Category | What to Look For |
    |----------|------------------|
    | Prohibited patterns | Engagement bait, filler/padding, artificial structure, voice issues as defined in post-rules.md |
    | Character limits | Each post (or each thread segment) must fit within the most restrictive platform limit from the frontmatter `platforms` field |
    | Style guide alignment | If the social style guide has content (not just placeholders), check voice, structure, rhetorical patterns, and anti-patterns |
    | Source accuracy | For article-derived posts (`source: article`): verify the post faithfully represents the source article — no exaggeration, distortion, or fabrication |
    | Specificity | Generic statements where concrete details were available |

    ## Calibration

    **Only flag passages that clearly violate a rule.**

    Social posts are short — even small fixes matter. But don't rewrite the
    author's voice. Fix rule violations; preserve style.

    If a post is within 10% of a character limit, don't flag it unless it
    actually exceeds the limit.

    ## Your Process

    1. Read the post and identify all violations
    2. For each violation, fix it directly in the post file using the Edit tool
    3. After all fixes are applied, produce the review summary below

    ## Output Format

    Return the review summary as text. Unlike article reviews, post reviews
    are lightweight — no separate report file is saved.

    # Post Review Summary

    - **Status:** Approved | Issues Found
    - **Issues count:** {N} issues identified
    - **Overview:** {1-2 sentence assessment}

    ## Changes (if any)

    1. {Short description}: {what was changed and why}
    2. ...
~~~

**Reviewer returns:** The review summary as text, with all fixes already applied to the post file.
```

Write this to `skills/post-writing/post-reviewer-prompt.md`.

- [ ] **Step 2: Commit**

```bash
git add skills/post-writing/post-reviewer-prompt.md
git commit -m "feat(post-writing): add post reviewer subagent prompt"
```

---

### Task 8: Create post-writing SKILL.md

**Files:**
- Create: `skills/post-writing/SKILL.md`

This is the main skill definition — the largest file in this plan. It defines the complete 6-step workflow.

- [ ] **Step 1: Create the SKILL.md file**

```markdown
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
1. Translate the post content (respecting the same character limits per platform)
2. For threads: translate each post segment, maintaining the `---` separators
3. Append after a language separator: `---lang:{code}---`

Translation rules:
- Punctuation conventions match the target language (e.g., English periods → Chinese 。)
- Technical terms stay in their original form (Redis, Claude, Astro)
- Code stays unchanged; only comments translate
- The translation should read naturally in the target language, not as a word-for-word translation

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
```

Write this to `skills/post-writing/SKILL.md`.

- [ ] **Step 2: Verify file structure**

Run: `find skills/post-writing -type f | sort`

Expected:
```
skills/post-writing/SKILL.md
skills/post-writing/post-reviewer-prompt.md
skills/post-writing/references/post-format.md
skills/post-writing/references/post-rules.md
```

- [ ] **Step 3: Verify internal references**

Read SKILL.md and check that all referenced paths exist:
- `references/post-format.md` ✓ (created in Task 5)
- `references/post-rules.md` ✓ (created in Task 6)
- `post-reviewer-prompt.md` ✓ (created in Task 7)

- [ ] **Step 4: Commit**

```bash
git add skills/post-writing/SKILL.md
git commit -m "feat(post-writing): add main skill definition with 6-step workflow"
```

---

### Task 9: Update CLAUDE.md

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: Update "What This Is" section**

Change the introductory paragraph from:

> A writing workflow system powered by AI agent skills, following the Agent Skills open standard. Skills guide users from idea to published article through four stages: management → preparation → writing → translation.

To:

> A writing workflow system powered by AI agent skills, following the [Agent Skills open standard](https://agentskills.io/). Skills guide users from idea to published content — articles through four stages (management → preparation → writing → translation) and social posts through a parallel lightweight workflow (management → post-writing).

- [ ] **Step 2: Update Architecture section**

Change "Four skills form a pipeline" to "Five skills form a pipeline, each with clear boundaries" and add `post-writing` as item 5:

```markdown
5. **post-writing** (`skills/post-writing/`) — Writes social media posts (single or thread), supports article-derived and standalone creation, lightweight automated review, in-file translation, style feedback extraction
```

- [ ] **Step 3: Update Workspace Structure**

Add `posts/` and `social-style-guide.md` to the workspace structure diagram. After `templates/brief-template.md`, add:

```
  social-style-guide.md          # Social style guide (evolving, jackbutcher.md-inspired)
  posts/{YYYY-MM-DD}_{slug}.md   # Social media posts (flat files, with in-file translations)
```

- [ ] **Step 4: Add Post Lifecycle section**

After `## Article Brief Lifecycle`, add:

```markdown
## Post Lifecycle

Post status transitions: `draft` → `review` → `published`
```

- [ ] **Step 5: Update Writing Rules section**

After the existing writing rules paragraph, add a note about post rules:

```markdown
The post-writing skill has its own rules at `skills/post-writing/references/post-rules.md`, covering social-specific prohibited patterns (engagement bait, thread padding, artificial structure) and platform character limits.
```

- [ ] **Step 6: Verify all sections are consistent**

Read the complete updated CLAUDE.md and verify:
- "What This Is" mentions both articles and social posts
- Architecture lists 5 skills
- Workspace structure includes posts/ and social-style-guide.md
- Post lifecycle is documented
- Post rules are mentioned

- [ ] **Step 7: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: update CLAUDE.md with post-writing skill and social features"
```
