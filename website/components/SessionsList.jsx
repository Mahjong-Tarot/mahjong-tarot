import Link from 'next/link';
import SubscriptionIcon from './SubscriptionIcon';
import {
  ageFromBirthday,
  formatSessionWhen,
  groupSessionsByWeek,
  relativeDay,
  weekLabel,
} from '../lib/dates';
import styles from './SessionsList.module.css';

export default function SessionsList({ sessions, emptyMessage = 'No sessions to show.' }) {
  if (!sessions.length) {
    return <p className={styles.empty}>{emptyMessage}</p>;
  }

  const groups = groupSessionsByWeek(sessions);

  return (
    <div className={styles.weeks}>
      {groups.map((group) => (
        <section key={group.weekStart.toISOString()} className={styles.week}>
          <h2 className={styles.weekHeading}>{weekLabel(group.weekStart)}</h2>
          <ul className={styles.list}>
            {group.sessions.map((s) => {
              const c = s.client || {};
              const age = ageFromBirthday(c.birthday);
              return (
                <li key={s.id} className={styles.card}>
                  <Link
                    href={`/admin/private-readings/${c.id || s.client_id}`}
                    className={styles.cardLink}
                  >
                    <div className={styles.when}>
                      <span className={styles.relative}>{relativeDay(s.scheduled_at)}</span>
                      <span className={styles.time}>{formatSessionWhen(s.scheduled_at)}</span>
                    </div>
                    <div className={styles.main}>
                      <h3 className={styles.name}>
                        <SubscriptionIcon status={c.subscription_status} />
                        <span>{c.full_name || 'Unknown client'}</span>
                      </h3>
                      <div className={styles.meta}>
                        {c.birthday && (
                          <span>Born {c.birthday}{age != null ? ` · ${age}` : ''}</span>
                        )}
                        {c.birth_place && <span>{c.birth_place}</span>}
                        {c.email && <span>{c.email}</span>}
                        {c.phone && <span>{c.phone}</span>}
                        {s.duration_minutes && <span>{s.duration_minutes} min</span>}
                      </div>
                      {s.prep_notes && <p className={styles.notes}>{s.prep_notes}</p>}
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
