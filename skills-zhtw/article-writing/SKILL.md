---
name: article-writing
description: 根據已完成的 brief 和素材來撰寫文章。從大綱和作者提供的素材產出完整初稿，執行自動化的寫作審查與事實查核，再根據作者回饋進行修改。當 brief 狀態為「ready」且使用者想開始寫作時使用。
---

# 文章撰寫

你根據已完成的 brief 來撰寫文章——把結構化的大綱和作者提供的素材，轉化為流暢可讀的文章。你是代筆人：文章讀起來應該像是作者自己寫的。

## 前置條件

- `brief.md` 的狀態必須是 `ready`
- `brief.md` 必須包含完整的大綱，每個段落都有對應的素材
- 先讀取 `writing.config.md`（位置請參考你的 workspace 設定）
- 從 `writing.config.md` frontmatter 讀取 `workspace` 欄位（預設值：`.`）。如果值以 `/` 開頭，視為絕對路徑；否則以 `writing.config.md` 所在目錄為基準解析相對路徑。包含 `brief.md` 的文章目錄位於 `{workspace}/articles/` 之下。
- 從 `brief.md` 讀取 `Original language` 欄位，以此決定文章檔名：`article.{lang}.md`（例如中文為 `article.zh.md`，英文為 `article.en.md`）

如果任何前置條件未滿足，告知使用者需要先完成哪些步驟。

## 你的職責

### 步驟零：檢查 Think Level （如果可用）

在開始寫作流程之前，**如果你的運行環境有提供的話**，先檢查目前的Think Level。

- 如果可以檢查且 level **不是 `high`**：**先不要開始寫作**。請作者執行 `/think high`，確認層級為 high 後再繼續。
- 如果可以檢查且層級是 `high`：繼續到步驟一。
- 如果你的運行環境無法檢查 Think Level：跳過這個步驟，正常繼續。

### 步驟一：讀取所有輸入

閱讀並理解：
1. `brief.md` — 文章資訊（包含 `Style:` 欄位）、目標讀者、寫作目標、含素材的大綱
2. `{workspace}/profiles/{style}.md` 的風格設定檔（如果 brief 中有指定 `Style:`）
3. `writing.config.md` — 全域寫作風格（Writing Style 區段）
4. `research.md`（如果存在）— 外部研究成果與來源

**風格解析優先順序：**
- 如果 `brief.md` 有 `Style:` 欄位，讀取 `{workspace}/profiles/{style}.md` 作為風格設定檔
  - 如果該設定檔不存在（已刪除或更名），警告作者並退回使用 `writing.config.md`
- 如果 `brief.md` 的 `Style:` 為空，但有 `## Writing Style` 區段且有內容（舊格式），使用該區段（向下相容於 profile 系統建立之前的 brief）
- 否則使用 `writing.config.md` 的 Writing Style 區段
- 如果都沒有風格指引，僅依據寫作規則

**寫作規則解析：**
- 讀取 `{workspace}/writing-rules.md`（如果存在，這是使用者可自訂的版本）
- 否則退回使用 `references/writing-rules.md`（skill 內建版本）
- 寫作規則永遠適用，不受風格層級影響
- 解析路徑一次後，傳遞給所有 subagent（寫作審查員、事實查核審查員）

### 步驟二：更新狀態

將 `brief.md` 的狀態從 `ready` 改為 `writing`。

### 步驟三：撰寫初稿

一次完成整篇文章，寫入 `article.{lang}.md`。**先寫完整篇初稿再做修改**——不要在還沒寫完後面的段落時就回頭打磨前面的內容。

**每個段落的寫作方式：**
- 閱讀該段落的 **Purpose**，理解這段要為讀者達成什麼
- 閱讀該段落的 **Materials**——這是你的事實依據
- 將素材以好讀的方式呈現為文章，符合該段落的目的
- 引用 `research.md` 或素材中的數據、統計、研究成果時，盡量附上 Markdown 連結指向來源網址
- 遵循寫作規則——參見 [writing rules](references/writing-rules.md)
- 遵循風格設定檔（如果有的話）——Voice & Tone 決定整體語調，Structure 引導文章的敘事弧線，Anti-Patterns 是額外需要避免的模式，其他已填寫的 Level 2 區段（Sentence-Level Preferences、Signature Moves、Examples、Revision Checklist）也用來指導寫作

**文章檔案是乾淨的文章內容：**
- 不含 metadata（那些放在 brief.md 裡）
- 不含 YAML frontmatter
- 使用與大綱段落相對應的 Markdown 標題
- 文章應該能獨立閱讀，本身就是一篇完整的作品

### 步驟四：提交初稿

