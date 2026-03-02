import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata = {
  title: 'BucketURL — Professional URL Shortener with Analytics',
  description: 'Shorten URLs with powerful analytics, custom OpenGraph, team collaboration, and more. The professional link management platform.',
  keywords: 'url shortener, link analytics, custom short links, team collaboration, openGraph',
  openGraph: {
    title: 'BucketURL — Professional URL Shortener',
    description: 'Powerful link management with real analytics, custom OpenGraph, and team collaboration.',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased">
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
