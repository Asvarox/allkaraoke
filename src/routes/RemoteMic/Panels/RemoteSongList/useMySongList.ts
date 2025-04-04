import RemoteMicClient from 'modules/RemoteMic/Network/Client';
import posthog from 'posthog-js';
import { useCallback } from 'react';
import createPersistedState from 'use-persisted-state';

export const useSavedSongs = createPersistedState<string[]>('remote-mic-saved-songs');

export const useMySongList = () => {
  const [savedSongList, setSavedSongList] = useSavedSongs([]);

  const toggleSong = useCallback(
    (songId: string) => {
      if (savedSongList.includes(songId)) {
        setSavedSongList((current) => current.filter((id) => id !== songId));
        RemoteMicClient.sendMySongList({
          deleted: [songId],
        });
      } else {
        posthog.capture('remote-song-list-add', { songId });
        setSavedSongList((current) => [...current, songId]);
        RemoteMicClient.sendMySongList({
          added: [songId],
        });
      }
    },
    [savedSongList],
  );

  return { savedSongList, toggleSong };
};
