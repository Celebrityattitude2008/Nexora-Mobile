'use client';

import { useEffect, useState } from 'react';

const themeStorageKey = 'theme-mode';
const themeStyleKey = 'theme-style';
const accentStorageKey = 'theme-accent';
const styleClasses = ['theme-default', 'theme-neon', 'theme-glass'] as const;
const accentPresets = ['#ffcb74', '#22d3ee', '#a855f7', '#10b981', '#f97316'];

type ThemeStyle = 'default' | 'neon' | 'glass';
type ThemeMode = 'light' | 'dark';

function parseHexColor(hex: string) {
  const normalized = hex.replace('#', '');
  if (normalized.length !== 6) return [255, 203, 116];
  const value = parseInt(normalized, 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

function applyThemeSettings(mode: ThemeMode, style: ThemeStyle, accent: string) {
  const root = document.documentElement;
  root.classList.remove('light', 'dark');
  root.classList.add(mode);

  styleClasses.forEach((styleClass) => root.classList.remove(styleClass));
  root.classList.add(`theme-${style}`);

  const [r, g, b] = parseHexColor(accent);
  root.style.setProperty('--accent', accent);
  root.style.setProperty('--accent-soft', `rgba(${r}, ${g}, ${b}, 0.14)`);
  root.style.setProperty('--accent-glow', `rgba(${r}, ${g}, ${b}, 0.24)`);
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<ThemeMode>('dark');
  const [style, setStyle] = useState<ThemeStyle>('default');
  const [accent, setAccent] = useState('#ffcb74');
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = window.localStorage.getItem(themeStorageKey) as ThemeMode | null;
    const savedStyle = window.localStorage.getItem(themeStyleKey) as ThemeStyle | null;
    const savedAccent = window.localStorage.getItem(accentStorageKey);
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const nextTheme = savedTheme ?? systemTheme;
    const nextStyle = savedStyle ?? 'default';
    const nextAccent = savedAccent ?? '#ffcb74';

    setTheme(nextTheme);
    setStyle(nextStyle);
    setAccent(nextAccent);
    applyThemeSettings(nextTheme, nextStyle, nextAccent);
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    window.localStorage.setItem(themeStorageKey, next);
    applyThemeSettings(next, style, accent);
  };

  const updateStyle = (value: ThemeStyle) => {
    setStyle(value);
    window.localStorage.setItem(themeStyleKey, value);
    applyThemeSettings(theme, value, accent);
  };

  const updateAccent = (value: string) => {
    setAccent(value);
    window.localStorage.setItem(accentStorageKey, value);
    applyThemeSettings(theme, style, value);
  };

  if (!mounted) {
    return <div style={{ width: 64, height: 36 }} />;
  }

  const isLight = theme === 'light';

  return (
    <div className="relative">
      <button
        type="button"
        aria-label={`Switch to ${isLight ? 'dark' : 'light'} mode`}
        onClick={toggleTheme}
        className="relative inline-flex h-9 w-16 items-center rounded-full border px-1 transition-colors duration-300"
        style={{
          borderColor: 'var(--border)',
          backgroundColor: 'var(--surface-80)',
          cursor: 'pointer',
        }}
      >
        <span
          className="absolute left-1 top-1 h-7 w-7 rounded-full transition-all duration-300"
          style={{
            transform: isLight ? 'translateX(28px)' : 'translateX(0px)',
            backgroundColor: 'var(--accent)',
          }}
        />
        <span className="absolute left-3 text-[10px] text-slate-400">☀️</span>
        <span className="absolute right-3 text-[10px] text-slate-400">🌙</span>
      </button>

      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="ml-2 inline-flex h-9 items-center rounded-full border px-3 text-sm font-medium transition-colors duration-300"
        style={{
          borderColor: 'var(--border)',
          backgroundColor: 'var(--surface-80)',
          color: 'var(--text)',
        }}
      >
        Style
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-3 w-72 rounded-3xl border border-slate-700/80 bg-slate-950/95 p-4 shadow-glow backdrop-blur-xl">
          <div className="mb-4">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Visual mode</p>
            <div className="mt-3 grid gap-2">
              {(['default', 'neon', 'glass'] as ThemeStyle[]).map((styleOption) => (
                <button
                  key={styleOption}
                  type="button"
                  onClick={() => updateStyle(styleOption)}
                  className={`rounded-2xl px-3 py-2 text-left text-sm transition ${
                    style === styleOption ? 'bg-amber-400/20 text-amber-200 border border-amber-400/40' : 'bg-slate-900/80 text-slate-300 border border-slate-700/80'
                  }`}
                >
                  {styleOption === 'default' ? 'Classic' : styleOption === 'neon' ? 'Neon' : 'Glass'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Accent</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {accentPresets.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => updateAccent(color)}
                  className={`h-8 w-8 rounded-full border transition ${accent === color ? 'border-amber-300' : 'border-slate-700/80'}`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
