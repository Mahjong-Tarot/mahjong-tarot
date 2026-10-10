"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/kernel/identity/access-request";
import { landCard, toggleSubtask } from "../../../../lib/moves";

type Result = { ok: true } | { ok: false; error: string };

export async function moveCardAction(taskId: string, toColumnId: string): Promise<Result> {
  const { user } = await requirePermission("boards.revenue");
  const r = await landCard({ taskId, toColumnId, label: user.email });
  revalidatePath("/admin/revenue/board");
  return r;
}

export async function toggleSubtaskAction(subtaskId: string, done: boolean): Promise<Result> {
  const { user } = await requirePermission("boards.revenue");
  const r = await toggleSubtask({ subtaskId, done, label: user.email });
  revalidatePath("/admin/revenue/board");
  return r;
}
