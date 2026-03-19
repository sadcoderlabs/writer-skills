# Article Translation Skill Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a fourth skill (`article-translation`) to the writing workflow that translates completed articles between zh↔en, with an automated review loop.

**Architecture:** A new `skills/article-translation/` directory with `SKILL.md` (skill definition), `references/translation-rules.md` (content element handling rules), and `references/translation-review-prompt.md` (subagent prompt for automated review). Existing files are updated to use `article.{lang}.md` instead of `article.md`.

**Tech Stack:** Markdown-based agent skills (no runtime code). All files are `.md`.

**Note:** This project is entirely markdown skill definitions — no code, no tests. Verification steps use grep to confirm no stale references remain.

---

### Task 1: Rename `article.md` → `article.{lang}.md` in article-preparation skill

**Files:**
- Modify: `skills/article-preparation/SKILL.md`

The article-preparation skill creates an empty `article.md` when setting up the article directory (Step 1, line 29). Change this to `article.{lang}.md` where `{lang}` comes from the `Original language` field confirmed in Step 2.

- [ ] **Step 1: Update directory structure in Step 1**

In `skills/article-preparation/SKILL.md`, find the directory structure block in Step 1 (around line 27-32):

```
   {workspace}/articles/{date}_{slug}/
     article.md    # Empty file
     brief.md      # Copied from {workspace}/templates/brief-template.md
     assets/       # Empty directory
```

Change `article.md` to:

```
   {workspace}/articles/{date}_{slug}/
     brief.md      # Copied from {workspace}/templates/brief-template.md
     assets/       # Empty directory
```

Remove the empty `article.md` creation from Step 1. The article file will be created by the article-writing skill in Step 3 when the original language is known from the brief.

Rationale: At Step 1, the author hasn't confirmed the original language yet (that happens in Step 2, field 4). Creating a language-coded empty file at this point would require either guessing the language or re-creating the file later. It's cleaner to let the article-writing skill create `article.{lang}.md` when it starts writing.

- [ ] **Step 2: Verify no other references to `article.md`**

Run: `grep -n "article\.md" skills/article-preparation/SKILL.md`
Expected: No matches (the only reference was the empty file creation in Step 1)

- [ ] **Step 3: Commit**

```bash
git add skills/article-preparation/SKILL.md
git commit -m "refactor: remove empty article.md creation from article-preparation"
```

---

### Task 2: Rename `article.md` → `article.{lang}.md` in article-writing skill

**Files:**
- Modify: `skills/article-writing/SKILL.md`

The article-writing skill references `article.md` extensively. All references must change to `article.{lang}.md` where `{lang}` comes from `brief.md`'s `Original language` field.

- [ ] **Step 1: Add language resolution to Prerequisites**

In `skills/article-writing/SKILL.md`, add to the Prerequisites section (after line 15):

```
- Read the `Original language` field from `brief.md` to determine the article filename: `article.{lang}.md` (e.g., `article.zh.md` for Chinese, `article.en.md` for English)
```

- [ ] **Step 2: Update Step 3 (Write the First Draft)**

Line 39: Change `write it to \`article.md\`` to `write it to \`article.{lang}.md\``

- [ ] **Step 3: Update Step 4 (Commit First Draft)**

Line 57: Change `writing the complete first draft to \`article.md\`` to `writing the complete first draft to \`article.{lang}.md\``
Line 59: Change `Git add \`article.md\`` to `Git add \`article.{lang}.md\``

- [ ] **Step 4: Update Step 5 (Writing Review Loop)**

Line 49 in writing-reviewer-prompt.md and line 72 in SKILL.md: The `[ARTICLE_FILE_PATH]` placeholder is already a path variable — no change needed in the dispatch template itself. But update line 72 — it has two `article.md` references:

Change `paths to \`article.md\`, \`references/writing-rules.md\`, \`brief.md\`, \`research.md\` (if it exists), and the current review round number. The reviewer fixes issues directly in \`article.md\``

To: `paths to \`article.{lang}.md\`, \`references/writing-rules.md\`, \`brief.md\`, \`research.md\` (if it exists), and the current review round number. The reviewer fixes issues directly in \`article.{lang}.md\``

Line 76 (Step 5c): Change `Include modified \`article.md\` and the new report file.` to `Include modified \`article.{lang}.md\` and the new report file.`

- [ ] **Step 5: Update Step 6 (Fact-Check Review Loop)**

Line 105 — has two `article.md` references:

Change `paths to \`article.md\`, \`brief.md\`, \`research.md\` (if it exists), and the current review round number. The reviewer fixes issues directly in \`article.md\``

