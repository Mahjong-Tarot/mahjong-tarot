"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useSurfaceBase } from "@/kernel/shell/surface-client";
import { CreateModal } from "@/entities/campaigns/ui/CreateModal";
import { createSeries } from "./actions";

// A broadcast series gets a template and a weekly moment. It starts paused and
// needs only a name and an audience to exist.
export function NewRecurringForm({ audiences }: { audiences: { id: string; name: string }[] }) {
  const router = useRouter();
  const base = useSurfaceBase();
  const [name, setName] = useState("");
  const [audienceId, setAudienceId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (audiences.length === 0) {
    return <span className="admin-cell-muted u-sm">Save an audience first, then create something recurring for it.</span>;
  }

  return (
    <CreateModal label="+ New" title="New recurring email">
      <div className="admin-form u-mt-3">
        <div className="admin-field">
          <label className="admin-label" htmlFor="recurring-new-name">Name</label>
          <input id="recurring-new-name" className="admin-input" value={name} placeholder="Weekly letter" onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="admin-field">
          <label className="admin-label" htmlFor="recurring-new-audience">Audience</label>
          <select id="recurring-new-audience" className="admin-input" value={audienceId} onChange={(e) => setAudienceId(e.target.value)}>
            <option value="">Choose a saved audience…</option>
            {audiences.map((a) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
          <div className="admin-hint">It starts paused. Set the rest on its page, then switch it on.</div>
        </div>
        {error && <div className="admin-alert admin-alert--err u-mt-2">{error}</div>}
        <div className="admin-form-actions">
          <button
            type="button"
            className="admin-btn admin-btn--primary"
            disabled={pending || !name.trim() || !audienceId}
            onClick={() =>
              startTransition(async () => {
                setError(null);
                const result = await createSeries({ name, audienceId });
                if (result.ok) router.push(`${base}/revenue/marketing/recurring/${result.id}`);
                else setError(result.error);
              })
            }
          >
            {pending ? "Creating…" : "Create series"}
          </button>
        </div>
      </div>
    </CreateModal>
  );
}
