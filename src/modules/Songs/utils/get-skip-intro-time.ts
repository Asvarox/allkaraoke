import { seconds, Song, SongPreview } from '~/interfaces';
import getSongFirstNoteMs from '~/modules/songs/utils/get-song-first-note-ms';
import isDev from '~/modules/utils/is-dev';
import isE2E from '~/modules/utils/is-e2-e';

export const SKIP_INTRO_MS = isDev() || isE2E() ? 1_000 : 8_000;

export default function getSkipIntroTime(song: Song | SongPreview): seconds {
  return Math.floor((getSongFirstNoteMs(song) - SKIP_INTRO_MS) / 1000);
}