To: `paths to \`article.{lang}.md\`, \`brief.md\`, \`research.md\` (if it exists), and the current review round number. The reviewer fixes issues directly in \`article.{lang}.md\``

Line 109 (Step 6c): Change `Include modified \`article.md\`, the new report file, and \`research.md\` if modified.` to `Include modified \`article.{lang}.md\`, the new report file, and \`research.md\` if modified.`

- [ ] **Step 6: Update Step 7 and Step 8**

Line 135: Change `Edit \`article.md\`` to `Edit \`article.{lang}.md\``
Line 142: Change `Apply the requested changes to \`article.md\`` to `Apply the requested changes to \`article.{lang}.md\``

- [ ] **Step 7: Update Output section**

Line 159: Change `\`article.md\` — complete first draft` to `\`article.{lang}.md\` — complete first draft in the article's original language`

- [ ] **Step 8: Update "You Do NOT" section**

Line 165: Change `- Translate the article (future Translation skill)` to `- Translate the article (see article-translation skill)`

- [ ] **Step 9: Update reviewer prompt templates**

In `skills/article-writing/writing-reviewer-prompt.md`:
- Line 49: Change `fix it directly in \`article.md\`` to `fix it directly in the article file`
- Line 81: Change `with all fixes already applied to \`article.md\`` to `with all fixes already applied to the article file`

In `skills/article-writing/fact-check-reviewer-prompt.md`:
- Line 53: Change `fix them directly in \`article.md\`` to `fix them directly in the article file`
- Line 87: Change `with all fixes already applied to \`article.md\`` to `with all fixes already applied to the article file`

These prompts already use `[ARTICLE_FILE_PATH]` as the actual path parameter, so the hardcoded `article.md` references are just in the instruction text.

- [ ] **Step 10: Verify no remaining bare `article.md` references**

Run: `grep -rn "article\.md" skills/article-writing/`

Manually inspect each match. Expected: all matches should be `article.{lang}.md` patterns, `brief.md`, or `research.md`. There should be zero bare `article.md` references (i.e., `article.md` not preceded by `{lang}.` or similar).

- [ ] **Step 11: Commit**

```bash
git add skills/article-writing/SKILL.md skills/article-writing/writing-reviewer-prompt.md skills/article-writing/fact-check-reviewer-prompt.md
git commit -m "refactor: rename article.md to article.{lang}.md in article-writing skill"
```

---

### Task 3: Update brief-format.md and brief-template.md

**Files:**
- Modify: `skills/article-preparation/references/brief-format.md`
- Modify: `skills/article-preparation/assets/brief-template.md`

- [ ] **Step 1: Update Original language description in brief-format.md**

In `skills/article-preparation/references/brief-format.md`, line 19:

Change:
```
- **Original language**: The language the article will be written in (e.g., "Chinese", "English")
```

To:
```
- **Original language**: Language code for the article's primary language (e.g., `zh`, `en`). Used in the article filename: `article.{lang}.md`
```

- [ ] **Step 2: Update brief-template.md placeholder**

In `skills/article-preparation/assets/brief-template.md`, line 8:

Change:
```
- Original language:
```

To:
```
- Original language:  <!-- zh, en -->
```

- [ ] **Step 3: Commit**

```bash
git add skills/article-preparation/references/brief-format.md skills/article-preparation/assets/brief-template.md
git commit -m "docs: use language codes for Original language field in brief format"
```

---

### Task 4: Update CLAUDE.md workspace structure

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: Update workspace structure diagram**

In `CLAUDE.md`, find the workspace structure block (lines 31-42). Change `article.md` line:

From:
```
    article.md                   # Article content (clean prose, no metadata)
```

To:
```
    article.{lang}.md            # Article content (clean prose, no metadata). {lang} = original language code from brief.md
```

- [ ] **Step 2: Update "What This Is" section**

In `CLAUDE.md`, line 7: Change `through three stages: management → preparation → writing` to `through four stages: management → preparation → writing → translation`

- [ ] **Step 3: Update Architecture section**

In `CLAUDE.md`, line 11: Change `Three skills form a pipeline` to `Four skills form a pipeline`

Add after item 3 (line 15), before the "Each skill has:" line (line 17):

```
4. **article-translation** (`skills/article-translation/`) — Translates completed articles into target languages, runs automated translation review loop
```

- [ ] **Step 4: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: update CLAUDE.md for article.{lang}.md rename and translation skill"
```

---

### Task 5: Create translation-rules.md

**Files:**
- Create: `skills/article-translation/references/translation-rules.md`

This file contains the content element handling rules and punctuation conversion tables referenced by the translation skill.

- [ ] **Step 1: Create the references directory**

```bash
mkdir -p skills/article-translation/references
```

- [ ] **Step 2: Write translation-rules.md**

Create `skills/article-translation/references/translation-rules.md` with this content:

```markdown
# Translation Rules

