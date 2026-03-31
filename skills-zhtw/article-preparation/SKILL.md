---
name: article-preparation
description: 準備文章寫作。建立文章目錄、收集既有素材、訪談作者以挖掘更多細節、根據素材建立大綱。當使用者想從一個點子開始寫文章時使用。
---

# 文章準備

你負責文章的寫作準備——將一個點子轉化為規劃完整的文章，包含完成的 brief、作者提供的素材，以及有結構的大綱。

## 前置條件

- 先讀取 `writing.config.md`（位置請參考你的 workspace 設定）。如果不存在，請告知使用者先用管理技能設定 workspace。
- 從 `writing.config.md` frontmatter 讀取 `workspace` 欄位（預設：`.`）。如果值以 `/` 開頭，作為絕對路徑使用；否則相對於 `writing.config.md` 所在目錄解析。以下所有路徑都相對於此 workspace 目錄。
- `{workspace}/templates/brief-template.md` 必須存在。如果缺少，從 `${CLAUDE_SKILL_DIR}/assets/brief-template.md` 複製。

## 你的職責

### 步驟一：建立文章目錄

當使用者想把一個點子發展成文章時：

1. 根據文章主題提議一個 slug（例如 `2026-03-17_ai-agent-dev-workflow`）
   - 格式：`{YYYY-MM-DD}_{slug}`，其中 slug 為小寫、單詞間用連字號、簡潔但有描述性
   - 日期使用今天的日期，使用者確認或調整 slug 部分
2. 如果 `{workspace}/articles/{date}_{slug}/` 已存在，在 slug 後加上數字後綴（例如 `2026-03-17_ai-agent-workflow-2`）並與使用者確認
3. 建立目錄結構：
   ```
   {workspace}/articles/{date}_{slug}/
     brief.md      # 從 {workspace}/templates/brief-template.md 複製
     assets/       # 空目錄
   ```
4. 在 `brief.md` 的 **Source Ideas** 區段填入原始點子的參考連結
5. 更新 `{workspace}/ideas.md`：將相關點子從「Pending」移至「Adopted」，標上今天的日期和 `{workspace}/articles/{date}_{slug}` 的連結
   - 如果某個點子已經在「Adopted」區段，告知使用者並連結到既有文章，而非重複採納

### 步驟二：引導完成 Brief

帶使用者逐一完成 `brief.md` 的各個欄位。對於每個欄位：
- **由你根據**文章主題和 `writing.config.md` **提議**內容
- 使用者確認、調整或補充細節

需完成的欄位：

1. **Title**：根據點子提議一個工作標題
2. **Author**：詢問誰來寫這篇文章
3. **Date**：設為今天
4. **Original language**：詢問文章將以哪種語言撰寫
5. **Translations**：詢問是否需要翻譯，以及翻譯成哪些語言
6. **Target Audience — Who**：提議這篇文章的目標讀者是誰
7. **Target Audience — Background**：提議對讀者背景脈絡的簡短描述
8. **Target Audience — Prior state**：提出讀者在閱讀本文前已經知道什麼、正在苦惱什麼
9. **Reader takeaway**：提議讀者的預期收穫
10. **Goal alignment**：讀取 `writing.config.md` 並**主動建議**這篇文章如何自然地與寫作目標連結
    - 這個特別重要：使用者通常會忘記或是有點抗拒要重新拉回寫作目標，所以盡可能要讓整個過程自然一點
    - 範例：「這篇文章可以自然地展現你在 agent 工具上的實作經驗，吸引讀者持續關注更多實戰洞察。這樣可以嗎？」
    - 永遠不要問「這邊要怎麼樣可以符合寫作目標？」，應該由你主動提議與寫作目標連結的方式
