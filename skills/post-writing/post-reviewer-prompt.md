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
