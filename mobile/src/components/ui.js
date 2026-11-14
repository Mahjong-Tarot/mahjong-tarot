import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { color, font, radius, space } from '../lib/theme';

export function Screen({ children, scroll = true, edges = ['top'], contentStyle }) {
  const body = scroll
    ? <ScrollView contentContainerStyle={[s.content, contentStyle]} keyboardShouldPersistTaps="handled">{children}</ScrollView>
    : <View style={[s.content, s.fill, contentStyle]}>{children}</View>;
  return <SafeAreaView edges={edges} style={s.screen}>{body}</SafeAreaView>;
}

export function Overline({ children, style }) {
  return <Text style={[s.overline, style]}>{typeof children === 'string' ? children.toUpperCase() : children}</Text>;
}

// Headline with optional upright fire-red emphasis: <Title em="one angle">That is </Title>
export function Title({ children, em, after, size = 28, style }) {
  return (
    <Text style={[s.title, { fontSize: size, lineHeight: Math.round(size * 1.15) }, style]}>
      {children}{em ? <Text style={s.em}>{em}</Text> : null}{after}
    </Text>
  );
}

export function H3({ children, style }) {
  return <Text style={[s.h3, style]}>{children}</Text>;
}

export function Body({ children, muted, small, style }) {
  return <Text style={[s.body, small && s.small, muted && s.muted, style]}>{children}</Text>;
}

export function Button({ title, onPress, variant = 'primary', disabled, loading, style }) {
  const ghost = variant === 'ghost';
  const link = variant === 'link';
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        link ? s.link : s.btn,
        ghost && s.btnGhost,
        !ghost && !link && { backgroundColor: pressed ? color.fire600 : color.fire500 },
        (disabled || loading) && { opacity: 0.5 },
        style,
      ]}
    >
      {loading
        ? <ActivityIndicator color={ghost || link ? color.ink : '#fff'} />
        : <Text style={[s.btnText, ghost && { color: color.ink }, link && s.linkText]}>{title}</Text>}
    </Pressable>
  );
}

export function Field({ label, hint, style, ...props }) {
  return (
    <View style={[{ gap: 6 }, style]}>
      {label ? <Text style={s.label}>{label}{hint ? <Text style={s.hint}>  {hint}</Text> : null}</Text> : null}
      <TextInput placeholderTextColor={color.ink4} style={s.input} {...props} />
    </View>
  );
}

export function Card({ children, tone = 'plain', style, onPress }) {
  const st = [s.card, tone === 'fill' && s.cardFill, tone === 'highlight' && s.cardHighlight, style];
  if (onPress) return <Pressable onPress={onPress} style={({ pressed }) => [st, pressed && { opacity: 0.7 }]}>{children}</Pressable>;
  return <View style={st}>{children}</View>;
}

export function Chip({ label, bg = color.rule2, ink = color.ink3 }) {
  return <View style={[s.chip, { backgroundColor: bg }]}><Text style={[s.chipText, { color: ink }]}>{label}</Text></View>;
}

export function ErrorNote({ children }) {
  if (!children) return null;
  return <View style={s.error}><Text style={s.errorText}>{children}</Text></View>;
}

export function Loading() {
  return <View style={s.loading}><ActivityIndicator color={color.fire500} /></View>;
}

export function Segmented({ options, value, onChange }) {
  return (
    <View style={s.seg}>
      {options.map((o) => (
        <Pressable key={o.value} onPress={() => onChange(o.value)} style={[s.segItem, value === o.value && s.segOn]}>
          <Text style={[s.segText, value === o.value && s.segTextOn]}>{o.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: color.paper },
  fill: { flex: 1 },
  content: { padding: space.md + 4, paddingBottom: space.xl, gap: space.md },
  overline: { fontFamily: font.bodySemi, fontSize: 12, letterSpacing: 2, color: color.fire600 },
  title: { fontFamily: font.heading, color: color.ink, letterSpacing: -0.4 },
  em: { color: color.fire600 },
  h3: { fontFamily: font.heading, fontSize: 18, color: color.ink, marginTop: space.sm },
  body: { fontFamily: font.body, fontSize: 17, lineHeight: 26, color: color.ink2 },
  small: { fontSize: 14, lineHeight: 20 },
  muted: { color: color.ink3 },
  btn: { borderRadius: radius.md, paddingVertical: 15, paddingHorizontal: space.md, alignItems: 'center', justifyContent: 'center', minHeight: 50 },
  btnGhost: { backgroundColor: 'transparent', borderWidth: 1, borderColor: color.ink },
  btnText: { fontFamily: font.bodySemi, fontSize: 16, color: '#fff' },
  link: { paddingVertical: 10, alignItems: 'center' },
  linkText: { color: color.fire600, fontFamily: font.bodySemi, fontSize: 15 },
  label: { fontFamily: font.bodyMedium, fontSize: 14, color: color.ink2 },
  hint: { fontFamily: font.body, color: color.ink4 },
  input: { borderWidth: 1, borderColor: color.rule, borderRadius: radius.md, paddingHorizontal: 14, paddingVertical: 13, fontFamily: font.body, fontSize: 16, color: color.ink, backgroundColor: color.paper },
  card: { borderWidth: 1, borderColor: color.rule, borderRadius: radius.md, padding: space.md, gap: 6 },
  cardFill: { backgroundColor: color.rule2, borderColor: color.rule2 },
  cardHighlight: { backgroundColor: color.fire50, borderColor: color.fire100 },
  chip: { borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 4, marginRight: 6, marginBottom: 6 },
  chipText: { fontFamily: font.bodySemi, fontSize: 13 },
  error: { backgroundColor: color.fire50, borderColor: color.fire100, borderWidth: 1, borderRadius: radius.md, padding: space.sm2 },
  errorText: { fontFamily: font.body, color: color.fire700, fontSize: 15 },
  loading: { padding: space.xl, alignItems: 'center' },
  seg: { flexDirection: 'row', borderWidth: 1, borderColor: color.rule, borderRadius: radius.md, overflow: 'hidden' },
  segItem: { flex: 1, paddingVertical: 11, alignItems: 'center' },
  segOn: { backgroundColor: color.ink },
  segText: { fontFamily: font.bodyMedium, fontSize: 15, color: color.ink2 },
  segTextOn: { color: '#fff' },
});
