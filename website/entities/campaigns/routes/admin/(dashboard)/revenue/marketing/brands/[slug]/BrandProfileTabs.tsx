"use client";

import { useState, type ReactNode } from "react";
import { Tabs, type TabDef } from "@/kernel/ui/Tabs";
import { useActionRunner, type ActionNote } from "@/kernel/ui/useActionRunner";
import type { BrandProfile } from "@/entities/campaigns/lib/brand-profiles";
import { BLOG_TYPES, IMAGE_STYLES, SOCIAL_STYLES, type StyleOption } from "@/entities/campaigns/lib/style-catalogues";
import { saveBrandProfile } from "../actions";

type FieldKey =
  | "positioning" | "audience" | "offer" | "primaryCta" | "authorMd"
  | "voiceMd" | "rulesMd"
  | "channelsMd"
  | "processMd" | "blogStylesMd" | "editingLensMd" | "seoLensMd" | "imageStyleMd";

const TABS: { key: string; label: string; fields: FieldKey[] }[] = [
  { key: "basics", label: "Brand Basics", fields: ["positioning", "audience", "offer", "primaryCta", "authorMd"] },
  { key: "voice", label: "Voice", fields: ["voiceMd", "rulesMd"] },
  { key: "channels", label: "Channels", fields: ["channelsMd"] },
  { key: "process", label: "Writing Process", fields: ["processMd", "blogStylesMd", "editingLensMd", "seoLensMd", "imageStyleMd"] },
  { key: "styles", label: "Styles", fields: [] },
];

const LABELS: Record<FieldKey, { label: string; hint?: string; rows: number; input?: boolean }> = {
  positioning: { label: "Positioning", hint: "What the brand is and what it sells.", rows: 3 },
  audience: { label: "Audience", hint: "Who we are writing to.", rows: 3 },
  offer: { label: "Offer", hint: "What we sell.", rows: 2, input: true },
  primaryCta: { label: "Primary CTA", hint: "The default call to action.", rows: 2, input: true },
  authorMd: { label: "Author & credentials", hint: "Who is speaking, and the credentials to draw on.", rows: 6 },
  voiceMd: { label: "Voice", hint: "Tone and how this brand sounds.", rows: 6 },
  rulesMd: { label: "Hard rules", hint: "Non-negotiables: em dashes, name casing, do and don't.", rows: 6 },
  channelsMd: { label: "Channel guidelines", hint: "Per-channel rules. Use ## Blog / ## LinkedIn / ## Facebook / ## Email sections.", rows: 18 },
  processMd: { label: "Workflow", hint: "The steps a post moves through.", rows: 10 },
  blogStylesMd: { label: "Blog styles", hint: "The catalogue and the styles this brand reaches for.", rows: 8 },
  editingLensMd: { label: "Editing lens (Shipper)", hint: "The checklist a draft is run through before approval.", rows: 8 },
  seoLensMd: { label: "SEO lens (Patel)", hint: "The checklist the SEO pass is run through.", rows: 10 },
  imageStyleMd: { label: "Image style", hint: "Brand palette, fonts, and real-vs-AI guidance.", rows: 8 },
};

// The edited values and the style selections live here rather than in the
// panels below, because kernel/ui/Tabs mounts only the tab that is open: state
// held inside a panel dies when the tab changes, and a half-written Voice has
// to survive a trip to Channels and back. The save result is the opposite case
// and lives in the panel — see the comment there.
export function BrandProfileTabs({ profile }: { profile: BrandProfile }) {
  const [values, setValues] = useState<Record<FieldKey, string>>({
    positioning: profile.positioning ?? "",
    audience: profile.audience ?? "",
    offer: profile.offer ?? "",
    primaryCta: profile.primaryCta ?? "",
    authorMd: profile.authorMd ?? "",
    voiceMd: profile.voiceMd ?? "",
    rulesMd: profile.rulesMd ?? "",
    channelsMd: profile.channelsMd ?? "",
    processMd: profile.processMd ?? "",
    blogStylesMd: profile.blogStylesMd ?? "",
    editingLensMd: profile.editingLensMd ?? "",
    seoLensMd: profile.seoLensMd ?? "",
    imageStyleMd: profile.imageStyleMd ?? "",
  });

  const [blogTypes, setBlogTypes] = useState<string[]>(profile.preferredBlogTypes);
  const [imageStyles, setImageStyles] = useState<string[]>(profile.preferredImageStyles);
  const [socialStyles, setSocialStyles] = useState<string[]>(profile.preferredSocialStyles);

  function set(key: FieldKey, v: string) {
    setValues((prev) => ({ ...prev, [key]: v }));
  }

  function toggle(list: string[], setList: (v: string[]) => void, value: string) {
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  }

  // Every panel carries key={t.key}, and it is load-bearing rather than the
  // usual list key. kernel/ui/Tabs renders the open panel in one fixed
  // position, so four of these five tabs would hand a FieldsPanel to a slot a
  // FieldsPanel already occupies: React would reconcile that instance instead
  // of replacing it, and the previous tab's save banner would still be sitting
  // there. A key per tab makes a tab change a remount, which is what discards
  // the banner. Proven in the browser before it was written.
  const tabs: TabDef[] = TABS.map((t) => ({
    key: t.key,
    label: t.label,
    content:
      t.key === "styles" ? (
        <StylesPanel
          key={t.key}
          brandId={profile.brandId}
          groups={[
            { title: "Preferred blog types", options: BLOG_TYPES, selected: blogTypes, onToggle: (v) => toggle(blogTypes, setBlogTypes, v) },
            { title: "Preferred image styles", options: IMAGE_STYLES, selected: imageStyles, onToggle: (v) => toggle(imageStyles, setImageStyles, v) },
            { title: "Preferred social post styles", options: SOCIAL_STYLES, selected: socialStyles, onToggle: (v) => toggle(socialStyles, setSocialStyles, v) },
          ]}
          selection={{
            preferredBlogTypes: blogTypes,
            preferredImageStyles: imageStyles,
            preferredSocialStyles: socialStyles,
          }}
        />
      ) : (
        <FieldsPanel key={t.key} brandId={profile.brandId} label={t.label} fields={t.fields} values={values} onChange={set} />
      ),
  }));

  return <Tabs tabs={tabs} />;
}

