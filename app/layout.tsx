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
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen" suppressHydrationWarning>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var s=localStorage.getItem('theme-mode');var m=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';var t=s||m;document.documentElement.classList.add(t);}catch(e){document.documentElement.classList.add('dark');}})();`,
          }}
        />
        <AuthProvider>
          <OneSignalInitializer />
          <AppNavigation />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
