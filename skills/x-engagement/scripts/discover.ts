// scripts/discover.ts
import { readFile, writeFile, mkdir } from "fs/promises";
import { join } from "path";
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
