// Read by the iPhone app on launch. minBuild comes from MOBILE_MIN_BUILD;
// an installed app whose native build number is lower shows "Please update".
export default function handler(req, res) {
  const minBuild = parseInt(process.env.MOBILE_MIN_BUILD || '0', 10) || 0;
  res.setHeader('Cache-Control', 'public, max-age=300');
  return res.status(200).json({ minBuild });
}
