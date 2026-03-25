# 社群貼文撰寫技能設計

## 背景

現有寫作技能系統涵蓋長篇文章的完整生命週期（management → preparation → writing → translation），但缺乏社群平台短文的管理與撰寫能力。本設計新增社群貼文撰寫技能，支援獨立創作與文章衍生兩種模式。

### 參考來源

- **jackbutcher.md**（https://github.com/visualizevalue/jackbutcher.md）：從 ~50K 推文反向工程的寫作風格指南。核心概念是「提取模式而非存儲貼文」——按語音、結構、修辭手法、開場模式等維度歸納風格，而非按時間軸存放個別推文。本設計採用此概念作為社群風格指南的骨架。
- **現有寫作技能**：四技能管道的設計模式——鬼寫手模式、素材至聖、狀態機工作流、子代理審查、反饋提取。
- **sadcoder-press**：實際使用場景參考。已定義 `src/content/posts/` 的 Astro content collection schema（支援 twitter/threads/bluesky/mastodon 平台、publishedUrl 追蹤），但尚未有內容。文章從 `writing/` 工作區透過 publish 技能發布到 `src/content/blog/`。

## 架構決策

### 技能拆分

**擴展 `writing-management` + 新增 `post-writing`**

- 管理層統一：`writing-management` 擴展以涵蓋社群相關的 idea 標記、配置、風格指南初始化
- 寫作層各自獨立：`article-writing` 和 `post-writing` 各有專門技能
- 不創造新的管理技能，避免過度拆分

**對現有技能的影響**：

| 技能 | 變更 |
|---|---|
| `writing-management` | 擴展：ideas.md 的 `[post]` 標記、config 的 `## Social` 區塊、`social-style-guide.md` 初始化、`posts/` 目錄、批次風格提取 |
| `post-writing`（新） | 完整的貼文撰寫流程 |
| `article-writing` | 不變 |
| `article-preparation` | 不變 |
| `article-translation` | 不變 |

**條件性初始化**：`writing-management` 的社群相關初始化（建立 `posts/`、複製 `social-style-guide-template.md`、設定 `## Social` 區塊）僅在 `post-writing` 技能存在時執行。偵測方式：檢查 `${CLAUDE_SKILL_DIR}/../post-writing/SKILL.md` 是否存在。如果使用者只安裝文章相關技能，`writing-management` 不會建立社群相關的檔案和配置。

**需要更新的現有檔案**：
- `skills/writing-management/references/config-format.md` — 新增 `## Social` 區塊的格式說明（此區塊為選擇性，僅在啟用社群功能時加入）
- `skills/writing-management/assets/config-template.md` — 新增 `## Social` 區塊模板
- `skills/writing-management/references/ideas-format.md` — 新增 type 標記格式說明
- `skills/writing-management/assets/ideas-template.md` — 更新範例以包含 type 標記
- `skills/writing-management/SKILL.md` — 「Receive New Ideas」和「Organize Idea Pool」sections 擴展以支援 type 標記；「You Do NOT」清單補充「不撰寫貼文內容（that's the post-writing skill）」
- `CLAUDE.md` — 架構段落新增 `post-writing` 為第五個技能；工作區結構新增 `posts/` 和 `social-style-guide.md`；新增貼文狀態生命週期說明（`draft` → `review` → `published`）

### Idea 管理

共用 `ideas.md`。每個 idea 加入 type 標記，一個 idea 可同時產出文章和貼文。

### 配置

擴展 `writing.config.md`，新增 `## Social` 區塊。

### 風格系統

獨立的 `social-style-guide.md`，以 jackbutcher.md 的結構為骨架，透過三階段演進機制持續成長。

### 貼文存儲

平面檔案：`{workspace}/posts/{YYYY-MM-DD}_{slug}.md`，一篇貼文一個檔案，不需要目錄包裝。

### 翻譯

同檔多語言——翻譯版本附在原文下方，用 `---lang:{code}---` 分隔。不需要呼叫 `article-translation` 技能。

