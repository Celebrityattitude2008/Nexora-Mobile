# Nexora — Personal Productivity Dashboard

## Overview
Nexora is a comprehensive personal productivity dashboard built with Next.js 14 (App Router). It features task tracking, calendar management, financial monitoring, news aggregation, and music integration.

## Tech Stack
- **Framework**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS + custom CSS variables for theming
- **Backend/Database**: Firebase (Auth + Realtime Database)
- **Mobile**: Capacitor (Android/iOS wrapping)
- **APIs**: Open-Meteo (weather), Spotify, NewsAPI, Finnhub/Alpha Vantage (finance)

## Project Structure
```
app/                  → Next.js pages (page.tsx per route)
  dashboard/          → Main productivity hub
  notes/              → Notes + weather
  finance/            → Stocks + news
  music/              → Spotify + creator panel
  calendar/           → Calendar + weather
components/           → React components
  AppNavigation.tsx   → Top header + mobile bottom nav
  AuthPanel.tsx       → Login/signup UI
  AuthProvider.tsx    → Firebase auth context
  LoadingScreen.tsx   → Animated loading overlay
  ProtectedPage.tsx   → Auth gate wrapper
  ThemeToggle.tsx     → Dark/light mode toggle
  WelcomeCard.tsx     → User profile card
  WeatherCard.tsx     → Live weather widget
  TaskList.tsx        → Task management + expense tracker + timer
  DailyGoals.tsx      → Habit/goal tracker
  AnalyticsPanel.tsx  → Productivity charts
  ...
lib/                  → Shared services (newsService, spotifyService)
scripts/              → Cron job scripts for data updates
public/               → Static assets, icons, PWA manifest
```

## Theme System
The app uses CSS variables for all colors, supporting seamless dark/light mode:

- Variables defined in `app/globals.css` under `:root` (dark) and `html.light` (light)
- Theme class (`dark` or `light`) is applied to `<html>` element
- An inline script in `app/layout.tsx` sets the theme class before paint (prevents flash)
- `components/ThemeToggle.tsx` handles user switching + localStorage persistence
- All Tailwind `slate-*` and `amber-*` classes are overridden via CSS variable mappings in `globals.css`

Key CSS variables:
- `--bg`, `--surface`, `--panel` — layered backgrounds
- `--text`, `--muted`, `--text-secondary` — text hierarchy
- `--border`, `--border-accent` — borders
- `--accent`, `--accent-soft`, `--accent-glow` — golden amber accent

## Animations
- Page enter: `animate-page-enter`
- Slide up/fade: `animate-slide-up-fade`
- Stagger children: `animate-stagger`
- Loading screen: animated pulsing rings + bouncing logo + dot pulse
- Micro-interactions: `hover:scale-[1.02]`, `active:scale-[0.98]` on buttons/links

## Environment Variables
All stored in Replit's shared environment (set via Replit Secrets/Env UI):
- `NEXT_PUBLIC_FIREBASE_*` — Firebase config
- `NEXT_PUBLIC_NEWS_API_KEY`
- `NEXT_PUBLIC_SPOTIFY_CLIENT_ID` / `NEXT_PUBLIC_SPOTIFY_CLIENT_SECRET`
- `NEXT_PUBLIC_FINNHUB_API_KEY` / `NEXT_PUBLIC_FINANCE_API_KEY`
- `NEXT_PUBLIC_ONESIGNAL_APP_ID`

## Dev Server
- Runs on port 5000
- Command: `npm install && npm run dev`
- Workflow: "Start application"

## Known Notes
- OneSignal push notifications only work in native Capacitor (iOS/Android), not web — the console warning is expected
- The hydration warning about `class` attribute on `<html>` is from the inline theme script and is harmless in production
