# Style Profile System Design

## Overview

Introduce a **Style Profile** system that captures individual writing voices as shareable, reusable style guides. Inspired by the [Every.to AI Style Guide](https://every.to/guides/ai-style-guide), which argues that AI writing defaults to generic mediocrity — the solution is making implicit writing preferences explicit.

**Core concept:** A Style Profile is not an author identity — it's a shareable writing style. Anyone on the team can select any profile to write with. This avoids "stealing" someone's voice; instead, the creator explicitly opens their style for others to use.

## Motivation

### What the current system lacks

The current `writing.config.md` has a free-form `## Writing Style` section — a single paragraph describing global style. This is insufficient because:

1. **No structure** — prose descriptions are vague. "Direct and conversational" doesn't tell AI how to actually write.
2. **Single layer** — one global style for all authors. Teams with multiple writers have no way to express individual voices.
3. **No anti-patterns** — the global `writing-rules.md` covers universal AI writing pitfalls, but there's no place for author-specific patterns to avoid.
4. **No examples** — the most effective way to communicate style (showing, not telling) has no home.
5. **No evolution path** — style preferences discovered during writing have nowhere to accumulate.

### What the AI Style Guide article teaches

The article proposes 7 components of an effective AI style guide:

1. **Voice & Tone** — concrete contextual descriptions, not flattering adjectives
2. **Structure** — how pieces move (e.g., friction → experimentation → pattern → takeaway)
3. **Sentence-level preferences** — specific line-by-line choices
4. **Signature moves** — distinctive structural or rhetorical habits
5. **Anti-patterns / Blacklist** — what to avoid (often the highest-value section)
6. **Examples** — positive and negative, always paired with explanations
7. **Revision checklist** — built from observed errors, not theoretical concerns

The article also proposes a maturity model:
- **Level 1 (Starter):** Voice, structure, anti-patterns, a few examples. ~20 minutes to create.
- **Level 2 (Working):** Adds sentence-level preferences, signature moves, expanded examples. Evolves over months of use.
- **Level 3 (Compound):** Automated checks, feedback loops updating the guide continuously.

## Design

### Style Profile format

Stored at `{workspace}/profiles/{style-name}.md`. Profile filenames use lowercase with hyphens (e.g., `pragmatic-builder.md`). The `created_by` frontmatter field records the human-readable creator name.

```markdown
---
created_by: Bernard
---

# {Style Name}

## Voice & Tone
{Concrete contextual descriptions: formality level, emotional temperature, when humor fits, what tone feels "completely wrong"}

## Structure
{How pieces move. e.g., "Open with friction → document experimentation → surface pattern → deliver framework"}

## Anti-Patterns
{Author-specific patterns to avoid, with before/after examples. Complements writing-rules.md, does not repeat it.}

## Sentence-Level Preferences
Not yet defined — will evolve through writing.

## Signature Moves
Not yet defined — will evolve through writing.

## Examples
Not yet defined — will evolve through writing.

## Revision Checklist
Not yet defined — will evolve through writing.
```

**Level 1 (required at creation):** Voice & Tone, Structure, Anti-Patterns
**Level 2 (accumulates over time):** Sentence-Level Preferences, Signature Moves, Examples, Revision Checklist

Level 2 sections start with a placeholder, not empty — so users know they exist and can be filled in later.

### Workspace structure changes

```
{workspace}/
  profiles/                    # NEW
    pragmatic-builder.md       # Style Profile (shareable writing style)
    storyteller.md
  writing-rules.md             # NEW: customizable copy from skill source
  ideas.md
  templates/brief-template.md
  articles/...
```

### Style resolution (two layers)

```
Style Profile (from brief.md) > writing.config.md global style
```

`writing-rules.md` (workspace version) always applies — it's universal AI writing pattern defense, independent of the style layers.

### Customizable writing-rules.md

Following the existing pattern of `brief-template.md` (copied from skill assets to workspace for user customization):

- On workspace init, copy `skills/article-writing/references/writing-rules.md` to `{workspace}/writing-rules.md`
- article-writing reads from `{workspace}/writing-rules.md` first, falls back to the skill's built-in version
- Users can add, remove, or modify rules without touching skill source files
- Skill updates don't overwrite user customizations (updates are opt-in)

### brief.md changes

In `Article Info`:
- `Author:` — who is writing (person)
- `Style:` — which profile to use (NEW). Value is the profile filename without the `.md` extension (e.g., `Style: pragmatic-builder`). The article-writing skill resolves this to `{workspace}/profiles/{style}.md`.
- Remove `## Writing Style` section from brief.md entirely

Note: The `## Writing Style` section in `writing.config.md` is **preserved** as the global fallback. Only the brief-level override is removed.

## Skill Changes

### writing-management

**New responsibility: Manage Style Profiles**

Added to existing responsibilities (init workspace, manage ideas, update goals):

**Creating a profile (AI interview):**

1. **Name** — ask what to call this style. If the name matches the creator's own name, remind them: "Other team members may also use this style to write. Is that OK?" If they mind, guide them toward a style-descriptive name.
2. **Provide examples** — ask for 2-3 articles they've written or admire (links or pasted fragments)
3. **AI interview** — one question at a time, ghostwriter mode:
   - Voice: "What feeling do you want your writing to convey? Formal or conversational?"
   - Boundaries: "What tone feels completely wrong for you?"
   - Structure: "How do your articles typically progress? How do you like to open?"
   - React to examples: "This paragraph has X quality — is that what you like about it?"
4. **Synthesize draft** — produce Level 1 sections (Voice & Tone, Structure, Anti-Patterns), propose to user for confirmation
5. **Level 2 placeholders** — fill remaining sections with guiding placeholders

**Updating a profile:**

- User can request updates anytime via writing-management
- Show current profile, guide updates to specific sections
- Or accept direct instructions: "Add an anti-pattern: don't use X"

**Workspace init addition:**

- Copy `writing-rules.md` to `{workspace}/writing-rules.md` during init
- Create `{workspace}/profiles/` directory

**Init Step 5 (Writing Style) unchanged:** During workspace init, the existing flow that writes `## Writing Style` to `writing.config.md` remains. This serves as the global fallback. Users can create profiles later via the profile creation flow.

### article-preparation

**Step 2 (Guide Brief Completion) changes:**

Replace the current step 11 (Writing Style) with:

1. Ask who is writing (fill `Author:`)
2. List available profiles from `{workspace}/profiles/`, let the author pick one (fill `Style:`)
3. If no profiles exist, or author wants a new one, guide them to run writing-management's profile creation flow first, then return
4. If author doesn't want any profile, leave `Style:` empty — falls back to `writing.config.md` global style

### article-writing

**Style resolution change:**

Reading order:
1. If brief specifies `Style:`, read `{workspace}/profiles/{style}.md`
2. Otherwise, read `## Writing Style` from `writing.config.md` (the global fallback, always preserved)
3. `writing-rules.md` always applies (read from `{workspace}/writing-rules.md`, fall back to skill built-in)

**Missing profile handling:** If `Style:` references a profile that does not exist (deleted or renamed), warn the author and fall back to `writing.config.md`'s `## Writing Style`. Do not silently proceed without any style guidance.

**Subagent path resolution:** The article-writing skill resolves the `writing-rules.md` path once (workspace version if exists, otherwise skill built-in) and passes the resolved path to all subagents (writing reviewer, fact-check reviewer).

Profile sections inform the writing:
- **Voice & Tone** → overall tone of the draft
- **Structure** → article arc and progression
- **Anti-Patterns** → additional patterns to avoid (on top of writing-rules.md)
- **Sentence-Level Preferences** → line-by-line choices (if defined)
- **Signature Moves** → distinctive techniques to incorporate (if defined)
- **Examples** → reference for what "right" looks like (if defined)
- **Revision Checklist** → additional checks during review (if defined)

### article-translation

No changes needed — translation works from the finished article, not the style profile.

## Out of Scope (future extensions)

- **Review-to-profile feedback loop:** After review loops, suggest recurring correction patterns as profile additions. Architecture supports this (profiles are independent files), but not implemented now.
- **Profile versioning or diff:** Not needed until the feedback loop exists.
- **Profile templates:** Pre-built profiles for common styles (e.g., "Technical Tutorial", "Personal Essay"). Could be useful but premature.

## Files to Update

Implementation will need to modify these files:

| File | Change |
|------|--------|
| `skills/writing-management/SKILL.md` | Add profile management responsibility, workspace init additions |
| `skills/article-preparation/SKILL.md` | Replace Step 2 item 11 (Writing Style) with Style Profile selection |
| `skills/article-preparation/assets/brief-template.md` | Add `Style:` field, remove `## Writing Style` section |
| `skills/article-preparation/references/brief-format.md` | Update field descriptions for `Style:`, remove `## Writing Style` docs |
| `skills/article-writing/SKILL.md` | Update style resolution logic, writing-rules.md path resolution |
| `skills/article-writing/references/writing-reviewer-prompt.md` | Accept resolved writing-rules.md path |
| `skills/writing-management/references/config-format.md` | Add note about relationship between global style and profiles |
| `CLAUDE.md` | Add `profiles/` to workspace structure diagram |

New files to create:

| File | Purpose |
|------|---------|
| `skills/writing-management/assets/profile-template.md` | Template for new profiles |
| `skills/writing-management/references/profile-format.md` | Profile format documentation |

## Migration

For existing workspaces:

1. Next time writing-management runs, create `{workspace}/profiles/` directory and copy `writing-rules.md` to workspace if not already present
2. Existing articles with `## Writing Style` in brief.md continue to work — article-writing falls back to reading it if no `Style:` field exists
3. No breaking changes — all additions are backwards compatible
