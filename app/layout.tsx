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
            __html: `(function(){try{var mode=localStorage.getItem('theme-mode');var style=localStorage.getItem('theme-style')||'default';var accent=localStorage.getItem('theme-accent')||'#ffcb74';var system=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';var nextMode=mode||system;document.documentElement.classList.add(nextMode);document.documentElement.classList.add('theme-'+style);document.documentElement.style.setProperty('--accent', accent);var hex=accent.replace('#','');if(hex.length===6){var r=parseInt(hex.slice(0,2),16);var g=parseInt(hex.slice(2,4),16);var b=parseInt(hex.slice(4,6),16);document.documentElement.style.setProperty('--accent-soft','rgba('+r+','+g+','+b+',0.14)');document.documentElement.style.setProperty('--accent-glow','rgba('+r+','+g+','+b+',0.24)');}}catch(e){document.documentElement.classList.add('dark');}})();`,
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
