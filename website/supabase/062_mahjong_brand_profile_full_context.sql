-- 062_mahjong_brand_profile_full_context.sql: the Mahjong Tarot brand context, in full.
--
-- 057 seeded a condensed profile. This writes the whole working method into
-- the brand profile the marketing platform's writer reads (Marketing → Brands →
-- Mahjong Tarot): how a week is made (interview → source brief → calendar →
-- write → images → publish), the weekly rhythm, the channels and their specs,
-- Bill's ten blog styles in full, the Mahjong Mirror's four angles, the card
-- set, and the image rules. Sources in the repo, which stay the authoring
-- source: agents/writer/context/style-guide.md, agents/writer/skills/write-post/SKILL.md,
-- content/content-calendar/content-calendar-process.md, agents/designer/context/style-guide.md.
--
-- Only touches the row while it still holds the seed (updated_by 'seed:...'),
-- so an edit made in the app is never overwritten.

update company_os.brand_profiles p
set
  process_md = $t$## How a Mahjong Tarot week is made

1. **Interview.** Dave records a Mahjong Mirror session with Bill. Only the astrology and Mahjong part feeds the blog; life-story and memoir parts go to Bill's book, not the blog.
2. **Source brief.** Turn the interview into one brief in `content/source-material/<topic>.md`: a Source line (recording and date), the key dates, the post angle in one sentence, Bill's points by life area in his own words, what is new compared with past posts, and what is NOT in the source (so nobody invents it). Never invent astrology content, card meanings or sign-by-sign guidance the source does not give.
3. **Calendar week.** Add the week to `content/content-calendar/content-calendar.md`: a week header and a short note (source brief, dates that matter, what this week adds), three topic lines with their angle and publish days, and a hook table with one row per day and channel. Topic folders are named `<YYYY-MM-DD>-<horse|mirror|feel-good>-<topic>`; the published URL slug is separate and descriptive for SEO. Status starts PLANNED.
4. **Write.** For each topic: the blog (`blog-fire-horse.md`, `blog-mahjong-mirror.md` or `blog-feel-good-friday.md`), its SEO guide (`seo-<type>.md`), and the day-by-day social files (`mon-facebook-en.md`, `mon-facebook-vn.md`, `mon-instagram.md`, then `tue-`, `wed-`, `thu-`, `fri-`). Then `image-prompts.json` for every topic (one prompt per content file; Feel Good Friday also gets two affirmation cards, English and Vietnamese). Sweep every file for em dashes and the word "tiles". Update `content/topics/INDEX.md` and set the calendar status to WRITTEN. **Checkpoint: Dave reviews the writing.**
5. **Images.** The designer generates images from `image-prompts.json`. **Checkpoint: Dave reviews the images.**
6. **Publish.** `build-page` turns each blog into `content/blog/<slug>.md` with its hero image; merge; run `node website/scripts/publish-blog-post.mjs <slug>` on or before the publish date (posts go live on their date, US Eastern); append to the publish log. The social files go to the social media manager. A campaign written in this platform skips the files: the writer drafts, Dave approves, the platform publishes.

## Choosing the blog style
- Pick from the ten styles (see Blog styles). Do not repeat a style used in the last three posts; if the material forces it, note the style debt so the next post compensates.
- Monday and Wednesday must contrast (a Provocation Monday wants an Explainer, How-To or Story on Wednesday).
- Wednesday answers Monday directly. Friday ties the whole week together and ends on something constructive to do this weekend.
- Record the slug, primary keyword, style and the reason in a comment block at the top of each blog file.

## Blog production
1. Develop the idea from the source brief: the core insight, who it is for, what the reader should feel or do.
2. Pick the style that fits the day's slot.
3. Outline, then run it through the editing lens.
4. Draft in Bill's voice within the style's word count, with a hook that drops the reader into the tension.
5. SEO: target keyword (never one an existing post owns), secondary keywords, meta title (60 characters max), meta description (155 max), header structure, 3 to 5 internal links, 2 to 3 external links, 3 to 5 FAQ questions with direct answers, image alt text, AI-search notes.
6. Social files, then image prompts. Final pass for em dashes and "tiles".$t$,

  channels_md = $t$## Active channels
