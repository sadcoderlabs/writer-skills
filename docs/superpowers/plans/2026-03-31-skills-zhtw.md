# skills-zhtw 繁體中文版翻譯 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 建立 `skills-zhtw/` 目錄，將所有 skill 的 `.md` 檔案翻譯成繁體中文，作為日常工作的 source of truth。

**Architecture:** 平行目錄方案 — `skills-zhtw/` 鏡像 `skills/` 的完整結構。每個 skill 先複製英文版再逐檔翻譯，利用 git staging 追蹤翻譯差異。

**Spec:** `docs/superpowers/specs/2026-03-31-skills-zhtw-design.md`

---

## 翻譯規則（所有 Task 共用）

每個 `.md` 檔案翻譯時遵守以下規則：

| 內容類型 | 處理方式 |
|---------|---------|
| 自然語言說明 | 翻成繁體中文 |
| Markdown heading（`## Step 1:`） | 翻成中文（`## 步驟一：`） |
| YAML frontmatter key（`name`、`description`） | key 保持英文，value 翻成中文 |
| 程式碼範例中的路徑、變數名 | 保持英文 |
| 程式碼範例中的自然語言註解 | 翻成中文 |

**重要：翻譯必須保留原文的完整結構和所有內容，不得總結或刪減。**

## Git 工作流程（所有 Task 共用）

每個 skill 的處理流程：

1. 複製 `skills/{skill}/` 到 `skills-zhtw/{skill}/`
2. `git add skills-zhtw/{skill}/` — 將英文版加入 staged
3. 逐檔翻譯 `.md` 檔案（非 `.md` 檔不動）
4. 翻譯完成後通知使用者，使用者用 `git diff` 檢查翻譯品質
5. 使用者確認後 `git add` 並 commit

---

### Task 1: article-translation

最少檔案的 skill（3 個 `.md`），用來建立翻譯術語基準。

**Files:**
- Create: `skills-zhtw/article-translation/SKILL.md`（翻譯）
- Create: `skills-zhtw/article-translation/references/translation-rules.md`（翻譯）
- Create: `skills-zhtw/article-translation/references/translation-review-prompt.md`（翻譯）

- [ ] **Step 1: 複製目錄**

```bash
cp -r skills/article-translation skills-zhtw/article-translation
```

- [ ] **Step 2: Stage 英文版**

```bash
git add skills-zhtw/article-translation/
```

- [ ] **Step 3: 翻譯 SKILL.md**

讀取 `skills-zhtw/article-translation/SKILL.md`，將所有自然語言內容翻譯成繁體中文。Frontmatter key 保持英文，value 翻成中文。Heading 翻成中文。程式碼範例中的路徑和變數名保持英文。

- [ ] **Step 4: 翻譯 references/translation-rules.md**

讀取 `skills-zhtw/article-translation/references/translation-rules.md`，翻譯所有自然語言內容。

- [ ] **Step 5: 翻譯 references/translation-review-prompt.md**

讀取 `skills-zhtw/article-translation/references/translation-review-prompt.md`，翻譯所有自然語言內容。

- [ ] **Step 6: 檢查點 — 使用者 review**

通知使用者此 skill 翻譯完成。使用者執行：

```bash
git diff -- skills-zhtw/article-translation/
```

確認每段翻譯正確、無遺漏、無意外總結。使用者確認後：

```bash
git add skills-zhtw/article-translation/
git commit -m "feat(skills-zhtw): 翻譯 article-translation skill"
```

---

### Task 2: article-preparation

4 個 `.md` 檔案，含 1 個 asset template。

**Files:**
- Create: `skills-zhtw/article-preparation/SKILL.md`（翻譯）
- Create: `skills-zhtw/article-preparation/topic-researcher-prompt.md`（翻譯）
- Create: `skills-zhtw/article-preparation/assets/brief-template.md`（翻譯）
- Create: `skills-zhtw/article-preparation/references/brief-format.md`（翻譯）

- [ ] **Step 1: 複製目錄**

```bash
cp -r skills/article-preparation skills-zhtw/article-preparation
```

- [ ] **Step 2: Stage 英文版**

