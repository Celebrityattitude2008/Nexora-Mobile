'use client';

import { useEffect, useMemo, useState } from 'react';
import { onValue, ref, set, push, remove } from 'firebase/database';
import { database, userGoalsRef } from './firebase';
import type { User } from 'firebase/auth';

type Goal = {
  id: string;
  label: string;
  current: number;
  total: number;
  category: string;
  createdAt: string;
};

const defaultGoals: Goal[] = [
  { id: 'goal-1', label: 'Drink 8 glasses of water', current: 5, total: 8, category: 'Health', createdAt: new Date().toISOString() },
  { id: 'goal-2', label: 'Read 30 minutes', current: 18, total: 30, category: 'Learning', createdAt: new Date().toISOString() },
  { id: 'goal-3', label: 'Go for a run', current: 1, total: 1, category: 'Fitness', createdAt: new Date().toISOString() },
];

const categories = ['Health', 'Fitness', 'Learning', 'Work', 'Personal', 'Social', 'Other'];

interface DailyGoalsProps {
  user: User;
}

export function DailyGoals({ user }: DailyGoalsProps) {
  const [goals, setGoals] = useState<Goal[]>(defaultGoals);
  const [newGoalLabel, setNewGoalLabel] = useState('');
  const [newGoalTotal, setNewGoalTotal] = useState(1);
  const [newGoalCategory, setNewGoalCategory] = useState('Personal');
  const [editingGoal, setEditingGoal] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState('');
  const [editTotal, setEditTotal] = useState(1);

  const completedGoals = useMemo(() => goals.filter((goal) => goal.current >= goal.total).length, [goals]);
  const totalGoals = goals.length;
  const completionRate = useMemo(() => totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0, [completedGoals, totalGoals]);
  const averageProgress = useMemo(() => {
    if (goals.length === 0) return 0;
    return Math.round(goals.reduce((sum, goal) => sum + (goal.current / goal.total) * 100, 0) / goals.length);
  }, [goals]);

  useEffect(() => {
    const unsubscribe = onValue(userGoalsRef(user.uid), (snapshot) => {
      const value = snapshot.val();
      if (!value) return;
      const fetched = Object.entries(value).map(([key, data]) => ({ id: key, ...(data as Omit<Goal, 'id'>) }));
      setGoals((prev) => (fetched.length ? fetched : prev));
    });

    return unsubscribe;
  }, [user.uid]);

  const addGoal = async () => {
    if (!newGoalLabel.trim() || newGoalTotal < 1) return;

    const newGoal: Omit<Goal, 'id'> = {
      label: newGoalLabel.trim(),
      current: 0,
      total: newGoalTotal,
      category: newGoalCategory,
      createdAt: new Date().toISOString(),
    };

    const newGoalRef = await push(userGoalsRef(user.uid), newGoal);
    const goalId = newGoalRef.key;
    if (goalId) {
      setGoals(prev => [...prev, { ...newGoal, id: goalId }]);
    }

    setNewGoalLabel('');
    setNewGoalTotal(1);
    setNewGoalCategory('Personal');
  };

  const increment = async (goalId: string) => {
    const goal = goals.find(g => g.id === goalId);
    if (!goal || goal.current >= goal.total) return;

    const updated = { ...goal, current: goal.current + 1 };
    await set(ref(database, `users/${user.uid}/goals/${goalId}`), {
      label: updated.label,
      current: updated.current,
      total: updated.total,
      category: updated.category,
      createdAt: updated.createdAt,
    });
    setGoals((current) => current.map((item) => (item.id === goalId ? updated : item)));
  };

  const decrement = async (goalId: string) => {
    const goal = goals.find(g => g.id === goalId);
    if (!goal || goal.current <= 0) return;

    const updated = { ...goal, current: goal.current - 1 };
    await set(ref(database, `users/${user.uid}/goals/${goalId}`), {
      label: updated.label,
      current: updated.current,
      total: updated.total,
      category: updated.category,
      createdAt: updated.createdAt,
    });
    setGoals((current) => current.map((item) => (item.id === goalId ? updated : item)));
  };

  const deleteGoal = async (goalId: string) => {
    await remove(ref(database, `users/${user.uid}/goals/${goalId}`));
    setGoals((current) => current.filter((item) => item.id !== goalId));
  };

  const startEditing = (goal: Goal) => {
    setEditingGoal(goal.id);
    setEditLabel(goal.label);
    setEditTotal(goal.total);
  };

  const saveEdit = async () => {
    if (!editingGoal || !editLabel.trim() || editTotal < 1) return;

    const goal = goals.find(g => g.id === editingGoal);
    if (!goal) return;

    const updated = { ...goal, label: editLabel.trim(), total: editTotal };
    await set(ref(database, `users/${user.uid}/goals/${editingGoal}`), {
      label: updated.label,
      current: updated.current,
      total: updated.total,
      category: updated.category,
      createdAt: updated.createdAt,
    });
    setGoals((current) => current.map((item) => (item.id === editingGoal ? updated : item)));
    setEditingGoal(null);
    setEditLabel('');
    setEditTotal(1);
  };

  const resetAllGoals = async () => {
    const updatedGoals = goals.map(goal => ({ ...goal, current: 0 }));
    for (const goal of updatedGoals) {
      await set(ref(database, `users/${user.uid}/goals/${goal.id}`), {
        label: goal.label,
        current: goal.current,
        total: goal.total,
        category: goal.category,
        createdAt: goal.createdAt,
      });
    }
    setGoals(updatedGoals);
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Health': 'bg-blue-400/20 text-blue-300 border-blue-400/40',
      'Fitness': 'bg-green-400/20 text-green-300 border-green-400/40',
      'Learning': 'bg-purple-400/20 text-purple-300 border-purple-400/40',
      'Work': 'bg-orange-400/20 text-orange-300 border-orange-400/40',
      'Personal': 'bg-pink-400/20 text-pink-300 border-pink-400/40',
      'Social': 'bg-cyan-400/20 text-cyan-300 border-cyan-400/40',
      'Other': 'bg-slate-400/20 text-slate-300 border-slate-400/40',
    };
    return colors[category] || colors['Other'];
  };

  return (
    <section className="rounded-3xl border border-slate-700/80 bg-slate-900/80 p-4 sm:p-6 shadow-panel backdrop-blur-xl">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Daily Goals</p>
          <h2 className="mt-1 text-xl sm:text-2xl font-semibold text-white">Track your habits</h2>
          <div className="mt-2 flex gap-4 text-xs sm:text-sm text-slate-400">
            <span>Completed: {completedGoals}/{totalGoals}</span>
            <span>Success Rate: {completionRate}%</span>
            <span>Avg Progress: {averageProgress}%</span>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="rounded-2xl bg-slate-800/90 px-3 py-2 text-xs sm:text-sm text-slate-300">
            {completedGoals}/{totalGoals} done
          </div>
          <button
            onClick={resetAllGoals}
            className="rounded-lg bg-slate-600/20 px-3 py-2 text-xs text-slate-300 hover:bg-slate-600/40 transition"
            title="Reset all goals to 0"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Add New Goal */}
      <div className="mb-6 rounded-2xl border border-slate-700/60 bg-slate-950/50 p-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <input
            type="text"
            value={newGoalLabel}
            onChange={(e) => setNewGoalLabel(e.target.value)}
            placeholder="Goal description..."
            className="rounded-lg bg-slate-800/60 border border-slate-700/60 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400/40"
          />
          <input
            type="number"
            min="1"
            value={newGoalTotal}
            onChange={(e) => setNewGoalTotal(Math.max(1, parseInt(e.target.value) || 1))}
            placeholder="Target"
            className="rounded-lg bg-slate-800/60 border border-slate-700/60 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-400/40"
          />
          <select
            value={newGoalCategory}
            onChange={(e) => setNewGoalCategory(e.target.value)}
            className="rounded-lg bg-slate-800/60 border border-slate-700/60 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-400/40"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <button
            onClick={addGoal}
            disabled={!newGoalLabel.trim()}
            className="rounded-lg bg-amber-400/20 border border-amber-400/40 px-4 py-2 text-sm font-medium text-amber-200 hover:bg-amber-400/30 transition disabled:opacity-50"
          >
            Add Goal
          </button>
        </div>
      </div>

      {/* Goals List */}
      <div className="space-y-3">
        {goals.map((goal) => {
          const pct = Math.round((goal.current / goal.total) * 100);
          const isCompleted = goal.current >= goal.total;

          return (
            <div
              key={goal.id}
              className={`rounded-2xl border p-4 transition ${
                isCompleted ? 'border-green-400/30 bg-green-400/5' : 'border-slate-700/60 bg-slate-950/50 hover:border-amber-400/30'
              }`}
            >
              {editingGoal === goal.id ? (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={editLabel}
                      onChange={(e) => setEditLabel(e.target.value)}
                      className="flex-1 rounded bg-slate-800/60 px-2 py-1 text-sm text-slate-100 focus:outline-none focus:border-amber-400/40"
                    />
                    <input
                      type="number"
                      min="1"
                      value={editTotal}
                      onChange={(e) => setEditTotal(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-20 rounded bg-slate-800/60 px-2 py-1 text-sm text-slate-100 focus:outline-none focus:border-amber-400/40"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={saveEdit}
                      className="rounded px-3 py-1 text-xs bg-green-400/20 text-green-300 hover:bg-green-400/30"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingGoal(null)}
                      className="rounded px-3 py-1 text-xs bg-slate-400/20 text-slate-300 hover:bg-slate-400/30"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <h3 className={`font-medium text-sm sm:text-base ${isCompleted ? 'line-through text-slate-500' : 'text-slate-100'}`}>
                        {goal.label}
                      </h3>
                      <span className={`rounded-full px-2 py-0.5 text-xs border ${getCategoryColor(goal.category)}`}>
                        {goal.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-amber-300">{goal.current}/{goal.total}</span>
                      <div className="flex gap-1">
                        <button
                          onClick={() => decrement(goal.id)}
                          disabled={goal.current <= 0}
                          className="rounded px-2 py-1 text-xs bg-slate-600/20 text-slate-300 hover:bg-slate-600/40 disabled:opacity-50"
                        >
                          -
                        </button>
                        <button
                          onClick={() => increment(goal.id)}
                          disabled={isCompleted}
                          className="rounded px-2 py-1 text-xs bg-amber-400/20 text-amber-300 hover:bg-amber-400/30 disabled:opacity-50"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-slate-400 mb-1">
                      <span>Progress</span>
                      <span>{pct}%</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          isCompleted ? 'bg-green-400' : 'bg-amber-400'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">
                      Created {new Date(goal.createdAt).toLocaleDateString()}
                    </span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => startEditing(goal)}
                        className="rounded px-2 py-1 text-xs bg-slate-600/20 text-slate-300 hover:bg-slate-600/40 transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteGoal(goal.id)}
                        className="rounded px-2 py-1 text-xs bg-amber-400/20 text-amber-200 hover:bg-amber-400/30 transition"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {goals.length === 0 && (
        <div className="text-center py-8 text-slate-400">
          No goals yet. Add your first goal above!
        </div>
      )}
    </section>
  );
}
