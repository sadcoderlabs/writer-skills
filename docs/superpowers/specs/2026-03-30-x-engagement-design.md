# x-engagement Skill Design

**Date:** 2026-03-30
**Status:** Draft

## Overview

新增 `x-engagement` skill，每日透過 Grok x_search 探索 X 上值得互動的英文推文，經 agent 策展後產出推薦清單供人類手動執行。同時修改現有 `post-writing` skill，使其自動偵測 engagement inbox 中的待處理項目作為新的來源選項。

### 核心架構

- **x-engagement**（新 skill）= 每日素材蒐集：Discover → Curate → Output to inbox
- **post-writing**（現有 skill 小幅修改）= 寫作執行：自動偵測 inbox pending 項目，納入來源選擇

兩個 skill 透過 `{workspace}/engagement/inbox.yaml` 作為共享介面串接。

### Key Design Decisions

1. **X API 永久限制**：API 只能發文和按讚，reply / quote / retweet 必須人類手動操作。
2. **不整合 X API**：自動 like、驗證等全部不做，skill 專注在 discover + curate + 產出推薦清單。
3. **通知管道可設定**：不綁定 Slack，寫在 `writing.config.md` 的 Engagement section，初次使用時引導設定。
4. **確認機制延後實作**：人類執行後的狀態回報機制未來再做，目前未確認的項目保持 pending 直到 1 週後自動清除。
5. **Grok 摘要需驗證**：x_search 回傳的是模型摘要而非原始推文，透過 Twitter Syndication API 取得原文交叉比對。
6. **與 post-writing 整合**：x-engagement 輸出統一格式的推薦項目，post-writing 自動偵測作為來源選項，不需要使用者手動指定。

## Scope

| In Scope | Out of Scope |
|----------|-------------|
| Grok x_search 英文推文探索 | 自動發文（X API 限制） |
| Agent 策展 + 草擬文案 | 自動 reply/quote/retweet（X API 限制） |
| inbox.yaml 作為共享介面 | 中文推文搜尋 |
| post-writing 自動偵測 inbox | X API 整合（like、驗證等） |
| 可設定的通知管道 | 排程設定（後續再配） |
| Agent 工作記憶整合（如有） | 確認機制（延後實作） |
| Twitter Syndication API 驗證原文 | |

## x-engagement Skill Structure

### File Structure

```
skills/x-engagement/
├── SKILL.md                    # skill definition + daily workflow
├── references/
│   └── engagement-rules.md     # curation criteria, draft rules
├── scripts/
│   ├── discover.ts             # Grok x_search → candidates.yaml
│   ├── add.ts                  # prepend to inbox.yaml + prune >1 week
│   ├── list.ts                 # list inbox contents
│   └── lib/
│       └── inbox.ts            # YAML read/write shared logic
├── package.json
└── tsconfig.json
```

### Workspace Data (in user's writing workspace)

```
{workspace}/engagement/
├── interests.yaml          # fixed interest list (manually maintained)
├── inbox.yaml              # rolling log (prepend new, prune >1 week)
└── candidates.yaml         # discover temp (overwritten each run)
```

Path resolution: read `writing.config.md` `workspace` field → `{repo_root}/{workspace}/engagement/`.

## Daily Workflow (SKILL.md)

### Step 1 — Environment Check

- Read `writing.config.md`, confirm `## Engagement` section exists (guide setup if missing)
- Confirm `{workspace}/engagement/` directory and `interests.yaml` exist (initialize if missing)

### Step 2 — Discover

Execute `bun scripts/discover.ts`:

1. Read `interests.yaml` (keywords, hashtags, tracked accounts)
2. Scan recent articles/posts (past 7 days) to extract supplementary keywords
3. Call xAI Responses API (`/v1/responses`) with `x_search` tool
   - Model: `grok-4-1-fast`
   - Date range: past 48 hours (`from_date` / `to_date`)
   - Language: instruct via prompt "only English tweets" (no native language filter)
   - Account filter: `allowed_x_handles` for tracked accounts (max 10 per call, batch if needed)
4. Extract tweet IDs from citation URLs in response
5. For each tweet ID → call Twitter Syndication API to fetch original content
   - Endpoint: `https://cdn.syndication.twimg.com/tweet-result` (public, no auth needed)
   - Returns: full text, author, timestamp, language, likes, reply count
6. Verify Grok summary vs original content, mark `verified` flag (discard hallucinated items)
7. Output to `candidates.yaml` (overwrite each run)

