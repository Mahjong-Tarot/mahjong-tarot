// The slice of edge8-web's boards entity that the campaigns entity's Revenue
// board sync calls. The board itself (tables, screen, card moves) is ported in
// its own change; until then the reads/writes point at company_os tables that do
// not exist yet, landCardAsSystem refuses, and the revenue-content-sync cron is
// not scheduled, so nothing calls these at runtime.
import { companyOsUntyped } from "@/kernel/data/supabase";
import { dateMs } from "@/kernel/config/dates";

type Row = Record<string, unknown>;
type SelectOptions = { head?: boolean; count?: "exact" | "planned" | "estimated" };

export const selectBoards = (columns: string, options?: SelectOptions) =>
  companyOsUntyped.from("boards").select<string, Row>(columns, options);
export const selectBoardColumns = (columns: string) => companyOsUntyped.from("board_columns").select<string, Row>(columns);
export const selectBoardMembers = (columns: string) => companyOsUntyped.from("board_members").select<string, Row>(columns);
export const selectTasks = (columns: string, options?: SelectOptions) =>
  companyOsUntyped.from("tasks").select<string, Row>(columns, options);
export const insertTasks = (row: Record<string, unknown> | Record<string, unknown>[]) =>
  companyOsUntyped.from("tasks").insert(row);
export const updateTasks = (patch: Record<string, unknown>) => companyOsUntyped.from("tasks").update(patch);

export type CardMoveOutcome = { ok: true } | { ok: false; error: string };

export async function landCardAsSystem(_input: { taskId: string; toColumnId: string; label: string }): Promise<CardMoveOutcome> {
  return { ok: false, error: "The Revenue board is not installed yet." };
}

export async function endPosition(boardId: string, columnId: string): Promise<number> {
  const { data, error } = await companyOsUntyped
    .from("tasks")
    .select("position")
    .eq("board_id", boardId)
    .eq("board_column_id", columnId)
    .order("position", { ascending: false })
    .limit(1);
  if (error) throw new Error(error.message);
  const top = (data?.[0] as { position?: number } | undefined)?.position ?? 0;
  return top + 1;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function dayLabel(iso: string): string {
  const d = new Date(dateMs(iso));
  return `${WEEKDAYS[d.getUTCDay()]} ${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}`;
}
