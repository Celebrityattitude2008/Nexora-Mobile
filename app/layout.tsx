import type { Metadata } from 'next';
import './globals.css';
import AppNavigation from '../components/AppNavigation';
import { AuthProvider } from '../components/AuthProvider';

export const metadata: Metadata = {
  title: 'Nexora Personal Dashboard',
  description: 'A modern personal dashboard for tasks, goals, analytics, and notes.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 text-slate-100">
        <AuthProvider>
          <AppNavigation />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
