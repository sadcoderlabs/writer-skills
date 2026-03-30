# Engagement Quality & Unified Feedback Loop 實作計畫

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 重構社群內容品質系統——加入 Persona、自動審查迴圈、統一 feedback extraction，讓 post-writing 和 x-engagement 共用同一套品質管線。

**Architecture:** social-style-guide.md 新增 Persona section 作為共享人設。engagement-rules.md 瘦身只保留策展邏輯。x-engagement Step 3 加入 subagent 批次審查迴圈（最多 3 輪）。新建 shared feedback-extraction subagent prompt，post-writing Step 6 和 x-engagement feedback step 都用同一介面。

**Tech Stack:** Markdown skill definitions following the Agent Skills open standard. No executable code — all files are markdown documents.

**Design spec:** `docs/superpowers/specs/2026-03-30-engagement-quality-design.md`

---

## File Structure

### 新建檔案

| 檔案 | 職責 |
|------|------|
| `skills/x-engagement/engagement-reviewer-prompt.md` | engagement 草稿批次審查 subagent dispatch template |
| `skills/post-writing/references/feedback-extraction-format.md` | 統一 feedback extraction 流程定義和輸出格式 reference（post-writing 和 x-engagement 共用，agent 自己執行不 dispatch subagent） |

### 修改檔案

| 檔案 | 改動 |
|------|------|
| `skills/writing-management/assets/social-style-guide-template.md` | 新增 `## Persona` section + `## Good/Bad Examples` section |
| `skills/writing-management/SKILL.md` | 新增 Persona migration 步驟 |
| `skills/x-engagement/references/engagement-rules.md` | 刪除 `## Draft Rules` section |
| `skills/x-engagement/SKILL.md` | Step 3 強制讀取順序 + 自動審查迴圈 + 新增 Step 5 feedback |
| `skills/post-writing/SKILL.md` | Step 3 強化讀取順序 + Step 6 改用 shared subagent |

---

### Task 1: social-style-guide template 新增 Persona + Good/Bad Examples

**說明：** 在 template 最前面加 Persona section，最後面加 Good/Bad Examples section。這兩個 section 是品質系統的核心——Persona 定義「誰在說話」，Examples 累積「什麼是好/壞的寫法」。

**Files:**
- Modify: `skills/writing-management/assets/social-style-guide-template.md`

- [ ] **Step 1: 在 `## Voice` 前面新增 `## Persona`，在 `## Reference Posts` 後面新增 `## Good/Bad Examples`**

目前 template 內容：

```markdown
# Social Style Guide

## Voice
...
## Reference Posts
(Not yet defined — will evolve through writing.)
```

修改為：

```markdown
# Social Style Guide

## Persona

(Not yet defined — will be set up on first use of post-writing or x-engagement.)

## Voice

(Not yet defined — will evolve through writing.)

## Structure

(Not yet defined — will evolve through writing.)

## Rhetorical Patterns

(Not yet defined — will evolve through writing.)

## Opening Patterns

(Not yet defined — will evolve through writing.)

## Signature Vocabulary

(Not yet defined — will evolve through writing.)

## Anti-Patterns

(Not yet defined — will evolve through writing.)

## Reference Posts

(Not yet defined — will evolve through writing.)

## Good/Bad Examples

(No examples yet — will accumulate through feedback from post-writing and x-engagement.)
```

用 Edit tool 將整個檔案內容替換為上述內容。

- [ ] **Step 2: Commit**

```bash
git add skills/writing-management/assets/social-style-guide-template.md
git commit -m "feat(writing-management): add Persona and Good/Bad Examples sections to social style guide template"
```

---

### Task 2: writing-management 新增 Persona migration

**說明：** 現有的 workspace 可能已經有 social-style-guide.md 但沒有 Persona section。需要加一個 migration 步驟自動補上。

**Files:**
- Modify: `skills/writing-management/SKILL.md`

- [ ] **Step 1: 在 Workspace Migration section 新增步驟 7 和 8**

