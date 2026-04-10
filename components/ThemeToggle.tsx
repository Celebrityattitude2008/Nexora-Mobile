'use client';

import { useEffect, useState } from 'react';

const themeStorageKey = 'theme-mode';

export default function ThemeToggle() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    const savedTheme = window.localStorage.getItem(themeStorageKey) as 'light' | 'dark' | null;
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const initialTheme = savedTheme ?? systemTheme;

    document.documentElement.classList.remove(initialTheme === 'dark' ? 'light' : 'dark');
    document.documentElement.classList.add(initialTheme);
    setTheme(initialTheme);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    window.localStorage.setItem(themeStorageKey, nextTheme);
    document.documentElement.classList.remove(theme);
    document.documentElement.classList.add(nextTheme);
    setTheme(nextTheme);
  };

  return (
    <button
      type="button"
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      onClick={toggleTheme}
      className="relative inline-flex h-9 w-16 items-center rounded-full border border-white/10 bg-white/5 p-1 text-xs text-slate-100 transition hover:border-amber-300/60 focus:outline-none focus:ring-2 focus:ring-amber-300/40"
    >
      <span
        className={`absolute left-1 top-1 h-7 w-7 rounded-full bg-amber-300 transition-transform ${
          theme === 'light' ? 'translate-x-7' : 'translate-x-0'
        }`}
      />
      <span className="absolute left-1.5 top-1.5 text-[10px] text-slate-950">☾</span>
      <span className="absolute right-1.5 top-1.5 text-[10px] text-slate-950">☀</span>
    </button>
  );
}
