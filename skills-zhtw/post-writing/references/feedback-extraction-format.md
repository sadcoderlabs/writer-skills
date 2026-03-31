# 回饋挖掘格式

定義從使用者對社群內容的回饋中挖掘寫作模式的流程與輸出格式。post-writing（步驟六）和 x-engagement（步驟五）都遵循相同的流程。

**這是參考文件，不是 subagent prompt。** Agent 讀取此文件後以 inline 方式執行挖掘。

## 輸入

針對每一筆回饋，收集：

- **before**：原始草稿文字
- **after**：修改後的文字（使用者的編輯或 agent 根據回饋改寫的版本）
- **reason**：使用者說明的原因（engagement 是明確說明的；post-writing 是從 diff 推斷的）
- **source**：`post` 或 `engagement`

## 流程

針對每一組 before/after 配對：

1. 讀取目前的 `social-style-guide.md` 以了解現有模式
2. 辨識改了什麼、為什麼這樣改更好
3. 判斷這是否屬於**可重複使用的模式**（不只是一次性的修正）

**跳過挖掘的條件：**
- 修改只是小幅用字調整（改動少於 3 個字）
- 修改是針對內容的（修正事實錯誤，不是風格模式）
- 風格指南中已有等效的模式

## 輸出格式

針對每個找到的模式，產出：

### Pattern: {簡短名稱}

**Target section:** {Persona | Voice | Structure | Rhetorical Patterns | Opening Patterns | Signature Vocabulary | Anti-Patterns | Good/Bad Examples}

<example type="bad" source="{post|engagement}">
{修改前的文字}
Reason: {為什麼不好——來自使用者的說明或從修改推斷}
</example>

<example type="good" source="{post|engagement}">
{修改後的文字}
Reason: {為什麼這樣更好}
</example>

---

如果沒有值得記錄的模式：
> 這次回饋中沒有發現可重複使用的模式。

## 挖掘之後

1. 以代筆模式向使用者呈現挖掘到的模式，請他們確認
2. 使用者可以接受、調整或跳過每個模式
3. 將確認的模式寫入 `social-style-guide.md`——如果目標區段仍有佔位文字，用新內容取代；否則附加在後面
