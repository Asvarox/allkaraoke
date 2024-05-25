import { SongPreview } from 'interfaces';
import SongDao from 'modules/Songs/SongsService';
import { useEffect, useRef, useState } from 'react';

export default function useSongIndex(includeDeleted = false) {
  const [songIndex, setSongIndex] = useState<SongPreview[] | null>(SongDao.getCurrentIndex());
  // Prevent recreating of the array every render
  const emptyList = useRef<SongPreview[]>([]);

  const loadSongs = () => SongDao.getIndex(includeDeleted).then(setSongIndex);

  useEffect(() => {
    // setTimeout(loadSongs, 3000);
    loadSongs();
  }, []);

  return {
    data: songIndex ?? emptyList.current,
    reload: loadSongs,
    isLoading: songIndex === null,
  };
}