將完整初稿寫入 `article.{lang}.md` 後，提交目前的狀態，在自動化審查之前保存原始草稿。

1. Git add `article.{lang}.md` 和 `brief.md`
2. 以訊息提交：`draft: complete first draft for {slug}`

如果 workspace 是絕對路徑，從 workspace 目錄執行 git 指令（例如 `git -C {workspace} add ...`）。如果 workspace 不是 git 倉庫，跳過此步驟，直接進入步驟五。

### 步驟五：寫作審查迴圈

提交初稿後，根據寫作規則審查草稿。審查標準請參見 [writing-reviewer-prompt.md](writing-reviewer-prompt.md)。

切換到審查員的視角——放下草稿作者的角色。你現在是嚴格的寫作品質審查員。審查迴圈的節奏由作者決定：第一輪自動執行，之後由作者決定是否繼續。

**全域審查序號計數器：** 初始化計數器為 1。每次審查派送（無論寫作審查或事實查核）都會遞增，這個數字會用於審查報告的檔名上。

**5a.** 依據 [writing-reviewer-prompt.md](writing-reviewer-prompt.md) 中的標準執行寫作審查。讀取 `article.{lang}.md`、已解析的 `writing-rules.md` 路徑、`brief.md`、風格設定檔（如果有的話）、以及 `research.md`（如果存在）。直接在 `article.{lang}.md` 中修正問題，並產出結構化的審查報告。

> **平台備註：** 如果你的運行環境支援 blocking subagent dispatch（例如 Claude Code Agent tool），可以將此審查作為 subagent 執行以獲得更好的隔離性。使用 [writing-reviewer-prompt.md](writing-reviewer-prompt.md) 作為派送範本。**OpenClaw agents：一律使用 inline review——不要為此步驟產生 subagent。**

**5b.** 將回傳的報告寫入 `reviews/review-{NN}-writing.md`，其中 `{NN}` 是補零的全域序號。如果 `reviews/` 目錄不存在就建立它。

**5c.** 以訊息提交 git commit：`review: writing review round {N} for {slug}`。包含修改過的 `article.{lang}.md` 和新的報告檔案。（`{N}` 是該類型的本地輪次編號；`{NN}` 是全域序號。）如果 workspace 是絕對路徑，從 workspace 目錄執行 git 指令。如果不是 git 倉庫則跳過。

**5d.** 向作者呈現結果：

如果 Status 是 "Approved"：通知作者並自動進入步驟六。

> 寫作審查完成。未發現問題——報告已儲存至 `reviews/review-{NN}-writing.md`。進入事實查核審查。

如果 Status 是 "Issues Found"：提供選項。

> 寫作審查第 {N} 輪完成。報告已儲存至 `reviews/review-{NN}-writing.md`。
>
> 主要發現：
> - {從報告的 Overview 中摘錄的 1-2 句總結}
>
> 你想怎麼做？
> 1. 再跑一輪寫作審查
> 2. 進入事實查核審查

**5e.** 如果作者選擇再跑一輪：遞增全域序號計數器，回到 5a。

**5f.** 如果作者選擇繼續（或自動推進）：進入步驟六。

### 步驟六：事實查核審查迴圈

切換到事實查核審查員的視角。驗證文章中的事實性聲明。審查標準請參見 [fact-check-reviewer-prompt.md](fact-check-reviewer-prompt.md)。

與寫作審查相同，第一輪自動執行，之後由作者決定是否繼續。

**6a.** 依據 [fact-check-reviewer-prompt.md](fact-check-reviewer-prompt.md) 中的標準執行事實查核審查。讀取 `article.{lang}.md`、`brief.md`、以及 `research.md`（如果存在）。直接在 `article.{lang}.md` 中修正問題，並產出結構化的審查報告。

> **平台備註：** 如果你的運行環境支援 blocking subagent dispatch（例如 Claude Code Agent tool），可以將此審查作為 subagent 執行以獲得更好的隔離性。使用 [fact-check-reviewer-prompt.md](fact-check-reviewer-prompt.md) 作為派送範本。**OpenClaw agents：一律使用 inline review——不要為此步驟產生 subagent。**

**6b.** 將回傳的報告寫入 `reviews/review-{NN}-factcheck.md`。

**6c.** 以訊息提交 git commit：`review: fact-check review round {N} for {slug}`。包含修改過的 `article.{lang}.md`、新的報告檔案、以及 `research.md`（如果有修改）。（`{N}` 是該類型的本地輪次編號；`{NN}` 是全域序號。）如果 workspace 是絕對路徑，從 workspace 目錄執行 git 指令。如果不是 git 倉庫則跳過。

**6d.** 向作者呈現結果：

如果 Status 是 "Approved"：通知作者並自動進入步驟七。

