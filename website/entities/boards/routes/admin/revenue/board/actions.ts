"use server";

import { revalidatePath } from "next/cache";
import { requireRevenueAccess } from "@/kernel/identity/revenue-access";
import { landCard, toggleSubtask } from "../../../../lib/moves";

type Result = { ok: true } | { ok: false; error: string };

export async function moveCardAction(taskId: string, toColumnId: string): Promise<Result> {
  const user = await requireRevenueAccess();
  const r = await landCard({ taskId, toColumnId, label: user.email });
  revalidatePath("/admin/revenue/board");
  return r;
}

export async function toggleSubtaskAction(subtaskId: string, done: boolean): Promise<Result> {
  const user = await requireRevenueAccess();
  const r = await toggleSubtask({ subtaskId, done, label: user.email });
  revalidatePath("/admin/revenue/board");
  return r;
}
