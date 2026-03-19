# Article Translation Skill Design

## Context

Our writing workflow has three skills forming a pipeline: Management → Preparation → Writing. The article-writing skill explicitly defers translation to a "future Translation skill." The brief format already captures `Original language` and `Translations` fields, and the checklist includes a "Translations completed" milestone. The infrastructure is ready — the skill itself is missing.

The sadcoder-press blog (Astro 6) supports i18n with `en` (default) and `zh` locales. Articles in the writing workspace need translated versions before publishing. A reference translation workflow (`translate.md`) from the user's personal blog provides the baseline for content element handling rules.

## Design Principles

**Translation preserves the author's voice.** The translator works from a finished, author-approved article. The goal is to convey the same ideas, tone, and specificity in the target language — not to rewrite or "improve" the original.

**Writing rules apply to translations.** The prohibited patterns in `writing-rules.md` (AI writing traces, filler phrases, repetition, etc.) apply equally to translated output. A translation that introduces dash-connected contrasts or hollow opening questions fails the same way an original draft would.

**Chinese means Traditional Chinese.** All Chinese output uses Traditional Chinese (繁體中文). No Simplified Chinese characters.

**Professional tone for a technical blog.** All translations use a rational, professional style. There is no category-based strategy switching — sadcoder-press is a technical blog.

**Technical terms stay in their original form.** Terms like Redis, Claude, Astro, GitHub are not translated. This is standard practice for technical writing and avoids ambiguity.

## Skill Overview

`article-translation` is the fourth skill in the pipeline. It runs after the author has approved the final draft (status `review` or `published`), translating the article into the languages specified in `brief.md`.

### SKILL.md frontmatter

```yaml
---
name: article-translation
description: Translate a completed article into target languages specified in the brief
---
```

### Prerequisites

- `writing.config.md` exists at the repository root (read `workspace` field to locate the writing workspace; resolve relative paths from repo root, absolute paths as-is)
- Article directory exists under `{workspace}/articles/`
- `brief.md` exists in the article directory with status `review` or `published`
- `article.{original_lang}.md` exists in the article directory

### Trigger conditions

- Article status is `review` or `published`
- `brief.md` has a non-empty `Translations` field
- The original article file `article.{original_lang}.md` exists
- The `Translations` field contains only supported languages (`en`, `zh`). If unsupported languages are listed, inform the user and skip those.

### Input

| Source | Purpose |
|--------|---------|
| `writing.config.md` | Workspace path resolution |
| `brief.md` | Original language, target languages, title, target audience context |
| `article.{original_lang}.md` | The source text to translate |
| `writing-rules.md` | Quality constraints that apply to translated output |

Note: `writing.config.md` is read only for workspace resolution. Global writing style from `writing.config.md` does not affect translation tone — the skill always uses a professional, rational style.

### Output

| File | Purpose |
|------|---------|
| `article.{target_lang}.md` | Translated article, one per target language |
| `brief.md` (updated) | "Translations completed" checklist item checked |

### Status transitions

The translation skill does not change the article's status field. Status transitions (`review` → `published`) are triggered by finalization, not by translation completion. The skill only updates the checklist item.

### Out of scope

- Publishing translated files to the Astro content directory (future publishing skill)
- WebSearch for proper noun translations (technical terms stay in original form)
- Translation review reports (auto-fix only, no report files)
- Japanese or other languages beyond en/zh

## Translation Steps

### Step 1: Read context

Read `writing.config.md` to resolve the workspace path.

Read `brief.md` to determine:
- Original language (`Original language` field, a language code: `zh` or `en`)
- Target language(s) (`Translations` field, comma-separated language codes)
- Article title, target audience, and article goals (for translation context)

Read `article.{original_lang}.md` as the source text.

Read `writing-rules.md` for quality constraints.

Verify the article status is `review` or `published`. If not, inform the user and stop.

### Step 2: Translate

