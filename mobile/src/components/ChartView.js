import { StyleSheet, Text, View } from 'react-native';
import { Body, Card, H3, Overline } from './ui';
import { color, element as EL, font } from '../lib/theme';

// The website's free chart (/chart), from the same /api/chart response.
export default function ChartView({ chart }) {
  const fp = chart?.fourPillars;
  const max = Math.max(1, ...(fp?.elements || []).map((e) => e.count));
  const order = ['hour', 'day', 'month', 'year'];
  const pillars = order.map((k) => fp?.pillars?.find((p) => p.key === k) || { key: k, label: k[0].toUpperCase() + k.slice(1), missing: true });
  const current = fp?.stages?.find((s) => s.current);
  const fh = chart?.fireHorse;
  const ps = chart?.purpleStar;

  return (
    <View style={{ gap: 14 }}>
      <View style={st.pillars}>
        {pillars.map((p) => (
          <View key={p.key} style={[st.pillar, p.key === 'day' && st.dayMaster, p.missing && st.missing]}>
            <Text style={st.pLabel}>{p.label}</Text>
            {p.missing ? <Text style={st.pNeeds}>Add a birth time</Text> : <>
              <Text style={st.hanzi}>{p.hanzi?.[0]}</Text>
              <Text style={st.hanzi}>{p.hanzi?.[1]}</Text>
              <Text style={st.pName}>{p.name}</Text>
            </>}
          </View>
        ))}
      </View>

      {chart?.dayMaster ? (
        <Card tone="fill">
          <Text style={st.dmHead}>Day master: {chart.dayMaster.polarity} {chart.dayMaster.element}</Text>
          {chart.sign ? <Body small muted>Born in the year of the {chart.sign.combined}.{chart.sign.personality ? ` ${chart.sign.personality}` : ''}</Body> : null}
        </Card>
      ) : null}

      {fp?.elements?.length ? <>
        <H3>Your element mix</H3>
        <View style={{ gap: 8 }}>
          {fp.elements.map((e) => (
            <View key={e.element} style={st.barRow}>
              <Text style={st.barLabel}>{e.element}</Text>
              <View style={st.barTrack}>
                <View style={[st.bar, { width: `${Math.max(4, (e.count / max) * 100)}%`, backgroundColor: EL[e.element] }]} />
              </View>
              <Text style={st.barCount}>{e.count}</Text>
            </View>
          ))}
        </View>
      </> : null}

      {fp?.stages?.length ? <>
        <H3>The five stages of your life</H3>
        <View style={st.stages}>
          {fp.stages.map((s) => (
            <View key={s.stage} style={[st.stage, s.current && st.stageNow]}>
              <Text style={[st.stageName, s.current && { color: '#fff' }]}>{s.stage}</Text>
              <Text style={[st.stageAges, s.current && { color: '#fff' }]}>{s.ages}</Text>
            </View>
          ))}
        </View>
        {current ? (
          <Card>
            <Overline>Now · {current.stage}</Overline>
            {current.chiLevel ? <Text style={st.dmHead}>{current.chiLevel}</Text> : null}
            {current.fate ? <Body small>{current.fate}</Body> : null}
          </Card>
        ) : null}
      </> : null}

      {ps?.fate ? <>
        <H3>Your Purple Star fate palace</H3>
        <Card>
          <Text style={st.dmHead}>{ps.fate.stars.join(', ') || 'Empty palace'}</Text>
          {ps.fate.traits?.length ? <Body small muted>{ps.fate.traits.join(' · ')}</Body> : null}
          {ps.fate.conclusion ? <Body small>{ps.fate.conclusion}</Body> : null}
        </Card>
      </> : chart?.purpleStarNeeds === 'time' ? (
        <Card tone="fill"><Body small muted>Add a birth time to see your Purple Star fate palace.</Body></Card>
      ) : null}

      {fh?.bestMonths?.length ? (
        <Card>
          <Overline>Year of the Fire Horse</Overline>
          {fh.band ? <Text style={st.dmHead}>{fh.band}</Text> : null}
          <Body small>Best months: {fh.bestMonths.join(', ')}</Body>
        </Card>
      ) : null}
    </View>
  );
}

const st = StyleSheet.create({
  pillars: { flexDirection: 'row', gap: 6 },
  pillar: { flex: 1, borderWidth: 1, borderColor: color.rule, borderRadius: 8, paddingVertical: 10, alignItems: 'center', gap: 2 },
  dayMaster: { borderColor: color.fire500, backgroundColor: color.fire50 },
  missing: { borderStyle: 'dashed', justifyContent: 'center' },
  pLabel: { fontFamily: font.body, fontSize: 12, color: color.ink3, marginBottom: 2 },
  hanzi: { fontFamily: font.book, fontSize: 26, lineHeight: 30, color: color.ink },
  pName: { fontFamily: font.body, fontSize: 10.5, color: color.ink3, textAlign: 'center', marginTop: 2 },
  pNeeds: { fontFamily: font.body, fontSize: 11, color: color.ink4, textAlign: 'center', paddingHorizontal: 4 },
  dmHead: { fontFamily: font.heading, fontSize: 17, color: color.ink },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  barLabel: { width: 48, fontFamily: font.body, fontSize: 14, color: color.ink2 },
  barTrack: { flex: 1, height: 10, backgroundColor: color.rule2, borderRadius: 5, overflow: 'hidden' },
  bar: { height: 10, borderRadius: 5 },
  barCount: { width: 18, textAlign: 'right', fontFamily: font.body, fontSize: 13, color: color.ink3 },
  stages: { flexDirection: 'row', gap: 4 },
  stage: { flex: 1, backgroundColor: color.rule2, borderRadius: 6, paddingVertical: 8, alignItems: 'center' },
  stageNow: { backgroundColor: color.fire500 },
  stageName: { fontFamily: font.bodySemi, fontSize: 11, color: color.ink2 },
  stageAges: { fontFamily: font.body, fontSize: 10, color: color.ink3 },
});
