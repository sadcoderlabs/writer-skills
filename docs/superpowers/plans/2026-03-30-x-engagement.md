# x-engagement Skill Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add daily X engagement discovery and curation capability, integrated with the existing post-writing workflow via a shared inbox.

**Architecture:** New `x-engagement` skill with TypeScript scripts (Bun runtime) for Grok x_search discovery and inbox management. Agent-driven curation in SKILL.md. Shared `{workspace}/engagement/inbox.yaml` connects to `post-writing` as a 4th source type. `writing-management` gains conditional initialization for the engagement directory.

**Tech Stack:** Bun + TypeScript for scripts, `yaml` package for YAML I/O, xAI Responses API for Grok x_search, Twitter Syndication API for tweet verification. Markdown skill definitions following the Agent Skills open standard.

**Design spec:** `docs/superpowers/specs/2026-03-30-x-engagement-design.md`

---

## File Structure

### New files (x-engagement skill)

| File | Responsibility |
|------|---------------|
| `skills/x-engagement/package.json` | Bun project config, dependencies |
| `skills/x-engagement/tsconfig.json` | TypeScript config |
| `skills/x-engagement/scripts/lib/inbox.ts` | Shared YAML read/write, prepend, prune logic |
| `skills/x-engagement/scripts/lib/inbox.test.ts` | Tests for inbox logic |
| `skills/x-engagement/scripts/lib/syndication.ts` | Twitter Syndication API client |
| `skills/x-engagement/scripts/lib/syndication.test.ts` | Tests for syndication client |
| `skills/x-engagement/scripts/add.ts` | CLI: prepend item to inbox + prune old entries |
| `skills/x-engagement/scripts/list.ts` | CLI: display inbox contents |
| `skills/x-engagement/scripts/discover.ts` | CLI: Grok x_search → verify via Syndication → candidates.yaml |
| `skills/x-engagement/references/engagement-rules.md` | Curation criteria and draft rules |
| `skills/x-engagement/SKILL.md` | Skill definition with 4-step daily workflow |

### Modified files

| File | Change |
|------|--------|
| `skills/writing-management/SKILL.md` | Add engagement/ directory initialization (conditional on x-engagement skill) |
| `skills/writing-management/references/config-format.md` | Document new `## Engagement` section |
| `skills/post-writing/SKILL.md` | Add engagement inbox as 4th source type in Step 1 |

---

### Task 1: Initialize TypeScript project

**Files:**
- Create: `skills/x-engagement/package.json`
- Create: `skills/x-engagement/tsconfig.json`

- [ ] **Step 1: Create package.json**

```json
{
  "name": "x-engagement-scripts",
  "private": true,
  "type": "module",
  "scripts": {
    "discover": "bun scripts/discover.ts",
    "add": "bun scripts/add.ts",
    "list": "bun scripts/list.ts",
    "test": "bun test"
  },
  "dependencies": {
    "yaml": "^2.7.0"
  },
  "devDependencies": {
    "@types/bun": "latest"
  }
}
```

Write to `skills/x-engagement/package.json`.

- [ ] **Step 2: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "skipLibCheck": true,
    "noEmit": true,
    "types": ["bun-types"]
  },
  "include": ["scripts/**/*.ts"]
}
```

Write to `skills/x-engagement/tsconfig.json`.

- [ ] **Step 3: Install dependencies**

Run: `cd skills/x-engagement && bun install`

Expected: `bun.lock` created, `node_modules/` populated.

- [ ] **Step 4: Commit**

```bash
git add skills/x-engagement/package.json skills/x-engagement/tsconfig.json skills/x-engagement/bun.lock
git commit -m "feat(x-engagement): initialize TypeScript project with Bun"
```

---

### Task 2: Create shared inbox logic

**Files:**
- Create: `skills/x-engagement/scripts/lib/inbox.ts`
- Create: `skills/x-engagement/scripts/lib/inbox.test.ts`

- [ ] **Step 1: Write the failing tests**

```typescript
// scripts/lib/inbox.test.ts
import { describe, test, expect } from "bun:test";
import {
  type InboxItem,
  readInbox,
  writeInbox,
  prependItem,
  pruneOlderThan,
} from "./inbox";
import { join } from "path";
import { mkdtemp, rm } from "fs/promises";
import { tmpdir } from "os";

describe("prependItem", () => {
  const baseItem: InboxItem = {
    id: "111",
    url: "https://x.com/user/status/111",
    author: "user",
    content: "Hello world",
    action: "like",
    drafts: [],
    reason: "test",
    discoveredAt: "2026-03-30T00:00:00Z",
    status: "pending",
  };

  test("prepends to empty array", () => {
    const result = prependItem([], baseItem);
    expect(result).toEqual([baseItem]);
  });

  test("prepends to existing array (newest first)", () => {
    const existing: InboxItem = {
      ...baseItem,
      id: "100",
      url: "https://x.com/user/status/100",
    };
    const result = prependItem([existing], baseItem);
    expect(result[0].id).toBe("111");
    expect(result[1].id).toBe("100");
  });
});

