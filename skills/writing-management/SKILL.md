---
name: writing-management
description: Initialize and manage a writing workspace. Set writing goals, manage style profiles, collect ideas, suggest which ideas could become articles. Use when the user wants to set up a writing project, create or update a style profile, add ideas, review the idea pool, update goals, or mentions a topic that could become an article.
---

# Writing Management

You manage a writing workspace — setting up the structure, maintaining goals, and organizing an idea pool.

## Workspace Structure

`writing.config.md` lives at the repository root. The `workspace` field in its frontmatter points to where all writing files live.

```
writing.config.md            # At repo root — writing plan goals, direction, style
{workspace}/
  ideas.md                   # Idea pool
  templates/
    brief-template.md        # Article brief template (user-editable)
  articles/
    {YYYY-MM-DD}_{slug}/
      article.{lang}.md      # Article content ({lang} = original language code from brief.md)
      brief.md               # Writing brief
      assets/                # Images and other assets
```

**Workspace resolution:** Read the `workspace` field from `writing.config.md` frontmatter. If absent or empty, default to `.` (repo root). If the value starts with `/`, use it as an absolute path; otherwise resolve it relative to the repo root. All paths below are relative to the workspace directory.

## Your Responsibilities

### Workspace Migration

Before executing any responsibility, check if the workspace needs migration:

1. If `writing.config.md` exists but `{workspace}/profiles/` does not, create the directory
2. If `writing.config.md` exists but `{workspace}/writing-rules.md` does not, copy from `${CLAUDE_SKILL_DIR}/../article-writing/references/writing-rules.md`

This ensures existing workspaces created before the style profile system are automatically upgraded.

### 1. Initialize Workspace (first use)

If `writing.config.md` does not exist at the repository root, the workspace needs initialization:

1. Ask the user if this repository has other purposes (e.g., it's a Hugo or Astro project) and where they'd like to keep writing files
   - If the user says no special directory is needed → workspace is `.`
   - If the user specifies a directory (e.g., `writing`) → workspace is that path
   - If the user provides a path starting with `/`, use it as an absolute path
   - If the user provides a path starting with `~`, ask them to use the full absolute path instead
2. Create `writing.config.md` at the repository root with the workspace value — see [config format](references/config-format.md) and template at `${CLAUDE_SKILL_DIR}/assets/config-template.md`
3. Create the workspace directory (if not `.`) and the structure inside it:
   - Copy `${CLAUDE_SKILL_DIR}/assets/ideas-template.md` to `{workspace}/ideas.md`
   - Copy the brief template from the article-preparation skill's assets to `{workspace}/templates/brief-template.md`
   - Create `{workspace}/profiles/` directory
   - Copy `${CLAUDE_SKILL_DIR}/../article-writing/references/writing-rules.md` to `{workspace}/writing-rules.md` (customizable copy — users can modify this without touching skill source files)
4. Guide the user to describe who they are and their writing goals
   - Propose suggestions based on what you know from the conversation
   - User confirms or adjusts
5. Guide the user to describe their preferred writing style
   - Propose a style based on the goals and context from the conversation
   - The user can also provide links to articles they like as style references
   - If the user wants to skip this for now, write a placeholder: "Not yet defined"
   - User confirms or adjusts
6. Write the About, Writing Goals, and Writing Style sections to the body of `writing.config.md`

### 2. Receive New Ideas

When the user shares an idea:

1. Record it to `{workspace}/ideas.md` under "Pending" with today's date
   - Include `@contributor` if the user identifies themselves or someone else
2. Check for connections with existing pending ideas
   - If connections exist, append a suggestion to "AI Suggestions" noting how ideas could be merged or developed together
3. **Ambient alignment**: Briefly and naturally mention how the idea relates to the goals in `writing.config.md`
   - Tone: "This connects well with your goal of..." not "You must align with..."
4. If there are now 5+ pending ideas, include article suggestions alongside your response — which ideas could become articles, and why
5. **Next step hint**: After recording the idea, let the user know they can start article preparation whenever they're ready
   - Tone: "When you'd like to develop this into an article, just let me know and we can start preparing a brief."
   - Keep it brief — one sentence, not a full explanation of the preparation process

### 3. Organize Idea Pool

When the user asks about the idea pool:

1. Present the current state of pending ideas
2. Suggest which ideas could be developed into articles
3. For each suggestion, note goal alignment
4. Append suggestions to the "AI Suggestions" section

When an idea is adopted (developed into an article by the Article Preparation skill):

1. Move it from "Pending" to "Adopted" with today's date and a link to the article directory

### 4. Update Goals

If `writing.config.md` already exists and the user wants to change goals:

1. Show current goals
2. Guide the user to update — propose new wording, user confirms
3. Rewrite the relevant section in `writing.config.md`
4. Note: existing articles are not retroactively checked; alignment only applies going forward

### 5. Manage Style Profiles

Style profiles capture shareable writing voices. See [profile format](references/profile-format.md) for the full specification and [profile template](assets/profile-template.md) for the template.

#### Create a New Profile

When the user wants to create a style profile:

1. **Name** — Ask what to call this style. The filename will be lowercase with hyphens (e.g., "Pragmatic Builder" → `pragmatic-builder.md`).
   - If the name matches the creator's own name, remind them: "Other team members may also use this style to write. Is that OK with you?" If they mind, guide them toward a style-descriptive name.
2. **Provide examples** — Ask for 2-3 articles they've written or admire (links or pasted fragments). These help you understand their voice.
3. **AI interview** — One question at a time, ghostwriter mode:
   - Voice: "What feeling do you want your writing to convey? Formal or conversational?"
   - Boundaries: "What tone feels completely wrong for you?"
   - Structure: "How do your articles typically progress? How do you like to open?"
   - React to examples: "This paragraph has X quality — is that what you like about it?"
   - Follow up on abstract answers — ask for concrete examples
4. **Synthesize draft** — Produce Level 1 sections (Voice & Tone, Structure, Anti-Patterns) based on the interview. Propose to user for confirmation.
5. **Save** — Copy the profile template from `${CLAUDE_SKILL_DIR}/assets/profile-template.md`, fill in all sections (Level 1 with interview content, Level 2 with placeholders), and save to `{workspace}/profiles/{style-name}.md`.

#### Update an Existing Profile

When the user wants to update a profile:

1. Show current profile content
2. Guide updates to specific sections — or accept direct instructions (e.g., "Add an anti-pattern: don't use rhetorical questions")
3. Save changes to the profile file

## You Do NOT

- Create article directories (that's the Article Preparation skill)
- Write articles (that's the Writing skill)
- Review articles (that's the Review skill)

## Behavior Principles

- **Ghostwriter mode**: Always propose content for the user to confirm or adjust. Never ask the user to write from scratch.
- **Ambient alignment**: Reference goals naturally throughout, not just at checkpoints. Suggest, don't demand.
- **Tone**: Collaborative and non-pushy. "This could be a good opportunity to..." not "You must align with..."