Blog, Facebook (English), Facebook (Vietnamese), Instagram, Email newsletter

## Weekly rhythm
| Day | Type | Content |
|-----|------|---------|
| Monday | Blog + social | **Fire Horse: shock and awe.** Provocative, current-event style. Creates urgency. |
| Tuesday | Social only | Continues Monday's topic: a new angle or a personal story. |
| Wednesday | Blog + social | **Mahjong Mirror: the answer.** Responds directly to Monday and shows how the framework, the cards and the book address the problem Monday raised. |
| Thursday | Social only | Continues Wednesday; builds toward the weekend challenge. |
| Friday | Blog + social | **Feel Good Friday.** Positive and actionable; ties Monday and Wednesday together and gives the reader something constructive to do over the weekend. |

Monday and Wednesday are a matched pair. A typical week has three topics: a Fire Horse topic (Mon/Tue), a Mahjong Mirror topic (Wed/Thu) and a Feel Good Friday topic.

## Blog
1,000 to 2,200 words depending on style (see Blog styles). Published at `https://www.mahjongtarot.com/blog/posts/<slug>`. Title provocative and specific, working as a social headline on its own; Friday titles start "Feel Good Friday:". Author Bill Hajdu. Read time at about 250 words a minute. Excerpt 1 to 2 sentences (25 to 35 words), a hook, not a summary. Topic, one of: Love & Relationships, Money & Career, Forecasts & Timing, The Mahjong Mirror.
Calls to action: **Monday** ends on a reading (`/readings`), with the book as an optional second; **Wednesday** ends on the book (`/the-mahjong-mirror`), with a reading as an optional second; **Friday** ends on a soft weekend challenge, with a secondary link to whichever fits the week.

## Facebook (English)
The main channel. Every day Monday to Friday. 100 to 200 words, personal and conversational, Bill talking to friends. Start from the day's hook in the calendar. A question to drive comments where natural. CTA with the full blog URL. Tuesday and Thursday deepen the day before rather than repeat it.

## Facebook (Vietnamese)
Every day Monday to Friday: a natural Vietnamese translation of that day's English post, not word for word; adapt idioms, keep the structure and the CTA. Human-reviewed before posting. No em dashes.

## Instagram
Every day Monday to Friday. 80 to 150 words. Hook line first (it must land before "...more"). Ends with "Link in bio" or "DM me for a reading". 10 to 15 hashtags. Suggest an image concept (1080x1080).

## Email newsletter
Weekly, tying the week's posts together: a subject line that works as a standalone hook (60 characters max), 1 to 2 sentences naming the week's theme, a 2 to 3 sentence teaser per post with its link, a warm closing line in Bill's voice, one CTA (`/readings` or `/the-mahjong-mirror`), signed "Bill". About 300 words.$t$,

  blog_styles_md = $t$Bill's ten styles. Each is a distinct structural and tonal template. Pick the one that fits the material and the day's slot.

**Provocation** (`provocation`). A bold, confrontational claim that challenges the reader's sense of safety. Use for danger, risk, affairs, breakups, financial risk, volatile periods. Structure: hook as a direct challenge; 2 to 3 sections that escalate with specific evidence (readings, history, zodiac mechanics); a pivot ("here's how to control it"); CTA about getting clarity before it's too late. Tone: urgent, slightly confrontational, a warning from someone who cares. 1,400 to 1,800 words. Best slot: Monday. Example hook: "The relationship you think is safe right now? The Fire Horse doesn't care."

**Manifesto** (`manifesto`). A passionate declaration of belief about how divination works, why it matters, or what the world gets wrong about Chinese astrology. Structure: bold thesis; the case argued through experience; the counterargument acknowledged and dismantled; a stronger restatement; CTA tied to acting on the belief. Tone: confident, almost defiant. 1,200 to 1,600 words. Slots: Monday or Friday. Example hook: "Stop Asking Your Horoscope App for Answers. It Was Never Built to Give You Any."

