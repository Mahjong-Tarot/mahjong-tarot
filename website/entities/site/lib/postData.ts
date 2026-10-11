// This file contains ONLY the static data - safe to use in client components
import { TOPICS, topicSlug } from './topics'

export interface PostMeta {
  slug: string
  title: string
  date: string
  category: string
  categorySlug: string
  image: string
  readTime: string
  tags: string[]
  mdFile: string
  excerpt: string
  // The content pillar (marketing_pillars) the post argues for: the promise,
  // where category is the office it is for. Optional because legacy rows and
  // static posts may carry none.
  pillar?: string
  pillarSlug?: string
}

// The blog's topics, as the category labels on the Mahjong Tarot blog. The
// list itself lives in ./topics (shared with lib/blogDb.js and the /blog filters).
export const categories = TOPICS.map((label) => ({ slug: topicSlug(label), label }))
