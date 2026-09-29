// The Revenue board: the content calendar as cards. The campaigns entity's
// revenue-content-sync routine files one card per publishing day (a subtask per
// post) and one per AI-writer campaign; moving a card or ticking a post here
// carries back to the calendar (entities/campaigns/lib/revenue-board/writeback.ts).
import type { Metadata } from "next";
import { requireRevenueAccess } from "@/kernel/identity/revenue-access";
import { PageHead } from "@/kernel/ui/PageHead";
import { selectBoardColumns, selectBoards, selectTasks } from "../../../../lib/data";
import { BoardClient, type BoardCard } from "./BoardClient";

export const metadata: Metadata = { title: "Revenue board" };

type ColumnRow = { id: string; name: string; position: number; is_done: boolean; is_not_doing: boolean };
type TaskRow = {
  id: string;
  title: string;
  description: string | null;
  board_column_id: string | null;
  parent_task_id: string | null;
  status: string;
  priority: string;
  due_date: string | null;
  position: number;
  subject_type: string | null;
};

export default async function RevenueBoardPage() {
  await requireRevenueAccess();
  const { data: board, error } = await selectBoards("id, name, description").eq("slug", "revenue").maybeSingle();
  if (error) throw new Error(`[boards] revenue board: ${error.message}`);
  if (!board) {
    return <PageHead title="Revenue board" sub="No Revenue board exists yet (migration 059 seeds it)." />;
  }
  const boardId = board.id as string;
  const [cols, tasks] = await Promise.all([
    selectBoardColumns("id, name, position, is_done, is_not_doing").eq("board_id", boardId).order("position"),
    selectTasks("id, title, description, board_column_id, parent_task_id, status, priority, due_date, position, subject_type")
      .eq("board_id", boardId)
      .is("archived_at", null)
      .order("position"),
  ]);
  if (cols.error) throw new Error(`[boards] columns: ${cols.error.message}`);
  if (tasks.error) throw new Error(`[boards] tasks: ${tasks.error.message}`);

  const rows = (tasks.data ?? []) as unknown as TaskRow[];
  const subtasks = new Map<string, TaskRow[]>();
  for (const t of rows) {
    if (!t.parent_task_id) continue;
    subtasks.set(t.parent_task_id, [...(subtasks.get(t.parent_task_id) ?? []), t]);
  }
  const cards: BoardCard[] = rows
    .filter((t) => !t.parent_task_id && t.board_column_id)
    .map((t) => ({
      id: t.id,
      columnId: t.board_column_id as string,
      title: t.title,
      description: t.description,
      priority: t.priority,
      dueDate: t.due_date,
      subtasks: (subtasks.get(t.id) ?? []).map((s) => ({ id: s.id, title: s.title, done: s.status === "done", notDoing: s.status === "not_doing" })),
    }));
  const columns = ((cols.data ?? []) as unknown as ColumnRow[]).map((c) => ({ id: c.id, label: c.name }));

  return (
    <>
      <PageHead
        title="Revenue board"
        sub="The content calendar as cards: a card per publishing day with a subtask per post, and a card per AI-writer campaign. Tick a post when it is out; move a day to Done when every post on it is out."
      />
      <BoardClient columns={columns} cards={cards} />
    </>
  );
}
