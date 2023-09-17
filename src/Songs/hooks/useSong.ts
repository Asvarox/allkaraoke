import addHeadstart from 'Scenes/Convert/Steps/SyncLyricsToVideo/Helpers/addHeadstart';
import fixVideoGap from 'Scenes/Convert/Steps/SyncLyricsToVideo/Helpers/fixVideoGap';
import normaliseGap from 'Scenes/Convert/Steps/SyncLyricsToVideo/Helpers/normaliseGap';
import normaliseLyricSpaces from 'Scenes/Convert/Steps/SyncLyricsToVideo/Helpers/normaliseLyricSpaces';
import normaliseSectionPaddings from 'Scenes/Convert/Steps/SyncLyricsToVideo/Helpers/normaliseSectionPaddings';
import SongDao from 'Songs/SongsService';
import { Song } from 'interfaces';
import { useEffect, useState } from 'react';

const processSong = (song: Song) => {
  let processed = normaliseGap(song);
  processed = addHeadstart(processed);
  processed = normaliseSectionPaddings(processed);
  processed = normaliseLyricSpaces(processed);
  processed = fixVideoGap(processed);

  return processed;
};

export default function useSong(songId: string) {
  const [song, setSong] = useState<Song | null>(null);

  useEffect(() => {
    SongDao.get(songId).then((loadedSong) => setSong(loadedSong ? processSong(loadedSong) : loadedSong));
  }, [songId]);

  return {
    data: song,
  };
}
