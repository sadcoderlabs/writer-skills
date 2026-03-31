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

**Before running:** Read the past week of working memory (MEMORY.md, recent conversation context). Extract supplementary keywords reflecting what the team is currently building, using, or discussing. Carry this context when interpreting and filtering search results after the script runs. This is mandatory — the team's recent experience shapes which tweets are worth engaging with.

**After running:** Read `{workspace}/engagement/candidates.yaml` to see the verified candidates.

### Step 3 — Curate and Review

#### 3a. Read quality resources (mandatory, in this order)

Before drafting anything, read ALL of the following:

1. `{workspace}/social-style-guide.md` → **Persona** section. If it contains placeholder text ("Not yet defined"), stop and guide the user to set up their Persona before continuing (see Prerequisites guidance below).
2. `{workspace}/social-style-guide.md` → **Voice**, **Anti-Patterns**, **Good/Bad Examples** sections (skip any that are still placeholder)
3. `${CLAUDE_SKILL_DIR}/../post-writing/references/post-rules.md` → prohibited patterns, quality requirements
4. `${CLAUDE_SKILL_DIR}/references/engagement-rules.md` → curation criteria (what to engage with, action type, quantity)
5. `${CLAUDE_SKILL_DIR}/references/experience-verification.md` → experience level classification (determines draft angle per candidate)

**Persona setup guidance:** Read `writing.config.md` About + Writing Goals as a starting point. Ask the user one question at a time in ghostwriter mode:
- What is your identity on social media? (engineer, team account, founder...)
- What is your core expertise? (what you actually build/do)
- What image do you want to project? (practitioner, observer, educator...)
- Who is "I" in your posts? (first person individual vs. team "we")
Synthesize answers into a Persona paragraph, confirm with user, write to social-style-guide.md.

#### 3b. Select candidates and draft

Read `{workspace}/engagement/candidates.yaml` and combine with internal context:
- Recent articles from `{workspace}/articles/` (scan titles and briefs from the past 2 weeks)
- Recent posts from `{workspace}/posts/` (past 2 weeks)
- Pending ideas from `{workspace}/ideas.md`
- Agent working memory (if available)

**Classify experience per candidate (mandatory):** For each candidate tweet, determine your experience level following `references/experience-verification.md`. Check working memory and the workspace content you just gathered. Classify as Direct, Adjacent, Inverse, or None. This classification determines your draft angle — if None, downgrade the action to like or skip (do not draft a reply/quote).

For each candidate worth engaging:

1. **Decide action type**: reply, quote, retweet, like, or post (see engagement-rules.md)
2. **Draft copy** (for reply/quote/post actions): Write 3 versions. Every version must:
   - Sound like the person described in Persona (not a generic AI assistant)
   - Include concrete details from your actual experience (project names, numbers, specific tools)
   - Avoid all prohibited patterns from post-rules.md
   - Not resemble any Bad Example in social-style-guide.md

#### 3c. Automated review loop (max 3 rounds)

Switch to reviewer perspective — set aside your role as draft author. You are now a strict quality reviewer. Batch-review all drafts using the criteria in [engagement-reviewer-prompt.md](engagement-reviewer-prompt.md). Read and apply:
- `${CLAUDE_SKILL_DIR}/../post-writing/references/post-rules.md`
- `{workspace}/social-style-guide.md`
- Each item's original tweet content

Use the same output format specified in the prompt template (per-version pass/fail with specific reasons).

**After completing the review:**
- **All versions pass** → proceed to 3d
- **Some versions fail** → rewrite only the failed versions using the specific feedback, then review the rewritten versions again
- **After 3 rounds, some still fail** → mark those items with `⚠️` in the notification (Step 4) to warn the user the draft quality is uncertain

> **Platform note:** If your runtime supports blocking subagent dispatch (e.g., Claude Code Agent tool), you may run this review as a subagent for better isolation. Use [engagement-reviewer-prompt.md](engagement-reviewer-prompt.md) as the dispatch template. **OpenClaw agents: always use inline review — do not spawn a subagent for this step.**

#### 3d. Write to inbox

Use `bun scripts/add.ts` to write each recommendation to inbox (same as before):

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
Why this tweet: Reason for engaging — what makes this worth replying to.

Version A: "Draft A..."
  → Strategy: Why this version takes this angle (e.g., "self-deprecating confession — we have the same problem")
