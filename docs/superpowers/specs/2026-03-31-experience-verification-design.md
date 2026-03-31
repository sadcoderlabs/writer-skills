# X Engagement 經驗查核

## 問題

x-engagement 技能會草擬聲稱團隊沒有的經驗的回覆。在實際執行中，agent 推薦回覆一則關於 MCP skill distribution 的推文，草擬的文案聲稱「We ship skills via MCP in OpenClaw」— 但團隊並沒有使用 MCP。技能目前會驗證推文是否存在（Syndication API）並檢查草稿風格（審查迴圈），但從未驗證聲稱的經驗是否真實。

這違反了 writing system 的「Materials are sacred」原則：文章不能捏造案例，engagement reply 也不應該捏造經驗。

## 背景

技能在 OpenClaw 上運行，OpenClaw 有記憶系統（MEMORY.md、working memory），記錄團隊使用的工具、專案和決策。團隊的寫作內容放在 sadcoder-press workspace（文章、貼文）。這兩個來源 — 記憶和 workspace 內容 — 是團隊實際做了什麼的權威紀錄。

目前技能在 Step 3b 已經會讀文章、貼文和 ideas，但只是用來「找連結點」做策展。並沒有用來約束草稿中允許聲稱的經驗。

## 設計

兩層經驗查核，模擬人類在 Twitter 上的互動方式：你注意到推文是因為跟自己的經驗有關，然後從那個經驗出發回覆。

### 第一層：搜尋階段的記憶整合（Step 2）

**現行行為：** Step 2 用 interests.yaml 的關鍵字執行 `discover.ts`。一條附帶條件的備註寫著「If you have access to working memory or recent context, share relevant supplementary keywords」。

**新行為：** 執行 discovery 腳本之前，agent 必須讀取過去一週的工作記憶（MEMORY.md、近期對話 context）。提取反映團隊目前正在建構、使用或討論的補充關鍵字，與 interests.yaml 關鍵字合併，用於理解和篩選搜尋結果。

這是強制步驟，不是條件式。之前的「if」用語導致實際執行時被跳過。

### 第二層：草擬前經驗分類（Step 3b）

在為每則候選推文草擬文案之前，agent 比對工作記憶和 workspace 內容，對推文的具體主題進行經驗等級分類。

#### 經驗等級

| 等級 | 定義 | 證據來源 | 草擬行動 |
|------|------|---------|---------|
| **直接經驗** | 團隊建過、用過、發布過這個東西 | 記憶中有具體專案/工具使用紀錄，或 workspace 有相關文章/貼文 | 正常草擬，可用第一人稱聲稱經驗 |
| **相鄰經驗** | 團隊做過類似的事，但用不同做法 | 記憶或 workspace 有相關但不完全對應的經驗 | 誠實表達：「We use Y to achieve something similar」、「Different mechanism but same idea」 |
| **反向經驗** | 團隊評估過或選擇不用這個東西，有具體理由 | 記憶中有對此工具/方法的刻意決策 | 分享理由：「We went a different route because...」、「We chose not to use X, here's why」 |
| **無經驗** | 團隊對這個話題完全沒有實作經驗 | 記憶和 workspace 都找不到相關紀錄 | 降級為 like 或跳過，不草擬聲稱經驗的回覆 |

#### 分類流程

1. 讀取過去一週的工作記憶 + 近期 workspace 內容（過去兩週的文章、貼文）
2. 對每則候選推文問：「關於這個具體話題，我們做過什麼？」
3. 根據找到的證據分類
4. 找不到任何證據 → 預設為「無經驗」

#### 範例：MCP skill distribution 推文

- 推文主題：用 MCP 做 skill distribution
- 記憶查核：團隊用 markdown skill files，以一般檔案方式發布，不透過 MCP
- 分類：**反向經驗**（團隊做 skill distribution 但選擇不走 MCP）
- 正確角度：「We distribute agent skills as markdown files too, different mechanism but same idea — drop a file, agent picks it up. We went without MCP because [reason].」
- 錯誤角度：~~「We ship skills via MCP in OpenClaw」~~（捏造直接經驗）

### 第三層：審查檢查點（Step 3c）

在 engagement reviewer 的 checklist 加入「經驗真實性」。這是輕量安全網 — 如果第一層和第二層正確運作，這條應該很少觸發。

在 reviewer 的「What to Check」表格新增一列：

| Category | What to Look For |
|----------|------------------|
| Experience authenticity | Does the draft claim direct experience the team actually has? Cross-check against the experience classification from Step 3b. Flag any fabricated or inflated experience claims. |

## 需要的變更

### 新增文件

`skills/x-engagement/references/experience-verification.md` — 定義四個經驗等級、分類流程和範例。供 Step 3b（草擬前分類）和 Step 3c（審查 checklist）參考。

### 修改文件

1. **`skills/x-engagement/SKILL.md`**
   - Step 2：把條件式記憶備註改為強制指示 — 讀取過去一週工作記憶，提取補充關鍵字
   - Step 3a：在必讀資源清單加入 `experience-verification.md`
   - Step 3b：在「For each candidate worth engaging」之前插入經驗分類子步驟

2. **`skills/x-engagement/engagement-reviewer-prompt.md`**
   - 在「What to Check」表格加入「Experience authenticity」列

### 不需變更

- `discover.ts` — 腳本不變；agent 在理解結果時套用記憶 context，而非修改搜尋 query
- `interests.yaml` — 結構不變
- 其他技能 — 範圍僅限 x-engagement

## 設計原則

- **指示優先於基礎設施**：透過 SKILL.md 指引和參考文件實現，不需要新腳本或工具。記憶系統已在 OpenClaw 中存在。
- **往上游推**：在搜尋階段抓到經驗不匹配比在審查階段便宜。兩個上游層（搜尋 + 草擬前）加一個下游安全網（審查）。
- **Materials are sacred**：將 writing system 的既有原則延伸到 engagement reply。團隊的真實經驗是草擬文案唯一合法的素材。
- **誠實互動更有價值**：分享反向經驗（「我們選擇不用 X，因為...」）比捏造同意更能引發有意義的對話。
