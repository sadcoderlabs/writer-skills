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
