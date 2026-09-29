// Reads and writes of the board tables (migration 059), under edge8-web's
// boards-door names so the campaigns entity's Revenue board sync ports as is.
import { companyOs } from "@/kernel/data/supabase";
import type { TablesInsert, TablesUpdate } from "@/kernel/data/supabase/database.types";

type Row = Record<string, unknown>;
type SelectOptions = { head?: boolean; count?: "exact" | "planned" | "estimated" };

export const selectBoards = (columns: string, options?: SelectOptions) =>
  companyOs.from("boards").select<string, Row>(columns, options);
export const selectBoardColumns = (columns: string) => companyOs.from("board_columns").select<string, Row>(columns);
export const selectBoardMembers = (columns: string) => companyOs.from("board_members").select<string, Row>(columns);
export const selectTasks = (columns: string, options?: SelectOptions) =>
  companyOs.from("tasks").select<string, Row>(columns, options);
export const insertTasks = (row: TablesInsert<{ schema: "company_os" }, "tasks"> | TablesInsert<{ schema: "company_os" }, "tasks">[]) =>
  companyOs.from("tasks").insert(row);
export const updateTasks = (patch: TablesUpdate<{ schema: "company_os" }, "tasks">) => companyOs.from("tasks").update(patch);

// The next position at the bottom of a column (serialised in the database).
export async function endPosition(boardId: string, columnId: string): Promise<number> {
  const { data, error } = await companyOs.rpc("append_task_position", { p_board_id: boardId, p_column_id: columnId });
  if (error) throw new Error(`[boards] append_task_position: ${error.message}`);
  return data as number;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "Tue 29 Sep" for a YYYY-MM-DD date, read in UTC so no time zone shifts it. */
export function dayLabel(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  return `${WEEKDAYS[d.getUTCDay()]} ${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}`;
}
