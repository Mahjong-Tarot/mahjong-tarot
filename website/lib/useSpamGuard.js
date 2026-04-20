import { useState, useRef, useCallback } from 'react';

const MIN_SUBMIT_MS = 3000; // humans take at least 3 seconds to fill a form

/**
 * Anti-spam hook: honeypot field + submission timing.
 * Returns { honeypot, setHoneypot, checkSpam, SpamField }
 *
 * Usage:
 * const { honeypot, setHoneypot, checkSpam, SpamField } = useSpamGuard();
 * // Add <SpamField /> inside your <form>
 * // Call checkSpam() at the top of your submit handler, returns true if spam
 */
export default function useSpamGuard() {
 const [honeypot, setHoneypot] = useState('');
 const mountedAt = useRef(Date.now());

 const checkSpam = useCallback(() => {
 if (honeypot) return true; // bot filled the hidden field
 if (Date.now() - mountedAt.current < MIN_SUBMIT_MS) return true; // submitted too fast
 return false;
 }, [honeypot]);

 function SpamField() {
 return (
 <div aria-hidden="true" style={{
 position: 'absolute',
 left: '-9999px',
 top: '-9999px',
 height: 0,
 width: 0,
 overflow: 'hidden',
 tabIndex: -1,
 }}>
 <label htmlFor="website">Website</label>
 <input
 id="website"
 name="website"
 type="text"
 autoComplete="off"
 tabIndex={-1}
 value={honeypot}
 onChange={(e) => setHoneypot(e.target.value)}
 />
 </div>
 );
 }

 return { honeypot, setHoneypot, checkSpam, SpamField };
}
