'use client';

import { useEffect, useMemo, useState } from 'react';
import { onValue, push, remove, ref } from 'firebase/database';
import { userCalendarEventsRef, database } from './firebase';
import type { User } from 'firebase/auth';

type CalendarEvent = {
  id: string;
  title: string;
  datetime: string;
  description?: string;
};

interface CalendarWidgetProps {
  user: User;
}

export function CalendarWidget({ user }: CalendarWidgetProps) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [title, setTitle] = useState('');
  const [datetime, setDatetime] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    const calendarRef = userCalendarEventsRef(user.uid);
    const unsubscribe = onValue(calendarRef, (snapshot) => {
      const value = snapshot.val();
      if (!value) {
        setEvents([]);
        return;
      }

      const parsed = Object.entries(value).map(([key, item]) => ({
        id: key,
        ...(item as Omit<CalendarEvent, 'id'>),
      }));
      setEvents(parsed);
    });

    return unsubscribe;
  }, [user.uid]);

  const upcomingEvents = useMemo(
    () => [...events].sort((a, b) => a.datetime.localeCompare(b.datetime)),
    [events],
  );

  const createEvent = async () => {
    if (!title.trim() || !datetime) return;
    await push(userCalendarEventsRef(user.uid), {
      title: title.trim(),
      datetime,
      description: description.trim(),
    });
    setTitle('');
    setDatetime('');
    setDescription('');
  };

  const deleteEvent = async (eventId: string) => {
    await remove(ref(database, `users/${user.uid}/calendarEvents/${eventId}`));
  };

  return (
    <section className="rounded-3xl border border-slate-700/80 bg-slate-900/80 p-6 shadow-panel backdrop-blur-xl">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Calendar</p>
          <h2 className="mt-3 text-2xl font-semibold text-white">Create and track events</h2>
        </div>
        <div className="rounded-2xl bg-slate-800/90 px-4 py-3 text-sm text-slate-300">Realtime sync</div>
      </div>

      <div className="grid gap-4 rounded-3xl border border-slate-700/60 bg-slate-950/70 p-4">
        <div className="grid gap-3">
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Event title"
            className="rounded-3xl border border-slate-700/80 bg-slate-900/90 px-4 py-3 text-slate-100 outline-none focus:border-amber-400"
          />
          <input
            type="datetime-local"
            value={datetime}
            onChange={(event) => setDatetime(event.target.value)}
            className="rounded-3xl border border-slate-700/80 bg-slate-900/90 px-4 py-3 text-slate-100 outline-none focus:border-amber-400"
          />
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={3}
            placeholder="Optional details"
            className="rounded-3xl border border-slate-700/80 bg-slate-900/90 px-4 py-3 text-slate-100 outline-none focus:border-amber-400"
          />
          <button
            onClick={createEvent}
            className="rounded-full bg-amber-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-300"
          >
            Add event
          </button>
        </div>

        <div className="mt-4 space-y-3">
          {upcomingEvents.length ? (
            upcomingEvents.map((event) => (
              <div key={event.id} className="rounded-3xl border border-slate-700/60 bg-slate-950/90 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-white">{event.title}</p>
                    <p className="text-sm text-slate-400">
                      {new Date(event.datetime).toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={() => deleteEvent(event.id)}
                    className="rounded-full bg-red-600/10 px-3 py-1 text-xs font-semibold text-red-300 hover:bg-red-600/20 transition"
                  >
                    Delete
                  </button>
                </div>
                {event.description ? <p className="mt-3 text-sm text-slate-400">{event.description}</p> : null}
              </div>
            ))
          ) : (
            <div className="rounded-3xl border border-slate-700/60 bg-slate-950/90 p-4 text-slate-400">
              No calendar events yet. Add one to begin planning your week.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
