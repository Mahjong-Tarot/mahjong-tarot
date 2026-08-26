# mahjong-tarot — CLAUDE.md

Bill Hajdu's practice and book website (The Mahjong Tarot). Dave is owner/operator. Next.js app in `website/`; Python book build in `book/`. GitHub: Mahjong-Tarot/mahjong-tarot. Pre-rewrite file (325 lines) archived at `docs/archive/CLAUDE-md-pre-rewrite-2026-08-26.md`.

## Map

- **Design system**: `agents/web-developer/context/web-style-guide.md` (canonical, includes the blog category list); read it before building any component. Brand index: `docs/brand/README.md` (typographic identity, no logo mark). "Cool white + slate ink + Fire red, a printed book's voice on a website."
- **Tokens**: `website/styles/globals.css` `:root`: neutrals `--paper`/`--ink*`/`--rule*`, fire scale `--fire-50..900` (`--fire-500 #E63329` is the brand red), `--gold #B8893A`, luck verdict pairs, fonts Fraunces/Inter/JetBrains Mono, spacing `--space-*`. A legacy remap block keeps old var names alive. Styling is CSS Modules per page in `website/styles/`.
- **Component reference**: `website/components/` (51 files, `.jsx` + colocated `.module.css`): shells (Nav, Footer, AdminShell, MemberShell), domain (AlmanacView, HoroscopeView, BaziChart, FireHorse*), CRM (InquiryKanbanBoard, SalesDetailDrawer). No gallery page; copy from these.
- **Stack**: Next.js 14 Pages Router, React 18, plain JS/JSX (no TypeScript), CSS Modules. Stripe, Anthropic SDK, TipTap, lunar-typescript. ~90 routes under `website/pages/` plus ~25 `pages/api/` routes.
- **Data**: Supabase prod project is always `ntqmddmesgdquatodsyu` (never `nrzxzkjjhktyyukijown`; never ask which DB). Creds in `website/.env.local`; the repo-root `.env.local` is stale and has burned a session before. Supabase MCP does not work here (wrong org): use PostgREST/psql with the service-role key. Migrations: `website/supabase/*.sql` (59 numbered files); almanac seed migrations must be chunked to ~350-385 rows (SQL Editor dies near 1 MB). Static data in `website/data/`.
- **Ship**: PR → merge → Vercel CI/CD (project `mahjong-tarot`, scope `dave-hajdus-projects`). Never `vercel deploy`. Only CI is the daily-horoscope cron workflow; there are no tests or linters, so verify by building. Publish flow: `content/topics/<slug>/` → `build-page` skill → `website/pages/blog/posts/<slug>.jsx` → card at top of `website/pages/blog/index.jsx` → commit → append to `context/general-project-agent-context/publish-log.md`. Details live in `.claude/skills/build-page` and `.claude/skills/mahjong-studio`; don't re-derive them.

## Notes

- Every post needs `<Head>` (title/description/OG/Twitter/canonical) and `next/image`; no inline styles.
- `working_files/` is git-ignored scratch: never commit from it; promote only optimized `.webp`.
- Almanac gotcha: "No almanac record for this date" means a stale auth token, not missing data (`fetchAlmanacForDate` in `website/lib/almanac.js` swallows 401s).
- `book/` builds The Mahjong Mirror (`manuscript.txt` + `blocks.json` → `build.py` → `book.html`); published output is copied to `website/public/book/` and served as an unlisted static page.
- Docs index: `docs/README.md`. Skills: 11 in `.claude/skills/` (mahjong-studio pipeline, writer, build-page, generate-image, notify-social-media, lark-send, resend-email).
