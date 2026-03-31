---
name: x-engagement
description: 每日 X 互動探索與策展。透過 Grok 搜尋值得互動的推文，驗證內容真實性，策展推薦清單並附上草稿文案，輸出到收件匣由人工執行。適用於執行每日互動例行工作、尋找值得回應的推文，或使用者提到想更積極經營 X/Twitter 時觸發。
---

# X 互動

你負責每日探索與策展 X（Twitter）互動機會。搜尋值得互動的推文、撰寫回覆／引用文案，並產出推薦清單供人工執行。

**為什麼要人工執行？** X API 永久限制了回覆、引用和轉推操作，只開放發文和按讚。所有互動動作都由人工執行。

## 前置條件

- 倉庫根目錄必須存在 `writing.config.md`
- 從 `writing.config.md` frontmatter 讀取 `workspace` 欄位（預設：`.`）。若值以 `/` 開頭，視為絕對路徑；否則相對於倉庫根目錄解析。
- 必須設定 `XAI_API_KEY` 環境變數（xAI API key，供 Grok 使用）

如果 `writing.config.md` 沒有 `## Engagement` 區段，引導使用者完成設定：
1. 詢問偏好的通知頻道（例如 `slack:CHANNEL_ID`、`discord:#channel`、`terminal`）
2. 詢問偏好的排程時間（例如 `11:00 GMT+9`）
3. 確認搜尋語言（預設：`en`）
4. 詢問使用者的語言——他們閱讀和思考時使用的語言（預設：與搜尋語言相同）。當使用者語言與搜尋語言不同時，通知會包含雙語內容。
5. 將 `## Engagement` 區段附加到 `writing.config.md`

如果 `{workspace}/engagement/` 不存在，建立：
- `{workspace}/engagement/` 目錄
- `{workspace}/engagement/interests.yaml`，使用空結構：
  ```yaml
  keywords: []
  hashtags: []
  accounts: []
  ```
- 引導使用者加入他們的興趣（關鍵字、hashtag、追蹤的帳號）

## 你的職責

### 步驟一 — 環境檢查

1. 讀取 `writing.config.md` 並解析 workspace 路徑
2. 確認 `## Engagement` 區段存在（若缺少則進行設定，參見前置條件）
3. 確認 `{workspace}/engagement/interests.yaml` 存在（若缺少則初始化）
4. 讀取 Engagement 設定值：通知頻道、排程、語言

### 步驟二 — 探索

執行探索腳本：

```bash
cd ${CLAUDE_SKILL_DIR} && bun scripts/discover.ts {workspace}/engagement
```

這個腳本會：
1. 讀取 `{workspace}/engagement/interests.yaml`
2. 呼叫 Grok x_search 搜尋過去 48 小時的推文
3. 透過 Twitter Syndication API 驗證每則推文（捕捉 Grok 幻覺）
4. 將已驗證的候選推文輸出到 `{workspace}/engagement/candidates.yaml`

**執行前：** 讀取過去一週的工作記憶（MEMORY.md、近期對話脈絡）。擷取反映團隊目前正在建構、使用或討論內容的補充關鍵字。在腳本執行後解讀和篩選搜尋結果時帶入這些脈絡。這是必要步驟——團隊的近期經驗決定了哪些推文值得互動。

**執行後：** 讀取 `{workspace}/engagement/candidates.yaml` 查看已驗證的候選推文。

### 步驟三 — 策展與審查

#### 3a. 讀取品質參考資源（必要，按此順序）

在撰寫任何草稿之前，讀取以下所有資源：

1. `{workspace}/social-style-guide.md` → **Persona** 段落。如果內容是佔位文字（"Not yet defined"），停下來引導使用者先設定 Persona 再繼續（參見下方 Persona 設定引導）。
2. `{workspace}/social-style-guide.md` → **Voice**、**Anti-Patterns**、**Good/Bad Examples** 段落（仍為佔位文字的段落跳過）
3. `${CLAUDE_SKILL_DIR}/../post-writing/references/post-rules.md` → 禁止模式、品質要求
4. `${CLAUDE_SKILL_DIR}/references/engagement-rules.md` → 策展標準（什麼值得互動、動作類型、數量）
5. `${CLAUDE_SKILL_DIR}/references/experience-verification.md` → 經驗等級分類（決定每個候選推文的文案角度）