describe("pruneOlderThan", () => {
  const now = new Date("2026-03-30T12:00:00Z");

  test("removes items older than N days", () => {
    const old: InboxItem = {
      id: "1",
      url: "https://x.com/u/status/1",
      author: "u",
      content: "old",
      action: "like",
      drafts: [],
      reason: "",
      discoveredAt: "2026-03-20T00:00:00Z", // 10 days ago
      status: "pending",
    };
    const recent: InboxItem = {
      id: "2",
      url: "https://x.com/u/status/2",
      author: "u",
      content: "recent",
      action: "like",
      drafts: [],
      reason: "",
      discoveredAt: "2026-03-29T00:00:00Z", // 1 day ago
      status: "pending",
    };
    const result = pruneOlderThan([old, recent], 7, now);
    expect(result).toEqual([recent]);
  });

  test("removes old items regardless of status", () => {
    const oldDone: InboxItem = {
      id: "1",
      url: "https://x.com/u/status/1",
      author: "u",
      content: "done but old",
      action: "reply",
      drafts: ["a"],
      reason: "",
      discoveredAt: "2026-03-20T00:00:00Z",
      status: "done",
    };
    const result = pruneOlderThan([oldDone], 7, now);
    expect(result).toEqual([]);
  });

  test("keeps items exactly at the boundary", () => {
    const boundary: InboxItem = {
      id: "1",
      url: "https://x.com/u/status/1",
      author: "u",
      content: "boundary",
      action: "like",
      drafts: [],
      reason: "",
      discoveredAt: "2026-03-23T12:00:00Z", // exactly 7 days ago
      status: "pending",
    };
    const result = pruneOlderThan([boundary], 7, now);
    expect(result).toEqual([boundary]);
  });
});

describe("readInbox / writeInbox", () => {
  let tmpDir: string;

  test("returns empty array for non-existent file", async () => {
    tmpDir = await mkdtemp(join(tmpdir(), "inbox-test-"));
    const result = await readInbox(join(tmpDir, "inbox.yaml"));
    expect(result).toEqual([]);
    await rm(tmpDir, { recursive: true });
  });

  test("round-trips items through YAML", async () => {
    tmpDir = await mkdtemp(join(tmpdir(), "inbox-test-"));
    const filePath = join(tmpDir, "inbox.yaml");
    const items: InboxItem[] = [
      {
        id: "123",
        url: "https://x.com/user/status/123",
        author: "user",
        content: "Test tweet",
        action: "reply",
        drafts: ["Draft A", "Draft B", "Draft C"],
        reason: "Relevant to AI agents",
        discoveredAt: "2026-03-30T02:00:00Z",
        status: "pending",
      },
    ];
    await writeInbox(filePath, items);
    const result = await readInbox(filePath);
    expect(result).toEqual(items);
    await rm(tmpDir, { recursive: true });
  });
});
```

Write to `skills/x-engagement/scripts/lib/inbox.test.ts`.

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd skills/x-engagement && bun test scripts/lib/inbox.test.ts`

Expected: FAIL — cannot find module `./inbox`.

- [ ] **Step 3: Implement inbox.ts**

```typescript
// scripts/lib/inbox.ts
import { readFile, writeFile, mkdir } from "fs/promises";
import { dirname } from "path";
import { parse, stringify } from "yaml";

export interface InboxItem {
  id: string;
  url: string;
  author: string;
  content: string;
  action: "reply" | "quote" | "retweet" | "like" | "post";
  drafts: string[];
  reason: string;
  discoveredAt: string;
  status: "pending" | "done" | "skipped";
}

export async function readInbox(filePath: string): Promise<InboxItem[]> {
  try {
    const text = await readFile(filePath, "utf-8");
    const data = parse(text);
    if (!Array.isArray(data)) return [];
    return data as InboxItem[];
  } catch {
    return [];
  }
}

export async function writeInbox(
  filePath: string,
  items: InboxItem[]
): Promise<void> {
  await mkdir(dirname(filePath), { recursive: true });
  const text = stringify(items, { lineWidth: 0 });
  await writeFile(filePath, text, "utf-8");
}

export function prependItem(
  items: InboxItem[],
  newItem: InboxItem
): InboxItem[] {
  return [newItem, ...items];
}

export function pruneOlderThan(
  items: InboxItem[],
  days: number,
  now: Date = new Date()
): InboxItem[] {
  const cutoff = now.getTime() - days * 24 * 60 * 60 * 1000;
  return items.filter(
    (item) => new Date(item.discoveredAt).getTime() >= cutoff
  );
}
```

Write to `skills/x-engagement/scripts/lib/inbox.ts`.

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd skills/x-engagement && bun test scripts/lib/inbox.test.ts`

Expected: All 6 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add skills/x-engagement/scripts/lib/inbox.ts skills/x-engagement/scripts/lib/inbox.test.ts
git commit -m "feat(x-engagement): add shared inbox read/write/prepend/prune logic"
```

---

### Task 3: Create Twitter Syndication API client

**Files:**
- Create: `skills/x-engagement/scripts/lib/syndication.ts`
- Create: `skills/x-engagement/scripts/lib/syndication.test.ts`

- [ ] **Step 1: Write the failing tests**

