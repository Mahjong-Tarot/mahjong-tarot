import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
  ACTIVITIES,
  searchActivities,
  fetchLuckyDatesForActivity,
  formatHumanDate,
  todayInLA,
  ALMANAC_RANGE_START,
  ALMANAC_RANGE_END_EXCLUSIVE,
  getActivityByKey,
} from '../lib/almanac';
import styles from './AlmanacSearch.module.css';

const MONTHS = [
  { value: '', label: 'Any month' },
  { value: '01', label: 'January' },
  { value: '02', label: 'February' },
  { value: '03', label: 'March' },
  { value: '04', label: 'April' },
  { value: '05', label: 'May' },
  { value: '06', label: 'June' },
  { value: '07', label: 'July' },
  { value: '08', label: 'August' },
  { value: '09', label: 'September' },
  { value: '10', label: 'October' },
  { value: '11', label: 'November' },
  { value: '12', label: 'December' },
];

function buildYears() {
  const startYear = parseInt(ALMANAC_RANGE_START.slice(0, 4), 10);
  const endYear = parseInt(ALMANAC_RANGE_END_EXCLUSIVE.slice(0, 4), 10);
  const years = [{ value: '', label: 'Any year' }];
  for (let y = startYear; y <= endYear; y += 1) {
    years.push({ value: String(y), label: String(y) });
  }
  return years;
}

function dateRangeFor(year, month) {
  let start = ALMANAC_RANGE_START;
  let end = (() => {
    const d = new Date(ALMANAC_RANGE_END_EXCLUSIVE + 'T00:00:00Z');
    d.setUTCDate(d.getUTCDate() - 1);
    return d.toISOString().slice(0, 10);
  })();
  if (year && !month) {
    start = `${year}-01-01`;
    end = `${year}-12-31`;
  } else if (year && month) {
    const lastDay = new Date(Date.UTC(parseInt(year, 10), parseInt(month, 10), 0)).getUTCDate();
    start = `${year}-${month}-01`;
    end = `${year}-${month}-${String(lastDay).padStart(2, '0')}`;
  } else if (!year && month) {
    start = ALMANAC_RANGE_START;
    end = (() => {
      const d = new Date(ALMANAC_RANGE_END_EXCLUSIVE + 'T00:00:00Z');
      d.setUTCDate(d.getUTCDate() - 1);
      return d.toISOString().slice(0, 10);
    })();
  }
  if (start < ALMANAC_RANGE_START) start = ALMANAC_RANGE_START;
  if (end >= ALMANAC_RANGE_END_EXCLUSIVE) {
    const d = new Date(ALMANAC_RANGE_END_EXCLUSIVE + 'T00:00:00Z');
    d.setUTCDate(d.getUTCDate() - 1);
    end = d.toISOString().slice(0, 10);
  }
  return { start, end };
}