**Explainer** (`explainer`). One concept taught deeply: elemental theory, the 60-year cycle, how the cards map to life areas. Structure: a surprising fact that makes the concept urgent; what it is, clearly; why it matters now; how Bill uses it in readings; CTA "see how this applies to your life". Tone: authoritative but accessible. 1,200 to 1,800 words. Best slot: Wednesday. Example hook: "The Chinese zodiac isn't twelve animals. It's sixty."

**Sign-by-Sign Breakdown** (`sign-by-sign`). Tailored guidance for all twelve signs on one topic. Structure: a universal hook that sends the reader to find their sign; 3 to 4 paragraphs of context; twelve sections of 2 to 4 sentences, each with the sign's energy, a risk or opportunity and one action; a universal takeaway; CTA. Tone: direct and specific. 1,600 to 2,200 words. Only when the source gives sign-specific material.

**Story / Parable** (`story`). A narrative built around a reading, a historical event or Bill's practice; shows rather than tells. Structure: drop into the scene ("A client sat down across from me last month..."); the reading, the cards, what happened; the lesson; the bridge to the reader; CTA. Tone: warm, intimate; clients always anonymized. 1,200 to 1,600 words. Slots: Wednesday or Friday. Example hook: "She drew the Peach Blossom in the problem position. Before I could say anything, she already knew."

**Prediction** (`trend`). A forecast for a coming window: the next month, a season, a key astrological window. Structure: what is about to change and why it matters; the mechanics (which energies arrive and leave); what it means for relationships, decisions, career, health; windows or dates to watch; CTA to get a reading before the window. Tone: authoritative, forward-leaning. 1,200 to 1,600 words. Slots: Monday or Wednesday. Example hook: "The Tiger month begins in three days. For four signs, it's the best window of the year. For three others, it's a trap."

**Listicle** (`listicle`). Numbered, scannable, each item self-contained. Structure: the number and the stakes in the title; a 2 to 3 sentence intro; numbered items with a bold subheading and 2 to 4 sentences each; a short close; CTA. Tone: punchy; no filler items. 1,000 to 1,500 words. Best slot: Friday.

**Myth Buster** (`myth-buster`). A common misconception dismantled. Structure: state the myth as if true, then break it; why people believe it; what is actually true from Bill's experience; why the distinction matters; CTA. Tone: corrective, never condescending. 1,200 to 1,600 words. Slots: Monday or Wednesday. Example hook: "You've been told your Chinese zodiac sign is just your birth year. That's about 20% of the picture."

**How-To / Practical Guide** (`how-to`). Steps the reader can use immediately. Structure: name the problem and promise a path; brief context; numbered steps, each with an action and a why; a warm closing note from Bill; CTA to go deeper with a reading. Tone: practical, warm, clear. 1,200 to 1,600 words. Slots: Wednesday or Friday.

**Historical Deep Dive** (`historical-deep-dive`). The current year connected to real events 60, 120, 180 years ago. Structure: a striking historical fact that mirrors the present; 2 to 3 past cycle years and their extremes; the thread to now; what the cards and the astrology add; CTA. Tone: authoritative, slightly ominous. 1,400 to 2,000 words. Best slot: Monday. Example hook: "In 1966, the Fire Horse year, birth rates in Japan dropped 25%."

## Universal rules for every style
- The first 2 to 3 sentences must give a reason to keep reading: challenge an assumption, a surprising fact, a provocative question, or a curiosity gap. Never open with background or definitions.
- Subheadings are declarative or provocative ("Why This Year Is Different", not "Background").
- One or two pull quotes at most.
- Every section earns its place: it advances the argument, deepens understanding or builds toward the CTA. Cut the rest.
- Close with the stakes in 2 to 3 sentences, a bridge to what a reading or the book can do, then a direct link.$t$,

  rules_md = $t$- Never use em dashes. Use a period, a colon, a comma or parentheses, or rewrite the sentence. Hyphens in compound words and en dashes in number ranges are fine. Sweep every file before it leaves the writer.
