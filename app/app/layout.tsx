import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import PWAProvider from '@/components/pwa/PWAProvider';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Darik - Personal Finance Tracker',
  description:
    'Local-first personal finance tracker for budgeting, expenses, investments, and net worth tracking',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Darik',
    startupImage: '/icon-512.svg',
  },
  applicationName: 'Darik',
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/icon-192.svg', sizes: '192x192', type: 'image/svg+xml' },
    ],
    apple: [{ url: '/apple-touch-icon.svg', sizes: '180x180', type: 'image/svg+xml' }],
  },
  keywords: [
    'finance',
    'expense tracker',
    'budget',
    'personal finance',
    'offline first',
    'investment tracker',
    'portfolio management',
    'net worth',
  ],
  authors: [{ name: 'Darik' }],
  creator: 'Darik',
  publisher: 'Darik',
  category: 'finance',
};

export const viewport: Viewport = {
  themeColor: '#3b82f6',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <PWAProvider>{children}</PWAProvider>
      </body>
    </html>
  );
}
