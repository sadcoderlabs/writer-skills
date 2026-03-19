# CMS 整合研究：Writing Skills × Astro / Hugo

## 執行摘要

本研究探討如何讓現有的 writing workflow skills 與靜態網站生成器（SSG）整合，重點分析 Astro 和 Hugo 兩套系統。目前的 skills 產出「乾淨的 article.md」——沒有 frontmatter、沒有 metadata——所有中繼資訊都集中在 brief.md。這個設計恰好為 CMS 整合提供了一個自然的分離點：article.md 負責內容，brief.md 負責所有 metadata 與發布追蹤。

經過分析，我們建議採用**匯出模式**：skills 維持現有的 workspace 結構不變，透過一個獨立的發布機制將 article.md 轉換為 CMS 所需的格式（加上 frontmatter、重新命名、複製 assets），並在 brief.md 中記錄發布路徑。這個方式讓非 CMS 使用者完全不受影響，同時為 CMS 使用者提供清晰的整合路徑。

關鍵發現：

- Astro 和 Hugo 都以 Markdown + frontmatter 為核心，但目錄結構和 frontmatter 欄位有差異
- 現有的 article.md「無 frontmatter」設計是優勢而非障礙——轉換時才組裝 frontmatter 比事後拆除更簡單
- 同一個 repo 內整合最自然的方式是 workspace 目錄與 CMS content 目錄並存

## 背景與脈絡

這套 writing workflow skills 目前的設計是「CMS 無關」的——它產出的是純粹的文章內容，不假設任何發布平台。使用者從構思（ideas.md）到準備（brief.md + outline）到寫作（article.md），整個流程都在一個 workspace 目錄內完成。

這個設計讓工具本身很輕量，但也意味著使用者完成文章後，要自己手動處理「發布」這一步。對於使用 Obsidian 或其他筆記工具的使用者來說這不是問題——複製貼上就好。但對於使用 Astro 或 Hugo 架站的使用者來說，他們需要：把 article.md 內容加上正確的 frontmatter、放到 CMS 指定的目錄結構、處理圖片路徑、設定 draft 狀態等。這些步驟繁瑣且容易出錯。

我們希望在不破壞現有非 CMS 使用者體驗的前提下，讓 CMS 使用者也能順暢地從「寫完文章」過渡到「發布到網站」。

## 研究問題與發現過程

最初的問題是「要不要引入 workspace 概念來支援 CMS 整合」。經過分析 Astro 和 Hugo 的內容管理機制後，問題逐漸收斂為三個面向：

1. **結構差異**：現有的 `articles/{date}_{slug}/article.md` 結構與 CMS 期望的結構有多大差距？
2. **Metadata 轉換**：brief.md 中的資訊如何對應到 CMS 的 frontmatter？
3. **整合邊界**：skills 本身需要改動多少，還是可以把整合邏輯完全放在外部？

## 技術分析

### 現有 Workspace 結構

目前 skills 建立的 workspace 結構如下：

```
{project}/
├── config.md                           # 全域寫作目標與風格
├── ideas.md                            # 構思池
├── templates/brief-template.md
└── articles/
    └── {YYYY-MM-DD}_{slug}/
        ├── article.md                  # 純內容，無 frontmatter
        ├── brief.md                    # 所有 metadata 與進度追蹤
        ├── research.md                 # 研究資料（選用）
        ├── reviews/                    # 審稿報告
        └── assets/                     # 圖片等素材
```

重要特性：
- `article.md` 是「乾淨的散文」——沒有 YAML frontmatter，只有 Markdown 標題和內容
- 所有 metadata（標題、作者、日期、狀態、語言、受眾等）都在 `brief.md`
- 圖片放在 `assets/` 子目錄

### Astro 的內容結構

Astro 5+ 使用 Content Collections，核心是 loader + Zod schema：

```
src/
├── content.config.ts                   # 集合定義與 schema
└── content/
    └── blog/
        ├── my-post.md                  # frontmatter + 內容
        └── my-post-cover.jpg           # 共置圖片
```

Astro 的關鍵特性：
- **Frontmatter 必要**：每個 content entry 都需要 frontmatter，由 Zod schema 驗證
- **Schema 強型別**：TypeScript 自動產生型別，提供 autocomplete
- **命名彈性**：檔名就是 entry ID，不強制特定命名
- **圖片共置**：圖片可以放在同目錄，用 `image()` helper 驗證相對路徑
- **Draft 自行實作**：沒有內建 draft 機制，需在 schema 加 `draft` boolean 並在查詢時過濾
- **Loader API**：可自定義 loader 從任意來源載入內容，但對我們的場景來說直接寫檔案更簡單

