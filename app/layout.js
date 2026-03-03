import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://bucketurl.app'),
  title: 'BucketURL — Professional URL Shortener with Analytics',
  description: 'Shorten URLs with powerful analytics, custom OpenGraph, team collaboration, and more. The professional link management platform.',
  keywords: 'url shortener, link analytics, custom short links, team collaboration, openGraph',
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
  openGraph: {
    title: 'BucketURL — Professional URL Shortener',
    description: 'Powerful link management with real analytics, custom OpenGraph, and team collaboration.',
    type: 'website',
    images: [
      {
        url: '/og-default.png',
        width: 1200,
        height: 630,
        alt: 'BucketURL — Shorten. Share. Track.',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BucketURL — Professional URL Shortener',
    description: 'Powerful link management with real analytics, custom OpenGraph, and team collaboration.',
    images: ['/og-default.png'],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        <AuthProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#16161f',
                color: '#f0f0fc',
                border: '1px solid #252535',
                borderRadius: '10px',
                fontSize: '14px',
              },
              success: {
                iconTheme: { primary: '#10b981', secondary: '#16161f' },
              },
              error: {
                iconTheme: { primary: '#ef4444', secondary: '#16161f' },
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
