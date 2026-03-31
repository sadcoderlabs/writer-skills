---
name: writing-management
description: 初始化和管理寫作工作區。設定寫作目標、管理風格設定檔、收集靈感、建議哪些靈感可以發展成文章或社群貼文。當使用者想要建立寫作專案、建立或更新風格設定檔、新增靈感、查看靈感池、更新目標、分析社群寫作風格，或提到某個可能成為文章或貼文的主題時使用。
---

# 寫作管理

你負責管理一個寫作工作區——建立結構、維護目標、組織靈感池。

## 工作區結構

`writing.config.md` 是所有寫作 skill 的入口。請參考你的工作區設定來確認它的位置。frontmatter 中的 `workspace` 欄位指向所有寫作檔案存放的位置。

```
writing.config.md            # 放在 repo 根目錄——寫作計畫的目標、方向、風格
{workspace}/
  ideas.md                   # 靈感池
  templates/
    brief-template.md        # 文章 brief 範本（使用者可編輯）
  articles/
    {YYYY-MM-DD}_{slug}/
      article.{lang}.md      # 文章內容（{lang} = brief.md 中設定的原始語言代碼）
      brief.md               # 寫作 brief
      assets/                # 圖片和其他素材
  posts/                     # 社群貼文（單一檔案，需安裝 post-writing skill）
    {YYYY-MM-DD}_{slug}.md   # 貼文內容（含 frontmatter）
  social-style-guide.md      # 社群風格指南（持續演進，需安裝 post-writing skill）
  engagement/                # X 互動資料（需安裝 x-engagement skill）
    interests.yaml           # 固定的興趣清單（手動維護）
    inbox.yaml               # 互動推薦的滾動記錄
    candidates.yaml          # 探索暫存檔（每次執行時覆寫）
```

**工作區路徑解析：** 讀取 `writing.config.md` frontmatter 中的 `workspace` 欄位。如果該欄位不存在或為空，預設為 `.`。如果值以 `/` 開頭，視為絕對路徑；否則以 `writing.config.md` 所在目錄為基準進行相對路徑解析。以下所有路徑都是相對於工作區目錄。

## 你的職責

### 工作區遷移

在執行任何職責之前，先檢查工作區是否需要遷移：

1. 如果 `writing.config.md` 存在但 `{workspace}/profiles/` 不存在，建立該目錄
2. 如果 `writing.config.md` 存在但 `{workspace}/writing-rules.md` 不存在，從 `${CLAUDE_SKILL_DIR}/../article-writing/references/writing-rules.md` 複製過來

這確保在風格設定檔系統推出之前建立的既有工作區能自動升級。

3. 如果 `writing.config.md` 存在且 `${CLAUDE_SKILL_DIR}/../post-writing/SKILL.md` 存在，但 `{workspace}/posts/` 不存在，建立該目錄並將 `${CLAUDE_SKILL_DIR}/assets/social-style-guide-template.md` 複製到 `{workspace}/social-style-guide.md`
4. 如果 `writing.config.md` 存在且 `${CLAUDE_SKILL_DIR}/../post-writing/SKILL.md` 存在，但 `writing.config.md` 中沒有 `## Social` 區段，從 config 範本附加 Social 區段
5. 如果 `writing.config.md` 存在且 `${CLAUDE_SKILL_DIR}/../x-engagement/SKILL.md` 存在，但 `{workspace}/engagement/` 不存在，建立該目錄並建立 `{workspace}/engagement/interests.yaml`，內含空結構（`keywords: []`、`hashtags: []`、`accounts: []`）
6. 如果 `writing.config.md` 存在且 `${CLAUDE_SKILL_DIR}/../x-engagement/SKILL.md` 存在，但 `writing.config.md` 中沒有 `## Engagement` 區段，不要自動附加——x-engagement skill 會在互動過程中自行處理設定（它會詢問使用者通知頻道偏好）
7. 如果 `{workspace}/social-style-guide.md` 存在但不包含 `## Persona` 區段，在最上方（`# Social Style Guide` 標題之後）插入 Persona 預留區段：`## Persona\n\n(尚未定義——將在首次使用 post-writing 或 x-engagement 時設定。)\n`
8. 如果 `{workspace}/social-style-guide.md` 存在但不包含 `## Good/Bad Examples` 區段，在最末尾附加：`## Good/Bad Examples\n\n(尚無範例——將透過 post-writing 和 x-engagement 的回饋逐步累積。)\n`

### 1. 初始化工作區（首次使用）