在 `skills/writing-management/SKILL.md` 中，找到：

```
6. If `writing.config.md` exists and `${CLAUDE_SKILL_DIR}/../x-engagement/SKILL.md` exists but `writing.config.md` does not contain a `## Engagement` section, do NOT auto-append — the x-engagement skill handles its own setup interactively (it asks the user for notification channel preferences)
```

在其後新增：

```
7. If `{workspace}/social-style-guide.md` exists but does not contain a `## Persona` section, prepend the Persona placeholder section at the top (after the `# Social Style Guide` heading): `## Persona\n\n(Not yet defined — will be set up on first use of post-writing or x-engagement.)\n`
8. If `{workspace}/social-style-guide.md` exists but does not contain a `## Good/Bad Examples` section, append it at the end: `## Good/Bad Examples\n\n(No examples yet — will accumulate through feedback from post-writing and x-engagement.)\n`
```

- [ ] **Step 2: Commit**

```bash
git add skills/writing-management/SKILL.md
git commit -m "feat(writing-management): add Persona and Good/Bad Examples migration steps"
```

---

### Task 3: engagement-rules.md 瘦身

**說明：** 刪除 Draft Rules section，草擬品質改由共享資源（post-rules.md + social-style-guide.md）覆蓋。只保留策展相關的規則。

**Files:**
- Modify: `skills/x-engagement/references/engagement-rules.md`

- [ ] **Step 1: 刪除 `## Draft Rules` 整個 section**

在 `skills/x-engagement/references/engagement-rules.md` 中，找到從 `## Draft Rules` 開始到 `## Action Type Selection` 之前的所有內容：

```
## Draft Rules

### Reply drafts

- Add value: share your experience, a specific example, or a contrasting perspective
- Don't just agree ("Great point!") — extend the conversation
- Keep within platform character limits (280 for X)
- Match the tone of the original tweet (casual reply to casual tweet)

### Quote retweet drafts

- Add context or your own take — don't just repeat what the original said
- Good for connecting the tweet to something you've written or experienced
- The quote should make sense on its own (your followers may not click through)

### Post drafts (inspired standalone)

- The original tweet is inspiration, not source material
- Your post should stand alone without the reader knowing what inspired it
- Follow the social style guide for voice and structure

```

刪除上述所有內容。`## Curation Criteria` 之後直接接 `## Action Type Selection`。

- [ ] **Step 2: 更新檔案開頭說明**

將：

```
Rules for curating X engagement recommendations. These guide the agent during the Curate step.
```

改為：

```
Rules for curating X engagement recommendations. These guide the agent during the Curate step when selecting which tweets to engage with and what action type to use.

Draft quality is governed by shared resources: `post-rules.md` (prohibited patterns, quality requirements) and `social-style-guide.md` (Persona, Voice, Good/Bad Examples).
```

- [ ] **Step 3: Commit**

```bash
git add skills/x-engagement/references/engagement-rules.md
git commit -m "refactor(x-engagement): remove Draft Rules from engagement-rules, defer to shared quality resources"
```

---

### Task 4: 建立 engagement-reviewer-prompt.md

**說明：** x-engagement 自動審查的 subagent dispatch template。批次審查所有推薦項目的所有草稿，逐版本給出通過/不通過 + 理由。

**Files:**
- Create: `skills/x-engagement/engagement-reviewer-prompt.md`

- [ ] **Step 1: 建立 prompt template**

寫入以下內容到 `skills/x-engagement/engagement-reviewer-prompt.md`：

