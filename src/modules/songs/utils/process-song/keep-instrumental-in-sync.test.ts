import { SongInstrumental } from '~/interfaces';
import keepInstrumentalInSync from '~/modules/songs/utils/process-song/keep-instrumental-in-sync';
import normaliseGap from '~/modules/songs/utils/process-song/normalise-gap';
import { processSong } from '~/modules/songs/utils/process-song/process-song';
import toInstrumentalVersion from '~/modules/songs/utils/to-instrumental-version';
import { generateNote, generateSong } from '~/modules/utils/test-utils';

const instrumental = (values: Partial<SongInstrumental>): SongInstrumental => ({
  video: 'instrumental',
  gap: 0,
  videoGap: undefined,
  volume: undefined,
  ...values,
});

describe('keepInstrumentalInSync', () => {
  it('moves the instrumental gap by the same beats as the notes', () => {
    const song = generateSong([[{ type: 'notes', start: 10, notes: [generateNote(20), generateNote(40)] }]], {
      gap: 20,
      instrumental: instrumental({ gap: 500 }),
    });

    const result = keepInstrumentalInSync(song, normaliseGap);
    expect(result.gap).toBe(40);
    expect(result.instrumental?.gap).toBe(520);
  });

  it('scales the move by the instrumental speed when its BPM differs', () => {
    const song = generateSong([[{ type: 'notes', start: 10, notes: [generateNote(20), generateNote(40)] }]], {
      gap: 20,
      instrumental: instrumental({ gap: 500, bpm: 30 }),
    });

    // Twice as slow, so each beat is twice as long on the instrumental
    expect(keepInstrumentalInSync(song, normaliseGap).instrumental?.gap).toBe(540);
  });
});

describe('processSong with the instrumental swapped in first', () => {
  it('gives the instrumental its own headstart and video gap', () => {
    const song = generateSong([[{ type: 'notes', start: 0, notes: [generateNote(0), generateNote(20)] }]], {
      gap: 20_000,
      bar: 10,
      videoGap: 100,
      instrumental: instrumental({ gap: 22_000, videoGap: 100 }),
    });

    const original = processSong(song);
    const played = processSong(toInstrumentalVersion(song));
    expect(original.gap).toBe(19_000);
    expect(original.videoGap).toBe(5);
    expect(played.video).toBe('instrumental');
    expect(played.gap).toBe(21_000);
    expect(played.videoGap).toBe(7);
  });
});
