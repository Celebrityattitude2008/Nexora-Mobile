import type { Metadata, Viewport } from 'next';
import './globals.css';
import AppNavigation from '../components/AppNavigation';
import OneSignalInitializer from '../components/OneSignalInitializer';
import { AuthProvider } from '../components/AuthProvider';

export const metadata: Metadata = {
  title: 'Nexora',
  description: 'Your personal productivity dashboard — tasks, goals, analytics, notes, music and finance in one place.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Nexora',
    startupImage: '/icons/splash.png',
  },
  icons: {
    icon: [
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#111111',
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <AuthProvider>
          <OneSignalInitializer />
          <AppNavigation />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
