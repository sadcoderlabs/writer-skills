# skills-zhtw 繁體中文版 Skills 設計規格

## 背景與動機

Skills 是大量的文字內容，作者的中文能力優於英文，以中文為主要工作語言能更有效地 review 和發現問題。目前 `skills/` 目錄全為英文，需要建立一個繁體中文版本作為日常工作的 source of truth，英文版則由中文翻譯產出。

## 目錄結構

### 平行目錄方案

新增 `skills-zhtw/` 目錄，完整鏡像 `skills/` 的結構：

```
skills-zhtw/
├── article-preparation/
│   ├── SKILL.md
│   ├── topic-researcher-prompt.md
│   ├── assets/
│   │   └── brief-template.md
│   └── references/
│       └── brief-format.md
├── article-translation/
│   ├── SKILL.md
│   └── references/
│       ├── translation-rules.md
│       └── translation-review-prompt.md
├── article-writing/
│   ├── SKILL.md
│   ├── fact-check-reviewer-prompt.md
│   ├── writing-reviewer-prompt.md
│   └── references/
│       └── writing-rules.md
├── post-writing/
│   ├── SKILL.md
│   ├── post-reviewer-prompt.md
│   └── references/
│       ├── feedback-extraction-format.md
│       ├── post-format.md
│       └── post-rules.md
├── writing-management/
│   ├── SKILL.md
│   ├── assets/
│   │   ├── config-template.md
│   │   ├── ideas-template.md
│   │   ├── profile-template.md
│   │   └── social-style-guide-template.md
│   └── references/
│       ├── config-format.md
│       ├── ideas-format.md
│       └── profile-format.md
└── x-engagement/
    ├── SKILL.md
    ├── engagement-reviewer-prompt.md
    ├── package.json              ← 原封複製
    ├── tsconfig.json             ← 原封複製
    ├── bun.lock                  ← 原封複製
    ├── references/
    │   ├── engagement-rules.md
    │   └── experience-verification.md
    └── scripts/                  ← 整個目錄原封複製（含 lib/、test）
```

### 不包含的項目

- `node_modules/` — 由套件管理工具產生，不複製
- `reference/blog-writing/` — Bernard 的 reference implementation，不屬於 skill 系統

## 翻譯規則

| 內容類型 | 處理方式 |
|---------|---------|
| 自然語言說明 | 翻成繁體中文 |
| Markdown heading（`## Step 1:`） | 翻成中文（`## 步驟一：`） |
| YAML frontmatter key（`name`、`description`） | key 保持英文，value 翻成中文 |
| 程式碼範例中的路徑、變數名 | 保持英文 |
| 程式碼範例中的自然語言註解 | 翻成中文 |
| TypeScript 原始碼 | 不翻譯，原封複製 |
| 設定檔（package.json 等） | 不翻譯，原封複製 |

## Source of Truth 與同步方向

```
skills-zhtw/  ──(翻譯)──>  skills/
 (中文 SoT)                (英文對外版)
```

- **日常修改**：只改 `skills-zhtw/`
- **同步到英文**：改完一批後，用 `git diff skills-zhtw/` 看變更範圍，對應翻譯到 `skills/`
- **禁止反向改**：不直接修改 `skills/` 的 `.md` 內容（程式碼例外）

### 同步流程（中文 → 英文）

1. 在 `skills-zhtw/` 完成所有修改並 commit
2. 用 `git diff <last-sync-commit>..HEAD -- skills-zhtw/` 確認變更範圍
3. 對每個有變動的 `.md` 檔，翻譯對應的變更到 `skills/` 的同名檔案
4. Commit 英文版更新

### 程式碼變更的例外

`x-engagement/scripts/` 裡的 TypeScript 程式碼兩邊都有一份。程式碼修改時：

- 在 `skills-zhtw/x-engagement/scripts/` 裡改
- 直接把改過的檔案複製到 `skills/x-engagement/scripts/`（程式碼不需翻譯）

## 初次翻譯的執行策略

### 執行方式：先複製再翻譯

對每個 skill，執行兩步：

1. **複製** — 把 `skills/{skill}/` 整個目錄複製到 `skills-zhtw/{skill}/`，然後 `git add` 加入 staged
2. **翻譯** — 逐檔翻譯 `.md` 檔案（非 `.md` 不動），翻完後再 `git add` 更新 staged

這個做法的好處：
- 可用 `git diff --staged` 精確看到每段從英文變成中文的完整 diff
- 避免 LLM 在翻譯時意外總結或刪減內容
- 每個翻譯變更都有明確的追蹤

### 處理順序

按複雜度由低到高，讓前面的 skill 建立翻譯術語一致性：

1. `article-translation`（3 個 `.md`，最少檔案）
2. `article-preparation`（4 個 `.md`）
3. `writing-management`（8 個 `.md`）
4. `article-writing`（4 個 `.md`，但 SKILL.md 最大，284 行）
5. `post-writing`（5 個 `.md`）
6. `x-engagement`（4 個 `.md` + 程式碼與設定檔複製）

### 檢查點

每個 skill 翻完後暫停讓作者確認：
- 用 `git diff --staged` 檢查翻譯品質
- 有問題就回饋調整
- 確認後再進入下一個 skill

## CLAUDE.md 更新

在 CLAUDE.md 中加入：
- `skills-zhtw/` 目錄的用途說明
- 標明 `skills-zhtw/` 是 source of truth
- 語言慣例更新：`skills-zhtw/` 目錄使用繁體中文
