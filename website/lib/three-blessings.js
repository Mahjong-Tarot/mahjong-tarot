// Deterministic Three Blessings reading derived from a person's birth data.
// Position 1, Phuc (Happiness / Divine Timing), drawn from the Year animal sign.
// Position 2, Loc (Prosperity / Abundance)   , drawn from the Day stem (element + polarity).
// Position 3, Tho (Longevity / Legacy)       , drawn from the dominant five-element count.
//
// The book describes the rare full-dragon pattern (Green/Red/White) as legend.
// Our mappings deliberately do not produce the three sacred dragons themselves –
// each person receives their personal expression of each blessing instead.

import { CARDS } from './cards';
import { calculatePillars, tallyElements, dominantElement } from './bazi';

const cardBySlug = (slug) => CARDS.find((c) => c.slug === slug) || null;

export const POSITIONS = {
  phuc: {
    key: 'phuc',
    order: 1,
    name: 'Phuc',
    label: 'Happiness · Divine Timing',
    idealCard: 'green-dragon',
    description:
      'The first position carries Phuc, the breath of spring, divine timing, and the conditions that say "begin now". When the Green Dragon falls here, fortune itself nods toward your path.',
  },
  loc: {
    key: 'loc',
    order: 2,
    name: 'Loc',
    label: 'Prosperity · Abundance',
    idealCard: 'red-dragon',
    description:
      'The middle position carries Loc, abundance, recognition, and the harvest of effort meeting opportunity. When the Red Dragon falls here, prosperity multiplies through everything you touch.',
  },
  tho: {
    key: 'tho',
    order: 3,
    name: 'Tho',
    label: 'Longevity · Legacy',
    idealCard: 'white-dragon',
    description:
      'The final position carries Tho, endurance, wisdom, and what remains after the day is done. When the White Dragon falls here, what you build will outlast your own time.',
  },
};

const PHUC_BY_ANIMAL = {
  Rat:     'pearl',
  Ox:      'earth',
  Tiger:   'tiger',
  Rabbit:  'lotus',
  Dragon:  'dragon',
  Snake:   'orchid',
  Horse:   'phoenix',
  Sheep:   'peach',
  Monkey:  'carp',
  Rooster: 'east',
  Dog:     'bamboo',
  Pig:     'toad',
};

const PHUC_LINES = {
  Rat:     'Born under the Rat, your blessings come quietly, through quick perception, hidden openings, and the small chances others miss.',
  Ox:      'Born under the Ox, your blessings settle in slowly. They reward patience, steady labour, and the long arc of consistent effort.',
  Tiger:   'Born under the Tiger, your blessings arrive when you move first. Boldness opens the door that hesitation keeps closed.',
  Rabbit:  'Born under the Rabbit, your blessings come through grace and timing. The gentle move, made at the right moment, changes everything.',
  Dragon:  'Born under the Dragon, your blessings are large in scale. They favour the visionary stroke and the willingness to lead.',
  Snake:   'Born under the Snake, your blessings come through insight. What you sense before others see is the seed of your fortune.',
  Horse:   'Born under the Horse, your blessings ride momentum. They reach you when you commit fully to the journey already underway.',
  Sheep:   'Born under the Sheep, your blessings flow through care, beauty, and the people you choose to walk beside you.',
  Monkey:  'Born under the Monkey, your blessings come through cleverness. The unconventional path is the one prepared for you.',
  Rooster: 'Born under the Rooster, your blessings answer precision. They arrive when you act with discipline and exact timing.',
  Dog:     'Born under the Dog, your blessings come through loyalty. The relationships you protect become the soil of your good fortune.',
  Pig:     'Born under the Pig, your blessings flow through generosity. What you give freely returns in unexpected and abundant forms.',
};

const LOC_BY_STEM = {
  Wood_Yang:  'pine',
  Wood_Yin:   'jade',
  Fire_Yang:  'south',
  Fire_Yin:   'lute',
  Earth_Yang: 'house',
  Earth_Yin:  'insect',
  Metal_Yang: 'sword',
  Metal_Yin:  'pearl',
  Water_Yang: 'carp',
  Water_Yin:  'ducks',
};

