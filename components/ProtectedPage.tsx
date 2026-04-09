'use client';

import { AuthPanel } from './AuthPanel';
import { useAuth } from './AuthProvider';

export function ProtectedPage({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100 px-4 py-6 pb-24 sm:px-6 sm:pb-8 md:px-10 md:py-8">
        <div className="mx-auto max-w-4xl rounded-3xl border border-slate-700 bg-slate-900/80 p-10 text-center shadow-panel">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-slate-700 border-t-amber-400" />
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Loading</p>
          <p className="mt-2 text-xl font-semibold text-white">Securing your workspace…</p>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100 px-4 py-6 pb-24 sm:pb-6">
        <AuthPanel />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 px-4 py-6 pb-24 sm:px-6 sm:pb-8 md:px-10 md:py-8">
      {children}
    </main>
  );
}
