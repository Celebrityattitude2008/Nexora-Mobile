'use client';

import dynamic from 'next/dynamic';
import { CalendarWidget } from '../../components/CalendarWidget';
import { ProtectedPage } from '../../components/ProtectedPage';
import { useAuth } from '../../components/AuthProvider';

const WeatherCard = dynamic(() => import('../../components/WeatherCard').then((mod) => mod.WeatherCard), {
  ssr: false,
});

export default function CalendarPage() {
  const { user } = useAuth();

  return (
    <ProtectedPage>
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Calendar</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">Plan your week</h1>
          <p className="mt-2 text-sm text-slate-400">
            Schedule meetings, reminders, and events in one unified view.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
          <CalendarWidget user={user!} />
          <WeatherCard />
        </div>
      </div>
    </ProtectedPage>
  );
}
