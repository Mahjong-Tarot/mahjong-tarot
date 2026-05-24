import '../styles/globals.css';
import '../styles/blog-post-blocks.css';
import { AuthProvider } from '../lib/auth';
import { Analytics } from '@vercel/analytics/next';

export default function App({ Component, pageProps }) {
  return (
    <AuthProvider>
      <Component {...pageProps} />
      <Analytics />
    </AuthProvider>
  );
}