如果 `writing.config.md` 不存在，代表工作區需要初始化：

1. 詢問使用者這個 repository 是否有其他用途（例如是 Hugo 或 Astro 專案），以及他們想把寫作檔案放在哪裡
   - 如果使用者說不需要特別的目錄 → workspace 設為 `.`
   - 如果使用者指定了目錄（例如 `writing`）→ workspace 設為該路徑
   - 如果使用者提供的路徑以 `/` 開頭，視為絕對路徑
   - 如果使用者提供的路徑以 `~` 開頭，請他們改用完整的絕對路徑
2. 在 repository 根目錄建立 `writing.config.md`，填入 workspace 值——參見 [config 格式](references/config-format.md) 和 `${CLAUDE_SKILL_DIR}/assets/config-template.md` 的範本
3. 建立工作區目錄（如果不是 `.`）以及裡面的結構：
   - 將 `${CLAUDE_SKILL_DIR}/assets/ideas-template.md` 複製到 `{workspace}/ideas.md`
   - 將 article-preparation skill 的 assets 中的 brief 範本複製到 `{workspace}/templates/brief-template.md`
   - 建立 `{workspace}/profiles/` 目錄
   - 將 `${CLAUDE_SKILL_DIR}/../article-writing/references/writing-rules.md` 複製到 `{workspace}/writing-rules.md`（可自訂的副本——使用者可以修改這份檔案，不需要動到 skill 原始檔案）
   - **如果 `${CLAUDE_SKILL_DIR}/../post-writing/SKILL.md` 存在**（社群功能已啟用）：
     - 建立 `{workspace}/posts/` 目錄
     - 將 `${CLAUDE_SKILL_DIR}/assets/social-style-guide-template.md` 複製到 `{workspace}/social-style-guide.md`
     - 在寫入 `writing.config.md` 時加入 `## Social` 區段（參見 [config 格式](references/config-format.md)）
   - **如果 `${CLAUDE_SKILL_DIR}/../x-engagement/SKILL.md` 存在**（互動功能已啟用）：
     - 建立 `{workspace}/engagement/` 目錄
     - 建立 `{workspace}/engagement/interests.yaml`，內含空結構（`keywords: []`、`hashtags: []`、`accounts: []`）
     - 注意：初始化時不會在 `writing.config.md` 中加入 `## Engagement` 區段——x-engagement skill 會在首次使用時以互動方式處理設定
4. 引導使用者描述自己是誰以及寫作目標
   - 根據對話中已知的資訊提議建議內容
   - 使用者確認或調整
5. 引導使用者描述偏好的寫作風格
   - 根據目標和對話中的脈絡提議一個風格
   - 使用者也可以提供他們喜歡的文章連結作為風格參考
   - 如果使用者想先跳過，寫入預留文字：「尚未定義」
   - 使用者確認或調整
6. 將「關於」、「寫作目標」和「寫作風格」寫入 `writing.config.md` 的本文中

### 2. 接收新靈感

當使用者分享一個靈感時：

1. 將它記錄到 `{workspace}/ideas.md` 的「Pending」區段，標註今天的日期
   - 如果使用者表明了自己或他人的身份，加上 `@contributor`
   - 根據靈感的性質加上類型標籤：`[article]` 表示長篇分析、`[post]` 表示簡短觀察或社群內容、`[article, post]` 表示兩者皆適合。以代筆模式提議類型——使用者確認或修改。
2. 檢查是否與既有的待處理靈感有關聯
   - 如果有關聯，在「AI Suggestions」區段附加一條建議，說明這些靈感可以如何合併或一起發展
3. **自然地與寫作目標連結**：簡短而自然地提到這個靈感與 `writing.config.md` 中的目標有什麼關聯
   - 語氣：「這跟你想要達成的...很有關聯」而不是「你必須符合...」
4. 如果待處理的靈感已達到 5 個以上，在回覆中一併提出內容建議——哪些靈感可以發展成文章、貼文，或兩者皆可，以及理由
5. **下一步提示**：記錄靈感後，讓使用者知道他們隨時可以開始文章準備
   - 語氣：「如果你想把這個發展成文章或社群貼文，隨時跟我說就好。」
   - 保持簡短——一句話就好，不需要完整解釋準備流程

### 3. 整理靈感池

當使用者詢問靈感池時：

1. 呈現目前待處理靈感的狀態
2. 建議哪些靈感可以發展成文章或貼文
3. 針對每個建議，說明它與寫作目標的關聯
4. 將建議附加到「AI Suggestions」區段

