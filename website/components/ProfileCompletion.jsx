import Link from 'next/link';
import styles from '../styles/Account.module.css';
import completionStyles from '../styles/ProfileCompletion.module.css';

function completionPercent(profile) {
  if (!profile) return 0;
  const fields = [profile.name, profile.birthday, profile.birth_time, profile.gender];
  const filled = fields.filter(Boolean).length;
  return Math.round((filled / fields.length) * 100);
}

function missingLabel(profile) {
  if (!profile?.birthday) return 'Add your birthday to unlock your chart, daily energy, and forecast.';
  if (!profile?.birth_time) return 'Add your birth time to unlock your Purple Star chart.';
  if (!profile?.gender) return 'Add your gender to improve chart accuracy.';
  return null;
}

export default function ProfileCompletion({ profile }) {
  if (!profile) return null;
  const pct = completionPercent(profile);
  if (pct >= 100) return null;

  const message = missingLabel(profile);
  if (!message) return null;

  return (
    <div className={completionStyles.wrap}>
      <div className={completionStyles.bar}>
        <div className={completionStyles.fill} style={{ width: `${pct}%` }} />
      </div>
      <p className={completionStyles.text}>
        <span className={completionStyles.pct}>{pct}% complete</span>
        {' · '}
        {message}{' '}
        <Link href="/profile" className={completionStyles.link}>Update profile →</Link>
      </p>
    </div>
  );
}
