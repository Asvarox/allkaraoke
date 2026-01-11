import { useEffect, useState } from 'react';
import { Song } from '~/interfaces';
import SongDao from '~/modules/Songs/SongsService';
import { processSong } from '~/modules/Songs/utils/processSong/processSong';

export default function useSong(songId: string) {
  const [song, setSong] = useState<Song | null>(null);

  useEffect(() => {
    SongDao.get(songId).then((loadedSong) => setSong(loadedSong ? processSong(loadedSong) : loadedSong));
  }, [songId]);

  return {
    data: song,
  };
}
