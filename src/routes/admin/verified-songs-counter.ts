import dayjs from 'dayjs';
import { useSyncExternalStore } from 'react';

import storage from '~/modules/utils/storage';

const STORAGE_KEY = 'admin-verified-songs-today';
const DAY_RESET_HOUR = 4;

interface VerifiedSongsDay {
  day: string;
  sharedSongIds: string[];
}

const listeners = new Set<() => void>();

// The "day" starts at 4am so late-night verification sessions count towards the previous day.
export const getVerificationDay = (now = new Date()) =>
  dayjs(now).subtract(DAY_RESET_HOUR, 'hour').format('YYYY-MM-DD');

const readToday = (): string[] => {
  const stored = storage.local.getItem<VerifiedSongsDay>(STORAGE_KEY);

  if (!stored || stored.day !== getVerificationDay() || !Array.isArray(stored.sharedSongIds)) return [];

  return stored.sharedSongIds;
};

export const markAdminSongVerified = (sharedSongId: string) => {
  const sharedSongIds = readToday();

  if (sharedSongIds.includes(sharedSongId)) return;

  storage.local.setItem<VerifiedSongsDay>(STORAGE_KEY, {
    day: getVerificationDay(),
    sharedSongIds: [...sharedSongIds, sharedSongId],
  });
  listeners.forEach((listener) => listener());
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  window.addEventListener('storage', listener);

  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', listener);
  };
};

const getSnapshot = () => readToday().length;

export const useVerifiedSongsTodayCount = () => useSyncExternalStore(subscribe, getSnapshot, () => 0);
