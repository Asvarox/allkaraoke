import { useEffect, useState } from 'react';
import { Song } from '~/interfaces';
import { getSharedSongById } from '~/modules/songs/shared-songs/api';
import SongDao from '~/modules/songs/songs-service';
import convertTxtToSong from '~/modules/songs/utils/convert-txt-to-song';
import { processSong } from '~/modules/songs/utils/process-song/process-song';

interface UseSongOptions {
  sourceType?: Song['sourceType'];
  externalSongId?: string;
}

export default function useSong(songId: string, options?: UseSongOptions) {
  const [song, setSong] = useState<Song | null>(null);

  useEffect(() => {
    const loadSong = async () => {
      if (options?.sourceType === 'shared' && options.externalSongId) {
        const sharedSong = await getSharedSongById(options.externalSongId);
        const parsedSong = convertTxtToSong(sharedSong.songTxt.replaceAll('\\n', '\n'));

        setSong(
          processSong({
            ...parsedSong,
            local: false,
            sourceType: 'shared',
            externalSongId: sharedSong.externalSongId,
            isUnverifiedSharedSong: true,
          }),
        );
        return;
      }

      const loadedSong = await SongDao.get(songId);
      setSong(loadedSong ? processSong(loadedSong) : loadedSong);
    };

    loadSong().catch(() => {
      setSong(null);
    });
  }, [songId, options?.externalSongId, options?.sourceType]);

  return {
    data: song,
  };
}
