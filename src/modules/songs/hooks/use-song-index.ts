import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSetlist } from '~/modules/songs/hooks/use-setlist';
import SongDao from '~/modules/songs/songs-service';

export default function useSongIndex(includeDeleted = false) {
  'use no memo'; // React Compiler: SongDao.getCurrentIndex() reads mutable external state directly (not via useState/useSyncExternalStore), so the compiler caches it as non-reactive and `isLoading` gets stuck at its initial value.
  const currentIndex = SongDao.getCurrentIndex();
  const [songIndex, setSongIndex] = useState(() => currentIndex || []);
  const setlist = useSetlist();

  const loadSongs = useCallback(() => SongDao.getIndex(includeDeleted).then(setSongIndex), [includeDeleted]);

  useEffect(() => {
    // setTimeout(loadSongs, 3000);
    loadSongs();
  }, [loadSongs]);

  const finalSongIndex = useMemo(
    () => (setlist.songList ? songIndex.filter((song) => setlist.songList?.includes(song.shortId)) : songIndex),
    [setlist.songList, songIndex],
  );

  return {
    data: finalSongIndex,
    reload: loadSongs,
    isLoading: currentIndex === null,
  };
}