**Persona 設定引導：** 以 `writing.config.md` 的 About + Writing Goals 為起點。以代筆模式一次問使用者一個問題：
- 你在社群媒體上的身份是什麼？（工程師、團隊帳號、創辦人⋯）
- 你的核心專長是什麼？（你實際在做什麼）
- 你想投射什麼形象？（實踐者、觀察者、教育者⋯）
- 你貼文中的「我」是誰？（第一人稱個人 vs. 團隊的「我們」）
將回答整合成一段 Persona 描述，向使用者確認後寫入 social-style-guide.md。

#### 3b. 篩選候選推文並撰寫草稿

讀取 `{workspace}/engagement/candidates.yaml` 並結合內部脈絡：
- `{workspace}/articles/` 中近期的文章（掃描過去兩週的標題和 brief）
- `{workspace}/posts/` 中近期的貼文（過去兩週）
- `{workspace}/ideas.md` 中待處理的靈感
- Agent 工作記憶（如果有的話）

**逐一分類候選推文的經驗等級（必要）：** 對每則候選推文，依照 `references/experience-verification.md` 判定你的經驗等級。檢查工作記憶和剛才蒐集的 workspace 內容。分類為 Direct、Adjacent、Inverse 或 None。這個分類決定你的文案角度——如果是 None，將動作降級為按讚或跳過（不撰寫回覆／引用草稿）。

對每則值得互動的候選推文：

1. **決定動作類型**：reply、quote、retweet、like 或 post（參見 engagement-rules.md）
2. **撰寫文案**（reply／quote／post 動作）：寫 3 個版本。每個版本必須：
   - 聽起來像 Persona 描述的那個人（不是通用的 AI 助手）
   - 包含來自實際經驗的具體細節（專案名稱、數字、特定工具）
   - 避免 post-rules.md 中所有禁止模式
   - 不能與 social-style-guide.md 中的任何 Bad Example 相似

#### 3c. 自動審查迴圈（最多 3 輪）

切換到審查者視角——放下你草稿作者的角色。你現在是嚴格的品質審查者。使用 [engagement-reviewer-prompt.md](engagement-reviewer-prompt.md) 中的標準批次審查所有草稿。讀取並套用：
- `${CLAUDE_SKILL_DIR}/../post-writing/references/post-rules.md`
- `{workspace}/social-style-guide.md`
- 每個項目的原始推文內容

使用 prompt 模板中指定的相同輸出格式（逐版本通過／不通過，附具體理由）。

**審查完成後：**
- **所有版本通過** → 進入 3d
- **部分版本未通過** → 只改寫未通過的版本（根據具體回饋），然後再次審查改寫後的版本
- **3 輪後仍有未通過** → 在通知（步驟四）中將那些項目標記 `⚠️`，提醒使用者文案品質不確定

> **平台備註：** 如果你的 runtime 支援 blocking subagent dispatch（例如 Claude Code Agent tool），可以將這個審查作為 subagent 執行以獲得更好的隔離性。使用 [engagement-reviewer-prompt.md](engagement-reviewer-prompt.md) 作為 dispatch 模板。**OpenClaw agents：一律使用 inline review——不要為此步驟產生 subagent。**

#### 3d. 寫入收件匣

使用 `bun scripts/add.ts` 將每個推薦項目寫入收件匣：

```bash
cd ${CLAUDE_SKILL_DIR} && bun scripts/add.ts \
  --url "https://x.com/user/status/123" \
  --action reply \
  --drafts "Version A text" "Version B text" "Version C text" \
  --reason "Why this tweet is worth engaging" \
  --inbox {workspace}/engagement/inbox.yaml
```

