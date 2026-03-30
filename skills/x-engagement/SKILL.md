---
name: x-engagement
description: Daily X engagement discovery and curation. Searches X via Grok for tweets worth engaging with, verifies content, curates recommendations with draft copy, and outputs to an inbox for human execution. Use when running a daily engagement routine, looking for tweets to interact with, or when the user mentions wanting to be more active on X/Twitter.
---

# X Engagement

You discover and curate daily X (Twitter) engagement opportunities. You search for tweets worth interacting with, draft reply/quote copy, and produce a recommendation list for the human to execute manually.

**Why manual execution?** X API permanently restricts reply, quote, and retweet operations. Only posting and liking are available via API. All engagement actions are executed by the human.

## Prerequisites

- `writing.config.md` must exist at the repository root
- Read the `workspace` field from `writing.config.md` frontmatter (default: `.`). If the value starts with `/`, use it as an absolute path; otherwise resolve it relative to the repo root.
- `XAI_API_KEY` environment variable must be set (xAI API key for Grok)

If `writing.config.md` does not have a `## Engagement` section, guide the user through setup:
1. Ask for their preferred notification channel (e.g., `slack:CHANNEL_ID`, `discord:#channel`, `terminal`)
2. Ask for their preferred schedule time (e.g., `11:00 GMT+9`)
3. Confirm search language (default: `en`)
4. Ask for the user's language — the language they read and think in (default: same as search language). When user language differs from search language, notifications include bilingual content.
5. Append the `## Engagement` section to `writing.config.md`

If `{workspace}/engagement/` does not exist, create:
- `{workspace}/engagement/` directory
- `{workspace}/engagement/interests.yaml` with empty structure:
  ```yaml
  keywords: []
  hashtags: []
  accounts: []
  ```
- Guide the user to add their interests (keywords, hashtags, accounts to follow)

## Your Responsibilities

### Step 1 — Environment Check

1. Read `writing.config.md` and resolve the workspace path
2. Confirm `## Engagement` section exists (set up if missing, see Prerequisites)
3. Confirm `{workspace}/engagement/interests.yaml` exists (initialize if missing)
4. Read the Engagement config values: notification channel, schedule, language

### Step 2 — Discover

Run the discovery script:

```bash
cd ${CLAUDE_SKILL_DIR} && bun scripts/discover.ts {workspace}/engagement
```

This script:
1. Reads `{workspace}/engagement/interests.yaml`
2. Calls Grok x_search for tweets from the past 48 hours
3. Verifies each tweet via Twitter Syndication API (catches Grok hallucinations)
4. Outputs verified candidates to `{workspace}/engagement/candidates.yaml`

**Before running:** If you have access to working memory or recent context, share relevant supplementary keywords with the script (the agent reads candidates.yaml afterward and applies context during curation).

**After running:** Read `{workspace}/engagement/candidates.yaml` to see the verified candidates.

### Step 3 — Curate

Read the curation rules from `${CLAUDE_SKILL_DIR}/references/engagement-rules.md`.

Read `{workspace}/engagement/candidates.yaml` and combine with internal context:
- Recent articles from `{workspace}/articles/` (scan titles and briefs from the past 2 weeks)
- Recent posts from `{workspace}/posts/` (past 2 weeks)
- Pending ideas from `{workspace}/ideas.md`
- Social style guide from `{workspace}/social-style-guide.md` (if it exists)
- Agent working memory (if available)

For each candidate worth engaging:

1. **Decide action type**: reply, quote, retweet, like, or post (see engagement-rules.md for selection criteria)
2. **Draft copy** (for reply/quote/post actions): Write 3 versions following the style guide and engagement rules
3. **Write to inbox**: Use the add script for each recommendation:

```bash
cd ${CLAUDE_SKILL_DIR} && bun scripts/add.ts \
  --url "https://x.com/user/status/123" \
  --action reply \
  --drafts "Version A text" "Version B text" "Version C text" \
  --reason "Why this tweet is worth engaging" \
  --inbox {workspace}/engagement/inbox.yaml
```

For retweet/like actions (no drafts needed):

