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

### Trigger conditions

- Article status is `review` or `published`
- `brief.md` has a non-empty `Translations` field
- The original article file `article.{original_lang}.md` exists

### Input

| Source | Purpose |
|--------|---------|
| `brief.md` | Original language, target languages, title, target audience context |
| `article.{original_lang}.md` | The source text to translate |
| `writing-rules.md` | Quality constraints that apply to translated output |

### Output

| File | Purpose |
|------|---------|
| `article.{target_lang}.md` | Translated article, one per target language |
| `brief.md` (updated) | "Translations completed" checklist item checked |

### Out of scope

- Publishing translated files to the Astro content directory (future publishing skill)
- WebSearch for proper noun translations (technical terms stay in original form)
- Translation review reports (auto-fix only, no report files)
- Japanese or other languages beyond en/zh

## Translation Steps

### Step 1: Read context

Read `brief.md` to determine:
- Original language (`Original language` field)
- Target language(s) (`Translations` field)
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
| Code blocks — Chinese comments | Translate to target language |
| Code blocks — English comments | Keep as-is |
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

Dispatch a translation review subagent to check the translated output. The subagent:

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

### article-writing skill

The output filename changes from `article.md` to `article.{lang}.md`, where `{lang}` comes from `brief.md`'s `Original language` field (e.g., `article.zh.md` for a Chinese-original article).

This is the only change to existing skills.

### brief-template.md

Ensure the `Original language` field description uses language codes (`zh` / `en`) consistently, not full words. The current live brief (`2026-03-18_building-writer-skills`) already uses `zh`, so this is mostly a template documentation update.

### No changes needed

- article-preparation skill — already collects language and translation info
- writing-management skill — not involved
- writing-rules.md — referenced by translation skill, not modified
- brief-format.md — already describes `article.{lang}.md` naming and Translations field

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
