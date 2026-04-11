'use client';

import { useEffect, useState } from 'react';

const themeStorageKey = 'theme-mode';

export default function ThemeToggle() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = window.localStorage.getItem(themeStorageKey) as 'light' | 'dark' | null;
    const sys = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const initial = saved ?? sys;
    document.documentElement.classList.remove(initial === 'dark' ? 'light' : 'dark');
    document.documentElement.classList.add(initial);
    setTheme(initial);
  }, []);

  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    window.localStorage.setItem(themeStorageKey, next);
    document.documentElement.classList.remove(theme);
    document.documentElement.classList.add(next);
    setTheme(next);
  };

  if (!mounted) {
    return <div style={{ width: 64, height: 36 }} />;
  }

  const isLight = theme === 'light';

  return (
    <button
      type="button"
      aria-label={`Switch to ${isLight ? 'dark' : 'light'} mode`}
      onClick={toggle}
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        width: 64,
        height: 36,
        borderRadius: 999,
        padding: 4,
        border: '1px solid var(--border)',
        backgroundColor: 'var(--surface-80)',
        cursor: 'pointer',
        transition: 'background-color 0.3s ease, border-color 0.3s ease',
        outline: 'none',
      }}
    >
      <span
        style={{
          position: 'absolute',
          left: isLight ? 'calc(100% - 32px)' : 4,
          top: 4,
          width: 28,
          height: 28,
          borderRadius: '50%',
          backgroundColor: 'var(--accent)',
          transition: 'left 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 14,
        }}
      >
        {isLight ? '☀️' : '🌙'}
      </span>
      <span
        style={{
          position: 'absolute',
          left: 10,
          fontSize: 12,
          opacity: isLight ? 0 : 1,
          transition: 'opacity 0.2s ease',
        }}
      >
        🌙
      </span>
      <span
        style={{
          position: 'absolute',
          right: 10,
          fontSize: 12,
          opacity: isLight ? 1 : 0,
          transition: 'opacity 0.2s ease',
        }}
      >
        ☀️
      </span>
    </button>
  );
}