## 設計細節

### 1. writing-management 擴展

#### ideas.md 格式擴展

在 Pending 區塊中，每個 idea 加入 `type` 標記：

```markdown
## Pending
- [2026-03-25] How to use Claude Code hooks effectively `[article]`
- [2026-03-25] "The best code is the code you don't write" — riff on this `[post]`
- [2026-03-25] Our writing skill architecture journey `[article, post]` — article + thread summarizing key insights
```

type 值：`[article]`、`[post]`、`[article, post]`。

**向後相容**：無 type 標記的既有 idea 預設視為 `[article]`。技能在讀取 ideas.md 時，遇到無標記的項目一律當作 `[article]` 處理，不需要使用者回溯補標記。

Adopted 區塊連結到對應的產出路徑：

```markdown
## Adopted
- [2026-03-24] Claude Code remote control → articles/2026-03-24_claude-code-remote-control/
  - → posts/2026-03-25_claude-code-remote-control-key-insight.md
```

#### writing.config.md 社群區塊

新增 `## Social` 區塊：

```markdown
## Social
- Platforms: twitter, threads, bluesky
- Social style guide: {workspace}/social-style-guide.md
- Default post language: en
- Translations: zh
```

#### 社群風格指南初始化

工作區初始化時建立 `{workspace}/social-style-guide.md`，以 jackbutcher.md 的結構為骨架：

```markdown
# Social Style Guide

## Voice
(core voice principles for social posts)

## Structure
(post structure patterns — single post templates, thread templates)

## Rhetorical Patterns
(contrast frames, repetition patterns, hooks)

## Opening Patterns
(how posts typically start)

## Signature Vocabulary
(recurring terms and phrases)

## Anti-Patterns
(what to avoid on social)

## Reference Posts
(exemplar posts that capture the voice well)
```

初始內容由使用者在第一次設定時填入或從現有貼文中提取。

#### posts/ 目錄

初始化時在工作區建立 `posts/` 目錄。

### 2. post-writing 技能

#### 貼文檔案格式

`{workspace}/posts/{YYYY-MM-DD}_{slug}.md`：

```markdown
---
type: single | thread
status: draft | review | published
source: standalone | article
source_article: articles/2026-03-24_claude-code-remote-control/ # only if source: article
original_language: en
translations: [zh]
platforms: [twitter, threads, bluesky]
---

# Post title or hook

Post content here.
```

串文（thread）用 `---`（horizontal rule）分隔每則貼文：

```markdown
---
type: thread
status: draft
source: article
source_article: articles/2026-03-24_claude-code-remote-control/
original_language: en
translations: []
platforms: [twitter, threads]
---

# How we built a writing system with AI agent skills

We spent two weeks building a writing workflow powered by AI skills. Here's what we learned about making AI actually useful for content creation.

---

1/ The key insight: AI shouldn't ask you to write. It should propose content for you to confirm or adjust.

We call this "ghostwriter mode." The AI drafts, you steer.

---

2/ Materials are sacred. Every claim, example, and number comes from the author's own materials.

No fabricated anecdotes. No made-up statistics. If the material isn't there, ask for more.

---

3/ The result: articles that sound like the author, backed by real data, produced in a fraction of the time.

Full writeup: [link]
```

#### 工作流步驟

**Step 1 — 選擇來源**

使用者指定來源：
- 從 `ideas.md` 挑選一個 `[post]` 或 `[article, post]` idea
- 指定一篇已完成的文章作為素材來源
- 直接描述一個主題（即興創作）

如果來自文章，讀取 `brief.md`（目標讀者、核心 takeaway）、`article.{lang}.md`（完整內容）、`research.md`（引用來源）。

建立貼文檔案，狀態設為 `draft`。

**Step 2 — 提議貼文方向**（鬼寫手模式）

基於來源素材和社群風格指南，提議 2-3 個貼文角度。

