import { NoteFrequencyRecord, PlayerNote } from '~/interfaces';
import { countFrequencyRecords, decodeNotesPayload, encodeNotesPayload } from '~/modules/leaderboard/notes-payload';
import { generateNote, generatePlayerNote } from '~/modules/utils/test-utils';

const record = (timestamp: number, frequency: number): NoteFrequencyRecord => ({
  timestamp,
  frequency,
  preciseDistance: 0,
});

const noteWith = (records: NoteFrequencyRecord[], distance = 0): PlayerNote =>
  generatePlayerNote(generateNote(0, 1), distance, 0, 1, false, false, records);

describe('notes payload', () => {
  it('round-trips frequency records at 0.01 precision', () => {
    const notes = [
      noteWith([record(0, 440), record(16, 440.55), record(32.5, 0)]),
      noteWith([record(48, 220.25), record(64, 220.25)]),
    ];

    const decoded = decodeNotesPayload(encodeNotesPayload(notes));

    expect(decoded).toEqual([
      { timestamp: 0, frequency: 440 },
      { timestamp: 16, frequency: 440.55 },
      { timestamp: 32.5, frequency: 0 },
      { timestamp: 48, frequency: 220.25 },
      { timestamp: 64, frequency: 220.25 },
    ]);
  });

  it('does not accumulate rounding error over long streams', () => {
    // 0.005 rounds up on its own, but the running total must stay pinned to the source values
    const records = Array.from({ length: 5000 }, (_, index) => record(index * 16.005, 440 + index * 0.005));

    const decoded = decodeNotesPayload(encodeNotesPayload([noteWith(records)]));

    expect(decoded).toHaveLength(5000);
    decoded.forEach((decodedRecord, index) => {
      expect(decodedRecord.timestamp).toBeCloseTo(index * 16.005, 1);
      expect(decodedRecord.frequency).toBeCloseTo(440 + index * 0.005, 1);
    });
  });

  it('keeps missed notes instead of filtering to hits', () => {
    const notes = [noteWith([record(0, 440)], 0), noteWith([record(16, 300)], 5)];

    expect(decodeNotesPayload(encodeNotesPayload(notes))).toHaveLength(2);
    expect(countFrequencyRecords(notes)).toBe(2);
  });

  it('tolerates notes without frequency records', () => {
    const notes = [noteWith([]), noteWith([record(16, 440)])];

    expect(decodeNotesPayload(encodeNotesPayload(notes))).toEqual([{ timestamp: 16, frequency: 440 }]);
  });

  it('stays well within the 256 KB request cap for a long song', () => {
    // 10 minutes at ~60 records/s — longer than any song in the library
    const records = Array.from({ length: 60 * 600 }, (_, index) =>
      record(index * 16.6, 200 + Math.sin(index / 10) * 120),
    );

    const packed = encodeNotesPayload([noteWith(records)]);

    expect(decodeNotesPayload(packed)).toHaveLength(36_000);
    expect(packed.byteLength).toBeLessThan(256 * 1024);
  });
});
