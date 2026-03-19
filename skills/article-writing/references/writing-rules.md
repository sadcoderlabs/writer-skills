# Writing Rules

Rules to counter common AI writing patterns and ensure the article reads as if the author wrote it.

## Prohibited Patterns

These patterns are telltale signs of AI-generated text. Avoid them entirely.

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
State the point once. Each later mention must add something new: a different angle, a concrete method, or a counterexample. If there's nothing new to add, don't bring it up again.
</example>

- **Abstract conclusion sentences**: Don't end a point with a vague conclusion like "this changed my entire approach" or "this distinction is important." The reader learns nothing. Replace with a concrete outcome, example, or consequence that shows what actually changed.

<example type="bad">
The preparation phase determines content quality, while the writing phase determines expression. This distinction changed the entire direction of my system design.
</example>

<example type="good">
Beyond writing technique, pre-writing preparation is a major factor. This shaped my design approach: extract raw materials first, then let AI do the writing.
</example>

The ending should show what concretely changed, not just assert that something changed.

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

- **Excessive em-dashes**: Keep to 1-2 per article. Convert the rest to commas, periods, or split into separate sentences.

<example type="bad">
The tool — which we built in two weeks — handled three tasks — parsing, validation, and routing — without any manual config.
</example>

<example type="good">
The tool handled three tasks without any manual config: parsing, validation, and routing. We built it in two weeks.
</example>

- **Symmetrical sections**: Not every section needs the same length or structure. Let the content dictate the shape.

## Required Quality

### Use the author's materials
- Every claim, example, and number in the article must come from the outline materials. Materials include author-sourced content (from the interview) and research findings (from research.md) that the author has confirmed for inclusion. Never fabricate examples, statistics, or anecdotes.
- If a section's materials are too thin to write well, flag it to the author rather than padding with generic statements.

### Preserve the author's voice
- Keep the author's original phrasing when it's vivid or distinctive. Don't smooth colloquial language into formal prose unless the style reference specifically asks for it.
- Match the tone and register of the style reference. If no style reference exists, default to direct and conversational.

### Be specific
- Numbers over adjectives: "3x faster" not "significantly faster"
- Names over categories: "we used Redis" not "we used a caching solution"
- Stories over summaries: "On day one, the deploy failed because..." not "We encountered some initial challenges"

### Cite sources with links
- When the article references data, statistics, findings, or claims that originate from `research.md` or materials in `brief.md`, include a Markdown link to the source.
- Use inline links naturally within the prose: "according to [the official documentation](https://...)" or "a [2024 survey](https://...) found that..."
- If the source URL is available in `research.md` or the materials, use it. Do not fabricate URLs.
- Not every sentence needs a link — link the key data points, not common knowledge or the author's own opinions/experiences.

### Advance, don't repeat
- Each paragraph should move the article forward. The reader should learn something new in every paragraph.
- If you find yourself restating a point, you're either padding or the outline has a structural issue.

### Make abstract concepts tangible
- When explaining abstract concepts or methodology, use metaphors or concrete sensory experiences so the reader can *feel* it, not just understand it.
- A well-chosen metaphor grounds the reader. Pair it with specific emotional or physical scenarios they can identify with.

<example type="bad">
Instead of making AI write better, I shifted to helping authors extract the materials from their minds.
</example>

<example type="good">
Through Q&A, extract the author's experiential materials — use these as raw ingredients and let AI cook them into a dish. Find the article's "soul": maybe it's the frustration of debugging for half a day only to find a trivial fix, or the satisfaction of changing one line and watching everything work.
</example>
