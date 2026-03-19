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

### 2. 不變的部分

- `writing.config.md` 固定放在 repo root（使用 skills 時的 CWD）
- 所有 skills 用 `{workspace}/` 前綴拼接路徑的方式不變
- 相對路徑的行為完全不變（只是移除了驗證，解析邏輯相同）
- Workspace 目錄結構不變（`ideas.md`、`templates/`、`articles/`）

### 3. 初始化流程的變化

Writing-management skill 的初始化步驟中，原本有驗證使用者輸入的路徑（no `..`, no leading `/`, max 2 levels）。改為：

- 不做路徑驗證
- 如果使用者提供以 `/` 開頭的路徑，直接作為絕對路徑寫入 frontmatter

### 4. 需要改動的檔案

**Skills（核心改動）：**

- `skills/writing-management/SKILL.md` — 刪除 validate 行（no `..`, no leading/trailing `/`, maximum two levels deep），workspace resolution 段落加入絕對路徑說明
- `skills/article-preparation/SKILL.md` — workspace resolution 段落加入絕對路徑說明
- `skills/article-writing/SKILL.md` — 同上

**References：**

- `skills/writing-management/references/config-format.md` — 刪除路徑限制規則，新增絕對路徑說明與範例

**文件：**

- `CLAUDE.md` — workspace 說明處補充絕對路徑支援
- `README.md` — 同上

### 5. 不做的事

- 不做路徑驗證（目錄存在性、結構檢查等由 skill 執行過程自然處理）
- 不做向後相容處理（移除限制是純放寬，不影響現有使用者）
- 不改動 `writing.config.md` 的位置或其他 frontmatter 欄位
