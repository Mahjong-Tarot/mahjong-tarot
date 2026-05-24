// Collapsible FAQ item used in blog posts. Extracted from the per-post JSX
// files that all duplicated this component verbatim.
import { useState } from 'react';
import styles from '../styles/BlogPost.module.css';

export default function FaqItem({ question, answer }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={styles.faqItem} onClick={() => setOpen(!open)}>
      <h3 className={styles.faqQuestion}>
        <span>{question}</span>
        <span className={`${styles.faqIcon} ${open ? styles.faqIconOpen : ''}`}>+</span>
      </h3>
      {open && <p className={styles.faqAnswer}>{answer}</p>}
    </div>
  );
}