11. **Style**：列出 `{workspace}/profiles/` 中可用的風格檔案，讓作者選擇。
    - 如果有風格檔案，顯示清單並附上簡短描述（風格檔案的 `# {Style Name}` 標題和 frontmatter 中的 `created_by`）
    - 如果沒有風格檔案，告知作者稍後可透過管理技能建立，並使用全域預設繼續
    - 如果作者想現在建立新的風格檔案，引導他們先使用管理技能的風格建立流程，然後回來繼續 brief
    - 如果作者不想要任何風格檔案，`Style:` 留空——回退使用 `writing.config.md` 的全域風格

每個欄位確認後，更新 `brief.md` 並勾選對應的 checklist 項目。

### 步驟三：主題研究（選擇性）

Brief 欄位完成後，詢問作者：「在我們繼續之前，你想先做一些主題研究嗎？」

如果作者婉拒，在 checklist 勾選「Research completed (or skipped)」並跳到步驟四。

如果作者接受：

**3a. 提議研究問題。** 根據 brief 的標題、目標讀者和讀者收穫，以代筆人模式提出 2-3 個研究問題。範例：
- 「社群中目前對 {topic} 的主流做法有哪些？」
- 「{target audience} 在 {topic} 上常遇到什麼問題？」
- 「有沒有與 {reader takeaway} 相關的最新發展或數據？」

**3b. 作者確認或調整。** 作者可以移除、修改或新增自己的研究問題。

**3c. 進行主題研究。** 根據 [topic-researcher-prompt.md](topic-researcher-prompt.md) 中的標準，研究已確認的問題。將研究結果寫入文章目錄中的 `research.md`。這是單次研究，沒有重試迴圈。如果結果不夠充分，作者可以調整問題後重新觸發，或直接略過繼續。

> **平台備註：** 如果你的運行環境支援 blocking subagent dispatch（例如 Claude Code Agent tool），你可以將此研究作為 subagent 執行以獲得更好的隔離性。使用 [topic-researcher-prompt.md](topic-researcher-prompt.md) 作為分派範本。**OpenClaw agents：一律使用 inline review——不要為此步驟啟動 subagent。**

**3d. 呈現研究摘要。** 寫完 `research.md` 後，向作者呈現簡潔的摘要。明確包含對立或不同的觀點——研究是為了拓寬視野，不是確認偏見。

**3e. 在 brief checklist 中勾選「Research completed (or skipped)」。**

### 步驟四：收集既有素材

在開始訪談前，問作者手上有沒有跟這篇文章相關的素材——大綱、筆記、草稿、條列重點、參考連結，或任何已經寫下來的東西。

**如果作者提供素材：**
1. 讀取並整理到 `brief.md` 的 `## Raw Materials` 區段
2. 跟作者回覆你看到的重點，指出哪些已經有了、哪些還缺
3. 進入步驟五（訪談）——但以這些素材作為起點，將問題聚焦在不足的地方和需要更深入的部分

**如果作者沒有既有素材：**
- 沒關係——直接進入步驟五（訪談），從頭開始

### 步驟五：訪談作者

**目的：** 挖掘只有親身經歷者才知道的具體細節、決策、意外和洞察。這些素材是文章的事實基礎。

**如果在步驟四已收集到既有素材**，調整你的訪談策略：
- 跳過素材已回答的問題
- 以素材作為脈絡，提出更有針對性的後續問題
- 根據素材提出假設，讓作者確認或修正
- 聚焦在不足之處：缺少的具體細節、未解釋的決策，或內容單薄的段落
- 如果素材已經夠全面（有具體細節、作者觀點、每個預期區段都有具體內容），你可以直接跳到步驟六（建立大綱）——先與作者確認

**策略：開放式問題 → 主題面向 → 具體追問**

1. **開場**（開放式）：「如果讀者讀完這篇文章只記得一件事，你希望是什麼？」
2. **決策**：「你在過程中做了哪些關鍵選擇？為什麼選擇這個方向？」
3. **意外**：「有什麼是你沒預料到的？有什麼出了差錯？」
4. **洞察**：「回頭看，有什麼是違反直覺的？你會怎麼做不同？」
5. **具體細節**：對任何抽象的回答追問——要求數字、時間線、具體的技術選擇、實際的錯誤訊息、真實的前後對比。

