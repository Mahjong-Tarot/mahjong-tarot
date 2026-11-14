import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button, ErrorNote, Field, Segmented } from './ui';
import { color, font } from '../lib/theme';

const pad = (n) => String(n).padStart(2, '0');

// Same fields as the website's chart form (components/ChartForm.jsx):
// birth date, optional birth time, and gender when a time is given
// (Purple Star needs both).
export function validateBirth({ day, month, year, time, gender }) {
  const d = Number(day); const m = Number(month); const y = Number(year);
  const thisYear = new Date().getFullYear();
  if (!d || !m || !y || String(year).length !== 4) return { error: 'Enter your birth day, month and year.' };
  const dt = new Date(Date.UTC(y, m - 1, d));
  if (y < 1901 || y > thisYear || dt.getUTCMonth() !== m - 1 || dt.getUTCDate() !== d || dt.getTime() > Date.now()) {
    return { error: 'Enter a real birth date between 1901 and today.' };
  }
  let t = null;
  const raw = String(time || '').trim();
  if (raw) {
    const match = /^(\d{1,2})[:.]?(\d{2})$/.exec(raw);
    if (!match || Number(match[1]) > 23 || Number(match[2]) > 59) return { error: 'Enter the birth time as HH:MM, for example 07:30.' };
    t = `${pad(match[1])}:${match[2]}`;
    if (!gender) return { error: 'With a birth time, choose female or male (Purple Star needs it).' };
  }
  return { birth: { date: `${y}-${pad(m)}-${pad(d)}`, time: t, gender: t ? gender : (gender || null) } };
}

export default function BirthForm({ initial, submitLabel = 'See my chart', onSubmit, busy }) {
  const [y0, m0, d0] = (initial?.date || '').split('-');
  const [day, setDay] = useState(d0 ? String(Number(d0)) : '');
  const [month, setMonth] = useState(m0 ? String(Number(m0)) : '');
  const [year, setYear] = useState(y0 || '');
  const [time, setTime] = useState(initial?.time || '');
  const [gender, setGender] = useState(initial?.gender || null);
  const [error, setError] = useState(null);

  const submit = () => {
    const res = validateBirth({ day, month, year, time, gender });
    if (res.error) { setError(res.error); return; }
    setError(null);
    onSubmit(res.birth);
  };

  return (
    <View style={{ gap: 14 }}>
      <Text style={st.label}>Birth date</Text>
      <View style={st.row}>
        <Field style={st.cell} placeholder="Day" value={day} onChangeText={setDay} keyboardType="number-pad" maxLength={2} accessibilityLabel="Birth day" />
        <Field style={st.cell} placeholder="Month" value={month} onChangeText={setMonth} keyboardType="number-pad" maxLength={2} accessibilityLabel="Birth month (1 to 12)" />
        <Field style={[st.cell, { flex: 1.4 }]} placeholder="Year" value={year} onChangeText={setYear} keyboardType="number-pad" maxLength={4} accessibilityLabel="Birth year" />
      </View>
      <Field label="Birth time" hint="(optional)" placeholder="HH:MM, e.g. 07:30" value={time} onChangeText={setTime} keyboardType="numbers-and-punctuation" maxLength={5} />
      <Text style={st.label}>Gender <Text style={st.hint}>(needed with a birth time)</Text></Text>
      <Segmented options={[{ value: 'f', label: 'Female' }, { value: 'm', label: 'Male' }]} value={gender} onChange={setGender} />
      <ErrorNote>{error}</ErrorNote>
      <Button title={submitLabel} onPress={submit} loading={busy} />
    </View>
  );
}

const st = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8, marginTop: -6 },
  cell: { flex: 1 },
  label: { fontFamily: font.bodyMedium, fontSize: 14, color: color.ink2 },
  hint: { fontFamily: font.body, color: color.ink4 },
});
