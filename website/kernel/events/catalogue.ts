// Every event the bus carries, with the shape of its payload. One file so the
// whole vocabulary is readable at once, and so a publisher and a subscriber in
// entities that may not import each other still agree on the contract.
//
// Names are past tense and read as facts, not instructions: `order.fulfilled`,
// not `fulfilOrder`. A publisher states what happened; what to do about it is
// the subscriber's business, which is the whole point.
import { z } from "zod";

// A calendar date, the way every date-only column in this tree stores one. It
// is spelled out rather than left as `z.string()` because a subscriber does
// arithmetic on these: a value like "next Friday" would satisfy the type,
// survive the publisher, and then quietly compare as a string against real
// dates inside somebody else's entity.
const calendarDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "must be a calendar date (YYYY-MM-DD)");

// Money, everywhere in this tree, is an integer number of cents. A float here
// would reach a subscriber that stores it and be wrong for as long as the row
// lives, so the publisher is refused instead.
const cents = z.number().int("must be a whole number of cents").nonnegative();

// What the inbox (S.3) needs to say who a fact matters to and what it was
// about. The notifications entity requires nothing, so it cannot ask boards or
// crm afterwards; the publisher, which has these to hand, states them. They are
// optional, so a publisher that cannot say them still publishes, and no other
// subscriber depends on them. `actorPersonId` lets a subscriber leave out the
// person who caused the fact: nobody needs telling what they just did.
const addressedTo = {
  title: z.string().min(1).optional(),
  assigneeId: z.string().min(1).nullable().optional(),
  actorPersonId: z.string().min(1).nullable().optional(),
};