文章衍生的典型方向：
- **核心觀點**：用一則貼文濃縮文章的最關鍵洞察
- **展開串文**：將文章的論述線拆成一個串文，每則貼文一個要點
- **金句摘錄**：從文章中挑出最有衝擊力的一句話
- **問題引導**：以文章探討的問題作為開頭，引發討論

獨立創作的典型方向：
- **觀點陳述**：直接表達一個立場
- **經驗分享**：從個人經歷出發的串文
- **反思/對比**：挑戰常見認知

使用者選擇或調整方向。

**Step 3 — 撰寫草稿**

按照社群風格指南撰寫完整貼文：
- 遵循風格指南中的 Voice、Structure、Rhetorical Patterns
- 如果風格指南尚未充實，退回到 `writing.config.md` 全局風格 + 通用社群寫作最佳實踐
- 遵循平台字數限制（frontmatter 中的 platforms 決定最嚴格的限制）
- 串文的每則控制在合理長度
- 文章衍生的貼文忠於原文素材——不扭曲、不誇大（素材至聖原則）

寫入貼文檔案。狀態維持 `draft`。

Git commit：`draft: write post {slug}`

**Step 4 — 輕量審查**

派遣 `post-reviewer` 子代理，檢查：
- 社群風格指南一致性
- 平台規範（字數、格式限制）
- 如果是文章衍生：素材準確性（不扭曲原文意思）
- 禁止的 AI 模式（類似 writing-rules.md 的社群版）

子代理直接修正貼文並在對話中呈現簡短審查結果（不另存 reviews/ 目錄）。子代理只負責修正和回傳結果，狀態更新由 `post-writing` 主流程在子代理完成後執行。

更新狀態：`draft` → `review`。

**Step 5 — 作者確認與翻譯**

呈現最終版本給作者確認。作者可微調用詞或要求修改。

確認後，如果 frontmatter 中有 `translations`，在同檔案中附加翻譯版本：

```markdown
---lang:zh---

# 翻譯後的標題

翻譯後的內容。
```

更新狀態：`review` → `published`。

Git commit：`content: finalize post {slug}`

**Step 6 — 風格反饋提取**（選擇性）

如果作者在 Step 5 做了修改，識別可歸納的模式：
- 2+ 次重複出現的修訂模式或作者明確表達的偏好
- 歸入風格指南的對應區塊（Voice、Structure、Rhetorical Patterns 等）
- 鬼寫手模式提議，作者確認後寫回 `social-style-guide.md`

此步驟與 `article-writing` 的 Step 9 反饋提取機制完全對稱。

### 3. 社群風格指南演進機制

受 jackbutcher.md 啟發的三階段演進：

#### 階段 1 — 骨架初始化

`writing-management` 初始化時建立 `social-style-guide.md`，各區塊留空或僅有佔位說明。使用者可手動填入已知偏好，或直接跳過。

#### 階段 2 — 逐篇累積

`post-writing` 的 Step 6 在每次作者修改貼文後，識別並提議新模式寫回風格指南。這是主要的演進途徑。

#### 階段 3 — 批次提取（手動觸發）

當累積足夠多的已發布貼文（例如 20+），使用者可透過 `writing-management` 要求回顧所有 `posts/` 中的貼文，進行全面模式提取：
- 分析字數分布、開頭模式、修辭手法頻率
- 類似 jackbutcher.md 的統計摘要
- 提議更新風格指南的各區塊
- 作者審閱確認

批次提取放在 `writing-management` 而非 `post-writing`，因為它本質上是管理性的操作（分析所有貼文、更新風格指南），與 `writing-management` 管理風格檔案的既有職責一致。

#### 風格指南在撰寫時的使用

`post-writing` Step 3 撰寫草稿時讀取 `social-style-guide.md` 作為寫作約束。如果指南大部分為空（早期階段），退回到 `writing.config.md` 全局風格。隨著指南充實，寫作越來越貼近使用者的個人風格。

### 4. 文章衍生貼文的素材處理

