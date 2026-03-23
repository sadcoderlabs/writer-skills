# 錯誤驅動回饋循環實作計畫

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**目標：** 在 article-writing 的作者審核後新增回饋萃取步驟，將作者的人工修正模式回饋到 Style Profile 或 writing-rules.md。

**架構：** 只修改 `skills/article-writing/SKILL.md` 一個檔案。Step 7 加流程說明、新增 Step 9（Feedback Extraction）、原 Step 9 重新編號為 Step 10。所有新增內容用英文撰寫（遵循 skills/ 目錄語言慣例）。

**Spec：** `docs/superpowers/specs/2026-03-23-error-driven-feedback-loop-design.md`

---

## 檔案結構

### 需要修改的檔案

| 檔案 | 變更 |
|------|------|
| `skills/article-writing/SKILL.md` | Step 7 加流程說明、新增 Step 9、Step 9→10 重新編號 |

不新增任何檔案。

---

## Task 1: Step 7 加入流程說明

**檔案：**
- 修改: `skills/article-writing/SKILL.md:142-147`

- [ ] **Step 1: 在 Step 7 開頭加入流程說明**

在 `### Step 7: Author Review` 的現有內容（「Present the draft to the author...」）之前，插入：

```markdown
Before starting author review, explain the full review-and-feedback process to the author:

> "You can now freely revise the article — edit the file directly or tell me in conversation what to adjust. After you're satisfied, I'll review your revisions and extract patterns that can improve future writing — suggesting additions to your Style Profile or the team's writing rules. So if you have specific preferences while revising (e.g., 'this is too academic', 'I don't like this kind of opening'), feel free to say them — they'll become reference for future articles."

Then present the draft and ask for feedback.
```

完成後，Step 7 的完整內容應為：

```markdown
### Step 7: Author Review

Before starting author review, explain the full review-and-feedback process to the author:

> "You can now freely revise the article — edit the file directly or tell me in conversation what to adjust. After you're satisfied, I'll review your revisions and extract patterns that can improve future writing — suggesting additions to your Style Profile or the team's writing rules. So if you have specific preferences while revising (e.g., 'this is too academic', 'I don't like this kind of opening'), feel free to say them — they'll become reference for future articles."

Then present the draft and ask for feedback. Point the author to the `reviews/` directory where they can read the full review reports for context on changes made during automated review. The author can:
- Edit `article.{lang}.md` directly (you read the changes and continue from there)
- Give feedback in conversation (you apply the changes)
- Approve the draft as-is
```

- [ ] **Step 2: Commit**

```bash
git add skills/article-writing/SKILL.md
git commit -m "feat: add review-and-feedback flow explanation to Step 7"
```

---

## Task 2: 新增 Step 9 — Feedback Extraction

**檔案：**
- 修改: `skills/article-writing/SKILL.md`（在 Step 8 之後、現有 Step 9 之前插入）

- [ ] **Step 1: 在 Step 8 結尾之後插入新的 Step 9**

在 Step 8 的最後一行（「If the issue is structural...suggest the author revisit the outline before continuing.」）之後，插入：

