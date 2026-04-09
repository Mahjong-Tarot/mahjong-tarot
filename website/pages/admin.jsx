import Head from 'next/head';
import { useState, useEffect, useCallback } from 'react';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import { supabase } from '../lib/supabase';
import styles from '../styles/Admin.module.css';

const STATUSES = ['received', 'read', 'confirmed', 'completed', 'cancelled'];
const TYPES = ['newsletter', 'contact', 'booking'];
const PAGE_SIZE = 50;

const BADGE_CLASS = {
  received: styles.badgeReceived,
  read: styles.badgeRead,
  confirmed: styles.badgeConfirmed,
  completed: styles.badgeCompleted,
  cancelled: styles.badgeCancelled,
};

const KANBAN_CARD_CLASS = {
  received: styles.kanbanCardReceived,
  read: styles.kanbanCardRead,
  confirmed: styles.kanbanCardConfirmed,
  completed: styles.kanbanCardCompleted,
  cancelled: styles.kanbanCardCancelled,
};

function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatTime(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

// ─── Main Component ──────────────────────────────────────────────────

export default function Admin() {
  const [view, setView] = useState('list');
  const [inquiries, setInquiries] = useState([]);
  const [counts, setCounts] = useState({ total: 0, newsletter: 0, contact: 0, booking: 0 });
  const [filterType, setFilterType] = useState('');
  const [loading, setLoading] = useState(true);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [selectedId, setSelectedId] = useState(null);

  // ── Fetch counts ─────────────────────────────────────────

  const fetchCounts = useCallback(async () => {
    if (!supabase) return;
    const { data } = await supabase.rpc('get_inquiry_counts');
    if (!data) return;
    const c = { total: 0, newsletter: 0, contact: 0, booking: 0 };
    data.forEach(row => {
      c[row.type] = (c[row.type] || 0) + Number(row.count);
      c.total += Number(row.count);
    });
    setCounts(c);
  }, []);

  // ── Fetch inquiries ──────────────────────────────────────

  const fetchInquiries = useCallback(async (reset = false) => {
    if (!supabase) return;
    setLoading(true);
    const newOffset = reset ? 0 : offset;
    const { data, error } = await supabase.rpc('get_inquiries', {
      p_type: filterType || null,
      p_status: null,
      p_limit: PAGE_SIZE,
      p_offset: newOffset,
    });
    if (error) {
      console.error('Fetch inquiries error:', error);
      setLoading(false);
      return;
    }
    if (reset) {
      setInquiries(data || []);
      setOffset(PAGE_SIZE);
    } else {
      setInquiries(prev => [...prev, ...(data || [])]);
      setOffset(newOffset + PAGE_SIZE);
    }
    setHasMore((data || []).length === PAGE_SIZE);
    setLoading(false);
  }, [filterType, offset]);

  useEffect(() => {
    fetchInquiries(true);
    fetchCounts();
  }, [filterType]);

  // ── Update status (for kanban drag or detail panel) ──────

  async function updateStatus(inquiryId, newStatus) {
    if (!supabase) return;
    const { error } = await supabase.rpc('update_inquiry_status', {
      p_inquiry_id: inquiryId,
      p_status: newStatus,
    });
    if (error) {
      console.error('Status update error:', error);
      return;
    }
    setInquiries(prev =>
      prev.map(i => (i.id === inquiryId ? { ...i, status: newStatus } : i))
    );
    fetchCounts();
  }

  // ── Selected inquiry for detail panel ────────────────────

  const selected = inquiries.find(i => i.id === selectedId) || null;

  // ── Render ───────────────────────────────────────────────

  if (!supabase) {
    return (
      <>
        <Nav />
        <main>
          <div className={styles.loading}>Supabase is not configured. Add environment variables to enable the dashboard.</div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Admin Dashboard — Mahjong Tarot</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <Nav />

      <main>
        {/* ── Header + Summary Cards ── */}
        <section className={`section-dark ${styles.pageHeader}`}>
          <div className="container">
            <h1>Inquiry Dashboard</h1>
            <div className={styles.summaryCards}>
              <div className={styles.summaryCard}>
                <div className={styles.label}>Total</div>
                <div className={styles.value}>{counts.total}</div>
              </div>
              <div className={styles.summaryCard}>
                <div className={styles.label}>Newsletter</div>
                <div className={styles.value}>{counts.newsletter}</div>
              </div>
              <div className={styles.summaryCard}>
                <div className={styles.label}>Contact</div>
                <div className={styles.value}>{counts.contact}</div>
              </div>
              <div className={styles.summaryCard}>
                <div className={styles.label}>Booking</div>
                <div className={styles.value}>{counts.booking}</div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Toolbar ── */}
        <section>
          <div className="container">
            <div className={styles.toolbar}>
              <div className={styles.viewToggle}>
                <button
                  className={view === 'list' ? styles.viewBtnActive : styles.viewBtn}
                  onClick={() => setView('list')}
                >
                  List View
                </button>
                <button
                  className={view === 'kanban' ? styles.viewBtnActive : styles.viewBtn}
                  onClick={() => setView('kanban')}
                >
                  Kanban
                </button>
              </div>
              <div className={styles.filterGroup}>
                <span className={styles.filterLabel}>Filter:</span>
                <select
                  className={styles.filterSelect}
                  value={filterType}
                  onChange={e => setFilterType(e.target.value)}
                >
                  <option value="">All Types</option>
                  {TYPES.map(t => (
                    <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* ── List View ── */}
            {view === 'list' && (
              <>
                {loading && inquiries.length === 0 ? (
                  <div className={styles.loading}>Loading inquiries...</div>
                ) : inquiries.length === 0 ? (
                  <div className={styles.empty}>
                    <h3>No inquiries yet</h3>
                    <p>Form submissions will appear here.</p>
                  </div>
                ) : (
                  <>
                    <div className={styles.tableWrap}>
                      <table className={styles.table}>
                        <thead>
                          <tr>
                            <th>Date</th>
                            <th>Type</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Subject / Message</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {inquiries.map(inq => (
                            <tr key={inq.id} onClick={() => setSelectedId(inq.id)}>
                              <td style={{ whiteSpace: 'nowrap' }}>{formatDate(inq.created_at)}</td>
                              <td><span className={styles.typeBadge}>{inq.type}</span></td>
                              <td>{inq.person_name || '—'}</td>
                              <td>{inq.person_email}</td>
                              <td>
                                <div className={styles.messagePreview}>
                                  {inq.subject || inq.message || '—'}
                                </div>
                              </td>
                              <td><span className={BADGE_CLASS[inq.status]}>{inq.status}</span></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {hasMore && (
                      <div className={styles.loadMore}>
                        <button
                          className={styles.loadMoreBtn}
                          onClick={() => fetchInquiries(false)}
                          disabled={loading}
                        >
                          {loading ? 'Loading...' : 'Load More'}
                        </button>
                      </div>
                    )}
                  </>
                )}
              </>
            )}

            {/* ── Kanban View ── */}
            {view === 'kanban' && (
              <KanbanBoard
                inquiries={inquiries}
                onUpdateStatus={updateStatus}
                onSelect={setSelectedId}
                loading={loading}
              />
            )}
          </div>
        </section>
      </main>

      {/* ── Detail Panel ── */}
      {selected && (
        <DetailPanel
          inquiry={selected}
          onClose={() => setSelectedId(null)}
          onStatusUpdate={updateStatus}
          onPersonUpdate={(updatedFields) => {
            setInquiries(prev =>
              prev.map(i =>
                i.person_id === selected.person_id
                  ? { ...i, ...updatedFields }
                  : i
              )
            );
          }}
        />
      )}

      <Footer />
    </>
  );
}

// ─── Kanban Board ──────────────────────────────────────────────────────

function KanbanBoard({ inquiries, onUpdateStatus, onSelect, loading }) {
  const [dragOverCol, setDragOverCol] = useState(null);

  function handleDragStart(e, inquiryId) {
    e.dataTransfer.setData('text/plain', inquiryId);
    e.dataTransfer.effectAllowed = 'move';
  }

  function handleDragOver(e, status) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverCol(status);
  }

  function handleDragLeave() {
    setDragOverCol(null);
  }

  function handleDrop(e, newStatus) {
    e.preventDefault();
    setDragOverCol(null);
    const inquiryId = e.dataTransfer.getData('text/plain');
    if (inquiryId) {
      onUpdateStatus(inquiryId, newStatus);
    }
  }

  if (loading && inquiries.length === 0) {
    return <div className={styles.loading}>Loading inquiries...</div>;
  }

  return (
    <div className={styles.kanban}>
      {STATUSES.map(status => {
        const items = inquiries.filter(i => i.status === status);
        return (
          <div
            key={status}
            className={dragOverCol === status ? styles.kanbanColumnOver : styles.kanbanColumn}
            onDragOver={e => handleDragOver(e, status)}
            onDragLeave={handleDragLeave}
            onDrop={e => handleDrop(e, status)}
          >
            <div className={styles.kanbanHeader}>
              <span>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
              <span className={styles.kanbanCount}>{items.length}</span>
            </div>
            {items.map(inq => (
              <div
                key={inq.id}
                className={`${styles.kanbanCard} ${KANBAN_CARD_CLASS[inq.status]}`}
                draggable
                onDragStart={e => handleDragStart(e, inq.id)}
                onClick={() => onSelect(inq.id)}
              >
                <div className={styles.kanbanCardName}>{inq.person_name || inq.person_email}</div>
                <div className={styles.kanbanCardMeta}>
                  <span className={styles.typeBadge}>{inq.type}</span>
                  <span className={styles.kanbanCardDate}>{formatDate(inq.created_at)}</span>
                </div>
                {(inq.subject || inq.message) && (
                  <div className={styles.kanbanCardMsg}>{inq.subject || inq.message}</div>
                )}
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}

// ─── Detail Panel ──────────────────────────────────────────────────────

function DetailPanel({ inquiry, onClose, onStatusUpdate, onPersonUpdate }) {
  const [person, setPerson] = useState({
    name: inquiry.person_name || '',
    email: inquiry.person_email || '',
    phone: inquiry.person_phone || '',
    address: inquiry.person_address || '',
    chinese_sign: inquiry.person_chinese_sign || '',
    birthday: inquiry.person_birthday || '',
  });
  const [status, setStatus] = useState(inquiry.status);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  const [reply, setReply] = useState({
    subject: `Re: ${inquiry.subject || inquiry.type + ' inquiry'}`,
    body: '',
  });
  const [sendingReply, setSendingReply] = useState(false);
  const [replyMsg, setReplyMsg] = useState('');

  // Sync when inquiry changes
  useEffect(() => {
    setPerson({
      name: inquiry.person_name || '',
      email: inquiry.person_email || '',
      phone: inquiry.person_phone || '',
      address: inquiry.person_address || '',
      chinese_sign: inquiry.person_chinese_sign || '',
      birthday: inquiry.person_birthday || '',
    });
    setStatus(inquiry.status);
    setSaveMsg('');
    setReplyMsg('');
  }, [inquiry.id]);

  // ── Save person ──────────────────────────────────────────

  async function handleSavePerson() {
    if (!supabase) return;
    setSaving(true);
    setSaveMsg('');
    const { error } = await supabase.rpc('update_person', {
      p_person_id: inquiry.person_id,
      p_name: person.name || null,
      p_email: person.email || null,
      p_phone: person.phone || null,
      p_address: person.address || null,
      p_chinese_sign: person.chinese_sign || null,
      p_birthday: person.birthday || null,
    });
    setSaving(false);
    if (error) {
      setSaveMsg('Error saving person.');
      console.error('Save person error:', error);
    } else {
      setSaveMsg('Saved.');
      onPersonUpdate({
        person_name: person.name,
        person_email: person.email,
        person_phone: person.phone,
        person_address: person.address,
        person_chinese_sign: person.chinese_sign,
        person_birthday: person.birthday,
      });
      setTimeout(() => setSaveMsg(''), 2000);
    }
  }

  // ── Update status ────────────────────────────────────────

  async function handleStatusChange(e) {
    const newStatus = e.target.value;
    setStatus(newStatus);
    await onStatusUpdate(inquiry.id, newStatus);
  }

  // ── Send reply ───────────────────────────────────────────

  async function handleSendReply(e) {
    e.preventDefault();
    if (!reply.body.trim()) return;
    setSendingReply(true);
    setReplyMsg('');
    try {
      const res = await fetch('/api/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inquiry_id: inquiry.id,
          to_email: inquiry.person_email,
          to_name: inquiry.person_name || '',
          subject: reply.subject,
          body: reply.body,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setReplyMsg('Reply sent.');
        setReply(prev => ({ ...prev, body: '' }));
        setTimeout(() => setReplyMsg(''), 3000);
      } else {
        setReplyMsg(data.error || 'Failed to send reply.');
      }
    } catch (err) {
      setReplyMsg('Network error sending reply.');
      console.error('Reply error:', err);
    }
    setSendingReply(false);
  }

  // ── Render ───────────────────────────────────────────────

  return (
    <>
      <div className={styles.overlay} onClick={onClose} />
      <div className={styles.panel}>
        <div className={styles.panelHeader}>
          <h2>Inquiry Detail</h2>
          <button className={styles.panelClose} onClick={onClose} aria-label="Close">&times;</button>
        </div>

        <div className={styles.panelBody}>
          {/* ── Person Info (editable) ── */}
          <div>
            <div className={styles.sectionTitle}>Person</div>
            <div className={styles.fieldGrid}>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Name</label>
                <input
                  className={styles.fieldInput}
                  value={person.name}
                  onChange={e => setPerson({ ...person, name: e.target.value })}
                />
              </div>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Email</label>
                <input
                  className={styles.fieldInput}
                  type="email"
                  value={person.email}
                  onChange={e => setPerson({ ...person, email: e.target.value })}
                />
              </div>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Phone</label>
                <input
                  className={styles.fieldInput}
                  value={person.phone}
                  onChange={e => setPerson({ ...person, phone: e.target.value })}
                />
              </div>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Address</label>
                <input
                  className={styles.fieldInput}
                  value={person.address}
                  onChange={e => setPerson({ ...person, address: e.target.value })}
                />
              </div>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Chinese Sign</label>
                <input
                  className={styles.fieldInput}
                  value={person.chinese_sign}
                  onChange={e => setPerson({ ...person, chinese_sign: e.target.value })}
                />
              </div>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Birthday</label>
                <input
                  className={styles.fieldInput}
                  type="date"
                  value={person.birthday}
                  onChange={e => setPerson({ ...person, birthday: e.target.value })}
                />
              </div>
            </div>
            <div className={styles.btnRow} style={{ marginTop: 'var(--space-md)' }}>
              {saveMsg && (
                <span className={saveMsg === 'Saved.' ? styles.successMsg : styles.errorMsg}>
                  {saveMsg}
                </span>
              )}
              <button className={styles.btnSave} onClick={handleSavePerson} disabled={saving}>
                {saving ? 'Saving...' : 'Save Person'}
              </button>
            </div>
          </div>

          {/* ── Inquiry Info ── */}
          <div>
            <div className={styles.sectionTitle}>Inquiry</div>
            <div className={styles.fieldGrid}>
              <div className={styles.fieldGroup}>
                <span className={styles.fieldLabel}>Type</span>
                <span className={styles.fieldValue}>
                  <span className={styles.typeBadge}>{inquiry.type}</span>
                </span>
              </div>
              <div className={styles.fieldGroup}>
                <span className={styles.fieldLabel}>Status</span>
                <select
                  className={styles.fieldSelect}
                  value={status}
                  onChange={handleStatusChange}
                >
                  {STATUSES.map(s => (
                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div className={styles.fieldGroup}>
                <span className={styles.fieldLabel}>Date</span>
                <span className={styles.fieldValue}>
                  {formatDate(inquiry.created_at)} {formatTime(inquiry.created_at)}
                </span>
              </div>
              <div className={styles.fieldGroup}>
                <span className={styles.fieldLabel}>Source</span>
                <span className={styles.fieldValue}>{inquiry.source || '—'}</span>
              </div>
              {inquiry.reading_type_name && (
                <div className={styles.fieldGroup}>
                  <span className={styles.fieldLabel}>Reading Type</span>
                  <span className={styles.fieldValue}>{inquiry.reading_type_name}</span>
                </div>
              )}
              {inquiry.subject && (
                <div className={styles.fieldGroupFull}>
                  <span className={styles.fieldLabel}>Subject</span>
                  <span className={styles.fieldValue}>{inquiry.subject}</span>
                </div>
              )}
            </div>
            {inquiry.message && (
              <div style={{ marginTop: 'var(--space-md)' }}>
                <span className={styles.fieldLabel}>Message</span>
                <div className={styles.messageBox}>{inquiry.message}</div>
              </div>
            )}
          </div>

          {/* ── Reply (only for contact and booking) ── */}
          {(inquiry.type === 'contact' || inquiry.type === 'booking') && (
            <div>
              <div className={styles.sectionTitle}>Reply</div>
              <form className={styles.replyForm} onSubmit={handleSendReply}>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>Subject</label>
                  <input
                    className={styles.fieldInput}
                    value={reply.subject}
                    onChange={e => setReply({ ...reply, subject: e.target.value })}
                    required
                  />
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>Message</label>
                  <textarea
                    className={styles.replyTextarea}
                    value={reply.body}
                    onChange={e => setReply({ ...reply, body: e.target.value })}
                    placeholder="Type your reply..."
                    required
                  />
                </div>
                <div className={styles.btnRow}>
                  {replyMsg && (
                    <span className={replyMsg === 'Reply sent.' ? styles.successMsg : styles.errorMsg}>
                      {replyMsg}
                    </span>
                  )}
                  <button className={styles.btnSend} type="submit" disabled={sendingReply}>
                    {sendingReply ? 'Sending...' : 'Send Reply'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
