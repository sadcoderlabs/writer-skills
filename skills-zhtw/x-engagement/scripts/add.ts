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
