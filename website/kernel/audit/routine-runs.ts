import { AsyncLocalStorage } from "node:async_hooks";
import { randomUUID } from "node:crypto";
import { companyOs } from "@/kernel/data/supabase";
import type { TablesUpdate } from "@/kernel/data/supabase/database.types";
import { notifyOps } from "@/kernel/messaging/lark";
import { tickForRequest } from "./routine-tick";

// Run log for scheduled routines. Every Vercel cron wraps its handler in
// withRoutineRun, which claims the run's tick (opening a `running`
// company_os.routine_runs row before any work, Y.6), runs the handler, and
// closes the row with the outcome, the handler's JSON body and the AI
// tokens spent while it ran. Token attribution rides on AsyncLocalStorage:
// kernel/ai/response.ts reports every model call's usage into whichever run is
// active on the current async chain, so no handler has to thread a run id
// through its code. The kernel owns the table; the Settings -> Agents page
// reads it through the list helpers below. Recording is best-effort: a failed
// insert or update is logged and never changes what the routine returns.

/**
 * The usage shape both `messages.create` and a stream's final message carry.
 * It lives here rather than in kernel/ai/response.ts because it describes what
 * a run records; keeping it there made the two modules import each other.
 */
export interface AiUsage {
  input_tokens: number;
  output_tokens: number;
  cache_read_input_tokens?: number | null;
  cache_creation_input_tokens?: number | null;
}

export type RoutineHost = "vercel" | "mac-mini";
export type RoutineRunStatus = "running" | "waiting" | "ok" | "skipped" | "error" | "died";

export type RoutineRun = {
  id: string;
  routine_id: string;
  host: RoutineHost;
  status: RoutineRunStatus;
  started_at: string;
  finished_at: string | null;
  duration_ms: number | null;
  summary: string | null;
  result: unknown;
  error: string | null;
  log: string | null;
  ai_calls: number;
  ai_input_tokens: number;
  ai_output_tokens: number;
  ai_cache_read_tokens: number;
  ai_cache_write_tokens: number;
  // Since Y.6 (null on rows written before it): the tick the run claimed, and
  // when its current step must have finished before the reaper marks it died.
  tick_key: string | null;
  step_deadline_at: string | null;
  mode: "shadow" | "live";
  attempt: number;
};

type RunContext = {
  aiCalls: number;
  aiInput: number;
  aiOutput: number;
  aiCacheRead: number;
  aiCacheWrite: number;
};

const storage = new AsyncLocalStorage<RunContext>();

/** Called by kernel/ai/response.ts for every model call; a no-op outside a run. */
export function recordAiUsage(usage: AiUsage | null | undefined): void {
  const ctx = storage.getStore();
  if (!ctx || !usage) return;
  ctx.aiCalls += 1;
  ctx.aiInput += usage.input_tokens ?? 0;
  ctx.aiOutput += usage.output_tokens ?? 0;
  ctx.aiCacheRead += usage.cache_read_input_tokens ?? 0;
  ctx.aiCacheWrite += usage.cache_creation_input_tokens ?? 0;
}

// A one-line summary from the handler's JSON: its scalar counters, in order.
// "dueForReview 2, emailsSent 2" says more at a glance than the raw body.
export function summarizeResult(body: unknown): string | null {
  if (!body || typeof body !== "object") return null;
  const parts: string[] = [];
  for (const [k, v] of Object.entries(body as Record<string, unknown>)) {
    // The run's own status column says ok or skipped; repeating it here would
    // push a counter out of the six the line has room for.
    if (k === "status") continue;
    if (typeof v === "number" || typeof v === "boolean") parts.push(`${k} ${v}`);
    else if (typeof v === "string" && v.length <= 80 && k !== "error") parts.push(`${k} ${v}`);
    if (parts.length >= 6) break;
  }
  return parts.length ? parts.join(", ") : null;
}

/** True when the request carries the Vercel Cron bearer (Authorization: Bearer $CRON_SECRET). */
export function hasCronBearer(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  return Boolean(secret) && req.headers.get("authorization") === `Bearer ${secret}`;
}