```typescript
// scripts/lib/syndication.test.ts
import { describe, test, expect } from "bun:test";
import { extractTweetId, computeToken, fetchTweet } from "./syndication";

describe("extractTweetId", () => {
  test("extracts ID from x.com URL", () => {
    expect(
      extractTweetId("https://x.com/fredchuuu/status/2038476548874145995")
    ).toBe("2038476548874145995");
  });

  test("extracts ID from twitter.com URL", () => {
    expect(
      extractTweetId("https://twitter.com/user/status/123456789")
    ).toBe("123456789");
  });

  test("extracts ID from x.com/i/status URL (citation format)", () => {
    expect(
      extractTweetId("https://x.com/i/status/2038476548874145995")
    ).toBe("2038476548874145995");
  });

  test("returns null for invalid URL", () => {
    expect(extractTweetId("https://example.com")).toBeNull();
  });
});

describe("computeToken", () => {
  test("produces a deterministic string for a given ID", () => {
    const token = computeToken("2038476548874145995");
    expect(typeof token).toBe("string");
    expect(token.length).toBeGreaterThan(0);
    // Same ID always produces same token
    expect(computeToken("2038476548874145995")).toBe(token);
  });
});

describe("fetchTweet", () => {
  test("fetches a real tweet and returns structured data", async () => {
    const tweet = await fetchTweet("2038476548874145995");
    expect(tweet).not.toBeNull();
    expect(tweet!.id).toBe("2038476548874145995");
    expect(tweet!.author).toBe("fredchuuu");
    expect(tweet!.text).toContain("驚為天人");
    expect(typeof tweet!.favorite_count).toBe("number");
    expect(typeof tweet!.conversation_count).toBe("number");
    expect(typeof tweet!.lang).toBe("string");
    expect(typeof tweet!.created_at).toBe("string");
    expect(typeof tweet!.note_tweet).toBe("boolean");
  });

  test("returns null for non-existent tweet", async () => {
    const tweet = await fetchTweet("1");
    expect(tweet).toBeNull();
  });
});
```

Write to `skills/x-engagement/scripts/lib/syndication.test.ts`.

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd skills/x-engagement && bun test scripts/lib/syndication.test.ts`

Expected: FAIL — cannot find module `./syndication`.

- [ ] **Step 3: Implement syndication.ts**

```typescript
// scripts/lib/syndication.ts

export interface TweetData {
  id: string;
  text: string;
  author: string;
  author_name: string;
  created_at: string;
  lang: string;
  favorite_count: number;
  conversation_count: number;
  note_tweet: boolean;
}

const SYNDICATION_URL = "https://cdn.syndication.twimg.com/tweet-result";

const FEATURES =
  "tfw_timeline_list:;tfw_follower_count_sunset:true;tfw_tweet_edit_backend:on;tfw_refsrc_session:on;tfw_fosnr_soft_interventions_enabled:on;tfw_show_birdwatch_pivots_enabled:on;tfw_show_business_verified_badge:on;tfw_duplicate_scribes_to_settings:on;tfw_use_profile_image_shape_enabled:on;tfw_show_blue_verified_badge:on;tfw_legacy_timeline_sunset:true;tfw_show_gov_verified_badge:on;tfw_show_business_affiliate_badge:on;tfw_tweet_edit_frontend:on";

export function extractTweetId(url: string): string | null {
  const match = url.match(
    /(?:twitter\.com|x\.com)\/(?:\w+|i)\/status\/(\d+)/
  );
  return match ? match[1] : null;
}

export function computeToken(id: string): string {
  return ((Number(id) / 1e15) * Math.PI)
    .toString(36)
    .replace(/(0+|\.)/g, "");
}

export async function fetchTweet(id: string): Promise<TweetData | null> {
  const url = new URL(SYNDICATION_URL);
  url.searchParams.set("id", id);
  url.searchParams.set("lang", "en");
  url.searchParams.set("features", FEATURES);
  url.searchParams.set("token", computeToken(id));

  const res = await fetch(url.toString());
  if (!res.ok) return null;

  const data = await res.json();
  if (!data || typeof data !== "object" || Object.keys(data).length === 0) {
    return null;
  }
  if (data.__typename === "TweetTombstone") return null;

  return {
    id: String(data.id_str ?? id),
    text: String(data.text ?? ""),
    author: String(data.user?.screen_name ?? ""),
    author_name: String(data.user?.name ?? ""),
    created_at: String(data.created_at ?? ""),
    lang: String(data.lang ?? ""),
    favorite_count: Number(data.favorite_count ?? 0),
    conversation_count: Number(data.conversation_count ?? 0),
    note_tweet: Boolean(data.note_tweet),
  };
}
```

Write to `skills/x-engagement/scripts/lib/syndication.ts`.

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd skills/x-engagement && bun test scripts/lib/syndication.test.ts`

Expected: All 5 tests PASS. The `fetchTweet` tests make real HTTP calls to the Syndication API (public CDN, no auth needed).

- [ ] **Step 5: Commit**

```bash
git add skills/x-engagement/scripts/lib/syndication.ts skills/x-engagement/scripts/lib/syndication.test.ts
git commit -m "feat(x-engagement): add Twitter Syndication API client with verification"
```

---

### Task 4: Create add.ts CLI

**Files:**
- Create: `skills/x-engagement/scripts/add.ts`

- [ ] **Step 1: Implement add.ts**

```typescript
// scripts/add.ts
import { parseArgs } from "util";
import { readInbox, writeInbox, prependItem, pruneOlderThan } from "./lib/inbox";
import { extractTweetId } from "./lib/syndication";

const { values } = parseArgs({
  args: Bun.argv.slice(2),
  options: {
    url: { type: "string" },
    action: { type: "string" },
    drafts: { type: "string", multiple: true },
    reason: { type: "string", default: "" },
    inbox: { type: "string", default: "engagement/inbox.yaml" },
  },
  strict: true,
});

if (!values.url || !values.action) {
  console.error("Usage: bun scripts/add.ts --url <tweet_url> --action <type> [--drafts \"A\" \"B\" \"C\"] [--reason \"...\"] [--inbox <path>]");
  console.error("Actions: reply | quote | retweet | like | post");
  process.exit(1);
}

const validActions = ["reply", "quote", "retweet", "like", "post"] as const;
if (!validActions.includes(values.action as any)) {
  console.error(`Invalid action: ${values.action}. Must be one of: ${validActions.join(", ")}`);
  process.exit(1);
}

const tweetId = extractTweetId(values.url);
if (!tweetId) {
  console.error(`Could not extract tweet ID from URL: ${values.url}`);
  process.exit(1);
}

const inboxPath = values.inbox;
const items = await readInbox(inboxPath);

const newItem = {
  id: tweetId,
  url: values.url,
  author: "",  // will be filled by agent during curation
  content: "", // will be filled by agent during curation
  action: values.action as "reply" | "quote" | "retweet" | "like" | "post",
  drafts: values.drafts ?? [],
  reason: values.reason ?? "",
  discoveredAt: new Date().toISOString(),
  status: "pending" as const,
};

const updated = pruneOlderThan(prependItem(items, newItem), 7);
await writeInbox(inboxPath, updated);

const pruned = items.length + 1 - updated.length;
console.log(`Added ${values.action} for ${values.url}`);
if (pruned > 0) {
  console.log(`Pruned ${pruned} items older than 1 week`);
}
console.log(`Inbox now has ${updated.length} items`);
```

