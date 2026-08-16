import { Song } from '~/interfaces';
import SongDao from '~/modules/songs/songs-service';
import { getUnverifiedSongById } from '~/modules/songs/unverified-songs/api';
import convertTxtToSong from '~/modules/songs/utils/convert-txt-to-song';
import { processSong } from '~/modules/songs/utils/process-song/process-song';

export interface LoadSongOptions {
  sourceType?: Song['sourceType'];
  sharedSongId?: string;
}

/**
 * Loads and processes the full song for any source (built-in, local, shared/unverified). The single
 * loader behind both `useSong` (local play, editor) and the online chart transfer, so the two can't
 * disagree on what a loaded song looks like.
 *
 * Shared songs come back from the API as bare txt, which carries no provenance — the fields the
 * local library rows have natively (`local`, `sourceType`, `sharedSongId`, `isUnverifiedSong`) are
 * stamped on here so downstream checks such as the pause menu's forced rating for unverified songs
 * behave the same however the song was obtained.
 *
 * Resolves to `null` when the song isn't found; callers that can't continue without it throw.
 */
export const loadSongById = async (songId: string, options?: LoadSongOptions): Promise<Song | null> => {
  if (options?.sourceType === 'unverified' && options.sharedSongId) {
    const unverifiedSong = await getUnverifiedSongById(options.sharedSongId);
    const parsedSong = convertTxtToSong(unverifiedSong.songTxt.replaceAll('\\n', '\n'));

    return processSong({
      ...parsedSong,
      local: false,
      sourceType: 'unverified',
      // The API response is the authority on the id, not the caller's copy of it
      sharedSongId: unverifiedSong.sharedSongId,
      isUnverifiedSong: true,
    });
  }

  const loadedSong = await SongDao.get(songId);
  return loadedSong ? processSong(loadedSong) : null;
};