- The system uses Mahjong **cards**, never "tiles". Only name cards that exist in the 42-card set, by their exact names:
  - Honor cards (7): East, South, West, North, Red Dragon, Green Dragon, White Dragon.
  - Guardian cards (8): Bamboo, Chrysanthemum, Orchid, Plum Blossom, Farmer, Fisherman, Scholar, Woodcutter.
  - Suit cards (27): Carp, Door, Dragon, Ducks, Earth, Fire, Heaven, House, Insect, Jade, Knot, Lotus, Lute, Mushroom, Peach, Peacock, Pearl, Phoenix, Pine, Seven Stars, Sword, Tiger, Toad, Tortoise, Unicorn, Water, Willow.
- Do not invent astrology content, card meanings or sign-by-sign guidance the source does not give. When the source is thin, stop and say what is missing.
- Client stories are always anonymized.
- Take a position; do not hedge.
- Every piece ends with a natural next step: a reading or the book.
- American spelling throughout.
- Year dates: the Fire Horse year runs to Feb 5, 2027; the Fire Sheep year begins Feb 6, 2027. Monthly forecasts use the solar-term (BaZi) month dates.

## The Mahjong Mirror (Bill's decision framework, the book)
Four angles, used in Wednesday posts and readings:
1. **The First Angle: the central theme.** What is this actually about? Not the goal, the meaning underneath it.
2. **The Second Angle: know thyself.** Who are you in this situation, today, not who you want to be?
3. **The Third Angle: the opposition.** What is actually standing in the way, underneath the surface argument?
4. **The Fourth Angle: the path forward.** What to do next.$t$,

  content_rules_md = $t$## What to produce for Mahjong Tarot

The default unit is a **week** (see Process and Channels): three blogs (Monday Fire Horse, Wednesday Mahjong Mirror, Friday Feel Good Friday), each with its SEO guide; Facebook English, Facebook Vietnamese and Instagram posts every day Monday to Friday; image prompts for every piece (plus two affirmation cards on Friday); and the weekly email. A single idea that is not a full week still gets a blog, a Facebook English post, its Vietnamese translation and an Instagram post. Never cross-post identical text between the blog and social.

## The lens
Write to one woman who wants clarity she can act on. Ground every claim in the source brief and Bill's experience. Speak in declaratives. Close with a natural next step: a reading with Bill or The Mahjong Mirror.$t$,

  image_style_md = $t$Palette, as plain color names in prompts, never hex codes: midnight jade (deep ground), antique gold (primary; warm brass, never chrome or silver), dusty rose and soft sage (accents), warm ivory (light), deep plum (pop). A starting point, not a cage.

Styles per image (no two files in one topic share a style): **HUMAN** (real people doing the topic: a woman from behind or in profile, hands with the cards, a ritual scene, a morning mirror, a silhouette, a gathering), **TEXT** (a short quotable phrase from the post, rendered as a card), **SCENE** (nature as metaphor, an object still life, aged parchment with gold filigree, a warm glow on a dark ground). Sizes: blog and Facebook 16:9 (1200x630); Instagram and cards 1:1 (1080x1080).

Mahjong Mirror cards appear only in Wednesday images, and only when the blog names the card. Every Feel Good Friday gets two affirmation cards (English and Vietnamese, Vietnamese diacritics exact) in the journal-page template: warm cream aged paper, walnut brush lettering, one small ink flourish.

Non-negotiables: no text in images except the TEXT cards; no generic stock; no cartoon or clip-art Mahjong pieces; no culturally insensitive imagery or "Oriental" tropes; no AI-robot imagery; women never face the camera directly; every prompt ends "No watermarks or Western zodiac imagery anywhere in the image."$t$,

  preferred_blog_types = array['provocation', 'manifesto', 'explainer', 'sign-by-sign', 'story', 'trend', 'listicle', 'myth-buster', 'how-to', 'historical-deep-dive'],
  updated_by = 'seed:062_mahjong_brand_profile_full_context'
from company_os.brands b
where b.id = p.brand_id
  and b.slug = 'mahjong-tarot'
  and p.updated_by like 'seed:%';
