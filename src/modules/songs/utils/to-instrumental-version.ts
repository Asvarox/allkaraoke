import { Song } from '~/interfaces';

type VersionedSong = Pick<
  Song,
  'video' | 'gap' | 'videoGap' | 'volume' | 'duration' | 'previewStart' | 'previewEnd' | 'instrumental' | 'bpm'
>;

/** Where a moment of the original video (seconds) is in the instrumental: shifted, and stretched when its BPM differs */
export const toInstrumentalTime = (song: Pick<VersionedSong, 'gap' | 'bpm' | 'instrumental'>, time: number) =>
  song.instrumental
    ? song.instrumental.gap / 1000 + (time - song.gap / 1000) * (song.bpm / (song.instrumental.bpm ?? song.bpm))
    : time;

/**
 * Swaps in the instrumental's video and timings. Notes are shared, so everything downstream works unchanged.
 * The preview is set on the original video, so it moves to the same moment of the instrumental.
 */
export default function toInstrumentalVersion<T extends VersionedSong>(song: T): T {
  if (!song.instrumental || isInstrumentalVersion(song)) return song;
  const { video, gap, videoGap, volume, duration, bpm } = song.instrumental;
  const shift = (time: number | undefined) =>
    time === undefined ? undefined : Math.max(0, toInstrumentalTime(song, time));

  return {
    ...song,
    video,
    gap,
    videoGap,
    duration,
    bpm: bpm ?? song.bpm,
    volume: volume ?? song.volume,
    previewStart: shift(song.previewStart),
    previewEnd: shift(song.previewEnd),
  };
}

/** The song was already swapped to its instrumental, e.g. a chart the online room received */
export const isInstrumentalVersion = (song: Pick<Song, 'video' | 'instrumental'>) =>
  !!song.instrumental && song.video === song.instrumental.video;
