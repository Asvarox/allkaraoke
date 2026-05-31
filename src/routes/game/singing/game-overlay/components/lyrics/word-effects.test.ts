import { generateNote } from '~/modules/utils/test-utils';
import { findFirstLyricWordEffect, findFirstLyricWordEffects, LyricWordEffect } from './word-effects';

const createEffect = (words: string[]): LyricWordEffect => ({
  words,
  renderWord: () => null,
});

describe('findFirstLyricWordEffect', () => {
  it('matches a word split into notes with ~ continuation', () => {
    const notes = [generateNote(0, 1, { lyrics: 'ra' }), generateNote(1, 1, { lyrics: '~in ' })];

    const match = findFirstLyricWordEffect(notes, [createEffect(['rain'])]);

    expect(match?.startIndex).toBe(0);
    expect(match?.noteIndices).toEqual([0, 1]);
  });

  it('matches a word split as fi + re + ~ + ~', () => {
    const notes = [
      generateNote(0, 1, { lyrics: 'fi' }),
      generateNote(1, 1, { lyrics: 're' }),
      generateNote(2, 1, { lyrics: '~' }),
      generateNote(3, 1, { lyrics: '~' }),
    ];

    const match = findFirstLyricWordEffect(notes, [createEffect(['fire'])]);

    expect(match?.startIndex).toBe(0);
    expect(match?.noteIndices).toEqual([0, 1, 2, 3]);
  });

  it('only matches first occurrence from left to right', () => {
    const notes = [
      generateNote(0, 1, { lyrics: 'fire ' }),
      generateNote(1, 1, { lyrics: 'and ' }),
      generateNote(2, 1, { lyrics: 'fire ' }),
    ];

    const match = findFirstLyricWordEffect(notes, [createEffect(['fire'])]);

    expect(match?.startIndex).toBe(0);
    expect(match?.noteIndices).toEqual([0]);
  });

  it('normalizes punctuation around words', () => {
    const notes = [generateNote(0, 1, { lyrics: 'Flame! ' })];

    const match = findFirstLyricWordEffect(notes, [createEffect(['flame'])]);

    expect(match).not.toBeNull();
    expect(match?.startIndex).toBe(0);
  });

  it('matches phrases across multiple words and ~-split syllables', () => {
    const notes = [
      generateNote(0, 1, { lyrics: 'the ' }),
      generateNote(1, 1, { lyrics: 'pour' }),
      generateNote(2, 1, { lyrics: '~ing ' }),
      generateNote(3, 1, { lyrics: 'ra' }),
      generateNote(4, 1, { lyrics: '~in ' }),
    ];

    const match = findFirstLyricWordEffect(notes, [createEffect(['pouring rain'])]);

    expect(match?.startIndex).toBe(1);
    expect(match?.noteIndices).toEqual([1, 2, 3, 4]);
  });

  it('prefers longer phrase when phrase and single-word start at the same position', () => {
    const notes = [
      generateNote(0, 1, { lyrics: 'rain ' }),
      generateNote(1, 1, { lyrics: 'clouds ' }),
      generateNote(2, 1, { lyrics: 'away ' }),
    ];

    const phraseEffect = createEffect(['rain clouds']);
    const singleWordEffect = createEffect(['rain']);

    const match = findFirstLyricWordEffect(notes, [singleWordEffect, phraseEffect]);

    expect(match?.effect).toBe(phraseEffect);
    expect(match?.noteIndices).toEqual([0, 1]);
  });
});

describe('findFirstLyricWordEffects', () => {
  it('matches fire and rain separately in one line', () => {
    const fireEffect = createEffect(['fire']);
    const rainEffect = createEffect(['rain']);

    const notes = [
      generateNote(0, 1, { lyrics: 'I ' }),
      generateNote(1, 1, { lyrics: 'set ' }),
      generateNote(2, 1, { lyrics: 'fi' }),
      generateNote(3, 1, { lyrics: 're ' }),
      generateNote(4, 1, { lyrics: 'to ' }),
      generateNote(5, 1, { lyrics: 'the ' }),
      generateNote(6, 1, { lyrics: 'ra' }),
      generateNote(7, 1, { lyrics: '~in ' }),
    ];

    const matches = findFirstLyricWordEffects(notes, [fireEffect, rainEffect]);

    expect(matches).toHaveLength(2);
    expect(matches[0].effect).toBe(fireEffect);
    expect(matches[0].noteIndices).toEqual([2, 3]);
    expect(matches[1].effect).toBe(rainEffect);
    expect(matches[1].noteIndices).toEqual([6, 7]);
  });

  it('does not match partial words like brain for rain', () => {
    const rainEffect = createEffect(['rain']);
    const notes = [generateNote(0, 1, { lyrics: 'my ' }), generateNote(1, 1, { lyrics: 'brain ' })];

    const matches = findFirstLyricWordEffects(notes, [rainEffect]);

    expect(matches).toEqual([]);
  });
});
