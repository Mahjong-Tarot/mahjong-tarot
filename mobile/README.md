# The Mahjong Tarot iPhone app

Expo (React Native) in plain JavaScript, iPhone only. Plan: `website/public/plans/mobile-app-plan.html`
(live at `/plans/mobile-app-plan.html`). Follows the shared mobile standard (Expo, Talent Edge Apple
account, cloud builds only).

## What it does

| Tab | Free / member | Data |
|---|---|---|
| Today | Free | `almanac_days` (Supabase anon read), personal line from `website/lib/bazi.js` |
| My Chart | Free | `POST /api/chart` (same as the website's `/chart`) |
| Reports | Members | Purple Star: `GET /api/member/purple-star` (Bearer). Relationship: `POST /api/compatibility` + `readings` table |
| Me | Both | `profiles`, `member_subscriptions`, `POST /api/account/delete` (Bearer) |

Sign-up starts the 90-day free trial with the same `supabase.auth.signUp` call as the website
(`signup_source: 'app'`). Payment stays on the website (`/membership`); the app never takes money.

Shared code is imported from `../website/lib` (see `metro.config.js`), not copied.

## Run the layout preview

```
cd mobile && npm install && npx expo start --web
```

The web preview is only for checking screens; `/api/*` calls go through the dev server to the live
website. The real app is built in the cloud (below).

## Builds and releases

Never build on a Mac. Everything runs on EAS from `.github/workflows/mobile.yml`:

- Push to `main` that touches `mobile/` → `eas update` to the `production` channel (JavaScript fixes).
- Actions → "iPhone app" → Run workflow with **build** ticked → `eas build` + submit to TestFlight.
- To force old installs to update after a native change, raise `MOBILE_MIN_BUILD` in Vercel to the
  new build number.

## One-time setup (Dave)

1. **Expo:** done. The app is `@edge8ai/mahjong-tarot` (owner `edge8ai`); `app.json` has its project id
   and update URL, and the `EXPO_TOKEN` GitHub secret is set.
2. **EAS environment variables:** done for production and preview (`EXPO_PUBLIC_SUPABASE_URL`,
   `EXPO_PUBLIC_SUPABASE_ANON_KEY`, `EXPO_PUBLIC_SITE_URL`). Add `EXPO_PUBLIC_APP_STORE_URL` after launch.
3. **Apple:** in App Store Connect (Talent Edge team) create the app with bundle id
   `com.talentedge.mahjongtarot`. The first `eas build` asks to connect the Apple account and
   creates the certificates; after that builds run unattended.
4. **Vercel:** set `APPLE_TEAM_ID` (Talent Edge team id) so
   `/.well-known/apple-app-site-association` lists the app. `MOBILE_MIN_BUILD` defaults to 0.
5. **Supabase:** Auth → URL Configuration → Redirect URLs, add
   `https://www.mahjongtarot.com/app/auth-callback` (magic links and confirm emails from the app).

## v1.1

Daily almanac push (Expo push service, shared `push_devices` table, `EXPO_ACCESS_TOKEN`), and the
Four Pillars, Three Blessings and Fire Horse reports.