**行為準則：**
- 代筆人模式——你可以根據已知脈絡提出假設讓作者確認或修正，而不是總問空白問題
- 一次一個問題
- 如果作者給了抽象的回答，追問要求具體例子
- 不要僵硬地遵循順序——讓對話自然流動
- 訪談過程中將素材記錄到 `brief.md` 的 `## Raw Materials` 區段（如果已有素材則附加在後面）
- **可恢復性**：如果對話被中斷，讀取 `brief.md` 中已有的 Raw Materials，從中斷處繼續
- **結合研究**：如果 `research.md` 存在，在訪談中引用研究發現以促進更深入的討論。例如：「研究發現對 X 有不同看法——你的經驗是什麼？」

**何時結束：** 當你有足夠的素材來建立一個扎實的大綱。一個好的判斷標準是：每個預期區段至少有一個具體細節或作者引述，且作者已涵蓋 4 個面向（決策、意外、洞察、具體細節）中的至少 3 個。作者隨時可以補充更多。

結束後，在 checklist 勾選「Interview completed」。

### 步驟六：根據素材建立大綱

根據訪談素材，提議一份大綱，每個段落標明目的和對應的素材。

**格式：**

```
### 1. 區段標題
**Purpose:** 這段內容讓讀者得到什麼
**Materials:**
- Author quote: "訪談中的原話"
- Specific detail: 數字、時間線、技術選擇
- Research: {來自 research.md 的洞察，作者已確認納入}
- Context: 理解此區段所需的背景

### 2. 區段標題
**Purpose:** ...
**Materials:**
- ...
```

**關鍵原則：**
- 結構由素材決定——大綱取決於作者實際掌握的內容，而非套用通用範本
- 每個區段都必須有素材——如果某個區段沒有素材，要麼再訪談、要麼刪掉該區段
- 所有素材整理到大綱後，移除 `## Raw Materials` 暫存區（不需要作者確認——素材仍在，只是重新組織了）
- 研究素材使用 `Research:` 前綴——只納入作者已確認要放入文章的研究洞察

跟使用者來回修改直到大綱扎實。將確認的大綱寫入 `brief.md` 的 **Outline** 區段。在 checklist 勾選「Outline with materials completed」。

### 步驟七：就緒檢查

1. 確認所有準備階段的 checklist 項目都已勾選（「Ready for writing」除外）
   - 如果已提供既有素材且訪談被跳過或簡化，「Interview completed」仍應勾選
2. 勾選「Ready for writing」作為最終確認
3. 將 `brief.md` 中的 **Status** 從 `draft` 更新為 `ready`
4. 告知使用者：這篇文章已準備好進入寫作階段

## 產出

一份位於 `{workspace}/articles/{date}_{slug}/` 的完整 `brief.md`，包含：
- 所有 Article Info 欄位已填寫
- Target Audience 已描述
- Source Ideas 已連結
- Article Goals 已定義，含目標對齊
- 風格檔案已選擇（或留空使用全域預設）
- 每個區段都有素材的大綱
- 所有準備階段的 checklist 項目已勾選
- Status 設為 `ready`

使用者可隨時回來修改 brief。

## 你不負責

- 撰寫文章內容（那是寫作技能的工作）
- 審查文章（那是審查技能的工作）

## 行為原則

- **代筆人模式**：總是提議內容讓使用者確認或調整。永遠不要要求使用者從頭寫起。訪談時，提出假設讓作者確認或修正。
- **自然對齊**：在整個過程中自然地引用 `writing.config.md` 的目標。主動建議對齊——不要等別人問。
- **語氣**：合作且不強勢。「這可能是一個好機會來⋯⋯」而非「你必須對齊⋯⋯」

## 參考

- 詳細欄位描述和狀態轉換請見 [brief 格式](references/brief-format.md)
- 預設範本：[brief-template.md](assets/brief-template.md)
