import { Song } from '~/interfaces';
import isNotesSection from '~/modules/Songs/utils/isNotesSection';
import { getLastNoteEnd } from '~/modules/Songs/utils/notesSelectors';

export default function getSongBeatCount(song: Song) {
  return Math.max(
    ...song.tracks.map((track) => {
      const lastNoteSection = track.sections.filter(isNotesSection).at(-1);
      return lastNoteSection ? getLastNoteEnd(lastNoteSection) : 0;
    }),
  );
}
