import { LIFECYCLE_STAGES } from '../lib/admin-people';

// ── Shelf primitives ────────────────────────────────────────────────
const shelfBackdrop = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', zIndex: 60,
};
const shelfPanel = {
  position: 'fixed', top: 0, right: 0, bottom: 0,
  width: 'min(440px, 92vw)', background: '#fff', boxShadow: '-12px 0 32px rgba(0,0,0,0.15)',
  padding: 20, overflowY: 'auto', zIndex: 61,
};
const shelfHeader = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  marginBottom: 18, paddingBottom: 12, borderBottom: '1px solid #e5e7eb',
};
const shelfClose = {
  background: 'transparent', border: 'none', fontSize: 28, cursor: 'pointer',
  lineHeight: 1, color: '#6b7280', padding: '0 4px',
};
const shelfErr = {
  background: '#fef2f2', color: '#991b1b', padding: '8px 12px', borderRadius: 6,
  fontSize: 13, marginBottom: 12,
};
const fieldWrap = { marginBottom: 14 };
const fieldLabel = {
  display: 'block', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em',
  color: '#6b7280', fontWeight: 500, marginBottom: 4,
};
const fieldInput = {
  display: 'block', width: '100%', padding: '8px 10px',
  border: '1px solid #d1d5db', borderRadius: 6, fontSize: 14, fontFamily: 'inherit',
  background: '#fff',
};
const fieldSaving = {
  display: 'inline-block', fontSize: 11, color: '#6b7280', marginLeft: 6,
};

function Field({ label, name, type = 'text', draft, setDraft, onSave, saving, readOnly = false }) {
  const initial = draft[name];
  return (
    <div style={fieldWrap}>
      <label style={fieldLabel}>{label}{saving && <span style={fieldSaving}>Saving…</span>}</label>
      <input
        type={type}
        readOnly={readOnly}
        value={draft[name] ?? ''}
        onChange={(e) => setDraft({ ...draft, [name]: e.target.value })}
        onBlur={() => !readOnly && draft[name] !== initial && onSave?.(name, draft[name])}
        style={{ ...fieldInput, background: readOnly ? '#f9fafb' : '#fff' }}
      />
    </div>
  );
}

function SelectField({ label, name, draft, setDraft, options, optionLabels, onSave, saving }) {
  const initial = draft[name];
  return (
    <div style={fieldWrap}>
      <label style={fieldLabel}>{label}{saving && <span style={fieldSaving}>Saving…</span>}</label>
      <select
        value={draft[name] ?? ''}
        onChange={(e) => {
          const next = e.target.value;
          setDraft({ ...draft, [name]: next });
          if (next !== initial) onSave?.(name, next);
        }}
        style={fieldInput}
      >
        {options.map((o) => <option key={o || '_blank'} value={o}>{(optionLabels && optionLabels[o]) || o}</option>)}
      </select>
    </div>
  );
}

function CheckField({ label, name, draft, setDraft, onSave, saving }) {
  return (
    <div style={{ ...fieldWrap, display: 'flex', alignItems: 'center', gap: 10 }}>
      <input
        id={`f-${name}`}
        type="checkbox"
        checked={!!draft[name]}
        onChange={(e) => {
          const next = e.target.checked;
          setDraft({ ...draft, [name]: next });
          onSave?.(name, next);
        }}
      />
      <label htmlFor={`f-${name}`} style={{ ...fieldLabel, marginBottom: 0 }}>
        {label}{saving && <span style={fieldSaving}>Saving…</span>}
      </label>
    </div>
  );
}

export default function PersonEditShelf({
  draft, setDraft, savingField, shelfError, onSave, onClose,
}) {
  return (
    <>
      <div onClick={onClose} style={shelfBackdrop} />
      <aside style={shelfPanel} onClick={(e) => e.stopPropagation()}>
        <header style={shelfHeader}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>
            {draft.name || draft.email || 'Untitled person'}
          </h2>
          <button type="button" onClick={onClose} aria-label="Close" style={shelfClose}>×</button>
        </header>

        {shelfError && <p style={shelfErr}>{shelfError}</p>}

        <Field label="Name" name="name" draft={draft} setDraft={setDraft}
               saving={savingField === 'name'} onSave={onSave} />
        <Field label="Email" name="email" draft={draft} setDraft={setDraft}
               saving={savingField === 'email'} onSave={onSave} />
        <Field label="Phone" name="phone" draft={draft} setDraft={setDraft}
               saving={savingField === 'phone'} onSave={onSave} />
        <Field label="Address" name="address" draft={draft} setDraft={setDraft}
               saving={savingField === 'address'} onSave={onSave} />
        <Field label="Birthday" name="birthday" type="date" draft={draft} setDraft={setDraft}
               saving={savingField === 'birthday'} onSave={onSave} />
        <Field label="Birth time" name="birth_time" type="time" draft={draft} setDraft={setDraft}
               saving={savingField === 'birth_time'} onSave={onSave} />
        <Field label="Birth place" name="birth_place" draft={draft} setDraft={setDraft}
               saving={savingField === 'birth_place'} onSave={onSave} />
        <SelectField label="Gender (needed for Purple Star chart)" name="gender" draft={draft} setDraft={setDraft}
               options={['', 'F', 'M']} optionLabels={{'': '— not set —', F: 'Female', M: 'Male'}}
               saving={savingField === 'gender'} onSave={onSave} />
        <Field label="Chinese sign" name="chinese_sign" draft={draft} setDraft={setDraft}
               saving={savingField === 'chinese_sign'} onSave={onSave} />
        <Field label="Company" name="company" draft={draft} setDraft={setDraft}
               saving={savingField === 'company'} onSave={onSave} />
        <Field label="Role" name="role" draft={draft} setDraft={setDraft}
               saving={savingField === 'role'} onSave={onSave} />
        <SelectField label="Lifecycle stage" name="lifecycle_stage" draft={draft} setDraft={setDraft}
               options={LIFECYCLE_STAGES} saving={savingField === 'lifecycle_stage'} onSave={onSave} />
        <Field label="Nurture stage" name="nurture_stage" type="number" draft={draft} setDraft={setDraft}
               saving={savingField === 'nurture_stage'} onSave={onSave} />
        <Field label="Nurture status" name="nurture_status" draft={draft} setDraft={setDraft}
               saving={savingField === 'nurture_status'} onSave={onSave} />
        <Field label="Membership status" name="membership_status" draft={draft} setDraft={setDraft}
               saving={savingField === 'membership_status'} onSave={onSave} />
        <Field label="Source" name="source" draft={draft} setDraft={setDraft}
               saving={savingField === 'source'} onSave={onSave} />
        <Field label="Source site" name="source_site" draft={draft} setDraft={setDraft}
               saving={savingField === 'source_site'} onSave={onSave} />
        <CheckField label="OK to contact (newsletter / outreach)" name="ok_to_contact" draft={draft} setDraft={setDraft}
               saving={savingField === 'ok_to_contact'} onSave={onSave} />
      </aside>
    </>
  );
}
