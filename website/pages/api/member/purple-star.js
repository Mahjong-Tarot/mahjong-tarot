// Purple Star reading for the iPhone app. The website builds the same HTML
// client-side in pages/member/dashboard/readings/purple-star.jsx; the app
// cannot run that page, so it asks here with its Bearer token and shows the
// returned HTML documents in a WebView.
//
// GET → { name, full, palaces: [{ key, label, html }] }
//     or 422 { needs: ['birthday' | 'birth_time' | 'gender'] }

import { requireBearer } from '../../../lib/bearer';
import { data } from '../../../lib/ps/data.mjs';
import { scoreChart, buildFullReport, buildPalaceReading, PALACE_LABEL } from '../../../lib/ps/engine.mjs';
import { buildChartFromBirth, chineseAge } from '../../../lib/ps/chart.mjs';
import { renderFullReport, renderPalaceReading } from '../../../lib/ps/render.mjs';

const toSolar = (d) => d.split('-').map(Number).join('-');
const toHour = (t) => (t ? parseInt(String(t).split(':')[0], 10) : null);

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const auth = await requireBearer(req);
  if (!auth.ok) return res.status(auth.status).json({ error: auth.error });

  const { data: profile, error } = await auth.supabase
    .from('profiles')
    .select('name, birthday, birth_time, gender')
    .eq('user_id', auth.user.id)
    .maybeSingle();
  if (error) return res.status(500).json({ error: 'Could not load your profile.' });

  const needs = ['birthday', 'birth_time', 'gender'].filter((k) => !profile?.[k]);
  if (needs.length) return res.status(422).json({ needs });

  try {
    const chart = buildChartFromBirth({
      solarDate: toSolar(profile.birthday),
      hour: toHour(profile.birth_time),
      gender: profile.gender === 'F' ? 'female' : 'male',
    }, data);
    chart.name = (profile.name || 'Your').split(' ')[0];
    chart.currentAge = chineseAge(toSolar(profile.birthday));
    scoreChart(chart, data);
    const full = renderFullReport(chart, buildFullReport(chart, data));
    const palaces = Object.keys(PALACE_LABEL).map((key) => ({
      key,
      label: PALACE_LABEL[key],
      html: renderPalaceReading(chart, buildPalaceReading(chart, key, data)),
    }));
    res.setHeader('Cache-Control', 'private, no-store');
    return res.status(200).json({ name: chart.name, full, palaces });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('member/purple-star: build failed', err);
    return res.status(500).json({ error: 'We could not build your Purple Star reading.' });
  }
}
