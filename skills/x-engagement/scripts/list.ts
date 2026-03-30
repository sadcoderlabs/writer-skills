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
