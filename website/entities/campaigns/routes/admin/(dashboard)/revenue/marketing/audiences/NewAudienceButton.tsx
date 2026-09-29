"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useSurfaceBase } from "@/kernel/shell/surface-client";
import { createAudience } from "./actions";

// Name first, rules on the audience's own page, where the preview sits beside them.
export function NewAudienceButton() {
  const router = useRouter();
  const base = useSurfaceBase();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <div className="u-stack u-items-end">
      <div className="u-row">
        <input
          className="admin-input"
          value={name}
          placeholder="Audience name"
          aria-label="New audience name"
          onChange={(e) => setName(e.target.value)}
        />
        <button
          type="button"
          className="admin-btn admin-btn--primary"
          disabled={pending || !name.trim()}
          onClick={() =>
            startTransition(async () => {
              setError(null);
              const result = await createAudience({ name });
              if (result.ok) router.push(`${base}/revenue/marketing/audiences/${result.id}`);
              else setError(result.error);
            })
          }
        >
          + New audience
        </button>
      </div>
      {error && <div className="admin-alert admin-alert--err">{error}</div>}
    </div>
  );
}
