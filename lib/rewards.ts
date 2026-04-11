import { get, ref, set } from 'firebase/database';
import { database, userBadgesRef, userStatsRef } from '../components/firebase';

export type UserStats = {
  xp: number;
  level: number;
  lastLogin: string;
  dailyLoginStreak: number;
};

const defaultStats: UserStats = {
  xp: 0,
  level: 1,
  lastLogin: '',
  dailyLoginStreak: 0,
};

export async function awardXp(userId: string, amount: number) {
  const statsRef = userStatsRef(userId);
  const snapshot = await get(statsRef);
  const current = (snapshot.val() as UserStats | null) ?? defaultStats;
  const nextXp = Math.max(0, current.xp + amount);
  const nextLevel = Math.max(1, Math.floor(nextXp / 100) + 1);

  const updated: UserStats = {
    ...current,
    xp: nextXp,
    level: nextLevel,
    lastLogin: current.lastLogin,
    dailyLoginStreak: current.dailyLoginStreak,
  };
  await set(statsRef, updated);
  return updated;
}

export async function awardDailyLoginXp(userId: string) {
  const today = new Date().toISOString().slice(0, 10);
  const statsRef = userStatsRef(userId);
  const snapshot = await get(statsRef);
  const current = (snapshot.val() as UserStats | null) ?? defaultStats;

  if (current.lastLogin === today) {
    return current;
  }

  const streak = current.lastLogin
    ? current.dailyLoginStreak + 1
    : 1;

  const nextXp = Math.max(0, current.xp + 15);
  const nextLevel = Math.max(1, Math.floor(nextXp / 100) + 1);

  const updated: UserStats = {
    ...current,
    xp: nextXp,
    level: nextLevel,
    lastLogin: today,
    dailyLoginStreak: streak,
  };
  await set(statsRef, updated);
  return updated;
}

export async function setBadge(userId: string, badgeId: string) {
  const badgeRef = userBadgesRef(userId).child(badgeId);
  await set(badgeRef, true);
}

export async function hasBadge(userId: string, badgeId: string) {
  const snapshot = await get(userBadgesRef(userId).child(badgeId));
  return snapshot.exists();
}
