import posthog from 'posthog-js';
import { useCallback } from 'react';
import createPersistedState from 'use-persisted-state';

import { serverRpc } from '~/modules/remote-mic/network/client';

export const useSavedSongs = createPersistedState<string[]>('remote-mic-saved-songs');

export const useMySongList = () => {
  const [savedSongList, setSavedSongList] = useSavedSongs([]);

  const toggleSong = useCallback(
    (songId: string) => {
      if (savedSongList.includes(songId)) {
        setSavedSongList((current) => current.filter((id) => id !== songId));
        void serverRpc.songs.sendMyList({ deleted: [songId] });
      } else {
        posthog.capture('remote-song-list-add', { songId });
        setSavedSongList((current) => [...current, songId]);
        void serverRpc.songs.sendMyList({ added: [songId] });
      }
    },
    [savedSongList, setSavedSongList],
  );

  return { savedSongList, toggleSong };
};
