import { Song } from 'interfaces';
import getSongFirstNoteMs from 'Songs/utils/getSongFirstNoteMs';

export default function fixVideoGap(song: Song) {
    const firstNote = getSongFirstNoteMs(song);

    return {
        ...song,
        videoGap: Math.round(Math.max(0, Math.min(song.videoGap ?? 0, firstNote / 1000 - 15))),
    };
}