export default function AlmanacSearch({
  buildResultHref,
  backHref,
  backLabel = '← Back',
  initialActivityKey = null,
}) {
  const initialActivity = initialActivityKey ? getActivityByKey(initialActivityKey) : null;
  const [query, setQuery] = useState(initialActivity?.label || '');
  const [selected, setSelected] = useState(initialActivity);
  const [year, setYear] = useState('');
  const [month, setMonth] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const inputRef = useRef(null);
  const today = todayInLA();

  const suggestions = useMemo(() => {
    if (!query || (selected && selected.label.toLowerCase() === query.toLowerCase())) return [];
    return searchActivities(query).slice(0, 8);
  }, [query, selected]);

  useEffect(() => {
    if (!selected) {
      setResults([]);
      return undefined;
    }
    let cancelled = false;
    setSearching(true);
    const { start, end } = dateRangeFor(year, month);
    const noFilter = !year && !month;
    const filterStart = noFilter && start < today ? today : start;
    (async () => {
      const data = await fetchLuckyDatesForActivity(selected.key, {
        start: filterStart > end ? end : filterStart,
        end,
        limit: 200,
      });
      if (cancelled) return;
      setResults(data);
      setSearching(false);
    })();
    return () => { cancelled = true; };
  }, [selected, year, month, today]);

  function pickActivity(a) {
    setSelected(a);
    setQuery(a.label);
    setShowSuggestions(false);
    inputRef.current?.blur();
  }

  function clearAll() {
    setQuery('');
    setSelected(null);
    setYear('');
    setMonth('');
    setResults([]);
    inputRef.current?.focus();
  }

  const years = buildYears();

  return (
    <div className={styles.container}>
      <div className={styles.searchBlock}>
        <label className={styles.label} htmlFor="almanac-search">Activity</label>
        <div className={styles.inputWrap}>
          <input
            id="almanac-search"
            ref={inputRef}
            type="text"
            className={styles.input}
            placeholder="e.g. get married, move, sign a contract…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelected(null);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            autoComplete="off"
          />
          {query && (
            <button type="button" className={styles.clearBtn} onClick={clearAll} aria-label="Clear">×</button>
          )}
          {showSuggestions && suggestions.length > 0 && (
            <ul className={styles.suggestions}>
              {suggestions.map((s) => (
                <li key={s.key}>
                  <button
                    type="button"
                    className={styles.suggestionBtn}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => pickActivity(s)}
                  >
                    {s.label}
                  </button>
                </li>
              ))}
            </ul>
          )}
          {showSuggestions && query && suggestions.length === 0 && (
            <ul className={styles.suggestions}>
              <li className={styles.noMatch}>No activity matches “{query}”. Try a related word.</li>
            </ul>
          )}
        </div>

        <div className={styles.filters}>
          <div className={styles.filterField}>
            <label className={styles.label} htmlFor="filter-year">Year</label>
            <select
              id="filter-year"
              className={styles.select}
              value={year}
              onChange={(e) => setYear(e.target.value)}
            >
              {years.map((y) => (
                <option key={y.value} value={y.value}>{y.label}</option>
              ))}
            </select>
          </div>
          <div className={styles.filterField}>
            <label className={styles.label} htmlFor="filter-month">Month</label>
            <select
              id="filter-month"
              className={styles.select}
              value={month}
              onChange={(e) => setMonth(e.target.value)}
            >
              {MONTHS.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>
        </div>

        {selected && !searching && (
          <div className={styles.summary}>
            {results.length === 0
              ? `No lucky days found for ${selected.label}.`
              : `${results.length} lucky day${results.length === 1 ? '' : 's'} for ${selected.label}.`}
          </div>
        )}
      </div>

      {selected && (
        <div className={styles.resultsWrap}>
          {searching ? (
            <div className={styles.loading}>Searching…</div>
          ) : (
            <ul className={styles.results}>
              {results.map((r, idx) => (
                <li
                  key={r.date}
                  className={styles.row}
                  style={{ animationDelay: `${Math.min(idx, 12) * 25}ms` }}
                >
                  <Link href={buildResultHref(r.date, selected)} className={styles.rowLink}>
                    <div className={styles.rowMain}>
                      <div className={styles.rowDate}>{formatHumanDate(r.date)}</div>
                      {r.holiday && <div className={styles.rowHoliday}>{r.holiday}</div>}
                      <div className={styles.rowOfficer}>
                        {r.officer?.english} · {r.officer?.chinese}
                      </div>
                    </div>
                    <div className={styles.rowMeta}>
                      <div className={`${styles.toneBadge} ${styles[`tone_${r.tone}`]}`}>
                        {r.score}%
                      </div>
                      <div className={styles.rowArrow}>›</div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {!selected && (
        <div className={styles.helper}>
          Pick an activity above. Try “wedding”, “travel”, “invest”, or browse:
          <div className={styles.chips}>
            {ACTIVITIES.slice(0, 8).map((a) => (
              <button
                key={a.key}
                type="button"
                className={styles.chip}
                onClick={() => pickActivity(a)}
              >
                {a.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {backHref && (
        <div className={styles.backLink}>
          <Link href={backHref}>{backLabel}</Link>
        </div>
      )}
    </div>
  );
}