// Each panel runs its own save, so the banner belongs to the panel that
// produced it. Only the open panel is mounted, so switching tabs unmounts the
// banner along with it — which is what this component used to do by hand, with
// a setNote(null) on every tab click that anyone adding a tab had to remember.
function PanelCard({ note, children }: { note: ActionNote; children: ReactNode }) {
  return (
    <section className="admin-card admin-section-card">
      {note && <div className={`admin-alert admin-alert--${note.tone} u-mb-3`}>{note.text}</div>}
      <div className="admin-form">{children}</div>
    </section>
  );
}

function FieldsPanel({
  brandId,
  label,
  fields,
  values,
  onChange,
}: {
  brandId: string;
  label: string;
  fields: FieldKey[];
  values: Record<FieldKey, string>;
  onChange: (key: FieldKey, v: string) => void;
}) {
  const { note, pending, run } = useActionRunner();

  function save() {
    const patch: Partial<Record<FieldKey, string>> = {};
    for (const f of fields) patch[f] = values[f];
    run(() => saveBrandProfile(brandId, patch), "Saved.");
  }

  return (
    <PanelCard note={note}>
      {fields.map((f) => {
        const meta = LABELS[f];
        return (
          <div className="admin-field" key={f}>
            <label className="admin-label">{meta.label}</label>
            {meta.input ? (
              <input className="admin-input" value={values[f]} onChange={(e) => onChange(f, e.target.value)} />
            ) : (
              <textarea className="admin-textarea" rows={meta.rows} value={values[f]} onChange={(e) => onChange(f, e.target.value)} />
            )}
            {meta.hint && <div className="admin-hint">{meta.hint}</div>}
          </div>
        );
      })}
      <div className="admin-form-actions">
        <button type="button" className="admin-btn admin-btn--primary" disabled={pending} onClick={save}>
          {pending ? "Saving…" : `Save ${label}`}
        </button>
      </div>
    </PanelCard>
  );
}

function StylesPanel({
  brandId,
  groups,
  selection,
}: {
  brandId: string;
  groups: { title: string; options: StyleOption[]; selected: string[]; onToggle: (value: string) => void }[];
  selection: { preferredBlogTypes: string[]; preferredImageStyles: string[]; preferredSocialStyles: string[] };
}) {
  const { note, pending, run } = useActionRunner();

  return (
    <PanelCard note={note}>
      {groups.map((g) => (
        <StyleGroup key={g.title} title={g.title} options={g.options} selected={g.selected} onToggle={g.onToggle} />
      ))}
      <div className="admin-form-actions">
        <button
          type="button"
          className="admin-btn admin-btn--primary"
          disabled={pending}
          onClick={() => run(() => saveBrandProfile(brandId, selection), "Saved.")}
        >
          {pending ? "Saving…" : "Save Styles"}
        </button>
      </div>
    </PanelCard>
  );
}

function StyleGroup({
  title,
  options,
  selected,
  onToggle,
}: {
  title: string;
  options: StyleOption[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <div className="admin-field">
      <span className="admin-label">{title}</span>
      <div className="u-stack u-mt-2">
        {options.map((o) => (
          <label key={o.value} className="u-row-top">
            <input type="checkbox" checked={selected.includes(o.value)} onChange={() => onToggle(o.value)} className="u-mt-1" />
            <span>
              <strong className="u-strong">{o.label}</strong>
              <span className="admin-hint u-inline u-ml-2">{o.desc}</span>
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}
