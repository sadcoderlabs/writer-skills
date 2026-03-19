# Workspace 絕對路徑支援設計

## 摘要

修改 `writing.config.md` 的 `workspace` 欄位，支援絕對路徑並移除所有路徑驗證限制。這讓 skills 安裝位置與寫作產出可以分屬不同 repo/目錄。

## 背景

### 問題

AI agent Maelle 運作在 OpenClaw 平台，skills 安裝在她的 workspace（`~/.openclaw/workspace/team/skills/`）。但寫作產出（`ideas.md`、`articles/`）應該在 sadcoder-press repo（`~/projects/sadcoder-press/`），因為：

- 文章最終發布到該 Astro 網站
- 內容需要 git 版本紀錄
- 其他人用 Claude Code 開 sadcoder-press 時也能看到 ideas 和文章

目前 `workspace` 欄位只允許相對路徑（禁止 `..`、禁止前導 `/`、最多兩層深），無法指向 repo 外部的目錄。

### 先前設計

[Workspace 機制與 Config 改名設計](2026-03-19-workspace-and-config-rename-design.md) 定義了 workspace 機制，當時假設 workspace 一定在 repo 內部，因此加入了路徑限制。本設計移除這些限制並擴充為支援絕對路徑。

## 設計

### 1. Workspace 解析規則

**新規則（取代原有規則）：**

- `workspace` 是 frontmatter 的欄位，值是目錄路徑
- 如果省略或為空，預設為 `.`（repo root 就是 workspace）
- 如果值以 `/` 開頭，視為絕對路徑，直接使用
- 否則，視為相對路徑，相對於 repo root（CWD）解析
- **不做任何路徑驗證** — 移除 `..` 禁止、深度限制等所有限制

**範例：**

```yaml
# 相對路徑（相對於 repo root）
---
workspace: .
---

# 相對路徑（repo 內子目錄）
---
workspace: content/drafts
---

# 絕對路徑（指向外部目錄）
---
workspace: /root/projects/sadcoder-press
---
```

### 2. 跨 Repo Workspace 的目錄結構

當 workspace 指向外部 repo 時，`writing.config.md` 與寫作檔案分屬不同 repo：

```
~/.openclaw/workspace/team/      # Maelle 的 workspace（skills 安裝處）
├── skills/                      # writer-skills 安裝在這裡
└── writing.config.md            # workspace: /root/projects/sadcoder-press

/root/projects/sadcoder-press/   # sadcoder-press repo（寫作產出）
├── astro.config.mjs             # Astro 專案檔案
├── ideas.md
├── templates/brief-template.md
└── articles/
    └── 2026-03-19_my-post/
        ├── article.md
        ├── brief.md
        └── ...
```

### 3. Git 操作與跨 Repo Workspace

Article-writing skill 的 Step 4 會 git commit first draft。當 workspace 是絕對路徑指向外部 repo 時：

- Git 操作需要在 workspace 目錄下執行（因為 `.git` 在那個 repo 裡，不在 CWD repo）
- Skill 已有判斷：「If the workspace is not a git repository, skip this step」— 這個邏輯不變
- 實作時，git 命令需要以 workspace 目錄為 working directory（例如 `git -C {workspace} add ...`），或先 cd 到 workspace 目錄

這是 article-writing skill 實作層面的調整，不影響其他 skills。

### 4. 平台與路徑格式

本設計以 Unix 路徑為準（以 `/` 開頭判斷絕對路徑）。目標部署環境是 Linux（OpenClaw 平台）。

不支援 Windows 風格的絕對路徑（如 `C:\...`）。如需跨平台支援，留待未來擴充。

不支援 `~`（tilde expansion）。使用者必須提供展開後的完整路徑。初始化流程中如果使用者輸入 `~` 開頭的路徑，skill 應提示使用者改用完整絕對路徑。

### 5. 初始化流程的變化

Writing-management skill 的初始化步驟中，原本有驗證使用者輸入的路徑（no `..`, no leading `/`, max 2 levels）。改為：

- 不做路徑驗證
- 如果使用者提供以 `/` 開頭的路徑，直接作為絕對路徑寫入 frontmatter
- 如果使用者輸入 `~` 開頭的路徑，提示改用完整絕對路徑
- Workspace 目錄不存在時自動建立（與現有行為一致，適用於絕對路徑）

### 6. 不變的部分

- `writing.config.md` 固定放在 repo root（使用 skills 時的 CWD）
- 所有 skills 用 `{workspace}/` 前綴拼接路徑的方式不變
- 相對路徑的行為完全不變（只是移除了驗證，解析邏輯相同）
- Workspace 目錄結構不變（`ideas.md`、`templates/`、`articles/`）

### 7. 需要改動的檔案

**Skills（核心改動）：**

- `skills/writing-management/SKILL.md` — 刪除 validate 行（no `..`, no leading/trailing `/`, maximum two levels deep），workspace resolution 段落加入絕對路徑說明
- `skills/article-preparation/SKILL.md` — workspace resolution 段落加入絕對路徑說明
- `skills/article-writing/SKILL.md` — 同上

**References：**

- `skills/writing-management/references/config-format.md` — 刪除四條路徑限制規則（no leading `/`、no trailing `/`、no `..`、max two levels），替換為：「如果以 `/` 開頭視為絕對路徑，否則相對於 repo root」。新增絕對路徑範例

**文件：**

- `CLAUDE.md` — workspace 說明處補充絕對路徑支援
- `README.md` — 同上

### 8. 不做的事

- 不做路徑驗證（目錄存在性、結構檢查等由 skill 執行過程自然處理）
- 不做向後相容處理（移除限制是純放寬，不影響現有使用者）
- 不改動 `writing.config.md` 的位置或其他 frontmatter 欄位
