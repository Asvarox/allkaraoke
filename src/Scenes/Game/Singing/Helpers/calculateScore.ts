import { memoize } from 'lodash';
import { noPointsNoteTypes } from '../../../../consts';
import { PlayerNote, Song } from '../../../../interfaces';
import getPlayerNoteDistance from './getPlayerNoteDistance';
import isNotesSection from './isNotesSection';

export const MAX_POINTS = 3000000;

const perfectBase = 0.5;

const noteTypesBase = {
    freestyle: 0.25,
    rap: 0.25,
    star: 2,
    normal: 1,
};

const countsToBeats = (counts: typeof noteTypesBase) =>
    counts.freestyle * noteTypesBase.freestyle +
    counts.rap * noteTypesBase.rap +
    counts.star * noteTypesBase.star +
    counts.normal * noteTypesBase.normal;

const sumCounts = (counts: typeof noteTypesBase) => counts.freestyle + counts.rap + counts.star + counts.normal;

const countSungBeats = memoize((song: Song): number[] => {
    return song.tracks.map(({ sections }) => {
        const counts: typeof noteTypesBase = {
            freestyle: 0,
            rap: 0,
            star: 0,
            normal: 0,
        };
        sections.filter(isNotesSection).forEach((section) => {
            const notes = section.notes.filter((note) => !noPointsNoteTypes.includes(note.type));

            notes.forEach((note) => {
                counts[note.type] = counts[note.type] + note.length;
            });
        });

        return perfectBase * sumCounts(counts) + countsToBeats(counts);
    });
});

export default function calculateScore(playerNotes: PlayerNote[], song: Song, trackNumber: number): number {
    const beatsPerTrack = countSungBeats(song);

    if (!beatsPerTrack[trackNumber]) {
        console.error(`No beat count for track ${trackNumber} in song`, song);
        return 0;
    }

    const pointsPerBeat = MAX_POINTS / countSungBeats(song)[trackNumber];

    let perfectBeats = 0;

    const counts: typeof noteTypesBase = {
        freestyle: 0,
        rap: 0,
        star: 0,
        normal: 0,
    };

    for (let i = 0; i < playerNotes.length; i++) {
        const note = playerNotes[i];
        if (noPointsNoteTypes.includes(note.note.type)) continue;
        if (getPlayerNoteDistance(note) !== 0) continue;

        counts[note.note.type] = counts[note.note.type] + note.length;

        if (note.isPerfect) perfectBeats = perfectBeats + note.length;
    }

    const score = (perfectBeats * perfectBase + countsToBeats(counts)) * pointsPerBeat;

    return score;
}