```markdown
# Engagement Reviewer Prompt Template

Use this template when dispatching an engagement reviewer subagent during Step 3.

**Purpose:** Batch-review all engagement draft copies against post rules, social style guide (including Persona), and accumulated good/bad examples. Return per-version pass/fail with specific reasons.

**Dispatch after:** All draft versions are written for all recommended items.

~~~
Agent tool (general-purpose):
  description: "Review engagement draft quality"
  prompt: |
    You are a social content quality reviewer. Check engagement draft copies
    against the post writing rules and social style guide. You do NOT fix
    the drafts — you judge them and explain what's wrong.

    **Post writing rules:** [POST_RULES_FILE_PATH]
    **Social style guide:** [SOCIAL_STYLE_GUIDE_PATH]

    **Drafts to review:**

    [For each recommended item, include:]
    ---
    Tweet N (@author):
    Original: "original tweet content..."
    Action: reply | quote | post

    Version A: "draft text..."
    Version B: "draft text..."
    Version C: "draft text..."
    ---

    Read the rules and style guide first, then review every version.

    ## What to Check

    For each version, check ALL of the following:

    | Category | What to Look For |
    |----------|------------------|
    | Prohibited patterns | Engagement bait, filler/padding, artificial structure, voice issues as defined in post-rules.md |
    | Persona match | Does this sound like the person described in the Persona section? Would they actually say this? |
    | Bad Examples | Does this draft resemble any Bad Example in the Good/Bad Examples section? |
    | Specificity | Does it contain concrete details (numbers, project names, specific experiences) or is it vague and generic? |
    | AI tells | Generic wisdom, consultant tone, LinkedIn voice, hollow affirmations, restating what the original tweet said |
    | Value add | Does this reply/quote actually add something new to the conversation, or just agree/restate? |

    ## Calibration

    **Be strict.** The whole point of this review is to catch AI-sounding drafts
    before they reach the user. A draft that "kind of works" is a fail — it needs
    to sound like a real person with real experiences wrote it.

    When rejecting, be specific: quote the problematic phrase and explain exactly
    what makes it sound artificial or generic. Vague feedback like "too generic"
    is not actionable — say which part is generic and what kind of specificity
    is missing.

    ## Output Format

    Return one block per tweet, one line per version:

    Tweet 1 (@author):
      Version A: ✅ Pass
      Version B: ❌ "The 'agents don't listen' problem is real" — hollow hook pattern (post-rules.md: Engagement bait). Rest of draft lacks any concrete experience.
      Version C: ✅ Pass

    Tweet 2 (@author):
      Version A: ❌ "spot on" — empty affirmation (post-rules.md: Filler). Entire draft reads like LinkedIn comment, not matching Persona.
      Version B: ✅ Pass
      Version C: ❌ "unlock your potential" — corporate motivational (post-rules.md: Voice issues). Does not match Persona at all.

    End with a summary line:
    Summary: X/Y versions passed.
~~~

**Reviewer returns:** Per-version pass/fail assessments with specific reasons for failures. The caller (x-engagement Step 3) uses the failure reasons to rewrite rejected versions before the next review round.
```

- [ ] **Step 2: Commit**

```bash
git add skills/x-engagement/engagement-reviewer-prompt.md
git commit -m "feat(x-engagement): add engagement reviewer subagent prompt template"
```

---

### Task 5: 建立 shared feedback-extraction-format.md

**說明：** 統一的 feedback extraction 流程定義和輸出格式 reference document。post-writing Step 6 和 x-engagement feedback step 都讀這個 reference，由 agent 自己執行（不 dispatch subagent），因為 feedback extraction 只是比對 before/after 並格式化，沒有「自己審查自己」的偏心問題。

**Files:**
- Create: `skills/post-writing/references/feedback-extraction-format.md`

- [ ] **Step 1: 建立 reference document**

寫入以下內容到 `skills/post-writing/references/feedback-extraction-format.md`：

```markdown
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
```

- [ ] **Step 2: Commit**

```bash
git add skills/post-writing/references/feedback-extraction-format.md
git commit -m "feat(post-writing): add shared feedback extraction format reference"
```

---

### Task 6: x-engagement SKILL.md — 重寫 Step 3 + 新增 Step 5

**說明：** 最大的改動。Step 3 加入強制讀取順序 + subagent 批次審查迴圈。原本的 Step 4（通知）不變但改編號。新增 Step 5（feedback）。

**Files:**
- Modify: `skills/x-engagement/SKILL.md`