Write to `skills/x-engagement/scripts/add.ts`.

- [ ] **Step 2: Test manually**

Run: `cd skills/x-engagement && bun scripts/add.ts --url "https://x.com/test/status/123" --action like --inbox /tmp/test-inbox.yaml`

Expected: Output shows "Added like for https://x.com/test/status/123" and "Inbox now has 1 items".

Run: `cat /tmp/test-inbox.yaml`

Expected: YAML file with one item.

- [ ] **Step 3: Commit**

```bash
git add skills/x-engagement/scripts/add.ts
git commit -m "feat(x-engagement): add inbox add CLI with auto-prune"
```

---

### Task 5: Create list.ts CLI

**Files:**
- Create: `skills/x-engagement/scripts/list.ts`

- [ ] **Step 1: Implement list.ts**

```typescript
// scripts/list.ts
import { parseArgs } from "util";
import { readInbox } from "./lib/inbox";

const { values } = parseArgs({
  args: Bun.argv.slice(2),
  options: {
    inbox: { type: "string", default: "engagement/inbox.yaml" },
  },
  strict: true,
});

const items = await readInbox(values.inbox);

if (items.length === 0) {
  console.log("Inbox is empty.");
  process.exit(0);
}

const statusPad = 9; // "[pending] " or "[skipped] "

for (const item of items) {
  const date = item.discoveredAt.slice(0, 10);
  const status = `[${item.status}]`.padEnd(statusPad);
  const author = item.author ? `@${item.author}` : item.url;
  const content = item.content
    ? `"${item.content.slice(0, 40)}${item.content.length > 40 ? "..." : ""}"`
    : "";
  const drafts = item.drafts.length > 0 ? ` (${item.drafts.length} drafts)` : "";
  console.log(`${status} ${date} ${item.action.padEnd(7)} ${author} - ${content}${drafts}`);
}

console.log(`\nTotal: ${items.length} items`);
```

Write to `skills/x-engagement/scripts/list.ts`.

- [ ] **Step 2: Test manually using the inbox from Task 4**

Run: `cd skills/x-engagement && bun scripts/list.ts --inbox /tmp/test-inbox.yaml`

Expected: Output shows the item added in Task 4 with status, date, action, and URL.

- [ ] **Step 3: Commit**

```bash
git add skills/x-engagement/scripts/list.ts
git commit -m "feat(x-engagement): add inbox list CLI"
```

---

### Task 6: Create discover.ts

**Files:**
- Create: `skills/x-engagement/scripts/discover.ts`

This script orchestrates: read interests → call Grok x_search → verify via Syndication API → write candidates.yaml.

- [ ] **Step 1: Implement discover.ts**

```typescript
// scripts/discover.ts
import { readFile, writeFile, readdir, mkdir } from "fs/promises";
import { join, resolve } from "path";
import { parse, stringify } from "yaml";
import { extractTweetId, fetchTweet, type TweetData } from "./lib/syndication";

// --- Types ---

interface Interests {
  keywords?: string[];
  hashtags?: string[];
  accounts?: string[];
}

interface Candidate {
  id: string;
  url: string;
  author: string;
  content: string;
  summary: string;
  lang: string;
  favorite_count: number;
  conversation_count: number;
  verified: boolean;
  note_tweet: boolean;
  searchQuery: string;
  discoveredAt: string;
}

// --- Config ---

const XAI_API_KEY = process.env.XAI_API_KEY;
if (!XAI_API_KEY) {
  console.error("Error: XAI_API_KEY environment variable is required");
  process.exit(1);
}

const engagementDir = process.argv[2] || "engagement";

// --- Helpers ---

function getDateRange(): { from_date: string; to_date: string } {
  const now = new Date();
  const twoDaysAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);
  return {
    from_date: twoDaysAgo.toISOString().slice(0, 10),
    to_date: now.toISOString().slice(0, 10),
  };
}

async function readInterests(dir: string): Promise<Interests> {
  try {
    const text = await readFile(join(dir, "interests.yaml"), "utf-8");
    return (parse(text) as Interests) ?? {};
  } catch {
    console.error(`Warning: Could not read ${join(dir, "interests.yaml")}`);
    return {};
  }
}

function buildSearchPrompt(interests: Interests, supplementaryKeywords: string[]): string {
  const allKeywords = [
    ...(interests.keywords ?? []),
    ...(interests.hashtags ?? []),
    ...supplementaryKeywords,
  ];

  return `Search X (Twitter) for recent English-language tweets about the following topics:

Keywords: ${allKeywords.join(", ")}

Instructions:
- Only return English tweets
- Focus on tweets with genuine insights, opinions, or discussions (not news reposts or spam)
- Prefer tweets with some engagement (likes, replies) indicating community interest
- For each tweet found, provide:
  1. The tweet URL
  2. A brief summary of what the tweet says and why it's relevant

