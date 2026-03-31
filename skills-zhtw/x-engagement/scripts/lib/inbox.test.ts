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
