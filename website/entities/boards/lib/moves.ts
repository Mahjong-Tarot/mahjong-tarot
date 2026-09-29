// Card moves and subtask ticks on a board. A slimmed copy of edge8-web's
// entities/boards land-card and subtask toggle: the row changes, the stage log,
// the audit row, then the fact is published (board.card.landed,
// board.subtask.toggled) for the campaigns entity to carry to the calendar.
import { companyOs } from "@/kernel/data/supabase";
import { recordAudit } from "@/kernel/audit/audit";
import { publish } from "@/kernel/events";
import { endPosition } from "./data";

export type CardMoveOutcome = { ok: true } | { ok: false; error: string };

type Status = "open" | "done" | "not_doing";

const statusFor = (col: { is_done: boolean; is_not_doing: boolean }): Status =>
  col.is_done ? "done" : col.is_not_doing ? "not_doing" : "open";

/** Land a card in a column of its own board, as `label` (a person's email or a routine's name). */
export async function landCard(input: { taskId: string; toColumnId: string; label: string }): Promise<CardMoveOutcome> {
  const { data: task, error: taskErr } = await companyOs
    .from("tasks")
    .select("id, title, board_id, board_column_id, status, completed_at, subject_type, subject_id, assignee_id, boards:boards!board_id(slug)")
    .eq("id", input.taskId)
    .maybeSingle();
  if (taskErr) return { ok: false, error: taskErr.message };
  if (!task) return { ok: false, error: "That card no longer exists." };
  if (!task.board_id) return { ok: false, error: "That card is not on a board." };
  if (task.board_column_id === input.toColumnId) return { ok: true };

  const { data: col, error: colErr } = await companyOs
    .from("board_columns")
    .select("id, is_done, is_not_doing")
    .eq("id", input.toColumnId)
    .eq("board_id", task.board_id)
    .maybeSingle();
  if (colErr) return { ok: false, error: colErr.message };
  if (!col) return { ok: false, error: "That column is not on the card's board." };

  const status = statusFor(col);
  const position = await endPosition(task.board_id, input.toColumnId);
  const { error: moveErr } = await companyOs
    .from("tasks")
    .update({
      board_column_id: input.toColumnId,
      status,
      position,
      completed_at: status === "done" ? task.completed_at ?? new Date().toISOString() : null,
    })
    .eq("id", input.taskId);
  if (moveErr) return { ok: false, error: moveErr.message };

  const { error: logErr } = await companyOs.from("task_stage_log").insert({
    task_id: input.taskId,
    from_column_id: task.board_column_id,
    to_column_id: input.toColumnId,
    note: `Moved by ${input.label}`,
  });
  if (logErr) console.error("[boards] stage log:", logErr.message);
  await recordAudit({
    table: "tasks",
    recordId: input.taskId,
    operation: "update",
    actor: input.label,
    oldData: { board_column_id: task.board_column_id, status: task.status },
    newData: { board_column_id: input.toColumnId, status },
  });

  const board = Array.isArray(task.boards) ? task.boards[0] : task.boards;
  await publish("board.card.landed", {
    taskId: input.taskId,
    boardSlug: board?.slug ?? "board",
    status,
    subjectType: task.subject_type,
    subjectId: task.subject_id,
    title: task.title,
    assigneeId: task.assignee_id,
  });
  return { ok: true };
}

/** A routine moving a card (edge8's name for the same landing, with no person). */
export async function landCardAsSystem(input: { taskId: string; toColumnId: string; label: string }): Promise<CardMoveOutcome> {
  return landCard(input);
}

/** Tick or untick a subtask. */
export async function toggleSubtask(input: { subtaskId: string; done: boolean; label: string }): Promise<CardMoveOutcome> {
  const { data: sub, error } = await companyOs
    .from("tasks")
    .select("id, title, parent_task_id, subject_type, subject_id, parent:tasks!parent_task_id(title, assignee_id, boards:boards!board_id(slug))")
    .eq("id", input.subtaskId)
    .maybeSingle();
  if (error) return { ok: false, error: error.message };
  if (!sub) return { ok: false, error: "That subtask no longer exists." };

  const { error: upErr } = await companyOs
    .from("tasks")
    .update({ status: input.done ? "done" : "open", completed_at: input.done ? new Date().toISOString() : null })
    .eq("id", input.subtaskId);
  if (upErr) return { ok: false, error: upErr.message };
  await recordAudit({
    table: "tasks",
    recordId: input.subtaskId,
    operation: "update",
    actor: input.label,
    newData: { status: input.done ? "done" : "open" },
  });

  const parent = (Array.isArray(sub.parent) ? sub.parent[0] : sub.parent) as
    | { title: string; assignee_id: string | null; boards: { slug: string } | { slug: string }[] | null }
    | null;
  const board = parent ? (Array.isArray(parent.boards) ? parent.boards[0] : parent.boards) : null;
  await publish("board.subtask.toggled", {
    subtaskId: input.subtaskId,
    parentTaskId: sub.parent_task_id,
    done: input.done,
    subjectType: sub.subject_type,
    subjectId: sub.subject_id,
    title: sub.title,
    assigneeId: parent?.assignee_id ?? null,
    parentTitle: parent?.title ?? null,
    ...(board?.slug ? { boardSlug: board.slug } : {}),
  });
  return { ok: true };
}
