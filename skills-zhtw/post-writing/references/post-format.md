# 貼文檔案格式

## 位置

貼文以單一檔案儲存在 `{workspace}/posts/{YYYY-MM-DD}_{slug}.md`。

## Frontmatter

```yaml
---
type: single | thread
status: draft | review | published
source: standalone | article
source_article: articles/{YYYY-MM-DD}_{slug}/  # 僅在 source: article 時
original_language: en
translations: [zh]
platforms: [twitter, threads, bluesky]
---
```

**欄位說明：**

- `type` — `single` 為單篇貼文，`thread` 為多篇串文
- `status` — 生命週期狀態：`draft` → `review` → `published`
- `source` — `standalone` 為獨立創作的貼文，`article` 為從文章衍生的貼文，`engagement` 為受互動推薦啟發的貼文
- `source_article` — 從工作區到來源文章目錄的相對路徑（僅在 `source: article` 時）
- `source_tweet` — 引發靈感的推文 URL（僅在 `source: engagement` 時）
- `original_language` — 主要語言的 ISO 639-1 代碼（例如 `en`、`zh`）
- `translations` — 此檔案中包含的翻譯版本的 ISO 639-1 代碼列表
- `platforms` — 目標社群平台列表，決定貼文的字數限制

## 內文結構

### 單篇貼文

```markdown
---
type: single
status: draft
source: standalone
original_language: en
translations: []
platforms: [twitter, threads, bluesky]
---

# 貼文標題或開場鉤子

貼文內容。須在目標平台中最嚴格的字數限制內。
```

### 串文

串文中的每篇貼文以 `---`（水平線）分隔：

```markdown
---
type: thread
status: draft
source: article
source_article: articles/2026-03-24_example-article/
original_language: en
translations: []
platforms: [twitter, threads]
---

# 串文標題——第一篇

吸引讀者的開場貼文。

---

1/ 串文的第一個重點。

支持細節或範例。

---

2/ 串文的第二個重點。

另一個支持細節。

---

最後一篇——結論或行動呼籲。
```

`---` 分隔符之間的每個段落就是串文中的一篇獨立貼文。每篇都必須獨立符合平台字數限制。

## 翻譯

翻譯附加在同一個檔案中，以語言標記分隔：

```markdown
（原始語言內容在上方）

---lang:zh---

# 翻譯後的標題

翻譯後的內容。
```

串文的翻譯包含自己的 `---` 分隔符，對應串文中的每篇貼文。

## 解析規則

貼文檔案包含三種 `---` 分隔符。依此順序解析：

1. **YAML frontmatter** — 第一行的 `---` 開啟 frontmatter；下一個 `---` 關閉它
2. **語言分隔符** — 完全匹配 `---lang:{code}---` 模式（例如 `---lang:zh---`）。標記翻譯版本的起始位置。
3. **串文分隔符** — frontmatter 之後、語言分隔符之前的其餘 `---` 都是串文貼文的邊界

**解析演算法：** 先移除 frontmatter。用 `---lang:{code}---` 切分，取得各語言區塊。在每個語言區塊內，用 `---` 切分，取得個別的串文貼文（串文類型）或單篇貼文內文（單篇類型）。

## 狀態生命週期

```
draft → review → published
```

- `draft` — 貼文已建立、方向已確認、草稿已撰寫、尚未審查
- `review` — 自動審查完成，等待作者確認
- `published` — 作者已確認、翻譯已加入（如果有的話），可以發佈

## 檔案命名

- 格式：`{YYYY-MM-DD}_{slug}.md`
- 日期：貼文建立的日期
- Slug：小寫、以連字號分隔、具描述性（例如 `writing-skills-key-insight`、`ghostwriter-mode-thread`）
- Slug 應該簡潔但一看就知道是什麼
