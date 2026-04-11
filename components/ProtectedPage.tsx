'use client';

import { useEffect } from 'react';
import { AuthPanel } from './AuthPanel';
import { LoadingScreen } from './LoadingScreen';
import { useAuth } from './AuthProvider';
import { checkMissedTimers } from '../lib/timerService';

export function ProtectedPage({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  useEffect(() => {
    if (!user) return;
    void checkMissedTimers(user.uid);
  }, [user]);

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