典型的 Astro blog frontmatter：

```yaml
---
title: "文章標題"
pubDate: 2026-03-18
description: "簡短描述"
author: "作者"
tags: ["tag1", "tag2"]
draft: false
cover:
  src: ./cover.jpg
  alt: "封面圖說明"
---
```

### Hugo 的內容結構

Hugo 使用 page bundle 模式，leaf bundle 是最常見的文章結構：

```
content/
└── posts/
    └── my-post/
        ├── index.md                    # frontmatter + 內容（必須叫 index.md）
        ├── hero.jpg                    # page resource
        └── data.csv                    # 其他附件
```

Hugo 的關鍵特性：
- **Frontmatter 必要**：支援 YAML (`---`)、TOML (`+++`)、JSON 三種格式
- **檔名限制**：leaf bundle 入口必須是 `index.md`，不能用其他名稱
- **Page Resources**：同目錄的檔案自動成為該頁面的 resources，只有該頁面能存取
- **內建 Draft 機制**：`draft: true` + `publishDate` + `expiryDate` 三層控制
- **Archetypes**：`hugo new content` 可用範本建立新內容
- **Taxonomies**：內建 tags/categories，可自定義

典型的 Hugo post frontmatter：

```yaml
---
title: "文章標題"
date: 2026-03-18T10:00:00+08:00
draft: false
description: "簡短描述"
summary: "文章摘要"
tags: ["tag1", "tag2"]
categories: ["category1"]
isCJKLanguage: true
---
```

### 結構差異對照

| 面向 | 現有 Skills | Astro | Hugo |
|------|------------|-------|------|
| 文章檔名 | `article.md` | 任意 `.md` | 必須 `index.md` |
| Frontmatter | 無（metadata 在 brief.md） | 必要（Zod 驗證） | 必要 |
| 目錄命名 | `{date}_{slug}/` | 任意 | 任意（URL 由 frontmatter 或目錄決定） |
| 圖片位置 | `assets/` 子目錄 | 同目錄或 `_assets/` | 同目錄（page resources） |
| Draft 機制 | `brief.md` status 欄位 | frontmatter boolean | frontmatter `draft` + `publishDate` |
| Metadata 位置 | `brief.md`（獨立檔案） | 文章 frontmatter | 文章 frontmatter |

### brief.md → Frontmatter 的對應關係

brief.md 中的資訊可以自然地對應到 CMS frontmatter：

| brief.md 欄位 | Astro frontmatter | Hugo frontmatter |
|---------------|-------------------|------------------|
| Title | `title` | `title` |
| Author | `author` | `author`（或 taxonomy） |
| Date | `pubDate` | `date` |
| Status → published | `draft: false` | `draft: false` |
| Status → 其他 | `draft: true` | `draft: true` |
| Original language | 自定義欄位 | `isCJKLanguage` + 自定義 |
| Target Audience → Who | `description`（可衍生） | `description` / `summary` |
| Article Goals → Reader takeaway | `description` | `description` |
| Source Ideas | 不需要 | 不需要 |

這個對應關係不算複雜，一個轉換函式就能處理。重要的是 brief.md 已經包含了 CMS 所需的大部分資訊。

## 整合方案分析

### 方案 A：匯出模式（推薦）

Skills 完全不改動，workspace 結構維持原樣。另外提供一個「發布」機制，負責：

1. 讀取 `brief.md` 提取 metadata
2. 讀取 `article.md` 的內容
3. 組裝 CMS 格式的 frontmatter
4. 將內容寫入 CMS 的 content 目錄（正確的檔名和結構）
5. 複製 `assets/` 到 CMS 對應位置
6. 在 `brief.md` 中記錄發布路徑

以 Astro 為例，發布流程會是：

```
articles/2026-03-18_my-post/article.md
  ↓ 轉換
src/content/blog/my-post.md (加上 frontmatter)
  + 複製 assets/ 到同目錄
```

以 Hugo 為例：

```
articles/2026-03-18_my-post/article.md
  ↓ 轉換
content/posts/my-post/index.md (加上 frontmatter)
  + 複製 assets/ 到同目錄
```

**優點：**
- Skills 完全不需改動，非 CMS 使用者零影響
- 關注點分離——寫作歸寫作，發布歸發布
- 支援一篇文章發布到多個 CMS（如同時維護 Astro blog 和 Hugo docs）
- 發布後還可以繼續在 workspace 修改，再次發布覆蓋

