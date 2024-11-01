import SongDao from 'modules/Songs/SongsService';
import { useCallback, useEffect, useState } from 'react';

export default function useSongIndex(includeDeleted = false) {
  const currentIndex = SongDao.getCurrentIndex();
  const [songIndex, setSongIndex] = useState(() => currentIndex || []);

  const loadSongs = useCallback(() => SongDao.getIndex(includeDeleted).then(setSongIndex), [includeDeleted]);

  useEffect(() => {
    // setTimeout(loadSongs, 3000);
    loadSongs();
  }, [loadSongs]);

  return {
    data: songIndex,
    reload: loadSongs,
    isLoading: currentIndex === null,
  };
}
