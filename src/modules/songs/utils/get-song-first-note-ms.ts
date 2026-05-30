import { milliseconds, Song, SongPreview } from '~/interfaces';
import beatToMs from '~/modules/game-engine/game-state/helpers/beat-to-ms';
import { getFirstNoteStartFromSections } from '~/modules/songs/utils/notes-selectors';

export default function getSongFirstNoteMs(song: Song | SongPreview): milliseconds {
  const firstNote = Math.min(
    ...song.tracks.map((track) => ('sections' in track ? getFirstNoteStartFromSections(track.sections) : track.start)),
  );
  return beatToMs(firstNote, song) + song.gap;
}
