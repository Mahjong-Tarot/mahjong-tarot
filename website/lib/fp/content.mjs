// Bundled Four Pillars narrative content (webpack JSON imports — no fs), mirroring
// lib/ps/data.mjs. Ported from Bill's authored workbooks by
// docs/features/four-pillars-report/port_content.py. Keys are documented there.

import periodRating from '../../data/fp/lc-period-rating.json';
import chiDelta from '../../data/fp/lc-chi-delta.json';
import lcConclusion from '../../data/fp/lc-conclusion.json';
import signYears from '../../data/fp/lc-sign-years.json';
import elementMix from '../../data/fp/ea-element-mix.json';
import mixConclusion from '../../data/fp/ea-mix-conclusion.json';
import elementDetail from '../../data/fp/ea-element.json';
import eaSign from '../../data/fp/ea-sign.json';
import saSign from '../../data/fp/sa-sign.json';
import elementSign from '../../data/fp/sa-element-sign.json';

export const content = {
  periodRating,   // "period|hasHour|rating|elementId|force" -> { chi, fate }
  chiDelta,       // "chiPrev|chiCurrent|hasHour" -> text
  lcConclusion,   // "hasHour|mix" -> { desc1, desc2 }
  signYears,      // signId -> { early, middle, late }
  elementMix,     // "hasHour|elementId|rating" -> text
  mixConclusion,  // "hasHour|mix" -> text
  elementDetail,  // elementId -> { characteristics, approach, positive, negative, ... }
  eaSign,         // signId -> { fixedElementId, fixedElementDescription }
  saSign,         // signId -> { defining, decisionMaking, positive, negative }
  elementSign,    // "elementId|signId" -> personality
};
