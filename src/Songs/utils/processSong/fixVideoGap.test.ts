import fixVideoGap from 'Songs/utils/processSong/fixVideoGap';
import { generateNote, generateSong } from 'utils/testUtils';

describe('fixVideoGap', () => {
  it('should change the video gap if its more than the start of the song', () => {
    const song = generateSong(
      [
        [
          { type: 'notes', start: 0, notes: [generateNote(0), generateNote(20)] },
          { type: 'notes', start: 60, notes: [generateNote(80), generateNote(100)] },
        ],
      ],
      { gap: 20_000, bar: 10, videoGap: 100 },
    );

    expect(fixVideoGap(song)).toHaveProperty('videoGap', 5);
  });

  it('should not change the video gap if its more than 15s of the start of the song', () => {
    const song = generateSong(
      [
        [
          { type: 'notes', start: 0, notes: [generateNote(0), generateNote(20)] },
          { type: 'notes', start: 60, notes: [generateNote(80), generateNote(100)] },
        ],
      ],
      { gap: 20_000, bar: 10, videoGap: 3 },
    );

    expect(fixVideoGap(song)).toHaveProperty('videoGap', 3);
  });

  it('should not set video gap to be lower than 0', () => {
    const song = generateSong(
      [
        [
          { type: 'notes', start: 0, notes: [generateNote(0), generateNote(20)] },
          { type: 'notes', start: 60, notes: [generateNote(80), generateNote(100)] },
        ],
      ],
      { gap: 10_000, bar: 10, videoGap: 100 },
    );

    expect(fixVideoGap(song)).toHaveProperty('videoGap', 0);
  });
});
