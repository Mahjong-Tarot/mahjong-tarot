"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { SkillRow } from "@/entities/campaigns/lib/personal/types";
import { formatDate } from "@/kernel/ui/format";
import { saveSkill } from "../actions";

// The skill: the brief the agent writes from. Every save is a new version
// with a note on what changed, so a message can always say which brief wrote
// it and a rewrite can be judged by what it did to replies.
type Note = { tone: "ok" | "err"; text: string } | null;

export function SkillPanel({ agentId, skills }: { agentId: string; skills: SkillRow[] }) {
  const router = useRouter();
  const latest = skills[0] ?? null;
  const [pending, startTransition] = useTransition();
  const [note, setNote] = useState<Note>(null);
  const [bodyMd, setBodyMd] = useState(latest?.bodyMd ?? "");
  const [changeNote, setChangeNote] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const dirty = bodyMd.trim() !== (latest?.bodyMd ?? "").trim();

  return (
    <section className="admin-card admin-section-card">
      <div className="admin-label-row">
        <div className="admin-card-title">Skill{latest ? ` · version ${latest.version}` : ""}</div>
        {skills.length > 1 && (
          <button type="button" className="admin-btn admin-btn--sm" onClick={() => setShowHistory((v) => !v)}>
            {showHistory ? "Hide history" : `History (${skills.length})`}
          </button>
        )}
      </div>
      {note && <div className={`admin-alert admin-alert--${note.tone} u-mt-3`}>{note.text}</div>}
      <div className="admin-form u-mt-3">
        <div className="admin-field">
          <label className="admin-label" htmlFor="skill-body">The brief: goal, voice, structure, rules, example emails</label>
          <textarea id="skill-body" className="admin-textarea" rows={18} value={bodyMd} onChange={(e) => setBodyMd(e.target.value)} />
          <div className="admin-hint">Markdown. The agent follows it exactly and may only state what the gathered facts say; put the hard rules here (no pricing, one call to action, a word count).</div>
        </div>
        <div className="admin-form-row">
          <div className="admin-field admin-field--wide">
            <label className="admin-label" htmlFor="skill-note">What changed and why</label>
            <input id="skill-note" className="admin-input" value={changeNote} placeholder="Shorter opening; one call to action" onChange={(e) => setChangeNote(e.target.value)} />
          </div>
          <button
            type="button"
            className="admin-btn admin-btn--primary"
            disabled={pending || !dirty}
            onClick={() =>
              startTransition(async () => {
                setNote(null);
                const result = await saveSkill(agentId, { bodyMd, note: changeNote });
                if (result.ok) {
                  setNote({ tone: "ok", text: `Saved as version ${result.version}.` });
                  setChangeNote("");
                  router.refresh();
                } else setNote({ tone: "err", text: result.error });
              })
            }
          >
            {pending ? "Saving…" : dirty ? "Save as new version" : "No changes"}
          </button>
        </div>
      </div>
      {showHistory && (
        <div className="admin-list u-mt-3">
          {skills.map((s) => (
            <div className="admin-list-row" key={s.id}>
              <div className="admin-list-main">
                <div className="admin-list-title">Version {s.version}{s.note ? `: ${s.note}` : ""}</div>
                <div className="admin-list-sub">{formatDate(s.createdAt)}{s.createdBy ? ` · ${s.createdBy}` : ""}</div>
              </div>
              <div className="admin-list-aside">
                {s.id !== latest?.id && (
                  <button type="button" className="admin-btn admin-btn--sm" onClick={() => setBodyMd(s.bodyMd)}>
                    Load into editor
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
