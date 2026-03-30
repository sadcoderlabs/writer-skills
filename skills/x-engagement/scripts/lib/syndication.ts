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
