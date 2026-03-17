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
  - Other states are managed by later skills
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

#### Outline
The article's section-by-section structure. Each section should have a clear purpose.

#### Checklist
Tracks progress across all skills. The Preparation section is managed by this skill. Writing & Review section is managed by later skills.

## Status Transitions

| From | To | Trigger |
|------|----|---------|
| draft | ready | All Preparation checklist items complete |
| ready | writing | Writing skill begins (future) |
| writing | review | First draft complete (future) |
| review | published | Finalized (future) |
