import { Song } from '~/interfaces';
import { isInstrumentalVersion } from '~/modules/songs/utils/to-instrumental-version';

/**
 * Runs steps that move the notes (in beats) and the gap together, then moves the stored instrumental's gap by the
 * same number of beats, so a saved song keeps both versions in sync. Its video gap isn't touched.
 */
export default function keepInstrumentalInSync(song: Song, process: (song: Song) => Song): Song {
  const processed = process(song);
  // Already swapped in, so the song's own gap is the instrumental's
  if (!song.instrumental || isInstrumentalVersion(song)) return processed;

  const speed = song.bpm / (song.instrumental.bpm ?? song.bpm);
  return {
    ...processed,
    instrumental: { ...song.instrumental, gap: song.instrumental.gap + (processed.gap - song.gap) * speed },
  };
}
