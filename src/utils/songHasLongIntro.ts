import { Song, SongPreview } from 'interfaces';
import getSongFirstNoteMs from 'Songs/utils/getSongFirstNoteMs';

const SKIP_INTRO_THRESHOLD_MS = 20_000;

export default function songHasLongIntro(song: Song | SongPreview) {
    const lyricStartMs = getSongFirstNoteMs(song);

    return lyricStartMs - (song.videoGap ?? 0) * 1000 > SKIP_INTRO_THRESHOLD_MS;
}
