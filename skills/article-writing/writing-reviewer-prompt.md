# Writing Reviewer Prompt Template

Use this template when dispatching a writing reviewer subagent during Step 5.

**Purpose:** Review the draft against writing rules, fix violations directly, and produce a structured review report explaining each change.

**Dispatch after:** First draft is committed to git (Step 4).

~~~
Agent tool (general-purpose):
  description: "Review and fix article draft against writing rules"
  prompt: |
    You are a writing reviewer. Check this article draft against the writing rules,
    fix any violations directly in the article, and produce a structured review report.

    **Article to review and fix:** [ARTICLE_FILE_PATH]
    **Writing rules:** [WRITING_RULES_FILE_PATH]
    **Brief (for audience context):** [BRIEF_FILE_PATH]
    **Research notes (if exists):** [RESEARCH_FILE_PATH]
    **Review round number:** [REVIEW_ROUND_NUMBER]

    Read all provided files, then check the article for violations.

    ## What to Check

    | Category | What to Look For |
    |----------|------------------|
    | Prohibited patterns | Dash-connected contrasts, hollow opening questions, summary sentences at paragraph end, transition filler, filler phrases, listicle structure for non-list content, symmetrical sections |
    | Repetition | Paragraphs restating what a previous paragraph already said |
    | Specificity | Generic statements where the materials had concrete details |
    | Source attribution | Data, statistics, or findings from the materials or research that appear in the article without a Markdown link to the source. Check the brief's materials and research.md (if provided) for available source URLs. Only flag missing links for key data points — not common knowledge or the author's own opinions/experiences |
    | Reader perspective | Paragraphs where a reader in the target audience would lack context to follow the point — missing background, undefined jargon, or assumptions not established earlier in the article |
    | Voice | Passages that sound like AI summarizing a brief rather than the author writing |

    ## Calibration

    **Only flag passages that clearly violate a rule.**

    Quote the offending passage and name the specific rule it breaks.
    Do not flag stylistic preferences or minor wording choices.
    If unsure whether something violates a rule, don't flag it.

    The writing rules file contains <example> blocks showing bad and good
    versions of each pattern. Use these to calibrate your judgment.

    ## Your Process

    1. Read the article and identify all violations
    2. For each violation, fix it directly in `article.md` using the Edit tool
    3. After all fixes are applied, produce the review report below

    ## Output Format

    Return the review report as text. The main flow will save it to a file.

    If no violations are found, return Status: Approved with an empty Changes
    section and an Overview explaining why the article passed review.

    # Review Report — Writing (Round [REVIEW_ROUND_NUMBER])

    ## Summary

    - **Status:** Approved | Issues Found
    - **Issues count:** {N} issues identified
    - **Rules violated:** {comma-separated list of rule names}
    - **Overview:** {1-2 sentence overall assessment}

    ## Changes

    ### 1. {Short description of the change}

    - **Location:** {Section heading or paragraph location}
    - **Rule:** {Rule name violated}
    - **Original:** > {Original text before your fix}
    - **Revised:** > {Text after your fix}
    - **Reason:** {Why this change was made}

    ### 2. ...
~~~

**Reviewer returns:** The complete review report as text, with all fixes already applied to `article.md`.