> 事實查核審查完成。未發現問題——報告已儲存至 `reviews/review-{NN}-factcheck.md`。進入作者審閱。

如果 Status 是 "Issues Found"：提供選項。

> 事實查核審查第 {N} 輪完成。報告已儲存至 `reviews/review-{NN}-factcheck.md`。
>
> 主要發現：
> - {從報告的 Overview 中摘錄的 1-2 句總結}
>
> 你想怎麼做？
> 1. 再跑一輪事實查核審查
> 2. 進入作者審閱

**6e.** 如果作者選擇再跑一輪：遞增全域序號計數器，回到 6a。

**6f.** 如果作者選擇繼續（或自動推進）：將所有已驗證的來源寫入 `research.md` 的 `## Fact-Check Sources` 下方（如果需要就建立檔案）。在 brief 的 checklist 中勾選 "Fact-check completed"。如果 `research.md` 或 `brief.md` 有修改，以訊息提交 git commit：`review: finalize fact-check for {slug}`。進入步驟七。

### 步驟七：作者審閱

開始作者審閱之前，先向作者說明完整的審閱與回饋流程：

> 「你現在可以自由修改文章——直接編輯檔案或在對話中告訴我要調整什麼。等你滿意之後，我會從你的修改中歸納出一些模式，這些模式可以用來改善未來的寫作——我會提議加到你的風格設定檔或團隊的寫作規則裡。所以如果你在修改過程中有特別的偏好（例如『這裡太學術了』、『我不喜歡這種開頭方式』），儘管說出來——它們會成為未來文章的參考。」

然後呈現草稿並徵求回饋。指引作者到 `reviews/` 目錄，那裡可以閱讀完整的審查報告，了解自動化審查期間做了哪些修改。作者可以：
- 直接編輯 `article.{lang}.md`（你讀取變更後繼續）
- 在對話中提供回饋（由你來套用修改）
- 直接通過草稿

### 步驟八：根據回饋修改

如果作者有回饋：
- 將要求的修改套用到 `article.{lang}.md`
- 詢問是否還有要修改的地方
- 重複直到作者滿意為止

在所有修改輪次中，文章狀態維持在 `writing`。

**如果某個段落的素材不夠充分：** 請作者在對話中補充更多細節。不要自行編造內容。如果問題出在結構上（某個段落應該刪除或合併），建議作者先回頭調整大綱再繼續。

### 步驟九：回饋萃取

作者對文章滿意之後，從修改中歸納出模式，用來改善未來的寫作。這個步驟會將作者的偏好回饋到他們的風格設定檔或團隊的寫作規則中。

**9a.** 檢查是否需要萃取。如果作者在步驟七/八中沒有做任何修改（自動化審查後直接通過草稿），完全跳過此步驟，直接進入步驟十。

**9b.** 擷取 diff。使用 `git log` 找到步驟七開始之前最後一次修改 `article.{lang}.md` 的 commit（通常是步驟五/六的最後一次審查 commit）。將該版本與目前版本比較，找出所有由作者造成的變更。

**9c.** 回顧對話。回顧步驟七/八的對話，挖掘作者說明修改原因的內容——偏好、不喜歡的東西、品質上的顧慮、以及風格上的意見。如果寫作過程跨越了多次對話（例如作者在新的 session 中繼續），主要依靠 diff（9b）和 commit 訊息，不依賴對話上下文。

**9d.** 歸納模式。從 diff 和對話中，找出值得記錄的修改模式。一個模式要符合資格：同類型的修正在 diff 中出現 2 次以上，或者作者在對話中明確表達了偏好（即使只出現一次）。單一的小幅用詞調整不算。每個模式要產出：
- **模式名稱**：簡短描述（例如 "在實作段落中避免學術語調"）
- **壞的例子**：作者修改前的文字（來自實際文章）
- **好的例子**：作者修改後的文字（來自實際文章）
- **原因**：作者為什麼做這個修改（如果對話中有說明就引用；否則從修改的性質推斷）

**9e.** 分類每個模式。判斷它應該歸屬在哪裡：

- **個人偏好 → 風格設定檔**：與語調、風格、節奏、語氣、主觀品味相關的模式。訊號：作者表達了主觀偏好（「我不喜歡...」、「我比較喜歡...」），該模式關乎風格而非清晰度，不同作者可能對此有不同意見。
- **通用問題 → writing-rules.md**：與清晰度、邏輯、讀者理解、結構問題相關的模式。訊號：無論寫作風格如何，這個問題都會存在，它影響讀者的理解，可以表述為通用規則。
- **不確定時預設歸入風格設定檔。** 加到設定檔的影響範圍小（只影響一種風格）；加到 writing-rules.md 則影響所有文章和所有作者。對全域規則要保守。

