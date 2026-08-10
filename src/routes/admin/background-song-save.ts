import { useSyncExternalStore } from 'react';

import { Song } from '~/interfaces';
import SongDao from '~/modules/songs/songs-service';
import { shareSong } from '~/routes/edit/share-songs-modal';

import { updateAdminUnverifiedSong } from './unverified-songs-admin-api';

export interface PendingAdminUnverifiedSongSave {
  sharedSongId: string;
  label: string;
}

export interface FailedAdminUnverifiedSongSave extends PendingAdminUnverifiedSongSave {
  message: string;
}

interface AdminUnverifiedSongSaves {
  pending: PendingAdminUnverifiedSongSave[];
  failed: FailedAdminUnverifiedSongSave[];
}

const pendingSaves = new Map<string, PendingAdminUnverifiedSongSave>();
const failedSaves = new Map<string, FailedAdminUnverifiedSongSave>();
const saveChains = new Map<string, Promise<void>>();
const listeners = new Set<() => void>();

let snapshot: AdminUnverifiedSongSaves = { pending: [], failed: [] };

const warnAboutPendingSaves = (event: BeforeUnloadEvent) => {
  event.preventDefault();
};

const publishSaves = () => {
  snapshot = { pending: [...pendingSaves.values()], failed: [...failedSaves.values()] };
  listeners.forEach((listener) => listener());

  if (typeof window === 'undefined') return;

  if (snapshot.pending.length > 0) {
    window.addEventListener('beforeunload', warnAboutPendingSaves);
  } else {
    window.removeEventListener('beforeunload', warnAboutPendingSaves);
  }
};

const storeSong = async (sharedSongId: string, song: Song) => {
  await SongDao.store(song);
  await shareSong(song.id);
  await updateAdminUnverifiedSong(sharedSongId, song);
};

export const saveAdminUnverifiedSongInBackground = (sharedSongId: string, song: Song) => {
  const label = `${song.artist} - ${song.title}`;

  pendingSaves.set(sharedSongId, { sharedSongId, label });
  failedSaves.delete(sharedSongId);
  publishSaves();

  // Saves of the same song must not overlap so the last edit wins in Cloudflare KV.
  const previousSave = saveChains.get(sharedSongId) ?? Promise.resolve();
  const currentSave: Promise<void> = previousSave
    .then(() => storeSong(sharedSongId, song))
    .catch((error: unknown) => {
      failedSaves.set(sharedSongId, {
        sharedSongId,
        label,
        message: error instanceof Error ? error.message : 'unknown error',
      });
    })
    .finally(() => {
      // A newer save for the same song took over the chain - it owns the pending entry now.
      if (saveChains.get(sharedSongId) !== currentSave) return;

      saveChains.delete(sharedSongId);
      pendingSaves.delete(sharedSongId);
      publishSaves();
    });

  saveChains.set(sharedSongId, currentSave);

  return currentSave;
};

export const dismissFailedAdminUnverifiedSongSave = (sharedSongId: string) => {
  if (!failedSaves.delete(sharedSongId)) return;

  publishSaves();
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
};

const getSnapshot = () => snapshot;

export const useAdminUnverifiedSongSaves = () => useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
