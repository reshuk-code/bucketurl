import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

const APP_URL = 'https://bucketurl.onrender.com';

export const metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: 'BucketURL — Free URL Shortener with Click Analytics & Custom Links',
    template: '%s | BucketURL',
  },
  description:
    'BucketURL is the fastest free URL shortener with real-time click analytics, custom short links, OpenGraph preview control, QR codes, and link expiration. Perfect for marketers, developers, and creators.',
  keywords: [
    'url shortener', 'free link shortener', 'short url', 'custom short link',
    'link analytics', 'click tracking', 'branded short links', 'bitly alternative',
    'tinyurl alternative', 'link management', 'qr code generator', 'open graph editor',
    'link expiration', 'utm tracking', 'marketing links', 'shorten url free',
    'link shortener with analytics', 'link in bio', 'social media links', 'url redirect',
  ],
  authors: [{ name: 'BucketURL', url: APP_URL }],
  creator: 'BucketURL',
  publisher: 'BucketURL',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
    shortcut: '/logo.png',
  },
  verification: {
    google: 'googlef465c3c574bb843c',
  },
  alternates: {
    canonical: APP_URL,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: APP_URL,
    siteName: 'BucketURL',
    title: 'BucketURL — Free URL Shortener with Real-Time Analytics',
    description:
      'Shorten any URL in seconds. Get real-time click analytics, custom slugs, QR codes, and password protection — all free.',
    images: [
      {
        url: '/og-default.png',
        width: 1200,
        height: 630,
        alt: 'BucketURL — Shorten. Share. Track.',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@bucketurl',
    creator: '@bucketurl',
    title: 'BucketURL — Free URL Shortener with Real-Time Analytics',
    description:
      'Shorten any URL in seconds. Get real-time click analytics, custom slugs, QR codes, and more — all free.',
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
