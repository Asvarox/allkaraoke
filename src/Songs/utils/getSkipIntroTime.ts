import { seconds, Song, SongPreview } from 'interfaces';
import getSongFirstNoteMs from 'Songs/utils/getSongFirstNoteMs';
import isDev from 'utils/isDev';
import isE2E from 'utils/isE2E';

export const SKIP_INTRO_MS = isDev() || isE2E() ? 1_000 : 15_000;

export default function getSkipIntroTime(song: Song | SongPreview): seconds {
    return (song.videoGap ?? 0) + Math.floor((getSongFirstNoteMs(song) - SKIP_INTRO_MS) / 1000);
}
