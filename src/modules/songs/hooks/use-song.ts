import { useEffect, useState } from 'react';
import { Song } from '~/interfaces';
import SongDao from '~/modules/songs/songs-service';
import { getUnverifiedSongById } from '~/modules/songs/unverified-songs/api';
import convertTxtToSong from '~/modules/songs/utils/convert-txt-to-song';
import { processSong } from '~/modules/songs/utils/process-song/process-song';

interface UseSongOptions {
  sourceType?: Song['sourceType'];
  sharedSongId?: string;
}

export default function useSong(songId: string, options?: UseSongOptions) {
  const [song, setSong] = useState<Song | null>(null);

  useEffect(() => {
    const loadSong = async () => {
      if (options?.sourceType === 'unverified' && options.sharedSongId) {
        const unverifiedSong = await getUnverifiedSongById(options.sharedSongId);
        const parsedSong = convertTxtToSong(unverifiedSong.songTxt.replaceAll('\\n', '\n'));

        setSong(
          processSong({
            ...parsedSong,
            local: false,
            sourceType: 'unverified',
            sharedSongId: unverifiedSong.sharedSongId,
            isUnverifiedSong: true,
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
  }, [songId, options?.sharedSongId, options?.sourceType]);

  return {
    data: song,
  };
}