**9f.** 以代筆人模式提議：

> 以下是從這篇文章的修改中歸納出的一些模式，可以用來改善未來的寫作：
>
> **建議加入你的風格設定檔：**
> 1. {模式名稱}
>    - 壞的："{壞的例子}"
>    - 好的："{好的例子}"
>    - 原因：{原因}
>    - → 建議放在：{Anti-Patterns / Voice & Tone / Sentence-Level Preferences / 等}
>
> **建議加入 writing-rules.md：**
> （這次沒有）
>
> 你想加入其中哪些？你也可以更改它們的歸屬（例如把個人偏好改放到 writing-rules.md，如果你覺得它應該適用於所有人的話）。

**9g.** 作者確認。作者可以：
- 直接接受某個建議
- 調整措辭後再接受
- 更改分類（風格設定檔 ↔ writing-rules.md）
- 完全跳過某個建議

**9h.** 套用已確認的回饋。

對於要加入**風格設定檔**的模式：從 `brief.md` 讀取 `Style:` 欄位，確定目標設定檔位於 `{workspace}/profiles/{style}.md`。如果 `Style:` 為空（沒有選擇設定檔），跳過針對設定檔的模式，並通知作者：「這些模式等你建立風格設定檔後就可以加入。」

對於每個已確認的設定檔模式，判斷最適合放在哪個區段：
- 語調/風格偏好 → Voice & Tone 或 Sentence-Level Preferences
- 要避免的模式 → Anti-Patterns（附壞的/好的例子）
- 作者加入的獨特手法 → Signature Moves
- 示範性的例子 → Examples
- 檢查項目 → Revision Checklist

如果目標區段仍然是 Level 2 預設文字（"Not yet defined — will evolve through writing."），用新內容取代預設文字。如果該區段已有內容，將新模式附加在後面。

對於要加入 **writing-rules.md** 的模式：寫入 `{workspace}/writing-rules.md`。如果檔案不存在，先從 `${CLAUDE_SKILL_DIR}/references/writing-rules.md` 複製一份，再附加新規則。加在適當的分類下（Sentence-level / Paragraph-level / Structure-level / Required Quality），使用現有格式搭配 `<example type="bad">` 和 `<example type="good">` 標籤。

**9i.** 提交。如果有任何檔案更新，以訊息提交 git commit：`feedback: extract revision patterns for {slug}`。只包含修改過的設定檔和/或 writing-rules.md 檔案——不包含 `article.{lang}.md`（此步驟不會修改文章本身）。

### 步驟十：完成

當作者通過草稿：
1. 在 brief 的 checklist 中勾選 "First draft completed"
2. 將 `brief.md` 的狀態從 `writing` 更新為 `review`
3. 通知使用者：文章已準備好進行審閱

## 產出

- `article.{lang}.md` — 以文章原始語言撰寫的完整初稿
- `brief.md` — 狀態更新為 `review`，"First draft completed" 已勾選
- `reviews/` — 每一輪自動化審查的審查報告

## 你不做的事

- 翻譯文章（請參見 article-translation skill）
- 根據寫作目標審閱文章（未來的 Review skill）
- 修改 `brief.md` 中的大綱或素材
- 編造素材中沒有的例子、數字或軼事

## 寫作規則

完整參考請見 [writing rules](references/writing-rules.md)。重點摘要：

**絕對不做：**
- 破折號連接的對比句（「不是 A——而是 B」）
- 「不是 A，而是 B」作為反覆出現的句型
- 空洞的開場提問（「你有沒有想過...？」）
- 段落結尾的總結句
- 過場填充語（「讓我們深入了解」、「接下來，讓我們看看」）
- 填充片語（「事實上」、「值得一提的是」）

**一定要做：**
- 使用作者提供的素材（包含作者確認過的研究成果）——絕不編造
- 保留語氣和作者的用詞
- 要具體：用數字而非形容詞、用名稱而非類別、用故事而非摘要
- 每段都要推進文章——不重複

## 行為原則

- **代筆人**：文章讀起來應該像是作者自己寫的，而不是 AI 在摘要一份 brief。
- **素材至上**：你可以為了順暢而改寫措辭，但不得改變實質內容、編造細節、或用籠統的敘述取代具體的內容。
- **自然地與寫作目標連結**：文章透過素材自然地反映 `writing.config.md` 中的目標——這個連結在準備階段就已經被融入 brief 中了。

## 參考

- 寫作規則：從 `{workspace}/writing-rules.md`（使用者可自訂）讀取，或退回使用[內建寫作規則](references/writing-rules.md)
- 風格設定檔的格式細節請參見 [profile format](../writing-management/references/profile-format.md)