- [ ] **Step 1: 重寫 Step 3（Curate）**

在 `skills/x-engagement/SKILL.md` 中，找到整個 `### Step 3 — Curate` section（從 `### Step 3 — Curate` 到 `### Step 4 — Notify User` 之前），替換為：

```markdown
### Step 3 — Curate and Review

#### 3a. Read quality resources (mandatory, in this order)

Before drafting anything, read ALL of the following:

1. `{workspace}/social-style-guide.md` → **Persona** section. If it contains placeholder text ("Not yet defined"), stop and guide the user to set up their Persona before continuing (see Prerequisites guidance below).
2. `{workspace}/social-style-guide.md` → **Voice**, **Anti-Patterns**, **Good/Bad Examples** sections (skip any that are still placeholder)
3. `${CLAUDE_SKILL_DIR}/../post-writing/references/post-rules.md` → prohibited patterns, quality requirements
4. `${CLAUDE_SKILL_DIR}/references/engagement-rules.md` → curation criteria (what to engage with, action type, quantity)

**Persona setup guidance:** Read `writing.config.md` About + Writing Goals as a starting point. Ask the user one question at a time in ghostwriter mode:
- What is your identity on social media? (engineer, team account, founder...)
- What is your core expertise? (what you actually build/do)
- What image do you want to project? (practitioner, observer, educator...)
- Who is "I" in your posts? (first person individual vs. team "we")
Synthesize answers into a Persona paragraph, confirm with user, write to social-style-guide.md.

#### 3b. Select candidates and draft

Read `{workspace}/engagement/candidates.yaml` and combine with internal context:
- Recent articles from `{workspace}/articles/` (scan titles and briefs from the past 2 weeks)
- Recent posts from `{workspace}/posts/` (past 2 weeks)
- Pending ideas from `{workspace}/ideas.md`
- Agent working memory (if available)

For each candidate worth engaging:

1. **Decide action type**: reply, quote, retweet, like, or post (see engagement-rules.md)
2. **Draft copy** (for reply/quote/post actions): Write 3 versions. Every version must:
   - Sound like the person described in Persona (not a generic AI assistant)
   - Include concrete details from your actual experience (project names, numbers, specific tools)
   - Avoid all prohibited patterns from post-rules.md
   - Not resemble any Bad Example in social-style-guide.md

#### 3c. Automated review loop (max 3 rounds)

Dispatch an **engagement-reviewer subagent** to batch-review all drafts. See [engagement-reviewer-prompt.md](engagement-reviewer-prompt.md) for the dispatch template.

Provide the subagent with:
- All recommended items + all their draft versions
- `${CLAUDE_SKILL_DIR}/../post-writing/references/post-rules.md`
- `{workspace}/social-style-guide.md`
- Each item's original tweet content

**After subagent returns:**
- **All versions pass** → proceed to 3d
- **Some versions fail** → rewrite only the failed versions using the subagent's specific feedback, then dispatch the subagent again with only the rewritten versions
- **After 3 rounds, some still fail** → mark those items with `⚠️` in the notification (Step 4) to warn the user the draft quality is uncertain

#### 3d. Write to inbox

Use `bun scripts/add.ts` to write each recommendation to inbox (same as before):

```bash
cd ${CLAUDE_SKILL_DIR} && bun scripts/add.ts \
  --url "https://x.com/user/status/123" \
  --action reply \
  --drafts "Version A text" "Version B text" "Version C text" \
  --reason "Why this tweet is worth engaging" \
  --inbox {workspace}/engagement/inbox.yaml
```

For retweet/like actions (no drafts needed):

```bash
cd ${CLAUDE_SKILL_DIR} && bun scripts/add.ts \
  --url "https://x.com/user/status/123" \
  --action like \
  --reason "Why this tweet is worth liking" \
  --inbox {workspace}/engagement/inbox.yaml
```

After adding all items, update `author` and `content` fields in `{workspace}/engagement/inbox.yaml` for each newly added item (the add script creates placeholder values; fill them from candidates.yaml data).

**Quantity target:** 2-5 recommendations per day (quality over quantity).
```

