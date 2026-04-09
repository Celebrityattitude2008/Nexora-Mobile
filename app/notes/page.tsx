'use client';

import { NotesWidget } from '../../components/NotesWidget';
import { WeatherCard } from '../../components/WeatherCard';
import { ProtectedPage } from '../../components/ProtectedPage';

export default function NotesPage() {
  return (
    <ProtectedPage>
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Notes</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">Organize ideas and reminders</h1>
          <p className="mt-2 text-sm text-slate-400">
            Keep your thoughts, meeting notes, and quick snippets in one place.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.5fr_0.9fr]">
          <NotesWidget />
          <WeatherCard />
        </div>
      </div>
    </ProtectedPage>
  );
}
