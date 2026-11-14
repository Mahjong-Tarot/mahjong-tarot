import { useState } from 'react';
import { ScrollView, Pressable, StyleSheet, Text, View } from 'react-native';
import { Body, Card, H3, Overline } from './ui';
import { color, element as EL, font } from '../lib/theme';

// Native version of website/components/CompatibilityReport.jsx, from the
// same /api/compatibility response.
const TABS = [
  { key: 'theGood', label: 'The Good' },
  { key: 'theNotSoGood', label: 'The Not-So-Good' },
  { key: 'romance', label: 'Romance' },
  { key: 'sex', label: 'In Bed' },
  { key: 'yinYangDescription', label: 'Yin & Yang' },
];

export default function CompatibilityReport({ result, person1Label = 'You', person2Label = 'Partner' }) {
  const [tab, setTab] = useState('theGood');
  if (!result) return null;
  const { person1, person2, rating, tier, generalMatchDescription, yin, yang, soulMate, combinedElements, elementStrength, elementDynamic } = result;
  const max = Math.max(1, ...Object.values(combinedElements || {}));

  return (
    <View style={{ gap: 14 }}>
      <View style={st.hero}>
        <View style={st.dial}>
          <Text style={st.rating}>{rating != null ? Math.round(rating) : '–'}</Text>
          <Text style={st.ratingLabel}>% match</Text>
        </View>
        <View style={{ flex: 1, gap: 4 }}>
          <Text style={st.title}>{person1Label} <Text style={{ color: color.fire600 }}>×</Text> {person2Label}</Text>
          <Text style={st.sub}>{person1?.sign}{yin != null && yang != null ? ` · ${yin}Y / ${yang}Y` : ''} vs {person2?.sign}</Text>
          {tier ? <Text style={st.tier}>{typeof tier === 'string' ? tier : tier.name}</Text> : null}
        </View>
      </View>
      {generalMatchDescription ? <Body>{generalMatchDescription}</Body> : null}
      {soulMate ? (
        <Card tone={soulMate.isMatch ? 'highlight' : 'fill'}>
          <Text style={st.cardHead}>{soulMate.isMatch ? '★ Soul-mate territory' : `Soul-mate sign: ${soulMate.expectedSoulMate}`}</Text>
          {soulMate.description ? <Body small>{soulMate.description}</Body> : null}
        </Card>
      ) : null}

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
        {TABS.map((t) => (
          <Pressable key={t.key} disabled={!result[t.key]} onPress={() => setTab(t.key)} style={[st.tab, tab === t.key && st.tabOn, !result[t.key] && { opacity: 0.4 }]}>
            <Text style={[st.tabText, tab === t.key && { color: '#fff' }]}>{t.label}</Text>
          </Pressable>
        ))}
      </ScrollView>
      <Body>{result[tab] || 'No detail available for this section.'}</Body>

      {elementDynamic?.description ? (
        <Card>
          <Overline>Element dynamic</Overline>
          <Text style={st.cardHead}>{elementDynamic.primary} and {elementDynamic.partner}</Text>
          <Body small>{elementDynamic.description}</Body>
        </Card>
      ) : null}

      {combinedElements ? <>
        <H3>Your elements combined</H3>
        {Object.entries(combinedElements).map(([el, n]) => (
          <View key={el} style={st.barRow}>
            <Text style={st.barLabel}>{el}</Text>
            <View style={st.track}><View style={[st.bar, { width: `${Math.max(4, (n / max) * 100)}%`, backgroundColor: EL[el] }]} /></View>
            <Text style={st.barCount}>{n}</Text>
          </View>
        ))}
        {elementStrength?.conclusion ? <Body small muted>{elementStrength.conclusion}</Body> : null}
      </> : null}
    </View>
  );
}

const st = StyleSheet.create({
  hero: { flexDirection: 'row', gap: 16, alignItems: 'center' },
  dial: { width: 88, height: 88, borderRadius: 44, borderWidth: 3, borderColor: color.fire500, alignItems: 'center', justifyContent: 'center' },
  rating: { fontFamily: font.heading, fontSize: 30, color: color.ink },
  ratingLabel: { fontFamily: font.body, fontSize: 11, color: color.ink3 },
  title: { fontFamily: font.heading, fontSize: 22, color: color.ink },
  sub: { fontFamily: font.body, fontSize: 14, color: color.ink3 },
  tier: { fontFamily: font.bodySemi, fontSize: 14, color: color.fire600 },
  cardHead: { fontFamily: font.heading, fontSize: 17, color: color.ink },
  tab: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, borderWidth: 1, borderColor: color.rule },
  tabOn: { backgroundColor: color.ink, borderColor: color.ink },
  tabText: { fontFamily: font.bodyMedium, fontSize: 13, color: color.ink2 },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  barLabel: { width: 48, fontFamily: font.body, fontSize: 14, color: color.ink2 },
  track: { flex: 1, height: 10, backgroundColor: color.rule2, borderRadius: 5, overflow: 'hidden' },
  bar: { height: 10, borderRadius: 5 },
  barCount: { width: 18, textAlign: 'right', fontFamily: font.body, fontSize: 13, color: color.ink3 },
});
