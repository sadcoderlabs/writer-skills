# 錯誤驅動回饋循環設計

## 概述

在 article-writing 的寫作流程中新增一個「回饋萃取」步驟，從作者的人工修訂（Step 7/8）中捕捉修正模式，回饋到 Style Profile 或 workspace 的 writing-rules.md。讓寫作品質隨著每篇文章的修訂自然提升 — 每篇文章的修正都會成為未來的寫作指引。

靈感來自 [Every.to AI Style Guide](https://every.to/guides/ai-style-guide) 的錯誤驅動更新概念：「每次編輯修正都會回饋到指南中，讓同樣的錯誤不會再犯第二次。」

## 動機

目前 article-writing 的流程有兩個審核階段：
1. **自動審核**（Step 5/6）— 根據 writing-rules.md 和 style profile 自動抓出違規
2. **作者人工審核**（Step 7/8）— 作者透過對話修訂文章

自動審核的結果已經有結構化的 review report（`reviews/`）。但作者的人工修訂 — 代表著規則和 profile 尚未捕捉到的真實偏好和洞察 — 在對話結束後就消失了。同樣的問題可能在未來的文章中重複出現。

### 為什麼只針對作者修訂，不處理自動審核

自動審核的修正來自已經存在的規則。如果同一條規則反覆被觸發，作者自然會主動把它加到自己的 profile 或 writing-rules.md 裡，不需要額外自動化。

作者的人工修訂則代表**新知識** — 是現有規則和 profile 還沒涵蓋到的偏好、模式和品質標準。這些修正如果不被萃取出來，作者在下一篇文章時就得重複給出同樣的回饋。

## 設計

### 改動範圍

只修改 `skills/article-writing/SKILL.md` 一個檔案。不新增檔案、不新增模板、不改動其他技能。

### Step 編號變更

| 現有 | 新 | 變更 |
|------|-----|------|
| Step 7: Author Review | Step 7: Author Review | 開頭加入流程說明 |
| Step 8: Revise Based on Feedback | Step 8: Revise Based on Feedback | 不變 |
| — | **Step 9: Feedback Extraction** | **新增步驟** |
| Step 9: Complete | Step 10: Complete | 僅重新編號 |

### Step 7 修改：流程說明

在 Step 7 現有內容（呈現草稿、詢問回饋）之前，先向作者說明完整流程：

> 在開始作者審核前，先向作者說明流程：
>
> 「接下來你可以自由修訂文章 — 直接改檔案或在對話中告訴我要怎麼調整。修訂完成後，我會回顧你的修正，萃取出可以改善未來寫作的模式，建議加到你的 Style Profile 或團隊的寫作規則裡。所以如果你在修訂時有具體的偏好（例如『這段太學術了』『我不喜歡這種開場方式』），儘管說出來，這些都會成為未來寫作的參考。」

這段說明設定了期望，並鼓勵作者在修訂時清楚表達理由，而不只是要求改動。

### Step 9: 回饋萃取（新增）

在作者確認對文章滿意後（Step 8 結束），標記文章完成前（Step 10）：

**9a. 檢查是否需要萃取。** 如果作者在 Step 7/8 沒有任何修訂（自動審核後直接通過），跳過整步，直接進入 Step 10。

**9b. 提取 diff。** 比對最後一輪自動審核 commit 的版本（Step 5 或 Step 6 結束時）和作者修訂後的當前版本。這個 diff 代表所有作者造成的修改。

**9c. 回顧對話。** 回顧 Step 7/8 的對話內容，提取作者表達的修正理由 — 偏好、不喜歡的地方、品質問題、風格意見。

**9d. 歸納模式。** 從 diff 和對話中辨識出重複或顯著的修正模式。每個模式包含：
- **模式名稱**：簡短描述（例如「在實用段落中避免學術語氣」）
- **反例**：作者修訂前的文字（來自實際文章）
- **正例**：作者修訂後的文字（來自實際文章）
- **原因**：作者為什麼做這個修改（從對話中提取，如果有的話；否則從修改的性質推斷）

**9e. 分類每個模式。** 判斷每個模式應該放到哪裡：

- **個人偏好 → Style Profile**：與語氣、風格、節奏、聲音、主觀品味相關的模式。判斷信號：作者表達了主觀偏好（「我不喜歡⋯」「我比較想要⋯」）、模式與風格有關而非清晰度、不同作者可能對此有不同意見。
- **通用問題 → writing-rules.md**：與清晰度、邏輯、讀者理解、結構問題相關的模式。判斷信號：無論什麼寫作風格這都是問題、影響讀者理解、可以被表述為一條通用規則。
- **不確定時預設歸入 Profile。** 加到 profile 的影響範圍小（一種風格）；加到 writing-rules.md 影響所有文章和所有作者。對全域規則要保守。

**9f. 提案。** 以 ghostwriter mode 呈現給作者：

> 以下是這篇文章中的修訂模式，可以用來改善未來的寫作：
>
> **建議加到你的 Style Profile：**
> 1. {模式名稱}
>    - 反例：「{反例}」
>    - 正例：「{正例}」
>    - 原因：{原因}
>    - → 建議放到：{Anti-Patterns / Voice & Tone / Sentence-Level Preferences / 等}
>
> **建議加到 writing-rules.md：**
> （這次沒有）
>
> 要把這些加進去嗎？你也可以改變分類（例如把個人建議改放到 writing-rules.md，如果你覺得應該適用於所有人）。

**9g. 作者確認。** 作者可以：
- 直接接受建議
- 調整措辭後再接受
- 改變分類（Profile ↔ writing-rules.md）
- 跳過某個建議

**9h. 套用已確認的回饋。**

對於要加到 **Style Profile**（`{workspace}/profiles/{style}.md`）的模式：
- 根據模式的性質判斷最適合的 section：
  - 語氣/風格偏好 → Voice & Tone 或 Sentence-Level Preferences
  - 要避免的模式 → Anti-Patterns（附正反例）
  - 作者主動加入的獨特手法 → Signature Moves
  - 說明性的範例 → Examples
  - 檢查項目 → Revision Checklist
- 如果目標 section 還是 Level 2 的 placeholder（「Not yet defined — will evolve through writing.」），用新內容取代 placeholder。這就是 profile 從 Level 1 自然成長到 Level 2 的機制。
- 如果 section 已經有內容，把新模式附加到後面。

對於要加到 **writing-rules.md**（`{workspace}/writing-rules.md`）的模式：
- 加到適當的分類下（Sentence-level / Paragraph-level / Structure-level / Required Quality）
- 使用現有格式，搭配 `<example type="bad">` 和 `<example type="good">` 標籤

**9i. Commit。** 如果有檔案被更新，以 `feedback: extract revision patterns for {slug}` 為 commit message。包含修改過的 profile 和/或 writing-rules.md 檔案。

### Step 10: Complete（從 Step 9 重新編號）

內容不變 — 只有步驟編號從 9 改為 10。

## 不做的事

- 不改動自動審核流程（Step 5/6）
- 不改動 review report 格式
- 不新增檔案或模板
- 不做跨文章分析（每篇文章獨立萃取回饋，模式的累積由作者自己判斷）
- 不自動新增模式 — ghostwriter mode 永遠只是提案，作者永遠有最終決定權

## 需要更新的檔案

| 檔案 | 變更 |
|------|------|
| `skills/article-writing/SKILL.md` | Step 7 加入流程說明、新增 Step 9（回饋萃取）、Step 9 重新編號為 Step 10 |
