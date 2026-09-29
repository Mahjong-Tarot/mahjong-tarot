import { NextResponse } from "next/server";
import { withRoutineRun } from "@/kernel/audit/routine-runs";
import { saigonToday } from "@/kernel/config/dates";
import { loadContentBoard } from "@/entities/campaigns/lib/revenue-board/board";
import { syncAgentCards } from "@/entities/campaigns/lib/revenue-board/sync-agents";
import { syncContentDays } from "@/entities/campaigns/lib/revenue-board/sync-days";

/**
 * The Vercel cron schedule this routine runs on. Declared here, beside the
 * routine, and written into vercel.json by scripts/gen-deployment.mjs for the
 * entities a deployment installs — an entity left out takes its crons with it.
 * Read as text by the generator, so nothing imports it.
 * @generator
 */
export const schedule = "20 * * * *";

// Vercel cron (see vercel.json): hourly at :20.
// The content calendar on the Revenue board (Dave, 2026-09-24): a card per day
// of posts for the board's owner with a subtask per post, and a card per
// campaign the writer agent runs. Hourly because the writer drafts tomorrow's
// posts during today, and a post the agent publishes should tick itself before
// the evening's closed-cards post reads the board. A person's moves on the
// board reach the calendar at once, through the board's events; this pass is
// the other direction.
async function handler(_req: Request) {
  const loaded = await loadContentBoard();
  if (!loaded.ok) return NextResponse.json({ error: loaded.error }, { status: 500 });
  const board = loaded.board;
  if (!board) return NextResponse.json({ status: "skipped", reason: "no board is marked as the content board" });

  const today = saigonToday();
  const days = await syncContentDays(board, today);
  const agents = await syncAgentCards(board, today);
  const errors = [...days.errors, ...agents.errors];
  const body = { today, days: { ...days, errors: undefined }, agents: { ...agents, errors: undefined } };
  // A 500 is the only thing recordRoutineRun reads as failure, so any card or
  // post that could not be written shows red on Settings → Agents, by name.
  if (errors.length) return NextResponse.json({ ...body, error: errors.join("; ") }, { status: 500 });
  return NextResponse.json(body);
}

// Every scheduled run is recorded in company_os.routine_runs (Settings -> Agents).
export const GET = (req: Request) => withRoutineRun("/api/cron/revenue-content-sync", req, handler);
