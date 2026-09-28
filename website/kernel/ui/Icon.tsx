import type { CSSProperties } from "react";

/**
 * The admin's small monochrome icons (W.103.3).
 *
 * WHY THIS EXISTS. The Workboard card carried seven of its icons as text
 * glyphs — ⚡ for Human Tokens, ☑ for subtasks, ⚠ for blockers, ⛓ for what a
 * card blocks, 💬 for comments, ◷ for age, ✓ for completed — plus 🔗 on the PR
 * chip and ⠿ on the board's drag grip. Two of those (💬 and 🔗) are emoji proper, so
 * the browser renders them from the platform's emoji font in ITS colours,
 * which puts uncontrolled colour on a card whose entire colour discipline is
 * one categorical carrier. The other six come from a symbol font with its own
 * weight, baseline and advance width, so a row of them never sits on the type
 * grid and looks different on macOS, Windows and Android.
 *
 * WHAT AN ICON HERE IS. One inline SVG, sized in `em` so it tracks whatever
 * type size it sits in, stroked in `currentColor` so it takes the colour of
 * its line and nothing else, and `aria-hidden` because every one of them sits
 * beside a number or a word that already says what it means. An icon is never
 * the only carrier of anything.
 *
 * WHAT IS NOT DONE YET. One surface still draws its own ⠿ grip in its own
 * markup: the CRM's lead queue. The portal's roadmap backlog and the deals
 * list were converted in W.103.9; the lead queue was left out of that card
 * because entities/crm/routes/admin/(dashboard)/revenue/leads/LeadQueue.tsx
 * sits at 418 lines against a 417-line allowlist entry, so the single import
 * line this needs is enough to make the file-size ratchet refuse the tree.
 * That is the ratchet doing its job — the file has to be split before the
 * glyph can move — so the conversion waits for the split rather than buying
 * itself headroom out of an unrelated budget.
 *
 * WHY NOT A LIBRARY. A dependency for nine glyphs would be nine glyphs and
 * three hundred more, and the three hundred are how a design system stops
 * being a decision and starts being a menu.
 */

export type IconName =
  /** Human Tokens — effort by shape, never time. */
  | "bolt"
  /** Subtasks done over total. */
  | "checklist"
  /** This card is blocked. */
  | "alert"
  /** Other cards are waiting on this one. */
  | "link"
  /** Comments on the card. */
  | "comment"
  /** How long the card has sat in its column. */
  | "clock"
  /** Finished. */
  | "check"
  /** The drag handle. */
  | "grip"
  /** A card parked until a date. */
  | "moon"
  /** Board settings and tools. */
  | "gear"
  /** The toolbar's view options. */
  | "sliders"
  /** More actions on one item (a card's menu). */
  | "more";

/**
 * The paths, on a 24-box, stroked. `stroke-linecap: round` is set once on the
 * <svg> rather than per path, so a new icon only has to supply geometry.
 */
const PATHS: Record<IconName, JSX.Element> = {
  bolt: <path d="M13 2 4 14h7l-1 8 9-12h-7z" />,
  checklist: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <path d="m8 12 3 3 5-6" />
    </>
  ),
  alert: (
    <>
      <path d="M12 3 2 20h20L12 3z" />
      <path d="M12 10v4" />
      <path d="M12 17.5v.01" />
    </>
  ),
  link: (
    <>
      <path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1.5 1.5" />
      <path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1.5-1.5" />
    </>
  ),
  comment: <path d="M21 12a8 8 0 0 1-11.6 7.1L3 21l1.9-6.4A8 8 0 1 1 21 12z" />,
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  check: <path d="m4 12 5 5L20 6" />,
  moon: <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z" />,
  gear: (
    <>
      <circle cx="12" cy="12" r="3.2" />
      <path d="M19.4 14.5a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1v.3a2 2 0 1 1-4 0v-.2a1.6 1.6 0 0 0-2.8-1.1l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0-1.1-2.7h-.3a2 2 0 1 1 0-4h.2a1.6 1.6 0 0 0 1.1-2.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 2.7-1.1V3a2 2 0 1 1 4 0v.2a1.6 1.6 0 0 0 2.8 1.1l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0 1.1 2.7h.3a2 2 0 1 1 0 4h-.2a1.6 1.6 0 0 0-1.4 1z" />
    </>
  ),
  sliders: (
    <>
      <path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h10M18 18h2" />
      <circle cx="16" cy="6" r="1.8" />
      <circle cx="10" cy="12" r="1.8" />
      <circle cx="16" cy="18" r="1.8" />
    </>
  ),
  // Three dots on the centre line, where the "…" text glyph sat on the
  // baseline and read as an underscore at 13px (W.115).
  more: (
    <>
      <circle cx="5" cy="12" r="1" />
      <circle cx="12" cy="12" r="1" />
      <circle cx="19" cy="12" r="1" />
    </>
  ),
  grip: (
    <>
      <circle cx="9" cy="6" r="1" />
      <circle cx="9" cy="12" r="1" />
      <circle cx="9" cy="18" r="1" />
      <circle cx="15" cy="6" r="1" />
      <circle cx="15" cy="12" r="1" />
      <circle cx="15" cy="18" r="1" />
    </>
  ),
};

export function Icon({ name, style }: { name: IconName; style?: CSSProperties }) {
  return (
    <svg
      className="admin-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      style={style}
    >
      {PATHS[name]}
    </svg>
  );
}
