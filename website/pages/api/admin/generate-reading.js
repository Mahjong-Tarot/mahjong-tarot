// Generates a final-reading HTML for a Private Reading booking by
// sending the prep brief + transcript + post-call notes to Claude.
// Stores the result on bookings.final_reading_html so the
// /admin/private-readings/[id] page can render and edit it.
//
// Gated by requireApi('staff'). Uses the service-role Supabase client
// to bypass RLS for the bookings UPDATE — auth has already been
// enforced at the API boundary.

import Anthropic from '@anthropic-ai/sdk';
import { requireApi } from '../../../lib/guards';
import { getServiceSupabase } from '../../../lib/stripe';
import {
  calculatePillars,
  getZodiacAnimal,
  tallyElements,
  dominantElement,
} from '../../../lib/bazi';
import { buildReadingBrief } from '../../../lib/readingBrief';
import { buildFourPillarsChart } from '../../../lib/fp/chart.mjs';
import { buildFourPillarsReading } from '../../../lib/fp/engine.mjs';
import { content as fpContent } from '../../../lib/fp/content.mjs';

const MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-5-20250929';
const MAX_OUTPUT_TOKENS = 8000;

const SYSTEM_PROMPT = `You are an editorial assistant for The Mahjong Tarot, a Chinese-astrology
private reading practice. Your job is to turn a practitioner's prep notes,
the call transcript, and the practitioner's post-call notes into a polished
reading that will be emailed to the guest.

Audience: the guest themselves — warm, second-person, no jargon they didn't hear on the call.
Voice: thoughtful, observational, generous. Echo what the practitioner actually said on
the call — never invent guidance that wasn't in the transcript or notes.
Length: tight. 600–900 words. No filler.

Structure the reading as:
  1. A two-sentence opening that names what the guest came in asking about.
  2. "What the chart shows" — the Four Pillars / Zi Wei reading in plain language.
     Pull from the prep brief; ground each statement in something that came up on the call.
  3. "What we explored" — the heart of the conversation. 2–4 short sections with
     <h3> headers. Each section: 1–2 paragraphs, then a single short bullet list
     of takeaways if useful.
  4. "What to do next" — 3–5 concrete next steps, as a numbered list.
  5. A one-paragraph closing that names the next natural moment to revisit (a date,
     a season, a milestone) — only if the call mentioned one. If not, skip the closer.

Output format: a single HTML fragment using only these tags:
<h2>, <h3>, <p>, <ul>, <ol>, <li>, <strong>, <em>, <blockquote>, <br>.
No <html>, <head>, <body>, <style>, <script>, or inline style attributes — the
parent page wraps your output in the email template. Use clean, semantic markup.
Return ONLY the HTML — no markdown fences, no commentary before or after.`;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const auth = await requireApi('staff')(req, res);
  if (!auth.ok) return res.status(auth.status).json({ error: auth.error });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY is not configured.' });
  }

  const { bookingId } = req.body || {};
  if (!bookingId || typeof bookingId !== 'string') {
    return res.status(400).json({ error: 'bookingId is required.' });
  }

  let svc;
  try {
    svc = getServiceSupabase();
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }

  // Load booking
  const { data: booking, error: bErr } = await svc
    .from('bookings')
    .select('id, full_name, email, scheduled_at, duration_minutes, question, birthday, birth_time, prep_notes, post_call_notes, transcript_text, is_relationship, partner_name, partner_birthday, partner_birth_time, partner_gender')
    .eq('id', bookingId)
    .maybeSingle();
  if (bErr) return res.status(500).json({ error: bErr.message });
  if (!booking) return res.status(404).json({ error: 'Booking not found.' });

  // Require at least a transcript OR post-call notes — otherwise there's
  // nothing for Claude to synthesise.
  const transcript = (booking.transcript_text || '').trim();
  const postCallNotes = (booking.post_call_notes || '').trim();
  if (!transcript && !postCallNotes) {
    return res.status(400).json({
      error: 'Upload a transcript or add post-call notes before generating the reading.',
    });
  }

  // Pull canonical person record (birthday / birth_time live there now)
  let person = null;
  if (booking.email) {
    const { data: p } = await svc
      .from('people')
      .select('id, name, email, birthday, birth_time, birth_place, gender')
      .ilike('email', booking.email)
      .maybeSingle();
    person = p || null;
  }

  // Pull latest inquiry for context (what they originally wrote in)
  let inquiry = null;
  if (person?.id) {
    const { data: iq } = await svc
      .from('inquiries')
      .select('id, type, status, source, subject, message, created_at')
      .eq('person_id', person.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    inquiry = iq || null;
  }

  const birthday  = person?.birthday  || booking.birthday  || null;
  const birthTime = person?.birth_time || booking.birth_time || null;

  let pillars = null;
  let zodiac = null;
  let dominant = null;
  try {
    if (birthday) {
      pillars = calculatePillars(birthday, birthTime);
      zodiac  = getZodiacAnimal(birthday);
      dominant = dominantElement(tallyElements(pillars));
    }
  } catch {
    // Fall through with nulls — buildReadingBrief handles missing pillars.
  }

  let partnerPillars = null;
  let partnerZodiac = null;
  let partnerDominant = null;
  try {
    if (booking.partner_birthday) {
      partnerPillars = calculatePillars(booking.partner_birthday, booking.partner_birth_time);
      partnerZodiac = getZodiacAnimal(booking.partner_birthday);
      partnerDominant = dominantElement(tallyElements(partnerPillars));
    }
  } catch {
    // Fall through — buildReadingBrief handles missing partner pillars.
  }

  const prepBrief = buildReadingBrief({
    person, booking, inquiry, pillars, zodiac, dominant,
    partnerPillars, partnerZodiac, partnerDominant,
  });

  // Bill's authored Four Pillars (Life Cycle) reading. Grounds the chart section
  // in his real stage-by-stage narrative instead of a generic day-master line.
  let fourPillarsBrief = null;
  try {
    if (birthday) {
      const fp = buildFourPillarsReading(buildFourPillarsChart({ birthday, birthTime }), fpContent);
      if (fp) {
        const stageLines = fp.stages.map(
          (s) => `- ${s.stage} (${s.element}, ${s.force}): ${[s.chi, s.fate].filter(Boolean).join(' ')}`,
        );
        fourPillarsBrief = [
          `Year sign ${fp.yearSign.combined}, fixed element ${fp.yearSign.fixedElement}. Element mix ${fp.elementMix.code}.`,
          '',
          "Life-cycle stages (chi level and ruling force, in Bill's words):",
          ...stageLines,
          fp.conclusion?.desc1 ? `\nOverall: ${fp.conclusion.desc1}` : '',
        ].filter(Boolean).join('\n');
      }
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('generate-reading: four-pillars failed', err);
  }

  const guestName = (person?.name || booking.full_name || '').trim() || 'the guest';

  const userMessage = [
    `## Guest`,
    `Name: ${guestName}`,
    booking.scheduled_at ? `Call date: ${booking.scheduled_at}` : null,
    booking.duration_minutes ? `Duration: ${booking.duration_minutes} min` : null,
    '',
    `## Reading question`,
    (booking.question || inquiry?.message || '(none on file)').trim(),
    '',
    booking.is_relationship ? `## Relationship / second person` : null,
    booking.is_relationship
      ? [
          booking.partner_name ? `Name: ${booking.partner_name}` : null,
          booking.partner_birthday ? `Birthday: ${booking.partner_birthday}` : '(birthday not provided)',
          booking.partner_birth_time ? `Birth time: ${booking.partner_birth_time}` : null,
          booking.partner_gender ? `Gender: ${booking.partner_gender}` : null,
          partnerPillars
            ? `Chart: ${partnerPillars.day?.stem?.polarity} ${partnerPillars.day?.stem?.element} day master · Year of the ${partnerZodiac} · ${partnerDominant}-dominant`
            : null,
        ].filter(Boolean).join('\n')
      : null,
    booking.is_relationship ? '' : null,
    `## Prep brief (chart + opening)`,
    prepBrief || '(no chart computed — birthday missing)',
    '',
    fourPillarsBrief ? `## Four Pillars (Life Cycle): Bill's authored chart reading` : null,
    fourPillarsBrief,
    fourPillarsBrief ? '' : null,
    `## Prep notes (practitioner, pre-call)`,
    (booking.prep_notes || '(none)').trim(),
    '',
    `## Transcript`,
    transcript || '(no transcript uploaded — write only from post-call notes)',
    '',
    `## Post-call notes (practitioner, what to emphasise)`,
    postCallNotes || '(none)',
  ].filter((line) => line !== null).join('\n');

  try {
    const client = new Anthropic({ apiKey });
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: MAX_OUTPUT_TOKENS,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMessage }],
    });

    const raw = response.content
      ?.filter((block) => block.type === 'text')
      ?.map((block) => block.text)
      ?.join('\n')
      ?.trim() || '';

    // Strip a stray code fence if Claude wrapped the output anyway.
    const html = raw
      .replace(/^```(?:html)?\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();

    if (!html) {
      return res.status(502).json({ error: 'Claude returned an empty response.' });
    }

    const { error: uErr } = await svc
      .from('bookings')
      .update({ final_reading_html: html })
      .eq('id', bookingId);
    if (uErr) return res.status(500).json({ error: uErr.message });

    return res.status(200).json({ success: true, html, model: MODEL });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('generate-reading error:', err);
    const message = err?.error?.message || err?.message || 'Failed to generate reading.';
    return res.status(500).json({ error: message });
  }
}
