// Pure templating for the public Find a Good Day result page.
//
// Voice rules (from agents/writer/context/style-guide.md):
//   - Plain, declarative, probabilistic but not academic.
//   - Short sentences for emphasis, longer sentences for texture.
//   - NO em-dashes anywhere.
//   - No exclamation points.
//
// All inputs come straight off the almanac_days row + the activity dict,
// so this is deterministic and SSR-safe (no LLM calls, no async).

const OFFICER_TAG = {
  establish: 'openings and new contracts',
  remove: 'clearing out and healing',
  full: 'abundance and harvest',
  balance: 'steady maintenance and small repairs',
  stable: 'settling and locking things in',
  initiate: 'holding firm and pursuing',
  break: 'endings and demolition',
  danger: 'caution and stillness',
  success: 'most undertakings going your way',
  receive: 'gathering and gain',
  open: 'opening doors and fresh starts',
  close: 'sealing and finishing',
};

function officerSentence(officer) {
  if (!officer?.english) return '';
  const tag = OFFICER_TAG[officer.key];
  if (tag) {
    return `The day-officer is ${officer.english}, the cycle’s card of ${tag}.`;
  }
  return `The day-officer is ${officer.english}.`;
}

function scoreSentence(score) {
  if (typeof score !== 'number') return '';
  if (score >= 80) {
    return `Today reads at ${score} out of 100. That sits near the top of the cycle, where the day-officer and the verdicts mostly line up in your favour.`;
  }
  if (score >= 60) {
    return `Today reads at ${score} out of 100. That puts it on the favourable side of the cycle, with more verdicts going your way than not.`;
  }
  if (score >= 40) {
    return `Today reads at ${score} out of 100. That is a middle of the road day. Some things land. Some things don’t.`;
  }
  if (score >= 20) {
    return `Today reads at ${score} out of 100. That is the cautionary side of the cycle. The day asks for a steady hand.`;
  }
  return `Today reads at ${score} out of 100. That is low for this cycle. Most verdicts land against you.`;
}

const VERDICT_FOR_ACTIVITY = {
  Lucky: {
    auspicious: 'reads as a strong yes',
    favorable: 'reads well',
    neutral: 'still works',
    cautionary: 'is a workable opening',
    challenging: 'is one of the few openings',
  },
  Normal: {
    auspicious: 'is steady but unremarkable',
    favorable: 'is steady',
    neutral: 'is neutral',
    cautionary: 'is unsettled',
    challenging: 'is rough going',
  },
  Unlucky: {
    auspicious: 'is one of the few snags',
    favorable: 'is a notable miss',
    neutral: 'pushes against the activity',
    cautionary: 'pushes hard against the activity',
    challenging: 'shuts the door',
  },
};

const VERDICT_TAIL = {
  Lucky: 'The verdict here is Lucky.',
  Normal: 'The verdict here is Normal.',
  Unlucky: 'The verdict here is Unlucky.',
};

function activitySentence(activity, verdict, tone) {
  const noun = activity.phrase || activity.label.toLowerCase();
  if (!verdict) {
    return `For ${noun}, the verdict is not in the table for this date.`;
  }
  const phrase = VERDICT_FOR_ACTIVITY[verdict]?.[tone] || 'reads as';
  const tail = VERDICT_TAIL[verdict];
  return `For ${noun}, the chart ${phrase}. ${tail}`;
}

function holidaySentence(holiday) {
  if (!holiday) return '';
  return `${holiday} also lands on this date, which colours the reading.`;
}

/**
 * @param {object} args
 * @param {object} args.almanac - almanac_days row
 * @param {object} args.activity - one entry from ACTIVITIES (with key + label)
 * @returns {string|null} a 3 to 5 sentence explanation, or null if inputs incomplete
 */
export function explainScore({ almanac, activity }) {
  if (!almanac || !activity) return null;
  const verdict = almanac.activities?.[activity.key] || null;
  const sentences = [
    officerSentence(almanac.officer),
    scoreSentence(almanac.score),
    activitySentence(activity, verdict, almanac.tone),
    holidaySentence(almanac.holiday),
  ].filter(Boolean);
  if (sentences.length === 0) return null;
  return sentences.join(' ');
}

// Internal helpers exported for unit-style spot-checks.
export const __test = {
  officerSentence,
  scoreSentence,
  activitySentence,
  holidaySentence,
};