```markdown
### Step 9: Feedback Extraction

After the author is satisfied with the article, extract revision patterns to improve future writing. This step feeds the author's preferences back into their Style Profile or the team's writing rules.

**9a.** Check if extraction is needed. If the author made no revisions during Step 7/8 (approved the draft as-is after automated review), skip this step entirely and proceed to Step 10.

**9b.** Extract diff. Use `git log` to find the most recent commit that modified `article.{lang}.md` before Step 7 began (typically the last review commit from Step 5/6). Compare that version against the current version to identify all author-caused changes.

**9c.** Review conversation. Review the Step 7/8 conversation to extract the author's stated reasons for changes — preferences, dislikes, quality concerns, and stylistic opinions. If the writing session spanned multiple conversations (e.g., author resumed in a new session), rely primarily on the diff (9b) and commit messages, without conversation context.

**9d.** Synthesize patterns. From the diff and conversation, identify revision patterns worth recording. A pattern qualifies if: the same type of correction appears 2+ times in the diff, OR the author explicitly stated a preference in conversation (even if it only appears once). Single minor wording tweaks do not qualify. For each pattern, produce:
- **Pattern name**: Short description (e.g., "Avoid academic tone in practical sections")
- **Bad example**: The text before the author's revision (from the actual article)
- **Good example**: The text after the author's revision (from the actual article)
- **Reason**: Why the author made this change (from conversation context if available; otherwise infer from the nature of the change)

**9e.** Classify each pattern. Determine where it belongs:

- **Personal preference → Style Profile**: Patterns related to tone, style, rhythm, voice, subjective taste. Signals: author expressed subjective preference ("I don't like...", "I prefer..."), the pattern is about style rather than clarity, different authors might disagree on this.
- **Universal issue → writing-rules.md**: Patterns related to clarity, logic, reader comprehension, structural problems. Signals: the issue would be a problem regardless of writing style, it affects reader understanding, it can be stated as a general rule.
- **Default to Profile when uncertain.** Adding to a profile has a small blast radius (one style); adding to writing-rules.md affects all articles and all authors. Be conservative with global rules.

**9f.** Present proposal in ghostwriter mode:

> Here are some revision patterns from this article that could improve future writing:
>
> **Suggested for your Style Profile:**
> 1. {Pattern name}
>    - Bad: "{bad example}"
>    - Good: "{good example}"
>    - Reason: {reason}
>    - → Suggested section: {Anti-Patterns / Voice & Tone / Sentence-Level Preferences / etc.}
>
> **Suggested for writing-rules.md:**
> (None this time)
>
> Would you like to add any of these? You can also change where they go (e.g., move a personal suggestion to writing-rules.md if you think it should apply to everyone).

**9g.** Author confirms. The author can:
- Accept a suggestion as-is
- Adjust the wording before accepting
- Change the classification (Profile ↔ writing-rules.md)
- Skip a suggestion entirely

**9h.** Apply confirmed feedback.

For patterns going to the **Style Profile**: read the `Style:` field from `brief.md` to determine the target profile at `{workspace}/profiles/{style}.md`. If `Style:` is empty (no profile selected), skip profile-targeted patterns and inform the author: "These patterns can be added once you create a Style Profile."

For each confirmed profile pattern, determine the most appropriate section:
- Tone/style preferences → Voice & Tone or Sentence-Level Preferences
- Patterns to avoid → Anti-Patterns (with bad/good examples)
- Distinctive techniques the author added → Signature Moves
- Illustrative examples → Examples
- Check items → Revision Checklist

If the target section still has its Level 2 placeholder ("Not yet defined — will evolve through writing."), replace the placeholder with the new content. If the section already has content, append the new pattern.

For patterns going to **writing-rules.md**: write to `{workspace}/writing-rules.md`. If the file does not exist, copy from `${CLAUDE_SKILL_DIR}/references/writing-rules.md` first, then append the new rule. Add under the appropriate category (Sentence-level / Paragraph-level / Structure-level / Required Quality) using the existing format with `<example type="bad">` and `<example type="good">` tags.

**9i.** Commit. If any files were updated, commit with message: `feedback: extract revision patterns for {slug}`. Include only modified profile and/or writing-rules.md files — do not include `article.{lang}.md` (this step does not modify the article itself).
```

- [ ] **Step 2: Commit**

```bash
git add skills/article-writing/SKILL.md
git commit -m "feat: add Step 9 Feedback Extraction to article-writing"
```

---

## Task 3: Step 9 → Step 10 重新編號 + 更新相關引用

**檔案：**
- 修改: `skills/article-writing/SKILL.md`

- [ ] **Step 1: 將原 Step 9: Complete 重新編號為 Step 10**

找到：
```markdown
### Step 9: Complete
```

替換為：
```markdown
### Step 10: Complete
```

- [ ] **Step 2: 更新 skill description 中的流程描述**

在 frontmatter 的 `description` 中，目前提到 "runs automated review and fact-check, then revises based on author feedback"。這段描述仍然準確（回饋萃取是修訂後的附加步驟），不需要修改。

確認不需修改，繼續下一步。

- [ ] **Step 3: Commit**

```bash
git add skills/article-writing/SKILL.md
git commit -m "refactor: renumber Step 9 Complete to Step 10"
```
