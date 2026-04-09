'use client';

import dynamic from 'next/dynamic';
import { AnalyticsPanel } from '../../components/AnalyticsPanel';
import { DailyGoals } from '../../components/DailyGoals';
import { TaskList } from '../../components/TaskList';
import { WelcomeCard } from '../../components/WelcomeCard';
import { ProtectedPage } from '../../components/ProtectedPage';
import { useAuth } from '../../components/AuthProvider';

const NotificationService = dynamic(() => import('../../components/NotificationService').then((mod) => mod.NotificationService), {
  ssr: false,
});

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <ProtectedPage>
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 sm:mb-8 flex flex-col gap-4 sm:gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex-1">
            <p className="text-xs sm:text-sm uppercase tracking-[0.28em] text-slate-500">Dashboard</p>
            <h1 className="mt-2 sm:mt-3 text-3xl sm:text-4xl lg:text-5xl font-semibold text-white leading-tight">
              Your workspace at a glance
            </h1>
            <p className="mt-2 max-w-2xl text-sm sm:text-base text-slate-400">
              Quick access to tasks, progress, and real-time analytics.
            </p>
          </div>
          <div className="flex w-full lg:w-auto flex-col gap-3 sm:gap-4">
            <WelcomeCard user={user!} />
          </div>
        </div>

        <NotificationService user={user!} />

        <section className="space-y-6 animate-stagger">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-[1.15fr_0.85fr]">
            <TaskList user={user!} />
            <DailyGoals user={user!} />
          </div>

          <AnalyticsPanel user={user!} />
        </section>
      </div>
    </ProtectedPage>
  );
}