const LOC_LINES = {
  Wood_Yang:  'Your Yang Wood day master grows wealth like a great pine, slowly, vertically, built to last generations.',
  Wood_Yin:   'Your Yin Wood day master cultivates prosperity through quality. Refinement and craft are your channels of abundance.',
  Fire_Yang:  'Your Yang Fire day master earns through visibility. You prosper when you let your work be seen.',
  Fire_Yin:   'Your Yin Fire day master prospers through warmth and craft. Your gift attracts those willing to pay for it well.',
  Earth_Yang: 'Your Yang Earth day master builds wealth in foundations, property, infrastructure, the things that anchor others.',
  Earth_Yin:  'Your Yin Earth day master gathers prosperity quietly. Your patience compounds where others lose theirs.',
  Metal_Yang: 'Your Yang Metal day master prospers through decisiveness. The clean cut, made at the right time, is your gold.',
  Metal_Yin:  'Your Yin Metal day master earns through precision. Polish, standard, and quality are your channels of abundance.',
  Water_Yang: 'Your Yang Water day master flows toward wealth like a river, finding the lowest path, then carving valleys.',
  Water_Yin:  'Your Yin Water day master collects prosperity in still pools, through depth of relationship, trust, and the long return.',
};

const THO_BY_ELEMENT = {
  Wood:     'pine',
  Fire:     'phoenix',
  Earth:    'tortoise',
  Metal:    'mushroom',
  Water:    'heaven',
  Balanced: 'lotus',
};

const THO_LINES = {
  Wood:     'With Wood as your dominant element, your legacy grows. What you plant outlives you, in students, in projects, in family.',
  Fire:     'With Fire as your dominant element, your legacy is your spark. The energy you light in others continues long after you step back.',
  Earth:    'With Earth as your dominant element, your legacy is the foundation you leave. People will build on what you held steady.',
  Metal:    'With Metal as your dominant element, your legacy is precision and standard. The principles you upheld will outlast the fashions you lived through.',
  Water:    'With Water as your dominant element, your legacy is the wisdom you carried. Stories, teaching, and quiet influence shape generations.',
  Balanced: 'With your elements held in rare balance, your legacy is harmony itself. You leave behind whole systems, not single victories.',
};

function makeBlessing(positionKey, cardSlug, sourceLabel, personalLine) {
  const position = POSITIONS[positionKey];
  const card = cardBySlug(cardSlug);
  return {
    position,
    card,
    isIdeal: cardSlug === position.idealCard,
    sourceLabel,
    personalLine,
  };
}

/**
 * Compute the user's Three Blessings reading from their birth data.
 * Returns null when birth data is insufficient.
 */
export function computeThreeBlessings({ birthday, birthTime, pillars: providedPillars } = {}) {
  if (!birthday && !providedPillars) return null;
  const pillars = providedPillars || calculatePillars(birthday, birthTime);
  if (!pillars) return null;

  const animal = pillars.year?.branch?.animal;
  const stemElement = pillars.day?.stem?.element;
  const stemPolarity = pillars.day?.stem?.polarity;
  const stemKey = stemElement && stemPolarity ? `${stemElement}_${stemPolarity}` : null;

  const elements = tallyElements(pillars);
  const dom = dominantElement(elements);

  const phucSlug = PHUC_BY_ANIMAL[animal] || 'east';
  const locSlug  = LOC_BY_STEM[stemKey]   || 'south';
  const thoSlug  = THO_BY_ELEMENT[dom]    || 'tortoise';

  return {
    phuc: makeBlessing(
      'phuc',
      phucSlug,
      animal ? `Year of the ${animal}` : 'Year sign',
      PHUC_LINES[animal] || null,
    ),
    loc: makeBlessing(
      'loc',
      locSlug,
      stemElement && stemPolarity ? `${stemPolarity} ${stemElement} day master` : 'Day master',
      LOC_LINES[stemKey] || null,
    ),
    tho: makeBlessing(
      'tho',
      thoSlug,
      dom ? `${dom} dominant` : 'Dominant element',
      THO_LINES[dom] || null,
    ),
  };
}
