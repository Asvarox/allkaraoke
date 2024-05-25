import { noPointsNoteTypes } from 'consts';
import { DetailedScore, PlayerNote, Song } from 'interfaces';
import { memoize } from 'lodash-es';
import getPlayerNoteDistance from 'modules/GameEngine/Helpers/getPlayerNoteDistance';
import isNotesSection from 'modules/Songs/utils/isNotesSection';
import tuple from 'modules/utils/tuple';

export const MAX_POINTS = 3_500_000;

const noteTypesMultipliers: DetailedScore = {
  freestyle: 0.25,
  rap: 0.25,
  rapstar: 0.5,
  star: 2,
  normal: 1,
  perfect: 0.5,
  vibrato: 0.25,
};

const countsToBeats = (counts: DetailedScore): DetailedScore => ({
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

const countSungBeats = memoize((song: Song): DetailedScore[] => {
  return song.tracks.map(({ sections }) => {
    const counts: DetailedScore = {
      freestyle: 0,
      rap: 0,
      rapstar: 0,
      star: 0,
      normal: 0,
      perfect: 0,
      vibrato: 0,
    };
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
});

export function calculateDetailedScoreData(playerNotes: PlayerNote[], song: Song, trackNumber: number) {
  const beatsPerTrack = countSungBeats(song);

  const counts: DetailedScore = {
    freestyle: 0,
    rap: 0,
    rapstar: 0,
    star: 0,
    normal: 0,
    perfect: 0,
    vibrato: 0,
  };

  if (!beatsPerTrack[trackNumber]) {
    console.error(`No beat count for track ${trackNumber} in song`, song);
    return tuple([0, counts, counts]);
  }

  const maxCounts = countsToBeats(countSungBeats(song)[trackNumber]);

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

export default function calculateScore(playerNotes: PlayerNote[], song: Song, trackNumber: number): number {
  const [pointsPerBeat, counts] = calculateDetailedScoreData(playerNotes, song, trackNumber);

  return sumDetailedScore(counts) * pointsPerBeat;
}
