# Writing Reviewer Prompt Template

Use this template when dispatching a writing reviewer subagent during Step 3.5.

**Purpose:** Verify the draft follows writing rules before presenting to the author.

**Dispatch after:** First draft is written to `article.md`.

~~~
Agent tool (general-purpose):
  description: "Review article draft against writing rules"
  prompt: |
    You are a writing reviewer. Check this article draft against the writing rules.

    **Article to review:** [ARTICLE_FILE_PATH]
    **Writing rules:** [WRITING_RULES_FILE_PATH]

    Read both files, then check the article for violations.

    ## What to Check

    | Category | What to Look For |
    |----------|------------------|
    | Prohibited patterns | Dash-connected contrasts, hollow opening questions, summary sentences at paragraph end, transition filler, filler phrases, listicle structure for non-list content, symmetrical sections |
    | Repetition | Paragraphs restating what a previous paragraph already said |
    | Specificity | Generic statements where the materials had concrete details |
    | Voice | Passages that sound like AI summarizing a brief rather than the author writing |

    ## Calibration

    **Only flag passages that clearly violate a rule.**

    Quote the offending passage and name the specific rule it breaks.
    Do not flag stylistic preferences or minor wording choices.
    If unsure whether something violates a rule, don't flag it.

    The writing rules file contains <example> blocks showing bad and good
    versions of each pattern. Use these to calibrate your judgment.

    ## Output Format

    ## Draft Review

    **Status:** Approved | Issues Found

    **Issues (if any):**
    - "[quoted passage]" — violates **[rule name]**. Suggestion: [how to fix]

    **Recommendations (advisory, do not block approval):**
    - [suggestions]
~~~

**Reviewer returns:** Status, Issues (if any), Recommendations