**缺點：**
- 產生兩份內容（workspace 一份、CMS 一份），需要注意同步
- 需要一個額外的發布工具或 skill

### 方案 B：原地模式

把 workspace 的 `articles/` 目錄直接放在 CMS 的 content 目錄內，讓 CMS 直接讀取。

這個方案的問題很大：article.md 沒有 frontmatter，CMS 無法正確解析；brief.md、research.md、reviews/ 會被 CMS 當成 content entries；檔名不符合 Hugo 的 `index.md` 要求。要解決這些問題需要大幅改動現有的 skills 設計，違背了「非 CMS 使用者不受影響」的原則。

### 方案 C：混合模式

Workspace 結構可以配置，指向 CMS 的 content 目錄。寫作時直接在 CMS 目錄內產生符合格式的文章。

這個方案的問題在於：需要在 skills 層面處理不同 CMS 的格式差異（檔名、frontmatter 結構），增加了 skills 的複雜度。而且 brief.md 等輔助檔案會出現在 CMS 目錄中，需要額外的排除規則（Hugo 的 `_build` 設定或 Astro 的 `_` 前綴慣例）。

### 為什麼推薦匯出模式

匯出模式的核心優勢是**分離關注點**。Skills 專注於「幫使用者寫出好文章」，不需要知道文章最終發布到哪裡。CMS 整合是一個獨立的步驟，可以根據不同 CMS 的需求靈活調整，而且未來新增 CMS 支援時完全不需要改動任何現有 skill。

這也符合使用者提到的需求：「設計 skills 的時候多設想這樣的狀況就好」——skills 需要做的只是確保 brief.md 包含足夠的 metadata 讓發布機制可以工作。

## 具體設計建議

### 1. Workspace 目錄概念

在 `config.md` 中新增 workspace 配置，讓使用者可以指定文章目錄的位置：

```markdown
## Workspace
- Articles directory: articles
```

對於非 CMS 使用者，這就是預設值，什麼都不用改。對於 CMS 使用者，他們仍然使用預設值——發布路徑在別處配置。

### 2. 發布配置

在 `config.md` 中可以新增發布目標配置：

```markdown
## Publishing
- Target: hugo
- Content directory: content/posts
- Default tags:
- Default categories:
```

或者針對 Astro：

```markdown
## Publishing
- Target: astro
- Content directory: src/content/blog
- Default tags:
```

這些配置告訴發布機制該把文章放到哪裡、用什麼格式。

### 3. brief.md 的擴充

在 brief.md 中新增 Publishing 區塊來追蹤發布狀態：

```markdown
## Publishing
- Published to: content/posts/my-post/index.md
- Published at: 2026-03-18
- Slug: my-post
- Tags: tag1, tag2
- Categories: category1
```

這讓使用者可以追蹤每篇文章的發布位置，也讓發布機制知道是否需要更新已發布的內容。

### 4. Skills 層面需要考慮的事項

雖然 skills 不需要直接處理 CMS 整合，但有幾個地方可以「CMS-aware」：

- **brief.md template**：預留 Publishing 區塊（初始為空），讓發布機制有地方寫入資訊
- **article.md 的標題格式**：目前 article.md 用 Markdown heading 作為章節標題。確認第一個 `# 標題` 對應 brief.md 的 Title，因為發布時這個標題可能需要移到 frontmatter 的 `title` 欄位（避免 CMS 頁面出現重複標題）
- **圖片引用路徑**：article.md 中引用圖片時用相對路徑 `assets/photo.jpg`。發布時需要轉換路徑（因為 CMS 目錄結構不同），這是發布機制的責任，但 skills 應該確保路徑引用一致

### 5. 發布機制的實作方向

發布機制可以是一個獨立的 skill（如 `article-publishing`），負責：

1. 讀取 `config.md` 的 Publishing 配置
2. 讀取目標文章的 `brief.md` 和 `article.md`
3. 根據 target CMS 類型：
   - 組裝正確格式的 frontmatter
   - 決定目標檔名（Hugo: `index.md`，Astro: `{slug}.md`）
   - 轉換圖片路徑
   - 複製檔案到 CMS content 目錄
4. 更新 `brief.md` 的 Publishing 區塊
5. （選用）執行 CMS 的建置指令預覽結果

### 6. CMS 專屬的轉換邏輯

