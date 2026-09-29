"use client";

import { useState, useTransition } from "react";
import type { DryRunResult } from "@/entities/campaigns/lib/personal/run";
import { SOURCE_LABEL } from "@/entities/campaigns/lib/personal/types";
import { dryRunAgent } from "../actions";

// The dry run: pick a person in the audience, see the facts the sources found
// beside the email the latest skill wrote, and what the validator would hold
// it for. Nothing lands. This is how a skill is tuned before the agent is on.
export function DryRunPanel({ agentId, people }: { agentId: string; people: { id: string; label: string }[] }) {
  const [personId, setPersonId] = useState(people[0]?.id ?? "");
  const [result, setResult] = useState<DryRunResult | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <section className="admin-card admin-section-card">
      <div className="admin-card-title">Dry run</div>
      <div className="admin-hint">Gather, write and validate for one person. Nothing is saved or sent; the tokens show on Settings &rarr; Agents.</div>
      {people.length === 0 ? (
        <div className="admin-empty u-mt-3">The audience resolves to nobody yet.</div>
      ) : (
        <div className="admin-form-row u-mt-3">
          <select className="admin-input" value={personId} aria-label="Person for the dry run" onChange={(e) => setPersonId(e.target.value)}>
            {people.map((p) => (
              <option key={p.id} value={p.id}>{p.label}</option>
            ))}
          </select>
          <button
            type="button"
            className="admin-btn admin-btn--primary"
            disabled={pending || !personId}
            onClick={() =>
              startTransition(async () => {
                setResult(null);
                setResult(await dryRunAgent(agentId, personId));
              })
            }
          >
            {pending ? "Writing…" : "Dry run on this person"}
          </button>
        </div>
      )}
      {result && !result.ok && <div className="admin-alert admin-alert--err u-mt-3">{result.error}</div>}
      {result && result.ok && (
        <div className="u-mt-3">
          {result.skipped && <div className="admin-callout u-mb-4">The run would skip this person: {result.skipped}. The draft below is for tuning only.</div>}
          {result.errors.length === 0 ? (
            <div className="admin-alert admin-alert--ok u-mb-4">Passes every check.</div>
          ) : (
            <div className="admin-alert admin-alert--err u-mb-4">
              Would be held: {result.errors.join(" ")}
            </div>
          )}
          <div className="u-grid-2 u-gap-3">
            <div>
              <div className="admin-label">Facts gathered ({result.facts.length})</div>
              {result.facts.length === 0 ? (
                <div className="admin-empty u-mt-3">The sources know nothing about this person.</div>
              ) : (
                <ul className="admin-list u-mt-3">
                  {result.facts.map((f, i) => (
                    <li className="admin-list-row" key={i}>
                      <div className="admin-list-main">
                        <div className="admin-list-title">{f.fact}</div>
                        <div className="admin-list-sub">{f.date} · {SOURCE_LABEL[f.source]}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div>
              <div className="admin-label">The email</div>
              <div className="admin-card admin-section-card u-mt-3">
                <div className="admin-cell-strong">{result.draft.subject}</div>
                <div className="u-prewrap u-mt-3">{result.draft.bodyMd}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