Rules for translating articles between Traditional Chinese (zh) and English (en). These rules ensure consistent handling of content elements and natural expression in the target language.

## General Principles

- **Professional, rational tone** for all translations
- **Traditional Chinese (繁體中文) only** — no Simplified Chinese characters
- **Technical terms stay in original form** — Redis, Claude, Astro, GitHub, etc. are never translated
- **Writing rules apply** — the prohibited patterns in `writing-rules.md` apply in spirit to all translated output

## Punctuation Conversion

### Chinese → English

| Chinese | English | Example |
|---------|---------|---------|
| `。` | `.` | 這是句子。→ This is a sentence. |
| `，` | `,` | 首先，→ First, |
| `「」` | `""` | 「引用」→ "quote" |
| `『』` | `''` or `""` | 『書名』→ "book title" |
| `：` | `:` | 結論：→ Conclusion: |
| `；` | `;` | 前者；後者 → the former; the latter |
| `！` | `!` | 成功！→ Success! |
| `？` | `?` | 為什麼？→ Why? |
| `⋯⋯` or `……` | `...` | 然後⋯⋯ → Then... |
| `——` | `, ` or `. ` | Use comma or period, not em-dash (writing rules limit em-dashes to 1-2 per article) |
| `（）` | `()` | （備註）→ (note) |

### English → Chinese

| English | Chinese | Example |
|---------|---------|---------|
| `.` | `。` | This is a sentence. → 這是句子。 |
| `,` | `，` | First, → 首先， |
| `""` | `「」` | "quote" → 「引用」 |
| `''` | `『』` | 'inner quote' → 『內引』 |
| `:` | `：` | Conclusion: → 結論： |
| `;` | `；` | the former; the latter → 前者；後者 |
| `!` | `！` | Success! → 成功！ |
| `?` | `？` | Why? → 為什麼？ |
| `...` | `⋯⋯` | Then... → 然後⋯⋯ |
| `()` | `（）` | (note) → （備註） |

## Content Element Rules

### Code Blocks

- **Source language comments**: Translate to target language
- **Target language comments**: Keep as-is
- **Code itself**: Keep unchanged — variable names, function names, string literals, etc.

Example (zh → en):
~~~
```javascript
// 計算總價 → // Calculate total price
const total = items.reduce((sum, item) => sum + item.price, 0);
// Returns the sum → // Returns the sum (already in English, keep as-is)
```
~~~

### Images

- **Alt text**: Translate to target language
- **Image path**: Keep unchanged

Example (zh → en):
```
![架構圖](assets/architecture.png) → ![Architecture diagram](assets/architecture.png)
```

### Hyperlinks

- **Link text**: Translate to target language
- **URL**: Keep unchanged

Example (zh → en):
```
[官方文件](https://docs.example.com) → [official documentation](https://docs.example.com)
```

### Markdown Formatting

Preserve all markdown structure exactly:
- Heading levels (`#`, `##`, etc.)
- List formatting (ordered and unordered)
- Emphasis (`*italic*`, `**bold**`)
- Blockquotes (`>`)
- Horizontal rules (`---`)

## Quality Constraints

### For English Output

Apply writing-rules.md prohibited patterns:
- No dash-connected contrasts ("not A — but B")
- No hollow opening questions ("Have you ever wondered...?")
- No filler phrases ("actually", "in fact", "it's worth noting")
- No summary sentences restating the paragraph
- No transition filler ("Let's dive deeper", "Moving on to")
- Maximum 1-2 em-dashes per article

### For Chinese Output

Avoid common AI translation problems:
- **Translationese (翻譯腔)**: Avoid unnatural sentence structures calqued from English (e.g., 「在...方面」「就...而言」)
- **Excessive 「的」**: Break up chains of 「的」 — restructure the sentence instead
- **Unnatural passive voice**: Avoid 「被認為是」「被廣泛使用」 when active voice is more natural in Chinese
- **Overly formal register**: Match the tone of the original — if the original is conversational, the Chinese should be too
```

- [ ] **Step 3: Commit**

```bash
git add skills/article-translation/references/translation-rules.md
git commit -m "feat: add translation rules for article-translation skill"
```

---

### Task 6: Create translation-review-prompt.md

**Files:**
- Create: `skills/article-translation/references/translation-review-prompt.md`

This is the subagent prompt template for the automated translation review loop (Step 3 of the skill).

- [ ] **Step 1: Write translation-review-prompt.md**

Create `skills/article-translation/references/translation-review-prompt.md` with this content:

```markdown
# Translation Review Prompt Template

