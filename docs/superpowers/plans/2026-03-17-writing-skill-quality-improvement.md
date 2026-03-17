# Writing Skill Quality Improvement Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the article-writing skill produce drafts that actually follow its own writing rules, by adding concrete examples to rules and a self-review loop before author review.

**Architecture:** Two independent changes to the article-writing skill. Change 1 enhances `writing-rules.md` with before/after examples for each prohibited pattern. Change 2 adds a new `writing-reviewer-prompt.md` file and a review loop step in `SKILL.md`. No dependencies between changes — they can be done in either order.

**Tech Stack:** Markdown skill files, no code.

**Spec:** `docs/superpowers/specs/2026-03-17-writing-skill-quality-improvement-design.md`

---

### Task 1: Add before/after examples to writing-rules.md

**Files:**
- Modify: `skills/article-writing/references/writing-rules.md`

- [ ] **Step 1: Add examples to sentence-level prohibited patterns**

In `writing-rules.md`, replace the sentence-level section (lines 9-13) with the following:

```markdown
### Sentence-level
- **Dash-connected contrasts**: "not A — but B", "not A — rather B". Rephrase as two separate sentences or use a different structure.

<example type="bad">
It's not about replacing you — it's about helping you think.
</example>

<example type="good">
AI can't write for you. But it can ask the right questions when your ideas are still blurry.
</example>

- **"Not A, but rather B"**: Overused contrast formula. Find a different way to make the point.

(Same pattern as dash-connected contrasts. See example above.)

- **Hollow opening questions**: "Have you ever wondered...?", "What if I told you...?". Start with a concrete statement or story instead.

<example type="bad">
If AI can't write good articles on its own, what can it actually help with?
</example>

<example type="good">
AI can't write well. That much is clear. But it's not entirely useless either.
</example>

- **Filler phrases**: "actually", "in fact", "it's worth noting", "it turns out", "interestingly enough". Cut them — they add no information.

<example type="bad">
Interestingly enough, this set of writing skills was itself designed with AI assistance.
</example>

<example type="good">
This set of writing skills was itself designed with AI assistance.
</example>
```

- [ ] **Step 2: Add examples to paragraph-level prohibited patterns**

Replace the paragraph-level section (lines 15-18) with:

```markdown
### Paragraph-level
- **Summary sentences at paragraph end**: Don't restate what the paragraph just said. End with the last real point or let the next paragraph provide the transition.

<example type="bad">
The first trick is turning up extended thinking. The second is giving it a three-act structure. The third is setting the audience and goals upfront.
All three share a common thread: they're things you need to do before writing starts.
</example>

<example type="good">
The first trick is turning up extended thinking. The second is giving it a three-act structure. The third is setting the audience and goals upfront.
I found that skipping any of these meant the draft was unfixable no matter how many revisions I tried.
</example>

The ending sentence should advance to the next idea, not restate what was just said.

- **Transition filler**: "Let's dive deeper", "Next, let's look at", "Let's explore", "Moving on to". Just start the next section — the heading provides the transition.
- **Repetition across paragraphs**: Each paragraph must advance the article. If a paragraph restates what the previous one said, merge them or cut the repetition.

<example type="bad">
(Paragraph 2) This idea became the core philosophy behind the writing skills.
(Paragraph 4) Preparation is what really determines article quality.
(Paragraph 6) Get your materials ready, set the audience and goals, then write.
All three say "preparation matters." By the third time, the reader has stopped caring.
</example>

<example type="good">
State the point once. Each later mention must add something new — a different angle, a concrete method, or a counterexample. If there's nothing new to add, don't bring it up again.
</example>
```

- [ ] **Step 3: Add examples to structure-level prohibited patterns**

Replace the structure-level section (lines 20-22) with:

```markdown
### Structure-level
- **Listicle structure for non-list content**: Don't force content into numbered lists when prose would be more natural.

<example type="bad">
First, turn extended thinking up to high. AI gets more room to think about structure and the output improves significantly.

Second, give it a three-act structure. Essays need narrative arc, and a framework helps AI arrange paragraphs with better pacing.

Third, set the audience and goals before writing.
</example>

<example type="good">
The biggest improvement came from turning extended thinking up to high — with room to plan, AI stops producing bullet-point-style reports. Essays also need arc, so I started giving it a three-act framework for pacing. But none of this works unless you first tell it who the reader is and what they should walk away with.
</example>

Weave items into prose with causal connections, not isolated numbered points.

- **Symmetrical sections**: Not every section needs the same length or structure. Let the content dictate the shape.
```

- [ ] **Step 4: Review the full file for consistency**

Read the complete `writing-rules.md` after all edits. Verify:
- Every prohibited pattern in sentence-level and paragraph-level sections has at least one `<example>` block
- The "Required Quality" section (lines 24-42) is unchanged
- No duplicate examples across rules
- File reads cleanly top to bottom

- [ ] **Step 5: Commit**

```bash
git add skills/article-writing/references/writing-rules.md
git commit -m "feat: add before/after examples to writing rules for better AI compliance"
```

---

### Task 2: Create writing-reviewer-prompt.md

**Files:**
- Create: `skills/article-writing/writing-reviewer-prompt.md`

- [ ] **Step 1: Create the reviewer prompt template**

Create `skills/article-writing/writing-reviewer-prompt.md` with:

```markdown
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
```

- [ ] **Step 2: Commit**

```bash
git add skills/article-writing/writing-reviewer-prompt.md
git commit -m "feat: add writing reviewer subagent prompt template"
```

---

### Task 3: Add review loop step to SKILL.md

**Files:**
- Modify: `skills/article-writing/SKILL.md`

- [ ] **Step 1: Insert Step 3.5 between Step 3 and Step 4**

In `SKILL.md`, after the Step 3 section (after line 50, before `### Step 4: Author Review`), insert:

```markdown
### Step 3.5: Draft Review Loop

After writing the first draft, dispatch a writing-reviewer subagent to check the draft against the writing rules. See [writing-reviewer-prompt.md](writing-reviewer-prompt.md) for the dispatch template.

1. Dispatch reviewer with the path to `article.md` and `references/writing-rules.md`
2. If Issues Found: fix the flagged passages in `article.md` and re-dispatch the reviewer
3. Max 3 iterations — if issues remain after 3 rounds, proceed to Author Review

Do not present the draft to the author until this loop completes or reaches the iteration limit.
```

- [ ] **Step 2: Verify step numbering and flow**

Read the full SKILL.md. Verify:
- Step 3.5 sits between Step 3 and Step 4
- Step 4 (Author Review) still follows naturally
- No references to old step numbers are broken

- [ ] **Step 3: Commit**

```bash
git add skills/article-writing/SKILL.md
git commit -m "feat: add draft review loop step to article-writing skill"
```
