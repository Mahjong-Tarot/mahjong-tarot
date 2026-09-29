import { agentRunLoop } from "../run-loop";
import { advanceLetter } from "./advance";
import { describeLetterState, LETTER_READY } from "./steps";

// The letter agent's run, as the shared run loop executes it (lib/run-loop.ts
// owns the hand-off). What is the letter's here: a run that passes every check
// stops at ready and waits for a person. The run never approves or schedules
// the letter (Y.66); before that it sent to the whole list unless someone
// cancelled it in time. The reviewer builds the list and approves on the
// broadcast page, and the Marketing chat hears that the letter is ready and
// where a run stopped.

export const LETTER_ROUTINE_ID = "/api/cron/letter-agent";

function reviewLink(campaignId: string): string {
  return `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/admin/revenue/marketing/broadcasts/${campaignId}/`;
}

function readyForReview(r: { campaignId: string; summary: string }): string {
  return `Letter agent: this week's broadcast is ready for review. It will not send until someone approves it. ${r.summary} Review and approve: ${reviewLink(r.campaignId)}`;
}

const loop = agentRunLoop({
  tag: "letter",
  routineId: LETTER_ROUTINE_ID,
  advance: advanceLetter,
  parked: (r) => (r.next === LETTER_READY ? readyForReview(r) : null),
  stopped: (r) => `Letter agent: broadcast ${r.campaignId} stopped at ${describeLetterState(r.step)}. ${r.error}`,
});

export const kickLetterStep = loop.kick;
export const runLetterStep = loop.run;