Use this template when dispatching a translation review subagent during Step 3.

**Purpose:** Check the translated article for common AI translation errors and fix them directly. No review report is produced.

**Dispatch pattern:** Auto-fix loop, max 3 rounds. If no issues found or max rounds reached, stop.

~~~
Agent tool (general-purpose):
  description: "Review and fix article translation"
  prompt: |
    You are a translation reviewer. Check this translated article against the original
    for common AI translation errors and fix any issues directly.

    **Original article:** [ORIGINAL_ARTICLE_PATH]
    **Translated article to review and fix:** [TRANSLATED_ARTICLE_PATH]
    **Translation rules:** [TRANSLATION_RULES_PATH]
    **Writing rules:** [WRITING_RULES_PATH]
    **Target language:** [TARGET_LANG]
    **Review round:** [ROUND_NUMBER] of 3

    Read all provided files, then check the translation for issues.

    ## What to Check

    | Category | What to Look For |
    |----------|------------------|
    | Completeness | Content omitted or added that isn't in the original |
    | Accuracy | Meaning changed, nuance lost, or mistranslation |
    | Naturalness | Translationese, awkward phrasing, unnatural sentence structure in the target language |
    | Punctuation | Punctuation not converted to target language conventions per translation-rules.md |
    | Code blocks | Source language comments not translated, or code/variable names accidentally changed |
    | Links & images | Alt text or link text not translated, or URLs accidentally modified |
    | Technical terms | Terms that should stay in original form but were translated |
    | Terminology consistency | Same term translated differently in different places |
    | Writing rules | For English: dash-connected contrasts, hollow questions, filler phrases. For Chinese: translationese, excessive 「的」, unnatural passive voice |

    ## Calibration

    **Only flag clear errors.** Do not flag:
    - Alternative phrasings that are equally valid
    - Minor stylistic preferences
    - Differences in sentence structure that preserve meaning

    If the translation reads naturally in the target language and accurately
    conveys the original meaning, it passes.

    ## Your Process

    1. Read the original article and the translation side by side
    2. Identify all issues per the checklist above
    3. For each issue, fix it directly in the translated article file using the Edit tool
    4. After all fixes, report your result

    ## Output

    Return one of:
    - "PASS" — no issues found, translation is clean
    - "FIXED: {N} issues corrected" — with a brief list of what was fixed (one line each)

    Do NOT produce a review report file. Just fix and report.
~~~

**Subagent returns:** Either "PASS" or "FIXED: N issues corrected" with a brief summary.

**Main flow behavior:**
- If "PASS": proceed to Step 4
- If "FIXED" and round < 3: increment round counter, re-dispatch with the same template
- If "FIXED" and round = 3: proceed to Step 4 (accept current state)
```

- [ ] **Step 2: Commit**

```bash
git add skills/article-translation/references/translation-review-prompt.md
git commit -m "feat: add translation review prompt for automated review loop"
```

---

### Task 7: Create article-translation SKILL.md

**Files:**
- Create: `skills/article-translation/SKILL.md`

This is the main skill definition. It references `translation-rules.md` and `translation-review-prompt.md` from the `references/` directory.

- [ ] **Step 1: Write SKILL.md**

Create `skills/article-translation/SKILL.md` with this content:

```markdown
---
name: article-translation
description: Translate a completed article into target languages specified in the brief. Supports bidirectional zh↔en translation with automated review. Use when an article has status "review" or "published" and the brief specifies target languages.
---

# Article Translation

You translate completed articles into target languages. You work from a finished, author-approved article and produce a natural translation that preserves the author's voice, tone, and specificity.

## Prerequisites

- `writing.config.md` must exist at the repository root
- Read the `workspace` field from `writing.config.md` frontmatter (default: `.`). If the value starts with `/`, use it as an absolute path; otherwise resolve it relative to the repo root. The article directory containing `brief.md` is inside `{workspace}/articles/`.
- `brief.md` must have status `review` or `published`
- `brief.md` must have a non-empty `Translations` field
- `article.{original_lang}.md` must exist, where `{original_lang}` comes from `brief.md`'s `Original language` field

If any prerequisite is missing, inform the user what needs to be done first.

## Supported Languages

- `zh` — Traditional Chinese (繁體中文)
- `en` — English

If `Translations` contains unsupported language codes, inform the user and skip those.

## Your Responsibilities

### Step 1: Read Context

