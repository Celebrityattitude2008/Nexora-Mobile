'use client';

import { AuthPanel } from './AuthPanel';
import { LoadingScreen } from './LoadingScreen';
import { useAuth } from './AuthProvider';

export function ProtectedPage({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return (
      <main
        className="min-h-screen px-4 py-6 pb-24 sm:pb-6 animate-fade-in"
        style={{ color: 'var(--text)' }}
      >
        <AuthPanel />
      </main>
    );
  }

  return (
    <main
      className="min-h-screen px-4 py-6 pb-24 sm:px-6 sm:pb-8 md:px-10 md:py-8 animate-page-enter"
      style={{ color: 'var(--text)' }}
    >
      {children}
    </main>
  );
}
