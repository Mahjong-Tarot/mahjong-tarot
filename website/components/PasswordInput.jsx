import { useState } from 'react';
import styles from './PasswordInput.module.css';

export default function PasswordInput({
  id,
  value,
  onChange,
  placeholder,
  className,
  autoComplete,
  minLength,
  required,
}) {
  const [show, setShow] = useState(false);
  return (
    <div className={styles.wrap}>
      <input
        id={id}
        type={show ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        minLength={minLength}
        required={required}
        className={`${className || ''} ${styles.input}`}
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        className={styles.toggle}
        aria-label={show ? 'Hide password' : 'Show password'}
        tabIndex={-1}
      >
        {show ? (
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" width="18" height="18" aria-hidden="true">
            <path d="M2.5 10s2.7-5.5 7.5-5.5c1.5 0 2.8.4 3.9 1M17.5 10s-2.7 5.5-7.5 5.5c-1.5 0-2.8-.4-3.9-1" />
            <path d="M9 11.5a2.5 2.5 0 01-1.6-2.7" />
            <path d="M3 17L17 3" />
          </svg>
        ) : (
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" width="18" height="18" aria-hidden="true">
            <path d="M2.5 10s2.7-5.5 7.5-5.5 7.5 5.5 7.5 5.5-2.7 5.5-7.5 5.5S2.5 10 2.5 10z" />
            <circle cx="10" cy="10" r="2.5" />
          </svg>
        )}
      </button>
    </div>
  );
}
