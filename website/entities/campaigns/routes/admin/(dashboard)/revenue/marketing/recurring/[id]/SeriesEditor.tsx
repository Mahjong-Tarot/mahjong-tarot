"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useSurfaceBase } from "@/kernel/shell/surface-client";
import { ConfirmButton } from "@/kernel/ui/ConfirmButton";
import type { SeriesRow } from "@/entities/campaigns/lib/series";
import type { BrandOption } from "@/entities/campaigns/lib/marketing-calendar-shared";
import { deleteSeries, setSeriesActive, updateSeries } from "../actions";
import { WEEKDAYS, hourLabel } from "../schedule-labels";

type Note = { tone: "ok" | "err"; text: string } | null;
const HOURS = Array.from({ length: 24 }, (_, h) => h);

export function SeriesEditor({ series, audiences, brands }: { series: SeriesRow; audiences: { id: string; name: string }[]; brands: BrandOption[] }) {
  const router = useRouter();
  const base = useSurfaceBase();
  const [pending, startTransition] = useTransition();
  const [note, setNote] = useState<Note>(null);
  const [form, setForm] = useState({
    name: series.name,
    audienceId: series.audienceId,
    brandId: series.brandId ?? "",
    subject: series.subject,
    bodyTemplate: series.bodyTemplate,
    fromEmail: series.fromEmail ?? "",
    replyTo: series.replyTo ?? "",
    timeZone: series.timeZone,
    draftWeekday: series.draftWeekday,
    draftHour: series.draftHour,
    sendWeekday: series.sendWeekday,
    sendHour: series.sendHour,
    batchSize: String(series.batchSize),
    active: series.active,
  });
  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => setForm((f) => ({ ...f, [key]: value }));

  const moment = (dayKey: "draftWeekday" | "sendWeekday", hourKey: "draftHour" | "sendHour", label: string) => (
    <div className="admin-field">
      <span className="admin-label">{label}</span>
      <div className="u-row">
        <select className="admin-input" value={form[dayKey]} aria-label={`${label} day`} onChange={(e) => set(dayKey, Number(e.target.value))}>
          {WEEKDAYS.map((d, i) => (
            <option key={d} value={i}>{d}</option>
          ))}
        </select>
        <select className="admin-input" value={form[hourKey]} aria-label={`${label} hour`} onChange={(e) => set(hourKey, Number(e.target.value))}>
          {HOURS.map((h) => (
            <option key={h} value={h}>{hourLabel(h)}</option>
          ))}
        </select>
      </div>
    </div>
  );

  return (
    <section className="admin-card admin-section-card">
      {note && <div className={`admin-alert admin-alert--${note.tone} u-mb-4`}>{note.text}</div>}
      <div className="admin-form">
        <div className="u-grid-2 u-gap-3">
          <div className="admin-field">
            <label className="admin-label" htmlFor="series-name">Name</label>
            <input id="series-name" className="admin-input" value={form.name} onChange={(e) => set("name", e.target.value)} />
          </div>
          <div className="admin-field">
            <label className="admin-label" htmlFor="series-audience">Audience</label>
            <select id="series-audience" className="admin-input" value={form.audienceId} onChange={(e) => set("audienceId", e.target.value)}>
              {audiences.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>
          <div className="admin-field">
            <label className="admin-label" htmlFor="series-brand">Brand</label>
            <select id="series-brand" className="admin-input" value={form.brandId} onChange={(e) => set("brandId", e.target.value)}>
              <option value="">— No brand —</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
          <div className="admin-field">
            <label className="admin-label" htmlFor="series-subject">Default subject</label>
            <input id="series-subject" className="admin-input" value={form.subject} onChange={(e) => set("subject", e.target.value)} />
          </div>
          <div className="admin-field">
            <label className="admin-label" htmlFor="series-from">From</label>
            <input id="series-from" className="admin-input" value={form.fromEmail} placeholder="Marketing default" onChange={(e) => set("fromEmail", e.target.value)} />
          </div>
          <div className="admin-field">
            <label className="admin-label" htmlFor="series-reply">Reply-to</label>
            <input id="series-reply" className="admin-input" value={form.replyTo} placeholder="Marketing default" onChange={(e) => set("replyTo", e.target.value)} />
          </div>
          <div className="admin-field">
            <label className="admin-label" htmlFor="series-zone">Time zone</label>
            <input id="series-zone" className="admin-input" value={form.timeZone} onChange={(e) => set("timeZone", e.target.value)} />
          </div>
          <div className="admin-field">
            <label className="admin-label" htmlFor="series-batch">Batch size</label>
            <input id="series-batch" className="admin-input" type="number" min={1} max={1000} value={form.batchSize} onChange={(e) => set("batchSize", e.target.value)} />
          </div>
          {moment("draftWeekday", "draftHour", "Draft opens")}
          {moment("sendWeekday", "sendHour", "Sends")}
        </div>
        <div className="admin-field">
          <label className="admin-label" htmlFor="series-template">Issue template</label>
          <textarea id="series-template" className="admin-textarea" rows={16} value={form.bodyTemplate} onChange={(e) => set("bodyTemplate", e.target.value)} />
          <div className="admin-hint">
            Markdown. Filled when the issue opens: {"{intro}"} (a first draft of your note), {"{next_coaching}"}, {"{latest_post}"}.
            Filled for each person when it sends: {"{first_name}"}, {"{certification_progress}"}, {"{coaching_progress}"}, {"{micro_session}"}.
          </div>
        </div>
        <label className="u-row">
          <input type="checkbox" checked={form.active} onChange={(e) => set("active", e.target.checked)} />
          Active: open a draft issue every week
        </label>
        <div className="admin-form-actions">
          <button
            type="button"
            className="admin-btn admin-btn--primary"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                setNote(null);
                const result = await updateSeries(series.id, { ...form, brandId: form.brandId || null, batchSize: Number(form.batchSize) });
                if (result.ok) {
                  setNote({ tone: "ok", text: "Series saved." });
                  router.refresh();
                } else setNote({ tone: "err", text: result.error });
              })
            }
          >
            {pending ? "Saving…" : "Save series"}
          </button>
          <button
            type="button"
            className="admin-btn"
            disabled={pending}
            title={series.active ? "Keep the series, open no more issues." : "Open an issue at the next draft moment."}
            onClick={() =>
              startTransition(async () => {
                setNote(null);
                const result = await setSeriesActive(series.id, !series.active);
                if (result.ok) {
                  set("active", !series.active);
                  setNote({ tone: "ok", text: series.active ? "Series paused." : "Series resumed." });
                  router.refresh();
                } else setNote({ tone: "err", text: result.error });
              })
            }
          >
            {series.active ? "Pause" : "Resume"}
          </button>
          <ConfirmButton
            label="Delete"
            title="Delete this series?"
            body="It opens no more issues and leaves the list. Issues already opened stay as broadcasts."
            confirmLabel="Delete"
            disabled={pending}
            onConfirm={() => deleteSeries(series.id)}
            onDone={() => router.push(`${base}/revenue/marketing/recurring`)}
          />
        </div>
      </div>
    </section>
  );
}
