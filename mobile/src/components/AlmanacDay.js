import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Body, Card, Chip, ErrorNote, H3, Loading, Overline, Title } from './ui';
import { color, font, tone as TONE } from '../lib/theme';
import { fetchAlmanacDay, formatDay, groupActivities, inRange, shiftDate, todayInLA } from '../lib/almanac';
import { calculatePillars, elementInteraction } from '../lib/shared';

// The website's /almanac/[date] day, condensed, plus one personal line:
// how today's day element meets the person's day master.
export default function AlmanacDay({ date: initialDate, birth }) {
  const [date, setDate] = useState(initialDate || todayInLA());
  const [day, setDay] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (initialDate) setDate(initialDate); }, [initialDate]);

  useEffect(() => {
    let alive = true;
    setLoading(true); setError(null);
    fetchAlmanacDay(date)
      .then((d) => { if (alive) setDay(d); })
      .catch((e) => { if (alive) setError(e.message); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [date]);

  const personal = useMemo(() => {
    if (!birth?.date || !day?.pillars?.day?.element) return null;
    const me = calculatePillars(birth.date, birth.time)?.day?.stem?.element;
    return elementInteraction(me, day.pillars.day.element);
  }, [birth, day]);

  const groups = groupActivities(day?.activities);
  const t = TONE[day?.tone] || TONE.neutral;
  const isToday = date === todayInLA();
  const prev = shiftDate(date, -1);
  const next = shiftDate(date, 1);

  return (
    <View style={{ gap: 14 }}>
      <View style={st.dateRow}>
        <Pressable accessibilityLabel="Previous day" disabled={!inRange(prev)} onPress={() => setDate(prev)} hitSlop={12}>
          <Ionicons name="chevron-back" size={22} color={inRange(prev) ? color.ink : color.rule} />
        </Pressable>
        <Overline>{isToday ? `Today · ${formatDay(date)}` : formatDay(date)}</Overline>
        <Pressable accessibilityLabel="Next day" disabled={!inRange(next)} onPress={() => setDate(next)} hitSlop={12}>
          <Ionicons name="chevron-forward" size={22} color={inRange(next) ? color.ink : color.rule} />
        </Pressable>
      </View>
      {!isToday && (
        <Pressable onPress={() => setDate(todayInLA())}><Text style={st.back}>Back to today</Text></Pressable>
      )}

      {loading ? <Loading /> : error ? <ErrorNote>{error}</ErrorNote> : !day ? (
        <Body muted>The almanac covers {formatDay('2026-02-17')} 2026 to early 2032. Pick a day in that range.</Body>
      ) : (
        <>
          <Title size={28} em={day.officer?.english} after=" day">{`${isToday ? 'Today' : 'This'} is ${/^[AEIOU]/i.test(day.officer?.english || '') ? 'an' : 'a'} `}</Title>
          {day.officer?.gloss ? <Body muted>{day.officer.gloss}</Body> : null}

          <Card tone="fill" style={st.scoreCard}>
            <View>
              <Text style={[st.score, { color: t.ink }]}>{day.score}</Text>
              <Text style={st.scoreLabel}>Day score</Text>
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={[st.tone, { color: t.ink }]}>{t.label}</Text>
              <Text style={st.meta}>{day.officer?.chinese} {day.officer?.pinyin}</Text>
              {day.holiday ? <Text style={st.meta}>{day.holiday}</Text> : null}
            </View>
          </Card>

          {personal ? (
            <Card tone="highlight">
              <Overline>For you</Overline>
              <Text style={st.personalHead}>{personal.headline}</Text>
              <Body small>{personal.line}</Body>
            </Card>
          ) : null}

          <H3>Auspicious hours</H3>
          <View style={st.wrap}>
            {(day.auspicious_hours || []).map((h) => (
              <Chip key={h.branch} label={`${h.range} · ${h.chinese}`} bg={color.goodBg} ink={color.goodInk} />
            ))}
          </View>

          {groups.Lucky.length ? <>
            <H3>Good for</H3>
            <View style={st.wrap}>{groups.Lucky.map((a) => <Chip key={a} label={a} bg={color.goodBg} ink={color.goodInk} />)}</View>
          </> : null}
          {groups.Unlucky.length ? <>
            <H3>Put these off</H3>
            <View style={st.wrap}>{groups.Unlucky.map((a) => <Chip key={a} label={a} bg={color.badBg} ink={color.badInk} />)}</View>
          </> : null}

          <View style={st.facts}>
            {['year', 'month', 'day'].map((k) => day.pillars?.[k] ? (
              <View key={k} style={st.fact}>
                <Text style={st.factLabel}>{k[0].toUpperCase() + k.slice(1)}</Text>
                <Text style={st.factValue}>{day.pillars[k].element} {day.pillars[k].sign}</Text>
              </View>
            ) : null)}
          </View>
        </>
      )}
    </View>
  );
}

const st = StyleSheet.create({
  dateRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  back: { fontFamily: font.bodySemi, color: color.fire600, fontSize: 14, textAlign: 'center', marginTop: -6 },
  scoreCard: { flexDirection: 'row', alignItems: 'center', gap: 18 },
  score: { fontFamily: font.heading, fontSize: 40, lineHeight: 44 },
  scoreLabel: { fontFamily: font.body, fontSize: 12, color: color.ink3 },
  tone: { fontFamily: font.bodySemi, fontSize: 16 },
  meta: { fontFamily: font.body, fontSize: 14, color: color.ink3 },
  personalHead: { fontFamily: font.heading, fontSize: 19, color: color.ink },
  wrap: { flexDirection: 'row', flexWrap: 'wrap' },
  facts: { flexDirection: 'row', gap: 8, marginTop: 6 },
  fact: { flex: 1, borderWidth: 1, borderColor: color.rule, borderRadius: 8, padding: 10 },
  factLabel: { fontFamily: font.body, fontSize: 12, color: color.ink4 },
  factValue: { fontFamily: font.bodyMedium, fontSize: 14, color: color.ink },
});
