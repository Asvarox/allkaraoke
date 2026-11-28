import { milliseconds, NoteType, Song } from '~/interfaces';
import beatToMs from '~/modules/game-engine/game-state/helpers/beat-to-ms';
import isNotesSection from '~/modules/songs/utils/is-notes-section';

export interface LyricSyllable {
  index: number;
  text: string;
  /** Video time, as the game counts it */
  startMs: milliseconds;
  endMs: milliseconds;
  pitch: number;
  type: NoteType;
  /** First syllable of a lyrics line */
  lineStart: boolean;
  /** Index of its lyrics line within the track */
  section: number;
  /** Its line comes after a pause rather than straight after the previous line */
  afterPause: boolean;
}

const HAS_LETTER = /[\p{L}\p{N}]/u;

/**
 * The song's lyrics as one entry per sung syllable. Notes without a letter (`~`, `-`) only change the
 * pitch of the syllable before them, so they extend it rather than becoming their own entry.
 */
export function getLyricSyllables(song: Song): LyricSyllable[] {
  const track = song.mergedTrack?.sections.some(isNotesSection) ? song.mergedTrack : song.tracks[0];
  const syllables: LyricSyllable[] = [];

  (track?.sections ?? []).forEach((section, sectionIndex, sections) => {
    if (!isNotesSection(section)) return;
    const afterPause = sections[sectionIndex - 1]?.type === 'pause';
    section.notes.forEach((note, noteIndex) => {
      const startMs = song.gap + beatToMs(note.start, song);
      const endMs = song.gap + beatToMs(note.start + note.length, song);
      const previous = syllables.at(-1);

      if (!HAS_LETTER.test(note.lyrics)) {
        if (previous && noteIndex > 0) {
          previous.endMs = Math.max(previous.endMs, endMs);
          if (note.lyrics.endsWith(' ') && !previous.text.endsWith(' ')) previous.text += ' ';
        }
        return;
      }

      syllables.push({
        index: syllables.length,
        // A tilde marks a held or sliding note, sometimes glued to the syllable it continues
        text: note.lyrics.replaceAll('~', ''),
        startMs,
        endMs,
        pitch: note.pitch,
        type: note.type,
        lineStart: noteIndex === 0,
        section: sectionIndex,
        afterPause,
      });
    });
  });

  return syllables;
}

export interface LyricWord {
  index: number;
  /** Its syllables, without the space after the word */
  syllables: LyricSyllable[];
  startMs: milliseconds;
  endMs: milliseconds;
  /** Average pitch of its syllables */
  pitch: number;
  lineStart: boolean;
  section: number;
  afterPause: boolean;
}

/** Joins syllables into whole words, split at spaces and line breaks */
export function getLyricWords(syllables: LyricSyllable[]): LyricWord[] {
  const words: LyricWord[] = [];
  let current: LyricSyllable[] = [];

  const close = () => {
    if (!current.length) return;
    const parts = current.map((syllable, i) =>
      i === current.length - 1 ? { ...syllable, text: syllable.text.trimEnd() } : syllable,
    );
    words.push({
      index: words.length,
      syllables: parts,
      startMs: parts[0].startMs,
      endMs: parts.at(-1)!.endMs,
      pitch: parts.reduce((sum, syllable) => sum + syllable.pitch, 0) / parts.length,
      lineStart: parts[0].lineStart,
      section: parts[0].section,
      afterPause: parts[0].afterPause,
    });
    current = [];
  };

  for (const syllable of syllables) {
    if (syllable.lineStart) close();
    current.push(syllable);
    if (syllable.text.endsWith(' ')) close();
  }
  close();

  return words;
}

/** Index of the last entry that has started by `timeMs`, or -1 */
export function findCurrentIndex(entries: Array<{ startMs: milliseconds }>, timeMs: milliseconds): number {
  let low = 0;
  let high = entries.length - 1;
  let result = -1;
  while (low <= high) {
    const mid = (low + high) >> 1;
    if (entries[mid].startMs <= timeMs) {
      result = mid;
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }
  return result;
}
