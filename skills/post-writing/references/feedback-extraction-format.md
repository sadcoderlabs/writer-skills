# Feedback Extraction Format

Defines the process and output format for extracting writing patterns from user feedback on social content. Both post-writing (Step 6) and x-engagement (Step 5) follow this same process.

**This is a reference document, not a subagent prompt.** The agent reads this and executes the extraction inline.

## Input

For each piece of feedback, gather:

- **before**: original draft text
- **after**: revised text (user's edit or agent's rewrite based on feedback)
- **reason**: user's stated reason (explicit for engagement; inferred from diff for post-writing)
- **source**: `post` or `engagement`

## Process

For each before/after pair:

1. Read the current `social-style-guide.md` to understand existing patterns
2. Identify what changed and why it's an improvement
3. Determine if this represents a **repeatable pattern** (not just a one-off fix)

**Skip extraction if:**
- The change is a minor wording tweak (fewer than 3 words changed)
- The change is content-specific (fixing a factual error, not a style pattern)
- An equivalent pattern already exists in the style guide

## Output Format

For each pattern found, produce:

### Pattern: {short name}

**Target section:** {Persona | Voice | Structure | Rhetorical Patterns | Opening Patterns | Signature Vocabulary | Anti-Patterns | Good/Bad Examples}

<example type="bad" source="{post|engagement}">
{the before text}
Reason: {why this is bad — from user's reason or inferred from the change}
</example>

<example type="good" source="{post|engagement}">
{the after text}
Reason: {why this is better}
</example>

---

If no patterns are worth recording:
> No repeatable patterns found in this feedback.

## After Extraction

1. Present extracted patterns to the user in ghostwriter mode for confirmation
2. User can accept, adjust, or skip each pattern
3. Write confirmed patterns to `social-style-guide.md` — replace placeholder text if the target section still has it, otherwise append