**Astro 轉換：**
- 從 brief.md 組裝 frontmatter（title, pubDate, description, author, tags, draft）
- 如果有 Schema 定義檔（`content.config.ts`），可以讀取來確認欄位格式
- 複製 article.md 內容（移除第一個 `#` 標題，因為 frontmatter 有 title）
- 複製 assets 到文章同目錄，調整圖片引用路徑

**Hugo 轉換：**
- 從 brief.md 組裝 frontmatter（title, date, description, draft, tags, categories, isCJKLanguage）
- 檔案必須命名為 `index.md`
- 複製 assets 到文章同目錄（成為 page resources）
- 調整圖片引用路徑

### 7. 圖片路徑轉換範例

假設 article.md 中有：

```markdown
![架構圖](assets/architecture.png)
```

**Astro 發布後**（圖片放在同目錄）：

```markdown
![架構圖](./architecture.png)
```

**Hugo 發布後**（圖片成為 page resource）：

```markdown
![架構圖](architecture.png)
```

## 其他 CMS 的適用性

雖然本研究聚焦 Astro 和 Hugo，匯出模式的設計天生就支援擴展到其他 CMS：

| CMS | Content 格式 | 目錄結構 | 整合難度 |
|-----|-------------|---------|---------|
| **Astro** | Markdown + Zod frontmatter | `src/content/{collection}/` | 低 |
| **Hugo** | Markdown + YAML/TOML frontmatter | `content/{section}/{slug}/index.md` | 低 |
| **Next.js (MDX)** | MDX + frontmatter | 自定義，通常 `content/` | 低 |
| **Gatsby** | Markdown + GraphQL frontmatter | `content/blog/` | 低 |
| **Jekyll** | Markdown + YAML frontmatter | `_posts/YYYY-MM-DD-slug.md` | 低 |
| **11ty** | Markdown + data cascade | 自定義 | 低 |
| **WordPress** | REST API / WP-CLI | 非檔案型 | 中（需 API 呼叫） |
| **Obsidian Publish** | Markdown | Vault 目錄 | 低（單純複製） |

檔案型 CMS（SSG 類）的整合都是低難度，因為核心邏輯相同：組裝 frontmatter + 複製檔案。API 型 CMS（如 WordPress）需要額外的 API 整合邏輯，但發布機制的架構仍然適用。

## 建議與決策指引

基於以上分析，建議採用匯出模式，並分兩階段推進：

**第一階段：Skills 準備（低成本）**
- 在 brief-template.md 預留 Publishing 區塊
- 在 config-template.md 預留 Publishing 配置區塊
- 確認 article.md 的標題和圖片路徑慣例一致
- 這些改動對現有使用者幾乎無感

**第二階段：發布機制實作**
- 設計 `article-publishing` skill 或獨立工具
- 先實作 Hugo 和 Astro 兩個 target
- 建立 CMS adapter 模式，方便未來新增 target

## 下一步行動計畫

實施需要分階段進行。第一階段是讓現有 skills 做好「CMS-ready」的準備，這個成本很低，只需要在模板中預留欄位。第二階段才是實際建構發布機制，這是一個獨立的 skill 開發工作。

- **立即可做**：在 brief-template.md 和 config-template.md 中預留 Publishing 區塊，作為未來整合的基礎
- **設計階段**：撰寫 `article-publishing` skill 的 PRD，定義發布流程、CMS adapter 介面、frontmatter 組裝邏輯
- **實作階段**：開發 publishing skill，先支援 Hugo 和 Astro
- **驗證階段**：用真實的 Hugo/Astro 專案測試完整的「寫作 → 發布」流程

## 參考資料

### Astro
- [Content Collections Guide](https://docs.astro.build/en/guides/content-collections/) — Content Collections 完整指南
- [Content Loader API Reference](https://docs.astro.build/en/reference/content-loader-reference/) — 自定義 Loader 介面
- [Zod Schema API](https://docs.astro.build/en/reference/modules/astro-zod/) — Frontmatter 驗證
- [Images Guide](https://docs.astro.build/en/guides/images/) — 圖片處理與最佳化

### Hugo
- [Content Organization](https://gohugo.io/content-management/organization/) — 目錄結構與 sections
- [Page Bundles](https://gohugo.io/content-management/page-bundles/) — Leaf / Branch bundle 機制
- [Front Matter](https://gohugo.io/content-management/front-matter/) — Frontmatter 欄位與格式
- [Page Resources](https://gohugo.io/content-management/page-resources/) — 附件與圖片管理
- [Archetypes](https://gohugo.io/content-management/archetypes/) — 內容範本系統
