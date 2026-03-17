# brief.md Format

## Structure

The brief is copied from `templates/brief-template.md` when a new article is created. It tracks all planning information and progress for one article.

### Sections

#### Article Info
- **Title**: Article title (proposed by AI, confirmed by user)
- **Author**: Who is writing this article
- **Date**: Creation date
- **Status**: One of `draft`, `ready`, `writing`, `review`, `published`
  - `draft` → initial state when article directory is created
  - `ready` → all Preparation checklist items complete, ready for writing
  - `writing` → Writing skill is producing/revising the draft
  - `review` → author has approved the draft, ready for review
  - `published` → finalized and published
- **Original language**: The language the article will be written in (e.g., "Chinese", "English")
- **Translations**: Comma-separated language codes for translated versions (e.g., "en, zh"). Translated files are named `article.{lang}.md`

#### Target Audience
- **Who**: One-line description of the target reader
- **Background**: Brief description of the audience's context, needs, and knowledge level

#### Source Ideas
References to the original idea(s) from `ideas.md` that sparked this article. For traceability.

#### Article Goals
- **Reader takeaway**: What the reader will gain from reading this article
- **Goal alignment**: How this article connects to the goals in `config.md`

#### Writing Style
Optional. Article-specific style references that replace the global style in `config.md`. Can be a prose description, links to reference articles, or specific rules. Leave empty to use the global default.

#### Outline
The article's structure, built after the author interview. Each section includes:
- **Section title**: What this part of the article covers
- **Purpose**: What this section achieves for the reader
- **Materials**: Specific details, quotes, decisions, numbers, and examples from the author interview that belong in this section

The outline is shaped by the materials gathered during the interview, not by a generic template. Every section must have concrete materials — if a section has no materials, it should be cut or the author should be interviewed further.

#### Checklist
Tracks progress across all skills.

**Preparation** (managed by Article Preparation skill):
- Target audience confirmed
- Article goals confirmed
- Goal alignment confirmed
- Language and translations confirmed
- Interview completed
- Outline with materials completed
- Ready for writing

**Writing & Review** (managed by later skills):
- First draft completed
- Review completed
- Translations completed
- Finalized

## Status Transitions

| From | To | Trigger |
|------|----|---------|
| draft | ready | All Preparation checklist items complete |
| ready | writing | Writing skill begins |
| writing | review | Author approves the draft after revision rounds |
| review | published | Finalized |
