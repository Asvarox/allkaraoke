import { FrequencyRecord, Note, NoteFrequencyRecord, PlayerNote, Section, Song, SongPreview } from 'interfaces';
import { getSongPreview } from 'modules/Songs/utils';
import range from 'modules/utils/range';

export const generateNote = (start: number, length = 1, data: Partial<Note> = {}): Note => ({
  start,
  length,
  type: 'normal',
  lyrics: 'test',
  pitch: 5,
  ...data,
});

export const generatePlayerNote = (
  note: Note,
  distance: number,
  startOffset: number = 0,
  length: number = 1,
  isPerfect = false,
  vibrato = false,
  frequencyRecords: NoteFrequencyRecord[] = [],
): PlayerNote => ({
  start: note.start + startOffset,
  length,
  distance,
  note,
  isPerfect,
  vibrato,
  frequencyRecords,
});

export const generateSong = (tracks: Section[][], data: Partial<Song> = {}): Song =>
  ({
    artist: 'artistTest',
    title: 'titleTest',
    video: 'videoTest',
    language: ['english'],
    gap: 0,
    bpm: 60, // makes it easy to calc - beatLength = 1ms
    bar: 1000, // makes it easy to calc - beatLength = 1ms
    tracks: tracks.map((sections) => ({ sections, changes: [] })),
    mergedTrack: { sections: [], changes: [] },
    ...data,
  }) as any as Song;

export const generateSongPreview = (tracks: Section[][], data: Partial<Song> = {}): SongPreview =>
  getSongPreview(generateSong(tracks, data));

export const generateSection = (start: number, _length: number, notesCount: number): Section => ({
  type: 'notes',
  start,
  notes: range(notesCount).map((val) => generateNote(start + val, 1)),
});

export function createDataSequence(start: number, end: number, length: number, repeats = 5) {
  const step = (end - start) / length;

  const data: number[] = [];

  for (let i = 0; i < length * repeats; i++) data.push(start + step * Math.floor(i / repeats));

  return data;
}

export function generateFrequencyRecords(
  data: Array<number | [number, number]>,
  baseline = 0,
  frameSize = 16,
): FrequencyRecord[] {
  const frequencyRecords: FrequencyRecord[] = [];

  for (let i = 0; i < data.length; i++) {
    const lastTimestamp = i === 0 ? baseline : frequencyRecords[i - 1].timestamp;

    const frequency = typeof data[i] === 'number' ? (data[i] as number) : (data[i] as [number, number])[0];
    const timestampDelta = typeof data[i] === 'number' ? frameSize : (data[i] as [number, number])[1];

    frequencyRecords.push({
      frequency,
      timestamp: timestampDelta + lastTimestamp,
    });
  }

  return frequencyRecords;
}
