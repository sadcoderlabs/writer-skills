# 經驗驗證

分類團隊對候選推文主題的經驗等級的規則。這個分類決定了文案角度——agent 絕不能聲稱自己沒有的經驗。

## 經驗等級

| 等級 | 定義 | 證據 | 文案處理方式 |
|------|-----|------|------------|
| **Direct** | 團隊實際建構、使用或交付過這個特定的東西 | 記憶中有特定專案／工具使用紀錄，或 workspace 中有相關文章／貼文 | 正常撰寫，使用第一人稱經驗聲明 |
| **Adjacent** | 團隊做過類似的事，但用不同的方法 | 記憶或 workspace 中有相關但不完全相同的經驗 | 誠實撰寫："We use Y to achieve something similar"、"Different mechanism but same idea" |
| **Inverse** | 團隊評估過這個東西或有明確理由選擇不用 | 記憶中有刻意不採用此工具／方法的決策紀錄 | 分享推理過程："We went a different route because..."、"We chose not to use X, here's why" |
| **None** | 團隊對這個主題沒有實務經驗 | 記憶或 workspace 中找不到相關紀錄 | 降級為 like 或跳過。不撰寫聲稱有經驗的回覆草稿 |

## 分類流程

1. 讀取過去一週的工作記憶 + 近期 workspace 內容（過去兩週的文章、貼文）
2. 對每則候選推文問：「我們具體做過什麼跟這個主題相關的事？」
3. 根據找到的證據進行分類
4. 找不到證據 → 預設為 **None**

## 每個等級如何影響文案角度

### Direct

你有第一手經驗。說出專案名稱、工具或數字。

> "We built our skill system this way — drop a SKILL.md file, agent reads it next session."

### Adjacent

你做過相關但不同的事。明確點出差異。

> "We distribute agent skills as markdown files too, different mechanism but same idea — drop a file, agent picks it up."

### Inverse

你刻意選擇不這樣做。分享推理過程——這通常是最有價值的回覆。

> "We evaluated MCP for skill distribution but went with plain markdown files instead. The tradeoff for us was [reason]."

### None

沒有可以引用的經驗。將動作降級：
- Reply／quote → like（如果內容仍然值得肯定）
- Reply／quote → skip（如果內容只有回覆價值，不值得按讚）

## 範例：MCP Skill Distribution 推文

- **推文主題：** MCP for skill distribution
- **記憶檢查：** 團隊使用 markdown skill 檔案，以純檔案方式發布，不透過 MCP
- **分類：** Inverse（團隊做 skill distribution，但選擇了非 MCP 的方法）
- **正確角度：** "We distribute agent skills as markdown files too, different mechanism but same idea — drop a file, agent picks it up. We went without MCP because [reason]."
- **錯誤角度：** ~~"We ship skills via MCP in OpenClaw"~~（捏造直接經驗）
