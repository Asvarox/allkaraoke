import { seconds, Song } from '~/interfaces';
import getSongBeatLength from '~/modules/songs/utils/get-song-beat-length';
import isNotesSection from '~/modules/songs/utils/is-notes-section';
import { getFirstNoteStartFromSections, getLastNoteEndFromSections } from '~/modules/songs/utils/notes-selectors';

/**
 * Share (0-1) of the playable video (duration minus video gap) spanned by the lyrics, from the earliest
 * first note to the latest last note across all tracks. Returns `null` when the video length is unknown.
 */
export default function getLyricsCoverage(song: Song, videoDuration: seconds): number | null {
  const playableDuration = (videoDuration - (song.videoGap ?? 0)) * 1000;
  if (playableDuration <= 0) return null;

  const tracksWithNotes = song.tracks.filter((track) => track.sections.some(isNotesSection));
  if (tracksWithNotes.length === 0) return 0;

  const firstNoteStart = Math.min(...tracksWithNotes.map((track) => getFirstNoteStartFromSections(track.sections)));
  const lastNoteEnd = Math.max(...tracksWithNotes.map((track) => getLastNoteEndFromSections(track.sections)));
  const lyricsDuration = (lastNoteEnd - firstNoteStart) * getSongBeatLength(song);

  return Math.min(Math.max(lyricsDuration / playableDuration, 0), 1);
}
