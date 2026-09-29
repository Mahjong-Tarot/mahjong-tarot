"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MultiSelect, type MultiSelectOption } from "@/kernel/ui/MultiSelect";
import { RELATIONSHIPS, RELATIONSHIP_LABEL, type AudienceRow, type Relationship } from "@/entities/campaigns/lib/audience-rules";
import { previewAudience, updateAudience } from "../actions";

type Note = { tone: "ok" | "err"; text: string } | null;

const RELATIONSHIP_HINT: Record<Relationship, string> = {
  team: "Team members",
  client: "linked to a current client",
  prospect: "on an open deal, or at a company with one",
  network: "everyone else",
};

export function AudienceEditor({
  audience,
  companies,
  tags,
}: {
  audience: AudienceRow;
  companies: MultiSelectOption[];
  tags: MultiSelectOption[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [note, setNote] = useState<Note>(null);
  const [name, setName] = useState(audience.name);
  const [relationships, setRelationships] = useState<Relationship[]>(audience.rules.relationships);
  const [companyIds, setCompanyIds] = useState(audience.rules.companyIds);
  const [tagIds, setTagIds] = useState(audience.rules.tagIds);
  const [excludeTagIds, setExcludeTagIds] = useState(audience.rules.excludeTagIds);
  const [preview, setPreview] = useState<{ count: number; names: string[] } | null>(null);

  const rules = { relationships, companyIds, tagIds, excludeTagIds };

  function toggle(r: Relationship) {
    setRelationships((prev) => (prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r]));
  }

  return (
    <>
      {note && <div className={`admin-alert admin-alert--${note.tone} u-mb-4`}>{note.text}</div>}
      <section className="admin-card admin-section-card">
        <div className="admin-form">
          <div className="admin-field">
            <label className="admin-label" htmlFor="audience-name">Name</label>
            <input id="audience-name" className="admin-input" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="admin-field">
            <span className="admin-label">Relationship</span>
            <div className="u-row u-gap-4 u-wrap u-mt-2">
              {RELATIONSHIPS.map((r) => (
                <label key={r} className="u-row" title={RELATIONSHIP_HINT[r]}>
                  <input type="checkbox" checked={relationships.includes(r)} onChange={() => toggle(r)} />
                  {RELATIONSHIP_LABEL[r]}
                </label>
              ))}
            </div>
            <div className="admin-hint">Worked out from the CRM, not a label: team, then client, then prospect, then network.</div>
          </div>
          <div className="u-grid-2 u-gap-3">
            <div className="admin-field">
              <span className="admin-label">Company</span>
              <MultiSelect label="Filter by company" noun="companies" options={companies} value={companyIds} onChange={setCompanyIds} />
            </div>
            <div className="admin-field">
              <span className="admin-label">Tagged</span>
              <MultiSelect label="Include tags" noun="tags" options={tags} value={tagIds} onChange={setTagIds} />
            </div>
          </div>
          <div className="admin-field">
            <span className="admin-label">Not tagged</span>
            <MultiSelect label="Exclude tags" noun="tags" options={tags} value={excludeTagIds} onChange={setExcludeTagIds} />
          </div>
          <div className="admin-form-actions">
            <button
              type="button"
              className="admin-btn admin-btn--primary"
              disabled={pending || !name.trim()}
              onClick={() =>
                startTransition(async () => {
                  setNote(null);
                  const result = await updateAudience(audience.id, { name, rules });
                  if (result.ok) {
                    setNote({ tone: "ok", text: "Audience saved." });
                    router.refresh();
                  } else setNote({ tone: "err", text: result.error });
                })
              }
            >
              Save audience
            </button>
            <button
              type="button"
              className="admin-btn"
              disabled={pending}
              onClick={() =>
                startTransition(async () => {
                  setNote(null);
                  const result = await previewAudience({ rules });
                  if (result.ok) setPreview({ count: result.count, names: result.names });
                  else setNote({ tone: "err", text: result.error });
                })
              }
            >
              Preview who it reaches
            </button>
          </div>
        </div>
      </section>

      {preview && (
        <section className="admin-card admin-section-card">
          <div className="admin-card-title">
            {preview.count} {preview.count === 1 ? "person" : "people"} can be emailed right now
          </div>
          {preview.names.length === 0 ? (
            <div className="admin-empty u-mt-3">Nobody matches.</div>
          ) : (
            <div className="admin-list u-mt-3">
              {preview.names.map((n) => (
                <div className="admin-list-row" key={n}>
                  <div className="admin-list-main">
                    <div className="admin-list-title">{n}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </>
  );
}
