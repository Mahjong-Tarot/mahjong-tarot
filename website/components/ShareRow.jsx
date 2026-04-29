import { useEffect, useState } from 'react';
import { trackShareClicked } from '../lib/analytics';
import styles from './ShareRow.module.css';

const SITE = 'https://www.mahjongtarot.com';

export default function ShareRow({ path, title, activityKey, date }) {
  const [canNativeShare, setCanNativeShare] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setCanNativeShare(
      typeof navigator !== 'undefined' && typeof navigator.share === 'function'
    );
  }, []);

  const fullUrl = path?.startsWith('http') ? path : `${SITE}${path || ''}`;

  async function handleCopy() {
    let method = 'copy_link';
    try {
      await navigator.clipboard.writeText(fullUrl);
    } catch (_) {
      // Older browsers — fall back to a hidden textarea + execCommand.
      method = 'copy_link_fallback';
      const textarea = document.createElement('textarea');
      textarea.value = fullUrl;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'absolute';
      textarea.style.left = '-9999px';
      document.body.appendChild(textarea);
      textarea.select();
      try { document.execCommand('copy'); } catch (__) { /* swallow */ }
      document.body.removeChild(textarea);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    trackShareClicked({ method, activityKey, date });
  }

  async function handleNativeShare() {
    try {
      await navigator.share({ title, url: fullUrl });
      trackShareClicked({ method: 'native_share', activityKey, date });
    } catch (_) {
      // User cancelled the sheet, or the platform threw — silent.
    }
  }

  function handleTwitterShare() {
    const text = encodeURIComponent(title || '');
    const url = encodeURIComponent(fullUrl);
    if (typeof window !== 'undefined') {
      window.open(
        `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
        '_blank',
        'noopener,noreferrer'
      );
    }
    trackShareClicked({ method: 'twitter_intent', activityKey, date });
  }

  return (
    <div className={styles.shareRow}>
      <button
        type="button"
        onClick={handleCopy}
        className={`${styles.shareBtn} ${copied ? styles.copied : ''}`}
        aria-live="polite"
      >
        {copied ? 'Copied' : 'Copy link'}
      </button>
      {canNativeShare && (
        <button
          type="button"
          onClick={handleNativeShare}
          className={styles.shareBtn}
        >
          Share…
        </button>
      )}
      <button
        type="button"
        onClick={handleTwitterShare}
        className={styles.shareBtn}
      >
        Share on X
      </button>
    </div>
  );
}
