"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { KanbanBoard, type KanbanColumn } from "@/kernel/ui/KanbanBoard";
import { moveCardAction, toggleSubtaskAction } from "./actions";
import styles from "./BoardClient.module.css";

export type BoardCard = {
  id: string;
  columnId: string;
  title: string;
  description: string | null;
  priority: string;
  dueDate: string | null;
  subtasks: { id: string; title: string; done: boolean; notDoing: boolean }[];
};

export function BoardClient({ columns, cards: initial }: { columns: KanbanColumn[]; cards: BoardCard[] }) {
  const router = useRouter();
  const [cards, setCards] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function move(cardId: string, toColumnId: string) {
    const before = cards;
    setCards((cs) => cs.map((c) => (c.id === cardId ? { ...c, columnId: toColumnId } : c)));
    setError(null);
    startTransition(async () => {
      const r = await moveCardAction(cardId, toColumnId);
      if (!r.ok) {
        setCards(before);
        setError(r.error);
      }
      router.refresh();
    });
  }

  function tick(cardId: string, subtaskId: string, done: boolean) {
    setCards((cs) =>
      cs.map((c) => (c.id === cardId ? { ...c, subtasks: c.subtasks.map((s) => (s.id === subtaskId ? { ...s, done } : s)) } : c)),
    );
    setError(null);
    startTransition(async () => {
      const r = await toggleSubtaskAction(subtaskId, done);
      if (!r.ok) setError(r.error);
      router.refresh();
    });
  }

  return (
    <>
      {error && <p className="admin-alert admin-alert--err">{error}</p>}
      {cards.length === 0 && (
        <p className="admin-page-sub u-mt-1">
          No cards yet. The revenue-content-sync routine files a card for each day in the content calendar.
        </p>
      )}
      <KanbanBoard
        columns={columns}
        cards={cards}
        disabled={pending}
        dragHandle
        onMove={move}
        cardLabel={(c) => c.title}
        renderCard={(c) => (
          <div>
            <strong>{c.title}</strong>
            {c.dueDate && <div className="admin-cell-muted">{c.dueDate}</div>}
            {c.description && <p className="admin-cell-muted">{c.description}</p>}
            {c.subtasks.length > 0 && (
              <ul className={styles.subtasks}>
                {c.subtasks.map((s) => (
                  <li key={s.id}>
                    <label className={s.notDoing ? styles.subtaskDropped : styles.subtask}>
                      <input
                        type="checkbox"
                        checked={s.done}
                        disabled={pending || s.notDoing}
                        onChange={(e) => tick(c.id, s.id, e.target.checked)}
                      />
                      <span>{s.title}</span>
                    </label>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      />
    </>
  );
}
