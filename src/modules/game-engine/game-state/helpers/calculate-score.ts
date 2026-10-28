import { memoize } from 'es-toolkit';

import { MAX_POINTS, noPointsNoteTypes } from '~/consts';
import { DetailedScore, PlayerNote, SongTrack } from '~/interfaces';
import getPlayerNoteDistance from '~/modules/game-engine/helpers/get-player-note-distance';
import isNotesSection from '~/modules/songs/utils/is-notes-section';
import tuple from '~/modules/utils/tuple';

export { MAX_POINTS };

const noteTypesMultipliers: DetailedScore = {
  freestyle: 0.25,
  rap: 0.25,
  rapstar: 0.5,
  star: 2,
  normal: 1,
  perfect: 0.5,
  vibrato: 0.25,
};

export const emptyDetailedScore = (): DetailedScore => ({
  freestyle: 0,
  rap: 0,
  rapstar: 0,
  star: 0,
  normal: 0,
  perfect: 0,
  vibrato: 0,
});

export const countsToBeats = (counts: DetailedScore): DetailedScore => ({
  freestyle: counts.freestyle * noteTypesMultipliers.freestyle,
  rap: counts.rap * noteTypesMultipliers.rap,
  rapstar: counts.rapstar * noteTypesMultipliers.rapstar,
  star: counts.star * noteTypesMultipliers.star,
  normal: counts.normal * noteTypesMultipliers.normal,
  perfect: counts.perfect * noteTypesMultipliers.perfect,
  vibrato: counts.vibrato * noteTypesMultipliers.vibrato,
});

export const sumDetailedScore = (counts: DetailedScore) =>
  counts.freestyle + counts.rap + counts.star + counts.normal + counts.perfect + counts.vibrato;

export const beatsToPoints = (counts: DetailedScore, pointsPerBeat: number): DetailedScore => ({
  freestyle: counts.freestyle * pointsPerBeat,
  rap: counts.rap * pointsPerBeat,
  rapstar: counts.rapstar * pointsPerBeat,
  star: counts.star * pointsPerBeat,
  normal: counts.normal * pointsPerBeat,
  perfect: counts.perfect * pointsPerBeat,
  vibrato: counts.vibrato * pointsPerBeat,
});

export const addDetailedScores = (s1: DetailedScore, s2: DetailedScore): DetailedScore => ({
  freestyle: s1.freestyle + s2.freestyle,
  rap: s1.rap + s2.rap,
  rapstar: s1.rapstar + s2.rapstar,
  star: s1.star + s2.star,
  normal: s1.normal + s2.normal,
  perfect: s1.perfect + s2.perfect,
  vibrato: s1.vibrato + s2.vibrato,
});

export const divideDetailedScores = (counts: DetailedScore, divideBy: number): DetailedScore => ({
  freestyle: counts.freestyle / divideBy,
  rap: counts.rap / divideBy,
  rapstar: counts.rapstar / divideBy,
  star: counts.star / divideBy,
  normal: counts.normal / divideBy,
  perfect: counts.perfect / divideBy,
  vibrato: counts.vibrato / divideBy,
});

export const multiplyDetailedScore = (counts: DetailedScore, multiplier: number): DetailedScore => ({
  freestyle: counts.freestyle * multiplier,
  rap: counts.rap * multiplier,
  rapstar: counts.rapstar * multiplier,
  star: counts.star * multiplier,
  normal: counts.normal * multiplier,
  perfect: counts.perfect * multiplier,
  vibrato: counts.vibrato * multiplier,
});

/** `progress` 0 gives `from`, 1 gives `to`. Used to read a score from between two timeline samples,
 * so the reveal moves every frame instead of stepping from one sample to the next. */
export const lerpDetailedScores = (from: DetailedScore, to: DetailedScore, progress: number): DetailedScore =>
  addDetailedScores(multiplyDetailedScore(from, 1 - progress), multiplyDetailedScore(to, progress));

const countSungBeats = memoize(({ sections }: SongTrack): DetailedScore => {
  const counts = emptyDetailedScore();
  sections.filter(isNotesSection).forEach((section) => {
    const notes = section.notes.filter((note) => !noPointsNoteTypes.includes(note.type));

    notes.forEach((note) => {
      counts[note.type] = counts[note.type] + note.length;
      counts.perfect = counts.perfect + note.length;
      counts.vibrato = counts.vibrato + note.length;
    });
  });

  return counts;
});

/** `track` is the one the player is scored against (`PlayerState.getTrack`), so in merged mode
 * the max score comes from the merged track rather than the player's original duet track. */
export function calculateDetailedScoreData(playerNotes: PlayerNote[], track: SongTrack) {
  const counts: DetailedScore = {
    freestyle: 0,
    rap: 0,
    rapstar: 0,
    star: 0,
    normal: 0,
    perfect: 0,
    vibrato: 0,
  };

  if (!track) {
    console.error('No track to calculate the score against');
    return tuple([0, counts, counts]);
  }

  const maxCounts = countsToBeats(countSungBeats(track));

  const pointsPerBeat = MAX_POINTS / sumDetailedScore(maxCounts);

  for (let i = 0; i < playerNotes.length; i++) {
    const note = playerNotes[i];
    if (noPointsNoteTypes.includes(note.note.type)) continue;
    if (getPlayerNoteDistance(note) !== 0) continue;

    counts[note.note.type] = counts[note.note.type] + note.length;

    if (note.isPerfect) counts.perfect = counts.perfect + note.length;
    if (note.vibrato) counts.vibrato = counts.vibrato + note.length;
  }

  return tuple([pointsPerBeat, countsToBeats(counts), maxCounts]);
}

export default function calculateScore(playerNotes: PlayerNote[], track: SongTrack): number {
  const [pointsPerBeat, counts] = calculateDetailedScoreData(playerNotes, track);

  return sumDetailedScore(counts) * pointsPerBeat;
}