Version B: "Draft B..."
  → Strategy: Why this version takes a different angle
Version C: "Draft C..."
  → Strategy: Why this version takes yet another angle

🔁 Retweet @author
https://x.com/author/status/789
Why: Reason for retweeting.

👍 Like @author
https://x.com/author/status/012
Why: Reason for liking.

💡 New post idea (inspired by @author)
Why: What sparked this idea.

Version A: "Draft A..."
  → Strategy: What angle this version takes
Version B: "Draft B..."
  → Strategy: What angle this version takes
Version C: "Draft C..."
  → Strategy: What angle this version takes

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
為什麼選這則：為什麼值得回覆。

版本 A:
  EN: "English draft A..."
  ZH: 「中文翻譯...」
  策略：這個版本為什麼這樣寫（例如「自嘲認罪——我們有同樣問題」）
版本 B:
  EN: "English draft B..."
  ZH: 「中文翻譯...」
  策略：這個版本的不同切入角度
版本 C:
  EN: "English draft C..."
  ZH: 「中文翻譯...」
  策略：這個版本的另一個角度

🔁 Retweet @author
https://x.com/author/status/789
原文：「English tweet content...」
翻譯：「中文翻譯...」
理由：為什麼值得轉推。

👍 Like @author
https://x.com/author/status/012
原文：「English tweet content...」
翻譯：「中文翻譯...」
理由：為什麼值得按讚。

💡 新貼文靈感（受 @author 啟發）
理由：什麼啟發了這個想法。

版本 A:
  EN: "English draft A..."
  ZH: 「中文翻譯...」
  策略：這個版本的切入角度
版本 B:
  EN: "English draft B..."
  ZH: 「中文翻譯...」
  策略：這個版本的切入角度
版本 C:
  EN: "English draft C..."
  ZH: 「中文翻譯...」
  策略：這個版本的切入角度

---
需要精修文案請執行 post-writing skill
```

The EN lines are copy-paste ready for posting on X. The user-language lines help the user understand and choose.

Send via the configured notification channel. If the channel is `terminal`, display the summary directly in the conversation.

### Step 5 — User Feedback (Optional)

After the user receives the notification (Step 4), they may provide feedback on drafts before executing.

**Skip this step if:** the user proceeds directly to copy-paste and execute without commenting on draft quality.

#### Negative feedback

1. User points out which version is bad and why (e.g., "Version A sounds like a consultant, not like us")
2. Rewrite the rejected version based on the feedback
3. Present the new version for confirmation
4. Once confirmed, follow the feedback extraction process defined in `${CLAUDE_SKILL_DIR}/../post-writing/references/feedback-extraction-format.md`:
   - `before`: the original rejected draft
   - `after`: the confirmed rewrite
   - `reason`: the user's stated reason
   - `source`: `"engagement"`
5. Present extracted patterns to the user for confirmation
6. Write confirmed patterns to `{workspace}/social-style-guide.md` — replace placeholder text if the target section still has it, otherwise append
7. Update the draft in `{workspace}/engagement/inbox.yaml`

#### Positive feedback

1. User marks a version as good (e.g., "Version C is great")
2. If the user explains why, record the reason
3. Follow the feedback extraction process defined in `${CLAUDE_SKILL_DIR}/../post-writing/references/feedback-extraction-format.md`:
   - `before`: "" (empty — no bad version for positive feedback)
   - `after`: the praised version
   - `reason`: the user's explanation (if any)
   - `source`: `"engagement"`
4. Present extracted patterns to the user for confirmation
5. Write confirmed patterns to `{workspace}/social-style-guide.md`

#### Commit (if any patterns were extracted)

```bash
git add {workspace}/social-style-guide.md {workspace}/engagement/inbox.yaml
git commit -m "style: extract engagement feedback patterns"
```

If the workspace is an absolute path, run git commands from the workspace directory. Skip if not a git repository.

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
- Engagement reviewer prompt: [engagement-reviewer-prompt.md](engagement-reviewer-prompt.md)
- Feedback extraction format: [feedback-extraction-format.md](../post-writing/references/feedback-extraction-format.md)
- Post writing rules: [post-rules.md](../post-writing/references/post-rules.md)
- Design spec: [x-engagement-design.md](../../docs/superpowers/specs/2026-03-30-x-engagement-design.md)
