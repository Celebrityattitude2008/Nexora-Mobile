'use client';

import { useEffect, useMemo, useState } from 'react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Tooltip, Legend } from 'chart.js';
import { onValue } from 'firebase/database';
import { userTasksRef, userGoalsRef } from './firebase';
import type { User } from 'firebase/auth';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Tooltip, Legend);

type Task = {
  id: string;
  title: string;
  completed: boolean;
  progress: number;
  createdAt: string;
  priority: 'low' | 'medium' | 'high';
};

type Goal = {
  id: string;
  label: string;
  current: number;
  total: number;
  category: string;
  createdAt: string;
};

interface AnalyticsPanelProps {
  user: User;
}

export function AnalyticsPanel({ user }: AnalyticsPanelProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeTasks = onValue(userTasksRef(user.uid), (snapshot) => {
      const value = snapshot.val();
      if (value) {
        const fetched = Object.entries(value).map(([key, data]) => ({ id: key, ...(data as Omit<Task, 'id'>) }));
        setTasks(fetched);
      }
    });

    const unsubscribeGoals = onValue(userGoalsRef(user.uid), (snapshot) => {
      const value = snapshot.val();
      if (value) {
        const fetched = Object.entries(value).map(([key, data]) => ({ id: key, ...(data as Omit<Goal, 'id'>) }));
        setGoals(fetched);
      }
      setLoading(false);
    });

    return () => {
      unsubscribeTasks();
      unsubscribeGoals();
    };
  }, [user.uid]);

  // Calculate productivity metrics
  const metrics = useMemo(() => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.completed).length;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const avgProgress = tasks.length > 0
      ? Math.round(tasks.reduce((sum, task) => sum + task.progress, 0) / tasks.length)
      : 0;

    const totalGoals = goals.length;
    const completedGoals = goals.filter(goal => goal.current >= goal.total).length;
    const goalCompletionRate = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;

    const avgGoalProgress = goals.length > 0
      ? Math.round(goals.reduce((sum, goal) => sum + (goal.current / goal.total) * 100, 0) / goals.length)
      : 0;

    // Calculate productivity score (weighted average)
    const productivityScore = Math.round(
      (completionRate * 0.4) + (avgProgress * 0.3) + (goalCompletionRate * 0.2) + (avgGoalProgress * 0.1)
    );

    // Priority distribution
    const priorityStats = {
      high: tasks.filter(t => t.priority === 'high').length,
      medium: tasks.filter(t => t.priority === 'medium').length,
      low: tasks.filter(t => t.priority === 'low').length,
    };

    // Goal categories
    const categoryStats = goals.reduce((acc, goal) => {
      acc[goal.category] = (acc[goal.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalTasks,
      completedTasks,
      completionRate,
      avgProgress,
      totalGoals,
      completedGoals,
      goalCompletionRate,
      avgGoalProgress,
      productivityScore,
      priorityStats,
      categoryStats,
    };
  }, [tasks, goals]);

  // Generate weekly productivity data (simulate based on current data)
  const weeklyData = useMemo(() => {
    const baseProductivity = metrics.productivityScore;
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    return days.map((day, index) => {
      // Add some variation based on day of week
      const variation = Math.sin((index / 6) * Math.PI * 2) * 15;
      return Math.max(0, Math.min(100, baseProductivity + variation + (Math.random() - 0.5) * 10));
    });
  }, [metrics.productivityScore]);

  const productivityChartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Productivity Score',
        data: weeklyData,
        borderColor: '#fbbf24',
        backgroundColor: 'rgba(251, 191, 36, 0.24)',
        tension: 0.35,
        fill: true,
        pointRadius: 4,
        pointBackgroundColor: '#fbbf24',
      },
    ],
  };

  const priorityChartData = {
    labels: ['High Priority', 'Medium Priority', 'Low Priority'],
    datasets: [
      {
        data: [metrics.priorityStats.high, metrics.priorityStats.medium, metrics.priorityStats.low],
        backgroundColor: ['#ef4444', '#f59e0b', '#10b981'],
        borderColor: ['#dc2626', '#d97706', '#059669'],
        borderWidth: 2,
      },
    ],
  };

  const goalCategoryData = {
    labels: Object.keys(metrics.categoryStats),
    datasets: [
      {
        label: 'Goals by Category',
        data: Object.values(metrics.categoryStats),
        backgroundColor: [
          '#3b82f6', '#10b981', '#8b5cf6', '#f59e0b',
          '#ef4444', '#06b6d4', '#84cc16', '#f97316'
        ],
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: '#cbd5e1' },
      },
      tooltip: {
        enabled: true,
        backgroundColor: '#111827',
        titleColor: '#f8fafc',
        bodyColor: '#e2e8f0',
      },
    },
    scales: {
      x: {
        ticks: { color: '#cbd5e1' },
        grid: { color: 'rgba(148, 163, 184, 0.18)' },
      },
      y: {
        ticks: { color: '#cbd5e1' },
        grid: { color: 'rgba(148, 163, 184, 0.18)' },
      },
    },
  };

  if (loading) {
    return (
      <section className="rounded-3xl border border-slate-700/80 bg-slate-900/80 p-4 sm:p-6 shadow-panel backdrop-blur-xl">
        <div className="text-center py-8 text-slate-400">Loading analytics...</div>
      </section>
    );
  }

  return (
    <section className="rounded-3xl border border-slate-700/80 bg-slate-900/80 p-4 sm:p-6 shadow-panel backdrop-blur-xl">
      <div className="mb-6">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Analytics Dashboard</p>
        <h2 className="mt-1 text-xl sm:text-2xl font-semibold text-white">Your productivity insights</h2>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="rounded-2xl border border-slate-700/60 bg-slate-950/50 p-4 text-center">
          <div className="text-2xl font-bold text-amber-300">{metrics.productivityScore}%</div>
          <div className="text-xs text-slate-400">Productivity Score</div>
        </div>
        <div className="rounded-2xl border border-slate-700/60 bg-slate-950/50 p-4 text-center">
          <div className="text-2xl font-bold text-green-300">{metrics.completionRate}%</div>
          <div className="text-xs text-slate-400">Task Completion</div>
        </div>
        <div className="rounded-2xl border border-slate-700/60 bg-slate-950/50 p-4 text-center">
          <div className="text-2xl font-bold text-blue-300">{metrics.goalCompletionRate}%</div>
          <div className="text-xs text-slate-400">Goal Success</div>
        </div>
        <div className="rounded-2xl border border-slate-700/60 bg-slate-950/50 p-4 text-center">
          <div className="text-2xl font-bold text-purple-300">{metrics.totalTasks}</div>
          <div className="text-xs text-slate-400">Total Tasks</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Productivity Trend */}
        <div className="rounded-2xl border border-slate-700/60 bg-slate-950/50 p-4">
          <h3 className="font-semibold text-slate-100 mb-4">Weekly Productivity Trend</h3>
          <div className="h-64">
            <Line data={productivityChartData} options={chartOptions} />
          </div>
        </div>

        {/* Task Priority Distribution */}
        <div className="rounded-2xl border border-slate-700/60 bg-slate-950/50 p-4">
          <h3 className="font-semibold text-slate-100 mb-4">Task Priority Distribution</h3>
          <div className="h-64 flex items-center justify-center">
            {metrics.totalTasks > 0 ? (
              <Doughnut
                data={priorityChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      labels: { color: '#cbd5e1' },
                    },
                  },
                }}
              />
            ) : (
              <div className="text-slate-400 text-sm">No tasks to analyze</div>
            )}
          </div>
        </div>

        {/* Goal Categories */}
        <div className="rounded-2xl border border-slate-700/60 bg-slate-950/50 p-4">
          <h3 className="font-semibold text-slate-100 mb-4">Goals by Category</h3>
          <div className="h-64">
            {Object.keys(metrics.categoryStats).length > 0 ? (
              <Bar
                data={goalCategoryData}
                options={{
                  ...chartOptions,
                  plugins: {
                    ...chartOptions.plugins,
                    legend: { display: false },
                  },
                }}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400 text-sm">
                No goals to analyze
              </div>
            )}
          </div>
        </div>

        {/* Detailed Stats */}
        <div className="rounded-2xl border border-slate-700/60 bg-slate-950/50 p-4">
          <h3 className="font-semibold text-slate-100 mb-4">Detailed Statistics</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">Tasks Completed:</span>
              <span className="text-slate-100">{metrics.completedTasks}/{metrics.totalTasks}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Average Task Progress:</span>
              <span className="text-slate-100">{metrics.avgProgress}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Goals Completed:</span>
              <span className="text-slate-100">{metrics.completedGoals}/{metrics.totalGoals}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Average Goal Progress:</span>
              <span className="text-slate-100">{metrics.avgGoalProgress}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">High Priority Tasks:</span>
              <span className="text-slate-100">{metrics.priorityStats.high}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Active Goal Categories:</span>
              <span className="text-slate-100">{Object.keys(metrics.categoryStats).length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Insights */}
      <div className="mt-6 rounded-2xl border border-amber-400/30 bg-amber-400/5 p-4">
        <h3 className="font-semibold text-amber-300 mb-2">💡 Productivity Insights</h3>
        <ul className="text-sm text-slate-300 space-y-1">
          {metrics.productivityScore > 80 && (
            <li>• Excellent productivity! You are crushing your goals.</li>
          )}
          {metrics.completionRate < 50 && metrics.totalTasks > 0 && (
            <li>• Consider breaking large tasks into smaller, manageable steps.</li>
          )}
          {metrics.priorityStats.high > metrics.priorityStats.medium + metrics.priorityStats.low && (
            <li>• You have many high-priority tasks. Consider balancing your workload.</li>
          )}
          {metrics.goalCompletionRate > 80 && (
            <li>• Great job on goal achievement! Keep up the momentum.</li>
          )}
          {metrics.totalTasks === 0 && metrics.totalGoals === 0 && (
            <li>• Start by adding some tasks and goals to track your productivity!</li>
          )}
        </ul>
      </div>
    </section>
  );
}