#### 素材讀取

技能讀取指定文章的：
- `brief.md` — 目標讀者、核心 takeaway、goal alignment
- `article.{lang}.md` — 完整文章內容
- `research.md` — 如果存在，引用來源

素材至聖原則同樣適用——貼文內容必須忠於原文，不扭曲、不誇大。

獨立創作模式下，使用者在 Step 1 和 Step 2 中提供的描述和確認的方向即為素材來源。貼文內容不應超出使用者提供的範圍。

#### 與 ideas.md 的關聯

標記為 `[article, post]` 的 idea 在 Adopted 區塊顯示多個產出路徑，建立文章與貼文之間的可追溯連結。

### 5. 解析規則

貼文檔案中有三種 `---` 分隔符，解析時依以下規則辨識：

1. **YAML frontmatter**：檔案的前兩個 `---`（第一行必須是 `---`，第二個 `---` 結束 frontmatter）
2. **語言分隔符**：完全匹配 `---lang:{code}---` 格式（例如 `---lang:zh---`），標記翻譯版本的開始
3. **串文分隔符**：frontmatter 之後、語言分隔符之前的純 `---` 一律視為串文中各則貼文的分隔

解析順序：先剝離 frontmatter，再以 `---lang:{code}---` 切分語言版本，最後在每個語言版本內以 `---` 切分串文各則。

### 6. 平台字數限制

各平台的字數限制在 `references/post-rules.md` 中定義。撰寫時以 frontmatter 中指定的 platforms 中最嚴格的限制為準。參考值：

| 平台 | 單則字元限制 |
|---|---|
| Twitter/X | 280 |
| Bluesky | 300 |
| Threads | 500 |
| Mastodon | 500 |

串文的每則貼文各自遵守字元限制。

## 工作區結構變更

初始化後的完整工作區結構：

```
writing.config.md                # 擴展：新增 ## Social 區塊
{workspace}/
  ideas.md                       # 擴展：idea 加入 type 標記
  profiles/                      # 不變
  writing-rules.md               # 不變
  social-style-guide.md          # 新增：社群風格指南
  templates/brief-template.md    # 不變
  posts/                         # 新增：平面貼文檔案
    {YYYY-MM-DD}_{slug}.md
  articles/                      # 不變
    {YYYY-MM-DD}_{slug}/
```

## 技能檔案結構

```
skills/
  writing-management/
    assets/
      social-style-guide-template.md  # 新增：風格指南模板（jackbutcher.md 骨架）
      # 與現有的 config-template.md、ideas-template.md、profile-template.md 並列
  post-writing/
    SKILL.md                     # 技能定義（frontmatter + 工作流）
    post-reviewer-prompt.md      # 審查子代理提示
    references/
      post-format.md             # 貼文檔案格式規範（含解析規則）
      post-rules.md              # 社群貼文寫作規則（禁止模式、平台字數限制等）
```

`social-style-guide-template.md` 放在 `writing-management/assets/` 下，與現有模板並列。`writing-management` 在條件性初始化時將其複製到工作區。這避免了 `writing-management` 需要引用 `post-writing` 目錄下資源的跨技能依賴。

## 設計原則

本設計延續現有技能系統的核心原則：

- **鬼寫手模式**：提議貼文方向和內容，作者確認/調整
- **素材至聖**：文章衍生的貼文忠於原文素材
- **環境對齊**：自然參考 `writing.config.md` 的目標
- **可恢復性**：狀態保存在檔案中，對話中斷可恢復
- **狀態驅動**：`draft` → `review` → `published`（比文章的五狀態精簡）

新增的原則：
- **活文件風格指南**：風格指南不是一次性定義，而是隨寫作持續演進
- **輕量流程**：社群貼文的流程比文章精簡——沒有 preparation 階段、沒有獨立的事實檢查迴圈、審查報告不另存檔案
- **同檔多語言**：貼文及其翻譯在同一個檔案中，管理簡單
