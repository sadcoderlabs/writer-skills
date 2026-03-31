# ideas.md 格式

## 結構

```markdown
# Idea Pool

## Pending
- [YYYY-MM-DD] 靈感描述 `[article]`
- [YYYY-MM-DD] @contributor: 靈感描述 `[post]`
- [YYYY-MM-DD] 靈感描述 `[article, post]` — 備註

## AI Suggestions
> [YYYY-MM-DD] 關於合併/發展靈感的建議，附帶與寫作目標的關聯說明

## Adopted
- [YYYY-MM-DD] → {workspace}/articles/{date}_{slug}（來自靈感描述）`[article]`
- [YYYY-MM-DD] → {workspace}/posts/{date}_{slug}.md（來自靈感描述）`[post]`
- [YYYY-MM-DD] 靈感描述 `[article, post]`
  - → {workspace}/articles/{date}_{slug}
  - → {workspace}/posts/{date}_{slug}.md
```

## Sections

### Pending
新靈感放在這裡。每個項目都有日期和描述。貢獻者標註（@name）是選用的——對團隊有用，個人使用時不需要。

#### Type Tags

每個靈感在描述末尾有一個選用的類型標籤，以反引號程式碼格式標記：

- `[article]` — 這個靈感的目標是長篇文章
- `[post]` — 這個靈感的目標是社群貼文或串文
- `[article, post]` — 這個靈感的目標是兩種格式都適用

**向後相容：** 沒有類型標籤的靈感預設為 `[article]`。既有靈感不需要回溯補標籤。

### AI Suggestions
這是一個**只能附加的記錄**。在以下情況會附加新建議（不會編輯或刪除既有的）：
- 收到的新靈感與既有靈感有關聯時
- 使用者詢問靈感池的目前狀態時

每條建議都應該引用具體的待處理靈感，並說明它們與 `writing.config.md` 中的目標有什麼關聯。

### Adopted
已經發展成文章或貼文的靈感。包含採用日期和輸出路徑的連結。

對於有多個輸出的靈感（`[article, post]`），每個輸出以子項目的形式列在同一個 Adopted 項目下。

## 什麼時候該建議內容
當收到新靈感且待處理靈感已有 5 個以上時，在回覆中連同靈感確認一起附上內容建議。根據靈感的性質建議哪些可以成為文章、貼文或兩者（長篇分析 → 文章、簡短有力的觀察 → 貼文、重要洞見 → 兩者）。