```bash
git add skills-zhtw/article-preparation/
```

- [ ] **Step 3: 翻譯 SKILL.md**

讀取 `skills-zhtw/article-preparation/SKILL.md`，翻譯所有自然語言內容。

- [ ] **Step 4: 翻譯 topic-researcher-prompt.md**

讀取 `skills-zhtw/article-preparation/topic-researcher-prompt.md`，翻譯所有自然語言內容。

- [ ] **Step 5: 翻譯 assets/brief-template.md**

讀取 `skills-zhtw/article-preparation/assets/brief-template.md`，翻譯所有自然語言內容。Template 中的 placeholder 和欄位名稱保持英文。

- [ ] **Step 6: 翻譯 references/brief-format.md**

讀取 `skills-zhtw/article-preparation/references/brief-format.md`，翻譯所有自然語言內容。

- [ ] **Step 7: 檢查點 — 使用者 review**

通知使用者此 skill 翻譯完成。使用者執行：

```bash
git diff -- skills-zhtw/article-preparation/
```

確認後：

```bash
git add skills-zhtw/article-preparation/
git commit -m "feat(skills-zhtw): 翻譯 article-preparation skill"
```

---

### Task 3: writing-management

最多 `.md` 檔案的 skill（8 個），含 4 個 asset template 和 3 個 reference。

**Files:**
- Create: `skills-zhtw/writing-management/SKILL.md`（翻譯）
- Create: `skills-zhtw/writing-management/assets/config-template.md`（翻譯）
- Create: `skills-zhtw/writing-management/assets/ideas-template.md`（翻譯）
- Create: `skills-zhtw/writing-management/assets/profile-template.md`（翻譯）
- Create: `skills-zhtw/writing-management/assets/social-style-guide-template.md`（翻譯）
- Create: `skills-zhtw/writing-management/references/config-format.md`（翻譯）
- Create: `skills-zhtw/writing-management/references/ideas-format.md`（翻譯）
- Create: `skills-zhtw/writing-management/references/profile-format.md`（翻譯）

- [ ] **Step 1: 複製目錄**

```bash
cp -r skills/writing-management skills-zhtw/writing-management
```

- [ ] **Step 2: Stage 英文版**

```bash
git add skills-zhtw/writing-management/
```

- [ ] **Step 3: 翻譯 SKILL.md**

讀取 `skills-zhtw/writing-management/SKILL.md`，翻譯所有自然語言內容。

- [ ] **Step 4: 翻譯 assets/config-template.md**

讀取 `skills-zhtw/writing-management/assets/config-template.md`，翻譯所有自然語言內容。

- [ ] **Step 5: 翻譯 assets/ideas-template.md**

讀取 `skills-zhtw/writing-management/assets/ideas-template.md`，翻譯所有自然語言內容。

- [ ] **Step 6: 翻譯 assets/profile-template.md**

讀取 `skills-zhtw/writing-management/assets/profile-template.md`，翻譯所有自然語言內容。

- [ ] **Step 7: 翻譯 assets/social-style-guide-template.md**

讀取 `skills-zhtw/writing-management/assets/social-style-guide-template.md`，翻譯所有自然語言內容。

- [ ] **Step 8: 翻譯 references/config-format.md**

讀取 `skills-zhtw/writing-management/references/config-format.md`，翻譯所有自然語言內容。

- [ ] **Step 9: 翻譯 references/ideas-format.md**

讀取 `skills-zhtw/writing-management/references/ideas-format.md`，翻譯所有自然語言內容。

- [ ] **Step 10: 翻譯 references/profile-format.md**

讀取 `skills-zhtw/writing-management/references/profile-format.md`，翻譯所有自然語言內容。

- [ ] **Step 11: 檢查點 — 使用者 review**

通知使用者此 skill 翻譯完成。使用者執行：

```bash
git diff -- skills-zhtw/writing-management/
```

確認後：

```bash
git add skills-zhtw/writing-management/
git commit -m "feat(skills-zhtw): 翻譯 writing-management skill"
```

---

### Task 4: article-writing

