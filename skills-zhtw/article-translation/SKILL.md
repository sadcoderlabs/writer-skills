---
name: article-translation
description: 將完成的文章翻譯為 brief 中指定的目標語言。支援中英雙向翻譯（zh↔en）並搭配自動化審查。當文章狀態為「review」或「published」且 brief 中指定了目標語言時使用。
---

# 文章翻譯

你負責將完成的文章翻譯為目標語言。你從一篇已完成、經作者核准的文章出發，產出自然的翻譯，保留作者的聲音、語氣和具體細節。

## 前置條件

- 先讀取 `writing.config.md`（位置請參考你的工作區設定）
- 從 `writing.config.md` frontmatter 讀取 `workspace` 欄位（預設值：`.`）。如果值以 `/` 開頭，視為絕對路徑；否則相對於 `writing.config.md` 所在目錄解析。包含 `brief.md` 的文章目錄位於 `{workspace}/articles/` 內。
- `brief.md` 的狀態必須為 `review` 或 `published`
- `brief.md` 必須有非空的 `Translations` 欄位
- `article.{original_lang}.md` 必須存在，其中 `{original_lang}` 來自 `brief.md` 的 `Original language` 欄位

如果任何前置條件未滿足，請告知使用者需要先完成什麼。

## 支援語言

- `zh` — 繁體中文
- `en` — English

如果 `Translations` 包含不支援的語言代碼，請告知使用者並跳過。

## 你的職責

### 步驟一：讀取上下文

閱讀並理解：
1. `writing.config.md` — 解析工作區路徑
2. `brief.md` — 文章資訊、目標讀者、目標、原始語言、目標語言
3. `article.{original_lang}.md` — 要翻譯的原文
4. 翻譯規則 — 參見[翻譯規則](references/translation-rules.md)
5. 寫作規則 — 參見[寫作規則](${CLAUDE_SKILL_DIR}/../article-writing/references/writing-rules.md)

從 `brief.md` 判斷翻譯方向：
- `Original language` 欄位 → 原始語言
- `Translations` 欄位 → 目標語言

驗證文章狀態為 `review` 或 `published`。如果不是，告知使用者並停止。

### 步驟二：翻譯

以專業、理性的語氣將文章翻譯為各目標語言。

遵循[翻譯規則](references/translation-rules.md)中的內容元素規則：
- 將標點符號轉換為目標語言的慣例
- 翻譯程式碼區塊中的原始語言註解；保留目標語言的註解和所有程式碼不變
- 翻譯圖片 alt 文字和連結文字；路徑和 URL 保持不變
- 技術術語維持原文形式（Redis、Claude、Astro 等）
- 完整保留所有 markdown 格式

**品質約束：**
- 精神上套用 `writing-rules.md` 的禁止模式 — 翻譯不得引入原文所避免的 AI 寫作模式
- 英文輸出：不使用破折號對比句式、空洞的開場提問、填充用語、重述段落的總結句、過渡填充語
- 中文輸出：避免翻譯腔、過多「的」、不自然的被動語態
- 所有中文輸出必須是繁體中文 — 不得出現簡體字

將翻譯寫入同一文章目錄下的 `article.{target_lang}.md`。

### 步驟三：自動化審查迴圈

執行自動化審查迴圈（最多 3 輪）以捕捉常見的 AI 翻譯錯誤。

切換到翻譯審查者視角 — 放下你的譯者角色。你現在是一位嚴格的翻譯品質審查者。審查標準參見 [translation-review-prompt.md](references/translation-review-prompt.md)。

**3a.** 使用 [translation-review-prompt.md](references/translation-review-prompt.md) 中的標準執行翻譯審查。閱讀原文、譯文、`references/translation-rules.md` 和 `writing-rules.md`。直接在 `article.{target_lang}.md` 中修正問題。

> **平台備註：** 如果你的執行環境支援 blocking subagent dispatch（例如 Claude Code Agent tool），可以將此審查作為子代理執行以獲得更好的隔離性。使用 [translation-review-prompt.md](references/translation-review-prompt.md) 作為派遣範本。每輪超時時間至少設為 5 分鐘。**OpenClaw agents：一律使用 inline review — 不要為此步驟產生子代理。**

**3b.** 如果審查未發現問題（「PASS」）：進入步驟四。

**3c.** 如果發現問題並已修正（「FIXED」）：遞增輪次計數器。如果輪次 < 3，回到 3a。如果輪次 = 3，進入步驟四。

### 步驟四：收尾

1. 在 `brief.md` 的 checklist 中勾選「Translations completed」
2. Git commit，訊息為：`content: add {target_lang} translation for {slug}`
   - 包含 `article.{target_lang}.md` 和 `brief.md`
   - 如果工作區是絕對路徑，從工作區目錄執行 git 指令。如果不是 git 儲存庫則跳過。

## 輸出

- `article.{target_lang}.md` — 各目標語言的翻譯文章
- `brief.md` — 「Translations completed」checklist 項目已勾選

## 你不做的事

- 修改原文文章
- 更改文章的狀態欄位
- 將翻譯檔案發佈到 CMS（未來的發佈 skill）
- 捏造原文中不存在的內容
- 翻譯技術術語（維持原文形式）

## 行為原則

- **保留語氣**：翻譯應讀起來像是作者直接用目標語言寫的。不要把有特色的表達方式壓平成泛泛的文字。
- **素材至上**：翻譯傳達作者所說的內容 — 不增加、不省略、不做編輯性修改。
- **專業語氣**：所有翻譯使用適合技術部落格的理性、專業風格。