Translate the article into each target language with a professional, rational tone.

**Content element rules:**

| Element | Rule |
|---------|------|
| Punctuation | Convert to target language conventions (e.g., Chinese `。` `，` `「」` → English `. ` `, ` `""` and vice versa) |
| Code blocks — source language comments | Translate to target language |
| Code blocks — target language comments | Keep as-is |
| Code blocks — code itself | Keep unchanged (variable names, function names, etc.) |
| Image alt text | Translate to target language |
| Image paths | Keep unchanged |
| Link text | Translate to target language |
| Link URLs | Keep unchanged |
| Technical terms | Keep in original form (Redis, Claude, Astro, etc.) |
| Markdown formatting | Preserve exactly (headings, lists, emphasis, etc.) |

**Quality constraints (from writing-rules.md, applied in spirit):**
- No dash-connected contrasts, hollow opening questions, or filler phrases in English output
- No summary sentences restating the paragraph, no transition filler
- No repetition across paragraphs — if the original doesn't repeat, the translation shouldn't either
- For Chinese output: avoid translationese (翻譯腔), unnatural passive voice, excessive use of 「的」

### Step 3: Automated review loop (max 3 rounds)

Dispatch a translation review subagent using the prompt in `references/translation-review-prompt.md`. The subagent:

1. Reads both the original article and the translation
2. Checks for common AI translation errors:
   - Translationese / unnatural expressions in the target language
   - Omitted or mistranslated content
   - Punctuation not converted to target language conventions
   - Violations of writing-rules.md patterns (e.g., English translation has dash-connected contrasts)
   - Inconsistent terminology within the article
3. If issues are found: fixes them directly in the translation, then re-dispatches for another round
4. If no issues or max 3 rounds reached: proceed to Step 4

The review subagent does not produce a review report file. It reads, checks, fixes, and moves on.

### Step 4: Output and wrap-up

- Write the translated article to `article.{target_lang}.md` in the same article directory
- Update `brief.md`: check the "Translations completed" item in the checklist
- Git commit the translation with a message like: `content: add {target_lang} translation for {article_title}`

## Changes to Existing System

### article-writing skill (`skills/article-writing/SKILL.md`)

The output filename changes from `article.md` to `article.{lang}.md`, where `{lang}` comes from `brief.md`'s `Original language` field (e.g., `article.zh.md` for a Chinese-original article).

Files that reference `article.md` and need updating:
- `skills/article-writing/SKILL.md` — all references to `article.md` in Steps 3-8 and Output section
- `skills/article-preparation/SKILL.md` — creates empty `article.md` during article directory setup
- `CLAUDE.md` — workspace structure diagram shows `article.md`
- `skills/article-writing/references/writing-reviewer-prompt.md` — if it references `article.md`
- `skills/article-writing/references/fact-check-reviewer-prompt.md` — if it references `article.md`

### brief-format.md

Update `Original language` field description to use language codes (`zh` / `en`) instead of full words (`"Chinese"` / `"English"`). The current live brief (`2026-03-18_building-writer-skills`) already uses `zh`, so this aligns documentation with practice.

### brief-template.md

Update the `Original language` field placeholder to show language codes (e.g., `<!-- zh, en -->`).

### No changes needed

- writing-management skill — not involved
- writing-rules.md — referenced by translation skill, not modified

## New Files

```
skills/article-translation/
  SKILL.md                                    # Skill definition with frontmatter and steps
  references/
    translation-rules.md                      # Punctuation conversion tables, content element rules
    translation-review-prompt.md              # Subagent prompt for automated review loop
```

## Bidirectional Translation

The skill supports both directions:
- **zh → en**: Chinese original, English translation
- **en → zh**: English original, Traditional Chinese translation

The direction is determined by `brief.md` fields: `Original language` is the source, `Translations` lists the targets. The same steps apply in both directions; the content element rules and punctuation conversion are symmetric.
