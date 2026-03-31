# OpenClaw 平台 Subagent 相容性研究

## 執行摘要

本研究針對 writer-skills 在 OpenClaw 平台執行時，x-engagement 等技能出現 thread 斷裂與 subagent 無法銜接回主流程的問題進行深入分析。經過調查後，確認問題的根本原因是 **Claude Code 與 OpenClaw 對 subagent 的執行模型有本質差異**：Claude Code 的 Agent tool 是同步阻塞的（parent 等待 child 完成後繼續），而 OpenClaw 的 subagent 是非同步的（spawn 立刻返回 runId，completion 以 announce 回傳）。

關鍵發現：

- **所有使用 subagent 的技能都受影響**，不只 x-engagement，還包括 article-writing（寫作審查、事實查核）、post-writing（貼文審查）、article-translation（翻譯審查）、article-preparation（主題研究）
- **OpenClaw 本身在 subagent orchestration 方面存在已知 bugs**，包括 `sessions_yield` 在 cron session 中只能存活一個 LLM turn（[Issue #49572](https://github.com/openclaw/openclaw/issues/49572)）、parent session 在 subagent error 後卡住（[Issue #57617](https://github.com/openclaw/openclaw/issues/57617)）
- **這不是 skill 的 bug，而是平台假設差異**——技能是按照 Claude Code 的同步 Agent tool 行為設計的

## 背景與脈絡

Writer-skills 是一套 AI agent 技能系統，遵循 Agent Skills 開放標準。目前有兩個主要部署環境：

1. **Claude Code** — 本地 CLI，Agent tool 是同步阻塞的。Parent 呼叫 Agent tool 後會等待 subagent 完成並拿到回傳結果，才繼續執行下一步。這類似函數呼叫。
2. **OpenClaw** — 開源 AI agent 平台，Agent Maelle 部署在上面。Subagent 透過 `sessions_spawn` 觸發，是非同步的。Parent 拿到的只是 `{ status: "accepted", runId, childSessionKey }`，subagent 完成後以 announce message 送回結果。

問題出在：我們的技能（特別是 x-engagement Step 3c 的審查迴圈）假設 subagent dispatch 是阻塞的。技能中寫著：

```
Dispatch an engagement-reviewer subagent...
After subagent returns:
- All versions pass → proceed to 3d
- Some versions fail → rewrite... then dispatch the subagent again
```

這個 "After subagent returns" 的語意在 Claude Code 中自然成立（Agent tool 會 block），但在 OpenClaw 中，spawn 立刻返回，agent 的 session 可能在收到結果前就結束了，或即使收到 announce callback，也只能再執行一個 LLM turn 就被 abort。

## 問題分析

### 3.1 影響範圍

Repository 中所有技能的 subagent dispatch 點：

| 技能 | 步驟 | Dispatch 目的 | 迴圈次數 |
|------|------|---------------|----------|
| x-engagement | Step 3c | 批次審查 engagement draft | 最多 3 輪 |
| article-writing | Step 5 | 寫作審查 | Author-paced（無上限） |
| article-writing | Step 6 | 事實查核 | Author-paced（無上限） |
| post-writing | Step 4 | 貼文審查 | 1 輪（通過/修改） |
| article-translation | Step 3 | 翻譯審查 | 最多 3 輪 |
| article-preparation | Step 3c | 主題研究 | 1 次（寫 research.md） |

**所有這些 dispatch 都假設同步行為。** x-engagement 和 article-translation 的迴圈式審查受影響最嚴重，因為需要在多輪 subagent dispatch 之間維持狀態和決策邏輯。

### 3.2 OpenClaw Subagent 架構的限制

根據研究，OpenClaw subagent 有以下特性：

1. **非阻塞 spawn**：`sessions_spawn` 立刻返回 runId，不等待完成
2. **Push-based completion**：Subagent 完成後以 announce message 送回結果
3. **已知的 sessions_yield bug**：在 cron isolated session 中，yield 後只能存活一個 LLM turn（[#49572](https://github.com/openclaw/openclaw/issues/49572)）
4. **Session 生命週期問題**：orchestrator 需要 `mode: "session"` 才能在 child announces 之間保持存活，但 `mode: "session"` 在某些 channel 上需要 `thread: true`（[#23414](https://github.com/openclaw/openclaw/issues/23414)）
5. **Subagent 狀態不可靠**：subagent 可能在 UI 上顯示完成，但底層工作尚未結束（[#50165](https://github.com/openclaw/openclaw/issues/50165)）

OpenClaw 官方文檔也明確指出目前的限制：

> The main agent cannot orchestrate multi-step workflows where it needs to: Review the sub-agent's output before presenting it to the user · Decide the next step based on results (e.g., spawn another agent, ask for human input).

這正是我們技能需要做的事。

### 3.3 為什麼 Claude Code 沒有這個問題

Claude Code 的 Agent tool 語意是：

```
parent calls Agent tool → blocks → subagent runs to completion → result returned inline → parent resumes
```

這是同步函數呼叫模型。Parent 的 context 和控制流完全保持，可以：
- 檢查 subagent 返回的 pass/fail 結果
- 基於結果決定重寫哪些 draft
- 重新 dispatch subagent 做第二輪審查
- 維持迴圈計數器

在 OpenClaw 中，這些都斷裂了，因為 parent 的 session turn 在 spawn 後就結束了。

## 解決方案探索與評估

基於對兩個平台差異的理解，以下是可能的解決方向：

### 方案 A：Inline Review（移除 subagent dispatch）

**核心理念：** 將審查邏輯直接嵌入主 agent 流程，不使用 subagent。

**做法：** 在 SKILL.md 中，把原本 "dispatch subagent" 的步驟改為 "agent 自己執行審查"，將 reviewer prompt 的內容直接作為主 agent 的指令。

**評估：**
- **實作複雜度：低** — 只需修改 SKILL.md 中的指令文字
- **跨平台相容性：完美** — 不依賴任何 subagent 機制
- **審查品質風險：中** — 失去 "fresh eyes" 效果。同一個 agent 先寫 draft 再自己審查，可能對自己的輸出有偏見。但 reviewer prompt 中的嚴格標準和具體檢查項仍然有效
- **適用範圍：全部** — 所有技能的 subagent dispatch 都可以用這個方式處理

### 方案 B：Platform-Adaptive Dispatch（條件式分流）

**核心理念：** 在 SKILL.md 中提供兩種路徑，讓 agent 根據平台能力選擇。

**做法：** 在 dispatch 步驟中加入條件判斷：

```markdown
#### 3c. Review

**If your platform supports blocking subagent dispatch** (e.g., Claude Code Agent tool):
  Dispatch an engagement-reviewer subagent...

**If your platform uses async subagents** (e.g., OpenClaw):
  Perform the review inline using the criteria below...
```

**評估：**
- **實作複雜度：中** — 需要在每個 dispatch 點寫兩套指令
- **維護負擔：高** — 每次修改審查邏輯都要同步兩個路徑
- **可靠性：好** — 各平台走最適合的路徑
- **問題：** Agent 如何可靠判斷自己在哪個平台上？沒有標準化的平台偵測機制

### 方案 C：Checkpoint-Resume Pattern（狀態持久化）

**核心理念：** 在 dispatch subagent 前將當前狀態寫入檔案，subagent 完成後主 agent 從檔案讀取狀態恢復。

**做法：**
1. 在 dispatch 前，將當前進度（哪些 draft 待審、第幾輪、哪些已通過）寫入 `engagement/review-state.yaml`
2. Dispatch subagent（async 或 sync 都行）
3. Subagent 完成後寫入審查結果到 `engagement/review-results.yaml`
4. 主 agent 被 announce callback 喚醒後，讀取狀態檔案恢復上下文

**評估：**
- **實作複雜度：高** — 需要設計 state schema、序列化/反序列化邏輯
- **可靠性：差** — 受限於 OpenClaw 的 `sessions_yield` bug（只活一個 turn），即使 state 正確恢復，agent 也可能無法完成後續步驟
- **過度工程：是** — 為了讓 LLM-based agent 模擬 stateful workflow engine，增加了大量複雜度
- **未來性：中** — 如果 OpenClaw 修復了 session 存活問題，這個方案才有價值

### 方案 D：Split into Discrete Skills（拆分技能）

**核心理念：** 將包含 subagent dispatch 的大技能拆分成多個小技能，由使用者或排程器串接。

**做法（以 x-engagement 為例）：**
1. `x-discover` — 執行 Step 1-2（環境檢查 + 搜尋）
2. `x-curate` — 執行 Step 3a-3b（讀取資源 + 草擬 draft）
3. `x-review` — 執行 Step 3c（審查，原本的 subagent 工作變成獨立技能）
4. `x-notify` — 執行 Step 3d-4（寫入 inbox + 通知）

**評估：**
- **實作複雜度：高** — 需要拆分技能、設計中間狀態格式、確保銜接
- **使用體驗：差** — 使用者需要手動串接 4 個步驟（或另外寫排程邏輯）
- **審查品質：好** — 獨立 session 做審查，有 fresh context
- **違反設計原則：是** — 技能的目標是讓使用者一句話觸發完整流程，拆分後變成手動流水線

### 方案 E：Hybrid — Inline Review with Quality Guardrails

**核心理念：** 預設使用 inline review（方案 A），但透過增強的 prompt 設計和結構化的 self-review 機制來彌補 "fresh eyes" 效果的損失。

**做法：**
1. 移除所有 subagent dispatch，改為 inline review
2. 在審查步驟加入 **explicit context reset** 指令：「暫時忘記你是 draft 的作者。你現在是一個嚴格的審查者。」
3. 保留原有的 reviewer prompt 內容（檢查項、校準標準、輸出格式）作為 inline 指令
4. 保留迴圈機制（最多 3 輪），但迴圈在主 agent 內執行
5. 對於支援 blocking subagent 的平台，在技能文件中加入 **optional subagent hint**：

```markdown
> **Platform note:** If your runtime supports blocking subagent dispatch
> (e.g., Claude Code Agent tool), you may dispatch this review as a
> subagent for better isolation. Use the prompt template in
> [engagement-reviewer-prompt.md](engagement-reviewer-prompt.md).
```

**評估：**
- **實作複雜度：低** — 主要是文字修改
- **跨平台相容性：完美** — 不依賴任何 subagent 機制
- **審查品質：可接受** — explicit context reset + 嚴格標準可部分彌補 fresh eyes
- **維護負擔：低** — 一套指令，可選的 subagent hint 不影響主流程
- **向後相容：好** — Claude Code 使用者可以選擇繼續用 subagent

## 建議與決策指引

基於分析結果，**建議採用方案 E（Hybrid — Inline Review with Quality Guardrails）**。理由如下：

1. **根本問題不在我們這邊**。OpenClaw 的 subagent orchestration 仍有多個未解決的 bugs（#49572, #57617, #50165）。把我們的架構建立在一個不穩定的平台功能上是脆弱的。Inline review 徹底移除了這個依賴。

2. **Fresh eyes 的價值可能被高估了**。LLM subagent 的 "fresh context" 和人類 code review 的 "fresh eyes" 本質不同。LLM 不會因為看過自己的 draft 就產生真正的 sunk-cost bias。真正的品質保證來自明確的檢查標準和嚴格的校準指令——這些在 inline review 中同樣有效。

3. **Optional subagent hint 保留了升級路徑**。Claude Code 使用者（或未來 OpenClaw 修復 orchestration 後）仍可選擇 dispatch subagent。不需要再次修改技能。

4. **最小改動原則**。方案 E 只需要修改每個技能中 dispatch 步驟的指令文字，不需要新增檔案、改變 schema、或重新設計架構。

### 具體改動方向

對每個技能的 subagent dispatch 步驟，改動模式統一為：

**之前：**
```markdown
Dispatch an engagement-reviewer subagent to batch-review all drafts.
See [engagement-reviewer-prompt.md] for the dispatch template.
...
After subagent returns:
```

**之後：**
```markdown
Switch to reviewer mode. Set aside your role as draft author — you are
now a strict quality reviewer. Apply the following criteria to every
draft version:
[inline the reviewer checklist from the prompt template]
...
After completing the review:

> **Platform note:** If your runtime supports blocking subagent dispatch,
> you may run this review as a subagent for better isolation. See
> [engagement-reviewer-prompt.md] for the dispatch template.
```

## 實施結果

已採用方案 E，直接修改所有技能的 SKILL.md（無需 PRD）。改動如下：

| 檔案 | 改動 |
|------|------|
| `skills/x-engagement/SKILL.md` Step 3c | Inline review + platform note |
| `skills/post-writing/SKILL.md` Step 4 | Inline review + platform note |
| `skills/article-writing/SKILL.md` Step 5 | Inline review + platform note |
| `skills/article-writing/SKILL.md` Step 6 | Inline review + platform note |
| `skills/article-translation/SKILL.md` Step 3 | Inline review + platform note |
| `skills/article-preparation/SKILL.md` Step 3c | Inline research + platform note |
| `CLAUDE.md` | 新增 "Review Dispatch Model" 章節 |

所有 `*-reviewer-prompt.md` 和 `*-researcher-prompt.md` 檔案保持不變，作為 inline review 標準的來源和 optional subagent dispatch 模板的雙重用途。

### 中期追蹤

- 關注 OpenClaw [#49572](https://github.com/openclaw/openclaw/issues/49572)（sessions_yield bug）和 [#32701](https://github.com/openclaw/openclaw/issues/32701)（CONTINUE_WORK signal）的進展
- 如果 OpenClaw 修復了 blocking orchestration 問題，可以考慮在 platform note 中更新建議

## 參考資料

- [OpenClaw Sub-Agents 官方文檔](https://docs.openclaw.ai/tools/subagents)
- [sessions_yield bug — Issue #49572](https://github.com/openclaw/openclaw/issues/49572)
- [Parent session stuck — Issue #57617](https://github.com/openclaw/openclaw/issues/57617)
- [Subagent appears completed prematurely — Issue #50165](https://github.com/openclaw/openclaw/issues/50165)
- [CONTINUE_WORK signal feature — Issue #32701](https://github.com/openclaw/openclaw/issues/32701)
- [mode="session" requires thread=true — Issue #23414](https://github.com/openclaw/openclaw/issues/23414)
- [Deterministic Multi-Agent Pipeline in OpenClaw (DEV Community)](https://dev.to/ggondim/how-i-built-a-deterministic-multi-agent-dev-pipeline-inside-openclaw-and-contributed-a-missing-4ool)
- [OpenClaw Multi-Agent Orchestration Guide](https://zenvanriel.com/ai-engineer-blog/openclaw-multi-agent-orchestration-guide/)
