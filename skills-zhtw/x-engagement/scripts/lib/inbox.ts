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
