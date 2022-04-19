import { noPointsNoteTypes } from 'consts';
import { DetailedScore, PlayerNote, Song } from 'interfaces';
import { memoize } from 'lodash';
import tuple from '../../../../../Utils/tuple';
import getPlayerNoteDistance from '../../Helpers/getPlayerNoteDistance';
import isNotesSection from '../../Helpers/isNotesSection';

export const MAX_POINTS = 4_000_000;

const noteTypesMultipliers: DetailedScore = {
    freestyle: 0.25,
    rap: 0.25,
    star: 2,
    normal: 1,
    perfect: 0.5,
    vibrato: 0.25,
};

const countsToBeats = (counts: DetailedScore): DetailedScore => ({
    freestyle: counts.freestyle * noteTypesMultipliers.freestyle,
    rap: counts.rap * noteTypesMultipliers.rap,
    star: counts.star * noteTypesMultipliers.star,
    normal: counts.normal * noteTypesMultipliers.normal,
    perfect: counts.perfect * noteTypesMultipliers.perfect,
    vibrato: counts.vibrato * noteTypesMultipliers.vibrato,
});

export const sumDetailedScore = (counts: DetailedScore) =>
    counts.freestyle + counts.rap + counts.star + counts.normal + counts.perfect + counts.vibrato;

const countSungBeats = memoize((song: Song): DetailedScore[] => {
    return song.tracks.map(({ sections }) => {
        const counts: DetailedScore = {
            freestyle: 0,
            rap: 0,
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
