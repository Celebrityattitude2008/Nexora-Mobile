'use client';

import { get, ref, set, push } from 'firebase/database';
import { database } from '../components/firebase';

export type TimerEntry = {
  message: string;
  triggerAt: number;
  triggered: boolean;
  type: 'task-stop' | 'goal-reminder' | 'custom';
  relatedId?: string;
  createdAt: number;
};

const _handles = new Map<string, ReturnType<typeof setTimeout>>();

export function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return Promise.resolve('denied' as NotificationPermission);
  }
  if (Notification.permission !== 'default') {
    return Promise.resolve(Notification.permission);
  }
  return Notification.requestPermission();
}

export function showNotification(title: string, body: string) {
  if (typeof window === 'undefined' || !('Notification' in window)) return;
  if (Notification.permission === 'granted') {
    try {
      new Notification(title, { body, icon: '/icons/icon-192.png' });
    } catch {}
  }
}

function _setLocal(userId: string, timerId: string, message: string, delayMs: number) {
  if (_handles.has(timerId)) clearTimeout(_handles.get(timerId)!);
  const h = setTimeout(async () => {
    showNotification('⏰ Nexora', message);
    _handles.delete(timerId);
    try {
      await set(ref(database, `users/${userId}/timers/${timerId}/triggered`), true);
    } catch {}
  }, Math.max(0, delayMs));
  _handles.set(timerId, h);
}

export async function scheduleTimer(
  userId: string,
  message: string,
  delayMs: number,
  type: TimerEntry['type'] = 'custom',
  relatedId?: string
): Promise<string> {
  await requestNotificationPermission();

  const timerRef = push(ref(database, `users/${userId}/timers`));
  const timerId = timerRef.key!;

  await set(timerRef, {
    message,
    triggerAt: Date.now() + delayMs,
    triggered: false,
    type,
    createdAt: Date.now(),
    ...(relatedId ? { relatedId } : {}),
  } satisfies TimerEntry);

  _setLocal(userId, timerId, message, delayMs);
  return timerId;
}

export async function checkMissedTimers(userId: string): Promise<void> {
  try {
    const snap = await get(ref(database, `users/${userId}/timers`));
    if (!snap.exists()) return;
    const now = Date.now();
    snap.forEach((child) => {
      const t = child.val() as TimerEntry;
      const id = child.key!;
      if (t.triggered) return;
      if (t.triggerAt <= now) {
        showNotification('⏰ Nexora (missed)', t.message);
        set(ref(database, `users/${userId}/timers/${id}/triggered`), true).catch(() => {});
      } else {
        _setLocal(userId, id, t.message, t.triggerAt - now);
      }
    });
  } catch {}
}

export function cancelLocalTimer(timerId: string) {
  if (_handles.has(timerId)) {
    clearTimeout(_handles.get(timerId)!);
    _handles.delete(timerId);
  }
}
