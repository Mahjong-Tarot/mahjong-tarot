import { NextResponse } from "next/server";
import { withRoutineRun } from "@/kernel/audit/routine-runs";
import { openDueIssues } from "@/entities/campaigns/lib/series";

/**
 * The Vercel cron schedule this routine runs on. Declared here, beside the
 * routine, and written into vercel.json by scripts/gen-deployment.mjs for the
 * entities a deployment installs — an entity left out takes its crons with it.
 * Read as text by the generator, so nothing imports it.
 * @generator
 */
export const schedule = "0 0 * * *";

// Vercel cron: daily at 00:00 UTC (07:00 Asia/Ho_Chi_Minh). Opens each active series' issue for the week once its
// draft moment has passed, as a draft broadcast for the series' saved audience,
// scheduled for the series' send moment, with the recipient list already built.
// Once a day is enough: a series' draft moment is a day, not an hour, and the
// unique (series_id, scheduled_at) index makes every later run that week a no-op.
// Nothing here sends: an issue sends only after a person approves it.

async function handler(): Promise<Response> {
  const { opened, error } = await openDueIssues();
  if (error) return NextResponse.json({ error }, { status: 500 });
  const failed = opened.filter((o) => o.error);
  return NextResponse.json({ opened, failed: failed.length }, { status: failed.length ? 500 : 200 });
}

export const GET = (req: Request): Promise<Response> => withRoutineRun("/api/cron/email-series-draft", req, handler);
