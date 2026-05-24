// Static content for the /readings page: reading types, process steps,
// what-you-gain list, testimonials, FAQ items, Chinese signs dropdown,
// plus the JSON-LD Service + FAQ payloads.

export const CHINESE_SIGNS = [
  'Rat', 'Ox', 'Tiger', 'Rabbit', 'Dragon', 'Snake',
  'Horse', 'Goat', 'Monkey', 'Rooster', 'Dog', 'Pig',
];

export const READING_TYPES = [
  {
    id: 'one-tile',
    overline: '10–15 minutes',
    label: 'Quick Guidance',
    title: 'One-Tile Insight',
    body:
      'A simple yet powerful message drawn from a single tile, ideal for yes or no questions, emotional check-ins, or moments when you need one clear truth.',
    featured: false,
  },
  {
    id: 'three-tile',
    overline: '20–30 minutes',
    label: 'Past · Present · Near Future',
    title: 'Three-Tile Spread',
    body:
      'This reading explores the flow of energy around your situation through Past Influence, Present Energy, and Near Future Direction, offering a balanced and focused perspective that brings clarity to decisions and life transitions.',
    featured: false,
  },
  {
    id: 'mirror-session',
    overline: '45--60 minutes',
    label: 'Deep Insight Reading',
    title: 'The Mahjong Mirror Session',
    body:
      'A deep, intuitive reading that looks into your emotional, spiritual, and practical life, revealing hidden influences, current challenges, energetic strengths, possible outcomes, and key lessons. Ideal for relationship dynamics, life purpose exploration, long-term planning, or periods of uncertainty.',
    featured: true,
  },
];

export const HOW_IT_WORKS_STEPS = [
  {
    n: '01',
    title: 'Set Your Intention',
    body: 'Choose your focus: love, career, healing, conflict, clarity, next steps, or an open reading.',
  },
  {
    n: '02',
    title: 'The Tiles Are Drawn',
    body: 'Tiles are pulled intuitively, revealing energies, symbols, and patterns tied to your question.',
  },
  {
    n: '03',
    title: 'Interpretation & Reflection',
    body: 'You receive a clear reading that explains each tile, the overall message, and actionable guidance.',
  },
];

export const WHAT_YOU_GAIN = [
  'Clarity around your situation or question',
  'Insight into emotional and energetic dynamics',
  'Understanding of potential outcomes or timing',
  'Validation for feelings and intuition',
  'A fresh perspective rooted in symbolic wisdom',
  'Grounded guidance to help you move forward',
];

export const TESTIMONIALS = [
  { quote: 'Beautiful, intuitive, and accurate. The tiles described exactly how I felt.', name: 'Saharan Louret', location: 'OH' },
  { quote: 'A calming, grounding experience. I left feeling lighter and clearer.', name: 'Fabian Baracca', location: 'MN' },
  { quote: 'My relationship reading was spot on. It changed how I approached our conversation.', name: 'Mouna Gonzato', location: 'NJ' },
];

export const FAQ_ITEMS = [
  { q: 'Do I need to know how to play Mahjong?', a: 'Not at all. The system uses symbolic meanings, not game rules.' },
  { q: 'Can I ask specific questions?', a: 'Yes, your question or theme helps guide the reading.' },
  { q: 'How should I prepare?', a: 'Arrive relaxed, and think about what you most want clarity on.' },
  { q: 'Is the reading live or written?', a: 'Sessions are typically live; written readings may be offered by request.' },
  { q: 'Can I record the session?', a: "Yes, you're welcome to keep a recording for personal use." },
];

// JSON-LD fragments injected into the SEO graph.
export const SERVICE_SCHEMA = {
  '@type': 'Service',
  name: 'Mahjong Tarot Reading',
  provider: { '@id': 'https://www.mahjongtarot.com/#bill-hajdu' },
  serviceType: 'Divination reading',
  areaServed: 'Worldwide',
  description:
    'Live online 1-on-1 Mahjong tile readings combining Chinese astrology, Mahjong symbolism, and tarot. Three session lengths available.',
  url: 'https://www.mahjongtarot.com/readings',
};

export const SCHEMA_FAQS = [
  { q: 'What is a Mahjong Tarot reading?', a: 'A Mahjong Tarot reading uses 42 symbolic cards drawn from the Chinese Mahjong tradition to illuminate your current situation, hidden influences, and possible outcomes. Bill Hajdu combines them with Chinese Four Pillars astrology and tarot for a layered interpretation.' },
  { q: 'Do I need to know Mahjong to get a reading?', a: 'No. Bill guides the entire process, you only need an open mind and a question worth asking.' },
  { q: 'How long does a reading take?', a: 'One-Tile Insight runs 10–15 minutes, the Three-Tile Spread runs 20–30 minutes, and the Mahjong Mirror Session runs 45–60 minutes.' },
  { q: 'Are readings done in person or online?', a: 'All readings are conducted live online over video so Bill can read for clients anywhere in the world.' },
];
