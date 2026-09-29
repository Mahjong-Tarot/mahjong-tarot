// This file contains ONLY the static data - safe to use in client components
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

// The blog's topics, as the category labels on the Mahjong Tarot blog.

export const categories = [
  { slug: 'love-relationships',  label: 'Love & Relationships' },
  { slug: 'forecasts-timing',    label: 'Forecasts & Timing' },
  { slug: 'the-mahjong-mirror',  label: 'The Mahjong Mirror' },
  { slug: 'money-career',        label: 'Money & Career' },
]
