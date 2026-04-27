import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { supabase } from '../lib/supabase';
import { calculatePillars } from '../lib/bazi';
import styles from '../styles/Account.module.css';

const RELATIONSHIPS = ['Wife', 'Husband', 'Partner', 'Girlfriend', 'Boyfriend', 'Mother', 'Father', 'Son', 'Daughter', 'Brother', 'Sister', 'Friend', 'Other'];

export default function MemberForm({ userId, initial }) {
  const router = useRouter();
  const [name, setName]       = useState(initial?.name       || '');
  const [relationship, setRel] = useState(initial?.relationship || 'Wife');
  const [birthday, setBirthday] = useState(initial?.birthday || '');
  const [birthTime, setBirthTime] = useState(initial?.birth_time ? initial.birth_time.slice(0, 5) : '');
  const [birthPlace, setBirthPlace] = useState(initial?.birth_place || '');
  const [gender, setGender]   = useState(initial?.gender     || '');
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    const pillars = birthday ? calculatePillars(birthday, birthTime || null) : null;
    const payload = {
      user_id: userId,
      name,
      relationship,
      birthday: birthday || null,
      birth_time: birthTime || null,
      birth_place: birthPlace || null,
      gender: gender || null,
      pillars,
    };
    let resp;
    if (initial?.id) {
      resp = await supabase.from('inner_circle').update(payload).eq('id', initial.id);
    } else {
      resp = await supabase.from('inner_circle').insert(payload);
    }
    setSaving(false);
    if (resp.error) {
      setError(resp.error.message);
      return;
    }
    router.push('/dashboard/inner-circle');
  };

  return (
    <form onSubmit={handleSubmit} className={styles.profileForm} style={{ maxWidth: 480 }}>
      <label className={styles.authLabel}>
        Name
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className={styles.authInput} />
      </label>
      <label className={styles.authLabel}>
        Relationship
        <select value={relationship} onChange={(e) => setRel(e.target.value)} required className={styles.authInput}>
          {RELATIONSHIPS.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
      </label>
      <label className={styles.authLabel}>
        Birthday
        <input type="date" value={birthday} onChange={(e) => setBirthday(e.target.value)} required className={styles.authInput} />
      </label>
      <label className={styles.authLabel}>
        Birth time (optional)
        <input type="time" value={birthTime} onChange={(e) => setBirthTime(e.target.value)} className={styles.authInput} />
      </label>
      <label className={styles.authLabel}>
        Birth place (optional)
        <input type="text" value={birthPlace} onChange={(e) => setBirthPlace(e.target.value)} className={styles.authInput} />
      </label>
      <label className={styles.authLabel}>
        Gender
        <select value={gender} onChange={(e) => setGender(e.target.value)} className={styles.authInput}>
          <option value="">–</option>
          <option value="M">Male</option>
          <option value="F">Female</option>
        </select>
      </label>

      {error && <p className={styles.authError}>{error}</p>}

      <div className={styles.profileActions}>
        <button type="submit" disabled={saving} className={styles.authSubmit}>
          {saving ? 'Saving…' : (initial?.id ? 'Save changes' : 'Add to circle')}
        </button>
        <Link href="/dashboard/inner-circle" className={styles.btnGhost} style={{ textDecoration: 'none' }}>
          Cancel
        </Link>
      </div>
    </form>
  );
}
