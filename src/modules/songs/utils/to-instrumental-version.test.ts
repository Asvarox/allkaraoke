import { mulitrack } from '~/modules/songs/utils/song-fixture';
import toInstrumentalVersion, {
  fromInstrumentalTime,
  isInstrumentalVersion,
  toInstrumentalTime,
} from '~/modules/songs/utils/to-instrumental-version';

describe('toInstrumentalVersion', () => {
  it('should swap in the instrumental video and timings', () => {
    const song = {
      ...mulitrack,
      videoGap: 5,
      volume: 0.7,
      duration: 200,
      instrumental: { video: 'instrumental', gap: 1500, videoGap: 6, volume: 0.4, duration: 210 },
    };

    expect(toInstrumentalVersion(song)).toMatchObject({
      video: 'instrumental',
      gap: 1500,
      videoGap: 6,
      volume: 0.4,
      duration: 210,
      tracks: mulitrack.tracks,
    });
  });

  it('should fall back to the original volume when the instrumental has none', () => {
    const song = {
      ...mulitrack,
      volume: 0.7,
      instrumental: { video: 'instrumental', gap: 1500, videoGap: undefined, volume: undefined },
    };

    expect(toInstrumentalVersion(song).volume).toBe(0.7);
  });

  it('should move the preview by the offset between the videos, once', () => {
    const song = {
      ...mulitrack,
      gap: 1000,
      previewStart: 60,
      previewEnd: 90,
      instrumental: { video: 'instrumental', gap: 3500, videoGap: undefined, volume: undefined },
    };
    const instrumental = toInstrumentalVersion(song);

    expect(instrumental).toMatchObject({ previewStart: 62.5, previewEnd: 92.5 });
    expect(isInstrumentalVersion(instrumental)).toBe(true);
    expect(isInstrumentalVersion(song)).toBe(false);
    expect(toInstrumentalVersion(instrumental)).toBe(instrumental);
  });

  it('should return the song unchanged when there is no instrumental', () => {
    expect(toInstrumentalVersion(mulitrack)).toBe(mulitrack);
  });

  it('should use the instrumental BPM and stretch the preview with it', () => {
    const song = {
      ...mulitrack,
      gap: 1000,
      bpm: 100,
      previewStart: 61,
      instrumental: { video: 'instrumental', gap: 1500, videoGap: 0, volume: undefined, bpm: 99 },
    };

    const result = toInstrumentalVersion(song);
    expect(result.bpm).toBe(99);
    expect(result.previewStart).toBeCloseTo(1.5 + (60 * 100) / 99);
    expect(toInstrumentalTime(song, 1)).toBe(1.5);
  });

  it('should keep the BPM when the instrumental has none of its own', () => {
    const song = { ...mulitrack, instrumental: { video: 'instrumental', gap: 0, videoGap: 0, volume: undefined } };
    expect(toInstrumentalVersion(song).bpm).toBe(mulitrack.bpm);
  });
});

describe('fromInstrumentalTime', () => {
  it('maps an instrumental moment back to the original, undoing the stretch', () => {
    const song = { gap: 1000, bpm: 120, instrumental: { video: 'i', gap: 3000, videoGap: 0, volume: 1, bpm: 60 } };

    expect(toInstrumentalTime(song, 61)).toBe(123);
    expect(fromInstrumentalTime(song, 123)).toBe(61);
  });
});
