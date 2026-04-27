import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Nav from '../../components/Nav';
import Footer from '../../components/Footer';
import BaziChart from '../../components/BaziChart';
import { useAuth } from '../../lib/auth';
import { supabase } from '../../lib/supabase';
import { calculatePillars, tallyElements, dominantElement } from '../../lib/bazi';
import styles from '../../styles/Account.module.css';

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading, signOut } = useAuth();

  const [name, setName] = useState('');
  const [birthday, setBirthday] = useState('');
  const [birthTime, setBirthTime] = useState('');
  const [birthPlace, setBirthPlace] = useState('');
  const [gender, setGender] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    if (!loading && !user) router.replace('/sign-in');
  }, [loading, user, router]);

  useEffect(() => {
    if (!user || !supabase) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from('profiles')
        .select('name, birthday, birth_time, birth_place, gender')
        .eq('user_id', user.id)
        .maybeSingle();
      if (cancelled) return;
      if (data) {
        setName(data.name || '');
        setBirthday(data.birthday || '');
        setBirthTime(data.birth_time ? data.birth_time.slice(0, 5) : '');
        setBirthPlace(data.birth_place || '');
        setGender(data.gender || '');
      }
      setLoadingProfile(false);
    })();
    return () => { cancelled = true; };
  }, [user]);

  if (loading || !user) return null;

  const livePillars = birthday ? calculatePillars(birthday, birthTime || null) : null;
  const liveElements = livePillars ? tallyElements(livePillars) : null;
  const liveDominant = liveElements ? dominantElement(liveElements) : null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    const pillars = birthday ? calculatePillars(birthday, birthTime || null) : null;
    const payload = {
      user_id: user.id,
      name: name || null,
      birthday: birthday || null,
      birth_time: birthTime || null,
      birth_place: birthPlace || null,
      gender: gender || null,
      pillars,
    };
    const { error } = await supabase
      .from('profiles')
      .upsert(payload, { onConflict: 'user_id' });
    setSaving(false);
    if (error) setError(error.message);
    else setSuccess('Saved.');
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  return (
    <>
      <Head>
        <title>Profile | Mahjong Tarot</title>
        <meta name="robots" content="noindex" />
      </Head>
      <Nav />
      <main className={`container ${styles.wrap}`}>
        <h1 className={styles.title}>Your profile</h1>
        <p className={styles.lede}>
          Signed in as <strong>{user.email}</strong>. Add your birth data to see
          your Four Pillars chart on your dashboard and use the calculator.
        </p>

        <div className={styles.profileGrid}>
          <form onSubmit={handleSubmit} className={styles.profileForm}>
            <label className={styles.authLabel}>
              Name
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={styles.authInput}
              />
            </label>
            <label className={styles.authLabel}>
              Birthday
              <input
                type="date"
                value={birthday}
                onChange={(e) => setBirthday(e.target.value)}
                required
                className={styles.authInput}
              />
            </label>
            <label className={styles.authLabel}>
              Birth time (optional, 24h — improves accuracy)
              <input
                type="time"
                value={birthTime}
                onChange={(e) => setBirthTime(e.target.value)}
                className={styles.authInput}
              />
            </label>
            <label className={styles.authLabel}>
              Birth place (optional)
              <input
                type="text"
                value={birthPlace}
                onChange={(e) => setBirthPlace(e.target.value)}
                placeholder="e.g. Hong Kong"
                className={styles.authInput}
              />
            </label>
            <label className={styles.authLabel}>
              Gender
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className={styles.authInput}
              >
                <option value="">—</option>
                <option value="M">Male</option>
                <option value="F">Female</option>
              </select>
            </label>

            {error && <p className={styles.authError}>{error}</p>}
            {success && <p className={styles.authSuccess}>{success}</p>}

            <div className={styles.profileActions}>
              <button type="submit" disabled={saving || loadingProfile} className={styles.authSubmit}>
                {saving ? 'Saving…' : 'Save profile'}
              </button>
              <button type="button" onClick={handleSignOut} className={styles.btnGhostLg}>
                Sign out
              </button>
            </div>

            <p className={styles.authFootnote}>
              <Link href="/dashboard">← Back to dashboard</Link>
            </p>
          </form>

          <div className={styles.profileChart}>
            <h2 className={styles.subTitle}>Preview</h2>
            {livePillars ? (
              <BaziChart
                pillars={livePillars}
                elements={liveElements}
                dominantElement={liveDominant}
              />
            ) : (
              <p className={styles.muted}>Enter a birthday to see your chart.</p>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
