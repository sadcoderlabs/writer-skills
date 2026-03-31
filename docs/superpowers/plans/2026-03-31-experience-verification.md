# Experience Verification 實作計畫

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在 x-engagement 技能加入經驗查核機制，防止 agent 草擬聲稱團隊沒有的經驗的回覆。

**Architecture:** 兩層查核：(1) Step 2 強制讀取工作記憶作為搜尋 context，(2) Step 3b 草擬前經驗分類。加上 Step 3c 審查安全網。新增一份 reference doc 定義分類標準。

**Tech Stack:** Markdown skill definitions following the Agent Skills open standard. No executable code.

**Design spec:** `docs/superpowers/specs/2026-03-31-experience-verification-design.md`

---

## File Structure

### 新建檔案

| 檔案 | 職責 |
|------|------|
| `skills/x-engagement/references/experience-verification.md` | 經驗等級定義、分類流程、範例。供 Step 3b 草擬前分類和 Step 3c 審查時參考 |

### 修改檔案

| 檔案 | 改動 |
|------|------|
| `skills/x-engagement/SKILL.md` | Step 2 強制記憶讀取、Step 3a 加入 experience-verification.md、Step 3b 加入經驗分類子步驟 |
| `skills/x-engagement/engagement-reviewer-prompt.md` | 「What to Check」表格加入 Experience authenticity 列 |

---

### Task 1: 建立 `references/experience-verification.md`

**說明：** 定義四個經驗等級和分類流程，作為 SKILL.md 修改的基礎文件。

**Files:**
- Create: `skills/x-engagement/references/experience-verification.md`

- [ ] **Step 1: 建立 experience-verification.md**

```markdown
# Experience Verification

Rules for classifying the team's experience level against a candidate tweet's topic. This classification determines the draft angle — the agent must never claim experience it doesn't have.

## Experience Levels

| Level | Definition | Evidence | Draft Action |
|-------|-----------|----------|-------------|
| **Direct** | The team has built, used, or shipped this specific thing | Memory contains specific project/tool usage records, or workspace has related articles/posts | Draft normally with first-person experience claims |
| **Adjacent** | The team has done something similar but with a different approach | Memory or workspace has related but not identical experience | Draft honestly: "We use Y to achieve something similar", "Different mechanism but same idea" |
| **Inverse** | The team evaluated this or chose not to use it, with specific reasons | Memory contains deliberate decisions against this tool/approach | Share the reasoning: "We went a different route because...", "We chose not to use X, here's why" |
| **None** | The team has no practical experience with this topic | No related records found in memory or workspace | Downgrade to like or skip. Do not draft replies claiming experience |

## Classification Process

1. Read the past week of working memory + recent workspace content (articles, posts from the past 2 weeks)
2. For each candidate tweet, ask: "What have we specifically done related to this topic?"
3. Classify based on the evidence found
4. No evidence found → default to **None**

## How Each Level Shapes the Draft

### Direct

You have firsthand experience. Name the project, tool, or number.

> "We built our skill system this way — drop a SKILL.md file, agent reads it next session."

### Adjacent

You did something related but differently. Be explicit about the difference.

> "We distribute agent skills as markdown files too, different mechanism but same idea — drop a file, agent picks it up."

### Inverse

You deliberately chose not to do this. Share the reasoning — this is often the most valuable reply.

> "We evaluated MCP for skill distribution but went with plain markdown files instead. The tradeoff for us was [reason]."

### None

No experience to draw from. Downgrade the action:
- Reply/quote → like (if the content is still worth endorsing)
- Reply/quote → skip (if the content is only interesting to reply to, not to like)

## Example: MCP Skill Distribution Tweet

- **Tweet topic:** MCP for skill distribution
- **Memory check:** Team uses markdown skill files distributed as plain files, not via MCP
- **Classification:** Inverse (the team does skill distribution but chose a non-MCP approach)
- **Correct angle:** "We distribute agent skills as markdown files too, different mechanism but same idea — drop a file, agent picks it up. We went without MCP because [reason]."
- **Wrong angle:** ~~"We ship skills via MCP in OpenClaw"~~ (fabricates direct experience)
```

- [ ] **Step 2: Commit**

```bash
git add skills/x-engagement/references/experience-verification.md
git commit -m "feat(x-engagement): 新增經驗查核參考文件"
```

---

### Task 2: 修改 SKILL.md — Step 2 強制記憶讀取

**說明：** 把 Step 2 的條件式記憶備註改為強制指示。agent 在跑 discover.ts 之前必須讀取近一週工作記憶。

**Files:**
- Modify: `skills/x-engagement/SKILL.md:48-59` (Step 2 — Discover)