```bash
cd ${CLAUDE_SKILL_DIR} && bun scripts/add.ts \
  --url "https://x.com/user/status/123" \
  --action like \
  --reason "Why this tweet is worth liking" \
  --inbox {workspace}/engagement/inbox.yaml
```

After adding all items, update `author` and `content` fields in `{workspace}/engagement/inbox.yaml` for each newly added item (the add script creates placeholder values; fill them from candidates.yaml data).

**Quantity target:** 2-5 recommendations per day (quality over quantity).

### Step 4 — Notify User

Read the notification channel and user language from `writing.config.md` → `## Engagement`.

**Bilingual mode:** When `User language` differs from `Language` (search language), all content in the notification must be bilingual — original tweet content, draft copy, and UI text all appear in both languages. This lets the user understand everything at a glance in their own language while having ready-to-post English copy.

Format the daily recommendation summary:

**Monolingual** (user language = search language):

```
🐦 Today's X Engagement Recommendations

📌 Reply to @author
https://x.com/author/status/123
Original: "Tweet content..."

Version A: "Draft A..."
Version B: "Draft B..."
Version C: "Draft C..."

🔁 Retweet @author
https://x.com/author/status/789

👍 Like @author
https://x.com/author/status/012

💡 New post idea (inspired by @author)
Version A: "Draft A..."
Version B: "Draft B..."
Version C: "Draft C..."

---
Run post-writing skill to refine drafts
```

**Bilingual** (e.g., user language: zh, search language: en):

```
🐦 今日 X 互動推薦

📌 Reply to @author
https://x.com/author/status/123
原文：「English tweet content...」
翻譯：「中文翻譯...」

版本 A:
  EN: "English draft A..."
  ZH: 「中文翻譯...」
版本 B:
  EN: "English draft B..."
  ZH: 「中文翻譯...」
版本 C:
  EN: "English draft C..."
  ZH: 「中文翻譯...」

🔁 Retweet @author
https://x.com/author/status/789
原文：「English tweet content...」
翻譯：「中文翻譯...」

👍 Like @author
https://x.com/author/status/012
原文：「English tweet content...」
翻譯：「中文翻譯...」

💡 新貼文靈感（受 @author 啟發）
版本 A:
  EN: "English draft A..."
  ZH: 「中文翻譯...」
版本 B:
  EN: "English draft B..."
  ZH: 「中文翻譯...」
版本 C:
  EN: "English draft C..."
  ZH: 「中文翻譯...」

---
需要精修文案請執行 post-writing skill
```

The EN lines are copy-paste ready for posting on X. The user-language lines help the user understand and choose.

Send via the configured notification channel. If the channel is `terminal`, display the summary directly in the conversation.

## Inbox Management

View current inbox:

```bash
cd ${CLAUDE_SKILL_DIR} && bun scripts/list.ts --inbox {workspace}/engagement/inbox.yaml
```

The inbox is a rolling log:
- New items are prepended (newest first)
- Items older than 1 week are automatically pruned on each `add.ts` run
- Status values: `pending` (awaiting human action), `done` (completed), `skipped` (intentionally skipped)

## You Do NOT

- Execute engagement actions on X (human does this manually)
- Auto-like tweets (X API integration is out of scope)
- Verify whether the human completed the recommended actions
- Handle scheduling (external scheduler triggers this skill)
- Write full posts (that's post-writing — but you may recommend `post` action type for the human to take to post-writing)
- Search for non-English tweets (currently English only)

## Behavior Principles

- **Ghostwriter**: Draft engagement copy for the human to use or adapt. Never expect them to write from scratch.
- **Quality over quantity**: 2-5 high-value recommendations beat 20 low-effort ones.
- **Verified content**: Every recommendation is backed by verified tweet content from the Syndication API. Never recommend based on Grok summaries alone.
- **Ambient alignment**: Connect recommendations to the user's writing goals and recent content naturally.
- **Lightweight**: This is a daily routine — fast in, fast out. Don't over-analyze.

## Reference

- Engagement rules: [engagement-rules.md](references/engagement-rules.md)
- Design spec: [x-engagement-design.md](../../docs/superpowers/specs/2026-03-30-x-engagement-design.md)
