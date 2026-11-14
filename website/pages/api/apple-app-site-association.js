// Served at /.well-known/apple-app-site-association (rewrite in
// next.config.js) so links to these paths open the iPhone app when it is
// installed. APPLE_TEAM_ID is the Talent Edge Apple developer team; the
// bundle id matches mobile/app.json.
const BUNDLE_ID = 'com.talentedge.mahjongtarot';
const PATHS = ['/app/*', '/almanac/*', '/chart'];

export default function handler(req, res) {
  const team = process.env.APPLE_TEAM_ID || '';
  const appIDs = team ? [`${team}.${BUNDLE_ID}`] : [];
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  return res.status(200).send(JSON.stringify({
    applinks: {
      details: [{ appIDs, components: PATHS.map((p) => ({ '/': p })) }],
    },
    webcredentials: { apps: appIDs },
  }));
}
