# Workspace 機制與 Config 改名設計

## 摘要

將 `config.md` 改名為 `writing.config.md`，加入 YAML frontmatter 提供 `workspace` 欄位，讓 skills 知道 writing 相關檔案放在 repo 的哪個目錄。同時在 `brief-template.md` 預留 Publishing 區塊，為未來 CMS 整合鋪路。

## 背景

目前 skills 假設 repo root 就是工作目錄——`config.md`、`ideas.md`、`articles/` 全部放在同一層。但如果使用者的 repo 是一個 Hugo 或 Astro 專案，repo root 已經有 CMS 的檔案結構，writing 的東西需要放在子目錄裡避免混淆。

我們需要一個機制讓 skills 知道「你的東西放在哪」，同時不影響非 CMS 使用者的體驗。

相關研究：[CMS 整合研究](../../research/2026-03-18-cms-integration.md)

## 設計

### 1. writing.config.md 格式

`config.md` 改名為 `writing.config.md`，固定放在 repo root。新增 YAML frontmatter，body 維持原有的三個區塊不變。

```markdown
---
workspace: writing
---

# Writing Plan

## About
{一段描述你是誰、你的願景}

## Writing Goals
{一段描述目標、受眾、語調}

## Writing Style
{散文描述，連結，或具體規則}
```

**Frontmatter 規則：**

- `workspace` 是唯一的欄位，值是相對於 repo root 的目錄路徑
- 如果省略 `workspace` 或值為空，預設為 `.`（repo root 就是 workspace）
- 路徑不帶前導 `/` 也不帶尾端 `/`，例如 `writing`、`content/drafts`

### 2. Workspace 目錄結構

`writing.config.md` 始終在 repo root。Workspace 目錄由 frontmatter 的 `workspace` 值決定，所有 writing 檔案（ideas.md、templates/、articles/）都在 workspace 目錄內。

**CMS 使用者（workspace 指向子目錄）：**

```
my-blog/                        # repo root
├── hugo.toml                   # CMS 檔案
├── content/posts/              # CMS content
├── writing.config.md           # workspace: writing
└── writing/                    # workspace 目錄
    ├── ideas.md
    ├── templates/brief-template.md
    └── articles/
        └── 2026-03-18_my-post/
            ├── article.md
            ├── brief.md
            ├── research.md
            ├── reviews/
            └── assets/
```

**非 CMS 使用者（workspace 預設為 repo root）：**

```
my-writing/                     # repo root = workspace
├── writing.config.md           # workspace 省略或為 "."
├── ideas.md
├── templates/brief-template.md
└── articles/
```

### 3. Skills 的 Workspace 解析

所有三個 skills 的起始邏輯統一為：

1. 在 repo root 找 `writing.config.md`
2. 讀取 frontmatter 的 `workspace` 值（沒有就用 `.`）
3. 後續所有路徑都基於 `{workspace}/`

具體影響：

| 原本的路徑 | 改動後的路徑 |
|-----------|------------|
| `config.md` | `writing.config.md`（固定在 repo root） |
| `ideas.md` | `{workspace}/ideas.md` |
| `templates/brief-template.md` | `{workspace}/templates/brief-template.md` |
| `articles/{date}_{slug}/` | `{workspace}/articles/{date}_{slug}/` |

### 4. 初始化流程的變化

Writing-management skill 的 Step 1（Initialize Workspace）改為：

1. 如果 `writing.config.md` 不存在，開始初始化
2. 問使用者：這個 repo 有其他用途嗎？要把 writing 檔案放在哪個目錄？
   - 如果使用者說不需要分開 → workspace 設為 `.`
   - 如果使用者指定目錄（如 `writing`）→ 設為該路徑
3. 在 repo root 建立 `writing.config.md`，frontmatter 寫入 workspace 值
4. 建立 workspace 目錄（如果不是 `.`）
5. 在 workspace 內建立 `ideas.md`、`templates/`、`articles/`

### 5. brief-template.md 的 Publishing 預留

在 brief template 的 Article Info 下方新增空的 Publishing 區塊：

```markdown
## Article Info
- Title:
- Author:
- Date:
- Status: draft
- Original language:
- Translations:

## Publishing
<!-- Managed by publishing tools. Leave empty during writing. -->
```

這個區塊現階段不被任何 skill 讀取或寫入，僅作為未來 publishing skill 的預留位置。未來發布後會寫入：

```markdown
## Publishing
- Target: hugo
- Published to: content/posts/my-post/index.md
- Published at: 2026-03-19
- Slug: my-post
```

### 6. 需要改動的檔案

**Skills（核心改動）：**

- `skills/writing-management/SKILL.md` — 初始化邏輯改為建立 `writing.config.md` + workspace 目錄；所有路徑引用加上 workspace 前綴
- `skills/article-preparation/SKILL.md` — prerequisite check 和讀取路徑改為先解析 workspace
- `skills/article-writing/SKILL.md` — 讀取路徑同上

**Templates & References：**

- `skills/writing-management/assets/config-template.md` — 加上 YAML frontmatter 的 workspace 欄位
- `skills/writing-management/references/config-format.md` — 更新格式說明，加入 frontmatter 和 workspace 的文件
- `skills/article-preparation/assets/brief-template.md` — 新增空的 Publishing 區塊

**文件：**

- `CLAUDE.md` — 更新 Workspace Structure 說明和路徑引用
- `README.md` — 更新快速入門

**不改動的檔案：**

- `docs/superpowers/specs/` 和 `docs/superpowers/plans/` 中的既有文件（歷史記錄）
- `skills/article-writing/references/writing-rules.md`（不引用 config 路徑）
- Reviewer prompt 檔案（不引用 config 路徑）

### 7. 不做向後相容

這是 breaking change。目前沒有外部使用者，直接改名即可，不需要偵測舊 `config.md` 或提供遷移工具。
