import type { PostMeta } from '@/entities/site/lib/postData'

// Content pillars on the public blog. A pillar is the argument a post makes
// (Build with AI, Data first); the category is the office it is for. Pillars
// live in company_os.marketing_pillars and reach the site as a name on each
// post; this file is pure so the hub page's grouping can be tested without a
// database. Client-safe: no fs, no supabase.

export type Pillar = { slug: string; name: string; count: number; thesis: string | null }

// One sentence per pillar, shown under the hub title. marketing_pillars has no
// description column, so the thesis lives here, keyed by the derived slug; a
// pillar without one renders the list alone.
export const PILLAR_THESES: Record<string, string> = {
  'year-of-the-fire-horse':
    'The Fire Horse year up close: what the energy is doing to love, money and decisions right now, and what history says about the years like it.',
  'the-mahjong-mirror':
    'The answer to the week\'s question: how the cards and The Mahjong Mirror framework turn a hard moment into a clear decision.',
  'feel-good-friday':
    'Something constructive to do this weekend: one small, specific move that puts the week\'s reading to work.',
  'love-relationships':
    'Love, partnership and family read through Chinese astrology and the cards: where the tension is and how to tend the garden.',
  'money-career':
    'Work, money and timing: when to push, when to wait, and what the year rewards.',
}

// Unique pillars across the posts, most published first, then by name so the
// order is stable when counts tie. Posts without a pillar contribute nothing.
export function pillarsFrom(posts: Pick<PostMeta, 'pillar' | 'pillarSlug'>[]): Pillar[] {
  const counts = new Map<string, Pillar>()
  for (const p of posts) {
    if (!p.pillar || !p.pillarSlug) continue
    const hit = counts.get(p.pillarSlug)
    if (hit) hit.count += 1
    else counts.set(p.pillarSlug, { slug: p.pillarSlug, name: p.pillar, count: 1, thesis: PILLAR_THESES[p.pillarSlug] ?? null })
  }
  return [...counts.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
}
