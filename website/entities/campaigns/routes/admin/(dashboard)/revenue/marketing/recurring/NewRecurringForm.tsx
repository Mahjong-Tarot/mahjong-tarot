"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useSurfaceBase } from "@/kernel/shell/surface-client";
import { CreateModal } from "@/entities/campaigns/ui/CreateModal";
import { createSeries } from "./actions";
import { createAgent } from "../personal/actions";

// The type comes first, because it decides everything after: a broadcast
// series gets a template and a weekly moment; a personal agent gets sources,
// a skill and a cadence. Both start paused and need only a name and an
// audience to exist.
type Kind = "broadcast" | "personal";

export function NewRecurringForm({ audiences }: { audiences: { id: string; name: string }[] }) {
  const router = useRouter();
  const base = useSurfaceBase();
  const [kind, setKind] = useState<Kind>("broadcast");
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
          <span className="admin-label">Type</span>
          <label className="u-row">
            <input type="radio" name="recurring-kind" checked={kind === "broadcast"} onChange={() => setKind("broadcast")} />
            <span><strong>Broadcast series.</strong> Everyone gets the same issue, filled from a template and approved each week.</span>
          </label>
          <label className="u-row">
            <input type="radio" name="recurring-kind" checked={kind === "personal"} onChange={() => setKind("personal")} />
            <span><strong>Personal agent.</strong> One email per person, written from their facts by a skill you tune, reviewed by sample.</span>
          </label>
        </div>
        <div className="admin-field">
          <label className="admin-label" htmlFor="recurring-new-name">Name</label>
          <input id="recurring-new-name" className="admin-input" value={name} placeholder={kind === "broadcast" ? "Weekly letter" : "Student check-in"} onChange={(e) => setName(e.target.value)} />
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
                const result = kind === "broadcast" ? await createSeries({ name, audienceId }) : await createAgent({ name, audienceId });
                if (result.ok) router.push(`${base}/revenue/marketing/${kind === "broadcast" ? "recurring" : "personal"}/${result.id}`);
                else setError(result.error);
              })
            }
          >
            {pending ? "Creating…" : kind === "broadcast" ? "Create series" : "Create agent"}
          </button>
        </div>
      </div>
    </CreateModal>
  );
}