4 個 `.md` 檔案，其中 SKILL.md 是所有 skill 中最大的（284 行）。

**Files:**
- Create: `skills-zhtw/article-writing/SKILL.md`（翻譯）
- Create: `skills-zhtw/article-writing/fact-check-reviewer-prompt.md`（翻譯）
- Create: `skills-zhtw/article-writing/writing-reviewer-prompt.md`（翻譯）
- Create: `skills-zhtw/article-writing/references/writing-rules.md`（翻譯）

- [ ] **Step 1: 複製目錄**

```bash
cp -r skills/article-writing skills-zhtw/article-writing
```

- [ ] **Step 2: Stage 英文版**

```bash
git add skills-zhtw/article-writing/
```

- [ ] **Step 3: 翻譯 SKILL.md**

讀取 `skills-zhtw/article-writing/SKILL.md`，翻譯所有自然語言內容。這是最大的檔案（284 行），注意不要遺漏任何段落。

- [ ] **Step 4: 翻譯 fact-check-reviewer-prompt.md**

讀取 `skills-zhtw/article-writing/fact-check-reviewer-prompt.md`，翻譯所有自然語言內容。

- [ ] **Step 5: 翻譯 writing-reviewer-prompt.md**

讀取 `skills-zhtw/article-writing/writing-reviewer-prompt.md`，翻譯所有自然語言內容。

- [ ] **Step 6: 翻譯 references/writing-rules.md**

讀取 `skills-zhtw/article-writing/references/writing-rules.md`，翻譯所有自然語言內容。

- [ ] **Step 7: 檢查點 — 使用者 review**

通知使用者此 skill 翻譯完成。使用者執行：

```bash
git diff -- skills-zhtw/article-writing/
```

確認後：

```bash
git add skills-zhtw/article-writing/
git commit -m "feat(skills-zhtw): 翻譯 article-writing skill"
```

---

### Task 5: post-writing

5 個 `.md` 檔案，含 3 個 reference。

**Files:**
- Create: `skills-zhtw/post-writing/SKILL.md`（翻譯）
- Create: `skills-zhtw/post-writing/post-reviewer-prompt.md`（翻譯）
- Create: `skills-zhtw/post-writing/references/feedback-extraction-format.md`（翻譯）
- Create: `skills-zhtw/post-writing/references/post-format.md`（翻譯）
- Create: `skills-zhtw/post-writing/references/post-rules.md`（翻譯）

- [ ] **Step 1: 複製目錄**

```bash
cp -r skills/post-writing skills-zhtw/post-writing
```

- [ ] **Step 2: Stage 英文版**

```bash
git add skills-zhtw/post-writing/
```

- [ ] **Step 3: 翻譯 SKILL.md**

讀取 `skills-zhtw/post-writing/SKILL.md`，翻譯所有自然語言內容。

- [ ] **Step 4: 翻譯 post-reviewer-prompt.md**

讀取 `skills-zhtw/post-writing/post-reviewer-prompt.md`，翻譯所有自然語言內容。

- [ ] **Step 5: 翻譯 references/feedback-extraction-format.md**

讀取 `skills-zhtw/post-writing/references/feedback-extraction-format.md`，翻譯所有自然語言內容。

- [ ] **Step 6: 翻譯 references/post-format.md**

讀取 `skills-zhtw/post-writing/references/post-format.md`，翻譯所有自然語言內容。

- [ ] **Step 7: 翻譯 references/post-rules.md**

讀取 `skills-zhtw/post-writing/references/post-rules.md`，翻譯所有自然語言內容。

- [ ] **Step 8: 檢查點 — 使用者 review**

通知使用者此 skill 翻譯完成。使用者執行：

```bash
git diff -- skills-zhtw/post-writing/
```

確認後：

```bash
git add skills-zhtw/post-writing/
git commit -m "feat(skills-zhtw): 翻譯 post-writing skill"
```

---

### Task 6: x-engagement

4 個 `.md` 需翻譯，另有程式碼與設定檔需原封複製。此 skill 有 `scripts/` 目錄（TypeScript）和 `package.json` 等設定檔，這些不翻譯。

