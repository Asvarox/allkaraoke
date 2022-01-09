import { PlayerNote, Song } from '../../../../interfaces';
import { memoize } from 'lodash';
import isNotesSection from './isNotesSection';

export const MAX_POINTS = 3000000;

const goldBase = 1;
const perfectBase = .5;

const countSungBeats = memoize((song: Song): number[] => {
    return song.tracks.map(({ sections }) => {
        let count = 0;
        let goldCount = 0;
        sections
            .filter(isNotesSection)
            .forEach((section) => {
                count = section.notes.reduce((acc, note) => acc + note.length, count)
                goldCount = section.notes.filter(note => note.type === 'star').reduce((acc, note) => acc + note.length, goldCount)
            });

        return ((1 + perfectBase) * count) + (goldBase * goldCount);
    });
});

export default function calculateScore(playerNotes: PlayerNote[], song: Song, trackNumber: number): number {
    const beatsPerTrack = countSungBeats(song);

    if (!beatsPerTrack[trackNumber]) {
        console.error(`No beat count for track ${trackNumber} in song`, song);
        return 0;
    }

    const pointsPerBeat = MAX_POINTS / countSungBeats(song)[trackNumber];

    let sungBeats = 0;
    let goldBeats = 0;
    let perfectBeats = 0;

    for (let i = 0; i < playerNotes.length; i++) {
        const note = playerNotes[i];
        if (note.distance !== 0) continue;

        sungBeats = sungBeats + note.length
        if (note.note.type === 'star') goldBeats = goldBeats + (note.length * goldBase);
        if (note.isPerfect) perfectBeats = perfectBeats + (note.length * perfectBase);
    }
    const score = (sungBeats + goldBeats + perfectBeats) * pointsPerBeat;

    return score;
}
