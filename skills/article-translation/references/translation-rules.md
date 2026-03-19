# Translation Rules

Rules for translating articles between Traditional Chinese (zh) and English (en). These rules ensure consistent handling of content elements and natural expression in the target language.

## General Principles

- **Professional, rational tone** for all translations
- **Traditional Chinese (繁體中文) only** — no Simplified Chinese characters
- **Technical terms stay in original form** — Redis, Claude, Astro, GitHub, etc. are never translated
- **Writing rules apply** — the prohibited patterns in `writing-rules.md` apply in spirit to all translated output

## Punctuation Conversion

### Chinese → English

| Chinese | English | Example |
|---------|---------|---------|
| `。` | `.` | 這是句子。→ This is a sentence. |
| `，` | `,` | 首先，→ First, |
| `「」` | `""` | 「引用」→ "quote" |
| `『』` | `''` or `""` | 『書名』→ "book title" |
| `：` | `:` | 結論：→ Conclusion: |
| `；` | `;` | 前者；後者 → the former; the latter |
| `！` | `!` | 成功！→ Success! |
| `？` | `?` | 為什麼？→ Why? |
| `⋯⋯` or `……` | `...` | 然後⋯⋯ → Then... |
| `——` | `, ` or `. ` | Use comma or period, not em-dash (writing rules limit em-dashes to 1-2 per article) |
| `（）` | `()` | （備註）→ (note) |

### English → Chinese

| English | Chinese | Example |
|---------|---------|---------|
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

## Content Element Rules

### Code Blocks

- **Source language comments**: Translate to target language
- **Target language comments**: Keep as-is
- **Code itself**: Keep unchanged — variable names, function names, string literals, etc.

Example (zh → en):
~~~
```javascript
// 計算總價 → // Calculate total price
const total = items.reduce((sum, item) => sum + item.price, 0);
// Returns the sum → // Returns the sum (already in English, keep as-is)
```
~~~

### Images

- **Alt text**: Translate to target language
- **Image path**: Keep unchanged

Example (zh → en):
```
![架構圖](assets/architecture.png) → ![Architecture diagram](assets/architecture.png)
```

### Hyperlinks

- **Link text**: Translate to target language
- **URL**: Keep unchanged

Example (zh → en):
```
[官方文件](https://docs.example.com) → [official documentation](https://docs.example.com)
```

### Markdown Formatting

Preserve all markdown structure exactly:
- Heading levels (`#`, `##`, etc.)
- List formatting (ordered and unordered)
- Emphasis (`*italic*`, `**bold**`)
- Blockquotes (`>`)
- Horizontal rules (`---`)

## Quality Constraints

### For English Output

Apply writing-rules.md prohibited patterns:
- No dash-connected contrasts ("not A — but B")
- No hollow opening questions ("Have you ever wondered...?")
- No filler phrases ("actually", "in fact", "it's worth noting")
- No summary sentences restating the paragraph
- No transition filler ("Let's dive deeper", "Moving on to")
- Maximum 1-2 em-dashes per article

### For Chinese Output

Avoid common AI translation problems:
- **Translationese (翻譯腔)**: Avoid unnatural sentence structures calqued from English (e.g., 「在...方面」「就...而言」)
- **Excessive 「的」**: Break up chains of 「的」 — restructure the sentence instead
- **Unnatural passive voice**: Avoid 「被認為是」「被廣泛使用」 when active voice is more natural in Chinese
- **Overly formal register**: Match the tone of the original — if the original is conversational, the Chinese should be too