Read and understand:
1. `writing.config.md` — resolve workspace path
2. `brief.md` — article info, target audience, goals, original language, target languages
3. `article.{original_lang}.md` — the source text to translate
4. Translation rules — see [translation rules](references/translation-rules.md)
5. Writing rules — see [writing rules](${CLAUDE_SKILL_DIR}/../article-writing/references/writing-rules.md)

Determine the translation direction from `brief.md`:
- `Original language` field → source language
- `Translations` field → target language(s)

Verify the article status is `review` or `published`. If not, inform the user and stop.

### Step 2: Translate

Translate the article into each target language with a professional, rational tone.

Follow the content element rules in [translation rules](references/translation-rules.md):
- Convert punctuation to target language conventions
- Translate source language comments in code blocks; keep target language comments and all code as-is
- Translate image alt text and link text; keep paths and URLs unchanged
- Keep technical terms in their original form (Redis, Claude, Astro, etc.)
- Preserve all markdown formatting exactly

**Quality constraints:**
- Apply the prohibited patterns from `writing-rules.md` in spirit — a translation must not introduce AI writing patterns that the original article avoided
- For English output: no dash-connected contrasts, hollow questions, filler phrases, summary sentences, transition filler
- For Chinese output: no translationese, no excessive 「的」, no unnatural passive voice
- All Chinese output must be Traditional Chinese (繁體中文) — no Simplified Chinese characters

Write the translation to `article.{target_lang}.md` in the same article directory.

### Step 3: Automated Review Loop

Run an automated review loop (max 3 rounds) to catch common AI translation errors.

See [translation-review-prompt.md](references/translation-review-prompt.md) for the dispatch template.

**3a.** Dispatch the translation review subagent with paths to the original article, the translated article, `references/translation-rules.md`, `writing-rules.md`, the target language, and the current round number.

**3b.** If the subagent returns "PASS": proceed to Step 4.

**3c.** If the subagent returns "FIXED": increment the round counter. If round < 3, go back to 3a. If round = 3, proceed to Step 4.

### Step 4: Wrap Up

1. Check "Translations completed" in the `brief.md` checklist
2. Git commit with message: `content: add {target_lang} translation for {slug}`
   - Include `article.{target_lang}.md` and `brief.md`
   - If the workspace is an absolute path, run git commands from the workspace directory. Skip if not a git repository.

## Output

- `article.{target_lang}.md` — translated article for each target language
- `brief.md` — "Translations completed" checklist item checked

## You Do NOT

- Modify the original article
- Change the article's status field
- Publish translated files to a CMS (future publishing skill)
- Fabricate content not present in the original article
- Translate technical terms (keep them in original form)

## Behavior Principles

- **Voice preservation**: The translation should read as if the author wrote it in the target language. Don't flatten distinctive phrasing into generic prose.
- **Materials are sacred**: The translation conveys what the author said — no additions, no omissions, no editorial changes.
- **Professional tone**: All translations use a rational, professional style appropriate for a technical blog.
```

- [ ] **Step 2: Commit**

```bash
git add skills/article-translation/SKILL.md
git commit -m "feat: add article-translation skill definition"
```

---

### Task 8: Final verification

**Files:** All modified and created files

- [ ] **Step 1: Verify no stale `article.md` references remain in skills**

Run: `grep -rn "article\.md" skills/ CLAUDE.md`

Manually inspect each match. Expected: all matches should be `article.{lang}.md` patterns, `brief.md`, `research.md`, or similar. There should be zero bare `article.md` references. (Note: `brief-format.md` line 20 says `article.{lang}.md` which is correct.)

- [ ] **Step 2: Verify new skill directory structure**

Run: `ls -R skills/article-translation/`

Expected:
```
skills/article-translation/:
SKILL.md
references/

skills/article-translation/references/:
translation-rules.md
translation-review-prompt.md
```

- [ ] **Step 3: Verify cross-references work**

Check that `SKILL.md` references to `references/translation-rules.md` and `references/translation-review-prompt.md` match actual file paths. Check that the `writing-rules.md` reference path resolves correctly from the skill directory.

- [ ] **Step 4: Review git log**

Run: `git log --oneline -10`

Expected: 7 commits from this implementation, each with a clear message:
1. `refactor: remove empty article.md creation from article-preparation`
2. `refactor: rename article.md to article.{lang}.md in article-writing skill`
3. `docs: use language codes for Original language field in brief format`
4. `docs: update CLAUDE.md for article.{lang}.md rename and translation skill`
5. `feat: add translation rules for article-translation skill`
6. `feat: add translation review prompt for automated review loop`
7. `feat: add article-translation skill definition`