轉推／按讚動作（不需要草稿）：

```bash
cd ${CLAUDE_SKILL_DIR} && bun scripts/add.ts \
  --url "https://x.com/user/status/123" \
  --action like \
  --reason "Why this tweet is worth liking" \
  --inbox {workspace}/engagement/inbox.yaml
```

新增所有項目後，更新 `{workspace}/engagement/inbox.yaml` 中每個新增項目的 `author` 和 `content` 欄位（add 腳本會建立佔位值；從 candidates.yaml 的資料填入）。

**數量目標：** 每日 2-5 則推薦（品質重於數量）。

### 步驟四 — 通知使用者

從 `writing.config.md` → `## Engagement` 讀取通知頻道和使用者語言。

**雙語模式：** 當 `User language` 與 `Language`（搜尋語言）不同時，通知中的所有內容必須是雙語的——原始推文內容、草稿文案和 UI 文字都以兩種語言呈現。這讓使用者能用自己的語言快速理解所有內容，同時擁有可直接發布的英文文案。

格式化每日推薦摘要：

**單語模式**（使用者語言 = 搜尋語言）：

```
🐦 Today's X Engagement Recommendations

📌 Reply to @author
https://x.com/author/status/123
Original: "Tweet content..."
Why this tweet: Reason for engaging — what makes this worth replying to.

Version A: "Draft A..."
  → Strategy: Why this version takes this angle (e.g., "self-deprecating confession — we have the same problem")
Version B: "Draft B..."
  → Strategy: Why this version takes a different angle
Version C: "Draft C..."
  → Strategy: Why this version takes yet another angle

🔁 Retweet @author
https://x.com/author/status/789
Why: Reason for retweeting.

👍 Like @author
https://x.com/author/status/012
Why: Reason for liking.

💡 New post idea (inspired by @author)
Why: What sparked this idea.

Version A: "Draft A..."
  → Strategy: What angle this version takes
Version B: "Draft B..."
  → Strategy: What angle this version takes
Version C: "Draft C..."
  → Strategy: What angle this version takes

---
Run post-writing skill to refine drafts
```

**雙語模式**（例如使用者語言：zh，搜尋語言：en）：

```
🐦 今日 X 互動推薦

📌 Reply to @author
https://x.com/author/status/123
原文：「English tweet content...」
翻譯：「中文翻譯...」
為什麼選這則：為什麼值得回覆。

版本 A:
  EN: "English draft A..."
  ZH: 「中文翻譯...」
  策略：這個版本為什麼這樣寫（例如「自嘲認罪——我們有同樣問題」）
版本 B:
  EN: "English draft B..."
  ZH: 「中文翻譯...」
  策略：這個版本的不同切入角度
版本 C:
  EN: "English draft C..."
  ZH: 「中文翻譯...」
  策略：這個版本的另一個角度

🔁 Retweet @author
https://x.com/author/status/789
原文：「English tweet content...」
翻譯：「中文翻譯...」
理由：為什麼值得轉推。

👍 Like @author
https://x.com/author/status/012
原文：「English tweet content...」
翻譯：「中文翻譯...」
理由：為什麼值得按讚。

💡 新貼文靈感（受 @author 啟發）
理由：什麼啟發了這個想法。

版本 A:
  EN: "English draft A..."
  ZH: 「中文翻譯...」
  策略：這個版本的切入角度
版本 B:
  EN: "English draft B..."
  ZH: 「中文翻譯...」
  策略：這個版本的切入角度
版本 C:
  EN: "English draft C..."
  ZH: 「中文翻譯...」
  策略：這個版本的切入角度

---
需要精修文案請執行 post-writing skill
```

EN 行是可直接複製貼上到 X 發布的文案。使用者語言行幫助使用者理解和選擇。

透過設定的通知頻道發送。如果頻道是 `terminal`，直接在對話中顯示摘要。

### 步驟五 — 使用者回饋（選擇性）

