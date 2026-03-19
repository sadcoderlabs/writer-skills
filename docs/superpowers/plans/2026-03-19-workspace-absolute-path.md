# Workspace Absolute Path Support Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Support absolute paths in the `workspace` field of `writing.config.md` and remove all path validation restrictions.

**Architecture:** This is a text-only change across 6 markdown files. The three SKILL.md files get updated workspace resolution descriptions, `config-format.md` gets new rules, and `CLAUDE.md`/`README.md` get documentation updates. No code, no tests — these are prompt-based AI agent skills.

**Spec:** `docs/superpowers/specs/2026-03-19-workspace-absolute-path-design.md`

---

## File Map

| File | Action | What changes |
|------|--------|-------------|
| `skills/writing-management/SKILL.md` | Modify:27,38 | Workspace resolution + delete validation line |
| `skills/article-preparation/SKILL.md` | Modify:13 | Workspace resolution |
| `skills/article-writing/SKILL.md` | Modify:15,59-62,76,109 | Workspace resolution + git operations |
| `skills/writing-management/references/config-format.md` | Modify:17-23,28-30 | Rules section + example |
| `CLAUDE.md` | Modify:29 | Workspace structure description |
| `README.md` | Modify:52 | Workspace structure description |

---

### Task 1: Update writing-management SKILL.md

**Files:**
- Modify: `skills/writing-management/SKILL.md:27,38`

- [ ] **Step 1: Update workspace resolution description**

At line 27, replace:

```markdown
**Workspace resolution:** Read the `workspace` field from `writing.config.md` frontmatter. If absent or empty, default to `.` (repo root). All paths below are relative to the workspace directory.
```

With:

```markdown
**Workspace resolution:** Read the `workspace` field from `writing.config.md` frontmatter. If absent or empty, default to `.` (repo root). If the value starts with `/`, use it as an absolute path; otherwise resolve it relative to the repo root. All paths below are relative to the workspace directory.
```

- [ ] **Step 2: Replace validation line with absolute path handling**

At lines 37-38, replace:

```markdown
   - If the user specifies a directory (e.g., `writing`) → workspace is that path
   - Validate: no `..`, no leading/trailing `/`, maximum two levels deep
```

With:

```markdown
   - If the user specifies a directory (e.g., `writing`) → workspace is that path
   - If the user provides a path starting with `/`, use it as an absolute path
   - If the user provides a path starting with `~`, ask them to use the full absolute path instead
```

- [ ] **Step 3: Commit**

```bash
git add skills/writing-management/SKILL.md
git commit -m "feat: support absolute workspace paths in writing-management skill"
```

---

### Task 2: Update article-preparation SKILL.md

**Files:**
- Modify: `skills/article-preparation/SKILL.md:13`

- [ ] **Step 1: Update workspace resolution description**

At line 13, replace:

```markdown
- Read the `workspace` field from `writing.config.md` frontmatter (default: `.`). All paths below are relative to this workspace directory.
```

With:

```markdown
- Read the `workspace` field from `writing.config.md` frontmatter (default: `.`). If the value starts with `/`, use it as an absolute path; otherwise resolve it relative to the repo root. All paths below are relative to this workspace directory.
```

- [ ] **Step 2: Commit**

```bash
git add skills/article-preparation/SKILL.md
git commit -m "feat: support absolute workspace paths in article-preparation skill"
```

---

### Task 3: Update article-writing SKILL.md

**Files:**
- Modify: `skills/article-writing/SKILL.md:15,59-62,76,109`

- [ ] **Step 1: Update workspace resolution description**

At line 15, replace:

```markdown
- Read the `workspace` field from `writing.config.md` frontmatter (default: `.`). The article directory containing `brief.md` is inside `{workspace}/articles/`.
```

With:

```markdown
- Read the `workspace` field from `writing.config.md` frontmatter (default: `.`). If the value starts with `/`, use it as an absolute path; otherwise resolve it relative to the repo root. The article directory containing `brief.md` is inside `{workspace}/articles/`.
```

- [ ] **Step 2: Update Step 4 git operations for cross-repo workspace**

At lines 55-62, replace:

```markdown
### Step 4: Commit First Draft

After writing the complete first draft to `article.md`, commit the current state to preserve the original draft before automated review.

1. Git add `article.md` and `brief.md`
2. Commit with message: `draft: complete first draft for {slug}`

If the workspace is not a git repository, skip this step and proceed to Step 5.
```

With:

