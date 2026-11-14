---
name: campaign
description: "Turns a raw idea into a marketing campaign on the platform and starts the writer agent on it. Use whenever Dave or Bill brings an idea for a post or a week of posts and wants it fleshed out and written by the marketing system: 'I have an idea', 'new campaign', 'campaign', 'flesh this out', 'run the writer on this', 'make a campaign for X'. This drives the admin's campaign model (Marketing > Campaigns), not the local file pipeline (writer / mahjong-studio)."
---

# Campaign Skill

Take an idea, sharpen it into a brief the writer agent can work from, create the campaign in the marketing platform, and start the writer. The writer agent runs on the server; you do not write the post.

One campaign is one idea and produces one blog post plus its channel posts (Facebook, email and so on, per the brand profile). A week theme with three posts is three campaigns, one per post.

All commands run from `website/`. They read `website/.env.local` and write to production.

## 1. Flesh out the idea

Start from what you were given. Gather before you ask:

- Run `node scripts/campaign.mjs recent` to see the last 12 posts. The new idea must not repeat one, and should not land on the same pillar three times running.
- If the idea came from an interview or a note, read it in `content/source-material/`. Interview calls live in Lark Minutes if the local file is missing.
- Check any astrology claim (dates of a month or year, sign, element, which element controls which) against the source. Never invent one. If you cannot confirm it, ask.

Then ask Dave only for what is still missing, in one message. Usually that is one or two of:

- The angle: what is the one thing the reader should walk away believing?
- Who it is for and what they do next (book a reading, read The Mahjong Mirror).
- The date it should publish.

Push back if the idea is thin, repeats a recent post, or is really two or three posts. Say so and propose the split.

## 2. Write the brief

The brief becomes the campaign's `idea`, and the idea is the only source text the writer gets. Make it complete enough that a writer who never heard the conversation could write the post. Write it to a file in the scratchpad, plain prose and short lists, no em dashes:

- **Angle**: the claim, in one or two sentences, and why it matters now.
- **Reader**: who this is for and the question they are asking.
- **Facts and dates**: every date, sign, element and number the post depends on, stated exactly.
- **Bill's material**: his stories, examples and lines from the source, quoted or closely paraphrased. This is what makes the post his.
- **What to do**: the practical takeaway for the reader.
- **Call to action**: reading or book.
- **Avoid**: anything recent posts already covered, and anything Dave ruled out.

Pick:

- **Name**: short, how it should read in the campaign list.
- **Pillar**: one of Year of the Fire Horse, The Mahjong Mirror, Feel Good Friday, Love & Relationships, Money & Career.
- **Start date**: the day the blog should publish. Feel Good Friday posts go on a Friday.
- **Objective**: one line on what the campaign is for.

Show Dave the name, pillar, date, objective and the brief. Create nothing until he says yes.

## 3. Create the campaign and start the writer

```bash
node scripts/campaign.mjs create --name "<name>" --idea-file <brief path> --pillar "<pillar>" --starts-on YYYY-MM-DD --objective "<objective>" --run
```

Add `--dry` first if you want to see the row without writing it. Leave `--run` off to create the campaign without starting the writer; a campaign with a start date is also started automatically by the daily schedule the day before it starts.

For a week of posts, run it once per post.

## 4. Report

The writer takes one step every 5 minutes: draft, edit, SEO, exhibits, hero image, links, assemble, validate. Expect about 40 minutes. It then parks at `ready` and waits for a Publish approval in the admin. It does not publish on its own.

```bash
node scripts/campaign.mjs status <campaign-id>
```

Give Dave the campaign link the script prints. Do not wait around polling. If he asks later, or `status` shows `STOPPED`, read the error: it says which check failed. Fix the cause (usually the brief or the brand profile under Marketing > Brands), then:

```bash
node scripts/campaign.mjs run <campaign-id>
```

Review, edits and Publish happen in the admin at https://www.mahjongtarot.com/admin/revenue/marketing/campaigns.
