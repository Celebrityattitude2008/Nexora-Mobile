'use client';

import { useState } from 'react';
import Link from 'next/link';

const sections = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Notes', href: '/notes' },
  { label: 'Music', href: '/music' },
  { label: 'Finance', href: '/finance' },
  { label: 'Calendar', href: '/calendar' },
];

export default function AppNavigation() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/95 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <div>
          <Link href="/" className="text-lg font-semibold text-white">
            Nexora
          </Link>
          <p className="text-xs text-slate-500">split sections with menu navigation</p>
        </div>

        <div className="hidden items-center gap-3 sm:flex">
          {sections.map((section) => (
            <Link
              key={section.href}
              href={section.href}
              className="rounded-full px-4 py-2 text-sm text-slate-300 transition hover:bg-slate-800 hover:text-white"
            >
              {section.label}
            </Link>
          ))}
        </div>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-full border border-slate-700 bg-slate-900/80 px-3 py-2 text-slate-300 transition hover:border-slate-500 hover:text-white sm:hidden"
          onClick={() => setMenuOpen((current) => !current)}
          aria-expanded={menuOpen}
        >
          <span className="sr-only">Toggle navigation menu</span>
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {menuOpen ? (
        <div className="space-y-2 border-t border-slate-800 bg-slate-950/98 px-4 py-4 sm:hidden">
          {sections.map((section) => (
            <Link
              key={section.href}
              href={section.href}
              className="block rounded-3xl px-4 py-3 text-sm text-slate-300 transition hover:bg-slate-800 hover:text-white"
              onClick={() => setMenuOpen(false)}
            >
              {section.label}
            </Link>
          ))}
        </div>
      ) : null}
    </nav>
  );
}
