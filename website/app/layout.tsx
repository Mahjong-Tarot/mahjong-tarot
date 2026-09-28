// Root layout for the App Router routes. The public site and most of the admin
// are Pages Router (pages/_app.jsx, pages/_document.jsx); only the marketing
// platform copied from edge8-web lives here (/admin/revenue). This mirrors
// _document's head and _app's global stylesheets.
import type { Metadata } from 'next';
import '../styles/globals.css';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