If agent has working memory, incorporate as search hints.

### Step 3 — Curate

Agent reads `candidates.yaml` and combines with internal resources:
- Recent articles and posts
- `ideas.md` pending items
- `social-style-guide.md`

For each candidate, decide action type:
- `reply` — reply to a tweet
- `quote` — quote retweet with commentary
- `retweet` — plain retweet
- `like` — like the tweet
- `post` — inspired standalone new post

For each reply/quote/post, draft **3 copy versions**.

Use `bun scripts/add.ts` to write to `inbox.yaml`.

### Step 4 — Notify User

Send daily recommendation summary via configured notification channel.

## Notification Format

```
🐦 今日 X 互動推薦

📌 Reply to @fredchuuu
https://x.com/fredchuuu/status/2038476548874145995
原文：「驚為天人，推薦閱讀...」

版本 A: 「文案一...」
版本 B: 「文案二...」
版本 C: 「文案三...」

📌 Quote @someuser
https://x.com/someuser/status/123456
原文：「Original tweet...」

版本 A: 「文案一...」
版本 B: 「文案二...」
版本 C: 「文案三...」

👍 Like @anotheruser
https://x.com/anotheruser/status/789012

💡 新貼文靈感（受 @someuser 啟發）
版本 A: 「文案一...」
版本 B: 「文案二...」
版本 C: 「文案三...」

---
需要精修文案請執行 post-writing skill
```

- **文案直接可用**：3 個版本讓人類挑選，降低手動編輯摩擦
- **不強制走 post-writing**：簡單的 reply/like 直接複製貼上，想精修才進完整流程
- **確認機制延後實作**：目前不追蹤人類是否已執行，未確認的項目保持 pending 直到 1 週後自動清除。未來可加入確認回報 → 更新 inbox 狀態的流程。

## Data Schema

### interests.yaml

```yaml
keywords:
  - "AI agent"
  - "LLM workflow"
  - "autonomous agent"
hashtags:
  - "#AIagent"
  - "#LLMops"
accounts:
  - "someuser"          # without @, matching allowed_x_handles format
  - "anotheruser"
```

### candidates.yaml

```yaml
- id: "2038476548874145995"
  url: "https://x.com/fredchuuu/status/2038476548874145995"
  author: "fredchuuu"
  content: "驚為天人，推薦閱讀..."      # from Syndication API
  summary: "Fred Chu 推薦某篇文章..."    # from Grok
  lang: "zh"
  favorite_count: 2
  conversation_count: 0
  verified: true                          # original matches summary
  note_tweet: false
  searchQuery: "harness engineering"
  discoveredAt: "2026-03-30T04:40:56Z"
```

### inbox.yaml

```yaml
- id: "2038476548874145995"
  url: "https://x.com/fredchuuu/status/2038476548874145995"
  author: "fredchuuu"
  content: "驚為天人，推薦閱讀..."
  action: reply                    # reply | quote | retweet | like | post
  drafts:                          # 3 versions for reply/quote/post; empty for retweet/like
    - "Draft version A..."
    - "Draft version B..."
    - "Draft version C..."
  reason: "Why this tweet is worth engaging"
  discoveredAt: "2026-03-30T04:40:56Z"
  status: pending                  # pending | done | skipped
```

**Rolling log rules:**
- New items **prepend** (newest on top)
- `add.ts` **auto-prunes items with `discoveredAt` older than 1 week** on every execution (regardless of status)

## Configuration

Add `## Engagement` section to `writing.config.md`:

```markdown
## Engagement
- Notification channel: slack:C0AMED6RYHJ
- Schedule: "11:00 GMT+9"
- Language: en
```

