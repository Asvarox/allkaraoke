import { NotesSection, Section, Song } from 'interfaces';
import { cloneDeep, range } from 'lodash-es';
import getSongBeatLength from '../GameState/Helpers/getSongBeatLength';
import isNotesSection from './isNotesSection';
import { getFirstNoteStartFromSections, getLastNoteEndFromSections } from './notesSelectors';

const MAX_SECTION_PAUSE_MS = 250;

const getSingableBeats = (sections: Section[], start: number = 0, end: number = Infinity) =>
    sections
        .filter(isNotesSection)
        .filter((section) => getFirstNoteStartFromSections([section]) >= start)
        .filter((section) => getLastNoteEndFromSections([section]) <= end)
        .reduce((current, section) => current + section.notes.reduce((length, note) => length + note.length, 0), 0);

// Join sections into segments - group of sections that have shorter than MAX_SECTION_PAUSE_MS pause between
export const segmentSections = (sections: Section[], beatLength: number): NotesSection[][] => {
    const [firstSection, ...noteSections] = sections.filter(isNotesSection);

    const segments: NotesSection[][] = [[firstSection]];

    noteSections.forEach((section) => {
        const lastSegment = segments.at(-1)!;

        const lastSectionEnd = getLastNoteEndFromSections(lastSegment);
        const firstSectionNoteStart = getFirstNoteStartFromSections([section]);
        const difference = firstSectionNoteStart - lastSectionEnd;

        if (difference * beatLength > MAX_SECTION_PAUSE_MS) {
            segments.push([section]);
        } else {
            lastSegment.push(section);
        }
    });

    return segments;
};

const sum = (acc: number, elem: number) => acc + elem;

const calculateAmplitude = (groups: number[][]) => {
    const sums = groups.map((group) => group.reduce(sum, 0));
    return Math.max(...sums) - Math.min(...sums);
};

const shiftSolution = (groups: number[][], at: number): number[][] => {
    const result = cloneDeep(groups);
    const takeFromLeft = (pos: number) => {
        if (result[pos - 1].length < 2) return;
        const left = result[pos - 1].pop()!;
        result[pos].push(left);
    };
    const takeFromRight = (pos: number) => {
        if (result[pos + 1]?.length < 2) return;
        const [first, ...rest] = result[pos + 1];
        result[pos].push(first);
        result[pos + 1] = rest;
    };

    at % 2 === 1 ? takeFromLeft(Math.ceil(at / 2)) : takeFromRight(Math.ceil(at / 2));

    return result;
};

const arrSum = (arr: number[]) => arr.reduce(sum, 0);

export default function generatePlayerChanges(song: Song): number[][] {
    const CHANGES_COUNT = 9;
    const beatLength = getSongBeatLength(song);

    return song.tracks.map((track) => {
        const segments = segmentSections(track.sections, beatLength);

        // array of groups of singable beats count -- each element is the total singable beats in a segment
        // The goal is to for the groups to have as similar total count of singable beats as possible
        let result: number[][] = [];

        // todo replace this hacky algorithm with https://en.wikipedia.org/wiki/Multiway_number_partitioning
        // STEP1:   Build initial groups by calculating "ideal" group length (aka amount of singable beats)
        //          And try to have them as close to the ideal as possible (by either overflowing or "underflowing")
        let currentBuffer = [getSingableBeats(segments[0])]; // A candidate for the next group
        for (let i = 0; i < segments.length - 2; i++) {
            // get the last segment already put in the result
            const lastSegment = segments[result.flat().length - 1] ?? [];
            // How many beats are left to sing
            const singableBeats = getSingableBeats(track.sections, getLastNoteEndFromSections(lastSegment) ?? 0);
            const idealSize = singableBeats / (1 + CHANGES_COUNT - result.length);

            const segmentSingableBeatsCount = getSingableBeats(segments[i + 1]);

            const bufferSum = arrSum(currentBuffer);

            if (bufferSum + segmentSingableBeatsCount < idealSize) {
                // If adding the current segment to the candidate doesn't move us past the ideal size, just add it
                currentBuffer = [...currentBuffer, segmentSingableBeatsCount];
            } else if (idealSize - bufferSum < bufferSum + segmentSingableBeatsCount - idealSize) {
                // If the candidate is closer to ideal size, add it as a new group
                result.push(currentBuffer);
                currentBuffer = [segmentSingableBeatsCount];
            } else {
                // If the candidate with currently inspected segment is closer to ideal size, add it as a new group
                result.push([...currentBuffer, segmentSingableBeatsCount]);
                currentBuffer = [];
            }
        }

        // STEP2:   Try to make groups more even by trying to move segments between groups and checking if it
        //          resulted in smaller differences between longest and shortest group (aka amplitude)
        for (let i = 0; i < 100; i++) {
            const currentAmplitude = calculateAmplitude(result);
            // Create alternative results (by shifting one segment between groups in either way)
            // Note this doesn't guarantee creating best results as moving multiple segments at the same time
            // isn't accounted for
            const candidates = range((result.length - 2) * 2 + 2).map((at) => shiftSolution(result, at));
            const candidatesAmplitudes = candidates.map(calculateAmplitude);
            const minimalAmplitude = Math.min(...candidatesAmplitudes);
            if (currentAmplitude <= minimalAmplitude) break; // If no results are better, give up
            const minimalAmplitudeIndex = candidatesAmplitudes.indexOf(minimalAmplitude);
            result = candidates[minimalAmplitudeIndex];
        }

        return result
            .map((group) => group.length)
            .reduce<number[]>((acc, length) => [...acc, (acc.at(-1) ?? 0) + length], [])
            .map((index) => getLastNoteEndFromSections(segments[index - 1]));
    });
}