```markdown
### Step 4: Commit First Draft

After writing the complete first draft to `article.md`, commit the current state to preserve the original draft before automated review.

1. Git add `article.md` and `brief.md`
2. Commit with message: `draft: complete first draft for {slug}`

If the workspace is an absolute path, run git commands from the workspace directory (e.g., `git -C {workspace} add ...`). If the workspace is not a git repository, skip this step and proceed to Step 5.
```

- [ ] **Step 3: Update Step 5c git commit note**

At line 76, replace:

```markdown
**5c.** Git commit with message: `review: writing review round {N} for {slug}`. Include modified `article.md` and the new report file. (`{N}` is the type-local round number; `{NN}` is the global sequence number.) Skip if not a git repository.
```

With:

```markdown
**5c.** Git commit with message: `review: writing review round {N} for {slug}`. Include modified `article.md` and the new report file. (`{N}` is the type-local round number; `{NN}` is the global sequence number.) If the workspace is an absolute path, run git commands from the workspace directory. Skip if not a git repository.
```

- [ ] **Step 4: Update Step 6c git commit note**

At line 109, replace:

```markdown
**6c.** Git commit with message: `review: fact-check review round {N} for {slug}`. Include modified `article.md`, the new report file, and `research.md` if modified. (`{N}` is the type-local round number; `{NN}` is the global sequence number.) Skip if not a git repository.
```

With:

```markdown
**6c.** Git commit with message: `review: fact-check review round {N} for {slug}`. Include modified `article.md`, the new report file, and `research.md` if modified. (`{N}` is the type-local round number; `{NN}` is the global sequence number.) If the workspace is an absolute path, run git commands from the workspace directory. Skip if not a git repository.
```

- [ ] **Step 5: Commit**

```bash
git add skills/article-writing/SKILL.md
git commit -m "feat: support absolute workspace paths in article-writing skill"
```

---

### Task 4: Update config-format.md

**Files:**
- Modify: `skills/writing-management/references/config-format.md:17-23,28-30`

- [ ] **Step 1: Replace rules section**

At lines 17-23, replace:

```markdown
**Rules:**
- `workspace` is the only frontmatter field
- Value is a relative path from repo root to the directory containing `ideas.md`, `templates/`, and `articles/`
- If omitted or empty, defaults to `.` (repo root is the workspace)
- No leading `/`, no trailing `/`
- No `..` (must stay within the repo)
- Maximum two levels deep (e.g., `writing` or `src/writing`)
```

With:

```markdown
**Rules:**
- `workspace` is the only frontmatter field
- Value is a directory path pointing to where `ideas.md`, `templates/`, and `articles/` live
- If omitted or empty, defaults to `.` (repo root is the workspace)
- If the value starts with `/`, it is treated as an absolute path
- Otherwise, it is resolved relative to the repo root
```

- [ ] **Step 2: Add absolute path example**

Before `## Guidelines` (line 63), insert the following section:

````markdown
## Absolute Path Example

When skills are installed separately from the writing output (e.g., an AI agent's workspace pointing to an external content repository):

```yaml
---
workspace: /root/projects/sadcoder-press
---
```

With this configuration, `ideas.md` lives at `/root/projects/sadcoder-press/ideas.md`, articles at `/root/projects/sadcoder-press/articles/`, etc. The `writing.config.md` file itself stays at the repo root where skills are invoked.
````

- [ ] **Step 3: Commit**

```bash
git add skills/writing-management/references/config-format.md
git commit -m "docs: update config format for absolute workspace paths"
```

---

### Task 5: Update CLAUDE.md

**Files:**
- Modify: `CLAUDE.md:29`

- [ ] **Step 1: Update workspace structure description**

At line 29, replace:

```markdown
`writing.config.md` lives at the repository root. The `workspace` frontmatter field (default: `.`) points to where writing files live.
```

With:

```markdown
`writing.config.md` lives at the repository root. The `workspace` frontmatter field (default: `.`) points to where writing files live. It can be a relative path (resolved from repo root) or an absolute path starting with `/` (for cross-repo setups where skills and content live in different directories).
```

- [ ] **Step 2: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: update CLAUDE.md for absolute workspace path support"
```

---

### Task 6: Update README.md

**Files:**
- Modify: `README.md:52`

- [ ] **Step 1: Update workspace structure description**

At line 52, replace:

```markdown
`writing.config.md` lives at the repository root. The `workspace` frontmatter field (default: `.`) points to where writing files live.
```

With:

```markdown
`writing.config.md` lives at the repository root. The `workspace` frontmatter field (default: `.`) points to where writing files live. Supports relative paths (from repo root) and absolute paths starting with `/`.
```

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs: update README.md for absolute workspace path support"
```
