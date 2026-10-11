// The Mahjong Tarot blog's topics: the one category list. The /blog filters
// (pages/blog/index.jsx via lib/blogDb.js), the App Router post data, the
// publish path's category resolver and the SEO writer prompt all read it.
// Order is the /blog filter order.
export const TOPICS = [
  "Love & Relationships",
  "Money & Career",
  "Forecasts & Timing",
  "The Mahjong Mirror",
] as const;

// Where a post with no recognisable category is filed.
export const DEFAULT_TOPIC = "Forecasts & Timing";

export function topicSlug(label: string): string {
  return label.toLowerCase().replace(/&/g, " ").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
