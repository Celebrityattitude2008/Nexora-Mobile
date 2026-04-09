'use client';

import { AuthPanel } from './AuthPanel';
import { useAuth } from './AuthProvider';

export function ProtectedPage({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100 px-4 py-6 sm:px-6 md:px-10 md:py-8">
        <div className="mx-auto max-w-4xl rounded-3xl border border-slate-700 bg-slate-900/80 p-10 text-center shadow-panel">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Loading</p>
          <p className="mt-4 text-xl font-semibold text-white">Securing your workspace…</p>
        </div>
      </main>
    );
  }

  if (!user) {
    return <AuthPanel />;
  }

  return <main className="min-h-screen bg-slate-950 text-slate-100 px-4 py-6 sm:px-6 md:px-10 md:py-8">{children}</main>;
}
