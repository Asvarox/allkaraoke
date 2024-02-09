import SongDao from 'Songs/SongsService';
import { processSong } from 'Songs/utils/processSong/processSong';
import { Song } from 'interfaces';
import { useEffect, useState } from 'react';

export default function useSong(songId: string) {
  const [song, setSong] = useState<Song | null>(null);

  useEffect(() => {
    SongDao.get(songId).then((loadedSong) => setSong(loadedSong ? processSong(loadedSong) : loadedSong));
  }, [songId]);

  return {
    data: song,
  };
}
