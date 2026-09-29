"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useSurfaceBase } from "@/kernel/shell/surface-client";
import type { AgentRow, SourceKey } from "@/entities/campaigns/lib/personal/types";
import { SOURCE_KEYS, SOURCE_LABEL } from "@/entities/campaigns/lib/personal/types";
import type { BrandOption } from "@/entities/campaigns/lib/marketing-calendar-shared";
import { ConfirmButton } from "@/kernel/ui/ConfirmButton";
import { deleteAgent, runAgentNow, setAgentActive, updateAgent } from "../actions";

// The agent's context (which sources it may read) and rhythm (audience, brand,
// sender, cadence, send hour, review mode). The skill has its own panel
// because it is versioned and this is not.
type Note = { tone: "ok" | "err"; text: string } | null;
const HOURS = Array.from({ length: 24 }, (_, h) => h);

export function AgentEditor({ agent, audiences, brands }: { agent: AgentRow; audiences: { id: string; name: string }[]; brands: BrandOption[] }) {
  const router = useRouter();
  const base = useSurfaceBase();
  const [pending, startTransition] = useTransition();
  const [note, setNote] = useState<Note>(null);
  const [form, setForm] = useState({
    name: agent.name,
    audienceId: agent.audienceId,
    brandId: agent.brandId ?? "",
    fromEmail: agent.fromEmail ?? "",
    replyTo: agent.replyTo ?? "",
    sources: agent.sources,
    cadenceDays: String(agent.cadenceDays),
    sendHour: agent.sendHour,
    reviewMode: agent.reviewMode,
    sampleSize: String(agent.sampleSize),
    maxWords: String(agent.maxWords),
    active: agent.active,
  });
  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => setForm((f) => ({ ...f, [key]: value }));
  const toggleSource = (key: SourceKey) => set("sources", form.sources.includes(key) ? form.sources.filter((s) => s !== key) : [...form.sources, key]);

  return (
    <section className="admin-card admin-section-card">
      <div className="admin-card-title">Context and rhythm</div>
      {note && <div className={`admin-alert admin-alert--${note.tone} u-mt-3`}>{note.text}</div>}
      <div className="admin-form u-mt-3">
        <div className="u-grid-2 u-gap-3">
          <div className="admin-field">
            <label className="admin-label" htmlFor="agent-name">Name</label>
            <input id="agent-name" className="admin-input" value={form.name} onChange={(e) => set("name", e.target.value)} />
          </div>
          <div className="admin-field">
            <label className="admin-label" htmlFor="agent-audience">Audience</label>
            <select id="agent-audience" className="admin-input" value={form.audienceId} onChange={(e) => set("audienceId", e.target.value)}>
              {audiences.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>
          <div className="admin-field">
            <label className="admin-label" htmlFor="agent-brand">Brand</label>
            <select id="agent-brand" className="admin-input" value={form.brandId} onChange={(e) => set("brandId", e.target.value)}>
              <option value="">— No brand —</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
          <div className="admin-field">
            <label className="admin-label" htmlFor="agent-cadence">Days between messages to the same person</label>
            <input id="agent-cadence" className="admin-input" type="number" min={1} max={365} value={form.cadenceDays} onChange={(e) => set("cadenceDays", e.target.value)} />
          </div>
          <div className="admin-field">
            <label className="admin-label" htmlFor="agent-from">From</label>
            <input id="agent-from" className="admin-input" value={form.fromEmail} placeholder="Marketing default" onChange={(e) => set("fromEmail", e.target.value)} />
          </div>
          <div className="admin-field">
            <label className="admin-label" htmlFor="agent-reply">Reply-to</label>
            <input id="agent-reply" className="admin-input" value={form.replyTo} placeholder="Marketing default" onChange={(e) => set("replyTo", e.target.value)} />
          </div>
          <div className="admin-field">
            <label className="admin-label" htmlFor="agent-hour">Send hour, in the person&apos;s time zone</label>
            <select id="agent-hour" className="admin-input" value={form.sendHour} onChange={(e) => set("sendHour", Number(e.target.value))}>
              {HOURS.map((h) => (
                <option key={h} value={h}>{String(h).padStart(2, "0")}:00</option>
              ))}
            </select>
          </div>
          <div className="admin-field">
            <label className="admin-label" htmlFor="agent-words">Word cap</label>
            <input id="agent-words" className="admin-input" type="number" min={20} max={2000} value={form.maxWords} onChange={(e) => set("maxWords", e.target.value)} />
          </div>
          <div className="admin-field">
            <label className="admin-label" htmlFor="agent-review">Review</label>
            <select id="agent-review" className="admin-input" value={form.reviewMode} onChange={(e) => set("reviewMode", e.target.value as "hold_all" | "sample")}>
              <option value="sample">A sample of each run is read; the rest release when it is approved</option>
              <option value="hold_all">Every message is read before it sends</option>
            </select>
          </div>
          <div className="admin-field">
            <label className="admin-label" htmlFor="agent-sample">Sample size</label>
            <input id="agent-sample" className="admin-input" type="number" min={1} max={100} value={form.sampleSize} disabled={form.reviewMode !== "sample"} onChange={(e) => set("sampleSize", e.target.value)} />
          </div>
        </div>
        <div className="admin-field">
          <span className="admin-label">What the agent may read about a person</span>
          <div className="u-row u-wrap">
            {SOURCE_KEYS.map((key) => (
              <label key={key} className="u-row">
                <input type="checkbox" checked={form.sources.includes(key)} onChange={() => toggleSource(key)} />
                {SOURCE_LABEL[key]}
              </label>
            ))}
          </div>
        </div>
        <label className="u-row">
          <input type="checkbox" checked={form.active} onChange={(e) => set("active", e.target.checked)} />
          Active: the hourly run writes to whoever is due
        </label>
        <div className="admin-form-actions">
          <button
            type="button"
            className="admin-btn admin-btn--primary"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                setNote(null);
                const result = await updateAgent(agent.id, {
                  ...form,
                  brandId: form.brandId || null,
                  cadenceDays: Number(form.cadenceDays),
                  sampleSize: Number(form.sampleSize),
                  maxWords: Number(form.maxWords),
                });
                if (result.ok) {
                  setNote({ tone: "ok", text: "Agent saved." });
                  router.refresh();
                } else setNote({ tone: "err", text: result.error });
              })
            }
          >
            {pending ? "Saving…" : "Save agent"}
          </button>
          <button
            type="button"
            className="admin-btn"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                setNote(null);
                const result = await runAgentNow(agent.id);
                if (result.ok) {
                  const s = result.summary;
                  setNote({ tone: "ok", text: `Ran now: ${s.audience} in the audience, ${s.due} due, ${s.drafted.length} drafted, ${s.held.length} held, ${s.skipped.length} skipped, ${s.remaining} left for the next tick.` });
                  router.refresh();
                } else setNote({ tone: "err", text: result.error });
              })
            }
          >
            Run one tick now
          </button>
          <button
            type="button"
            className="admin-btn"
            disabled={pending}
            title={agent.active ? "Keep the agent and its queue; the hourly run skips it." : "Let the hourly run write to whoever is due."}
            onClick={() =>
              startTransition(async () => {
                setNote(null);
                const result = await setAgentActive(agent.id, !agent.active);
                if (result.ok) {
                  set("active", !agent.active);
                  setNote({ tone: "ok", text: agent.active ? "Agent paused." : "Agent resumed." });
                  router.refresh();
                } else setNote({ tone: "err", text: result.error });
              })
            }
          >
            {agent.active ? "Pause" : "Resume"}
          </button>
          <ConfirmButton
            label="Delete"
            title="Delete this agent?"
            body="It runs no more and leaves the list. Its messages and skill versions stay."
            confirmLabel="Delete"
            disabled={pending}
            onConfirm={() => deleteAgent(agent.id)}
            onDone={() => router.push(`${base}/revenue/marketing/recurring`)}
          />
        </div>
      </div>
    </section>
  );
}
