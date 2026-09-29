import type { Metadata } from 'next'
import Link from 'next/link'
import { verifyUnsubscribeToken } from '@/entities/campaigns'
import { UnsubscribeForm } from './UnsubscribeForm'
import styles from './unsubscribe.module.css'

// One-click unsubscribe landing (RFC 8058's POST goes to /api/unsubscribe; this
// page is where the link in the email footer lands). Copied from edge8-web's
// site entity and restyled for Mahjong Tarot.

const SUPPORT_EMAIL = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'dave@onlinechineseastrology.com'

export const metadata: Metadata = {
  title: 'Unsubscribe · The Mahjong Tarot',
  description: 'Stop receiving marketing email from The Mahjong Tarot.',
  robots: { index: false, follow: false },
}

export default function UnsubscribePage({
  searchParams,
}: {
  searchParams: { token?: string | string[] }
}) {
  const raw = searchParams.token
  const token = Array.isArray(raw) ? raw[0] : raw
  const personId = token ? verifyUnsubscribeToken(token) : null

  return (
    <main className={styles.page}>
      <article className={styles.card}>
        <Link href="/" className={styles.back}>
          ← The Mahjong Tarot
        </Link>
        <p className={styles.eyebrow}>Email preferences</p>
        <h1 className={styles.title}>Unsubscribe</h1>
        {personId && token ? (
          <UnsubscribeForm token={token} />
        ) : (
          <p className={styles.body}>
            This unsubscribe link is missing or is no longer valid. Email{' '}
            <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a> and we will remove you from the list by hand.
          </p>
        )}
      </article>
    </main>
  )
}