**Files:**
- Create: `skills-zhtw/x-engagement/SKILL.md`（翻譯）
- Create: `skills-zhtw/x-engagement/engagement-reviewer-prompt.md`（翻譯）
- Create: `skills-zhtw/x-engagement/references/engagement-rules.md`（翻譯）
- Create: `skills-zhtw/x-engagement/references/experience-verification.md`（翻譯）
- Copy as-is: `skills-zhtw/x-engagement/package.json`
- Copy as-is: `skills-zhtw/x-engagement/tsconfig.json`
- Copy as-is: `skills-zhtw/x-engagement/bun.lock`
- Copy as-is: `skills-zhtw/x-engagement/scripts/`（整個目錄）

**注意：** `node_modules/` 不複製。複製後需在 `skills-zhtw/x-engagement/` 執行 `bun install` 以產生 `node_modules/`。

- [ ] **Step 1: 複製目錄（排除 node_modules）**

```bash
rsync -av --exclude='node_modules' skills/x-engagement/ skills-zhtw/x-engagement/
```

- [ ] **Step 2: Stage 英文版**

```bash
git add skills-zhtw/x-engagement/
```

- [ ] **Step 3: 翻譯 SKILL.md**

讀取 `skills-zhtw/x-engagement/SKILL.md`，翻譯所有自然語言內容。這是第二大的 SKILL.md（328 行）。

- [ ] **Step 4: 翻譯 engagement-reviewer-prompt.md**

讀取 `skills-zhtw/x-engagement/engagement-reviewer-prompt.md`，翻譯所有自然語言內容。

- [ ] **Step 5: 翻譯 references/engagement-rules.md**

讀取 `skills-zhtw/x-engagement/references/engagement-rules.md`，翻譯所有自然語言內容。

- [ ] **Step 6: 翻譯 references/experience-verification.md**

讀取 `skills-zhtw/x-engagement/references/experience-verification.md`，翻譯所有自然語言內容。

- [ ] **Step 7: 安裝相依套件**

```bash
cd skills-zhtw/x-engagement && bun install
```

- [ ] **Step 8: 檢查點 — 使用者 review**

通知使用者此 skill 翻譯完成。使用者執行：

```bash
git diff -- skills-zhtw/x-engagement/
```

確認後：

```bash
git add skills-zhtw/x-engagement/
git commit -m "feat(skills-zhtw): 翻譯 x-engagement skill"
```

---

### Task 7: 更新 CLAUDE.md

所有 skill 翻譯完成後，更新 CLAUDE.md 以反映新的雙語結構。

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: 更新 Architecture 段落**

在 Architecture 段落中每個 skill 的描述後方加入 `skills-zhtw/` 的對應路徑。在段落開頭加入說明：

```markdown
Each skill exists in two languages:
- `skills/` — English (published version, translated from Chinese)
- `skills-zhtw/` — Traditional Chinese (source of truth, where all edits happen)
```

- [ ] **Step 2: 更新 Language Convention 段落**

將現有的 Language Convention 段落更新為：

```markdown
## Language Convention

- `skills-zhtw/` directory (SKILL.md, references, assets, templates): Traditional Chinese (繁體中文) — **source of truth**
- `skills/` directory (SKILL.md, references, assets, templates): English — translated from `skills-zhtw/`
- `docs/` directory (specs, plans): Traditional Chinese (繁體中文)
```

- [ ] **Step 3: 新增 Sync Workflow 段落**

在 Language Convention 後方新增段落：

```markdown
## Sync Workflow (skills-zhtw → skills)

`skills-zhtw/` is the source of truth. All `.md` edits happen there first.

To sync changes to the English `skills/` directory:
1. Complete all changes in `skills-zhtw/` and commit
2. Run `git diff <last-sync-commit>..HEAD -- skills-zhtw/` to identify changed files
3. Translate corresponding changes to `skills/`
4. Commit the English updates

Exception: TypeScript code in `x-engagement/scripts/` is edited in `skills-zhtw/` and copied directly to `skills/` (no translation needed).
```

- [ ] **Step 4: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: 更新 CLAUDE.md 反映 skills-zhtw source of truth 結構"
```
