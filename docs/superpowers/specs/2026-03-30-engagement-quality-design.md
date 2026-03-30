# Engagement Quality & Unified Feedback Loop Design

**Date:** 2026-03-30
**Status:** Draft

## Overview

x-engagement v1 的草稿品質太差——典型的 AI 樣板回覆，沒有個性、沒有具體經驗、語氣像 LinkedIn 顧問。原因：缺乏 persona、沒有品質檢查、沒有 feedback 機制。

本設計重構社群內容的品質系統，讓 post-writing 和 x-engagement 共用同一套 persona、規則、範例和 feedback 機制。

## Key Design Decisions

1. **Persona 放在 social-style-guide.md**：新增 `## Persona` section，post-writing 和 x-engagement 共用。
2. **engagement-rules.md 瘦身**：只保留策展規則（選什麼推文、action type、數量），刪除 Draft Rules（品質由共享資源覆蓋）。
3. **x-engagement 加自動審查**：dispatch engagement-reviewer subagent 批次審查所有草稿，最多 3 輪。
4. **統一 feedback extraction**：一個 shared subagent prompt，post-writing 和 x-engagement 都用同一個介面抽取 pattern 寫回 social-style-guide.md。

## Scope

| In Scope | Out of Scope |
|----------|-------------|
| social-style-guide.md 新增 Persona section | 重寫 social-style-guide template 的其他 section |
| engagement-rules.md 刪除 Draft Rules | 修改 post-rules.md 內容 |
| x-engagement 自動審查迴圈（subagent） | post-writing 的審查機制改動（保持現有 post-reviewer） |
| 統一 feedback extraction subagent | 批次 style extraction（仍由 writing-management 負責） |
| x-engagement feedback step | |
| post-writing Step 3/6 配合修改 | |

## 1. social-style-guide.md — Persona Section

### Template 修改

在 `skills/writing-management/assets/social-style-guide-template.md` 最前面（在 `## Voice` 之前）新增：

```markdown
## Persona

(Not yet defined — will be set up on first use of post-writing or x-engagement.)
```

### 初次引導

post-writing 或 x-engagement 在草擬前讀到 Persona 是 placeholder 時，觸發引導：

1. 讀 `writing.config.md` 的 About + Writing Goals 作為基礎
2. 用 ghostwriter mode 逐一提問：
   - 你在社群上的身份？（工程師、團隊帳號、創辦人⋯⋯）
   - 你的核心經驗/專業？（實際在做什麼、做了多久）
   - 社群上想呈現的形象？（實戰派、觀察者、教學者⋯⋯）
   - 「我」是誰？（第一人稱個人 vs 團隊帳號「我們」）
3. 綜合回答產出 Persona 段落，使用者確認後寫入

### 使用方式

所有社群內容草擬前必須讀 Persona。如果仍是 placeholder，先引導填寫再繼續。

## 2. engagement-rules.md — 瘦身

### 刪除

整個 `## Draft Rules` section（Reply drafts、Quote retweet drafts、Post drafts）。

### 保留

- `## Curation Criteria`（Worth engaging / Skip）
- `## Action Type Selection`（signal → action 對照表）
- `## Quantity Guidelines`（每日 2-5 則）

### 理由

Draft 品質改由共享資源覆蓋：
- `post-rules.md` — 禁止模式（engagement bait、filler、AI voice 等）、品質要求
- `social-style-guide.md` — Persona、Voice、Good/Bad Examples

## 3. x-engagement Step 3 — 自動審查迴圈

### 草擬階段（強制讀取順序）

1. `social-style-guide.md` → Persona（placeholder 就先引導設定）
2. `social-style-guide.md` → Voice、Anti-Patterns、Good/Bad Examples
3. `post-rules.md` → 禁止模式、品質要求
4. `engagement-rules.md` → 策展規則（決定 action type）
5. 草擬每個推薦項目的 3 個版本

### 自動審查（最多 3 輪）

每輪 dispatch 一個 **engagement-reviewer subagent**，批次審查所有推薦項目的所有草稿。

**Subagent 輸入：**
- 所有推薦項目 + 每項的所有草稿（例如 5 則推文 × 3 草稿 = 15 則）
- `post-rules.md`
- `social-style-guide.md`（Persona + Voice + Examples）
- 每則的原推文內容

**Subagent 逐版本檢查：**
- 是否違反 `post-rules.md` 禁止模式
- 是否符合 Persona（語氣、身份一致性）
- 是否跟 Bad Examples 撞型
- 是否有具體內容（數字、名字、經驗）而非空泛語句

**Subagent 回傳格式：**

```
推文 1 (@karpathy):
  版本 A: ✅ 通過
  版本 B: ❌ 太像 AI 樣板。「The 'agents don't listen' problem is real」開頭是 hollow hook。缺乏具體經驗。
  版本 C: ✅ 通過

推文 2 (@manthanguptaa):
  版本 A: ❌ 「spot on」是空泛肯定。整段讀起來像 LinkedIn 回覆。
  版本 B: ✅ 通過
  版本 C: ❌ 跟 Bad Example 撞型：corporate motivational tone。
```

