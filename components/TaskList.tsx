'use client';

import { useEffect, useMemo, useState } from 'react';
import { onValue, ref, set, push, remove } from 'firebase/database';
import { database, userTasksRef, userExpensesRef } from './firebase';
import type { User } from 'firebase/auth';

type Task = {
  id: string;
  title: string;
  completed: boolean;
  progress: number;
  createdAt: string;
  priority: 'low' | 'medium' | 'high';
};

type Expense = {
  id: string;
  name: string;
  amount: number;
  category: string;
  createdAt: string;
  notes?: string;
};

interface TaskListProps {
  user: User;
}

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high':
      return 'text-amber-300 border-amber-400/40';
    case 'medium':
      return 'text-amber-300 border-amber-400/40';
    case 'low':
      return 'text-green-400 border-green-400/40';
    default:
      return 'text-slate-400 border-slate-400/40';
  }
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

export function TaskList({ user }: TaskListProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [expenseName, setExpenseName] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseCategory, setExpenseCategory] = useState('General');
  const [expenseNotes, setExpenseNotes] = useState('');
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);

  const completedCount = useMemo(() => tasks.filter((task) => task.completed).length, [tasks]);
  const progressAverage = useMemo(
    () => (tasks.length ? Math.round(tasks.reduce((sum, task) => sum + task.progress, 0) / tasks.length) : 0),
    [tasks],
  );
  const totalTasks = tasks.length;
  const productivityScore = useMemo(() => {
    if (!totalTasks) return 0;
    const completedTasks = tasks.filter((task) => task.completed);
    const avgProgress = completedTasks.length
      ? completedTasks.reduce((sum, task) => sum + task.progress, 0) / completedTasks.length
      : 0;
    return Math.round((completedTasks.length / totalTasks) * 100 + avgProgress * 0.5);
  }, [tasks, totalTasks]);
  const totalExpenses = useMemo(
    () => expenses.reduce((sum, expense) => sum + expense.amount, 0),
    [expenses],
  );
  const hours = Math.floor(timerSeconds / 3600);
  const minutes = Math.floor((timerSeconds % 3600) / 60);
  const seconds = timerSeconds % 60;

  useEffect(() => {
    const tasksRef = userTasksRef(user.uid);
    const unsubscribe = onValue(tasksRef, (snapshot) => {
      const value = snapshot.val();
      if (!value) {
        setTasks([]);
        return;
      }
      const fetched = Object.entries(value).map(([key, data]) => ({
        id: key,
        ...(data as Omit<Task, 'id'>),
      }));
      setTasks(fetched);
    });

    return unsubscribe;
  }, [user]);

  useEffect(() => {
    const expensesRef = userExpensesRef(user.uid);
    const unsubscribe = onValue(expensesRef, (snapshot) => {
      const value = snapshot.val();
      if (!value) {
        setExpenses([]);
        return;
      }
      const parsed = Object.entries(value).map(([key, data]) => ({
        id: key,
        ...(data as Omit<Expense, 'id'>),
      }));
      setExpenses(parsed);
    });

    return unsubscribe;
  }, [user]);

  useEffect(() => {
    if (!timerRunning) return undefined;
    const interval = setInterval(() => {
      setTimerSeconds((seconds) => seconds + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timerRunning]);

  const addTask = async () => {
    if (!newTaskTitle.trim()) return;

    const newTask = {
      title: newTaskTitle.trim(),
      completed: false,
      progress: 0,
      createdAt: new Date().toISOString(),
      priority: newTaskPriority,
    };

    const newTaskRef = await push(userTasksRef(user.uid), newTask);
    const taskId = newTaskRef.key;
    if (taskId) {
      setTasks((prev) => [...prev, { ...newTask, id: taskId }]);
    }
    setNewTaskTitle('');
    setNewTaskPriority('medium');
  };

  const toggleTask = async (task: Task) => {
    const updated = {
      ...task,
      completed: !task.completed,
      progress: task.completed ? task.progress : Math.min(100, task.progress + 15),
    };
    await set(ref(database, `users/${user.uid}/tasks/${task.id}`), updated);
    setTasks((current) => current.map((item) => (item.id === task.id ? updated : item)));
  };

  const updateProgress = async (taskId: string, newProgress: number) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const updated = { ...task, progress: Math.max(0, Math.min(100, newProgress)) };
    await set(ref(database, `users/${user.uid}/tasks/${taskId}`), updated);
    setTasks((current) => current.map((item) => (item.id === taskId ? updated : item)));
  };

  const deleteTask = async (taskId: string) => {
    await remove(ref(database, `users/${user.uid}/tasks/${taskId}`));
    setTasks((current) => current.filter((item) => item.id !== taskId));
  };

  const startEditing = (task: Task) => {
    setEditingTask(task.id);
    setEditTitle(task.title);
  };

  const saveEdit = async () => {
    if (!editingTask || !editTitle.trim()) return;
    const task = tasks.find((t) => t.id === editingTask);
    if (!task) return;

    const updated = { ...task, title: editTitle.trim() };
    await set(ref(database, `users/${user.uid}/tasks/${editingTask}`), updated);
    setTasks((current) => current.map((item) => (item.id === editingTask ? updated : item)));
    setEditingTask(null);
    setEditTitle('');
  };

  const addExpense = async () => {
    if (!expenseName.trim() || !expenseAmount.trim()) return;
    const amount = Number(expenseAmount);
    if (Number.isNaN(amount) || amount <= 0) return;

    const newExpense = {
      name: expenseName.trim(),
      amount,
      category: expenseCategory,
      notes: expenseNotes.trim(),
      createdAt: new Date().toISOString(),
    };

    const newExpenseRef = await push(userExpensesRef(user.uid), newExpense);
    const expenseId = newExpenseRef.key;
    if (expenseId) {
      setExpenses((prev) => [...prev, { ...newExpense, id: expenseId }]);
    }
    setExpenseName('');
    setExpenseAmount('');
    setExpenseNotes('');
    setExpenseCategory('General');
  };

  const deleteExpense = async (expenseId: string) => {
    await remove(ref(database, `users/${user.uid}/expenses/${expenseId}`));
    setExpenses((current) => current.filter((expense) => expense.id !== expenseId));
  };

  const toggleTimer = () => {
    setTimerRunning((current) => !current);
  };

  const resetTimer = () => {
    setTimerRunning(false);
    setTimerSeconds(0);
  };

  return (
    <section className="rounded-3xl border border-slate-700/80 bg-slate-900/80 p-4 sm:p-6 shadow-panel backdrop-blur-xl">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Task Management</p>
          <h2 className="mt-1 text-xl sm:text-2xl font-semibold text-white">Your productivity hub</h2>
          <div className="mt-2 flex flex-wrap gap-3 text-xs sm:text-sm text-slate-400">
            <span>Completed: {completedCount}/{totalTasks}</span>
            <span>Avg Progress: {progressAverage}%</span>
            <span>Productivity: {productivityScore}%</span>
            <span>Total expense: {formatCurrency(totalExpenses)}</span>
          </div>
        </div>
        <div className="rounded-2xl bg-slate-800/90 px-3 py-2 text-xs sm:text-sm text-slate-300">
          {completedCount} done
        </div>
      </div>

      <div className="mb-6 rounded-2xl border border-slate-700/60 bg-slate-950/50 p-4">
        <div className="grid gap-3 sm:grid-cols-[1.4fr_0.8fr_0.8fr]">
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="Add a new task..."
            className="rounded-3xl border border-slate-700/80 bg-slate-900/90 px-4 py-3 text-sm text-slate-100 outline-none focus:border-amber-400"
            onKeyPress={(e) => e.key === 'Enter' && addTask()}
          />
          <select
            value={newTaskPriority}
            onChange={(e) => setNewTaskPriority(e.target.value as 'low' | 'medium' | 'high')}
            className="rounded-3xl border border-slate-700/80 bg-slate-900/90 px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-amber-400"
          >
            <option value="low">Low Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="high">High Priority</option>
          </select>
          <button
            onClick={addTask}
            disabled={!newTaskTitle.trim()}
            className="rounded-3xl bg-amber-400/20 border border-amber-400/40 px-4 py-3 text-sm font-medium text-amber-200 hover:bg-amber-400/30 transition disabled:opacity-50"
          >
            Add Task
          </button>
        </div>
      </div>

      <div className="space-y-3 mb-6">
        {tasks.map((task) => (
          <div
            key={task.id}
            className={`rounded-2xl border bg-slate-950/50 p-4 transition ${
              task.completed ? 'border-green-400/30 bg-green-400/5' : 'border-slate-700/60 hover:border-amber-400/30'
            }`}
          >
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => toggleTask(task)}
                className="mt-1 h-4 w-4 rounded border-slate-600 text-amber-400 focus:ring-amber-400"
              />
              <div className="flex-1 min-w-0">
                {editingTask === task.id ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="flex-1 rounded bg-slate-800/60 px-2 py-1 text-sm text-slate-100 focus:outline-none focus:border-amber-400/40"
                      onKeyPress={(e) => e.key === 'Enter' && saveEdit()}
                    />
                    <button
                      onClick={saveEdit}
                      className="rounded px-2 py-1 text-xs bg-green-400/20 text-green-300 hover:bg-green-400/30"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingTask(null)}
                      className="rounded px-2 py-1 text-xs bg-slate-400/20 text-slate-300 hover:bg-slate-400/30"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className={`font-medium text-sm sm:text-base ${task.completed ? 'line-through text-slate-500' : 'text-slate-100'}`}>
                      {task.title}
                    </h3>
                    <span className={`rounded-full px-2 py-0.5 text-xs border ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                  </div>
                )}

                <div className="mb-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-slate-400">Progress</span>
                    <span className="text-xs font-medium text-amber-300">{task.progress}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={task.progress}
                    onChange={(e) => updateProgress(task.id, parseInt(e.target.value, 10))}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">
                    Created {new Date(task.createdAt).toLocaleDateString()}
                  </span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => startEditing(task)}
                      className="rounded px-2 py-1 text-xs bg-slate-600/20 text-slate-300 hover:bg-slate-600/40 transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="rounded px-2 py-1 text-xs bg-amber-400/20 text-amber-200 hover:bg-amber-400/30 transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {tasks.length === 0 && (
        <div className="text-center py-8 text-slate-400">
          No tasks yet. Add your first task above!
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-3xl border border-slate-700/60 bg-slate-950/50 p-4">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-white">Stopwatch / Timer</h3>
              <p className="text-xs text-slate-400">Track focus time inside the hub.</p>
            </div>
            <div className="rounded-full bg-slate-900 px-3 py-1 text-xs text-slate-300">
              {hours.toString().padStart(2, '0')}:{minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={toggleTimer}
              className="rounded-full bg-amber-400/20 border border-amber-400/40 px-4 py-2 text-xs font-semibold text-amber-200 hover:bg-amber-400/30 transition"
            >
              {timerRunning ? 'Pause' : 'Start'}
            </button>
            <button
              onClick={resetTimer}
              className="rounded-full bg-slate-800/80 border border-slate-700/80 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-800 transition"
            >
              Reset
            </button>
          </div>
          <p className="mt-4 text-xs text-slate-400">
            Use the timer to focus on tasks and keep your productivity workflow on one screen.
          </p>
        </section>

        <section className="rounded-3xl border border-slate-700/60 bg-slate-950/50 p-4">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-white">Expense tracker</h3>
              <p className="text-xs text-slate-400">Quickly log spend and review totals.</p>
            </div>
            <span className="rounded-full bg-slate-900 px-3 py-1 text-xs text-slate-300">{formatCurrency(totalExpenses)}</span>
          </div>

          <div className="space-y-3">
            <input
              type="text"
              value={expenseName}
              onChange={(e) => setExpenseName(e.target.value)}
              placeholder="Expense name"
              className="w-full rounded-3xl border border-slate-700/80 bg-slate-900/90 px-4 py-3 text-sm text-slate-100 outline-none focus:border-amber-400"
            />
            <div className="grid gap-3 sm:grid-cols-[1fr_0.8fr]">
              <input
                type="number"
                value={expenseAmount}
                onChange={(e) => setExpenseAmount(e.target.value)}
                placeholder="Amount"
                className="rounded-3xl border border-slate-700/80 bg-slate-900/90 px-4 py-3 text-sm text-slate-100 outline-none focus:border-amber-400"
              />
              <input
                type="text"
                value={expenseCategory}
                onChange={(e) => setExpenseCategory(e.target.value)}
                placeholder="Category"
                className="rounded-3xl border border-slate-700/80 bg-slate-900/90 px-4 py-3 text-sm text-slate-100 outline-none focus:border-amber-400"
              />
            </div>
            <textarea
              value={expenseNotes}
              onChange={(e) => setExpenseNotes(e.target.value)}
              rows={2}
              placeholder="Notes (optional)"
              className="w-full rounded-3xl border border-slate-700/80 bg-slate-900/90 px-4 py-3 text-sm text-slate-100 outline-none focus:border-amber-400"
            />
            <button
              onClick={addExpense}
              className="w-full rounded-3xl bg-amber-400/20 border border-amber-400/40 px-4 py-3 text-sm font-medium text-amber-200 hover:bg-amber-400/30 transition"
            >
              Add expense
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {expenses.length ? (
              expenses.map((expense) => (
                <div key={expense.id} className="rounded-3xl border border-slate-700/60 bg-slate-900/90 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-white">{expense.name}</p>
                      <p className="text-xs text-slate-400">{expense.category}</p>
                    </div>
                    <span className="text-sm font-semibold text-amber-300">{formatCurrency(expense.amount)}</span>
                  </div>
                  {expense.notes ? <p className="mt-2 text-xs text-slate-500">{expense.notes}</p> : null}
                  <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
                    <span>{new Date(expense.createdAt).toLocaleDateString()}</span>
                    <button
                      onClick={() => deleteExpense(expense.id)}
                      className="rounded-full bg-amber-400/10 px-3 py-1 text-amber-200 hover:bg-amber-400/20 transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">No expenses logged yet. Add one to keep spending on track.</p>
            )}
          </div>
        </section>
      </div>
    </section>
  );
}