- [ ] **Step 2: Step 4（Notify User）不改內容，只確認編號正確**

`### Step 4 — Notify User` 內容不變。確認它仍然在 Step 3 之後。

- [ ] **Step 3: 在 Step 4 之後、`## Inbox Management` 之前，新增 Step 5**

找到 `## Inbox Management` 行，在其前面插入：

```markdown
### Step 5 — User Feedback (Optional)

After the user receives the notification (Step 4), they may provide feedback on drafts before executing.

**Skip this step if:** the user proceeds directly to copy-paste and execute without commenting on draft quality.

#### Negative feedback

1. User points out which version is bad and why (e.g., "Version A sounds like a consultant, not like us")
2. Rewrite the rejected version based on the feedback
3. Present the new version for confirmation
4. Once confirmed, follow the feedback extraction process defined in `${CLAUDE_SKILL_DIR}/../post-writing/references/feedback-extraction-format.md`:
   - `before`: the original rejected draft
   - `after`: the confirmed rewrite
   - `reason`: the user's stated reason
   - `source`: `"engagement"`
5. Present extracted patterns to the user for confirmation
6. Write confirmed patterns to `{workspace}/social-style-guide.md` — replace placeholder text if the target section still has it, otherwise append
7. Update the draft in `{workspace}/engagement/inbox.yaml`

#### Positive feedback

1. User marks a version as good (e.g., "Version C is great")
2. If the user explains why, record the reason
3. Follow the feedback extraction process defined in `${CLAUDE_SKILL_DIR}/../post-writing/references/feedback-extraction-format.md`:
   - `before`: "" (empty — no bad version for positive feedback)
   - `after`: the praised version
   - `reason`: the user's explanation (if any)
   - `source`: `"engagement"`
4. Present extracted patterns to the user for confirmation
5. Write confirmed patterns to `{workspace}/social-style-guide.md`

#### Commit (if any patterns were extracted)

```bash
git add {workspace}/social-style-guide.md {workspace}/engagement/inbox.yaml
git commit -m "style: extract engagement feedback patterns"
```

If the workspace is an absolute path, run git commands from the workspace directory. Skip if not a git repository.

```

- [ ] **Step 4: 更新 Reference section**

在 SKILL.md 底部的 `## Reference` section，找到：

```markdown
- Engagement rules: [engagement-rules.md](references/engagement-rules.md)
- Design spec: [x-engagement-design.md](../../docs/superpowers/specs/2026-03-30-x-engagement-design.md)
```

替換為：

```markdown
- Engagement rules: [engagement-rules.md](references/engagement-rules.md)
- Engagement reviewer prompt: [engagement-reviewer-prompt.md](engagement-reviewer-prompt.md)
- Feedback extraction format: [feedback-extraction-format.md](../post-writing/references/feedback-extraction-format.md)
- Post writing rules: [post-rules.md](../post-writing/references/post-rules.md)
- Design spec: [x-engagement-design.md](../../docs/superpowers/specs/2026-03-30-x-engagement-design.md)
```

- [ ] **Step 5: Commit**

```bash
git add skills/x-engagement/SKILL.md
git commit -m "feat(x-engagement): add quality review loop and feedback step to SKILL.md"
```

---

### Task 7: post-writing SKILL.md — Step 3 強化 + Step 6 改用 shared reference

**說明：** Step 3 加入強制讀取順序（跟 x-engagement 一致）。Step 6 從內建邏輯改為遵循 shared feedback-extraction-format.md reference（agent 自己執行，不 dispatch subagent）。

**Files:**
- Modify: `skills/post-writing/SKILL.md`

- [ ] **Step 1: 強化 Step 3 的讀取指示**

在 `skills/post-writing/SKILL.md` 中，找到 Step 3 開頭：