**Agent 收到後：**
- 只重寫不通過的版本（通過的不動）
- 進入下一輪，subagent 只審查重寫的部分
- **3 輪後仍不通過** → 標記「⚠️ 品質不確定」，仍然推薦但在通知中提醒使用者

### 新增檔案

`skills/x-engagement/engagement-reviewer-prompt.md` — subagent dispatch template，定義輸入格式、檢查項目、回傳格式。

## 4. x-engagement Feedback Step

### 觸發時機

使用者收到 Step 4 通知後、執行前。

### 否定回饋流程

1. 使用者指出哪個版本不好 + 原因（例如「版本 A 太制式了，像顧問在說話」）
2. Agent 根據回饋重寫
3. 使用者確認新版本 OK
4. Dispatch shared feedback-extraction subagent（見第 5 節）
5. 使用者確認是否寫入 social-style-guide.md

### 肯定回饋流程

1. 使用者標記某版本好（例如「版本 C 很棒」）
2. 如果使用者說明了好在哪裡，一併記錄
3. Dispatch shared feedback-extraction subagent
4. 使用者確認是否寫入

### 跳過條件

如果使用者直接複製貼上執行、沒有給回饋，就跳過（跟 post-writing Step 6 的跳過邏輯一致：沒改就不抽取）。

## 5. Unified Feedback Extraction

### 統一介面

一個 shared subagent prompt，post-writing 和 x-engagement 都 dispatch 同一個。

**輸入：**
- `before`: 原始文字（草稿）
- `after`: 修改後文字（使用者手動改的 or agent 根據回饋重寫的）
- `reason`: 使用者給的理由（x-engagement 是明確的；post-writing 從差異推測）
- `source`: `"post"` | `"engagement"`

**輸出：**
- Pattern name（簡短描述）
- Bad example + reason
- Good example + reason
- 建議寫入的 section（Persona / Voice / Structure / Anti-Patterns / Good/Bad Examples）

### 寫入格式

```markdown
<example type="bad" source="engagement">
We've been hitting the same wall. Our workaround: treat agent output as a first draft.
Reason: 太像 AI 顧問。沒有具體的「我們」是誰、做了什麼專案。
</example>

<example type="good" source="engagement">
We built a writing system with 6 skills — the agents kept bloating every file. Ended up forcing TDD + spec review between tasks.
Reason: 有具體經驗（6 skills、TDD + spec review）。
</example>
```

用 `source="engagement"` / `source="post"` 區分來源，放在 `social-style-guide.md` 的對應 section。沿用 `post-rules.md` 已有的 `<example>` 標記格式。

### Prompt Template 位置

`skills/post-writing/feedback-extraction-prompt.md` — 放在 post-writing 下，x-engagement 引用路徑 `${CLAUDE_SKILL_DIR}/../post-writing/feedback-extraction-prompt.md`（跟 translation-rules.md 的跨 skill 引用模式一致）。

## 6. post-writing 配合修改

### Step 3（草擬）— 強化讀取順序

目前只說「Read the social style guide... If mostly empty, fall back」。改為強制順序：

1. 讀 `social-style-guide.md` → Persona（placeholder 就引導填寫）
2. 讀 `social-style-guide.md` → Voice、Anti-Patterns、Good/Bad Examples
3. 讀 `post-rules.md` → 禁止模式
4. 然後才草擬

### Step 6（Feedback Extraction）— 改用 shared subagent

現有的內建 extraction 邏輯改為 dispatch shared feedback-extraction subagent：
- 輸入：before（Step 3 草稿）、after（使用者 Step 5 修改後）、reason（從差異推測）、source: `"post"`
- 輸出寫入 social-style-guide.md

其餘 Step 6 邏輯不變（跳過條件、使用者確認、commit）。

## Related Changes Summary

| 檔案 | 改動 |
|------|------|
| `skills/writing-management/assets/social-style-guide-template.md` | 新增 `## Persona` section |
| `skills/x-engagement/references/engagement-rules.md` | 刪除 `## Draft Rules` |
| `skills/x-engagement/SKILL.md` | Step 3 加強制讀取順序 + 自動審查迴圈 + feedback step |
| `skills/x-engagement/engagement-reviewer-prompt.md` | 新建：審查 subagent dispatch template |
| `skills/post-writing/feedback-extraction-prompt.md` | 新建：統一 feedback extraction subagent template |
| `skills/post-writing/SKILL.md` | Step 3 強化讀取順序、Step 6 改用 shared subagent |
| `skills/writing-management/SKILL.md` | Persona 引導觸發邏輯（migration：現有 style guide 沒有 Persona section 就加上 placeholder） |