Return results as a structured list. Aim for 5-15 relevant tweets.`;
}

async function callGrokXSearch(
  prompt: string,
  interests: Interests
): Promise<{ text: string; citations: string[] }> {
  const { from_date, to_date } = getDateRange();

  const tools: any[] = [
    {
      type: "x_search",
      x_search: { from_date, to_date },
    },
  ];

  const body = {
    model: "grok-4-1-fast",
    input: [{ role: "user", content: prompt }],
    tools,
    tool_choice: "required",
    include: ["inline_citations"],
  };

  // If there are tracked accounts, do an additional search with allowed_x_handles
  const responses: { text: string; citations: string[] }[] = [];

  // Main keyword search
  const res = await fetch("https://api.x.ai/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${XAI_API_KEY}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Grok API error (${res.status}): ${err}`);
  }

  const data = await res.json();

  // Extract text and citations from response
  let text = "";
  const citations: string[] = [];

  for (const output of data.output ?? []) {
    if (output.type === "message") {
      for (const content of output.content ?? []) {
        if (content.type === "output_text") {
          text += content.text;
          for (const ann of content.annotations ?? []) {
            if (ann.type === "url_citation" && ann.url) {
              citations.push(ann.url);
            }
          }
        }
      }
    }
  }

  // Also check top-level citations
  for (const cite of data.citations ?? []) {
    if (cite.url) citations.push(cite.url);
  }

  responses.push({ text, citations });

  // Additional search for tracked accounts (batched, max 10 per call)
  const accounts = interests.accounts ?? [];
  for (let i = 0; i < accounts.length; i += 10) {
    const batch = accounts.slice(i, i + 10);
    const accountBody = {
      ...body,
      input: [
        {
          role: "user",
          content: `Search X for recent English tweets from these accounts: ${batch.join(", ")}. Find their most interesting or discussion-worthy tweets from the past 48 hours. For each tweet, provide the URL and a brief summary.`,
        },
      ],
      tools: [
        {
          type: "x_search",
          x_search: {
            from_date,
            to_date,
            allowed_x_handles: batch,
          },
        },
      ],
    };

    const accountRes = await fetch("https://api.x.ai/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${XAI_API_KEY}`,
      },
      body: JSON.stringify(accountBody),
    });

    if (accountRes.ok) {
      const accountData = await accountRes.json();
      let accountText = "";
      const accountCitations: string[] = [];
      for (const output of accountData.output ?? []) {
        if (output.type === "message") {
          for (const content of output.content ?? []) {
            if (content.type === "output_text") {
              accountText += content.text;
              for (const ann of content.annotations ?? []) {
                if (ann.type === "url_citation" && ann.url) {
                  accountCitations.push(ann.url);
                }
              }
            }
          }
        }
      }
      for (const cite of accountData.citations ?? []) {
        if (cite.url) accountCitations.push(cite.url);
      }
      responses.push({ text: accountText, citations: accountCitations });
    }
  }

  // Merge all responses
  return {
    text: responses.map((r) => r.text).join("\n\n"),
    citations: [...new Set(responses.flatMap((r) => r.citations))],
  };
}

function extractTweetUrls(citations: string[], text: string): string[] {
  const urls = new Set<string>();

  // From citations
  for (const url of citations) {
    if (/(?:twitter\.com|x\.com)\/(?:\w+|i)\/status\/\d+/.test(url)) {
      urls.add(url);
    }
  }

  // From text (in case some URLs are inline but not in citations)
  const urlPattern = /https?:\/\/(?:twitter\.com|x\.com)\/(?:\w+|i)\/status\/\d+/g;
  for (const match of text.matchAll(urlPattern)) {
    urls.add(match[0]);
  }

  return [...urls];
}

// --- Main ---

