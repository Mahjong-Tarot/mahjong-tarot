"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useSurfaceBase } from "@/kernel/shell/surface-client";
import { createBroadcast } from "./actions";

// The name starts as the next "The Edge NN"; it stays editable for anything else.
export function NewBroadcastForm({ defaultName }: { defaultName: string }) {
  const router = useRouter();
  const base = useSurfaceBase();
  const [name, setName] = useState(defaultName);
  const [subject, setSubject] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit() {
    setError(null);
    startTransition(async () => {
      const result = await createBroadcast({ name, subject });
      if (result.ok) {
        router.push(`${base}/revenue/marketing/broadcasts/${result.id}`);
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <div className="admin-form u-mt-3">
      <div className="admin-field">
        <label className="admin-label" htmlFor="campaign-name">
          Internal name
        </label>
        <input
          id="campaign-name"
          className="admin-input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={defaultName}
        />
        <div className="admin-hint">Only you see this. It never appears in the email.</div>
      </div>
      <div className="admin-field">
        <label className="admin-label" htmlFor="campaign-subject">
          Subject line
        </label>
        <input
          id="campaign-subject"
          className="admin-input"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="What we learned running 40 AI workshops"
        />
      </div>
      {error && (
        <div className="admin-alert admin-alert--err u-mt-2">
          {error}
        </div>
      )}
      <div className="admin-form-actions">
        <button
          type="button"
          className="admin-btn admin-btn--primary"
          onClick={submit}
          disabled={pending || !name.trim() || !subject.trim()}
        >
          {pending ? "Creating…" : "Create draft"}
        </button>
      </div>
    </div>
  );
}