```markdown
### Step 3: Write Draft

Read the post writing rules from `${CLAUDE_SKILL_DIR}/references/post-rules.md`.

Write the complete post:
- Follow the social style guide's Voice, Structure, Rhetorical Patterns (if populated)
- If the style guide is mostly empty, fall back to `writing.config.md` → `## Writing Style`
```

替換為：

```markdown
### Step 3: Write Draft

**Read quality resources (mandatory, in this order):**

1. `{workspace}/social-style-guide.md` → **Persona** section. If it contains placeholder text ("Not yet defined"), guide the user to set up their Persona before continuing — read `writing.config.md` About + Writing Goals, then ask about social identity, expertise, image, and voice (one question at a time, ghostwriter mode). Write confirmed Persona to social-style-guide.md.
2. `{workspace}/social-style-guide.md` → **Voice**, **Anti-Patterns**, **Good/Bad Examples** sections (skip any that are still placeholder — fall back to `writing.config.md` → `## Writing Style` for general voice guidance)
3. `${CLAUDE_SKILL_DIR}/references/post-rules.md` → prohibited patterns, quality requirements

Write the complete post:
```

其餘 Step 3 內容（character limits、threads、article-derived、standalone、commit 等）保持不變。

- [ ] **Step 2: 重寫 Step 6 使用 shared reference**

在 `skills/post-writing/SKILL.md` 中，找到整個 `### Step 6: Style Feedback Extraction (Optional)` section（從 `### Step 6` 到 `## Output` 之前），替換為：

```markdown
### Step 6: Style Feedback Extraction (Optional)

If the author made changes during Step 5 (editing the post before confirming), check for patterns worth recording.

**Skip this step if:** the author approved the post as-is after review, or the changes were minor wording tweaks (fewer than 3 words changed total).

Follow the feedback extraction process defined in [feedback-extraction-format.md](references/feedback-extraction-format.md):

- `before`: the post content as written in Step 3 (before author edits)
- `after`: the post content after author edits (the confirmed version)
- `reason`: "" (inferred from diff — analyze the changes to determine why)
- `source`: `"post"`

Read `{workspace}/social-style-guide.md` and `${CLAUDE_SKILL_DIR}/references/post-rules.md` to understand existing patterns before extracting.

If no patterns found:
> No repeatable patterns found in your edits.

If patterns found, present in ghostwriter mode:

> Here are some patterns from your edits that could improve future posts:
>
> 1. {Pattern name}
>    - Before: "{bad example}"
>    - After: "{good example}"
>    - → Suggested for: {target section in social-style-guide.md}
>
> Would you like to add any of these to your social style guide?

Author confirms. They can accept, adjust, or skip each pattern.

Apply confirmed patterns to `{workspace}/social-style-guide.md`. If a section still has its placeholder text, replace the placeholder with the new content. If the section already has content, append.

Commit if any changes were made:

```
git add {workspace}/social-style-guide.md
git commit -m "style: extract social writing patterns from {slug}"
```

If the workspace is an absolute path, run git commands from the workspace directory. Skip if not a git repository.
```

- [ ] **Step 3: 更新 Reference section**

在 SKILL.md 底部的 `## Reference` section，找到：

```markdown
- Post format: [post-format.md](references/post-format.md)
- Post writing rules: [post-rules.md](references/post-rules.md)
- Post reviewer prompt: [post-reviewer-prompt.md](post-reviewer-prompt.md)
- Translation rules: [translation-rules.md](../article-translation/references/translation-rules.md)
```

替換為：

```markdown
- Post format: [post-format.md](references/post-format.md)
- Post writing rules: [post-rules.md](references/post-rules.md)
- Post reviewer prompt: [post-reviewer-prompt.md](post-reviewer-prompt.md)
- Feedback extraction format: [feedback-extraction-format.md](references/feedback-extraction-format.md)
- Translation rules: [translation-rules.md](../article-translation/references/translation-rules.md)
```

- [ ] **Step 4: Commit**

```bash
git add skills/post-writing/SKILL.md
git commit -m "feat(post-writing): enforce quality resource reading order and use shared feedback extraction"
```
