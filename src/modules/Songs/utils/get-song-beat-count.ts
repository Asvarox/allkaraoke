import { Song } from '~/interfaces';
import isNotesSection from '~/modules/songs/utils/is-notes-section';
import { getLastNoteEnd } from '~/modules/songs/utils/notes-selectors';

export default function getSongBeatCount(song: Song) {
  return Math.max(
    ...song.tracks.map((track) => {
      const lastNoteSection = track.sections.filter(isNotesSection).at(-1);
      return lastNoteSection ? getLastNoteEnd(lastNoteSection) : 0;
    }),
  );
}
