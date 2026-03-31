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
