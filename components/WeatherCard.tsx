'use client';

import { useEffect, useState } from 'react';

type WeatherData = {
  temperature?: number;
  description: string;
  location: string;
};

const defaultWeather: WeatherData = {
  temperature: 72,
  description: 'Sunny',
  location: 'Benin, NG',
};

export function WeatherCard() {
  const [weather, setWeather] = useState<WeatherData>(defaultWeather);
  const [status, setStatus] = useState('Loading weather...');

  useEffect(() => {
    if (!navigator.geolocation) {
      setStatus('Geolocation unavailable');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m&current_weather=true&timezone=auto`;
          const response = await fetch(url);
          const data = await response.json();
          const current = data.current_weather;
          setWeather({
            temperature: Math.round(current.temperature),
            description: 'Clear skies',
            location: data.timezone ?? 'Your location',
          });
          setStatus('');
        } catch (error) {
          setStatus('Weather fetch failed');
        }
      },
      () => {
        setStatus('Location permission denied');
      },
    );
  }, []);

  return (
    <section className="rounded-3xl border border-slate-700/80 bg-slate-900/80 p-6 shadow-panel backdrop-blur-xl">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Weather</p>
          <h2 className="mt-3 text-2xl font-semibold text-white">External data integration</h2>
        </div>
        <div className="rounded-2xl bg-slate-800/90 px-4 py-3 text-sm text-slate-300">Live</div>
      </div>
      <div className="grid gap-6 rounded-3xl border border-slate-700/60 bg-slate-950/70 p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-5xl font-semibold text-amber-300">{weather.temperature}°</p>
            <p className="mt-2 text-sm text-slate-400">{weather.description}</p>
          </div>
          <div className="h-20 w-20 rounded-3xl bg-slate-800/90 p-4 text-center text-white">
            <span className="block text-3xl">☀️</span>
            <span className="text-xs text-slate-400">Now</span>
          </div>
        </div>
        <div>
          <p className="text-sm text-slate-400">Location</p>
          <p className="mt-1 text-lg font-medium text-white">{weather.location}</p>
        </div>
        {status ? <p className="text-sm text-amber-300">{status}</p> : null}
      </div>
    </section>
  );
}
