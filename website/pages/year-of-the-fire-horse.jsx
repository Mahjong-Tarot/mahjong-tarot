import { useMemo, useState, useEffect } from 'react';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import FireHorseFraming from '../components/FireHorseFraming';
import FireHorseForecastForm from '../components/FireHorseForecastForm';
import FireHorseResult from '../components/FireHorseResult';
import { ORGANIZATION, WEBSITE, PERSON_BILL, graph, breadcrumb } from '../lib/schema';
import { calculatePillars, STEMS } from '../lib/bazi';
import { supabase } from '../lib/supabase';
import overview from '../data/fire-horse/year-overview.json';
import dmScores from '../data/fire-horse/day-master-scores.json';
import {
  SIGNS,
  ELEMENTS,
  FIXED_ELEMENT,
  BAND_FOR,
  findEntry,
} from '../lib/fire-horse';
import styles from '../styles/FireHorse.module.css';

export default function YearOfTheFireHorse() {
  const [sign, setSign]         = useState('');
  const [element, setElement]   = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [birthTime, setBirthTime] = useState('');
  const [profile, setProfile]   = useState(null);
  const [profileAttempted, setProfileAttempted] = useState(false);

  // Try to pull profile from Supabase if signed in
  useEffect(() => {
    if (!supabase || profileAttempted) return;
    setProfileAttempted(true);
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from('profiles').select('*').eq('user_id', user.id).single();
      if (data) setProfile(data);
    })();
  }, [profileAttempted]);

  // If user has a profile and hasn't manually selected sign yet, auto-fill from profile
  useEffect(() => {
    if (!profile?.pillars || sign) return;
    const animal = profile.pillars.year?.branch?.animal?.toLowerCase();
    const elemMaybe = profile.pillars.year?.stem?.element?.toLowerCase();
    if (animal && SIGNS.includes(animal)) setSign(animal);
    if (elemMaybe && ELEMENTS.includes(elemMaybe)) setElement(elemMaybe);
    if (profile.birthday) setBirthDate(profile.birthday);
  }, [profile, sign]);

  // Compute Day Master from birth date if entered manually
  const dayMasterStem = useMemo(() => {
    if (profile?.pillars?.day?.gan) {
      const dmHan = profile.pillars.day.gan;
      const dmInfo = STEMS[dmHan];
      return dmInfo ? Object.entries(STEMS).find(([han]) => han === dmHan)?.[1] : null;
    }
    if (birthDate) {
      const p = calculatePillars(birthDate, birthTime || null);
      const dmHan = p?.day?.gan;
      return dmHan ? STEMS[dmHan] : null;
    }
    return null;
  }, [profile, birthDate, birthTime]);

  const dayMasterEntry = useMemo(() => {
    if (!dayMasterStem) return null;
    return dmScores.find((d) => d.stem === dayMasterStem.en);
  }, [dayMasterStem]);

  const effectiveElement = element || (sign ? FIXED_ELEMENT[sign] : '');
  const baseEntry = sign && effectiveElement ? findEntry(sign, effectiveElement) : null;

  // Compose final scores with optional Day Master overlay
  const composed = useMemo(() => {
    if (!baseEntry) return null;
    const yearLift = dayMasterEntry?.year_lift ?? 0;
    const monthLifts = dayMasterEntry?.monthly_lifts ?? [];
    const finalMonthly = baseEntry.monthly_scores.map((m, i) => {
      const monthLift = monthLifts[i]?.lift ?? 0;
      const raw = m.score + yearLift + monthLift;
      const score = Math.max(0.05, Math.min(0.95, raw));
      return { ...m, score, base_score: m.score, monthLift };
    });
    const finalYear = Math.max(
      0.05,
      Math.min(0.95, baseEntry.year_score + yearLift)
    );
    const monthlyAvg = finalMonthly.reduce((sum, m) => sum + m.score, 0) / 12;
    return { yearScore: finalYear, monthlyAvg, monthly: finalMonthly };
  }, [baseEntry, dayMasterEntry]);

  const yearBand = composed ? BAND_FOR(composed.yearScore) : null;

  return (
    <>
      <SEO
        title="Year of the Fire Horse 2026, Personal Forecast | Mahjong Tarot"
        description="Personalized forecast for the 2026 Year of the Fire Horse. The Fire Horse comes once every 60 years and is the most polarized year in the entire Chinese astrology cycle. See your sign, element, and Day Master reading."
        path="/year-of-the-fire-horse"
        image="/images/book-cover.webp"
        jsonLd={graph([
          ORGANIZATION,
          WEBSITE,
          PERSON_BILL,
          breadcrumb([
            { name: 'Home', url: '/' },
            { name: 'Year of the Fire Horse 2026', url: '/year-of-the-fire-horse' },
          ]),
        ])}
      />
      <Nav />

      {/* Hero */}
      <section className={styles.hero}>
        <div className="container">
          <div className={styles.heroInner}>
            <p className={styles.eyebrow}>Once every 60 years &middot; {overview.stem_branch}</p>
            <h1 className={styles.title}>The Year of the <em>Fire Horse</em></h1>
            <p className={styles.lead}>
              {overview.gregorian_range.begin}, {overview.gregorian_range.end}.
              The Fire Horse is the rarest and most polarized year in the entire Chinese
              60-year cycle. <strong>Double fire.</strong> All or nothing. Some signs
              will have one of the best years of their lives. Others will face a steep
              uphill battle. This is your personalized reading.
            </p>
          </div>
        </div>
      </section>

      <FireHorseFraming />

      <FireHorseForecastForm
        profile={profile}
        sign={sign}
        setSign={setSign}
        element={element}
        setElement={setElement}
        birthDate={birthDate}
        setBirthDate={setBirthDate}
        birthTime={birthTime}
        setBirthTime={setBirthTime}
        dayMasterStem={dayMasterStem}
      />

      {composed && (
        <FireHorseResult
          composed={composed}
          yearBand={yearBand}
          sign={sign}
          effectiveElement={effectiveElement}
          dayMasterStem={dayMasterStem}
          dayMasterEntry={dayMasterEntry}
        />
      )}

      {/* About methodology */}
      <section className={styles.method}>
        <div className="container">
          <div className={styles.methodInner}>
            <h2>About this forecast</h2>
            <p>
              The scoring engine combines three layers: the structural sign-vs-Horse compatibility (12 signs), an element overlay for your birth element (60-sign view), and an optional Day Master overlay derived from your birth date (10 Heavenly Stems, 10 Gods 十神 framework). The Fire Horse year applies a volatility model on top, element relationships are amplified ×1.4 and final scores are stretched toward the extremes, mathematically encoding the &ldquo;all or nothing&rdquo; nature of double-fire years.
            </p>
            <p>
              Every score is probabilistic. A 0.26 score for the Rat does not mean the year will be bad, it means the structural deck is stacked toward headwinds, and the Rats who navigate it well are the ones who recognize that and adapt. Even the worst sign has its Peak windows, and even the best sign has months where the right move is to wait.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
