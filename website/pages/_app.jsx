import Head from 'next/head';
import '../styles/globals.css';
import '../styles/blog-post-blocks.css';
import { AuthProvider } from '../lib/auth';
import { Analytics } from '@vercel/analytics/next';

export default function App({ Component, pageProps }) {
  return (
    <AuthProvider>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" key="viewport" />
      </Head>
      <Component {...pageProps} />
      <Analytics />
    </AuthProvider>
  );
}
