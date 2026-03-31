# 翻譯規則

繁體中文（zh）與英文（en）之間的文章翻譯規則。這些規則確保內容元素的一致處理，以及目標語言中的自然表達。

## 通用原則

- **專業、理性的語氣**適用於所有翻譯
- **僅限繁體中文** — 不得出現簡體字
- **技術術語維持原文形式** — Redis、Claude、Astro、GitHub 等永遠不翻譯
- **寫作規則適用** — `writing-rules.md` 中的禁止模式精神上適用於所有翻譯輸出

## 標點符號轉換

### 中文 → 英文

| 中文 | 英文 | 範例 |
|------|------|------|
| `。` | `.` | 這是句子。→ This is a sentence. |
| `，` | `,` | 首先，→ First, |
| `「」` | `""` | 「引用」→ "quote" |
| `『』` | `''` 或 `""` | 『書名』→ "book title" |
| `：` | `:` | 結論：→ Conclusion: |
| `；` | `;` | 前者；後者 → the former; the latter |
| `！` | `!` | 成功！→ Success! |
| `？` | `?` | 為什麼？→ Why? |
| `⋯⋯` 或 `……` | `...` | 然後⋯⋯ → Then... |
| `——` | `, ` 或 `. ` | 使用逗號或句號，不用破折號（寫作規則限制每篇文章最多 1-2 個破折號） |
| `（）` | `()` | （備註）→ (note) |

### 英文 → 中文

| 英文 | 中文 | 範例 |
|------|------|------|
| `.` | `。` | This is a sentence. → 這是句子。 |
| `,` | `，` | First, → 首先， |
| `""` | `「」` | "quote" → 「引用」 |
| `''` | `『』` | 'inner quote' → 『內引』 |
| `:` | `：` | Conclusion: → 結論： |
| `;` | `；` | the former; the latter → 前者；後者 |
| `!` | `！` | Success! → 成功！ |
| `?` | `？` | Why? → 為什麼？ |
| `...` | `⋯⋯` | Then... → 然後⋯⋯ |
| `()` | `（）` | (note) → （備註） |

## 內容元素規則

### 程式碼區塊

- **原始語言註解**：翻譯為目標語言
- **目標語言註解**：保持不變
- **程式碼本身**：保持不變 — 變數名稱、函式名稱、字串字面值等

範例（zh → en）：
~~~
```javascript
// 計算總價 → // Calculate total price
const total = items.reduce((sum, item) => sum + item.price, 0);
// Returns the sum → // Returns the sum (already in English, keep as-is)
```
~~~

### 圖片

- **Alt 文字**：翻譯為目標語言
- **圖片路徑**：保持不變

範例（zh → en）：
```
![架構圖](assets/architecture.png) → ![Architecture diagram](assets/architecture.png)
```

### 超連結

- **連結文字**：翻譯為目標語言
- **URL**：保持不變

範例（zh → en）：
```
[官方文件](https://docs.example.com) → [official documentation](https://docs.example.com)
```

### Markdown 格式

完整保留所有 markdown 結構：
- 標題層級（`#`、`##` 等）
- 清單格式（有序和無序）
- 強調（`*italic*`、`**bold**`）
- 引用區塊（`>`）
- 水平線（`---`）

## 品質約束

### 英文輸出

套用 writing-rules.md 的禁止模式：
- 不使用破折號對比句式（"not A — but B"）
- 不使用空洞的開場提問（"Have you ever wondered...?"）
- 不使用填充用語（"actually"、"in fact"、"it's worth noting"）
- 不使用重述段落的總結句
- 不使用過渡填充語（"Let's dive deeper"、"Moving on to"）
- 每篇文章最多 1-2 個破折號

### 中文輸出

避免常見的 AI 翻譯問題：
- **翻譯腔**：避免從英文硬搬的不自然句式（例如「在...方面」「就...而言」）
- **過多「的」**：拆解「的」的連鎖 — 改用重構句子的方式
- **不自然的被動語態**：當主動語態在中文更自然時，避免「被認為是」「被廣泛使用」
- **過度正式的語域**：配合原文的語氣 — 如果原文是對話風格，中文也應該如此
