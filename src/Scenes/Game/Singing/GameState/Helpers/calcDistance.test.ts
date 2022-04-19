import { calcDistanceBetweenPitches } from './calcDistance';

describe('calcDistanceBetweenPitches', () => {
    it.each`
        detectedPitch | targetPitch    | expectedDistance
        ${7}          | ${-3 * 12}     | ${-5}
        ${5}          | ${-3 * 12}     | ${5}
        ${-3}         | ${0}           | ${-3}
        ${0}          | ${0}           | ${0}
        ${1}          | ${0}           | ${0}
        ${3}          | ${0}           | ${3}
        ${-6}         | ${0}           | ${-6}
        ${24}         | ${12}          | ${0}
        ${21}         | ${12}          | ${-3}
        ${5}          | ${12 * 15 + 9} | ${-4}
        ${5}          | ${12 * 3 + 9}  | ${-4}
        ${12 * 3 + 9} | ${5}           | ${4}
        ${15}         | ${12}          | ${3}
    `('should on comparing %p against %p return %p', ({ detectedPitch, targetPitch, expectedDistance }) => {
        expect(calcDistanceBetweenPitches(detectedPitch, targetPitch)).toEqual(expectedDistance);
    });
});
