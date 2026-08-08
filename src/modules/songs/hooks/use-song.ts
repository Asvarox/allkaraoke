import { useEffect, useState } from 'react';

import { Song } from '~/interfaces';
import { LoadSongOptions, loadSongById } from '~/modules/songs/load-song';

export default function useSong(songId: string, options?: LoadSongOptions) {
  const [song, setSong] = useState<Song | null>(null);
  const sourceType = options?.sourceType;
  const sharedSongId = options?.sharedSongId;

  useEffect(() => {
    setSong(null);

    loadSongById(songId, { sourceType, sharedSongId })
      .then(setSong)
      .catch(() => {
        setSong(null);
      });
  }, [songId, sharedSongId, sourceType]);

  return {
    data: song,
  };
}