/**
 * Wrap a cron handler: check the Vercel Cron bearer, then record the run. The
 * 401 an unauthorised probe gets is not a run and is not recorded; everything
 * else is. Pass the cron path from vercel.json as the routine id so the Agents
 * page can join runs to schedules.
 */
export async function withRoutineRun(
  routineId: string,
  req: Request,
  handler: (req: Request) => Promise<Response>,
  host: RoutineHost = "vercel",
): Promise<Response> {
  // The bearer gate for every wrapped entry point. Vercel Cron sends
  // Authorization: Bearer $CRON_SECRET; anything else is not a run and is not
  // recorded. It lives here rather than in each handler because every handler
  // carried a byte-identical copy of it, and a copy is how one of them ends up
  // missing the check.
  if (!hasCronBearer(req)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  // Vercel Cron's delivery claims its schedule slot; a run by hand (the
  // runbook's curl, the Mac mini's in-process GET, a POST) claims a tick of its own.
  return recordRoutineRun(routineId, () => handler(req), host, { tick: tickForRequest(routineId, req) });
}

// The longest maxDuration any route declares (entities/*/mounts.ts). A run's
// step deadline is its claim time plus this, so the reaper can never mark a
// function died while Vercel would still let it run.
const DEFAULT_STEP_SECONDS = 300;

/** Only the handler's own word makes a run skipped; a throw or a non-2xx makes it an error. */
function outcomeOf(response: Response, body: unknown): "ok" | "skipped" | "error" {
  if (!response.ok) return "error";
  const status = (body as { status?: unknown } | null)?.status;
  return status === "skipped" ? "skipped" : "ok";
}

export type RecordOptions = {
  /** The tick this run claims: a schedule slot for a cron; omitted, a fresh UUID, for a button. */
  tick?: string;
  /** Seconds the run may take before the reaper marks it died. */
  stepSeconds?: number;
};

type RunOutcome = TablesUpdate<{ schema: "company_os" }, "routine_runs">;

/**
 * Record one execution of a routine without a bearer gate: for work that is
 * already inside an authenticated request (a server action running the writer
 * agent's first step) and still belongs in Settings -> Agents with its tokens.
 * The handler's JSON body becomes the run's result and summary, as for a cron.
 *
 * The row opens before the handler runs (Y.6): claim_tick inserts a `running`
 * row for the tick, and a tick that is already running, waiting, ok or skipped
 * is not run again — the call answers `{ status: "skipped", reason:
 * "tick-taken" }` without calling the handler. The close is fenced to a row
 * still running or waiting, so a run the reaper already marked died stays
 * died and the late result is logged instead. The status is explicit (Y.34):
 * `status: "skipped"` in the body is a skipped run, a throw or a non-2xx is an
 * error, and anything else is ok — a counter named `skipped` is only a counter.
 */
export async function recordRoutineRun(
  routineId: string,
  handler: () => Promise<Response>,
  host: RoutineHost = "vercel",
  opts: RecordOptions = {},
): Promise<Response> {
  const ctx: RunContext = { aiCalls: 0, aiInput: 0, aiOutput: 0, aiCacheRead: 0, aiCacheWrite: 0 };
  const startedAt = new Date();
  const tick = opts.tick ?? randomUUID();

  const claim = await claimTick(routineId, tick, host, opts.stepSeconds ?? DEFAULT_STEP_SECONDS);
  // Until the migration lands the function does not exist. Recording has
  // always been best-effort and must never stop a routine, so a failed claim
  // runs the work and writes one closed row at the end, as before Y.6. That
  // loses the one-run-per-tick guarantee for as long as the claim fails,
  // which is the behaviour every routine had before it existed.
  const runId: string | null = claim.error ? null : claim.id;
  if (claim.error) {
    console.error(`[routine-runs] ${routineId}: tick claim failed, recording at the end: ${claim.error}`);
  } else if (!runId) {
    console.log(`[routine-runs] ${routineId}: tick ${tick} is already taken; not running it again`);
    return Response.json({ status: "skipped", reason: "tick-taken" });
  }

  return storage.run(ctx, async () => {
    let response: Response;
    let failure: string | null = null;
    try {
      response = await handler();
    } catch (err) {
      // Next signals "this route cannot be prerendered" by throwing while it
      // probes the handler at build time. That is not a run: close the claimed
      // row as skipped and let the signal through, or the build records a
      // phantom error and may freeze the probe's response as the route's
      // static output.
      if ((err as { digest?: string })?.digest === "DYNAMIC_SERVER_USAGE") {
        if (runId) {
          await closeRun(routineId, runId, {
            status: "skipped",
            finished_at: new Date().toISOString(),
            summary: "prerender probe, not a run",
          });
        }
        throw err;
      }
      failure = err instanceof Error ? (err.stack ?? err.message) : String(err);
      response = Response.json({ error: failure.split("\n")[0] }, { status: 500 });
    }

    // Read the body off a clone so the caller's response stream is untouched.
    let body: unknown = null;
    try {
      body = await response.clone().json();
    } catch {
      body = null;
    }
    const finishedAt = new Date();
    const status = failure ? ("error" as const) : outcomeOf(response, body);
    const outcome = {
      status,
      finished_at: finishedAt.toISOString(),
      duration_ms: finishedAt.getTime() - startedAt.getTime(),
      summary: failure ? failure.split("\n")[0] : summarizeResult(body),
      result: body as never,
      error: failure ?? ((body as Record<string, unknown> | null)?.error as string | undefined) ?? null,
      ai_calls: ctx.aiCalls,
      ai_input_tokens: ctx.aiInput,
      ai_output_tokens: ctx.aiOutput,
      ai_cache_read_tokens: ctx.aiCacheRead,
      ai_cache_write_tokens: ctx.aiCacheWrite,
    };
    if (runId) {
      await closeRun(routineId, runId, outcome);
    } else {
      const { data, error } = await companyOs
        .from("routine_runs")
        .insert({ routine_id: routineId, host, started_at: startedAt.toISOString(), log: null, ...outcome })
        .select("id")
        .single();
      if (error) console.error(`[routine-runs] ${routineId}: ${error.message}`);
      else console.log(`[routine-runs] ${routineId}: ${status} run ${data.id}`);
    }
    if (status === "error") {
      await alertOnRepeatedFailure(routineId, runId, startedAt, outcome.error ?? outcome.summary ?? "unknown error");
    }
    return response;
  });
}

// The claim, with a throw folded into the error arm: a client that throws
// (a network failure, or a test double without rpc) must not stop the run
// any more than a returned error does.
async function claimTick(
  routineId: string,
  tick: string,
  host: RoutineHost,
  stepSeconds: number,
): Promise<{ id: string | null; error: null } | { id: null; error: string }> {
  try {
    const { data, error } = await companyOs.rpc("claim_tick", {
      p_routine: routineId,
      p_tick: tick,
      p_mode: "live",
      p_host: host,
      p_step_s: stepSeconds,
    });
    if (error) return { id: null, error: error.message };
    return { id: data ?? null, error: null };
  } catch (err) {
    return { id: null, error: err instanceof Error ? err.message : String(err) };
  }
}

// The fenced close: only a row still running or waiting takes the outcome.
// Zero rows means the reaper marked the run died while it worked, and the
// late result is logged rather than applied, so `died` stays the record.
async function closeRun(routineId: string, runId: string, outcome: RunOutcome): Promise<void> {
  const { data, error } = await companyOs
    .from("routine_runs")
    .update(outcome)
    .eq("id", runId)
    .in("status", ["running", "waiting"])
    .select("id");
  if (error) {
    console.error(`[routine-runs] ${routineId}: closing run ${runId} failed: ${error.message}`);
  } else if (!data || data.length === 0) {
    console.warn(
      `[routine-runs] ${routineId}: late result for run ${runId}, which is no longer running; not applied: ${outcome.status} ${outcome.summary ?? ""}`,
    );
  } else {
    console.log(`[routine-runs] ${routineId}: ${outcome.status} run ${runId}`);
  }
}

// The states a finished run can be in. Running and waiting rows are runs in
// progress, not outcomes, so a failure streak never counts them.
const OUTCOMES: RoutineRunStatus[] = ["ok", "skipped", "error", "died"];
const isFailure = (status: string | undefined) => status === "error" || status === "died";

/**
 * Post to the Operations chat when a routine has now failed twice in a row,
 * and only then: the second failure of a streak alerts, later ones stay quiet,
 * and a success in between starts a new streak. An error and a died run both
 * count as failures. One failed run is noise (a Lark hiccup, a cold start);
 * two on consecutive schedules is an outage, which is what the daily coaching
 * cycle was for five days in September 2026 with nobody reading the run
 * table. Best-effort, like the recording itself.
 */
async function alertOnRepeatedFailure(routineId: string, runId: string | null, startedAt: Date, failure: string): Promise<void> {
  try {
    // Test doubles for the run recorder often stub only insert; without a
    // reader there is no streak to judge, and that is not an error.
    const table = companyOs.from("routine_runs") as { select?: unknown };
    if (typeof table.select !== "function") return;
    let query = companyOs
      .from("routine_runs")
      .select("status")
      .eq("routine_id", routineId)
      .in("status", OUTCOMES)
      // Runs before this one, so this run's own row never counts twice.
      .lt("started_at", startedAt.toISOString());
    if (runId) query = query.neq("id", runId);
    const { data, error } = await query.order("started_at", { ascending: false }).limit(2);
    if (error) {
      console.error(`[routine-runs] ${routineId}: streak read failed: ${error.message}`);
      return;
    }
    // This run is failure number one. The previous run makes it a streak of
    // two; the one before that decides whether the streak is new.
    const previous = ((data ?? []) as { status: string }[]).map((r) => r.status);
    const secondOfStreak = isFailure(previous[0]) && !isFailure(previous[1]);
    if (!secondOfStreak) return;
    const head = failure.split("\n")[0].slice(0, 300);
    await notifyOps(
      `Routine ${routineId} has failed on its last two runs.\n${head}\nSee Settings -> Agents for the run log.`,
    );
  } catch (err) {
    console.error(`[routine-runs] ${routineId}: alert failed`, err);
  }
}

/**
 * Latest run per routine, for the Agents list: one indexed read per routine
 * (routine_runs_routine_started_idx). It used to take the newest 2000 rows of
 * the whole table, which the five-minute reaper and the fifteen-minute send
 * crons fill in a few days, so a weekly routine read as "Never run".
 */
export async function latestRunsByRoutine(routineIds: string[]): Promise<Map<string, RoutineRun>> {
  const reads = await Promise.all(
    routineIds.map((id) =>
      companyOs.from("routine_runs").select("*").eq("routine_id", id).order("started_at", { ascending: false }).limit(1),
    ),
  );
  const latest = new Map<string, RoutineRun>();
  for (const { data, error } of reads) {
    if (error) throw new Error(`routine_runs: ${error.message}`);
    const row = (data ?? [])[0] as RoutineRun | undefined;
    if (row) latest.set(row.routine_id, row);
  }
  return latest;
}

/** AI tokens spent per routine over the trailing window (days). */
export async function aiTokensByRoutine(days: number): Promise<Map<string, { calls: number; input: number; output: number }>> {
  const since = new Date(Date.now() - days * 86_400_000).toISOString();
  const { data, error } = await companyOs
    .from("routine_runs")
    .select("routine_id, ai_calls, ai_input_tokens, ai_output_tokens")
    .gte("started_at", since)
    // A run with no model calls adds nothing to any sum, and most runs make
    // none (the reaper alone writes 288 a day), so leaving them out keeps the
    // window's AI runs inside the row limit.
    .gt("ai_calls", 0)
    .limit(5000);
  if (error) throw new Error(`routine_runs: ${error.message}`);
  const out = new Map<string, { calls: number; input: number; output: number }>();
  for (const r of data ?? []) {
    const t = out.get(r.routine_id) ?? { calls: 0, input: 0, output: 0 };
    t.calls += r.ai_calls;
    t.input += Number(r.ai_input_tokens);
    t.output += Number(r.ai_output_tokens);
    out.set(r.routine_id, t);
  }
  return out;
}

export async function listRoutineRuns(routineId: string, limit = 100): Promise<RoutineRun[]> {
  const { data, error } = await companyOs
    .from("routine_runs")
    .select("*")
    .eq("routine_id", routineId)
    .order("started_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(`routine_runs: ${error.message}`);
  return (data ?? []) as RoutineRun[];
}
