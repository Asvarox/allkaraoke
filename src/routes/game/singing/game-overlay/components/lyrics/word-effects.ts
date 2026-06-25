import { ReactNode } from 'react';
import { Note, songBeat } from '~/interfaces';

export type LyricWordEffectRenderArgs = {
  notes: Note[];
  currentBeat: songBeat;
  playerColor: string;
};

export type LyricWordEffect = {
  words: string[];
  renderWord: (args: LyricWordEffectRenderArgs) => ReactNode;
};

export type MatchedLyricWordEffect = {
  effect: LyricWordEffect;
  noteIndices: number[];
  notes: Note[];
  startIndex: number;
};

// input -> output examples:
// "~Fire! " -> "fire"
// "  ra~in??" -> "rain"
const normalizeWordForMatching = (value: string) =>
  value
    .replaceAll('~', '')
    .toLowerCase()
    .trim()
    .replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, '');

// input -> output examples:
// "  Pouring   Rain  " -> ["pouring", "rain"]
// "~I set,   the FIRE!" -> ["i", "set", "the", "fire"]
const normalizePhraseForMatching = (value: string) =>
  value
    .trim()
    .split(/\s+/)
    .map((word) => normalizeWordForMatching(word))
    .filter((word) => word.length > 0);

const hasLyricTrailingSpace = (lyrics: string) => lyrics.endsWith(' ');

const buildWordSpans = (notes: Note[]) => {
  // Convert a flat note stream into "word spans" so matching works on whole words/phrases,
  // including words split across notes with `~` continuation markers.
  const spans: Array<{ noteIndices: number[]; notes: Note[]; normalizedWord: string }> = [];

  let currentSpanIndices: number[] = [];
  let currentSpanNotes: Note[] = [];

  const pushCurrentSpan = () => {
    if (currentSpanNotes.length === 0) return;

    const normalizedWord = normalizeWordForMatching(currentSpanNotes.map((note) => note.lyrics).join(''));

    if (normalizedWord.length > 0) {
      spans.push({
        noteIndices: [...currentSpanIndices],
        notes: [...currentSpanNotes],
        normalizedWord,
      });
    }

    currentSpanIndices = [];
    currentSpanNotes = [];
  };

  for (const [index, note] of notes.entries()) {
    currentSpanIndices.push(index);
    currentSpanNotes.push(note);

    // A trailing space marks the end of a word in UltraStar lyric fragments.
    if (hasLyricTrailingSpace(note.lyrics)) {
      pushCurrentSpan();
    }
  }

  pushCurrentSpan();

  return spans;
};

export const findFirstLyricWordEffect = (notes: Note[], effects: LyricWordEffect[]): MatchedLyricWordEffect | null => {
  const matches = findFirstLyricWordEffects(notes, effects);

  if (matches.length === 0) {
    return null;
  }

  return matches[0];
};

/**
 * High-level matching algorithm:
 * 1. Normalize every effect alias (single words and phrases).
 * 2. Convert note fragments into normalized whole-word spans.
 * 3. For each effect, find the first alias occurrence in the line.
 * 4. If multiple aliases of the same effect start at the same word, prefer the longer phrase.
 * 5. Convert matched spans back to note indices/notes and sort by earliest start.
 * 6. Remove overlaps so each note belongs to at most one matched effect.
 *
 * Result: a left-to-right list of non-overlapping matches, one "first occurrence" per effect.
 */
export const findFirstLyricWordEffects = (notes: Note[], effects: LyricWordEffect[]): MatchedLyricWordEffect[] => {
  if (effects.length === 0 || notes.length === 0) return [];

  type EffectPhrase = {
    effect: LyricWordEffect;
    normalizedWords: string[];
  };

  const effectPhrases: EffectPhrase[] = [];

  for (const effect of effects) {
    for (const word of effect.words) {
      const normalizedWords = normalizePhraseForMatching(word);

      if (normalizedWords.length > 0) {
        effectPhrases.push({
          effect,
          normalizedWords,
        });
      }
    }
  }

  if (effectPhrases.length === 0) return [];

  const spans = buildWordSpans(notes);
  const matchesPerEffect = new Map<LyricWordEffect, MatchedLyricWordEffect>();

  for (const effect of effects) {
    // For each effect, choose the first occurrence in the line.
    // If multiple aliases start at the same word, prefer the longer phrase
    // (e.g. "pouring rain" over "rain").
    let bestMatchForEffect: {
      startWordIndex: number;
      phraseLength: number;
    } | null = null;

    const effectAliases = effectPhrases.filter((entry) => entry.effect === effect);

    for (let startWordIndex = 0; startWordIndex < spans.length; startWordIndex++) {
      for (const alias of effectAliases) {
        const phraseLength = alias.normalizedWords.length;
        const endWordIndex = startWordIndex + phraseLength;

        if (endWordIndex > spans.length) continue;

        const hasMatchingPhrase = alias.normalizedWords.every(
          (expectedWord, phraseWordIndex) => spans[startWordIndex + phraseWordIndex].normalizedWord === expectedWord,
        );

        if (!hasMatchingPhrase) continue;

        if (!bestMatchForEffect) {
          bestMatchForEffect = {
            startWordIndex,
            phraseLength,
          };
          continue;
        }

        if (startWordIndex < bestMatchForEffect.startWordIndex) {
          bestMatchForEffect = {
            startWordIndex,
            phraseLength,
          };
          continue;
        }

        if (startWordIndex === bestMatchForEffect.startWordIndex && phraseLength > bestMatchForEffect.phraseLength) {
          bestMatchForEffect = {
            startWordIndex,
            phraseLength,
          };
        }
      }
    }

    if (!bestMatchForEffect) {
      continue;
    }

    const matchedSpans = spans.slice(
      bestMatchForEffect.startWordIndex,
      bestMatchForEffect.startWordIndex + bestMatchForEffect.phraseLength,
    );

    const noteIndices = matchedSpans.flatMap((span) => span.noteIndices);
    const matchedNotes = matchedSpans.flatMap((span) => span.notes);

    matchesPerEffect.set(effect, {
      effect,
      noteIndices,
      notes: matchedNotes,
      startIndex: noteIndices[0],
    });
  }

  const sortedMatches = [...matchesPerEffect.values()].sort((firstMatch, secondMatch) => {
    if (firstMatch.startIndex !== secondMatch.startIndex) {
      return firstMatch.startIndex - secondMatch.startIndex;
    }

    return secondMatch.noteIndices.length - firstMatch.noteIndices.length;
  });

  const acceptedMatches: MatchedLyricWordEffect[] = [];
  const usedNoteIndices = new Set<number>();

  for (const match of sortedMatches) {
    // Keep only non-overlapping matches so one note span is rendered by at most one effect.
    const overlaps = match.noteIndices.some((noteIndex) => usedNoteIndices.has(noteIndex));

    if (overlaps) {
      continue;
    }

    for (const noteIndex of match.noteIndices) {
      usedNoteIndices.add(noteIndex);
    }

    acceptedMatches.push(match);
  }

  return acceptedMatches;
};