- **`Notification channel`**: soft description, not limited to any specific platform. First time using x-engagement, if config has no `## Engagement` section, SKILL.md guides agent to ask user for setup.
- **`Schedule`**: daily recommendation time (for scheduler reference, skill itself doesn't handle scheduling).
- **`Language`**: search language, currently only `en`.

## post-writing Integration

### Minimal Changes to post-writing SKILL.md

**Step 1 (Source Selection)** currently supports 3 sources:
1. idea pool (ideas.md)
2. article-derived
3. standalone

**Add 4th source: engagement inbox**

Changes:
- At Step 1 start, check if `{workspace}/engagement/inbox.yaml` exists and has pending items
- If yes, present in source options: "N pending items from today's engagement recommendations"
- User selects an inbox item → brings existing context (original tweet, action type, 3 draft versions) into subsequent workflow
- **Action type mapping:**
  - `reply` / `quote` → enter post-writing drafting flow, 3 existing versions serve as initial drafts
  - `post` → same as standalone full flow, but with context (inspiring original tweet)
  - `retweet` / `like` → don't go through post-writing, handled directly in inbox notification for human manual execution
- After user confirms posting, post-writing updates corresponding inbox.yaml item status to `done`
- **No x-engagement or empty inbox → behavior completely unchanged** (backward compatible)

## Script Technical Design

### discover.ts

```
Input:  interests.yaml, recent articles/posts
Output: candidates.yaml (overwrite each run)

Flow:
1. Read interests.yaml → compose search queries
2. Scan {workspace}/articles/ + {workspace}/posts/ (past 7 days) → extract supplementary keywords
3. Call xAI Responses API (/v1/responses)
   - model: grok-4-1-fast
   - tools: [{ type: "x_search", x_search: { from_date, to_date } }]
   - prompt: instruct English-only, structured output format
   - tracked accounts in batches (allowed_x_handles max 10 per call)
4. Extract tweet IDs from citation URLs
5. Each tweet ID → call Syndication API for original content
6. Verify Grok summary vs original, mark verified
7. Write candidates.yaml
```

### add.ts

```
Input:  --url <tweet_url> --action <type> [--drafts "A" "B" "C"] [--reason "..."]
Output: updated inbox.yaml

Flow:
1. Read existing inbox.yaml (create empty if not exists)
2. Assemble new item (status: pending, discoveredAt: now)
3. Prepend to array
4. Filter out items with discoveredAt > 1 week
5. Write back inbox.yaml
```

### list.ts

```
Input:  none (reads inbox.yaml)
Output: human-friendly inbox summary (stdout)

Format:
[pending] 2026-03-30 reply @fredchuuu - "驚為天人..." (3 drafts)
[done]    2026-03-29 like @someuser - "Original tweet..."
```

### Shared Logic: lib/inbox.ts

- `readInbox(path): InboxItem[]`
- `writeInbox(path, items): void`
- `pruneOlderThan(items, days): InboxItem[]`
- `prependItem(items, newItem): InboxItem[]`

### Technical Choices

| Item | Choice | Reason |
|------|--------|--------|
| Runtime | Bun | Fast, native TypeScript, built-in fetch |
| YAML | `yaml` package | Standard YAML handling |
| HTTP | Native fetch | Built-in with Bun, for xAI API + Syndication API |
| Syndication API | Zero-dependency implementation | Only needs fetch + token calculation, no react-tweet dependency |

## Grok API Reference

| Item | Detail |
|------|--------|
| Endpoint | `POST https://api.x.ai/v1/responses` |
| Model | `grok-4-1-fast` ($0.20/$0.50 per M tokens, 2M context) |
| Tool | `x_search` (server-side, model decides when to search) |
| Tool cost | $0.005 per call, ~$0.02-0.05 per daily run |
| Date filter | `from_date`, `to_date` (ISO8601 YYYY-MM-DD) |
| Account filter | `allowed_x_handles` / `excluded_x_handles` (max 10, mutually exclusive) |
| Language filter | None native, handled via prompt |
| Auth | `XAI_API_KEY` environment variable |
| Response | Model summary + citation URLs (not raw tweets) |
| Citations | `include: ["inline_citations"]` for URL annotations |

## Twitter Syndication API Reference

| Item | Detail |
|------|--------|
| Endpoint | `GET https://cdn.syndication.twimg.com/tweet-result` |
| Auth | None required (public CDN) |
| Token | Deterministic: `(Number(id) / 1e15 * Math.PI).toString(36).replace(/(0+\|\.)/g, '')` |
| Returns | Full text, author, timestamp, language, favorite_count, conversation_count, entities, media |
| Limitations | `note_tweet` = true means text may be truncated (long tweets); deleted/private tweets return empty/tombstone |
| Rate limit | No documented limit, CDN-cached, dozens of calls per day is fine |
| Stability | Unofficial API, maintained by react-tweet (27k+ stars) |

## Related Changes

- **post-writing SKILL.md**: Add engagement inbox as 4th source type in Step 1
- **writing-management SKILL.md**: Add `engagement/` directory initialization when x-engagement skill is detected (conditional feature, same pattern as posts/)
- Original v2 design (`2026-03-30-x-engagement-design.md`) is superseded by this document
