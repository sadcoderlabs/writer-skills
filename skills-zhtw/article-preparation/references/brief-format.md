# brief.md 格式

## 結構

建立新文章時從 `templates/brief-template.md` 複製而來。它追蹤一篇文章的所有規劃資訊和進度。

### 區段

#### Article Info
- **Title**：文章標題（由 AI 提議，使用者確認）
- **Author**：誰在寫這篇文章
- **Style**：風格檔案名稱不含 `.md` 副檔名（例如 `pragmatic-builder`）。指向 `{workspace}/profiles/{style}.md`。留空則使用 `writing.config.md` 中的全域風格。
- **Date**：建立日期
- **Status**：`draft`、`ready`、`writing`、`review`、`published` 之一
  - `draft` → 建立文章目錄時的初始狀態
  - `ready` → 所有準備階段的 checklist 項目已完成，可以開始寫作
  - `writing` → 寫作技能正在產出/修訂草稿
  - `review` → 作者已核准草稿，準備進入審查
  - `published` → 已定稿並發佈
- **Original language**：文章主要語言的語言代碼（例如 `zh`、`en`）。用於文章檔名：`article.{lang}.md`
- **Translations**：翻譯版本的語言代碼，以逗號分隔（例如「en, zh」）。翻譯檔案命名為 `article.{lang}.md`

#### Publishing
保留給發佈工具使用。初始為空。當文章發佈到 CMS 時，發佈工具會在此寫入 target、path、date 和 slug。寫作技能不讀取也不寫入此區段。

#### Target Audience
- **Who**：目標讀者的一行描述
- **Background**：讀者背景脈絡、需求和知識水平的簡短描述
- **Prior state**：讀者在閱讀本文前已經知道什麼、對什麼感到困惑或困擾

#### Source Ideas
引用 `ideas.md` 中觸發這篇文章的原始點子。用於追溯。

#### Article Goals
- **Reader takeaway**：讀者閱讀本文後會獲得什麼
- **Goal alignment**：這篇文章如何連結到 `writing.config.md` 中的目標

#### Style（在 Article Info 中）
Article Info 中的 `Style` 欄位取代了先前的 `## Writing Style` 區段。它指向 `{workspace}/profiles/` 中的風格檔案。如果留空，article-writing 回退使用 `writing.config.md` 中的 `## Writing Style`。

#### Outline
文章的結構，在作者訪談後建立。每個區段包含：
- **Section title**：這段涵蓋文章的什麼內容
- **Purpose**：這段內容讓讀者得到什麼
- **Materials**：來自作者訪談的具體細節、引述、決策、數字和範例，歸在這個段落下

大綱由訪談中收集的素材決定，而非套用通用範本。每個段落都必須有具體素材——如果某個段落沒有素材，應該刪掉或進一步訪談作者。

#### Checklist
追蹤所有技能的進度。

**Preparation**（由文章準備技能管理）：
- 目標讀者已確認
- 文章目標已確認
- 目標對齊已確認
- 語言與翻譯已確認
- 研究已完成（或跳過）——在步驟三的主題研究後勾選，或如果作者婉拒研究則立即勾選
- 訪談已完成
- 含素材的大綱已完成
- 準備好進入寫作

**Writing & Review**（由後續技能管理）：
- 初稿已完成
- 事實查核已完成——在步驟五中所有事實查核發現都由作者解決後勾選
- 審查已完成
- 翻譯已完成
- 定稿

## 狀態轉換

| 從 | 到 | 觸發條件 |
|----|----|---------|
| draft | ready | 所有準備階段的 checklist 項目已完成 |
| ready | writing | 寫作技能開始 |
| writing | review | 作者在修訂輪次後核准草稿 |
| review | published | 定稿 |