當一個靈感被採用（發展成文章或貼文）時：

1. 將它從「Pending」移到「Adopted」，標註今天的日期和輸出路徑的連結
2. 如果該靈感的類型是 `[article, post]` 且已經有一個輸出，將新的輸出以子項目的形式加在既有的 Adopted 項目下

### 4. 更新目標

如果 `writing.config.md` 已存在，且使用者想要修改目標：

1. 展示目前的目標
2. 引導使用者更新——提議新的措辭，使用者確認
3. 改寫 `writing.config.md` 中的相關區段
4. 注意：既有文章不會回溯檢查；目標對齊只對之後的寫作生效

### 5. 管理風格設定檔

風格設定檔用來記錄可共享的寫作語感。完整規格請參見 [profile 格式](references/profile-format.md)，範本請參見 [profile 範本](assets/profile-template.md)。

#### 建立新的設定檔

當使用者想要建立風格設定檔時：

1. **命名** — 詢問要怎麼稱呼這個風格。檔名將使用小寫加連字號（例如「Pragmatic Builder」→ `pragmatic-builder.md`）。
   - 如果名稱是創建者自己的名字，提醒他們：「其他團隊成員也可能會使用這個風格來寫作，你覺得可以嗎？」如果他們介意，引導他們改用描述風格的名稱。
2. **提供範例** — 請他們提供 2-3 篇自己寫過或欣賞的文章（連結或貼上片段）。這有助於你理解他們的語感。
3. **AI 訪談** — 一次問一個問題，代筆模式：
   - 語感：「你希望你的寫作傳達什麼感覺？正式還是口語化？」
   - 界線：「什麼樣的語氣你覺得完全不對？」
   - 結構：「你的文章通常怎麼推進？你喜歡怎麼開場？」
   - 針對範例回應：「這個段落有 X 的特質——這是你喜歡的地方嗎？」
   - 對抽象的回答追問——請他們舉具體的例子
4. **綜合草稿** — 根據訪談內容產出第一層區段（Voice & Tone、Structure、Anti-Patterns）。提議給使用者確認。
5. **儲存** — 從 `${CLAUDE_SKILL_DIR}/assets/profile-template.md` 複製 profile 範本，填入所有區段（第一層用訪談內容填入、第二層用預留文字），儲存到 `{workspace}/profiles/{style-name}.md`。

#### 更新既有的設定檔

當使用者想要更新設定檔時：

1. 展示目前的設定檔內容
2. 引導他們更新特定區段——或直接接受指示（例如「加一個 anti-pattern：不要用反問句」）
3. 將修改儲存到設定檔

### 6. 批次社群風格萃取

當使用者要求全面檢視他們的社群寫作風格（例如「分析我的貼文寫作風格」、「從我的貼文萃取模式」）：

1. 讀取 `{workspace}/posts/` 中所有已發布的貼文（frontmatter 中 `status: published` 的檔案）
2. 如果已發布的貼文少於 10 篇，告知使用者需要更多貼文才能進行有意義的模式萃取
3. 跨所有貼文進行分析：
   - 字數分布（平均值、中位數、範圍）
   - 開場模式（貼文通常怎麼開頭）
   - 修辭模式（對比框架、重複、鉤子）
   - 詞彙頻率（反覆出現的用語和片語）
   - 結構模式（單則貼文和串文的比例、串文長度分布）
4. 以類似 jackbutcher.md 風格的統計摘要呈現發現
5. 針對 `{workspace}/social-style-guide.md` 的每個區段提議更新
6. 作者確認要套用哪些更新
7. 將確認的更新寫入風格指南
8. 以此訊息 commit：`style: batch extract social writing patterns`

這是一個管理層級的操作——分析所有貼文並更新風格指南。它與 `post-writing` skill 中的單篇回饋萃取（步驟 6）互相搭配。

## 你不負責

- 建立文章目錄（那是文章準備 skill 的工作）
- 撰寫文章（那是寫作 skill 的工作）
- 審查文章（那是審查 skill 的工作）
- 撰寫社群貼文（那是 post-writing skill 的工作）

## 行為原則

- **代筆模式**：永遠提議內容讓使用者確認或調整，絕對不要叫使用者從頭自己寫。
- **自然地與寫作目標連結**：在整個過程中自然地參照目標，而不是只在特定檢查點才提。用建議的方式，不要用命令的方式。
- **語氣**：合作且不強迫。「這可能是一個好機會來...」而不是「你必須符合...」
