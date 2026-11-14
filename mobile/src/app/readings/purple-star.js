import { useEffect, useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';
import { WebView } from 'react-native-webview';
import { useRouter } from 'expo-router';
import { Body, Button, ErrorNote, Loading, Screen } from '../../components/ui';
import { fetchPurpleStar } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { color, font } from '../../lib/theme';

// Shows the same HTML report the website builds (lib/ps/render.mjs), from
// /api/member/purple-star. Links inside the report open in Safari.
export default function PurpleStar() {
  const router = useRouter();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [needs, setNeeds] = useState(null);
  const [view, setView] = useState('full');

  useEffect(() => {
    if (!user) { router.replace('/sign-in'); return; }
    fetchPurpleStar()
      .then(setData)
      .catch((e) => { if (e.status === 422) setNeeds(e.body?.needs || []); else setError(e.message); });
  }, [user, router]);

  if (needs) {
    return (
      <Screen edges={[]}>
        <Body>Purple Star needs your birth date, birth time and gender. Add them and we will build your 12-palace map.</Body>
        <Button title="Add birth details" onPress={() => router.push('/birth')} />
      </Screen>
    );
  }
  if (error) return <Screen edges={[]}><ErrorNote>{error}</ErrorNote></Screen>;
  if (!data) return <Loading />;

  const html = view === 'full' ? data.full : data.palaces.find((p) => p.key === view)?.html;
  const tabs = [{ key: 'full', label: 'Full reading' }, ...data.palaces.map((p) => ({ key: p.key, label: p.label }))];

  return (
    <View style={{ flex: 1, backgroundColor: color.paper }}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={st.tabs} contentContainerStyle={st.tabsInner}>
        {tabs.map((t) => (
          <Pressable key={t.key} onPress={() => setView(t.key)} style={[st.tab, view === t.key && st.tabOn]}>
            <Text style={[st.tabText, view === t.key && st.tabTextOn]}>{t.label}</Text>
          </Pressable>
        ))}
      </ScrollView>
      {Platform.OS === 'web'
        ? <iframe title="Purple Star" srcDoc={html} style={{ flex: 1, border: 0, width: '100%' }} />
        : (
          <WebView
            originWhitelist={['*']}
            source={{ html }}
            style={{ flex: 1 }}
            setSupportMultipleWindows={false}
            onShouldStartLoadWithRequest={(req) => req.url === 'about:blank' || req.url.startsWith('data:') || req.navigationType !== 'click'}
          />
        )}
    </View>
  );
}

const st = StyleSheet.create({
  tabs: { flexGrow: 0, borderBottomWidth: 1, borderBottomColor: color.rule },
  tabsInner: { paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
  tab: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, borderWidth: 1, borderColor: color.rule },
  tabOn: { backgroundColor: color.ink, borderColor: color.ink },
  tabText: { fontFamily: font.bodyMedium, fontSize: 13, color: color.ink2 },
  tabTextOn: { color: '#fff' },
});