- [ ] **Step 1: 替換 Step 2 的 "Before running" 段落**

目前內容：

```markdown
**Before running:** If you have access to working memory or recent context, share relevant supplementary keywords with the script (the agent reads candidates.yaml afterward and applies context during curation).
```

替換為：

```markdown
**Before running:** Read the past week of working memory (MEMORY.md, recent conversation context). Extract supplementary keywords reflecting what the team is currently building, using, or discussing. Carry this context when interpreting and filtering search results after the script runs. This is mandatory — the team's recent experience shapes which tweets are worth engaging with.
```

- [ ] **Step 2: Commit**

```bash
git add skills/x-engagement/SKILL.md
git commit -m "feat(x-engagement): Step 2 強制讀取工作記憶"
```

---

### Task 3: 修改 SKILL.md — Step 3a 加入 experience-verification.md

**說明：** 在 Step 3a 的必讀資源清單加入 experience-verification.md。

**Files:**
- Modify: `skills/x-engagement/SKILL.md:67-73` (Step 3a reading list)

- [ ] **Step 1: 在讀取清單的第 4 項後面加入第 5 項**

目前清單結尾：

```markdown
4. `${CLAUDE_SKILL_DIR}/references/engagement-rules.md` → curation criteria (what to engage with, action type, quantity)
```

在後面加入：

```markdown
5. `${CLAUDE_SKILL_DIR}/references/experience-verification.md` → experience level classification (determines draft angle per candidate)
```

- [ ] **Step 2: Commit**

```bash
git add skills/x-engagement/SKILL.md
git commit -m "feat(x-engagement): Step 3a 加入 experience-verification.md 必讀"
```

---

### Task 4: 修改 SKILL.md — Step 3b 加入經驗分類子步驟

**說明：** 在「For each candidate worth engaging」之前插入經驗分類指示，讓 agent 在草擬前先判斷經驗等級。

**Files:**
- Modify: `skills/x-engagement/SKILL.md:86-90` (Step 3b, before "For each candidate")

- [ ] **Step 1: 在「For each candidate worth engaging:」之前插入經驗分類段落**

在現有的「Read `{workspace}/engagement/candidates.yaml` and combine with internal context:」段落與「For each candidate worth engaging:」之間插入：

```markdown
**Classify experience per candidate (mandatory):** For each candidate tweet, determine your experience level following `references/experience-verification.md`. Check working memory and the workspace content you just gathered. Classify as Direct, Adjacent, Inverse, or None. This classification determines your draft angle — if None, downgrade the action to like or skip (do not draft a reply/quote).
```

- [ ] **Step 2: Commit**

```bash
git add skills/x-engagement/SKILL.md
git commit -m "feat(x-engagement): Step 3b 加入草擬前經驗分類"
```

---

### Task 5: 修改 engagement-reviewer-prompt.md — 加入經驗真實性檢查

**說明：** 在審查 checklist 的「What to Check」表格加入 Experience authenticity 列。

**Files:**
- Modify: `skills/x-engagement/engagement-reviewer-prompt.md:38-46` (What to Check table)

- [ ] **Step 1: 在表格最後一列 `Value add` 之後加入新列**

目前表格結尾：

```markdown
    | Value add | Does this reply/quote actually add something new to the conversation, or just agree/restate? |
```

在後面加入：

```markdown
    | Experience authenticity | Does the draft claim direct experience the team actually has? If the experience was classified as Adjacent or Inverse in Step 3b, does the draft honestly reflect that angle instead of inflating it to direct experience? Flag any fabricated or inflated claims. |
```

- [ ] **Step 2: Commit**

```bash
git add skills/x-engagement/engagement-reviewer-prompt.md
git commit -m "feat(x-engagement): 審查 checklist 加入經驗真實性檢查"
```

---

### Task 6: 更新 CLAUDE.md

**說明：** 如有需要，確認 CLAUDE.md 的 x-engagement 相關描述是否需要更新。檢查 Review Dispatch Model 段落和 Behavior Principles — 經驗查核屬於 SKILL.md 內部流程，CLAUDE.md 可能不需改動。

**Files:**
- Review: `CLAUDE.md`

- [ ] **Step 1: 讀取 CLAUDE.md，確認是否需要更新**

檢查重點：
- `## Behavior Principles` 或 `## Key Design Principles` 裡是否已有「Materials are sacred」— 如果有，經驗查核自然被涵蓋，不需額外說明
- 如果沒有相關描述，考慮在 x-engagement 的描述中加一句

如果不需改動，跳過此 task。

- [ ] **Step 2: 如有修改，commit**

```bash
git add CLAUDE.md
git commit -m "docs: 更新 CLAUDE.md 反映經驗查核機制"
```