export const EVENTS = {
  // A board card moved into a done column. Coaching listens: a card linked to a
  // commitment means that commitment was kept. Boards works with no listener.
  "board.card.completed": z.object({
    taskId: z.string().min(1),
    boardSlug: z.string().min(1),
    subjectType: z.string().nullable(),
    subjectId: z.string().nullable(),
    ...addressedTo,
  }),

  // A board card landed in a column, and this is the status it now has. Every
  // landing states it, done or not: the Revenue board's content cards read
  // "closed without being done" as much as "done" (campaigns listens, and
  // turns a day of posts into their content status). Boards works with no
  // listener. `board.card.completed` still marks the one transition into done.
  "board.card.landed": z.object({
    taskId: z.string().min(1),
    boardSlug: z.string().min(1),
    status: z.enum(["open", "done", "not_doing"]),
    subjectType: z.string().nullable(),
    subjectId: z.string().nullable(),
    ...addressedTo,
  }),

  // A subtask was ticked or unticked by a person. Campaigns listens: a subtask
  // linked to a content asset is that post, and ticking it means it went out.
  "board.subtask.toggled": z.object({
    subtaskId: z.string().min(1),
    parentTaskId: z.string().nullable(),
    done: z.boolean(),
    subjectType: z.string().nullable(),
    subjectId: z.string().nullable(),
    // Here `title` is the subtask's, and `assigneeId` the parent card's: a
    // subtask carries no assignee of its own and belongs to whoever owns the card.
    ...addressedTo,
    parentTitle: z.string().min(1).nullable().optional(),
    boardSlug: z.string().min(1).optional(),
  }),

  // A leave request was approved and the person will be away. Coaching listens:
  // a 1-1 already booked inside the span is moved off it. Time off works with
  // no listener, which is what lets a deployment take leave without coaching.
  //
  // The span, not the request id alone, because the subscriber's whole question
  // is "which days", and a subscriber that had to read the row back would be
  // reaching into time-off's table to answer a fact time-off already knows.
  "leave.approved": z
    .object({
      requestId: z.string().min(1),
      teamMemberId: z.string().min(1),
      startDate: calendarDate,
      endDate: calendarDate,
      leaveType: z.string().min(1),
      // Who caused it, so the inbox leaves them out (S.19.9).
      actorPersonId: addressedTo.actorPersonId,
    })
    // Both ends inclusive, so a single day is start === end. A reversed span is
    // the publisher's bug and is refused here rather than in a subscriber: one
    // that walked it forward would find every day clear and move nothing, which
    // reads in a log exactly like "there was no 1-1 to move".
    .refine((v) => v.startDate <= v.endDate, { message: "endDate must not precede startDate" }),

  // Approved leave was taken back: cancelled, or denied by an admin's override
  // (A.30). The inbox listens, so the requester's "approved" is not the last
  // word they read. Coaching deliberately does not: a 1-1 already moved off the
  // leave stays where it was moved, because no routine changes a meeting people
  // have planned around. A request cancelled before anyone decided it was never
  // announced, so it states nothing here either.
  "leave.withdrawn": z
    .object({
      requestId: z.string().min(1),
      teamMemberId: z.string().min(1),
      startDate: calendarDate,
      endDate: calendarDate,
      leaveType: z.string().min(1),
      became: z.enum(["cancelled", "rejected"]),
      actorPersonId: addressedTo.actorPersonId,
    })
    .refine((v) => v.startDate <= v.endDate, { message: "endDate must not precede startDate" }),

  // An application reached `hired`. Onboarding listens: the new starter's
  // journey is opened the moment the decision lands rather than on the next
  // nightly pass. Hiring works with no listener.
  //
  // personId and candidateId are nullable because most hires are decided before
  // anybody has typed the new starter's details — the fact is still true, and a
  // subscriber that cannot act yet simply does nothing.
  "candidate.hired": z.object({
    applicationId: z.string().min(1),
    jobRequisitionId: z.string().min(1),
    candidateId: z.string().nullable(),
    personId: z.string().nullable(),
    // The requisition's hiring manager, for the inbox (S.3). Optional, like
    // everything the inbox reads: a requisition may have none.
    hiringManagerId: z.string().min(1).nullable().optional(),
    // Who caused it, so the inbox leaves them out (S.19.9).
    actorPersonId: addressedTo.actorPersonId,
  }),

  // A deal landed on a won stage. Boards listens: the client's delivery boards
  // are opened without crm ever naming boards — which it may not do, because
  // boards is the entity that requires crm and not the other way round.
  //
  // The amount travels in USD cents, already converted, because the rate is the
  // publisher's fact at the moment of the win; a subscriber converting it later
  // would be using a different day's rate.
  "deal.won": z.object({
    dealId: z.string().min(1),
    companyId: z.string().nullable(),
    personId: z.string().nullable(),
    amountUsdCents: cents.nullable(),
    closedAt: z.string().min(1),
    // The deal's owner and title, for the inbox (S.3).
    ownerId: z.string().min(1).nullable().optional(),
    title: z.string().min(1).optional(),
    // Who caused it, so the inbox leaves them out (S.19.9).
    actorPersonId: addressedTo.actorPersonId,
  }),

  // An invoice's balance reached zero. Crm listens: the account becomes a
  // customer at the moment it pays, rather than only when a deal was won in the
  // pipeline. Finance works with no listener, and must, since finance sits
  // below crm and may not import it.
  //
  // `paidOn` is the day the ledger first saw the balance at zero, not the day
  // the money moved: QuickBooks is the source of truth and the mirror is a
  // weekly read of it, so the payment date is not a fact finance has. Named
  // for what it is so a subscriber never reports it as the settlement date.
  "invoice.paid": z.object({
    invoiceId: z.string().min(1),
    companyId: z.string().nullable(),
    dealId: z.string().nullable(),
    amountCents: cents,
    currency: z.string().min(1),
    paidOn: calendarDate,
    // The ledger's invoice number, so the inbox (S.3) can name the invoice.
    docNumber: z.string().min(1).nullable().optional(),
  }),
} as const;

export type EventName = keyof typeof EVENTS;
export type EventPayload<N extends EventName> = z.infer<(typeof EVENTS)[N]>;