使用者收到通知（步驟四）後，可能會在執行前對草稿提供回饋。

**跳過此步驟的條件：** 使用者直接複製貼上並執行，沒有對文案品質發表意見。

#### 負面回饋

1. 使用者指出哪個版本不好以及原因（例如「版本 A 聽起來像顧問，不像我們」）
2. 根據回饋改寫被拒絕的版本
3. 將新版本提交給使用者確認
4. 確認後，依照 `${CLAUDE_SKILL_DIR}/../post-writing/references/feedback-extraction-format.md` 定義的回饋萃取流程執行：
   - `before`：被拒絕的原始草稿
   - `after`：確認後的改寫版本
   - `reason`：使用者說明的原因
   - `source`：`"engagement"`
5. 將萃取的模式提交給使用者確認
6. 將已確認的模式寫入 `{workspace}/social-style-guide.md`——如果目標段落仍有佔位文字就取代，否則附加
7. 更新 `{workspace}/engagement/inbox.yaml` 中的草稿

#### 正面回饋

1. 使用者標記某個版本為好的（例如「版本 C 很讚」）
2. 如果使用者說明了原因，記錄下來
3. 依照 `${CLAUDE_SKILL_DIR}/../post-writing/references/feedback-extraction-format.md` 定義的回饋萃取流程執行：
   - `before`：""（空值——正面回饋沒有不好的版本）
   - `after`：被稱讚的版本
   - `reason`：使用者的說明（如果有的話）
   - `source`：`"engagement"`
4. 將萃取的模式提交給使用者確認
5. 將已確認的模式寫入 `{workspace}/social-style-guide.md`

#### 提交（如果有萃取到模式）

```bash
git add {workspace}/social-style-guide.md {workspace}/engagement/inbox.yaml
git commit -m "style: extract engagement feedback patterns"
```

如果 workspace 是絕對路徑，從 workspace 目錄執行 git 指令。若不是 git 倉庫則跳過。

## 收件匣管理

查看目前收件匣：

```bash
cd ${CLAUDE_SKILL_DIR} && bun scripts/list.ts --inbox {workspace}/engagement/inbox.yaml
```

收件匣是滾動式紀錄：
- 新項目會插入在最前面（最新的在上方）
- 超過 1 週的項目在每次 `add.ts` 執行時自動清除
- 狀態值：`pending`（等待人工執行）、`done`（已完成）、`skipped`（刻意跳過）

## 你不負責

- 在 X 上執行互動動作（由人工手動執行）
- 自動按讚推文（X API 整合不在範圍內）
- 驗證人工是否完成了推薦的動作
- 處理排程（由外部排程器觸發此 skill）
- 撰寫完整貼文（那是 post-writing 的工作——但你可以推薦 `post` 動作類型，讓使用者帶到 post-writing 處理）
- 搜尋非英文推文（目前僅限英文）

## 行為原則

- **代筆模式**：為使用者撰寫互動文案，讓他們直接使用或調整。絕不要求他們從零開始寫。
- **品質重於數量**：2-5 則高價值推薦勝過 20 則隨便寫的。
- **已驗證內容**：每則推薦都以 Syndication API 驗證過的推文內容為基礎。絕不僅根據 Grok 摘要推薦。
- **自然連結寫作目標**：將推薦自然地與使用者的寫作目標和近期內容連結。
- **輕量執行**：這是每日例行工作——快進快出，不要過度分析。

## 參考資料

- 互動規則：[engagement-rules.md](references/engagement-rules.md)
- 經驗驗證：[experience-verification.md](references/experience-verification.md)
- 互動審查 prompt：[engagement-reviewer-prompt.md](engagement-reviewer-prompt.md)
- 回饋萃取格式：[feedback-extraction-format.md](../post-writing/references/feedback-extraction-format.md)
- 貼文寫作規則：[post-rules.md](../post-writing/references/post-rules.md)
- 設計規格：[x-engagement-design.md](../../docs/superpowers/specs/2026-03-30-x-engagement-design.md)
