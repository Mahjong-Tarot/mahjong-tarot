// Static config + small helpers for the /admin/people page.
//
// NOTE: TYPE_LABELS here is currently duplicated with the same constant
// in pages/admin/inquiries.jsx (and will likely move to a shared
// lib/admin-inquiries.js in PR #310). A follow-up will hoist both
// copies into a shared lib/inquiry-types.js.

export const FILTERS = [
  { id: 'all',         label: 'All' },
  { id: 'customers',   label: 'Customers' },
  { id: 'members',     label: 'Portal members' },
  { id: 'subscribers', label: 'Subscribers' },
  { id: 'opted_out',   label: 'Opted out' },
];

export const TYPE_LABELS = {
  contact:      'Contact',
  newsletter:   'Newsletter',
  booking:      'Booking',
  reading:      'Reading',
  consultation: 'Consultation',
  general:      'General',
};

export const LIFECYCLE_STAGES = [
  'subscriber', 'lead', 'mql', 'sql', 'opportunity', 'customer', 'evangelist',
];

export function formatDate(value) {
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

export function relTime(value) {
  const diffMs = Date.now() - new Date(value).getTime();
  const days = Math.floor(diffMs / (24 * 60 * 60 * 1000));
  if (days <= 0)  return 'today';
  if (days === 1) return 'yesterday';
  if (days < 7)   return `${days}d ago`;
  if (days < 30)  return `${Math.floor(days / 7)}w ago`;
  return formatDate(value);
}

export function sortValue(row, key) {
  switch (key) {
    case 'name':           return (row.name || '').toLowerCase();
    case 'email':          return (row.email || '').toLowerCase();
    case 'tags':           return row.types.length;
    case 'inquiry_count':  return row.inquiry_count || 0;
    case 'order_count':    return row.order_count || 0;
    case 'last_activity':  return row.last_activity || '';
    default:               return row[key];
  }
}
