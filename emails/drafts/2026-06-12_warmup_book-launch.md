# Warm-up Email — Quiet Book Announcement

**Campaign:** OCA Book Launch — June 2026 (warm-up wave)
**Audience:** Brevo list 10 (`OCA Warm-up Wave — June 2026 — 3000`, now 3,006)
**Sender:** `Bill Hajdu <bill@news.mahjongtarot.com>`
**Reply-to:** `firepig@mahjongtarot.com`
**Send window:** Jun 12–16, 2026 (single batch is fine at 3k)
**Purpose:** Build sending reputation on the new subdomain before Send 1, AND get early engagement signal. Replies are gold for deliverability — this email actively invites them.
**Status:** Built in Brevo as campaign **id 5** (draft, not scheduled). Test sent to yonavo@gmail.com 2026-06-11. Compliance footer (unsubscribe + postal address) appended in the Brevo version. Awaiting final approval to send.

---

## Subject

**`A quiet announcement, before I tell everyone else`**

Alternates:
- `A quiet announcement to long-time readers`
- `You're hearing this first`

## Preheader

`After 35 years of readings, I finally wrote it all down.`

---

## Body (HTML)

```html
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="font-family: Georgia, 'Times New Roman', serif; max-width: 600px; margin: 0 auto; color: #1B1F3B; line-height: 1.6;">
  <tr>
    <td style="padding: 32px 24px 16px 24px;">

      <p style="font-size: 13px; color: #888; margin: 0 0 24px 0; padding: 12px 16px; background: #f7f4ef; border-left: 3px solid #C0392B;">
        You signed up for Online Chinese Astrology a while back. I don't write often, and when I do, I try to make it worth your time.
      </p>

      <p style="font-size: 17px; margin: 0 0 16px 0;">
        I'm Bill Hajdu. The Firepig. Some of you have been on this list a long time, and I wanted you to hear this before the wider announcement goes out.
      </p>

      <p style="font-size: 17px; margin: 0 0 16px 0;">
        After 35 years of readings, I finally put the whole system in a book. It's called <em>The Mahjong Mirror</em>. The decision framework I use at the table, the tile meanings that matter, all of it. Pre-orders opened this week.
      </p>

      <p style="font-size: 17px; margin: 0 0 24px 0;">
        No hard sell today. If you're curious, the book page is here:
      </p>

      <table cellpadding="0" cellspacing="0" border="0" style="margin: 0 0 28px 0;">
        <tr>
          <td style="background: #C0392B; border-radius: 4px;">
            <a href="https://www.mahjongtarot.com/the-mahjong-mirror/order?utm_source=brevo&utm_medium=email&utm_campaign=book-launch-warmup&utm_content=primary-cta"
               style="display: inline-block; padding: 13px 26px; color: #fff; text-decoration: none; font-size: 16px; font-weight: 600; font-family: Georgia, serif;">
              See The Mahjong Mirror →
            </a>
          </td>
        </tr>
      </table>

      <p style="font-size: 17px; margin: 0 0 16px 0;">
        And a small favor. Hit reply and tell me your Chinese zodiac sign. I read every reply, and it helps me write about the signs people actually want to hear about.
      </p>

      <p style="font-size: 16px; margin: 32px 0 8px 0;">
        More soon.
      </p>
      <p style="font-size: 16px; margin: 0;">
        Bill<br />
        <span style="font-size: 14px; color: #6b6b6b;">The Firepig</span>
      </p>

    </td>
  </tr>
</table>
```

## Plain text

```
You signed up for Online Chinese Astrology a while back. I don't write
often, and when I do, I try to make it worth your time.

I'm Bill Hajdu. The Firepig. Some of you have been on this list a long
time, and I wanted you to hear this before the wider announcement goes out.

After 35 years of readings, I finally put the whole system in a book.
It's called The Mahjong Mirror. The decision framework I use at the table,
the tile meanings that matter, all of it. Pre-orders opened this week.

No hard sell today. If you're curious, the book page is here:
https://www.mahjongtarot.com/the-mahjong-mirror/order?utm_source=brevo&utm_medium=email&utm_campaign=book-launch-warmup&utm_content=primary-cta

And a small favor. Hit reply and tell me your Chinese zodiac sign. I read
every reply, and it helps me write about the signs people actually want
to hear about.

More soon.

Bill
The Firepig
```

---

## Design notes

- **Deliberately short and low-key.** This is a reputation-builder, not the launch. One soft CTA only.
- **The reply ask is strategic.** Replies are the strongest positive signal mailbox providers track. Even 30–50 replies from 3k meaningfully boosts the new subdomain's reputation before the 35k send. Bill should expect and welcome these replies at `firepig@mahjongtarot.com`.
- **Business priority alignment:** book CTA only (priority #1). Membership/readings/newsletter CTAs deliberately omitted to keep the warm-up clean. They enter in Send 2 and ongoing sends.
- **No em dashes** — verified.
- **UTM tagging:** `utm_campaign=book-launch-warmup` so warm-up clicks are distinguishable from Send 1 clicks in Stripe/analytics.

## Gate before Send 1 (from campaign plan §5.2)

After this send completes, check: open rate ≥ ~8%, complaint rate ≤ 0.2%. If below floor, pause and reassess Send 1 timing/content.

---

*Draft v1.0 — 2026-06-11.*
