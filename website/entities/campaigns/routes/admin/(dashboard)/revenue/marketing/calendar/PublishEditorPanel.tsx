"use client";

import { useRef, useState } from "react";

// Team-facing trigger for the Publish Editor agent. One button on a blog asset:
// the agent reviews against the checklist, fixes small issues, publishes if it
// passes, and streams its work + final report here. No Claude Code, no laptop.
//
// The agent writes `marketing_content` from a route handler, and a route
// handler's `revalidatePath` never reaches the browser's Client Router Cache —
// only a server action's does. So the caller must re-render the tree itself:
// `onDone` is the drawer's `router.refresh()` (EntryDrawer), and this panel is
// responsible for calling it on every run that may have written.

type Chip = { name: string; detail: string };

export function PublishEditorPanel({ assetId, onDone }: { assetId: string; onDone?: () => void }) {
  const [running, setRunning] = useState(false);
  const [chips, setChips] = useState<Chip[]>([]);
  const [report, setReport] = useState("");
  const [error, setError] = useState<string | null>(null);
  const reportRef = useRef("");
  // Set the moment any tool reports back. The writes only ever happen inside a
  // tool call, so this is the cheap over-approximation of "the drawer's data
  // may now be out of date" — a read-only tool costs one wasted refresh, while
  // missing a write costs the user a click that looks like it did nothing.
  const wroteRef = useRef(false);

  async function run() {
    setRunning(true);
    setChips([]);
    setReport("");
    setError(null);
    reportRef.current = "";
    wroteRef.current = false;
    try {
      const res = await fetch("/api/admin/marketing/publish-editor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assetId }),
      });
      if (!res.ok || !res.body) {
        setError((await res.json().catch(() => null))?.error ?? "The publish editor could not start.");
        setRunning(false);
        return;
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split("\n\n");
        buffer = parts.pop() ?? "";
        for (const part of parts) {
          const line = part.trim();
          if (!line.startsWith("data:")) continue;
          const evt = JSON.parse(line.slice(5).trim());
          if (evt.type === "text") {
            reportRef.current += evt.text;
            setReport(reportRef.current);
          } else if (evt.type === "tool") {
            wroteRef.current = true;
            setChips((c) => [...c, { name: evt.name, detail: evt.detail }]);
          } else if (evt.type === "error") {
            setError(evt.error);
          }
        }
      }
    } catch {
      setError("Lost connection to the publish editor.");
    } finally {
      setRunning(false);
      // Refresh on any run that reached a tool, not only on a clean `done`:
      // the route ends the stream with `error` after a failed iteration, and
      // whatever the agent had already published is live by then. A run that
      // never called a tool changed nothing, so it leaves the drawer alone.
      if (wroteRef.current) onDone?.();
    }
  }

  return (
    <div className="admin-card u-p-3">
      <div className="admin-label u-mb-2">Review &amp; publish (AI editor)</div>
      <button type="button" className="admin-btn admin-btn--primary" onClick={run} disabled={running}>
        {running ? "Reviewing…" : "Review & publish"}
      </button>
      <div className="admin-hint u-mt-2">
        The editor checks the post against the publish checklist, fixes small issues, publishes it to
        the brand&apos;s site if it passes, and verifies the live URL.
      </div>

      {chips.length > 0 && (
        <div className="admin-campaign-chip-row u-mt-3">
          {chips.map((c, i) => (
            <span key={i} className="admin-chip">{c.detail}</span>
          ))}
        </div>
      )}

      {error && (
        <div className="admin-alert admin-alert--err u-mt-3">{error}</div>
      )}

      {report && (
        <div
          className="admin-card u-mt-3 u-p-3 u-prewrap"
        >
          {report}
        </div>
      )}
    </div>
  );
}
