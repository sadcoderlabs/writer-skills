# writing.config.md 格式

## 位置

`writing.config.md` 是所有寫作 skill 的入口。它可以放在任何地方——通常在內容 repository 的根目錄。Agent 的工作區設定（例如 MEMORY.md）應該記錄它的位置，讓各個 skill 能找到它。

## Frontmatter

這個檔案使用 YAML frontmatter 來宣告工作區目錄：

```yaml
---
workspace: writing
---
```

**規則：**
- `workspace` 是唯一的 frontmatter 欄位
- 值是一個目錄路徑，指向 `ideas.md`、`templates/` 和 `articles/` 所在的位置
- 如果省略或為空，預設為 `.`（repo 根目錄即為工作區）
- 如果值以 `/` 開頭，視為絕對路徑
- 否則以 `writing.config.md` 所在目錄為基準進行相對路徑解析

## 本文結構

```markdown
---
workspace: .
---

# 寫作計畫

## 關於
{用一段話描述你是誰——個人或組織——以及你的願景}

## 寫作目標
{用一段話描述寫作想要達成什麼、目標讀者是誰、期望的語氣}

## 寫作風格
{全域寫作風格偏好——散文式描述、參考文章連結，或具體規則}
```

## 範例

```markdown
---
workspace: writing
---

# 寫作計畫

## 關於
sadcoder 開發 AI agent 工具。我們預見一個人們高度依賴 AI agent 完成工作的未來，而我們正在為那個世界打造產品。

## 寫作目標
展現我們在 AI agent 領域的實作經驗與洞見，吸引對 AI agent 有興趣的人——讓他們追蹤我們的 Twitter 或在我們的網站留下 email。語氣應該務實且有觀點，就像一個真正在做這件事的團隊在分享他們學到的東西。

## 寫作風格
直接且口語化。段落簡短。用我們自己工作中的具體例子，而非假設情境。引用具體的工具、數字和時間線。避免企業八股。
```

## 絕對路徑範例

當 skill 和寫作輸出分開安裝時（例如 AI agent 的工作區指向外部的內容 repository）：

```yaml
---
workspace: /root/projects/sadcoder-press
---
```

使用這個設定時，`ideas.md` 位於 `/root/projects/sadcoder-press/ideas.md`，文章位於 `/root/projects/sadcoder-press/articles/`，依此類推。

## Social 區段（選用）

當安裝了 `post-writing` skill 時，`writing.config.md` 會包含額外的 `## Social` 區段：

```markdown
## Social
- Platforms: twitter, threads, bluesky
- Social style guide: {workspace}/social-style-guide.md
- Default post language: en
- Translations: zh
```

**欄位：**
- `Platforms` — 以逗號分隔的目標社群平台清單。`post-writing` 用它來決定字數限制和格式規範。
- `Social style guide` — 社群風格指南檔案的路徑（相對於 repo 根目錄）。路徑解析方式與 workspace 路徑相同。
- `Default post language` — 社群貼文的主要語言（ISO 639-1 代碼）。
- `Translations` — 以逗號分隔的貼文翻譯目標語言清單。

這個區段只在工作區初始化時偵測到 `post-writing` skill 才會加入。沒有這個區段的既有工作區仍然可以正常運作——只是社群功能不可用。

## 包含 Social 的範例

```markdown
---
workspace: writing
---

# 寫作計畫

## 關於
sadcoder 開發 AI agent 工具。我們預見一個人們高度依賴 AI agent 完成工作的未來，而我們正在為那個世界打造產品。

## 寫作目標
展現我們在 AI agent 領域的實作經驗與洞見，吸引對 AI agent 有興趣的人——讓他們追蹤我們的 Twitter 或在我們的網站留下 email。語氣應該務實且有觀點，就像一個真正在做這件事的團隊在分享他們學到的東西。

## 寫作風格
直接且口語化。段落簡短。用我們自己工作中的具體例子，而非假設情境。引用具體的工具、數字和時間線。避免企業八股。

## Social
- Platforms: twitter, threads, bluesky
- Social style guide: writing/social-style-guide.md
- Default post language: en
- Translations: zh
```

## 指引

- 「關於」應該是事實性的：你是誰、做什麼、方向是什麼
- 「寫作目標」在一段話中結合目的、目標讀者和語氣
- 「寫作風格」描述文章讀起來應該是什麼感覺——語氣、結構偏好、參考文章，或具體規則。這是所有文章的全域預設風格。個別文章可以在 brief 中選擇一個風格設定檔來使用更具體的寫作語感；如果沒有選擇設定檔，就套用這個區段。
- 每個區段保持簡潔——各一段話
- 這個檔案是所有 skill 在自然連結寫作目標和維持風格一致性時的錨點
- 「Social」是選用的——只有在安裝了 post-writing skill 時才會出現。它設定目標平台、風格指南路徑，以及社群貼文的語言偏好。

## Engagement 區段（選用）

當安裝了 `x-engagement` skill 並首次使用時，`writing.config.md` 會包含額外的 `## Engagement` 區段：

```markdown
## Engagement
- Notification channel: slack:C0AMED6RYHJ
- Schedule: "11:00 GMT+9"
- Language: en
- User language: zh
```

**欄位：**
- `Notification channel` — 每日互動推薦要發送到哪裡。格式是寬鬆的描述（例如 `slack:CHANNEL_ID`、`discord:#channel`、`terminal`）。沒有預設值——x-engagement skill 會在首次使用時詢問使用者。
- `Schedule` — 每日互動執行的偏好時間。僅供排程器參考——skill 本身不處理排程。
- `Language` — X 探索的搜尋語言。目前只支援 `en`。
- `User language` — 使用者閱讀和思考所用的語言（ISO 639-1 代碼）。當這與 `Language` 不同時，通知會包含雙語內容：原始推文附翻譯，以及用兩種語言撰寫的草稿文案。如果省略，預設與 `Language` 相同。

與 `## Social` 區段不同，`## Engagement` 不會在工作區初始化時加入。它是由 x-engagement skill 在首次使用時以互動方式建立的，因為它需要使用者的輸入（通知頻道偏好）。
