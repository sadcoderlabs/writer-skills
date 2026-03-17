# Writing Skill Quality Improvement Design

## Problem

The article-writing skill produces drafts that violate its own writing rules. The current `writing-rules.md` lists prohibited patterns, but the AI still uses them — particularly in Chinese text where the English rule descriptions don't map clearly to Chinese equivalents. There is also no mechanism to verify compliance after the draft is written.

## Goals

1. Make writing rules concrete enough that AI can reliably follow them across languages
2. Add a self-review step so violations are caught before the author sees the draft

## Non-Goals

- Rewriting the current article (this improves the skill for future articles)
- Adding new rules (the existing rules are sufficient; the problem is execution)
- Changing the preparation or management skills

## Solution

Two changes, both to the article-writing skill:

### Change 1: Add before/after examples to writing-rules.md

Each prohibited pattern gets `<example>` tags with bad and good versions, following Anthropic's prompting best practices: "Examples are one of the most reliable ways to steer Claude's output format, tone, and structure."

**Current state:** Rules describe what not to do in abstract terms.

**New state:** Each rule includes a concrete bad example and a rewritten good example, so the AI can pattern-match against real text.

#### Examples per rule

**Dash-connected contrasts:**

```
<example type="bad">
It's not about replacing you — it's about helping you think.
</example>

<example type="good">
AI can't write for you. But it can ask the right questions when your ideas are still blurry.
</example>
```

Break the contrast into two independent sentences. Each should stand on its own.

**Summary sentences at paragraph end:**

```
<example type="bad">
The first trick is turning up extended thinking. The second is giving it a three-act structure. The third is setting the audience and goals upfront.
All three share a common thread: they're things you need to do before writing starts.
</example>

<example type="good">
The first trick is turning up extended thinking. The second is giving it a three-act structure. The third is setting the audience and goals upfront.
I found that skipping any of these meant the draft was unfixable no matter how many revisions I tried.
</example>
```

The ending sentence should advance to the next idea, not restate what was just said.

**Listicle structure for non-list content:**

```
<example type="bad">
First, turn extended thinking up to high. AI gets more room to think about structure and the output improves significantly.

Second, give it a three-act structure. Essays need narrative arc, and a framework helps AI arrange paragraphs with better pacing.

Third, set the audience and goals before writing.
</example>

<example type="good">
The biggest improvement came from turning extended thinking up to high — with room to plan, AI stops producing bullet-point-style reports. Essays also need arc, so I started giving it a three-act framework for pacing. But none of this works unless you first tell it who the reader is and what they should walk away with.
</example>
```

Weave items into prose with causal connections, not isolated numbered points.

**Hollow opening questions:**

```
<example type="bad">
If AI can't write good articles on its own, what can it actually help with?
</example>

<example type="good">
AI can't write well. That much is clear. But it's not entirely useless either.
</example>
```

**Filler phrases:**

```
<example type="bad">
Interestingly enough, this set of writing skills was itself designed with AI assistance.
</example>

<example type="good">
This set of writing skills was itself designed with AI assistance.
</example>
```

**Repetition across paragraphs:**

```
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

### Change 2: Add writing-reviewer subagent and review loop

Modeled after brainstorming's `spec-document-reviewer-prompt.md`, this adds a self-review step between drafting and author review.

#### New file: `skills/article-writing/writing-reviewer-prompt.md`

A prompt template for dispatching a reviewer subagent:

- **Input:** article file path + writing rules file path
- **What to check:** prohibited patterns, repetition, specificity, author voice
- **Calibration:** only flag clear violations with quoted text; do not flag stylistic preferences
- **Output format:** Status (Approved / Issues Found), Issues with quoted passages and rule names, advisory Recommendations

Key design choices:
- **Reviewer must quote the offending passage** — unlike spec review which can reference sections by name, writing review needs exact quotes so the fixer knows what to change
- **Calibration is lenient** — matches spec reviewer philosophy: approve unless there are clear rule violations
- **Max 3 iterations** — prevents infinite loops; after 3 rounds, proceed to author review

#### Change to SKILL.md: new Step 3.5

Insert between Step 3 (Write the First Draft) and Step 4 (Author Review):

```
### Step 3.5: Draft Review Loop

After writing the first draft, dispatch a writing-reviewer subagent to check
the draft against writing rules.

1. Dispatch reviewer (see writing-reviewer-prompt.md)
2. If Issues Found: fix the flagged passages and re-dispatch
3. Max 3 iterations, then proceed to Author Review
```

## Files to Change

| File | Change |
|------|--------|
| `skills/article-writing/references/writing-rules.md` | Add `<example>` blocks to each prohibited pattern |
| `skills/article-writing/SKILL.md` | Add Step 3.5 (Draft Review Loop), reference new reviewer prompt |
| `skills/article-writing/writing-reviewer-prompt.md` | New file: reviewer subagent prompt template |

## Risks

- **Examples may not generalize well** — the examples are drawn from one article. If they're too specific, AI might learn the wrong patterns. Mitigation: examples focus on structural patterns, not topic-specific content.
- **Review loop adds latency** — each review round requires a subagent dispatch. Mitigation: max 3 rounds, and the reviewer is calibrated to be lenient so most drafts should pass in 1-2 rounds.
- **Reviewer may miss violations** — a subagent reading the rules might have the same comprehension gap as the writer. Mitigation: the examples in writing-rules.md help both the writer and the reviewer understand the rules better.