async function main() {
  console.log("=== x-engagement: Discover ===\n");

  // 1. Read interests
  const interests = await readInterests(engagementDir);
  console.log(
    `Interests: ${(interests.keywords ?? []).length} keywords, ${(interests.hashtags ?? []).length} hashtags, ${(interests.accounts ?? []).length} accounts`
  );

  // 2. Build search prompt (supplementary keywords from articles/posts — placeholder for agent to fill)
  const supplementaryKeywords: string[] = [];
  // Agent can pass supplementary keywords via environment or file in the future
  const prompt = buildSearchPrompt(interests, supplementaryKeywords);

  // 3. Call Grok x_search
  console.log("Calling Grok x_search...");
  const grokResult = await callGrokXSearch(prompt, interests);
  console.log(`Grok returned ${grokResult.citations.length} citations`);

  // 4. Extract tweet URLs
  const tweetUrls = extractTweetUrls(grokResult.citations, grokResult.text);
  console.log(`Found ${tweetUrls.length} tweet URLs`);

  // 5. Verify each tweet via Syndication API
  console.log("Verifying tweets via Syndication API...");
  const candidates: Candidate[] = [];
  const seen = new Set<string>();

  for (const url of tweetUrls) {
    const id = extractTweetId(url);
    if (!id || seen.has(id)) continue;
    seen.add(id);

    const tweet = await fetchTweet(id);
    if (!tweet) {
      console.log(`  ✗ ${url} — could not fetch (deleted/private?)`);
      continue;
    }

    candidates.push({
      id,
      url: `https://x.com/${tweet.author}/status/${id}`,
      author: tweet.author,
      content: tweet.text,
      summary: "", // Will be extracted from Grok's text by the agent during curation
      lang: tweet.lang,
      favorite_count: tweet.favorite_count,
      conversation_count: tweet.conversation_count,
      verified: true,
      note_tweet: tweet.note_tweet,
      searchQuery: "",
      discoveredAt: new Date().toISOString(),
    });
    console.log(`  ✓ ${url} — @${tweet.author}: "${tweet.text.slice(0, 50)}..."`);
  }

  // 6. Write candidates.yaml
  await mkdir(engagementDir, { recursive: true });
  const outPath = join(engagementDir, "candidates.yaml");
  await writeFile(outPath, stringify(candidates, { lineWidth: 0 }), "utf-8");
  console.log(`\nWrote ${candidates.length} verified candidates to ${outPath}`);
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
```

Write to `skills/x-engagement/scripts/discover.ts`.

- [ ] **Step 2: Verify the script loads without errors (no API call)**

Run: `cd skills/x-engagement && XAI_API_KEY=test bun scripts/discover.ts --help 2>&1 || true`

Expected: Script starts but fails trying to read interests.yaml (not a crash from import errors). This confirms all imports resolve correctly.

- [ ] **Step 3: Commit**

```bash
git add skills/x-engagement/scripts/discover.ts
git commit -m "feat(x-engagement): add Grok x_search discovery with Syndication API verification"
```

---

### Task 7: Create engagement-rules.md

**Files:**
- Create: `skills/x-engagement/references/engagement-rules.md`

- [ ] **Step 1: Create the reference file**

```markdown
# Engagement Rules

Rules for curating X engagement recommendations. These guide the agent during the Curate step.

## Curation Criteria

### Worth engaging

- Tweets that share genuine insights or experiences related to your interests
- Discussions where your perspective adds value (not just agreement)
- Content from accounts you follow that sparks ideas
- Tweets that connect to your recent articles or posts

### Skip

- Pure news reposts without original commentary
- Promotional tweets or product launches (unless directly relevant)
- Rage bait or controversy-farming tweets
- Tweets with no engagement (0 likes, 0 replies) — likely low visibility

## Draft Rules

### Reply drafts

- Add value: share your experience, a specific example, or a contrasting perspective
- Don't just agree ("Great point!") — extend the conversation
- Keep within platform character limits (280 for X)
- Match the tone of the original tweet (casual reply to casual tweet)

### Quote retweet drafts

- Add context or your own take — don't just repeat what the original said
- Good for connecting the tweet to something you've written or experienced
- The quote should make sense on its own (your followers may not click through)

### Post drafts (inspired standalone)

- The original tweet is inspiration, not source material
- Your post should stand alone without the reader knowing what inspired it
- Follow the social style guide for voice and structure

## Action Type Selection

| Signal | Suggested Action |
|--------|-----------------|
| Tweet expresses opinion you have thoughts on | reply |
| Tweet relates to something you've written | quote |
| Tweet is excellent and speaks for itself | retweet |
| Tweet is good but no response needed | like |
| Tweet sparks an independent idea | post |

## Quantity Guidelines

Per daily run, recommend:
- 1-2 reply or quote actions (highest value, requires drafting)
- 0-1 standalone post inspiration
- 0-2 retweet or like suggestions
- Total: 2-5 recommendations per day (quality over quantity)
```

Write to `skills/x-engagement/references/engagement-rules.md`.

- [ ] **Step 2: Commit**

```bash
git add skills/x-engagement/references/engagement-rules.md
git commit -m "feat(x-engagement): add engagement curation rules"
```

---

### Task 8: Create SKILL.md

**Files:**
- Create: `skills/x-engagement/SKILL.md`

- [ ] **Step 1: Create the skill definition**

```markdown
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
4. Append the `## Engagement` section to `writing.config.md`

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

Read the notification channel from `writing.config.md` → `## Engagement` → `Notification channel`.

Format the daily recommendation summary:

```
🐦 今日 X 互動推薦

📌 Reply to @author
https://x.com/author/status/123
原文：「Original tweet content...」

版本 A: 「Draft A...」
版本 B: 「Draft B...」
版本 C: 「Draft C...」

📌 Quote @author
https://x.com/author/status/456
原文：「Original tweet content...」

版本 A: 「Draft A...」
版本 B: 「Draft B...」
版本 C: 「Draft C...」

🔁 Retweet @author
https://x.com/author/status/789

👍 Like @author
https://x.com/author/status/012

💡 新貼文靈感（受 @author 啟發）
版本 A: 「Draft A...」
版本 B: 「Draft B...」
版本 C: 「Draft C...」

---
需要精修文案請執行 post-writing skill
```

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
```

Write to `skills/x-engagement/SKILL.md`.

- [ ] **Step 2: Verify skill structure is complete**

Run: `find skills/x-engagement -type f | sort`

Expected:
```
skills/x-engagement/SKILL.md
skills/x-engagement/package.json
skills/x-engagement/references/engagement-rules.md
skills/x-engagement/scripts/add.ts
skills/x-engagement/scripts/discover.ts
skills/x-engagement/scripts/lib/inbox.test.ts
skills/x-engagement/scripts/lib/inbox.ts
skills/x-engagement/scripts/lib/syndication.test.ts
skills/x-engagement/scripts/lib/syndication.ts
skills/x-engagement/scripts/list.ts
skills/x-engagement/tsconfig.json
```

(Plus `bun.lock` and `node_modules/`)

- [ ] **Step 3: Commit**

```bash
git add skills/x-engagement/SKILL.md
git commit -m "feat(x-engagement): add skill definition with 4-step daily workflow"
```

---

### Task 9: Update writing-management for engagement initialization

**Files:**
- Modify: `skills/writing-management/SKILL.md`
- Modify: `skills/writing-management/references/config-format.md`

- [ ] **Step 1: Add engagement migration to writing-management SKILL.md**

In `skills/writing-management/SKILL.md`, after the existing migration step 4 (post-writing Social section check), add two new migration steps.

Find this text in the Workspace Migration section:

```markdown
4. If `writing.config.md` exists and `${CLAUDE_SKILL_DIR}/../post-writing/SKILL.md` exists but `writing.config.md` does not contain a `## Social` section, append the Social section from the config template
```

Add after it:

```markdown
5. If `writing.config.md` exists and `${CLAUDE_SKILL_DIR}/../x-engagement/SKILL.md` exists but `{workspace}/engagement/` does not exist, create the directory and create `{workspace}/engagement/interests.yaml` with empty structure (`keywords: []`, `hashtags: []`, `accounts: []`)
6. If `writing.config.md` exists and `${CLAUDE_SKILL_DIR}/../x-engagement/SKILL.md` exists but `writing.config.md` does not contain a `## Engagement` section, do NOT auto-append — the x-engagement skill handles its own setup interactively (it asks the user for notification channel preferences)
```

- [ ] **Step 2: Add engagement initialization to Initialize Workspace section**

In `skills/writing-management/SKILL.md`, in the "### 1. Initialize Workspace (first use)" section, find this block in step 3:

```markdown
   - **If `${CLAUDE_SKILL_DIR}/../post-writing/SKILL.md` exists** (social features enabled):
     - Create `{workspace}/posts/` directory
     - Copy `${CLAUDE_SKILL_DIR}/assets/social-style-guide-template.md` to `{workspace}/social-style-guide.md`
     - Include `## Social` section when writing `writing.config.md` (see [config format](references/config-format.md))
```

Add after it:

```markdown
   - **If `${CLAUDE_SKILL_DIR}/../x-engagement/SKILL.md` exists** (engagement features enabled):
     - Create `{workspace}/engagement/` directory
     - Create `{workspace}/engagement/interests.yaml` with empty structure (`keywords: []`, `hashtags: []`, `accounts: []`)
     - Note: `## Engagement` section in `writing.config.md` is NOT added during init — the x-engagement skill handles setup interactively when first used
```

- [ ] **Step 3: Add engagement/ to workspace structure diagram**

In `skills/writing-management/SKILL.md`, find the workspace structure block:

```
  posts/                     # Social media posts (flat files, conditional on post-writing skill)
    {YYYY-MM-DD}_{slug}.md   # Post content with frontmatter
  social-style-guide.md      # Social style guide (evolving, conditional on post-writing skill)
```

Add after `social-style-guide.md`:

```
  engagement/                # X engagement data (conditional on x-engagement skill)
    interests.yaml           # Fixed interest list (manually maintained)
    inbox.yaml               # Rolling log of engagement recommendations
    candidates.yaml          # Discovery temp (overwritten each run)
```

- [ ] **Step 4: Update config-format.md with Engagement section**

In `skills/writing-management/references/config-format.md`, find the "## Social Section (Optional)" heading. After the entire Social section (including the "Example with Social" section and the Guidelines section), append:

```markdown
## Engagement Section (Optional)

When the `x-engagement` skill is installed and first used, `writing.config.md` includes an additional `## Engagement` section:

```markdown
## Engagement
- Notification channel: slack:C0AMED6RYHJ
- Schedule: "11:00 GMT+9"
- Language: en
```

**Fields:**
- `Notification channel` — where to send daily engagement recommendations. Format is a soft description (e.g., `slack:CHANNEL_ID`, `discord:#channel`, `terminal`). No default — the x-engagement skill asks the user during first use.
- `Schedule` — preferred time for the daily engagement run. For scheduler reference only — the skill itself does not handle scheduling.
- `Language` — search language for X discovery. Currently only `en` is supported.

Unlike the `## Social` section, `## Engagement` is NOT added during workspace initialization. It is created interactively by the x-engagement skill when first used, because it requires user input (notification channel preference).
```

- [ ] **Step 5: Verify the modifications read correctly**

Run: `grep -n "engagement" skills/writing-management/SKILL.md`

Expected: Multiple matches showing the new migration steps, init steps, and workspace structure.

Run: `grep -n "Engagement" skills/writing-management/references/config-format.md`

Expected: Matches showing the new Engagement section documentation.

- [ ] **Step 6: Commit**

```bash
git add skills/writing-management/SKILL.md skills/writing-management/references/config-format.md
git commit -m "feat(writing-management): add conditional engagement directory initialization"
```

---

### Task 10: Update post-writing with engagement inbox source

**Files:**
- Modify: `skills/post-writing/SKILL.md`

- [ ] **Step 1: Add engagement inbox detection to Step 1**

In `skills/post-writing/SKILL.md`, find the beginning of "### Step 1: Choose Source":

```markdown
### Step 1: Choose Source

Ask the user what they want to write about. Three source modes:
```

Replace with:

```markdown
### Step 1: Choose Source

**Engagement inbox check:** Before presenting source options, check if `{workspace}/engagement/inbox.yaml` exists. If it does, read it and filter for items with `status: pending` and `action` in (`reply`, `quote`, `post`). If there are pending items:

> 📬 You have {N} pending engagement recommendations:
> {For each: action type + @author + content preview (first 50 chars)}
>
> Would you like to work on one of these, or write something else?

If the user selects an engagement item:
- For `reply` / `quote`: bring the original tweet content and 3 draft versions into the drafting flow. The drafts serve as initial versions — the user can pick one, edit, or ask for new options. Skip Step 2 (direction is already set by the action type and drafts). Proceed to Step 3 with the selected/edited draft.
- For `post`: treat as standalone with context. The inspiring tweet is reference material (not source material — the post should stand alone). Proceed to Step 2 for direction proposal.

After the user confirms the final post in Step 5, update the corresponding item in `{workspace}/engagement/inbox.yaml`: set `status` to `done`.

If no engagement inbox exists or it's empty, proceed normally with the three source modes below.

Ask the user what they want to write about. Four source modes:
```

- [ ] **Step 2: Add engagement source mode**

In `skills/post-writing/SKILL.md`, find the standalone source mode description:

```markdown
**Standalone:** The user describes a topic or shares a thought directly in conversation. Their description is the source material.
```

Add after it:

```markdown
**From engagement inbox:** The user selects a pending item from `{workspace}/engagement/inbox.yaml`. The item includes the original tweet, action type, and draft versions. See the engagement inbox check above for how each action type flows.
```

- [ ] **Step 3: Add engagement source to frontmatter**

In `skills/post-writing/SKILL.md`, find the frontmatter field list in Step 1:

```markdown
   - `source`: `standalone` or `article`
   - `source_article`: path to article directory (only if source is article)
```

Replace with:

```markdown
   - `source`: `standalone`, `article`, or `engagement`
   - `source_article`: path to article directory (only if source is article)
   - `source_tweet`: URL of the inspiring tweet (only if source is engagement)
```

- [ ] **Step 4: Update "You Do NOT" section**

In `skills/post-writing/SKILL.md`, find:

```markdown
- Publish to social platforms (out of scope — this skill produces the content)
```

Add after it:

```markdown
- Discover engagement opportunities (that's x-engagement — this skill writes the content)
```

- [ ] **Step 5: Verify the modifications read correctly**

Run: `grep -n "engagement" skills/post-writing/SKILL.md`

Expected: Multiple matches showing the inbox check, source mode, frontmatter field, and "You Do NOT" addition.

- [ ] **Step 6: Commit**

```bash
git add skills/post-writing/SKILL.md
git commit -m "feat(post-writing): add engagement inbox as 4th source type"
```

---

### Task 11: Update post-format.md

**Files:**
- Modify: `skills/post-writing/references/post-format.md`

- [ ] **Step 1: Add engagement source to frontmatter docs**

In `skills/post-writing/references/post-format.md`, find:

```markdown
- `source` — `standalone` for independently created posts, `article` for posts derived from an article
- `source_article` — relative path from workspace to the source article directory (only when `source: article`)
```

Replace with:

```markdown
- `source` — `standalone` for independently created posts, `article` for posts derived from an article, `engagement` for posts inspired by an engagement recommendation
- `source_article` — relative path from workspace to the source article directory (only when `source: article`)
- `source_tweet` — URL of the inspiring tweet (only when `source: engagement`)
```

- [ ] **Step 2: Commit**

```bash
git add skills/post-writing/references/post-format.md
git commit -m "feat(post-writing): add engagement source type to post format spec"
```

---

### Task 12: Run all tests and verify

- [ ] **Step 1: Run the full test suite**

Run: `cd skills/x-engagement && bun test`

Expected: All tests pass (inbox.test.ts + syndication.test.ts).

- [ ] **Step 2: Verify all new files are committed**

Run: `git status`

Expected: Clean working tree — nothing uncommitted.

- [ ] **Step 3: Verify complete skill structure**

Run: `ls -la skills/x-engagement/ && ls -la skills/x-engagement/scripts/ && ls -la skills/x-engagement/scripts/lib/ && ls -la skills/x-engagement/references/`

Expected: All files from the design spec are present.

---

### Task 13: Update CLAUDE.md

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: Add x-engagement to the Architecture section**

In `CLAUDE.md`, find:

```markdown
5. **post-writing** (`skills/post-writing/`) — Writes social media posts (single or thread), supports article-derived and standalone creation, lightweight automated review, in-file translation, style feedback extraction
```

Add after it:

```markdown
6. **x-engagement** (`skills/x-engagement/`) — Daily X engagement discovery via Grok x_search, tweet verification via Syndication API, agent-curated recommendations with draft copy, shared inbox for human execution
```

- [ ] **Step 2: Update "Five skills" to "Six skills"**

In `CLAUDE.md`, find:

```markdown
Five skills form a pipeline, each with clear boundaries:
```

Replace with:

```markdown
Six skills form the system, each with clear boundaries:
```

- [ ] **Step 3: Add engagement/ to Workspace Structure**

In `CLAUDE.md`, find the workspace structure block. After the `posts/` line:

```markdown
  posts/{YYYY-MM-DD}_{slug}.md   # Social media posts (flat files, with in-file translations)
```

Add:

```markdown
  engagement/                    # X engagement data (conditional on x-engagement skill)
    interests.yaml               # Interest list for X discovery
    inbox.yaml                   # Rolling recommendation log
    candidates.yaml              # Discovery temp (overwritten each run)
```

- [ ] **Step 4: Add post-writing source update note**

In `CLAUDE.md`, find:

```markdown
5. **post-writing** (`skills/post-writing/`) — Writes social media posts (single or thread), supports article-derived and standalone creation, lightweight automated review, in-file translation, style feedback extraction
```

Replace with:

```markdown
5. **post-writing** (`skills/post-writing/`) — Writes social media posts (single or thread), supports article-derived, standalone, and engagement-sourced creation, lightweight automated review, in-file translation, style feedback extraction
```

- [ ] **Step 5: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: add x-engagement skill to CLAUDE.md"
```
