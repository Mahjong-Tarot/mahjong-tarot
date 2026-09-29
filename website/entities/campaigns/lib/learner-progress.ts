// Learner progress from the AI Officer Institute learning platform (AIOlabz),
// for the personal sections of a broadcast and the weekly issue template.
//
// Read through the platform's PostgREST with its service key, the same access the
// team certifications sync uses. Read-only; nothing from the platform is stored
// here. People are matched by email, case-insensitively. Every read returns null
// on any failure, and callers decide what a missing answer means for a send.
//
// Internal to Edge8 (entities.manifest.json internalPaths): the fork overlay
// replaces this file with a stub that knows no platform.

const SITE = "https://www.aiolabz.com";

export type LearnerTrack = { title: string; completed: number; total: number; complete: boolean; coachingAttended: number; coachingRequired: number };
export type Learner = { tracks: LearnerTrack[]; passedCourseIds: Set<string> };
export type MicroSession = { id: string; title: string; url: string };
export type LearnerData = { byEmail: Map<string, Learner>; microSessions: MicroSession[]; startUrl: string };

function platform(): { url: string; key: string } | null {
  const url = process.env.AIOLABZ_SUPABASE_URL?.replace(/\/$/, "");
  const key = process.env.AIOLABZ_SUPABASE_SERVICE_KEY;
  return url && key ? { url, key } : null;
}

async function get<T>(p: { url: string; key: string }, path: string): Promise<T> {
  const res = await fetch(`${p.url}/rest/v1/${path}`, { headers: { apikey: p.key, Authorization: `Bearer ${p.key}` }, cache: "no-store" });
  if (!res.ok) throw new Error(`learning platform ${path.split("?")[0]} responded ${res.status}`);
  return (await res.json()) as T;
}

const CHUNK = 50;
const chunks = <T,>(xs: T[]): T[][] => Array.from({ length: Math.ceil(xs.length / CHUNK) }, (_, i) => xs.slice(i * CHUNK, (i + 1) * CHUNK));

export async function loadLearners(emails: string[]): Promise<LearnerData | null> {
  const p = platform();
  if (!p) return null;
  const wanted = new Set(emails.map((e) => e.toLowerCase()));
  try {
    const users: { id: string; email: string }[] = [];
    for (const group of chunks([...wanted])) {
      // ilike, because the platform keeps emails as typed ("GM@…"); the exact
      // match is re-checked below since ilike treats _ as a wildcard.
      const or = group.map((e) => `email.ilike."${e.replace(/"/g, "")}"`).join(",");
      users.push(...(await get<{ id: string; email: string }[]>(p, `app_user?select=id,email&or=(${encodeURIComponent(or)})`)));
    }
    const matched = users.filter((u) => wanted.has(u.email.toLowerCase()));
    const byId = new Map(matched.map((u) => [u.id, u.email.toLowerCase()]));
    const byEmail = new Map<string, Learner>();
    for (const email of byId.values()) byEmail.set(email, { tracks: [], passedCourseIds: new Set() });

    for (const group of chunks([...byId.keys()])) {
      const ids = `(${group.join(",")})`;
      const [progress, credits] = await Promise.all([
        get<{ user_id: string; completed: number; total_published: number; complete: boolean; coaching_attended: number; coaching_required: number; certification: { title: string } | null }[]>(
          p,
          `v_certification_progress?select=user_id,completed,total_published,complete,coaching_attended,coaching_required,certification(title)&user_id=in.${ids}`,
        ),
        get<{ user_id: string; course_id: string }[]>(p, `elective_credit?select=user_id,course_id&user_id=in.${ids}`),
      ]);
      for (const r of progress) {
        const learner = byEmail.get(byId.get(r.user_id) ?? "");
        learner?.tracks.push({
          title: r.certification?.title ?? "certification",
          completed: r.completed,
          total: r.total_published,
          complete: r.complete,
          coachingAttended: r.coaching_attended,
          coachingRequired: r.coaching_required,
        });
      }
      for (const c of credits) byEmail.get(byId.get(c.user_id) ?? "")?.passedCourseIds.add(c.course_id);
    }

    const sessions = await get<{ id: string; title: string }[]>(p, "course?select=id,title&type=eq.micro_session&status=eq.published&order=display_order");
    return {
      byEmail,
      microSessions: sessions.map((s) => ({ id: s.id, title: s.title, url: `${SITE}/micro-sessions/${s.id}` })),
      startUrl: SITE,
    };
  } catch (err) {
    console.error("[campaigns/learner-progress]", err instanceof Error ? err.message : String(err));
    return null;
  }
}

// The first scheduled live coaching session at or after `after`.
export async function nextCoaching(after: Date): Promise<{ at: string; signupUrl: string } | null> {
  const p = platform();
  if (!p) return null;
  try {
    const rows = await get<{ scheduled_at: string }[]>(
      p,
      `live_event?select=scheduled_at&event_type=eq.coaching&status=eq.scheduled&scheduled_at=gte.${encodeURIComponent(after.toISOString())}&order=scheduled_at&limit=1`,
    );
    return rows[0] ? { at: rows[0].scheduled_at, signupUrl: `${SITE}/coaching` } : null;
  } catch (err) {
    console.error("[campaigns/learner-progress] coaching", err instanceof Error ? err.message : String(err));
    return null;
  }
}
