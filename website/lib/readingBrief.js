// Rule-based synthesis for the Reading brief page. Pulls from the
// Bazi chart + the inquiry context to produce a paragraph Bill can
// read at the top of the call. Returns a markdown string.

export function buildReadingBrief({ person, booking, inquiry, pillars, zodiac, dominant }) {
  if (!pillars) {
    return [
      `Open the reading by collecting birth data — birthday is missing so Bazi can't be computed.`,
      person?.email ? `Customer: ${person.name || person.email}.` : '',
    ].filter(Boolean).join('\n\n');
  }

  const name      = (person?.name || booking?.full_name || '').split(' ')[0] || 'They';
  const dm        = pillars.day?.stem;
  const dmText    = dm ? `${dm.polarity} ${dm.element} day master` : 'day master';
  const animal    = zodiac || pillars.year?.branch?.animal || null;
  const yearStem  = pillars.year?.stem;
  const yearText  = yearStem && animal
    ? `Year of the ${animal} (${yearStem.polarity} ${yearStem.element})`
    : (animal ? `Year of the ${animal}` : 'their birth year');
  const hourMissing = !pillars.hour;

  const dmLine      = DAY_MASTER_LINES[`${dm?.element}_${dm?.polarity}`] || '';
  const elementLine = dominant ? DOMINANT_LINES[dominant] : '';
  const animalLine  = animal ? ANIMAL_LINES[animal] : '';

  const question   = (booking?.question || '').trim();
  const inquiryMsg = (inquiry?.message || '').trim();

  const parts = [];

  parts.push(
    `**${name}** is a **${dmText}** born in the **${yearText}**.` +
    (dmLine ? ` ${dmLine}` : '') +
    (animalLine ? ` ${animalLine}` : ''),
  );

  if (dominant && elementLine) {
    parts.push(`${elementLine}.`);
  }

  if (hourMissing) {
    parts.push(
      `**No birth time on file**, so the Hour Pillar can't be read — timing-of-arrival questions ` +
      `(when will it come?) will be weaker. Push on what and why more than when.`,
    );
  }

  if (question) {
    parts.push(`**Reading question on file**: “${question}”`);
  } else if (inquiryMsg) {
    parts.push(
      `**No reading question on file.** Open with: “What were you hoping to ask about today?”\n\n` +
      `_Their first contact said:_ “${inquiryMsg.slice(0, 240)}”`,
    );
  } else {
    parts.push(`**No reading question on file** — open by asking what they want to focus on.`);
  }

  return parts.join('\n\n');
}

const DAY_MASTER_LINES = {
  Wood_Yang:  'Yang Wood grows like a great pine — slow, vertical, built to last generations. Decisive, ambitious, can be inflexible.',
  Wood_Yin:   'Yin Wood is a vine — adapts to what it climbs, refines slowly. Gentle on the outside, persistent underneath.',
  Fire_Yang:  'Yang Fire is sunlight — visible, generous, expansive. They lead by being seen.',
  Fire_Yin:   'Yin Fire is candlelight or hearth — warmth on a smaller scale, but it draws people in.',
  Earth_Yang: 'Yang Earth is a mountain — solid, accumulates patiently, the foundation kind. They build before they explain.',
  Earth_Yin:  'Yin Earth is field soil — fertile, receptive, nourishes others. Quiet competence; rarely the loudest in the room.',
  Metal_Yang: 'Yang Metal is the sword — directness, decisiveness, sharp judgement. Can be rigid; cuts cleanly when it cuts.',
  Metal_Yin:  'Yin Metal is jewelry — precision, refinement, attention to detail. Polishes what they touch.',
  Water_Yang: 'Yang Water is a river — flows toward what it wants, finds the lowest path then carves valleys.',
  Water_Yin:  'Yin Water is still water — depth, reflection, holds memory. Patient where others rush.',
};

const DOMINANT_LINES = {
  Wood:  'The chart leans **Wood-dominant** — growth, ambition, projects already in motion',
  Fire:  'The chart leans **Fire-dominant** — visibility, expression, energy that wants an outlet',
  Earth: 'The chart leans **Earth-dominant** — foundations, building, slow compounding effort',
  Metal: 'The chart leans **Metal-dominant** — decisions, refinement, cutting away what doesn\'t serve',
  Water: 'The chart leans **Water-dominant** — intuition, depth, willingness to feel and let things move',
};

const ANIMAL_LINES = {
  Rat:     'Rat signs are resourceful and observant — they notice openings others miss.',
  Ox:      'Ox signs are stubborn in the useful sense — they finish what they start.',
  Tiger:   'Tiger signs lead with courage; they often arrive at readings already committed.',
  Rabbit:  'Rabbit signs are diplomatic; they want to be sure before they decide.',
  Dragon:  'Dragon signs are charismatic and confident; their question is rarely "can I" but "should I".',
  Snake:   'Snake signs are introspective and strategic; they\'ve already thought a lot before booking.',
  Horse:   'Horse signs are restless and adventurous; movement matters more than security.',
  Goat:    'Goat signs are creative and sensitive; they read the room before they read themselves.',
  Monkey:  'Monkey signs are clever and adaptable; they want options, not orders.',
  Rooster: 'Rooster signs are precise and confident; they value being right more than being liked.',
  Dog:     'Dog signs are loyal and principled; loyalty conflicts are often what they bring.',
  Pig:     'Pig signs are generous and trusting; they often come asking how to protect themselves better.',
};
