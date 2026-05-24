// Stage and type config + helpers for the admin inquiries dashboard.
// Extracted from pages/admin/inquiries.jsx.

export const STAGES = [
  { id: 'new_lead',       label: 'New lead' },
  { id: 'contacted',      label: 'Contacted' },
  { id: 'discovery_call', label: 'Discovery call' },
  { id: 'proposal',       label: 'Proposal' },
  { id: 'won',            label: 'Won' },
  { id: 'lost',           label: 'Lost' },
  { id: 'archived',       label: 'Archived' },
];

export const TYPES = [
  { id: '',             label: 'All types' },
  { id: 'contact',      label: 'Contact' },
  { id: 'newsletter',   label: 'Newsletter' },
  { id: 'booking',      label: 'Booking' },
  { id: 'reading',      label: 'Reading' },
  { id: 'consultation', label: 'Consultation' },
  { id: 'general',      label: 'General' },
];

export const TYPE_LABELS = TYPES.reduce((acc, t) => ({ ...acc, [t.id]: t.label }), {});

export function relTime(value) {
  const diffMs = Date.now() - new Date(value).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 60) return `${Math.max(1, minutes)}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7)  return `${days}d ago`;
  return new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
